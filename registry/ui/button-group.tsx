'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

// Figma ButtonGroup (Icon False|Leading|Only) and _ButtonGroupBase (Current, Icon False|Leading|Only|Dot, State).
// Geometry follows the Pagination button group segments: control-md height, input border, surface shadow, control radius.
export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(({ className, role = 'group', ...props }, ref) => {
  const zero = usePreset() === 'zero';
  return (
    <div
      ref={ref}
      role={role}
      className={cn(
        'isolate inline-flex items-stretch overflow-hidden rounded-control border border-solid border-input bg-background shadow-elevation-surface',
        // Zero: the outer border is part of the control height, so the group is exactly control-md high.
        zero && 'h-control-md',
        className,
      )}
      {...props}
    />
  );
});
ButtonGroup.displayName = 'ButtonGroup';

export interface ButtonGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  // Marks the active segment (Figma Current=True): muted fill and `aria-pressed`.
  current?: boolean;
  // Leading icon (Figma Icon=Leading). With no children the segment becomes square (Icon=Only).
  icon?: React.ReactNode;
  // Leading status dot (Figma Icon=Dot).
  dotLeading?: boolean;
}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, asChild = false, current, icon, dotLeading = false, children, type, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    const iconOnly = Boolean(icon) && !children;
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        aria-pressed={current === undefined ? undefined : current}
        data-current={current || undefined}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 border-r border-solid border-input bg-background text-text-default transition-colors last:border-r-0',
          'hover:bg-muted active:bg-muted-strong',
          'data-[current]:bg-muted',
          'disabled:pointer-events-none disabled:text-text-disabled aria-disabled:pointer-events-none aria-disabled:text-text-disabled',
          zero ? 'typography-button-md' : 'typography-label',
          zero ? 'h-full' : 'h-control-md',
          iconOnly ? 'w-control-md' : zero ? 'px-control-px-md' : 'px-4',
          // Focus ring sits inside the segment so the group's overflow clip never cuts it.
          ...focusRing,
          'focus-visible:z-10 focus-visible:ring-inset focus-visible:ring-offset-0',
          className,
        )}
        {...props}
      >
        {dotLeading && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />}
        {!dotLeading && icon && (
          <span aria-hidden="true" className="inline-flex h-icon-md w-icon-md shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        {children}
      </Comp>
    );
  },
);
ButtonGroupItem.displayName = 'ButtonGroupItem';

export { ButtonGroup, ButtonGroupItem };
