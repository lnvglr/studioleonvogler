export interface FontVariant {
  id: string
  name: string
  weight: number | string
  style: 'normal' | 'italic'
  file: string
}

export interface FontFeatureMetadata {
  name: string
  description?: string
  exampleText: string
  enabledText?: string
  enabledByDefault?: boolean
  highlighted?: string | string[] // Characters to display at 50% opacity (illustrative only)
  languageTag?: string // For locl feature, specify language tag (e.g., 'BGR' for Bulgarian)
}

export interface Font {
  id: string
  name: string
  description: string
  designer?: string
  variants: FontVariant[]
  supportedLanguages?: string[] | Record<string, string[]>
  sampleText?: {
    short: string
    long: string
    words: string[]
  }
  featureMetadata?: Record<string, FontFeatureMetadata>
  defaultWeight?: number
}

export const fonts: Font[] = [
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
    supportedLanguages: {
      Arabic: [
        "Algerian Arabic",
        "Baharna Arabic",
        "Gulf Arabic",
        "Iraqi Arabic",
        "Libyan Arabic",
        "Moroccan Arabic",
        "North Mesopotamian Arabic",
        "Sanaani Arabic",
        "Standard Arabic",
        "Ta'izzi-Adeni Arabic",
        "Tunisian Arabic"
      ],
      Armenian: [
        "Eastern Armenian",
        "Western Armenian"
      ],
      Cyrillic: [
        "Abaza",
        "Belarusian",
        "Bulgarian",
        "Crimean Tatar",
        "Erzya",
        "Karachay-Balkar",
        "Kumyk",
        "Moksha",
        "Nogai",
        "Russian",
        "Rusyn",
        "Ukrainian"
      ],
      Georgian: [
        "Georgian"
      ],
      Greek: [
        "Modern Greek"
      ],
      Hebrew: [
        "Eastern Yiddish",
        "Hebrew",
        "Western Yiddish"
      ],
      Latin: [
        "Acheron",
        "Afar",
        "Alekano",
        "Amahuaca",
        "Amarakaeri",
        "Amis",
        "Anaang",
        "Andaandi, Dongolawi",
        "Arbëreshë Albanian",
        "Asháninka",
        "Ashéninka Perené",
        "Banjar",
        "Basque",
        "Batak Dairi",
        "Batak Karo",
        "Batak Mandailing",
        "Batak Simalungun",
        "Batak Toba",
        "Bemba (Zambia)",
        "Bena (Tanzania)",
        "Bikol",
        "Bislama",
        "Borana-Arsi-Guji Oromo",
        "Buginese",
        "Candoshi-Shapra",
        "Caquinte",
        "Caribbean Hindustani",
        "Cashibo-Cacataibo",
        "Cebuano",
        "Central Aymara",
        "Chamorro",
        "Chavacano",
        "Chiga",
        "Chiltepec Chinantec",
        "Chokwe",
        "Crimean Tatar",
        "Danish",
        "Dehu",
        "Eastern Arrernte",
        "Eastern Oromo",
        "English",
        "Fijian",
        "Filipino",
        "Finnish",
        "Garifuna",
        "German",
        "Gheg Albanian",
        "Gilbertese",
        "Gusii",
        "Hani",
        "Hiligaynon",
        "Huastec",
        "Iloko",
        "Indonesian",
        "Ixcatlán Mazatec",
        "Jamaican Creole English",
        "Japanese",
        "K'iche'",
        "Kalaallisut",
        "Kalenjin",
        "Kaonde",
        "Kaqchikel",
        "Kekchí",
        "Kenzi, Mattokki",
        "Khasi",
        "Kimbundu",
        "Kinyarwanda",
        "Kituba (DRC)",
        "Kongo",
        "Konzo",
        "Ladino",
        "Low German",
        "Lozi",
        "Luba-Lulua",
        "Luo (Kenya and Tanzania)",
        "Makonde",
        "Malaysian",
        "Manx",
        "Maore Comorian",
        "Mapudungun",
        "Mauritian Creole",
        "Minangkabau",
        "Murrinh-Patha",
        "Muslim Tat",
        "Mwani",
        "Naga Pidgin",
        "Ndonga",
        "Ngazidja Comorian",
        "Nobiin",
        "Nomatsiguenga",
        "North Azerbaijani",
        "North Ndebele",
        "Northern Qiandong Miao",
        "Northern Uzbek",
        "Nyankole",
        "Ojitlán Chinantec",
        "Orma",
        "Oroqen",
        "Pampanga",
        "Papantla Totonac",
        "Pichis Ashéninka",
        "Pijin",
        "Pintupi-Luritja",
        "Pipil",
        "Pohnpeian",
        "Purepecha",
        "Quechua",
        "Rotokas",
        "Rundi",
        "Scots",
        "Sena",
        "Seri",
        "Seselwa Creole French",
        "Shawnee",
        "Shipibo-Conibo",
        "Shona",
        "Soga",
        "Somali",
        "Soninke",
        "South Azerbaijani",
        "South Ndebele",
        "Southern Aymara",
        "Southern Qiandong Miao",
        "Southern Sami",
        "Standard Malay",
        "Swahili",
        "Swiss German",
        "Talysh",
        "Tedim Chin",
        "Tok Pisin",
        "Tosk Albanian",
        "Tsakhur",
        "Tumbuka",
        "Tzeltal",
        "Tzotzil",
        "Upper Guinea Crioulo",
        "Waray (Philippines)",
        "Warlpiri",
        "Wayuu",
        "West Central Oromo",
        "Wiradjuri",
        "Xhosa",
        "Yanesha'",
        "Zulu"
      ],
      "N'Ko": [
        "Bambara", "Dyula", "Mandingo", "Maninka", "N'Ko"
        
      ],
    },
    sampleText: {
      short: 'The quick brown fox jumps over the lazy dog',
      long: 'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing. The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process.',
      words: ['Typography', 'Multi-script', 'Variable', 'Hierarchy', 'Public Space', 'Design'],
    },
    defaultWeight: 600,
    featureMetadata: {
      calt: {
        name: 'Contextual alternates',
        description: 'Depending on the surrounding context, different glyphs are used. Enabled by default',
        exampleText: ["See: 13.", "12:34", "<br>", "1+2", "1−2", "1×2", "1÷2", "1=2", "~1", "<br>", "[CALT]", "(BRACKET)", "{BRACE}"].join(' '),
        highlighted: [":", "+", "−", "×", "÷", "=", "~", "[", "(", "{", "]", ")", "}"].join(''),
        enabledByDefault: true,
      },
      jalt: {
        name: 'Justification alternates',
        exampleText: `אדהכלםרת`.split('').join(' '),
        enabledText: `ﬡﬢﬣﬤﬥﬦﬧﬨ`.split('').join(' '),
        enabledByDefault: false,
      },
      tnum: {
        name: 'Tabular numbers',
        description: 'Fixed-width numbers are useful for tabular data, where comparing columns across rows is desired.',
        exampleText: `$11.99; 0:08<br>
$10.71; 1:41<br>
١١٫٩٩$; ٠:٠٨<br>
١٠٫٧١$; ١:٤١`,
        highlighted: "0123456789٠١٢٣٤٥٦٧٨٩",
        enabledByDefault: false,
      },
      locl: {
        name: 'Localized forms',
        description: 'Bulgarian localized glyph forms',
        exampleText: `АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЬЪЮЯабвгдежзийклмнопрстуфхцчшщьъюя`.split('').join(' '),
        highlighted: "ДЛФбвгджзийклптцшщьъю",
        languageTag: 'BGR',
        enabledByDefault: false,
      },
      ss01: {
        name: 'Stylistic Set 1',
        description: 'Alternate glyphs for Arabic letters.',
        exampleText: [
          "جاي",
          "چپ",
          "حبي",
          "خوي",
          "مي",
          "يار",
          "مي"
        ].join(' '),
        highlighted: ["ج", "چ", "ح", "خ", "م", "ي"].join(''),
        enabledByDefault: false,
      },
      
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
    supportedLanguages: {
      Hebrew: [
        "Eastern Yiddish",
        "Hebrew",
        "Western Yiddish"
      ],
    },
    sampleText: {
      short: 'השועל החום המהיר קופץ מעל הכלב העצלן',
      long: 'טיפוגרפיה היא האמנות והטכניקה של סידור אותיות כדי להפוך שפה כתובה לקריאה, קריאה ומושכת כאשר היא מוצגת. סידור האותיות כולל בחירת גופנים, גדלי נקודות, אורכי שורות, ריווח שורות וריווח אותיות.',
      words: ['טיפוגרפיה', 'עיצוב', 'צורות אותיות', 'ריווח', 'קריאות', 'גרוטסק'],
    },
    featureMetadata: {
      jalt: {
        name: 'Justification alternates',
        exampleText: `אדהכלםרת`.split('').join(' '),
        enabledText: `ﬡﬢﬣﬤﬥﬦﬧﬨ`.split('').join(' '),
        enabledByDefault: false,
      },
      liga: {
        name: 'Standard Ligatures',
        description: 'Common ligatures like fi, fl, ff. Enabled by default',
        exampleText: [
          "צצ", "אא", "אאא", "אל", "אש", "<br>", "ה.ת", "ו.ה",
          "י.ות", "י.ת", "י.ו", "ן.ם", "נ.ת", "עי",
          "ת.ד", "י.ו"
        ].join(' '),
        enabledByDefault: true,
      },
      tnum: {
        name: 'Tabular numbers',
        description: 'Fixed-width numbers are useful for tabular data, where comparing columns across rows is desired.',
        exampleText: `₪11.99; 0:08<br>
₪10.71; 1:41<br>
₪29.99; 7:12`,
        highlighted: "0123456789",
        enabledByDefault: false,
      },
      zero: {
        name: 'Slashed zero',
        exampleText: `0123`,
        highlighted: "123",
        enabledByDefault: false,
      },
      ss01: {
        name: 'Stylistic Set 1',
        description: 'Sharper glyph set for otherwise rounder characters.',
        exampleText: `אבגדהוזחטיךכלםמןנסעףפץצקרשת`.split('').join(' '),
        highlighted: "בדהוחיךןסףר",
        enabledByDefault: false,
      },
      ss02: {
        name: 'Stylistic Set 2',
        description: 'Alternate glyph for letters ק and ל.',
        exampleText: `אבגקל`.split('').join(' '),
        highlighted: "אבג",
        enabledByDefault: false,
      },
      ss03: {
        name: 'Stylistic Set 3',
        description: 'Alternate glyph for letter ק.',
        exampleText: `אבגק`.split('').join(' '),
        highlighted: "אבג",
        enabledByDefault: false,
      },
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
