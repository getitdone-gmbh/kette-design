import { render, screen } from '@testing-library/react';

import { CodeSnippet } from './code-snippet';
import { tokenizeCode } from './code-highlight';

const types = (code: string, language: Parameters<typeof tokenizeCode>[1]) =>
  tokenizeCode(code, language)
    .filter((t) => t.type !== 'text' && t.type !== 'punctuation')
    .map((t) => `${t.type}:${t.text.trim()}`);

describe('tokenizeCode', () => {
  it('ts and js: keywords, strings, numbers, comments, calls', () => {
    expect(types("const a = 'x'; // note\nfoo(42, `t`)", 'ts')).toEqual([
      'keyword:const',
      "string:'x'",
      'comment:// note',
      'function:foo',
      'number:42',
      'string:`t`',
    ]);
  });

  it('python: keywords, strings with prefixes, numbers, comments, decorators and calls', () => {
    expect(types('@cache\ndef add(a, b=1_000):  # sum\n    return f"{a}" + \'x\' if a is None else 0x1F', 'python')).toEqual([
      'function:@cache',
      'keyword:def',
      'function:add',
      'number:1_000',
      'comment:# sum',
      'keyword:return',
      'string:f"{a}"',
      "string:'x'",
      'keyword:if',
      'keyword:is',
      'keyword:None',
      'keyword:else',
      'number:0x1F',
    ]);
  });

  it('python: triple quoted strings span lines and keywords stay out of identifiers', () => {
    expect(tokenizeCode('"""a\nb""" x', 'python')[0]).toEqual({ type: 'string', text: '"""a\nb"""' });
    expect(types('classes = defaults', 'python')).toEqual([]);
  });

  it('does not match keywords inside identifiers', () => {
    expect(types('constant = format', 'js')).toEqual([]);
  });

  it('block comments span lines', () => {
    expect(tokenizeCode('/* a\nb */ x', 'js')[0]).toEqual({ type: 'comment', text: '/* a\nb */' });
  });

  it('json: keys are properties, values strings/numbers/keywords', () => {
    expect(types('{"a": "b", "n": 1.5, "t": true}', 'json')).toEqual([
      'property:"a"',
      'string:"b"',
      'property:"n"',
      'number:1.5',
      'property:"t"',
      'keyword:true',
    ]);
  });

  it('css: at-rules, properties, colours, units', () => {
    const result = types('@media (min-width: 640px) { a { color: #fff; margin: 4px } }', 'css');
    expect(result).toContain('keyword:@media');
    expect(result).toContain('property:min-width');
    expect(result).toContain('number:640px');
    expect(result).toContain('property:color');
    expect(result).toContain('number:#fff');
  });

  it('html: tags, attributes, strings, comments', () => {
    expect(types('<!-- c --><a href="x">t</a>', 'html')).toEqual([
      'comment:<!-- c -->',
      'tag:<a',
      'property:href',
      'string:"x"',
      'tag:</a',
    ]);
  });

  it('bash: comments, variables, flags, keywords', () => {
    expect(types('if [ -f "$HOME" ]; then echo $X --flag # c', 'bash')).toEqual([
      'keyword:if',
      'property:-f',
      'string:"$HOME"',
      'keyword:then',
      'variable:$X',
      'property:--flag',
      'comment:# c',
    ]);
  });

  it('the tokens always rebuild the original text', () => {
    const code = "const a = { b: 'c' }; // é ✓\n\tx(1)";
    expect(
      tokenizeCode(code, 'ts')
        .map((t) => t.text)
        .join(''),
    ).toBe(code);
  });

  it('unterminated strings and empty input do not hang', () => {
    expect(
      tokenizeCode('"abc', 'json')
        .map((t) => t.text)
        .join(''),
    ).toBe('"abc');
    expect(tokenizeCode('', 'ts')).toEqual([]);
  });
});

describe('CodeSnippet highlight', () => {
  it('is plain by default (no token spans)', () => {
    const { container } = render(<CodeSnippet code="const a = 1;" />);
    expect(container.querySelector('[data-token]')).toBeNull();
  });

  it('wraps tokens in spans with role colours and keeps the text', () => {
    const { container } = render(<CodeSnippet code="const a = 'x';" highlight="ts" language="TS" />);
    expect(screen.getByLabelText('TS')).toHaveTextContent("const a = 'x';");
    expect(container.querySelector('[data-token=keyword]')).toHaveClass('text-text-brand-on-subtle');
    expect(container.querySelector('[data-token=string]')).toHaveClass('text-text-success');
  });

  it('uses the inverse palette on the inverse tone and works inline', () => {
    const { container } = render(<CodeSnippet code="npm i x # c" highlight="bash" variant="inline" tone="inverse" />);
    expect(container.querySelector('[data-token=comment]')).toHaveClass('text-background/60');
  });
});
