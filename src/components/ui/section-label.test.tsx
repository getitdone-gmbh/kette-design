import { render, screen } from '@testing-library/react';

import { SectionLabel } from './section-label';

describe('SectionLabel', () => {
  it('renders index, overline, title and description', () => {
    render(<SectionLabel index="01" overline="Process" title="How we work" description="Three steps." />);
    expect(screen.getByText('Process')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'How we work' })).toBeInTheDocument();
    expect(screen.getByText('Three steps.')).toBeInTheDocument();
  });

  it('hides the decorative index from assistive technology', () => {
    render(<SectionLabel index="02" title="Next" titleAs="h3" />);
    expect(screen.getByText('02')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});

describe('SectionLabel indexSize (0.15)', () => {
  it('keeps the compact index by default', () => {
    render(<SectionLabel index="01" title="Plain" />);
    expect(screen.getByText('01')).toHaveClass('typography-ui-semibold');
  });

  it('renders a large display index for dashboard rails and keeps it decorative', () => {
    render(<SectionLabel index="03" indexSize="lg" title="Rail" />);
    const index = screen.getByText('03');
    expect(index).toHaveClass('typography-display-sm', 'text-text-brand');
    expect(index).not.toHaveClass('typography-ui-semibold');
    expect(index).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SectionLabel layout (0.17)', () => {
  it('keeps the index beside the text by default', () => {
    const { container } = render(<SectionLabel index="01" title="Inline" />);
    expect(container.firstElementChild).toHaveClass('flex', 'items-start', 'gap-4');
    expect(container.firstElementChild).not.toHaveClass('flex-col');
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'inline');
  });

  it('stacks the index above the title for narrow rails and keeps it decorative', () => {
    const { container } = render(<SectionLabel index="03" layout="stacked" overline="Run" title="Rail" />);
    expect(container.firstElementChild).toHaveClass('flex-col', 'gap-2');
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'stacked');
    const index = screen.getByText('03');
    expect(index).toHaveAttribute('aria-hidden', 'true');
    expect(index.nextElementSibling).toContainElement(screen.getByRole('heading', { name: 'Rail' }));
  });

  it('drops the fixed index width when a large index is stacked', () => {
    render(<SectionLabel index="03" indexSize="lg" layout="stacked" title="Rail" />);
    expect(screen.getByText('03')).not.toHaveClass('w-12');
    expect(screen.getByText('03')).toHaveClass('typography-display-sm');
  });
});
