import type { RichTextAction } from './rich-text-toolbar';

export interface TextEdit {
  value: string;
  start: number;
  end: number;
}

const inlineMarkers: Partial<Record<RichTextAction, [string, string]>> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  underline: ['<u>', '</u>'],
  strikethrough: ['~~', '~~'],
  code: ['`', '`'],
};

const linePrefixes: Partial<Record<RichTextAction, string>> = {
  heading1: '# ',
  heading2: '## ',
  quote: '> ',
  bulletList: '- ',
};

const orderedPattern = /^\d+\. /;
const prefixPattern = /^(?:#{1,6} |> |- |\d+\. )/;

const lineBounds = (value: string, start: number, end: number) => {
  const from = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', end);
  return { from, to: nextBreak === -1 ? value.length : nextBreak };
};

// Wraps the selection in markers, or removes them when the selection is already wrapped (inside or around).
const toggleInline = ({ value, start, end }: TextEdit, [open, close]: [string, string]): TextEdit => {
  const selected = value.slice(start, end);
  if (selected.startsWith(open) && selected.endsWith(close) && selected.length >= open.length + close.length) {
    const inner = selected.slice(open.length, selected.length - close.length);
    return { value: value.slice(0, start) + inner + value.slice(end), start, end: start + inner.length };
  }
  if (value.slice(start - open.length, start) === open && value.slice(end, end + close.length) === close) {
    return {
      value: value.slice(0, start - open.length) + selected + value.slice(end + close.length),
      start: start - open.length,
      end: end - open.length,
    };
  }
  return {
    value: value.slice(0, start) + open + selected + close + value.slice(end),
    start: start + open.length,
    end: end + open.length,
  };
};

// Sets or toggles a prefix on every line touched by the selection. Lists renumber, headings and quotes replace other block prefixes.
const toggleLines = ({ value, start, end }: TextEdit, action: RichTextAction): TextEdit => {
  const { from, to } = lineBounds(value, start, end);
  const lines = value.slice(from, to).split('\n');
  const ordered = action === 'orderedList';
  const prefix = linePrefixes[action];
  const allHave = lines.every((line) => (ordered ? orderedPattern.test(line) : line.startsWith(prefix as string)));
  const next = lines.map((line, index) => {
    const bare = line.replace(prefixPattern, '');
    if (allHave) return bare;
    return ordered ? `${index + 1}. ${bare}` : `${prefix}${bare}`;
  });
  const joined = next.join('\n');
  return { value: value.slice(0, from) + joined + value.slice(to), start: from, end: from + joined.length };
};

const insertLink = ({ value, start, end }: TextEdit, image: boolean): TextEdit => {
  const label = value.slice(start, end) || (image ? 'alt' : 'link');
  const url = 'https://';
  const head = image ? '![' : '[';
  const text = `${head}${label}](${url})`;
  const urlStart = start + head.length + label.length + 2;
  return { value: value.slice(0, start) + text + value.slice(end), start: urlStart, end: urlStart + url.length };
};

export const applyRichTextAction = (edit: TextEdit, action: RichTextAction): TextEdit => {
  const inline = inlineMarkers[action];
  if (inline) return toggleInline(edit, inline);
  if (action === 'link') return insertLink(edit, false);
  if (action === 'image') return insertLink(edit, true);
  // Actions without a markdown form (undo, align, colour) are handled by the host editor.
  if (!linePrefixes[action] && action !== 'orderedList') return edit;
  return toggleLines(edit, action);
};

// Which toolbar toggles are on for the current selection (markers around it, or a prefix on its first line).
export const activeRichTextActions = ({ value, start, end }: TextEdit): Partial<Record<RichTextAction, boolean>> => {
  const result: Partial<Record<RichTextAction, boolean>> = {};
  const selected = value.slice(start, end);
  (Object.keys(inlineMarkers) as RichTextAction[]).forEach((action) => {
    const [open, close] = inlineMarkers[action] as [string, string];
    const around = value.slice(start - open.length, start) === open && value.slice(end, end + close.length) === close;
    const inside =
      selected.length > open.length + close.length && selected.startsWith(open) && selected.endsWith(close);
    // `*` must not read as active inside `**` pairs.
    const bold = action === 'italic' && value.slice(start - 2, start) === '**' && value.slice(end, end + 2) === '**';
    result[action] = (around || inside) && !bold;
  });
  const { from } = lineBounds(value, start, start);
  const line = value.slice(from, value.indexOf('\n', from) === -1 ? value.length : value.indexOf('\n', from));
  result.heading2 = line.startsWith('## ');
  result.heading1 = line.startsWith('# ');
  result.quote = line.startsWith('> ');
  result.bulletList = line.startsWith('- ');
  result.orderedList = orderedPattern.test(line);
  return result;
};

// Enter inside a list item starts the next item; Enter on an empty item ends the list.
export const continueList = ({ value, start, end }: TextEdit): TextEdit | null => {
  if (start !== end) return null;
  const { from } = lineBounds(value, start, end);
  const line = value.slice(from, start);
  const bullet = /^- (.*)$/.exec(line);
  const number = /^(\d+)\. (.*)$/.exec(line);
  const match = bullet ?? number;
  if (!match) return null;
  const content = bullet ? bullet[1] : (number as RegExpExecArray)[2];
  if (content === '') {
    return { value: value.slice(0, from) + value.slice(start), start: from, end: from };
  }
  const marker = bullet ? '- ' : `${Number((number as RegExpExecArray)[1]) + 1}. `;
  const insert = `\n${marker}`;
  return {
    value: value.slice(0, start) + insert + value.slice(end),
    start: start + insert.length,
    end: start + insert.length,
  };
};
