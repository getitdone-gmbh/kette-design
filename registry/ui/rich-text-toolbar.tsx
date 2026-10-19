'use client';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLabels, usePreset } from '@/components/ui/labels-context';

export type RichTextAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'quote'
  | 'link'
  | 'image'
  | 'bulletList'
  | 'orderedList'
  | 'undo'
  | 'redo'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'textColor'
  | 'highlight';

const actionMeta: Record<RichTextAction, { icon: LucideIcon; shortcut?: string }> = {
  bold: { icon: Bold, shortcut: 'Ctrl B' },
  italic: { icon: Italic, shortcut: 'Ctrl I' },
  underline: { icon: Underline, shortcut: 'Ctrl U' },
  strikethrough: { icon: Strikethrough },
  code: { icon: Code, shortcut: 'Ctrl E' },
  heading1: { icon: Heading1 },
  heading2: { icon: Heading2 },
  quote: { icon: Quote },
  link: { icon: Link2, shortcut: 'Ctrl K' },
  image: { icon: ImageIcon },
  bulletList: { icon: List },
  orderedList: { icon: ListOrdered },
  undo: { icon: Undo2, shortcut: 'Ctrl Z' },
  redo: { icon: Redo2, shortcut: 'Ctrl Y' },
  alignLeft: { icon: AlignLeft },
  alignCenter: { icon: AlignCenter },
  alignRight: { icon: AlignRight },
  alignJustify: { icon: AlignJustify },
  textColor: { icon: Baseline },
  highlight: { icon: Highlighter },
};

const fullActions: RichTextAction[] = [
  'bold',
  'italic',
  'heading1',
  'heading2',
  'quote',
  'link',
  'image',
  'bulletList',
  'orderedList',
];
const messageActions: RichTextAction[] = ['bold', 'italic', 'heading1', 'heading2', 'quote'];

// Figma "WYSIWYG toolbar" Type: Default and CV editor share the full set, Message keeps the inline set.
export type RichTextToolbarType = 'default' | 'cv-editor' | 'message';

export interface RichTextToolbarButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  // Accessible name and tooltip text.
  label: string;
  icon: React.ReactNode;
  // Toggle state (`aria-pressed`). Leave undefined for a plain action button.
  pressed?: boolean;
  // Shown as a key cap in the tooltip.
  shortcut?: string;
}

const RichTextToolbarButton = React.forwardRef<HTMLButtonElement, RichTextToolbarButtonProps>(
  ({ className, label, icon, pressed, shortcut, type = 'button', ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        aria-keyshortcuts={shortcut?.replace(/ /g, '+')}
        data-toolbar-item=""
        tabIndex={-1}
        className={cn(
          'inline-flex h-control-sm w-control-sm shrink-0 items-center justify-center rounded-item text-icon-subtle transition-colors duration-150 motion-reduce:transition-none',
          'hover:bg-muted hover:text-icon-default',
          'aria-[pressed=true]:bg-background-brand-subtle aria-[pressed=true]:text-icon-brand',
          'disabled:pointer-events-none disabled:opacity-disabled',
          focusRing,
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="inline-flex h-icon-xs w-icon-xs items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        >
          {icon}
        </span>
      </button>
    );
    // A disabled button gets no tooltip: the shared trigger would wrap it in an extra tab stop.
    if (props.disabled) return button;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut ? <Kbd size="sm">{shortcut}</Kbd> : null}
        </TooltipContent>
      </Tooltip>
    );
  },
);
RichTextToolbarButton.displayName = 'RichTextToolbarButton';

const RichTextToolbarSeparator = () => <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border-subtle" />;

