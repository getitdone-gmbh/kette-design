import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FilterChipBar } from './filter-chip-bar';

describe('FilterChipBar', () => {
  it('lists applied filters in a named group', () => {
    render(<FilterChipBar chips={['Status: open', { id: 'c', label: 'Client: Nordlicht' }]} />);
    expect(screen.getByRole('group', { name: 'Applied filters' })).toBeInTheDocument();
    expect(screen.getByText('Status: open')).toBeInTheDocument();
    expect(screen.getByText('Client: Nordlicht')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 filters applied');
  });

  it('removes a filter by id', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FilterChipBar chips={[{ id: 'a', label: 'Status: open' }]} onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Remove filter Status: open' }));
    expect(onRemove).toHaveBeenCalledWith('a');
  });

  it('shows Reset only with filters and a handler', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const { rerender } = render(<FilterChipBar chips={['A']} onReset={onReset} />);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalled();
    rerender(<FilterChipBar chips={[]} onReset={onReset} />);
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
    rerender(<FilterChipBar chips={['A']} onReset={onReset} reset={false} />);
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('empty state announces and offers the dashed add chip', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const { container } = render(<FilterChipBar chips={[]} onAdd={onAdd} />);
    expect(container.firstChild).toHaveAttribute('data-empty', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('No filters applied');
    const add = screen.getByRole('button', { name: 'Add filter' });
    expect(add).toHaveClass('border-dashed');
    await user.click(add);
    expect(onAdd).toHaveBeenCalled();
  });

  it('add chip is keyboard operable', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<FilterChipBar chips={[]} onAdd={onAdd} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('supports the in-action-bar placement', () => {
    const { container } = render(<FilterChipBar chips={['A']} placement="in-action-bar" />);
    expect(container.firstChild).toHaveClass('flex-nowrap');
  });
});
