import { contrast, loadThemes } from '../../lib/token-contrast';

// Selected chip text against its fill (WCAG 1.4.3, 4.5:1) and its border against the page (WCAG 1.4.11, 3:1 is not required for a decorative tint border, so only the text pair is gated), in every theme.
describe('Selected chip contrast', () => {
  for (const mode of ['light', 'dark'] as const) {
    it(`keeps 4.5:1 for chip.foreground.selected on chip.background.selected in ${mode} for every theme`, () => {
      const failing: string[] = [];
      for (const theme of loadThemes()) {
        const tokens = theme[mode];
        const fg = tokens['chip-foreground-selected'];
        const bg = tokens['chip-background-selected'];
        if (!fg || !bg) {
          failing.push(`${theme.name} missing chip.selected tokens`);
          continue;
        }
        const value = contrast(fg, bg);
        if (value < 4.5) failing.push(`${theme.name} ${value.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });
  }
});
