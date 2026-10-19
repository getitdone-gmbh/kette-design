'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';
import { useLabels } from './labels-context';

// The native range input stays the interactive element (keyboard, pointer, forms, assistive tech) but is
// visually hidden; a styled thumb and fill are drawn from the same value so every theme token applies.
const THUMB_REM = 1.5;

const nativeThumb = [
  '[&::-webkit-slider-thumb]:pointer-events-auto',
  '[&::-webkit-slider-thumb]:h-6',
  '[&::-webkit-slider-thumb]:w-6',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-moz-range-thumb]:pointer-events-auto',
  '[&::-moz-range-thumb]:h-6',
  '[&::-moz-range-thumb]:w-6',
  '[&::-moz-range-thumb]:border-0',
];

const inputBase = [
  'absolute',
  'inset-0',
  'm-0',
  'h-6',
  'w-full',
  'cursor-pointer',
  'appearance-none',
  'bg-transparent',
  'opacity-0',
  'disabled:cursor-not-allowed',
  ...nativeThumb,
];

const toPercent = (value: number, min: number, max: number) => (max > min ? ((value - min) / (max - min)) * 100 : 0);

// Left offset that keeps the visual thumb centred where the native thumb sits (it travels width minus thumb width).
const thumbLeft = (percent: number) => `calc(${percent}% - ${(percent / 100) * THUMB_REM}rem)`;
const thumbCenter = (percent: number) => `calc(${percent}% + ${(0.5 - percent / 100) * THUMB_REM}rem)`;

type ValueLabel = 'none' | 'bottom' | 'top-floating';

