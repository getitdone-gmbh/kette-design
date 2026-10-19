import type { Meta, StoryObj } from '@storybook/react';
import { addDays, startOfDay, subDays } from 'date-fns';
import { useState } from 'react';

import { Button } from './button';
import { DatePicker, DatePickerModal, DatePickerPanel, type DatePickerValue } from './date-picker';

const today = startOfDay(new Date());

const meta = {
  title: 'Primitives/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { 'aria-label': 'Date' },
  argTypes: { mode: { control: { type: 'select' }, options: ['single', 'range'] } },
  decorators: [
    (Story) => (
      <div className="min-h-[28rem] w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { defaultValue: today } };
export const Placeholder: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: today } };

export const Range: Story = {
  args: {
    mode: 'range',
    defaultValue: { from: subDays(today, 3), to: addDays(today, 3) },
    placeholder: 'Select dates',
  },
};

export const RangeWithPresetsAndActions: Story = {
  args: {
    mode: 'range',
    actions: true,
    placeholder: 'Select dates',
    presets: [
      { label: 'Last 7 days', value: { from: subDays(today, 6), to: today } },
      { label: 'Last 30 days', value: { from: subDays(today, 29), to: today } },
    ],
  },
};

export const Panel: Story = {
  render: function Render() {
    const [value, setValue] = useState<DatePickerValue>(today);
    return (
      <div className="w-fit rounded-surface border border-solid border-hairline">
        <DatePickerPanel value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const Modal: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open date picker modal</Button>
        <DatePickerModal open={open} onOpenChange={setOpen} mode="range" />
      </>
    );
  },
};
