import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';

import { ChatWindow } from './chat-window';

describe('ChatWindow', () => {
  it('renders nothing while closed', () => {
    render(<ChatWindow open={false} title="Assistant" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a non-modal labelled dialog and leaves the page usable', () => {
    render(
      <>
        <button type="button">Page action</button>
        <ChatWindow open title="Assistant" footer={<input aria-label="Message" />}>
          Hello
        </ChatWindow>
      </>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Assistant' });
    expect(dialog).toHaveAttribute('aria-modal', 'false');
    expect(screen.getByRole('button', { name: 'Page action' })).toBeEnabled();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('closes with Escape and with the close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ChatWindow open title="Assistant" onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('minimizes to the header and exposes the state', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [minimized, setMinimized] = useState(false);
      return (
        <ChatWindow open title="Assistant" minimized={minimized} onMinimizedChange={setMinimized}>
          Body text
        </ChatWindow>
      );
    };
    render(<Harness />);
    const toggle = screen.getByRole('button', { name: 'Minimize' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(screen.queryByText('Body text')).toBeNull();
    expect(screen.getByRole('button', { name: 'Restore' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves focus in on open and back to the opener on close', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open chat
          </button>
          <ChatWindow open={open} title="Assistant" onOpenChange={setOpen} />
        </>
      );
    };
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open chat' });
    await user.click(opener);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });
});

describe('ChatWindow height, padding, subtitle and views (0.15)', () => {
  it('keeps the 96 height by default and offers sm and content heights', () => {
    const { rerender } = render(<ChatWindow open title="A" />);
    expect(screen.getByRole('dialog')).toHaveClass('h-96', 'max-h-full');
    rerender(<ChatWindow open title="A" height="sm" />);
    expect(screen.getByRole('dialog')).toHaveClass('h-80');
    rerender(<ChatWindow open title="A" height="content" />);
    expect(screen.getByRole('dialog')).toHaveClass('h-[calc(theme(height.content)-theme(spacing.4)-var(--size-inset))]');
  });

  it('maps padding to the body region', () => {
    const { rerender } = render(<ChatWindow open title="A">body</ChatWindow>);
    expect(screen.getByText('body')).toHaveClass('p-4', 'overflow-y-auto');
    rerender(<ChatWindow open title="A" padding="none">body</ChatWindow>);
    expect(screen.getByText('body')).toHaveClass('p-0');
    rerender(<ChatWindow open title="A" padding="lg">body</ChatWindow>);
    expect(screen.getByText('body')).toHaveClass('p-6');
  });

  it('renders a subtitle that describes the dialog', () => {
    render(<ChatWindow open title="Assistant" subtitle="Timesheet helper" />);
    expect(screen.getByRole('dialog', { name: 'Assistant', description: 'Timesheet helper' })).toBeInTheDocument();
  });

  it('switches views with the header and tab list fixed and only the panel scrolling', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(
      <ChatWindow
        open
        title="Assistant"
        onViewChange={onViewChange}
        views={[
          { id: 'chat', label: 'Chat', content: 'Chat body' },
          { id: 'history', label: 'History', content: 'History body' },
        ]}
        footer={<input aria-label="Message" />}
      />,
    );
    expect(screen.getByRole('tablist', { name: 'Assistant' })).toBeInTheDocument();
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveClass('overflow-y-auto', 'min-h-0', 'flex-1');
    expect(screen.getByText('Chat body')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'History' }));
    expect(onViewChange).toHaveBeenCalledWith('history');
    expect(screen.getByText('History body')).toBeInTheDocument();
    expect(screen.queryByText('Chat body')).toBeNull();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('supports a controlled view', () => {
    render(
      <ChatWindow
        open
        title="Assistant"
        view="history"
        views={[
          { id: 'chat', label: 'Chat', content: 'Chat body' },
          { id: 'history', label: 'History', content: 'History body' },
        ]}
      />,
    );
    expect(screen.getByText('History body')).toBeInTheDocument();
  });
});

describe('ChatWindow floating offsets (0.17)', () => {
  it('subtracts the float offset and inset token from the content height so it clears the top bar', () => {
    render(<ChatWindow open title="A" height="content" />);
    expect(screen.getByRole('dialog').className).toContain('theme(height.content)-theme(spacing.4)-var(--size-inset)');
  });

  it('constrains the width to the viewport minus both side offsets', () => {
    render(<ChatWindow open title="A" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-[calc(100%-theme(spacing.8))]', 'right-4');
    expect(dialog).not.toHaveClass('max-w-full');
  });
});
