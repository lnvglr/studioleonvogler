<template>
  <section
    v-if="props.font.id === 'diode-global-next' || props.font.id === 'seoul-grotesk'"
    id="features"
    class="w-screen relative -mx-5 sm:-mx-10 md:-mx-20 bg-yellow-400"
  >
    <div class="px-5 sm:px-10 md:px-20 py-8 md:py-12">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        <div class="md:col-span-8">
          <h2 class="text-2xl font-medium mb-4">
            <a href="#features" class="hover:underline">Features</a>
          </h2>
          <p class="text-neutral-800 leading-relaxed">
            {{ font.name }} comes with many OpenType features which can be used to tailor functionality and aesthetics to your specific needs. Some of these features can be combined to form a great number of alternative variations.
          </p>
        </div>
      </div>

      <hr class="border-t border-neutral-800 my-8" />

      <!-- Feature Table Header -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 mb-8">
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
          class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 py-4"
        >
          <!-- Feature Name Column -->
          <div class="md:col-span-2">
            <div class="flex items-start gap-2 mb-2 flex-wrap">
              <span class="inline-block px-2 py-1 bg-black/5 text-black text-xs font-mono font-mono">
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
            class="md:col-span-5 leading-tight text-neutral-900 text-5xl break-words"
            :style="{
              fontFamily: fontFamily,
              fontWeight: currentWeight,
              fontFeatureSettings: getFeatureSettings(feature.tag, false),
              fontLanguageOverride: getLanguageOverride(feature.tag, false),
            }"
          >
            <div v-html="getProcessedExampleText(feature)"></div>
          </div>

          <!-- On Column -->
          <div
            class="md:col-span-5 leading-tight text-neutral-900 text-5xl break-words"
            :style="{
              fontFamily: fontFamily,
              fontWeight: currentWeight,
              fontFeatureSettings: getFeatureSettings(feature.tag, true),
              fontLanguageOverride: getLanguageOverride(feature.tag, true),
            }"
          >
            <div v-html="feature.enabledText || feature.exampleText"></div>
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
import type { Font, FontFeatureMetadata } from '~/data/fonts'
import { useSamsa } from '~/composables/useSamsa'

interface Props {
  font: Font
  featureMetadata?: Record<string, FontFeatureMetadata>
}

interface FontFeature {
  tag: string
  name: string
  description?: string
  exampleText: string
  enabledText?: string
  enabledByDefault?: boolean
  languageTag?: string
}

const props = defineProps<Props>()

const { loadFont } = useSamsa()
const features = ref<FontFeature[]>([])
const isLoading = ref(false)

const fontFamily = computed(() => {
  return `"${props.font.name}", system-ui, sans-serif`
})

const currentWeight = computed(() => {
  return props.font.defaultWeight || 400
})

// Use featureMetadata from props, fallback to empty object
const featureMetadata = computed(() => props.featureMetadata || {})
 

