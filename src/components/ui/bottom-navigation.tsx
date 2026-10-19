'use client';

import { Plus } from 'lucide-react';
import * as React from 'react';

import { focusRing, transitionBase } from './../../lib/recipes';
import { cn } from './../../lib/utils';
import { useLabels, usePreset } from './labels-context';

// Mobile bottom navigation (Figma "Bottom navigation" + "_Bottom navigation item"): up to five slots,
// an optional centered primary action, count badges. The marketing-only NavigationBottom composition stays as is.

const BottomNavigation = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, 'aria-label': ariaLabelProp, ...props }, ref) => {
    const l = useLabels();
    const ariaLabel = ariaLabelProp ?? l.primary;
    const zero = usePreset() === 'zero';
    return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        'flex h-16 w-full items-center justify-around gap-1 border-0 border-t border-solid bg-background-default px-2 text-text-subtle',
        zero ? 'border-border-default' : 'border-hairline',
        className,
      )}
      {...props}
    />
  );
  },
);
BottomNavigation.displayName = 'BottomNavigation';

export interface BottomNavigationItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: React.ReactNode;
  label: string;
  current?: boolean;
  /** Count badge on the icon, e.g. unread items. */
  count?: number;
  /** Renders a real button instead of a link, e.g. a "More" trigger that opens a sheet. Pass `aria-haspopup` and `aria-expanded` as needed. */
  as?: 'a' | 'button';
}

const BottomNavigationItem = React.forwardRef<HTMLAnchorElement, BottomNavigationItemProps>(
  ({ className, icon, label, current = false, count, as = 'a', ...props }, ref) => {
    const isButton = as === 'button';
    const Tag = (isButton ? 'button' : 'a') as 'a';
    // Zero: brand pill and icon for the current item, 11/500 label, 20px icons, brand count badge.
    const zero = usePreset() === 'zero';
    return (
    <Tag
      ref={ref}
      {...(isButton ? { type: 'button' as never } : null)}
      aria-current={current && !isButton ? 'page' : undefined}
      aria-label={count ? `${label}, ${count}` : undefined}
      data-current={current || undefined}
      className={cn(
        'group/item flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-control border-0 bg-transparent p-0 no-underline',
        isButton && 'cursor-pointer',
        zero ? 'typography-kpi-label-strong text-text-subtle' : 'typography-text-extra-small text-text-subtle',
        'data-[current]:text-text-default',
        transitionBase,
        focusRing,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'relative grid place-items-center rounded-full',
          zero
            ? 'h-control-sm w-10 [&>svg]:h-5 [&>svg]:w-5 group-hover/item:bg-muted group-data-[current]/item:bg-background-brand-subtle group-data-[current]/item:text-icon-brand'
            : 'h-8 w-12 [&>svg]:h-icon-lg [&>svg]:w-icon-lg group-hover/item:bg-muted group-data-[current]/item:bg-muted',
        )}
      >
        {icon}
        {count ? (
          <span
            aria-hidden
            className={cn(
              'absolute right-1 top-0 grid h-4 min-w-icon-sm place-items-center rounded-full',
              zero ? 'typography-avatar-xs bg-background-brand-bold-default px-micro text-text-on-brand' : 'typography-text-extra-small bg-background-inverse px-1 text-text-inverse',
            )}
          >
            {count}
          </span>
        ) : null}
      </span>
      <span aria-hidden={count ? true : undefined}>{label}</span>
    </Tag>
    );
  },
);
BottomNavigationItem.displayName = 'BottomNavigationItem';

export interface BottomNavigationActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name, e.g. `New`. */
  label: string;
  icon?: React.ReactNode;
}

// Centered primary action (quick create); a real button, not a destination.
const BottomNavigationAction = React.forwardRef<HTMLButtonElement, BottomNavigationActionProps>(
  ({ className, label, icon, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'grid shrink-0 place-items-center',
        'h-control-2xl w-control-2xl rounded-surface',
        zero ? 'bg-background-brand-bold-default text-text-on-brand' : 'bg-background-inverse text-text-inverse',
        transitionBase,
        'hover:opacity-90 active:opacity-80',
        focusRing,
        className,
      )}
      {...props}
    >
      {icon ?? <Plus className="h-icon-lg w-icon-lg" aria-hidden />}
    </button>
    );
  },
);
BottomNavigationAction.displayName = 'BottomNavigationAction';

export { BottomNavigation, BottomNavigationAction, BottomNavigationItem };
