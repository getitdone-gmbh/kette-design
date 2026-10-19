import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The package vendors one theme (zero) in styles/theme.css.
const dist = join(process.cwd(), 'styles');

// Elevation tokens are placed in one box-shadow list next to the focus ring. A value of `none` makes the whole list invalid, so the ring disappears.
describe('elevation tokens', () => {
  const themeFiles = [join(dist, 'theme.css')];

  it('never resolve to none', () => {
    const offenders: string[] = [];
    for (const file of themeFiles) {
      let css = '';
      try {
        css = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      for (const match of css.matchAll(/--elevation-([a-z-]+):\s*none\s*;/g)) {
        offenders.push(`${file.replace(dist, '')} --elevation-${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
