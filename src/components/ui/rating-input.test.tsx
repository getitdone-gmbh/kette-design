import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RatingInput } from './rating-input';

describe('RatingInput', () => {
  it('is a named radio group with one radio per star', () => {
    render(<RatingInput aria-label="Quality" defaultValue={3} />);
    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(radios[1]).toHaveAccessibleName('2 of 5');
    expect(radios[2]).toBeChecked();
    expect(radios[2].querySelector('svg')).toHaveAttribute('data-filled');
    expect(radios[3].querySelector('svg')).not.toHaveAttribute('data-filled');
  });

  it('selects on click and reports the number', async () => {
    const onValueChange = vi.fn();
    render(<RatingInput aria-label="Quality" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }));
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole('radio', { name: '4 of 5' })).toBeChecked();
  });

  it('moves and selects with the arrow keys after tabbing in', async () => {
    const onValueChange = vi.fn();
    render(<RatingInput aria-label="Quality" defaultValue={2} onValueChange={onValueChange} />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '2 of 5' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '3 of 5' })).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft} ');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('previews the hovered value without changing it', async () => {
    render(<RatingInput aria-label="Quality" defaultValue={1} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.hover(radios[3]);
    expect(radios[3].querySelector('svg')).toHaveAttribute('data-filled');
    await userEvent.unhover(radios[3]);
    expect(radios[3].querySelector('svg')).not.toHaveAttribute('data-filled');
    expect(radios[0]).toBeChecked();
  });

  it('supports a custom max, controlled value, disabled and invalid', () => {
    render(<RatingInput aria-label="Score" max={3} value={2} invalid disabled />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: '2 of 3' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '1 of 3' })).toBeDisabled();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('read-only is a static image with the value in its name and no tab stop', async () => {
    render(<RatingInput aria-label="Quality" readOnly value={4} />);
    expect(screen.getByRole('img', { name: 'Quality: 4 of 5' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });
});
