import type { Meta, StoryObj } from '@storybook/react';
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  Eye,
  FileText,
  FolderKanban,
  Home,
  Inbox,
  LifeBuoy,
  Link2,
  Landmark,
  Layers,
  LogOut,
  MessageCircle,
  Palmtree,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  Target,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarLayout,
  SidebarNavItem,
  SidebarObjectIcon,
  SidebarQuickActions,
  SidebarSection,
  SidebarTrigger,
  SidebarWorkspaceSwitcher,
} from './sidebar';
import {
  SidebarAccount,
  SidebarBackRow,
  SidebarFeaturedCard,
  SidebarMobileMenu,
  SidebarNavGroups,
  SidebarNavTree,
  SidebarRailButton,
  SidebarSearchField,
  SidebarTier,
  type SidebarNavNode,
} from './sidebar-nav';
import { TopBar, TopBarEnd, TopBarMenuButton } from './topbar';

const meta = {
  title: 'Compositions/Sidebar App shell',
  component: SidebarLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Rendering-relevant handlers are wired explicitly per story.
    actions: { argTypesRegex: '^on(?!Dismiss)[A-Z].*' },
    docs: {
      description: {
        component:
          'Data driven app trees, settings mode, personal mode, collapsed rail, Dual-tier, Slim and mobile menu. Existing Sidebar parts keep their API.',
      },
    },
  },
} satisfies Meta<typeof SidebarLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// App trees as data: the same shape drives workstream, backoffice, coldcall and vacancy.
const appTrees: SidebarNavNode[] = [
  {
    id: 'workstream',
    label: 'workstream',
    icon: (
      <SidebarObjectIcon product="workstream">
        <FolderKanban />
      </SidebarObjectIcon>
    ),
    children: [
      { id: 'projects', label: 'Projects', href: '#projects' },
      { id: 'board', label: 'Board', href: '#board' },
      { id: 'capacity', label: 'Capacity', href: '#capacity' },
      { id: 'reports', label: 'Reports', href: '#reports' },
      { id: 'files', label: 'Files', href: '#files' },
    ],
  },
  {
    id: 'backoffice',
    label: 'backoffice',
    icon: (
      <SidebarObjectIcon product="backoffice">
        <Briefcase />
      </SidebarObjectIcon>
    ),
    children: [
      { id: 'time', label: 'Time', href: '#time' },
      { id: 'time-off', label: 'Time off', href: '#time-off' },
      { id: 'billing', label: 'Billing', href: '#billing', count: 3 },
      { id: 'finance', label: 'Finance', href: '#finance' },
    ],
  },
  {
    id: 'coldcall',
    label: 'coldcall',
    icon: (
      <SidebarObjectIcon product="coldcall">
        <Phone />
      </SidebarObjectIcon>
    ),
    children: [
      { id: 'pipeline', label: 'Pipeline', href: '#pipeline' },
      { id: 'sales-reports', label: 'Sales reports', href: '#sales-reports' },
    ],
  },
  {
    id: 'vacancy',
    label: 'vacancy',
    icon: (
      <SidebarObjectIcon product="vacancy">
        <Target />
      </SidebarObjectIcon>
    ),
    children: [
      { id: 'demands', label: 'Demands', href: '#demands', active: true },
      { id: 'applications', label: 'Applications', href: '#applications' },
      { id: 'candidates', label: 'Candidates', href: '#candidates' },
    ],
  },
];

const shell = (sidebar: React.ReactNode, props: { collapsedMode?: 'hide' | 'rail'; defaultCollapsed?: boolean } = {}) => (
  <SidebarLayout {...props}>
    {sidebar}
    <SidebarInset className="p-6">Page content</SidebarInset>
  </SidebarLayout>
);

