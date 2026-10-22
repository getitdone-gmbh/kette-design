'use client';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as React from 'react';

import { overlayMotion, overlaySurface, overlaySurfaceZero } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

interface HoverCardContentProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  // Dims the page behind the card while it is open. The scrim lets pointer events through, so the card still closes when the pointer leaves.
  backdrop?: boolean;
}

const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, HoverCardContentProps>(
  ({ className, align = 'center', sideOffset = 4, backdrop = false, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    const content = (
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-dropdown outline-none',
          zero ? 'p-4 typography-ui' : 'p-2 !text-clamp-small !leading-clamp-small',
          overlaySurface,
          zero && overlaySurfaceZero,
          overlayMotion,
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    );
    if (!backdrop) return content;
    return (
      <HoverCardPrimitive.Portal>
        <div data-hover-card-layer="">
          <div
            aria-hidden="true"
            data-hover-card-backdrop=""
            className={cn('pointer-events-none fixed inset-0 z-dialog animate-in fade-in-0 motion-reduce:animate-none', zero ? 'bg-overlay-scrim' : 'bg-overlay')}
          />
          {content}
        </div>
      </HoverCardPrimitive.Portal>
    );
  },
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export type { HoverCardContentProps };
export { HoverCard, HoverCardContent, HoverCardTrigger };
