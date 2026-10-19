import { render, screen } from '@testing-library/react';

import { SectionFooter } from './section-footer';

describe('SectionFooter', () => {
  it('renders a hairline and right aligned actions by default (section)', () => {
    const { container } = render(
      <SectionFooter data-testid="f">
        <button type="button">Save</button>
      </SectionFooter>,
    );
    expect(screen.getByTestId('f')).toHaveClass('gap-5');
    expect(container.querySelector('[data-slot="divider"]')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Save' }).parentElement).toHaveClass('justify-end');
  });

  it('card type pads the row and the bottom', () => {
    render(
      <SectionFooter data-testid="f" type="card" supporting="Learn more" start={<div role="group" aria-label="Range" />}>
        <button type="button">Save</button>
      </SectionFooter>,
    );
    expect(screen.getByTestId('f')).toHaveClass('pb-4', 'gap-4');
    expect(screen.getByText('Learn more').parentElement).toHaveClass('px-6');
    expect(screen.getByRole('group', { name: 'Range' })).toBeInTheDocument();
  });

  it('divider false removes the hairline', () => {
    const { container } = render(<SectionFooter divider={false} />);
    expect(container.querySelector('[data-slot="divider"]')).toBeNull();
  });
});
