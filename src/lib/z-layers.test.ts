import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(process.cwd(), 'src/components');
const tokens = join(process.cwd(), 'styles/theme.css');

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry) && !/\.(stories|test|fixtures|figma)\./.test(entry) ? [path] : [];
  });

const tokenValue = (name: string) => {
  const match = readFileSync(tokens, 'utf8').match(new RegExp(`--z-${name}:\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
};

// Layer order: page chrome (chrome 30) < banners (40) < sheet (50) < dialog (60) < dropdown (65) < toast (70) < tooltip (80).
describe('z-index layering', () => {
  it('keeps banners below every modal layer and the modal layers below popovers', () => {
    const order = [tokenValue('banner'), tokenValue('sheet'), tokenValue('dialog'), tokenValue('dropdown'), tokenValue('toast'), tokenValue('tooltip')];
    expect(order.every((value) => value !== null)).toBe(true);
    expect([...order].sort((a, b) => (a as number) - (b as number))).toEqual(order);
  });

  it('keeps page chrome on the chrome layer, below the banner layer', () => {
    expect(tokenValue('chrome')).toBe(30);
    expect(readFileSync(join(root, 'ui/sidebar.tsx'), 'utf8')).toContain('z-chrome');
  });

  it('never uses a raw z-index of 40 or more in a component', () => {
    const offenders: string[] = [];
    for (const file of sources(root)) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/(?<![\w-])-?z-(?:\[(\d+)\]|(\d+))(?![\w-])/g)) {
        if (Number(match[1] ?? match[2]) >= 40) offenders.push(`${file.replace(root, '')}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('puts the cookie banner and the floating chat window on the banner layer', () => {
    expect(readFileSync(join(root, 'ui/cookie-consent.tsx'), 'utf8')).toContain('z-banner');
    expect(readFileSync(join(root, 'ui/chat-window.tsx'), 'utf8')).toContain('z-banner');
  });
});
