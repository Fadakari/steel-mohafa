// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image'
  ],
  image: {
    format: ['webp'],
    quality: 90,
    domains: ['images.unsplash.com', 'ui-avatars.com']
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'استیل مهفا',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8055'
    }
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },

  css: ['~/assets/css/main.css'],

  features: {
    inlineStyles: true
  },

  routeRules: {
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  nitro: {
    preset: 'node-server'
  }
})
