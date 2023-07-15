// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  imports: {
    dirs: [
      'composables',
    ]
  },
  modules: ['@nuxthq/ui'],
    ui: {
    icons: ['heroicons'],
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classPrefix: '',
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config',
    exposeConfig: false,
    exposeLevel: 2,
    config: {},
    injectPosition: 'first',
    viewer: true,
  },
  runtimeConfig: {
      public: {
        INFURA_API_KEY: process.env.NUXT_INFURA_API_KEY,
        INFURA_API_KEY_SECRET: process.env.NUXT_INFURA_API_KEY_SECRET,
      }
  }
})
