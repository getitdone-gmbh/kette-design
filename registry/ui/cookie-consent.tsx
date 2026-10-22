'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import type { HeadingTag } from '@/components/ui/heading-tag';
import { Button } from '@/components/ui/button';
import { ButtonClose } from '@/components/ui/button-close';
import type { LabelOverrides } from '@/components/ui/labels';
import { useLabels } from '@/components/ui/labels-context';
import { Switch } from '@/components/ui/switch';

export interface CookieConsentCategory {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Strictly necessary categories are always on and cannot be switched off. All others start off.
  necessary?: boolean;
  // Notice under the description in the settings view, for example a link to the privacy policy. Kept out of the switch description so its link stays a normal link.
  notice?: React.ReactNode;
}

export type CookieConsentSelection = Record<string, boolean>;

// Element of the banner title: a heading level, or `p` for a title that is not part of the document outline.
export type CookieConsentTitleTag = HeadingTag | 'p';

export interface CookieConsentProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  // Visibility is owned by the consumer, who also persists the decision.
  open?: boolean;
  title?: React.ReactNode;
  // Element of the title. h1-h6 fit the banner into the document outline (default h2), `p` renders a plain paragraph so the banner adds no heading to the page.
  titleAs?: CookieConsentTitleTag;
  // What is stored and why. Link the privacy policy inside the text.
  description: React.ReactNode;
  onAccept: () => void;
  // Declines everything that is not strictly necessary. Always offered as an equal action next to accept.
  onDecline: () => void;
  // Optional third path for per-category choices. Rendered as a quiet link button.
  onCustomize?: () => void;
  // Per-category choices. Adds a settings view with one switch per category (nothing pre-selected except necessary ones).
  categories?: CookieConsentCategory[];
  // Stored choice that the settings view starts from, for example the cookie value of a returning visitor. Uncontrolled: the switches stay editable and a changed `initialConsent` resets them. Unknown ids are ignored, missing ids stay off, necessary categories are always on. Without it nothing is pre-selected.
  initialConsent?: CookieConsentSelection;
  // Controlled selection of the settings view. Wins over `initialConsent`; pair it with `onValueChange`. Without `value` the component keeps the switch state itself.
  value?: CookieConsentSelection;
  // Called on every switch change in the settings view with the full selection (both modes).
  onValueChange?: (selection: CookieConsentSelection) => void;
  // Receives the chosen categories from the settings view.
  onSave?: (selection: CookieConsentSelection) => void;
  // Shows a close button. By default closing gives no consent: it calls `onDecline`, exactly like declining (see `dismissBehavior`).
  closable?: boolean;
  // What the close button does. `decline` (default) calls `onDecline`. `defer` closes without deciding: nothing is decided or stored, `onDismiss` is called, the banner hides itself and shows again on the next mount (next visit).
  dismissBehavior?: 'decline' | 'defer';
  // Called when the banner is closed with `dismissBehavior="defer"`.
  onDismiss?: () => void;
  // `compact` is the bottom-left card, `centered-wide` is a wide centred bar/card.
  layout?: 'compact' | 'centered-wide';
  // Opt-in brand fill for both decisions. Accept and decline always render with identical variant, size and contrast
  // on the first layer, because declining must be as easy and as prominent as accepting (GDPR / TTDSG).
  acceptEmphasis?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
  customizeLabel?: string;
  closeLabel?: string;
  saveLabel?: string;
  backLabel?: string;
  // Text beside the locked switch of necessary categories in the settings view. Default "Always active" (en) or "Immer aktiv" (de).
  alwaysActiveLabel?: string;
  settingsTitle?: React.ReactNode;
  // Accessible name of the region.
  regionLabel?: string;
  // `fixed` pins the banner to the bottom of the window, `static` leaves placement to the layout.
  positioning?: 'fixed' | 'static';
}

// Breathing room in px between a scrolled-to element and the banner edge, so its focus ring stays visible.
const SCROLL_PADDING_GAP = 8;

// Links inside the running text keep an underline: their colour alone is not 3:1 against the surrounding text (WCAG 1.4.1).
const inlineLink = '[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:no-underline';

const scrollsVertically = (el: HTMLElement) => {
  const { overflowY } = window.getComputedStyle(el);
  return /(auto|scroll|overlay)/.test(overflowY) && el.scrollHeight > el.clientHeight;
};

