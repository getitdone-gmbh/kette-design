import { vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SingleSelect, SingleSelectProvider } from './singleselect';

// jsdom has no ResizeObserver / pointer-capture / scrollIntoView, all of which the
// combobox's resize-tracking effect and cmdk touch while positioning the dropdown.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ResizeObserver = MockResizeObserver;
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const options = [
  { label: 'Design', id: 'design' },
  { label: 'Development', id: 'development' },
];

const renderSingleSelect = (props: { disabled?: boolean; invalid?: boolean; selected?: string | null } = {}) =>
  render(
    <SingleSelectProvider>
      <SingleSelect
        id="job-type"
        label="Job Type"
        options={options}
        selected={props.selected ?? null}
        onChange={() => {}}
        disabled={props.disabled}
        invalid={props.invalid}
        ariaDescribedBy={props.invalid ? 'job-type-error' : undefined}
      />
    </SingleSelectProvider>,
  );

describe('SingleSelect component', () => {
  // --- token usage / no raw palette (SELECT-MAT-04) ---
  it('renders the trigger with token-styled classes, no raw palette values', () => {
    renderSingleSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('border-form-border-default', 'hover:border-input-background-hover');
    expect(trigger.className).not.toMatch(/\bbg-slate-|bg-gray-|text-gray-|amber-/);
  });

  // --- disabled state uses opacity, not a raw color swap ---
  it('dims the label via opacity-disabled instead of a raw gray text color', () => {
    renderSingleSelect({ disabled: true });
    const label = screen.getByText('Job Type');
    expect(label).toHaveClass('opacity-disabled');
    expect(label.className).not.toMatch(/\btext-gray-400\b/);
  });

  // --- invalid state (SELECT-MAT-07) ---
  describe('invalid', () => {
    it('sets aria-invalid and the error-token border class on the trigger', () => {
      renderSingleSelect({ invalid: true });
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
      expect(trigger).toHaveClass('aria-[invalid=true]:border-error');
      expect(trigger).toHaveAttribute('aria-describedby', 'job-type-error');
    });

    it('does not set aria-invalid when not invalid', () => {
      renderSingleSelect();
      expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
    });
  });

  // --- selected item token treatment (SELECT-MAT-04) ---
  it('marks the chosen item with the same background-accent token Select uses', async () => {
    renderSingleSelect({ selected: 'development' });
    const trigger = screen.getByRole('combobox');
    // Toggle button (ChevronsUpDown) is the reliable open affordance once a value is
    // already selected — the "combobox" div itself has no click handler of its own.
    const toggleButton = within(trigger).getAllByRole('button').at(-1)!;
    await userEvent.click(toggleButton);

    const selectedOption = await waitFor(() => screen.getByText('Development', { selector: 'label' }));
    const selectedItem = selectedOption.closest('[cmdk-item]');
    expect(selectedItem).toHaveClass('bg-background-accent', 'text-foreground-accent');
    expect(selectedItem?.className).not.toMatch(/\bbg-slate-|bg-gray-|bg-background-neutral-default\b/);
  });
});

describe('SingleSelect readOnly', () => {
  const renderReadOnly = (selected: string | null = 'design') =>
    render(
      <SingleSelectProvider>
        <SingleSelect id="job-type" label="Job Type" options={options} selected={selected} onChange={() => {}} readOnly />
      </SingleSelectProvider>,
    );

  it('shows the value, is focusable and exposes aria-readonly', async () => {
    renderReadOnly();
    const field = screen.getByRole('combobox');
    expect(field).toHaveTextContent('Design');
    expect(field).toHaveAttribute('aria-readonly', 'true');
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveClass('bg-muted');
    await userEvent.tab();
    expect(field).toHaveFocus();
  });

  it('cannot be opened or changed', async () => {
    const onChange = vi.fn();
    render(
      <SingleSelectProvider>
        <SingleSelect id="job-type" options={options} selected="design" onChange={onChange} readOnly />
      </SingleSelectProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Enter}{ArrowDown}');
    expect(screen.queryByText('Development')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the placeholder when nothing is selected', () => {
    renderReadOnly(null);
    expect(screen.getByRole('combobox')).toHaveTextContent('Search...');
  });

  it('default (not read only) is unchanged: no aria-readonly', () => {
    renderSingleSelect();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-readonly');
  });
});

describe('SingleSelect useSheet', () => {
  const renderSheet = (onChange = vi.fn()) =>
    render(
      <SingleSelectProvider>
        <SingleSelect id="sheet-select" label="Country" options={options} selected={null} onChange={onChange} useSheet enableSearch />
      </SingleSelectProvider>,
    );

  it('renders the trigger with enableSearch without a cmdk store outside <Command>', () => {
    expect(() => renderSheet()).not.toThrow();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('opens the sheet, shows the search input there and selects an option', async () => {
    const onChange = vi.fn();
    renderSheet(onChange);
    await userEvent.click(screen.getByRole('combobox'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByRole('combobox').length).toBeGreaterThan(0);
    await userEvent.click(await within(dialog).findByText('Design'));
    expect(onChange).toHaveBeenCalledWith('design');
  });
});
