import { render, screen } from '@testing-library/react';

import { FeaturedIcon } from './featured-icon';

describe('FeaturedIcon', () => {
  it('is decorative by default', () => {
    const { container } = render(<FeaturedIcon>icon</FeaturedIcon>);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveClass('rounded-full', 'bg-muted');
  });

  it('exposes an image role when labelled', () => {
    render(<FeaturedIcon label="Success" tone="success" size="lg" shape="square" />);
    const icon = screen.getByRole('img', { name: 'Success' });
    expect(icon).toHaveClass('bg-general-success-container', 'h-control-2xl', 'rounded-surface');
  });
});
