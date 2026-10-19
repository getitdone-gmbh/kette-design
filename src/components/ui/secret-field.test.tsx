import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { DesignSystemProvider } from './design-system-provider';
import { maskSecret, SecretField } from './secret-field';

const KEY = 'demo-secret-0123456789abcdef';

describe('maskSecret', () => {
  it('keeps the first and last characters and masks the middle', () => {
    expect(maskSecret(KEY, 4)).toBe('demo••••••••cdef'.slice(0, 4) + '••••••••' + KEY.slice(-4));
  });

  it('masks short values completely', () => {
    expect(maskSecret('abcd', 4)).toBe('••••');
    expect(maskSecret('abcdefghij', 4)).toBe('•'.repeat(8));
    expect(maskSecret('', 4)).toBe('•');
  });
});

describe('SecretField', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  it('shows a partially masked read-only value and keeps the real value out of the DOM', () => {
    const { container } = render(<SecretField aria-label="API key" value={KEY} />);
    const field = screen.getByLabelText('API key') as HTMLInputElement;
    expect(field).toHaveAttribute('readonly');
    expect(field.value).toBe(`${KEY.slice(0, 4)}${'•'.repeat(8)}${KEY.slice(-4)}`);
    expect(container.innerHTML).not.toContain(KEY);
  });

  it('reveals and hides the real value with a labelled toggle', async () => {
    const onRevealedChange = vi.fn();
    render(<SecretField aria-label="API key" value={KEY} onRevealedChange={onRevealedChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Show value' }));
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toBe(KEY);
    expect(onRevealedChange).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole('button', { name: 'Hide value' }));
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toContain('•');
  });

  it('supports a controlled reveal state', () => {
    const { rerender } = render(<SecretField aria-label="API key" value={KEY} revealed={false} />);
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toContain('•');
    rerender(<SecretField aria-label="API key" value={KEY} revealed />);
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toBe(KEY);
  });

  it('copies the real value even while masked and announces it', async () => {
    const onCopy = vi.fn();
    render(<SecretField aria-label="API key" value={KEY} onValueCopied={onCopy} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy value' }));
    expect(writeText).toHaveBeenCalledWith(KEY);
    expect(onCopy).toHaveBeenCalledWith(KEY);
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('is operable with the keyboard', async () => {
    render(<SecretField aria-label="API key" value={KEY} />);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Show value' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Hide value' })).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(writeText).toHaveBeenCalledWith(KEY);
  });

  it('can hide the toggle or the copy button and disables both when disabled', () => {
    const { rerender } = render(<SecretField aria-label="API key" value={KEY} revealable={false} />);
    expect(screen.queryByRole('button', { name: 'Show value' })).toBeNull();
    rerender(<SecretField aria-label="API key" value={KEY} copyable={false} />);
    expect(screen.queryByRole('button', { name: 'Copy value' })).toBeNull();
    rerender(<SecretField aria-label="API key" value={KEY} disabled />);
    expect(screen.getByRole('button', { name: 'Show value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy value' })).toBeDisabled();
  });

  it('uses German labels from the provider and instance overrides', () => {
    const { rerender } = render(
      <DesignSystemProvider locale="de">
        <SecretField aria-label="API-Schlüssel" value={KEY} />
      </DesignSystemProvider>,
    );
    expect(screen.getByRole('button', { name: 'Wert anzeigen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wert kopieren' })).toBeInTheDocument();
    rerender(<SecretField aria-label="x" value={KEY} showLabel="Reveal key" copyLabel="Copy key" />);
    expect(screen.getByRole('button', { name: 'Reveal key' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy key' })).toBeInTheDocument();
  });
});
