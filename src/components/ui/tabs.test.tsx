import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const renderTabs = (variant?: 'segmented' | 'line' | 'segment') =>
  render(
    <Tabs defaultValue="a">
      <TabsList variant={variant} aria-label="Sections">
        <TabsTrigger value="a">Account</TabsTrigger>
        <TabsTrigger value="b">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
    </Tabs>,
  );

describe('Tabs', () => {
  it('sizes vertical trigger icons with the 15px nav icon token', () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList variant="vertical" aria-label="Sections">
          <TabsTrigger value="a">Account</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveClass('[&>svg]:h-icon-nav', '[&>svg]:w-icon-nav');
  });

  it('defaults to the segmented track with a raised active chip', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toHaveClass('bg-muted', 'p-[3px]', 'rounded-control', 'inline-flex');
    const active = screen.getByRole('tab', { name: 'Account' });
    expect(active).toHaveClass(
      'rounded-item',
      'text-muted-foreground',
      'hover:text-foreground',
      'data-[state=active]:bg-background',
      'data-[state=active]:text-foreground',
      'data-[state=active]:shadow-xs',
    );
  });

  // Since 0.23.3 the segmented track is 38px outside zero (32px tab plus 3px padding), like the segmented ToggleGroup
  it('segmented outside zero: auto-height track with 32px tabs', () => {
    renderTabs();
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('h-auto', 'p-[3px]');
    expect(list).not.toHaveClass('h-10');
    const tab = screen.getByRole('tab', { name: 'Account' });
    expect(tab).toHaveClass('h-8', 'py-0');
    expect(tab).not.toHaveClass('py-[6px]');
  });

  it('line variant: transparent track with a hairline baseline and a 2px active bar', () => {
    renderTabs('line');
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('border-b', 'border-hairline', 'bg-transparent');
    expect(list.className).not.toMatch(/(^|\s)bg-muted(\s|$)/);
    const tab = screen.getByRole('tab', { name: 'Account' });
    expect(tab).toHaveClass('border-b-2', 'border-transparent', 'data-[state=active]:border-foreground');
    expect(tab.className).not.toMatch(/data-\[state=active\]:shadow-xs/);
  });

  it('line variant wraps its triggers at narrow widths instead of overflowing', () => {
    renderTabs('line');
    expect(screen.getByRole('tablist')).toHaveClass('flex-wrap', 'max-w-full');
  });

  it('uses the shared focus recipe on triggers', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveClass('focus-visible:ring-focus', 'focus-visible:ring-ring-default');
  });

  it('is keyboard operable (arrow keys move focus, Enter/Space activates after focus)', async () => {
    renderTabs();
    const a = screen.getByRole('tab', { name: 'Account' });
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel B')).toBeInTheDocument();
  });

  it('renders a count slot after the label, including zero', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" count={3}>
            Open
          </TabsTrigger>
          <TabsTrigger value="b" count={0}>
            Done
          </TabsTrigger>
          <TabsTrigger value="c">None</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const open = screen.getByRole('tab', { name: /Open/ });
    expect(open).toHaveTextContent('Open3');
    expect(screen.getByText('3')).toHaveClass('text-micro', 'tabular-nums', 'text-text-subtle-on-muted');
    expect(screen.getByRole('tab', { name: /Done/ })).toHaveTextContent('Done0');
    expect(screen.getByRole('tab', { name: 'None' })).toHaveTextContent(/^None$/);
  });
  it('renders a destructive count tone that stays destructive on the active tab', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="vertical">
          <TabsTrigger value="a" count="3 selected" countTone="destructive">
            Frontend
          </TabsTrigger>
          <TabsTrigger value="b" count={2}>
            Backend
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByText('3 selected')).toHaveClass('text-text-destructive-on-subtle');
    expect(screen.getByText('2')).not.toHaveClass('text-text-destructive-on-subtle');
  });

  it('segment variant: 2px padded track, control-height triggers, tab type role, elevation-surface active chip', () => {
    renderTabs('segment');
    expect(screen.getByRole('tablist')).toHaveClass('bg-muted', 'p-micro', 'gap-micro', 'rounded-control', 'h-auto');
    const tab = screen.getByRole('tab', { name: 'Account' });
    expect(tab).toHaveClass(
      'h-control-sm',
      'typography-tab',
      'rounded-item',
      'data-[state=active]:bg-background',
      'data-[state=active]:shadow-elevation-surface',
    );
    expect(tab).not.toHaveClass('py-[6px]');
  });

  it('segment variant: count is plain text in the kpi-label-strong role and stays subtle when active', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="segment">
          <TabsTrigger value="a" count={7}>
            Open
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const count = screen.getByText('7');
    expect(count).toHaveClass('typography-kpi-label-strong', 'tabular-nums', 'text-text-subtle-on-muted');
    expect(count.className).not.toMatch(/group-data-\[state=active\]:text-muted-foreground/);
  });

  it('segment variant is keyboard operable', async () => {
    renderTabs('segment');
    screen.getByRole('tab', { name: 'Account' }).focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
  });
  describe('segment with seven tabs (Figma Horizontal tabs Type=Segment, Tab 5..7)', () => {
    const tabs: Array<[string, number | undefined]> = [
      ['Mine', 7],
      ['Active', 4],
      ['In review', 1],
      ['Expired', 1],
      ['Performance', undefined],
      ['All workspaces', 38],
      ['Archived', 12],
    ];
    const renderSeven = () =>
      render(
        <Tabs defaultValue="Mine">
          <TabsList variant="segment" aria-label="Views">
            {tabs.map(([label, count]) => (
              <TabsTrigger key={label} value={label} count={count}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(([label]) => (
            <TabsContent key={label} value={label}>{`Panel ${label}`}</TabsContent>
          ))}
        </Tabs>,
      );

    it('renders all seven triggers with counts and no hard limit', () => {
      renderSeven();
      expect(screen.getAllByRole('tab')).toHaveLength(7);
      expect(screen.getByRole('tab', { name: /All workspaces/ })).toHaveTextContent('All workspaces38');
      expect(screen.getByRole('tab', { name: 'Performance' })).toHaveTextContent(/^Performance$/);
    });

    it('triggers never shrink or wrap so the list can scroll instead of squashing labels', () => {
      renderSeven();
      screen.getAllByRole('tab').forEach((tab) => expect(tab).toHaveClass('shrink-0', 'whitespace-nowrap'));
    });

    it('arrow keys reach the last tab and Home/End wrap the roving focus', async () => {
      renderSeven();
      screen.getByRole('tab', { name: /Mine/ }).focus();
      await userEvent.keyboard('{End}');
      expect(screen.getByRole('tab', { name: /Archived/ })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /Mine/ })).toHaveFocus();
    });
  });

  describe('vertical orientation', () => {
    const renderVertical = () =>
      render(
        <Tabs defaultValue="a" orientation="vertical">
          <TabsList variant="vertical" aria-label="Settings">
            <TabsTrigger value="a">My details</TabsTrigger>
            <TabsTrigger value="b" count={2}>
              Notifications
            </TabsTrigger>
            <TabsTrigger value="c">API</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>,
      );

    it('exposes aria-orientation and stacks full-width triggers', () => {
      renderVertical();
      const list = screen.getByRole('tablist');
      expect(list).toHaveAttribute('aria-orientation', 'vertical');
      expect(list).toHaveClass('flex-col', 'gap-1');
      expect(screen.getByRole('tab', { name: 'My details' })).toHaveClass('w-full', 'justify-start', 'h-8', 'typography-tab');
    });

    it('moves focus with ArrowDown/ArrowUp, not left/right', async () => {
      renderVertical();
      screen.getByRole('tab', { name: 'My details' }).focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('tab', { name: /Notifications/ })).toHaveFocus();
      await userEvent.keyboard('{ArrowUp}');
      expect(screen.getByRole('tab', { name: 'My details' })).toHaveFocus();
    });

    it('pushes the count to the row end', () => {
      renderVertical();
      expect(screen.getByText('2')).toHaveClass('ml-auto', 'tabular-nums');
    });
  });
});
