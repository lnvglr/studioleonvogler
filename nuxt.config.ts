// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  ssr: false,
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    // 'floating-vue/nuxt'
  ],
  image: {
    // Static provider: images are pre-generated at build time by
    // scripts/optimize-images.mjs and served as plain static files.
    // No runtime IPX processing — no memory growth.
    provider: 'none',
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
  nitro: {
    // Optimize for production deployment
    compressPublicAssets: true,
    minify: true,
    // Ensure links are crawled for SSG
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  app: {
    head: {
      meta: [
        // Enable safe area insets for iOS notch and home bar
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/lv-fav.png' },
        // DNS prefetch for external resources (if any)
        // Preconnect to same origin for faster resource loading
        { rel: 'preconnect', href: '/', crossorigin: 'anonymous' },
      ],
    },
  },
})
