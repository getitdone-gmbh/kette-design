import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { RichTextEditor } from './rich-text-editor';
import { activeRichTextActions, applyRichTextAction, continueList } from './rich-text-markdown';

const edit = (value: string, start: number, end: number) => ({ value, start, end });

describe('applyRichTextAction (pure)', () => {
  it('wraps and unwraps inline markers', () => {
    const wrapped = applyRichTextAction(edit('hello world', 0, 5), 'bold');
    expect(wrapped).toEqual({ value: '**hello** world', start: 2, end: 7 });
    expect(applyRichTextAction(wrapped.start === 2 ? { ...wrapped } : wrapped, 'bold')).toEqual({
      value: 'hello world',
      start: 0,
      end: 5,
    });
    expect(applyRichTextAction(edit('**hello**', 0, 9), 'bold').value).toBe('hello');
  });

  it('italic, underline and code markers', () => {
    expect(applyRichTextAction(edit('a', 0, 1), 'italic').value).toBe('*a*');
    expect(applyRichTextAction(edit('a', 0, 1), 'underline').value).toBe('<u>a</u>');
    expect(applyRichTextAction(edit('a', 0, 1), 'code').value).toBe('`a`');
  });

  it('wraps an empty selection and places the caret between the markers', () => {
    expect(applyRichTextAction(edit('ab', 1, 1), 'bold')).toEqual({ value: 'a****b', start: 3, end: 3 });
  });

  it('link and image select the url part', () => {
    const link = applyRichTextAction(edit('see docs', 4, 8), 'link');
    expect(link.value).toBe('see [docs](https://)');
    expect(link.value.slice(link.start, link.end)).toBe('https://');
    expect(applyRichTextAction(edit('', 0, 0), 'image').value).toBe('![alt](https://)');
  });

  it('toggles line prefixes and renumbers lists across selected lines', () => {
    expect(applyRichTextAction(edit('a\nb', 0, 3), 'bulletList').value).toBe('- a\n- b');
    expect(applyRichTextAction(edit('- a\n- b', 0, 7), 'bulletList').value).toBe('a\nb');
    expect(applyRichTextAction(edit('a\nb', 0, 3), 'orderedList').value).toBe('1. a\n2. b');
    expect(applyRichTextAction(edit('# a', 0, 3), 'heading2').value).toBe('## a');
    expect(applyRichTextAction(edit('x', 0, 1), 'quote').value).toBe('> x');
  });

  it('only touches the selected lines', () => {
    expect(applyRichTextAction(edit('a\nb\nc', 2, 3), 'heading1').value).toBe('a\n# b\nc');
  });
});

describe('activeRichTextActions', () => {
  it('detects markers around the selection and line prefixes', () => {
    expect(activeRichTextActions(edit('**a**', 2, 3)).bold).toBe(true);
    expect(activeRichTextActions(edit('**a**', 2, 3)).italic).toBe(false);
    expect(activeRichTextActions(edit('*a*', 1, 2)).italic).toBe(true);
    expect(activeRichTextActions(edit('# t\n- x', 1, 1)).heading1).toBe(true);
    expect(activeRichTextActions(edit('# t\n- x', 5, 5)).bulletList).toBe(true);
    expect(activeRichTextActions(edit('plain', 0, 5)).bold).toBe(false);
  });
});

describe('continueList', () => {
  it('continues bullets and numbers, ends on an empty item, ignores other lines', () => {
    expect(continueList(edit('- a', 3, 3))?.value).toBe('- a\n- ');
    expect(continueList(edit('2. a', 4, 4))?.value).toBe('2. a\n3. ');
    expect(continueList(edit('- a\n- ', 6, 6))?.value).toBe('- a\n');
    expect(continueList(edit('text', 4, 4))).toBeNull();
    expect(continueList(edit('- a', 0, 3))).toBeNull();
  });
});

