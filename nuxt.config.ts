// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  // Disable SSR — all pages are pre-rendered as static HTML at build time
  ssr: false,
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    // 'floating-vue/nuxt'
  ],
  image: {
    // Use 'none' provider for static generation — images are served as-is without
    // a runtime image-processing server (ipx requires a live Node.js process)
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
    // Compress static assets at build time
    compressPublicAssets: true,
    minify: true,
    // Crawl all links so every page is pre-rendered as static HTML
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
