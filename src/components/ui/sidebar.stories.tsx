import type { Meta, StoryObj } from '@storybook/react';
import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Folder,
  FolderKanban,
  Handshake,
  Home,
  Inbox,
  Kanban,
  Landmark,
  Layers,
  MessageCircle,
  Palmtree,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  User,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarLayout,
  SidebarNavItem,
  SidebarObjectIcon,
  SidebarProvider,
  SidebarQuickActions,
  SidebarSection,
  SidebarSectionAction,
  SidebarSwatch,
  SidebarTree,
  SidebarTrigger,
  SidebarWorkspaceSwitcher,
} from './sidebar';
import { DesignSystemProvider } from './design-system-provider';

const meta = {
  title: 'Compositions/Sidebar',
  component: SidebarLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Inset-Sidebar im Attio-Stil (workload.zero, Theme `zero`). Sidebar auf dem Canvas, Inhalt als abgerundete Fläche. Farben nur über `sidebar-*` und `product-*` Tokens.',
      },
    },
  },
} satisfies Meta<typeof SidebarLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Project colors are user data (stored on the project), not design tokens.
const projects = [
  { key: 'NWH', name: 'Digital Transformation', color: 'rgb(229 72 77)' },
  { key: 'AGILE', name: 'Coaching', color: 'rgb(245 165 36)' },
];

const Example = ({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) => (
  <SidebarLayout defaultCollapsed={defaultCollapsed}>
    <Sidebar>
      <SidebarHeader>
        <SidebarWorkspaceSwitcher logo="GD" name="Get IT Done" />
        <SidebarQuickActions />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavItem href="#" icon={<Home />} label="Home" active />
        <SidebarNavItem href="#" icon={<Inbox />} label="Inbox" count={6} />
        <SidebarNavItem href="#" icon={<Sun />} label="My Day" count={4} />
        <SidebarNavItem href="#" icon={<CalendarDays />} label="Calendar" />
        <SidebarNavItem href="#" icon={<MessageCircle />} label="Chat" count={3} />

        <SidebarSection
          label="Active projects"
          action={
            <SidebarSectionAction aria-label="Add project">
              <Plus />
            </SidebarSectionAction>
          }
        >
          {projects.map((p) => (
            <SidebarNavItem key={p.key} href="#" icon={<SidebarSwatch color={p.color} />} label={p.key} secondary={p.name} />
          ))}
          <SidebarNavItem href="#" icon={<Layers />} label="All 9 projects" className="text-sidebar-muted-foreground" />
        </SidebarSection>

        <SidebarSection label="Apps">
          <SidebarNavItem
            href="#"
            icon={
              <SidebarObjectIcon product="workstream">
                <FolderKanban />
              </SidebarObjectIcon>
            }
            label="workstream"
          />
          <SidebarTree>
            <SidebarNavItem href="#" icon={<Folder />} label="Projects" />
            <SidebarNavItem href="#" icon={<Kanban />} label="Board" />
            <SidebarNavItem href="#" icon={<Users />} label="Capacity" />
          </SidebarTree>
          <SidebarNavItem
            href="#"
            icon={
              <SidebarObjectIcon product="backoffice">
                <Receipt />
              </SidebarObjectIcon>
            }
            label="backoffice"
          />
          <SidebarTree>
            <SidebarNavItem href="#" icon={<Clock />} label="Time" />
            <SidebarNavItem href="#" icon={<Palmtree />} label="Time off" />
            <SidebarNavItem href="#" icon={<FileText />} label="Billing" count={3} />
            <SidebarNavItem href="#" icon={<Landmark />} label="Finance" />
          </SidebarTree>
          <SidebarNavItem
            href="#"
            icon={
              <SidebarObjectIcon product="coldcall">
                <Handshake />
              </SidebarObjectIcon>
            }
            label="coldcall"
            trailing="connect"
          />
        </SidebarSection>

        <SidebarSection label="Records">
          <SidebarNavItem
            href="#"
            icon={
              <SidebarObjectIcon product="jobsearch">
                <User />
              </SidebarObjectIcon>
            }
            label="Contacts"
          />
          <SidebarNavItem
            href="#"
            icon={
              <SidebarObjectIcon product="vacancy">
                <Building2 />
              </SidebarObjectIcon>
            }
            label="Companies"
          />
        </SidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <SidebarNavItem href="#" icon={<Sparkles />} label="Ask workload.zero" />
        <SidebarNavItem href="#" icon={<Settings />} label="Settings" />
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <div className="flex h-12 items-center gap-2 border-0 border-b border-solid border-sidebar-border px-4">
        <SidebarTrigger />
        <span className="font-medium">Home</span>
      </div>
      <div className="p-8 text-text-subtle">Seiteninhalt</div>
    </SidebarInset>
  </SidebarLayout>
);

export const Default: Story = {
  render: () => <Example />,
};

export const Collapsed: Story = {
  render: () => <Example defaultCollapsed />,
};

/** `variant="nav"`: nav-item / nav-item-current type roles and the nav-item padding and gap size tokens. */
export const NavItemRoles: Story = {
  render: () => (
    <SidebarLayout>
      <Sidebar aria-label="Primary">
        <SidebarContent>
          <SidebarNavItem variant="nav" href="#" icon={<Home />} label="Home" active />
          <SidebarNavItem variant="nav" href="#" icon={<Inbox />} label="Inbox" count={6} />
          <SidebarNavItem variant="nav" href="#" icon={<CalendarDays />} label="Calendar" />
        </SidebarContent>
      </Sidebar>
    </SidebarLayout>
  ),
};

// Docks to the left edge below the TopBar (top-topbar). Pair with a left offset on the page content.
export const FixedBelowTopBar: Story = {
  render: () => (
    <div className="relative h-96 overflow-hidden">
      <Sidebar position="fixed" aria-label="Main menu">
        <SidebarNavItem href="#a" label="Home" active />
        <SidebarNavItem href="#b" label="Section" current="location" />
      </Sidebar>
    </div>
  ),
};

// SidebarProvider shares the collapse state without the SidebarLayout min-h-screen wrapper. The app owns the layout, here a plain grid.
export const WithoutLayoutWrapper: Story = {
  render: () => (
    <SidebarProvider>
      <div className="grid h-96 grid-cols-[auto_1fr] bg-sidebar-background">
        <Sidebar position="static" aria-label="Main menu">
          <SidebarNavItem href="#a" icon={<Home />} label="Home" active />
          <SidebarNavItem href="#b" icon={<Inbox />} label="Inbox" />
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};

// Product look of the workload.zero apps: the preset switches the component defaults (set it once at the app root).
export const ZeroPreset: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <DesignSystemProvider preset="zero">
        <Story />
      </DesignSystemProvider>
    ),
  ],
};
