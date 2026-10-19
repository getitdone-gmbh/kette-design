import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { InputDigit } from './input-digit';

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

describe('InputDigit', () => {
  it('renders six boxes by default with a hyphen after three', () => {
    const { container } = render(<InputDigit label="Code" />);
    expect(boxes()).toHaveLength(6);
    expect(container.querySelectorAll('[data-digit-separator]')).toHaveLength(1);
    expect(screen.getByRole('group', { name: 'Code' })).toBeInTheDocument();
  });

  it('renders four boxes without a hyphen', () => {
    const { container } = render(<InputDigit length={4} />);
    expect(boxes()).toHaveLength(4);
    expect(container.querySelectorAll('[data-digit-separator]')).toHaveLength(0);
  });

  it('labels every box and sets one-time-code on the first', () => {
    render(<InputDigit length={4} />);
    expect(boxes()[1]).toHaveAccessibleName('Digit 2 of 4');
    expect(boxes()[0]).toHaveAttribute('autocomplete', 'one-time-code');
    expect(boxes()[0]).toHaveAttribute('inputmode', 'numeric');
  });

  it('types digits, moves focus and completes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(<InputDigit length={4} onComplete={onComplete} onValueChange={onValueChange} />);
    boxes()[0].focus();
    await user.keyboard('1234');
    expect(boxes().map((b) => b.value)).toEqual(['1', '2', '3', '4']);
    expect(onValueChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('rejects non digits in numeric mode and accepts letters in alphanumeric mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<InputDigit length={3} />);
    boxes()[0].focus();
    await user.keyboard('a1');
    expect(boxes().map((b) => b.value)).toEqual(['1', '', '']);
    rerender(<InputDigit length={3} type="alphanumeric" defaultValue="" key="alpha" />);
    boxes()[0].focus();
    await user.keyboard('a1');
    expect(boxes().map((b) => b.value).join('')).toBe('a1');
  });

  it('backspace clears the current box, then moves back and clears the previous one', async () => {
    const user = userEvent.setup();
    render(<InputDigit length={4} defaultValue="12" />);
    boxes()[1].focus();
    await user.keyboard('{Backspace}');
    expect(boxes().map((b) => b.value)).toEqual(['1', '', '', '']);
    await user.keyboard('{Backspace}');
    expect(boxes()[0]).toHaveFocus();
    expect(boxes().map((b) => b.value)).toEqual(['', '', '', '']);
  });

  it('moves with arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<InputDigit length={4} />);
    boxes()[1].focus();
    await user.keyboard('{ArrowRight}');
    expect(boxes()[2]).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(boxes()[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(boxes()[3]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(boxes()[0]).toHaveFocus();
  });

  it('distributes pasted text over the boxes and ignores extra characters', () => {
    const onComplete = vi.fn();
    render(<InputDigit length={6} onComplete={onComplete} />);
    fireEvent.paste(boxes()[0], { clipboardData: { getData: () => '12 34-56 78' } });
    expect(boxes().map((b) => b.value).join('')).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('pastes from the focused box onward', () => {
    render(<InputDigit length={6} defaultValue="12" />);
    fireEvent.paste(boxes()[2], { clipboardData: { getData: () => '9876' } });
    expect(boxes().map((b) => b.value).join('')).toBe('129876');
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [v, setV] = useState('');
      return (
        <>
          <InputDigit length={4} value={v} onValueChange={setV} />
          <p data-testid="out">{v}</p>
        </>
      );
    };
    render(<Controlled />);
    boxes()[0].focus();
    await user.keyboard('42');
    expect(screen.getByTestId('out')).toHaveTextContent('42');
  });

  it('exposes invalid, hint and disabled states', () => {
    render(<InputDigit length={4} invalid hint="Wrong code" disabled />);
    expect(boxes()[0]).toHaveAttribute('aria-invalid', 'true');
    expect(boxes()[0]).toBeDisabled();
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Wrong code');
  });

  it('marks success without invalid and submits one hidden value', () => {
    const { container } = render(<InputDigit length={4} success name="otp" defaultValue="1234" />);
    expect(boxes()[0]).toHaveAttribute('data-success', 'true');
    expect(container.querySelector('input[type=hidden][name=otp]')).toHaveValue('1234');
  });

  it('uses the three sizes', () => {
    const { rerender } = render(<InputDigit length={4} size="sm" />);
    expect(boxes()[0]).toHaveClass('h-16', 'w-16', 'typography-digit-md');
    rerender(<InputDigit length={4} size="lg" />);
    expect(boxes()[0]).toHaveClass('h-24', 'w-24', 'typography-digit-lg');
  });
});