export const AppTrees: Story = {
  render: () =>
    shell(
      <Sidebar>
        <SidebarHeader>
          <SidebarWorkspaceSwitcher logo="GD" name="Get IT Done" />
          <SidebarQuickActions label="Quick Actions" searchLabel="Search" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Home" active />
          <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Inbox" count={6} />
          <SidebarNavItem variant="nav" href="#" icon={<Sun />} label="My Day" count={4} />
          <SidebarNavItem variant="nav" href="#" icon={<CalendarDays />} label="Calendar" />
          <SidebarNavItem variant="nav" href="#" icon={<MessageCircle />} label="Chat" dot />
          <SidebarSection label="Apps">
            <SidebarNavTree nodes={appTrees} />
          </SidebarSection>
          <SidebarSection label="Records">
            <SidebarNavItem variant="nav" href="#" icon={<Users />} label="Contacts" />
            <SidebarNavItem variant="nav" href="#" icon={<Building2 />} label="Companies" />
            <SidebarNavItem variant="nav" href="#" icon={<Layers />} label="Community" disabled />
          </SidebarSection>
        </SidebarContent>
        <SidebarFooter>
          <SidebarNavItem variant="nav" href="#" icon={<Settings />} label="Settings" />
        </SidebarFooter>
      </Sidebar>,
    ),
};

export const PersonalMode: Story = {
  render: () =>
    shell(
      <Sidebar aria-label="Personal">
        <SidebarHeader>
          <SidebarWorkspaceSwitcher logo="EP" name="Emily Park" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Overview" active />
          <SidebarNavItem variant="nav" href="#" icon={<User />} label="Profile & CV" />
          <SidebarNavItem variant="nav" href="#" icon={<Target />} label="Matches" count={2} />
          <SidebarNavItem variant="nav" href="#" icon={<FileText />} label="Tailored CVs" />
          <SidebarNavItem variant="nav" href="#" icon={<Eye />} label="Visibility" />
          <SidebarNavItem variant="nav" href="#" icon={<Briefcase />} label="Job board" />
          <SidebarSection label="Time">
            <SidebarNavItem variant="nav" href="#" icon={<Clock />} label="My time" />
            <SidebarNavItem variant="nav" href="#" icon={<Palmtree />} label="My time off" />
          </SidebarSection>
          <SidebarSection label="Companies">
            <SidebarNavItem variant="nav" href="#" icon={<Building2 />} label="Get IT Done GmbH" />
            <SidebarNavItem variant="nav" href="#" icon={<Building2 />} label="Nordlicht AG" trailing="Guest" />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>,
    ),
};

export const SettingsMode: Story = {
  render: () =>
    shell(
      <Sidebar aria-label="Settings">
        <SidebarHeader>
          <SidebarBackRow label="Settings" closeOnEscape={false} />
          <div className="my-2">
            <SidebarSearchField placeholder="Search settings" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label="Personal">
            <SidebarNavItem variant="nav" href="#" icon={<User />} label="Account" active />
            <SidebarNavItem variant="nav" href="#" icon={<Eye />} label="Profile visibility" />
            <SidebarNavItem variant="nav" href="#" icon={<Bell />} label="Notifications" />
            <SidebarNavItem variant="nav" href="#" icon={<Shield />} label="Security" />
            <SidebarNavItem variant="nav" href="#" icon={<Link2 />} label="My connections" />
          </SidebarSection>
          <SidebarSection label="Workspace">
            <SidebarNavItem variant="nav" href="#" icon={<Settings />} label="General" />
            <SidebarNavItem variant="nav" href="#" icon={<Users />} label="Members & permissions" />
            <SidebarNavItem variant="nav" href="#" icon={<Building2 />} label="Billing entities" />
            <SidebarNavItem variant="nav" href="#" icon={<CreditCard />} label="Subscription & billing" />
          </SidebarSection>
          <SidebarSection label="Apps">
            <SidebarNavItem variant="nav" href="#" icon={<SidebarObjectIcon product="workstream"><FolderKanban /></SidebarObjectIcon>} label="workstream" />
            <SidebarNavItem variant="nav" href="#" icon={<SidebarObjectIcon product="backoffice"><Briefcase /></SidebarObjectIcon>} label="backoffice" />
            <SidebarNavItem variant="nav" href="#" icon={<SidebarObjectIcon product="coldcall"><Phone /></SidebarObjectIcon>} label="coldcall" />
            <SidebarNavItem variant="nav" href="#" icon={<SidebarObjectIcon product="vacancy"><Target /></SidebarObjectIcon>} label="vacancy" />
          </SidebarSection>
          <SidebarSection label="Integrations">
            <SidebarNavItem variant="nav" href="#" icon={<Layers />} label="Overview" />
            <SidebarNavItem variant="nav" href="#" icon={<CalendarDays />} label="Calendar" />
            <SidebarNavItem variant="nav" href="#" icon={<Clock />} label="Clockodo" />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>,
    ),
};

