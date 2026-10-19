import type { Decorator, Preview } from '@storybook/react';
import React, { useEffect } from 'react';

import { DesignSystemProvider } from '../src/components/ui/design-system-provider';

import './preview.css';

// Light and dark come from styles/theme.css: the class on the root element wins over the system setting.
const ThemeDecorator: Decorator = (Story, context) => {
  const mode = context.globals.mode === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.toggle('light', mode === 'light');
    root.style.colorScheme = mode;
  }, [mode]);
  return <Story />;
};

const LocaleDecorator: Decorator = (Story, context) => (
  <DesignSystemProvider locale={context.globals.locale === 'de' ? 'de' : 'en'}>
    <Story />
  </DesignSystemProvider>
);

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    backgrounds: { disable: true },
    options: { storySort: { order: ['Primitives', 'Patterns', '*'] } },
  },
  globalTypes: {
    mode: {
      name: 'Mode',
      description: 'Light or dark',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      name: 'Locale',
      description: 'Language of the built-in texts',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'de', title: 'Deutsch' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [ThemeDecorator, LocaleDecorator],
};

export default preview;
