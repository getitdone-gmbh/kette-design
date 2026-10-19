import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { chipVariants } from '../../components/ui/chip';

// Text contrast (WCAG 1.4.3) of component colour pairs, computed from the dist theme.css of all 19 themes in light and dark. Worst cases are pinned.
const dist = join(process.cwd(), 'styles');
// The package vendors one theme (zero) in styles/theme.css.
const themeFiles = ['theme.css'];

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
const blend = (fg: Rgb, bg: Rgb, alpha: number): Rgb => [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as Rgb;

const readToken = (css: string, mode: 'light' | 'dark', name: string): Rgb => {
  const darkAt = css.indexOf('\n.dark {');
  const blocks = { light: css.slice(0, darkAt), dark: css.slice(darkAt, css.indexOf('\n}', darkAt)) };
  const pattern = new RegExp(`--${name}: (\\d+) (\\d+) (\\d+);`);
  const hit = blocks[mode].match(pattern) ?? blocks.light.match(pattern);
  if (!hit) throw new Error(`token ${name} missing`);
  return [Number(hit[1]), Number(hit[2]), Number(hit[3])];
};

// Lowest ratio of a pair over every theme, for one mode. `alpha` is the text opacity.
const worst = (mode: 'light' | 'dark', fg: string, bg: string, alpha = 1) => {
  let min = Infinity;
  for (const file of themeFiles) {
    const css = readFileSync(join(dist, file), 'utf8');
    const back = readToken(css, mode, bg);
    min = Math.min(min, ratio(alpha < 1 ? blend(readToken(css, mode, fg), back, alpha) : readToken(css, mode, fg), back));
  }
  return Number(min.toFixed(2));
};

const AA = 4.5;

describe('text pair contrast over all themes', () => {
  it('covers the vendored theme', () => {
    expect(themeFiles).toHaveLength(1);
  });

  describe('Chip muted and count pill', () => {
    it('uses the text-muted on muted pair, with text-default on hover', () => {
      const cls = chipVariants({ variant: 'muted' });
      expect(cls).toContain('text-text-muted');
      expect(cls).not.toContain('text-text-subtle');
      expect(cls).toContain('hover:text-text-default');
    });
    it.each([
      ['light', 6.92],
      ['dark', 5.71],
    ] as const)('rest text-muted on bg-muted holds AA in %s', (mode, pinned) => {
      const value = worst(mode, 'semantic-text-muted', 'colors-utility-muted');
      expect(value).toBeGreaterThanOrEqual(AA);
      expect(value).toBe(pinned);
    });
    it.each([
      ['light', 12.02],
      ['dark', 7.24],
    ] as const)('hover text-default on bg-muted-strong holds AA in %s', (mode, pinned) => {
      const value = worst(mode, 'semantic-text-default', 'colors-utility-muted-strong');
      expect(value).toBeGreaterThanOrEqual(AA);
      expect(value).toBe(pinned);
    });
  });

  describe('Message neutral own bubble', () => {
    it.each([
      ['light', 12.02],
      ['dark', 7.24],
    ] as const)('text-default on bg-background-neutral-active holds AA in %s', (mode, pinned) => {
      const value = worst(mode, 'semantic-text-default', 'semantic-background-neutral-active');
      expect(value).toBeGreaterThanOrEqual(AA);
      expect(value).toBe(pinned);
    });
  });

  describe('MetricPanel inverse-fixed', () => {
    // The dark theme is scoped to the panel, so the dark values apply in both page modes.
    it('text-default and its 80 percent tint hold AA on background-subtle', () => {
      expect(worst('dark', 'semantic-text-default', 'semantic-background-subtle')).toBeGreaterThanOrEqual(AA);
      expect(worst('dark', 'semantic-text-default', 'semantic-background-subtle', 0.8)).toBeGreaterThanOrEqual(AA);
    });
  });

  describe('TopBarBrand inverse', () => {
    it.each(['light', 'dark'] as const)('text-inverse and its 80 percent byline tint hold AA on background-inverse in %s', (mode) => {
      expect(worst(mode, 'semantic-text-inverse', 'semantic-background-inverse')).toBeGreaterThanOrEqual(AA);
      expect(worst(mode, 'semantic-text-inverse', 'semantic-background-inverse', 0.8)).toBeGreaterThanOrEqual(AA);
    });
  });
});
