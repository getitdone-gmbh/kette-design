import type { Meta, StoryObj } from '@storybook/react';
import { Folder, Share2, Star, Trash2 } from 'lucide-react';

import { Chip } from './chip';
import { SecondaryNav, StorageMeter } from './secondary-nav';
import { DesignSystemProvider } from './design-system-provider';

const meta = {
  title: 'Patterns/Secondary nav',
  component: SecondaryNav,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Files',
    defaultValue: 'all',
    sections: [
      {
        id: 'spaces',
        label: 'Spaces',
        items: [
          { id: 'all', label: 'All files', icon: <Folder />, count: 128 },
          { id: 'shared', label: 'Shared with me', icon: <Share2 />, count: 4 },
          { id: 'starred', label: 'Starred', icon: <Star /> },
        ],
      },
      { id: 'other', items: [{ id: 'trash', label: 'Trash', icon: <Trash2 /> }] },
    ],
  },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
} satisfies Meta<typeof SecondaryNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Nav: Story = {};
export const Medium: Story = { args: { size: 'md' } };
export const WithStorageFooter: Story = { args: { footer: <StorageMeter used={7.2} total={10} /> } };
export const StorageNearlyFull: Story = { args: { footer: <StorageMeter used={9.6} total={10} /> } };

// Count plus a second badge, for example a status next to the number.
export const WithSecondBadge: Story = {
  args: {
    sections: [
      {
        id: 'spaces',
        items: [
          { id: 'all', label: 'All files', icon: <Folder />, count: 128 },
          { id: 'shared', label: 'Shared with me', icon: <Share2 />, count: 4, badge: <Chip size="small" variant="warning">Review</Chip> },
          { id: 'starred', label: 'Starred', icon: <Star />, badge: <Chip size="small" variant="success">Synced</Chip> },
        ],
      },
    ],
  },
};

export const Collapsed: Story = { args: { collapsed: true } };

export const WithRouterLink: Story = {
  args: {
    sections: [
      {
        id: 'spaces',
        items: [
          { id: 'all', label: 'All files', icon: <Folder />, href: '/files' },
          { id: 'shared', label: 'Shared with me', icon: <Share2 />, href: '/shared' },
        ],
      },
    ],
    // Swap the anchor for a router Link, for example <Link {...props} />.
    renderLink: (item, props) => <a data-router-link="" {...props}>{props.children}</a>,
  },
};

// Product look of the workload.zero apps: the preset switches the component defaults (set it once at the app root).
export const ZeroPreset: Story = {
  decorators: [
    (Story) => (
      <DesignSystemProvider preset="zero">
        <Story />
      </DesignSystemProvider>
    ),
  ],
};
