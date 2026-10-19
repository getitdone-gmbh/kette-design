// Dead-class guard for the app shell family: sidebar additions, top bar, action bar, bottom navigation,
// sheet zero, dialog sizes and command additions. Every rendered class must compile through the token preset.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, Download, Home, Inbox, Trash2, UserPlus } from 'lucide-react';

import { ActionBar, ActionBarFilterTags, ActionBarRow, BatchBar } from '../../components/ui/action-bar';
import { AutosaveStatus } from '../../components/ui/autosave-status';
import { Avatar, AvatarFallback, AvatarGroup } from '../../components/ui/avatar';
import { BottomNavigation, BottomNavigationAction, BottomNavigationItem } from '../../components/ui/bottom-navigation';
import { Command, CommandEmptyState, CommandInput, CommandItem, CommandItemText, CommandKbd, CommandKeys, CommandList } from '../../components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFeaturedIcon, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ObjectIcon } from '../../components/ui/object-icon';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMeta,
  SheetPath,
  SheetSection,
  SheetTitle,
  type SheetState,
} from '../../components/ui/sheet';
import { Sidebar, SidebarContent, SidebarLayout, SidebarNavItem, SidebarQuickActions, SidebarSection, SidebarTree, SidebarWorkspaceSwitcher } from '../../components/ui/sidebar';
import {
  SidebarAccount,
  SidebarBackRow,
  SidebarFeaturedCard,
  SidebarMobileMenu,
  SidebarNavTree,
  SidebarRailButton,
  SidebarSearchField,
  SidebarTier,
} from '../../components/ui/sidebar-nav';
import {
  TimerPill,
  TopBar,
  TopBarBreadcrumb,
  TopBarEnd,
  TopBarEscapeHint,
  TopBarIconButton,
  TopBarMenuButton,
  TopBarNav,
  TopBarStart,
  TopBarSubRow,
} from '../../components/ui/topbar';
import { collectRenderedClasses, missingCompiledClasses } from '../assert-compiled';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= ResizeObserverStub;
  Element.prototype.scrollIntoView ??= () => {};
});

const tree = [
  { id: 'a', label: 'workstream', icon: <Home />, defaultOpen: true, children: [{ id: 'a1', label: 'Projects', href: '#', active: true }] },
  { id: 'b', label: 'backoffice', href: '#', children: [{ id: 'b1', label: 'Time', href: '#' }] },
];

