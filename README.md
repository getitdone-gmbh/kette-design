# @getitdone-gmbh/ui

Free React primitives from the Get IT Done design system. They are built on shadcn/ui and Radix UI, styled with Tailwind CSS, written in TypeScript, and they include a light and a dark theme.

We build business software with many screens, tables, forms and states. These primitives are the base layer of that system. We are sharing them in case they are useful to others working on similar products.

## What is included

41 components and their helpers:

Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Command, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Input, Kbd, Label, Navigation Menu, Pagination, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, Toggle Group, Tooltip.

Plus the zero theme as CSS variables (typography, colours, radii, elevation, light and dark) and a Tailwind CSS 3 preset.

## Install

### As an npm package

```bash
npm install @getitdone-gmbh/ui
```

```js
// tailwind.config.cjs
module.exports = {
  presets: [require('@getitdone-gmbh/ui/tailwind/preset')],
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './node_modules/@getitdone-gmbh/ui/dist/**/*.js'],
};
```

```css
/* app.css */
@import '@getitdone-gmbh/ui/theme.css';
@import '@getitdone-gmbh/ui/animation.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@getitdone-gmbh/ui';

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

No Tailwind in your app? Import the prebuilt stylesheet instead: `import '@getitdone-gmbh/ui/styles.css'`.

Dark mode follows the `dark` class on `<html>`, or the system setting when no class is set.

### With the shadcn CLI

Every component is also available from our registry, so you can copy the source into your project and change it:

```bash
npx shadcn@latest add https://zero-design.itdone.de/r/theme.json https://zero-design.itdone.de/r/button.json
```

The `theme` item adds `styles/getitdone/theme.css`, `styles/getitdone/animation.css` and the Tailwind preset in `tailwind/getitdone/` (inside `src/` when your project has one). Import both CSS files in your global CSS and add the preset to `presets` in your Tailwind config, as shown above. Components pull in their helpers automatically.

## The rest of the system

The primitives are one layer. The full design system goes further, from single components to complete application screens and the rules behind them. These parts are not open source, but you can browse all of them:

| Layer | What it is | Browse |
| --- | --- | --- |
| Design system and drafts | UI and UX rules for complex software with dos and don'ts, plus exploratory drafts of real product screens | [zero-design.itdone.de](https://zero-design.itdone.de) |
| Primitives | This package | [components.itdone.de](https://components.itdone.de) |
| Complex application components | Domain components built on the primitives: task boards, time grids, goal and capacity cards, pipelines, file views | [zero.itdone.de](https://zero.itdone.de) |
| Page templates | Complete pages: app frame, dashboard, data grid, guided processes, settings, calendar, mobile, with a build guide per page | [zero-pages.itdone.de](https://zero-pages.itdone.de) |

Licences for the complete chain (tokens, primitives, domain components, page templates, Figma files and the rule set) are available through [Die Kette](https://kette.itdone.de).

## Development

```bash
npm install
npm run typecheck
npm run build
```

## Licence

MIT, see [LICENSE](LICENSE). Parts are derived from shadcn/ui, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Made by [Get IT Done GmbH](https://itdone.de). Questions and feedback are welcome as GitHub issues.
