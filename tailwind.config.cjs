// Builds dist/styles.css for apps without their own Tailwind setup.
module.exports = {
  presets: [require('./tailwind/preset.cjs')],
  darkMode: ['class'],
  // Stories are not part of the package CSS.
  content: ['./src/**/*.{ts,tsx}', '!./src/**/*.stories.tsx'],
};
