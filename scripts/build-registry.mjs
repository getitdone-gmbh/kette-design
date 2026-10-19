// Generates registry/ sources (alias imports) and registry.json for the shadcn CLI from src/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE_URL = process.env.REGISTRY_URL ?? 'https://zero-design.itdone.de/r';
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const npmDeps = new Set(Object.keys(pkg.dependencies));
const PRIMITIVES = fs
  .readFileSync(path.join(ROOT, 'src/index.ts'), 'utf8')
  .split('\n')
  .map((line) => line.match(/components\/ui\/([\w-]+)'/)?.[1])
  .filter(Boolean);

const outDir = path.join(ROOT, 'registry');
fs.rmSync(outDir, { recursive: true, force: true });

const items = [];
const describe = (name) => name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const collect = (dir, kind) =>
  fs.readdirSync(path.join(ROOT, 'src', dir)).filter((f) => /\.tsx?$/.test(f)).map((f) => ({ dir, kind, file: f, name: f.replace(/\.tsx?$/, '') }));

for (const { dir, kind, file, name } of [...collect('components/ui', 'ui'), ...collect('lib', 'lib')]) {
  const src = fs.readFileSync(path.join(ROOT, 'src', dir, file), 'utf8');
  const internal = new Set();
  const external = new Set();
  // Relative imports become shadcn aliases, so the CLI maps them to the consumer's components.json.
  const rewritten = src.replace(/((?:from|import)\s*\(?\s*['"])([^'"]+)(['"])/g, (all, pre, spec, post) => {
    if (spec.startsWith('.')) {
      const target = path.normalize(path.join(dir, spec));
      const [targetDir, targetName] = [path.dirname(target), path.basename(target)];
      internal.add(targetName);
      return `${pre}${targetDir === 'lib' ? '@/lib' : '@/components/ui'}/${targetName}${post}`;
    }
    const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    if (npmDeps.has(pkgName)) external.add(pkgName);
    return all;
  });
  const target = path.join(outDir, kind, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, rewritten);
  const isPrimitive = PRIMITIVES.includes(name);
  items.push({
    name,
    type: kind === 'ui' ? 'registry:ui' : 'registry:lib',
    title: describe(name),
    description: isPrimitive ? `${describe(name)} from the Get IT Done design system.` : `Helper used by the Get IT Done primitives.`,
    dependencies: [...external].sort(),
    registryDependencies: [...internal].filter((d) => d !== name).sort().map((d) => `${BASE_URL}/${d}.json`).concat(`${BASE_URL}/theme.json`).filter((d) => !(name === 'utils' && d.endsWith('/theme.json'))),
    files: [{ path: `registry/${kind}/${file}`, type: kind === 'ui' ? 'registry:ui' : 'registry:lib' }],
  });
}

// Theme: CSS variables, animations and the Tailwind 3 preset, copied as plain files.
fs.mkdirSync(path.join(outDir, 'theme'), { recursive: true });
for (const f of ['theme.css', 'animation.css']) fs.copyFileSync(path.join(ROOT, 'styles', f), path.join(outDir, 'theme', f));
for (const f of ['preset.cjs', 'tailwind.preset.cjs', 'tailwind.theme.cjs']) fs.copyFileSync(path.join(ROOT, 'tailwind', f), path.join(outDir, 'theme', f));
items.unshift({
  name: 'theme',
  type: 'registry:style',
  title: 'zero theme',
  description: 'CSS variables (light and dark), animations and the Tailwind CSS 3 preset of the Get IT Done design system. Import styles/getitdone/theme.css and animation.css in your global CSS and add tailwind/getitdone/preset.cjs to presets.',
  dependencies: ['tailwindcss-animate', 'tailwindcss-themer', '@tailwindcss/container-queries'],
  files: [
    { path: 'registry/theme/theme.css', type: 'registry:file', target: 'styles/getitdone/theme.css' },
    { path: 'registry/theme/animation.css', type: 'registry:file', target: 'styles/getitdone/animation.css' },
    { path: 'registry/theme/preset.cjs', type: 'registry:file', target: 'tailwind/getitdone/preset.cjs' },
    { path: 'registry/theme/tailwind.preset.cjs', type: 'registry:file', target: 'tailwind/getitdone/tailwind.preset.cjs' },
    { path: 'registry/theme/tailwind.theme.cjs', type: 'registry:file', target: 'tailwind/getitdone/tailwind.theme.cjs' },
  ],
});

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'getitdone',
  homepage: 'https://zero-design.itdone.de',
  items,
};
fs.writeFileSync(path.join(ROOT, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
console.log(`registry.json: ${items.length} items (${PRIMITIVES.length} primitives)`);
