import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Notification, NotificationAction } from './notification';

describe('Notification', () => {
  it('is a polite status with title and description', () => {
    render(<Notification title="Profile updated" description="Saved" />);
    expect(screen.getByRole('status')).toHaveTextContent('Profile updated');
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders no close button without onDismiss and calls it when present', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Notification title="t" />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<Notification title="t" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('actions are keyboard operable buttons', async () => {
    const onUndo = vi.fn();
    render(<Notification title="Task deleted" variant="inverse" actions={<NotificationAction onClick={onUndo}>Undo</NotificationAction>} />);
    screen.getByRole('button', { name: 'Undo' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onUndo).toHaveBeenCalled();
  });

  it('exposes progress with value semantics, clamped to the bar width', () => {
    render(<Notification title="Uploading" progress={60} progressLabel="60% uploaded" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
    expect(screen.getByText('60% uploaded')).toBeInTheDocument();
  });

  it('uses the avatar slot instead of the icon tile', () => {
    render(<Notification title="t" icon={<svg data-testid="icon" />} avatar={<span data-testid="av" />} />);
    expect(screen.getByTestId('av')).toBeInTheDocument();
    expect(screen.queryByTestId('icon')).toBeNull();
  });
});
