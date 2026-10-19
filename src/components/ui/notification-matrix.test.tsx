import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NotificationMatrix, NotificationMatrixCell, NotificationMatrixRow } from './notification-matrix';

const Matrix = ({ onChange }: { onChange?: (v: boolean) => void }) => (
  <NotificationMatrix aria-label="Notification preferences" columns={['In-app', 'Email']}>
    <NotificationMatrixRow label="Quote accepted" description="When a client accepts">
      <NotificationMatrixCell label="Quote accepted, In-app" defaultChecked onCheckedChange={onChange} />
      <NotificationMatrixCell label="Quote accepted, Email" onCheckedChange={onChange} />
    </NotificationMatrixRow>
    <NotificationMatrixRow label="Security alert" required>
      <NotificationMatrixCell label="Security alert, In-app" checked readOnly />
      <NotificationMatrixCell label="Security alert, Email" checked readOnly />
    </NotificationMatrixRow>
  </NotificationMatrix>
);

describe('NotificationMatrix', () => {
  it('renders a table with channel headers and a labelled switch per cell', () => {
    render(<Matrix />);
    expect(screen.getByRole('table', { name: 'Notification preferences' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getAllByRole('switch')).toHaveLength(4);
    expect(screen.getByRole('switch', { name: 'Quote accepted, In-app' })).toBeChecked();
  });

  it('toggles an editable cell with click and keyboard', async () => {
    const onChange = vi.fn();
    render(<Matrix onChange={onChange} />);
    const email = screen.getByRole('switch', { name: 'Quote accepted, Email' });
    await userEvent.click(email);
    expect(onChange).toHaveBeenLastCalledWith(true);
    email.focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps a read only cell on, focusable and unchanged', async () => {
    render(<Matrix />);
    const sw = screen.getByRole('switch', { name: 'Security alert, Email' });
    expect(sw).toHaveAttribute('aria-readonly', 'true');
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    sw.focus();
    expect(sw).toHaveFocus();
  });

  it('marks required rows with a chip', () => {
    render(<Matrix />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
