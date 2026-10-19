import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Heatmap, HeatmapCell, HeatmapRow } from './heatmap';

const Load = (props: Partial<React.ComponentProps<typeof Heatmap>>) => (
  <Heatmap aria-label="Workload" columns={['W41', 'W42']} {...props}>
    <HeatmapRow header="Anna Berger">
      <HeatmapCell tone="ok">80 %</HeatmapCell>
      <HeatmapCell tone="over">120 %</HeatmapCell>
    </HeatmapRow>
    <HeatmapRow header="Mia Schulz">
      <HeatmapCell tone="need">Need 1</HeatmapCell>
      <HeatmapCell tone="empty">-</HeatmapCell>
    </HeatmapRow>
  </Heatmap>
);

describe('Heatmap', () => {
  it('renders a named table with headers and one cell per column', () => {
    render(<Load />);
    expect(screen.getByRole('table', { name: 'Workload' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'W42' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Mia Schulz' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });

  it('exposes the tone as data attribute and never relies on color alone (text stays)', () => {
    render(<Load />);
    expect(screen.getByText('120 %')).toHaveAttribute('data-tone', 'over');
    expect(screen.getByText('Need 1')).toHaveAttribute('data-tone', 'need');
  });

  it('gives symbol only coverage cells a text alternative', () => {
    render(
      <Heatmap aria-label="Coverage" columns={['Java']}>
        <HeatmapRow header="Demand A">
          <HeatmapCell tone="coverage-full" label="Covered" />
        </HeatmapRow>
      </Heatmap>,
    );
    expect(screen.getByText('Covered')).toHaveClass('sr-only');
  });

  it('becomes an operable toggle button with onClick', async () => {
    const onClick = vi.fn();
    render(
      <Heatmap aria-label="h" columns={['A']}>
        <HeatmapRow header="r">
          <HeatmapCell selected onClick={onClick}>
            3
          </HeatmapCell>
        </HeatmapRow>
      </Heatmap>,
    );
    const b = screen.getByRole('button', { name: '3' });
    expect(b).toHaveAttribute('aria-pressed', 'true');
    b.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('renders skill-4 with the strong fill and an inset on-fill ring', () => {
    render(
      <Heatmap aria-label="Skills" columns={['A']}>
        <HeatmapRow header="Row">
          <HeatmapCell tone="skill-3">3</HeatmapCell>
          <HeatmapCell tone="skill-4" category="backend">4</HeatmapCell>
        </HeatmapRow>
      </Heatmap>,
    );
    expect(screen.getByText('4')).toHaveClass('bg-data-skill-backend-default', 'text-data-skill-backend-on-fill', 'ring-inset', 'ring-data-skill-backend-on-fill');
    expect(screen.getByText('3')).not.toHaveClass('ring-inset');
  });

  it('colors skill levels from the category tokens, frontend by default', () => {
    render(
      <Heatmap aria-label="s" columns={['a', 'b', 'c']}>
        <HeatmapRow header="r">
          <HeatmapCell tone="skill-1">1</HeatmapCell>
          <HeatmapCell tone="skill-2" category="backend">2</HeatmapCell>
          <HeatmapCell tone="skill-3" category="data-ai">3</HeatmapCell>
        </HeatmapRow>
      </Heatmap>,
    );
    expect(screen.getByText('1')).toHaveClass('bg-data-skill-frontend-subtle', 'text-data-skill-frontend-on');
    expect(screen.getByText('2')).toHaveClass('bg-data-skill-backend-subtle', 'text-data-skill-backend-on');
    expect(screen.getByText('3')).toHaveClass('bg-data-skill-data-ai-default', 'text-data-skill-data-ai-on-fill');
  });

  it('renders loading, empty and error states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<Load state="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading heatmap');
    rerender(<Load state="empty" />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
    rerender(<Load state="error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('Heatmap revenue states and intensity', () => {
  it('renders paid, unpaid and forecast tones with the forecast dashed', () => {
    render(
      <Heatmap aria-label="Revenue" columns={['A', 'B', 'C']}>
        <HeatmapRow header="Acme">
          <HeatmapCell tone="paid">1</HeatmapCell>
          <HeatmapCell tone="unpaid">2</HeatmapCell>
          <HeatmapCell tone="forecast">3</HeatmapCell>
        </HeatmapRow>
      </Heatmap>,
    );
    expect(screen.getByText('1')).toHaveClass('bg-general-success-container');
    expect(screen.getByText('2')).toHaveClass('bg-general-warning-container');
    expect(screen.getByText('3')).toHaveClass('border-dashed');
  });

  it('maps intensity to a capped overlay opacity and clamps out-of-range values', () => {
    render(
      <Heatmap aria-label="Activity" columns={['A', 'B']}>
        <HeatmapRow header="r">
          <HeatmapCell intensity={0.5}>half</HeatmapCell>
          <HeatmapCell intensity={3}>full</HeatmapCell>
        </HeatmapRow>
      </Heatmap>,
    );
    const half = screen.getByText('half').closest('[data-tone]') as HTMLElement;
    expect(half).toHaveAttribute('data-tone', 'intensity');
    expect(half.querySelector('[data-heat-fill]')).toHaveStyle({ opacity: '0.2' });
    const full = screen.getByText('full').closest('[data-tone]') as HTMLElement;
    expect(full.querySelector('[data-heat-fill]')).toHaveStyle({ opacity: '0.4' });
  });
});
