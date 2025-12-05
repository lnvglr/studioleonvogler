<template>
  <div class="bg-green-700 flex w-full" style="min-height: 100vh;">
    <!-- Left Sticky Preview Panel -->
    <div
      class="sticky-preview flex-shrink-0 w-1/2 border-r border-green-300 flex flex-col"
    >
      <!-- Header -->
      <div class="p-6 border-b border-green-300">
        <h2 class="text-4xl font-medium mb-6 text-white">Glyphs</h2>
        <div class="flex items-center gap-6">
            <!-- Weight Slider (for variable fonts) -->
            <div v-if="isVariableFont" class="flex items-center gap-4">
              <span class="text-sm text-white/70">Weight</span>
              <div class="relative w-32 h-1 bg-green-500 rounded-full">
                <div
                  class="absolute top-1/2 -translate-y-1/2 h-full bg-white rounded-full"
                  :style="{ width: `${weightPercentage}%` }"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full cursor-pointer"
                  :style="{ left: `${weightPercentage}%` }"
                  @mousedown="startWeightSliderDrag"
                ></div>
              </div>
              <span class="text-sm text-white font-medium tabular-nums">{{
                currentWeight
              }}</span>
            </div>
            <!-- Details Toggle -->
            <div class="flex items-center gap-2 hidden">
              <span class="text-sm text-white/70">Details</span>
              <button
                @click="showDetails = !showDetails"
                class="w-10 h-6 rounded-full transition-colors relative"
                :class="showDetails ? 'bg-white' : 'bg-green-500'"
              >
                <div
                  class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                  :class="showDetails ? 'translate-x-4 bg-green-600' : 'bg-white'"
                ></div>
              </button>
            </div>
          <!-- Character Info -->
          <div class="ml-auto text-sm text-white/70">
            <span class="font-medium text-white">{{
              previewChar === " " ? "SPACE" : previewChar
            }}</span>
            <span class="mx-2">•</span>
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
        <div v-if="showDetails && fontMetrics && glyphOutline" class="absolute inset-0 pointer-events-none z-20">
          <!-- Cap Height -->
          <div
            class="absolute left-0 right-0 border-t-2 border-white"
            :style="{ 
              top: `${capHeightPosition}%`,
            }"
          >
            <span class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
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
            <span class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
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
            <span class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Baseline</span
            >
          </div>
        </div>

        <!-- Large Character Preview -->
        <div
          class="text-center select-none relative"
          :style="{
            fontFamily: fontFamily,
            fontWeight: getCurrentWeight(),
            fontSize: '20rem',
            lineHeight: 1,
            cursor: isVariableFont ? 'ew-resize' : 'default',
          }"
        >
          <!-- Character container for proper baseline alignment -->
          <div
            class="relative inline-block"
            :style="{
              fontFamily: fontFamily,
              fontWeight: getCurrentWeight(),
              fontSize: '20rem',
              lineHeight: 1,
            }"
          >
            <!-- Character text (semi-transparent when details enabled for reference) -->
            <div
              :style="{
                color: showDetails ? 'rgba(255, 255, 255, 0.2)' : 'white',
              }"
            >
              {{ previewChar === " " ? "·" : previewChar }}
            </div>
            
            <!-- SVG with glyph outline and handles (when details enabled) -->
            <svg
              v-if="showDetails && glyphOutline && glyphOutline.path"
              class="absolute inset-0 w-full h-full"
              :viewBox="`${glyphOutline.bbox.xMin - 100} ${-glyphOutline.bbox.yMax - 100} ${(glyphOutline.bbox.xMax - glyphOutline.bbox.xMin) + 200} ${(glyphOutline.bbox.yMax - glyphOutline.bbox.yMin) + 200}`"
              preserveAspectRatio="xMidYMid meet"
              style="pointer-events: none; z-index: 10;"
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
              <g v-if="glyphOutline.controlPoints && glyphOutline.controlPoints.length > 0" style="pointer-events: none;">
                <!-- On-curve points (nodes) - filled circles -->
                <circle
                  v-for="(point, idx) in glyphOutline.controlPoints.filter(p => p.onCurve)"
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
                  v-for="(point, idx) in glyphOutline.controlPoints.filter(p => !p.onCurve)"
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
    <div ref="gridScrollContainer" class="flex-1 overflow-y-auto h-auto">
      <div
        ref="gridContainer"
        class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-px"
      >
        <div
          v-for="(char, charIdx) in currentCharacters"
          :key="charIdx"
          :ref="(el) => setGridItemRef(el, charIdx)"
          class="aspect-square flex items-center justify-center ring-1 ring-green-300 transition-colors cursor-pointer group relative text-3xl text-white"
          :class="
            previewChar === char
              ? 'bg-green-500 ring-green-300'
              : ''
          "
          :style="{
            fontFamily: fontFamily,
            fontWeight: getCurrentWeight(),
          }"
          @click="selectCharacter(char)"
        >
          <span>{{ char === " " ? "·" : char }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useSamsa } from "~/composables/useSamsa";

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
const gridScrollContainer = ref<HTMLElement | null>(null);
const gridContainer = ref<HTMLElement | null>(null);
const gridItemRefs = ref<Map<number, HTMLElement>>(new Map());

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

