<template>
  <div class="bg-green-700 p-6 sm:p-10 md:px-20 border-b border-green-300">
    <h2 class="text-6xl font-medium text-white">Glyphs</h2>
  </div>
  <div 
    class="bg-green-700 flex w-full transition-opacity duration-300" 
    style="min-height: 100vh"
    :class="{ 'opacity-0': !fontReady }"
    :style="{ visibility: fontReady ? 'visible' : 'hidden', minHeight: '100vh' }"
  >
    <!-- Left Sticky Preview Panel -->
    <div
      class="sticky top-0  self-start h-screen max-h-screen overflow-hidden flex-shrink-0 w-1/2 border-r border-green-300 flex flex-col"
    >
      <!-- Header -->
      <div class="p-6 border-b border-green-300">
        <div class="grid sm:grid-cols-2 items-center gap-x-6 gap-y-2">
          <div class="flex flex-col gap-2">
            <!-- Weight Slider (for variable fonts) -->
            <div v-if="isVariableFont" class="grid grid-cols-2 grid-rows-2 items-center gap-x-4 gap-y-0">
              <span class="text-sm text-white/70">Weight</span>
              <div class="relative w-full max-w-32 h-1 bg-green-500 rounded-full col-start-1 row-start-2 col-span-2 touch-none" style="touch-action: none;" :style="{
                '--w': `calc(${weightPercentage}% - ${weightPercentage/9}px)`
              }">
                <div
                  class="absolute top-1/2 -translate-y-1/2 h-full bg-white rounded-full w-[calc(var(--w)+3px)]"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 bg-white rounded-full cursor-pointer start-[calc(var(--w))] touch-none w-3 h-3  pointer-coarse:w-5 pointer-coarse:h-5"
                  @mousedown="startWeightSliderDrag"
                  @touchstart="startWeightSliderDrag"
                ></div>
              </div>
              <span class="text-sm text-white font-medium tabular-nums row-start-1 col-start-2 text-right">{{
                currentWeight
              }}</span>
            </div>
            <!-- SHPE Axis Slider (for diode-global-next) -->
            <div v-if="isVariableFont && hasShapeAxis" class="grid grid-cols-2 grid-rows-2 items-center gap-x-4 gap-y-0">
              <span class="text-sm text-white/70">Shape</span>
              <div class="relative w-full max-w-32 h-1 bg-green-500 rounded-full col-start-1 row-start-2 col-span-2 touch-none" style="touch-action: none;" :style="{
                '--w': `calc(${shapePercentage}% - ${shapePercentage/9}px)`
              }">
                <div
                  class="absolute top-1/2 -translate-y-1/2 h-full bg-white rounded-full w-[calc(var(--w)+3px)]"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 bg-white rounded-full cursor-pointer start-[calc(var(--w))] touch-none  w-3 h-3  pointer-coarse:w-5 pointer-coarse:h-5"
                  style="touch-action: none;"
                  @mousedown="startShapeSliderDrag"
                  @touchstart="startShapeSliderDrag"
                ></div>
              </div>
              <span class="text-sm text-white font-medium tabular-nums row-start-1 col-start-2 text-right">{{
                currentShape.toFixed()
              }}</span>
            </div>
            <!-- Details Toggle -->
            <div class="hidden items-center gap-2">
              <span class="text-sm text-white/70">Details</span>
              <button
                @click="showDetails = !showDetails"
                class="w-10 h-6 rounded-full transition-colors relative"
                :class="showDetails ? 'bg-white' : 'bg-green-500'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="
                    showDetails ? 'translate-x-4 bg-green-600' : 'bg-white'
                  "
                ></div>
              </button>
            </div>
          </div>
          <!-- Character Info -->
          <div class="flex sm:flex-col self-start sm:items-end ml-auto text-sm text-white/70 gap-x-4 w-full">
            <span class="font-medium text-white">{{
              getGlyphName(previewChar)
            }}</span
            >
            <span>U+{{ getCharCode(previewChar) }}</span>
          </div>
        </div>
      </div>

      <!-- Character Preview Area -->
      <div
        class="flex-1 relative flex items-center justify-center overflow-hidden"
        @mousemove="handleWeightDrag"
        @mouseup="stopWeightDrag"
        @mouseleave="stopWeightDrag"
        @mousedown="startWeightDrag"
      >
        <!-- Typographic Metrics (if details enabled) -->
        <div
          v-if="showDetails && fontMetrics && glyphOutline"
          class="absolute inset-0 pointer-events-none z-20"
        >
          <!-- Cap Height -->
          <div
            class="absolute left-0 right-0 border-t-2 border-white"
            :style="{
              top: `${capHeightPosition}%`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Cap height</span
            >
          </div>
          <!-- X-Height -->
          <div
            class="absolute left-0 right-0 border-t-2 border-white"
            :style="{
              top: `${xHeightPosition}%`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >x-height</span
            >
          </div>
          <!-- Baseline -->
          <div
            class="absolute left-0 right-0 border-t-2 border-white"
            :style="{
              top: `${baselinePosition}%`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Baseline</span
            >
          </div>
        </div>

        <!-- Large Character Preview -->
        <div
          class="text-center select-none relative"
          :style="{
            cursor: isVariableFont ? 'ew-resize' : 'default',
          }"
        >
          <!-- Character container for proper baseline alignment -->
          <div
            class="relative inline-block text-[10rem] sm:text-[20rem]"
            :style="{
              fontFamily: fontFamily,
              fontWeight: getCurrentWeight(),
              fontVariationSettings: fontVariationSettings,
              lineHeight: 1,
            }"
          >
            <!-- Character text (semi-transparent when details enabled for reference) -->
            <div
              :style="{
                color: showDetails ? 'rgba(255, 255, 255, 0.2)' : 'white',
              }"
              v-html="renderArabicChar(previewChar)"
            ></div>

            <!-- SVG with glyph outline and handles (when details enabled) -->
            <svg
              v-if="showDetails && glyphOutline && glyphOutline.path"
              class="absolute inset-0 w-full h-full"
              :viewBox="`${glyphOutline.bbox.xMin - 100} ${
                -glyphOutline.bbox.yMax - 100
              } ${glyphOutline.bbox.xMax - glyphOutline.bbox.xMin + 200} ${
                glyphOutline.bbox.yMax - glyphOutline.bbox.yMin + 200
              }`"
              preserveAspectRatio="xMidYMid meet"
              style="pointer-events: none; z-index: 10"
            >
              <!-- Glyph outline path -->
              <path
                :d="glyphOutline.path"
                fill="none"
                stroke="white"
                stroke-width="5"
                vector-effect="non-scaling-stroke"
              />
              <!-- Control points (handles) -->
              <g
                v-if="
                  glyphOutline.controlPoints &&
                  glyphOutline.controlPoints.length > 0
                "
                style="pointer-events: none"
              >
                <!-- On-curve points (nodes) - filled circles -->
                <circle
                  v-for="(point, idx) in glyphOutline.controlPoints.filter(
                    (p) => p.onCurve
                  )"
                  :key="`on-${idx}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="25"
                  fill="white"
                  stroke="#166534"
                  stroke-width="6"
                />
                <!-- Off-curve points (bezier control handles) - dashed circles -->
                <circle
                  v-for="(point, idx) in glyphOutline.controlPoints.filter(
                    (p) => !p.onCurve
                  )"
                  :key="`off-${idx}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="20"
                  fill="none"
                  stroke="white"
                  stroke-width="5"
                  stroke-dasharray="8 8"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Scrollable Glyph Grid -->
    <div 
      ref="gridScrollContainer" 
      class="flex-1 overflow-y-auto h-auto focus:outline-none"
      tabindex="0"
      @focus="handleGridFocus"
      @blur="handleGridBlur"
    >
      <div
        ref="gridContainer"
        class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-px"
        :style="{
            fontFamily: fontFamily,
            fontWeight: getCurrentWeight(),
            fontVariationSettings: fontVariationSettings,
          }"
      >
        <div
          v-for="(char, charIdx) in currentCharacters"
          :key="charIdx"
          :ref="(el) => setGridItemRef(el, charIdx)"
          class="aspect-square flex items-center justify-center ring-1 ring-green-300 transition-colors cursor-pointer group relative text-4xl text-white hover:ring-green-200 hover:bg-green-600 overflow-hidden"
          :data-selected="previewChar === char"
          :class="previewChar === char ? 'bg-green-500 ring-green-300' : ''"
          @click="selectCharacter(char)"
        >
          <span v-html="renderArabicChar(char)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useSamsa } from "~/composables/useSamsa";
