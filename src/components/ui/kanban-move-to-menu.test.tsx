import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { vi } from 'vitest';

import { DesignSystemProvider } from './design-system-provider';
import { Kanban, KanbanCard, KanbanColumn } from './kanban';
import { moveToColumn } from './kanban-move';
import { KanbanMoveToMenu } from './kanban-move-to-menu';

const targets = [
  { id: 'lead', label: 'Lead' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'won', label: 'Won' },
];

const openMenu = (name: string) => fireEvent.keyDown(screen.getByRole('button', { name }), { key: 'Enter' });

describe('KanbanMoveToMenu', () => {
  it('lists every column, marks the current one disabled and moves on select', () => {
    const onMove = vi.fn();
    render(<KanbanMoveToMenu title="Data platform pilot" targets={targets} currentId="qualified" onMove={onMove} />);
    openMenu('Actions for Data platform pilot');
    expect(screen.getByText('Move to')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Qualified (current)' })).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Won' }));
    expect(onMove).toHaveBeenCalledWith('won');
  });

  it('does not hide the page around the open menu from assistive technology', () => {
    render(
      <div>
        <button type="button">Elsewhere</button>
        <KanbanMoveToMenu title="Pilot" targets={targets} currentId="lead" onMove={() => undefined} />
      </div>,
    );
    openMenu('Actions for Pilot');
    expect(screen.getByRole('menuitem', { name: 'Won' })).toBeInTheDocument();
    expect(document.querySelectorAll('[aria-hidden="true"] button:not([disabled])')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Elsewhere' }).closest('[aria-hidden="true"]')).toBeNull();
  });

  it('follows the provider locale', () => {
    render(
      <DesignSystemProvider locale="de">
        <KanbanMoveToMenu title="Pilot Datenplattform" targets={targets} currentId="lead" onMove={() => undefined} />
      </DesignSystemProvider>,
    );
    openMenu('Aktionen für Pilot Datenplattform');
    expect(screen.getByText('Verschieben nach')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Lead (aktuell)' })).toBeInTheDocument();
  });

  it('lets the labels prop win over the provider', () => {
    render(
      <DesignSystemProvider locale="de">
        <KanbanMoveToMenu title="Pilot" targets={targets} currentId="lead" onMove={() => undefined} labels={{ moveTo: 'Go to', actions: (t) => `Menu ${t}`, current: (c) => `${c} now` }} />
      </DesignSystemProvider>,
    );
    openMenu('Menu Pilot');
    expect(screen.getByText('Go to')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Lead now' })).toBeInTheDocument();
  });

  it('is accepted next to other actions in a card and the card stays free of the drag handle', () => {
    render(
      <Kanban aria-label="Pipeline" onMove={() => undefined}>
        <KanbanColumn id="lead" title="Lead">
          <KanbanCard
            id="a"
            title="Card A"
            actions={
              <>
                <button type="button">Open</button>
                <KanbanMoveToMenu title="Card A" targets={targets} currentId="lead" onMove={() => undefined} />
              </>
            }
          />
        </KanbanColumn>
      </Kanban>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actions for Card A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' }).closest('[data-kanban-handle]')).toBeNull();
  });
});

const Board = () => {
  const [cols, setCols] = useState([
    { id: 'lead', items: [{ id: 'a' }] },
    { id: 'qualified', items: [] as { id: string }[] },
    { id: 'won', items: [] as { id: string }[] },
  ]);
  return (
    <Kanban aria-label="Pipeline" onMove={() => undefined}>
      {cols.map((col) => (
        <KanbanColumn key={col.id} id={col.id} title={col.id}>
          {col.items.map((item) => (
            <KanbanCard
              key={item.id}
              id={item.id}
              title="Card A"
              actions={<KanbanMoveToMenu title="Card A" targets={targets} currentId={col.id} onMove={(to) => setCols((prev) => moveToColumn(prev, item.id, to))} />}
            />
          ))}
        </KanbanColumn>
      ))}
    </Kanban>
  );
};

describe('KanbanMoveToMenu focus and announcement after a move', () => {
  it('keeps focus on the moved card in its new column and announces the move', async () => {
    render(<Board />);
    openMenu('Actions for Card A');
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Won' }));
      await new Promise((r) => setTimeout(r, 50));
    });
    const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
    expect(card.closest('[data-column-id="won"]')).not.toBeNull();
    expect(document.activeElement).toBe(card.querySelector('[data-kanban-handle]'));
    expect(screen.getByRole('status', { hidden: true, name: '' })).toHaveTextContent('Moved to Won');
  });

  it('announces in German with the provider locale', async () => {
    render(
      <DesignSystemProvider locale="de">
        <Board />
      </DesignSystemProvider>,
    );
    openMenu('Aktionen für Card A');
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Qualified' }));
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent('Verschoben nach Qualified');
  });
});

const AsyncBoard = ({ delay }: { delay: number }) => {
  const [cols, setCols] = useState([
    { id: 'lead', items: [{ id: 'a' }] },
    { id: 'won', items: [] as { id: string }[] },
  ]);
  const move = (id: string, to: string) => {
    // The board only updates after the simulated server response.
    setTimeout(() => setCols((prev) => moveToColumn(prev, id, to)), delay);
  };
  return (
    <Kanban aria-label="Pipeline" onMove={() => undefined}>
      {cols.map((col) => (
        <KanbanColumn key={col.id} id={col.id} title={col.id}>
          {col.items.map((item) => (
            <KanbanCard
              key={item.id}
              id={item.id}
              title="Card A"
              actions={<KanbanMoveToMenu title="Card A" targets={targets.filter((t) => t.id !== 'qualified')} currentId={col.id} onMove={(to) => move(item.id, to)} />}
            />
          ))}
        </KanbanColumn>
      ))}
    </Kanban>
  );
};

describe('KanbanMoveToMenu async board update (0.17)', () => {
  it('keeps focus on the trigger while the server responds, then moves it to the card', async () => {
    render(<AsyncBoard delay={300} />);
    openMenu('Actions for Card A');
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Won' }));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions for Card A' }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });
    const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
    expect(card.closest('[data-column-id="won"]')).not.toBeNull();
    expect(document.activeElement).toBe(card.querySelector('[data-kanban-handle]'));
  });

  it('does not steal focus the user moved elsewhere while waiting', async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <AsyncBoard delay={300} />
      </>,
    );
    openMenu('Actions for Card A');
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Won' }));
      await new Promise((r) => setTimeout(r, 100));
    });
    screen.getByRole('button', { name: 'Elsewhere' }).focus();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Elsewhere' }));
  });
});
