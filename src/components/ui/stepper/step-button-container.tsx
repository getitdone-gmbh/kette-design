'use client';

import { ReactNode } from 'react';
import { Button } from '../button';
import { useLabels, usePreset } from '../labels-context';
import { cn } from './../../../lib/utils';
import type { StepSharedProps } from './types';
import { useStepper } from './use-stepper';

type StepButtonContainerProps = StepSharedProps & {
  children?: ReactNode;
};

const themeClasses = {
  light:
    'border-transparent bg-transparent data-[active=true]:border-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary data-[current=true]:border-transparent data-[current=true]:bg-transparent data-[current=true]:text-primary',
  mid: 'bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary data-[current=true]:bg-transparent data-[current=true]:text-primary',
  dark: 'data-[current=true]:bg-primary data-[current=true]:text-primary-foreground',
} as const;

const StepButtonContainer = ({
  isCurrentStep,
  isCompletedStep,
  children,
  isError,
  isLoading: isLoadingProp,
  onClickStep,
  label,
  index,
}: StepButtonContainerProps) => {
  const { clickable, isLoading: isLoadingContext, variant, styles, theme } = useStepper();
  const l = useLabels();
  const zero = usePreset() === 'zero';

  const currentStepClickable = clickable || !!onClickStep;

  const isLoading = isLoadingProp || isLoadingContext;

  if (variant === 'line') {
    return null;
  }

  // Accessible name: "Step 2: Account, completed". The status words follow the same rules as the visual marker.
  const status = isError && (isCurrentStep || isCompletedStep) ? l.stepFailed : isCompletedStep ? l.stepCompleted : isCurrentStep ? l.stepCurrent : undefined;
  const stepName = l.stepName((index ?? 0) + 1, typeof label === 'string' ? label : undefined);
  const accessibleName = status ? `${stepName}, ${status}` : stepName;

  return (
    <Button
      variant="ghost"
      type="button"
      tabIndex={currentStepClickable ? 0 : -1}
      className={cn(
        'stepper__step-button-container',
        'pointer-events-none rounded-full p-0',
        'h-[var(--step-icon-size)] w-[var(--step-icon-size)]',
        'flex items-center justify-center rounded-full border-2 border-solid',
        'data-[clickable=true]:pointer-events-auto',
        'data-[active=true]:text-white data-[active=true]:border-primary data-[active=true]:bg-primary',
        'data-[current=true]:bg-secondary data-[current=true]:border-primary',
        'data-[invalid=true]:bg-destructive data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-foreground',
        // Zero: the marker is the 22px circle with a soft brand halo on the current step.
        zero && 'data-[current=true]:ring-halo data-[current=true]:ring-ring/ring-halo',
        theme && themeClasses[theme],
        styles?.['step-button-container'],
      )}
      data-theme={theme}
      aria-label={accessibleName}
      aria-current={isCurrentStep ? 'step' : undefined}
      data-current={isCurrentStep}
      data-invalid={isError && (isCurrentStep || isCompletedStep)}
      data-active={isCompletedStep}
      data-clickable={currentStepClickable}
      data-loading={isLoading && (isCurrentStep || isCompletedStep)}
    >
      {children}
    </Button>
  );
};

export { StepButtonContainer };
