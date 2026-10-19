import { render, screen } from '@testing-library/react';

import { Cluster, SplitView, Stack, TileGrid } from './layout';

describe('layout primitives', () => {
  it('Stack maps gap names to tokens and defaults to block', () => {
    const { rerender } = render(<Stack data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveClass('flex-col', 'gap-5');
    rerender(<Stack data-testid="s" gap="section" />);
    expect(screen.getByTestId('s')).toHaveClass('gap-8');
    rerender(<Stack data-testid="s" gap="card" as="section" />);
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
  });

  it('Cluster wraps by default', () => {
    render(<Cluster data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveClass('flex-wrap', 'gap-2');
  });

  it('TileGrid sets an auto-fill column template from min', () => {
    render(<TileGrid data-testid="t" min={220} />);
    expect(screen.getByTestId('t').style.gridTemplateColumns).toContain('220px');
  });

  it('SplitView renders a labelled aside and the content', () => {
    render(
      <SplitView aside="Filters" asideLabel="Filters">
        Results
      </SplitView>,
    );
    expect(screen.getByRole('complementary', { name: 'Filters' })).toHaveTextContent('Filters');
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('SplitView aside on the end sits after the content on narrow screens', () => {
    render(
      <SplitView aside="A" side="end">
        C
      </SplitView>,
    );
    expect(screen.getByRole('complementary')).toHaveClass('order-last');
  });
});
