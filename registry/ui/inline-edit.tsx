'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, useId, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react';

import { focusRingField, invalidRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

const inlineEditVariants = cva(
  [
    'typography-ui w-full min-w-0 border border-solid border-transparent bg-transparent text-foreground outline-none',
    'transition-[color,background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none',
    'placeholder:text-muted-foreground',
    'hover:border-hairline hover:bg-background',
    'read-only:cursor-default read-only:hover:border-transparent read-only:hover:bg-transparent',
    'focus-visible:bg-background',
  ],
  {
    variants: {
      // attribute is a field in a detail aside, cell fills a table cell row.
      variant: {
        attribute: 'h-control-sm rounded-input px-2',
        cell: 'h-row rounded-none px-2',
      },
      // Product preset (DesignSystemProvider `preset`): `zero` pads with the control token and shows the input border on hover.
      preset: { default: '', zero: 'px-control-px-sm hover:border-input' },
    },
    defaultVariants: { variant: 'attribute', preset: 'default' },
  },
);

export interface InlineEditProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'>, Omit<VariantProps<typeof inlineEditVariants>, 'preset'> {
  // Accessible name of the field. Required because there is no visible label.
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Called on Enter or blur with the changed draft. Throwing is not handled: use `invalid` and `errorMessage`.
  onCommit?: (value: string) => void;
  // Called when Escape reverts the draft.
  onCancel?: () => void;
  invalid?: boolean;
  errorMessage?: string;
}

// Text that edits in place. Always a real input, so keyboard and assistive tech need no extra mode.
const InlineEdit = forwardRef<HTMLInputElement, InlineEditProps>(
  ({ className, variant, value, defaultValue = '', onValueChange, onCommit, onCancel, invalid, errorMessage, readOnly, onBlur, onKeyDown, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    const controlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue);
    const draft = controlled ? value : inner;
    const committed = useRef(draft);
    const errorId = useId();
    const hasError = Boolean(invalid || errorMessage);

    const set = (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    };
    const commit = () => {
      if (draft !== committed.current) {
        committed.current = draft;
        onCommit?.(draft);
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || readOnly) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        set(committed.current);
        onCancel?.();
      }
    };

    return (
      <div className="flex w-full min-w-0 flex-col gap-1">
        <input
          ref={ref}
          type="text"
          value={draft}
          readOnly={readOnly}
          aria-invalid={hasError || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          data-variant={variant ?? 'attribute'}
          onChange={(event) => set(event.target.value)}
          onBlur={(event) => {
            onBlur?.(event);
            if (!readOnly) commit();
          }}
          onKeyDown={handleKeyDown}
          className={cn(inlineEditVariants({ variant, preset: zero ? 'zero' : 'default' }), focusRingField, invalidRing, hasError && 'border-border-destructive', className)}
          {...props}
        />
        {errorMessage ? (
          <p id={errorId} className="typography-text-extra-small px-2 text-text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);
InlineEdit.displayName = 'InlineEdit';

export { InlineEdit, inlineEditVariants };
