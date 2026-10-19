import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { MultiSelect, MultiSelectProvider } from './multiselect';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet';
import { SingleSelect, SingleSelectProvider } from './singleselect';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ResizeObserver = MockResizeObserver;
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const options = [
  { label: 'Mr', id: 'mr' },
  { label: 'Ms', id: 'ms' },
];

const inDialog = (children: ReactNode) => (
  <Dialog defaultOpen>
    <DialogContent>
      <DialogTitle>Contact</DialogTitle>
      <DialogDescription>Form</DialogDescription>
      {children}
    </DialogContent>
  </Dialog>
);

const inSheet = (children: ReactNode) => (
  <Sheet defaultOpen>
    <SheetContent>
      <SheetTitle>Contact</SheetTitle>
      <SheetDescription>Form</SheetDescription>
      {children}
    </SheetContent>
  </Sheet>
);

// Radix Select inside a modal Dialog never settles in jsdom (the focus scopes of the two keep trading focus), so Select is covered by the NestedLayers story in a real browser.
const cases: Array<{ name: string; open: () => Promise<void>; isOpen: () => boolean; node: ReactNode }> = [
  {
    name: 'DropdownMenu',
    node: (
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    open: async () => {
      await userEvent.click(screen.getByText('Menu'));
      await screen.findByRole('menu');
    },
    isOpen: () => screen.queryByRole('menu') !== null,
  },
  {
    name: 'Popover',
    node: (
      <Popover>
        <PopoverTrigger>Pop</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    ),
    open: async () => {
      await userEvent.click(screen.getByText('Pop'));
      await screen.findByText('Popover body');
    },
    isOpen: () => screen.queryByText('Popover body') !== null,
  },
  {
    name: 'SingleSelect',
    node: (
      <SingleSelectProvider>
        <SingleSelect id="sal" label="Salutation" options={options} selected={null} onChange={() => {}} />
      </SingleSelectProvider>
    ),
    open: async () => {
      await userEvent.click(within(screen.getByRole('combobox')).getAllByRole('button').at(-1)!);
      await screen.findByText('Ms', { selector: 'label' });
    },
    isOpen: () => screen.queryByText('Ms', { selector: 'label' }) !== null,
  },
  {
    name: 'MultiSelect',
    node: (
      <MultiSelectProvider>
        <MultiSelect id="sal" label="Salutation" options={options} selected={[]} onChange={() => {}} />
      </MultiSelectProvider>
    ),
    open: async () => {
      await userEvent.click(screen.getByPlaceholderText('Search...'));
      await screen.findByText('Ms', { selector: 'label' });
    },
    isOpen: () => screen.queryByText('Ms', { selector: 'label' }) !== null,
  },
];

describe.each([
  ['Dialog', inDialog],
  ['Sheet', inSheet],
] as const)('Escape inside a %s', (_label, wrap) => {
  it.each(cases)('closes only the open $name, not the surrounding overlay', async ({ node, open, isOpen }) => {
    render(wrap(node));
    await open();
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(isOpen()).toBe(false));
    expect(screen.queryByText('Contact')).not.toBeNull();
    // a second Escape then closes the overlay
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Contact')).toBeNull());
  });
});