interface SliderShared {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  // Where the current value is shown: nowhere, under the track, or in a bubble above the thumb.
  valueLabel?: ValueLabel;
  // Text for the value label and `aria-valuetext`, for example (v) => `${v} h`.
  formatValue?: (value: number) => string;
  className?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const Thumb = ({ percent, peer, disabled }: { percent: number; peer: string; disabled?: boolean }) => (
  <span
    aria-hidden="true"
    data-slider-thumb=""
    style={{ left: thumbLeft(percent) }}
    className={cn(
      'pointer-events-none absolute top-0 h-6 w-6 rounded-full border-2 border-solid border-border-brand bg-background shadow-elevation-control transition-shadow duration-150 motion-reduce:transition-none',
      peer,
      'peer-hover:shadow-field-hover',
      disabled && 'border-border-disabled',
    )}
  />
);

const Bubble = ({ percent, children, floating }: { percent: number; children: React.ReactNode; floating: boolean }) => (
  <span
    aria-hidden="true"
    data-slider-label=""
    style={{ left: thumbCenter(percent) }}
    className={cn(
      'pointer-events-none absolute -translate-x-1/2 whitespace-nowrap tabular-nums',
      floating
        ? '-top-11 rounded-control border border-solid border-border-default bg-background px-3 py-2 text-foreground shadow-elevation-raised typography-text-small-medium'
        : 'top-9 text-foreground typography-label',
    )}
  >
    {children}
  </span>
);

const frame = (valueLabel: ValueLabel) =>
  cn('relative w-full', valueLabel === 'top-floating' && 'pt-12', valueLabel === 'bottom' && 'pb-8');

export interface SliderProps extends SliderShared {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      valueLabel = 'none',
      formatValue,
      className,
      ...aria
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? min);
    const current = value ?? inner;
    const percent = toPercent(current, min, max);
    const format = formatValue ?? ((v: number) => String(v));
    return (
      <div className={cn(frame(valueLabel), className)} data-disabled={disabled || undefined}>
        <div className="relative h-6 w-full">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-background-neutral-hover"
          />
          <span
            aria-hidden="true"
            data-slider-fill=""
            style={{ width: `${percent}%` }}
            className={cn(
              'absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-background-brand-bold-default',
              disabled && 'bg-border-disabled',
            )}
          />
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            disabled={disabled}
            aria-valuetext={format(current)}
            onChange={(event) => {
              const next = Number(event.target.value);
              setInner(next);
              onValueChange?.(next);
            }}
            className={cn('peer', inputBase)}
            {...aria}
          />
          <Thumb
            percent={percent}
            peer="peer-focus-visible:ring-focus peer-focus-visible:ring-offset-focus peer-focus-visible:ring-offset-background peer-focus-visible:ring-ring-default"
            disabled={disabled}
          />
        </div>
        {valueLabel !== 'none' && (
          <Bubble percent={percent} floating={valueLabel === 'top-floating'}>
            {format(current)}
          </Bubble>
        )}
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export interface RangeSliderProps extends Omit<SliderShared, 'name'> {
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  // Accessible names of the two thumbs. Required because a range exposes two sliders.
  minLabel?: string;
  maxLabel?: string;
  // Form field names for the lower and upper value.
  minName?: string;
  maxName?: string;
}

const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      valueLabel = 'none',
      formatValue,
      className,
      minLabel: minLabelProp,
      maxLabel: maxLabelProp,
      minName,
      maxName,
      id,
      'aria-label': groupLabel,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
    },
    ref,
  ) => {
    const l = useLabels();
    const minLabel = minLabelProp ?? l.minimum;
    const maxLabel = maxLabelProp ?? l.maximum;
    const [inner, setInner] = React.useState<[number, number]>(defaultValue ?? [min, max]);
    const [low, high] = value ?? inner;
    const lowPercent = toPercent(low, min, max);
    const highPercent = toPercent(high, min, max);
    const format = formatValue ?? ((v: number) => String(v));
    const commit = (next: [number, number]) => {
      setInner(next);
      onValueChange?.(next);
    };
    const lowOnTop = low > min + (max - min) / 2;
    return (
      <div
        ref={ref}
        id={id}
        role="group"
        aria-label={groupLabel}
        aria-labelledby={labelledBy}
        className={cn(frame(valueLabel), className)}
        data-disabled={disabled || undefined}
      >
        <div className="pointer-events-none relative h-6 w-full">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-background-neutral-hover"
          />
          <span
            aria-hidden="true"
            data-slider-fill=""
            style={{ left: `${lowPercent}%`, width: `${Math.max(highPercent - lowPercent, 0)}%` }}
            className={cn(
              'absolute top-1/2 h-2 -translate-y-1/2 bg-background-brand-bold-default',
              disabled && 'bg-border-disabled',
            )}
          />
          <input
            type="range"
            name={minName}
            min={min}
            max={max}
            step={step}
            value={low}
            disabled={disabled}
            aria-label={minLabel}
            aria-valuetext={format(low)}
            aria-describedby={describedBy}
            onChange={(event) => commit([Math.min(Number(event.target.value), high), high])}
            className={cn('peer/low pointer-events-none', inputBase, lowOnTop ? 'z-10' : 'z-0')}
          />
          <Thumb
            percent={lowPercent}
            peer="peer-focus-visible/low:ring-focus peer-focus-visible/low:ring-offset-focus peer-focus-visible/low:ring-offset-background peer-focus-visible/low:ring-ring-default"
            disabled={disabled}
          />
          <input
            type="range"
            name={maxName}
            min={min}
            max={max}
            step={step}
            value={high}
            disabled={disabled}
            aria-label={maxLabel}
            aria-valuetext={format(high)}
            aria-describedby={describedBy}
            onChange={(event) => commit([low, Math.max(Number(event.target.value), low)])}
            className={cn('peer/high pointer-events-none', inputBase, lowOnTop ? 'z-0' : 'z-10')}
          />
          <Thumb
            percent={highPercent}
            peer="peer-focus-visible/high:ring-focus peer-focus-visible/high:ring-offset-focus peer-focus-visible/high:ring-offset-background peer-focus-visible/high:ring-ring-default"
            disabled={disabled}
          />
        </div>
        {valueLabel !== 'none' && (
          <>
            <Bubble percent={lowPercent} floating={valueLabel === 'top-floating'}>
              {format(low)}
            </Bubble>
            <Bubble percent={highPercent} floating={valueLabel === 'top-floating'}>
              {format(high)}
            </Bubble>
          </>
        )}
      </div>
    );
  },
);
RangeSlider.displayName = 'RangeSlider';

export { RangeSlider, Slider };
