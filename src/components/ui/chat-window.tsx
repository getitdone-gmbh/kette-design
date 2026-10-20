'use client';

import { Minus, X } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import type { HeadingTag } from './heading-tag';
import type { LabelOverrides } from './labels';
import { useLabels } from './labels-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export interface ChatWindowView {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

const heightStyle = {
  sm: 'h-80',
  md: 'h-96',
  // Content area height (viewport minus top bar) minus the bottom-4 float offset and the inset token, so the window never overlaps the top bar.
  content: 'h-[calc(theme(height.content)-theme(spacing.4)-var(--size-inset))]',
} as const;

const paddingStyle = { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6' } as const;

export interface ChatWindowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  // Heading element of the title, so the window fits the document outline. Default h2.
  titleAs?: HeadingTag;
  // Collapses the body to the header bar. Controlled by the consumer.
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  // Second header line under the title, for example the assistant role or a status. Describes the dialog.
  subtitle?: React.ReactNode;
  // Window height when expanded. `content` fills the content area below the top bar. Default `md`.
  height?: keyof typeof heightStyle;
  // Body padding. Default `md`.
  padding?: keyof typeof paddingStyle;
  // Several views: a tab list under the fixed header switches the scrolling body. Replaces `children`.
  views?: ChatWindowView[];
  // Controlled view id.
  view?: string;
  defaultView?: string;
  onViewChange?: (id: string) => void;
  // Accessible name of the view tab list. Defaults to the title text when it is a string.
  viewsLabel?: string;
  // Slot in the header before the window buttons, e.g. a status badge or a menu.
  headerActions?: React.ReactNode;
  // Message list and other content. Scrolls when it overflows.
  children?: React.ReactNode;
  // Composer below the body.
  footer?: React.ReactNode;
  // `fixed` floats over the window, `absolute` floats inside a relative container.
  positioning?: 'fixed' | 'absolute';
  side?: 'right' | 'left';
  // Moves focus into the window when it opens and back to the opener when it closes. Default true.
  manageFocus?: boolean;
  closeLabel?: string;
  minimizeLabel?: string;
  restoreLabel?: string;
}

// Floating non-modal chat window: the page behind stays usable. Escape inside the window closes it.
const ChatWindow = React.forwardRef<HTMLElement, ChatWindowProps>(
  (
    {
      className,
      open,
      onOpenChange,
      title,
      titleAs: Title = 'h2',
      subtitle,
      height = 'md',
      padding = 'md',
      views,
      view,
      defaultView,
      onViewChange,
      viewsLabel,
      minimized = false,
      onMinimizedChange,
      headerActions,
      children,
      footer,
      positioning = 'fixed',
      side = 'right',
      manageFocus = true,
      closeLabel,
      minimizeLabel,
      restoreLabel,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const labels: LabelOverrides = { close: closeLabel, chatMinimize: minimizeLabel, chatRestore: restoreLabel };
    const l = useLabels(labels);
    const titleId = React.useId();
    const subtitleId = React.useId();
    const innerRef = React.useRef<HTMLElement | null>(null);
    const openerRef = React.useRef<HTMLElement | null>(null);

    const setRefs = (node: HTMLElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    React.useEffect(() => {
      if (!open || !manageFocus) return undefined;
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      innerRef.current?.focus();
      return () => {
        const opener = openerRef.current;
        if (opener && document.contains(opener)) opener.focus();
      };
    }, [open, manageFocus]);

    if (!open) return null;
    const toggleLabel = minimized ? l.chatRestore : l.chatMinimize;
    const iconButton = cn('inline-flex h-control-sm w-control-sm items-center justify-center rounded-control text-icon-subtle hover:bg-muted hover:text-foreground', focusRing);
    return (
      <section
        ref={setRefs}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        data-minimized={minimized || undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === 'Escape') {
            event.stopPropagation();
            onOpenChange?.(false);
          }
        }}
        className={cn(
          // max-w keeps both float offsets (left-4 and right-4) inside the viewport on phones.
          'z-50 flex w-sheet-sm max-w-[calc(100%-theme(spacing.8))] flex-col overflow-hidden rounded-surface border border-solid border-border bg-popover text-popover-foreground shadow-elevation-raised outline-none',
          positioning === 'fixed' ? 'fixed' : 'absolute',
          side === 'right' ? 'right-4' : 'left-4',
          'bottom-4',
          !minimized && cn(heightStyle[height], 'max-h-full'),
          className,
        )}
        {...props}
      >
        <header className="flex shrink-0 items-center gap-2 border-0 border-b border-solid border-hairline px-4 py-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <Title id={titleId} className="typography-ui-semibold m-0 truncate">
              {title}
            </Title>
            {subtitle ? (
              <p id={subtitleId} className="typography-caption m-0 truncate text-text-subtle">
                {subtitle}
              </p>
            ) : null}
          </div>
          {headerActions}
          {onMinimizedChange ? (
            <button type="button" aria-label={toggleLabel} aria-expanded={!minimized} onClick={() => onMinimizedChange(!minimized)} className={iconButton}>
              <Minus aria-hidden="true" className="h-icon-md w-icon-md" />
            </button>
          ) : null}
          <button type="button" aria-label={l.close} onClick={() => onOpenChange?.(false)} className={iconButton}>
            <X aria-hidden="true" className="h-icon-md w-icon-md" />
          </button>
        </header>
        {minimized ? null : (
          <>
            {views && views.length > 0 ? (
              <Tabs
                value={view}
                defaultValue={defaultView ?? views[0].id}
                onValueChange={onViewChange}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TabsList variant="line" aria-label={viewsLabel ?? (typeof title === 'string' ? title : undefined)} className="shrink-0 px-4">
                  {views.map((v) => (
                    <TabsTrigger key={v.id} value={v.id}>
                      {v.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {views.map((v) => (
                  <TabsContent key={v.id} value={v.id} className={cn('mt-0 min-h-0 flex-1 overflow-y-auto', paddingStyle[padding])}>
                    {v.content}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className={cn('min-h-0 flex-1 overflow-y-auto', paddingStyle[padding])}>{children}</div>
            )}
            {footer ? <div className="shrink-0 border-0 border-t border-solid border-hairline p-3">{footer}</div> : null}
          </>
        )}
      </section>
    );
  },
);
ChatWindow.displayName = 'ChatWindow';

export { ChatWindow };
