import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
  title: 'Primitives/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {/* DROPDOWNMENU-A11Y-03: pair the label's id with the following group's aria-labelledby
              so a screen reader announces "My Account, group" instead of an anonymous group. */}
          <DropdownMenuLabel id="dropdown-story-account-label">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup aria-labelledby="dropdown-story-account-label">
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Keyboard shortcuts
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>More...</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              New Team
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>GitHub</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
  args: {} as any,
};

// Figma "_Command dropdown menu item" Checkbox=True rows, plus the radio-group variant — both
// rendered `defaultOpen` so Chromatic/axe exercise the token-styled panel and the checked/selected
// indicator without a manual interaction step.
export const WithCheckboxAndRadioItems: Story = {
  decorators: [
    (Story) => (
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {/* DROPDOWNMENU-A11Y-03: same label/group id pairing for the checkbox run and the
              radio group below, so both read as named groups to a screen reader. */}
          <DropdownMenuLabel id="dropdown-story-appearance-label">Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup aria-labelledby="dropdown-story-appearance-label">
            <DropdownMenuCheckboxItem checked>Show toolbar</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Show status bar</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem disabled>Show panel (unavailable)</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel id="dropdown-story-panel-position-label">Panel position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="bottom" aria-labelledby="dropdown-story-panel-position-label">
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
  args: {} as any,
};

/** `variant="destructive"` renders an item in the destructive role (delete, remove, sign out). */
export const WithDestructiveItem: Story = {
  args: {
    children: (
      <>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Delete
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </>
    ),
  },
};
