import { render, screen } from '@testing-library/react';

import { Alert, AlertTitle } from './alert';
import { Attributes } from './description-list';
import { NotificationList } from './activity-feed';
import { Card, CardTitle } from './card';
import { ChatWindow } from './chat-window';
import { CookieConsent } from './cookie-consent';
import { FacetFilter, FacetGroup } from './facet-filter';
import { Kanban, KanbanColumn } from './kanban';
import { SheetSection } from './sheet';

const level = (name: string) => screen.getByRole('heading', { name: new RegExp(name) }).tagName;

describe('titleAs', () => {
  it('renders a plain paragraph by default and a heading with titleAs', () => {
    const { rerender } = render(
      <Alert>
        <AlertTitle>Alert head</AlertTitle>
      </Alert>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Alert head').tagName).toBe('P');
    rerender(
      <Alert>
        <AlertTitle titleAs="h2">Alert head</AlertTitle>
      </Alert>,
    );
    expect(level('Alert head')).toBe('H2');
  });

  it.each([
    ['CardTitle', (as?: 'h4') => <Card><CardTitle titleAs={as}>Heading</CardTitle></Card>, 'H3'],
    ['Attributes', (as?: 'h4') => <Attributes title="Heading" titleAs={as} />, 'H3'],
    ['SheetSection', (as?: 'h4') => <SheetSection title="Heading" titleAs={as} />, 'H3'],
    ['NotificationList', (as?: 'h4') => <NotificationList title="Heading" titleAs={as} />, 'H2'],
    ['ChatWindow', (as?: 'h4') => <ChatWindow open title="Heading" titleAs={as} />, 'H2'],
    ['CookieConsent', (as?: 'h4') => <CookieConsent title="Heading" titleAs={as} description="Text" onAccept={() => undefined} onDecline={() => undefined} />, 'H2'],
    ['FacetFilter', (as?: 'h4') => <FacetFilter title="Heading" titleAs={as} />, 'H2'],
    ['FacetGroup', (as?: 'h4') => <FacetGroup label="Heading" titleAs={as} />, 'H3'],
    ['KanbanColumn', (as?: 'h4') => <Kanban aria-label="Board"><KanbanColumn id="a" title="Heading" titleAs={as} /></Kanban>, 'H3'],
  ])('%s', (_name, ui, fallback) => {
    const { unmount } = render(ui());
    expect(level('Heading')).toBe(fallback);
    unmount();
    render(ui('h4'));
    expect(level('Heading')).toBe('H4');
  });

  it('CookieConsent renders a paragraph with titleAs="p" and keeps the region name', () => {
    render(<CookieConsent title="Heading" titleAs="p" description="Text" onAccept={() => undefined} onDecline={() => undefined} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Heading').tagName).toBe('P');
    expect(screen.getByRole('region', { name: 'Heading' })).toBeTruthy();
  });
});
