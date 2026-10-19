'use client';

import { Plus } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { Chip } from './chip';
import { useLabels } from './labels-context';

export interface FilterChipItem {
  id: string;
  // "Key: value" text, for example "Status: open".
  label: string;
}

export interface FilterChipBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  // Applied filters. Plain strings are used as both id and label.
  chips: Array<FilterChipItem | string>;
  onRemove?: (id: string) => void;
  // Shows the reset link while at least one filter is applied.
  reset?: boolean;
  resetLabel?: string;
  onReset?: () => void;
  // Renders the dashed "add filter" chip when provided.
  onAdd?: () => void;
  addLabel?: string;
  // Spacing context only: in an action bar the row sits in a single line, above a list it wraps freely.
  placement?: 'in-action-bar' | 'above-list';
  // Text announced when the filter set changes to nothing.
  emptyLabel?: string;
}

const normalize = (chip: FilterChipItem | string): FilterChipItem => (typeof chip === 'string' ? { id: chip, label: chip } : chip);

const FilterChipBar = React.forwardRef<HTMLDivElement, FilterChipBarProps>(
  (
    {
      className,
      chips,
      onRemove,
      reset = true,
      resetLabel: resetLabelProp,
      onReset,
      onAdd,
      addLabel: addLabelProp,
      placement = 'above-list',
      emptyLabel: emptyLabelProp,
      'aria-label': ariaLabelProp,
      ...props
    },
    ref,
  ) => {
    const l = useLabels();
    const resetLabel = resetLabelProp ?? l.reset;
    const addLabel = addLabelProp ?? l.addFilter;
    const emptyLabel = emptyLabelProp ?? l.noFiltersApplied;
    const ariaLabel = ariaLabelProp ?? l.appliedFilters;
    const items = chips.map(normalize);
    const count = items.length;
    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        data-placement={placement}
        data-empty={count === 0 || undefined}
        className={cn('flex flex-wrap items-center gap-2', placement === 'in-action-bar' && 'flex-nowrap overflow-x-auto', className)}
        {...props}
      >
        {items.map((chip) => (
          <Chip
            key={chip.id}
            variant="outline"
            size="control"
            label={chip.label}
            removeLabel={l.removeFilter(chip.label)}
            onRemove={onRemove ? () => onRemove(chip.id) : undefined}
          />
        ))}
        {onAdd ? (
          <Chip
            size="control"
            variant="outline"
            dashed
            icon={<Plus aria-hidden="true" />}
            label={addLabel}
            onClick={onAdd}
          />
        ) : null}
        {reset && count > 0 && onReset ? (
          <Button type="button" variant="link" size="no-size" className="typography-ui text-text-brand underline-offset-4" onClick={onReset}>
            {resetLabel}
          </Button>
        ) : null}
        <span role="status" className="sr-only">
          {count === 0 ? emptyLabel : l.filtersApplied(count)}
        </span>
      </div>
    );
  },
);
FilterChipBar.displayName = 'FilterChipBar';

export { FilterChipBar };
