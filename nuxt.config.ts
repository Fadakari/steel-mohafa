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
    domains: ['images.unsplash.com', 'ui-avatars.com'],
    ipx: {
      maxAge: 31536000
    }
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
      apiBase: process.env.API_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://cms.mohafa.com' : 'http://localhost:8055')
    }
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  css: ['~/assets/css/main.css'],

  // تغییر بسیار مهم برای رفع خطای Render-blocking در لایت‌هاوس
  features: {
    inlineStyles: true 
  },

  // تنظیمات کش برای تصاویر و فایل‌های استاتیک ناکست روی سرور
  routeRules: {
    '/api/category/**': {
      swr: 60,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
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