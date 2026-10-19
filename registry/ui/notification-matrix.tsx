'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLabels, usePreset } from '@/components/ui/labels-context';

export interface NotificationMatrixProps extends HTMLAttributes<HTMLTableElement> {
  'aria-label': string;
  // Channel columns, e.g. In-app, Email.
  columns: string[];
  rowHeaderLabel?: ReactNode;
  // NotificationMatrixRow elements.
  children?: ReactNode;
}

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
  // NotificationMatrixCell elements, one per column.
  children?: ReactNode;
}

const NotificationMatrixRow = forwardRef<HTMLTableRowElement, NotificationMatrixRowProps>(
  ({ className, label, description, required, requiredLabel: requiredLabelProp, children, ...props }, ref) => {
    const l = useLabels();
    const requiredLabel = requiredLabelProp ?? l.required;
    return (
    <TableRow ref={ref} className={className} {...props}>
      <TableCell role="rowheader" className="font-normal">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="typography-ui-medium truncate">{label}</span>
            {description ? <span className="typography-text-extra-small truncate text-muted-foreground">{description}</span> : null}
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
  className?: string;
}

const NotificationMatrixCell = forwardRef<HTMLButtonElement, NotificationMatrixCellProps>(
  ({ label, checked, defaultChecked, onCheckedChange, readOnly, disabled, className }, ref) => (
    <TableCell className={cn('text-center', className)}>
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
