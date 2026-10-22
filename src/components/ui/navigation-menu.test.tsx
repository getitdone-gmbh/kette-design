import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MenuListItem, NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from './navigation-menu';

const VIEWPORT_WIDTH = 1024;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockGeometry = (rootLeft: number, panelWidth: number) => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(VIEWPORT_WIDTH);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(panelWidth);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: rootLeft, right: rootLeft + 100, top: 0, bottom: 40, width: 100, height: 40, x: rootLeft, y: 0, toJSON: () => ({}) });
};

const renderMenu = (props: { collisionPadding?: number } = {}) =>
  render(
    <NavigationMenu defaultValue="features" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="features">
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              <MenuListItem href="/a" title="A">
                Text
              </MenuListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  );

const anchor = () => document.querySelector<HTMLElement>('[data-slot="navigation-menu-viewport-anchor"]') as HTMLElement;

describe('NavigationMenu viewport collision', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shifts a panel that would pass the right viewport edge back inside with the default margin', () => {
    mockGeometry(900, 600);
    renderMenu();
    expect(screen.getByRole('button', { name: /features/i })).toBeInTheDocument();
    // 900 + 600 - (1024 - 16) = 492 px overflow
    expect(anchor().style.left).toBe('-492px');
  });

  it('honours a custom collision padding', () => {
    mockGeometry(900, 600);
    renderMenu({ collisionPadding: 32 });
    expect(anchor().style.left).toBe('-508px');
  });

  it('leaves a panel that fits untouched', () => {
    mockGeometry(100, 300);
    renderMenu();
    expect(anchor().style.left).toBe('0px');
  });

  it('keeps a panel off the left edge', () => {
    mockGeometry(-20, 300);
    renderMenu();
    expect(anchor().style.left).toBe('36px');
  });
});
