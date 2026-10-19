// Dead-class guard for the page patterns: every rendered class must compile through the token preset.
import { render } from '@testing-library/react';
import { Bell } from 'lucide-react';

import { Attribute, Attributes, SummaryList, SummaryListRow } from '../../components/ui/description-list';
import { FeedItem, FeedList } from '../../components/ui/feed-item';
import { EmptyState } from '../../components/ui/empty-state';
import { FormRow, FormSection } from '../../components/ui/form-section';
import { HeroSection } from '../../components/ui/hero-section';
import { Illustration } from '../../components/ui/illustration';
import { InlineCta } from '../../components/ui/inline-cta';
import { Cluster, SplitView, Stack, TileGrid } from '../../components/ui/layout';
import { ListItem } from '../../components/ui/list-item';
import { Message, MessageAttachment, MessageReaction, MessageReactions } from '../../components/ui/message';
import { KpiStrip, MetricItem } from '../../components/ui/metric';
import { Notification, NotificationAction } from '../../components/ui/notification';
import { PageHeader } from '../../components/ui/page-header';
import { SectionFooter } from '../../components/ui/section-footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { collectRenderedClasses, missingCompiledClasses } from '../assert-compiled';

const noop = () => {};

const Everything = () => (
  <div>
    <KpiStrip aria-label="KPIs">
      <MetricItem label="Open" value="24" delta="+3" deltaTone="success" divider={false} />
      <MetricItem label="Late" value="3" delta="-1" deltaTone="destructive" selected onClick={noop} />
      <MetricItem label="Due" value="5" delta="0" deltaTone="warning" onClick={noop} />
      <MetricItem label="x" value="y" loading />
      <MetricItem label="x" value="y" disabled onClick={noop} />
    </KpiStrip>
    <MetricItem variant="compact" label="Open" value="24" delta="+3" chart={<span />} selected />
    <MetricItem variant="card" label="Views" value="2,000" delta="100%" deltaTone="success" icon={<Bell />} chart={<span />} />
    {(['default', 'first-use', 'no-results', 'error', 'no-access'] as const).map((v) => (
      <EmptyState key={v} variant={v} title="t" description="d" actions={<button type="button">a</button>} />
    ))}
    <EmptyState size="md" tone="primary" title="t" description="d" />
    <EmptyState size="lg" title="t" illustration={<Illustration size="lg" tone="gray" icon={<Bell />} />} />
    <Illustration size="sm" />
    <Illustration size="md" tone="gray" icon={<Bell />} />
    {(['default', 'zero', 'record'] as const).map((v) => (
      <PageHeader
        key={v}
        variant={v}
        title="Team"
        subtitle="s"
        breadcrumbs={<nav>b</nav>}
        leading={<span />}
        badges={<span>b</span>}
        actions={<button type="button">a</button>}
        tabs={<div>t</div>}
        attributes={<div>a</div>}
        divider
      />
    ))}
    <PageHeader variant="banner" centered title="t" subtitle="s" cover={<div />} actions={<button type="button">a</button>} divider />
    <PageHeader variant="banner-avatar" title="t" cover={<div />} leading={<span />} breadcrumbs={<nav />} tabs={<div />} />
    <PageHeader variant="banner-avatar" centered title="t" leading={<span />} />
    <PageHeader variant="avatar" title="t" leading={<span />} />
    <MetricItem variant="card" label="Views" value="1" footerAction={<a href="#r">View report</a>} />
    <Card>
      <CardFooter divider align="between">
        f
      </CardFooter>
    </Card>
    <Card variant="surface" onClick={noop} selected>
      <CardHeader accent divider actions={<button type="button">m</button>} leading={<span />}>
        <CardTitle>T</CardTitle>
      </CardHeader>
      <CardContent>c</CardContent>
    </Card>
    <Card variant="surface">
      <CardHeader accent divider>
        <CardTitle>T</CardTitle>
      </CardHeader>
    </Card>
    <SectionFooter type="card" supporting="s" start={<div />}>
      <button type="button">a</button>
    </SectionFooter>
    <SectionFooter type="section" divider={false}>
      <button type="button">a</button>
    </SectionFooter>
    <HeroSection
      eyebrow="e"
      headline="h"
      supportingText="s"
      primaryAction={<button type="button">p</button>}
      secondaryAction={<button type="button">q</button>}
      productShot={<div>shot</div>}
    />
    <Stack gap="card" />
    <Stack gap="section" as="section" />
    <Cluster gap={3} />
    <TileGrid min={220} />
    <SplitView aside="a" asideWidth="aside">
      c
    </SplitView>
    <SplitView aside="a" side="end" asideWidth="inner" bordered={false}>
      c
    </SplitView>
    <FormSection layout="two-column" title="Billing" description="d">
      <FormRow>
        <input aria-label="a" />
        <input aria-label="b" />
      </FormRow>
    </FormSection>
    <FormSection layout="one-column" title="Billing">
      <input aria-label="a" />
    </FormSection>
    <FormSection layout="sheet" title="Billing" divider>
      <input aria-label="a" />
    </FormSection>
    {(['aside', 'sheet', 'compact'] as const).map((v) => (
      <Attributes key={v} variant={v} title="Details" divided={v === 'sheet'}>
        <Attribute label="Status">Active</Attribute>
      </Attributes>
    ))}
    <Attributes state="loading" />
    <Attributes state="empty" />
    <Attributes state="error" />
    <SummaryList>
      <SummaryListRow label="Net" value="1" />
      <SummaryListRow label="Total" value="2" total />
    </SummaryList>
    <SummaryList state="loading" />
    <SummaryList state="empty" />
    <SummaryList state="error" />
    <InlineCta title="t" description="d" media={<span />} actions={<button type="button">a</button>}>
      body
    </InlineCta>
    <ListItem title="t" subtitle="s" lead={<span />} trailing="12" chevron />
    <ListItem title="t" onClick={noop} selected />
    <ListItem title="t" onClick={noop} disabled />
    <Message author="Phoenix" time="2:20pm" avatar={<span />} text="hi" reactions={<MessageReactions><MessageReaction emoji="x" count={2} active /><MessageReaction emoji="y" /></MessageReactions>} />
    <Message author="You" own text="ok" />
    <Message author="P" attachment={<MessageAttachment name="a.pdf" size="1 MB" />} />
    <Message author="P" typing />
    <Notification title="t" description="d" icon={<Bell />} iconTone="success" onDismiss={noop} actions={<NotificationAction>Dismiss</NotificationAction>} />
    <Notification title="t" layout="mobile" avatar={<span />} media={<span />} progress={60} progressLabel="60%" actions={<><NotificationAction>a</NotificationAction><NotificationAction>b</NotificationAction></>} />
    {(['neutral', 'brand', 'warning', 'destructive', 'info'] as const).map((tone) => (
      <Notification key={tone} title="t" icon={<Bell />} iconTone={tone} />
    ))}
    <Notification variant="inverse" title="Task deleted" onDismiss={noop} actions={<NotificationAction>Undo</NotificationAction>} />
    <FeedList aria-label="Activity" divider="line">
      <FeedItem title="t" time="1h" supporting="s" avatar={<span />} unread onSelect={noop} selected size="sm" />
      <FeedItem title="t" />
    </FeedList>
    <FeedList aria-label="Activity" state="loading" />
    <FeedList aria-label="Activity" state="empty" />
    <FeedList aria-label="Activity" state="error" />
  </div>
);

describe('page patterns dead-class guard', () => {
  it('every rendered class compiles through the token preset', async () => {
    render(<Everything />);
    expect(await missingCompiledClasses(collectRenderedClasses(document.body))).toEqual([]);
  });
});
