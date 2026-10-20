'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { FileIcon } from '@/components/ui/file-icon';
import { useLabels, usePreset } from '@/components/ui/labels-context';

// Figma: Message 1242:996 (chat message: incoming/outgoing text, attachment, reactions, typing). Avatar is an exposed slot.
const bubbleVariants = cva('w-fit max-w-full', {
  variants: {
    density: {
      default: 'px-4 py-2',
      // 13px UI role for dense chat panels.
      compact: 'typography-ui px-3 py-1',
    },
    own: {
      true: '',
      false: 'bg-muted text-text-default',
    },
    // Text size of the default density: default is the 16px paragraph role, sm the 14px small role.
    size: {
      default: '',
      sm: '',
    },
    // Corner radius from the token radius tiers.
    radius: {
      item: 'rounded-item',
      control: 'rounded-control',
      surface: 'rounded-surface',
      dialog: 'rounded-dialog',
      full: 'rounded-full',
    },
    ownTone: {
      brand: '',
      neutral: '',
      // Static inverse surface for own messages: dark in light and dark mode.
      inverse: '',
    },
    // Bare drops the bubble: no fill, no padding, text on the page surface.
    bare: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { own: true, ownTone: 'brand', className: 'bg-background-brand-bold-default text-text-on-brand' },
    { own: true, ownTone: 'neutral', className: 'bg-background-neutral-active text-text-default' },
    { own: true, ownTone: 'inverse', className: 'bg-surface-inverse-static text-text-on-inverse-static' },
    { density: 'default', size: 'default', className: 'typography-p-ui' },
    // 14px UI role with its 20px line height (the `small` role is 16px, too tight for a bubble).
    { density: 'default', size: 'sm', className: 'typography-text-small' },
    { bare: true, className: 'rounded-none bg-transparent p-0 text-text-default' },
  ],
  defaultVariants: { own: false, density: 'default', size: 'default', radius: 'control', ownTone: 'brand', bare: false },
});

export interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  // Name shown above the bubble ("You" for own messages). Optional with `quiet`.
  author?: React.ReactNode;
  // Quiet variant: no visible sender. The author stays available to assistive tech; time and meta still show.
  quiet?: boolean;
  // Formatted time such as "Friday 2:20pm".
  time?: React.ReactNode;
  // Outgoing message: right aligned, brand bubble, no avatar.
  own?: boolean;
  // Colour of the own bubble. `neutral` keeps own messages without the brand colour, `inverse` uses the static inverse surface (dark in both modes). The default `brand` is the primary fill of the active theme (the Button primary role), blue in the zero theme.
  ownTone?: 'brand' | 'neutral' | 'inverse';
  // Text size of the bubble in default density: `default` is the 16px paragraph role (13px UI role in the zero preset), `sm` the 14px small role. Compact density keeps its own 13px role.
  size?: 'default' | 'sm';
  // Corner radius of the bubble from the token radius tiers. Default `control`.
  radius?: 'item' | 'control' | 'surface' | 'dialog' | 'full';
  // Reply variant without a bubble: the text sits on the page surface. Applies to incoming and own messages.
  bare?: boolean;
  // Avatar slot for incoming messages (use Avatar with AvatarOnlineIndicator).
  avatar?: React.ReactNode;
  // Text of the message. Use attachment for files.
  text?: React.ReactNode;
  attachment?: React.ReactNode;
  reactions?: React.ReactNode;
  // Shows an animated typing indicator instead of content.
  typing?: boolean;
  // `compact` sets the bubble text to the 13px UI role. `default` is unchanged.
  density?: 'default' | 'compact';
  // Where the time sits in the author row. `meta` (default, `author` in the zero preset) puts it at the end with `meta`. `author` puts it right next to the author name; `meta` stays at the end. Ignored with `quiet`, which has no visible name.
  timePlacement?: 'meta' | 'author';
  // Extra content in the author row after the time, e.g. a role chip or "edited".
  meta?: React.ReactNode;
  // Hover and focus-within action slot (react, reply, more). Use MessageActions with MessageAction buttons.
  actions?: React.ReactNode;
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, author, quiet = false, time, own = false, ownTone = 'brand', size = 'default', radius = 'control', bare = false, avatar, text, attachment, reactions, typing = false, density = 'default', timePlacement: timePlacementProp, meta, actions, ...props }, ref) => {
  const l = useLabels();
  const zero = usePreset() === 'zero';
  const timePlacement = timePlacementProp ?? (zero ? 'author' : 'meta');
  // Zero: bordered bubble with the corner on the author side square and the own header aligned to the end. Compact adds the 8px gap to the avatar.
  const zeroCompact = zero && density === 'compact';
  // Zero also caps the bubble width (36rem) so long text wraps inside the bubble and consumers need no wrapper.
  // The default 16px paragraph role becomes the 13px UI role in zero (Figma text-small); an explicit `size="sm"` or compact density keeps its own role.
  const bubbleExtra = zero ? cn('max-w-xl', density === 'default' && size === 'default' && 'typography-ui', !bare && ['border border-solid px-3 py-2', own ? 'rounded-tr-none border-transparent' : 'rounded-tl-none border-border-default']) : undefined;
  const authorNode = quiet
    ? author
      ? <span className="sr-only">{author}</span>
      : null
    : <span className="typography-ui-medium text-text-default">{author}</span>;
  const timeBesideAuthor = timePlacement === 'author' && !quiet && time != null && time !== false;
  return (
    <div ref={ref} className={cn('group flex w-full', zeroCompact ? 'gap-2' : 'gap-3', own && 'justify-end', className)} {...props}>
      {!own && avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div className={cn('relative flex min-w-0 max-w-full flex-col gap-1', own && 'items-end', !own && 'flex-1')}>
        {quiet && !time && !meta ? (
          authorNode
        ) : (
        <div className={cn('flex w-full items-baseline gap-2', quiet || (zero && own) ? 'justify-end' : 'justify-between')}>
          {timeBesideAuthor ? (
            <span data-time-placement="author" className="flex min-w-0 items-baseline gap-2">
              {authorNode}
              <span className={cn('text-text-subtle', zero ? 'typography-micro' : 'typography-ui')}>{time}</span>
            </span>
          ) : (
            authorNode
          )}
          {(time && !timeBesideAuthor) || meta ? (
            <span className="flex items-baseline gap-2 typography-ui text-text-subtle">
              {time && !timeBesideAuthor ? <span>{time}</span> : null}
              {meta}
            </span>
          ) : null}
        </div>
        )}
        {actions && !typing ? (
          <div
            data-message-actions=""
            className={cn(
              'absolute top-5 z-raised opacity-0 transition-opacity motion-reduce:transition-none',
              'group-hover:opacity-100 group-focus-within:opacity-100',
              own ? 'left-0' : 'right-0',
            )}
          >
            {actions}
          </div>
        ) : null}
        {typing ? (
          <div role="status" aria-label={l.typing} className={cn(bubbleVariants({ own, ownTone, density, size, radius }), 'flex items-center gap-1')}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1 w-1 animate-pulse rounded-full bg-icon-subtle motion-reduce:animate-none" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <>
            {text ? <div className={cn(bubbleVariants({ own, ownTone, bare, density, size, radius }), bubbleExtra)}>{text}</div> : null}
            {attachment}
            {reactions}
          </>
        )}
      </div>
    </div>
  );
  },
);
Message.displayName = 'Message';

