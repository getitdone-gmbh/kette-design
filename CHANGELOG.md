# Changelog

This package is a copy of the general components of the Get IT Done design system. Each release names the library and token versions it was synced from. Only changes to components that are part of this package are listed.

## 0.3.7

Synced from component-library-react 0.26.23 and figma-design-tokens 5.16.0 (was 0.26.22 and 5.15.0).

### Components

- **`NavigationMenu` placement**: the open panel is placed on the first open, when its content changes, on window resize and on page scroll. Before, it moved only on resize.
- **`NavigationMenu` layer**: the open panel renders in a portal on `body` on the dropdown layer (`z-dropdown`, 65), so a header on the chrome layer no longer clips it and a cookie banner (`z-banner`, 40) can no longer cover its last rows. The viewport anchor is now `position: fixed` with viewport coordinates for `left` and `top` (before: an offset from the root). A header that wrapped the panel in its own `z-index` or a resize workaround can drop it.
- **`NavigationMenu` height**: the panel is capped to the viewport height below the trigger minus `collisionPadding` (`--navigation-menu-available-height`) and scrolls inside, reachable by keyboard.
- **Page chrome layer**: the fixed `Sidebar` uses `z-chrome` (30, was a raw 30). Put `sticky top-0 z-chrome` on your own app header or `TopBar`.
- **Sticky bars in `Sheet`, `Dialog` and `Drawer`**: a sticky or fixed `SheetHeader`, `SheetFooter`, `DialogHeader`, `DialogFooter`, `DrawerHeader` or `DrawerFooter` reports its height as `--sticky-inset-top` or `--sticky-inset-bottom` on the content. The content panel, `SheetBody` and `DialogBody` use it as scroll padding, so a focused element is never hidden under the bar (WCAG 2.4.11). A bar in normal flow adds no padding. The six parts now forward a `ref`. New helper `src/lib/sticky-inset.ts`, in the shadcn registry as `sticky-inset` (pulled in by `sheet`, `dialog` and `drawer`).
- **Focus return**: an opener that is re-created with a new key while a controlled overlay is open gets focus back on close. It is found again by id, else by tag, accessible name and text.
- Tests: `navigation-menu.test.tsx`, `src/lib/overlay-behaviour.test.tsx`, `src/lib/css-selectors.test.ts`, `src/lib/z-layers.test.ts` (chrome layer), `src/lib/icon-stroke.test.tsx`.

### Theme and Tailwind preset

- New token from 5.16.0: `--z-chrome` (30, `z-chrome`).
- **Fix: malformed selector in `dist/styles.css` and the preset.** The 2.25 rule for 12px glyphs is now three rules with one selector each, and the size classes are matched as `[class~='h-icon-2xs']` and `[class~='size-icon-2xs']`. Before, Tailwind treated the class selector in the base rule as a utility and re-emitted it under `[&>svg]:h-icon-2xs`, which produced the dead selector `...h-icon-2xs>svgsvg.lucide`. The new test `src/lib/css-selectors.test.ts` builds the package CSS and parses every selector. `postcss-selector-parser` is a new dev dependency for that test.

### Stories

- New: Dialog `StickyHeaderAndFooter`, Navigation Menu `LongPanelAboveBanner`, Sheet `StickyHeaderReverseTab`. 128 story files with 1027 stories.

## 0.3.6

Synced from component-library-react 0.26.22 and figma-design-tokens 5.15.0 (was 0.26.18 and 5.13.0).

### Components

