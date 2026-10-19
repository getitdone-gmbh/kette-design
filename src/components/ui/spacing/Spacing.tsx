import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { SpacingProps } from './spacing.interface';

export const spacing = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    gap: {
      '0': '',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '5': 'gap-5',
      '6': 'gap-6',
      '7': 'gap-7',
      '8': 'gap-8',
      '9': 'gap-9',
      '10': 'gap-10',
      '11': 'gap-11',
      '12': 'gap-12',
      '13': 'gap-13',
      '14': 'gap-14',
      '15': 'gap-15',
      '16': 'gap-16',
      '17': 'gap-17',
      '18': 'gap-18',
      '19': 'gap-19',
      '20': 'gap-20',
    },
    justifyContent: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    alignItems: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    wrap: {
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
    },
  },
});

export const Spacing: React.FC<SpacingProps> = ({
  children,
  direction = 'row',
  gap = '1',
  justifyContent = 'start',
  alignItems = 'start',
  wrap = 'wrap',
  className,
  Comp = 'div',
  childrenFullWidth = true,
}) => {
  return (
    <Comp
      className={cn(
        `${spacing({
          direction,
          gap,
          justifyContent,
          alignItems,
          wrap,
          className,
        })} max-sm:[&>*]:grow`,
        { '[&>*]:self-start': !childrenFullWidth },
      )}
      data-testid="spacing"
    >
      {children}
    </Comp>
  );
};
