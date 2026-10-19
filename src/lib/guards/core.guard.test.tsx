// Dead-class guard for the core batch: every class the new variants, states and components render must compile through the token preset.
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { Fragment } from 'react';

import { Avatar, AvatarFallback, avatarFallbackColors, type AvatarFallbackColor } from '../../components/ui/avatar';
import { BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, Breadcrumbs, type BreadcrumbType } from '../../components/ui/breadcrumb';
import { ButtonClose } from '../../components/ui/button-close';
import { ButtonGroup, ButtonGroupItem } from '../../components/ui/button-group';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import { Chip } from '../../components/ui/chip';
import { HelpIcon } from '../../components/ui/help-icon';
import { Link } from '../../components/ui/link';
import { LogoTile, type LogoTileColor } from '../../components/ui/logo-tile';
import { Pagination, type PaginationVariant } from '../../components/ui/pagination';
import { PaginationDotGroup } from '../../components/ui/pagination-dot-group';
import { Skeleton } from '../../components/ui/skeleton';
import { TableActionsCell, TablePaymentCell, TableProgressCell, TableRatingCell, TableTrendCell } from '../../components/ui/table-cells';
import { Table, TableBadgeCell, TableBody, TableCell, TableEmpty, TableError, TableHead, TableHeader, TableLoading, TableLoadingMore, TableLeadCell, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { VerifiedTick, verifiedTickSizes, type VerifiedTickSize } from '../../components/ui/verified-tick';
import { collectRenderedClasses, missingCompiledClasses } from '../assert-compiled';

vi.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [() => undefined, { scrollSnapList: () => [0, 1, 2], selectedScrollSnap: () => 0, canScrollPrev: () => false, canScrollNext: () => true, on: () => undefined, off: () => undefined, scrollTo: () => undefined, scrollPrev: () => undefined, scrollNext: () => undefined }],
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= ResizeObserverStub;
  Element.prototype.scrollIntoView ??= () => {};
});

const colors: LogoTileColor[] = [1, 2, 3, 4, 5, 6, 7, 8];
const crumbTypes: BreadcrumbType[] = ['text', 'text-with-line', 'button-primary', 'button-gray', 'button-gray-border', 'path'];
const pagVariants: PaginationVariant[] = ['page', 'page-minimal', 'card', 'card-minimal', 'card-button-group', 'compact', 'lazy'];

