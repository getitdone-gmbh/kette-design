import { render, screen } from '@testing-library/react';

import { InlineCta } from './inline-cta';

describe('InlineCta', () => {
  it('renders heading, description, body and actions', () => {
    render(
      <InlineCta title="Upgrade your plan" description="Need more space?" actions={<button type="button">Upgrade</button>}>
        <p>Body</p>
      </InlineCta>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Upgrade your plan' })).toBeInTheDocument();
    expect(screen.getByText('Need more space?')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  });

  it('renders the media slot and supports another heading level', () => {
    render(<InlineCta title="t" titleAs="h2" media={<img alt="Preview" src="data:," />} />);
    expect(screen.getByRole('img', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
