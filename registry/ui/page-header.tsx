'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Figma: Page header 1239:122640 (Style=zero|zero tabs|Record company|person|project|invoice, Divider, Attributes).
const pageHeaderTitleVariants = cva('min-w-0 text-text-default', {
  variants: {
    variant: {
      default: 'typography-h3',
      // Product page title (zero: 24/29 600).
      zero: 'typography-page-title',
      // Record head: a named object (company, person, project, invoice) with a lead tile and badges.
      record: 'typography-page-title',
      // Profile styles: large title next to a avatar, optionally under a cover banner.
      avatar: 'typography-h3',
      banner: 'typography-h3',
      'banner-avatar': 'typography-h3',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof pageHeaderTitleVariants> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  // Heading level element for the title.
  titleAs?: 'h1' | 'h2' | 'h3';
  // Breadcrumb navigation rendered above the title row.
  breadcrumbs?: React.ReactNode;
  // Avatar, logo tile or object icon before the title.
  leading?: React.ReactNode;
  // Badges or chips inline after the title.
  badges?: React.ReactNode;
  // Row of scope chips under the subtitle (for example an organisation or a product scope). Chips can carry a leading icon.
  scopeChips?: React.ReactNode;
  // Buttons, bottom-aligned on desktop and full-width stacked on mobile.
  actions?: React.ReactNode;
  // Tab list rendered under the title row.
  tabs?: React.ReactNode;
  // Attributes column to the right of the header (record layouts).
  attributes?: React.ReactNode;
  // Hairline under the header. Off for the zero style by default.
  divider?: boolean;
  // Cover image or gradient for the banner styles. Rendered full width, 240px high.
  cover?: React.ReactNode;
  // Centers the content (banner and banner-avatar styles).
  centered?: boolean;
}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    { className, variant = 'default', title, subtitle, titleAs: Title = 'h1', breadcrumbs, leading, badges, scopeChips, actions, tabs, attributes, divider, cover, centered = false, ...props },
    ref,
  ) => {
    const isBanner = variant === 'banner' || variant === 'banner-avatar';
    const showDivider = divider ?? variant === 'default';
    if (isBanner) {
      const overlap = variant === 'banner-avatar' && cover;
      return (
        <header ref={ref} className={cn('flex w-full flex-col', className)} {...props}>
          {cover ? <div className="relative h-page-header-cover w-full overflow-hidden">{cover}</div> : null}
          <div className={cn('flex w-full flex-col gap-6 px-4 md:px-8', overlap ? '-mt-10' : 'pt-6', centered && 'items-center text-center')}>
            <div className={cn('flex w-full gap-6', centered ? 'flex-col items-center' : 'flex-col md:flex-row md:items-start')}>
              {leading ? (
                <div className="h-avatar-profile w-avatar-profile shrink-0 overflow-hidden rounded-full border-4 border-solid border-surface-canvas shadow-elevation-raised [&>*]:h-full [&>*]:w-full">
                  {leading}
                </div>
              ) : null}
              <div className={cn('flex min-w-0 flex-1 flex-col gap-5', leading && !centered && 'md:pt-16', centered && 'items-center')}>
                {breadcrumbs ? <div>{breadcrumbs}</div> : null}
                <div className={cn('flex w-full flex-col gap-4', centered ? 'items-center' : 'md:flex-row md:items-start')}>
                  <div className={cn('flex min-w-0 flex-1 flex-col gap-1', centered && 'items-center')}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Title className={pageHeaderTitleVariants({ variant })}>{title}</Title>
                      {badges}
                    </div>
                    {subtitle ? <p className="typography-small text-text-subtle">{subtitle}</p> : null}
                    {scopeChips ? <div data-scope-chips="" className="flex flex-wrap items-center gap-2 pt-3">{scopeChips}</div> : null}
                  </div>
                  {actions ? <div className="flex flex-wrap items-center gap-3 max-sm:[&>*]:flex-1">{actions}</div> : null}
                </div>
                {tabs}
              </div>
            </div>
            {divider ? <hr className="m-0 h-px w-full border-0 bg-border" /> : null}
          </div>
        </header>
      );
    }
    return (
      <header
        ref={ref}
        className={cn('flex w-full flex-col lg:flex-row', variant === 'zero' ? 'gap-4' : 'gap-6', showDivider && 'border-b border-solid border-border pb-4', className)}
        {...props}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {breadcrumbs ? <div>{breadcrumbs}</div> : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {leading ? <div className="shrink-0">{leading}</div> : null}
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Title className={pageHeaderTitleVariants({ variant })}>{title}</Title>
                  {badges}
                </div>
                {subtitle ? <p className="typography-ui text-text-subtle">{subtitle}</p> : null}
                {scopeChips ? <div data-scope-chips="" className="flex flex-wrap items-center gap-2 pt-3">{scopeChips}</div> : null}
              </div>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2 max-sm:[&>*]:flex-1">{actions}</div> : null}
          </div>
          {tabs}
        </div>
        {attributes ? <div className="w-full shrink-0 lg:w-aside">{attributes}</div> : null}
      </header>
    );
  },
);
PageHeader.displayName = 'PageHeader';

export { PageHeader, pageHeaderTitleVariants };
