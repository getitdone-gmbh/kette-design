import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Inbox } from 'lucide-react';

import { BottomNavigation, BottomNavigationAction, BottomNavigationItem } from './bottom-navigation';

describe('BottomNavigation', () => {
  it('is a labelled navigation with a current item', () => {
    render(
      <BottomNavigation>
        <BottomNavigationItem href="#h" icon={<Home />} label="Home" current />
        <BottomNavigationItem href="#i" icon={<Inbox />} label="Inbox" count={6} />
      </BottomNavigation>,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('h-16');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /^Inbox\s*,\s*6$/ })).not.toHaveAttribute('aria-current');
  });

  it('starts the accessible name with the visible label and keeps the count visible (2.5.3)', () => {
    render(
      <BottomNavigation>
        <BottomNavigationItem href="#i" icon={<Inbox />} label="Inbox" count={6} />
      </BottomNavigation>,
    );
    const link = screen.getByRole('link', { name: /^Inbox/ });
    expect(link).not.toHaveAttribute('aria-label');
    expect(link.querySelector('[aria-hidden]')).toBeNull();
    expect(link.textContent?.startsWith('Inbox')).toBe(true);
  });

  it('renders a centered action as a named button', async () => {
    const onClick = vi.fn();
    render(
      <BottomNavigation>
        <BottomNavigationAction label="New" onClick={onClick} />
      </BottomNavigation>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('keeps targets at least 48px', () => {
    render(<BottomNavigationItem href="#" icon={<Home />} label="Home" />);
    expect(screen.getByRole('link')).toHaveClass('h-12');
  });
});

describe('BottomNavigationItem button form', () => {
  it('renders a real button that fires onClick and keeps aria-expanded', async () => {
    const onClick = vi.fn();
    render(
      <BottomNavigation>
        <BottomNavigationItem as="button" aria-expanded={false} icon={<Home />} label="More" onClick={onClick} current />
      </BottomNavigation>,
    );
    const btn = screen.getByRole('button', { name: 'More' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).not.toHaveAttribute('aria-current');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
