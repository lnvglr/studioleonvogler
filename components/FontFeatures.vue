<template>
  <section
    v-if="props.font.id === 'diode-global-next' || props.font.id === 'seoul-grotesk'"
    id="features"
    class="w-screen relative -mx-5 sm:-mx-10 md:-mx-20 bg-yellow-400"
  >
    <div class="px-5 sm:px-10 md:px-20 py-8 md:py-12">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        <div class="md:col-span-4">
          <h2 class="text-2xl font-medium mb-4">
            <a href="#features" class="hover:underline">Features</a>
          </h2>
          <p class="text-neutral-800 leading-relaxed">
            {{ font.name }} comes with many OpenType features which can be used to tailor functionality and aesthetics to your specific needs. Some of these features can be combined to form a great number of alternative variations.
          </p>
        </div>
        <div class="md:col-span-8 hidden md:block">
          <h2 class="text-2xl font-medium mb-4">&nbsp;</h2>
          <p
            class="text-white leading-none"
            :style="{
              fontFamily: fontFamily,
              fontSize: '10vw',
              marginTop: '-0.33em',
              marginLeft: '-0.07em',
              fontFeatureSettings: heroFeatureSettings,
            }"
          >
            altG16I
          </p>
        </div>
      </div>

      <hr class="border-t border-neutral-800 my-8" />

      <!-- Feature Table Header -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <div class="md:col-span-2 font-medium text-neutral-900">Feature</div>
        <div class="md:col-span-5 font-medium text-neutral-900">Off</div>
        <div class="md:col-span-5 font-medium text-neutral-900">On</div>
      </div>

      <hr class="border-t border-neutral-800 mb-4" />

      <!-- Feature Rows -->
      <div v-if="features.length > 0" class="space-y-4">
        <div
          v-for="feature in features"
          :key="feature.tag"
          :id="`features/${feature.tag}`"
          class="grid grid-cols-1 md:grid-cols-12 gap-4 py-4"
        >
          <!-- Feature Name Column -->
          <div class="md:col-span-2">
            <div class="flex items-start gap-2 mb-2 flex-wrap">
              <span class="inline-block px-2 py-1 bg-yellow-300 text-black text-xs font-mono font-semibold border border-black">
                {{ feature.tag }}
              </span>
              <span class="font-medium leading-tight">{{ feature.name }}</span>
            </div>
            <p v-if="feature.description" class="text-sm text-neutral-800 mt-2 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>

          <!-- Off Column -->
          <div
            class="md:col-span-5 leading-tight text-neutral-900"
            :style="{
              fontFamily: fontFamily,
              fontWeight: currentWeight,
              fontFeatureSettings: getFeatureSettings(feature.tag, false),
            }"
          >
            <div v-html="feature.exampleText"></div>
          </div>

          <!-- On Column -->
          <div
            class="md:col-span-5 leading-tight text-neutral-900"
            :style="{
              fontFamily: fontFamily,
              fontWeight: currentWeight,
              fontFeatureSettings: getFeatureSettings(feature.tag, true),
            }"
          >
            <div v-html="feature.exampleText"></div>
          </div>

          <hr class="col-span-full border-t border-neutral-800 mt-4" />
        </div>
      </div>
      <div v-else-if="isLoading" class="text-neutral-800 py-8">
        Loading features...
      </div>
      <div v-else class="text-neutral-800 py-8">
        No features found.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Font } from '~/data/fonts'
import { useSamsa } from '~/composables/useSamsa'

interface Props {
  font: Font
}

interface FontFeature {
  tag: string
  name: string
  description?: string
  exampleText: string
  enabledByDefault?: boolean
}

const props = defineProps<Props>()

const { loadFont } = useSamsa()
const features = ref<FontFeature[]>([])
const isLoading = ref(false)

const fontFamily = computed(() => {
  return `"${props.font.name}", system-ui, sans-serif`
})

const currentWeight = computed(() => {
  const variant = props.font.variants[0]
  if (!variant) return 400
  
  // For variable fonts, use middle of range
  if (typeof variant.weight === 'string' && variant.weight.includes(' ')) {
    const [min, max] = variant.weight.split(' ').map(Number)
    return Math.round((min + max) / 2)
  }
  
  return typeof variant.weight === 'number' ? variant.weight : 400
})

