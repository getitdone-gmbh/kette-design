import { render, screen } from '@testing-library/react';

import { FormFieldPair, FormRow, FormSection, FormSectionField } from './form-section';

describe('FormSection', () => {
  it('is a labelled group with title, description and fields', () => {
    render(
      <FormSection title="Billing" description="Used on invoices">
        <input aria-label="Email" />
      </FormSection>,
    );
    expect(screen.getByRole('group', { name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByText('Used on invoices')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('two-column (default) has a divider; one-column and sheet do not unless asked', () => {
    const { rerender } = render(
      <FormSection title="t">
        <input aria-label="a" />
      </FormSection>,
    );
    expect(screen.getByRole('group')).toHaveClass('@container', 'border-b');
    rerender(
      <FormSection layout="one-column" title="t">
        <input aria-label="a" />
      </FormSection>,
    );
    expect(screen.getByRole('group')).not.toHaveClass('border-b');
    rerender(
      <FormSection layout="sheet" title="t" divider>
        <input aria-label="a" />
      </FormSection>,
    );
    expect(screen.getByRole('group')).toHaveClass('px-5', 'border-b');
  });

  it('FormRow places fields side by side', () => {
    render(
      <FormRow data-testid="r">
        <input aria-label="a" />
        <input aria-label="b" />
      </FormRow>,
    );
    expect(screen.getByTestId('r')).toHaveClass('sm:flex-row');
  });
});

describe('FormSection two-column-fields', () => {
  it('renders the fields in a 2-column grid with a divider and the intro column', () => {
    render(
      <FormSection layout="two-column-fields" title="Company">
        <input aria-label="a" />
        <input aria-label="b" />
      </FormSection>,
    );
    const group = screen.getByRole('group', { name: 'Company' });
    expect(group).toHaveClass('@container', 'border-b');
    const grid = screen.getByLabelText('a').parentElement as HTMLElement;
    expect(grid).toHaveClass('grid', 'gap-4');
    expect(grid.className).toContain('var(--size-form-field-min)');
  });

  it('FormSectionField span=full is marked to span both columns', () => {
    render(
      <>
        <FormSectionField span="full" data-testid="full">
          <input aria-label="x" />
        </FormSectionField>
        <FormSectionField data-testid="half">
          <input aria-label="y" />
        </FormSectionField>
      </>,
    );
    expect(screen.getByTestId('full')).toHaveAttribute('data-span', 'full');
    expect(screen.getByTestId('half')).not.toHaveAttribute('data-span');
  });

  it('existing layouts keep the flex column fields', () => {
    render(
      <FormSection title="t">
        <input aria-label="a" />
      </FormSection>,
    );
    expect(screen.getByLabelText('a').parentElement).toHaveClass('flex', 'flex-col', '@3xl:w-form-fields');
  });
});

describe('FormFieldPair', () => {
  it('renders start and end side by side', () => {
    render(<FormFieldPair start={<input aria-label="left" />} end={<input aria-label="right" />} />);
    const pair = screen.getByLabelText('left').parentElement as HTMLElement;
    expect(pair).toHaveClass('grid', 'sm:grid-cols-2');
    expect(pair.children).toHaveLength(2);
  });

  // Sheet layout aligns with the sheet header, footer and sections (px-5) since 0.22
  it('sheet layout uses the sheet inset of the header and sections', () => {
    render(
      <FormSection title="Firma" layout="sheet">
        <input aria-label="Name" />
      </FormSection>,
    );
    const group = screen.getByRole('group', { name: 'Firma' });
    expect(group.className).toContain('px-5');
    expect(group.className).not.toContain('px-6');
  });
});