import { useFontLoading } from "~/composables/useFontLoading";

interface Props {
  fontFamily: string;
  fontWeight: number | string;
  fontId?: string;
  supportedLanguages?: string[];
  isVariableFont?: boolean;
  weightRange?: { min: number; max: number };
}

const props = withDefaults(defineProps<Props>(), {
  isVariableFont: false,
  weightRange: () => ({ min: 100, max: 900 }),
});

const previewChar = ref<string>("A");
const showDetails = ref(false);
const isDraggingWeight = ref(false);
const isDraggingWeightSlider = ref(false);
const isDraggingShapeSlider = ref(false);
const gridScrollContainer = ref<HTMLElement | null>(null);
const gridContainer = ref<HTMLElement | null>(null);
const gridItemRefs = ref<Map<number, HTMLElement>>(new Map());
const isGridFocused = ref(false);

// Font loading detection
const { waitForFont: waitForFontFromComposable } = useFontLoading();
const fontReady = ref(false);

// Extract font name from fontFamily prop (used later in the file too)
const getFontNameFromFamily = () => {
  if (!props.fontFamily) return '';
  const match = props.fontFamily.match(/"([^"]+)"/);
  return match ? match[1] : props.fontFamily.split(',')[0].trim().replace(/"/g, '');
};

// Wait for font to load using composable
onMounted(async () => {
  if (typeof window !== 'undefined') {
    const fontName = getFontNameFromFamily();
    if (fontName) {
      await waitForFontFromComposable(fontName);
    }
    fontReady.value = true;
  } else {
    fontReady.value = true;
  }
});

// Weight control for variable fonts
const getInitialWeight = (): number => {
  if (props.isVariableFont && typeof props.fontWeight === "string") {
    const [min, max] = props.fontWeight.split(" ").map(Number);
    return Math.round((min + max) / 2);
  }
  return typeof props.fontWeight === "number" ? props.fontWeight : 400;
};

const currentWeight = ref<number>(getInitialWeight());

const getCurrentWeight = () => {
  if (props.isVariableFont) {
    return currentWeight.value;
  }
  return typeof props.fontWeight === "number" ? props.fontWeight : 400;
};

const weightRange = computed(() => {
  if (props.isVariableFont && typeof props.fontWeight === "string") {
    const [min, max] = props.fontWeight.split(" ").map(Number);
    return { min, max };
  }
  return props.weightRange;
});

const weightPercentage = computed(() => {
  const { min, max } = weightRange.value;
  const weight = getCurrentWeight();
  return ((weight - min) / (max - min)) * 100;
});

// SHPE axis control for variable fonts
const shapeAxis = computed(() => {
  if (!samsaFontInstance.value || !samsaFontInstance.value.axes) return null;
  return samsaFontInstance.value.axes.find((axis: any) => axis.tag === "SHPE");
});

const hasShapeAxis = computed(() => {
  return !!shapeAxis.value;
});

const shapeRange = computed(() => {
  if (!shapeAxis.value) return { min: 0, max: 100 };
  return {
    min: shapeAxis.value.min,
    max: shapeAxis.value.max,
    default:
      shapeAxis.value.default ||
      (shapeAxis.value.min + shapeAxis.value.max) / 2,
  };
});

const currentShape = ref<number>(0);

const shapePercentage = computed(() => {
  if (!hasShapeAxis.value) return 0;
  const { min, max } = shapeRange.value;
  return ((currentShape.value - min) / (max - min)) * 100;
});

