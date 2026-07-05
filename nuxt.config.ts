export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  ssr: true,
  devtools: { enabled: true },
  devServer: {
    port: 8530,
  },
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
  compatibilityDate: '2026-07-05',
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
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
