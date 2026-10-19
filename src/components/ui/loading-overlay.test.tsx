import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
  it('renders nothing while closed', () => {
    render(<LoadingOverlay open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a labelled busy dialog and moves focus into it', () => {
    render(<LoadingOverlay open label="Generating report" description="This can take a minute" />);
    const dialog = screen.getByRole('dialog', { name: 'Generating report' });
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(dialog).toHaveAccessibleDescription('This can take a minute');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('falls back to the provider loading text', () => {
    render(<LoadingOverlay open />);
    expect(screen.getByRole('dialog', { name: 'Loading' })).toBeInTheDocument();
  });

  it('cannot be dismissed with Escape or an outside click', async () => {
    const user = userEvent.setup();
    render(<LoadingOverlay open label="Working" />);
    await user.keyboard('{Escape}');
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('dialog', { name: 'Working' })).toBeInTheDocument();
  });
});
