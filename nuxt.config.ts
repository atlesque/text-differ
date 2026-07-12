export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
  devServer: {
    port: 8530,
  },
  compatibilityDate: '2026-07-05',
  vite: {
    optimizeDeps: {
      include: ['diff'],
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
