'use client';

import { PenLine } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { useLabels, useLocale, usePreset } from './labels-context';

export interface SignatureBoxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onClick'> {
  // Signer name. Its presence marks the box as signed unless `signed` says otherwise.
  name?: string;
  // Time of signing, shown after the name. Dates are formatted with `formatDate`.
  signedAt?: string | Date;
  signed?: boolean;
  // Accessible name of the field.
  label?: string;
  // Text of the open (unsigned) box.
  placeholder?: string;
  // Makes the open box an actionable button that starts signing.
  onSign?: () => void;
  disabled?: boolean;
  formatDate?: (date: Date) => string;
}

const defaultFormat = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

// Signature field: the signer name on the signature line with the signing time, or an open dashed box.
const SignatureBox = React.forwardRef<HTMLElement, SignatureBoxProps>(
  ({ className, name, signedAt, signed, label: labelProp, placeholder: placeholderProp, onSign, disabled = false, formatDate: formatDateProp, ...props }, ref) => {
    const l = useLabels();
    const locale = useLocale();
    // Zero: the signed state is a pen icon, the name in the 20/28 script without underline, and a regular date.
    const zero = usePreset() === 'zero';
    const label = labelProp ?? l.signature;
    const placeholder = placeholderProp ?? l.signHere;
    const formatDate = formatDateProp ?? ((date: Date) => defaultFormat(date, locale === 'de' ? 'de-DE' : undefined));
    const isSigned = signed ?? Boolean(name);
    const when = signedAt instanceof Date ? formatDate(signedAt) : signedAt;
    const shared = cn(
      'flex w-full items-center gap-3 rounded-dialog border border-solid px-4 py-3 text-left typography-ui',
      isSigned ? 'border-border-default bg-background' : 'border-dashed border-border-default bg-transparent',
      className,
    );

    if (isSigned) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="group"
          aria-label={label}
          data-state="signed"
          className={shared}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {zero ? <PenLine aria-hidden="true" className="h-icon-md w-icon-md shrink-0 text-icon-subtle" /> : null}
          <span
            className={cn(
              'min-w-0 flex-1 truncate font-serif italic text-foreground',
              zero ? 'typography-lead' : 'border-b border-solid border-foreground text-2xl leading-7',
            )}
          >
            {name}
          </span>
          {when ? <time className={cn('shrink-0 text-text-subtle', zero ? 'typography-ui' : 'typography-caption')}>{when}</time> : null}
        </div>
      );
    }

    if (onSign) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          aria-label={`${label}: ${placeholder}`}
          disabled={disabled}
          data-state="open"
          onClick={onSign}
          className={cn(shared, 'cursor-pointer text-text-subtle transition-colors hover:border-border-bold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-disabled', focusRing)}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {placeholder}
        </button>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="group"
        aria-label={label}
        data-state="open"
        className={cn(shared, 'text-text-subtle', disabled && 'opacity-disabled')}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {placeholder}
      </div>
    );
  },
);
SignatureBox.displayName = 'SignatureBox';

export { SignatureBox };
