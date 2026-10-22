# @getitdone-gmbh/kette-design

[![npm](https://img.shields.io/npm/v/@getitdone-gmbh/kette-design?label=npm&color=cb3837)](https://www.npmjs.com/package/@getitdone-gmbh/kette-design) [![license](https://img.shields.io/npm/l/@getitdone-gmbh/kette-design)](LICENSE)

Free React components from the Get IT Done design system: the primitives plus the general components we build business software with. They are built on shadcn/ui and Radix UI, styled with Tailwind CSS, written in TypeScript, and they include a light and a dark theme.

We build business software with many screens, tables, forms and states. These components are the base layer of that system. We are sharing them in case they are useful to others working on similar products.

## Editions

| Edition | What you get | Licence | Where |
| --- | --- | --- | --- |
| **Community** | This package: 127 components, the zero theme and a Tailwind preset | MIT, free | [npm](https://www.npmjs.com/package/@getitdone-gmbh/kette-design) |
| **Enterprise (Die Kette)** | The complete chain: all components, design tokens, domain components, page templates, Figma files, agents and the rule set | Commercial, with every Die Kette licence | [kette.itdone.de](https://kette.itdone.de) |

## What is included

127 components: 40 primitives and 87 general components, plus the `useToast` hook, German and English labels and their helpers.

**Primitives (40):** Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Command, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Input, Kbd, Label, Navigation Menu, Pagination, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, Toggle Group, Tooltip.

**General components (87):** Action Bar, Activity Feed (Timeline, Notification List), Autosave Status, Blockquote, Bottom Navigation, Button Close, Button Group, Calendar Grid (Week Grid, Month Grid), Card Default, Cell Grid, Charts (line and bar, pie, radar, histogram, treemap, sparkline, bar list, gauge), Chat Window, Checkbox Group, Chip, Code Snippet, Color Picker, Confirm Dialog, Content Divider, Cookie Consent, Countdown, Data Grid, Data State Panel, Date Picker, Description List (Attributes, Summary List), Design System Provider, Document Surface, Empty State, Facet Filter, Featured Icon, Feed Item, File Icon, File Upload, Filter Chip Bar, Form Section, Grid, Heatmap, Help Icon, Hero Section, Illustration, Inline CTA, Inline Edit, Input Digit, Kanban (with Move To Menu), Layout (Stack, Cluster, Tile Grid, Split View), Link, Link Card, List, List Item, Loading Overlay, Loading Spinner, Logo Tile, Message, Metric (KPI Strip), Metric Panel, Multiselect, Notification, Notification Matrix, Object Icon, Page Header, Pagination Dot Group, Phone Input, Progress Circle, Radio Cards, Rating Input, Rich Text Editor, Rich Text Toolbar, Secondary Nav, Secret Field, Section, Section Footer, Section Header, Section Label, Sidebar, Sidebar Nav, Signature Box, Signature Pad, Single Select, Spacing (Spacing, Spacer), Status Dot, Step Marker, Stepper, Table Cells, Table of Contents, Tag Input, Top Bar, Verified Tick, Versions.

Plus the zero theme as CSS variables (typography, colours, radii, elevation, light and dark) and a Tailwind CSS 3 preset.

Every component with a story in the library comes with it: 128 story files with 1027 stories, see [Storybook](#storybook).

The library and token versions each release is synced from are listed in one place, the [sync history](docs/MAINTAINING.md#sync-history). What changed per release is in [CHANGELOG.md](CHANGELOG.md).

## Install

### As an npm package

```bash
npm install @getitdone-gmbh/kette-design
```

```js
// tailwind.config.cjs
module.exports = {
  presets: [require('@getitdone-gmbh/kette-design/tailwind/preset')],
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@getitdone-gmbh/kette-design/dist/**/*.js'],
};
```

```css
/* app.css */
@import '@getitdone-gmbh/kette-design/theme.css';
@import '@getitdone-gmbh/kette-design/animation.css';
/* Only needed for DocumentSurface: keeps the paper light inside a dark app. */
@import '@getitdone-gmbh/kette-design/document-surface.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@getitdone-gmbh/kette-design';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Atlas</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Open</Button>
      </CardContent>
    </Card>
  );
}
```

No Tailwind in your app? Import the prebuilt stylesheet instead: `import '@getitdone-gmbh/kette-design/styles.css'`.

Dark mode follows the `dark` class on `<html>`, or the system setting when no class is set.

`PhoneInput` shows country flags from `/flags/<code>.svg`. Copy `node_modules/@getitdone-gmbh/kette-design/flags` into your public folder, or point `flagBasePath` to where you serve them. Missing flags are hidden.

`MultiSelect` and `SingleSelect` open only inside a `MultiSelectProvider` or `SingleSelectProvider` (one per page is enough, it keeps a single list open at a time).

Texts are English by default. Wrap your app in `<DesignSystemProvider locale="de">` for German, or pass your own labels.

### With the shadcn CLI

Every component is also available from our registry, so you can copy the source into your project and change it:

```bash
npx shadcn@latest add https://zero-design.itdone.de/r/theme.json https://zero-design.itdone.de/r/button.json
```

The `theme` item adds `styles/getitdone/theme.css`, `styles/getitdone/animation.css`, `styles/getitdone/document-surface.css` and the Tailwind preset in `tailwind/getitdone/` (inside `src/` when your project has one). Import both CSS files in your global CSS and add the preset to `presets` in your Tailwind config, as shown above. Components pull in their helpers automatically.

## The rest of the system

This package is one layer. The full design system goes further, from single components to complete application screens and the rules behind them. These parts are not open source, but you can browse all of them:

| Layer | What it is | Browse |
| --- | --- | --- |
| Design system and drafts | UI and UX rules for complex software with dos and don'ts, plus exploratory drafts of real product screens | [zero-design.itdone.de](https://zero-design.itdone.de) |
| Primitives | The full primitive library this package is taken from, with every variant and state as a story | [components.itdone.de](https://components.itdone.de) |
| Complex application components | Domain components built on the primitives: task boards, time grids, goal and capacity cards, pipelines, file views | [zero.itdone.de](https://zero.itdone.de) |
| Page templates | Complete pages: app frame, dashboard, data grid, guided processes, settings, calendar, mobile, with a build guide per page | [zero-pages.itdone.de](https://zero-pages.itdone.de) |

The complete chain (tokens, primitives, domain components, page templates, Figma files and the rule set) is the Enterprise edition, available through [Die Kette](https://kette.itdone.de).

## Storybook

The stories sit next to the components (`src/components/ui/**/*.stories.tsx`). They are not part of the npm package or the shadcn registry. Start Storybook locally, with light and dark mode and German or English labels in the toolbar:

```bash
npm install
npm run storybook
```

`npm run build-storybook` writes a static build to `storybook-static/`. The complete documentation of the full library is at [components.itdone.de](https://components.itdone.de).

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run build-storybook
```

## Licence

MIT, see [LICENSE](LICENSE). Parts are derived from shadcn/ui, and the country flags come from flag-icons (MIT), see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Made by [Get IT Done GmbH](https://itdone.de). Questions and feedback are welcome as GitHub issues.