// Typographic metrics positions (will be calculated from actual font metrics)
const capHeightPosition = ref(50); // Percentage from top
const xHeightPosition = ref(50); // Percentage from top
const baselinePosition = ref(50); // Percentage from top

// Font metrics from samsa
const fontMetrics = ref<{
  unitsPerEm: number;
  capHeight: number;
  xHeight: number;
  ascender: number;
  descender: number;
} | null>(null);

// Glyph outline data for current character
const glyphOutline = ref<{
  path: string;
  bbox: { xMin: number; yMin: number; xMax: number; yMax: number };
  scale: number;
  offsetX: number;
  offsetY: number;
  controlPoints: Array<{ x: number; y: number; onCurve: boolean }>;
} | null>(null);

// Use Samsa composable
const { loadFont, getFontMetrics, getGlyphOutline } = useSamsa();
const samsaFontInstance = ref<any>(null);

// Initialize SHPE value when font loads
watch(
  samsaFontInstance,
  (font) => {
    if (font && hasShapeAxis.value && shapeAxis.value) {
      currentShape.value = 0;
    }
  },
  { immediate: true }
);

// Font variation settings for variable fonts with multiple axes
const fontVariationSettings = computed(() => {
  if (
    !props.isVariableFont ||
    !samsaFontInstance.value ||
    !samsaFontInstance.value.axes
  ) {
    return undefined;
  }

  const settings: string[] = [];
  samsaFontInstance.value.axes.forEach((axis: any) => {
    if (axis.tag === "wght" || axis.tag === "WEIGHT") {
      settings.push(`'${axis.tag}' ${currentWeight.value}`);
    } else if (axis.tag === "SHPE") {
      settings.push(`'${axis.tag}' ${currentShape.value}`);
    } else {
      // Use default for other axes
      settings.push(`'${axis.tag}' ${axis.default || 0}`);
    }
  });

  return settings.length > 0 ? settings.join(", ") : undefined;
});

const breaksLigatures =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome|Chromium|Edg|OPR/.test(navigator.userAgent);

// Form markers for Arabic characters
const FORM_ISOLATED = "\uE000";
const FORM_INITIAL = "\uE001";
const FORM_MEDIAL = "\uE002";
const FORM_FINAL = "\uE003";

// Arabic letter joining behavior lookup
// Based on Unicode joining types: U=Non_Joining, R=Right_Joining, D=Dual_Joining
const getArabicLetterForms = (letter: string): string[] => {
  const codePoint = letter.codePointAt(0) || 0;
  const forms: string[] = [];
  
  const specialLetters = new Set([
    0x0640, // ـ FATHA,
  ]);
  // Non-joining letters (only isolated form)
  // These don't connect to adjacent letters
  const nonJoining = new Set([
    0x0621, // ء HAMZA
    0x0622, // آ ALEF WITH MADDA ABOVE
    0x0623, // أ ALEF WITH HAMZA ABOVE
    0x0624, // ؤ WAW WITH HAMZA ABOVE
    0x0625, // إ ALEF WITH HAMZA BELOW
    0x0626, // ئ YEH WITH HAMZA ABOVE
    0x0671, // ٱ ALEF WASLA
  ]);
  
  // Right-joining letters (isolated and final forms only)
  // These connect only to the preceding letter
  const rightJoining = new Set([
    0x0627, // ا ALEF
    0x062F, // د DAL
    0x0630, // ذ THAL
    0x0631, // ر REH
    0x0632, // ز ZAIN
    0x0648, // و WAW
    0x0649, // ى ALEF MAKSURA
  ]);
  
  // Check if letter is non-joining
  if (nonJoining.has(codePoint) || specialLetters.has(codePoint)) {
    forms.push(FORM_ISOLATED);
    return forms;
  }
  
  // Check if letter is right-joining
  if (rightJoining.has(codePoint)) {
    forms.push(FORM_ISOLATED);
    forms.push(FORM_FINAL);
    return forms;
  }
  
  // Default: dual-joining (all four forms)
  // This includes most Arabic letters like ب ت ث ج ح خ س ش ص ض ط ظ ع غ ف ق ك ل م ن ه ي
  // and extended Arabic characters like پ چ گ etc.
  forms.push(FORM_ISOLATED);
  forms.push(FORM_INITIAL);
  forms.push(FORM_MEDIAL);
  forms.push(FORM_FINAL);
  return forms;
};

// Extract base character and form from stored string
const getArabicCharAndForm = (char: string): { baseChar: string; form: string | null } => {
  if (char.length < 2) return { baseChar: char, form: null };
  const lastChar = char[char.length - 1];
  if (lastChar === FORM_ISOLATED || lastChar === FORM_INITIAL || lastChar === FORM_MEDIAL || lastChar === FORM_FINAL) {
    return { baseChar: char.slice(0, -1), form: lastChar };
  }
  return { baseChar: char, form: null };
};

// Render Arabic character with context to force specific form
const renderArabicChar = (char: string): string => {
  const { baseChar, form } = getArabicCharAndForm(char);
  if (!form || !isArabicChar(baseChar)) return char === " " ? "·" : char;
  
  // Arabic connecting letter used for context (ب is a common connecting letter)
  const connectingLetter = "ب";
  // Zero-width joiner to force connection
  const ZWJ = "\u200D";
  // Zero-width non-joiner to prevent connection
  const ZWNJ = "\u200C";
  
  // Create HTML structure with context characters that are invisible but still affect shaping
  // Use opacity: 0 to hide visually while keeping in text flow for shaping
  // This ensures the context characters affect Arabic shaping but are not visible
  const hiddenStyle = "opacity: 0; user-select: none; pointer-events: none; display: inline; position: absolute;";
  const connection = `<span style="${hiddenStyle}">${connectingLetter}</span>`;
  
  if (form === FORM_ISOLATED) {
    // Isolated: use ZWNJ to prevent joining on both sides
    return `${ZWNJ}${baseChar}${ZWNJ}`;
  } else if (form === FORM_INITIAL) {
    // Initial: base char connects forward, so add connecting letter after (hidden)
    // The connecting letter after forces the initial form
    return `${baseChar}${ZWJ}${connection}`;
  } else if (form === FORM_MEDIAL) {
    // Medial: connecting letter before + base char + connecting letter after (both hidden)
    // Both context letters force the medial form
    return `${connection}${ZWJ}${baseChar}${ZWJ}${connection}`;
  } else if (form === FORM_FINAL) {
    // Final: connecting letter before + base char (hidden)
    // The connecting letter before forces the final form
    return `${connection}${ZWJ}${baseChar}`;
  }
  
  return baseChar;
};

