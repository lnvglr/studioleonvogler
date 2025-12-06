<template>
  <div 
    class="text-neutral-800 w-full transition-opacity duration-300"
    :class="{ 'opacity-0': !fontReady, '[font-kerning:none]': font.id === 'seoul-grotesk' }"
    :style="{ visibility: fontReady ? 'visible' : 'hidden' }"
  >
    <section v-if="title || fontName || content" class="mb-16">
      <div v-if="title || fontName" class="mb-8 flex flex-col gap-0">
      <div v-if="title">
        <h1 class=" font-medium" :class="fontName ? 'text-xl sm:text-2xl text-neutral-400' : 'uppercase text-5xl sm:text-6xl'" :style="fontName ? {} : mastheadStyle">
          {{ title }}
        </h1>
      </div>
      <div v-if="fontName">
        <h1 class="text-6xl sm:text-6xl leading-tight font-medium" :style="mastheadStyle">
          {{ fontName.toUpperCase() }}
        </h1>
      </div>
      </div>
      <div
        v-if="content"
        class="prose prose-neutral max-w-none prose-headings:font-medium prose-p:font-normal prose-p:text-neutral-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:my-16 prose-img:mb-20 prose-p:mb-8"
      >
        <ContentRenderer :value="content" />
      </div>
    </section>

    <!-- Masthead (only if no custom title) -->
    <section v-else class="mb-16">
      <div class="mb-8">
        <h1 class="text-4xl sm:text-5xl font-medium mb-4" :style="mastheadStyle">
          {{ font.name }}
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl">
          {{ font.description }}
        </p>
      </div>
      
    </section>

    <!-- Large Alphabet Display (like Inter) -->
    <section class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Alphabet</h2>
      <textarea
        :value="alphabetDisplay"
        class="w-full p-8 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[300px] whitespace-pre-wrap mix-blend-multiply resize-none border-none"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: 'clamp(2.5rem, 6vw, 6rem)',
          fontWeight: currentVariant.weight,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
        }"
      ></textarea>
    </section>

    <!-- Weight Examples (for variable fonts) -->
    <section v-if="isVariableFont" class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Weight</h2>
      <div class="space-y-8">
        <div
          v-for="(weight, weightIdx) in weightExamples"
          :key="weight"
          class="p-6 rounded-xl bg-stone-50 mix-blend-multiply"
        >
          <div class="text-sm text-neutral-500 mb-4">{{ getWeightName(weight) }} {{ weight }}</div>
          <div
            :style="{
              fontFamily: currentFontFamily,
              fontSize: '2rem',
              fontWeight: weight,
              lineHeight: 1.3,
            }"
          >
            {{ weightSampleTexts[weightIdx % weightSampleTexts.length] }}
          </div>
        </div>
      </div>
    </section>

    <!-- Font Features -->
    <FontFeatures :font="font" :feature-metadata="font.featureMetadata" />

    <!-- Character Grid -->
    <section class="mb-16 w-screen relative -mx-5 sm:-mx-10 md:-mx-20">
      <CharacterGrid
        :font-family="currentFontFamily"
        :font-weight="currentVariant.weight"
        :font-id="font.id"
        :supported-languages="normalizeSupportedLanguages(font.supportedLanguages)"
        :is-variable-font="isVariableFont"
        :weight-range="variableWeightRange"
      />
    </section>

    <!-- Supported Languages -->
    <section v-if="languagesByScript" class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Supported Languages</h2>
      <div v-for="(languages, script) in languagesByScript" :key="script" class="mb-6">
        <h3 class="text-lg font-medium mb-3 text-neutral-700">{{ script }}</h3>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="lang in languages"
            :key="lang"
            class="px-2 py-0.5 rounded-sm bg-stone-100 mix-blend-multiply hover:bg-stone-200 transition-colors duration-300"
            :href="`https://en.wikipedia.org/wiki/${lang.replace(' ', '_')}_language`"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lang }}
          </a>
        </div>
      </div>
      <p class="text-sm text-neutral-600 mt-6">
        Language support data referenced from
        <a
          href="https://hyperglot.rosettatype.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-neutral-900"
        >Hyperglot</a>, a database for detecting language support in fonts.
      </p>
    </section>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Font } from '~/data/fonts'
import { useFontLoading } from '~/composables/useFontLoading'

interface Props {
  font: Font
  standalone?: boolean
  title?: string
  fontName?: string
  content?: any // ContentRenderer value
}

const props = withDefaults(defineProps<Props>(), {
  standalone: false,
  title: undefined,
  fontName: undefined,
  content: undefined,
})

const isDark = useState('specimen:darkMode', () => false)
const selectedVariantId = ref(props.font.variants[0].id)

const isVariableFont = computed(() => {
  const firstVariant = props.font.variants[0]
  return typeof firstVariant.weight === 'string' && firstVariant.weight.includes(' ')
})

const variableWeightRange = computed(() => {
  if (!isVariableFont.value) return { min: 100, max: 900 }
  const weightStr = props.font.variants[0].weight as string
  const [min, max] = weightStr.split(' ').map(Number)
  return { min, max }
})

// Initialize variable weight - will be computed after isVariableFont and variableWeightRange are defined
const getInitialVariableWeight = () => {
  const firstVariant = props.font.variants[0]
  if (typeof firstVariant.weight === 'string' && firstVariant.weight.includes(' ')) {
    const [min, max] = firstVariant.weight.split(' ').map(Number)
    return Math.round((min + max) / 2)
  }
  return 400
}

