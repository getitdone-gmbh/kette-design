import { render, screen } from '@testing-library/react';

import { Section } from './section';

describe('Section variants use semantic surface tokens', () => {
  it('white renders the background token instead of a raw white', () => {
    render(<Section variant="white" data-testid="s"><p>x</p></Section>);
    expect(screen.getByTestId('s')).toHaveClass('bg-background');
    expect(screen.getByTestId('s')).not.toHaveClass('bg-white');
  });

  it('primary pairs the primary surface with the primary foreground', () => {
    render(<Section variant="primary" data-testid="s"><p>x</p></Section>);
    expect(screen.getByTestId('s')).toHaveClass('bg-primary', 'text-primary-foreground');
  });
});
