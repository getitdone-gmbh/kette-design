import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaginationDotGroup } from './pagination-dot-group';

describe('PaginationDotGroup', () => {
  it('read-only: one image with the position as its name and decorative indicators', () => {
    const { container } = render(<PaginationDotGroup count={4} current={1} />);
    expect(screen.getByRole('img', { name: 'Page 2 of 4' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
  });

  it('md dots are 8px with a 12px gap, lg dots 10px with a 16px gap', () => {
    const { container, rerender } = render(<PaginationDotGroup count={3} current={0} />);
    expect(screen.getByRole('img')).toHaveClass('gap-3');
    expect(container.querySelector('span.rounded-full')).toHaveClass('h-2', 'w-2');
    rerender(<PaginationDotGroup count={3} current={0} size="lg" />);
    expect(screen.getByRole('img')).toHaveClass('gap-4');
    expect(container.querySelector('span.rounded-full')).toHaveClass('h-[calc(var(--space-micro)*5)]');
  });

  it.each([
    ['primary-light-bg', 'bg-primary-700', 'bg-static-white', 'bg-general-brand-default'],
    ['primary-dark-bg', 'bg-background-brand-subtle', 'bg-background-brand-bold-default', 'bg-background-neutral-default'],
    ['gray-light-bg', 'bg-background', 'bg-background-inverse', 'bg-muted-strong'],
    ['gray-dark-bg', 'bg-static-black/90', 'bg-static-white', 'bg-icon-subtle'],
  ] as const)('tone %s maps frame, current and idle colours', (tone, frame, cur, idle) => {
    const { container } = render(<PaginationDotGroup count={3} current={1} tone={tone} framed />);
    expect(screen.getByRole('img')).toHaveClass(frame, 'rounded-full', 'p-2');
    const dots = container.querySelectorAll('span.rounded-full');
    expect(dots[1]).toHaveClass(cur);
    expect(dots[0]).toHaveClass(idle);
  });

  it('unframed has no frame fill or padding', () => {
    render(<PaginationDotGroup count={2} current={0} />);
    expect(screen.getByRole('img').className).not.toMatch(/p-2|bg-background(?!-)/);
  });

  it('line style: equal 40px lines, 6px (md) and 8px (lg) high, only colour marks the current one', () => {
    const { container, rerender } = render(<PaginationDotGroup count={3} current={0} indicator="line" />);
    const lines = container.querySelectorAll('span.rounded-full');
    lines.forEach((l) => expect(l).toHaveClass('w-10', 'h-[calc(var(--space-micro)*3)]'));
    expect(lines[0]).toHaveClass('bg-background-inverse');
    expect(lines[1]).toHaveClass('bg-muted-strong');
    rerender(<PaginationDotGroup count={3} current={0} indicator="line" size="lg" framed />);
    expect(container.querySelector('span.rounded-full')).toHaveClass('h-2', 'w-10');
    expect(screen.getByRole('img')).toHaveClass('p-3');
  });

  it('interactive: buttons with names, aria-current, 24px targets and keyboard activation', async () => {
    const onSelect = vi.fn();
    render(<PaginationDotGroup count={3} current={0} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveAttribute('aria-current', 'true');
    expect(buttons[1]).not.toHaveAttribute('aria-current');
    expect(buttons[1]).toHaveClass('h-6', 'min-w-target', 'focus-visible:ring-focus');
    expect(buttons[1]).toHaveAccessibleName('Go to page 2 of 3');
    await userEvent.tab();
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('animates width only when motion is allowed', () => {
    const { container } = render(<PaginationDotGroup count={2} current={0} />);
    expect(container.querySelector('span.rounded-full')).toHaveClass('motion-reduce:transition-none');
  });
});