const Everything = () => (
  <>
    <Tabs defaultValue="a" orientation="vertical">
      <TabsList variant="vertical">
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b" count={2}>
          B
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">A</TabsContent>
    </Tabs>
    <Tabs defaultValue="Mine">
      <TabsList variant="segment" className="max-w-full overflow-x-auto">
        {['Mine', 'Active', 'In review', 'Expired', 'Performance', 'All workspaces', 'Archived'].map((l, i) => (
          <TabsTrigger key={l} value={l} count={i === 4 ? undefined : i + 1}>
            {l}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>

    {(['block', 'row', 'row-single', 'text', 'avatar'] as const).map((v) => (
      <Skeleton key={v} variant={v} />
    ))}

    {colors.map((c) => (
      <Fragment key={c}>
        <LogoTile color={c} initials="AC" />
        <LogoTile color={c} initials="AC" size="sm" label="Acme" />
        <LogoTile color={c} initials="AC" size="md" />
      </Fragment>
    ))}
    <Avatar>
      {(Object.keys(avatarFallbackColors) as unknown as AvatarFallbackColor[]).map((c) => (
        <AvatarFallback key={String(c)} color={c} size="xs">
          AB
        </AvatarFallback>
      ))}
    </Avatar>

    <Table>
      <TableBody>
        <TableRow selected>
          <TableLeadCell logo={<LogoTile initials="AC" />} control={<input type="checkbox" aria-label="s" />} name="Acme" supportingText="Berlin" tag={<Chip size="small">Required</Chip>} />
          <TableBadgeCell>
            <Chip variant="success">Active</Chip>
          </TableBadgeCell>
          <TableCell select />
        </TableRow>
        <TableRow active>
          <TableCell selected align="right" rowHeight="two-line" tag={<Chip size="small">tag</Chip>}>
            1
          </TableCell>
          <TableCell active focused rowHeight="default">
            2
          </TableCell>
          <TableCell invalid disabled>
            3
          </TableCell>
          <TableBadgeCell padding="wide" selected>
            <Chip>x</Chip>
          </TableBadgeCell>
        </TableRow>
      </TableBody>
    </Table>

    <Table>
      <TableBody>
        {[{}, { selected: true }, { disabled: true }, { active: true }].map((state, i) => (
          <TableRow key={i}>
            <TableTrendCell value="$1" change="2%" trend="positive" rowHeight="two-line" {...state} />
            <TableTrendCell value="$1" change="2%" trend="negative" {...state} />
            <TableProgressCell value={60} label="p" {...state} />
            <TableProgressCell value={10} label="p" variant="destructive" {...state} />
            <TableRatingCell value={3} {...state} />
            <TableActionsCell actions={[{ label: 'Edit', icon: <svg /> }, { label: 'Del', icon: <svg />, disabled: true }]} {...state} />
            <TablePaymentCell icon={<svg />} name="Visa" supportingText="06/2024" {...state} />
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {(['zero', 'zero-compact'] as const).map((d) => (
      <Table key={d} density={d}>
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>c</TableCell>
          </TableRow>
          <TableEmpty columns={1} title="None" description="d" actions={<button type="button">a</button>} />
          <TableError columns={1} onRetry={() => undefined} />
          <TableLoadingMore columns={1} loading />
          <TableLoadingMore columns={1} onLoadMore={() => undefined} />
        </TableBody>
      </Table>
    ))}
    <TableLoading columns={3} skeleton="row" />

    {pagVariants.map((v) => (
      <Fragment key={v}>
        <Pagination variant={v} pageCount={30} defaultPage={15} total={214} pageSize={20} pageSizeOptions={[10, 20]} onPageSizeChange={() => undefined} />
        <Pagination variant={v} shape="circle" pageCount={4} total={80} loading />
        <Pagination variant={v} pageCount={4} disabled align="center" />
        <Pagination variant={v} pageCount={4} align="left" exhausted />
      </Fragment>
    ))}
    {(['md', 'lg'] as const).flatMap((size) =>
      (['dot', 'line'] as const).flatMap((indicator) =>
        (['primary-light-bg', 'primary-dark-bg', 'gray-light-bg', 'gray-dark-bg'] as const).flatMap((tone) =>
          [true, false].map((framed) => (
            <Fragment key={`${size}${indicator}${tone}${framed}`}>
              <PaginationDotGroup count={4} current={1} size={size} indicator={indicator} tone={tone} framed={framed} />
              <PaginationDotGroup count={4} current={1} size={size} indicator={indicator} tone={tone} framed={framed} onSelect={() => undefined} />
            </Fragment>
          )),
        ),
      ),
    )}
    <Carousel>
      <CarouselContent>
        <CarouselItem>1</CarouselItem>
      </CarouselContent>
      <CarouselDots indicator="line" framed />
      <CarouselDots overlay tone="primary-light-bg" size="lg" framed />
      {(['primary', 'dark', 'light'] as const).flatMap((t) => (['md', 'lg'] as const).map((sz) => <CarouselPrevious key={`p${t}${sz}`} overlayTone={t} overlaySize={sz} />))}
      {(['primary', 'dark', 'light'] as const).map((t) => <CarouselNext key={`n${t}`} overlayTone={t} />)}
    </Carousel>

    {crumbTypes.map((t) => (
      <Fragment key={t}>
        {(['chevron', 'slash'] as const).map((d) => (
          <Breadcrumbs key={d} type={t} divider={d}>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" icon={<svg />} aria-label="Home" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">A</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink disabled>B</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink current>C</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumbs>
        ))}
      </Fragment>
    ))}

    {(['brand', 'neutral', 'destructive'] as const).flatMap((color) =>
      (['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Fragment key={`${color}${size}`}>
          <Link href="#" color={color} size={size} icon={<svg />} iconTrailing={<svg />}>
            L
          </Link>
          <Link href="#" color={color} size={size} dotLeading disabled>
            L
          </Link>
        </Fragment>
      )),
    )}
    {(['neutral', 'brand'] as const).flatMap((color) => (['sm', 'md', 'lg'] as const).map((size) => <ButtonClose key={`${color}${size}`} color={color} size={size} disabled />))}
    {(Object.keys(verifiedTickSizes) as VerifiedTickSize[]).map((s) => (
      <VerifiedTick key={s} size={s} />
    ))}
    <ButtonGroup>
      <ButtonGroupItem data-current icon={<svg />}>
        A
      </ButtonGroupItem>
      <ButtonGroupItem icon={<svg />} aria-label="b" />
      <ButtonGroupItem dotLeading current>
        C
      </ButtonGroupItem>
      <ButtonGroupItem disabled>D</ButtonGroupItem>
    </ButtonGroup>
    <HelpIcon content="Tip" supportingText="More" open arrow />
    <HelpIcon content="Tip" side="bottom" />
  </>
);

describe('core guard: new components, variants and states compile', () => {
  it('every rendered class generates CSS through the token preset', async () => {
    render(<Everything />);
    const classes = collectRenderedClasses(document.body);
    expect(classes.length).toBeGreaterThan(100);
    expect(await missingCompiledClasses(classes)).toEqual([]);
  });
});
