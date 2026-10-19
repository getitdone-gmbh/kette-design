import { ReactNode } from 'react';

export interface ListProps {
  children: ReactNode;
  type: 'numeric' | 'bullet' | 'alphabetical' | 'history';
}

export interface ListItemProps {
  children: ReactNode;
}
