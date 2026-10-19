import { render, screen } from '@testing-library/react';

import { FileIcon, fileExtensionOf, fileKindOf } from './file-icon';

describe('file helpers', () => {
  it('derives extension and kind', () => {
    expect(fileExtensionOf('report.final.PDF')).toBe('pdf');
    expect(fileExtensionOf('README')).toBe('');
    expect(fileKindOf('xlsx')).toBe('spreadsheet');
    expect(fileKindOf('.png')).toBe('image');
    expect(fileKindOf('unknown')).toBe('other');
  });
});

describe('FileIcon', () => {
  it('uses the data-file tokens for the kind and shows the extension', () => {
    const { container } = render(<FileIcon name="slides.pptx" />);
    const icon = container.firstElementChild as HTMLElement;
    expect(icon).toHaveAttribute('data-kind', 'presentation');
    expect(icon).toHaveClass('bg-data-file-slide-subtle', 'text-data-file-slide-on');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('pptx')).toBeInTheDocument();
  });

  it('sizes the extension label with the smallest typography roles and keeps four characters', () => {
    const { rerender } = render(<FileIcon ext="docx" size="md" />);
    expect(screen.getByText('docx')).toHaveClass('typography-avatar-xs');
    expect(screen.getByText('docx').className).not.toMatch(/text-\[/);
    rerender(<FileIcon ext="docx" size="lg" />);
    expect(screen.getByText('docx')).toHaveClass('typography-micro');
    rerender(<FileIcon ext="markdown" size="lg" />);
    expect(screen.getByText('mark')).toBeInTheDocument();
  });

  it('gives pdf its own colour', () => {
    const { container } = render(<FileIcon ext="pdf" />);
    expect(container.firstElementChild).toHaveClass('bg-data-file-pdf-subtle');
  });

  it('exposes a name when not decorative, including the error state', () => {
    render(<FileIcon ext="zip" decorative={false} error />);
    expect(screen.getByRole('img', { name: 'Archive ZIP, Upload failed' })).toHaveAttribute('data-error', 'true');
  });

  it('hides the extension label at size sm', () => {
    render(<FileIcon ext="csv" size="sm" />);
    expect(screen.getByText('csv')).toHaveClass('hidden');
  });
});

describe('FileIcon lg size (0.13.2)', () => {
  it('lg is a 56px tile with a 24px glyph like the zero tile', () => {
    const { container } = render(<FileIcon ext="docx" size="lg" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveClass('h-14', 'w-14');
    expect(tile.querySelector('svg')).toHaveClass('h-icon-lg', 'w-icon-lg');
  });
});

describe('FileIcon folder kind (0.15)', () => {
  it('renders the folder glyph on the generic tokens without an extension label', () => {
    const { container } = render(<FileIcon kind="folder" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveAttribute('data-kind', 'folder');
    expect(tile).toHaveClass('bg-data-file-generic-subtle', 'text-data-file-generic-on');
    expect(tile.querySelector('b')).toBeNull();
    expect(tile.querySelector('svg')).toHaveClass('lucide-folder');
  });

  it('exposes the localized folder name when not decorative', () => {
    render(<FileIcon kind="folder" decorative={false} />);
    expect(screen.getByRole('img', { name: 'Folder' })).toBeInTheDocument();
  });
});