const variableWeight = ref(getInitialVariableWeight())

const currentVariant = computed(() => {
  if (isVariableFont.value) {
    return {
      ...props.font.variants[0],
      weight: variableWeight.value,
    }
  }
  return props.font.variants.find((v) => v.id === selectedVariantId.value) || props.font.variants[0]
})

const currentFontFamily = computed(() => {
  return `"${props.font.name}", "Gramatika", system-ui, sans-serif`
})

// Font loading detection
const { waitForFont } = useFontLoading()
const fontReady = ref(false)

// Wait for the current font to load
onMounted(async () => {
  if (typeof window !== 'undefined') {
    await waitForFont(props.font.name)
    fontReady.value = true
  } else {
    fontReady.value = true
  }
})


// Helper function to get alphabet for a language
const getAlphabetForLanguage = (language: string): string => {
  const lang = language.toLowerCase()
  
  if (lang.includes('hebrew')) {
    return "אבגדהוזחטיכךלמםנןסעפףצץקרשת"
  }
  if (lang.includes('arabic')) {
    return 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
  }
  if (lang.includes('cyrillic') || lang.includes('russian')) {
    return 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  }
  if (lang.includes('greek')) {
    return 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
  }
  if (lang.includes('georgian')) {
    return 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ'
  }
  if (lang.includes('nko') || lang.includes("n'ko")) {
    return 'ߊߋߌߍߎߏߐߑߒߓߔߕߖߗߘߙߚߛߜߝߞߟߠߡߢߣߤߥߦߧߨߩߪ߲߫߬߭߮߯߰߱߳ߴߵ߶߷߸߹ߺ'
  }
  // Default: Latin uppercase
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
}

// Helper function to normalize supportedLanguages (handles both array and object formats)
const normalizeSupportedLanguages = (supportedLanguages?: string[] | Record<string, string[]>): string[] => {
  if (!supportedLanguages) return []
  if (Array.isArray(supportedLanguages)) return supportedLanguages
  // If it's an object, flatten all languages from all scripts
  return Object.keys(supportedLanguages)
}

// Get all languages grouped by script (for display)
const languagesByScript = computed(() => {
  const supportedLanguages = props.font.supportedLanguages
  if (!supportedLanguages) return null
  if (Array.isArray(supportedLanguages)) {
    // Old format: group by script name if present in language name
    const grouped: Record<string, string[]> = {}
    for (const lang of supportedLanguages) {
      const script = lang.includes('Arabic') ? 'Arabic' :
                    lang.includes('Cyrillic') || lang.includes('Russian') ? 'Cyrillic' :
                    lang.includes('Georgian') ? 'Georgian' :
                    lang.includes('Greek') ? 'Greek' :
                    lang.includes('Hebrew') || lang.includes('Yiddish') ? 'Hebrew' :
                    'Latin'
      if (!grouped[script]) grouped[script] = []
      grouped[script].push(lang)
    }
    return Object.keys(grouped).length > 0 ? grouped : null
  }
  // New format: already grouped by script
  return supportedLanguages
})

const alphabetDisplay = computed(() => {
  // Get first supported language
  const supportedLanguages = normalizeSupportedLanguages(props.font.supportedLanguages)
  
  if (supportedLanguages.length > 0) {
    const firstLanguage = supportedLanguages[0]
    console.log('firstLanguage', firstLanguage)
    return getAlphabetForLanguage(firstLanguage)
  }
  
  // Fallback: check font ID for backward compatibility
  if (props.font.id === 'heebo' || props.font.id === 'seoul-grotesk') {
    return 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'
  }
  
  // Default: Latin uppercase
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
})

const weightExamples = computed(() => {
  if (!isVariableFont.value) return []
  const { min, max } = variableWeightRange.value
  // Generate weight steps: Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black
  const steps = [100, 300, 500, 700, 900]
  return steps.filter(w => w >= min && w <= max)
})

const weightSampleTexts = computed(() => {
  if (props.font.id === 'diode-global-next') {
    return [
      'Typography & Design in Public Space',
      'Multi-script harmony across languages',
      'Public space research typographic hierarchies',
      'Visual equality between different scripts',
      'Typography research Israeli public spaces'
    ]
  }
  if (props.font.id === 'seoul-grotesk') {
    return [
      'גרוטסק קוריאני מעוצב בעברית',
      'עברית מעוצבת בהשראת קוריאה',
      'אריזות חטיפים קוריאניות בעברית',
      'גשרים תרבותיים בין מסורות טיפוגרפיות',
      'גרוטסק עברי בהשראת האלפבית הקוריאני'
    ]
  }
  // Default: varied texts covering different characters
  return [
    'Typography is the art of type',
    'Design & Letters create visual harmony',
    'Quick brown fox jumps over lazy',
    'ABCDEFG 123456 symbols and numbers',
    'Type design explores letterform possibilities'
  ]
})

const getWeightName = (weight: number): string => {
  const names: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  }
  return names[weight] || weight.toString()
}

const mastheadStyle = computed(() => ({
  fontFamily: currentFontFamily.value,
  fontWeight: 700,
}))

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (process.client) {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

onMounted(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>