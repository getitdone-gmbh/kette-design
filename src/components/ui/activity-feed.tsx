'use client';

import { Bell, Clock } from 'lucide-react';
import { createContext, forwardRef, useContext, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react';

import { focusRing, transitionBase } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import type { HeadingTag } from './heading-tag';
import { DataStatePanel, SkeletonBar } from './data-state-panel';
import { intlLocaleOf, useLabels, useLocale, usePreset } from './labels-context';

// A NotificationItem placed directly in a NotificationList (without a NotificationGroup, which owns the <ul>) renders a plain block, so it never yields a list item without a list. Anywhere else it stays an <li>.
const NotificationListContext = createContext<'list' | 'block'>('list');

type FeedState = 'default' | 'loading' | 'empty' | 'error';

interface FeedStateProps {
  state?: FeedState;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  loadingLabel?: string;
  loadingRows?: number;
}

const FeedBody = ({
  state,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorTitle,
  errorDescription,
  onRetry,
  loadingLabel,
  loadingRows = 4,
  emptyIcon,
  children,
}: FeedStateProps & { emptyIcon: ReactNode; children: ReactNode; emptyTitle: string; errorTitle: string; loadingLabel: string }) => {
  const l = useLabels();
  if (state === 'loading') {
    return (
      <div role="status" aria-label={loadingLabel} className="flex flex-col gap-4 p-3">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBar className="h-avatar-sm w-avatar-sm shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <SkeletonBar className="w-2/3" />
              <SkeletonBar className="w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (state === 'empty') {
    return <DataStatePanel kind="empty" outlined icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  if (state === 'error') {
    return <DataStatePanel kind="error" title={errorTitle ?? l.couldNotLoad} description={errorDescription} onRetry={onRetry} />;
  }
  return <>{children}</>;
};

// Timeline

const timelineTone = {
  neutral: 'bg-muted text-icon-subtle',
  brand: 'bg-background-brand-subtle text-icon-brand',
  success: 'bg-background-success-subtle text-icon-success',
  destructive: 'bg-background-destructive-subtle text-icon-destructive',
} as const;

// Row density shared from Timeline to its items.
const TimelineDensityContext = createContext<'default' | 'compact'>('default');

export interface TimelineProps extends HTMLAttributes<HTMLOListElement>, FeedStateProps {
  'aria-label': string;
  // `compact` is the dense record history (Figma Activity feed Type=Timeline compact): tighter rows, semibold title, tinted icon circle.
  density?: 'default' | 'compact';
}

const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  (
    {
      className,
      density = 'default',
      state = 'default',
      emptyTitle: emptyTitleProp,
      emptyDescription,
      emptyAction,
      errorTitle: errorTitleProp,
      errorDescription: errorDescriptionProp,
      onRetry,
      loadingLabel: loadingLabelProp,
      loadingRows,
      children,
      ...props
    },
    ref,
  ) => {
    const l = useLabels();
    const emptyTitle = emptyTitleProp ?? l.timelineEmptyTitle;
    const errorTitle = errorTitleProp ?? l.timelineErrorTitle;
    const errorDescription = errorDescriptionProp ?? l.timelineErrorDescription;
    const loadingLabel = loadingLabelProp ?? l.timelineLoading;
    return (
    <FeedBody
      state={state}
      emptyIcon={<Clock className="h-icon-md w-icon-md" />}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      errorTitle={errorTitle}
      errorDescription={errorDescription}
      onRetry={onRetry}
      loadingLabel={loadingLabel}
      loadingRows={loadingRows}
    >
      <TimelineDensityContext.Provider value={density}>
        <ol ref={ref} data-density={density} className={cn('m-0 flex list-none flex-col p-0', className)} {...props}>
          {children}
        </ol>
      </TimelineDensityContext.Provider>
    </FeedBody>
  );
  },
);
Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title: ReactNode;
  // Supporting line, e.g. who did it.
  meta?: ReactNode;
  // Relative or absolute time, shown right aligned.
  time?: ReactNode;
  icon?: ReactNode;
  // Avatar shown instead of the icon dot (use Avatar size xs so the connector stays centered). Tone is ignored.
  avatar?: ReactNode;
  tone?: keyof typeof timelineTone;
}

const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(({ className, title, meta, time, icon, avatar, tone = 'neutral', ...props }, ref) => {
  const compact = useContext(TimelineDensityContext) === 'compact';
  // Zero: 28px marker with a 14px icon and a semibold title.
  const zero = usePreset() === 'zero';
  const marker = zero ? 'h-icon-tile w-icon-tile' : 'h-avatar-xs w-avatar-xs';
  return (
  <li
    ref={ref}
    className={cn(
      'typography-ui relative flex items-start gap-3',
      compact ? 'py-1' : 'py-2',
      // connector line between dots
      'before:absolute before:bottom-0 before:w-px before:bg-border-subtle last:before:hidden',
      zero ? 'before:left-[calc(var(--size-icon-tile)/2)] before:top-10' : cn('before:left-3', compact ? 'before:top-8' : 'before:top-9'),
      className,
    )}
    {...props}
  >
    {avatar ? (
      <span className={cn('relative z-raised flex shrink-0 items-center justify-center', marker)}>{avatar}</span>
    ) : (
      <span aria-hidden="true" className={cn('relative z-raised flex shrink-0 items-center justify-center rounded-full', marker, zero && '[&>svg]:h-icon-xs [&>svg]:w-icon-xs', timelineTone[tone])}>
        {icon ?? <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
    )}
    <div className="min-w-0 flex-1">
      <p className={cn('text-foreground', compact || zero ? 'typography-ui-semibold' : 'typography-ui-medium')}>{title}</p>
      {meta ? <p className="typography-text-extra-small text-muted-foreground">{meta}</p> : null}
    </div>
    {time ? <span className="typography-text-extra-small whitespace-nowrap text-muted-foreground">{time}</span> : null}
  </li>
  );
});
TimelineItem.displayName = 'TimelineItem';

// Milestone timeline

export interface Milestone {
  id: string;
  // Date of the milestone. A Date, an ISO string or a timestamp.
  date: Date | string | number;
  // Name of the milestone. Carried by the list, the axis itself is decorative.
  label: ReactNode;
}

interface MilestoneTimelineBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  milestones: Milestone[];
  // Start and end of the axis. Default: first and last milestone.
  start?: Date | string | number;
  end?: Date | string | number;
  // Cut-off date. The axis from this date on is emphasised and later dots use the brand colour.
  cutoff?: Date | string | number;
  // Edge labels under the axis. Default: the formatted start and end date.
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  caption?: ReactNode;
}

// Pass a Timeline as `children` to show it in a collapsible block, then `detailsLabel` (its summary) is required. Without children the milestones are listed for screen readers only.
export type MilestoneTimelineProps = MilestoneTimelineBaseProps &
  ({ children?: undefined; detailsLabel?: undefined } | { children: ReactNode; detailsLabel: ReactNode });

const toTime = (value: Date | string | number) => (value instanceof Date ? value.getTime() : new Date(value).getTime());

// Horizontal axis with dots at their proportional position in time (variant "milestone" of the timeline family). The axis is decorative, the list carries the information.
const MilestoneTimeline = forwardRef<HTMLElement, MilestoneTimelineProps>(
  ({ className, milestones, start, end, cutoff, startLabel, endLabel, caption, children, detailsLabel, ...props }, ref) => {
    const locale = intlLocaleOf(useLocale());
    const times = milestones.map((m) => toTime(m.date));
    const from = start !== undefined ? toTime(start) : Math.min(...times);
    const to = end !== undefined ? toTime(end) : Math.max(...times);
    const span = to - from;
    const percent = (time: number) => (span > 0 ? Math.min(Math.max(((time - from) / span) * 100, 0), 100) : 0);
    const format = (time: number) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(time);
    const cutoffTime = cutoff !== undefined ? toTime(cutoff) : undefined;
    const cutoffPercent = cutoffTime !== undefined ? percent(cutoffTime) : undefined;
    return (
      <figure ref={ref} data-variant="milestone" className={cn('m-0 flex flex-col gap-3', className)} {...props}>
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="relative mx-1 h-4">
            <span className="absolute inset-x-0 top-1/2 h-px bg-border-default" />
            {cutoffPercent !== undefined ? (
              <span data-axis-cutoff="" className="absolute top-1/2 h-px bg-border-bold" style={{ left: `${cutoffPercent}%`, right: 0 }} />
            ) : null}
            {milestones.map((m, i) => (
              <span
                key={m.id}
                data-milestone-dot=""
                className={cn(
                  'absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  cutoffTime !== undefined && times[i] >= cutoffTime ? 'bg-background-brand-bold-default' : 'bg-icon-subtle',
                )}
                style={{ left: `${percent(times[i])}%` }}
              />
            ))}
          </div>
          <div className="typography-code flex justify-between px-1 text-text-subtle">
            <span>{startLabel ?? format(from)}</span>
            <span>{endLabel ?? format(to)}</span>
          </div>
        </div>
        {caption ? <figcaption className="typography-text-small text-text-subtle">{caption}</figcaption> : null}
        {children ? (
          <details className="group">
            <summary className={cn('typography-ui-medium cursor-pointer rounded-item text-text-default', focusRing)}>{detailsLabel}</summary>
            <div className="pt-3">{children}</div>
          </details>
        ) : (
          <ol className="sr-only">
            {milestones.map((m, i) => (
              <li key={m.id}>
                {format(times[i])}: {m.label}
              </li>
            ))}
          </ol>
        )}
      </figure>
    );
  },
);
MilestoneTimeline.displayName = 'MilestoneTimeline';

// Notifications

export interface NotificationListProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>, FeedStateProps {
  title?: ReactNode;
  // Heading element of the title, so the list fits the document outline. Default h2.
  titleAs?: HeadingTag;
  // Popover is a floating surface, inbox is flat.
  variant?: 'popover' | 'inbox';
  // Shows the "Mark all read" action when set.
  onMarkAllRead?: () => void;
  markAllReadLabel?: string;
}

const NotificationList = forwardRef<HTMLElement, NotificationListProps>(
  (
    {
      className,
      title: titleProp,
      titleAs: Title = 'h2',
      variant = 'popover',
      state = 'default',
      onMarkAllRead,
      markAllReadLabel: markAllReadLabelProp,
      emptyTitle: emptyTitleProp,
      emptyDescription: emptyDescriptionProp,
      emptyAction,
      errorTitle: errorTitleProp,
      errorDescription: errorDescriptionProp,
      onRetry,
      loadingLabel: loadingLabelProp,
      loadingRows = 3,
      children,
      ...props
    },
    ref,
  ) => {
    const l = useLabels();
    const title = titleProp ?? l.notifications;
    const markAllReadLabel = markAllReadLabelProp ?? l.markAllRead;
    const emptyTitle = emptyTitleProp ?? l.notificationsEmptyTitle;
    const emptyDescription = emptyDescriptionProp ?? l.notificationsEmptyDescription;
    const errorTitle = errorTitleProp ?? l.notificationsErrorTitle;
    const errorDescription = errorDescriptionProp ?? l.notificationsErrorDescription;
    const loadingLabel = loadingLabelProp ?? l.notificationsLoading;
    return (
    <section
      ref={ref}
      aria-label={typeof title === 'string' ? title : l.notifications}
      data-variant={variant}
      className={cn(
        'flex flex-col bg-popover text-popover-foreground',
        variant === 'popover' ? 'rounded-surface border border-solid border-hairline shadow-popover' : 'bg-transparent',
        className,
      )}
      {...props}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <Title className="typography-ui-semibold">{title}</Title>
        {onMarkAllRead && state === 'default' ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className={cn('typography-text-extra-small h-6 rounded-item px-2 text-muted-foreground hover:text-foreground', transitionBase, focusRing)}
          >
            {markAllReadLabel}
          </button>
        ) : null}
      </header>
      <NotificationListContext.Provider value="block">
      <FeedBody
        state={state}
        emptyIcon={<Bell className="h-icon-md w-icon-md" />}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
        errorTitle={errorTitle}
        errorDescription={errorDescription}
        onRetry={onRetry}
        loadingLabel={loadingLabel}
        loadingRows={loadingRows}
      >
        {children}
      </FeedBody>
      </NotificationListContext.Provider>
    </section>
  );
  },
);
NotificationList.displayName = 'NotificationList';

