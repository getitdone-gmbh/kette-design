# Maintaining @getitdone-gmbh/kette-design

This repo is the free MIT core of the Get IT Done design system. It is a copy, not a source.

- **Source of truth:** the private `getitdone-gmbh/component-library-react`. Never change a component here first.
- **Owner of the sync:** the agent `design-system-release-engineer`. Decision record: `getitdone-gmbh/company-playbook/decisions/0004-freier-kern-ui.md`.
- **Monitoring:** `design-system-atlas-keeper` lists this package in the atlas and flags it when it lags behind the library.

## Sync after every library release

1. Note the library version you sync from (e.g. `0.26.7`) and the token version (`@getitdone-gmbh/figma-design-tokens`).
2. Copy the changed files of every component already in `src/components/ui/` from the library's `@/components/ui/`. Keep the import closure; no domain logic, no client names, no zero components.
   Then sync the stories: `npm run sync:stories -- <path to a component-library-react checkout at the release tag>`. The script replaces all `*.stories.tsx` in `src/components/ui/` with the library's stories of every component that exists here, skips stories that import components or packages ui does not have (it prints the list), applies the story cuts in `scripts/sync-stories.mjs` (for example the Score Ring story in Progress Circle) and moves the example data to the shared cast. When a story with new names, companies or a new cut shows up, extend the cast table or the patches in the script, never edit a story by hand. Stories stay out of `dist/`, the npm package and the registry.
3. Copy the theme: `styles/theme.css` and `tailwind/` from the token package's `theme_shadcn_zero` output at that token version.
4. Example data uses the shared fictional cast (Nordwind Handel, Tobias Lindner, Lena Hartmann, Example Studio, `@example.com`).
5. `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run build-storybook` all green locally. Open a few stories of the build in light and dark mode.
6. Bump the version in `package.json` (minor for new components, patch otherwise), update the component and story counts in `README.md`, commit as Alexander Friedl, push once.
7. Rebuild the shadcn registry with `npm run registry:build` and publish `public/r` to the itdone app `zero-design-public` (served at `zero-design.itdone.de/r`).
8. Ask Alex to publish: `npm publish --registry=https://registry.npmjs.org` in his own terminal (browser confirmation, no OTP app). Verify with `curl -s https://registry.npmjs.org/@getitdone-gmbh%2fkette-design` that `dist-tags.latest` is the new version. After the first release under the new name, deprecate the old package once: `npm deprecate @getitdone-gmbh/ui "Moved to @getitdone-gmbh/kette-design" --registry=https://registry.npmjs.org`.
9. Tag `vX.Y.Z` and create the GitHub release only after npm shows the new version.
10. Tell the atlas keeper so the atlas shows the new state.

## Sync history

| kette-design | component-library-react | figma-design-tokens | Notes |
| --- | --- | --- | --- |
| 0.3.0 (main, no release) | 0.26.7 | 5.5.0 | Storybook added: 128 story files with 1015 stories from the library, synced by `scripts/sync-stories.mjs`. Skipped because the component is not in this package: Blind Mode Toggle, Button App Store, Button Social (2), CV Stream, Project Card, Score Breakdown, Score Ring, Skill Tree. Cut: Score Ring story in Progress Circle, recharts bar chart in Drawer (now Sparkline). Example data moved to the shared cast. |
| 0.3.0 | 0.26.7 | 5.5.0 | Theme roles data rose, surface inverse static, text on inverse static, monospace stack; new props in Cookie Consent (initialConsent, value, onValueChange), Top Bar mobile menu (collapsible, footer), Message inverse static tone; example data on the shared cast. The Tailwind preset lists the windows-95 theme (part of the token preset); `styles/theme.css` stays zero only. Published as `@getitdone-gmbh/ui`; renamed afterwards to `@getitdone-gmbh/kette-design` (repo `getitdone-gmbh/kette-design`), the version stays 0.3.0 until the next release. |
| 0.2.0 | ~0.26.4 | 5.2.0 | 87 general components added. |
