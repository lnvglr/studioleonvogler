import { ref, type Ref } from 'vue'
import type { SamsaFont } from '~/assets/samsa-core.js'

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



    const unitsPerEm = samsaFont.tables.head.data.unitsPerEm || 1000
    const os2 = samsaFont.tables["OS/2"].data || {}

    const ascender = os2.sTypoAscender ?? 800
    const descender = Math.abs(os2.sTypoDescender ?? -200)
    const capHeight = os2.sCapHeight ?? os2.sCapHeight ?? 700
    const xHeight = os2.sxHeight ?? os2.sxHeight ?? 500

    return {
      unitsPerEm,
      capHeight: capHeight / unitsPerEm,
      xHeight: xHeight / unitsPerEm,
      ascender: ascender / unitsPerEm,
      descender: descender / unitsPerEm,
    }
  }

  const getGlyph = (samsaFont: any, char: string, tuple?: number[]): any | null => {
    if (!samsaFont || !char || char === ' ') return null
    const charCode = char.codePointAt(0) || 0
    const glyphIndex = samsaFont.cmap[charCode]
    if (glyphIndex === undefined) return null
    return samsaFont.glyphs[glyphIndex].instantiate(tuple)
  }

  const getGlyphOutline = (samsaFont: any, char: string, tuple?: number[]): SamsaGlyphOutline | null => {
    if (!samsaFont || !char || char === ' ') return null

    try {
      const charCode = char.codePointAt(0) || 0
      const glyphIndex = samsaFont.cmap[charCode]
      // const glyphIndex = samsaFont.cmap?.getGlyphIndex?.(charCode) ?? samsaFont.cmap?.glyphIndexMap?.[charCode]
      if (glyphIndex === undefined) return null
      
      const glyph = samsaFont.glyphs[glyphIndex]
      if (!glyph) return null
      return glyph
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
    getGlyph,
  }
}
