'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';

// Figma: Hero section 10526:297196 (Breakpoint=Desktop|Mobile; props Eyebrow, Secondary action, Product shot, Headline, Supporting text).
// Desktop and Mobile are the responsive states of one component, not a prop.
export interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  headline: React.ReactNode;
  supportingText?: React.ReactNode;
  // Pill above the headline (product name, "Part of the suite").
  eyebrow?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  // Framed product screenshot or placeholder below the actions.
  productShot?: React.ReactNode;
  headlineAs?: 'h1' | 'h2';
  // `inverse` renders the hero on the inverse surface. Default is unchanged.
  tone?: 'default' | 'inverse';
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ className, headline, supportingText, eyebrow, primaryAction, secondaryAction, productShot, headlineAs: Headline = 'h1', tone = 'default', ...props }, ref) => (
    <section ref={ref} className={cn(
        'flex w-full flex-col items-center gap-10 px-6 py-12 text-center md:px-8 md:py-16',
        tone === 'inverse' ? 'bg-background-inverse text-text-inverse' : 'bg-background',
        className,
      )} {...props}>
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {eyebrow ? (
          <div
            className={cn(
              'typography-ui inline-flex items-center gap-2 rounded-full border border-solid px-3 py-1',
              tone === 'inverse' ? 'border-border-inverse/30 bg-transparent text-text-inverse' : 'border-border bg-card text-text-subtle',
            )}
          >
            {eyebrow}
          </div>
        ) : null}
        <div className="flex flex-col items-center gap-4">
          <Headline className={cn('typography-display-sm md:typography-display', tone === 'inverse' ? 'text-text-inverse' : 'text-text-default')}>{headline}</Headline>
          {supportingText ? <p className={cn('typography-lead-lg max-w-hero-copy', tone === 'inverse' ? 'text-text-inverse-subtle' : 'text-text-subtle')}>{supportingText}</p> : null}
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </div>
      {productShot ? (
        <div className="w-full max-w-page overflow-hidden rounded-surface border border-solid border-border bg-muted shadow-elevation-raised">{productShot}</div>
      ) : null}
    </section>
  ),
);
HeroSection.displayName = 'HeroSection';

export { HeroSection };
