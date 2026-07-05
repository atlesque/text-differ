export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system',
    fallback: 'light',
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