// Load font and get metrics using samsa
const loadFontMetrics = async () => {
  if (typeof window === "undefined" || !props.fontId) return;

  try {
    // Get font file path from font data
    const { getFontById } = await import("~/data/fonts");
    const font = getFontById(props.fontId);
    if (!font || !font.variants[0]) return;

    const fontFile = font.variants[0].file;
    const fontUrl = fontFile.startsWith("/") ? fontFile : `/${fontFile}`;

    // Load font using Samsa composable
    const samsaFont = await loadFont(fontUrl);
    if (!samsaFont) return;

    samsaFontInstance.value = samsaFont;

    // Get metrics
    const metrics = getFontMetrics(samsaFont);
    if (metrics) {
      fontMetrics.value = metrics;
    }

    // Load glyph outline for initial character
    await loadGlyphOutline(previewChar.value);
  } catch (error) {
    console.warn("Failed to load font metrics:", error);
  }
};

// Helper to normalize supportedLanguages (handles both array and object formats)
const normalizeSupportedLanguages = (
  supportedLanguages?: string[] | Record<string, string[]>
): string[] => {
  if (!supportedLanguages) return [];
  if (Array.isArray(supportedLanguages)) return supportedLanguages;
  // If it's an object, flatten all languages from all scripts
  return Object.values(supportedLanguages).flat();
};

// Helper to check if a script is supported (handles both array and object formats)
const supportsScript = (
  scriptName: string,
  supportedLanguages?: string[] | Record<string, string[]>
): boolean => {
  if (!supportedLanguages) return false;

  // If it's an object, check if the script key exists
  if (!Array.isArray(supportedLanguages)) {
    return scriptName in supportedLanguages;
  }

  // If it's an array, check if any language name includes the script
  const normalized = normalizeSupportedLanguages(supportedLanguages);
  return normalized.some((lang) =>
    lang.toLowerCase().includes(scriptName.toLowerCase())
  );
};

