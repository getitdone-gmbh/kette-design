import type { Meta, StoryObj } from '@storybook/react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';

import { ButtonGroup, ButtonGroupItem } from './button-group';

const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const CalendarViews = () => {
  const [view, setView] = useState('week');
  return (
    <ButtonGroup aria-label="Calendar view">
      {['day', 'week', 'month'].map((v) => (
        <ButtonGroupItem key={v} current={view === v} onClick={() => setView(v)}>
          {v[0].toUpperCase() + v.slice(1)}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
};

export const Default: Story = {
  render: () => <CalendarViews />,
};

export const IconVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ButtonGroup aria-label="Leading icons">
        <ButtonGroupItem icon={<List className="h-full w-full" />} current>
          List
        </ButtonGroupItem>
        <ButtonGroupItem icon={<LayoutGrid className="h-full w-full" />}>Grid</ButtonGroupItem>
      </ButtonGroup>
      <ButtonGroup aria-label="Icon only">
        <ButtonGroupItem icon={<List className="h-full w-full" />} aria-label="List" current />
        <ButtonGroupItem icon={<LayoutGrid className="h-full w-full" />} aria-label="Grid" />
        <ButtonGroupItem icon={<Plus className="h-full w-full" />} aria-label="Add" />
      </ButtonGroup>
      <ButtonGroup aria-label="Status">
        <ButtonGroupItem dotLeading current>
          Live
        </ButtonGroupItem>
        <ButtonGroupItem dotLeading>Paused</ButtonGroupItem>
      </ButtonGroup>
    </div>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <ButtonGroup aria-label="Range">
      <ButtonGroupItem>Previous</ButtonGroupItem>
      <ButtonGroupItem disabled>Next</ButtonGroupItem>
    </ButtonGroup>
  ),
};
