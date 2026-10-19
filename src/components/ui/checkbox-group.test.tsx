import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { CheckboxGroup, CheckboxGroupItem } from './checkbox-group';

const group = (props = {}) => (
  <CheckboxGroup aria-label="Plan" {...props}>
    <CheckboxGroupItem value="basic" title="Basic" description="For one" />
    <CheckboxGroupItem value="team" title="Team" />
    <CheckboxGroupItem value="pro" title="Pro" disabled />
  </CheckboxGroup>
);

describe('CheckboxGroup', () => {
  it('multiple mode renders checkboxes in a group and toggles several', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(group({ onValueChange }));
    expect(screen.getByRole('group', { name: 'Plan' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Basic/ }));
    await user.click(screen.getByRole('checkbox', { name: /Team/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(['basic', 'team']);
    await user.click(screen.getByRole('checkbox', { name: /Basic/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(['team']);
  });

  it('single mode renders radios in a radiogroup and keeps one value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(group({ type: 'single', onValueChange }));
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Basic/ }));
    await user.click(screen.getByRole('radio', { name: /Team/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(['team']);
    expect(screen.getByRole('radio', { name: /Basic/ })).not.toBeChecked();
  });

  it('works controlled and shows the selected state', () => {
    const Controlled = () => {
      const [v, setV] = useState(['team']);
      return (
        <CheckboxGroup aria-label="Plan" value={v} onValueChange={setV}>
          <CheckboxGroupItem value="team" title="Team" />
          <CheckboxGroupItem value="pro" title="Pro" />
        </CheckboxGroup>
      );
    };
    render(<Controlled />);
    const team = screen.getByRole('checkbox', { name: /Team/ });
    expect(team).toBeChecked();
    expect(team.nextElementSibling).toHaveAttribute('data-state', 'checked');
    expect(screen.getByRole('checkbox', { name: /Pro/ }).nextElementSibling).toHaveAttribute('data-state', 'unchecked');
  });

  it('is operable with the keyboard', async () => {
    const user = userEvent.setup();
    render(group());
    await user.tab();
    expect(screen.getByRole('checkbox', { name: /Basic/ })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: /Basic/ })).toBeChecked();
  });

  it('single mode uses arrow keys inside the native radio group', async () => {
    const user = userEvent.setup();
    render(group({ type: 'single', defaultValue: ['basic'] }));
    screen.getByRole('radio', { name: /Basic/ }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: /Team/ })).toBeChecked();
  });

  it('disables the whole group or single items', () => {
    const { rerender } = render(group());
    expect(screen.getByRole('checkbox', { name: /Pro/ })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /Basic/ })).toBeEnabled();
    rerender(group({ disabled: true }));
    expect(screen.getByRole('checkbox', { name: /Basic/ })).toBeDisabled();
  });

  it('names items by title and exposes the description', () => {
    render(group());
    expect(screen.getByRole('checkbox', { name: 'Basic For one' })).toBeInTheDocument();
  });

  it('renders media variants and can hide the indicator', () => {
    const { container } = render(
      <CheckboxGroup aria-label="Pay">
        <CheckboxGroupItem value="card" title="Card" media={<svg />} mediaVariant="framed" indicator="none" />
        <CheckboxGroupItem value="icon" title="Icon" media={<svg />} mediaVariant="featured" />
      </CheckboxGroup>,
    );
    expect(container.querySelectorAll('[data-indicator]')).toHaveLength(1);
    expect(container.querySelector('.w-14')).toBeInTheDocument();
    expect(container.querySelector('.rounded-full.bg-background-brand-subtle-hover')).toBeInTheDocument();
  });

  it('puts price on the title line and the indicator first for plain rows, last with media', () => {
    const { container } = render(
      <CheckboxGroup aria-label="Plan">
        <CheckboxGroupItem value="a" title="Basic plan" price="$10/month" description="d" />
        <CheckboxGroupItem value="b" title="Card" media={<svg />} />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox', { name: 'Basic plan $10/month d' })).toBeInTheDocument();
    const [plain, withMedia] = Array.from(container.querySelectorAll('[data-state]'));
    expect(plain.firstElementChild).toHaveAttribute('data-indicator');
    expect(withMedia.lastElementChild).toHaveAttribute('data-indicator');
  });

  it('indicatorPosition overrides the default', () => {
    const { container } = render(
      <CheckboxGroup aria-label="Plan">
        <CheckboxGroupItem value="a" title="A" indicatorPosition="end" />
      </CheckboxGroup>,
    );
    expect(container.querySelector('[data-state]')?.lastElementChild).toHaveAttribute('data-indicator');
  });

  it('card layout has a header with the indicator and a body with price, description and badge', () => {
    const { container } = render(
      <CheckboxGroup aria-label="Plan" defaultValue={['a']}>
        <CheckboxGroupItem
          value="a"
          card
          title="Basic"
          price="$10"
          description="Includes"
          badge={<span>Limited</span>}
          media={<svg />}
          mediaVariant="featured"
        />
      </CheckboxGroup>,
    );
    const header = container.querySelector('[data-card-header]') as HTMLElement;
    const body = container.querySelector('[data-card-body]') as HTMLElement;
    expect(header).toHaveClass('bg-background-brand-subtle');
    expect(header.querySelector('[data-indicator]')).toBeInTheDocument();
    expect(body).toHaveTextContent('$10');
    expect(body).toHaveTextContent('Includes');
    expect(body).toHaveTextContent('Limited');
  });

  it('checked cards use the 2px brand border and invalid the destructive border', () => {
    const { container } = render(
      <CheckboxGroup aria-label="Plan" defaultValue={['a']}>
        <CheckboxGroupItem value="a" title="A" />
        <CheckboxGroupItem value="b" title="B" invalid />
      </CheckboxGroup>,
    );
    const [a, b] = Array.from(container.querySelectorAll('[data-state]'));
    expect(a).toHaveClass('data-[state=checked]:border-2', 'data-[state=checked]:border-border-brand', 'rounded-card');
    expect(b).toHaveAttribute('data-invalid', 'true');
  });

  it('throws when an item is rendered outside a group', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CheckboxGroupItem value="a" title="A" />)).toThrow();
    spy.mockRestore();
  });

  it('shares one name across the inputs', () => {
    render(group({ name: 'plan' }));
    screen.getAllByRole('checkbox').forEach((input) => expect(input).toHaveAttribute('name', 'plan'));
  });
});
