import { ref, type Ref } from 'vue'

export interface SamsaFontMetrics {
  unitsPerEm: number
  capHeight: number
  xHeight: number
  ascender: number
  descender: number
}

export interface SamsaGlyphOutline {
  path: string
  bbox: { xMin: number; yMin: number; xMax: number; yMax: number }
  controlPoints: Array<{ x: number; y: number; onCurve: boolean }>
}

export function useSamsa() {
  const samsaLoaded = ref(false)
  const samsaInstance = ref<any>(null)

  const loadSamsa = async (): Promise<any> => {
    if (samsaInstance.value) {
      return samsaInstance.value
    }

    if (typeof window === 'undefined') {
      return null
    }

    let Samsa = (window as any).Samsa

    if (!Samsa) {
      try {
        // Import as ES module - samsa-core.js exports SamsaFont
        const samsaModule = await import('~/assets/samsa-core.js') as any
        
        // Check if it exports SamsaFont
        if (samsaModule.SamsaFont) {
          Samsa = samsaModule.SamsaFont
          // Also set it on window for compatibility with other code
          ;(window as any).Samsa = Samsa
        } else {
          // Fallback: check window after import (in case it sets it globally)
          Samsa = (window as any).Samsa
        }
      } catch (e) {
        console.error('[useSamsa] Error loading Samsa:', e);
        // If import fails, try loading as script tag
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = '/assets/samsa-core.js'
            script.type = 'module'
            
            script.onload = () => {
              setTimeout(() => {
                Samsa = (window as any).Samsa
                
                if (!Samsa) {
                  // Try dynamic import as fallback
                  import('~/assets/samsa-core.js').then((module: any) => {
                    if (module.SamsaFont) {
                      Samsa = module.SamsaFont
                      ;(window as any).Samsa = Samsa
                    }
                    resolve()
                  }).catch(reject)
                } else {
                  resolve()
                }
              }, 100)
            }
            script.onerror = reject
            document.head.appendChild(script)
          })
        } catch (scriptError) {
          console.error('[useSamsa] Error loading Samsa as script tag:', scriptError)
        }
      }
    }

    if (Samsa) {
      samsaInstance.value = Samsa
      samsaLoaded.value = true
      return Samsa
    }

    return null
  }

  const loadFont = async (fontUrl: string): Promise<any> => {
    try {
      const Samsa = await loadSamsa()
      if (!Samsa) {
        console.error('[useSamsa] Samsa library not available')
        return null
      }

      const response = await fetch(fontUrl)
      if (!response.ok) {
        console.error('[useSamsa] Failed to fetch font:', response.status, response.statusText)
        return null
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      // SamsaFont requires a callback - wrap it in a promise
      const samsaFont = await new Promise<any>((resolve, reject) => {
        try {
          const font = new Samsa({ 
            arrayBuffer,
            callback: (parsedFont: any) => {
              resolve(parsedFont)
            }
          })
          // Note: parse() is called synchronously in constructor when arrayBuffer is provided
          // The callback will be invoked synchronously, so resolve will be called immediately
        } catch (error) {
          console.error('[useSamsa] Error creating SamsaFont:', error)
          reject(error)
        }
      })
      
      return samsaFont
    } catch (error) {
      console.error('[useSamsa] Error in loadFont:', error)
      console.error('[useSamsa] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return null
    }
  }

  const getFontMetrics = (samsaFont: any): SamsaFontMetrics | null => {
    if (!samsaFont) return null

    const unitsPerEm = samsaFont.head?.unitsPerEm || 1000
    const os2 = samsaFont.os2 || {}
    const hhea = samsaFont.hhea || {}

    const ascender = hhea.ascender ?? os2.sTypoAscender ?? 800
    const descender = Math.abs(hhea.descender ?? os2.sTypoDescender ?? -200)
    const capHeight = os2.sCapHeight ?? os2.capHeight ?? 700
    const xHeight = os2.sxHeight ?? os2.xHeight ?? 500

    return {
      unitsPerEm,
      capHeight: capHeight / unitsPerEm,
      xHeight: xHeight / unitsPerEm,
      ascender: ascender / unitsPerEm,
      descender: descender / unitsPerEm,
    }
  }

  const getGlyphOutline = (samsaFont: any, char: string, tuple?: number[]): SamsaGlyphOutline | null => {
    if (!samsaFont || !char || char === ' ') return null

    try {
      const charCode = char.codePointAt(0) || 0
      const glyphIndex = samsaFont.cmap?.getGlyphIndex?.(charCode) ?? samsaFont.cmap?.glyphIndexMap?.[charCode]
      if (glyphIndex === undefined) return null

      let glyph = samsaFont.getGlyph(glyphIndex)
      if (!glyph) return null

      // For variable fonts, decompose with tuple if provided
      if (glyph.decompose && tuple) {
        try {
          glyph = glyph.decompose(tuple)
        } catch (e) {
          // If decompose fails, use original glyph
        }
      }

      const bbox = glyph.bbox || { xMin: 0, yMin: 0, xMax: 0, yMax: 0 }

      // Get SVG path using samsa's built-in method
      let path = ''
      let controlPoints: Array<{ x: number; y: number; onCurve: boolean }> = []

      if (glyph.svgPath) {
        path = glyph.svgPath()
        // Flip Y axis (font coordinates are bottom-up, SVG is top-down)
        path = path.replace(/([MLQCZ])(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (match: string, cmd: string, x: string, y: string) => {
          return `${cmd}${x} ${-parseFloat(y)}`
        })
      }

      // Extract control points from glyph
      // For variable fonts or composite glyphs, we need to decompose first
      let points: any[] = []
      
      // Try to decompose first (this works for both simple and composite glyphs)
      if (glyph.decompose) {
        try {
          const decomposed = glyph.decompose(tuple || [0])
          if (decomposed && decomposed.points && Array.isArray(decomposed.points)) {
            points = decomposed.points
          }
        } catch (e) {
          // If decompose fails, try getting points directly
          if (glyph.points && Array.isArray(glyph.points)) {
            points = glyph.points
          }
        }
      } else if (glyph.points && Array.isArray(glyph.points)) {
        // Simple glyph - points are directly accessible
        points = glyph.points
      }
      
      // Extract control points
      for (const point of points) {
        if (Array.isArray(point) && point.length >= 2) {
          // Samsa points are arrays: [x, y, onCurve]
          // onCurve: 1 = on curve, 0 = off curve (control point)
          const x = point[0] ?? 0
          const y = point[1] ?? 0
          const onCurve = point[2] === 1
          controlPoints.push({ x, y: -y, onCurve }) // Flip Y axis for SVG
        }
      }

      return {
        path,
        bbox,
        controlPoints,
      }
    } catch (error) {
      console.warn('Failed to get glyph outline:', error)
      return null
    }
  }

  return {
    samsaLoaded,
    loadSamsa,
    loadFont,
    getFontMetrics,
    getGlyphOutline,
  }
}
