import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import { StatusDot } from './status-dot';

describe('StatusDot', () => {
  it('is decorative without a label and uses the neutral tone at the 6px token size by default', () => {
    render(<StatusDot data-testid="dot" />);
    const dot = screen.getByTestId('dot');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveClass('bg-text-subtlest', 'h-status-dot', 'w-status-dot', 'rounded-full');
  });

  it.each([
    ['success', 'bg-status-success-dot'],
    ['warning', 'bg-status-warning-dot'],
    ['destructive', 'bg-status-destructive-dot'],
    ['info', 'bg-status-info-dot'],
    ['credit', 'bg-data-status-credit-dot'],
  ] as const)('maps tone %s to its status token', (tone, cls) => {
    render(<StatusDot tone={tone} data-testid="dot" />);
    expect(screen.getByTestId('dot')).toHaveClass(cls);
  });

  it('exposes a label as an image role and forwards the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusDot ref={ref} tone="success" size="md" label="Online" />);
    const dot = screen.getByRole('img', { name: 'Online' });
    expect(ref.current).toBe(dot);
    expect(dot).toHaveClass('h-2', 'w-2');
    expect(dot).not.toHaveAttribute('aria-hidden');
  });
});