// Load font and get metrics using samsa
const loadFontMetrics = async () => {
  if (typeof window === 'undefined' || !props.fontId) return;
  
  try {
    // Get font file path from font data
    const { getFontById } = await import('~/data/fonts');
    const font = getFontById(props.fontId);
    if (!font || !font.variants[0]) return;
    
    const fontFile = font.variants[0].file;
    const fontUrl = fontFile.startsWith('/') ? fontFile : `/${fontFile}`;
    
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
    console.warn('Failed to load font metrics:', error);
  }
};

// Generate all supported characters based on languages
const characterGroups = computed(() => {
  const groups: Array<{ name: string; characters: string[] }> = [];

  // Check if font supports Latin/English
  const supportsLatin =
    !props.supportedLanguages ||
    props.supportedLanguages.length === 0 ||
    props.supportedLanguages.some(
      (lang) =>
        lang.toLowerCase().includes("latin") ||
        lang.toLowerCase().includes("english")
    );

  // Check if font supports Hebrew
  const supportsHebrew = props.supportedLanguages?.some((lang) =>
    lang.toLowerCase().includes("hebrew")
  );

  // Check if font supports Arabic
  const supportsArabic = props.supportedLanguages?.some((lang) =>
    lang.toLowerCase().includes("arabic")
  );

  // Check if font supports Cyrillic
  const supportsCyrillic = props.supportedLanguages?.some(
    (lang) =>
      lang.toLowerCase().includes("cyrillic") ||
      lang.toLowerCase().includes("russian")
  );

  // Check if font supports Georgian
  const supportsGeorgian = props.supportedLanguages?.some((lang) =>
    lang.toLowerCase().includes("georgian")
  );

  // Check if font supports Greek
  const supportsGreek = props.supportedLanguages?.some((lang) =>
    lang.toLowerCase().includes("greek")
  );

  // Check if font supports N'Ko
  const supportsNko = props.supportedLanguages?.some(
    (lang) =>
      lang.toLowerCase().includes("nko") || lang.toLowerCase().includes("n'ko")
  );

  // Latin characters
  if (supportsLatin) {
    groups.push({
      name: "Uppercase",
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    });
    groups.push({
      name: "Lowercase",
      characters: "abcdefghijklmnopqrstuvwxyz".split(""),
    });
    
    // Extended Latin with diacritics from font
    groups.push({
      name: "Latin Extended",
      characters: "AÁĂÂÄÀÅÃÆBCÇDÐEÉÊËÈFGĞHIĲÏİJKLMNÑOÓÔÖÒŐØÕŒPÞQRSŞẞTUÚÛÜÙVWXYŸZaăäåæbcçdðeëfgğhiıíîïìĳjȷklmnñoöőøõœpþqrsşßtuüvwxyz".split(""),
    });
  }

  // Numbers (universal)
  groups.push({
    name: "Numbers",
    characters: "0123456789".split(""),
  });

  // Hebrew characters
  if (supportsHebrew) {
    // Extended Hebrew from font
    const hebrewLetters = "אבגדהוזחטיךכלםמןנסעףפץצקרשת".split("");
    groups.push({
      name: "Hebrew",
      characters: hebrewLetters,
    });
  }

  // Arabic characters
  if (supportsArabic) {
    // Extended Arabic from font
    const arabicLetters = "ءأإآٱٮبپتثجچحخدذرسشصضطظعغفڤڡٯقكکگلمنںهہھةوؤىيئـ".split("");
    groups.push({
      name: "Arabic",
      characters: arabicLetters,
    });
    const arabicNumbers = "٠١٢٣٤٥٦٧٨٩".split("");
    groups.push({
      name: "Arabic-Indic Numerals",
      characters: arabicNumbers,
    });
    // Arabic punctuation
    groups.push({
      name: "Arabic Punctuation",
      characters: "،؛؟٭".split(""),
    });
  }

  // Cyrillic characters
  if (supportsCyrillic) {
    // Extended Cyrillic from font
    const cyrillicUpper = "АБВГҐДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЬЫЪЄЭІЇЮЯ".split("");
    groups.push({
      name: "Cyrillic Uppercase",
      characters: cyrillicUpper,
    });
    const cyrillicLower = "абвгґдеёжзийклмнопрстуфхцчшщьыъєэіїюя".split("");
    groups.push({
      name: "Cyrillic Lowercase",
      characters: cyrillicLower,
    });
  }

  // Georgian characters
  if (supportsGeorgian) {
    // Extended Georgian from font (including Mtavruli)
    const georgianMtavruli = "ᲐᲑᲒᲓᲔᲕᲖᲗᲘᲙᲚᲛᲜᲝᲞᲟᲠᲡᲢᲣᲤᲥᲦᲧᲨᲩᲪᲫᲬᲭᲮᲯᲰ".split("");
    groups.push({
      name: "Georgian Mtavruli",
      characters: georgianMtavruli,
    });
    const georgianLetters = "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ".split("");
    groups.push({
      name: "Georgian",
      characters: georgianLetters,
    });
  }

  // Greek characters
  if (supportsGreek) {
    // Extended Greek with accents from font
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

  // N'Ko characters
  if (supportsNko) {
    // Extended N'Ko from font
    const nkoLetters =
      "ߊߋߌߍߎߏߐߑߒߓߔߕߖߗߘߙߚߛߜߝߞߟߠߡߢߣߤߥߦߧߨߩߪ߲߫߬߭߮߯߰߱߳ߴߵߺ".split("");
    groups.push({
      name: "N'Ko",
      characters: nkoLetters,
    });
    // N'Ko numbers
    groups.push({
      name: "N'Ko Numbers",
      characters: "߀߁߂߃߄߅߆߇߈߉".split(""),
    });
    // N'Ko punctuation
    groups.push({
      name: "N'Ko Punctuation",
      characters: "߷߸߹".split(""),
    });
  }

  // Punctuation (universal)
  groups.push({
    name: "Punctuation",
    characters: [...(".,:;…!¡?¿·•*#/\\-–—_(){}[]".split("")), "‚", "„", "\"", "\"", "'", "'", "«", "»", "‹", "›", "'", '"', "ʹ", "͵"],
  });

  // Symbols (universal)
  groups.push({
    name: "Symbols",
    characters: "@&|~^∞%‰↑↗→↘↓↙←↖↔↕".split(""),
  });


  // Currency symbols
  groups.push({
    name: "Currency",
    characters: "₿¢¤$€₴₾₺₽₹₪£₩¥".split(""),
  });

  // Mathematical symbols
  groups.push({
    name: "Mathematical",
    characters: "+−×÷=><~^∞%‰".split(""),
  });
  
  // Special symbols
  groups.push({
    name: "Special Symbols",
    characters: "﴾﴿־".split(""),
  });

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
  const all = new Set(characterGroups.value.flatMap((group) => group.characters));
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
    const results = await Promise.all(
      batch.map((char) => checkCharacterExists(char))
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
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "0000";
  return codePoint.toString(16).toUpperCase().padStart(4, "0");
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
  if (!samsaFontInstance.value || !char || char === ' ') {
    console.warn('Cannot load glyph outline: missing font or character');
    return;
  }
  
  try {
    const samsaFont = samsaFontInstance.value;
    
    // Get glyph outline using Samsa composable
    // For variable fonts, pass the current weight as tuple
    const tuple = props.isVariableFont ? [currentWeight.value] : undefined;
    const outline = getGlyphOutline(samsaFont, char, tuple);
    if (!outline) {
      console.warn('No outline returned for character:', char);
      return;
    }
    
    console.log('Loaded glyph outline:', {
      char,
      hasPath: !!outline.path,
      pathLength: outline.path?.length,
      bbox: outline.bbox,
      controlPoints: outline.controlPoints?.length || 0
    });
    
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
      baselinePosition.value = glyphTopPercent + (baselinePxFromTop / previewHeight) * 100;
      capHeightPosition.value = glyphTopPercent + (capHeightPxFromTop / previewHeight) * 100;
      xHeightPosition.value = glyphTopPercent + (xHeightPxFromTop / previewHeight) * 100;
    }
    
    glyphOutline.value = {
      ...outline,
      scale,
      offsetX: -bbox.xMin * scale,
      offsetY: bbox.yMax * scale, // Flip Y
    };
    
  } catch (error) {
    console.warn('Failed to load glyph outline:', error);
    glyphOutline.value = null;
  }
};

// Get current characters array (filtered or all)
const currentCharacters = computed(() => {
  return filteredCharacters.value.length > 0 ? filteredCharacters.value : allCharacters.value;
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
const isElementInView = (element: HTMLElement, container: HTMLElement): boolean => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom &&
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right
  );
};

// Get grid columns based on screen size
const getGridColumns = (): number => {
  if (typeof window === 'undefined') return 4;
  const width = window.innerWidth;
  if (width >= 1280) return 12; // xl:grid-cols-12
  if (width >= 1024) return 10; // lg:grid-cols-10
  if (width >= 768) return 8;   // md:grid-cols-8
  if (width >= 640) return 6;    // sm:grid-cols-6
  return 4;                       // grid-cols-4
};

// Arrow key navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    
    const chars = currentCharacters.value;
    if (chars.length === 0) return;
    
    const currentIdx = selectedIndex.value >= 0 ? selectedIndex.value : 0;
    const cols = getGridColumns();
    let newIdx = currentIdx;
    
    switch (e.key) {
      case 'ArrowLeft':
        newIdx = currentIdx > 0 ? currentIdx - 1 : chars.length - 1;
        break;
      case 'ArrowRight':
        newIdx = currentIdx < chars.length - 1 ? currentIdx + 1 : 0;
        break;
      case 'ArrowUp':
        newIdx = currentIdx >= cols ? currentIdx - cols : chars.length - (cols - currentIdx);
        break;
      case 'ArrowDown':
        newIdx = currentIdx < chars.length - cols ? currentIdx + cols : currentIdx % cols;
        break;
    }
    
    // Ensure index is within bounds
    newIdx = Math.max(0, Math.min(newIdx, chars.length - 1));
    previewChar.value = chars[newIdx];
    
    // Scroll into view if element is outside viewport
    nextTick(() => {
      const selectedElement = gridItemRefs.value.get(newIdx);
      const scrollContainer = gridScrollContainer.value;
      
      if (selectedElement && scrollContainer) {
        // Check if element is already in view
        if (!isElementInView(selectedElement, scrollContainer)) {
          const elementRect = selectedElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const currentScrollTop = scrollContainer.scrollTop;
          
          // Calculate element position relative to scroll container's content
          // We need to find the element's position within the scrollable content
          const gridContainerEl = gridContainer.value;
          if (gridContainerEl) {
            const gridRect = gridContainerEl.getBoundingClientRect();
            // Element's top position relative to grid container + current scroll
            const elementTopInContent = elementRect.top - gridRect.top + currentScrollTop;
            const elementBottomInContent = elementTopInContent + elementRect.height;
            const containerHeight = scrollContainer.clientHeight;
            
            let newScrollTop = currentScrollTop;
            
            // If element is above visible area, scroll to show it at top
            if (elementRect.top < containerRect.top) {
              newScrollTop = elementTopInContent;
            }
            // If element is below visible area, scroll to show it at bottom
            else if (elementRect.bottom > containerRect.bottom) {
              newScrollTop = elementBottomInContent - containerHeight;
            }
            
            // Smooth scroll
            scrollContainer.scrollTo({
              top: Math.max(0, newScrollTop),
              behavior: 'smooth'
            });
          }
        }
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

const startWeightSliderDrag = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDraggingWeightSlider.value = true;

  const slider = (e.currentTarget as HTMLElement).closest(".relative");
  if (!slider) return;

  const handleMove = (moveEvent: MouseEvent) => {
    const rect = slider.getBoundingClientRect();
    const x = moveEvent.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const { min, max } = weightRange.value;
    currentWeight.value = Math.round(min + percentage * (max - min));
  };

  const handleUp = () => {
    isDraggingWeightSlider.value = false;
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", handleUp);
  };

  // Update immediately on click
  const rect = slider.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  const { min, max } = weightRange.value;
  currentWeight.value = Math.round(min + percentage * (max - min));

  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", handleUp);
};

// Wait for font to load
const waitForFont = async (): Promise<void> => {
  if (typeof document === "undefined") return;

  const fontName = props.fontFamily.split(",")[0].replace(/"/g, "").trim();

  // Check if document.fonts API is available
  if (document.fonts && 'ready' in document.fonts) {
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
  
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown);
});

</script>

<style scoped>
.sticky-preview {
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

</style>