- **`LogoTile` initials** use the logo tile font sizes and weight 700 (`font-bold`): `xs` (24px) `text-logo-tile-24` (11px), `sm` (32px) `text-logo-tile-32` (13px), `md` (40px) `text-logo-tile-40` (16px). Was the avatar-xs role (10px, weight 600) for `xs` and the ui-semibold role (weight 600) for `sm` and `md`. `DescriptionList` uses `LogoTile` and follows.
- **`Sidebar` workspace switcher**: the trigger logo (24px) uses `rounded-logo-tile-24 text-logo-tile-24` instead of `rounded-[6px]` and `text-micro` (same pixels, weight 700). The menu item logo (20px) uses `rounded-logo-tile-20 text-logo-tile-20 font-bold leading-none` (radius 5, 10px, weight 700), was `rounded-item text-micro`.
- **`CookieConsent`**: `titleAs` also accepts `p` (new exported type `CookieConsentTitleTag`, `HeadingTag | 'p'`). With `titleAs="p"` the banner title is a plain paragraph, the region keeps its accessible name and the banner adds no heading to the page. Default stays `h2`.
- **Layering**: one z-index order for fixed and overlay components, see `docs/layering.md`. Page chrome (below 40), banners (40), sheet (50), dialog (60), menus and popovers (65), toast (70), tooltip (80). `CookieConsent` and the floating `ChatWindow` use `z-banner` (40, was 50), so every sheet and dialog now covers them (WCAG 2.4.11). `Sheet` and `Drawer` use `z-sheet`, `Toast` uses `z-toast` (70, was a raw 100), `HoverCard` content uses `z-dropdown` (65, was a raw 250) and its backdrop `z-dialog`, `Table` uses `z-sticky` and `z-raised`, the `NavigationMenu` root and indicator `z-sticky` and `z-raised`. Consumers that wrap a banner in their own z-index above 40 should drop that value.
- **`NavigationMenu`**: the open panel stays inside the viewport. It is shifted left when it would pass the right edge and right when it would pass the left edge. New prop `collisionPadding` (px, default 16) on `NavigationMenu` and `NavigationMenuViewport`. The panel width is capped at the viewport width minus that margin.
- `cn()` knows the `text-logo-tile-20/24/32/40/48` font sizes, so a later text colour class no longer merges them away.
- Tests: Logo Tile, Sidebar logo tiles, Cookie Consent `titleAs="p"`, `navigation-menu.test.tsx`, `src/lib/z-layers.test.ts` (no raw z-index of 40 or more in a component, banner below the modal layers).

### Theme and Tailwind preset

- New tokens from 5.14.0 and 5.15.0: `--fontSize-logo-tile-20` to `-48` (`text-logo-tile-*`), `--borderRadius-logo-tile-20` (`rounded-logo-tile-20`), `--z-banner` (40, `z-banner`).
- Icon stroke: the 2.25 rule for 12px glyphs in this package's preset now has the same `:not([data-stroke="fixed"])` opt-out as the 1.75 rule. Icons marked `data-stroke="fixed"` keep their own stroke inside 12px wrappers.

### Stories

- New: Cookie Consent `TitleAsParagraph` and `BelowOpenSheet`, Navigation Menu `RightAlignedNearEdge`. 128 story files with 1024 stories.

## 0.3.5

Synced from component-library-react 0.26.18 and figma-design-tokens 5.13.0 (was 0.26.16 and 5.12.0).

### Components

- **Behaviour change: `AlertTitle` renders a `<p>`, not an `<h5>`**. An alert title is rarely a real section heading, and the old default caused heading-order skips. The typography stays (`font-semibold leading-none`). `titleAs` still renders any `h1` to `h6`: where the title belongs to the document outline, pass `titleAs="h3"` (or the level that fits the page). Tests or selectors that looked up `role="heading"` for an alert title need `titleAs` or should query the text. `AlertTitleProps` now extends `React.HTMLAttributes<HTMLElement>`, the ref type is `HTMLElement`.
- **`LogoTile` radius is fixed per size** (size x 0.25, as in the prototype): `xs` (24px) `rounded-logo-tile-24` (6px), `sm` (32px) `rounded-logo-tile-32` (8px), `md` (40px) `rounded-logo-tile-40` (10px). Was `rounded-item` for all sizes. The radius no longer follows the theme radius roles; it is 0 in the windows-95 theme. `DescriptionList` uses `LogoTile` and follows.