// Generate all supported characters based on languages
const characterGroups = computed(() => {
  const groups: Array<{ name: string; characters: string[] }> = [];
  const normalizedLanguages = normalizeSupportedLanguages(
    props.supportedLanguages
  );

  // Check if font supports Latin/English
  const supportsLatin =
    !props.supportedLanguages ||
    normalizedLanguages.length === 0 ||
    supportsScript("latin", props.supportedLanguages) ||
    supportsScript("english", props.supportedLanguages) ||
    normalizedLanguages.some(
      (lang) =>
        lang.toLowerCase().includes("latin") ||
        lang.toLowerCase().includes("english")
    );

  // Check if font supports Hebrew
  const supportsHebrew =
    supportsScript("hebrew", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("hebrew"));

  // Check if font supports Arabic
  const supportsArabic =
    supportsScript("arabic", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("arabic"));

  // Check if font supports Cyrillic
  const supportsCyrillic =
    supportsScript("cyrillic", props.supportedLanguages) ||
    normalizedLanguages.some(
      (lang) =>
        lang.toLowerCase().includes("cyrillic") ||
        lang.toLowerCase().includes("russian")
    );

  const supportsBelarusian =
    supportsScript("belarusian", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("belarusian"));

  const supportsBulgarian =
    supportsScript("bulgarian", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("bulgarian"));

  // Check if font supports Georgian
  const supportsGeorgian =
    supportsScript("georgian", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("georgian"));

  // Check if font supports Armenian
  const supportsArmenian =
    supportsScript("armenian", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("armenian"));

  // Check if font supports Greek
  const supportsGreek =
    supportsScript("greek", props.supportedLanguages) ||
    normalizedLanguages.some((lang) => lang.toLowerCase().includes("greek"));

  // Check if font supports N'Ko
  const supportsNko = normalizedLanguages.some(
    (lang) =>
      lang.toLowerCase().includes("nko") || lang.toLowerCase().includes("n'ko")
  );

  // Latin characters - Standard specimen order: Uppercase → Lowercase → Numerals → Punctuation
  if (supportsLatin) {
    groups.push({
      name: "Latin Uppercase",
      characters: "AÀÁÂĂÃÄÅÆBCÇDÐEÈÉÊËFGĞHIÏİĲJKLMNÑOÒÓÔÕÖØŒŐPÞQRSŞẞTUÙÚÛÜVWXYŸZ".split(""),
    });
    groups.push({
      name: "Latin Lowercase",
      characters: "aăäåæbcçdðeèéëfgğhiìíîïıĳjȷklmnñoõöøœőpþqrsşßtuüvwxyz".split(""),
    });
    groups.push({
      name: "Latin Numerals",
      characters: "0123456789".split(""),
    });
    groups.push({
      name: "Latin Punctuation",
      characters: ".,:;…!¡?¿·•*#/\\-–—_(){}[]‚„\"\"\'\'«»‹›\'\"ʹ͵".split(""),
    });
  }

  // Hebrew characters - Letters → Numerals → Punctuation
  if (supportsHebrew) {
    const hebrewLetters = "אבגדהוזחטיךכלםמןנסעףפץצקרשת".split("");
    groups.push({
      name: "Hebrew Letters",
      characters: hebrewLetters,
    });
    const stretchedHebrewLetters = "ﬡﬢﬣﬤﬥﬦﬧﬨ".split("");
    groups.push({
      name: "Hebrew Stretched",
      characters: stretchedHebrewLetters,
    });
  }

  // Arabic characters - Letters → Numerals → Punctuation
  if (supportsArabic) {
    const arabicLetters =
      "ءأإآٱٮبپتثجچحخدذرسشصضطظعغفڤڡٯقكکگلمنںهہھةوؤىيئـ".split("");
    
    // For each Arabic letter, add only the forms it supports consecutively
    const arabicWithAllForms: string[] = [];
    arabicLetters.forEach(letter => {
      const supportedForms = getArabicLetterForms(letter);
      supportedForms.forEach(form => {
        // If breaksLigatures is true, skip initial, medial, and final forms
        if (breaksLigatures && (form === FORM_INITIAL || form === FORM_MEDIAL || form === FORM_FINAL)) {
          return;
        }
        arabicWithAllForms.push(letter + form);
      });
    });
    
    groups.push({
      name: "Arabic Letters",
      characters: arabicWithAllForms,
    });
    groups.push({
      name: "Arabic-Indic Numerals",
      characters: "٠١٢٣٤٥٦٧٨٩".split(""),
    });
    groups.push({
      name: "Arabic Punctuation",
      characters: "،؛؟٭".split(""),
    });
  }

  // Cyrillic characters - Uppercase → Lowercase → Numerals → Punctuation
  if (supportsCyrillic) {
    const cyrillicUpper = "АБВГҐДЕЁЀЖЗИЙЍКЛМНОПРСТУЎФХЦЧШЩЬЫЪЄЭІЇЮЯ".split("");
    groups.push({
      name: "Cyrillic Uppercase",
      characters: cyrillicUpper,
    });
    const cyrillicLower = "абвгґдеёѐжзийѝклмнопрстуўфхцчшщьыъєэіїюя".split("");
    groups.push({
      name: "Cyrillic Lowercase",
      characters: cyrillicLower,
    });
    // Belarusian characters
    if (supportsBelarusian) {
      const belarusianUpper = "Ўў".split("");
      groups.push({
        name: "Belarusian",
        characters: belarusianUpper,
      });
    }
    // Bulgarian characters
    if (supportsBulgarian) {
      const bulgarianUpper = "ЀЍѐѝ".split("");
      groups.push({
        name: "Bulgarian",
        characters: bulgarianUpper,
      });
    }
  }

  // Georgian characters - Uppercase (Mtavruli) → Lowercase → Numerals → Punctuation
  if (supportsGeorgian) {
    const georgianMtavruli = "ᲐᲑᲒᲓᲔᲕᲖᲗᲘᲙᲚᲛᲜᲝᲞᲟᲠᲡᲢᲣᲤᲥᲦᲧᲨᲩᲪᲫᲬᲭᲮᲯᲰ".split("");
    groups.push({
      name: "Georgian Mtavruli",
      characters: georgianMtavruli,
    });
    const georgianLetters = "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ".split("");
    groups.push({
      name: "Georgian Lowercase",
      characters: georgianLetters,
    });
  }

  // Armenian characters - Uppercase → Lowercase → Numerals → Punctuation
  if (supportsArmenian) {
    const armenianUpper = "ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖ".split("");
    groups.push({
      name: "Armenian Uppercase",
      characters: armenianUpper,
    });
    const armenianLower = "աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև".split("");
    groups.push({
      name: "Armenian Lowercase",
      characters: armenianLower,
    });
  }

  // Greek characters - Uppercase → Lowercase → Numerals → Punctuation
  if (supportsGreek) {
    const greekUpper = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏΪΫϏ".split("");
    groups.push({
      name: "Greek Uppercase",
      characters: greekUpper,
    });
    const greekLower = "αβγδεζηθικλμνξοπρςστυφχψωίϊΐύϋΰόώάέήϗϰὶό".split("");
    groups.push({
      name: "Greek Lowercase",
      characters: greekLower,
    });
  }

  // N'Ko characters - Letters → Numerals → Punctuation
  if (supportsNko) {
    const nkoLetters = "ߊߋߌߍߎߏߐߑߒߓߔߕߖߗߘߙߚߛߜߝߞߟߠߡߢߣߤߥߦߧߨߩߪ߲߫߬߭߮߯߰߱߳ߴߵߺ".split("");
    groups.push({
      name: "N'Ko Letters",
      characters: nkoLetters,
    });
    groups.push({
      name: "N'Ko Numerals",
      characters: "߀߁߂߃߄߅߆߇߈߉".split(""),
    });
    groups.push({
      name: "N'Ko Punctuation",
      characters: "߷߸߹".split(""),
    });
  }

  // Symbols (universal)
  groups.push({
    name: "Symbols",
    characters: "@&|~^∞%‰↑↗→↘↓↙←↖↔↕".split(""),
  });

  // Currency symbols
  const currencySymbols = "₿¢¤$€₴₾₺₽₹₪£₩¥".split("");
  if (supportsArabic) {
    currencySymbols.push("﷼");
  }
  groups.push({
    name: "Currency",
    characters: currencySymbols,
  });

  // Mathematical symbols
  groups.push({
    name: "Mathematical",
    characters: "+−×÷=><~^∞%‰".split(""),
  });

  // Emojis
  groups.push({
    name: "Emojis",
    characters: "🚆".split(""),
  })

  return groups;
});
// Character existence detection using canvas
const characterExistsCache = ref<Map<string, boolean>>(new Map());
const isCheckingCharacters = ref(false);

const checkCharacterExists = async (char: string): Promise<boolean> => {
  // Check cache first
  if (characterExistsCache.value.has(char)) {
    return characterExistsCache.value.get(char)!;
  }

  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(true); // Server-side: assume exists
      return;
    }

    // Create a canvas to measure character rendering
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(true);
      return;
    }

    const fontSize = 100;
    const testFont = props.fontFamily.split(",")[0].replace(/"/g, "");
    const fallbackFont = "monospace";

    // Measure with the font
    ctx.font = `${getCurrentWeight()} ${fontSize}px ${testFont}, ${fallbackFont}`;
    const widthWithFont = ctx.measureText(char).width;

    // Measure with fallback only
    ctx.font = `${getCurrentWeight()} ${fontSize}px ${fallbackFont}`;
    const widthWithFallback = ctx.measureText(char).width;

    // If widths are the same (or very close), the character doesn't exist in the font
    // Also check if width is 0 (missing glyph)
    const exists =
      Math.abs(widthWithFont - widthWithFallback) > 0.1 && widthWithFont > 0;

    // Cache the result
    characterExistsCache.value.set(char, exists);
    resolve(exists);
  });
};

