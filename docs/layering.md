# Layering (z-index)

One order for every fixed or overlay component. Use the token utilities (`z-sticky`, `z-chrome`, `z-banner`, `z-sheet`, `z-dialog`, `z-dropdown`, `z-toast`, `z-tooltip`), never a raw number of 40 or more. A test (`src/lib/z-layers.test.ts`) enforces this. The values come from the theme (`styles/theme.css`, `--z-*`).

| Layer | Utility | Value | Components |
| --- | --- | --- | --- |
| Content | `z-base`, `z-raised` | 0, 1 | pinned table columns, chart and message highlights, NavigationMenu indicator |
| Page chrome | `z-sticky`, `z-chrome` | 10, 30 | sticky table header (`z-sticky`), fixed sidebar (`z-chrome`). Put `sticky top-0 z-chrome` on your own app header or TopBar. |
| Banners | `z-banner` | 40 | CookieConsent, floating ChatWindow |
| Sheet | `z-sheet` | 50 | Sheet, Drawer (`sheet-2` 51 and `sheet-3` 52 for nested sheets) |
| Dialog | `z-dialog` | 60 | Dialog, Command dialog, LoadingOverlay, HoverCard backdrop |
| Menus and popovers | `z-dropdown` | 65 | Popover, DropdownMenu, Select, TagInput, HoverCard, the open NavigationMenu panel (portal) |
| Toast | `z-toast` | 70 | Toast viewport |
| Tooltip | `z-tooltip` | 80 | Tooltip |

Rules:

- Page chrome < banners < modal layers (sheet, dialog) < popovers and menus < toast < tooltip.
- A modal layer always covers the banner, so the banner can never hide a focused element inside an open sheet or dialog (WCAG 2.4.11). Radix also marks the content behind a modal as inert, so the banner is not reachable by keyboard while a modal is open.
- Popovers and menus sit above dialogs, so a menu opened inside a dialog is not clipped.
- Consumers must not wrap a banner or a menu in their own `z-index` above 40. Put the banner in normal flow of the app shell and let the component set its layer.

Both `--z-banner` (40) and `--z-chrome` (30) come from the theme; there are no fallback values in this package.
