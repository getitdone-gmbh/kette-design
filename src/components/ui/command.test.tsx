import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Command,
  CommandEmptyState,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandKbd,
  CommandKeys,
  CommandDialog,
  CommandList,
  CommandShortcut,
} from './command';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= ResizeObserverStub;
  Element.prototype.scrollIntoView ??= () => {};
});

describe('Command additions', () => {
  it('keeps the plain shortcut text unchanged', () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);
    expect(screen.getByText('⌘K')).toHaveClass('ml-auto', 'text-xs');
  });

  it('shows a trailing shortcut hint in the input', () => {
    render(
      <Command>
        <CommandInput placeholder="Search" shortcut={<CommandKbd>⌘/</CommandKbd>} />
        <CommandList />
      </Command>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('⌘/')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders stacked item text and a key sequence, and selects with the keyboard', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="olivia" onSelect={onSelect}>
            <CommandItemText title="Olivia Rhye" description="@olivia" />
            <CommandKeys keys={['⌘K', 'P']} />
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('@olivia')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
    await user.type(screen.getByRole('combobox'), '{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders the empty state with actions', () => {
    render(
      <CommandEmptyState title="No projects found" description="Try again" actions={<button>New project</button>} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('No projects found');
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument();
  });
});

describe('CommandDialog', () => {
  it('forwards cmdk root props such as shouldFilter to Command', async () => {
    const user = userEvent.setup();
    render(
      <CommandDialog open shouldFilter={false} label="Palette">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="alpha">Alpha</CommandItem>
          <CommandItem value="beta">Beta</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    await user.type(screen.getByPlaceholderText('Search'), 'zzz');
    // without filtering, both items stay visible even though neither matches
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