// Filter characters that exist in the font
const allCharacters = computed(() => {
  const all = new Set(
    characterGroups.value.flatMap((group) => group.characters)
  );
  return Array.from(all);
});

const filteredCharacters = ref<string[]>([]);

const filterCharacters = async () => {
  if (isCheckingCharacters.value) return;
  isCheckingCharacters.value = true;

  const all = allCharacters.value;
  const filtered: string[] = [];

  // Check characters in batches to avoid blocking
  const batchSize = 50;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    // Extract base character for checking (remove form markers)
    const results = await Promise.all(
      batch.map((char) => {
        const { baseChar } = getArabicCharAndForm(char);
        return checkCharacterExists(baseChar);
      })
    );
    batch.forEach((char, idx) => {
      if (results[idx]) {
        filtered.push(char);
      }
    });

    // Update filtered list incrementally
    filteredCharacters.value = [...filtered];

    // Small delay to prevent blocking
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  isCheckingCharacters.value = false;
};

const getCharCode = (char: string): string => {
  if (char.length === 0) return "0000";
  // Extract base character for Arabic characters with form markers
  const { baseChar } = getArabicCharAndForm(char);
  const codePoint = baseChar.codePointAt(0);
  if (codePoint === undefined) return "0000";
  return codePoint.toString(16).toUpperCase().padStart(4, "0");
};

// Check if a character is Arabic (handles both single chars and context strings)
const isArabicChar = (char: string): boolean => {
  if (!char || char.length === 0) return false;
  // Check all characters in the string for Arabic
  for (let i = 0; i < char.length; i++) {
    const codePoint = char.codePointAt(i) || 0;
    // Arabic Unicode range: U+0600 to U+06FF
    if (codePoint >= 0x0600 && codePoint <= 0x06FF) {
      return true;
    }
  }
  return false;
};
watch(
  samsaFontInstance,
  () => {
    // Font instance loaded
  },
  { immediate: true }
);

// Get PostScript glyph name from Samsa
const getGlyphName = (char: string): string => {
  if (char === " ") return "space";
  if (char.length === 0) return "unknown";

  // Extract base character for Arabic characters with form markers
  const { baseChar, form } = getArabicCharAndForm(char);

  // Try to get PostScript glyph name from Samsa if font is loaded
  if (samsaFontInstance.value && baseChar) {
    try {
      const charCode = baseChar.codePointAt(0) || 0;
      const glyphIndex =
        samsaFontInstance.value.cmap?.getGlyphIndex?.(charCode) ??
        samsaFontInstance.value.cmap?.glyphIndexMap?.[charCode];

      if (glyphIndex !== undefined) {
        // First, try to get the glyph name from the font's glyphNames array
        // This is populated from the post table in Samsa
        if (
          samsaFontInstance.value.glyphNames &&
          Array.isArray(samsaFontInstance.value.glyphNames) &&
          samsaFontInstance.value.glyphNames[glyphIndex]
        ) {
          return samsaFontInstance.value.glyphNames[glyphIndex];
        }

        // Second, try to get it from the glyph object's name property
        const glyph = samsaFontInstance.value.getGlyph(glyphIndex);
        if (glyph && glyph.name) {
          return glyph.name;
        }
      }
    } catch (e) {
      console.warn("Error getting PostScript glyph name from Samsa:", e);
    }
  }
  const arabicFormMap = {
    [FORM_INITIAL]: "initial",
    [FORM_MEDIAL]: "medial",
    [FORM_FINAL]: "final",
  };
  const arabicForm = arabicFormMap[form as keyof typeof arabicFormMap] || '';

  // Fallback: return the character itself
  return char === " " ? "space" : baseChar + (arabicForm ? ` (${arabicForm})` : '');
};

const selectCharacter = async (char: string) => {
  previewChar.value = char;
  // Load glyph outline for the selected character
  if (samsaFontInstance.value) {
    await loadGlyphOutline(char);
  }
};

// Watch for details toggle to load outline if needed
watch(showDetails, async (newValue) => {
  if (newValue && samsaFontInstance.value && !glyphOutline.value) {
    // Load outline when details is enabled
    await loadGlyphOutline(previewChar.value);
  }
});

