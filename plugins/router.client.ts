export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return
  
  const router = nuxtApp.$router
  
  // Intercept navigation attempts to .js files and other static assets
  // This prevents Vue Router warnings for external requests (like browser extensions)
  const originalPush = router.push
  const originalReplace = router.replace
  
  router.push = function(to: any) {
    const path = typeof to === 'string' ? to : to?.path || ''
    // If the path ends with static file extensions, ignore it
    if (/\.(js|css|json|xml|txt|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(path)) {
      return Promise.resolve()
    }
    return originalPush.call(this, to)
  }
  
  router.replace = function(to: any) {
    const path = typeof to === 'string' ? to : to?.path || ''
    // If the path ends with static file extensions, ignore it
    if (/\.(js|css|json|xml|txt|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(path)) {
      return Promise.resolve()
    }
    return originalReplace.call(this, to)
  }
  
  // Suppress Vue Router warnings for static file requests
  const originalWarn = console.warn
  console.warn = function(...args: any[]) {
    const message = args[0]?.toString() || ''
    // Only suppress warnings about unmatched routes for static file extensions
    if (message.includes('No match found for location')) {
      const pathArg = args.find(arg => typeof arg === 'string' && arg.includes('/'))
      if (pathArg && /\.(js|css|json|xml|txt|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(pathArg)) {
        return // Suppress this specific warning
      }
    }
    originalWarn.apply(console, args)
  }
})
