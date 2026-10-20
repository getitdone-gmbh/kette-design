'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

/**
 * A disabled native element (e.g. `<Button disabled>`) never fires the pointer/focus
 * events Radix listens for, so a tooltip on a disabled trigger would silently never
 * open — the exact case this design system needs a tooltip for (explaining *why*
 * something is disabled). When the single child is `disabled`, wrap it in a focusable,
 * hoverable span and neutralize pointer-events on the child so the wrapper receives the
 * hover/focus interaction while the inner element keeps its real `disabled` semantics
 * for assistive tech.
 *
 * The wrapper is itself the focus target (not the inner disabled control), so it carries
 * the system's standard `focus-visible:ring-2 ring-ring-default` treatment — matching
 * every other interactive primitive (see `button.tsx`) — plus `role="button"
 * aria-disabled="true"` so assistive tech announces it as a disabled control rather than
 * a bare, roleless generic element.
 */
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ children, className, ...props }, ref) => {
  const child = children as React.ReactElement<{ disabled?: boolean; style?: React.CSSProperties }>;
  const isDisabled = React.isValidElement(child) && Boolean(child.props?.disabled);

  if (isDisabled) {
    return (
      <TooltipPrimitive.Trigger {...props} ref={ref} asChild>
        <span
          tabIndex={0}
          role="button"
          aria-disabled="true"
          className={cn(
            'inline-flex cursor-not-allowed rounded-control focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-background focus-visible:ring-ring-default',
            className,
          )}
        >
          {React.cloneElement(child, {
            style: { pointerEvents: 'none', ...child.props.style },
          })}
        </span>
      </TooltipPrimitive.Trigger>
    );
  }

  return (
    <TooltipPrimitive.Trigger ref={ref} className={className} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

/**
 * `motion-reduce:animate-none` (plus killing the transition and the closed-state
 * animate-out variant) gives `prefers-reduced-motion: reduce` users an instant
 * show/hide instead of the slide/zoom/fade — Radix still drives open/close via the
 * `data-state` attribute, so visibility itself is unaffected, only the motion is.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    // `light` uses the popover surface with a hairline border (Figma Theme=Light); default stays the inverse surface.
    tone?: 'dark' | 'light';
    // Second, muted line under the content (Figma Supporting text=True).
    supportingText?: React.ReactNode;
  }
>(({ className, sideOffset = 4, tone = 'dark', supportingText, children, ...props }, ref) => {
  const zero = usePreset() === 'zero';
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      data-tone={tone}
      className={cn(
        // Inverse surface (foreground on background), no border or heavy shadow.
        'z-tooltip overflow-hidden bg-foreground text-background animate-in fade-in-0 zoom-in-[0.98] duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:animate-none motion-reduce:transition-none motion-reduce:data-[state=closed]:animate-none',
        zero ? 'rounded-control px-3 py-2 typography-ui-sm shadow-elevation-raised' : 'rounded-item px-2 py-1 text-xs font-medium',
        tone === 'light' && 'border border-solid bg-popover text-popover-foreground',
        tone === 'light' && (zero ? 'border-border-default shadow-elevation-raised' : 'border-hairline shadow-popover'),
        className,
      )}
      {...props}
    >
      {supportingText ? (
        <div className="flex flex-col gap-1">
          <span>{children}</span>
          <span className={cn('font-normal', tone === 'light' && 'text-text-subtle')}>{supportingText}</span>
        </div>
      ) : (
        children
      )}
    </TooltipPrimitive.Content>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow ref={ref} className={cn('fill-foreground', className)} {...props} />
));
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

export { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger };
