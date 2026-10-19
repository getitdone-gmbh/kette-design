import type { Meta, StoryObj } from '@storybook/react';

import { AutosaveStatus } from './autosave-status';
import { DesignSystemProvider } from './design-system-provider';

const meta = {
  title: 'Patterns/Autosave status',
  component: AutosaveStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Quiet save state of an editor or form: saved, saving, unsaved changes, error and offline. A polite live region announces changes without moving focus.' } },
  },
  argTypes: { state: { control: { type: 'select' }, options: ['saved', 'saving', 'dirty', 'error', 'offline'] } },
  args: { state: 'saved' },
} satisfies Meta<typeof AutosaveStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saved: Story = {};
export const Saving: Story = { args: { state: 'saving' } };
export const Dirty: Story = { args: { state: 'dirty' } };
export const ErrorState: Story = { args: { state: 'error' } };
export const Offline: Story = { args: { state: 'offline' } };
export const CustomLabel: Story = { args: { state: 'saved', label: 'Saved 2 min ago' } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['saved', 'saving', 'dirty', 'error', 'offline'] as const).map((state) => (
        <AutosaveStatus key={state} state={state} />
      ))}
    </div>
  ),
};

// Product look of the workload.zero apps: the preset switches the component defaults (set it once at the app root).
export const ZeroPreset: Story = {
  ...AllStates,
  decorators: [
    (Story) => (
      <DesignSystemProvider preset="zero">
        <Story />
      </DesignSystemProvider>
    ),
  ],
};
