import { render, screen } from '@testing-library/react';

import { Attribute, Attributes, SummaryList, SummaryListRow } from './description-list';

describe('Attributes', () => {
  it('renders a labelled definition list', () => {
    render(
      <Attributes title="Details">
        <Attribute label="Status">Active</Attribute>
        <Attribute label="Owner">Anna</Attribute>
      </Attributes>,
    );
    expect(screen.getByRole('region', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Status').tagName).toBe('DT');
    expect(screen.getByText('Active').tagName).toBe('DD');
  });

  it('shows loading, empty and error states instead of the list', () => {
    const { rerender } = render(<Attributes state="loading" />);
    expect(screen.getByRole('status', { name: 'Loading details' })).toHaveAttribute('aria-busy', 'true');
    rerender(<Attributes state="empty" />);
    expect(screen.getByText('No details yet')).toBeInTheDocument();
    rerender(<Attributes state="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('details not loaded');
  });

  it('accepts custom empty and error panels', () => {
    render(<Attributes state="empty" emptyState={<p>Custom empty</p>} />);
    expect(screen.getByText('Custom empty')).toBeInTheDocument();
  });

  it('divided rows get hairlines', () => {
    render(
      <Attributes divided>
        <Attribute label="Type" data-testid="row">
          Video
        </Attribute>
      </Attributes>,
    );
    expect(screen.getByTestId('row')).toHaveClass('border-b');
  });
});

describe('SummaryList', () => {
  it('renders rows and an emphasised total', () => {
    render(
      <SummaryList>
        <SummaryListRow label="Net" value="1" />
        <SummaryListRow label="Total" value="2" total data-testid="total" />
      </SummaryList>,
    );
    expect(screen.getByTestId('total')).toHaveClass('border-t');
    expect(screen.getByText('Net').tagName).toBe('DT');
  });

  it('shows loading, empty and error states', () => {
    const { rerender } = render(<SummaryList state="loading" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<SummaryList state="empty" />);
    expect(screen.getByText('No amounts yet')).toBeInTheDocument();
    rerender(<SummaryList state="error" errorState={<p>Failed</p>} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});

describe('Attribute typed values', () => {
  it('renders each type inside the dd', () => {
    render(
      <Attributes title="Details">
        <Attribute label="Name" type="text" value="Acme" />
        <Attribute label="Status" type="chip" value="Client" />
        <Attribute label="Owner" type="avatar" value="Anna Berger" initials="AB" />
        <Attribute label="Parent" type="logo" value="Acme Group" initials="AG" logoColor={3} />
        <Attribute label="Website" type="input" value="acme.de" />
        <Attribute label="Tags" type="tags" tags={['Retail', 'DACH']} />
      </Attributes>,
    );
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Anna Berger')).toBeInTheDocument();
    expect(screen.getByText('AG')).toHaveAttribute('data-color', '3');
    expect(screen.getByRole('textbox', { name: 'Website' })).toHaveValue('acme.de');
    expect(screen.getByText('Retail')).toBeInTheDocument();
    expect(screen.getByText('DACH')).toBeInTheDocument();
  });

  it('children still win and keep the old API', () => {
    render(
      <Attributes>
        <Attribute label="Status">Active</Attribute>
      </Attributes>,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Attribute label column', () => {
  it.each(['aside', 'sheet', 'compact'] as const)('wraps long labels in the %s label column', (variant) => {
    render(
      <Attributes variant={variant} lang="de">
        <Attribute label="Wahrscheinlichkeit" value="80 %" />
      </Attributes>,
    );
    const dt = screen.getByText('Wahrscheinlichkeit');
    expect(dt).toHaveClass('break-words', 'hyphens-auto', 'shrink-0', 'w-1/3');
    expect(dt).not.toHaveClass('truncate');
    expect(dt.nextElementSibling).toHaveClass('min-w-0', 'flex-1');
  });
});
