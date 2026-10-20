'use client';

import { cva } from 'class-variance-authority';
import { cn } from './../../../lib/utils';
import { usePreset } from '../labels-context';
import { useStepper } from './use-stepper';

interface StepLabelProps {
  isCurrentStep?: boolean;
  // false for a step that is still ahead: the label uses the subtle text role at full opacity
  hasVisited?: boolean;
  label?: string | React.ReactNode;
  description?: string | null;
}

const labelVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const descriptionVariants = cva('', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const StepLabel = ({ isCurrentStep, hasVisited = true, label, description }: StepLabelProps) => {
  const { variant, styles, size, orientation } = useStepper();
  const zero = usePreset() === 'zero';
  const shouldRender = !!label || !!description;

  return shouldRender ? (
    <div
      aria-current={isCurrentStep ? 'step' : undefined}
      className={cn(
        'stepper__step-label-container',
        'flex flex-col',
        variant !== 'line' ? 'ms-2' : orientation === 'horizontal' && 'my-2',
        variant === 'circle-alt' && 'text-center',
        variant === 'circle-alt' && orientation === 'horizontal' && 'ms-0',
        variant === 'circle-alt' && orientation === 'vertical' && 'text-start',
        !hasVisited && 'text-text-subtle',
        styles?.['step-label-container'],
      )}
    >
      {!!label && (
        <span className={cn('stepper__step-label', zero ? (isCurrentStep ? 'typography-ui-medium' : 'typography-ui') : labelVariants({ size }), styles?.['step-label'])}>{label}</span>
      )}
      {!!description && (
        <span
          className={cn(
            'stepper__step-description',
            'text-muted-foreground',
            zero ? 'typography-caption' : descriptionVariants({ size }),
            styles?.['step-description'],
          )}
        >
          {description}
        </span>
      )}
    </div>
  ) : null;
};

export { StepLabel };
