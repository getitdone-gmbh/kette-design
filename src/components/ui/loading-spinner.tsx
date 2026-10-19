'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Loader } from 'lucide-react';
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useLabels, usePreset } from './labels-context';

/**
 * FIGMA SPEC NOTE (LOADSPIN-FIGMA-01): the Component Library file "🚧 GetITDone-Basic"
 * (bzBnRLfRJNknGg9UYJIHb0) has no dedicated "Loading Spinner" / "Progress indicator" component
 * set — confirmed by walking every top-level page (👋🏻 Welcome, ↳ Avatars 18:1350, ↳ Button
 * 1:1183, ↳ Select 18:0, ↳ Tooltips 1052:485, ↳ CardMetrics 185:279, ↳ Logos 1083:118533, Icons
 * 3463:407484, Misc icons 1025:31781, Utilities 1054:557). The only loading-adjacent assets are
 * three generic icon glyphs ("loading-01/02/03", nodes 3463:405201/405204/405207) living in the
 * shared icon set — plain iconography, not a bound component with anatomy/variants/states. Per
 * figma-design-sync, a spec must not be fabricated where none exists, so this file does not
 * invent a Figma-driven redesign. Instead it aligns the EXISTING ring-spinner visual to design
 * tokens and to Material's own canonical "circular progress indicator" anatomy (required reading
 * per material-design-3-expressive): a low-emphasis static track + a high-emphasis `primary`
 * active indicator — plus this repo's established cva/size/tone/a11y patterns (see Avatar,
 * Skeleton).
 *
 * TOKEN ALIGNMENT (closes the raw-palette gap): the previous implementation hardcoded
 * `border-slate-200 border-t-slate-600` — a raw Tailwind palette pair with no dark-mode value at
 * all (same root-cause class as Skeleton's pre-fix `bg-slate-200`, see SKEL-TOK-01/TABLE-MAT-02
 * in skeleton.tsx). `border-slate-200` rendered a fixed light-gray track and `border-t-slate-600`
 * a fixed dark-gray active arc in EVERY theme and BOTH modes, so in dark mode (and in several of
 * the 18 color themes) the spinner's only real signal — the moving arc — read as a barely-there
 * dark-on-dark smudge. Replaced with:
 * - track: `border-border-default` (`--semantic-border-default`) — the same low-contrast,
 *   intentionally-subtle divider token Chip/Card use for non-state-bearing edges (already
 *   documented in chip.tsx as ~1.2:1 in light mode "by design" for a de-emphasized boundary);
 *   adaptive in both modes (light rgb(226 232 240) / dark rgb(51 65 85)).
 * - active indicator (`border-t-*`, the segment that visibly rotates and is the ONLY perceivable
 *   "it's loading" signal — must clear WCAG 1.4.11's 3:1 non-text minimum): `tone="default"`
 *   uses `general-brand-default` (rgb(37 99 235), unchanged across modes) — verified ≥3:1 against
 *   a typical page background in both light (~5.17:1) and dark (~3.91:1, against
 *   `semantic-background-default` rgb(2 6 23)). `tone="inverse"` (for a spinner drawn on a solid
 *   brand-color surface, e.g. inside a filled primary Button while loading) uses
 *   `general-brand-on`, verified ≥3:1 against `general-brand-default` in both modes (light
 *   ~4.94:1, dark ~3.46:1). `tone="destructive"` (a retry-after-error loading state) uses
 *   `general-error-default`, verified ≥3:1 against page background in both modes (light ~4.83:1,
 *   dark ~5.36:1). All three are the same adaptive, dark-mode-safe `general-*` role tokens
 *   already vetted elsewhere in this file set (Avatar, Skeleton, Alert) — no raw hex/palette
 *   value is introduced.
 *
 * STATE-SET NOTE: LoadingSpinner is a non-interactive, purely visual/status indicator — like
 * Skeleton, it is never a focusable or clickable control, so hover/focus-visible/active/selected
 * have no real interaction target to attach to and are intentionally NOT added (mirrors
 * Skeleton's identical reasoning in skeleton.tsx). Adding those data-/pseudo-classes without a
 * genuine interaction would be dead, feature-specific branching hidden in a shared primitive.
 * "invalid" is a form-validation concept with no analogue on a decorative progress indicator.
 * "disabled" is likewise incoherent for an indeterminate spinner (dimming something that keeps
 * spinning sends a contradictory signal); the one real "off" state this component supports is
 * `prefers-reduced-motion`, covered by `motion-reduce:animate-none` below — the same fallback
 * Skeleton/Tooltip/Select/DropdownMenu already carry for continuously, automatically animating
 * primitives, so reduced-motion users are not shown perpetual motion with no way to opt out. The
 * track + active-indicator arc stay fully visible (communicating "still loading") with only the
 * rotation removed.
 */
