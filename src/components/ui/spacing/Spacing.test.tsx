import { render } from '@testing-library/react';

import { Spacing } from './Spacing';

describe('Spacing component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <Spacing>
        <></>
      </Spacing>,
    );
    const gridElement = getByTestId('spacing');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveClass('flex');
  });
});
