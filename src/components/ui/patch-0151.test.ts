import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// 0.15.1: text on bg-muted uses text-text-muted, which is AA in every theme; text-subtle on muted was 4.34 in zero light
// The package vendors one theme (zero) in styles/theme.css.
const dist = resolve(process.cwd(), 'styles');
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const ratio = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const read = (css: string, name: string) => {
  const m = css.match(new RegExp(`--${name}: (\\d+) (\\d+) (\\d+)`));
  return m ? m.slice(1).map(Number) : null;
};

describe('text-text-muted on bg-muted', () => {
  const themes = ['.'].filter((d) => existsSync(resolve(dist, d, 'theme.css')));
  it('passes AA (4.5:1) in every theme, light and dark', () => {
    expect(themes.length).toBeGreaterThanOrEqual(1);
    for (const t of themes) {
      const css = readFileSync(resolve(dist, t, 'theme.css'), 'utf8');
      const i = css.indexOf('.dark {');
      const light = css.slice(0, i);
      const dark = css.slice(i);
      const fgL = read(light, 'semantic-text-muted')!;
      const bgL = read(light, 'colors-utility-muted')!;
      expect(ratio(fgL, bgL)).toBeGreaterThanOrEqual(4.5);
      const fgD = read(dark, 'semantic-text-muted') ?? fgL;
      const bgD = read(dark, 'colors-utility-muted') ?? bgL;
      expect(ratio(fgD, bgD)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