// Extract features from font using Samsa
const extractFeaturesFromFont = async () => {
  isLoading.value = true
  
  // Only show features for diode-global-next and seoul-grotesk
  if (props.font.id !== 'diode-global-next' && props.font.id !== 'seoul-grotesk') {
    features.value = []
    isLoading.value = false
    return
  }

  if (typeof window === 'undefined') {
    isLoading.value = false
    return
  }

  try {
    const fontFile = props.font.variants[0]?.file
    if (!fontFile) {
      features.value = []
      isLoading.value = false
      return
    }

    const fontUrl = fontFile.startsWith('/') ? fontFile : `/${fontFile}`
    console.log('[FontFeatures] Loading font:', fontUrl)
    
    let samsaFont
    try {
      samsaFont = await loadFont(fontUrl)
    } catch (error) {
      console.error('[FontFeatures] Error loading font:', error)
      features.value = []
      isLoading.value = false
      return
    }
    
    if (!samsaFont) {
      console.error('[FontFeatures] Failed to load font with Samsa - loadFont returned null')
      features.value = []
      isLoading.value = false
      return
    }
    
    // Debug: Check all possible feature locations
    console.log('[FontFeatures] Font structure:', {
      hasTables: !!samsaFont.tables,
      tableKeys: samsaFont.tables ? Object.keys(samsaFont.tables) : [],
      hasGSUB: !!samsaFont.tables?.GSUB,
      gsubKeys: samsaFont.tables?.GSUB ? Object.keys(samsaFont.tables.GSUB) : null,
      hasFeaturesDirect: !!samsaFont.features,
      featuresDirectLength: samsaFont.features?.length,
      hasFeaturesInGSUB: !!samsaFont.tables?.GSUB?.features,
      featuresInGSUBLength: samsaFont.tables?.GSUB?.features?.length,
      gsubData: samsaFont.tables?.GSUB?.data ? Object.keys(samsaFont.tables.GSUB.data) : null
    })
    
    // Try both locations: font.features (direct) and font.tables.GSUB.features
    let gsubFeatures = samsaFont.features || samsaFont.tables?.GSUB?.features
    
    if (!gsubFeatures) {
      console.error('[FontFeatures] No GSUB features found. Full font object:', {
        fontKeys: Object.keys(samsaFont),
        tables: samsaFont.tables,
        gsub: samsaFont.tables?.GSUB,
        gsubData: samsaFont.tables?.GSUB?.data
      })
      features.value = []
      isLoading.value = false
      return
    }

    console.log('[FontFeatures] Features found:', {
      count: gsubFeatures.length,
      source: samsaFont.features ? 'font.features' : 'font.tables.GSUB.features',
      firstFeature: gsubFeatures[0],
      allTags: gsubFeatures.map(f => f?.tag).filter(Boolean),
      hasJalt: gsubFeatures.some(f => f?.tag?.toLowerCase() === 'jalt'),
      jaltFeature: gsubFeatures.find(f => f?.tag?.toLowerCase() === 'jalt')
    })

    const fontFeatures: FontFeature[] = []

    // Also add features that are in metadata but not found in font (for testing/preview)
    Object.keys(featureMetadata.value).forEach(tag => {
        const metadata = featureMetadata.value[tag]
        console.log('[FontFeatures] Adding feature from metadata (not in font):', tag)
        const fontFeature: FontFeature = {
          tag,
          name: metadata.name,
          description: metadata.description,
          exampleText: metadata.exampleText,
          enabledText: metadata.enabledText,
          enabledByDefault: metadata.enabledByDefault,
        }
        
        if (metadata.languageTag) {
          fontFeature.languageTag = metadata.languageTag
        }
        
        fontFeatures.push(fontFeature)
    })

    console.log('[FontFeatures] Processed features:', {
      total: fontFeatures.length,
      tags: fontFeatures.map(f => f.tag)
    })

    // Sort features: common ones first, then stylistic sets, then character variants
    fontFeatures.sort((a, b) => {
      const order = ['calt', 'liga', 'dlig', 'jalt', 'tnum', 'onum', 'frac', 'case', 'ccmp', 'sups', 'subs', 'sinf', 'dnom', 'numr', 'zero', 'locl']
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

    features.value = fontFeatures
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
  // if (!enabled && tag === 'tnum') {
	// 	return "pnum"
  // }
  
  return `'${tag}' ${value}`
}

// Get font-language-override CSS value for locl feature
const getLanguageOverride = (tag: string, enabled: boolean): string | undefined => {
  if (tag === 'locl' && enabled) {
    const feature = features.value.find(f => f.tag === tag)
    if (feature?.languageTag) {
      return `'${feature.languageTag}'`
    }
  }
  return undefined
}

// Process example text to mute specified characters
const getProcessedExampleText = (feature: FontFeature): string => {
  const metadata = featureMetadata.value[feature.tag]
  if (!metadata?.highlighted) {
    return feature.exampleText
  }
  
  const highlighted = Array.isArray(metadata.highlighted) 
    ? metadata.highlighted 
    : metadata.highlighted.split('')
  
  // Split by HTML tags to process only text content
  const parts = feature.exampleText.split(/(<[^>]+>|&[^;]+;)/)
  
  const processedParts = parts.map(part => {
    // Skip HTML tags and entities
    if (part.startsWith('<') || part.startsWith('&')) {
      return part
    }
    
    // Process text content
    let processed = part
    // Create a regex pattern that matches any character NOT in the highlighted list
    const highlightedChars = highlighted.map(char => 
      char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('')
    const regex = new RegExp(`[${highlightedChars}]`, 'g')
    processed = processed.replace(regex, match => `<span style="opacity: 0.5">${match}</span>`)
    
    return processed
  })
  
  return processedParts.join('')
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
