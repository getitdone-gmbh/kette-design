import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CookieConsent } from './cookie-consent';
import { DesignSystemProvider } from './design-system-provider';

describe('CookieConsent', () => {
  it('renders nothing when closed', () => {
    render(<CookieConsent open={false} description="Text" onAccept={() => undefined} onDecline={() => undefined} />);
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('offers decline and accept as equal actions without taking focus', () => {
    render(<CookieConsent title="Cookies" description="We use cookies." onAccept={() => undefined} onDecline={() => undefined} />);
    expect(screen.getByRole('region', { name: 'Cookies' })).toBeInTheDocument();
    const decline = screen.getByRole('button', { name: 'Decline non-essential' });
    const accept = screen.getByRole('button', { name: 'Accept all' });
    expect(decline.className).toBe(accept.className);
    expect(document.body).toHaveFocus();
  });

  it('calls the handlers and offers the optional settings path', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    const onCustomize = vi.fn();
    render(<CookieConsent description="We use cookies." onAccept={onAccept} onDecline={onDecline} onCustomize={onCustomize} />);
    await user.click(screen.getByRole('button', { name: 'Decline non-essential' }));
    await user.click(screen.getByRole('button', { name: 'Accept all' }));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onCustomize).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
  });

  it('accepts label overrides', () => {
    render(<CookieConsent description="x" onAccept={() => undefined} onDecline={() => undefined} acceptLabel="OK" declineLabel="No" />);
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('closes without consent by calling decline', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(<CookieConsent closable description="x" onAccept={onAccept} onDecline={onDecline} />);
    await user.click(screen.getByRole('button', { name: 'Close cookie banner' }));
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('supports the centered-wide layout', () => {
    render(<CookieConsent layout="centered-wide" positioning="static" description="x" onAccept={() => undefined} onDecline={() => undefined} />);
    expect(screen.getByRole('region').className).toContain('max-w-4xl');
  });

  it('keeps accept and decline identical when acceptEmphasis is on', () => {
    render(<CookieConsent acceptEmphasis description="x" onAccept={() => undefined} onDecline={() => undefined} />);
    const decline = screen.getByRole('button', { name: 'Decline non-essential' });
    const accept = screen.getByRole('button', { name: 'Accept all' });
    expect(accept.className).toBe(decline.className);
    expect(accept.className).toContain('bg-button-background-primary-default');
  });

  describe('settings view', () => {
    const categories = [
      { id: 'necessary', title: 'Necessary', necessary: true },
      { id: 'statistics', title: 'Statistics', description: 'Anonymous usage numbers.' },
      { id: 'marketing', title: 'Marketing' },
    ];

    it('opens per-category switches with nothing pre-ticked and saves the selection', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<CookieConsent categories={categories} onSave={onSave} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      const necessary = screen.getByRole('switch', { name: 'Necessary' });
      expect(necessary).toBeChecked();
      expect(necessary).toBeDisabled();
      const statistics = screen.getByRole('switch', { name: 'Statistics' });
      expect(statistics).not.toBeChecked();
      expect(screen.getByRole('switch', { name: 'Marketing' })).not.toBeChecked();
      await user.click(statistics);
      await user.click(screen.getByRole('button', { name: 'Save selection' }));
      expect(onSave).toHaveBeenCalledWith({ necessary: true, statistics: true, marketing: false });
    });

    it('shows a category notice with a working link in the settings view only', async () => {
      const user = userEvent.setup();
      const withNotice = [{ id: 'necessary', title: 'Necessary', necessary: true, notice: <a href="/privacy">Privacy policy</a> }, ...categories.slice(1)];
      render(<CookieConsent categories={withNotice} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      expect(screen.queryByRole('link', { name: 'Privacy policy' })).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('switch', { name: 'Necessary' })).not.toHaveAccessibleDescription(/Privacy/);
    });

    it('starts the switches from initialConsent and ignores unknown ids', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(
        <CookieConsent categories={categories} initialConsent={{ statistics: true, other: true }} onSave={onSave} description="x" onAccept={() => undefined} onDecline={() => undefined} />,
      );
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('switch', { name: 'Statistics' })).toBeChecked();
      expect(screen.getByRole('switch', { name: 'Marketing' })).not.toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Save selection' }));
      expect(onSave).toHaveBeenCalledWith({ necessary: true, statistics: true, marketing: false });
    });

    it('restores the stored choice when settings are reopened after editing', async () => {
      const user = userEvent.setup();
      render(<CookieConsent categories={categories} initialConsent={{ marketing: true }} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      await user.click(screen.getByRole('switch', { name: 'Marketing' }));
      expect(screen.getByRole('switch', { name: 'Marketing' })).not.toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('switch', { name: 'Marketing' })).toBeChecked();
    });

    it('controlled value drives the switches and reports changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<CookieConsent categories={categories} value={{ statistics: true }} onValueChange={onValueChange} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('switch', { name: 'Statistics' })).toBeChecked();
      await user.click(screen.getByRole('switch', { name: 'Marketing' }));
      expect(onValueChange).toHaveBeenCalledWith({ necessary: true, statistics: true, marketing: true });
      expect(screen.getByRole('switch', { name: 'Marketing' })).not.toBeChecked();
    });

    it('goes back to the first layer', async () => {
      const user = userEvent.setup();
      render(<CookieConsent categories={categories} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      await user.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument();
    });
  });

  describe('dismissBehavior', () => {
    it('defer closes without deciding: no accept, no decline, onDismiss once, banner hides itself', async () => {
      const user = userEvent.setup();
      const onAccept = vi.fn();
      const onDecline = vi.fn();
      const onDismiss = vi.fn();
      render(<CookieConsent closable dismissBehavior="defer" onDismiss={onDismiss} description="x" onAccept={onAccept} onDecline={onDecline} />);
      await user.click(screen.getByRole('button', { name: 'Close cookie banner' }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onDecline).not.toHaveBeenCalled();
      expect(onAccept).not.toHaveBeenCalled();
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('defer shows the banner again on the next mount', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<CookieConsent closable dismissBehavior="defer" description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Close cookie banner' }));
      unmount();
      render(<CookieConsent closable dismissBehavior="defer" description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('decline stays the default and does not call onDismiss', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      const onDecline = vi.fn();
      render(<CookieConsent closable onDismiss={onDismiss} description="x" onAccept={() => undefined} onDecline={onDecline} />);
      await user.click(screen.getByRole('button', { name: 'Close cookie banner' }));
      expect(onDecline).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('keeps accept and decline equally prominent with defer', () => {
      render(<CookieConsent closable dismissBehavior="defer" description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      expect(screen.getByRole('button', { name: 'Decline non-essential' }).className).toBe(screen.getByRole('button', { name: 'Accept all' }).className);
    });
  });

  describe('settings view texts', () => {
    const categories = [
      { id: 'necessary', title: 'Necessary', description: 'Needed for login.', necessary: true },
      { id: 'statistics', title: 'Statistics', description: 'Anonymous usage numbers.' },
    ];

    it('keeps every category description and the default always-active text', async () => {
      const user = userEvent.setup();
      render(<CookieConsent categories={categories} description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByText('Needed for login.')).toBeInTheDocument();
      expect(screen.getByText('Anonymous usage numbers.')).toBeInTheDocument();
      expect(screen.getByText('Always active')).toBeInTheDocument();
    });

    it('overrides the always-active text and localises it in German', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<CookieConsent categories={categories} alwaysActiveLabel="Required" description="x" onAccept={() => undefined} onDecline={() => undefined} />);
      await user.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByText('Required')).toBeInTheDocument();
      unmount();
      render(
        <DesignSystemProvider locale="de">
          <CookieConsent categories={categories} description="x" onAccept={() => undefined} onDecline={() => undefined} />
        </DesignSystemProvider>,
      );
      await user.click(screen.getByRole('button', { name: 'Einstellungen' }));
      expect(screen.getByText('Immer aktiv')).toBeInTheDocument();
    });
  });
});

describe('CookieConsent scroll padding', () => {
  it('reserves the banner height on the document scroller while open and restores it on close', () => {
    const observed: Array<() => void> = [];
    class ResizeObserverStub {
      constructor(callback: () => void) {
        observed.push(callback);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    const rect = { height: 120, bottom: 700, top: 580, left: 0, right: 0, width: 0, x: 0, y: 580, toJSON: () => ({}) };
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 716 });
    const props = { description: 'Text', onAccept: () => undefined, onDecline: () => undefined };
    const { rerender, unmount } = render(<CookieConsent {...props} />);
    // 120 banner + 16 bottom offset + 8 gap
    expect(document.documentElement.style.scrollPaddingBottom).toBe('144px');
    expect((document.querySelector('[data-cookie-consent-spacer]') as HTMLElement).style.height).toBe('144px');
    rerender(<CookieConsent {...props} open={false} />);
    expect(document.documentElement.style.scrollPaddingBottom).toBe('');
    expect(document.querySelector('[data-cookie-consent-spacer]')).toBeNull();
    rerender(<CookieConsent {...props} />);
    expect(document.documentElement.style.scrollPaddingBottom).toBe('144px');
    unmount();
    expect(document.documentElement.style.scrollPaddingBottom).toBe('');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document.documentElement, 'clientHeight');
  });

  it('leaves the scroller alone for static positioning', () => {
    render(<CookieConsent description="Text" positioning="static" onAccept={() => undefined} onDecline={() => undefined} />);
    expect(document.documentElement.style.scrollPaddingBottom).toBe('');
  });
});

describe('CookieConsent focus reveal', () => {
  const props = { description: 'Text', onAccept: () => undefined, onDecline: () => undefined };
  const rectOf = (top: number, bottom: number, left = 0, right = 300) =>
    ({ top, bottom, left, right, width: right - left, height: bottom - top, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('scrolls a focused element in a horizontal scroller into view and above the banner', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    const { container } = render(
      <div>
        <div data-testid="scroller" style={{ overflowX: 'auto' }}>
          <a href="#card" data-testid="card">
            Card
          </a>
        </div>
        <CookieConsent {...props} />
      </div>,
    );
    const banner = container.querySelector('section') as HTMLElement;
    const card = container.querySelector('[data-testid="card"]') as HTMLElement;
    vi.spyOn(banner, 'getBoundingClientRect').mockReturnValue(rectOf(600, 700));
    // The card ends 40px behind the banner top (minus the 8px gap).
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(rectOf(500, 640));
    card.focus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    expect(scrollBy).toHaveBeenCalledWith(0, 48);
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });

  it('does nothing extra for focus inside the banner or once the banner is closed', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    const { container, rerender } = render(
      <div>
        <button type="button" data-testid="outside">
          Outside
        </button>
        <CookieConsent {...props} />
      </div>,
    );
    (container.querySelector('section button') as HTMLElement).focus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    rerender(
      <div>
        <button type="button" data-testid="outside">
          Outside
        </button>
        <CookieConsent {...props} open={false} />
      </div>,
    );
    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });
});

describe('CookieConsent action stacking', () => {
  it('stacks the actions below sm and keeps the row layout from sm up', () => {
    render(<CookieConsent description="x" onAccept={() => undefined} onDecline={() => undefined} onCustomize={() => undefined} />);
    const row = screen.getByRole('button', { name: 'Accept all' }).parentElement as HTMLElement;
    expect(row).toHaveClass('flex-col', 'items-stretch', 'sm:flex-row', 'sm:flex-wrap', 'sm:items-center');
    expect(row).not.toHaveClass('flex-wrap');
    expect(Array.from(row.querySelectorAll('button')).map((b) => b.textContent)).toEqual(['Decline non-essential', 'Accept all', 'Settings']);
  });

  it('stacks two actions and the settings view actions the same way', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CookieConsent description="x" onAccept={() => undefined} onDecline={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Accept all' }).parentElement).toHaveClass('flex-col', 'sm:flex-row');
    unmount();
    render(
      <CookieConsent description="x" onAccept={() => undefined} onDecline={() => undefined} categories={[{ id: 'a', title: 'A' }]} />,
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('button', { name: 'Back' }).parentElement).toHaveClass('flex-col', 'sm:flex-row');
  });
});
