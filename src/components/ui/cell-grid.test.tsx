import { render, screen, within } from '@testing-library/react';

import { CellGrid, CellGridCell } from './cell-grid';

describe('CellGrid', () => {
  it('renders data-driven cells as a list', () => {
    render(
      <CellGrid
        aria-label="Proof"
        columns={3}
        items={[
          { id: 'a', content: 'First' },
          { id: 'b', content: 'Second' },
        ]}
      />,
    );
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(list).toHaveClass('grid', 'lg:grid-cols-3');
  });

  it('renders custom cells with hairline borders from tokens', () => {
    render(
      <CellGrid columns={2} data-testid="frame">
        <CellGridCell>One</CellGridCell>
        <CellGridCell className="p-8">Two</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByTestId('frame')).toHaveClass('border-hairline', 'overflow-hidden');
    expect(screen.getByText('One')).toHaveClass('border-hairline', 'bg-background');
    expect(screen.getByText('Two')).toHaveClass('p-8');
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('drops the own frame when framed is false', () => {
    render(
      <CellGrid columns={2} framed={false} data-testid="frame">
        <CellGridCell>One</CellGridCell>
      </CellGrid>,
    );
    const frame = screen.getByTestId('frame');
    expect(frame).not.toHaveClass('border', 'rounded-surface');
    expect(frame).toHaveClass('overflow-hidden');
  });

  it('keeps the frame by default', () => {
    render(<CellGrid data-testid="frame" items={[{ id: 'a', content: 'A' }]} />);
    expect(screen.getByTestId('frame')).toHaveClass('border', 'rounded-surface');
  });

  it('supports responsive columns so two columns work on mobile', () => {
    render(<CellGrid aria-label="Grid" columns={{ base: 2, md: 4 }} items={[{ id: 'a', content: 'A' }]} />);
    expect(screen.getByRole('list')).toHaveClass('grid-cols-2', 'md:grid-cols-4');
    expect(screen.getByRole('list')).not.toHaveClass('grid-cols-1');
  });

  it('defaults a responsive object to one column on base', () => {
    render(<CellGrid aria-label="Grid" columns={{ lg: 3 }} items={[{ id: 'a', content: 'A' }]} />);
    expect(screen.getByRole('list')).toHaveClass('grid-cols-1', 'lg:grid-cols-3');
  });

  it.each([
    ['sm', 'p-4'],
    ['md', 'p-6'],
    ['lg', 'p-8'],
  ] as const)('applies %s padding to cells', (padding, cls) => {
    render(
      <CellGrid padding={padding}>
        <CellGridCell>Cell</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByText('Cell')).toHaveClass(cls);
  });
});

describe('CellGrid adoption options', () => {
  it('uses the subtle hairline on frame and cells', () => {
    render(
      <CellGrid hairline="subtle" data-testid="frame">
        <CellGridCell>Cell</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByTestId('frame')).toHaveClass('border-border-subtle');
    expect(screen.getByText('Cell')).toHaveClass('border-border-subtle');
    expect(screen.getByText('Cell')).not.toHaveClass('border-hairline');
  });

  it.each([
    ['background', 'bg-background'],
    ['card', 'bg-card'],
    ['none', 'bg-transparent'],
  ] as const)('applies the %s surface', (surface, cls) => {
    render(
      <CellGrid surface={surface}>
        <CellGridCell>Cell</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByText('Cell')).toHaveClass(cls);
  });

  it('keeps the background surface and default hairline by default', () => {
    render(
      <CellGrid>
        <CellGridCell>Cell</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByText('Cell')).toHaveClass('bg-background', 'border-hairline', 'p-6');
  });

  it('supports responsive padding', () => {
    render(
      <CellGrid padding={{ base: 'sm', md: 'md', lg: 'lg' }}>
        <CellGridCell>Cell</CellGridCell>
      </CellGrid>,
    );
    expect(screen.getByText('Cell')).toHaveClass('p-4', 'md:p-6', 'lg:p-8');
  });
  describe('hairline offset', () => {
    const paddings = ['sm', 'md', 'lg', { base: 'sm', md: 'md', lg: 'lg' }] as const;
    const hairlines = ['default', 'subtle'] as const;
    const surfaces = ['background', 'card', 'none'] as const;
    const columns = [3, { base: 1, md: 2, lg: 4 }] as const;

    for (const padding of paddings) {
      for (const hairline of hairlines) {
        for (const surface of surfaces) {
          for (const col of columns) {
            it(`keeps the -1px margins and cell hairlines for ${JSON.stringify(padding)} ${hairline} ${surface} ${JSON.stringify(col)}`, () => {
              render(
                <CellGrid aria-label="x" columns={col} padding={padding} hairline={hairline} surface={surface} items={[{ id: 'a', content: 'A' }, { id: 'b', content: 'B' }]} />,
              );
              const list = screen.getByRole('list');
              expect(list).toHaveClass('-ml-px', '-mt-px');
              expect(list.className).not.toMatch(/(^|\s)m-0(\s|$)/);
              screen.getAllByRole('listitem').forEach((cell) => expect(cell).toHaveClass('border-l', 'border-t'));
            });
          }
        }
      }
    }
  });
});
