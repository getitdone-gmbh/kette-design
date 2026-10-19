import { render } from '@testing-library/react';

import { Chip } from '../../components/ui/chip';
import { collectRenderedClasses, missingCompiledClasses } from '../assert-compiled';

describe('chip target size guard', () => {
  it('interactive chip variants only render classes that compile', async () => {
    render(
      <>
        {(['default', 'secondary', 'outline', 'info', 'success', 'destructive', 'warning'] as const).flatMap((variant) =>
          (['small', 'medium', 'large'] as const).map((size) => (
            <Chip key={`${variant}${size}`} variant={variant} size={size} onClick={() => undefined}>
              x
            </Chip>
          )),
        )}
      </>,
    );
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });

  it('new chip variants only render classes that compile', async () => {
    render(
      <>
        <Chip variant="muted" label="m" />
        {(['info', 'success', 'warning', 'destructive'] as const).map((variant) => (
          <Chip key={variant} variant={variant} tinted selected label="t" />
        ))}
        {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((category) => (
          <Chip key={category} category={category} label="c" />
        ))}
        <Chip href="/a" selected avatar={<span />} label="l" />
      </>,
    );
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });

  it('small interactive chips enforce a 24px minimum height, static ones do not', () => {
    const { getByText } = render(
      <>
        <Chip size="small" onClick={() => undefined}>
          act
        </Chip>
        <Chip size="small">stat</Chip>
      </>,
    );
    expect(getByText('act')).toHaveClass('min-h-target');
    expect(getByText('stat').className).not.toMatch(/min-h-/);
  });
});
