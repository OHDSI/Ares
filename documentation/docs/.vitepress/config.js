import { defineConfig } from 'vitepress'

export default defineConfig({
  outDir: '../dist',
  lang: 'en-US',
  base: '/Ares/',
  title: 'ARES',
  description: 'A Research Exploration System',

  appearance: 'dark',

  vite: {
    server: {
      host: '0.0.0.0',
    },
  },

  themeConfig: {
    logo: '/icon.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/ares-docs' },
      { text: 'Backend', link: '/backend' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/ares-docs' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Backend API', link: '/backend' },
        ],
      },
    ],

    footer: {
      message: 'Apache 2.0 Licensed',
      copyright: 'Copyright © 2024 OHDSI',
    },
  },
})
