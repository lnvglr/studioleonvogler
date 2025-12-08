// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    // 'floating-vue/nuxt'
  ],
  image: {
    provider: 'ipx',
    format: ['webp'],
    quality: 85,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    densities: [1, 2],
    ipx: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    presets: {
      cover: {
        modifiers: {
          fit: 'cover',
        },
      },
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  router: {
    options: {
      // Suppress warnings for unmatched routes (like static file requests from extensions)
      strict: false,
    },
  },
})
