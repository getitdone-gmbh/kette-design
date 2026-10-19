import { render, screen } from '@testing-library/react';

import { PanelSectionHeader } from './section-header';
import { Tabs, TabsList, TabsTrigger } from './tabs';

describe('PanelSectionHeader', () => {
  it('renders the title as h2 by default with the description', () => {
    render(<PanelSectionHeader title="Team members" description="Manage your team." />);
    expect(screen.getByRole('heading', { level: 2, name: 'Team members' })).toBeInTheDocument();
    expect(screen.getByText('Manage your team.')).toHaveClass('text-text-subtle');
  });

  it('titleAs sets the heading level', () => {
    render(<PanelSectionHeader title="Billing" titleAs="h4" />);
    expect(screen.getByRole('heading', { level: 4, name: 'Billing' })).toBeInTheDocument();
  });

  it('omits description, actions, tabs and divider when not given', () => {
    const { container } = render(<PanelSectionHeader title="Only title" />);
    expect(container.querySelector('[data-slot="actions"]')).toBeNull();
    expect(container.querySelector('[data-slot="tabs"]')).toBeNull();
    expect(container.querySelector('hr')).toBeNull();
  });

  it('renders actions and tabs slots and a divider', () => {
    const { container } = render(
      <PanelSectionHeader
        title="Team"
        actions={<button type="button">Invite</button>}
        tabs={
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">All</TabsTrigger>
              <TabsTrigger value="b">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        }
        divider
      />,
    );
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(container.querySelector('hr')).toHaveClass('bg-border');
  });

  it('size sm is the default and md uses the larger title role', () => {
    const { rerender } = render(<PanelSectionHeader title="T" />);
    expect(screen.getByRole('heading')).toHaveClass('typography-label-highlight');
    rerender(<PanelSectionHeader title="T" size="md" />);
    expect(screen.getByRole('heading')).toHaveClass('typography-ui-lg-semibold');
  });

  it('forwards ref and className', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PanelSectionHeader ref={ref} title="T" className="custom" />);
    expect(ref.current).toHaveClass('custom');
  });
});
