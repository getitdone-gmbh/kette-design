'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface MetricPanelSecondary {
  label: React.ReactNode;
  value: React.ReactNode;
}

// inverse follows the theme (light page: dark panel, dark page: light panel). inverse-fixed scopes the dark theme to the panel, so it stays dark in both modes.
const toneStyles = {
  inverse: { root: 'bg-background-inverse text-text-inverse', muted: 'text-text-inverse/80', divider: 'border-border-inverse/20' },
  'inverse-fixed': {
    root: 'dark bg-background-subtle text-text-default',
    // Border of the fixed-dark panel. Dropped with bordered={false}.
    border: 'border border-solid border-border-subtle',
    muted: 'text-text-default/80',
    divider: 'border-border-default',
  },
} as const;

const sizeStyles = {
  md: { value: 'typography-display', secondaryLabel: 'typography-ui', secondaryValue: 'typography-ui-semibold' },
  lg: { value: 'typography-digit-lg-semibold', secondaryLabel: 'typography-large', secondaryValue: 'typography-ui-lg-semibold' },
} as const;

const labelWeights = { semibold: 'typography-ui-semibold', medium: 'typography-ui-medium', regular: 'typography-ui' } as const;

// Label size above the weight roles. default keeps the 13px label role, md uses the 14px and lg the 16px role (weight comes from labelWeight).
const labelSizes = {
  md: { base: 'typography-text-small', semibold: 'font-semibold', medium: 'font-medium', regular: 'font-regular' },
  lg: { base: 'typography-p-ui', semibold: 'font-semibold', medium: 'font-medium', regular: 'font-regular' },
} as const;

// row keeps label and value on one baseline. stacked puts the label above the value, stacked-reverse puts the value above the label.
const secondaryLayouts = {
  row: { item: 'flex items-baseline justify-between gap-4' },
  stacked: { item: 'flex flex-col gap-1' },
  'stacked-reverse': { item: 'flex flex-col-reverse gap-1' },
} as const;

export interface MetricPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  label: React.ReactNode;
  // The headline result, set in the display role.
  value: React.ReactNode;
  description?: React.ReactNode;
  // Supporting figures below the result, rendered as a definition list.
  secondary?: MetricPanelSecondary[];
  // Announces changes of the result politely, for calculators that recompute while typing.
  live?: boolean;
  // inverse flips with the theme. inverse-fixed keeps the panel dark in dark mode too.
  tone?: keyof typeof toneStyles;
  // lg sets the result in the large digit role and the secondary rows one step larger.
  size?: keyof typeof sizeStyles;
  // Weight of the top label. Default semibold.
  labelWeight?: keyof typeof labelWeights;
  // Size of the top label. Default keeps the 13px role, `md` is 14px and `lg` 16px.
  labelSize?: 'default' | keyof typeof labelSizes;
  // Layout of the secondary rows. row (default), stacked (label above value) or stacked-reverse (value above label).
  secondaryLayout?: keyof typeof secondaryLayouts;
  // false drops the hairline border of the inverse-fixed tone. Default true.
  bordered?: boolean;
  // Stretches the panel to the height of its container, for equal height cards in a grid.
  fill?: boolean;
}

// Large result panel on the inverse surface (calculator results, key figures).
const MetricPanel = React.forwardRef<HTMLDivElement, MetricPanelProps>(
  ({ className, label, value, description, secondary, live = false, tone = 'inverse', size = 'md', labelWeight = 'semibold', labelSize = 'default', secondaryLayout = 'row', bordered = true, fill = false, children, ...props }, ref) => {
    const id = React.useId();
    const t = toneStyles[tone];
    const z = sizeStyles[size];
    const layout = secondaryLayouts[secondaryLayout];
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={`${id}-label`}
        data-fill={fill || undefined}
        className={cn('flex flex-col gap-4 rounded-surface p-8', t.root, 'border' in t && bordered && t.border, fill && 'h-full', className)}
        {...props}
      >
        <p id={`${id}-label`} className={cn(labelSize === 'default' ? labelWeights[labelWeight] : [labelSizes[labelSize].base, labelSizes[labelSize][labelWeight]], 'm-0', t.muted)}>
          {label}
        </p>
        <p className={cn(z.value, 'm-0 tabular-nums')} {...(live ? { 'aria-live': 'polite' as const, 'aria-atomic': true } : {})}>
          {value}
        </p>
        {description ? <p className={cn('typography-body m-0', t.muted)}>{description}</p> : null}
        {secondary && secondary.length > 0 ? (
          <dl className={cn('m-0 flex flex-col gap-2 border-t border-solid pt-4', t.divider)}>
            {secondary.map((item, index) => (
              <div key={index} className={layout.item}>
                <dt className={cn(z.secondaryLabel, t.muted)}>{item.label}</dt>
                <dd className={cn(z.secondaryValue, 'm-0 tabular-nums')}>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    );
  },
);
MetricPanel.displayName = 'MetricPanel';

export { MetricPanel };
