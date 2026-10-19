import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignatureBox } from './signature-box';

describe('SignatureBox', () => {
  it('shows the signer name and time when signed', () => {
    render(<SignatureBox name="Lena Hartmann" signedAt="08.10.2026 14:12" />);
    const box = screen.getByRole('group', { name: 'Signature' });
    expect(box).toHaveAttribute('data-state', 'signed');
    expect(box).toHaveTextContent('Lena Hartmann');
    expect(box).toHaveTextContent('08.10.2026 14:12');
  });

  it('formats Date values', () => {
    render(<SignatureBox name="A" signedAt={new Date(2026, 9, 8, 14, 12)} formatDate={() => 'formatted'} />);
    expect(screen.getByText('formatted')).toBeInTheDocument();
  });

  it('is an open dashed box without a name', () => {
    render(<SignatureBox />);
    const box = screen.getByRole('group', { name: 'Signature' });
    expect(box).toHaveAttribute('data-state', 'open');
    expect(box).toHaveClass('border-dashed');
    expect(box).toHaveTextContent('Sign here');
  });

  it('becomes a button with onSign and is keyboard operable', async () => {
    const user = userEvent.setup();
    const onSign = vi.fn();
    render(<SignatureBox onSign={onSign} placeholder="Click to sign" />);
    const button = screen.getByRole('button', { name: 'Signature: Click to sign' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSign).toHaveBeenCalledTimes(1);
  });

  it('disables the open button', () => {
    render(<SignatureBox onSign={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('an explicit signed=false overrides a name', () => {
    render(<SignatureBox name="A" signed={false} />);
    expect(screen.getByRole('group')).toHaveAttribute('data-state', 'open');
  });
});
