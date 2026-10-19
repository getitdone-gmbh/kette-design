import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';

import { DocumentSurface } from './document-surface';

describe('DocumentSurface', () => {
  it('uses the paper tokens and document width', () => {
    render(<DocumentSurface>Invoice</DocumentSurface>);
    expect(screen.getByText('Invoice')).toHaveClass('bg-surface-paper', 'text-text-on-paper', 'max-w-document', 'print:shadow-none');
  });

  it('drops the width cap when fluid', () => {
    render(<DocumentSurface fluid>Offer</DocumentSurface>);
    expect(screen.getByText('Offer')).not.toHaveClass('max-w-document');
  });

  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLDivElement>();
    render(<DocumentSurface ref={ref} className="p-4">CV</DocumentSurface>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('p-4');
  });

  it('ships a light token scope for the paper that overrides the dark values', () => {
    const css = readFileSync(resolve(process.cwd(), 'styles/document-surface.css'), 'utf8');
    expect(css).toContain('[data-document-surface] {');
    expect(css).toContain('color-scheme: light;');
    expect(css).toMatch(/--colors-background: 255 255 255;/);
    expect(css).not.toContain('.dark');
    render(<DocumentSurface>Invoice</DocumentSurface>);
    expect(screen.getByText('Invoice')).toHaveAttribute('data-document-surface');
  });

  it('loads the scope through the library stylesheet', () => {
    const entry = readFileSync(resolve(process.cwd(), 'styles/build.css'), 'utf8');
    expect(entry).toContain("@import './document-surface.css';");
  });
});
