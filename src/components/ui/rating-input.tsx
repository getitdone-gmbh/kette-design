'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Star } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { useLabels } from './labels-context';

const starSize = {
  sm: 'h-icon-sm w-icon-sm',
  md: 'h-icon-md w-icon-md',
  lg: 'h-icon-lg w-icon-lg',
} as const;

export interface RatingInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'dir'> {
  // Accessible name of the rating, e.g. `Quality`. Required because there is no visible label.
  'aria-label': string;
  // Selected stars, 0 for none.
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  // Number of stars. Default 5.
  max?: number;
  size?: keyof typeof starSize;
  // Shows the value as a static image and takes the control out of the tab order.
  readOnly?: boolean;
  invalid?: boolean;
}

// Star rating field. A radio group: Tab enters, the arrow keys move and select, Home and End jump to the ends. Hover previews the value.
const RatingInput = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RatingInputProps>(
  ({ className, value, defaultValue = 0, onValueChange, max = 5, size = 'md', readOnly = false, invalid, disabled, 'aria-label': ariaLabel, ...props }, ref) => {
    const l = useLabels();
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState(defaultValue);
    const [hovered, setHovered] = React.useState<number | null>(null);
    const current = Math.min(Math.max(Math.round(controlled ? value : inner), 0), max);
    const shown = hovered ?? current;
    const stars = Array.from({ length: max }, (_, i) => i + 1);

    if (readOnly) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          role="img"
          aria-label={l.ratingOf(ariaLabel, current, max)}
          data-readonly=""
          className={cn('inline-flex items-center gap-1', className)}
        >
          {stars.map((n) => (
            <Star
              key={n}
              aria-hidden="true"
              data-filled={n <= current ? '' : undefined}
              className={cn(starSize[size], 'shrink-0', n <= current ? 'fill-current text-icon-warning' : 'text-icon-disabled')}
            />
          ))}
        </span>
      );
    }

    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        orientation="horizontal"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={current > 0 ? String(current) : ''}
        onValueChange={(next) => {
          const n = Number(next);
          if (!controlled) setInner(n);
          onValueChange?.(n);
        }}
        onMouseLeave={() => setHovered(null)}
        className={cn('inline-flex items-center gap-1', invalid && 'rounded-control ring-1 ring-general-error-default', className)}
        {...props}
      >
        {stars.map((n) => (
          <RadioGroupPrimitive.Item
            key={n}
            value={String(n)}
            aria-label={l.ratingOption(n, max)}
            onMouseEnter={() => !disabled && setHovered(n)}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-item p-1 transition-colors',
              focusRing,
              'disabled:cursor-not-allowed disabled:opacity-disabled',
            )}
          >
            <Star
              aria-hidden="true"
              data-filled={n <= shown ? '' : undefined}
              className={cn(starSize[size], n <= shown ? 'fill-current text-icon-warning' : 'text-icon-subtle')}
            />
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    );
  },
);
RatingInput.displayName = 'RatingInput';

export { RatingInput };
