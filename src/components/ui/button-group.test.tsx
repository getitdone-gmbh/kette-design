import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ButtonGroup, ButtonGroupItem } from './button-group';

describe('ButtonGroup', () => {
  it('is a named group of buttons with the shared frame', () => {
    render(
      <ButtonGroup aria-label="View">
        <ButtonGroupItem>Day</ButtonGroupItem>
        <ButtonGroupItem>Week</ButtonGroupItem>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'View' });
    expect(group).toHaveClass('rounded-control', 'border-input', 'overflow-hidden', 'shadow-elevation-surface');
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('type', 'button');
  });

  it('segment: control height, label role, dividers except the last, hover state', () => {
    render(
      <ButtonGroup>
        <ButtonGroupItem>One</ButtonGroupItem>
        <ButtonGroupItem>Two</ButtonGroupItem>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'One' })).toHaveClass(
      'h-control-md',
      'typography-label',
      'border-r',
      'last:border-r-0',
      'hover:bg-muted',
      'px-4',
    );
  });

  it('current segment is pressed and muted', () => {
    render(
      <ButtonGroup>
        <ButtonGroupItem current>On</ButtonGroupItem>
        <ButtonGroupItem current={false}>Off</ButtonGroupItem>
        <ButtonGroupItem>Plain</ButtonGroupItem>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'On' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'On' })).toHaveClass('data-[current]:bg-muted');
    expect(screen.getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Plain' })).not.toHaveAttribute('aria-pressed');
  });

  it('icon only is square and needs an aria-label, leading icon is decorative, dot variant', () => {
    render(
      <ButtonGroup>
        <ButtonGroupItem aria-label="Add" icon={<svg data-testid="plus" />} />
        <ButtonGroupItem icon={<svg data-testid="lead" />}>Filter</ButtonGroupItem>
        <ButtonGroupItem dotLeading>Live</ButtonGroupItem>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass('w-control-md');
    expect(screen.getByRole('button', { name: 'Add' })).not.toHaveClass('px-4');
    expect(screen.getByTestId('lead').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Live' }).querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('disabled segment cannot be clicked', async () => {
    const onClick = vi.fn();
    render(
      <ButtonGroup>
        <ButtonGroupItem disabled onClick={onClick}>
          Off
        </ButtonGroupItem>
      </ButtonGroup>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('tab order follows segments with an inset focus ring', async () => {
    render(
      <ButtonGroup>
        <ButtonGroupItem>A</ButtonGroupItem>
        <ButtonGroupItem>B</ButtonGroupItem>
      </ButtonGroup>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('focus-visible:ring-inset', 'focus-visible:ring-focus');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });
});
