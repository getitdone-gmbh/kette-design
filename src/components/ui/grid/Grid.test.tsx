import { render } from '@testing-library/react';

import { Grid } from './Grid';

describe('Grid component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Grid />);
    const gridElement = getByTestId('grid');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveClass('grid');
  });
});
