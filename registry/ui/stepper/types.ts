import type { LucideIcon } from 'lucide-react';

type IconType = LucideIcon | React.ComponentType<any> | undefined;

type StepItem = {
  id?: string;
  label?: string;
  description?: string;
  icon?: IconType;
  optional?: boolean;
};

interface StepOptions {
  orientation?: 'vertical' | 'horizontal';
  state?: 'loading' | 'error';
  responsive?: boolean;
  checkIcon?: IconType;
  errorIcon?: IconType;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
  mobileBreakpoint?: string;
  variant?: 'circle' | 'circle-alt' | 'line';
  expandVerticalSteps?: boolean;
  size?: 'sm' | 'md' | 'lg';
  // Indicator treatment (Figma Progress steps Theme): `light` bare icon, `mid` outlined circle, `dark` filled circle. Omit for the established look.
  theme?: 'light' | 'mid' | 'dark';
  // `figma` sizes icons and step numbers with the icon size tokens and a type role (the default classes `size-4` and `text-md` do not exist in the preset). Omit for the established look.
  iconSize?: 'default' | 'figma';
  styles?: {
    /** Styles for the main container */
    'main-container'?: string;
    /** Styles for the horizontal step */
    'horizontal-step'?: string;
    /** Styles for the horizontal step container (button and labels) */
    'horizontal-step-container'?: string;
    /** Styles for the vertical step */
    'vertical-step'?: string;
    /** Styles for the vertical step container (button and labels) */
    'vertical-step-container'?: string;
    /** Styles for the vertical step content */
    'vertical-step-content'?: string;
    /** Styles for the step button container */
    'step-button-container'?: string;
    /** Styles for the label and description container */
    'step-label-container'?: string;
    /** Styles for the step label */
    'step-label'?: string;
    /** Styles for the step description */
    'step-description'?: string;
  };
  variables?: {
    '--step-icon-size'?: string;
    '--step-gap'?: string;
  };
  scrollTracking?: boolean;
  // Controlled mode: the active step is owned by the parent. Pair with `onStepChange`. Omit for the uncontrolled `initialStep` behaviour.
  activeStep?: number;
  // Called with the next step index whenever the stepper asks to move (nextStep, prevStep, setStep, resetSteps, clicks).
  onStepChange?: (step: number) => void;
}

interface StepperProps extends StepOptions {
  children?: React.ReactNode;
  className?: string;
  initialStep: number;
  steps: StepItem[];
}

interface StepProps extends React.HTMLAttributes<HTMLLIElement> {
  label?: string | React.ReactNode;
  description?: string;
  icon?: IconType;
  state?: 'loading' | 'error';
  checkIcon?: IconType;
  errorIcon?: IconType;
  isCompletedStep?: boolean;
  isKeepError?: boolean;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
}

interface StepSharedProps extends StepProps {
  isLastStep?: boolean;
  isCurrentStep?: boolean;
  index?: number;
  hasVisited: boolean | undefined;
  isError?: boolean;
  isLoading?: boolean;
}

export type { IconType, StepItem, StepOptions, StepperProps, StepProps, StepSharedProps };
