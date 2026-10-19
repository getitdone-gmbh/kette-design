'use client';

import * as React from 'react';

import { focusRing, invalidRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { activeRichTextActions, applyRichTextAction, continueList } from './rich-text-markdown';
import { RichTextToolbar, type RichTextAction, type RichTextToolbarProps } from './rich-text-toolbar';
import { useLabels } from './labels-context';

const safeUrl = (url: string) => /^(https?:\/\/|mailto:|\/|#)/i.test(url.trim());

// Inline markdown subset to React nodes. Never builds HTML strings, and only allows safe link targets.
const inlinePattern = /(\*\*[^*]+\*\*|\*[^*]+\*|<u>[^<]*<\/u>|`[^`]+`|!?\[[^\]]*\]\([^)]*\))/g;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] =>
  text.split(inlinePattern).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    if (part.startsWith('<u>') && part.endsWith('</u>')) return <u key={key}>{part.slice(3, -4)}</u>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={key} className="rounded-item bg-muted px-1 typography-inline-code font-normal">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^(!?)\[([^\]]*)\]\(([^)]*)\)$/.exec(part);
    if (link) {
      const [, image, label, url] = link;
      if (!safeUrl(url)) return <React.Fragment key={key}>{label}</React.Fragment>;
      if (image) return <img key={key} src={url} alt={label} className="max-w-full" />;
      return (
        <a key={key} href={url} className="text-text-brand underline underline-offset-4" rel="noreferrer noopener">
          {label}
        </a>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });

export const renderRichTextPreview = (value: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const lines = value.split('\n');
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const key = `b${index}`;
    const heading = /^(#{1,2}) (.*)$/.exec(line);
    if (heading) {
      nodes.push(
        heading[1].length === 1 ? (
          <h2 key={key} className="typography-subheading text-foreground">
            {renderInline(heading[2], key)}
          </h2>
        ) : (
          <h3 key={key} className="typography-ui-lg-semibold text-foreground">
            {renderInline(heading[2], key)}
          </h3>
        ),
      );
      index += 1;
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={key} className="border-l-2 border-solid border-border-default pl-3 text-text-subtle">
          {renderInline(line.slice(2), key)}
        </blockquote>,
      );
      index += 1;
    } else if (/^- /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (index < lines.length && (ordered ? /^\d+\. /.test(lines[index]) : /^- /.test(lines[index]))) {
        items.push(lines[index].replace(ordered ? /^\d+\. / : /^- /, ''));
        index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      nodes.push(
        <List key={key} className={cn('pl-5', ordered ? 'list-decimal' : 'list-disc')}>
          {items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
          ))}
        </List>,
      );
    } else if (line.trim() === '') {
      index += 1;
    } else {
      nodes.push(<p key={key}>{renderInline(line, key)}</p>);
      index += 1;
    }
  }
  return nodes;
};

export interface RichTextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    Pick<RichTextToolbarProps, 'type' | 'actions' | 'leading'> {
  // Markdown source. The editor is a plain textarea that writes markdown markers around the selection, not a contenteditable.
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  // Shows the Write / Preview switch. The preview renders the markdown subset as React elements.
  preview?: boolean;
  // Accessible name of the text area.
  textLabel?: string;
  rows?: number;
  // Message from a failed action, shown in the toolbar.
  error?: React.ReactNode;
}

const RichTextEditor = React.forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  (
    {
      className,
      value,
      defaultValue = '',
      onValueChange,
      placeholder,
      disabled = false,
      readOnly = false,
      invalid = false,
      preview = true,
      textLabel: textLabelProp,
      rows = 8,
      type,
      actions,
      leading,
      error,
      ...props
    },
    ref,
  ) => {
    const l = useLabels();
    const textLabel = textLabelProp ?? l.content;
    const [inner, setInner] = React.useState(defaultValue);
    const current = value ?? inner;
    const [mode, setMode] = React.useState<'write' | 'preview'>('write');
    const [active, setActive] = React.useState<Partial<Record<RichTextAction, boolean>>>({});
    const areaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const pending = React.useRef<{ start: number; end: number } | null>(null);

    const setValue = (next: string) => {
      setInner(next);
      onValueChange?.(next);
    };

    const refreshActive = () => {
      const area = areaRef.current;
      if (area)
        setActive(activeRichTextActions({ value: area.value, start: area.selectionStart, end: area.selectionEnd }));
    };

    React.useLayoutEffect(() => {
      const area = areaRef.current;
      if (area && pending.current) {
        area.focus();
        area.setSelectionRange(pending.current.start, pending.current.end);
        pending.current = null;
        refreshActive();
      }
    });

    const apply = (action: RichTextAction) => {
      const area = areaRef.current;
      if (!area || disabled || readOnly) return;
      const edit = applyRichTextAction(
        { value: area.value, start: area.selectionStart, end: area.selectionEnd },
        action,
      );
      pending.current = { start: edit.start, end: edit.end };
      setValue(edit.value);
    };

    const shortcuts: Record<string, RichTextAction> = { b: 'bold', i: 'italic', u: 'underline', e: 'code', k: 'link' };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
        const action = shortcuts[event.key.toLowerCase()];
        if (action) {
          event.preventDefault();
          apply(action);
          return;
        }
      }
      if (
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.nativeEvent.isComposing
      ) {
        const area = event.currentTarget;
        const edit = continueList({ value: area.value, start: area.selectionStart, end: area.selectionEnd });
        if (edit) {
          event.preventDefault();
          pending.current = { start: edit.start, end: edit.end };
          setValue(edit.value);
        }
      }
    };

    return (
      <div
        data-invalid={invalid || undefined}
        className={cn(
          'flex w-full flex-col gap-2 rounded-control border border-solid border-input bg-background p-2',
          'focus-within:border-ring focus-within:ring-focus focus-within:ring-offset-focus focus-within:ring-offset-background focus-within:ring-ring-default',
          'data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20',
          disabled && 'opacity-disabled',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <RichTextToolbar
            type={type}
            actions={actions}
            leading={leading}
            error={error}
            pressed={active}
            disabled={disabled || readOnly || mode === 'preview'}
            onAction={apply}
            className="flex-1"
          />
          {preview ? (
            <div role="group" aria-label={l.editorMode} className="flex shrink-0 gap-1">
              {(['write', 'preview'] as const).map((entry) => (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={mode === entry}
                  disabled={disabled}
                  onClick={() => setMode(entry)}
                  className={cn(
                    'h-control-sm rounded-item px-2 typography-ui-medium capitalize text-text-subtle transition-colors hover:bg-muted motion-reduce:transition-none',
                    'aria-[pressed=true]:bg-muted aria-[pressed=true]:text-foreground',
                    focusRing,
                  )}
                >
                  {entry === 'write' ? l.write : l.preview}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {mode === 'write' ? (
          <textarea
            ref={(node) => {
              areaRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            aria-label={textLabel}
            aria-invalid={invalid || undefined}
            value={current}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            spellCheck
            className={cn(
              'w-full resize-y rounded-item border-0 bg-transparent px-2 py-1 text-foreground outline-none typography-input-text',
              // Below sm the field text is at least 16px so iOS Safari does not zoom on focus.
              'max-sm:text-[max(16px,var(--typo-input-text-size,1rem))]',
              'placeholder:text-text-subtle',
              'disabled:cursor-not-allowed',
              invalidRing,
            )}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={refreshActive}
            onKeyUp={refreshActive}
            onClick={refreshActive}
          />
        ) : (
          <div
            data-rich-text-preview=""
            aria-label={l.previewRegion}
            role="region"
            className="flex flex-col gap-2 px-2 py-2 typography-ui text-foreground"
          >
            {current.trim() ? renderRichTextPreview(current) : <p className="text-text-subtle">{l.nothingToPreview}</p>}
          </div>
        )}
      </div>
    );
  },
);
RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