// Hardcoded feature metadata for diode-global-next and seoul-grotesk
const featureMetadata: Record<string, Omit<FontFeature, 'tag'>> = {
  calt: {
    name: 'Contextual alternates',
    description: 'Depending on the surrounding context, different glyphs are used. Enabled by default',
    exampleText: `3*9&nbsp; 12:34&nbsp; 3–8&nbsp; +8+x<br>
(SEMI)PER[M]ANE{N}T<br>
-&gt; --&gt; ---&gt; =&gt; ==&gt; &lt;-&gt;<br>
S@N&nbsp; s@n&nbsp; :-)&nbsp; •Smile`,
    enabledByDefault: true,
  },
  dlig: {
    name: 'Discretionary Ligatures',
    description: 'Disabled by default',
    exampleText: `Difficult affine fjord<br>
after affine art interface<br>
ff ffi fft ft fi tt tf df dt ff kf kt rf<br>
rt vf vt wf wt yf yt ¡¿What?!`,
    enabledByDefault: false,
  },
  liga: {
    name: 'Standard Ligatures',
    description: 'Common ligatures like fi, fl, ff. Enabled by default',
    exampleText: `Difficult affine fjord<br>
after affine art interface<br>
ff ffi fft ft fi tt tf df dt`,
    enabledByDefault: true,
  },
  tnum: {
    name: 'Tabular numbers',
    description: 'Fixed-width numbers are useful for tabular data, where comparing columns across rows is desired.',
    exampleText: `0.45, 0.91. +0.08<br>
1.00; 9.44, −0.13<br>
0:00. 1.13; ~7.12`,
    enabledByDefault: false,
  },
  onum: {
    name: 'Oldstyle numbers',
    description: 'Numbers with varying heights, like lowercase letters',
    exampleText: `0.45, 0.91. +0.08<br>
1.00; 9.44, −0.13<br>
0:00. 1.13; ~7.12`,
    enabledByDefault: false,
  },
  frac: {
    name: 'Fractions',
    description: 'Convert spans of numbers & forward slash into fractions',
    exampleText: `1/3&nbsp; 5/12&nbsp; 0123/456789<br>
Approximately 6/16"`,
    enabledByDefault: false,
  },
  case: {
    name: 'Case alternates',
    description: 'Alternate glyphs that matches capital letters and numbers',
    exampleText: `(Hello) [World] {9000}<br>
A@B&nbsp; 3 + 9 ≈ 12 * 1 → X`,
    enabledByDefault: false,
  },
  ccmp: {
    name: 'Compositions',
    description: 'Custom-made glyphs for compositions. Enabled by default',
    exampleText: `j̃&nbsp; ì&nbsp; į́&nbsp; ĵ&nbsp; ī<br>
Figure A⃝ #⃞ 3⃝ ×⃞`,
    enabledByDefault: true,
  },
  sups: {
    name: 'Superscript',
    exampleText: `ABC123abc (+)−[=]`,
    enabledByDefault: false,
  },
  subs: {
    name: 'Subscript',
    exampleText: `ABC123abc (+)−[=]`,
    enabledByDefault: false,
  },
  sinf: {
    name: 'Scientific inferiors',
    description: 'Same as Subscript',
    exampleText: `H2O SF6 H2SO4`,
    enabledByDefault: false,
  },
  dnom: {
    name: 'Denominators',
    exampleText: `ABC1234567890`,
    enabledByDefault: false,
  },
  numr: {
    name: 'Numerators',
    exampleText: `ABC1234567890`,
    enabledByDefault: false,
  },
  zero: {
    name: 'Slashed zero',
    exampleText: `0123`,
    enabledByDefault: false,
  },
  ss01: {
    name: 'Stylistic Set 1',
    exampleText: `1234567890`,
    enabledByDefault: false,
  },
  ss02: {
    name: 'Stylistic Set 2',
    description: 'Alternate glyph set that increases visual difference between similar-looking characters.',
    exampleText: `WP0ACO9XSI1012O9<br>
Illegal busineß βeta`,
    enabledByDefault: false,
  },
  ss03: {
    name: 'Stylistic Set 3',
    description: 'Round quotes & comma',
    exampleText: `I'm not, uhm "smol"`,
    enabledByDefault: false,
  },
  ss04: {
    name: 'Stylistic Set 4',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss05: {
    name: 'Stylistic Set 5',
    description: 'Characters in circles',
    exampleText: `ABC123+→`,
    enabledByDefault: false,
  },
  ss06: {
    name: 'Stylistic Set 6',
    description: 'Characters in squares',
    exampleText: `ABC123+→`,
    enabledByDefault: false,
  },
  ss07: {
    name: 'Stylistic Set 7',
    description: 'Square punctuation',
    exampleText: `Hello, Mästare.!?`,
    enabledByDefault: false,
  },
  ss08: {
    name: 'Stylistic Set 8',
    description: 'Square quotes',
    exampleText: `I'm not, uhm "smol"`,
    enabledByDefault: false,
  },
  ss09: {
    name: 'Stylistic Set 9',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss10: {
    name: 'Stylistic Set 10',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss11: {
    name: 'Stylistic Set 11',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss12: {
    name: 'Stylistic Set 12',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss13: {
    name: 'Stylistic Set 13',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss14: {
    name: 'Stylistic Set 14',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss15: {
    name: 'Stylistic Set 15',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss16: {
    name: 'Stylistic Set 16',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss17: {
    name: 'Stylistic Set 17',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss18: {
    name: 'Stylistic Set 18',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss19: {
    name: 'Stylistic Set 19',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  ss20: {
    name: 'Stylistic Set 20',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv01: {
    name: 'Character Variant 1',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv02: {
    name: 'Character Variant 2',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv03: {
    name: 'Character Variant 3',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv04: {
    name: 'Character Variant 4',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv05: {
    name: 'Character Variant 5',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv06: {
    name: 'Character Variant 6',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv07: {
    name: 'Character Variant 7',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv08: {
    name: 'Character Variant 8',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv09: {
    name: 'Character Variant 9',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv10: {
    name: 'Character Variant 10',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
  cv11: {
    name: 'Character Variant 11',
    exampleText: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
    enabledByDefault: false,
  },
}

// Extract features from font using Samsa
const extractFeaturesFromFont = async () => {
  console.log('[FontFeatures] extractFeaturesFromFont started', {
    fontId: props.font.id,
    fontName: props.font.name,
    variants: props.font.variants
  })
  isLoading.value = true
  
  // Only show features for diode-global-next and seoul-grotesk
  if (props.font.id !== 'diode-global-next' && props.font.id !== 'seoul-grotesk') {
    console.log('[FontFeatures] Font not supported for features:', props.font.id)
    features.value = []
    isLoading.value = false
    return
  }

  if (typeof window === 'undefined') {
    console.log('[FontFeatures] Window is undefined (SSR)')
    isLoading.value = false
    return
  }

  try {
    const fontFile = props.font.variants[0]?.file
    console.log('[FontFeatures] Font file from variant:', fontFile)
    if (!fontFile) {
      console.warn('[FontFeatures] No font file found in variants:', props.font.variants)
      features.value = []
      isLoading.value = false
      return
    }

    const fontUrl = fontFile.startsWith('/') ? fontFile : `/${fontFile}`
    console.log('[FontFeatures] Loading font from URL:', fontUrl)
    const samsaFont = await loadFont(fontUrl)
    
    console.log('[FontFeatures] Samsa font loaded:', {
      hasSamsaFont: !!samsaFont,
      fontKeys: samsaFont ? Object.keys(samsaFont) : null,
      hasTables: samsaFont?.tables ? Object.keys(samsaFont.tables) : null
    })
    
    if (!samsaFont) {
      console.error('[FontFeatures] Failed to load font with Samsa - samsaFont is null/undefined')
      features.value = []
      isLoading.value = false
      return
    }
    
    console.log('[FontFeatures] Checking GSUB table:', {
      hasTables: !!samsaFont.tables,
      hasGSUB: !!samsaFont.tables?.GSUB,
      gsubKeys: samsaFont.tables?.GSUB ? Object.keys(samsaFont.tables.GSUB) : null,
      hasFeatures: !!samsaFont.tables?.GSUB?.features,
      featuresType: typeof samsaFont.tables?.GSUB?.features,
      featuresIsArray: Array.isArray(samsaFont.tables?.GSUB?.features),
      featuresLength: samsaFont.tables?.GSUB?.features?.length
    })
    
    if (!samsaFont.tables?.GSUB?.features) {
      console.error('[FontFeatures] No GSUB features found in font', {
        tables: samsaFont.tables,
        gsub: samsaFont.tables?.GSUB,
        allTableKeys: samsaFont.tables ? Object.keys(samsaFont.tables) : []
      })
      features.value = []
      isLoading.value = false
      return
    }

    const fontFeatures: FontFeature[] = []
    const gsubFeatures = samsaFont.tables.GSUB.features
    console.log('[FontFeatures] Found GSUB features:', {
      count: gsubFeatures.length,
      features: gsubFeatures,
      firstFeature: gsubFeatures[0],
      featureStructure: gsubFeatures.map(f => ({
        tag: f?.tag,
        name: f?.name,
        keys: f ? Object.keys(f) : null
      }))
    })

    for (const feature of gsubFeatures) {
      console.log('[FontFeatures] Processing feature:', feature)
      if (!feature || !feature.tag) {
        console.warn('[FontFeatures] Skipping invalid feature:', feature)
        continue
      }

      const tag = feature.tag.toLowerCase()
      console.log('[FontFeatures] Feature tag:', tag, 'has metadata:', !!featureMetadata[tag])
      const metadata = featureMetadata[tag]

      if (metadata) {
        fontFeatures.push({
          tag,
          name: feature.name || metadata.name,
          description: metadata.description,
          exampleText: metadata.exampleText,
          enabledByDefault: metadata.enabledByDefault,
        })
        console.log('[FontFeatures] Added feature with metadata:', tag)
      } else {
        // Unknown feature - add with generic info
        fontFeatures.push({
          tag,
          name: feature.name || `Feature ${tag}`,
          exampleText: `Sample text for ${tag}`,
          enabledByDefault: false,
        })
        console.log('[FontFeatures] Added feature without metadata:', tag)
      }
    }

    // Sort features: common ones first, then stylistic sets, then character variants
    fontFeatures.sort((a, b) => {
      const order = ['calt', 'liga', 'dlig', 'tnum', 'onum', 'frac', 'case', 'ccmp', 'sups', 'subs', 'sinf', 'dnom', 'numr', 'zero']
      const aIndex = order.indexOf(a.tag)
      const bIndex = order.indexOf(b.tag)
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      
      // Sort ss01-ss20 numerically
      if (a.tag.startsWith('ss') && b.tag.startsWith('ss')) {
        const aNum = parseInt(a.tag.replace('ss', '')) || 0
        const bNum = parseInt(b.tag.replace('ss', '')) || 0
        return aNum - bNum
      }
      
      // Sort cv01-cv99 numerically
      if (a.tag.startsWith('cv') && b.tag.startsWith('cv')) {
        const aNum = parseInt(a.tag.replace('cv', '')) || 0
        const bNum = parseInt(b.tag.replace('cv', '')) || 0
        return aNum - bNum
      }
      
      return a.tag.localeCompare(b.tag)
    })

    console.log('[FontFeatures] Final font features array:', {
      count: fontFeatures.length,
      features: fontFeatures.map(f => f.tag)
    })
    features.value = fontFeatures
    console.log('[FontFeatures] Features value set, count:', features.value.length)
  } catch (error) {
    console.error('[FontFeatures] Failed to extract features from font:', error)
    console.error('[FontFeatures] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    features.value = []
  } finally {
    isLoading.value = false
    console.log('[FontFeatures] extractFeaturesFromFont completed, isLoading:', isLoading.value)
  }
}

// Get font-feature-settings CSS value
const getFeatureSettings = (tag: string, enabled: boolean): string => {
  const value = enabled ? 1 : 0
  
  // For "Off" state, explicitly disable the feature and also disable liga if it's a ligature feature
  if (!enabled && tag === 'dlig') {
		return `'dlig' 0, 'liga' 0`
  }
  
  return `'${tag}' ${value}`
}

// Hero text feature settings (combines multiple features)
const heroFeatureSettings = computed(() => {
  if (features.value.length === 0) {
    return "'cv01' 1, 'cv03' 1, 'cv04' 1, 'cv08' 1, 'cv10' 1, 'cv11' 1, 'ss01' 1, 'ss02' 1, 'dlig' 1"
  }
  
  // Combine some stylistic sets and features for the hero text
  const activeFeatures = features.value
    .filter(f => f.tag.startsWith('ss') || f.tag.startsWith('cv') || f.tag === 'dlig')
    .slice(0, 9)
    .map(f => `'${f.tag}' 1`)
    .join(',')
  
  return activeFeatures || "'ss01' 1, 'ss02' 1, 'dlig' 1"
})

onMounted(async () => {
  await extractFeaturesFromFont()
})

// Watch for font changes
watch(() => props.font.id, async () => {
  await extractFeaturesFromFont()
}, { immediate: false })
</script>
