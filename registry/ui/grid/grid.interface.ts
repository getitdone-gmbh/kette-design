import { ReactNode } from 'react';

export type GridColumn = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps {
  columns?: {
    [key in Breakpoint]?: GridColumn;
  };
  style?: React.CSSProperties;
  children?: ReactNode;
  className?: string;
}

export interface GridItemProps {
  colSpan?: {
    [key in Breakpoint]?: GridColSpan;
  };
  children?: ReactNode;
}