export interface RichTextToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: RichTextToolbarType;
  // Overrides the actions of the chosen `type`.
  actions?: RichTextAction[];
  // Actions in groups with a separator between the groups, for example [['undo', 'redo'], ['bold', 'italic'], ['alignLeft', 'alignCenter']]. Wins over `actions`.
  groups?: RichTextAction[][];
  // Toggle state per action, for example { bold: true } while the caret is in bold text.
  pressed?: Partial<Record<RichTextAction, boolean>>;
  onAction?: (action: RichTextAction) => void;
  // Content before the buttons, usually a font or style Select.
  leading?: React.ReactNode;
  disabled?: boolean;
  // Failure message from the last action (for example a link that could not be inserted).
  error?: React.ReactNode;
}

const RichTextToolbar = React.forwardRef<HTMLDivElement, RichTextToolbarProps>(
  (
    {
      className,
      type = 'default',
      actions,
      groups,
      pressed,
      onAction,
      leading,
      disabled = false,
      error,
      children,
      onKeyDown,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const l = useLabels();
    const zero = usePreset() === 'zero';
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const errorId = React.useId();
    const list = groups ? groups.flat() : (actions ?? (type === 'message' ? messageActions : fullActions));
    const renderGroup = (group: RichTextAction[]) =>
      group.map((action) => {
        const meta = actionMeta[action];
        const Icon = meta.icon;
        return (
          <RichTextToolbarButton
            key={action}
            label={l.richTextActions[action]}
            shortcut={meta.shortcut}
            icon={<Icon aria-hidden />}
            pressed={pressed?.[action] ?? false}
            disabled={disabled}
            className={zero ? 'text-icon-default' : undefined}
            onClick={() => onAction?.(action)}
          />
        );
      });
    const hasError = error != null && error !== false && error !== '';

    const items = () =>
      Array.from(innerRef.current?.querySelectorAll<HTMLElement>('[data-toolbar-item]') ?? []).filter(
        (element) => !(element as HTMLButtonElement).disabled,
      );

    // Roving tabindex: exactly one enabled item is a tab stop (the last focused one, else the first).
    React.useEffect(() => {
      const all = Array.from(innerRef.current?.querySelectorAll<HTMLElement>('[data-toolbar-item]') ?? []);
      const enabled = items();
      const active = enabled.find((element) => element.tabIndex === 0) ?? enabled[0];
      all.forEach((element) => {
        element.tabIndex = element === active ? 0 : -1;
      });
    });

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-toolbar-item]');
      if (!target) return;
      items().forEach((element) => {
        element.tabIndex = element === target ? 0 : -1;
      });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const enabled = items();
      const current = enabled.indexOf(document.activeElement as HTMLElement);
      if (current === -1) return;
      let next = -1;
      if (event.key === 'ArrowRight') next = (current + 1) % enabled.length;
      else if (event.key === 'ArrowLeft') next = (current - 1 + enabled.length) % enabled.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = enabled.length - 1;
      if (next === -1) return;
      event.preventDefault();
      enabled[next].focus();
    };

    return (
      <TooltipProvider delayDuration={300}>
        <div
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          role="toolbar"
          aria-label={l.textFormatting}
          aria-orientation="horizontal"
          aria-disabled={disabled || undefined}
          aria-describedby={hasError ? errorId : undefined}
          data-invalid={hasError || undefined}
          data-type={type}
          className={cn(
            'flex flex-wrap items-center gap-2 border-b border-solid pb-1',
            zero ? 'border-border-default bg-background-default px-4 py-2' : 'border-transparent',
            'data-[invalid=true]:border-border-destructive',
            className,
          )}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {leading}
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {groups
              ? groups.map((group, index) => (
                  <React.Fragment key={index}>
                    {index > 0 ? <RichTextToolbarSeparator /> : null}
                    {renderGroup(group)}
                  </React.Fragment>
                ))
              : renderGroup(list)}
            {children}
          </div>
          {hasError ? (
            <span id={errorId} role="alert" className="ml-auto typography-caption text-text-destructive">
              {error}
            </span>
          ) : null}
        </div>
      </TooltipProvider>
    );
  },
);
RichTextToolbar.displayName = 'RichTextToolbar';

export { RichTextToolbar, RichTextToolbarButton, RichTextToolbarSeparator };
