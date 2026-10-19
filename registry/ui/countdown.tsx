'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { useLabels } from '@/components/ui/labels-context';

export interface CountdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  // Target moment as Date, ISO string or epoch milliseconds.
  to: Date | string | number;
  // Called once when the target is reached.
  onComplete?: () => void;
  // Clock source, injectable for tests and server-synchronised time.
  now?: () => number;
  // Tick interval in ms. Default 1000.
  intervalMs?: number;
  // Hides the days segment when it is zero.
  hideEmptyDays?: boolean;
  // Visible title or announcement text, e.g. "Launch in". Added to the accessible name.
  label?: string;
  // Visible content once the target is reached, in place of the 00 digits. Defaults to the "Time's up" label. Pass false to keep the zeroed digits.
  finishedText?: React.ReactNode;
  // `blocks` is the segmented display (default). `inline` is one text line such as "2d 4h 12m" that drops leading zero units, for headers and badges.
  variant?: 'blocks' | 'inline';
}

const pad = (value: number) => String(value).padStart(2, '0');

// Split a remaining duration in ms into whole units. Negative values count as zero.
export const splitDuration = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60, done: total === 0 };
};

// Countdown to a moment. The ticking digits are hidden from screen readers. A polite live region announces the remaining time once a minute and the end.
const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(
  ({ className, to, onComplete, now = Date.now, intervalMs = 1000, hideEmptyDays = false, label, finishedText, variant = 'blocks', ...props }, ref) => {
    const l = useLabels();
    const target = React.useMemo(() => new Date(to).getTime(), [to]);
    const [remaining, setRemaining] = React.useState(() => target - now());
    const completedRef = React.useRef(false);
    const onCompleteRef = React.useRef(onComplete);
    onCompleteRef.current = onComplete;
    const nowRef = React.useRef(now);
    nowRef.current = now;

    React.useEffect(() => {
      completedRef.current = false;
      const tick = () => {
        const next = target - nowRef.current();
        setRemaining(next);
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      };
      tick();
      const id = setInterval(tick, intervalMs);
      return () => clearInterval(id);
    }, [target, intervalMs]);

    const { days, hours, minutes, seconds, done } = splitDuration(remaining);
    const segments = [
      { key: 'days', value: days, text: l.countdownDays, hidden: hideEmptyDays && days === 0 },
      { key: 'hours', value: hours, text: l.countdownHours, hidden: false },
      { key: 'minutes', value: minutes, text: l.countdownMinutes, hidden: false },
      { key: 'seconds', value: seconds, text: l.countdownSeconds, hidden: false },
    ].filter((segment) => !segment.hidden);
    // Coarse announcement: changes once per minute so the live region stays calm.
    const announcement = done
      ? l.countdownEnded
      : [label, `${days} ${l.countdownDays}, ${hours} ${l.countdownHours}, ${minutes} ${l.countdownMinutes}`].filter(Boolean).join(' ');

    if (variant === 'inline') {
      // Largest units first, leading zero units dropped: d h m, then h m, then m s.
      const parts =
        days > 0
          ? [`${days}${l.countdownDaysShort}`, `${hours}${l.countdownHoursShort}`, `${minutes}${l.countdownMinutesShort}`]
          : hours > 0
            ? [`${hours}${l.countdownHoursShort}`, `${minutes}${l.countdownMinutesShort}`]
            : [`${minutes}${l.countdownMinutesShort}`, `${seconds}${l.countdownSecondsShort}`];
      return (
        <div ref={ref} role="timer" data-done={done || undefined} data-variant="inline" className={cn('inline-flex items-baseline gap-1 whitespace-nowrap', className)} {...props}>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
          {done && finishedText !== false ? (
            <span data-countdown-finished="" className="typography-ui-semibold text-text-default">
              {finishedText ?? l.countdownFinished}
            </span>
          ) : (
            <span aria-hidden="true" className="typography-ui-semibold tabular-nums text-text-default">
              {parts.join(' ')}
            </span>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} role="timer" data-done={done || undefined} className={cn('flex flex-col gap-2', className)} {...props}>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        {done && finishedText !== false ? (
          <p data-countdown-finished="" className="typography-display-sm m-0 text-text-default">
            {finishedText ?? l.countdownFinished}
          </p>
        ) : (
        <div aria-hidden="true" className="flex items-start gap-4">
          {segments.map((segment) => (
            <div key={segment.key} className="flex w-16 flex-col items-center gap-1">
              <span className="typography-display-sm tabular-nums text-text-default">{pad(segment.value)}</span>
              <span className="typography-text-extra-small text-text-subtle">{segment.text}</span>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  },
);
Countdown.displayName = 'Countdown';

export { Countdown };
