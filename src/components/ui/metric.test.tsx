import { expectTypeOf, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { KpiStrip, MetricItem, type MetricItemProps } from './metric';

describe('MetricItem', () => {
  it('only requires label and value, variant and density stay optional (type level)', () => {
    type RequiredKeys<T> = { [K in keyof T]-?: object extends Pick<T, K> ? never : K }[keyof T];
    expectTypeOf<RequiredKeys<MetricItemProps>>().toEqualTypeOf<'label' | 'value'>();
    const { container } = render(<MetricItem label="a" value="1" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders label, value and delta', () => {
    render(<MetricItem label="Open demands" value="24" delta="+3 vs last week" deltaTone="success" />);
    expect(screen.getByText('Open demands')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('+3 vs last week')).toHaveClass('text-text-success');
  });

  it('defaults to the strip variant with a divider and no button semantics', () => {
    const { container } = render(<MetricItem label="a" value="1" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('[data-kpi-divider]')).not.toBeNull();
  });

  it('omits the divider when divider is false', () => {
    const { container } = render(<MetricItem label="a" value="1" divider={false} />);
    expect(container.querySelector('[data-kpi-divider]')).toBeNull();
  });

  it('becomes a toggle button with aria-pressed when onClick is set and activates with the keyboard', async () => {
    const onClick = vi.fn();
    render(<MetricItem label="Late" value="3" selected onClick={onClick} />);
    const button = screen.getByRole('button', { name: /Late/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('is busy and not interactive while loading', () => {
    const { container } = render(<MetricItem label="a" value="1" loading onClick={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    // The value is only transparent filler for the skeleton and hidden from assistive tech.
    expect(screen.getByText('1').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps the label visible while loading and hides value and delta from assistive tech', () => {
    render(<MetricItem label="Open tasks" value="12" delta="+3" loading />);
    expect(screen.getByText('Open tasks')).toBeVisible();
    expect(screen.getByText('12').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('+3').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('is inert and aria-disabled when disabled', () => {
    const { container } = render(<MetricItem label="a" value="1" disabled onClick={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the compact and card variants with icon and chart slots', () => {
    render(<MetricItem variant="card" label="Views" value="2,000" icon={<svg data-testid="i" />} chart={<svg data-testid="c" />} />);
    expect(screen.getByTestId('i')).toBeInTheDocument();
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('forwards a ref', () => {
    const ref = createRef<HTMLElement>();
    render(<MetricItem ref={ref} label="a" value="1" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('KpiStrip', () => {
  it('is a group that hides the first divider via CSS and merges className', () => {
    render(
      <KpiStrip aria-label="Demand KPIs" className="max-w-xl">
        <MetricItem label="a" value="1" />
        <MetricItem label="b" value="2" />
      </KpiStrip>,
    );
    const group = screen.getByRole('group', { name: 'Demand KPIs' });
    expect(group).toHaveClass('max-w-xl', 'rounded-surface');
    expect(group.className).toContain('[&>:first-child_[data-kpi-divider]]:hidden');
  });

  it('holds five tiles that share the width and can shrink', () => {
    render(
      <KpiStrip aria-label="Five">
        {['a', 'b', 'c', 'd', 'e'].map((label) => (
          <MetricItem key={label} label={label} value="1" />
        ))}
      </KpiStrip>,
    );
    const group = screen.getByRole('group', { name: 'Five' });
    expect(group.children).toHaveLength(5);
    Array.from(group.children).forEach((child) => expect(child).toHaveClass('flex-1', 'min-w-0'));
  });

  it('card variant renders a footer action row, but not inside an interactive item', () => {
    const { rerender } = render(<MetricItem variant="card" label="Views" value="2" footerAction={<a href="#r">View report</a>} />);
    expect(screen.getByRole('link', { name: 'View report' })).toBeInTheDocument();
    rerender(<MetricItem variant="card" label="Views" value="2" onClick={() => {}} footerAction={<a href="#r">View report</a>} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});


describe('KpiStrip wrapping and MetricItem slots', () => {
  it('wraps into two columns below md and stays a single bar from md', () => {
    render(
      <KpiStrip aria-label="KPIs">
        <MetricItem label="a" value="1" />
        <MetricItem label="b" value="2" />
        <MetricItem label="c" value="3" />
      </KpiStrip>,
    );
    expect(screen.getByRole('group', { name: 'KPIs' })).toHaveClass('grid', 'grid-cols-2', 'md:flex');
  });

  it('renders a caption under the value in every variant', () => {
    render(
      <>
        <MetricItem label="a" value="1" caption="Target 160 h" />
        <MetricItem variant="compact" label="b" value="2" caption="Cap compact" />
        <MetricItem variant="card" label="c" value="3" caption="Cap card" />
      </>,
    );
    expect(screen.getByText('Target 160 h')).toHaveClass('text-text-subtle');
    expect(screen.getByText('Cap compact')).toBeInTheDocument();
    expect(screen.getByText('Cap card')).toBeInTheDocument();
  });

  it('shows a decorative icon in strip and compact variants', () => {
    const { container } = render(
      <>
        <MetricItem label="a" value="1" icon={<svg data-testid="i1" />} />
        <MetricItem variant="compact" label="b" value="2" icon={<svg data-testid="i2" />} />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"] > svg')).toHaveLength(2);
  });

  it('tightens card padding with density compact', () => {
    const { container, rerender } = render(<MetricItem variant="card" label="a" value="1" />);
    expect(container.firstElementChild).toHaveClass('p-6');
    rerender(<MetricItem variant="card" density="compact" label="a" value="1" />);
    expect(container.firstElementChild).toHaveClass('p-4');
    expect(container.firstElementChild).not.toHaveClass('p-6');
  });
});
