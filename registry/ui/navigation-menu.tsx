'use client';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { ComponentPropsWithoutRef, ElementRef, forwardRef, MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { menuItemFocusVisible } from '@/lib/recipes';
import { cn } from '@/lib/utils';

interface NavigationMenuProps extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  // Minimum distance in px between the open panel and the viewport edges. The panel is shifted sideways to keep it inside.
  collisionPadding?: number;
}

const NavigationMenu = forwardRef<ElementRef<typeof NavigationMenuPrimitive.Root>, NavigationMenuProps>(
  ({ className, children, collisionPadding, ...props }, ref) => (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn('relative z-sticky flex max-w-max flex-1 items-center justify-center', className)}
      {...props}
    >
      {children}
      <NavigationMenuViewport collisionPadding={collisionPadding} />
    </NavigationMenuPrimitive.Root>
  ),
);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.List>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-control bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-background focus-visible:ring-ring-default disabled:pointer-events-none disabled:opacity-disabled data-[active]:bg-muted data-[state=open]:bg-muted',
);

const NavigationMenuTrigger = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ',
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

interface NavigationMenuViewportProps extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {
  collisionPadding?: number;
}

const DEFAULT_COLLISION_PADDING = 16;

const NavigationMenuViewport = forwardRef<ElementRef<typeof NavigationMenuPrimitive.Viewport>, NavigationMenuViewportProps>(
  ({ className, collisionPadding = DEFAULT_COLLISION_PADDING, ...props }, ref) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    // Radix anchors the panel at the left edge of the root. Shift it left when it would run past the right viewport edge, and right when it would run past the left edge.
    const place = useCallback(() => {
      const wrapper = wrapperRef.current;
      const viewport = viewportRef.current;
      const root = wrapper?.parentElement;
      if (!wrapper || !viewport || !root) return;
      const width = viewport.offsetWidth;
      if (width === 0) return;
      const rootLeft = root.getBoundingClientRect().left;
      const available = document.documentElement.clientWidth;
      let shift = 0;
      const overflow = rootLeft + width - (available - collisionPadding);
      if (overflow > 0) shift = -overflow;
      if (rootLeft + shift < collisionPadding) shift = collisionPadding - rootLeft;
      wrapper.style.left = `${shift}px`;
    }, [collisionPadding]);
    useEffect(() => {
      const viewport = viewportRef.current;
      place();
      window.addEventListener('resize', place);
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place);
      if (viewport) observer?.observe(viewport);
      return () => {
        window.removeEventListener('resize', place);
        observer?.disconnect();
      };
    }, [place]);
    return (
      <div ref={wrapperRef} data-slot="navigation-menu-viewport-anchor" className={cn('absolute left-0 top-full flex justify-center')}>
        <NavigationMenuPrimitive.Viewport
          className={cn(
            'origin-top-center relative mt-[6px] h-[var(--radix-navigation-menu-viewport-height)] w-full max-w-[calc(100vw-theme(spacing.8))] overflow-hidden rounded-popover border border-solid border-hairline bg-popover text-popover-foreground shadow-popover duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-[0.98] md:w-[var(--radix-navigation-menu-viewport-width)]',
            className,
          )}
          ref={(node) => {
            viewportRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          {...props}
        />
      </div>
    );
  },
);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'top-full z-raised flex h-[6px] items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

const MenuListItem = forwardRef<ElementRef<'a'>, ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block',
              'select-none',
              'space-y-1',
              'rounded-item',
              'p-3',
              'leading-4',
              'no-underline',
              'outline-none',
              'transition-colors',
              'hover:bg-muted',
              'focus:bg-muted',
              ...menuItemFocusVisible,
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-4 text-text-subtle">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);
MenuListItem.displayName = 'MenuListItem';

export {
  MenuListItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