// Load glyph outline and calculate metrics
const loadGlyphOutline = async (char: string) => {
  if (!samsaFontInstance.value || !char || char === " ") {
    console.warn("Cannot load glyph outline: missing font or character");
    return;
  }

  try {
    const samsaFont = samsaFontInstance.value;
    
    // Extract base character for Arabic characters with form markers
    const { baseChar } = getArabicCharAndForm(char);

    // Get glyph outline using Samsa composable
    // For variable fonts, pass the tuple with axis values in the order of font.axes
    let tuple: number[] | undefined = undefined;
    if (props.isVariableFont && samsaFont.axes) {
      tuple = samsaFont.axes.map((axis: any) => {
        if (axis.tag === "wght" || axis.tag === "WEIGHT") {
          return currentWeight.value;
        } else if (axis.tag === "SHPE") {
          return currentShape.value;
        }
        // Use default value for other axes
        return axis.default || 0;
      });
    }
    const outline = getGlyphOutline(samsaFont, baseChar, tuple);
    if (!outline) {
      console.warn("No outline returned for character:", char);
      return;
    }

    const bbox = outline.bbox;

    // Calculate scale for rendering
    const fontSize = 320; // 20rem = 320px
    const unitsPerEm = samsaFont.head?.unitsPerEm || 1000;
    const scale = fontSize / unitsPerEm;

    // Get metrics in font units
    const os2 = samsaFont.os2 || {};
    const hhea = samsaFont.hhea || {};
    const ascender = hhea.ascender ?? os2.sTypoAscender ?? 800;
    const descender = Math.abs(hhea.descender ?? os2.sTypoDescender ?? -200);
    const capHeight = os2.sCapHeight ?? os2.capHeight ?? 700;
    const xHeight = os2.sxHeight ?? os2.xHeight ?? 500;

    // Calculate metric positions relative to preview area
    // The character is rendered at 20rem (320px), centered vertically
    // In font units: baseline is at 0, positive Y goes up, negative Y goes down
    const baselineY = 0;
    const glyphBottom = bbox.yMin;
    const glyphTopVal = bbox.yMax;
    const totalHeight = glyphTopVal - glyphBottom;

    // Get the preview container height (20rem = 320px)
    // We need to map font units to screen pixels, then to percentages
    const previewHeight = 320; // 20rem in pixels

    // Calculate positions as percentages from top of preview area
    // The character is rendered at 20rem and centered vertically
    // We need to map font units to screen position
    if (totalHeight > 0 && unitsPerEm > 0) {
      // The character is rendered centered, so we calculate where each metric line
      // should be relative to the top of the preview area

      // Get the rendered character's bounding box in pixels
      const glyphHeightPx = totalHeight * scale;
      const glyphTopPx = glyphTopVal * scale;
      const glyphBottomPx = glyphBottom * scale;

      // The character is centered vertically, so the center is at 50% of preview height
      // Calculate where the top of the glyph would be
      const glyphTopPercent = 50 - (glyphHeightPx / 2 / previewHeight) * 100;

      // Now calculate metric positions relative to glyph top
      // In font units, baseline is at 0, capHeight and xHeight are positive values
      const baselinePxFromTop = (glyphTopVal - baselineY) * scale;
      const capHeightPxFromTop = (glyphTopVal - capHeight) * scale;
      const xHeightPxFromTop = (glyphTopVal - xHeight) * scale;

      // Convert to percentage from top of preview
      baselinePosition.value =
        glyphTopPercent + (baselinePxFromTop / previewHeight) * 100;
      capHeightPosition.value =
        glyphTopPercent + (capHeightPxFromTop / previewHeight) * 100;
      xHeightPosition.value =
        glyphTopPercent + (xHeightPxFromTop / previewHeight) * 100;
    }

    glyphOutline.value = {
      ...outline,
      scale,
      offsetX: -bbox.xMin * scale,
      offsetY: bbox.yMax * scale, // Flip Y
    };
  } catch (error) {
    console.warn("Failed to load glyph outline:", error);
    glyphOutline.value = null;
  }
};

// Get current characters array (filtered or all)
const currentCharacters = computed(() => {
  return filteredCharacters.value.length > 0
    ? filteredCharacters.value
    : allCharacters.value;
});

// Get current selected character index
const selectedIndex = computed(() => {
  return currentCharacters.value.indexOf(previewChar.value);
});

// Set grid item ref
const setGridItemRef = (el: any, index: number) => {
  if (el) {
    gridItemRefs.value.set(index, el);
  } else {
    gridItemRefs.value.delete(index);
  }
};

// Check if element is in viewport of scroll container
const isElementInView = (
  element: HTMLElement,
  container: HTMLElement
): boolean => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom &&
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right
  );
};

// Get grid columns by calculating from actual rendered grid
const getGridColumns = (): number => {
  if (typeof window === "undefined" || !gridContainer.value) return 4;
  
  // Get the computed grid template columns
  const computedStyle = window.getComputedStyle(gridContainer.value);
  const gridTemplateColumns = computedStyle.gridTemplateColumns;
  
  // If grid-template-columns is set, count the columns
  if (gridTemplateColumns && gridTemplateColumns !== "none") {
    // Split by spaces and filter out empty strings
    const columns = gridTemplateColumns.split(" ").filter((col) => col.trim() !== "");
    if (columns.length > 0) {
      return columns.length;
    }
  }
  
  // Fallback: calculate based on first row items
  // Get the first grid item's position
  const firstItem = gridItemRefs.value.get(0);
  if (!firstItem) return 4;
  
  const firstItemRect = firstItem.getBoundingClientRect();
  const containerRect = gridContainer.value.getBoundingClientRect();
  
  // Find how many items fit in the first row by checking their positions
  let cols = 0;
  for (let i = 0; i < currentCharacters.value.length; i++) {
    const item = gridItemRefs.value.get(i);
    if (!item) continue;
    
    const itemRect = item.getBoundingClientRect();
    // If item is on the same row (same top position within tolerance)
    if (Math.abs(itemRect.top - firstItemRect.top) < 5) {
      cols++;
    } else {
      // We've moved to the next row, stop counting
      break;
    }
  }
  
  return cols > 0 ? cols : 4; // Fallback to 4 if calculation fails
};

// Grid focus handlers
const handleGridFocus = () => {
  isGridFocused.value = true;
  // Attach keyboard listener when grid is focused
  if (typeof window !== 'undefined') {
    window.addEventListener("keydown", handleKeyDown);
  }
};

const handleGridBlur = () => {
  isGridFocused.value = false;
  // Remove keyboard listener when grid loses focus
  if (typeof window !== 'undefined') {
    window.removeEventListener("keydown", handleKeyDown);
  }
};

