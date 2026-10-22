import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import selectorParser from 'postcss-selector-parser';
import tailwindcss from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';

// Same input and config as `npm run build` (dist/styles.css).
const cssPath = join(process.cwd(), 'styles/build.css');
let built = '';

beforeAll(async () => {
  const result = await postcss([postcssImport(), tailwindcss(join(process.cwd(), 'tailwind.config.cjs')), autoprefixer()]).process(readFileSync(cssPath, 'utf8'), { from: cssPath });
  built = result.css;
}, 60000);

// Collects every selector of the built CSS, so a malformed one (for example a glued `svgsvg`) fails the test.
const selectorsOf = (css: string) => {
  const found: string[] = [];
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test((rule.parent as postcss.AtRule).name)) return;
    found.push(rule.selector);
  });
  return found;
};

describe('built CSS selectors', () => {
  it('parses every selector and never glues two element names together', () => {
    const invalid: string[] = [];
    for (const selector of selectorsOf(built)) {
      try {
        selectorParser().astSync(selector);
      } catch {
        invalid.push(selector);
      }
      if (/(?<![\w-])(svg|path|img|span|div)\1(?![\w-])/.test(selector)) invalid.push(selector);
    }
    expect(invalid).toEqual([]);
  });

  it('emits the 12px icon stroke rule as one valid selector per rule', () => {
    const rules = selectorsOf(built).filter((selector) => selector.includes('icon-2xs') && selector.includes('svg.lucide'));
    expect(rules).toHaveLength(3);
    for (const selector of rules) {
      expect(selector).not.toContain(',');
      expect(selector).not.toContain('svgsvg');
      expect(() => selectorParser().astSync(selector)).not.toThrow();
    }
  });
});
