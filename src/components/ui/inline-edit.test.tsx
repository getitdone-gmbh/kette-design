import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { InlineEdit } from './inline-edit';

describe('InlineEdit', () => {
  it('is a labelled text input with the attribute variant by default', () => {
    render(<InlineEdit aria-label="Company name" defaultValue="Nordwind Handel" />);
    const input = screen.getByRole('textbox', { name: 'Company name' });
    expect(input).toHaveValue('Nordwind Handel');
    expect(input).toHaveAttribute('data-variant', 'attribute');
  });

  it('supports the cell variant', () => {
    render(<InlineEdit aria-label="Cell" variant="cell" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('data-variant', 'cell');
  });

  it('commits on Enter and on blur, only when changed', async () => {
    const onCommit = vi.fn();
    render(<InlineEdit aria-label="n" defaultValue="Nordwind Handel" onCommit={onCommit} />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    expect(onCommit).not.toHaveBeenCalled();
    await userEvent.type(input, ' GmbH{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Nordwind Handel GmbH');
    await userEvent.type(input, '!');
    await userEvent.tab();
    expect(onCommit).toHaveBeenLastCalledWith('Nordwind Handel GmbH!');
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it('reverts on Escape and calls onCancel', async () => {
    const onCancel = vi.fn();
    const onCommit = vi.fn();
    render(<InlineEdit aria-label="n" defaultValue="Nordwind Handel" onCancel={onCancel} onCommit={onCommit} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'xyz{Escape}');
    expect(input).toHaveValue('Nordwind Handel');
    expect(onCancel).toHaveBeenCalled();
    await userEvent.tab();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('works controlled', async () => {
    const Controlled = () => {
      const [v, setV] = useState('a');
      return <InlineEdit aria-label="n" value={v} onValueChange={setV} />;
    };
    render(<Controlled />);
    await userEvent.type(screen.getByRole('textbox'), 'b');
    expect(screen.getByRole('textbox')).toHaveValue('ab');
  });

  it('is read only without committing', async () => {
    const onCommit = vi.fn();
    render(<InlineEdit aria-label="n" defaultValue="Nordwind Handel" readOnly onCommit={onCommit} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'x{Enter}');
    expect(input).toHaveValue('Nordwind Handel');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('marks invalid and links the error message', () => {
    render(<InlineEdit aria-label="n" defaultValue="" invalid errorMessage="Required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required');
  });

  it('forwards disabled and ref', () => {
    render(<InlineEdit aria-label="n" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
