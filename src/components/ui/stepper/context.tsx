'use client';

import { ReactNode, createContext, useState } from 'react';
import type { StepperProps } from './types';

interface StepperContextValue extends StepperProps {
  clickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  stepCount?: number;
  expandVerticalSteps?: boolean;
  activeStep: number;
  initialStep: number;
}

type StepperContextProviderProps = {
  value: Omit<StepperContextValue, 'activeStep'> & { activeStep?: number };
  children: ReactNode;
};

const StepperContext = createContext<
  StepperContextValue & {
    nextStep: () => void;
    prevStep: () => void;
    resetSteps: () => void;
    setStep: (step: number) => void;
  }
>({
  steps: [],
  activeStep: 0,
  initialStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  resetSteps: () => {},
  setStep: () => {},
});

const StepperProvider = ({ value, children }: StepperContextProviderProps) => {
  const isError = value.state === 'error';
  const isLoading = value.state === 'loading';

  const [innerStep, setInnerStep] = useState(value.initialStep);
  const controlled = value.activeStep !== undefined;
  const activeStep = controlled ? (value.activeStep as number) : innerStep;

  const setStep = (step: number) => {
    if (!controlled) setInnerStep(step);
    value.onStepChange?.(step);
  };

  const nextStep = () => setStep(activeStep + 1);

  const prevStep = () => setStep(activeStep - 1);

  const resetSteps = () => setStep(value.initialStep);

  return (
    <StepperContext.Provider
      value={{
        ...value,
        isError,
        isLoading,
        activeStep,
        nextStep,
        prevStep,
        resetSteps,
        setStep,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};

export { StepperContext, StepperProvider };
