import type { Meta, StoryObj } from '@storybook/react';
import { Users } from 'lucide-react';

import { Chip } from './chip';
import { ListItem } from './list-item';

const meta = {
  title: 'Patterns/List item',
  component: ListItem,
  tags: ['autodocs'],
  // onClick turns the row into a button, so it must not get an auto action arg
  parameters: { actions: { argTypesRegex: '^on(?!Click)[A-Z].*' } },
  args: { title: 'Team members', subtitle: '12 Members in this Workspace', lead: <Users className="h-icon-md w-icon-md" /> },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = { args: { trailing: '12' } };
export const Navigation: Story = { args: { onClick: () => {}, chevron: true } };
export const Selected: Story = { args: { onClick: () => {}, chevron: true, selected: true } };
export const Disabled: Story = { args: { onClick: () => {}, chevron: true, disabled: true } };
export const WithStatus: Story = { args: { trailing: <Chip label="Active" variant="success" size="small" /> } };

// Link mode: a real anchor. With asChild the row styles go onto your own link component.
export const AsLink: Story = { args: { href: '#team', chevron: true } };
export const AsChildLink: Story = {
  render: (args) => (
    <ListItem {...args} chevron>
      <a href="#team">link</a>
    </ListItem>
  ),
  args: { asChild: true },
};
