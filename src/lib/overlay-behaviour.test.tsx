import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../components/ui/drawer';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';

const HEADER_HEIGHT = 72;
const FOOTER_HEIGHT = 56;

const mockHeights = () => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.dataset.testid === 'bar-header') return HEADER_HEIGHT;
    if (this.dataset.testid === 'bar-footer') return FOOTER_HEIGHT;
    return 0;
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Sticky header and footer inset (WCAG 2.4.11)', () => {
  it('Sheet: a sticky header and footer report their height as scroll padding on the panel', () => {
    mockHeights();
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader data-testid="bar-header" style={{ position: 'sticky', top: 0 }}>
            <SheetTitle>Edit</SheetTitle>
            <SheetDescription>Details</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <input aria-label="First" />
          </SheetBody>
          <SheetFooter data-testid="bar-footer" style={{ position: 'sticky', bottom: 0 }}>
            <button type="button">Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.style.getPropertyValue('--sticky-inset-top')).toBe(`${HEADER_HEIGHT}px`);
    expect(panel.style.getPropertyValue('--sticky-inset-bottom')).toBe(`${FOOTER_HEIGHT}px`);
    expect(panel.className).toContain('scroll-pt-[var(--sticky-inset-top,0px)]');
    expect(panel.className).toContain('scroll-pb-[var(--sticky-inset-bottom,0px)]');
    expect(screen.getByLabelText('First').closest('[data-state]')?.className).toContain('scroll-pt-[var(--sticky-inset-top,0px)]');
  });

  it('Sheet: a header in normal flow adds no inset', () => {
    mockHeights();
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader data-testid="bar-header">
            <SheetTitle>Edit</SheetTitle>
            <SheetDescription>Details</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('dialog').style.getPropertyValue('--sticky-inset-top')).toBe('0px');
  });

  it('Dialog: sticky header and footer set the inset on the content', () => {
    mockHeights();
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="bar-header" style={{ position: 'sticky', top: 0 }}>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Text</DialogDescription>
          </DialogHeader>
          <DialogFooter data-testid="bar-footer" style={{ position: 'fixed', bottom: 0 }}>
            <button type="button">OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.style.getPropertyValue('--sticky-inset-top')).toBe(`${HEADER_HEIGHT}px`);
    expect(panel.style.getPropertyValue('--sticky-inset-bottom')).toBe(`${FOOTER_HEIGHT}px`);
    expect(panel.className).toContain('scroll-pt-[var(--sticky-inset-top,0px)]');
  });

  it('Drawer: sticky header and footer set the inset on the content', () => {
    mockHeights();
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader data-testid="bar-header" style={{ position: 'sticky', top: 0 }}>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Text</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter data-testid="bar-footer" style={{ position: 'sticky', bottom: 0 }}>
            <button type="button">OK</button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.style.getPropertyValue('--sticky-inset-top')).toBe(`${HEADER_HEIGHT}px`);
    expect(panel.style.getPropertyValue('--sticky-inset-bottom')).toBe(`${FOOTER_HEIGHT}px`);
    expect(panel.className).toContain('scroll-pb-[var(--sticky-inset-bottom,0px)]');
  });

  it('drops the inset when the bar unmounts', () => {
    mockHeights();
    const Example = ({ show }: { show: boolean }) => (
      <Sheet open>
        <SheetContent>
          <SheetTitle>Edit</SheetTitle>
          <SheetDescription>Details</SheetDescription>
          {show && (
            <SheetHeader data-testid="bar-header" style={{ position: 'sticky', top: 0 }}>
              Bar
            </SheetHeader>
          )}
        </SheetContent>
      </Sheet>
    );
    const { rerender } = render(<Example show />);
    expect(screen.getByRole('dialog').style.getPropertyValue('--sticky-inset-top')).toBe(`${HEADER_HEIGHT}px`);
    rerender(<Example show={false} />);
    expect(screen.getByRole('dialog').style.getPropertyValue('--sticky-inset-top')).toBe('');
  });
});

const Basic = ({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) => (
  <Sheet onOpenChange={onOpenChange}>
    <SheetTrigger>Open sheet</SheetTrigger>
    <SheetContent>
      <SheetTitle>Edit</SheetTitle>
      <SheetDescription>Details</SheetDescription>
      <input aria-label="Name" />
      <SheetClose>Done</SheetClose>
    </SheetContent>
  </Sheet>
);

describe('Sheet focus management', () => {
  it('focuses the panel itself when it holds nothing focusable', async () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Info</SheetTitle>
          <SheetDescription>Read only</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
  });

  it('moves focus into the sheet on open and back to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Open sheet' });
    await user.click(trigger);
    const panel = await screen.findByRole('dialog');
    expect(panel.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('returns focus to a trigger that lives in a portal', async () => {
    const user = userEvent.setup();
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(
      <Sheet>
        {createPortal(<SheetTrigger>Portal trigger</SheetTrigger>, host)}
        <SheetContent>
          <SheetTitle>Edit</SheetTitle>
          <SheetDescription>Details</SheetDescription>
          <input aria-label="Name" />
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole('button', { name: 'Portal trigger' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
    host.remove();
  });

  it('returns focus to the trigger when the trigger is re-created while the sheet is open', async () => {
    const user = userEvent.setup();
    const Example = () => {
      const [generation, setGeneration] = React.useState(0);
      return (
        <Sheet>
          <SheetTrigger key={generation}>Open sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Edit</SheetTitle>
            <SheetDescription>Details</SheetDescription>
            <button type="button" onClick={() => setGeneration((value) => value + 1)}>
              Re-render trigger
            </button>
          </SheetContent>
        </Sheet>
      );
    };
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Open sheet' }));
    await user.click(await screen.findByRole('button', { name: 'Re-render trigger' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Open sheet' })).toHaveFocus();
  });

  it('returns focus to the opener of a controlled sheet without a trigger', async () => {
    const user = userEvent.setup();
    const Example = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Plain opener
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetTitle>Edit</SheetTitle>
              <SheetDescription>Details</SheetDescription>
              <input aria-label="Name" />
            </SheetContent>
          </Sheet>
        </>
      );
    };
    render(<Example />);
    const opener = screen.getByRole('button', { name: 'Plain opener' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(opener).toHaveFocus();
  });

  it('returns focus to a controlled opener that was re-created while the sheet was open', async () => {
    const user = userEvent.setup();
    const Example = () => {
      const [open, setOpen] = React.useState(false);
      const [generation, setGeneration] = React.useState(0);
      return (
        <>
          <button key={generation} type="button" onClick={() => setOpen(true)}>
            Plain opener
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetTitle>Edit</SheetTitle>
              <SheetDescription>Details</SheetDescription>
              <button type="button" onClick={() => setGeneration((value) => value + 1)}>
                Re-render opener
              </button>
            </SheetContent>
          </Sheet>
        </>
      );
    };
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Plain opener' }));
    await user.click(await screen.findByRole('button', { name: 'Re-render opener' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Plain opener' })).toHaveFocus();
  });
});