export interface NotificationGroupProps extends HTMLAttributes<HTMLDivElement> {
  // Day label, e.g. "Today".
  label: string;
}

const NotificationGroup = forwardRef<HTMLDivElement, NotificationGroupProps>(({ className, label, children, ...props }, ref) => {
  const zero = usePreset() === 'zero';
  return (
  <div ref={ref} role="group" aria-label={label} className={className} {...props}>
    <p aria-hidden="true" className={cn('px-3 py-1', zero ? 'typography-detail text-text-subtle' : 'typography-text-extra-small bg-muted text-muted-foreground')}>
      {label}
    </p>
    <NotificationListContext.Provider value="list">
      <ul className="m-0 flex list-none flex-col p-0">{children}</ul>
    </NotificationListContext.Provider>
  </div>
  );
});
NotificationGroup.displayName = 'NotificationGroup';

export interface NotificationItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title: ReactNode;
  meta?: ReactNode;
  // Relative or absolute time, shown on the meta line after the meta text.
  time?: ReactNode;
  // Slot for an avatar.
  leading?: ReactNode;
  // Slot at the end of the row, e.g. a status chip, a menu button or an unread count.
  trailing?: ReactNode;
  unread?: boolean;
  // Inline actions, e.g. a "Reply" button.
  children?: ReactNode;
}

