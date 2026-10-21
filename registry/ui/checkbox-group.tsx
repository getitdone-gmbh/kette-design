'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { transitionBase } from '@/lib/recipes';
import { cn } from '@/lib/utils';

type GroupSize = 'sm' | 'md';
type GroupMode = 'single' | 'multiple';

interface GroupContextValue {
  mode: GroupMode;
  size: GroupSize;
  name: string;
  disabled: boolean;
  selected: string[];
  toggle: (value: string) => void;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  // `multiple` renders checkboxes (any number selected), `single` renders radios (at most one).
  type?: GroupMode;
  // Selected item values. In `single` mode the array holds at most one entry.
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  size?: GroupSize;
  disabled?: boolean;
  // Form field name shared by every item.
  name?: string;
  // Stack the items (default) or lay them out in a responsive grid.
  layout?: 'stack' | 'grid';
}

// Selectable cards (Figma "Checkbox group"): a labelled group of native checkboxes or radios drawn as cards.
const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      className,
      type = 'multiple',
      value,
      defaultValue = [],
      onValueChange,
      size = 'md',
      disabled = false,
      name,
      layout = 'stack',
      ...props
    },
    ref,
  ) => {
    const autoName = React.useId();
    const [inner, setInner] = React.useState<string[]>(defaultValue);
    const selected = value ?? inner;

    const toggle = React.useCallback(
      (item: string) => {
        let next: string[];
        if (type === 'single') next = [item];
        else next = selected.includes(item) ? selected.filter((entry) => entry !== item) : [...selected, item];
        setInner(next);
        onValueChange?.(next);
      },
      [onValueChange, selected, type],
    );

    const context = React.useMemo<GroupContextValue>(
      () => ({ mode: type, size, name: name ?? autoName, disabled, selected, toggle }),
      [type, size, name, autoName, disabled, selected, toggle],
    );

    return (
      <GroupContext.Provider value={context}>
        <div
          ref={ref}
          role={type === 'single' ? 'radiogroup' : 'group'}
          aria-disabled={disabled || undefined}
          className={cn(layout === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'flex flex-col gap-3', className)}
          {...props}
        />
      </GroupContext.Provider>
    );
  },
);
CheckboxGroup.displayName = 'CheckboxGroup';

export interface CheckboxGroupItemProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'title' | 'onChange'> {
  value: string;
  title: React.ReactNode;
  // Muted text right after the title on the same line (Figma "Text and subtext"), for example "$10/month".
  price?: React.ReactNode;
  description?: React.ReactNode;
  // Leading visual: an icon, an Avatar or a payment logo.
  media?: React.ReactNode;
  // `plain` shows the media as is, `featured` puts it in a soft round badge, `framed` in a bordered tile (payment icons).
  mediaVariant?: 'plain' | 'featured' | 'framed';
  // `auto` shows a checkbox or radio indicator matching the group type, `none` relies on the card border (icon cards).
  indicator?: 'auto' | 'none';
  // Where the indicator sits. Defaults to `start` for plain radio and checkbox rows and `end` when there is media.
  indicatorPosition?: 'start' | 'end';
  // Figma "Icon card": a header with media, title and indicator above a body with price, description and badge.
  card?: boolean;
  // Small label in the body of a card, for example a limited-offer badge.
  badge?: React.ReactNode;
  // Error border (Figma State=Error).
  invalid?: boolean;
  disabled?: boolean;
}

