'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Inbox, Lock, Search } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

// Figma: Empty state 1182:317. Variant=First-use|No-results|Error|No-access (dashed, compact tile) and Variant=Default (sizes sm|md|lg, color, icon kind).
const emptyStateVariants = cva('flex w-full flex-col', {
  variants: {
    // center is the default. start aligns tile, text and actions to the start edge, for page level states beside left aligned content.
    align: {
      center: 'items-center text-center',
      start: 'items-start text-left',
    },
    variant: {
      default: '',
      'first-use': '',
      'no-results': '',
      error: '',
      'no-access': '',
    },
    size: {
      // Lighter than sm for small cards: tighter gap, smaller tile and title.
      xs: 'gap-3',
      sm: 'gap-6',
      md: 'gap-8',
      lg: 'gap-8',
      // Page level (404, access denied, first run of a whole page): lg spacing and tile with the page title type role.
      page: 'gap-8',
    },
  },
  compoundVariants: [
    {
      variant: ['first-use', 'no-results', 'error', 'no-access'],
      className: 'gap-2 rounded-surface border border-dashed border-border px-6 py-10',
    },
  ],
  defaultVariants: { variant: 'default', size: 'sm', align: 'center' },
});

const DEFAULT_ICONS = {
  default: Search,
  'first-use': Inbox,
  'no-results': Search,
  error: AlertCircle,
  'no-access': Lock,
} as const;

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof emptyStateVariants> {
  title: React.ReactNode;
  // Element of the title. Defaults to a paragraph; use a heading level for pages like 404 or access denied (size="page" sets the page title type role).
  // `display` sets the title in the display-sm role (32px, the closest token step to a 36px title). Default keeps the role of the size.
  titleSize?: 'default' | 'display';
  titleAs?: 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  // Text or nodes. Plain text renders as one paragraph. Pass your own paragraphs as a node (rendered in a block), or use `children` for several.
  description?: React.ReactNode;
  // Short line above the title, for example "404" or an error code.
  kicker?: React.ReactNode;
  // Further content below the description, for example additional paragraphs.
  children?: React.ReactNode;
  // Overrides the variant's default glyph. Pass null to render no icon.
  icon?: React.ReactNode;
  // Replaces the icon tile with a larger illustration (see Illustration).
  illustration?: React.ReactNode;
  // Featured icon colour for the default variant.
  tone?: 'primary' | 'gray';
  // Action buttons. Stacked and centered for the four state variants, in a row for default.
  actions?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant = 'default', size = 'sm', tone = 'gray', title, titleAs = 'p', titleSize = 'default', description, kicker, icon, illustration, actions, role, align = 'center', children, ...props }, ref) => {
    const start = align === 'start';
    const isState = variant !== 'default';
    const Fallback = DEFAULT_ICONS[variant ?? 'default'];
    const glyph = icon === undefined ? <Fallback className="h-icon-md w-icon-md" aria-hidden="true" /> : icon;
    const resolvedRole = role ?? (variant === 'error' ? 'alert' : 'status');

    const tile = illustration ? (
      illustration
    ) : glyph === null ? null : isState ? (
      <span className="flex h-avatar-md w-avatar-md items-center justify-center rounded-control bg-muted text-icon-subtle">{glyph}</span>
    ) : (
      <span
        className={cn(
          'flex items-center justify-center rounded-full border-solid text-icon-default',
          size === 'lg' || size === 'page' ? 'h-avatar-xl w-avatar-xl border-8' : size === 'xs' ? 'h-avatar-md w-avatar-md border-4' : 'h-avatar-lg w-avatar-lg border-8',
          tone === 'primary'
            ? 'border-background-brand-subtle bg-background-brand-subtle text-icon-brand'
            : 'border-border-subtle bg-background-neutral-default',
        )}
      >
        {glyph}
      </span>
    );

    const Title = titleAs;

    return (
      <div ref={ref} role={resolvedRole} className={cn(emptyStateVariants({ variant, size, align }), className)} {...props}>
        {tile}
        <div className={cn('flex w-full flex-col', start ? 'items-start' : 'items-center', isState ? 'max-w-sm gap-1' : size === 'sm' || size === 'xs' ? 'max-w-sm gap-1' : 'max-w-sm gap-2')}>
          {kicker ? (
            <p data-slot="kicker" className="typography-ui-semibold m-0 text-text-subtle">
              {kicker}
            </p>
          ) : null}
          <Title data-slot="title" className={cn('text-text-default', titleSize === 'display' ? 'typography-display-sm' : size === 'page' ? 'typography-page-title' : size === 'xs' ? 'typography-label-highlight' : isState || size === 'sm' ? 'typography-ui-lg-semibold' : 'typography-label-highlight')}>
            {title}
          </Title>
          {description ? (
            typeof description === 'string' || typeof description === 'number' ? (
              <p data-slot="description" className={cn('text-text-subtle', isState ? 'typography-ui' : 'typography-small')}>{description}</p>
            ) : (
              <div data-slot="description" className={cn('flex flex-col gap-2 text-text-subtle [&>p]:m-0', isState ? 'typography-ui' : 'typography-small')}>{description}</div>
            )
          ) : null}
          {children ? <div data-slot="content" className={cn('flex flex-col gap-2 text-text-subtle [&>p]:m-0', isState ? 'typography-ui' : 'typography-small')}>{children}</div> : null}
        </div>
        {actions ? <div className={cn('flex', isState ? 'flex-col gap-2' : cn('flex-wrap gap-3', start ? 'items-start justify-start' : 'items-center justify-center'), isState && (start ? 'items-start' : 'items-center'))}>{actions}</div> : null}
      </div>
    );
  },
);
EmptyState.displayName = 'EmptyState';

export { EmptyState, emptyStateVariants };
