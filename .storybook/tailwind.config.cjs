// Storybook only: same preset as the package, content includes the stories.
module.exports = {
  presets: [require('../tailwind/preset.cjs')],
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'].map((glob) => require('node:path').join(__dirname, '..', glob)),
};
