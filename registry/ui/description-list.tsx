'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useLabels } from '@/components/ui/labels-context';
import { LogoTile, type LogoTileColor } from '@/components/ui/logo-tile';

// Figma: Attributes 10152:343821 (variant aside|sheet|compact, readonly) and SummaryList 10152:343061 (values|with-total). Both are <dl> lists with loading, empty and error states.
export type DescriptionListState = 'ready' | 'loading' | 'empty' | 'error';

interface StateProps {
  state?: DescriptionListState;
  // Replaces the default empty panel.
  emptyState?: React.ReactNode;
  // Replaces the default error panel.
  errorState?: React.ReactNode;
  // Number of placeholder rows while loading.
  loadingRows?: number;
}

const DescriptionListStatus = ({
  state,
  emptyState,
  errorState,
  loadingRows = 5,
  label,
}: StateProps & { label: string }): React.ReactElement | null => {
  const l = useLabels();
  if (state === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-label={l.loadingItem(label)} className="flex flex-col gap-3">
        {Array.from({ length: loadingRows }, (_, i) => (
          <div key={i} className="flex items-center gap-3" aria-hidden="true">
            <span className="block h-3 w-16 rounded-item bg-overlay-skeleton-subtle motion-reduce:animate-none" />
            <span className="block h-3 w-32 rounded-item bg-overlay-skeleton-default motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    );
  }
  if (state === 'empty') {
    return <>{emptyState ?? <EmptyState variant="first-use" title={l.noItemsYet(label)} />}</>;
  }
  if (state === 'error') {
    return (
      <>
        {errorState ?? (
          <EmptyState
            variant="error"
            title={l.itemNotLoaded(label)}
            description={l.tryAgainInAMoment}
            className="border-solid border-border-destructive [&_[data-slot=title]]:text-text-destructive"
          />
        )}
      </>
    );
  }
  return null;
};

const attributesVariants = cva('flex w-full flex-col', {
  variants: {
    variant: {
      aside: 'gap-3',
      sheet: 'gap-3',
      compact: 'gap-2',
    },
  },
  defaultVariants: { variant: 'aside' },
});

// Label column: a third of the row, so long labels wrap (break-words, hyphens-auto with lang) instead of running into the value. Variants differ in row gap only.
const labelWidth = { aside: 'w-1/3', sheet: 'w-1/3', compact: 'w-1/3' } as const;

interface AttributesContextValue {
  variant: keyof typeof labelWidth;
  divided: boolean;
}
const AttributesContext = React.createContext<AttributesContextValue>({ variant: 'aside', divided: false });

export interface AttributesProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof attributesVariants>,
    StateProps {
  // Section heading such as "Details".
  title?: React.ReactNode;
  // Hairlines between rows (read-only description list).
  divided?: boolean;
  // Used in the loading and default empty/error copy, e.g. "details".
  noun?: string;
}

const Attributes = React.forwardRef<HTMLElement, AttributesProps>(
  ({ className, variant = 'aside', title, divided = false, state = 'ready', noun = 'details', emptyState, errorState, loadingRows, children, ...props }, ref) => {
    const resolved = variant ?? 'aside';
    const headingId = React.useId();
    return (
      <section
        ref={ref}
        aria-labelledby={title ? headingId : undefined}
        className={cn('flex w-full flex-col gap-3', className)}
        {...props}
      >
        {title ? (
          <h3 id={headingId} className="typography-ui-medium text-text-subtle">
            {title}
          </h3>
        ) : null}
        {state === 'ready' ? (
          <AttributesContext.Provider value={{ variant: resolved, divided }}>
            <dl className={cn(attributesVariants({ variant: resolved }), divided && 'gap-0')}>{children}</dl>
          </AttributesContext.Provider>
        ) : (
          <DescriptionListStatus state={state} label={noun} emptyState={emptyState} errorState={errorState} loadingRows={loadingRows} />
        )}
      </section>
    );
  },
);
Attributes.displayName = 'Attributes';

// Figma _Attribute value Type=Text | Chip | Avatar | Logo | Input | Tags.
export type AttributeValueType = 'text' | 'chip' | 'avatar' | 'logo' | 'input' | 'tags';

export interface AttributeValueProps {
  type?: AttributeValueType;
  // Text, chip label, or the name next to an avatar or logo. Initial text of an input.
  value?: string;
  // Chips for `type="tags"`.
  tags?: string[];
  // Image of an avatar.
  src?: string;
  // Initials of an avatar fallback or logo tile.
  initials?: string;
  // Project colour of a logo tile.
  logoColor?: LogoTileColor;
  // Accessible name of an input value. Defaults to the row label when it is a string.
  inputLabel?: string;
  onValueChange?: (value: string) => void;
  onCommit?: (value: string) => void;
}

const AttributeValue = ({ type = 'text', value, tags, src, initials, logoColor, inputLabel, onValueChange, onCommit }: AttributeValueProps): React.ReactElement | null => {
  if (type === 'chip') {
    return (
      <Chip variant="outline" size="small">
        {value}
      </Chip>
    );
  }
  if (type === 'avatar') {
    return (
      <span className="inline-flex items-center gap-2">
        <Avatar size="xs">
          {src ? <AvatarImage src={src} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="truncate">{value}</span>
      </span>
    );
  }
  if (type === 'logo') {
    return (
      <span className="inline-flex items-center gap-2">
        <LogoTile initials={initials ?? ''} color={logoColor} />
        <span className="truncate">{value}</span>
      </span>
    );
  }
  if (type === 'input') {
    return <InlineEdit aria-label={inputLabel ?? ''} defaultValue={value} onValueChange={onValueChange} onCommit={onCommit} />;
  }
  if (type === 'tags') {
    return (
      <span className="flex flex-wrap items-center gap-1">
        {(tags ?? []).map((t) => (
          <Chip key={t} variant="outline" size="small">
            {t}
          </Chip>
        ))}
      </span>
    );
  }
  return <>{value}</>;
};
AttributeValue.displayName = 'AttributeValue';

export interface AttributeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, AttributeValueProps {
  label: React.ReactNode;
  // Text, chip, avatar, input or tag list. Optional when `type` and `value`/`tags` describe a typed value.
  children?: React.ReactNode;
}

const Attribute = React.forwardRef<HTMLDivElement, AttributeProps>(
  ({ className, label, children, type, value, tags, src, initials, logoColor, inputLabel, onValueChange, onCommit, ...props }, ref) => {
    const { variant, divided } = React.useContext(AttributesContext);
    const typed = children === undefined && (type !== undefined || value !== undefined || tags !== undefined);
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3', divided && 'border-b border-solid border-border py-2', className)}
        {...props}
      >
        <dt className={cn('typography-ui shrink-0 break-words hyphens-auto text-text-subtle', labelWidth[variant])}>{label}</dt>
        <dd className="typography-ui m-0 min-w-0 flex-1 text-text-default">
          {typed ? (
            <AttributeValue
              type={type}
              value={value}
              tags={tags}
              src={src}
              initials={initials}
              logoColor={logoColor}
              inputLabel={inputLabel ?? (typeof label === 'string' ? label : undefined)}
              onValueChange={onValueChange}
              onCommit={onCommit}
            />
          ) : (
            children
          )}
        </dd>
      </div>
    );
  },
);
Attribute.displayName = 'Attribute';

export interface SummaryListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'children'>, StateProps {
  children?: React.ReactNode;
  noun?: string;
}

// Key/value amounts, values right aligned. Add a SummaryListRow total for the with-total variant.
const SummaryList = React.forwardRef<HTMLDListElement, SummaryListProps>(
  ({ className, state = 'ready', noun = 'amounts', emptyState, errorState, loadingRows = 4, children, ...props }, ref) =>
    state === 'ready' ? (
      <dl ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        {children}
      </dl>
    ) : (
      <DescriptionListStatus state={state} label={noun} emptyState={emptyState} errorState={errorState} loadingRows={loadingRows} />
    ),
);
SummaryList.displayName = 'SummaryList';

export interface SummaryListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  // Emphasised closing row with a hairline above.
  total?: boolean;
}

const SummaryListRow = React.forwardRef<HTMLDivElement, SummaryListRowProps>(({ className, label, value, total = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-baseline justify-between gap-4',
      total && 'mt-1 border-t border-solid border-border pt-3',
      className,
    )}
    {...props}
  >
    <dt className={cn(total ? 'typography-ui-lg-semibold text-text-default' : 'typography-ui text-text-subtle')}>{label}</dt>
    <dd className={cn('m-0 tabular-nums', total ? 'typography-ui-lg-semibold text-text-default' : 'typography-ui text-text-default')}>{value}</dd>
  </div>
));
SummaryListRow.displayName = 'SummaryListRow';

export { Attribute, AttributeValue, Attributes, SummaryList, SummaryListRow, attributesVariants };
