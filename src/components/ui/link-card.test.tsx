import { render, screen } from '@testing-library/react';

import { LinkCard } from './link-card';

describe('LinkCard', () => {
  it('is a single link with title, description and a decorative chevron', () => {
    const { container } = render(<LinkCard href="/services" title="Services" description="What we do" />);
    const link = screen.getByRole('link', { name: 'Services What we do' });
    expect(link).toHaveAttribute('href', '/services');
    expect(link).toHaveClass('hover:bg-muted', 'rounded-surface');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveClass('motion-safe:group-hover:translate-x-1');
  });

  it('accepts a leading icon and a custom trailing slot', () => {
    const { container } = render(<LinkCard href="/x" title="X" icon={<i data-testid="lead" />} trailing={<b data-testid="trail" />} />);
    expect(screen.getByTestId('lead')).toBeInTheDocument();
    expect(screen.getByTestId('trail')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('stacks the media above the text, cropped to the aspect ratio, and passes alt through', () => {
    render(<LinkCard href="/case" title="Case study" media={<img src="/case.jpg" alt="Team at the whiteboard" />} />);
    const link = screen.getByRole('link', { name: /Case study/ });
    expect(link).toHaveClass('flex-col', 'overflow-hidden');
    const image = screen.getByRole('img', { name: 'Team at the whiteboard' });
    expect(image).toHaveAttribute('src', '/case.jpg');
    expect(image.parentElement).toHaveClass('aspect-video', '[&>img]:object-cover');
    expect(link.firstElementChild).toBe(image.parentElement);
  });

  it('supports a square media ratio and an explicit inline layout', () => {
    const { rerender } = render(<LinkCard href="/x" title="X" media={<img src="/x.jpg" alt="" />} mediaAspect="square" />);
    expect(document.querySelector('.aspect-square')).not.toBeNull();
    rerender(<LinkCard href="/x" title="X" layout="inline" media={<img src="/x.jpg" alt="" />} />);
    expect(screen.getByRole('link', { name: 'X' })).not.toHaveClass('flex-col');
  });

  it('keeps default title size and padding, and offers a larger title and padding', () => {
    const { rerender } = render(<LinkCard href="/x" title="Case" media={<img src="/x.jpg" alt="" />} />);
    expect(screen.getByText('Case')).toHaveClass('typography-ui-semibold');
    expect(screen.getByText('Case').parentElement?.parentElement).toHaveClass('p-5');
    rerender(<LinkCard href="/x" title="Case" titleSize="lg" padding="lg" media={<img src="/x.jpg" alt="" />} />);
    expect(screen.getByText('Case')).toHaveClass('typography-title-sm');
    expect(screen.getByText('Case')).not.toHaveClass('typography-ui-semibold');
    expect(screen.getByText('Case').parentElement?.parentElement).toHaveClass('p-8');
  });

  it('cornerArrow draws a decorative arrow instead of the chevron and keeps the accessible name', () => {
    const { container } = render(<LinkCard href="/x" title="Case" cornerArrow media={<img src="/x.jpg" alt="" />} />);
    const arrow = container.querySelector('[data-slot="corner-arrow"]');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    expect(arrow).toHaveClass('absolute');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Case' })).toBeInTheDocument();
  });

  it('renders the title as a heading, h3 by default and configurable', () => {
    const { rerender } = render(<LinkCard href="/a" title="Pricing" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Pricing' })).toBeInTheDocument();
    rerender(<LinkCard href="/a" title="Pricing" titleAs="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Pricing' })).toBeInTheDocument();
  });
});
