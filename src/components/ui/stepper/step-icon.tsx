'use client';

import { cva } from 'class-variance-authority';
import { CheckIcon, Loader2, X } from 'lucide-react';

import { forwardRef, useMemo } from 'react';
import { cn } from './../../../lib/utils';
import { usePreset } from '../labels-context';
import type { IconType } from './types';
import { useStepper } from './use-stepper';

interface StepIconProps {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isKeepError?: boolean;
  icon?: IconType;
  index?: number;
  checkIcon?: IconType;
  errorIcon?: IconType;
}

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-4',
      lg: 'size-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const figmaIconSizes = { sm: 'h-icon-sm w-icon-sm', md: 'h-icon-sm w-icon-sm', lg: 'h-icon-md w-icon-md' } as const;

const StepIcon = forwardRef<HTMLDivElement, StepIconProps>((props, ref) => {
  const { size, iconSize } = useStepper();
  const zero = usePreset() === 'zero';
  const figma = iconSize === 'figma';
  // Zero: the marker is 22px, so glyphs use the extra small icon and the number the 11/600 label role.
  const iconClass = zero ? 'h-icon-xs w-icon-xs' : figma ? figmaIconSizes[size ?? 'md'] : cn(iconVariants({ size }));

  const {
    isCompletedStep,
    isCurrentStep,
    isError,
    isLoading,
    isKeepError,
    icon: CustomIcon,
    index,
    checkIcon: CustomCheckIcon,
    errorIcon: CustomErrorIcon,
  } = props;

  const Icon = useMemo(() => (CustomIcon ? CustomIcon : null), [CustomIcon]);

  const ErrorIcon = useMemo(() => (CustomErrorIcon ? CustomErrorIcon : null), [CustomErrorIcon]);

  const Check = useMemo(() => (CustomCheckIcon ? CustomCheckIcon : CheckIcon), [CustomCheckIcon]);

  return useMemo(() => {
    if (isCompletedStep) {
      if (isError && isKeepError) {
        return (
          <div key="icon">
            <X className={iconClass} />
          </div>
        );
      }
      return (
        <div key="check-icon">
          <Check className={iconClass} />
        </div>
      );
    }
    if (isCurrentStep) {
      if (isError && ErrorIcon) {
        return (
          <div key="error-icon">
            <ErrorIcon className={iconClass} />
          </div>
        );
      }
      if (isError) {
        return (
          <div key="icon">
            <X className={iconClass} />
          </div>
        );
      }
      if (isLoading) {
        return <Loader2 className={cn(iconClass, 'animate-spin')} />;
      }
    }
    if (Icon) {
      return (
        <div key="step-icon">
          <Icon className={iconClass} />
        </div>
      );
    }
    return (
      <span ref={ref} key="label" className={cn(zero ? 'typography-kpi-label-strong' : figma ? 'typography-ui-medium' : 'text-md', 'text-center font-medium')}>
        {(index || 0) + 1}
      </span>
    );
  }, [isCompletedStep, isCurrentStep, isError, isLoading, Icon, index, Check, ErrorIcon, isKeepError, ref, iconClass, figma, zero]);
});

export { StepIcon };
