'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { focusRing, invalidRing, transitionBase } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { useLabels, usePreset } from './labels-context';

// Box sizes follow the Figma InputDigit frames and are not bound to the control scale on purpose (owner decision):
// sm 64px and md 80px carry the 48px digit role, lg 96px carries the 60px digit role.
const digitVariants = cva(
  [
    'rounded-control border border-solid border-input bg-background p-0 text-center font-medium tabular-nums text-foreground caret-transparent',
    'placeholder:text-text-subtle shadow-elevation-control',
    transitionBase,
    'hover:border-border-bold',
    focusRing,
    invalidRing,
    'disabled:cursor-not-allowed disabled:opacity-disabled',
    'data-[success=true]:border-border-success',
  ],
  {
    variants: {
      size: {
        sm: 'h-16 w-16 typography-digit-md',
        md: 'h-20 w-20 typography-digit-md',
        lg: 'h-24 w-24 typography-digit-lg',
        // Verification code box (Figma _Code digit): 40 x 48, 16/600. Default size in the zero preset.
        code: 'h-12 w-10 typography-kpi-value',
      },
    },
    defaultVariants: { size: 'lg' },
  },
);

export interface InputDigitProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof digitVariants> {
  // Number of boxes. Figma ships 6 (default) and 4.
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Fires once when every box is filled.
  onComplete?: (value: string) => void;
  // `numeric` accepts 0-9 and opens the numeric keypad; `alphanumeric` also accepts letters.
  type?: 'numeric' | 'alphanumeric';
  // Draws a hyphen after this many boxes. Defaults to 3 for six boxes, none otherwise.
  separatorAfter?: number;
  disabled?: boolean;
  invalid?: boolean;
  success?: boolean;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  // Group name and per-box names ("<name>" is submitted as one hidden value).
  name?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

const patterns = { numeric: /^[0-9]$/, alphanumeric: /^[0-9a-zA-Z]$/ } as const;

const InputDigit = React.forwardRef<HTMLDivElement, InputDigitProps>(
  (
    {
      className,
      length = 6,
      value,
      defaultValue = '',
      onValueChange,
      onComplete,
      type = 'numeric',
      separatorAfter,
      size,
      disabled = false,
      invalid = false,
      success = false,
      label,
      hint,
      name,
      autoFocus = false,
      placeholder = '0',
      id,
      ...props
    },
    ref,
  ) => {
    const zero = usePreset() === 'zero';
    size = size ?? (zero ? 'code' : undefined);
    const l = useLabels();
    const autoId = React.useId();
    const baseId = id ?? autoId;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const accepts = patterns[type];
    const splitAt = separatorAfter ?? (length === 6 ? 3 : undefined);
    const [inner, setInner] = React.useState(() => defaultValue.slice(0, length));
    const current = (value ?? inner).slice(0, length);
    const refs = React.useRef<Array<HTMLInputElement | null>>([]);

    const chars = Array.from({ length }, (_, index) => current[index] ?? '');

    const commit = (next: string[]) => {
      const joined = next.join('');
      setInner(joined);
      onValueChange?.(joined);
      if (joined.length === length && next.every(Boolean)) onComplete?.(joined);
    };

    const focusAt = (index: number) => {
      const target = refs.current[Math.min(Math.max(index, 0), length - 1)];
      target?.focus();
      target?.select();
    };

    const insert = (start: number, text: string) => {
      const incoming = Array.from(text).filter((char) => accepts.test(char));
      if (incoming.length === 0) return;
      const next = [...chars];
      let index = start;
      for (const char of incoming) {
        if (index >= length) break;
        next[index] = char;
        index += 1;
      }
      commit(next);
      focusAt(index >= length ? length - 1 : index);
    };

    const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Backspace': {
          event.preventDefault();
          const next = [...chars];
          if (next[index]) {
            next[index] = '';
            commit(next);
          } else if (index > 0) {
            next[index - 1] = '';
            commit(next);
            focusAt(index - 1);
          }
          break;
        }
        case 'Delete': {
          event.preventDefault();
          const next = [...chars];
          next[index] = '';
          commit(next);
          break;
        }
        case 'ArrowLeft':
          event.preventDefault();
          focusAt(index - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          focusAt(index + 1);
          break;
        case 'Home':
          event.preventDefault();
          focusAt(0);
          break;
        case 'End':
          event.preventDefault();
          focusAt(length - 1);
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            if (accepts.test(event.key)) insert(index, event.key);
          }
      }
    };

    const describedBy = hint ? hintId : undefined;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        className={cn('flex flex-col gap-gap-label', className)}
        {...props}
      >
        {label ? (
          <span id={labelId} className={cn('typography-input-label text-foreground', disabled && 'opacity-disabled')}>
            {label}
          </span>
        ) : null}
        <div className={cn('flex items-center', size === 'sm' || size === 'code' ? 'gap-2' : 'gap-3')}>
          {chars.map((char, index) => (
            <React.Fragment key={index}>
              {splitAt && index === splitAt ? (
                <span aria-hidden="true" data-digit-separator="" className="h-px w-3 shrink-0 bg-border-default" />
              ) : null}
              <input
                ref={(node) => {
                  refs.current[index] = node;
                }}
                type="text"
                inputMode={type === 'numeric' ? 'numeric' : 'text'}
                pattern={type === 'numeric' ? '[0-9]*' : undefined}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={1}
                value={char}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus && index === 0}
                aria-label={l.digit(index + 1, length)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                data-success={success && !invalid ? 'true' : undefined}
                className={digitVariants({ size })}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={handleKeyDown(index)}
                onChange={(event) => {
                  const text = event.target.value;
                  if (text) insert(index, text);
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  insert(index, event.clipboardData.getData('text'));
                }}
              />
            </React.Fragment>
          ))}
        </div>
        {name ? <input type="hidden" name={name} value={current} /> : null}
        {hint ? (
          <p id={hintId} className={cn('typography-input-hint', invalid ? 'text-input-foreground-hint-error' : 'text-input-foreground-hint')}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
InputDigit.displayName = 'InputDigit';

export { InputDigit, digitVariants };
