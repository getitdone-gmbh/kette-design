import { render, screen } from '@testing-library/react';

import { Blockquote } from './blockquote';

describe('Blockquote', () => {
  it('renders a plain quote on the token layer without fixed colours or off-scale spacing', () => {
    render(<Blockquote>Quote</Blockquote>);
    const quote = screen.getByText('Quote');
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote.className).toContain('border-border-bold');
    expect(quote.className).not.toMatch(/#|\[\d+px\]/);
  });

  it('wraps the quote and its attribution in a figure', () => {
    const { container } = render(<Blockquote cite="Anna, Design">Quote</Blockquote>);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(screen.getByText('Anna, Design').tagName).toBe('FIGCAPTION');
  });

  it('sets the source address as the cite attribute', () => {
    render(<Blockquote citeUrl="https://example.com">Quote</Blockquote>);
    expect(screen.getByText('Quote')).toHaveAttribute('cite', 'https://example.com');
  });

  it('pull variant adds a decorative mark hidden from assistive technology', () => {
    const { container } = render(<Blockquote variant="pull">Quote</Blockquote>);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('“');
  });
});
