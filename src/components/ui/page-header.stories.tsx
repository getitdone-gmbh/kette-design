import type { Meta, StoryObj } from '@storybook/react';
import { Building2, Download, Plus } from 'lucide-react';

import { Avatar, AvatarFallback } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Chip } from './chip';
import { PageHeader } from './page-header';

const actions = (
  <>
    <Button variant="outline" size="sm" icon={<Download />}>Import</Button>
    <Button variant="primary" size="sm" icon={<Plus />}>New company</Button>
  </>
);

const meta = {
  title: 'Patterns/Page header',
  component: PageHeader,
  tags: ['autodocs'],
  args: { title: 'Companies', subtitle: 'All companies in this workspace. 112 records.', actions },
  argTypes: { variant: { control: 'select', options: ['default', 'zero', 'record', 'avatar', 'banner', 'banner-avatar'] } },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Zero: Story = {
  args: {
    variant: 'zero',
    actions: (
      <>
        <Button variant="outline" size="control-md" icon={<Download />}>Import</Button>
        <Button variant="primary" size="control-md" icon={<Plus />}>New company</Button>
      </>
    ),
  },
};
export const Record: Story = {
  args: {
    variant: 'record',
    title: 'Acme GmbH',
    subtitle: 'Hamburg · Software · 12 contacts',
    leading: (
      <Avatar shape="square" size="md">
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
    ),
    badges: <Badge variant="subtle">Client</Badge>,
    actions: <Button variant="primary" size="sm">New demand</Button>,
  },
};
export const WithAttributes: Story = {
  args: { variant: 'record', title: 'Acme GmbH', attributes: <p className="typography-ui text-text-subtle">Attributes column</p> },
};

const cover = <div className="h-full w-full bg-gradient-to-br from-chart-brand-3 to-chart-brand-1" />;
const profileAvatar = (
  <Avatar size="2xl">
    <AvatarFallback>OR</AvatarFallback>
  </Avatar>
);

export const Banner: Story = { args: { variant: 'banner', title: 'Team members', subtitle: 'Manage your team and permissions.', cover, divider: true } };
export const BannerCentered: Story = { args: { variant: 'banner', centered: true, title: 'Team members', subtitle: 'Manage your team.', cover } };
export const BannerAvatar: Story = { args: { variant: 'banner-avatar', title: 'Lena Hartmann', subtitle: 'lena.hartmann@example.com', cover, leading: profileAvatar } };
export const BannerAvatarCentered: Story = { args: { variant: 'banner-avatar', centered: true, title: 'Lena Hartmann', subtitle: 'lena.hartmann@example.com', cover, leading: profileAvatar } };
// Scope chips row under the subtitle (Figma Scope chips / Scope chip 2).
export const ScopeChips: Story = {
  args: {
    variant: 'zero',
    title: 'Companies',
    subtitle: 'All companies in this workspace. 112 records.',
    scopeChips: (
      <>
        <Chip size="medium" icon={<Building2 />} label="Acme GmbH" />
        <Chip chipStyle="textOnly" label="All regions" />
      </>
    ),
  },
};

export const AvatarStyle: Story = { args: { variant: 'avatar', title: 'Lena Hartmann', subtitle: 'lena.hartmann@example.com', leading: profileAvatar } };
