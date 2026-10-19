import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Weighted skill chip text (on-fill) against its fill (default) for every skill category, light and dark, in every theme (WCAG 1.4.3, 4.5:1).
const dist = join(process.cwd(), 'styles');
// The package vendors one theme (zero) in styles/theme.css.
const themeFiles = ['theme.css'];
const categories = ['frontend', 'backend', 'devops-cloud', 'data-ai', 'design-ux', 'mobile', 'security', 'testing-qa', 'infrastructure', 'project-management', 'business-strategy', 'fallback'];

type Rgb = [number, number, number];
const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (c: Rgb) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const readToken = (css: string, mode: 'light' | 'dark', name: string): Rgb => {
  const darkAt = css.indexOf('\n.dark {');
  const blocks = { light: css.slice(0, darkAt), dark: css.slice(darkAt, css.indexOf('\n}', darkAt)) };
  const pattern = new RegExp(`--${name}: (\\d+) (\\d+) (\\d+);`);
  const hit = blocks[mode].match(pattern) ?? blocks.light.match(pattern);
  if (!hit) throw new Error(`token ${name} missing`);
  return [Number(hit[1]), Number(hit[2]), Number(hit[3])];
};

describe('Weighted chip contrast', () => {
  for (const mode of ['light', 'dark'] as const) {
    it(`on-fill text keeps 4.5:1 on every skill fill in ${mode} for every theme`, () => {
      const failing: string[] = [];
      for (const file of themeFiles) {
        const css = readFileSync(join(dist, file), 'utf8');
        for (const category of categories) {
          const value = ratio(readToken(css, mode, `colors-data-skill-${category}-on-fill`), readToken(css, mode, `colors-data-skill-${category}-default`));
          if (value < 4.5) failing.push(`${category} ${file} ${value.toFixed(2)}`);
        }
      }
      expect(failing).toEqual([]);
    });
  }

  it('documents why plain white text is not used: it fails 4.5:1 on at least one skill fill', () => {
    const css = readFileSync(join(dist, 'theme.css'), 'utf8');
    const white: Rgb = [255, 255, 255];
    const failing = categories.filter((category) => ratio(white, readToken(css, 'light', `colors-data-skill-${category}-default`)) < 4.5);
    expect(failing.length).toBeGreaterThan(0);
  });
});
