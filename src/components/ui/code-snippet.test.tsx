import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeSnippet } from './code-snippet';

const code = "import a from 'a';\nconst b = 1;";

describe('CodeSnippet', () => {
  it('block renders every line with a line number gutter', () => {
    const { container } = render(<CodeSnippet code={code} language="TypeScript" />);
    expect(screen.getByLabelText('TypeScript')).toHaveTextContent("import a from 'a';");
    expect(container.querySelector('[data-gutter]')).toHaveTextContent('1 2');
    expect(container.firstChild).toHaveAttribute('data-variant', 'block');
  });

  it('hides the gutter on request', () => {
    const { container } = render(<CodeSnippet code={code} lineNumbers={false} />);
    expect(container.querySelector('[data-gutter]')).toBeNull();
  });

  it('inline renders one line with the copy button', () => {
    const { container } = render(<CodeSnippet variant="inline" code="npm i pkg" />);
    expect(container.firstChild).toHaveAttribute('data-variant', 'inline');
    expect(screen.getByText('npm i pkg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('copies the code, announces it and resets the label', async () => {
    const user = userEvent.setup();
    const onCopied = vi.fn();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<CodeSnippet variant="inline" code="npm i pkg" onCopied={onCopied} />);
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith('npm i pkg');
    expect(onCopied).toHaveBeenCalledWith('npm i pkg');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });

  it('can hide the copy button and use the inverse tone', () => {
    const { container } = render(<CodeSnippet code={code} copy={false} tone="inverse" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-foreground', 'text-background');
  });

  it('the code region is keyboard focusable for scrolling', async () => {
    const user = userEvent.setup();
    render(<CodeSnippet code={code} copy={false} />);
    await user.tab();
    expect(screen.getByLabelText('Code')).toHaveFocus();
  });
});

describe('CodeSnippet block type role and header', () => {
  it('uses the code block type role by default and keeps the compact size on request', () => {
    const { rerender } = render(<CodeSnippet code={code} language="TS" />);
    expect(screen.getByLabelText('TS')).toHaveClass('typography-code-block');
    rerender(<CodeSnippet code={code} language="TS" textSize="compact" />);
    expect(screen.getByLabelText('TS')).toHaveClass('typography-code');
    expect(screen.getByLabelText('TS')).not.toHaveClass('typography-code-block');
  });

  it('inline keeps the compact code type role', () => {
    render(<CodeSnippet variant="inline" code="x" language="sh" />);
    expect(screen.getByLabelText('sh')).toHaveClass('typography-code');
  });

  it('label adds a header row with the copy button and no floating button', () => {
    const { container } = render(<CodeSnippet code={code} label="Terminal" />);
    expect(container.firstChild).toHaveAttribute('data-header');
    expect(container.querySelector('[data-code-label]')).toHaveTextContent('Terminal');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(container.querySelector('.absolute')).toBeNull();
  });

  it('without a label the layout is unchanged', () => {
    const { container } = render(<CodeSnippet code={code} />);
    expect(container.firstChild).not.toHaveAttribute('data-header');
    expect(container.querySelector('.absolute')).not.toBeNull();
  });

  it('terminal renders title, rows with status tone and caption as a figure', () => {
    const { container } = render(
      <CodeSnippet
        variant="terminal"
        terminalTitle="loop"
        terminalCaption="Illustration"
        terminalAnimate={false}
        terminalLines={[
          { type: 'cmd', text: 'run' },
          { type: 'agent', name: 'qa', status: 'PASS', tone: 'success', note: 'ok' },
          { type: 'route', text: 'routed' },
        ]}
      />,
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveAttribute('data-variant', 'terminal');
    expect(screen.getByText('loop')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('PASS')).toHaveClass('text-text-success');
    expect(screen.getByText('Illustration').tagName).toBe('FIGCAPTION');
  });
});
