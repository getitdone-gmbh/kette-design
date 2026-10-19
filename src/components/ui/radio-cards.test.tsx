import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { RadioCard, RadioCardGroup } from './radio-cards';

const setup = (props: Partial<React.ComponentProps<typeof RadioCardGroup>> = {}) =>
  render(
    <RadioCardGroup aria-label="Type" defaultValue="a" {...props}>
      <RadioCard value="a" title="Alpha" description="First" />
      <RadioCard value="b" title="Beta" description="Second" />
      <RadioCard value="c" title="Gamma" disabled />
      <RadioCard value="d" title="Delta" />
    </RadioCardGroup>,
  );

describe('RadioCardGroup', () => {
  it('is a radiogroup of named radios in a 2 column grid by default', () => {
    setup();
    const group = screen.getByRole('radiogroup', { name: 'Type' });
    expect(group).toHaveClass('grid', 'sm:grid-cols-2');
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('radio', { name: /Alpha/ })).toBeChecked();
  });

  it('columns=1 stacks the cards', () => {
    setup({ columns: 1 });
    expect(screen.getByRole('radiogroup')).not.toHaveClass('sm:grid-cols-2');
  });

  it('selects on click and calls onValueChange', async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    await userEvent.click(screen.getByRole('radio', { name: /Beta/ }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: /Beta/ })).toBeChecked();
  });

  it('moves with arrow keys and skips disabled cards', async () => {
    setup();
    screen.getByRole('radio', { name: /Beta/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: /Delta/ })).toHaveFocus();
    expect(screen.getByRole('radio', { name: /Gamma/ })).toBeDisabled();
  });
});