const loadingSpinnerVariants = cva(
  'inline-block shrink-0 animate-spin motion-reduce:animate-none rounded-full border-solid border-border-default',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        default: 'h-12 w-12 border-4',
        lg: 'h-16 w-16 border-4',
        xl: 'h-24 w-24 border-8',
      },
      preset: { default: '', zero: '' },
      tone: {
        default: 'border-t-general-brand-default',
        inverse: 'border-t-general-brand-on',
        destructive: 'border-t-general-error-default',
      },
    },
    // Product preset (DesignSystemProvider `preset`): `zero` renders the small ring at 14px.
    compoundVariants: [{ preset: 'zero', size: 'sm', className: 'h-icon-xs w-icon-xs' }],
    defaultVariants: {
      size: 'default',
      tone: 'default',
      preset: 'default',
    },
  },
);

const glyphSize = { sm: 'h-4 w-4', default: 'h-12 w-12', lg: 'h-16 w-16', xl: 'h-24 w-24' } as const;
const glyphTone = {
  default: 'text-general-brand-default',
  inverse: 'text-general-brand-on',
  destructive: 'text-general-error-default',
} as const;

// Eight dots on a circle, the leading ones fully opaque (Figma Loading indicator Style=Dot circle).
const DotCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} fill="currentColor">
    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
      <circle
        key={index}
        cx={12 + 9 * Math.cos((index * Math.PI) / 4)}
        cy={12 + 9 * Math.sin((index * Math.PI) / 4)}
        r={2}
        opacity={0.2 + index * 0.1}
      />
    ))}
  </svg>
);

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof loadingSpinnerVariants>, 'preset'> {
  className?: string;
  /**
   * Accessible name announced to assistive tech for as long as the spinner is on screen.
   * Defaults to "Loading". Ignored if an explicit `aria-label` is also passed.
   */
  label?: string;
  // `ring` is the established spinner. `line` (radial ticks) and `dots` (dot circle) are the other Figma styles.
  variant?: 'ring' | 'line' | 'dots';
  // Visible caption under the indicator (Figma Supporting text).
  supportingText?: string;
  // Where the supporting text sits: under the indicator (default) or inline after it on one line.
  layout?: 'stacked' | 'inline';
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>((props, ref) => {
  const {
    className,
    size,
    tone,
    label: labelProp,
    role = 'status',
    'aria-live': ariaLive = 'polite',
    'aria-label': ariaLabel,
    variant = 'ring',
    supportingText,
    layout = 'stacked',
    ...rest
  } = props;
  const l = useLabels();
  const zero = usePreset() === 'zero';
  const label = labelProp ?? l.loading;
  if (variant !== 'ring' || supportingText) {
    const glyphClass = cn(glyphSize[size ?? 'default'], glyphTone[tone ?? 'default'], 'shrink-0 animate-spin motion-reduce:animate-none');
    return (
      <div
        ref={ref}
        role={role}
        aria-live={ariaLive}
        aria-label={ariaLabel ?? label}
        data-variant={variant}
        data-layout={layout}
        className={cn('inline-flex items-center', layout === 'inline' ? 'flex-row gap-2' : 'flex-col gap-3', className)}
        {...rest}
      >
        {variant === 'dots' ? (
          <DotCircle className={glyphClass} />
        ) : variant === 'line' ? (
          <Loader aria-hidden="true" className={glyphClass} />
        ) : (
          <span aria-hidden="true" className={cn(loadingSpinnerVariants({ size, tone, preset: zero ? 'zero' : 'default' }))} />
        )}
        {supportingText ? <span className={cn('typography-ui text-text-subtle', layout === 'inline' && 'whitespace-nowrap')}>{supportingText}</span> : null}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      role={role}
      aria-live={ariaLive}
      aria-label={ariaLabel ?? label}
      className={cn(loadingSpinnerVariants({ size, tone, preset: zero ? 'zero' : 'default' }), className)}
      {...rest}
    />
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, loadingSpinnerVariants, type LoadingSpinnerProps };
