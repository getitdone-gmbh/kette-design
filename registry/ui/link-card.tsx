'use client';

import { ArrowUpRight, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';

export interface LinkCardProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'media'> {
  href: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Leading icon or image slot.
  icon?: React.ReactNode;
  // Replaces the trailing chevron.
  trailing?: React.ReactNode;
  // Image slot for `media-top`. Pass an <img> (or framework image) with its own meaningful `alt`, or alt="" when decorative.
  // The image is cropped to the aspect ratio with object-cover.
  media?: React.ReactNode;
  // `inline` is the row card, `media-top` stacks the media above the text. Defaults to `media-top` when `media` is given.
  layout?: 'inline' | 'media-top';
  mediaAspect?: 'video' | 'square';
  // Title type size. `lg` suits `media-top` cards. Default `md` is unchanged.
  titleSize?: 'md' | 'lg';
  // Heading level of the title so the card keeps its place in the document outline. Default h3.
  titleAs?: 'h2' | 'h3' | 'h4';
  // Text area padding. `lg` gives `media-top` cards more air. Default `md` is unchanged.
  padding?: 'md' | 'lg';
  // Decorative arrow in the top end corner of the text area instead of the trailing chevron. A `trailing` slot still wins its place.
  cornerArrow?: boolean;
}

const titleSizes = { md: 'typography-ui-semibold', lg: 'typography-title-sm' } as const;
const paddings = { md: 'p-5', lg: 'p-8' } as const;
const cornerOffsets = { md: 'right-5 top-5', lg: 'right-8 top-8' } as const;

const mediaAspects = { video: 'aspect-video', square: 'aspect-square' } as const;

// Whole-card link with hover and focus states and a trailing chevron that nudges on hover (respects reduced motion).
const LinkCard = React.forwardRef<HTMLAnchorElement, LinkCardProps>(
  ({ className, href, title, description, icon, trailing, media, layout, mediaAspect = 'video', titleSize = 'md', titleAs: TitleTag = 'h3', padding = 'md', cornerArrow = false, ...props }, ref) => {
    const stacked = (layout ?? (media ? 'media-top' : 'inline')) === 'media-top';
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'group flex rounded-surface border border-solid border-border bg-card text-card-foreground no-underline shadow-elevation-surface transition-colors hover:border-border-bold hover:bg-muted',
          stacked ? 'flex-col overflow-hidden' : ['items-center gap-4', paddings[padding]],
          focusRing,
          className,
        )}
        {...props}
      >
        {stacked && media ? (
          <span className={cn('block w-full overflow-hidden bg-muted [&>*]:h-full [&>*]:w-full [&>img]:object-cover', mediaAspects[mediaAspect])}>{media}</span>
        ) : null}
        <span className={cn('relative flex min-w-0 flex-1 items-center gap-4', stacked && paddings[padding], cornerArrow && 'pr-12')}>
          {icon ? <span className="flex shrink-0 items-center text-icon-default">{icon}</span> : null}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <TitleTag className={cn('m-0', titleSizes[titleSize])}>{title}</TitleTag>
            {description ? <span className="typography-ui text-text-subtle">{description}</span> : null}
          </span>
          {cornerArrow ? (
            <ArrowUpRight
              aria-hidden="true"
              data-slot="corner-arrow"
              className={cn('absolute h-icon-md w-icon-md shrink-0 text-icon-subtle transition-colors group-hover:text-icon-default', stacked ? cornerOffsets[padding] : 'right-0 top-0')}
            />
          ) : null}
          {trailing ?? (cornerArrow ? null : (
            <ChevronRight
              aria-hidden="true"
              className="h-icon-md w-icon-md shrink-0 text-icon-subtle transition-transform group-hover:text-icon-default motion-safe:group-hover:translate-x-1 motion-reduce:transition-none"
            />
          ))}
        </span>
      </a>
    );
  },
);
LinkCard.displayName = 'LinkCard';

export { LinkCard };
