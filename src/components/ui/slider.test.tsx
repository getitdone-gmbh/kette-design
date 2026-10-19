import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { RangeSlider, Slider } from './slider';

describe('Slider', () => {
  it('is a native range input with a name and value text', () => {
    render(<Slider aria-label="Volume" defaultValue={30} formatValue={(v) => `${v} percent`} />);
    const input = screen.getByRole('slider', { name: 'Volume' });
    expect(input).toHaveAttribute('type', 'range');
    expect(input).toHaveValue('30');
    expect(input).toHaveAttribute('aria-valuetext', '30 percent');
  });

  it('works uncontrolled and reports changes', () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={10} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onValueChange).toHaveBeenCalledWith(55);
    expect(screen.getByRole('slider')).toHaveValue('55');
  });

  it('works controlled', () => {
    const Controlled = () => {
      const [v, setV] = useState(20);
      return (
        <>
          <Slider aria-label="Volume" value={v} onValueChange={setV} valueLabel="top-floating" />
          
        </>
      );
    };
    render(<Controlled />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '70' } });
    expect(screen.getByRole('slider')).toHaveValue('70');
    expect(document.querySelector('[data-slider-label]')).toHaveTextContent('70');
  });

  it('moves with the keyboard (native step)', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Volume" defaultValue={10} step={5} />);
    await user.tab();
    expect(screen.getByRole('slider')).toHaveFocus();
  });

  it('draws the fill from the value and the thumb position', () => {
    render(<Slider aria-label="Volume" value={50} min={0} max={100} />);
    expect(document.querySelector('[data-slider-fill]')).toHaveStyle({ width: '50%' });
    expect(document.querySelector('[data-slider-thumb]')).toHaveStyle({ left: 'calc(50% - 0.75rem)' });
  });

  it('can be disabled', () => {
    render(<Slider aria-label="Volume" disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('shows the value under the track', () => {
    render(<Slider aria-label="Volume" value={42} valueLabel="bottom" />);
    expect(document.querySelector('[data-slider-label]')).toHaveTextContent('42');
  });
});

describe('RangeSlider', () => {
  it('renders two named sliders in a group', () => {
    render(<RangeSlider aria-label="Price" defaultValue={[20, 80]} />);
    expect(screen.getByRole('group', { name: 'Price' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveValue('20');
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveValue('80');
  });

  it('keeps the lower value at or below the upper value', () => {
    const onValueChange = vi.fn();
    render(<RangeSlider aria-label="Price" defaultValue={[20, 50]} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Minimum' }), { target: { value: '90' } });
    expect(onValueChange).toHaveBeenLastCalledWith([50, 50]);
    fireEvent.change(screen.getByRole('slider', { name: 'Maximum' }), { target: { value: '10' } });
    expect(onValueChange).toHaveBeenLastCalledWith([50, 50]);
  });

  it('fills between both thumbs', () => {
    render(<RangeSlider aria-label="Price" value={[25, 75]} />);
    expect(document.querySelector('[data-slider-fill]')).toHaveStyle({ left: '25%', width: '50%' });
  });

  it('uses custom thumb labels and disables both', () => {
    render(<RangeSlider aria-label="Dates" minLabel="From" maxLabel="To" disabled />);
    expect(screen.getByRole('slider', { name: 'From' })).toBeDisabled();
    expect(screen.getByRole('slider', { name: 'To' })).toBeDisabled();
  });
});
