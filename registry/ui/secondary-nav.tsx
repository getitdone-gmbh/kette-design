'use client';

import { forwardRef, useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';

import { focusRing, transitionBase } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useLabels, usePreset } from '@/components/ui/labels-context';

export interface SecondaryNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  // Count shown as text at the right, e.g. open items.
  count?: number;
  // Second badge after the count, e.g. a small Chip with a status (`Draft`, `Error`). Pass visible text, because colour alone is not enough. Hidden in the collapsed rail like the count.
  badge?: ReactNode;
  // Renders a link instead of a button.
  href?: string;
  disabled?: boolean;
}

export interface SecondaryNavSection {
  id: string;
  // Section header. Omit for an unlabelled group.
  label?: string;
  items: SecondaryNavItem[];
}

// Props to spread on the link element returned by `renderLink` (for example a Next.js Link).
export type SecondaryNavLinkProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'onClick' | 'title' | 'children'> & {
  href: string;
  'aria-current'?: 'page';
  'aria-disabled'?: true;
};

export interface SecondaryNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  'aria-label': string;
  sections: SecondaryNavSection[];
  // Selected item id, controlled.
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  // sm uses the nav item height, md the small control height.
  size?: 'sm' | 'md';
  // Slot below the list, pinned to the bottom (e.g. StorageMeter).
  footer?: ReactNode;
  // Custom link element for items with `href`, so client routing keeps working: renderLink={(item, props) => <Link {...props} />}.
  renderLink?: (item: SecondaryNavItem, props: SecondaryNavLinkProps) => ReactElement;
  // Icon-only rail. Labels stay available to screen readers and as a title, counts and section headers are hidden. Give every item an icon.
  collapsed?: boolean;
}

const itemSize = { sm: 'h-nav-item', md: 'h-control-sm' } as const;

// Vertical navigation inside a page (settings, file spaces). A nav landmark with aria-current, not a tablist.
const SecondaryNav = forwardRef<HTMLElement, SecondaryNavProps>(
  ({ className, sections, value, defaultValue, onValueChange, size = 'sm', footer, renderLink, collapsed = false, ...props }, ref) => {
    const [inner, setInner] = useState(defaultValue);
    // Zero: 8px item padding and gap, 2px list gap, subtle icons, 11px group label.
    const zero = usePreset() === 'zero';
    const current = value ?? inner;
    const select = (id: string) => {
      if (value === undefined) setInner(id);
      onValueChange?.(id);
    };
    return (
      <nav
        ref={ref}
        data-collapsed={collapsed || undefined}
        className={cn('typography-ui flex max-w-full flex-col justify-between gap-4 text-foreground', collapsed ? 'w-sidebar-collapsed' : 'w-inner-column', className)}
        {...props}
      >
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-1">
              {section.label && !collapsed ? (
                <p className={cn('text-muted-foreground', zero ? 'typography-kpi-label px-2' : 'typography-text-extra-small px-3')}>{section.label}</p>
              ) : null}
              <ul className={cn('m-0 flex list-none flex-col p-0', zero ? 'gap-micro' : 'gap-1')}>
                {section.items.map((item) => {
                  const selected = current === item.id;
                  const cls = cn(
                    'typography-ui flex w-full items-center rounded-item text-left',
                    zero ? 'gap-2 px-2' : 'gap-3 px-3',
                    collapsed && 'justify-center px-0',
                    itemSize[size],
                    selected ? 'bg-muted font-medium text-foreground' : cn(zero ? 'text-sidebar-foreground' : 'text-muted-foreground', 'hover:bg-muted hover:text-foreground'),
                    item.disabled && 'pointer-events-none opacity-disabled',
                    transitionBase,
                    focusRing,
                  );
                  const body = (
                    <>
                      {item.icon ? (
                        <span aria-hidden="true" className={cn('flex h-icon-sm w-icon-sm shrink-0 items-center justify-center', zero && !selected && 'text-icon-subtle')}>
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'sr-only')}>{item.label}</span>
                      {item.count != null && !collapsed ? <span className="typography-text-extra-small tabular-nums text-muted-foreground">{item.count}</span> : null}
                      {item.badge != null && !collapsed ? (
                        <span data-nav-badge="" className="flex shrink-0 items-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  );
                  return (
                    <li key={item.id}>
                      {item.href && renderLink ? (
                        renderLink(item, {
                          href: item.href,
                          className: cls,
                          title: collapsed ? item.label : undefined,
                          'aria-current': selected ? 'page' : undefined,
                          'aria-disabled': item.disabled ? true : undefined,
                          onClick: () => select(item.id),
                          children: body,
                        })
                      ) : item.href ? (
                        <a
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          aria-current={selected ? 'page' : undefined}
                          aria-disabled={item.disabled || undefined}
                          onClick={() => select(item.id)}
                          className={cls}
                        >
                          {body}
                        </a>
                      ) : (
                        <button type="button" title={collapsed ? item.label : undefined} aria-current={selected ? 'page' : undefined} disabled={item.disabled} onClick={() => select(item.id)} className={cls}>
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {footer && !collapsed ? <div className="px-3">{footer}</div> : null}
      </nav>
    );
  },
);
SecondaryNav.displayName = 'SecondaryNav';

export interface StorageMeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  used: number;
  total: number;
  label?: string;
  // Unit appended to the numbers, e.g. "GB".
  unit?: string;
}

// Used and total storage with a progress bar. The text carries the values, the bar is the visual.
const StorageMeter = forwardRef<HTMLDivElement, StorageMeterProps>(({ className, used, total, label: labelProp, unit = 'GB', ...props }, ref) => {
  const l = useLabels();
  const label = labelProp ?? l.storage;
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const near = percent >= 90;
  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
      <p className="typography-text-extra-small flex items-baseline justify-between gap-2 text-muted-foreground">
        <span>{label}</span>
        <span className={cn('tabular-nums', near && 'text-text-destructive')}>
          {l.storageUsed(used, total, unit)}
        </span>
      </p>
      <Progress size="sm" value={used} max={total} variant={near ? 'destructive' : 'default'} aria-label={l.storagePercentUsed(label, percent)} />
    </div>
  );
});
StorageMeter.displayName = 'StorageMeter';

export { SecondaryNav, StorageMeter };
