import { vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';

type Listener = () => void;
const listeners: Record<string, Listener[]> = {};
const api = {
  selected: 0,
  scrollSnapList: () => [0, 1, 2],
  selectedScrollSnap: () => api.selected,
  scrollTo: vi.fn((i: number) => {
    api.selected = i;
    (listeners.select ?? []).forEach((l) => l());
  }),
  canScrollPrev: () => false,
  canScrollNext: () => true,
  on: (e: string, l: Listener) => {
    (listeners[e] ??= []).push(l);
  },
  off: (e: string, l: Listener) => {
    listeners[e] = (listeners[e] ?? []).filter((x) => x !== l);
  },
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
};

vi.mock('embla-carousel-react', () => ({ default: () => [() => undefined, api] }));

describe('CarouselDots', () => {
  beforeEach(() => {
    api.selected = 0;
    api.scrollTo.mockClear();
  });

  const renderCarousel = () =>
    render(
      <Carousel aria-label="Photos">
        <CarouselContent>
          {[1, 2, 3].map((n) => (
            <CarouselItem key={n}>{n}</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots indicator="line" />
      </Carousel>,
    );

  it('renders one button per slide and marks the selected one', () => {
    renderCarousel();
    const dots = screen.getAllByRole('button', { name: /Go to slide/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
  });

  it('scrolls to the chosen slide and follows the carousel selection', async () => {
    renderCarousel();
    await userEvent.click(screen.getByRole('button', { name: 'Go to slide 3 of 3' }));
    expect(api.scrollTo).toHaveBeenCalledWith(2);
    expect(screen.getByRole('button', { name: 'Go to slide 3 of 3' })).toHaveAttribute('aria-current', 'true');
    act(() => {
      api.selected = 1;
      listeners.select.forEach((l) => l());
    });
    expect(screen.getByRole('button', { name: 'Go to slide 2 of 3' })).toHaveAttribute('aria-current', 'true');
  });

  it('overlay dots sit centred 16px above the bottom edge', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
        </CarouselContent>
        <CarouselDots overlay tone="gray-dark-bg" size="lg" framed />
      </Carousel>,
    );
    expect(container.querySelector('[data-tone]')).toHaveClass('absolute', 'bottom-4', 'left-1/2', '-translate-x-1/2', 'bg-static-black/90', 'p-3');
  });

  it('overlay arrows are round, sized per Figma and keep their names', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious overlayTone="primary" />
        <CarouselNext overlayTone="dark" overlaySize="lg" />
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toHaveClass('left-4', 'h-control-md', 'bg-primary-700', 'rounded-full');
    expect(screen.getByRole('button', { name: 'Next slide' })).toHaveClass('right-5', 'h-control-lg', 'bg-static-black/90');
  });

  it('default arrows keep the outline look outside the slides', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: 'Next slide' })).toHaveClass('-right-12');
  });
});
