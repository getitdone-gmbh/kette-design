import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Button } from './button';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

type TabsProps = React.ComponentProps<typeof Tabs>;

export const Default: Story = {
  args: {
    children: (
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

export const Line: Story = {
  args: {
    children: (
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList variant="line">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
        <TabsContent value="billing">Manage your billing here.</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

// At 390 px the line variant wraps onto a second row instead of overflowing.
export const LineNarrow: Story = {
  args: {
    children: (
      <Tabs defaultValue="a" className="w-[320px]">
        <TabsList variant="line">
          <TabsTrigger value="a">Overview</TabsTrigger>
          <TabsTrigger value="b">Applications</TabsTrigger>
          <TabsTrigger value="c">Interviews</TabsTrigger>
          <TabsTrigger value="d">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Overview</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

/** Count slot convention: `<TabsTrigger count={n}>`. Muted 11px tabular number after the label. */
export const WithCount: Story = {
  args: {
    children: (
      <Tabs defaultValue="open" className="w-[480px]">
        <TabsList variant="line">
          <TabsTrigger value="open" count={12}>
            Open
          </TabsTrigger>
          <TabsTrigger value="review" count={3}>
            In review
          </TabsTrigger>
          <TabsTrigger value="done" count="99+">
            Done
          </TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="open">Open items.</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

export const WithDestructiveCount: Story = {
  args: {
    children: (
      <Tabs defaultValue="frontend" orientation="vertical" className="w-[240px]">
        <TabsList variant="vertical">
          <TabsTrigger value="frontend" count="3 selected" countTone="destructive">
            Frontend
          </TabsTrigger>
          <TabsTrigger value="backend" count={12}>
            Backend
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  } as TabsProps,
};

export const WithCountSegmented: Story = {
  args: {
    children: (
      <Tabs defaultValue="open" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="open" count={12}>
            Open
          </TabsTrigger>
          <TabsTrigger value="done" count={0}>
            Done
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  } as TabsProps,
};

/** Segmented control (zero look): control-height triggers, `tab` type role, count rendered as plain text. */
export const Segment: Story = {
  args: {
    children: (
      <Tabs defaultValue="all" className="w-[400px]">
        <TabsList variant="segment" aria-label="Status">
          <TabsTrigger value="all" count={24}>
            All
          </TabsTrigger>
          <TabsTrigger value="open" count={12}>
            Open
          </TabsTrigger>
          <TabsTrigger value="done" count={0}>
            Done
          </TabsTrigger>
          <TabsTrigger value="archived" disabled>
            Archived
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">All items.</TabsContent>
        <TabsContent value="open">Open items.</TabsContent>
        <TabsContent value="done">Done items.</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

const sevenViews: Array<[string, number | undefined]> = [
  ['Mine', 7],
  ['Active', 4],
  ['In review', 1],
  ['Expired', 1],
  ['Performance', undefined],
  ['All workspaces', 38],
  ['Archived', 12],
];

// Figma Horizontal tabs Type=Segment with Tab 5..7 visible (up to seven tabs).
export const SegmentSevenTabs: Story = {
  args: {
    children: (
      <Tabs defaultValue="Mine" className="w-[640px]">
        <TabsList variant="segment" aria-label="Views">
          {sevenViews.map(([label, count]) => (
            <TabsTrigger key={label} value={label} count={count}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Mine">Mine</TabsContent>
      </Tabs>
    ),
  } as TabsProps,
};

// Narrow container: the list scrolls horizontally instead of squashing labels.
export const SegmentSevenTabsNarrow: Story = {
  args: {
    children: (
      <Tabs defaultValue="Mine" className="w-[343px]">
        <TabsList variant="segment" aria-label="Views" className="max-w-full justify-start overflow-x-auto">
          {sevenViews.map(([label, count]) => (
            <TabsTrigger key={label} value={label} count={count}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    ),
  } as TabsProps,
};

// Figma Vertical tabs: set orientation on Tabs and variant on the list.
export const Vertical: Story = {
  args: {
    children: (
      <Tabs defaultValue="details" orientation="vertical" className="flex w-[480px] gap-6">
        <TabsList variant="vertical" aria-label="Settings" className="w-[220px]">
          <TabsTrigger value="details">My details</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications" count={2}>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent value="details">Your details.</TabsContent>
          <TabsContent value="profile">Your profile.</TabsContent>
          <TabsContent value="notifications">Notification settings.</TabsContent>
          <TabsContent value="api">API keys.</TabsContent>
        </div>
      </Tabs>
    ),
  } as TabsProps,
};

// Segmented tracks sized to the Button heights: sm is 32px (Button sm), md is 40px (Button default). Without `size` the track stays 38px.
export const SizesNextToButtons: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-4">
        {(['sm', 'md'] as const).map((size) => (
          <div key={size} className="flex items-center gap-3">
            <Tabs defaultValue="a">
              <TabsList size={size} aria-label={`Segmented ${size}`}>
                <TabsTrigger value="a">Open</TabsTrigger>
                <TabsTrigger value="b">Closed</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="sr-only">Open items</TabsContent>
              <TabsContent value="b" className="sr-only">Closed items</TabsContent>
            </Tabs>
            <Button size={size}>Button {size}</Button>
            <Tabs defaultValue="a">
              <TabsList size={size} variant="segment" aria-label={`Segment ${size}`}>
                <TabsTrigger value="a">Open</TabsTrigger>
                <TabsTrigger value="b">Closed</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="sr-only">Open items</TabsContent>
              <TabsContent value="b" className="sr-only">Closed items</TabsContent>
            </Tabs>
          </div>
        ))}
      </div>
    ),
  } as TabsProps,
};
