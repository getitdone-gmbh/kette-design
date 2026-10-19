// Guard for the 0.14 variants: every class they render must generate CSS through the token preset.
import { render } from '@testing-library/react';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

import { CellGrid, CellGridCell } from '../components/ui/cell-grid';
import { Chip } from '../components/ui/chip';
import { Countdown } from '../components/ui/countdown';
import { EmptyState } from '../components/ui/empty-state';
import { Link } from '../components/ui/link';
import { Message } from '../components/ui/message';
import { MetricPanel } from '../components/ui/metric-panel';
import { TopBarBrand } from '../components/ui/topbar';

const NON_UTILITY = new Set<string>(['group', 'peer', 'dark']);

const unescape = (selector: string) =>
  selector.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, '$1');

const cssClassNames = (css: string): Set<string> => {
  const out = new Set<string>();
  for (const m of css.matchAll(/\.((?:\\[0-9a-f]{1,6} ?|\\.|[A-Za-z0-9_-])+)/gi)) out.add(unescape(m[1]));
  return out;
};

const compile = async (classes: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require('../../tailwind.config.cjs');
  const result = await postcss([tailwindcss({ ...config, content: [{ raw: classes.join(' '), extension: 'html' }] })]).process(
    '@tailwind components;\n@tailwind utilities;',
    { from: undefined },
  );
  return cssClassNames(result.css);
};

const Everything = () => (
  <div>
    <CellGrid framed={false} padding="sm" columns={{ base: 2, sm: 2, md: 3, lg: 4 }}>
      <CellGridCell>a</CellGridCell>
    </CellGrid>
    <CellGrid padding="lg" items={[{ id: 'a', content: 'a' }]} />
    <MetricPanel label="l" value="v" tone="inverse-fixed" size="lg" secondary={[{ label: 'a', value: 'b' }]} />
    <Message author="a" own ownTone="neutral" text="t" />
    <Message author="a" bare text="t" />
    <Chip variant="muted" label="m" count={3} meta="x" />
    <Chip variant="outline" label="o" count={3} />
    <Countdown to={1000} now={() => 5000} />
    <EmptyState size="page" titleAs="h1" title="t" />
    <TopBarBrand name="n" byline="b" tone="inverse" size="lg" />
    <Link href="#" typography="inherit" color="inherit">
      l
    </Link>
  </div>
);

describe('compiled classes for the 0.14 variants', () => {
  it('every rendered class generates CSS through the token preset', async () => {
    const { baseElement } = render(<Everything />);
    const found = new Set<string>();
    baseElement.querySelectorAll('*').forEach((el) => el.getAttribute('class')?.split(/\s+/).filter(Boolean).forEach((c) => found.add(c)));
    const classes = [...found];
    const compiled = await compile(classes);
    const missing = classes.filter((c) => !NON_UTILITY.has(c) && !/^lucide(-|$)/.test(c) && !compiled.has(c)).sort();
    expect(missing).toEqual([]);
  }, 60000);
});
