'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';

const cellGridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

// Per-breakpoint maps keep every class literal so Tailwind can generate them.
const cellGridBase = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' } as const;
const cellGridSm = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' } as const;
const cellGridMd = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' } as const;
const cellGridLg = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const;

const cellGridPadding = { sm: 'p-4', md: 'p-6', lg: 'p-8' } as const;
const cellGridPaddingMd = { sm: 'md:p-4', md: 'md:p-6', lg: 'md:p-8' } as const;
const cellGridPaddingLg = { sm: 'lg:p-4', md: 'lg:p-6', lg: 'lg:p-8' } as const;

// Hairline colour for frame and cell borders. subtle is the quieter border-subtle role.
const cellGridHairline = {
  default: { frame: 'border-hairline', cell: 'border-hairline' },
  subtle: { frame: 'border-border-subtle', cell: 'border-border-subtle' },
} as const;

// Cell fill. none leaves the cell transparent so the page or a parent surface shows through.
const cellGridSurface = { background: 'bg-background', card: 'bg-card', none: 'bg-transparent' } as const;

export type CellGridPadding = keyof typeof cellGridPadding;
export type CellGridResponsivePadding = { base?: CellGridPadding; md?: CellGridPadding; lg?: CellGridPadding };

const resolvePadding = (padding: CellGridPadding | CellGridResponsivePadding) => {
  if (typeof padding === 'string') return cellGridPadding[padding];
  const { base = 'md', md, lg } = padding;
  return cn(cellGridPadding[base], md && cellGridPaddingMd[md], lg && cellGridPaddingLg[lg]);
};

export type CellGridColumnCount = keyof typeof cellGridBase;
export type CellGridResponsiveColumns = { base?: CellGridColumnCount; sm?: CellGridColumnCount; md?: CellGridColumnCount; lg?: CellGridColumnCount };

const resolveColumns = (columns: CellGridColumnCount | CellGridResponsiveColumns) => {
  if (typeof columns === 'number') return cellGridColumns[columns];
  const { base = 1, sm, md, lg } = columns;
  return cn(cellGridBase[base], sm && cellGridSm[sm], md && cellGridMd[md], lg && cellGridLg[lg]);
};

const CellGridContext = React.createContext<{ comp: 'ul' | 'div'; padding: CellGridPadding | CellGridResponsivePadding; hairline: keyof typeof cellGridHairline; surface: keyof typeof cellGridSurface }>({
  comp: 'div',
  padding: 'md',
  hairline: 'default',
  surface: 'background',
});

export interface CellGridItem {
  id: string;
  content: React.ReactNode;
}

export interface CellGridProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  // A number keeps the preset ramp (single column on mobile). An object sets columns per breakpoint, e.g. { base: 2, md: 4 }.
  columns?: CellGridColumnCount | CellGridResponsiveColumns;
  // false drops the own rounded frame and border so the grid sits flush in existing page hairlines.
  framed?: boolean;
  // Cell padding from spacing tokens. An object sets it per breakpoint, e.g. { base: 'sm', md: 'lg' }.
  padding?: CellGridPadding | CellGridResponsivePadding;
  // Hairline colour. subtle uses the quieter border-subtle role for frame and cell borders.
  hairline?: keyof typeof cellGridHairline;
  // Cell fill. background is the default, card uses the card surface, none keeps cells transparent.
  surface?: keyof typeof cellGridSurface;
  // Data-driven cells. Renders a list. Use `children` with CellGridCell for custom cells.
  items?: CellGridItem[];
  children?: React.ReactNode;
}

// Cells separated by hairlines. The hairlines are cell borders clipped by the frame, so incomplete last rows stay clean.
const CellGrid = React.forwardRef<HTMLElement, CellGridProps>(({ className, columns = 3, framed = true, padding = 'md', hairline = 'default', surface = 'background', items, children, ...props }, ref) => {
  const Comp = items ? 'ul' : 'div';
  return (
    <div className={cn('overflow-hidden', framed && cn('rounded-surface border border-solid', cellGridHairline[hairline].frame), className)} ref={ref as React.Ref<HTMLDivElement>} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      <CellGridContext.Provider value={{ comp: Comp, padding, hairline, surface }}>
        <Comp className={cn('-ml-px -mt-px mb-0 mr-0 grid list-none p-0', resolveColumns(columns))}>
          {items ? items.map((item) => <CellGridCell key={item.id}>{item.content}</CellGridCell>) : children}
        </Comp>
      </CellGridContext.Provider>
    </div>
  );
});
CellGrid.displayName = 'CellGrid';

export type CellGridCellProps = React.HTMLAttributes<HTMLElement>;

const CellGridCell = React.forwardRef<HTMLElement, CellGridCellProps>(({ className, ...props }, ref) => {
  const { comp, padding, hairline, surface } = React.useContext(CellGridContext);
  const Comp = comp === 'ul' ? 'li' : 'div';
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={cn('flex min-w-0 flex-col gap-2 border-l border-t border-solid text-text-default', cellGridHairline[hairline].cell, cellGridSurface[surface], resolvePadding(padding), className)}
      {...props}
    />
  );
});
CellGridCell.displayName = 'CellGridCell';

export { CellGrid, CellGridCell };