const Everything = () => (
  <div>
    {(['hide', 'rail'] as const).map((mode) => (
      <SidebarLayout key={mode} defaultCollapsed={mode === 'rail'} collapsedMode={mode}>
        <Sidebar>
          <SidebarWorkspaceSwitcher logo="GD" name="Get IT Done" />
          <SidebarQuickActions />
          <SidebarContent>
            <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Home" active count={2} secondary="x" trailing="t" />
            <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Disabled" disabled dot />
            <SidebarSection label="Apps">
              <SidebarNavTree nodes={tree} />
              <SidebarTree>
                <SidebarNavItem href="#" label="x" />
              </SidebarTree>
            </SidebarSection>
          </SidebarContent>
        </Sidebar>
      </SidebarLayout>
    ))}
    <SidebarBackRow />
    <SidebarSearchField placeholder="Search settings" />
    <SidebarTier aria-label="a" width="collapsed" />
    <SidebarTier aria-label="b" width="rail">
      <SidebarRailButton href="#" icon={<Home />} label="Home" active />
      <SidebarRailButton icon={<Home />} label="Other" />
    </SidebarTier>
    <SidebarTier aria-label="c" width="panel" />
    <SidebarTier aria-label="d" width="wide" />
    <SidebarFeaturedCard title="Used" description="d" media={<span />} onDismiss={() => {}} action={<a href="#go">Go</a>} />
    <SidebarAccount avatar={<span />} name="n" secondary="s" action={<button aria-label="x" />} />
    <SidebarMobileMenu open>
      <SidebarNavItem href="#" label="Mobile" />
    </SidebarMobileMenu>

    {(['inset', 'guest', 'simple', 'mobile'] as const).map((variant) => (
      <TopBar key={variant} variant={variant}>
        <TopBarStart>
          <TopBarBreadcrumb
            icon={<ObjectIcon app="vacancy" />}
            items={[{ label: 'a', href: '#' }, { label: 'b', href: '#' }, { label: 'c', href: '#' }, { label: 'd' }]}
            context="ctx"
          />
          <TopBarNav tone="muted" items={[{ label: 'Jobs', href: '#', current: true }, { label: 'Pricing', href: '#' }]} />
        </TopBarStart>
        <TopBarEnd>
          <AvatarGroup>
            <Avatar size="xs">
              <AvatarFallback size="xs">ST</AvatarFallback>
            </Avatar>
          </AvatarGroup>
          <TimerPill time="01:00:00" />
          <TimerPill time="00:00:00" running={false} />
          <TopBarIconButton label="Notifications" count={5}>
            <Bell />
          </TopBarIconButton>
          <TopBarEscapeHint />
          <TopBarMenuButton open />
        </TopBarEnd>
      </TopBar>
    ))}
    <TopBarSubRow>sub</TopBarSubRow>
    {(['saved', 'saving', 'dirty', 'error', 'offline'] as const).map((state) => (
      <AutosaveStatus key={state} state={state} />
    ))}

    <ActionBar>
      <ActionBarRow>
        <ActionBarFilterTags tags={[{ id: 'a', label: 'Status', onRemove: () => {} }]} onReset={() => {}} />
      </ActionBarRow>
      <BatchBar
        selectedCount={3}
        onClear={() => {}}
        maxInline={2}
        actions={[
          { id: 'assign', label: 'Assign', icon: <UserPlus />, onSelect: () => {} },
          { id: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true, onSelect: () => {} },
          { id: 'export', label: 'Export', icon: <Download />, onSelect: () => {} },
        ]}
      />
    </ActionBar>

    <BottomNavigation>
      <BottomNavigationItem href="#" icon={<Home />} label="Home" current />
      <BottomNavigationItem href="#" icon={<Inbox />} label="Inbox" count={6} />
      <BottomNavigationAction label="New" />
    </BottomNavigation>

    {(['default', 'loading', 'error', 'dirty'] as SheetState[]).map((state) => (
      <Sheet key={state} open modal={false}>
        <SheetContent size="md" mode="push" state={state} padded={false} stackDepth={state === 'dirty' ? 1 : 0}>
          <SheetHeader variant="zero">
            <SheetPath>Companies / Acme</SheetPath>
            <SheetTitle variant="zero">Edit</SheetTitle>
            <SheetDescription className="sr-only">d</SheetDescription>
            <SheetMeta>
              <AutosaveStatus />
            </SheetMeta>
          </SheetHeader>
          <SheetBody onRetry={() => {}}>
            <SheetSection title="Label" description="d">
              x
            </SheetSection>
          </SheetBody>
          <SheetFooter variant="zero">x</SheetFooter>
        </SheetContent>
      </Sheet>
    ))}
    <Sheet open>
      <SheetContent size="lg" mode="overlay" side="left">
        <SheetTitle>t</SheetTitle>
        <SheetDescription>d</SheetDescription>
      </SheetContent>
    </Sheet>

    {(['sm', 'md'] as const).map((size) => (
      <Dialog key={size} open>
        <DialogContent size={size}>
          <DialogHeader orientation="horizontal">
            {(['neutral', 'brand', 'success', 'warning', 'destructive', 'info'] as const).map((tone) => (
              <DialogFeaturedIcon key={tone} tone={tone} />
            ))}
            <div>
              <DialogTitle>t</DialogTitle>
              <DialogDescription>d</DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ))}

    <Command>
      <CommandInput placeholder="Search" shortcut={<CommandKbd>k</CommandKbd>} />
      <CommandList>
        <CommandItem>
          <CommandItemText title="t" description="d" />
          <CommandKeys keys={['a', 'b']} />
        </CommandItem>
      </CommandList>
    </Command>
    <CommandEmptyState title="t" description="d" actions={<button>x</button>} />
  </div>
);

describe('app shell compiled classes', () => {
  it('every rendered class generates CSS (overlays open)', async () => {
    render(<Everything />);
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });

  it('every class of the open More menu generates CSS', async () => {
    render(
      <BatchBar
        selectedCount={2}
        onClear={() => {}}
        maxInline={0}
        actions={[
          { id: 'a', label: 'Assign', icon: <UserPlus />, onSelect: () => {} },
          { id: 'd', label: 'Delete', destructive: true, onSelect: () => {} },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    await screen.findByRole('menu');
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });

  it('every class of the open workspace switcher menu and level 1 tree generates CSS', async () => {
    render(
      <SidebarLayout>
        <SidebarWorkspaceSwitcher
          logo="A"
          name="Acme"
          workspaces={[{ id: 'a', name: 'Acme', logo: 'A' }]}
          activeWorkspaceId="a"
          personal={{ name: 'Me' }}
          onCreateWorkspace={() => {}}
        />
        <SidebarTree level={1} />
      </SidebarLayout>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Acme' }));
    await screen.findByRole('menu');
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });
});
