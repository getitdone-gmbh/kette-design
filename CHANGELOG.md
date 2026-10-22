# Changelog

This package is a copy of the general components of the Get IT Done design system. Each release names the library and token versions it was synced from. Only changes to components that are part of this package are listed.

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
