import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RichTextToolbar, RichTextToolbarButton } from './rich-text-toolbar';

describe('RichTextToolbar', () => {
  it('is a toolbar with the full set of buttons by default', () => {
    render(<RichTextToolbar />);
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('shows the inline set for the message type and honours explicit actions', () => {
    const { rerender } = render(<RichTextToolbar type="message" />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    rerender(<RichTextToolbar actions={['bold', 'link']} />);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Bold', 'Link']);
  });

  it('reflects toggle state with aria-pressed', () => {
    render(<RichTextToolbar pressed={{ bold: true }} />);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onAction for clicks and keyboard activation', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<RichTextToolbar onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onAction).toHaveBeenLastCalledWith('italic');
    screen.getByRole('button', { name: 'Bold' }).focus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('bold');
  });

  it('uses a roving tabindex with arrow, Home and End navigation', async () => {
    const user = userEvent.setup();
    render(<RichTextToolbar actions={['bold', 'italic', 'quote']} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(buttons[1]).toHaveFocus();
    expect(buttons[1].tabIndex).toBe(0);
    expect(buttons[0].tabIndex).toBe(-1);
    await user.keyboard('{End}');
    expect(buttons[2]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(buttons[0]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(buttons[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(buttons[0]).toHaveFocus();
    await user.tab();
    expect(buttons[2]).not.toHaveFocus();
  });

  it('disables every button', () => {
    render(<RichTextToolbar disabled />);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-disabled', 'true');
  });

  it('announces an error and links it to the toolbar', () => {
    render(<RichTextToolbar error="Could not insert link" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not insert link');
    expect(screen.getByRole('toolbar')).toHaveAccessibleDescription('Could not insert link');
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-invalid', 'true');
  });

  it('renders a leading slot and custom buttons', () => {
    render(
      <RichTextToolbar leading={<span>Font select</span>}>
        <RichTextToolbarButton label="Strike" icon={<i />} />
      </RichTextToolbar>,
    );
    expect(screen.getByText('Font select')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Strike' })).toBeInTheDocument();
  });

  it('shows the label and shortcut in a tooltip on focus', async () => {
    const user = userEvent.setup();
    render(<RichTextToolbar actions={['bold']} />);
    await user.tab();
    expect((await screen.findAllByText('Bold')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-keyshortcuts', 'Ctrl+B');
  });
});