// Brings a focused element clear of the banner. scrollIntoView covers every ancestor scroller (also horizontal carousels, where the page scroll padding does not apply), the correction afterwards covers scrollers that ignore the document scroll padding.
const revealAboveBanner = (target: Element, banner: HTMLElement) => {
  target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  const bannerRect = banner.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const horizontalOverlap = rect.right > bannerRect.left && rect.left < bannerRect.right;
  const hiddenBy = rect.bottom - (bannerRect.top - SCROLL_PADDING_GAP);
  if (!horizontalOverlap || hiddenBy <= 0 || rect.top >= bannerRect.bottom) return;
  const delta = Math.min(hiddenBy, Math.max(0, rect.top));
  if (delta <= 0) return;
  let ancestor = target.parentElement;
  while (ancestor && ancestor !== document.body && !scrollsVertically(ancestor)) ancestor = ancestor.parentElement;
  if (ancestor && ancestor !== document.body) ancestor.scrollTop += delta;
  else window.scrollBy(0, delta);
};

const initialSelection = (categories: CookieConsentCategory[], stored?: CookieConsentSelection): CookieConsentSelection =>
  Object.fromEntries(categories.map((c) => [c.id, Boolean(c.necessary) || Boolean(stored?.[c.id])]));

// Privacy-preserving by design: nothing is pre-selected, accept and decline share variant, size and order weight,
// and the banner does not trap focus or block the page.
const CookieConsent = React.forwardRef<HTMLElement, CookieConsentProps>(
  (
    {
      className,
      open = true,
      title,
      titleAs = 'h2',
      description,
      onAccept,
      onDecline,
      onCustomize,
      categories,
      initialConsent,
      value,
      onValueChange,
      onSave,
      closable = false,
      dismissBehavior = 'decline',
      onDismiss,
      layout = 'compact',
      acceptEmphasis = false,
      acceptLabel,
      declineLabel,
      customizeLabel,
      closeLabel,
      saveLabel,
      backLabel,
      alwaysActiveLabel,
      settingsTitle,
      regionLabel,
      positioning = 'fixed',
      ...props
    },
    ref,
  ) => {
    const labels: LabelOverrides = {
      acceptAllCookies: acceptLabel,
      declineNonEssentialCookies: declineLabel,
      cookieSettings: customizeLabel,
      cookieClose: closeLabel,
      cookieSaveSelection: saveLabel,
      cookieBack: backLabel,
      cookieAlwaysActive: alwaysActiveLabel,
      cookieSettingsTitle: typeof settingsTitle === 'string' ? settingsTitle : undefined,
      cookieConsentRegion: regionLabel,
    };
    const l = useLabels(labels);
    const Title = titleAs as React.ElementType;
    const titleId = React.useId();
    const [view, setView] = React.useState<'summary' | 'settings'>('summary');
    const [draft, setDraft] = React.useState<CookieConsentSelection>(() => initialSelection(categories ?? [], value ?? initialConsent));
    const controlled = value !== undefined;
    const selection = controlled ? initialSelection(categories ?? [], value) : draft;
    // A new stored choice (for example after saving) resets the uncontrolled switches.
    const storedKey = JSON.stringify(initialConsent ?? null);
    const firstStored = React.useRef(true);
    React.useEffect(() => {
      if (firstStored.current) {
        firstStored.current = false;
        return;
      }
      setDraft(initialSelection(categories ?? [], initialConsent));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedKey]);
    const [deferred, setDeferred] = React.useState(false);
    const headingRef = React.useRef<HTMLElement | null>(null);
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const settingsButtonRef = React.useRef<HTMLButtonElement | null>(null);
    // The banner never takes focus on its own. Only a user-driven switch between the views moves it: into the settings panel on open, back to the Settings button on return.
    const viewChanged = React.useRef(false);
    React.useEffect(() => {
      if (!viewChanged.current) return;
      if (view === 'settings') (headingRef.current ?? sectionRef.current)?.focus();
      else settingsButtonRef.current?.focus();
    }, [view]);
    const reserveScrollSpace = open && !deferred && positioning === 'fixed';
    // While a fixed banner is showing, keep focused page content above it. Its height is reserved as scroll padding on the document scroller, and as an end-of-body spacer so the end of the page can scroll clear of it too, whatever the body height.
    React.useEffect(() => {
      const node = sectionRef.current;
      if (!reserveScrollSpace || !node || typeof ResizeObserver === 'undefined') return undefined;
      const root = document.documentElement;
      const previous = root.style.scrollPaddingBottom;
      const spacer = document.createElement('div');
      spacer.setAttribute('aria-hidden', 'true');
      spacer.setAttribute('data-cookie-consent-spacer', '');
      document.body.appendChild(spacer);
      const update = () => {
        const rect = node.getBoundingClientRect();
        const covered = Math.ceil(rect.height + Math.max(0, root.clientHeight - rect.bottom)) + SCROLL_PADDING_GAP;
        root.style.scrollPaddingBottom = `${covered}px`;
        spacer.style.height = `${covered}px`;
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(node);
      return () => {
        observer.disconnect();
        root.style.scrollPaddingBottom = previous;
        spacer.remove();
      };
    }, [reserveScrollSpace]);
    // Keyboard focus moving into page content while the banner is open must never end up behind it, in horizontal scrollers too.
    React.useEffect(() => {
      const node = sectionRef.current;
      if (!reserveScrollSpace || !node) return undefined;
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target;
        if (!(target instanceof Element) || node.contains(target) || target === document.body) return;
        revealAboveBanner(target, node);
      };
      document.addEventListener('focusin', onFocusIn);
      return () => document.removeEventListener('focusin', onFocusIn);
    }, [reserveScrollSpace]);
    if (!open || deferred) return null;
    const hasSettings = Boolean(categories?.length);
    const inSettings = hasSettings && view === 'settings';
    const wide = layout === 'centered-wide';
    // Both decisions share one variant so neither can be made more prominent than the other.
    const decisionVariant = acceptEmphasis ? 'primary' : 'outline';
    const heading = inSettings ? (settingsTitle ?? l.cookieSettingsTitle) : title;
    const close = () => {
      if (dismissBehavior === 'defer') {
        setDeferred(true);
        onDismiss?.();
      } else {
        onDecline();
      }
    };
    const openSettings = () => {
      onCustomize?.();
      if (hasSettings) {
        if (!controlled && initialConsent) setDraft(initialSelection(categories ?? [], initialConsent));
        viewChanged.current = true;
        setView('settings');
      }
    };
    const closeSettings = () => {
      viewChanged.current = true;
      setView('summary');
    };
    return (
      <section
        ref={(node) => {
          sectionRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        tabIndex={inSettings ? -1 : undefined}
        aria-label={heading ? undefined : l.cookieConsentRegion}
        aria-labelledby={heading ? titleId : undefined}
        className={cn(
          'relative z-banner flex flex-col gap-4 rounded-surface border border-solid border-border bg-popover p-6 text-popover-foreground shadow-elevation-raised',
          wide ? 'max-w-4xl' : 'max-w-reading sm:flex-row sm:items-end',
          wide && !inSettings && 'md:flex-row md:items-end',
          positioning === 'fixed' && (wide ? 'fixed inset-x-4 bottom-4 mx-auto' : 'fixed bottom-4 left-4 right-4 sm:right-auto sm:w-full'),
          positioning === 'static' && 'w-full',
          positioning === 'static' && wide && 'mx-auto',
          className,
        )}
        {...props}
      >
        {closable ? (
          <ButtonClose aria-label={l.cookieClose} className="absolute right-3 top-3" onClick={close} />
        ) : null}
        <div className={cn('flex min-w-0 flex-1 flex-col gap-2', closable && 'pr-8')}>
          {heading ? (
            <Title ref={headingRef} id={titleId} tabIndex={-1} className="typography-ui-semibold m-0 focus-visible:outline-none">
              {heading}
            </Title>
          ) : null}
          {inSettings ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {categories?.map((category) => {
                const nameId = `${titleId}-${category.id}-name`;
                const descId = `${titleId}-${category.id}-desc`;
                return (
                  <li key={category.id} className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span id={nameId} className="typography-ui-semibold">
                        {category.title}
                      </span>
                      {category.description ? (
                        <span id={descId} className="typography-ui text-text-subtle">
                          {category.description}
                        </span>
                      ) : null}
                      {category.notice ? (
                        <span data-slot="notice" className={cn('typography-ui text-text-subtle', inlineLink)}>
                          {category.notice}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {category.necessary ? <span className="typography-ui text-text-subtle">{l.cookieAlwaysActive}</span> : null}
                      <Switch
                        checked={category.necessary ? true : Boolean(selection[category.id])}
                        disabled={category.necessary}
                        onCheckedChange={(checked) => {
                          const next = { ...selection, [category.id]: checked };
                          if (!controlled) setDraft(next);
                          onValueChange?.(next);
                        }}
                        aria-labelledby={nameId}
                        aria-describedby={category.description ? descId : undefined}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={cn('typography-ui text-text-subtle', inlineLink)}>{description}</div>
          )}
        </div>
        {inSettings ? (
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="button" variant="outline" onClick={closeSettings}>
              {l.cookieBack}
            </Button>
            <Button type="button" variant="outline" onClick={() => onSave?.({ ...selection })}>
              {l.cookieSaveSelection}
            </Button>
          </div>
        ) : (
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="button" variant={decisionVariant} onClick={onDecline}>
              {l.declineNonEssentialCookies}
            </Button>
            <Button type="button" variant={decisionVariant} onClick={onAccept}>
              {l.acceptAllCookies}
            </Button>
            {onCustomize || hasSettings ? (
              <Button ref={settingsButtonRef} type="button" variant="link" onClick={openSettings}>
                {l.cookieSettings}
              </Button>
            ) : null}
          </div>
        )}
      </section>
    );
  },
);
CookieConsent.displayName = 'CookieConsent';

export { CookieConsent };