const NotificationItem = forwardRef<HTMLLIElement, NotificationItemProps>(({ className, title, meta, time, leading, trailing, unread = false, children, ...props }, ref) => {
  const l = useLabels();
  // Zero: the time sits in its own right column and the unread dot follows the title.
  const zero = usePreset() === 'zero';
  const Item = (useContext(NotificationListContext) === 'list' ? 'li' : 'div') as 'li';
  return (
  <Item
    ref={ref}
    data-unread={unread || undefined}
    className={cn('typography-ui relative flex items-start gap-3 border-b border-solid border-hairline px-3 py-3 last:border-b-0', className)}
    {...props}
  >
    {unread ? (
      <>
        {zero ? null : <span aria-hidden="true" className="absolute left-1 top-4 h-1 w-1 rounded-full bg-icon-brand" />}
        <span className="sr-only">{l.unreadPrefix}</span>
      </>
    ) : null}
    {leading}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className={cn(unread ? 'typography-ui-medium' : 'typography-ui', 'text-foreground', zero && unread && 'flex items-center gap-2')}>
        {title}
        {zero && unread ? <span aria-hidden="true" data-unread-dot="" className="h-2 w-2 shrink-0 rounded-full bg-background-brand-bold-default" /> : null}
      </p>
      {meta || (time && !zero) ? (
        <p className="typography-text-extra-small flex flex-wrap items-baseline gap-x-2 text-muted-foreground">
          {meta ? <span>{meta}</span> : null}
          {time && !zero ? <span className="whitespace-nowrap">{time}</span> : null}
        </p>
      ) : null}
      {children ? <div className="mt-1 flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
    {zero && time ? <span data-notification-time="" className="typography-text-extra-small shrink-0 self-start whitespace-nowrap text-text-subtle">{time}</span> : null}
    {trailing ? (
      <div data-notification-trailing="" className="flex shrink-0 items-center gap-2 self-start">
        {trailing}
      </div>
    ) : null}
  </Item>
  );
});
NotificationItem.displayName = 'NotificationItem';

export { MilestoneTimeline, NotificationGroup, NotificationItem, NotificationList, Timeline, TimelineItem };
