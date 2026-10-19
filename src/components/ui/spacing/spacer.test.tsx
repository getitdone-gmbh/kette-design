import { render, screen } from '@testing-library/react';

import { ContainerSpacer, Spacer } from './spacer';

describe('Spacer', () => {
  it('is a hidden block with the height for the y direction', () => {
    render(<Spacer data-testid="s" size={24} />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('h-6', 'w-full');
  });

  it('uses width for the x direction', () => {
    render(<Spacer data-testid="s" size={8} direction="x" />);
    expect(screen.getByTestId('s')).toHaveClass('w-2', 'self-stretch');
  });

  it('defaults to 16', () => {
    render(<Spacer data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveClass('h-4');
  });
});

describe('ContainerSpacer', () => {
  it.each([
    ['sm', 'max-w-screen-sm'],
    ['md', 'max-w-screen-md'],
    ['lg', 'max-w-screen-lg'],
    ['xl', 'max-w-screen-xl'],
  ] as const)('size %s limits the width', (size, cls) => {
    render(<ContainerSpacer size={size} data-testid="c">x</ContainerSpacer>);
    expect(screen.getByTestId('c')).toHaveClass(cls, 'mx-auto');
  });
});
