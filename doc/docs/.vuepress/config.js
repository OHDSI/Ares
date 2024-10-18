import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  title: 'Ares',
  description: 'A Research Exploration System',

  theme: defaultTheme({
    logo: '../icon.png',

    navbar: ['/', '/ares-docs'],
    colorMode: 'dark',
    colorModeSwitch: false,

  }),
  bundler: viteBundler(),
})
