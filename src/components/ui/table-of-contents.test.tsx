import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { TableOfContents } from './table-of-contents';

const items = [
  { id: 'intro', label: 'Intro' },
  { id: 'details', label: 'Details', level: 2 as const },
  { id: 'end', label: 'End' },
];

type Callback = (entries: { target: Element; isIntersecting: boolean }[]) => void;
let callback: Callback = () => undefined;
const observed: string[] = [];

beforeEach(() => {
  observed.length = 0;
  class FakeObserver {
    constructor(cb: Callback) {
      callback = cb;
    }
    observe(el: Element) {
      observed.push(el.id);
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  items.forEach((item) => {
    const h = document.createElement('h2');
    h.id = item.id;
    document.body.appendChild(h);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  items.forEach((item) => document.getElementById(item.id)?.remove());
});

describe('TableOfContents', () => {
  it('renders a labelled navigation with anchor links and marks the first as current', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details');
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveClass('typography-ui-semibold');
  });

  it('observes the headings and follows the scroll position', () => {
    render(<TableOfContents items={items} />);
    expect(observed).toEqual(['intro', 'details', 'end']);
    act(() => callback([{ target: document.getElementById('details') as Element, isIntersecting: true }]));
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current');
  });

  it('reports the choice on click and keyboard activation', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(<TableOfContents items={items} onActiveChange={onActiveChange} />);
    await user.click(screen.getByRole('link', { name: 'End' }));
    expect(onActiveChange).toHaveBeenCalledWith('end');
    expect(screen.getByRole('link', { name: 'End' })).toHaveAttribute('aria-current', 'location');
    screen.getByRole('link', { name: 'Intro' }).focus();
    await user.keyboard('{Enter}');
    expect(onActiveChange).toHaveBeenLastCalledWith('intro');
  });

  it('does not observe when controlled and honours the label prop', () => {
    render(<TableOfContents items={items} activeId="end" label="Contents" />);
    expect(observed).toEqual([]);
    expect(screen.getByRole('navigation', { name: 'Contents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'End' })).toHaveAttribute('aria-current', 'location');
  });

  it('keeps room below a sticky header for jumps by default and supports other offsets', () => {
    const { rerender } = render(<TableOfContents items={items} />);
    expect(document.getElementById('intro')?.style.scrollMarginTop).toBe('var(--size-topbar)');
    rerender(<TableOfContents items={items} scrollOffset={96} />);
    expect(document.getElementById('intro')?.style.scrollMarginTop).toBe('96px');
    rerender(<TableOfContents items={items} scrollOffset="none" />);
    expect(document.getElementById('intro')?.style.scrollMarginTop).toBe('');
  });

  it('colours the active entry with the brand role and keeps the marker', () => {
    render(<TableOfContents items={items} activeTone="brand" />);
    const link = screen.getByRole('link', { name: 'Intro' });
    expect(link).toHaveClass('text-text-brand');
    expect(link).toHaveClass('border-border-brand');
    expect(link).toHaveClass('typography-ui-semibold');
  });
});