// Settings mode with data-driven groups, integration status dots and locked admin entries.
export const SettingsGroups: Story = {
  render: () =>
    shell(
      <Sidebar aria-label="Settings">
        <SidebarHeader>
          <SidebarBackRow label="Settings" closeOnEscape={false} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavGroups
            variant="nav"
            groups={[
              {
                id: 'finance',
                label: 'Integrations · Finance',
                nodes: [
                  { id: 'bank', label: 'Bank', icon: <CreditCard />, statusDot: 'on' },
                  { id: 'datev', label: 'DATEV', icon: <Layers />, statusDot: 'off' },
                ],
              },
              {
                id: 'dev',
                label: 'Development and APIs',
                nodes: [
                  { id: 'github', label: 'GitHub', icon: <Link2 />, statusDot: 'on' },
                  { id: 'cv-api', label: 'Public CV API', icon: <Link2 />, statusDot: 'off' },
                ],
              },
              {
                id: 'admin',
                label: 'Admin · Data',
                collapsible: true,
                nodes: [
                  { id: 'master', label: 'Master data', icon: <Settings />, locked: true },
                  { id: 'imports', label: 'Imports', icon: <Settings />, locked: true },
                ],
              },
            ]}
          />
        </SidebarContent>
      </Sidebar>,
    ),
};

const CollapsibleRail = () =>
  shell(
    <Sidebar>
      <SidebarHeader>
        <SidebarWorkspaceSwitcher logo="AC" name="Acme" showTrigger={false} />
        <SidebarQuickActions label="Quick Actions" searchLabel="Search" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Home" active />
        <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Inbox" count={6} />
        <SidebarNavTree nodes={appTrees} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
        <SidebarNavItem variant="nav" href="#" icon={<Settings />} label="Settings" />
      </SidebarFooter>
    </Sidebar>,
    { collapsedMode: 'rail', defaultCollapsed: true },
  );

export const CollapsedRail: Story = {
  parameters: { docs: { description: { story: 'Open=False: a 56px icon-only rail. Labels stay available to assistive tech.' } } },
  render: () => <CollapsibleRail />,
};

const AvatarInitials = ({ children }: { children: string }) => (
  <Avatar size="md">
    <AvatarFallback>{children}</AvatarFallback>
  </Avatar>
);

const primaryNav = (
  <>
    <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Home" />
    <SidebarNavItem variant="nav" href="#" icon={<BarChart3 />} label="Dashboard" active />
    <SidebarNavItem variant="nav" href="#" icon={<Layers />} label="Projects" />
    <SidebarNavItem variant="nav" href="#" icon={<Users />} label="Users" />
  </>
);

const subNav = (
  <>
    <SidebarNavItem variant="nav" href="#" icon={<Activity />} label="Overview" active />
    <SidebarNavItem variant="nav" href="#" icon={<Bell />} label="Notifications" count={10} />
    <SidebarNavItem variant="nav" href="#" icon={<BarChart3 />} label="Analytics" />
    <SidebarNavItem variant="nav" href="#" icon={<Clock />} label="Scheduled reports" />
  </>
);

