import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';

import { BatchBar } from './action-bar';
import { Avatar, AvatarFallback, AvatarOnlineIndicator } from './avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';
import { Chip } from './chip';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog';
import { DesignSystemProvider, useLabels } from './design-system-provider';
import { FileUpload, FileUploadItem } from './file-upload';
import { labelsDe } from './labels-de';
import { labelsEn } from './labels-en';
import { Pagination } from './pagination';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet';
import { Sidebar, SidebarLayout, SidebarQuickActions, SidebarTrigger } from './sidebar';
import { SingleSelect, SingleSelectProvider } from './singleselect';
import { TableLoading } from './table';

vi.mock('embla-carousel-react', () => ({
  default: () => [() => undefined, { scrollPrev: vi.fn(), scrollNext: vi.fn(), canScrollPrev: () => false, canScrollNext: () => true, on: vi.fn(), off: vi.fn(), scrollSnapList: () => [0], selectedScrollSnap: () => 0 }],
}));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ResizeObserver = MockResizeObserver;
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const DialogExample = ({ closeLabel }: { closeLabel?: string }) => (
  <Dialog open>
    <DialogContent closeLabel={closeLabel}>
      <DialogTitle>Titel</DialogTitle>
      <DialogDescription>Text</DialogDescription>
    </DialogContent>
  </Dialog>
);

const SheetExample = ({ closeLabel }: { closeLabel?: string }) => (
  <Sheet open>
    <SheetContent closeLabel={closeLabel}>
      <SheetTitle>Titel</SheetTitle>
      <SheetDescription>Text</SheetDescription>
    </SheetContent>
  </Sheet>
);

const CarouselExample = (props: { previousLabel?: string; nextLabel?: string }) => (
  <Carousel aria-label="Fotos">
    <CarouselContent>
      <CarouselItem>1</CarouselItem>
    </CarouselContent>
    <CarouselPrevious previousLabel={props.previousLabel} />
    <CarouselNext nextLabel={props.nextLabel} />
  </Carousel>
);

const Probe = () => <span>{useLabels().close}</span>;