// Arrow key navigation
const handleKeyDown = (e: KeyboardEvent) => {
  // Only handle if grid is focused
  if (!isGridFocused.value) return;
  
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    e.preventDefault();


    const chars = currentCharacters.value;
    if (chars.length === 0) return;

    const currentIdx = selectedIndex.value >= 0 ? selectedIndex.value : 0;
    const cols = getGridColumns();
    if (cols === 0) return; // Safety check
    
    const rows = Math.ceil(chars.length / cols);
    const currentRow = Math.floor(currentIdx / cols);
    const currentCol = currentIdx % cols;
    let newIdx = currentIdx;

    switch (e.key) {
      case "ArrowLeft":
        // Move left
        if (currentCol > 0) {
          // Not at start of row, move left
          newIdx = currentIdx - 1;
        } else if (currentRow > 0) {
          // At start of row, move to end of previous row
          const prevRowStart = (currentRow - 1) * cols;
          const prevRowEnd = Math.min(prevRowStart + cols - 1, chars.length - 1);
          newIdx = prevRowEnd;
        } else {
          // At start of first row, wrap to last item
          newIdx = chars.length - 1;
        }
        break;
      case "ArrowRight":
        // Move right
        if (currentCol < cols - 1 && currentIdx < chars.length - 1) {
          // Not at end of row, move right
          newIdx = currentIdx + 1;
        } else if (currentRow < rows - 1) {
          // At end of row, move to start of next row
          newIdx = (currentRow + 1) * cols;
        } else {
          // At end of last row, wrap to first item
          newIdx = 0;
        }
        break;
      case "ArrowUp":
        // Move up one row
        if (currentRow > 0) {
          newIdx = currentIdx - cols;
        } else {
          // Wrap to same column in last row
          const lastRowStart = (rows - 1) * cols;
          const targetIdx = lastRowStart + currentCol;
          newIdx = targetIdx < chars.length ? targetIdx : chars.length - 1;
        }
        break;
      case "ArrowDown":
        // Move down one row
        const nextRowIdx = currentIdx + cols;
        if (nextRowIdx < chars.length) {
          newIdx = nextRowIdx;
        } else {
          // Wrap to same column in first row
          newIdx = currentCol;
        }
        break;
    }

    // Ensure index is within bounds
    newIdx = Math.max(0, Math.min(newIdx, chars.length - 1));
    previewChar.value = chars[newIdx];

    // Scroll into view if element is outside viewport
    nextTick(() => {
    const target = document.querySelector("[data-selected=true]");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    });
  }
};

const handleWeightDrag = (e: MouseEvent) => {
  if (!isDraggingWeight.value || !props.isVariableFont) return;

  const previewArea = e.currentTarget as HTMLElement;
  const rect = previewArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));

  const { min, max } = weightRange.value;
  currentWeight.value = Math.round(min + percentage * (max - min));
};

const startWeightDrag = (e: MouseEvent) => {
  if (props.isVariableFont && (e.target as HTMLElement).closest(".flex-1")) {
    isDraggingWeight.value = true;
    handleWeightDrag(e); // Update immediately on click
  }
};

const stopWeightDrag = () => {
  isDraggingWeight.value = false;
};

const startWeightSliderDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDraggingWeightSlider.value = true;

  const slider = (e.currentTarget as HTMLElement).closest(".relative");
  if (!slider) return;

  const isTouch = e.type.startsWith('touch');
  const getClientX = (event: MouseEvent | TouchEvent): number => {
    if (isTouch && 'touches' in event && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return (event as MouseEvent).clientX;
  };

  const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
    const rect = slider.getBoundingClientRect();
    const x = getClientX(moveEvent) - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const { min, max } = weightRange.value;
    currentWeight.value = Math.round(min + percentage * (max - min));
  };

  const handleUp = () => {
    isDraggingWeightSlider.value = false;
    document.removeEventListener("mousemove", handleMove as EventListener);
    document.removeEventListener("mouseup", handleUp);
    document.removeEventListener("touchmove", handleMove as EventListener);
    document.removeEventListener("touchend", handleUp);
  };

  // Update immediately on click/touch
  const rect = slider.getBoundingClientRect();
  const x = getClientX(e) - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  const { min, max } = weightRange.value;
  currentWeight.value = Math.round(min + percentage * (max - min));

  if (isTouch) {
    document.addEventListener("touchmove", handleMove as EventListener, { passive: false });
    document.addEventListener("touchend", handleUp);
  } else {
    document.addEventListener("mousemove", handleMove as EventListener);
    document.addEventListener("mouseup", handleUp);
  }
};

const startShapeSliderDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDraggingShapeSlider.value = true;

  const slider = (e.currentTarget as HTMLElement).closest(".relative");
  if (!slider) return;

  const isTouch = e.type.startsWith('touch');
  const getClientX = (event: MouseEvent | TouchEvent): number => {
    if (isTouch && 'touches' in event && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return (event as MouseEvent).clientX;
  };

  const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
    const rect = slider.getBoundingClientRect();
    const x = getClientX(moveEvent) - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const { min, max } = shapeRange.value;
    currentShape.value = min + percentage * (max - min);
  };

  const handleUp = () => {
    isDraggingShapeSlider.value = false;
    document.removeEventListener("mousemove", handleMove as EventListener);
    document.removeEventListener("mouseup", handleUp);
    document.removeEventListener("touchmove", handleMove as EventListener);
    document.removeEventListener("touchend", handleUp);
  };

  // Update immediately on click/touch
  const rect = slider.getBoundingClientRect();
  const x = getClientX(e) - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  const { min, max } = shapeRange.value;
  currentShape.value = min + percentage * (max - min);

  if (isTouch) {
    document.addEventListener("touchmove", handleMove as EventListener, { passive: false });
    document.addEventListener("touchend", handleUp);
  } else {
    document.addEventListener("mousemove", handleMove as EventListener);
    document.addEventListener("mouseup", handleUp);
  }
};

// Wait for font to load
const waitForFont = async (): Promise<void> => {
  if (typeof document === "undefined") return;

  const fontName = props.fontFamily.split(",")[0].replace(/"/g, "").trim();

  // Check if document.fonts API is available
  if (document.fonts && "ready" in document.fonts) {
    // Wait for font to load
    try {
      await document.fonts.ready;
      // Give it a bit more time for the specific font
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (e) {
      // Font API not available, just wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } else {
    // Fallback: wait a bit for font to load
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

// Initialize with first available character and filter
onMounted(async () => {
  // Wait for font to load first
  await waitForFont();

  // Load font metrics using samsa
  await loadFontMetrics();

  // Start filtering characters
  await filterCharacters();

  // Set initial preview character from filtered list
  if (filteredCharacters.value.length > 0) {
    previewChar.value = filteredCharacters.value[0];
  } else if (allCharacters.value.length > 0) {
    // Fallback to first character if filtering hasn't completed
    previewChar.value = allCharacters.value[0];
  }
});

onUnmounted(() => {
  // Remove keyboard event listener if still attached
  if (typeof window !== 'undefined') {
    window.removeEventListener("keydown", handleKeyDown);
  }
});
</script>
