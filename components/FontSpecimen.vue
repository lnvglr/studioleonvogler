<template>
  <div
    class="text-neutral-800 w-full transition-opacity duration-300"
    :class="{ 'opacity-0': !fontReady }"
    :style="{ visibility: fontReady ? 'visible' : 'hidden' }"
  >
    <section v-if="title || fontName || content" class="mb-16">
      <div v-if="title || fontName" class="mb-8 flex flex-col gap-0">
        <div v-if="title">
          <h1
            class="font-medium"
            :class="
              fontName
                ? 'text-xl sm:text-2xl text-neutral-400'
                : 'uppercase text-5xl sm:text-6xl'
            "
            :style="fontName ? {} : mastheadStyle"
          >
            {{ title }}
          </h1>
        </div>
        <div v-if="fontName">
          <h1
            class="text-6xl sm:text-6xl leading-tight font-medium"
            :style="mastheadStyle"
          >
            {{ fontName.toUpperCase() }}
          </h1>
        </div>
      </div>
      <div
        v-if="content"
        class="prose prose-neutral max-w-none prose-headings:font-medium prose-p:font-normal prose-p:text-neutral-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:my-16 prose-img:mb-20 prose-p:mb-8"
      >
        <ContentRenderer :value="content" :components="{ img: ProseImg }" />
      </div>
    </section>

    <!-- Masthead (only if no custom title) -->
    <section v-else class="mb-16">
      <div class="mb-8">
        <h1
          class="text-4xl sm:text-5xl font-medium mb-4"
          :style="mastheadStyle"
        >
          {{ font.name }}
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl">
          {{ font.description }}
        </p>
      </div>
    </section>

    <!-- Large Alphabet Display -->
    <section class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Alphabet</h2>
      <textarea
        :value="alphabetDisplay"
        class="w-full focus:outline-none whitespace-pre-wrap resize-none border-none leading-snug rounded-xl [field-sizing:content]"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: 'clamp(2.5rem, 6vw, 6rem)',
          fontWeight: currentVariant.weight,
        }"
        spellcheck="false"
        dir="auto"
      />
    </section>

    <!-- Weight Examples (for variable fonts) -->
    <section v-if="isVariableFont" class="mb-16">
      <div class="space-y-8 text-3xl md:text-4xl lg:text-5xl leading-snug">
        <div
          v-for="(weight, weightIdx) in weightExamples"
          :key="weight"
          class="rounded-xl"
        >
          <div class="text-xs text-neutral-400 mb-1">
            {{ getWeightName(weight) }} {{ weight }}
          </div>
          <div
            :style="{
              fontFamily: currentFontFamily,
              fontWeight: weight,
            }"
            class="whitespace-nowrap overflow-hidden py-2 -my-2"
            dir="auto"
          >
            {{ weightSampleTexts[weightIdx % weightSampleTexts.length] }}
          </div>
        </div>
      </div>
    </section>

    <!-- Font Features -->
    <FontFeatures :font="font" :feature-metadata="font.featureMetadata" class="z-20"/>

    <!-- Character Grid -->
    <section class="mb-16 w-screen relative -mx-5 sm:-mx-10 md:-mx-20 z-20">
      <CharacterGrid
        :font-family="currentFontFamily"
        :font-weight="currentVariant.weight"
        :font-id="font.id"
        :supported-languages="
          normalizeSupportedLanguages(font.supportedLanguages)
        "
        :is-variable-font="isVariableFont"
        :weight-range="variableWeightRange"
      />
    </section>

    <!-- Supported Languages -->
    <section v-if="languagesByScript" class="mb-16">
      <h2 class="text-2xl font-medium mb-8">Supported Languages</h2>
      <div
        v-for="(languages, script) in languagesByScript"
        :key="script"
        class="mb-6"
      >
        <h3 class="text-lg font-medium mb-3 text-neutral-700">{{ script }}</h3>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="lang in languages"
            :key="lang"
            class="px-2 py-0.5 rounded-sm bg-stone-100 hover:bg-stone-200 transition-colors duration-300"
            :href="`https://en.wikipedia.org/wiki/${lang.replace(
              ' ',
              '_'
            )}_language`"
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
          >Hyperglot</a
        >, a database for detecting language support in fonts.
      </p>
    </section>

    <!-- Donation & Licensing Section -->
    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Donation Box -->
        <div
          v-if="font.donationUrl"
          class="bg-stone-50 rounded-xl p-6 border border-stone-200"
        >
          <h2 class="text-2xl font-medium mb-4">Support This Font</h2>
          <p class="text-neutral-700 mb-6 leading-relaxed">
            If you find this font useful, please consider making a donation to
            support its development and maintenance.
          </p>
          <a
            :href="font.donationUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium"
            :style="{
              transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)',
            }"
          >
            Donate via PayPal
          </a>
        </div>

        <!-- Licensing Information -->
        <div
          v-if="font.license"
          class="bg-stone-50 rounded-xl p-6 border border-stone-200"
        >
          <h2 class="text-2xl font-medium mb-4">License</h2>
          <div class="mb-4">
            <h3 class="text-lg font-medium text-neutral-800 mb-2">
              {{ font.license.type }}
            </h3>
            <p
              v-if="font.license.description"
              class="text-neutral-700 leading-relaxed mb-4"
            >
              {{ font.license.description }}
            </p>
          </div>
          <a
            v-if="font.license.url"
            :href="font.license.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-green-500 hover:underline underline-offset-4 inline-flex items-center gap-1"
          >
            Read full license
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Download Section (Last) -->
    <section
      v-if="font.downloadLinks && font.downloadLinks.length > 0"
      class="mb-16"
    >
      <h2 class="text-2xl font-medium mb-8">Download</h2>
      <div class="space-y-4">
        <div
          v-for="(link, index) in font.downloadLinks"
          :key="index"
          class="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors duration-300"
          :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
        >
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{ link.label }}</span>
            <span v-if="link.format" class="text-sm text-neutral-600"
              >{{ link.format }} format</span
            >
          </div>
          <button
            @click="handleDownload(link, font.id, font.name)"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium inline-flex items-center gap-2"
            :style="{
              transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)',
            }"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Download
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import type { Font } from "~/data/fonts";
import { useFontLoading } from "~/composables/useFontLoading";
import ProseImg from "~/components/content/ProseImg.vue";

interface Props {
  font: Font;
  standalone?: boolean;
  title?: string;
  fontName?: string;
  content?: any; // ContentRenderer value
}

const props = withDefaults(defineProps<Props>(), {
  standalone: false,
  title: undefined,
  fontName: undefined,
  content: undefined,
});

const isDark = useState("specimen:darkMode", () => false);
const selectedVariantId = ref(props.font.variants[0].id);

const isVariableFont = computed(() => {
  const firstVariant = props.font.variants[0];
  return (
    typeof firstVariant.weight === "string" && firstVariant.weight.includes(" ")
  );
});

const variableWeightRange = computed(() => {
  if (!isVariableFont.value) return { min: 100, max: 900 };
  const weightStr = props.font.variants[0].weight as string;
  const [min, max] = weightStr.split(" ").map(Number);
  return { min, max };
});

// Initialize variable weight - will be computed after isVariableFont and variableWeightRange are defined
const getInitialVariableWeight = () => {
  const firstVariant = props.font.variants[0];
  if (
    typeof firstVariant.weight === "string" &&
    firstVariant.weight.includes(" ")
  ) {
    const [min, max] = firstVariant.weight.split(" ").map(Number);
    return Math.round((min + max) / 2);
  }
  return 400;
};

const currentVariant = computed(() => {
  return {
    weight: 700,
  };
});

const currentFontFamily = computed(() => {
  return `"${props.font.name}", "Gramatika", system-ui, sans-serif`;
});

// Font loading detection
const { waitForFont } = useFontLoading();
const fontReady = ref(false);

// Wait for the current font to load
onMounted(async () => {
  if (typeof window !== "undefined") {
    await waitForFont(props.font.name);
    fontReady.value = true;
  } else {
    fontReady.value = true;
  }
});

// Helper function to get alphabet for a language
const getAlphabetForLanguage = (language: string): string => {
  const lang = language.toLowerCase();

  if (lang.includes("hebrew")) {
    return "אבגדהוזחטיכךלמםנןסעפףצץקרשת";
  }
  if (lang.includes("arabic")) {
    return "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
  }
  if (lang.includes("cyrillic") || lang.includes("russian")) {
    return "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
  }
  if (lang.includes("greek")) {
    return "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";
  }
  if (lang.includes("georgian")) {
    return "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ";
  }
  if (lang.includes("nko") || lang.includes("n'ko")) {
    return "ߊߋߌߍߎߏߐߑߒߓߔߕߖߗߘߙߚߛߜߝߞߟߠߡߢߣߤߥߦߧߨߩߪ߲߫߬߭߮߯߰߱߳ߴߵ߶߷߸߹ߺ";
  }
  // Default: Latin uppercase
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
};

// Helper function to normalize supportedLanguages (handles both array and object formats)
const normalizeSupportedLanguages = (
  supportedLanguages?: string[] | Record<string, string[]>
): string[] => {
  if (!supportedLanguages) return [];
  if (Array.isArray(supportedLanguages)) return supportedLanguages;
  // If it's an object, flatten all languages from all scripts
  return Object.keys(supportedLanguages);
};

// Get all languages grouped by script (for display)
const languagesByScript = computed(() => {
  const supportedLanguages = props.font.supportedLanguages;
  if (!supportedLanguages) return null;
  if (Array.isArray(supportedLanguages)) {
    // Old format: group by script name if present in language name
    const grouped: Record<string, string[]> = {};
    for (const lang of supportedLanguages) {
      const script = lang.includes("Arabic")
        ? "Arabic"
        : lang.includes("Cyrillic") || lang.includes("Russian")
        ? "Cyrillic"
        : lang.includes("Georgian")
        ? "Georgian"
        : lang.includes("Greek")
        ? "Greek"
        : lang.includes("Hebrew") || lang.includes("Yiddish")
        ? "Hebrew"
        : "Latin";
      if (!grouped[script]) grouped[script] = [];
      grouped[script].push(lang);
    }
    return Object.keys(grouped).length > 0 ? grouped : null;
  }
  // New format: already grouped by script
  return supportedLanguages;
});

const alphabetDisplay = computed(() => {
  // Get first supported language
  const supportedLanguages = normalizeSupportedLanguages(
    props.font.supportedLanguages
  );

  if (supportedLanguages.length > 0) {
    const firstLanguage = supportedLanguages[0];
    return getAlphabetForLanguage(firstLanguage);
  }

  // Fallback: check font ID for backward compatibility
  if (props.font.id === "heebo" || props.font.id === "seoul-grotesk") {
    return "אבגדהוזחטיכךלמםנןסעפףצץקרשת";
  }

  // Default: Latin uppercase
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
});

const weightExamples = computed(() => {
  if (!isVariableFont.value) return [];
  const { min, max } = variableWeightRange.value;
  // Generate weight steps: Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black
  const steps = [100, 300, 500, 700, 900];
  return steps.filter((w) => w >= min && w <= max);
});

const weightSampleTexts = computed(() => {
  if (props.font.id === "diode-global-next") {
    return [
      "Typography & Design in Public Space",
      "Multi-script harmony across languages",
      "Public space research typographic hierarchies",
      "Visual equality between different scripts",
      "Typography research Israeli public spaces",
    ];
  }
  if (props.font.id === "seoul-grotesk") {
    return [
      "גרוטסק קוריאני מעוצב בעברית",
      "עברית מעוצבת בהשראת קוריאה",
      "אריזות חטיפים קוריאניות בעברית",
      "גשרים תרבותיים בין מסורות טיפוגרפיות",
      "גרוטסק עברי בהשראת האלפבית הקוריאני",
    ];
  }
  // Default: varied texts covering different characters
  return [
    "Typography is the art of type",
    "Design & Letters create visual harmony",
    "Quick brown fox jumps over lazy",
    "ABCDEFG 123456 symbols and numbers",
    "Type design explores letterform possibilities",
  ];
});

const getWeightName = (weight: number): string => {
  const names: Record<number, string> = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
  };
  return names[weight] || weight.toString();
};

const mastheadStyle = computed(() => ({
  fontFamily: currentFontFamily.value,
  fontWeight: 700,
}));

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (process.client) {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

onMounted(() => {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  }
});

// Download tracking handler
const handleDownload = async (link: { url: string; format?: string }, fontId: string, fontName: string) => {
  try {
    // Track the download (fire and forget - don't block the download)
    $fetch('/api/downloads/track', {
      method: 'POST',
      body: {
        fontId,
        fontName,
        downloadUrl: link.url,
        format: link.format,
      },
    }).catch(console.error)

    // Trigger the actual download
    const linkElement = document.createElement('a')
    linkElement.href = link.url
    linkElement.download = link.url.split('/').pop() || 'font'
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
  } catch (error) {
    console.error('Error tracking download:', error)
    // Still allow download even if tracking fails
    const linkElement = document.createElement('a')
    linkElement.href = link.url
    linkElement.download = link.url.split('/').pop() || 'font'
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
  }
}
</script>