const DualTierDemo = () => {
    const [dismissed, setDismissed] = useState(false);
    return (
      <div className="flex h-[720px] bg-background">
        <SidebarTier aria-label="Primary" width="wide" className="justify-between gap-6 px-4 py-8">
          <div className="flex flex-col gap-6">
            <span className="typography-title-sm px-2">Get IT Done</span>
            <SidebarSearchField placeholder="Search" />
            <div className="flex flex-col gap-1">{primaryNav}</div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <SidebarNavItem variant="nav" href="#" icon={<LifeBuoy />} label="Support" />
              <SidebarNavItem variant="nav" href="#" icon={<Settings />} label="Settings" />
            </div>
            {!dismissed && (
              <SidebarFeaturedCard
                title="Used space"
                description="Your team has used 80% of your available space. Need more?"
                onDismiss={() => setDismissed(true)}
                action={<a href="#upgrade" className="typography-label-highlight text-text-default no-underline">Upgrade plan</a>}
              />
            )}
            <SidebarAccount
              avatar={<AvatarInitials>LH</AvatarInitials>}
              name="Lena Hartmann"
              secondary="lena.hartmann@example.com"
              action={
                <Button variant="ghost" size="icon-sm" aria-label="Log out">
                  <LogOut className="h-4 w-4" aria-hidden />
                </Button>
              }
            />
          </div>
        </SidebarTier>
        <SidebarTier aria-label="Dashboard" width="panel" className="gap-1 px-4 py-8 max-md:hidden">
          {subNav}
        </SidebarTier>
      </div>
    );
};

// The second tier drops out below md: on a phone the primary tier (or SidebarMobileMenu) carries the navigation.
export const DualTier: Story = { render: () => <DualTierDemo /> };

export const Slim: Story = {
  render: () => (
    <div className="flex h-[720px] bg-background">
      <SidebarTier aria-label="Primary" width="rail" className="items-center justify-between py-8">
        <div className="flex flex-col items-center gap-2">
          <SidebarRailButton href="#" icon={<Home />} label="Home" />
          <SidebarRailButton href="#" icon={<BarChart3 />} label="Dashboard" active />
          <SidebarRailButton href="#" icon={<Layers />} label="Projects" />
          <SidebarRailButton href="#" icon={<Users />} label="Users" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <SidebarRailButton href="#" icon={<LifeBuoy />} label="Support" />
          <SidebarRailButton href="#" icon={<Settings />} label="Settings" />
          <AvatarInitials>LH</AvatarInitials>
        </div>
      </SidebarTier>
      <SidebarTier aria-label="Dashboard" width="wide" className="gap-1 px-4 py-8">
        <p className="typography-ui mb-3 px-2 text-sidebar-muted-foreground">Dashboard</p>
        {subNav}
      </SidebarTier>
    </div>
  ),
};

const MobileMenuDemo = () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="h-[640px] bg-background">
        <TopBar variant="mobile">
          <span className="typography-title-sm">Get IT Done</span>
          <TopBarEnd>
            <TopBarMenuButton open={open} onClick={() => setOpen(true)} />
          </TopBarEnd>
        </TopBar>
        <SidebarMobileMenu open={open} onOpenChange={setOpen}>
          <SidebarSearchField placeholder="Search" />
          <div className="mt-3 flex flex-col gap-1">{primaryNav}</div>
          <div className="mt-auto flex flex-col gap-1">
            <SidebarNavItem variant="nav" href="#" icon={<LifeBuoy />} label="Support" />
            <SidebarNavItem variant="nav" href="#" icon={<Settings />} label="Settings" />
            <SidebarAccount avatar={<AvatarInitials>LH</AvatarInitials>} name="Lena Hartmann" secondary="lena.hartmann@example.com" className="mt-3" />
          </div>
        </SidebarMobileMenu>
      </div>
    );
};

export const MobileMenu: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <MobileMenuDemo />,
};

export const NavItemStates: Story = {
  render: () => (
    <div className="flex w-[248px] flex-col gap-1 bg-sidebar-background p-4">
      <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Default" />
      <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Current" active />
      <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Disabled" disabled />
      <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="With count" count={12} />
      <SidebarNavItem variant="nav" href="#" icon={<Landmark />} label="With secondary" secondary="Finance" />
      <SidebarNavItem variant="nav" href="#" icon={<Search />} label="With dot" dot />
      <SidebarNavItem variant="nav" href="#" icon={<Plus />} label="Trailing text" trailing="activate" />
    </div>
  ),
};
