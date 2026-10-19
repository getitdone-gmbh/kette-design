'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { useLabels } from './labels-context';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// Project colours 1..8 (`colors/data/project/N`), the same set Avatar and LogoTile use. Full class strings for the Tailwind scan.
const projectSwatchClass = {
  'project-1': 'bg-data-project-1',
  'project-2': 'bg-data-project-2',
  'project-3': 'bg-data-project-3',
  'project-4': 'bg-data-project-4',
  'project-5': 'bg-data-project-5',
  'project-6': 'bg-data-project-6',
  'project-7': 'bg-data-project-7',
  'project-8': 'bg-data-project-8',
} as const;

export type ProjectSwatch = keyof typeof projectSwatchClass;

export interface ColorSwatchOption {
  // The value reported on selection. For `color` options this is usually the CSS colour itself.
  value: string;
  // Accessible name, e.g. "Teal". Without it the position is used ("Colour 3").
  label?: string;
  // Any CSS colour, applied as the swatch fill. Use it for user data such as stored calendar colours.
  color?: string;
  // Token class for the fill, e.g. `bg-data-project-3`. Wins over `color`.
  className?: string;
}

// The eight project colours as options (values `project-1`..`project-8`).
const projectColorOptions: ColorSwatchOption[] = (Object.keys(projectSwatchClass) as ProjectSwatch[]).map((value) => ({
  value,
  className: projectSwatchClass[value],
}));

const swatchVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center rounded-full border border-solid border-border-bold',
    'transition-shadow',
    focusRing,
    'disabled:cursor-not-allowed disabled:opacity-disabled',
    // Selected: a ring in the foreground colour plus a gap to the surface (shape cue, not colour only).
    'data-[state=checked]:ring-2 data-[state=checked]:ring-foreground data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background',
    'hover:data-[state=unchecked]:ring-2 hover:data-[state=unchecked]:ring-border-bold hover:data-[state=unchecked]:ring-offset-2 hover:data-[state=unchecked]:ring-offset-background',
  ],
  {
    variants: {
      size: {
        sm: 'h-icon-md w-icon-md',
        md: 'h-avatar-xs w-avatar-xs',
        lg: 'h-avatar-sm w-avatar-sm',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface ColorSwatchPickerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'onChange' | 'children'>,
    VariantProps<typeof swatchVariants> {
  // Swatches in display order. Defaults to the eight project colours.
  options?: ColorSwatchOption[];
  // Called with the option value when the selection changes.
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  // Shows only a small swatch button for the current colour; the swatches open in a popover and picking one closes it.
  compact?: boolean;
  // Accessible name of the compact trigger. Defaults to the provider text plus the current colour.
  triggerLabel?: string;
  // Adds an apply button next to the swatches. It is disabled until a colour is selected and calls `onApply` with the selected value. In `compact` mode picking a swatch keeps the popover open so the button can be reached, and applying closes it.
  onApply?: (value: string) => void;
  // Text of the apply button. Defaults to the provider text `apply`.
  applyLabel?: string;
}

// Single-choice colour swatches (calendar and sales colours). A radio group: Tab enters, arrow keys move and select.
const ColorSwatchPicker = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, ColorSwatchPickerProps>(
  ({ className, options = projectColorOptions, size, invalid, disabled, compact, triggerLabel, onApply, applyLabel, value, defaultValue, onValueChange, ...props }, ref) => {
    const l = useLabels();
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState(defaultValue);
    const current = controlled ? value : inner;
    if (compact) {
      return (
        <CompactColorSwatchPicker
          ref={ref}
          className={className}
          options={options}
          size={size}
          invalid={invalid}
          disabled={disabled}
          triggerLabel={triggerLabel}
          onApply={onApply}
          applyLabel={applyLabel}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          {...props}
        />
      );
    }
    const handleChange = (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    };
    const group = (
      <RadioGroupPrimitive.Root
        ref={ref}
        orientation="horizontal"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={current}
        onValueChange={handleChange}
        className={cn('flex flex-wrap items-center gap-3 p-1', invalid && 'rounded-control ring-1 ring-general-error-default', !onApply && className)}
        {...props}
      >
        {options.map((option, index) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            aria-label={option.label ?? l.colorOption(index + 1)}
            data-color={option.value}
            className={cn(swatchVariants({ size }), option.className)}
            style={option.className || !option.color ? undefined : { backgroundColor: option.color }}
          />
        ))}
      </RadioGroupPrimitive.Root>
    );
    if (!onApply) return group;
    return (
      <div data-color-apply="" className={cn('flex flex-wrap items-center gap-3', className)}>
        {group}
        <Button type="button" variant="outline" size="control-sm" disabled={disabled || current === undefined || current === ''} onClick={() => current && onApply(current)}>
          {applyLabel ?? l.apply}
        </Button>
      </div>
    );
  },
);
ColorSwatchPicker.displayName = 'ColorSwatchPicker';

// Compact mode: a swatch-sized button for the current colour that opens the swatch group in a popover.
const CompactColorSwatchPicker = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, ColorSwatchPickerProps>(
  ({ className, options = projectColorOptions, size, invalid, disabled, triggerLabel, value, defaultValue, onValueChange, onApply, applyLabel, ...props }, ref) => {
    const l = useLabels();
    const [open, setOpen] = React.useState(false);
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState(defaultValue);
    const current = controlled ? value : inner;
    const index = options.findIndex((option) => option.value === current);
    const selected = index >= 0 ? options[index] : undefined;
    const selectedName = selected ? (selected.label ?? l.colorOption(index + 1)) : undefined;
    const name = triggerLabel ?? (selectedName ? `${l.pickColor}: ${selectedName}` : l.pickColor);
    const handleChange = (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
      // With an apply button the popover stays open until the colour is applied.
      if (!onApply) setOpen(false);
    };
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={name}
            data-invalid={invalid || undefined}
            data-compact=""
            data-color={selected?.value}
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center rounded-full border border-solid border-border-bold bg-muted transition-shadow',
              focusRing,
              'disabled:cursor-not-allowed disabled:opacity-disabled',
              'hover:ring-2 hover:ring-border-bold hover:ring-offset-2 hover:ring-offset-background',
              invalid && 'ring-1 ring-general-error-default',
              size === 'sm' && 'h-icon-md w-icon-md',
              (size === 'md' || size === undefined || size === null) && 'h-avatar-xs w-avatar-xs',
              size === 'lg' && 'h-avatar-sm w-avatar-sm',
              selected?.className,
              className,
            )}
            style={selected?.className || !selected?.color ? undefined : { backgroundColor: selected.color }}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="flex flex-col items-start gap-3">
            <ColorSwatchPicker ref={ref} options={options} size={size} invalid={invalid} aria-label={l.pickColor} value={current} onValueChange={handleChange} {...props} />
            {onApply ? (
              <Button
                type="button"
                variant="outline"
                size="control-sm"
                disabled={!selected}
                onClick={() => {
                  if (selected) onApply(selected.value);
                  setOpen(false);
                }}
              >
                {applyLabel ?? l.apply}
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
CompactColorSwatchPicker.displayName = 'CompactColorSwatchPicker';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// `#abc` becomes `#aabbcc`, everything is lowercase. Returns null when the text is not a hex colour.
export function normalizeHexColor(text: string): string | null {
  const t = text.trim().startsWith('#') ? text.trim() : `#${text.trim()}`;
  if (!HEX.test(t)) return null;
  const lower = t.toLowerCase();
  return lower.length === 4 ? `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}` : lower;
}

export interface ColorInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size'> {
  // Controlled hex value like `#3b82f6`.
  value?: string;
  defaultValue?: string;
  // Called with a normalized `#rrggbb` value when the picker or a valid hex text changes it.
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  compact?: boolean;
  // Control size. `md` (default) is the 24px swatch with the standard field, `sm` a 16px swatch with the `sm` field height.
  size?: 'sm' | 'md';
  // Accessible names. Win over the provider text.
  pickLabel?: string;
  hexLabel?: string;
}

// Hex text field with a native colour picker swatch. Free text may be incomplete while typing; only valid colours are reported.
const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ className, value, defaultValue = '#000000', onValueChange, invalid, compact, size, disabled, pickLabel, hexLabel, name, id, onBlur, ...props }, ref) => {
    const l = useLabels({ pickColor: pickLabel, hexColor: hexLabel });
    const small = size === 'sm';
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState(normalizeHexColor(defaultValue) ?? '#000000');
    const current = controlled ? (normalizeHexColor(value) ?? '#000000') : inner;
    const [text, setText] = React.useState(current);
    // Keep the text in step with outside changes unless the user is mid-edit on an equivalent value.
    React.useEffect(() => {
      setText((prev) => (normalizeHexColor(prev) === current ? prev : current));
    }, [current]);
    const textInvalid = invalid || normalizeHexColor(text) === null;

    const commit = (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    };

    return (
      <div className={cn('flex items-center gap-2', className)} data-color-input="">
        <span className={cn('relative inline-flex shrink-0', small ? 'h-icon-md w-icon-md' : 'h-avatar-xs w-avatar-xs')}>
          <input
            type="color"
            aria-label={l.pickColor}
            disabled={disabled}
            value={current}
            onChange={(event) => {
              const next = normalizeHexColor(event.target.value);
              if (next) {
                setText(next);
                commit(next);
              }
            }}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none h-full w-full rounded-full border border-solid border-border-bold peer-focus-visible:ring-focus peer-focus-visible:ring-offset-focus peer-focus-visible:ring-offset-background peer-focus-visible:ring-ring-default peer-disabled:opacity-disabled"
            style={{ backgroundColor: current }}
          />
        </span>
        <Input
          {...props}
          ref={ref}
          id={id}
          name={name}
          compact={compact}
          size={small ? 'sm' : undefined}
          disabled={disabled}
          aria-label={l.hexColor}
          aria-invalid={textInvalid || undefined}
          value={text}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          inputMode="text"
          className="w-32 font-mono"
          onChange={(event) => {
            setText(event.target.value);
            const next = normalizeHexColor(event.target.value);
            if (next) commit(next);
          }}
          onBlur={(event) => {
            const next = normalizeHexColor(event.target.value);
            setText(next ?? current);
            onBlur?.(event);
          }}
        />
      </div>
    );
  },
);
ColorInput.displayName = 'ColorInput';

export { ColorInput, ColorSwatchPicker, projectColorOptions, swatchVariants as colorSwatchVariants };