export interface MessageAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  size?: React.ReactNode;
  // Glyph in a round tile. Without it a FileIcon shows the type of a string `name`.
  icon?: React.ReactNode;
}

const MessageAttachment = React.forwardRef<HTMLDivElement, MessageAttachmentProps>(({ className, name, size, icon, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex w-full items-center gap-3 rounded-control border border-solid border-border bg-card p-3', className)}
    {...props}
  >
    {icon ? (
      <span className="flex h-avatar-md w-avatar-md shrink-0 items-center justify-center rounded-full bg-muted text-icon-default">{icon}</span>
    ) : (
      <FileIcon name={typeof name === 'string' ? name : undefined} size="xs" />
    )}
    <span className="flex min-w-0 flex-col">
      <span className="typography-p-ui truncate text-text-default">{name}</span>
      {size ? <span className="typography-ui text-text-subtle">{size}</span> : null}
    </span>
  </div>
));
MessageAttachment.displayName = 'MessageAttachment';

export interface MessageReactionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emoji?: React.ReactNode;
  // Icon reaction (Figma _Message reaction Type=Icon), for example a thumbs-up. Used instead of `emoji`; name the reaction with `aria-label`.
  icon?: React.ReactNode;
  count?: number;
  // You reacted with this emoji.
  active?: boolean;
}

const MessageReaction = React.forwardRef<HTMLButtonElement, MessageReactionProps>(
  ({ className, emoji, icon, count, active = false, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 typography-ui text-text-default transition-colors',
        active ? 'bg-background-brand-subtle' : 'bg-muted',
        'hover:bg-muted-strong',
        ...focusRing,
        className,
      )}
      {...props}
    >
      {icon != null ? (
        <span aria-hidden="true" data-reaction-icon="" className="flex shrink-0 text-icon-subtle [&>svg]:h-icon-xs [&>svg]:w-icon-xs">
          {icon}
        </span>
      ) : (
        <span>{emoji}</span>
      )}
      {count !== undefined ? <span>{count}</span> : null}
    </button>
  ),
);
MessageReaction.displayName = 'MessageReaction';

const MessageReactions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const l = useLabels();
  return <div ref={ref} role="group" aria-label={l.reactions} className={cn('flex flex-wrap items-center gap-1', className)} {...props} />;
});
MessageReactions.displayName = 'MessageReactions';

export type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>;

// Compact toolbar surface for the Message actions slot. Children are MessageAction buttons.
const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(({ className, ...props }, ref) => {
  const l = useLabels();
  return (
    <div
      ref={ref}
      role="group"
      aria-label={l.messageActions}
      className={cn('flex items-center gap-1 rounded-control border border-solid border-border bg-card p-1 shadow-popover', className)}
      {...props}
    />
  );
});
MessageActions.displayName = 'MessageActions';

export interface MessageActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  // Accessible name, required because the button is usually icon only.
  'aria-label': string;
}

const MessageAction = React.forwardRef<HTMLButtonElement, MessageActionProps>(({ className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex h-6 w-6 items-center justify-center rounded-item text-icon-default transition-colors',
      'hover:bg-muted active:bg-muted-strong disabled:cursor-not-allowed disabled:opacity-disabled [&_svg]:h-icon-sm [&_svg]:w-icon-sm',
      ...focusRing,
      className,
    )}
    {...props}
  />
));
MessageAction.displayName = 'MessageAction';

export { Message, MessageAction, MessageActions, MessageAttachment, MessageReaction, MessageReactions };
