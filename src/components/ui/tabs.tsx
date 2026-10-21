'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './../../lib/utils';
import { usePreset } from './labels-context';

/**
 * `segmented` (default): pill-in-track look, the active trigger is a raised `bg-background` chip.
 * `line`: transparent track with a hairline baseline; the active trigger gets a 2px bottom bar.
 * `segment`: segmented control with control-height triggers, the `tab` type role and an `elevation-surface` active chip.
 */
const tabsListVariants = cva('inline-flex h-10 items-center justify-center text-muted-foreground', {
  variants: {
    variant: {
      // Track padding is 3px outside zero (the 0.16 value, no spacing token exists for it) and the 2px micro token in zero (see TabsList).
      segmented: 'rounded-control bg-muted p-[3px]',
      // Segmented control (zero): 2px track padding and gap, control radius, auto height (trigger sets it).
      segment: 'h-auto justify-start gap-micro rounded-control bg-muted p-micro',
      line: 'h-auto max-w-full flex-wrap justify-start gap-x-4 rounded-none border-b border-solid border-hairline bg-transparent p-0',
      // Vertical nav list (Figma "Vertical tabs"): stacked full-width triggers. Pair with `<Tabs orientation="vertical">`.
      vertical: 'h-auto flex-col items-stretch justify-start gap-1 rounded-none bg-transparent p-0',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

// Zero preset overrides of the line list, applied after the variant classes.
const LINE_LIST_ZERO = 'gap-x-5 border-border-default';

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-background focus-visible:ring-ring-default disabled:pointer-events-none disabled:opacity-disabled data-[state=active]:text-foreground',
  {
    variants: {
      variant: {
        segmented:
          'px-3 py-[6px] text-sm leading-normal font-medium rounded-item data-[state=active]:bg-background data-[state=active]:shadow-xs',
        segment:
          'h-control-sm shrink-0 gap-gap-control rounded-item px-control-px-sm typography-tab data-[state=active]:bg-background data-[state=active]:shadow-elevation-surface',
        // Vertical tab: left aligned, 32px high, `tab` type role, brand-subtle fill when active.
        vertical:
          'h-8 w-full justify-start gap-2 rounded-item px-3 typography-tab [&>svg]:h-icon-nav [&>svg]:w-icon-nav [&>svg]:shrink-0 data-[state=active]:bg-background-brand-subtle data-[state=active]:text-general-brand-on-container',
        line: '-mb-px rounded-none border-b-2 border-solid border-transparent px-1 py-[6px] pb-2 data-[state=active]:border-foreground',
      },
      // Product preset (DesignSystemProvider `preset`). `zero` gives the line tab a 40px row with the tab role and the vertical tab the muted active row.
      preset: { default: '', zero: '' },
      size: { sm: '', md: '' },
    },
    compoundVariants: [
      { variant: 'line', preset: 'default', className: 'text-sm leading-normal font-medium' },
      // Outside zero the segmented tab is 32px, so the track (3px padding) is 38px like the segmented ToggleGroup.
      { variant: 'segmented', preset: 'default', className: 'h-8 py-0' },
      // Zero: the count span carries no margin, so the trigger gap (6px token) spaces it from the label in every variant and size.
      { variant: ['segmented', 'segment', 'line'], preset: 'zero', className: 'gap-gap-control' },
      { variant: 'line', preset: 'zero', className: 'h-10 px-0 py-0 typography-tab' },
      // Segment tab height by list size: `sm` is a 28px list in zero (24px tabs), `md` keeps the control-sm tab.
      { variant: 'segment', size: 'sm', className: 'h-control-xs' },
      { variant: 'vertical', preset: 'zero', className: 'h-nav-item data-[state=active]:bg-muted data-[state=active]:text-foreground' },
    ],
    defaultVariants: { variant: 'segmented', preset: 'default', size: 'md' },
  },
);

type TabsVariantContextValue = NonNullable<VariantProps<typeof tabsListVariants>['variant']>;

// The list owns the variant; triggers read it from context (and may override with their own prop).
const TabsVariantContext = React.createContext<TabsVariantContextValue>('segmented');
// Size of the segment list, read by the triggers.
const TabsSizeContext = React.createContext<'sm' | 'md' | undefined>(undefined);

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants> & {
      // Zero: `sm` is a 28px list (24px tabs inside 2px padding), `md` the control-sm tab, default `sm`.
      // Outside zero, segmented and segment lists: `sm` is as tall as a Button sm (32px) and `md` as a default Button (40px), with 3px track padding. Without `size` the list keeps its legacy height (segmented 38px, segment 36px).
      size?: 'sm' | 'md';
    }
>(({ className, variant, size, ...props }, ref) => {
  const zero = usePreset() === 'zero';
  // Zero: the plain list is the segmented control.
  const resolved = variant ?? (zero ? 'segment' : 'segmented');
  return (
    <TabsVariantContext.Provider value={resolved}>
      <TabsSizeContext.Provider value={size ?? (zero ? 'sm' : undefined)}>
      <TabsPrimitive.List ref={ref} className={cn(tabsListVariants({ variant: resolved }), zero && resolved === 'segmented' && 'p-micro', !zero && resolved === 'segmented' && 'h-auto',
          // Sized track outside zero: total height is the Button control token, the triggers fill it (see TabsTrigger).
          !zero && size && (resolved === 'segmented' || resolved === 'segment') && cn('p-[3px]', size === 'sm' ? 'h-control-sm' : 'h-control-md'), zero && resolved === 'line' && LINE_LIST_ZERO, className)} {...props} />
      </TabsSizeContext.Provider>
    </TabsVariantContext.Provider>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * Count slot convention: `<TabsTrigger count={3}>Open</TabsTrigger>` renders a `TabsCount` after the
 * label. Use `TabsCount` directly for custom content (e.g. `99+`). The count is muted at rest and
 * follows the trigger on the active tab (`group-data-[state=active]`). Tabular figures keep the
 * trigger width stable while the number changes.
 */
const TabsCount = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: TabsVariantContextValue;
    // `destructive` marks a count that needs attention, for example a selection or error count (Figma _Tab Badge=Count destructive).
    tone?: 'default' | 'destructive';
  }
>(({ className, variant, tone = 'default', ...props }, ref) => {
  const fromList = React.useContext(TabsVariantContext);
  const resolved = variant ?? fromList;
  const zero = usePreset() === 'zero';
  // The segmented track, the segment track and the active vertical row are bg-muted surfaces, so the count uses the on-muted role there.
  const onMuted = resolved === 'segmented' || resolved === 'segment' || resolved === 'vertical';
  const subtleCount = onMuted ? 'text-text-subtle-on-muted' : 'text-text-subtle';
  return (
    <span
      ref={ref}
      className={cn(
        zero && resolved !== 'vertical'
          ? cn('typography-kpi-label-strong tabular-nums', subtleCount)
          : resolved === 'vertical'
          ? // Pushed to the row end like a nav counter.
            cn('ml-auto typography-kpi-label-strong tabular-nums', subtleCount)
          : resolved === 'segment'
          ? // Plain-text count: the trigger gap spaces it, and it stays subtle on the active tab too.
            cn('typography-kpi-label-strong tabular-nums', subtleCount)
          : cn('ml-[6px] text-micro font-normal leading-none tabular-nums group-data-[state=active]:text-muted-foreground', subtleCount),
        tone === 'destructive' && (onMuted ? 'text-text-destructive-on-subtle group-data-[state=active]:text-text-destructive-on-subtle' : 'text-text-destructive group-data-[state=active]:text-text-destructive'),
        className,
      )}
      {...props}
    />
  );
});
TabsCount.displayName = 'TabsCount';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    Omit<VariantProps<typeof tabsTriggerVariants>, 'preset' | 'size'> & {
      /** Optional count rendered in a `TabsCount` slot after the label. `0` is rendered; `undefined`/`null` is not. */
      count?: number | string | null;
      // Tone of the count slot. `destructive` uses the destructive text role.
      countTone?: 'default' | 'destructive';
    }
>(({ className, variant, count, countTone, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement | null>(null);
  // Tabs used as a plain switch (no TabsContent at all, for example the view tabs of an action bar) must not point aria-controls at a panel that does not exist.
  // With panels, inactive tabs keep it: their panel is unmounted by design.
  React.useEffect(() => {
    const node = innerRef.current;
    const target = node?.getAttribute('aria-controls');
    if (!node || !target || node.ownerDocument.getElementById(target)) return;
    const list = node.closest('[role=tablist]');
    const root = list?.parentElement?.closest('[data-orientation]') ?? list?.parentElement;
    if (!root?.querySelector('[role=tabpanel]')) node.removeAttribute('aria-controls');
  });
  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref],
  );
  const fromList = React.useContext(TabsVariantContext);
  const listSize = React.useContext(TabsSizeContext);
  const zero = usePreset() === 'zero';
  const resolvedVariant = variant ?? fromList;
  // Sized list outside zero: the trigger fills the track height (control token minus the 3px padding).
  const fillsTrack = !zero && listSize !== undefined && (resolvedVariant === 'segmented' || resolvedVariant === 'segment');
  return (
    <TabsPrimitive.Trigger
      ref={setRefs}
      className={cn(
        'group',
        tabsTriggerVariants({ variant: resolvedVariant, preset: zero ? 'zero' : 'default', size: zero ? listSize : undefined }),
        fillsTrack && 'h-full py-0',
        className,
      )}
      {...props}
    >
      {children}
      {count != null && <TabsCount variant={variant ?? fromList} tone={countTone}>
          {count}
        </TabsCount>}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 rounded-item focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-background focus-visible:ring-ring-default',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsCount, TabsList, tabsListVariants, TabsTrigger, tabsTriggerVariants };
