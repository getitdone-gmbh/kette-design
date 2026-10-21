import { render } from '@testing-library/react';
import { Check, Plus } from 'lucide-react';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

import { Checkbox } from '../components/ui/checkbox';

const require = createRequire(import.meta.url);
const preset = require('../../tailwind/preset.cjs');

// Compiles the base layer the way a consumer of the kette-design preset does, with content that never mentions `lucide`.
const compileBase = async () => {
  const result = await postcss([
    tailwindcss({ presets: [preset], content: [{ raw: '<span class="h-icon-2xs"></span>', extension: 'html' }], corePlugins: { preflight: false } }),
  ]).process('@tailwind base;', { from: undefined });
  return result.css;
};

type Rule = { selector: string; variable: string; fallback: string };

const strokeRules = (css: string): Rule[] =>
  [...css.matchAll(/:where\(([^{]*)\)\s*\{\s*stroke-width:\s*var\((--size-icon-stroke(?:-sm)?),\s*([\d.]+)\)/g)].map((m) => ({
    selector: m[1],
    variable: m[2],
    fallback: m[3],
  }));

// The last matching rule wins (all rules have zero specificity), as in the browser.
const strokeFor = (rules: Rule[], el: Element) => rules.filter((r) => el.matches(r.selector)).pop()?.fallback ?? null;

describe('icon stroke rule from the Tailwind preset', () => {
  let rules: Rule[] = [];
  beforeAll(async () => {
    rules = strokeRules(await compileBase());
  }, 30000);

  it('ships each rule once: 1.75 from the token preset, then 2.25 for 12px glyphs', () => {
    expect(rules.map((r) => [r.variable, r.fallback])).toEqual([
      ['--size-icon-stroke', '1.75'],
      ['--size-icon-stroke-sm', '2.25'],
    ]);
  });

  it('applies 1.75 to a default lucide icon', () => {
    const { container } = render(<Plus />);
    expect(strokeFor(rules, container.querySelector('svg')!)).toBe('1.75');
  });

  it('keeps an explicit strokeWidth prop', () => {
    const { container } = render(<Plus strokeWidth={1.5} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('stroke-width')).toBe('1.5');
    expect(strokeFor(rules, svg)).toBeNull();
  });

  it('uses the small stroke for 12px glyph wrappers', () => {
    const { container } = render(
      <span className="h-icon-2xs">
        <Check />
      </span>,
    );
    expect(strokeFor(rules, container.querySelector('svg')!)).toBe('2.25');
  });
});

describe('check mark stroke fallback', () => {
  it('Checkbox draws the check at 3 without the CSS variable defined', () => {
    const { container } = render(<Checkbox checked aria-label="x" />);
    expect(container.querySelector('svg')!.getAttribute('class')).toContain('[stroke-width:var(--size-icon-stroke-check,3)]');
  });
});
