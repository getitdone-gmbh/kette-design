'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Figma: Empty state 1182:317 Icon=Illustration (background circle, cloud, dots, centered featured icon).
const SIZES = { sm: { w: 152, h: 110 }, md: { w: 172, h: 125 }, lg: { w: 220, h: 160 } } as const;

export interface IllustrationProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  size?: keyof typeof SIZES;
  // primary uses the brand chart ramp, gray the neutral surface roles.
  tone?: 'primary' | 'gray';
  // Glyph shown on the centered badge (usually a lucide icon).
  icon?: React.ReactNode;
}

const Illustration = React.forwardRef<SVGSVGElement, IllustrationProps>(
  ({ className, size = 'md', tone = 'primary', icon, ...props }, ref) => {
    const primary = tone === 'primary';
    const dim = SIZES[size];
    return (
      <svg
        ref={ref}
        viewBox="0 0 220 160"
        width={dim.w}
        height={dim.h}
        role="presentation"
        aria-hidden="true"
        focusable="false"
        className={cn('shrink-0', className)}
        {...props}
      >
        <circle cx="110" cy="80" r="80" className={primary ? 'fill-background-brand-subtle' : 'fill-background-neutral-default'} />
        <circle cx="26" cy="18" r="8" className={primary ? 'fill-chart-brand-2' : 'fill-border-subtle'} />
        <circle cx="198" cy="126" r="6" className={primary ? 'fill-chart-brand-3' : 'fill-border-subtle'} />
        <circle cx="25" cy="138" r="10" className={primary ? 'fill-chart-brand-3' : 'fill-border-subtle'} />
        <circle cx="210" cy="46" r="10" className={primary ? 'fill-chart-brand-2' : 'fill-border-subtle'} />
        <path
          d="M52 96a26 26 0 0 1 8-47 36 36 0 0 1 68-6 28 28 0 0 1 36 32 22 22 0 0 1-4 21z"
          className="fill-background-default stroke-current text-border"
          strokeWidth="1"
        />
        <circle cx="110" cy="112" r="28" className={primary ? 'fill-icon-brand' : 'fill-icon-default'} />
        {icon ? (
          <foreignObject x="82" y="84" width="56" height="56">
            <div className="flex h-full w-full items-center justify-center text-icon-on-brand">{icon}</div>
          </foreignObject>
        ) : null}
      </svg>
    );
  },
);
Illustration.displayName = 'Illustration';

export { Illustration };
