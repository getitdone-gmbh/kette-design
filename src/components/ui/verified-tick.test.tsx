import { render, screen } from '@testing-library/react';

import { VerifiedTick, verifiedTickSizes } from './verified-tick';

describe('VerifiedTick', () => {
  it('is an image named Verified, 16px by default, info coloured', () => {
    render(<VerifiedTick />);
    const tick = screen.getByRole('img', { name: 'Verified' });
    expect(tick).toHaveAttribute('width', '16');
    expect(tick).toHaveClass('text-general-info-default');
  });

  it.each(Object.entries(verifiedTickSizes))('size %s is %spx', (size, px) => {
    render(<VerifiedTick size={size as keyof typeof verifiedTickSizes} />);
    expect(screen.getByRole('img')).toHaveAttribute('height', String(px));
  });

  it('can be hidden when the label is empty', () => {
    const { container } = render(<VerifiedTick label="" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
