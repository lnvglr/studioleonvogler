import { ref, onMounted } from 'vue'

export function useFontLoading() {
  const fontsLoaded = ref(false)
  const fontsLoading = ref(true)

  const checkFontsLoaded = async () => {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      // Fallback for browsers without Font Loading API
      fontsLoaded.value = true
      fontsLoading.value = false
      return
    }

    try {
      // List of fonts to check
      const fontsToCheck = [
        'Gramatika',
        'Heebo',
        'Diode Global New',
        'Seoul Grotesk'
      ]

      // Check each font
      const fontChecks = fontsToCheck.map(fontName => {
        return (document as any).fonts.check(`12px "${fontName}"`)
      })

      // Wait a bit for fonts to start loading
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if all fonts are loaded
      const allLoaded = fontChecks.every(loaded => loaded)

      if (allLoaded) {
        fontsLoaded.value = true
        fontsLoading.value = false
      } else {
        // Wait for fonts to load using Font Loading API
        const fontPromises = fontsToCheck.map(fontName => {
          try {
            return (document as any).fonts.load(`12px "${fontName}"`)
          } catch (e) {
            return Promise.resolve()
          }
        })

        await Promise.all(fontPromises)
        
        // Double check after loading
        const recheck = fontsToCheck.map(fontName => {
          return (document as any).fonts.check(`12px "${fontName}"`)
        })
        
        fontsLoaded.value = recheck.every(loaded => loaded)
        fontsLoading.value = false
      }
    } catch (error) {
      console.warn('Error checking font loading:', error)
      // Fallback: assume fonts are loaded after a timeout
      setTimeout(() => {
        fontsLoaded.value = true
        fontsLoading.value = false
      }, 1000)
    }
  }

  const waitForFont = async (fontName: string): Promise<boolean> => {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      return true
    }

    try {
      // Check if font is already loaded
      if ((document as any).fonts.check(`12px "${fontName}"`)) {
        return true
      }

      // Wait for font to load
      await (document as any).fonts.load(`12px "${fontName}"`)
      
      // Verify it's loaded
      return (document as any).fonts.check(`12px "${fontName}"`)
    } catch (error) {
      console.warn(`Error loading font ${fontName}:`, error)
      return false
    }
  }

  onMounted(() => {
    checkFontsLoaded()
  })

  return {
    fontsLoaded,
    fontsLoading,
    checkFontsLoaded,
    waitForFont
  }
}
