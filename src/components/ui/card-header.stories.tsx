import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Patterns/Card header',
  component: Card,
  tags: ['autodocs'],
  // onClick turns the card into a button, so it must not get an auto action arg
  parameters: { actions: { argTypesRegex: '^on(?!Click)[A-Z].*' } },
  argTypes: { variant: { control: 'select', options: ['default', 'surface'] } },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithActions: Story = {
  render: (args) => (
    <Card {...args} className="max-w-xl">
      <CardHeader
        divider
        actions={
          <>
            <Badge variant="subtle">12/20 seats</Badge>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontal />
            </Button>
          </>
        }
      >
        <CardTitle>Team members</CardTitle>
        <CardDescription>Manage your team members and their account permissions.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">Body</CardContent>
    </Card>
  ),
};

export const Accent: Story = {
  render: (args) => (
    <Card {...args} className="max-w-xl">
      <CardHeader accent>
        <CardTitle>Team members</CardTitle>
      </CardHeader>
    </Card>
  ),
};

export const SurfaceInteractive: Story = {
  args: { variant: 'surface', onClick: () => {} },
  render: (args) => (
    <Card {...args} className="max-w-sm" aria-label="Open demands">
      <CardHeader>
        <CardTitle>Open demands</CardTitle>
        <CardDescription>Three demands wait for a shortlist.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

export const SurfaceSelected: Story = { ...SurfaceInteractive, args: { variant: 'surface', onClick: () => {}, selected: true } };
