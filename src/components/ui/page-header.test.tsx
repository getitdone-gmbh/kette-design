import { render, screen } from '@testing-library/react';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the title as an h1 with subtitle and actions', () => {
    render(<PageHeader title="Team members" subtitle="Manage your team" actions={<button type="button">Invite</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Team members' })).toBeInTheDocument();
    expect(screen.getByText('Manage your team')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
  });

  it('default style has a divider, zero style does not (unchanged opt-in)', () => {
    const { rerender } = render(<PageHeader title="t" />);
    expect(screen.getByRole('banner')).toHaveClass('border-b');
    rerender(<PageHeader title="t" variant="zero" />);
    expect(screen.getByRole('banner')).not.toHaveClass('border-b');
    rerender(<PageHeader title="t" variant="zero" divider />);
    expect(screen.getByRole('banner')).toHaveClass('border-b');
  });

  it('supports another heading level', () => {
    render(<PageHeader title="t" titleAs="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders leading, badges, breadcrumbs, tabs and the attributes column', () => {
    render(
      <PageHeader
        variant="record"
        title="Nordwind Handel GmbH"
        leading={<span data-testid="lead" />}
        badges={<span>Client</span>}
        breadcrumbs={<nav aria-label="Breadcrumb" />}
        tabs={<div role="tablist" />}
        attributes={<div data-testid="attrs" />}
      />,
    );
    ['lead', 'attrs'].forEach((id) => expect(screen.getByTestId(id)).toBeInTheDocument());
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('banner style renders the cover above the title and optional divider', () => {
    render(<PageHeader variant="banner" title="Lena Hartmann" subtitle="lena.hartmann@example.com" cover={<div data-testid="cover" />} divider />);
    expect(screen.getByTestId('cover')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Lena Hartmann' })).toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector('hr')).not.toBeNull();
  });

  it('banner-avatar overlaps the cover with a large avatar and supports centered', () => {
    render(
      <PageHeader variant="banner-avatar" centered title="Olivia" cover={<div />} leading={<span data-testid="av" />} actions={<button type="button">Edit</button>} />,
    );
    const av = screen.getByTestId('av');
    expect(av.parentElement).toHaveClass('h-avatar-profile', 'w-avatar-profile', 'rounded-full');
    expect(screen.getByRole('banner').children[1]).toHaveClass('-mt-10', 'items-center');
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('avatar style stays on the standard layout', () => {
    render(<PageHeader variant="avatar" title="Olivia" leading={<span data-testid="av" />} />);
    expect(screen.getByRole('banner')).toHaveClass('lg:flex-row');
  });

  it('renders scope chips after the subtitle and nothing without the prop', () => {
    const { rerender, container } = render(<PageHeader title="t" subtitle="sub" />);
    expect(container.querySelector('[data-scope-chips]')).toBeNull();
    rerender(<PageHeader title="t" subtitle="sub" scopeChips={<span>Nordwind Handel GmbH</span>} />);
    const row = container.querySelector('[data-scope-chips]') as HTMLElement;
    expect(row).toHaveTextContent('Nordwind Handel GmbH');
    expect(screen.getByText('sub').compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders scope chips in the banner layout too', () => {
    const { container } = render(<PageHeader variant="banner" title="t" scopeChips={<span>Scope</span>} />);
    expect(container.querySelector('[data-scope-chips]')).toHaveTextContent('Scope');
  });
});

