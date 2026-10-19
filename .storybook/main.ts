import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // Country flags for PhoneInput are served from /flags like in an app (see README).
  staticDirs: ['./public', { from: '../flags', to: '/flags' }],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    // Own Vite config, the root vite.config.ts builds the library (lib mode, type declarations).
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  docs: { autodocs: 'tag' },
  core: { disableTelemetry: true },
};

export default config;
