import type { Meta, StoryObj } from '@storybook/react';
import { DesignSystemProvider } from './design-system-provider';

import { Button } from './button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet';

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as any,
  decorators: [
    (Story) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Are you sure absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  ],
};

export const Localized: Story = {
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          'Provider locale `de` translates the close button and the loading and error texts. `SheetContent` takes `closeLabel`; `SheetBody` takes `loadingLabel`, `errorText` and `retryText` (the older `errorMessage` and `retryLabel` still work). Props win over the provider.',
      },
    },
  },
  render: () => (
    <DesignSystemProvider locale="de">
      <Sheet open>
        <SheetContent side="right" closeLabel="Seitenleiste zumachen">
          <SheetHeader>
            <SheetTitle>Details</SheetTitle>
            <SheetDescription>Mit eigenem closeLabel.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </DesignSystemProvider>
  ),
};

// Editor width (900) for invoice and quote editors.
export const ExtraLarge: Story = {
  args: {} as any,
  decorators: [
    () => (
      <Sheet defaultOpen>
        <SheetContent side="right" size="xl">
          <SheetHeader>
            <SheetTitle>Invoice editor</SheetTitle>
            <SheetDescription>The xl size is 900px wide and never exceeds the viewport.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  ],
};

// Padding: outside the zero preset SheetContent pads itself (`p-6`). In zero it does not, because SheetHeader, SheetSection and SheetFooter own their `px-5`.
// This is intentional so the zero anatomy never doubles up. Pass `padded` to override either default.
export const PaddingDefaults: Story = {
  args: {} as any,
  decorators: [
    () => (
      <Sheet defaultOpen>
        <SheetContent side="right" padded>
          <SheetHeader>
            <SheetTitle>Padded content</SheetTitle>
            <SheetDescription>padded is the default outside zero. The close button has a 24px target around the 16px icon.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  ],
};
