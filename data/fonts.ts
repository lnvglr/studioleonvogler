export interface FontVariant {
  id: string
  name: string
  weight: number | string
  style: 'normal' | 'italic'
  file: string
}

export interface Font {
  id: string
  name: string
  description: string
  designer?: string
  variants: FontVariant[]
  supportedLanguages?: string[]
  sampleText?: {
    short: string
    long: string
    words: string[]
  }
}

export const fonts: Font[] = [
  {
    id: 'gramatika',
    name: 'Gramatika',
    description: 'A versatile sans-serif typeface with clean, modern characteristics.',
    variants: [
      {
        id: 'gramatika-regular',
        name: 'Regular',
        weight: 400,
        style: 'normal',
        file: '/fonts/Gramatika-Regular.woff2',
      },
      {
        id: 'gramatika-medium',
        name: 'Medium',
        weight: 500,
        style: 'normal',
        file: '/fonts/Gramatika-Medium.woff2',
      },
      {
        id: 'gramatika-bold',
        name: 'Bold',
        weight: 700,
        style: 'normal',
        file: '/fonts/Gramatika-Bold.woff2',
      },
    ],
    supportedLanguages: ['English', 'Latin'],
    sampleText: {
      short: 'The quick brown fox jumps over the lazy dog',
      long: 'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing. The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process.',
      words: ['Typography', 'Design', 'Letterforms', 'Spacing', 'Legibility', 'Readability'],
    },
  },
  {
    id: 'heebo',
    name: 'Heebo',
    description: 'A Hebrew typeface designed for digital screens with excellent legibility.',
    variants: [
      {
        id: 'heebo-regular',
        name: 'Regular',
        weight: 400,
        style: 'normal',
        file: '/fonts/Heebo-Regular.woff2',
      },
      {
        id: 'heebo-medium',
        name: 'Medium',
        weight: 500,
        style: 'normal',
        file: '/fonts/Heebo-Medium.woff2',
      },
    ],
    supportedLanguages: ['Hebrew', 'English'],
    sampleText: {
      short: 'השועל החום המהיר קופץ מעל הכלב העצלן',
      long: 'טיפוגרפיה היא האמנות והטכניקה של סידור אותיות כדי להפוך שפה כתובה לקריאה, קריאה ומושכת כאשר היא מוצגת. סידור האותיות כולל בחירת גופנים, גדלי נקודות, אורכי שורות, ריווח שורות וריווח אותיות.',
      words: ['טיפוגרפיה', 'עיצוב', 'צורות אותיות', 'ריווח', 'קריאות'],
    },
  },
  {
    id: 'diode-global-next',
    name: 'Diode Global New',
    description: 'A multi-script variable typeface created in research into typographic hierarchies in Israeli public space. Supports English, Hebrew, Arabic, Cyrillic, Greek, Georgian, and N\'Ko with equal visual weight.',
    variants: [
      {
        id: 'diode-variable',
        name: 'Variable',
        weight: '100 900',
        style: 'normal',
        file: '/fonts/DiodeGlobalNewVF.ttf',
      },
    ],
    supportedLanguages: ['English', 'Hebrew', 'Arabic', 'Latin', 'Cyrillic', 'Greek', 'Georgian', 'N\'Ko'],
    sampleText: {
      short: 'The quick brown fox jumps over the lazy dog',
      long: 'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing. The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process.',
      words: ['Typography', 'Multi-script', 'Variable', 'Hierarchy', 'Public Space', 'Design'],
    },
  },
  {
    id: 'seoul-grotesk',
    name: 'Seoul Grotesk',
    description: 'A Hebrew typeface inspired by hangul grotesk typefaces. This typeface emerged from recreating Korean snack designs in Hebrew, translating the bold, playful grotesk quality of hangul into a Hebrew typeface that bridges two typographic traditions.',
    variants: [
      {
        id: 'seoul-variable',
        name: 'Variable',
        weight: '100 900',
        style: 'normal',
        file: '/fonts/SeoulGrotesqueVF.ttf',
      },
    ],
    supportedLanguages: ['Hebrew', 'English', 'Latin'],
    sampleText: {
      short: 'השועל החום המהיר קופץ מעל הכלב העצלן',
      long: 'טיפוגרפיה היא האמנות והטכניקה של סידור אותיות כדי להפוך שפה כתובה לקריאה, קריאה ומושכת כאשר היא מוצגת. סידור האותיות כולל בחירת גופנים, גדלי נקודות, אורכי שורות, ריווח שורות וריווח אותיות.',
      words: ['טיפוגרפיה', 'עיצוב', 'צורות אותיות', 'ריווח', 'קריאות', 'גרוטסק'],
    },
  },
]

export function getFontById(id: string): Font | undefined {
  return fonts.find((f) => f.id === id)
}

export function getFontVariant(fontId: string, variantId: string): FontVariant | undefined {
  const font = getFontById(fontId)
  if (!font) return undefined
  return font.variants.find((v) => v.id === variantId)
}