describe('DesignSystemProvider', () => {
  it('defaults to English without a provider', () => {
    render(<Probe />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('switches to German and overrides single labels', () => {
    render(
      <DesignSystemProvider locale="de" labels={{ close: 'Zumachen' }}>
        <Probe />
      </DesignSystemProvider>,
    );
    expect(screen.getByText('Zumachen')).toBeInTheDocument();
  });

  it('inherits the locale in nested providers', () => {
    render(
      <DesignSystemProvider locale="de">
        <DesignSystemProvider labels={{ close: 'Zu' }}>
          <Probe />
        </DesignSystemProvider>
      </DesignSystemProvider>,
    );
    expect(screen.getByText('Zu')).toBeInTheDocument();
  });

  it('has the same keys in both dictionaries', () => {
    expect(Object.keys(labelsDe).sort()).toEqual(Object.keys(labelsEn).sort());
  });
});

describe('German built-in texts', () => {
  const de = (ui: React.ReactNode) => render(<DesignSystemProvider locale="de">{ui}</DesignSystemProvider>);

  it('Dialog close', () => {
    de(<DialogExample />);
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
  });

  it('Sheet close', () => {
    de(<SheetExample />);
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
  });

  it('Chip remove', () => {
    de(<Chip label="React" onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'React entfernen' })).toBeInTheDocument();
  });

  it('Pagination', () => {
    de(<Pagination variant="compact" total={214} pageSize={20} pageSizeOptions={[20, 50]} onPageSizeChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Vorherige Seite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nächste Seite' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Zeilen pro Seite' })).toBeInTheDocument();
    expect(screen.getByText('1 bis 20 von 214')).toBeInTheDocument();
  });

  it('Carousel arrows', () => {
    de(<CarouselExample />);
    expect(screen.getByText('Vorherige Folie')).toBeInTheDocument();
    expect(screen.getByText('Nächste Folie')).toBeInTheDocument();
  });

  it('Table loading', () => {
    de(<TableLoading columns={3} />);
    expect(screen.getByRole('status', { name: 'Tabellendaten werden geladen' })).toBeInTheDocument();
  });

  it('FileUpload', () => {
    de(
      <FileUpload>
        <FileUploadItem name="cv.pdf" status="error" onRetry={() => {}} onRemove={() => {}} />
      </FileUpload>,
    );
    expect(screen.getByText('Zum Hochladen klicken')).toBeInTheDocument();
    expect(screen.getByText('Hochladen fehlgeschlagen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cv.pdf entfernen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cv.pdf erneut versuchen' })).toBeInTheDocument();
  });

  it('Sidebar navigation', () => {
    de(
      <SidebarLayout>
        <Sidebar aria-label={undefined}>
          <SidebarQuickActions />
        </Sidebar>
        <SidebarTrigger />
      </SidebarLayout>,
    );
    expect(screen.getByRole('navigation', { name: 'Hauptmenü' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suchen' })).toBeInTheDocument();
    expect(screen.getByText('Schnellaktionen')).toBeInTheDocument();
  });

  it('Avatar online', () => {
    de(
      <Avatar>
        <AvatarFallback>AF</AvatarFallback>
        <AvatarOnlineIndicator />
      </Avatar>,
    );
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('ActionBar', () => {
    de(<BatchBar selectedCount={3} onClear={() => {}} moreActions={[{ id: 'a', label: 'A', icon: <Plus />, onSelect: () => {} }]} />);
    expect(screen.getByText('3 ausgewählt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Auswahl aufheben' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weitere Aktionen' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Alle abwählen' })).toBeInTheDocument();
  });
});

describe('Label precedence: prop beats provider beats default', () => {
  const withDe = (ui: React.ReactNode) => (
    <DesignSystemProvider locale="de" labels={{ close: 'Provider zu' }}>
      {ui}
    </DesignSystemProvider>
  );

  it('Dialog', () => {
    const { unmount } = render(<DialogExample />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    unmount();
    const second = render(withDe(<DialogExample />));
    expect(screen.getByRole('button', { name: 'Provider zu' })).toBeInTheDocument();
    second.unmount();
    render(withDe(<DialogExample closeLabel="Prop zu" />));
    expect(screen.getByRole('button', { name: 'Prop zu' })).toBeInTheDocument();
  });

  it('Sheet', () => {
    render(withDe(<SheetExample closeLabel="Prop zu" />));
    expect(screen.getByRole('button', { name: 'Prop zu' })).toBeInTheDocument();
  });

  it('Pagination', () => {
    render(
      <DesignSystemProvider locale="de" labels={{ nextPage: 'Provider weiter' }}>
        <Pagination variant="compact" total={100} previousLabel="Prop zurück" />
      </DesignSystemProvider>,
    );
    expect(screen.getByRole('button', { name: 'Prop zurück' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Provider weiter' })).toBeInTheDocument();
  });

  it('Chip accepts a string or a function', () => {
    const { rerender } = render(<Chip label="React" onRemove={() => {}} removeLabel="Weg damit" />);
    expect(screen.getByRole('button', { name: 'Weg damit' })).toBeInTheDocument();
    rerender(<Chip label="React" onRemove={() => {}} removeLabel={(label) => `Lösche ${label}`} />);
    expect(screen.getByRole('button', { name: 'Lösche React' })).toBeInTheDocument();
  });

  it('Carousel', () => {
    render(
      <DesignSystemProvider locale="de">
        <CarouselExample previousLabel="Zurück blättern" />
      </DesignSystemProvider>,
    );
    expect(screen.getByText('Zurück blättern')).toBeInTheDocument();
    expect(screen.getByText('Nächste Folie')).toBeInTheDocument();
  });

  it('SingleSelect empty state', async () => {
    const user = userEvent.setup();
    const renderSelect = (props: { emptyText?: string }, locale?: 'de') =>
      render(
        <DesignSystemProvider locale={locale}>
          <SingleSelectProvider>
            <SingleSelect id="s" label="Typ" options={[{ id: 'a', label: 'Design' }]} selected={null} onChange={() => {}} enableSearch disableAddNew {...props} />
          </SingleSelectProvider>
        </DesignSystemProvider>,
      );
    const { unmount } = renderSelect({ emptyText: 'Nichts da' }, 'de');
    await user.click(screen.getAllByRole('combobox')[0]);
    await user.type(screen.getByPlaceholderText('Suchen ...'), 'zzz');
    expect(await screen.findByText('Nichts da')).toBeInTheDocument();
    unmount();
    renderSelect({}, 'de');
    await user.click(screen.getAllByRole('combobox')[0]);
    await user.type(screen.getByPlaceholderText('Suchen ...'), 'zzz');
    expect(await screen.findByText('Nicht gefunden')).toBeInTheDocument();
  });
});
