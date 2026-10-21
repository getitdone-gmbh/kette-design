import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { SecondaryNav, StorageMeter } from './secondary-nav';

const sections = [
  { id: 'a', label: 'Spaces', items: [{ id: 'all', label: 'All files', count: 12 }, { id: 'mine', label: 'My files' }] },
  { id: 'b', items: [{ id: 'trash', label: 'Trash', href: '#trash' }, { id: 'off', label: 'Archive', disabled: true }] },
];

describe('SecondaryNav', () => {
  it('sizes the item icon wrapper with the 15px nav icon token', () => {
    render(<SecondaryNav aria-label="Files" sections={[{ id: 'a', items: [{ id: 'x', label: 'Inbox', icon: <svg data-testid="ico" /> }] }]} />);
    expect(screen.getByTestId('ico').parentElement).toHaveClass('h-icon-nav', 'w-icon-nav');
  });

  it('renders a named nav with section headers, items and counts', () => {
    render(<SecondaryNav aria-label="Files" sections={sections} />);
    expect(screen.getByRole('navigation', { name: 'Files' })).toBeInTheDocument();
    expect(screen.getByText('Spaces')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All files/ })).toHaveTextContent('12');
    expect(screen.getByRole('link', { name: 'Trash' })).toHaveAttribute('href', '#trash');
  });

  it('is uncontrolled with defaultValue and marks the current item', async () => {
    const onValueChange = vi.fn();
    render(<SecondaryNav aria-label="Files" sections={sections} defaultValue="all" onValueChange={onValueChange} />);
    expect(screen.getByRole('button', { name: /All files/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'My files' }));
    expect(screen.getByRole('button', { name: 'My files' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /All files/ })).not.toHaveAttribute('aria-current');
    expect(onValueChange).toHaveBeenCalledWith('mine');
  });

  it('is controlled with value', async () => {
    render(<SecondaryNav aria-label="Files" sections={sections} value="mine" />);
    await userEvent.click(screen.getByRole('button', { name: /All files/ }));
    expect(screen.getByRole('button', { name: 'My files' })).toHaveAttribute('aria-current', 'page');
  });

  it('activates with the keyboard and skips disabled items', async () => {
    render(<SecondaryNav aria-label="Files" sections={sections} />);
    screen.getByRole('button', { name: 'My files' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'My files' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
  });

  it('uses the nav item height for sm and the control height for md', () => {
    const { rerender } = render(<SecondaryNav aria-label="f" sections={sections} />);
    expect(screen.getByRole('button', { name: 'My files' })).toHaveClass('h-nav-item');
    rerender(<SecondaryNav aria-label="f" sections={sections} size="md" />);
    expect(screen.getByRole('button', { name: 'My files' })).toHaveClass('h-control-sm');
  });

  it('renders a footer slot with a storage meter', () => {
    render(<SecondaryNav aria-label="f" sections={sections} footer={<StorageMeter used={4} total={10} />} />);
    expect(screen.getByRole('progressbar', { name: 'Storage, 40 percent used' })).toHaveAttribute('aria-valuenow', '4');
    expect(screen.getByText('4 of 10 GB used')).toBeInTheDocument();
  });
});

describe('StorageMeter', () => {
  it('flags near full storage', () => {
    render(<StorageMeter used={9.5} total={10} label="Files" />);
    expect(screen.getByText('9.5 of 10 GB used')).toHaveClass('text-text-destructive');
  });
});

describe('SecondaryNav renderLink and collapsed rail', () => {
  it('renders items with href through renderLink and keeps classes, aria-current and selection', async () => {
    const onValueChange = vi.fn();
    render(
      <SecondaryNav
        aria-label="Files"
        sections={sections}
        defaultValue="trash"
        onValueChange={onValueChange}
        renderLink={(item, props) => <a data-router-link="" {...props}>{props.children}</a>}
      />,
    );
    const link = screen.getByRole('link', { name: 'Trash' });
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('href', '#trash');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link.className).toContain('rounded-item');
    await userEvent.click(link);
    expect(onValueChange).toHaveBeenCalledWith('trash');
  });

  it('collapsed is an icon rail: labels stay accessible, counts and headers are hidden', () => {
    render(
      <SecondaryNav
        aria-label="Files"
        collapsed
        footer={<span>Footer</span>}
        sections={[{ id: 'a', label: 'Spaces', items: [{ id: 'all', label: 'All files', count: 12, icon: <i /> }] }]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Files' });
    expect(nav).toHaveClass('w-sidebar-collapsed');
    expect(screen.queryByText('Spaces')).toBeNull();
    expect(screen.queryByText('12')).toBeNull();
    expect(screen.queryByText('Footer')).toBeNull();
    const button = screen.getByRole('button', { name: 'All files' });
    expect(button).toHaveAttribute('title', 'All files');
  });

  it('shows a second badge after the count and hides it in the collapsed rail', () => {
    const sections = [{ id: 'a', items: [{ id: 'all', label: 'All files', count: 12, badge: <span>Review</span>, icon: <i /> }] }];
    const { rerender } = render(<SecondaryNav aria-label="Files" sections={sections} />);
    const button = screen.getByRole('button', { name: /All files/ });
    expect(button).toHaveTextContent('All files12Review');
    rerender(<SecondaryNav aria-label="Files" collapsed sections={sections} />);
    expect(screen.queryByText('Review')).toBeNull();
  });
});
