import { MouseEventHandler, ReactNode } from 'react';

export interface CardProps {
  image?: ReactNode;
  children: ReactNode;
  isFluid?: boolean;
  transparent?: boolean;
  noBorder?: boolean;
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /**
   * A real click handler is what turns this Card into a keyboard-operable "clickable card" —
   * mirrors the `interactive` computation in the composable `card.tsx` Card. Omit it for a
   * purely informational Card, which then renders with no role/tabIndex/focus ring and never
   * enters the Tab order.
   */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /**
   * Marks this card as the chosen option among a set of alternatives (e.g. a plan/tile picker).
   * Independent of `onClick` — a purely informational Card can still indicate "this is the current
   * one." Sets `data-selected` always, and `aria-pressed` only while interactive (a plain `<div>`
   * has no ARIA widget role to carry `aria-selected`/`aria-pressed` otherwise). On a non-interactive
   * selected Card, an sr-only " (selected)" suffix carries the state to assistive tech instead.
   * Mirrors the composable `Card` in `card.tsx` (MAT-CARD-04).
   */
  selected?: boolean;
  /**
   * Dims the card and blocks pointer interaction/keyboard activation. Mirrors the composable
   * `Card`'s `aria-disabled`/`data-disabled` approach rather than the HTML `disabled` attribute,
   * since Card is not a native form control (MAT-CARD-04).
   */
  disabled?: boolean;
  /**
   * Forces the `error` border/focus-ring treatment and sets `aria-invalid` — e.g. a form-section
   * Card reporting a validation error. An sr-only " (invalid)" suffix mirrors the composable Card's
   * convention so the state isn't color-only (MAT-CARD-04).
   */
  invalid?: boolean;
  /**
   * CARD-A11Y-04: for an interactive Card (`onClick` set) whose children are rich nested content,
   * `role="button"`'s accessible name otherwise defaults to the concatenation of ALL descendant
   * text/alt (e.g. "Category I am a h3 Description button" instead of a concise "Title"). Pass a
   * short, meaningful label so `screen.getByRole('button', { name: '<title>' })` resolves.
   */
  'aria-label'?: string;
}
