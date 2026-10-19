import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const rawPaletteClass =
  /(^|\s)(bg|text|border|shadow|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/;

const renderAccordion = (itemTwoProps: Record<string, unknown> = {}) =>
  render(
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" data-testid="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent data-testid="content-1">
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" {...itemTwoProps}>
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

describe('Accordion component', () => {
  it('is closed by default', () => {
    renderAccordion();
    expect(screen.queryByText('Yes. It adheres to the WAI-ARIA design pattern.')).not.toBeInTheDocument();
  });

  it('opens an item on trigger click and reveals its content', async () => {
    renderAccordion();
    await userEvent.click(screen.getByRole('button', { name: 'Is it accessible?' }));
    expect(await screen.findByText('Yes. It adheres to the WAI-ARIA design pattern.')).toBeInTheDocument();
  });

  it('closes the open item again on a second click (collapsible)', async () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    await userEvent.click(trigger);
    await screen.findByText('Yes. It adheres to the WAI-ARIA design pattern.');
    await userEvent.click(trigger);
    expect(screen.queryByText('Yes. It adheres to the WAI-ARIA design pattern.')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation (ArrowDown moves focus to the next trigger)', async () => {
    renderAccordion();
    const first = screen.getByRole('button', { name: 'Is it accessible?' });
    const second = screen.getByRole('button', { name: 'Is it styled?' });
    first.focus();
    expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
  });

  // --- token usage / no raw palette (ACCORDION-MAT-01) ---
  it('renders the item surface with token-styled classes, no raw palette values', () => {
    renderAccordion();
    const item = screen.getByTestId('item-1');
    expect(item).toHaveClass(
      'bg-transparent',
      'text-foreground',
      'border-hairline',
    );
    // No separate filled surface: the accordion sits on the page, separated by hairlines only.
    expect(item.className).not.toMatch(/bg-accordion-background-default/);
    expect(item.className).not.toMatch(rawPaletteClass);
  });

  it('gives the trigger the dedicated accordion typography role instead of ad hoc text classes', () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    expect(trigger).toHaveClass('typography-accordion-title', 'leading-normal');
    expect(trigger.className).not.toMatch(/\bfont-medium\b/);
  });

  it('gives the content the dedicated accordion typography role instead of ad hoc text-sm', async () => {
    renderAccordion();
    await userEvent.click(screen.getByRole('button', { name: 'Is it accessible?' }));
    const content = await screen.findByTestId('content-1');
    expect(content).toHaveClass('typography-accordion-content');
    expect(content.className).not.toMatch(/(^|\s)text-sm(\s|$)/);
  });

  // --- selected/open state ---
  it('marks the open item with data-state=open and rotates the chevron', async () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  // --- hover / focus-visible / active ---
  it('carries the hover, active, and focus-visible token classes', () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    expect(trigger).toHaveClass('hover:underline', 'hover:bg-background-neutral-default');
    expect(trigger).toHaveClass('active:bg-background-neutral-default', 'active:brightness-95');
    expect(trigger).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-focus',
      'focus-visible:ring-ring-default',
    );
  });

  // --- disabled item (ACCORDION-A11Y-01) ---
  describe('disabled item', () => {
    it('renders the trigger as a real disabled button', () => {
      renderAccordion({ disabled: true });
      const trigger = screen.getByRole('button', { name: 'Is it styled?' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-disabled');
    });

    it('cannot be opened by click', async () => {
      renderAccordion({ disabled: true });
      const trigger = screen.getByRole('button', { name: 'Is it styled?' });
      await userEvent.click(trigger);
      expect(screen.queryByText('Yes.')).not.toBeInTheDocument();
    });

    it('is skipped by ArrowDown keyboard navigation', async () => {
      renderAccordion({ disabled: true });
      const first = screen.getByRole('button', { name: 'Is it accessible?' });
      first.focus();
      await userEvent.keyboard('{ArrowDown}');
      // The disabled second trigger is skipped, so focus wraps back to the first (only enabled) one.
      expect(first).toHaveFocus();
    });
  });

  // --- reduced motion (prefers-reduced-motion) ---
  it('carries a motion-reduce fallback so open/close is instant, not animated', async () => {
    renderAccordion();
    await userEvent.click(screen.getByRole('button', { name: 'Is it accessible?' }));
    const content = await screen.findByTestId('content-1');
    expect(content).toHaveClass('motion-reduce:animate-none', 'motion-reduce:transition-none');
  });

  // --- open/close animation class name matches the hyphenated keyframes the Tailwind preset
  // registers (MAT-ACCORDION-01) — the camelCase `animate-accordionUp`/`animate-accordionDown`
  // spelling compiles to zero CSS (Tailwind silently drops unknown animation utilities), so the
  // height transition never played in any browser despite the story/motion-reduce copy describing
  // it as animated. Lock in the hyphenated spelling so a future edit can't silently regress this.
  it('uses the hyphenated accordion-down/accordion-up animation utilities registered by the Tailwind preset', async () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    await userEvent.click(trigger);
    const openContent = await screen.findByTestId('content-1');
    expect(openContent).toHaveClass('data-[state=closed]:animate-accordion-up', 'data-[state=open]:animate-accordion-down');
    expect(openContent.className).not.toMatch(/animate-accordion(Up|Down)\b/);
  });

  // --- decorative chevron icon (a11y: no accessible name of its own) ---
  it('marks the chevron icon as decorative (aria-hidden)', () => {
    renderAccordion();
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' });
    const icon = trigger.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  // --- ref forwarding ---
  it('forwards a ref to the trigger element', () => {
    let triggerEl: HTMLButtonElement | null = null;
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger
            ref={(el) => {
              triggerEl = el;
            }}
          >
            Is it accessible?
          </AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(triggerEl).toBeInstanceOf(HTMLButtonElement);
  });
});
