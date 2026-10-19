import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastViewport } from './toast';
import { Toaster } from './toaster';
import { useToast } from './use-toast';

const meta = {
  title: 'Primitives/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story) => {
      const { toast } = useToast();

      return (
        <>
          <Toaster />
          <Story
            value={{
              toast,
            }}
          />
        </>
      );
    },
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, context) => {
    const { toast } = context.value;

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up ',
            description: 'Friday, February 10, 2023 at 5:57 PM',
            action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
          });
        }}
      >
        Add to calendar
      </Button>
    );
  },
};

export const FluidFont: Story = {
  render: (args, context) => {
    const { toast } = context.value;

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            clamp: true,
            title: 'Scheduled: Catch up ',
            description: 'Friday, February 10, 2023 at 5:57 PM',
            action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
          });
        }}
      >
        Add to calendar
      </Button>
    );
  },
};

// Exercises the `destructive` variant end-to-end: the token-driven solid error surface on the
// root, plus the `group-[.destructive]:` hover/focus-visible/active states on the nested
// ToastAction/ToastClose (see the TOAST-TOK-01/02 comments in toast.tsx).
export const Destructive: Story = {
  render: (args, context) => {
    const { toast } = context.value;

    return (
      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }}
      >
        Trigger error toast
      </Button>
    );
  },
};

// The action button's disabled state — e.g. while a retry is already in flight.
export const ActionDisabled: Story = {
  render: (args, context) => {
    const { toast } = context.value;

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Retrying…',
            description: 'Please wait for the current attempt to finish.',
            action: (
              <ToastAction altText="Try again" disabled>
                Try again
              </ToastAction>
            ),
          });
        }}
      >
        Trigger toast with disabled action
      </Button>
    );
  },
};

export const InverseCompact: Story = {
  name: 'Inverse (compact undo)',
  render: () => (
    <ToastProvider>
      <Toast open variant="inverse" className="w-fit">
        <ToastDescription>Task deleted</ToastDescription>
        <ToastAction altText="Undo the deletion">Undo</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};
