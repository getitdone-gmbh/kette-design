import * as React from 'react';

import { cn } from '../../../lib/utils';

// Figma "Spacer": Size 4|8|12|16|20|24|32|40|48|64|80|96 px, Direction X-axis|Y-axis (global spacing scale).
const ySize = {
  4: 'h-1',
  8: 'h-2',
  12: 'h-3',
  16: 'h-4',
  20: 'h-5',
  24: 'h-6',
  32: 'h-8',
  40: 'h-10',
  48: 'h-12',
  64: 'h-16',
  80: 'h-20',
  96: 'h-24',
} as const;

const xSize = {
  4: 'w-1',
  8: 'w-2',
  12: 'w-3',
  16: 'w-4',
  20: 'w-5',
  24: 'w-6',
  32: 'w-8',
  40: 'w-10',
  48: 'w-12',
  64: 'w-16',
  80: 'w-20',
  96: 'w-24',
} as const;

export type SpacerSize = keyof typeof ySize;

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpacerSize;
  // `y` adds vertical space (height), `x` adds horizontal space (width).
  direction?: 'x' | 'y';
}

// Empty, non-interactive block that adds a fixed gap. Prefer `gap` on the parent; use this where only one spot needs space.
const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(({ className, size = 16, direction = 'y', ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-direction={direction}
    className={cn('shrink-0', direction === 'y' ? cn('w-full', ySize[size]) : cn('self-stretch', xSize[size]), className)}
    {...props}
  />
));
Spacer.displayName = 'Spacer';

// Figma "Container spacer": Size sm 640 | md 768 | lg 1024 | xl 1280.
const containerSize = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
} as const;

export interface ContainerSpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof containerSize;
}

// Centred content column with a maximum width and the page gutter.
const ContainerSpacer = React.forwardRef<HTMLDivElement, ContainerSpacerProps>(({ className, size = 'lg', ...props }, ref) => (
  <div ref={ref} data-size={size} className={cn('mx-auto w-full px-4', containerSize[size], className)} {...props} />
));
ContainerSpacer.displayName = 'ContainerSpacer';

export { ContainerSpacer, Spacer };
