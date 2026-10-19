import type { KanbanMove } from './kanban';

// A board column as plain data: the page owns the order, the Kanban only reports moves.
export interface KanbanColumnData<T extends { id: string }> {
  id: string;
  items: T[];
}

// Applies a Kanban move (drag, touch long press or keyboard). `index` counts the cards of the target column without the moved card.
export function applyKanbanMove<T extends { id: string }, C extends KanbanColumnData<T>>(columns: C[], move: KanbanMove): C[] {
  const source = columns.find((c) => c.id === move.fromColumnId);
  const card = source?.items.find((i) => i.id === move.cardId);
  if (!card || !columns.some((c) => c.id === move.toColumnId)) return columns;
  return columns.map((c) => {
    const items = c.items.filter((i) => i.id !== move.cardId);
    if (c.id !== move.toColumnId) return c.id === move.fromColumnId ? { ...c, items } : c;
    const index = Math.max(0, Math.min(move.index, items.length));
    return { ...c, items: [...items.slice(0, index), card, ...items.slice(index)] };
  });
}

// "Move to" menu: puts the card at the end of the target column. A move to its own column changes nothing.
export function moveToColumn<T extends { id: string }, C extends KanbanColumnData<T>>(columns: C[], cardId: string, toColumnId: string): C[] {
  const from = columns.find((c) => c.items.some((i) => i.id === cardId));
  const to = columns.find((c) => c.id === toColumnId);
  if (!from || !to || from.id === to.id) return columns;
  return applyKanbanMove(columns, { cardId, fromColumnId: from.id, toColumnId, index: to.items.length });
}

// Column that currently holds a card, e.g. for the current mark in the "Move to" menu.
export const kanbanColumnOf = <T extends { id: string }>(columns: KanbanColumnData<T>[], cardId: string) =>
  columns.find((c) => c.items.some((i) => i.id === cardId))?.id;
