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

  it('ships each rule once: 1.75 from the token preset, then 2.25 for 12px glyphs in three single-selector rules', () => {
    expect(rules.map((r) => [r.variable, r.fallback])).toEqual([
      ['--size-icon-stroke', '1.75'],
      ['--size-icon-stroke-sm', '2.25'],
      ['--size-icon-stroke-sm', '2.25'],
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

  it('keeps stroke 2 on an icon marked data-stroke="fixed" (tokens 5.13.0)', () => {
    const { container } = render(<Plus strokeWidth={2} data-stroke="fixed" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(strokeFor(rules, svg)).toBeNull();
  });

  it.each(['h-icon-2xs', 'size-icon-2xs'])('uses the small stroke for a 12px icon with %s', (size) => {
    const { container } = render(<Check className={size} />);
    expect(strokeFor(rules, container.querySelector('svg')!)).toBe('2.25');
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

describe('data-stroke="fixed" opt-out', () => {
  let rules: Rule[] = [];
  beforeAll(async () => {
    rules = strokeRules(await compileBase());
  }, 30000);

  it('declares the opt-out on every 12px selector', () => {
    const small = rules.filter((r) => r.variable === '--size-icon-stroke-sm');
    // one selector per rule, three rules: .h-icon-2xs, .size-icon-2xs and the wrapper child
    expect(small).toHaveLength(3);
    small.forEach((rule) => {
      expect(rule.selector).not.toContain(',');
      expect(rule.selector.replace(/"/g, "'")).toContain(":not([data-stroke='fixed'])");
    });
  });

  it('keeps an icon marked data-stroke="fixed" out of the 12px rule, both direct and wrapped', () => {
    const { container } = render(
      <>
        <Check data-stroke="fixed" className="h-icon-2xs" />
        <span className="h-icon-2xs">
          <Check data-stroke="fixed" />
        </span>
      </>,
    );
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg.getAttribute('data-stroke')).toBe('fixed');
      expect(strokeFor(rules, svg)).toBeNull();
    });
  });
});

describe('check mark stroke fallback', () => {
  it('Checkbox draws the check at 3 without the CSS variable defined', () => {
    const { container } = render(<Checkbox checked aria-label="x" />);
    expect(container.querySelector('svg')!.getAttribute('class')).toContain('[stroke-width:var(--size-icon-stroke-check,3)]');
  });
});
