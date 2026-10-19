# Maintaining @getitdone-gmbh/ui

This repo is the free MIT core of the Get IT Done design system. It is a copy, not a source.

- **Source of truth:** the private `getitdone-gmbh/component-library-react`. Never change a component here first.
- **Owner of the sync:** the agent `design-system-release-engineer`. Decision record: `getitdone-gmbh/company-playbook/decisions/0004-freier-kern-ui.md`.
- **Monitoring:** `design-system-atlas-keeper` lists this package in the atlas and flags it when it lags behind the library.

## Sync after every library release

1. Note the library version you sync from (e.g. `0.26.7`) and the token version (`@getitdone-gmbh/figma-design-tokens`).
2. Copy the changed files of every component already in `src/components/ui/` from the library's `@/components/ui/`. Keep the import closure; no domain logic, no client names, no zero components.
3. Copy the theme: `styles/theme.css` and `tailwind/` from the token package's `theme_shadcn_zero` output at that token version.
4. Example data uses the shared fictional cast (Nordwind Handel, Tobias Lindner, Lena Hartmann, Example Studio, `@example.com`).
5. `npm ci`, `npm run typecheck`, `npm test`, `npm run build` all green locally.
6. Bump the version in `package.json` (minor for new components, patch otherwise), update the component counts in `README.md`, commit as Alexander Friedl, push once.
7. Rebuild the shadcn registry with `npm run registry:build` and publish `public/r` to the itdone app `zero-design-public` (served at `zero-design.itdone.de/r`).
8. Ask Alex to publish: `npm publish --registry=https://registry.npmjs.org` in his own terminal (browser confirmation, no OTP app). Verify with `curl -s https://registry.npmjs.org/@getitdone-gmbh%2fui` that `dist-tags.latest` is the new version.
9. Tag `vX.Y.Z` and create the GitHub release only after npm shows the new version.
10. Tell the atlas keeper so the atlas shows the new state.
