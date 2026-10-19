import { render, screen } from '@testing-library/react';

import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders the headline as h1 with supporting text and both actions', () => {
    render(
      <HeroSection
        eyebrow="backoffice"
        headline="Time, invoices and exports in one place."
        supportingText="For freelancers."
        primaryAction={<button type="button">Start for free</button>}
        secondaryAction={<button type="button">Watch demo</button>}
        productShot={<div data-testid="shot" />}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: /exports/ })).toBeInTheDocument();
    expect(screen.getByText('backoffice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start for free' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Watch demo' })).toBeInTheDocument();
    expect(screen.getByTestId('shot')).toBeInTheDocument();
  });

  it('omits optional parts and supports h2', () => {
    render(<HeroSection headline="Only a headline" headlineAs="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('HeroSection tone', () => {
  it('renders on the inverse surface with inverse text', () => {
    render(<HeroSection tone="inverse" eyebrow="Eyebrow" headline="Inverse" supportingText="Support" />);
    expect(screen.getByRole('heading', { level: 1 }).closest('section')).toHaveClass('bg-background-inverse');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-text-inverse');
  });

  it('keeps the default surface', () => {
    render(<HeroSection headline="Default" />);
    expect(screen.getByRole('heading', { level: 1 }).closest('section')).toHaveClass('bg-background');
  });
});