### Theme and Tailwind preset

- New tokens from 5.13.0: `--borderRadius-logo-tile-24`, `--borderRadius-logo-tile-32`, `--borderRadius-logo-tile-48` next to `--borderRadius-logo-tile-40` (`rounded-logo-tile-24/-32/-40/-48`).
- Icon stroke opt-out: the 1.75 base rule from the token preset is now `:where(svg.lucide[stroke-width="2"]:not([data-stroke="fixed"]))`. An icon that deliberately sets `strokeWidth={2}` keeps stroke 2 with `data-stroke="fixed"`. Specificity stays zero.

## 0.3.4

Synced from component-library-react 0.26.16 and figma-design-tokens 5.12.0 (was 0.26.14 and 5.10.0).

### Components

- **Icon stroke**: lucide icons that keep their default `stroke-width="2"` render with the prototype stroke `var(--size-icon-stroke, 1.75)`, 12px glyphs (`h-icon-2xs`, `size-icon-2xs` or the direct `svg` child of such a wrapper, for example `StepMarker` sm) with `var(--size-icon-stroke-sm, 2.25)`. An explicit `strokeWidth` prop such as `1.5` is kept. Both rules are wrapped in `:where()`, so a utility class still wins. This is a slight visible change: icons are thinner than before (was 2).
- **Check marks**: `Checkbox`, the `CheckboxGroup` card tick, the completed `Stepper` step and `StepMarker` draw the check with `var(--size-icon-stroke-check, 3)`. `Checkbox` now uses the lucide `Check` instead of the Radix check glyph, same 12px (`sm`) and 16px sizes.
- **Navigation icons are 15px** (`icon-nav`): `SecondaryNav` item icons (wrapper and the svg inside it) and the icons in vertical `Tabs` triggers. Was 16px for `SecondaryNav`.

### Theme and Tailwind preset

- New tokens from 5.11.0 to 5.12.0: `--size-icon-nav` (15px, `h-icon-nav`, `w-icon-nav`, `size-icon-nav`), `--size-icon-stroke`, `--size-icon-stroke-sm`, `--size-icon-stroke-check` and the Figma pixel strokes `--size-icon-stroke-px-*`, `--borderRadius-logo-tile-40` (`rounded-logo-tile-40`).
- The preset (`@getitdone-gmbh/kette-design/tailwind/preset`) carries the stroke rules as base styles plus `safelist: ['lucide']`, so apps that build their own Tailwind with the preset get them without importing `styles.css`. The 1.75 rule comes from the token preset, the 2.25 rule for 12px glyphs is added by this package's preset; `dist/styles.css` and Storybook are built from the same preset, so each rule exists exactly once.

## 0.3.3

Synced from component-library-react 0.26.14 and figma-design-tokens 5.10.0 (was 0.26.13 and 5.9.0).

### Components

- **NotificationMatrix**: new `selected` prop on `NotificationMatrixRow` and `NotificationMatrixCell`. A selected row uses the brand row tint `bg-background-selected-row` (also on hover, active and pinned cells), its description switches to `text-text-subtle-on-selected` for AA contrast. The row keeps `data-state="selected"` and `aria-selected`. New story Selected Row.

### Theme

- New roles from tokens 5.10.0: `background-selected-row` and `text-subtle-on-selected` (zero theme, light and dark, also in `document-surface.css`). The Tailwind preset gains `blue.950`.

### Docs

- The README no longer names the synced library and token versions; it links to the sync history in `docs/MAINTAINING.md`.

## 0.3.2

Synced from component-library-react 0.26.13 and figma-design-tokens 5.9.0 (was 0.26.12 and 5.8.0).

### Components

