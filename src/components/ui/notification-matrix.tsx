'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Chip } from './chip';
import { Switch } from './switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { useLabels, usePreset } from './labels-context';

export interface NotificationMatrixProps extends HTMLAttributes<HTMLTableElement> {
  'aria-label': string;
  // Channel columns, e.g. In-app, Email.
  columns: string[];
  rowHeaderLabel?: ReactNode;
  // NotificationMatrixRow elements.
  children?: ReactNode;
}

// The selected state uses the prototype row tint instead of the neutral table selection.
const selectedRow = 'bg-background-selected-row hover:bg-background-selected-row active:bg-background-selected-row [--table-pin-tint:theme(colors.background-selected-row)]';
const selectedCell = 'bg-background-selected-row';

// Notification preferences: events as rows, channels as columns, one switch per cell.
const NotificationMatrix = forwardRef<HTMLTableElement, NotificationMatrixProps>(
  ({ className, columns, rowHeaderLabel: rowHeaderLabelProp, children, ...props }, ref) => {
    const l = useLabels();
    const rowHeaderLabel = rowHeaderLabelProp ?? l.eventColumn;
    // Zero: the header row is a muted band like the DataGrid head.
    const zero = usePreset() === 'zero';
    return (
    <Table ref={ref} stickyHeader={false} headerTone={zero ? 'muted' : 'default'} className={className} {...props}>
      <TableHeader>
        <TableRow>
          <TableHead>{rowHeaderLabel}</TableHead>
          {columns.map((c) => (
            <TableHead key={c} className="text-center">
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
  },
);
NotificationMatrix.displayName = 'NotificationMatrix';

export interface NotificationMatrixRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  // Adds a "Required" chip. Combine with readOnly cells for always on events.
  required?: boolean;
  requiredLabel?: string;
  // Selected row: brand container tint (bg-background-selected-row) with AA secondary text.
  selected?: boolean;
  // NotificationMatrixCell elements, one per column.
  children?: ReactNode;
}

const NotificationMatrixRow = forwardRef<HTMLTableRowElement, NotificationMatrixRowProps>(
  ({ className, label, description, required, requiredLabel: requiredLabelProp, selected, children, ...props }, ref) => {
    const l = useLabels();
    const requiredLabel = requiredLabelProp ?? l.required;
    return (
    <TableRow ref={ref} selected={selected} className={cn(selected && selectedRow, className)} {...props}>
      <TableCell role="rowheader" className="font-normal">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="typography-ui-medium truncate">{label}</span>
            {description ? <span className="typography-text-extra-small truncate text-muted-foreground [[data-state=selected]_&]:text-text-subtle-on-selected">{description}</span> : null}
          </div>
          {required ? <Chip variant="warning" size="small" label={requiredLabel} /> : null}
        </div>
      </TableCell>
      {children}
    </TableRow>
  );
  },
);
NotificationMatrixRow.displayName = 'NotificationMatrixRow';

export interface NotificationMatrixCellProps {
  // Accessible name, e.g. "Quote accepted, Email".
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  // Fixed value that the user cannot change (required events). Stays focusable and announced.
  readOnly?: boolean;
  disabled?: boolean;
  // Standalone selected wash for the cell, same role as a selected row.
  selected?: boolean;
  className?: string;
}

const NotificationMatrixCell = forwardRef<HTMLButtonElement, NotificationMatrixCellProps>(
  ({ label, checked, defaultChecked, onCheckedChange, readOnly, disabled, selected, className }, ref) => (
    <TableCell selected={selected} className={cn('text-center', selected && selectedCell, className)}>
      <Switch
        ref={ref}
        size="sm"
        aria-label={label}
        readOnly={readOnly}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </TableCell>
  ),
);
NotificationMatrixCell.displayName = 'NotificationMatrixCell';

export { NotificationMatrix, NotificationMatrixCell, NotificationMatrixRow };