const CheckboxGroupItem = React.forwardRef<HTMLInputElement, CheckboxGroupItemProps>(
  (
    {
      className,
      value,
      title,
      price,
      description,
      media,
      mediaVariant = 'plain',
      indicator = 'auto',
      indicatorPosition,
      card = false,
      badge,
      invalid = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(GroupContext);
    if (!context) throw new Error('CheckboxGroupItem must be rendered inside CheckboxGroup');
    const checked = context.selected.includes(value);
    const isDisabled = disabled || context.disabled;
    const radio = context.mode === 'single';
    const small = context.size === 'sm';
    const position = indicatorPosition ?? (media || card ? 'end' : 'start');

    const indicatorNode =
      indicator === 'auto' ? (
        <span
          aria-hidden="true"
          data-indicator=""
          className={cn(
            'inline-flex shrink-0 items-center justify-center border border-solid',
            small ? 'h-checkbox-sm w-checkbox-sm' : 'h-checkbox-md w-checkbox-md',
            radio ? 'rounded-full' : 'rounded-checkbox',
            checked
              ? 'border-border-brand bg-checkbox-background-checked text-icon-on-brand'
              : 'border-checkbox-border-default bg-background',
            !card && position === 'start' && 'mt-micro',
          )}
        >
          {checked ? (
            radio ? (
              <span className="h-2 w-2 rounded-full bg-icon-on-brand" />
            ) : (
              <Check className="h-3 w-3 [stroke-width:var(--size-icon-stroke-check,3)]" />
            )
          ) : null}
        </span>
      ) : null;

    const mediaNode = media ? (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex shrink-0 items-center justify-center text-icon-default',
          mediaVariant === 'featured' && 'h-10 w-10 rounded-full bg-background-brand-subtle-hover',
          mediaVariant === 'framed' && 'h-10 w-14 rounded-item border border-solid border-border-default bg-background',
        )}
      >
        {media}
      </span>
    ) : null;

    const titleClass = cn('typography-label', checked && !card ? 'text-general-brand-on-container' : 'text-foreground');
    const subtleClass = cn('typography-label', checked && !card ? 'text-general-brand-on-container' : 'text-text-subtle');

    const textBlock = (
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex flex-wrap gap-1">
          <span className={titleClass}>{title}</span>
          {price ? <span className={subtleClass}>{price}</span> : null}
        </span>
        {description ? <span className={subtleClass}>{description}</span> : null}
      </span>
    );

    return (
      <label
        className={cn('relative block', isDisabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}
        {...props}
      >
        <input
          ref={ref}
          type={radio ? 'radio' : 'checkbox'}
          name={context.name}
          value={value}
          checked={checked}
          disabled={isDisabled}
          onChange={() => context.toggle(value)}
          className="peer sr-only"
        />
        <span
          data-state={checked ? 'checked' : 'unchecked'}
          data-disabled={isDisabled || undefined}
          data-invalid={invalid || undefined}
          data-card={card || undefined}
          className={cn(
            'flex rounded-card border border-solid border-border-default bg-background',
            card ? 'flex-col' : cn('items-start gap-2', small ? 'p-3' : 'p-4'),
            transitionBase,
            'motion-reduce:transition-none',
            'hover:border-border-bold',
            'peer-focus-visible:border-border-focus peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/30',
            'data-[state=checked]:border-2 data-[state=checked]:border-border-brand',
            !card && 'data-[state=checked]:bg-background-brand-subtle',
            'data-[invalid=true]:border-border-destructive',
            'data-[disabled=true]:opacity-disabled',
          )}
        >
          {card ? (
            <>
              <span
                data-card-header=""
                className={cn(
                  'flex items-center gap-4 rounded-t-card border-b border-solid border-border-default py-4 pl-4 pr-5',
                  checked && 'bg-background-brand-subtle',
                )}
              >
                {mediaNode}
                <span className={cn(titleClass, 'flex-1')}>{title}</span>
                {indicatorNode}
              </span>
              <span data-card-body="" className="flex items-start gap-1 p-4">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  {price ? <span className="typography-label text-foreground">{price}</span> : null}
                  {description ? <span className={subtleClass}>{description}</span> : null}
                </span>
                {badge}
              </span>
            </>
          ) : (
            <>
              {position === 'start' ? indicatorNode : null}
              {mediaNode}
              {textBlock}
              {position === 'end' ? indicatorNode : null}
            </>
          )}
        </span>
      </label>
    );
  },
);
CheckboxGroupItem.displayName = 'CheckboxGroupItem';

export { CheckboxGroup, CheckboxGroupItem };
