'use client';

import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Button } from './button';
import { Input, type InputProps } from './input';
import { useLabels } from './labels-context';

// Bullets shown between the visible ends. Fixed so the masked text does not reveal the secret length.
const MASK_BULLETS = 8;
const COPIED_RESET_MS = 2000;

export interface SecretFieldProps extends Omit<InputProps, 'value' | 'defaultValue' | 'type' | 'readOnly' | 'appearance' | 'revealable' | 'trailingAction' | 'variant' | 'onChange'> {
  // The real value. It is only rendered into the field while revealed, and it is what the copy button copies.
  value: string;
  // Characters kept visible at the start and the end while masked. Short values are masked completely. Default 4.
  visibleChars?: number;
  // Controlled reveal state. Uncontrolled via `defaultRevealed`.
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  // Hides the reveal toggle or the copy button.
  revealable?: boolean;
  copyable?: boolean;
  // Called with the real value after it was copied.
  onValueCopied?: (value: string) => void;
  // Accessible names of the buttons. Win over the provider text.
  showLabel?: string;
  hideLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

// Partially masks a secret, e.g. `sk_l••••••••3f9a`. Values too short to keep both ends are masked completely.
function maskSecret(value: string, visibleChars: number) {
  if (value.length <= visibleChars * 2 + MASK_BULLETS / 2) return '•'.repeat(Math.min(Math.max(value.length, 1), MASK_BULLETS));
  return `${value.slice(0, visibleChars)}${'•'.repeat(MASK_BULLETS)}${value.slice(-visibleChars)}`;
}

// Read-only field for API keys and private URLs: partially masked, reveal toggle and a copy button that always copies the real value.
const SecretField = React.forwardRef<HTMLInputElement, SecretFieldProps>(
  (
    {
      value,
      visibleChars = 4,
      revealed: revealedProp,
      defaultRevealed = false,
      onRevealedChange,
      revealable = true,
      copyable = true,
      onValueCopied,
      showLabel,
      hideLabel,
      copyLabel,
      copiedLabel,
      disabled,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const l = useLabels({ showSecret: showLabel, hideSecret: hideLabel, copyValue: copyLabel, copied: copiedLabel });
    const [innerRevealed, setInnerRevealed] = React.useState(defaultRevealed);
    const revealed = revealedProp ?? innerRevealed;
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>();
    React.useEffect(() => () => clearTimeout(timer.current), []);

    const toggle = () => {
      if (revealedProp === undefined) setInnerRevealed(!revealed);
      onRevealedChange?.(!revealed);
    };

    const copy = async () => {
      try {
        await navigator.clipboard?.writeText(value);
      } catch {
        return;
      }
      onValueCopied?.(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    };

    const actions = (revealable ? 1 : 0) + (copyable ? 1 : 0);
    const iconClass = 'h-icon-xs w-icon-xs';

    return (
      <>
        <Input
          ref={ref}
          type="text"
          appearance="readonly"
          value={revealed ? value : maskSecret(value, visibleChars)}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          data-secret-field=""
          data-revealed={revealed || undefined}
          inputClassName={[actions === 2 ? 'pr-[calc(theme(spacing.control-sm)*2+theme(spacing.2))]' : undefined, inputClassName].filter(Boolean).join(' ') || undefined}
          trailingAction={
            actions > 0 ? (
              <>
                {revealable ? (
                  <Button type="button" variant="ghost" size="control-sm" className="w-control-sm px-0" aria-label={revealed ? l.hideSecret : l.showSecret} disabled={disabled} onClick={toggle}>
                    {revealed ? <EyeOff aria-hidden="true" className={iconClass} /> : <Eye aria-hidden="true" className={iconClass} />}
                  </Button>
                ) : null}
                {copyable ? (
                  <Button type="button" variant="ghost" size="control-sm" className="w-control-sm px-0" aria-label={copied ? l.copied : l.copyValue} disabled={disabled} onClick={copy}>
                    {copied ? <Check aria-hidden="true" className={iconClass} /> : <Copy aria-hidden="true" className={iconClass} />}
                  </Button>
                ) : null}
              </>
            ) : undefined
          }
          {...props}
        />
        <span role="status" className="sr-only">
          {copied ? l.copied : ''}
        </span>
      </>
    );
  },
);
SecretField.displayName = 'SecretField';

export { maskSecret, SecretField };
