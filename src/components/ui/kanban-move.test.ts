import { describe, expect, it } from 'vitest';

import { applyKanbanMove, kanbanColumnOf, moveToColumn } from './kanban-move';

const board = () => [
  { id: 'lead', items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'won', items: [{ id: 'c' }] },
];

describe('applyKanbanMove', () => {
  it('moves across columns at the index, counted without the moved card, and keeps the input untouched', () => {
    const input = board();
    const next = applyKanbanMove(input, { cardId: 'a', fromColumnId: 'lead', toColumnId: 'won', index: 0 });
    expect(next[0].items.map((i) => i.id)).toEqual(['b']);
    expect(next[1].items.map((i) => i.id)).toEqual(['a', 'c']);
    expect(input).toEqual(board());
  });

  it('reorders inside a column', () => {
    const next = applyKanbanMove(board(), { cardId: 'a', fromColumnId: 'lead', toColumnId: 'lead', index: 1 });
    expect(next[0].items.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('clamps the index and ignores unknown cards or columns', () => {
    const input = board();
    expect(applyKanbanMove(input, { cardId: 'a', fromColumnId: 'lead', toColumnId: 'won', index: 99 })[1].items.map((i) => i.id)).toEqual(['c', 'a']);
    expect(applyKanbanMove(input, { cardId: 'x', fromColumnId: 'lead', toColumnId: 'won', index: 0 })).toBe(input);
    expect(applyKanbanMove(input, { cardId: 'a', fromColumnId: 'lead', toColumnId: 'nope', index: 0 })).toBe(input);
  });
});

describe('moveToColumn', () => {
  it('appends to the target column', () => {
    const next = moveToColumn(board(), 'a', 'won');
    expect(next[1].items.map((i) => i.id)).toEqual(['c', 'a']);
  });

  it('changes nothing for the own column or unknown ids', () => {
    const input = board();
    expect(moveToColumn(input, 'a', 'lead')).toBe(input);
    expect(moveToColumn(input, 'zzz', 'won')).toBe(input);
    expect(moveToColumn(input, 'a', 'zzz')).toBe(input);
  });
});

describe('kanbanColumnOf', () => {
  it('finds the column that holds a card', () => {
    expect(kanbanColumnOf(board(), 'c')).toBe('won');
    expect(kanbanColumnOf(board(), 'x')).toBeUndefined();
  });
});
