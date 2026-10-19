import { render, screen } from '@testing-library/react';

import { ContentDivider } from './content-divider';

describe('ContentDivider', () => {
  it('single (default) puts the content between two rules', () => {
    const { container } = render(<ContentDivider>Today</ContentDivider>);
    expect(container.firstChild).toHaveAttribute('data-variant', 'single');
    expect(container.querySelectorAll('[data-divider-rule]')).toHaveLength(2);
    expect(container.firstChild?.firstChild).toHaveAttribute('data-divider-rule');
    expect(container.firstChild?.lastChild).toHaveAttribute('data-divider-rule');
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('dual has a rule above and below the content and no side rules', () => {
    const { container } = render(<ContentDivider variant="dual">Notifications</ContentDivider>);
    expect(container.querySelectorAll('[data-divider-rule]')).toHaveLength(0);
    expect(container.firstChild).toHaveClass('border-y', 'border-border-default', 'flex-col');
  });

  it('filled is a muted band without rules', () => {
    const { container } = render(<ContentDivider variant="filled">Group</ContentDivider>);
    expect(container.querySelectorAll('[data-divider-rule]')).toHaveLength(0);
    expect(container.firstChild).toHaveClass('bg-muted', 'rounded-control');
  });

  it('heading uses the default text colour, text the subtle one', () => {
    const { container, rerender } = render(<ContentDivider>x</ContentDivider>);
    expect(container.firstChild).toHaveClass('text-foreground', 'typography-text-small');
    rerender(<ContentDivider emphasis="text">x</ContentDivider>);
    expect(container.firstChild).toHaveClass('text-text-subtle');
  });

  it('keeps buttons inside operable', () => {
    render(
      <ContentDivider variant="dual">
        <button type="button">Add</button>
      </ContentDivider>,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('without children is a plain rule', () => {
    const { container } = render(<ContentDivider />);
    expect(container.querySelectorAll('[data-divider-rule]')).toHaveLength(1);
  });

  it('rules are hidden from assistive tech', () => {
    const { container } = render(<ContentDivider>x</ContentDivider>);
    container
      .querySelectorAll('[data-divider-rule]')
      .forEach((rule) => expect(rule).toHaveAttribute('aria-hidden', 'true'));
  });
});
