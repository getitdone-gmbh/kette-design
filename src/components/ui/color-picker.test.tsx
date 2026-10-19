import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColorInput, ColorSwatchPicker, normalizeHexColor } from './color-picker';

describe('ColorSwatchPicker', () => {
  it('renders the eight project colours as a named radio group with token fills', () => {
    render(<ColorSwatchPicker aria-label="Colour" />);
    expect(screen.getByRole('radiogroup', { name: 'Colour' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(8);
    expect(radios[0]).toHaveAccessibleName('Colour 1');
    expect(radios[2]).toHaveClass('bg-data-project-3');
  });

  it('selects on click and reports the value', async () => {
    const onValueChange = vi.fn();
    render(<ColorSwatchPicker aria-label="Colour" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Colour 4' }));
    expect(onValueChange).toHaveBeenCalledWith('project-4');
    expect(screen.getByRole('radio', { name: 'Colour 4' })).toBeChecked();
  });

  it('moves with the arrow keys after tabbing in and selects with Space', async () => {
    const onValueChange = vi.fn();
    render(<ColorSwatchPicker aria-label="Colour" defaultValue="project-1" onValueChange={onValueChange} />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Colour 1' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Colour 2' })).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith('project-2');
  });

  it('applies custom CSS colours and labels', () => {
    render(<ColorSwatchPicker aria-label="Colour" options={[{ value: '#0d9488', label: 'Teal', color: '#0d9488' }]} />);
    const swatch = screen.getByRole('radio', { name: 'Teal' });
    expect(swatch).toHaveStyle({ backgroundColor: '#0d9488' });
  });

  it('shows the selection with a ring (not colour only), and supports disabled and invalid', () => {
    render(<ColorSwatchPicker aria-label="Colour" defaultValue="project-2" invalid disabled />);
    const selected = screen.getByRole('radio', { name: 'Colour 2' });
    expect(selected).toHaveClass('data-[state=checked]:ring-2', 'data-[state=checked]:ring-foreground');
    expect(selected).toBeDisabled();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('ColorSwatchPicker compact', () => {
  it('shows only a swatch trigger with the current colour in its name and opens the swatches', async () => {
    const onValueChange = vi.fn();
    render(<ColorSwatchPicker compact defaultValue="project-3" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: 'Pick a colour: Colour 3' });
    expect(trigger).toHaveClass('bg-data-project-3');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole('radiogroup', { name: 'Pick a colour' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Colour 5' }));
    expect(onValueChange).toHaveBeenCalledWith('project-5');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick a colour: Colour 5' })).toBeInTheDocument();
  });

  it('opens with the keyboard, supports custom colours and a disabled trigger', async () => {
    render(<ColorSwatchPicker compact triggerLabel="Calendar colour" defaultValue="#0d9488" options={[{ value: '#0d9488', label: 'Teal', color: '#0d9488' }]} />);
    await userEvent.tab();
    const trigger = screen.getByRole('button', { name: 'Calendar colour' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveStyle({ backgroundColor: '#0d9488' });
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('radio', { name: 'Teal' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('disables the trigger', () => {
    render(<ColorSwatchPicker compact disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('normalizeHexColor', () => {
  it.each([
    ['#ABC', '#aabbcc'],
    ['3B82F6', '#3b82f6'],
    [' #0D9488 ', '#0d9488'],
    ['#12', null],
    ['#gggggg', null],
    ['', null],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeHexColor(input)).toBe(expected);
  });
});

describe('ColorInput', () => {
  it('has a native picker and a hex field with accessible names', () => {
    render(<ColorInput defaultValue="#3b82f6" />);
    expect(screen.getByLabelText('Pick a colour')).toHaveAttribute('type', 'color');
    expect(screen.getByRole('textbox', { name: 'Hex colour' })).toHaveValue('#3b82f6');
  });

  it('reports only valid colours while typing and flags invalid text', async () => {
    const onValueChange = vi.fn();
    render(<ColorInput defaultValue="#000000" onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox', { name: 'Hex colour' });
    await userEvent.clear(field);
    await userEvent.type(field, '#12');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.type(field, '3');
    expect(onValueChange).toHaveBeenLastCalledWith('#112233');
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('restores the last valid colour on blur', async () => {
    render(<ColorInput defaultValue="#0d9488" />);
    const field = screen.getByRole('textbox', { name: 'Hex colour' });
    await userEvent.clear(field);
    await userEvent.type(field, 'zz');
    await userEvent.tab();
    expect(field).toHaveValue('#0d9488');
  });

  it('follows a controlled value', () => {
    const { rerender } = render(<ColorInput value="#111111" />);
    expect(screen.getByRole('textbox', { name: 'Hex colour' })).toHaveValue('#111111');
    rerender(<ColorInput value="#222222" />);
    expect(screen.getByRole('textbox', { name: 'Hex colour' })).toHaveValue('#222222');
  });

  it('labels can be overridden by props', () => {
    render(<ColorInput pickLabel="Choose" hexLabel="Code" />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Code' })).toBeInTheDocument();
  });
});

describe('ColorSwatchPicker apply', () => {
  it('shows an apply button that is disabled until a colour is selected', async () => {
    const onApply = vi.fn();
    render(<ColorSwatchPicker aria-label="Colour" onApply={onApply} applyLabel="Apply to all" />);
    const apply = screen.getByRole('button', { name: 'Apply to all' });
    expect(apply).toBeDisabled();
    await userEvent.click(screen.getAllByRole('radio')[3]);
    expect(apply).toBeEnabled();
    await userEvent.click(apply);
    expect(onApply).toHaveBeenCalledWith('project-4');
  });

  it('applies the default value and defaults the label to the provider text', async () => {
    const onApply = vi.fn();
    render(<ColorSwatchPicker aria-label="Colour" defaultValue="project-2" onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledWith('project-2');
  });

  it('has no button without onApply', () => {
    render(<ColorSwatchPicker aria-label="Colour" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('compact: picking keeps the popover open, apply closes it', async () => {
    const onApply = vi.fn();
    render(<ColorSwatchPicker aria-label="Colour" compact onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pick a colour' }));
    await userEvent.click(screen.getAllByRole('radio')[1]);
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledWith('project-2');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
