<template>
  <div class="font-specimen w-full">
    <!-- Dark Mode Toggle (if standalone) -->
    <div v-if="standalone" class="flex justify-end mb-8">
      <button
        @click="toggleDarkMode"
        class="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        <svg
          v-if="!isDark"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
    </div>

    <!-- Custom Title and Content (if provided) -->
    <section v-if="title || content" class="mb-16">
      <div v-if="title" class="mb-8">
        <h1 class="text-4xl sm:text-5xl font-medium mb-4" :style="mastheadStyle">
          {{ title }}
        </h1>
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
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
          {{ font.description }}
        </p>
      </div>
      
    </section>

    <!-- Large Alphabet Display (like Inter) -->
    <section class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Alphabet</h2>
      <div
        contenteditable="true"
        class="p-8 rounded-xl bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[300px] whitespace-pre-wrap"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: 'clamp(2.5rem, 6vw, 6rem)',
          fontWeight: currentVariant.weight,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
        }"
      >
        {{ alphabetDisplay }}
      </div>
    </section>

    <!-- Weight Examples (for variable fonts) -->
    <section v-if="isVariableFont" class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Weight</h2>
      <div class="space-y-8">
        <div
          v-for="(weight, weightIdx) in weightExamples"
          :key="weight"
          class="p-6 rounded-xl bg-stone-50 dark:bg-stone-900"
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

    <!-- Character Grid -->
    <section class="mb-16 w-screen relative -mx-5 sm:-mx-10 md:-mx-20">
      <CharacterGrid
        :font-family="currentFontFamily"
        :font-weight="currentVariant.weight"
        :font-id="font.id"
        :supported-languages="font.supportedLanguages || []"
        :is-variable-font="isVariableFont"
        :weight-range="variableWeightRange"
      />
    </section>

    <!-- Supported Languages -->
    <section v-if="font.supportedLanguages" class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Supported Languages</h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="lang in font.supportedLanguages"
          :key="lang"
          class="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800"
        >
          {{ lang }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Font } from '~/data/fonts'

interface Props {
  font: Font
  standalone?: boolean
  title?: string
  content?: any // ContentRenderer value
}

const props = withDefaults(defineProps<Props>(), {
  standalone: false,
  title: undefined,
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
  return `"${props.font.name}", system-ui, sans-serif`
})


// Helper function to get alphabet for a language
const getAlphabetForLanguage = (language: string): string => {
  const lang = language.toLowerCase()
  
  if (lang.includes('hebrew')) {
    return 'אבגדהוזחטיכךסעפצקרשת'
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

const alphabetDisplay = computed(() => {
  // Get first supported language
  const supportedLanguages = props.font.supportedLanguages || []
  
  if (supportedLanguages.length > 0) {
    const firstLanguage = supportedLanguages[0]
    return getAlphabetForLanguage(firstLanguage)
  }
  
  // Fallback: check font ID for backward compatibility
  if (props.font.id === 'heebo' || props.font.id === 'seoul-grotesk') {
    return 'אבגדהוזחטיכךסעפצקרשת'
  }
  
  // Default: Latin uppercase
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
})

const weightExamples = computed(() => {
  if (!isVariableFont.value) return []
  const { min, max } = variableWeightRange.value
  // Generate weight steps: Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black
  const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  return steps.filter(w => w >= min && w <= max)
})

const weightSampleTexts = computed(() => {
  if (props.font.id === 'heebo') {
    return [
      'טיפוגרפיה עברית היא אמנות',
      'אותיות וצורות מעוצבות בקפידה',
      'קריאות ונוחות קריאה מעולות',
      'עיצוב גופנים דיגיטליים מודרניים',
      'טיפוגרפיה עברית דיגיטלית מעולה'
    ]
  }
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
  fontWeight: currentVariant.value.weight,
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

<style scoped>
.font-specimen {
  color: #1c1917;
}

.dark .font-specimen {
  color: #fafaf9;
}
</style>
