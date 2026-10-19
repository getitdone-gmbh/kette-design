import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Countdown, splitDuration } from './countdown';
import { DesignSystemProvider } from './design-system-provider';

describe('splitDuration', () => {
  it('splits milliseconds into units and clamps negatives', () => {
    expect(splitDuration(90061000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, done: false });
    expect(splitDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});

describe('Countdown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders padded segments and a coarse polite announcement', () => {
    const now = () => 0;
    render(<Countdown to={90061000} now={now} label="Launch in" />);
    const timer = screen.getByRole('timer');
    expect(timer).toHaveTextContent('01');
    expect(timer.querySelector('[aria-hidden="true"]')).not.toBeNull();
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Launch in 1 Days, 1 Hours, 1 Minutes');
  });

  it('ticks down and calls onComplete exactly once', () => {
    let clock = 0;
    const onComplete = vi.fn();
    render(<Countdown to={3000} now={() => clock} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    clock = 3000;
    act(() => vi.advanceTimersByTime(1000));
    clock = 5000;
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('The countdown has ended');
    expect(screen.getByRole('timer')).toHaveAttribute('data-done', 'true');
  });

  it('can hide an empty days segment', () => {
    render(<Countdown to={3600000} now={() => 0} hideEmptyDays />);
    expect(screen.queryByText('Days', { selector: 'span[aria-hidden] span, [aria-hidden] span' })).toBeNull();
  });

  describe('finished state', () => {
    it('shows a visible finished text instead of 00 digits', () => {
      render(<Countdown to={1000} now={() => 5000} />);
      expect(screen.getByText("Time's up")).toBeVisible();
      expect(screen.getByRole('timer')).not.toHaveTextContent('00');
    });

    it('localises the finished text', () => {
      render(
        <DesignSystemProvider locale="de">
          <Countdown to={1000} now={() => 5000} />
        </DesignSystemProvider>,
      );
      expect(screen.getByText('Abgelaufen')).toBeVisible();
    });

    it('accepts custom finished content as a slot', () => {
      render(<Countdown to={1000} now={() => 5000} finishedText={<a href="/next">Next round</a>} />);
      expect(screen.getByRole('link', { name: 'Next round' })).toBeVisible();
      expect(screen.queryByText("Time's up")).toBeNull();
    });

    it('keeps the zeroed digits with finishedText={false}', () => {
      render(<Countdown to={1000} now={() => 5000} finishedText={false} />);
      expect(screen.getByRole('timer')).toHaveTextContent('00');
      expect(screen.queryByText("Time's up")).toBeNull();
    });

    it('does not show the finished text while running', () => {
      render(<Countdown to={90061000} now={() => 0} />);
      expect(screen.queryByText("Time's up")).toBeNull();
    });
  });

  describe('inline variant', () => {
    it('renders one compact line without leading zero units and keeps the calm announcement', () => {
      const day = 86400000;
      render(<Countdown variant="inline" to={2 * day + 4 * 3600000 + 12 * 60000 + 5000} now={() => 0} label="Ends in" />);
      const timer = screen.getByRole('timer');
      expect(timer).toHaveAttribute('data-variant', 'inline');
      expect(timer).toHaveTextContent('2d 4h 12m');
      expect(timer.querySelector('[aria-hidden="true"]')).toHaveTextContent('2d 4h 12m');
      expect(screen.getByRole('status')).toHaveTextContent('Ends in 2 Days, 4 Hours, 12 Minutes');
    });

    it('drops days and shows seconds in the last hour', () => {
      const { rerender } = render(<Countdown variant="inline" to={3 * 3600000 + 60000} now={() => 0} />);
      expect(screen.getByRole('timer').querySelector('[aria-hidden="true"]')).toHaveTextContent('3h 1m');
      rerender(<Countdown variant="inline" to={12 * 60000 + 9000} now={() => 0} />);
      expect(screen.getByRole('timer').querySelector('[aria-hidden="true"]')).toHaveTextContent('12m 9s');
    });

    it('uses German unit labels in the German provider and shows the finished text when done', () => {
      render(
        <DesignSystemProvider locale="de">
          <Countdown variant="inline" to={86400000 + 3600000 + 60000} now={() => 0} />
          <Countdown variant="inline" to={0} now={() => 1} />
        </DesignSystemProvider>,
      );
      expect(screen.getAllByRole('timer')[0]).toHaveTextContent('1T 1Std 1Min');
      expect(screen.getAllByRole('timer')[1]).toHaveTextContent('Abgelaufen');
    });
  });
});
