'use client';

import { CircleHelp } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLabels } from '@/components/ui/labels-context';

// Figma Help icon (1054:13): 16px icon, Open False|True, Supporting text False|True, Tooltip Top/Bottom/Left/Right (+ arrow).
export interface HelpIconProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'content'> {
  // Tooltip headline.
  content: React.ReactNode;
  // Optional second line under the headline (Figma Supporting text).
  supportingText?: React.ReactNode;
  // Accessible name of the trigger. Defaults to `Help`.
  label?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  // Shows the tooltip arrow (Figma Tooltip=Top arrow).
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const HelpIcon = React.forwardRef<HTMLButtonElement, HelpIconProps>(
  (
    { className, content, supportingText, label: labelProp, side = 'top', align = 'center', arrow = false, open, defaultOpen, onOpenChange, ...props },
    ref,
  ) => {
    const l = useLabels();
    const label = labelProp ?? l.help;
    return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={label}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full text-icon-subtle transition-colors hover:text-icon-default',
              ...focusRing,
              className,
            )}
            {...props}
          >
            <CircleHelp aria-hidden="true" className="h-icon-sm w-icon-sm" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          <p className="font-medium">{content}</p>
          {supportingText && <p className="font-normal opacity-80">{supportingText}</p>}
          {arrow && <TooltipArrow />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  },
);
HelpIcon.displayName = 'HelpIcon';

export { HelpIcon };
