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
        await import('~/assets/samsa-core.js')
        Samsa = (window as any).Samsa
      } catch (e) {
        // If import fails, try loading as script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = '/assets/samsa-core.js'
          script.onload = () => {
            Samsa = (window as any).Samsa
            resolve(Samsa)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
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
    const Samsa = await loadSamsa()
    if (!Samsa) return null

    const response = await fetch(fontUrl)
    const arrayBuffer = await response.arrayBuffer()

    const samsaFont = new Samsa({ arrayBuffer })
    await samsaFont.ready

    return samsaFont
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
