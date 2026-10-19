import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HelpIcon } from './help-icon';

describe('HelpIcon', () => {
  it('is a focusable button with an accessible name and no tooltip at rest', () => {
    render(<HelpIcon content="Billable hours" />);
    const btn = screen.getByRole('button', { name: 'Help' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('text-icon-subtle', 'hover:text-icon-default', 'focus-visible:ring-focus');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on keyboard focus and shows headline and supporting text', async () => {
    render(<HelpIcon content="Billable hours" supportingText="Hours that can be invoiced." label="About billable hours" />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'About billable hours' })).toHaveFocus();
    expect((await screen.findAllByText('Billable hours')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Hours that can be invoiced.')).length).toBeGreaterThan(0);
  });

  it('closes on Escape', async () => {
    render(<HelpIcon content="Tip" />);
    await userEvent.tab();
    expect((await screen.findAllByText('Tip')).length).toBeGreaterThan(0);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports the controlled open state (Figma Open=True)', () => {
    render(<HelpIcon content="Always open" open />);
    expect(screen.getAllByText('Always open').length).toBeGreaterThan(0);
  });
});