- **Text roles instead of alpha on text**: the new roles `text-text-inverse-subtle` and `text-text-on-inverse-static-subtle` replace the `text-*/NN` alpha colours in `TopBarBrand` (inverse byline), `MetricPanel` (`inverse` muted text; `inverse-fixed` muted text is now `text-text-subtle`), `HeroSection` (inverse supporting text), `CodeSnippet` (inverse gutter and label) and the inverse code highlight palette (comments, punctuation, numbers, properties, variables).
- **Tooltip** and **HelpIcon**: supporting text on the dark tooltip uses `text-text-inverse-subtle`, which restores the hierarchy at AA contrast.
- **Toast**: the destructive close icon uses the full `text-general-error-on` colour.

### Theme

- New roles from tokens 5.9.0: `text-inverse-subtle` and `text-on-inverse-static-subtle` (zero theme, light and dark, also in `document-surface.css`).

## 0.3.1

Synced from component-library-react 0.26.12 and figma-design-tokens 5.8.0 (was 0.26.7 and 5.5.0).

### Components

- **Heading level props** (`titleAs`, default stays the current level): `AlertTitle` (h5), `CardTitle` (h3), `KanbanColumn` (h3), `Attributes` (h3), `SheetSection` (h3), `NotificationList` (h2), `ChatWindow` (h2), `CookieConsent` (h2), `FacetFilter` (h2), `FacetGroup` (h3). New shared type `HeadingTag`.
- **SingleSelect** and **MultiSelect**: single values can be invalid. New option field `invalid`, new props `invalidValues` and `isValueInvalid`. A selected id that is not in `options` is invalid and shown with its id as label. Invalid chips and values use the destructive style, screen readers get the `invalidSuffix` label text, the trigger gets `aria-invalid`.
- **FileIcon**: the document variant has the extension tag across the lower left edge, the tag uses the new `typography-file-tag` role and a solid type colour with the matching `on-default` text in light and dark.
- **FileUploadItem** and **MessageAttachment** show a FileIcon instead of their own round tile. `FileUploadItem` derives the file type from the file name when `kind` is not set and shows the error look for `status="error"`.
- **Accordion**: new `inset` prop on `Accordion` and `AccordionItem`. Inside a `Card` the inset is dropped by default so labels align with the card heading; `inset` overrides either way.
- **KanbanCard**: a grabbed card stays at full opacity and is marked by a dashed focus border (the reduced opacity broke text contrast).
- **KanbanMoveToMenu**: the menu is non-modal, so the board around it is not hidden from assistive technology.
- **BottomNavigationItem** with `count`: the accessible name starts with the visible label, the count is no longer hidden from screen readers.
- **Stepper**, **Tooltip**, **HelpIcon**: supporting text no longer uses reduced opacity, contrast no longer depends on the surface.
- **KpiStrip** `surface="raised"` uses the `bg-surface-strip-raised` role. Rendering is unchanged.
- **TopBarMobileMenu**, **Sheet** and **Dialog** close buttons are a fixed 40x40 in every theme and preset. Items of a non-collapsible menu group get the same indent as an expanded group.

### Theme

- File type colours (`colors.data.file.<type>.default`) are solid and mode-stable, new `on-default` roles for every type. Image is green instead of violet, PDF follows the document colour.
- New roles: `surface-strip-raised`, `typography-file-tag`, `size-textarea-compact`.

### Storybook

- 128 story files with 1020 stories (was 1015): new stories for Accordion in a Card, FileIcon, Multiselect and Single Select invalid values.

## 0.3.0

Synced from component-library-react 0.26.7 and figma-design-tokens 5.5.0. Storybook with the library stories, package renamed from `@getitdone-gmbh/ui` to `@getitdone-gmbh/kette-design`. Theme roles data rose, surface inverse static, text on inverse static, monospace stack. New props in Cookie Consent (`initialConsent`, `value`, `onValueChange`), Top Bar mobile menu (collapsible groups, footer) and the Message inverse static tone.

## 0.2.0

87 general components added (synced from component-library-react 0.26.4 and figma-design-tokens 5.2.0).
