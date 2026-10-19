// Test helper: WCAG contrast of semantic colour tokens read from the vendored theme (styles/theme.css), per mode.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Rgb = [number, number, number];
export type Tokens = Record<string, Rgb>;

const THEME_CSS = join(process.cwd(), 'styles/theme.css');

const parseVars = (block: string): Tokens => {
  const out: Tokens = {};
  for (const m of block.matchAll(/--(?:colors|semantic)-([a-z0-9-]+):\s*(\d+) (\d+) (\d+);/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
};

const luminance = (c: Rgb) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export interface ThemeTokens {
  name: string;
  light: Tokens;
  dark: Tokens;
}

export const loadThemes = (): ThemeTokens[] => {
  const css = readFileSync(THEME_CSS, 'utf8');
  const light = parseVars(/:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '');
  const dark = { ...light, ...parseVars(/\n\.dark\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '') };
  return [{ name: 'zero', light, dark }];
};
