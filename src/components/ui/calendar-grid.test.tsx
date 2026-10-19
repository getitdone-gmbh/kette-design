import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { contrast, loadThemes } from '../../lib/token-contrast';
import { MonthGrid, MonthGridCell, WeekGrid, WeekGridCell, WeekGridEntry, WeekGridRow, WeekGridTotals } from './calendar-grid';

const columns = [
  { id: 'mon', label: 'Mon 6' },
  { id: 'tue', label: 'Tue 7', today: true },
];

const Week = (props: Partial<React.ComponentProps<typeof WeekGrid>>) => (
  <WeekGrid aria-label="Week 41" columns={columns} rowHeaderLabel="Project" totalLabel="Total" {...props}>
    <WeekGridRow header="Website relaunch" total="14:30">
      <WeekGridCell>
        <WeekGridEntry project={1}>8:00 h</WeekGridEntry>
      </WeekGridCell>
      <WeekGridCell>
        <WeekGridEntry tone="error" selected onClick={() => {}}>
          6:30 h
        </WeekGridEntry>
      </WeekGridCell>
    </WeekGridRow>
    <WeekGridTotals values={['8:00', '6:30']} total="14:30" />
  </WeekGrid>
);

describe('WeekGrid', () => {
  it('renders a named table with column and row headers', () => {
    render(<Week />);
    expect(screen.getByRole('table', { name: 'Week 41' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tue 7' })).toHaveAttribute('aria-current', 'date');
    expect(screen.getByRole('rowheader', { name: 'Website relaunch' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Total' })).toBeInTheDocument();
  });

  it('renders a static entry as text and an interactive entry as a toggle button', async () => {
    const onClick = vi.fn();
    render(
      <WeekGrid aria-label="w" columns={columns}>
        <WeekGridRow header="r">
          <WeekGridCell>
            <WeekGridEntry>8:00 h</WeekGridEntry>
          </WeekGridCell>
          <WeekGridCell>
            <WeekGridEntry selected={false} onClick={onClick}>
              6:30 h
            </WeekGridEntry>
          </WeekGridCell>
        </WeekGridRow>
      </WeekGrid>,
    );
    expect(screen.queryByRole('button', { name: '8:00 h' })).toBeNull();
    const btn = screen.getByRole('button', { name: '6:30 h' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('keeps the tone as data attribute and marks selection', () => {
    render(<Week />);
    const btn = screen.getByRole('button', { name: '6:30 h' });
    expect(btn).toHaveAttribute('data-tone', 'error');
    expect(btn).toHaveAttribute('data-selected', 'true');
  });

  it('renders loading as busy with a status', () => {
    const { container } = render(<Week state="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading week');
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Website relaunch')).toBeNull();
  });

  it('renders empty with action', () => {
    render(<Week state="empty" emptyAction={<button>Log time</button>} />);
    expect(screen.getByText('No entries this week')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log time' })).toBeInTheDocument();
  });

  it('renders error with retry', async () => {
    const onRetry = vi.fn();
    render(<Week state="error" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Week not loaded');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

const Month = (props: Partial<React.ComponentProps<typeof MonthGrid>>) => (
  <MonthGrid aria-label="October" {...props}>
    {Array.from({ length: 14 }, (_, i) => (
      <MonthGridCell
        key={i}
        day={i + 1}
        label={`Day ${i + 1}`}
        outside={i === 0}
        today={i === 2}
        selected={i === 3 ? true : undefined}
        note={i === 4 ? 'Vacation' : undefined}
        onSelectDay={i === 5 ? () => {} : undefined}
      >
        {i === 3 ? <WeekGridEntry>8:00 h</WeekGridEntry> : null}
      </MonthGridCell>
    ))}
  </MonthGrid>
);

describe('MonthGrid', () => {
  it('renders a grid with weekday headers and rows of seven', () => {
    render(<Month />);
    expect(screen.getByRole('grid', { name: 'October' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByRole('gridcell')).toHaveLength(14);
  });

  it('marks today, selection and notes', () => {
    render(<Month />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[2]).toHaveAttribute('aria-current', 'date');
    expect(cells[3]).toHaveAttribute('aria-selected', 'true');
    expect(within(cells[4]).getByText('Vacation')).toBeInTheDocument();
  });

  it('makes a day selectable by keyboard', async () => {
    const onSelect = vi.fn();
    render(
      <MonthGrid aria-label="m">
        <MonthGridCell day={6} label="Sixth" onSelectDay={onSelect} />
      </MonthGrid>,
    );
    screen.getByRole('button', { name: 'Sixth' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders loading, empty and error states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<Month state="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading month');
    rerender(<Month state="empty" />);
    expect(screen.getByText('No entries in this month')).toBeInTheDocument();
    rerender(<Month state="error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('MonthGridCell sizing', () => {
  it('uses a min-height instead of a fixed height so content can grow', () => {
    render(<MonthGridCell day={3} label="Third" />);
    const cell = screen.getByRole('gridcell');
    expect(cell.className).toMatch(/min-h-\[theme\(height\.month-cell\)\]/);
    expect(cell).not.toHaveClass('h-month-cell');
  });
});

describe('WeekGrid layout', () => {
  it('scrolls inside the container with a sticky first column and day column minimum widths', () => {
    render(<Week />);
    const table = screen.getByRole('table', { name: 'Week 41' });
    expect(table).toHaveClass('min-w-max', 'table-auto');
    expect(table).not.toHaveClass('table-fixed');
    expect(screen.getByRole('columnheader', { name: 'Project' })).toHaveClass('sticky', 'left-0', 'z-sticky');
    expect(screen.getByRole('columnheader', { name: 'Mon 6' })).toHaveClass('w-24');
    expect(screen.getByRole('rowheader', { name: 'Website relaunch' })).toHaveClass('sticky', 'left-0', 'z-sticky', 'bg-card');
    expect(screen.getByRole('rowheader', { name: 'Total' })).toHaveClass('sticky', 'bg-muted');
  });
});

describe('WeekGridCell onAdd', () => {
  it('renders an accessible add button in an empty cell', async () => {
    const onAdd = vi.fn();
    render(<WeekGridCell onAdd={onAdd} />, { wrapper: ({ children }) => <table><tbody><tr>{children}</tr></tbody></table> });
    await userEvent.click(screen.getByRole('button', { name: 'Add entry' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('prefers addLabel and hides the button when the cell has entries', () => {
    render(
      <table>
        <tbody>
          <tr>
            <WeekGridCell onAdd={() => {}} addLabel="Log time, Mon" />
            <WeekGridCell onAdd={() => {}}>
              <WeekGridEntry>1 h</WeekGridEntry>
            </WeekGridCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Log time, Mon' })).toBeInTheDocument();
  });
});

describe('MonthGridCell onAdd', () => {
  it('adds without selecting the day and names the date', async () => {
    const onAdd = vi.fn();
    const onSelectDay = vi.fn();
    render(
      <MonthGrid aria-label="October">
        <MonthGridCell day={3} label="Thursday 3 October" onAdd={onAdd} onSelectDay={onSelectDay} />
      </MonthGrid>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add entry, Thursday 3 October' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onSelectDay).not.toHaveBeenCalled();
  });
});

describe('WeekGridEntry colour and focus', () => {
  it('accepts a CSS colour or a token utility as dotColor, winning over project', () => {
    render(
      <>
        <WeekGridEntry project={2} dotColor="#e11d48">css</WeekGridEntry>
        <WeekGridEntry dotColor="bg-data-project-5">token</WeekGridEntry>
        <WeekGridEntry project={2}>slot</WeekGridEntry>
      </>,
    );
    const dots = document.querySelectorAll<HTMLElement>('[data-entry-dot]');
    expect(dots[0].style.backgroundColor).toBe('rgb(225, 29, 72)');
    expect(dots[0]).not.toHaveClass('bg-data-project-2');
    expect(dots[1]).toHaveClass('bg-data-project-5');
    expect(dots[2]).toHaveClass('bg-data-project-2');
  });

  it('shows the token focus ring on an interactive entry', () => {
    render(<WeekGridEntry onClick={() => {}}>1 h</WeekGridEntry>);
    expect(screen.getByRole('button')).toHaveClass('focus-visible:ring-focus', 'focus-visible:ring-ring-default');
  });
});

describe('MonthGrid week totals and holiday', () => {
  it('adds a total column header and one total cell per week row', () => {
    render(
      <MonthGrid aria-label="October" weekTotals={['40:00', '8:00']}>
        {Array.from({ length: 14 }, (_, i) => (
          <MonthGridCell key={i} day={i + 1} />
        ))}
      </MonthGrid>,
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(8);
    expect(screen.getByRole('columnheader', { name: 'Week total' })).toBeInTheDocument();
    expect(screen.getByText('40:00')).toHaveAttribute('role', 'gridcell');
    expect(screen.getAllByRole('gridcell')).toHaveLength(16);
  });

  it('renders no total column without weekTotals', () => {
    render(<MonthGrid aria-label="m"><MonthGridCell day={1} /></MonthGrid>);
    expect(screen.queryByRole('columnheader', { name: 'Week total' })).not.toBeInTheDocument();
  });

  it('marks a holiday and announces it without a note', () => {
    render(
      <MonthGrid aria-label="m">
        <MonthGridCell day={3} holiday />
        <MonthGridCell day={4} holiday note="Unity" />
      </MonthGrid>,
    );
    const [a, b] = screen.getAllByRole('gridcell');
    expect(a).toHaveAttribute('data-holiday', 'true');
    expect(a).toHaveClass('bg-general-warning-container');
    expect(within(a).getByText('Holiday,')).toHaveClass('sr-only');
    expect(within(b).queryByText('Holiday,')).not.toBeInTheDocument();
  });
});

describe('WeekGrid day-columns layout', () => {
  const dayColumns = (
    <WeekGrid aria-label="Week" layout="day-columns" columns={[{ id: 'mon', label: 'Mon' }, { id: 'tue', label: 'Tue', today: true }]}>
      <WeekGridRow>
        <WeekGridCell>
          <WeekGridEntry>A</WeekGridEntry>
          <WeekGridEntry>B</WeekGridEntry>
        </WeekGridCell>
        <WeekGridCell onAdd={() => {}} addLabel="Add Tue" />
      </WeekGridRow>
      <WeekGridTotals values={['2', '0']} />
    </WeekGrid>
  );

  it('has one column header per day and no row header column', () => {
    render(dayColumns);
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tue' })).toHaveAttribute('aria-current', 'date');
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'day-columns');
  });

  it('stacks the entries of a day from the top', () => {
    render(dayColumns);
    const cell = screen.getByText('A').closest('td') as HTMLElement;
    expect(cell).toHaveClass('align-top');
    expect(cell.firstElementChild).toHaveClass('flex-col');
    expect(screen.getByRole('button', { name: 'Add Tue' })).toBeInTheDocument();
  });

  it('keeps the row layout by default', () => {
    render(<Week />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'rows');
    expect(screen.getByRole('rowheader', { name: 'Website relaunch' })).toBeInTheDocument();
  });
});

describe('MonthGrid weekdaysOnly (0.15)', () => {
  const renderWeeks = (props: Partial<React.ComponentProps<typeof MonthGrid>> = {}) =>
    render(
      <MonthGrid aria-label="October" weekdaysOnly {...props}>
        {Array.from({ length: 14 }, (_, i) => (
          <MonthGridCell key={i} day={i + 1} label={`Day ${i + 1}`} />
        ))}
      </MonthGrid>,
    );

  it('hides Saturday and Sunday columns and cells', () => {
    renderWeeks();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    expect(screen.getAllByRole('gridcell')).toHaveLength(10);
    expect(screen.queryByText('6')).toBeNull();
    expect(screen.queryByText('7')).toBeNull();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('keeps the caller supplied week totals and uses a five day row grid', () => {
    const { container } = renderWeeks({ weekTotals: ['40:00', '8:00'] });
    expect(screen.getByText('40:00')).toBeInTheDocument();
    expect(screen.getByText('8:00')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(6);
    expect(container.querySelector('[role="row"]')?.className).toContain('repeat(5,');
  });

  it('shows five placeholder columns while loading', () => {
    const { container } = renderWeeks({ state: 'loading', placeholderRows: 2 });
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(10);
  });

  it('keeps seven columns by default', () => {
    render(<MonthGrid aria-label="m"><MonthGridCell day={1} /></MonthGrid>);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });
});

describe('MonthGridCell today indicator (0.17)', () => {
  it('fills an inverse circle around the date number and sets aria-current on the cell', () => {
    render(
      <MonthGrid aria-label="m">
        <MonthGridCell day={14} label="Thursday 14 March" today />
        <MonthGridCell day={15} label="Friday 15 March" />
      </MonthGrid>,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveAttribute('aria-current', 'date');
    expect(cells[1]).not.toHaveAttribute('aria-current');
    expect(screen.getByText('14')).toHaveClass('rounded-full', 'bg-background-inverse', 'text-text-inverse', 'font-semibold');
    expect(screen.getByText('15')).not.toHaveClass('rounded-full');
  });

  it('keeps the inverse text on today even for holidays and outside days', () => {
    render(
      <MonthGrid aria-label="m">
        <MonthGridCell day={1} today holiday outside />
      </MonthGrid>,
    );
    const day = screen.getByText('1', { exact: false });
    expect(day).toHaveClass('text-text-inverse');
    expect(day).not.toHaveClass('text-general-warning-on-container', 'text-muted-foreground', 'text-foreground');
  });

  it.each(loadThemes().flatMap((t) => [[t.name, 'light', t.light] as const, [t.name, 'dark', t.dark] as const]))(
    '%s %s: the today number is at least 4.5:1 on the inverse fill',
    (_name, _mode, tokens) => {
      expect(contrast(tokens['text-inverse'], tokens['background-inverse'])).toBeGreaterThanOrEqual(4.5);
    },
  );
});
