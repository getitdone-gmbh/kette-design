import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { DataStatePanel, SkeletonBar } from './data-state-panel';

describe('DataStatePanel', () => {
  it('empty is a status with title, description and action', () => {
    render(<DataStatePanel kind="empty" title="Nothing" description="Add one" action={<button>Add</button>} />);
    expect(screen.getByRole('status')).toHaveTextContent('Nothing');
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('error is an alert with a retry that fires', async () => {
    const onRetry = vi.fn();
    render(<DataStatePanel kind="error" title="Broken" onRetry={onRetry} retryLabel="Retry" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Broken');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('skeleton bars are hidden from assistive tech and stop pulsing under reduced motion', () => {
    const { container } = render(<SkeletonBar />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveClass('motion-reduce:animate-none');
  });
});
