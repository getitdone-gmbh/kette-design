import { render, screen } from '@testing-library/react';

import { MetricPanel } from './metric-panel';

describe('MetricPanel', () => {
  it('renders a labelled group on the inverse surface with the display role', () => {
    render(<MetricPanel label="Net result" value="4.200 EUR" description="Per month" />);
    const group = screen.getByRole('group', { name: 'Net result' });
    expect(group).toHaveClass('bg-background-inverse', 'text-text-inverse');
    expect(screen.getByText('4.200 EUR')).toHaveClass('typography-display');
    expect(screen.getByText('Per month')).toBeInTheDocument();
  });

  it('lists secondary figures as a definition list', () => {
    render(<MetricPanel label="Result" value="10" secondary={[{ label: 'Tax', value: '2' }, { label: 'Fees', value: '1' }]} />);
    expect(screen.getByText('Tax').tagName).toBe('DT');
    expect(screen.getByText('2').tagName).toBe('DD');
  });

  it('announces changes politely only when live', () => {
    const { rerender } = render(<MetricPanel label="Result" value="10" />);
    expect(screen.getByText('10')).not.toHaveAttribute('aria-live');
    rerender(<MetricPanel label="Result" value="10" live />);
    expect(screen.getByText('10')).toHaveAttribute('aria-live', 'polite');
  });

  it('follows the theme by default', () => {
    render(<MetricPanel label="Result" value="10" />);
    expect(screen.getByRole('group')).toHaveClass('bg-background-inverse');
    expect(screen.getByRole('group')).not.toHaveClass('dark');
  });

  it('keeps the dark surface in dark mode with tone inverse-fixed', () => {
    render(<MetricPanel label="Result" value="10" tone="inverse-fixed" secondary={[{ label: 'Tax', value: '2' }]} />);
    const group = screen.getByRole('group');
    // The dark theme is scoped to the panel, so semantic roles resolve dark in both modes.
    expect(group).toHaveClass('dark', 'bg-background-subtle', 'text-text-default');
    expect(group).not.toHaveClass('bg-background-inverse');
    expect(screen.getByText('Tax').closest('dl')).toHaveClass('border-border-default');
  });

  it('sets a larger result and larger secondary row with size lg', () => {
    render(<MetricPanel label="Result" value="10" size="lg" secondary={[{ label: 'Per year', value: '120' }]} />);
    expect(screen.getByText('10')).toHaveClass('typography-digit-lg-semibold');
    expect(screen.getByText('Per year')).toHaveClass('typography-large');
    expect(screen.getByText('120')).toHaveClass('typography-ui-lg-semibold');
  });
});

describe('MetricPanel adoption options', () => {
  const secondary = [{ label: 'Per year', value: '50.400 EUR' }];

  it('keeps the row layout, semibold label and border by default', () => {
    render(<MetricPanel label="Result" value="10" tone="inverse-fixed" secondary={secondary} />);
    expect(screen.getByText('Result')).toHaveClass('typography-ui-semibold');
    expect(screen.getByRole('group')).toHaveClass('border', 'border-border-subtle');
    expect(screen.getByRole('group')).not.toHaveClass('h-full');
    expect(screen.getByText('Per year').parentElement).toHaveClass('flex', 'justify-between');
  });

  it('stacks the label above the value', () => {
    render(<MetricPanel label="Result" value="10" secondary={secondary} secondaryLayout="stacked" />);
    expect(screen.getByText('Per year').parentElement).toHaveClass('flex-col');
  });

  it('stacks the value above the label with stacked-reverse', () => {
    render(<MetricPanel label="Result" value="10" secondary={secondary} secondaryLayout="stacked-reverse" />);
    expect(screen.getByText('Per year').parentElement).toHaveClass('flex-col-reverse');
  });

  it('sets the label weight', () => {
    render(<MetricPanel label="Result" value="10" labelWeight="medium" />);
    expect(screen.getByText('Result')).toHaveClass('typography-ui-medium');
    expect(screen.getByText('Result')).not.toHaveClass('typography-ui-semibold');
  });

  it('drops the border of inverse-fixed with bordered false', () => {
    render(<MetricPanel label="Result" value="10" tone="inverse-fixed" bordered={false} />);
    expect(screen.getByRole('group')).not.toHaveClass('border');
    expect(screen.getByRole('group')).toHaveClass('dark');
  });

  it('fills the available height', () => {
    render(<MetricPanel label="Result" value="10" fill />);
    expect(screen.getByRole('group')).toHaveClass('h-full');
  });

  it('labelSize md and lg use the 14px and 16px roles with the chosen weight', () => {
    const { rerender } = render(<MetricPanel label="Result" value="1" labelSize="md" labelWeight="medium" />);
    expect(screen.getByText('Result')).toHaveClass('typography-text-small', 'font-medium');
    rerender(<MetricPanel label="Result" value="1" labelSize="lg" />);
    expect(screen.getByText('Result')).toHaveClass('typography-p-ui', 'font-semibold');
    rerender(<MetricPanel label="Result" value="1" />);
    expect(screen.getByText('Result')).toHaveClass('typography-ui-semibold');
  });
});
