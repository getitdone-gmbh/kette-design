import clsx from 'clsx';
import { Children, isValidElement, type CSSProperties, type ReactNode } from 'react';
// Server component safe: no hooks or context. Items read the list options from data attributes on the parent via a named group.

interface ListOwnProps {
  type?: 'numeric' | 'bullet' | 'alphabetical' | 'history';
  children?: ReactNode;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
  clamp?: boolean;
  noPadding?: boolean;
}

const List = ({ type = 'bullet', children, style = {}, itemStyle = {}, clamp = false, noPadding = false }: ListOwnProps) => {
  const Comp = type === 'bullet' ? 'ul' : type === 'history' ? 'ul' : 'ol';

  return (
    <>
      <Comp
        data-list-type={type}
        data-list-clamp={clamp || undefined}
        data-list-no-padding={noPadding || undefined}
        className={clsx(
          'group/list',
          'relative',
          'list-none',
          'typography-p-ui',
          'm-0',
          '[&_ul]:pl-5',
          '[&_ol]:pl-5',
          '[&_ul]:pt-2',
          '[&_ol]:pt-2',
          '[counter-reset:section]',
          {
            '[&>li:before]:print:top-[-2px] p-0 inline-block before:content-[""] before:absolute before:w-[2px] before:h-[calc(100%-1.25rem)] before:bg-input-border-default before:left-0 before:top-5 [&>li]:w-full [&>li]:relative [&>li]:m-0 [&>li]:pl-[30px] [&>li]:pb-[64px] [&>li]:print:pb-[32px] [&+ul]:print:pt-0 [&>li:before]:content-[""] [&>li:before]:absolute [&>li:before]:h-6 [&>li:before]:w-6 [&>li:before]:bg-background-light [&>li:before]:border-2 [&>li:before]:left-[-12px] [&>li:before]:rounded-[100%] [&>li:before]:border-solid [&>li:before]:border-input-border-default  [&>li:last-child]:pb-0 print:left-3':
              type === 'history',
          },
        )}
        style={style}
      >
        {Children.map(children, (child) =>
          // A nested List is not a valid direct child of ul or ol, so it moves into an unmarked list item.
          isValidElement(child) && child.type === List ? <li className="list-none">{child}</li> : child,
        )}
      </Comp>
    </>
  );
};

const Item = ({ children, itemStyle = {} }: { children?: ReactNode; itemStyle?: CSSProperties }) => {
  return (
    <li
      className={clsx(
        'pl-4',
        'group-data-[list-no-padding]/list:pl-0',
        'relative',
        'flex',
        'items-baseline',
        'py-[0.125rem]',
        '[counter-increment:section]',
        'before:w-4',
        'before:h-4',
        'before:mr-2',
        'before:text-center',
        'before:shrink-0',
        'group-data-[list-type=bullet]/list:before:[content:"•"]',
        'group-data-[list-type=none]/list:before:hidden',
        'group-data-[list-type=alphabetical]/list:before:[content:counter(section,lower-alpha)]',
        'group-data-[list-type=numeric]/list:before:[content:counter(section)]',
        'group-data-[list-clamp]/list:text-clamp-small',
        'group-data-[list-clamp]/list:leading-clamp-small',
      )}
      style={itemStyle}
    >
      {children}
    </li>
  );
};

const HistoryItem = ({ date, title, description, clamp = false }: { date?: ReactNode; title?: ReactNode; description?: ReactNode; clamp?: boolean }) => (
  <li className="w-full h-auto flex flex-col flex-nowrap relative items-start gap-4">
    <span
      className={clsx(
        { 'text-clamp-small leading-clamp-small': clamp },
        'typography-small',
        'leading-5',
        'inline-block',
        'bg-inline-block',
        'bg-input-border-default',
        'whitespace-nowrap',
        'rounded-[50px]',
        'px-2',
        'print:py-1',
        'print:px-2',
      )}
    >
      {date}
    </span>
    <div className="place">
      <span className="typography-large block">{title}</span>
      <span>{description}</span>
    </div>
  </li>
);

List.Item = Item;
List.HistoryItem = HistoryItem;

export { List };