describe('RichTextEditor', () => {
  const select = (area: HTMLTextAreaElement, start: number, end: number) => {
    area.focus();
    area.setSelectionRange(start, end);
    fireEvent.select(area);
  };

  it('renders a named textarea and a toolbar', () => {
    render(<RichTextEditor defaultValue="hello" />);
    expect(screen.getByRole('textbox', { name: 'Content' })).toHaveValue('hello');
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('typing reports markdown through onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<RichTextEditor onValueChange={onValueChange} />);
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(onValueChange).toHaveBeenLastCalledWith('hi');
  });

  it('a toolbar button wraps the selection and keeps it selected', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<RichTextEditor defaultValue="hello world" onValueChange={onValueChange} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    select(area, 0, 5);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onValueChange).toHaveBeenLastCalledWith('**hello** world');
    expect(area).toHaveFocus();
    expect([area.selectionStart, area.selectionEnd]).toEqual([2, 7]);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['b', '**a**'],
    ['i', '*a*'],
    ['u', '<u>a</u>'],
    ['e', '`a`'],
    ['k', '[a](https://)'],
  ])('Ctrl+%s applies the shortcut', (key, expected) => {
    const onValueChange = vi.fn();
    render(<RichTextEditor defaultValue="a" onValueChange={onValueChange} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    select(area, 0, 1);
    fireEvent.keyDown(area, { key, ctrlKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(expected);
  });

  it('Cmd+B also works', () => {
    const onValueChange = vi.fn();
    render(<RichTextEditor defaultValue="a" onValueChange={onValueChange} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    select(area, 0, 1);
    fireEvent.keyDown(area, { key: 'b', metaKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith('**a**');
  });

  it('Enter continues a list', () => {
    const onValueChange = vi.fn();
    render(<RichTextEditor defaultValue="- one" onValueChange={onValueChange} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    select(area, 5, 5);
    fireEvent.keyDown(area, { key: 'Enter' });
    expect(onValueChange).toHaveBeenLastCalledWith('- one\n- ');
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RichTextEditor value="fixed" onValueChange={() => {}} />);
    await user.type(screen.getByRole('textbox'), 'x');
    expect(screen.getByRole('textbox')).toHaveValue('fixed');
    rerender(<RichTextEditor value="changed" onValueChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('changed');
  });

  it('preview renders the subset as elements and escapes everything else', async () => {
    const user = userEvent.setup();
    render(
      <RichTextEditor
        defaultValue={
          '# Title\n\n**bold** *it* <u>u</u> `c` [ok](https://a.b) [bad](javascript:alert(1)) <script>x</script>\n\n- a\n- b\n\n1. x\n\n> q'
        }
      />,
    );
    await user.click(screen.getByRole('button', { name: 'preview' }));
    const preview = screen.getByRole('region', { name: 'Preview' });
    expect(preview.querySelector('h2')).toHaveTextContent('Title');
    expect(preview.querySelector('strong')).toHaveTextContent('bold');
    expect(preview.querySelector('em')).toHaveTextContent('it');
    expect(preview.querySelector('u')).toHaveTextContent('u');
    expect(preview.querySelector('code')).toHaveTextContent('c');
    expect(preview.querySelector('a[href="https://a.b"]')).toBeInTheDocument();
    expect(preview.querySelector('a[href^="javascript"]')).toBeNull();
    expect(preview.querySelectorAll('li')).toHaveLength(3);
    expect(preview.querySelector('blockquote')).toHaveTextContent('q');
    expect(preview.querySelector('script')).toBeNull();
    expect(preview).toHaveTextContent('<script>x</script>');
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-disabled', 'true');
  });

  it('preview can be hidden and has an empty state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RichTextEditor preview={false} />);
    expect(screen.queryByRole('button', { name: 'preview' })).not.toBeInTheDocument();
    rerender(<RichTextEditor />);
    await user.click(screen.getByRole('button', { name: 'preview' }));
    expect(screen.getByText('Nothing to preview')).toBeInTheDocument();
  });

  it('disabled and read only block edits and actions', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<RichTextEditor defaultValue="a" disabled onValueChange={onValueChange} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
    rerender(<RichTextEditor defaultValue="a" readOnly onValueChange={onValueChange} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    await user.type(screen.getByRole('textbox'), 'x');
    expect(onValueChange).not.toHaveBeenCalled();
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    select(area, 0, 1);
    fireEvent.keyDown(area, { key: 'b', ctrlKey: true });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows invalid and a toolbar error', () => {
    render(<RichTextEditor invalid error="Could not insert link" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Could not insert link');
  });

  it('keeps the field text at least 16px below sm', () => {
    render(<RichTextEditor />);
    expect(screen.getByRole('textbox')).toHaveClass('max-sm:text-[max(16px,var(--typo-input-text-size,1rem))]');
  });
});
