import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { FacetFilter, FacetGroup, FacetOption } from './facet-filter';

const operators = [
  { value: 'partial', label: 'Partial' },
  { value: 'exact', label: 'Exact' },
];

describe('FacetFilter', () => {
  it('renders a named complementary landmark with title and description', () => {
    render(<FacetFilter description="Apply filters to table data." />);
    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Apply filters to table data.')).toBeInTheDocument();
  });

  it('operator switch is uncontrolled by default and reports changes', async () => {
    const onOperatorChange = vi.fn();
    render(<FacetFilter operators={operators} onOperatorChange={onOperatorChange} />);
    expect(screen.getByRole('radio', { name: 'Partial' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Exact' }));
    expect(screen.getByRole('radio', { name: 'Exact' })).toBeChecked();
    expect(onOperatorChange).toHaveBeenCalledWith('exact');
  });

  it('operator switch can be controlled', async () => {
    const Controlled = () => {
      const [v, setV] = useState('exact');
      return <FacetFilter operators={operators} operator={v} onOperatorChange={setV} />;
    };
    render(<Controlled />);
    expect(screen.getByRole('radio', { name: 'Exact' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Partial' }));
    expect(screen.getByRole('radio', { name: 'Partial' })).toBeChecked();
  });
});

describe('FacetGroup and FacetOption', () => {
  it('options are labelled checkboxes with counts, toggled by label and keyboard', async () => {
    const onCheckedChange = vi.fn();
    render(
      <FacetGroup label="Teams">
        <FacetOption label="Design" count={4} onCheckedChange={onCheckedChange} />
      </FacetGroup>,
    );
    expect(screen.getByRole('region', { name: 'Teams' })).toBeInTheDocument();
    const box = screen.getByRole('checkbox', { name: /Design/ });
    await userEvent.click(screen.getByText('Design'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    box.focus();
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('limits options and expands with "Show n more"', async () => {
    render(
      <FacetGroup label="Role" limit={2}>
        {['A', 'B', 'C', 'D'].map((l) => (
          <FacetOption key={l} label={l} />
        ))}
      </FacetGroup>,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    const more = screen.getByRole('button', { name: 'Show 2 more' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('searchable group reports the query', async () => {
    const onQueryChange = vi.fn();
    render(
      <FacetGroup label="Role" searchable query="" onQueryChange={onQueryChange}>
        <FacetOption label="A" />
      </FacetGroup>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Search Role' }), 'x');
    expect(onQueryChange).toHaveBeenCalledWith('x');
  });

  it('disabled option cannot be toggled', async () => {
    render(
      <FacetGroup label="g">
        <FacetOption label="A" disabled />
      </FacetGroup>,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});

describe('FacetGroup collapsible and text counts', () => {
  it('shows a text count', () => {
    render(
      <FacetGroup label="Teams">
        <FacetOption label="Design" count="99+" />
      </FacetGroup>,
    );
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('collapses and expands from the heading button', async () => {
    render(
      <FacetGroup label="Teams" collapsible>
        <FacetOption label="Design" />
      </FacetGroup>,
    );
    const toggle = screen.getByRole('button', { name: 'Teams' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: 'Design' })).toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(toggle.getAttribute('aria-controls') as string)).toHaveClass('hidden');
    await userEvent.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('starts collapsed and supports the controlled form', async () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(
      <FacetGroup label="Teams" collapsible collapsed onCollapsedChange={onCollapsedChange}>
        <FacetOption label="Design" />
      </FacetGroup>,
    );
    const toggle = screen.getByRole('button', { name: 'Teams' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <FacetGroup label="Teams" collapsible collapsed={false} onCollapsedChange={onCollapsedChange}>
        <FacetOption label="Design" />
      </FacetGroup>,
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('is not collapsible by default', () => {
    render(
      <FacetGroup label="Teams">
        <FacetOption label="Design" />
      </FacetGroup>,
    );
    expect(screen.queryByRole('button', { name: 'Teams' })).not.toBeInTheDocument();
  });
});

describe('FacetFilter selectionMode toggle-links (0.15)', () => {
  it('renders add/remove toggle buttons instead of checkboxes', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <FacetFilter selectionMode="toggle-links">
        <FacetGroup label="Teams">
          <FacetOption label="Design" count={4} onCheckedChange={onCheckedChange} />
          <FacetOption label="Product" defaultChecked />
        </FacetGroup>
      </FacetFilter>,
    );
    expect(screen.queryByRole('checkbox')).toBeNull();
    const design = screen.getByRole('button', { name: /Design/ });
    const product = screen.getByRole('button', { name: /Product/ });
    expect(design).toHaveAttribute('aria-pressed', 'false');
    expect(product).toHaveAttribute('aria-pressed', 'true');
    await user.click(design);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(design).toHaveAttribute('aria-pressed', 'true');
    await user.click(design);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles with the keyboard and supports a controlled value', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [on, setOn] = useState(false);
      return (
        <FacetGroup label="Teams" selectionMode="toggle-links">
          <FacetOption label="Design" checked={on} onCheckedChange={setOn} />
        </FacetGroup>
      );
    };
    render(<Harness />);
    const row = screen.getByRole('button', { name: /Design/ });
    row.focus();
    await user.keyboard('{Enter}');
    expect(row).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(row).toHaveAttribute('aria-pressed', 'false');
  });

  it('lets a group override the filter default and disables rows', () => {
    render(
      <FacetFilter selectionMode="toggle-links">
        <FacetGroup label="Boxes" selectionMode="checkbox">
          <FacetOption label="One" />
        </FacetGroup>
        <FacetGroup label="Links">
          <FacetOption label="Two" disabled />
        </FacetGroup>
      </FacetFilter>,
    );
    expect(screen.getByRole('checkbox', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two/ })).toBeDisabled();
  });
});

describe('Facet colour dot and group count (0.17)', () => {
  it('shows a decorative leading dot and a count on the group heading', () => {
    const { container } = render(
      <FacetGroup label="Projects" dotColor="bg-background-brand-bold-default" count={12}>
        <FacetOption label="Alpha" />
      </FacetGroup>,
    );
    const heading = screen.getByRole('heading', { name: /Projects/ });
    expect(heading).toHaveTextContent('Projects12');
    const dot = container.querySelector('[data-facet-dot]') as HTMLElement;
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveClass('bg-background-brand-bold-default');
    expect(screen.getByRole('region', { name: 'Projects' })).toBeInTheDocument();
  });

  it('keeps the heading plain without dot and count', () => {
    render(
      <FacetGroup label="Teams">
        <FacetOption label="Design" />
      </FacetGroup>,
    );
    expect(screen.getByRole('heading', { name: 'Teams' }).children).toHaveLength(0);
  });

  it('applies a data colour as background and keeps the collapsible button name', () => {
    const { container } = render(
      <FacetGroup label="Projects" dotColor="rgb(10, 20, 30)" count="99+" collapsible>
        <FacetOption label="Alpha" />
      </FacetGroup>,
    );
    expect((container.querySelector('[data-facet-dot]') as HTMLElement).style.backgroundColor).toBe('rgb(10, 20, 30)');
    expect(screen.getByRole('button', { name: 'Projects 99+' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the option dot in checkbox and toggle-links rows without changing the name', () => {
    const { container, rerender } = render(
      <FacetGroup label="Projects">
        <FacetOption label="Alpha" dotColor="bg-background-success-bold-default" count={3} />
      </FacetGroup>,
    );
    expect(screen.getByRole('checkbox', { name: /Alpha/ })).toBeInTheDocument();
    expect(container.querySelector('[data-facet-dot]')).toHaveClass('bg-background-success-bold-default');
    rerender(
      <FacetGroup label="Projects" selectionMode="toggle-links">
        <FacetOption label="Alpha" dotColor="bg-background-success-bold-default" count={3} />
      </FacetGroup>,
    );
    expect(screen.getByRole('button', { name: /Alpha/ })).toBeInTheDocument();
    expect(container.querySelector('[data-facet-dot]')).toBeInTheDocument();
  });
});
