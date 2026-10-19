// Builds dist/styles.css for apps without their own Tailwind setup.
module.exports = {
  presets: [require('./tailwind/preset.cjs')],
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
};
