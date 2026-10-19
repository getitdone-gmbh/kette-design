// Guard for the 0.15 variants: every class they render must generate CSS through the token preset.
import { render } from '@testing-library/react';

import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { MonthGrid, MonthGridCell } from '../components/ui/calendar-grid';
import { Card } from '../components/ui/card';
import { ChatWindow } from '../components/ui/chat-window';
import { FacetFilter, FacetGroup, FacetOption } from '../components/ui/facet-filter';
import { FeedItem } from '../components/ui/feed-item';
import { FileIcon } from '../components/ui/file-icon';
import { Kanban, KanbanColumn } from '../components/ui/kanban';
import { Progress } from '../components/ui/progress';
import { SectionLabel } from '../components/ui/section-label';
import { collectRenderedClasses, missingCompiledClasses } from './assert-compiled';

const Everything = () => (
  <div>
    <Badge variant="credit">Credit</Badge>
    <FileIcon kind="folder" size="lg" />
    <Avatar size="profile">
      <AvatarFallback size="profile">AF</AvatarFallback>
    </Avatar>
    <MonthGrid aria-label="m" weekdaysOnly weekTotals={['1']}>
      <MonthGridCell day={1} />
    </MonthGrid>
    <MonthGrid aria-label="m" weekdaysOnly state="loading" />
    <SectionLabel index="01" indexSize="lg" title="t" />
    <ChatWindow open title="t" subtitle="s" height="content" padding="lg" views={[{ id: 'a', label: 'A', content: 'a' }]} />
    <ul>
      <FeedItem title="t" selected onSelect={() => {}} />
    </ul>
    <Card onClick={() => {}}>c</Card>
    <Progress aria-label="p" segments={[{ value: 10, color: 'bg-data-project-1' }, { value: 5, color: 'rgb(1 2 3)' }]} />
    <FacetFilter selectionMode="toggle-links">
      <FacetGroup label="g">
        <FacetOption label="o" count={2} defaultChecked />
        <FacetOption label="p" />
      </FacetGroup>
    </FacetFilter>
    <Kanban aria-label="k">
      <KanbanColumn id="a" title="A" />
    </Kanban>
  </div>
);

describe('0.15 variants compile', () => {
  it('generates CSS for every rendered class', async () => {
    const { container } = render(<Everything />);
    expect(await missingCompiledClasses(collectRenderedClasses(container))).toEqual([]);
  });
});
