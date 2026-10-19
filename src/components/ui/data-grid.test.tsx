import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { DataGrid, DataGridTwoLine, type DataGridColumn } from './data-grid';
import { Chip } from './chip';
import { TableBadgeCell, TableLeadCell } from './table';
import { TableActionsCell } from './table-cells';
import { DesignSystemProvider } from './design-system-provider';

interface Demand {
  id: string;
  title: string;
  applications: number;
}

const rows: Demand[] = [
  { id: 'a', title: 'Frontend', applications: 14 },
  { id: 'b', title: 'Agile Coach', applications: 0 },
  { id: 'c', title: 'Data Engineer', applications: 7 },
];

const columns: DataGridColumn<Demand>[] = [
  { id: 'title', header: 'Demand', sortable: true, sortValue: (r) => r.title },
  { id: 'applications', header: 'Applic.', align: 'right', sortable: true, sortValue: (r) => r.applications, priority: 3 },
];

const firstColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);

describe('DataGrid', () => {
  it('renders a native table from the column definition with a named caption', () => {
    render(<DataGrid label="Demands" columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getByRole('table', { name: 'Demands' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(firstColumn()).toEqual(['Frontend', 'Agile Coach', 'Data Engineer']);
    expect(screen.getByRole('columnheader', { name: /Applic/ })).toHaveClass('text-right');
  });

  it('sorts client side with aria-sort and cycles asc, desc, none', async () => {
    render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} />);
    const head = screen.getByRole('columnheader', { name: /Demand/ });
    expect(head).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(head).getByRole('button'));
    expect(head).toHaveAttribute('aria-sort', 'ascending');
    expect(firstColumn()).toEqual(['Agile Coach', 'Data Engineer', 'Frontend']);
    await userEvent.click(within(head).getByRole('button'));
    expect(head).toHaveAttribute('aria-sort', 'descending');
    expect(firstColumn()).toEqual(['Frontend', 'Data Engineer', 'Agile Coach']);
    await userEvent.click(within(head).getByRole('button'));
    expect(head).toHaveAttribute('aria-sort', 'none');
    expect(firstColumn()).toEqual(['Frontend', 'Agile Coach', 'Data Engineer']);
  });

  it('reports sort changes and leaves row order to the consumer without sortValue', async () => {
    const onSortChange = vi.fn();
    render(<DataGrid columns={[{ id: 'title', header: 'Demand', sortable: true }]} rows={rows} getRowId={(r) => r.id} onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Demand/ }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'title', direction: 'asc' });
    expect(firstColumn()).toEqual(['Frontend', 'Agile Coach', 'Data Engineer']);
  });

  it('selects rows and all rows with labelled checkboxes and an indeterminate header', async () => {
    const onSelectedIdsChange = vi.fn();
    render(<DataGrid selectable columns={columns} rows={rows} getRowId={(r) => r.id} onSelectedIdsChange={onSelectedIdsChange} />);
    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    const rowBoxes = screen.getAllByRole('checkbox', { name: 'Select row' });
    expect(rowBoxes).toHaveLength(3);
    await userEvent.click(rowBoxes[0]);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a']);
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(all);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a', 'b', 'c']);
    await userEvent.click(all);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([]);
  });

  it('selects with the keyboard and does not activate the row', async () => {
    const onRowClick = vi.fn();
    render(<DataGrid selectable columns={columns} rows={rows} getRowId={(r) => r.id} onRowClick={onRowClick} />);
    screen.getAllByRole('checkbox', { name: 'Select row' })[1].focus();
    await userEvent.keyboard(' ');
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })[1]).toBeChecked();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('makes rows actionable with Enter', async () => {
    const onRowClick = vi.fn();
    render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} onRowClick={onRowClick} getRowLabel={(r) => `Open ${r.title}`} />);
    screen.getByRole('row', { name: 'Open Frontend' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('compact density uses the compact row and drops the type a step', () => {
    render(<DataGrid density="compact" columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getByRole('table').className).toContain('typography-text-small');
    expect(screen.getAllByRole('cell')[0]).toHaveClass('h-row-compact');
  });

  it('hides low priority columns on narrow viewports via classes', () => {
    render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getByRole('columnheader', { name: /Applic/ })).toHaveClass('max-lg:hidden');
  });

  it('shows the loading, error and empty states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<DataGrid loading columns={columns} rows={[]} getRowId={(r) => r.id} />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading table data');
    rerender(<DataGrid error onRetry={onRetry} columns={columns} rows={rows} getRowId={(r) => r.id} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
    rerender(<DataGrid columns={columns} rows={[]} emptyTitle="No demands" getRowId={(r) => r.id} />);
    expect(screen.getByText('No demands')).toBeInTheDocument();
  });

  it('renders one skeleton cell per column while loading, aligned with the headers', () => {
    render(<DataGrid selectable loading loadingRows={3} columns={columns} rows={[]} getRowId={(r) => r.id} />);
    const body = screen.getAllByRole('row').slice(1);
    expect(body).toHaveLength(3);
    body.forEach((row) => expect(within(row).getAllByRole('cell')).toHaveLength(columns.length + 1));
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('keeps the footer silent on first load and announces only loadingMore', () => {
    const pagination = { pageSize: 10 };
    const { rerender } = render(<DataGrid loading columns={columns} rows={[]} getRowId={(r) => r.id} pagination={pagination} />);
    expect(screen.getByText('Loading…').closest('[aria-live]')).toHaveAttribute('aria-live', 'off');
    rerender(<DataGrid loadingMore columns={columns} rows={rows} getRowId={(r) => r.id} pagination={pagination} />);
    expect(screen.getByText('Loading…').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('pages client side and server side', async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: String(i), title: `Row ${i + 1}`, applications: i }));
    const { rerender } = render(<DataGrid columns={columns} rows={many} getRowId={(r) => r.id} pagination={{ pageSize: 10 }} />);
    expect(screen.getAllByRole('row')).toHaveLength(1 + 10 + 1);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(firstColumn().slice(0, 5)).toEqual(['Row 21', 'Row 22', 'Row 23', 'Row 24', 'Row 25']);
    const onPageChange = vi.fn();
    rerender(<DataGrid columns={columns} rows={many.slice(0, 10)} getRowId={(r) => r.id} pagination={{ pageSize: 10, total: 100, page: 1, onPageChange }} />);
    expect(screen.getAllByRole('row')).toHaveLength(1 + 10 + 1);
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('uses German labels from the provider', () => {
    render(
      <DesignSystemProvider locale="de">
        <DataGrid selectable columns={columns} rows={rows} getRowId={(r) => r.id} />
      </DesignSystemProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Alle Zeilen auswählen' })).toBeInTheDocument();
  });
});

describe('DataGrid two-line rows', () => {
  it('applies the two-line row height to every cell and renders title with subtitle', () => {
    const cols: DataGridColumn<Demand>[] = [
      { id: 'title', header: 'Demand', cell: (r) => <DataGridTwoLine title={r.title} subtitle={`${r.applications} applications`} /> },
      { id: 'applications', header: 'Applic.' },
    ];
    render(<DataGrid rowHeight="two-line" columns={cols} rows={rows} getRowId={(r) => r.id} />);
    const cells = screen.getAllByRole('cell');
    expect(cells.every((cell) => cell.classList.contains('h-row-two-line'))).toBe(true);
    expect(within(cells[0]).getByText('Frontend')).toBeInTheDocument();
    expect(within(cells[0]).getByText('14 applications')).toHaveClass('text-text-subtle');
  });

  it('keeps the single-line height by default', () => {
    render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getAllByRole('cell')[0]).not.toHaveClass('h-row-two-line');
  });
});

describe('DataGrid lazy loading', () => {
  it('offers Load more only with hasMore and onLoadMore and reports the click', async () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
    rerender(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} hasMore onLoadMore={onLoadMore} />);
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('shows a live loading status while loadingMore and no button', () => {
    render(<DataGrid columns={columns} rows={rows} getRowId={(r) => r.id} hasMore onLoadMore={() => undefined} loadingMore />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading more');
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
  });

  it('spans all columns including the select column and uses German labels', () => {
    render(
      <DesignSystemProvider locale="de">
        <DataGrid selectable columns={columns} rows={rows} getRowId={(r) => r.id} hasMore onLoadMore={() => undefined} />
      </DesignSystemProvider>,
    );
    const button = screen.getByRole('button', { name: 'Mehr laden' });
    expect(button.closest('td')).toHaveAttribute('colspan', '3');
  });
});

describe('DataGrid active row', () => {
  it('marks the active row with aria-current and the token wash, distinct from selection', () => {
    render(<DataGrid selectable defaultSelectedIds={['c']} activeRowId="b" columns={columns} rows={rows} getRowId={(r) => r.id} />);
    const [, a, b, c] = screen.getAllByRole('row');
    expect(b).toHaveAttribute('aria-current', 'true');
    expect(b).toHaveClass('bg-background-brand-subtle');
    expect(b).not.toHaveAttribute('aria-selected');
    expect(a).not.toHaveAttribute('aria-current');
    expect(c).toHaveAttribute('aria-selected', 'true');
    expect(c).not.toHaveAttribute('aria-current');
  });

  it('has no active row by default or with null', () => {
    render(<DataGrid activeRowId={null} columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });
});

describe('DataGrid custom cells', () => {
  const cols: DataGridColumn<Demand>[] = [
    { id: 'title', header: 'Demand', cell: (r) => <TableLeadCell name={r.title} supportingText="Nordlicht AG" /> },
    { id: 'status', header: 'Status', priority: 2, cell: () => <TableBadgeCell><Chip variant="success" size="small">Active</Chip></TableBadgeCell> },
    { id: 'actions', header: 'Actions', align: 'right', cell: (r) => <TableActionsCell actions={[{ label: `Edit ${r.title}`, icon: <span>i</span> }]} /> },
    { id: 'plain', header: 'Plain', cell: (r) => <span>{r.id}</span> },
  ];

  it('uses TableCell based components as the cell itself without nesting a td in a td', () => {
    const { container } = render(<DataGrid columns={cols} rows={rows} getRowId={(r) => r.id} />);
    expect(container.querySelectorAll('td td')).toHaveLength(0);
    expect(screen.getAllByRole('row')[1].querySelectorAll(':scope > td')).toHaveLength(4);
    expect(screen.getAllByRole('cell')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Edit Frontend' })).toBeInTheDocument();
  });

  it('applies column priority, alignment and row height to a returned cell component', () => {
    render(<DataGrid rowHeight="two-line" columns={cols} rows={rows} getRowId={(r) => r.id} />);
    const [lead, badge, actions, plain] = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(badge).toHaveClass('max-md:hidden');
    expect(actions).toHaveClass('text-right');
    expect([lead, badge, actions, plain].every((cell) => cell.classList.contains('h-row-two-line'))).toBe(true);
  });

  it('cellAs element lets a custom wrapper around TableCell act as the cell', () => {
    const Wrapped = ({ className }: { className?: string }) => <TableBadgeCell className={className}>x</TableBadgeCell>;
    const custom: DataGridColumn<Demand>[] = [{ id: 'a', header: 'A', cellAs: 'element', priority: 3, cell: () => <Wrapped /> }];
    const { container } = render(<DataGrid columns={custom} rows={rows} getRowId={(r) => r.id} />);
    expect(container.querySelectorAll('td td')).toHaveLength(0);
    expect(screen.getAllByRole('cell')[0]).toHaveClass('max-lg:hidden');
  });

  it('cellAs cell wraps even a cell component', () => {
    const forced: DataGridColumn<Demand>[] = [{ id: 'a', header: 'A', cellAs: 'cell', cell: () => <span>plain</span> }];
    render(<DataGrid columns={forced} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getAllByRole('cell')).toHaveLength(3);
  });
});

