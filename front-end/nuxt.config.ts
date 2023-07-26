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
  modules: ['@nuxthq/ui','dayjs-nuxt'],
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
        INFURA_ENDPOINT: process.env.NUXT_INFURA_ENDPOINT,
        INFURA_DEDICATED_GATEWAY_SUBDOMAIN: process.env.NUXT_INFURA_DEDICATED_GATEWAY_SUBDOMAIN,
        ALCHEMY_API_KEY: process.env.NUXT_ALCHEMY_API_KEY,
        ALCHEMY_PROVIDER_NETWORK: process.env.NUXT_ALCHEMY_PROVIDER_NETWORK,
        ETHERSCAN_GOERLI: process.env.NUXT_ETHERSCAN_GOERLI,
        NFT_PROXY_ADDRESS_GOERLI: process.env.NUXT_NFT_PROXY_ADDRESS_GOERLI,
        RENTCAR_PROXY_ADDRESS_GOERLI: process.env.NUXT_RENTCAR_PROXY_ADDRESS_GOERLI,
      }
  }
})
