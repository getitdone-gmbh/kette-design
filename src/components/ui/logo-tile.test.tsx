import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import { LogoTile } from './logo-tile';

describe('LogoTile', () => {
  it('renders initials on the project colour with on-brand text and the 24px radius', () => {
    render(<LogoTile initials="NH" data-testid="tile" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveTextContent('NH');
    expect(tile).toHaveClass('bg-data-project-1', 'text-data-project-1-on', 'rounded-logo-tile-24', 'h-avatar-xs', 'w-avatar-xs', 'text-logo-tile-24', 'font-bold');
  });

  it.each([
    ['xs', 'rounded-logo-tile-24'],
    ['sm', 'rounded-logo-tile-32'],
    ['md', 'rounded-logo-tile-40'],
  ] as const)('size %s uses %s (size x 0.25)', (size, radius) => {
    render(<LogoTile initials="X" size={size} data-testid="tile" />);
    expect(screen.getByTestId('tile')).toHaveClass(radius);
  });

  it.each([
    ['xs', 'text-logo-tile-24'],
    ['sm', 'text-logo-tile-32'],
    ['md', 'text-logo-tile-40'],
  ] as const)('size %s sets the initials to %s in bold', (size, fontSize) => {
    render(<LogoTile initials="X" size={size} data-testid="tile" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveClass(fontSize, 'font-bold');
    expect(tile.className).not.toMatch(/typography-/);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8] as const)('maps Color=%s to colors/data/project/%s', (n) => {
    render(<LogoTile initials="X" color={n} data-testid="tile" />);
    expect(screen.getByTestId('tile')).toHaveClass(`bg-data-project-${n}`);
  });

  it('is decorative without a label and an image with one', () => {
    const { rerender } = render(<LogoTile initials="NH" data-testid="tile" />);
    expect(screen.getByTestId('tile')).toHaveAttribute('aria-hidden', 'true');
    rerender(<LogoTile initials="NH" label="Nordwind Handel GmbH" />);
    expect(screen.getByRole('img', { name: 'Nordwind Handel GmbH' })).toBeInTheDocument();
  });

  it('supports larger sizes and forwards the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<LogoTile ref={ref} initials="NH" size="md" data-testid="tile" />);
    expect(ref.current).toBe(screen.getByTestId('tile'));
    expect(ref.current).toHaveClass('h-avatar-md', 'w-avatar-md');
  });
});

describe('LogoTile neutral tone', () => {
  it('renders a bordered neutral surface with the logo image, not a project colour', () => {
    render(<LogoTile tone="neutral" src="/slack.svg" label="Slack" size="sm" />);
    const tile = screen.getByRole('img', { name: 'Slack' });
    expect(tile).toHaveClass('border-border', 'bg-background', 'h-avatar-sm', 'w-avatar-sm');
    expect(tile.className).not.toMatch(/bg-data-project/);
    expect(tile.querySelector('img')).toHaveAttribute('alt', '');
    expect(tile).not.toHaveAttribute('data-color');
  });

  it('accepts an svg as children and stays decorative without a label', () => {
    render(
      <LogoTile tone="neutral" data-testid="tile">
        <svg data-testid="logo" />
      </LogoTile>,
    );
    expect(screen.getByTestId('tile')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });
});
