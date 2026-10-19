import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './button';
import { DesignSystemProvider } from './design-system-provider';
import {
  Sheet,
  SheetBanner,
  SheetBody,
  SheetCodeBlock,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMeta,
  SheetPath,
  SheetSection,
  SheetTitle,
  type SheetContentProps,
} from './sheet';

const Example = ({ modal, ...content }: Partial<SheetContentProps> & { modal?: boolean; children?: React.ReactNode }) => (
  <Sheet open modal={modal}>
    <SheetContent {...content}>
      <SheetTitle>Edit company</SheetTitle>
      <SheetDescription>Details</SheetDescription>
      {content.children}
    </SheetContent>
  </Sheet>
);

describe('Sheet defaults (unchanged)', () => {
  it('keeps the responsive width, padding and scrim', () => {
    render(<Example />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('w-3/4', 'sm:max-w-3xl', 'p-6', 'gap-4', 'right-0');
    expect(dialog).toHaveAttribute('data-sheet-mode', 'modal');
    expect(dialog).not.toHaveAttribute('aria-busy');
    expect(document.querySelector('.bg-overlay')).toBeInTheDocument();
  });

  it('keeps the left side widths', () => {
    render(<Example side="left" />);
    expect(screen.getByRole('dialog')).toHaveClass('w-3/4', 'left-0');
  });
});

describe('Sheet sizes and modes', () => {
  it.each([
    ['sm', 'w-sheet-sm'],
    ['md', 'w-sheet-md'],
    ['lg', 'w-sheet-lg'],
    ['xl', 'w-sheet-xl'],
  ] as const)('size %s uses the sheet width token', (size, cls) => {
    render(<Example size={size} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(cls);
    expect(dialog).not.toHaveClass('w-3/4');
  });

  it('push mode has no scrim, stays open on outside interaction and rounds the leading edge', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <button>Outside</button>
        <Sheet open modal={false} onOpenChange={onOpenChange}>
          <SheetContent mode="push" size="md" padded={false}>
            <SheetTitle>Edit</SheetTitle>
            <SheetDescription>d</SheetDescription>
          </SheetContent>
        </Sheet>
      </>,
    );
    expect(document.querySelector('.bg-overlay')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('rounded-l-surface', 'p-0');
    await user.click(screen.getByText('Outside'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    // A docked sheet only closes on Escape while focus is inside it (0.15).
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
    screen.getByRole('dialog').focus();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('inset docks a push sheet below the top bar and clear of the sidebar, default stays at the window edge', () => {
    const { unmount } = render(<Example mode="push" size="md" />);
    expect(screen.getByRole('dialog')).not.toHaveClass('top-topbar');
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-sheet-inset');
    unmount();
    render(<Example mode="push" side="left" size="md" inset="topbar-sidebar" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('top-topbar', 'bottom-0', 'left-[var(--size-sidebar)]');
    expect(dialog).toHaveAttribute('data-sheet-inset', 'topbar-sidebar');
  });

  it('container portals the sheet and its scrim into the work area and positions them absolute', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<Example mode="modal" size="md" container={host} />);
    const dialog = screen.getByRole('dialog');
    expect(host).toContainElement(dialog);
    expect(dialog).toHaveClass('absolute');
    expect(dialog).toHaveAttribute('data-sheet-scoped');
    expect(host.querySelector('.bg-overlay')).toHaveClass('absolute');
    host.remove();
  });

  it('overlay mode floats with a scrim and all corners rounded', () => {
    render(<Example mode="overlay" size="md" />);
    expect(screen.getByRole('dialog')).toHaveClass('rounded-surface', 'right-2', 'inset-y-2');
    expect(document.querySelector('.bg-overlay')).toBeInTheDocument();
  });

  it('stack depth shifts the panel by the stack offset and mutes the surface', () => {
    render(<Example size="md" stackDepth={2} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('bg-muted');
    expect(dialog.style.getPropertyValue('--sheet-depth')).toBe('2');
    expect(dialog.className).toContain('right-[calc(var(--size-sheet-stack-offset)*var(--sheet-depth))]');
  });
});

describe('Sheet width', () => {
  it('keeps a floating panel inside the viewport and offers a full size', () => {
    const { unmount } = render(<Example mode="overlay" size="lg" />);
    expect(screen.getByRole('dialog').className).toContain('max-w-[calc(100%-1rem)]');
    unmount();
    render(<Example size="full" />);
    expect(screen.getByRole('dialog').className).toContain('w-full');
  });
});

describe('Sheet zero anatomy and states', () => {
  const Zero = ({ onRetry, ...props }: Partial<SheetContentProps> & { onRetry?: () => void }) => (
    <Example size="md" padded={false} {...props}>
      <SheetHeader variant="zero">
        <SheetPath>Companies / Nordwind Handel GmbH</SheetPath>
        <SheetTitle variant="zero">Edit company</SheetTitle>
        <SheetMeta>12 contacts</SheetMeta>
      </SheetHeader>
      <SheetBody onRetry={onRetry}>
        <SheetSection title="Label" description="Helper">
          <input aria-label="field" />
        </SheetSection>
      </SheetBody>
      <SheetFooter variant="zero">
        <Button>Save</Button>
      </SheetFooter>
    </Example>
  );

  it('renders path with Esc hint, sections and a saved footer by default', () => {
    render(<Zero />);
    expect(screen.getByText('Companies / Nordwind Handel GmbH')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Label' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('dialog')).toHaveAttribute('data-sheet-state', 'default');
  });

  it('loading state shows skeletons and marks the sheet busy', () => {
    render(<Zero state="loading" />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'field' })).not.toBeInTheDocument();
  });

  it('error state shows an alert with a retry that works', async () => {
    const onRetry = vi.fn();
    render(<Zero state="error" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load this content');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('dirty state shows the unsaved changes note in the footer', () => {
    render(<Zero state="dirty" />);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'field' })).toBeInTheDocument();
  });
});

describe('Sheet card and centered modes', () => {
  it('card floats a hugging panel with the card width and height cap', () => {
    render(<Example mode="card" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-sheet-mode', 'card');
    expect(dialog).toHaveClass('w-sheet-md', 'h-auto', 'rounded-surface', 'top-2', 'right-2');
    expect(dialog.className).toContain('--size-sheet-card');
    expect(dialog).not.toHaveClass('inset-y-0', 'h-full');
    expect(document.querySelector('.bg-overlay')).toBeInTheDocument();
  });

  it('card respects an explicit size and the left side', () => {
    render(<Example mode="card" size="sm" side="left" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('w-sheet-sm', 'left-2');
  });

  it('centered sits in the middle with a scrim and keeps the dialog role', () => {
    render(<Example mode="centered" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-sheet-mode', 'centered');
    expect(dialog).toHaveClass('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2', 'w-sheet-md', 'rounded-surface');
    expect(dialog).not.toHaveClass('inset-x-0');
    expect(document.querySelector('.bg-overlay')).toBeInTheDocument();
  });

  it('closes on Escape in centered mode', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent mode="centered">
          <SheetTitle>Connect bank</SheetTitle>
          <SheetDescription>Details</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('SheetBanner', () => {
  it.each([
    ['error', 'bg-background-destructive-subtle', 'alert'],
    ['warning', 'bg-background-warning-subtle', 'alert'],
    ['primary', 'bg-background-brand-subtle', 'status'],
    ['success', 'bg-background-success-subtle', 'status'],
    ['neutral', 'bg-muted', 'status'],
  ] as const)('tone %s uses the semantic background and the %s role', (tone, cls, role) => {
    render(<SheetBanner tone={tone}>Heads up</SheetBanner>);
    const banner = screen.getByRole(role);
    expect(banner).toHaveClass(cls);
    expect(banner).toHaveAttribute('data-tone', tone);
  });

  it('draws the hairline on the edge facing the content for top and bottom', () => {
    const { rerender } = render(<SheetBanner>Top</SheetBanner>);
    expect(screen.getByRole('status')).toHaveClass('border-b');
    rerender(<SheetBanner position="bottom">Bottom</SheetBanner>);
    expect(screen.getByRole('status')).toHaveClass('border-t');
    expect(screen.getByRole('status')).toHaveAttribute('data-position', 'bottom');
  });
});

describe('SheetCodeBlock', () => {
  it('renders the label header and copies the code', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<SheetCodeBlock label="Terminal" code="npm run build" language="Shell" />);
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByLabelText('Shell')).toHaveClass('typography-code-block');
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith('npm run build');
  });

  it('falls back to the Code label from the provider texts', () => {
    render(<SheetCodeBlock code="x" />);
    expect(screen.getByText('Code')).toBeInTheDocument();
  });
});

describe('Docked non-modal Sheet focus and Escape (0.15)', () => {
  const Docked = ({ modal, onOpenChange, focusOnOpen }: { modal: boolean; onOpenChange: (o: boolean) => void; focusOnOpen?: boolean }) => (
    <>
      <button type="button">Page action</button>
      <Sheet open modal={modal} onOpenChange={onOpenChange}>
        <SheetContent mode={modal ? 'modal' : 'push'} focusOnOpen={focusOnOpen}>
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>Docked</SheetDescription>
          <button type="button">Inside</button>
        </SheetContent>
      </Sheet>
    </>
  );

  it('does not steal focus on open when non-modal', async () => {
    const page = document.createElement('button');
    document.body.appendChild(page);
    page.focus();
    render(<Docked modal={false} onOpenChange={() => {}} />);
    await Promise.resolve();
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(false);
    expect(document.activeElement).toBe(page);
    page.remove();
  });

  it('still moves focus in for modal sheets and when focusOnOpen is set', async () => {
    const { unmount } = render(<Docked modal onOpenChange={() => {}} />);
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    unmount();
    render(<Docked modal={false} focusOnOpen onOpenChange={() => {}} />);
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
  });

  it('closes on Escape only while focus is inside when non-modal', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Docked modal={false} onOpenChange={onOpenChange} />);
    screen.getByRole('button', { name: 'Page action' }).focus();
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Inside' }).focus();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps Escape closing a modal sheet', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Docked modal onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Sheet close button size', () => {
  it('is control-md (40px) by default and control-xl (40px) in the zero preset', () => {
    const { unmount } = render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('h-control-md', 'w-control-md');
    unmount();
    render(
      <DesignSystemProvider preset="zero">
        <Sheet open>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetContent>
        </Sheet>
      </DesignSystemProvider>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('h-control-xl', 'w-control-xl');
  });
});
