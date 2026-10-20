import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import { Card } from './card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inset rule: a standalone accordion (page, menu, panel) has a px-3 inset on trigger and content so the hover wash has room. Inside a Card the inset is dropped, so labels align with the card heading. Set `inset` on the root or an item to override.',
      },
    },
  },
  argTypes: {},
  render: (args) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

type AccordionProps = React.ComponentProps<typeof Accordion>;

export const Default: Story = {
  args: {} as AccordionProps,
};

// Selected/open state — chevron rotates 180° and the content panel reveals; a `defaultValue`
// pins one item open so both the "closed" and "open" (selected) rows render side by side.
export const OpenItem: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {} as AccordionProps,
};

// Disabled state (ACCORDION-A11Y-01) — the whole item is inert: no hover/active/focus treatment,
// pointer-events are off, and the row renders at `opacity-disabled`.
export const DisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Coming soon (disabled)</AccordionTrigger>
        <AccordionContent>This section isn&apos;t available yet.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {} as AccordionProps,
};

// Multiple type — several items can be open at once; each still gets the same
// hover/focus-visible/active/disabled/selected treatment independently.
export const MultipleType: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>Both this and the next section can be open together.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>Yes, really — `type=&quot;multiple&quot;` allows it.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {} as AccordionProps,
};

// A plain container is not a Card: the accordion keeps its inset.
export const InsideCard: Story = {
  args: { type: 'single', collapsible: true },
  render: () => (
    <div className="w-full max-w-md rounded-card border border-solid border-border-default bg-card p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-b-0">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// Inside a Card the inset is dropped by default, so the labels align with the card heading (the workload.zero prototype aligns card content with the card heading).
export const InCardComponent: Story = {
  args: { type: 'single', collapsible: true },
  render: () => (
    <Card className="w-full max-w-md p-4">
      <h3 className="typography-ui-medium pb-2">Experience</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-b-0">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};

// Standalone (page body, menu, panel) the accordion keeps its px-3 inset. `inset` on the root or an item overrides the context either way.
export const InCardInsetOptIn: Story = {
  args: { type: 'single', collapsible: true },
  render: () => (
    <Card className="w-full max-w-md p-4">
      <Accordion type="single" collapsible inset className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger>Inset on purpose</AccordionTrigger>
          <AccordionContent>The label sits 12px in from the card padding.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};
