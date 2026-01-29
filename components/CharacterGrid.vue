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
              <div class="relative w-full h-1 bg-green-500 rounded-full col-start-1 row-start-2 col-span-2 touch-none" style="touch-action: none;" :style="{
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
              <div class="relative w-full h-1 bg-green-500 rounded-full col-start-1 row-start-2 col-span-2 touch-none" style="touch-action: none;" :style="{
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
            <!-- JUST Axis Slider -->
            <div v-if="isVariableFont && hasJustAxis" class="grid grid-cols-2 grid-rows-2 items-center gap-x-4 gap-y-0">
              <span class="text-sm text-white/70">Just</span>
              <div class="relative w-full h-1 bg-green-500 rounded-full col-start-1 row-start-2 col-span-2 touch-none" style="touch-action: none;" :style="{
                '--w': `calc(${justPercentage}% - ${justPercentage/9}px)`
              }">
                <div
                  class="absolute top-1/2 -translate-y-1/2 h-full bg-white rounded-full w-[calc(var(--w)+3px)]"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 bg-white rounded-full cursor-pointer start-[calc(var(--w))] touch-none  w-3 h-3  pointer-coarse:w-5 pointer-coarse:h-5"
                  style="touch-action: none;"
                  @mousedown="startJustSliderDrag"
                  @touchstart="startJustSliderDrag"
                ></div>
              </div>
              <span class="text-sm text-white font-medium tabular-nums row-start-1 col-start-2 text-right">{{
                currentJust.toFixed()
              }}</span>
            </div>
            <!-- OpenType Features Dropdown -->
            <div v-if="availableFeatures.length > 0" class="relative" ref="featureDropdownRef">
              <button
                @click.stop="showFeatureDropdown = !showFeatureDropdown"
                class="flex flex-col items-start text-sm text-white/70 hover:text-white transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span>Features</span>
                  <svg 
                    class="w-4 h-4 transition-transform" 
                    :class="showFeatureDropdown ? 'rotate-180' : ''"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <span v-if="activeFeaturesDisplay" class="text-white font-medium font-mono text-xs">{{ activeFeaturesDisplay }}</span>
                <span v-else class="text-white/50 text-xs">none</span>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-if="showFeatureDropdown"
                class="absolute top-full left-0 mt-2 w-64 bg-green-800 border border-green-500 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <div class="max-h-64 overflow-y-auto" @mouseleave="hoveredFeatureTag = null">
                  <button
                    v-for="feature in availableFeatures"
                    :key="feature.tag"
                    @click.stop="toggleFeature(feature.tag)"
                    @mouseenter="handleFeatureHover(feature.tag)"
                    class="w-full px-4 py-2 flex items-start gap-3 hover:bg-green-700 transition-colors text-left"
                  >
                    <div 
                      class="mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                      :class="activeFeatures.has(feature.tag) ? 'bg-white border-white' : 'border-white/50'"
                    >
                      <svg 
                        v-if="activeFeatures.has(feature.tag)"
                        class="w-3 h-3 text-green-700" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-white/50 font-mono uppercase">{{ feature.tag }}</span>
                        <span class="text-sm text-white font-medium truncate">{{ feature.name }}</span>
                      </div>
                      <p v-if="feature.description" class="text-xs text-white/60 mt-0.5 line-clamp-2">{{ feature.description }}</p>
                    </div>
                  </button>
                </div>
              </div>
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
          <div class="flex sm:flex-col self-start sm:items-end ml-auto text-sm gap-x-4 w-full">
            <span class="text-white text-xl leading-none" :class="{ 'font-arabic': isArabicChar(previewChar) }">{{
              previewCharWithFormLabel
            }}</span>
            <span class="text-white/70 text-xs font-normal text-right leading-none mt-1 max-w-full text-balance">{{ displayedGlyphNameFormatted }}</span>
          </div>
        </div>
      </div>

      <!-- Character Preview Area -->
      <div
        class="flex-1 relative flex items-center justify-center overflow-hidden text-[10rem] sm:text-[20rem]"
        @mousemove="handleWeightDrag"
        @mouseup="stopWeightDrag"
        @mouseleave="stopWeightDrag"
        @mousedown="startWeightDrag"
      >
        <!-- Typographic Metrics (if details enabled) -->
          <!-- v-if="showDetails && fontMetrics && glyphOutline" -->
        <div
          class="absolute pointer-events-none z-20 h-[1em] bottom-[calc(50%-0.19em)] w-full opacity-50"
        >
          <!-- Cap Height -->
          <div
            class="absolute left-0 right-0 border-t border-green-300"
            :style="{
              bottom:  `${(fontMetrics?.capHeight ?? 0)}em`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Cap height</span
            >
          </div>
          <!-- X-Height -->
          <div
            class="absolute left-0 right-0 border-t border-green-300"
            :style="{
              bottom: `${(fontMetrics?.xHeight ?? 0) * 100}%`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >x-height</span
            >
          </div>
          <!-- Baseline -->
          <div
            class="absolute left-0 right-0 border-t border-green-300"
            :style="{
              bottom: '0%',
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Baseline</span
            >
          </div>
          <!-- Descender line -->
          <div
            class="absolute left-0 right-0 border-t border-green-300"
            :style="{
              bottom: `${(fontMetrics?.descender ?? 0) * -100}%`,
            }"
          >
            <span
              class="absolute left-4 -translate-y-1/2 text-xs text-white font-medium bg-green-700 px-2 py-0.5 rounded whitespace-nowrap"
              >Descender</span
            >
          </div>
        </div>

        <!-- Large Character Preview -->
        <div
          class="text-center select-none relative translate-y-[-0.19em] z-50"
          :style="{
            cursor: isVariableFont ? 'ew-resize' : 'default',
          }"
        >
          <!-- Character container for proper baseline alignment -->
          <div
            class="relative inline-block"
            :style="{
              fontFamily: fontFamily,
              fontWeight: getCurrentWeight(),
              fontVariationSettings: fontVariationSettings,
              fontFeatureSettings: fontFeatureSettingsCSS,
              fontLanguageOverride: fontLanguageOverride,
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
              v-if="glyphOutline?.path"
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
                stroke-width="2"
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
            fontFeatureSettings: fontFeatureSettingsCSS,
            fontLanguageOverride: fontLanguageOverride,
          }"
      >
        <div
          v-for="(char, charIdx) in currentCharacters"
          :key="charIdx"
          :ref="(el) => setGridItemRef(el, charIdx)"
          class="aspect-square flex items-center justify-center ring-1 ring-green-300 transition-all cursor-pointer group relative text-4xl text-white hover:ring-green-200 hover:bg-green-600 overflow-hidden"
          :data-selected="previewChar === char"
          :class="previewChar === char ? 'bg-green-500 ring-green-300' : ''"
          :style="{ opacity: isCharDimmed(char) ? 0.2 : 1 }"
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

interface FontFeatureMetadata {
  name: string;
  description?: string;
  exampleText: string;
  enabledText?: string;
  enabledByDefault?: boolean;
  highlighted?: string | string[];
  languageTag?: string;
}

interface Props {
  fontFamily: string;
  fontWeight: number | string;
  fontId?: string;
  supportedLanguages?: string[];
  isVariableFont?: boolean;
  weightRange?: { min: number; max: number };
  featureMetadata?: Record<string, FontFeatureMetadata>;
}

const props = withDefaults(defineProps<Props>(), {
  isVariableFont: false,
  weightRange: () => ({ min: 100, max: 900 }),
  featureMetadata: () => ({}),
});

// OpenType feature state
const activeFeatures = ref<Set<string>>(new Set());
const showFeatureDropdown = ref(false);
const featureDropdownRef = ref<HTMLElement | null>(null);
const hoveredFeatureTag = ref<string | null>(null);

// Features to exclude (irrelevant for individual glyphs)
const excludedFeatures = new Set(['calt', 'dlig', 'liga', 'rlig']);

// Supported glyphs spec (character/glyph list from font). Format: "Char/GlyphName" or "Char" per token; "/f_f.dlig" -> ﬀ, "/f_t.dlig" -> ﬅ.
const SUPPORTED_GLYPHS_SPEC =
  "AÁĂÂÄÀÅÃÆBCÇĊDĐÐEÉÊËĖÈẼƏƷǮFGĞĠǤHĦIĲÍÎÏİÌĨJ/Jacute KLMNÑŊOÓÔÖÒŐØÕŒPÞQRSŞȘẞTŦȚUÚÛÜÙŮŨVWẂŴẄẀXYÝŶŸỲỸZŻꞋaáăâäàåãæbcçċdđðeéêëėèẽəʒǯfgğġǥhħiıíîï/idotaccent ìĩĳjȷ/jacute klmnñŋoóôöòőøõœpþqrsşșßtŧțuúûüùůũvwẃŵẅẁxyýŷÿỳỹzżꞌ/f_f.dlig/f_t.dlig " +
  "АБВГЃҐД/De-cy.loclBGR ЕЀЁЖЗИЙЍКЌЛ/El-cy.loclBGR МНОПРСТУЎФ/Ef-cy.loclBGR ХЦЧШЩЏЬЫЪЉЊЅЄЭІЇЈЋЮЯЂѢѪаб/be-cy.loclSRBMKD в/ve-cy.loclBGR г/ge-cy.loclBGR ѓґд/de-cy.loclBGR/de-cy.ss01 еѐёж/zhe-cy.loclBGR з/ze-cy.loclBGR и/ii-cy.loclBGR й/iishort-cy.loclBGR ѝк/ka-cy.loclBGR ќл/el-cy.loclBGR мноп/pe-cy.loclBGR рст/te-cy.loclBGR уўфхц/tse-cy.loclBGR чш/sha-cy.loclBGR щ/shcha-cy.loclBGR џь/softsign-cy.loclBGR ыъ/hardsign-cy.loclBGR љњѕєэіїјћю/yu-cy.loclBGR яђѣѫ" +
  "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏΪΫϏαβγδεζηθικλμνξοπρςστυφχψωίϊΐύϋΰόώάέήϗϰὶό" +
  "ءا/alef-ar.fina أ/alefHamzaabove-ar.fina إ/alefHamzabelow-ar.fina آ/alefMadda-ar.fina ٱ/alefWasla-ar.fina ٮ/behDotless-ar.fina/behDotless-ar.medi/behDotless-ar.init ب/beh-ar.fina/beh-ar.medi/beh-ar.init پ/peh-ar.fina/peh-ar.medi/peh-ar.init ت/teh-ar.fina/teh-ar.medi/teh-ar.init ث/theh-ar.fina/theh-ar.medi/theh-ar.init ٹ/tteh-ar.fina/tteh-ar.medi/tteh-ar.init ج/jeem-ar.fina/jeem-ar.medi/jeem-ar.medi.cv01/jeem-ar.init/jeem-ar.init.cv01 چ/tcheh-ar.fina/tcheh-ar.medi/tcheh-ar.medi.cv01/tcheh-ar.init/tcheh-ar.init.cv01 ڃ/nyeh-ar.fina/nyeh-ar.medi/nyeh-ar.medi.cv01/nyeh-ar.init/nyeh-ar.init.cv01 ڄ/dyeh-ar.fina/dyeh-ar.medi/dyeh-ar.medi.cv01/dyeh-ar.init/dyeh-ar.init.cv01 ح/hah-ar.fina/hah-ar.medi/hah-ar.medi.001/hah-ar.medi.cv01/hah-ar.init/hah-ar.init.cv01 څ/hahThreedotsabove-ar.fina/hahThreedotsabove-ar.medi/hahThreedotsabove-ar.medi.cv01/hahThreedotsabove-ar.init/hahThreedotsabove-ar.init.cv01 خ/khah-ar.fina/khah-ar.medi/khah-ar.medi.cv01/khah-ar.init/khah-ar.init.cv01 د/dal-ar.fina ذ/thal-ar.fina ڈ/ddal-ar.fina ڎ/dul-ar.fina ر/reh-ar.fina ز/zain-ar.fina ڑ/rreh-ar.fina ڕ/rehVbelow-ar.fina ژ/jeh-ar.fina س/seen-ar.fina/seen-ar.medi/seen-ar.init ښ/seenDotbelowDotabove-ar.fina/seenDotbelowDotabove-ar.medi/seenDotbelowDotabove-ar.init ش/sheen-ar.fina/sheen-ar.medi/sheen-ar.init ص/sad-ar.fina/sad-ar.medi/sad-ar.init ض/dad-ar.fina/dad-ar.medi/dad-ar.init ط/tah-ar.fina/tah-ar.medi/tah-ar.init ظ/zah-ar.fina/zah-ar.medi/zah-ar.init ع/ain-ar.fina/ain-ar.medi/ain-ar.init غ/ghain-ar.fina/ghain-ar.medi/ghain-ar.init ف/feh-ar.fina/feh-ar.medi/feh-ar.init ڤ/veh-ar.fina/veh-ar.medi/veh-ar.init ڡ/fehDotless-ar.fina/fehDotless-ar.medi/fehDotless-ar.init ٯ/qafDotless-ar.fina ق/qaf-ar.fina/qaf-ar.medi/qaf-ar.init ك/kaf-ar.fina/kaf-ar.medi/kaf-ar.init ک/keheh-ar.fina/keheh-ar.medi/keheh-ar.init گ/gaf-ar.fina/gaf-ar.medi/gaf-ar.init ڪ/kafswash-ar.fina/kafswash-ar.medi/kafswash-ar.init ل/lam-ar.fina/lam-ar.medi/lam-ar.init ڵ/lamVabove-ar.init/lamVabove-ar.medi/lamVabove-ar.fina م/meem-ar.fina/meem-ar.medi/meem-ar.medi.cv02/meem-ar.init/meem-ar.init.cv02 ن/noon-ar.fina/noon-ar.medi/noon-ar.init ں/noonghunna-ar.fina ڻ/rnoon-ar.fina/rnoon-ar.medi/rnoon-ar.init ه/heh-ar.fina/heh-ar.medi/heh-ar.init ہ/hehgoal-ar.fina/hehgoal-ar.medi/hehgoal-ar.init ۂ/hehgoalHamzaabove-ar.fina ھ/hehDoachashmee-ar.fina/hehDoachashmee-ar.medi/hehDoachashmee-ar.init ة/tehMarbuta-ar.fina ۃ/tehMarbutagoal-ar.fina و/waw-ar.fina ۊ/wawTwodots-ar.fina ۏ/wawDotabove-ar.fina ؤ/wawHamzaabove-ar.fina ۆ/oe-ar.fina ى/alefMaksura-ar.fina ي/yeh-ar.cv03/yeh-ar.fina/yeh-ar.fina.cv03/yeh-ar.medi/yeh-ar.init ئ/yehHamzaabove-ar.fina/yehHamzaabove-ar.medi/yehHamzaabove-ar.init ێ/yehVabove-ar.fina/yehVabove-ar.medi/yehVabove-ar.init ی/yehFarsi-ar.fina/yehFarsi-ar.medi/yehFarsi-ar.init ے/yehbarree-ar.fina ۓ/yehbarreeHamzaabove-ar.fina ە/ae-ar.fina ݩ/noonVabove-ar.fina/noonVabove-ar.medi/noonVabove-ar.init ـ/alef_fathatan-ar/lam_alefWasla-ar/lam_alefWasla-ar.fina/jeem_comma-ar/tcheh_comma-ar/dyeh_comma-ar/hah_comma-ar/hahHamzaabove_comma-ar/hahThreedotsabove_comma-ar/khah_comma-ar/lam_alef-ar/lam_alef-ar.fina/lam_alefHamzaabove-ar/lam_alefHamzaabove-ar.fina/lam_alefHamzabelow-ar/lam_alefHamzabelow-ar.fina/lam_alefMadda-ar/lam_alefMadda-ar.fina/lam_meem-ar.init/lamVabove_alef-ar/lamVabove_alef-ar.fina/allah-ar " +
  "ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖաբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև" +
  "ᲐᲑᲒᲓ/Don-georgian.ss02 ᲔᲕᲖᲗᲘᲙᲚ/Las-georgian.ss02 ᲛᲜᲝᲞᲟᲠ/Rae-georgian.ss02 ᲡᲢᲣᲤᲥᲦᲧᲨᲩᲪᲫᲬ/Cil-georgian.ss02 ᲭᲮᲯᲰაბგდ/don-georgian.ss02 ევზთიკლ/las-georgian.ss02 მნოპჟრ/rae-georgian.ss02 სტუფქღყშჩცძწ/cil-georgian.ss02 ჭხჯჰ" +
  "א/alef-hb.jalt בגד/dalet-hb.jalt ה/he-hb.jalt וזחטיךכ/kaf-hb.jalt ל/lamed-hb.jalt ם/memFinal-hb.jalt מןנסעףפץצקר/resh-hb.jalt שת/tav-hb.jalt ﬡﬢﬣﬤﬥﬦﬧﬨ/vav_holam-hb/vav_dagesh-hb/shin_shindot-hb/shin_sindot-hb " +
  "ߊ/a-nko.fina/a-nko.medi/a-nko.init ߋ/ee-nko.fina/ee-nko.medi/ee-nko.init ߌ/i-nko.fina/i-nko.medi/i-nko.init ߍ/e-nko.fina/e-nko.medi/e-nko.init ߎ/u-nko.fina/u-nko.medi/u-nko.init ߏ/oo-nko.fina/oo-nko.medi/oo-nko.init ߐ/o-nko.fina/o-nko.medi/o-nko.init ߑ/dagbasinna-nko.fina/dagbasinna-nko.medi/dagbasinna-nko.init ߒ/n-nko.fina/n-nko.medi/n-nko.init ߓ/ba-nko.fina/ba-nko.medi/ba-nko.init ߔ/pa-nko.fina/pa-nko.medi/pa-nko.init ߕ/ta-nko.fina/ta-nko.medi/ta-nko.init ߖ/ja-nko.fina/ja-nko.medi/ja-nko.init ߗ/cha-nko.fina/cha-nko.medi/cha-nko.init ߘ/da-nko.fina/da-nko.medi/da-nko.init ߙ/ra-nko.fina/ra-nko.medi/ra-nko.init ߚ/rra-nko.fina/rra-nko.medi/rra-nko.init ߛ/sa-nko.fina/sa-nko.medi/sa-nko.init ߜ/gba-nko.fina/gba-nko.medi/gba-nko.init ߝ/fa-nko.fina/fa-nko.medi/fa-nko.init ߞ/ka-nko.fina/ka-nko.medi/ka-nko.init ߟ/la-nko.fina/la-nko.medi/la-nko.init ߠ/nawoloso-nko.fina/nawoloso-nko.medi/nawoloso-nko.init ߡ/ma-nko.fina/ma-nko.medi/ma-nko.init ߢ/nya-nko.fina/nya-nko.medi/nya-nko.init ߣ/na-nko.fina/na-nko.medi/na-nko.init ߤ/ha-nko.fina/ha-nko.medi/ha-nko.init ߥ/wa-nko.fina/wa-nko.medi/wa-nko.init ߦ/ya-nko.fina/ya-nko.medi/ya-nko.init ߧ/nyawoloso-nko.fina/nyawoloso-nko.medi/nyawoloso-nko.init ߨ/jonaja-nko.fina/jonaja-nko.medi/jonaja-nko.init ߩ/jonacha-nko.fina/jonacha-nko.medi/jonacha-nko.init ߪ/jonara-nko.fina/jonara-nko.medi/jonara-nko.init ߴߵߺ" +
  "٫٬٠/zero-ar.tf ١/one-ar.ss01/one-ar.tf/one-ar.tf.ss01 ٢/two-ar.ss01/two-ar.tf/two-ar.tf.ss01 ٣/three-ar.ss01/three-ar.tf/three-ar.tf.ss01 ٤/four-ar.tf ٥/five-ar.tf/five-ar.tf.ss01 ٦/six-ar.ss01/six-ar.tf/six-ar.tf.ss01 ٧/seven-ar.tf ٨/eight-ar.tf ٩/nine-ar.ss01/nine-ar.tf/nine-ar.tf.ss01 ۰۱/oneFarsi-ar.ss01 ۲/twoFarsi-ar.ss01 ۳/threeFarsi-ar.ss01 ۴/fourFarsi-ar.ss01/fourFarsi-ar.urdu ۵۶/sixFarsi-ar.ss01 ۷/sevenFarsi-ar.urdu ۸۹/nineFarsi-ar.ss01 ߀߁߂߃߄߅߆߇߈߉0123456789/zero.tf/one.tf/two.tf/three.tf/four.tf/five.tf/six.tf/seven.tf/eight.tf/nine.tf ⓪①②③④⑤⑥⑦⑧⑨/zero.circled.ss03/one.circled.ss03/two.circled.ss03/three.circled.ss03/four.circled.ss03/five.circled.ss03/six.circled.ss03/seven.circled.ss03/eight.circled.ss03/nine.circled.ss03 ⁰¹²³⁴⁵⁶⁷⁸⁹ ₀₁₂₃₄₅₆₇₈₉ " +
  " ·;۔،؛؟٭﴾﴿՚՛՜՝՞՟։֊׆׳״־߷߸߹.,:/colon.calt ;…!¡/exclamdown.calt ?¿/questiondown.calt ·•*#/numbersign.tf ⁋/\\-/hyphen.tf –—_(/parenleft.calt )/parenright.calt {/braceleft.calt }/braceright.calt [/bracketleft.calt ]/bracketright.calt ‚„\"\"''«/guillemetleft.calt »/guillemetright.calt ‹/guilsinglleft.calt ›/guilsinglright.calt \"'ʹ͵﷼/rial.001/rial.002/rial.tf ٪֏/dram-arm.tf ߶/ooDennen-nko.tf ฿/baht.tf " +
  "🌙🌞🌤🌥🌧🌨🌪🌫🌬🏃💨🚆🚗🚲/cloud_crescentMoon ☀☁⛅⛈@&¶§©®™°|¦†ℓ‡℮№₿/bitcoin.tf ¢/cent.tf ¤$/dollar.tf €/euro.tf ₴/hryvnia.tf ₾/lari.tf ₺/liraTurkish.tf ₽/ruble.tf ₹/rupeeIndian.tf ₪/sheqel.tf £/sterling.tf ₩¥/yen.tf " +
  "+/plus.calt −/minus.calt ×/multiply.calt ÷/divide.calt =/equal.calt ≠/notequal.calt >/greater.calt </less.calt ≥/greaterequal.calt ≤/lessequal.calt ±/plusminus.calt ≈/approxequal.calt ~¬/logicalnot.calt/asciitilde.calt ^∞∅/infinity.calt ∫∆∏∑√∂µ%‰↑↗→↘↓↙←↖↔↕◌◊/brevecomb-cy ΄/tonos.case ΅ؕ/dotabove-ar/dotbelow-ar/dotcenter-ar/twodotsverticalabove-ar/twodotsverticalbelow-ar/twodotshorizontalabove-ar/twodotshorizontalbelow-ar/threedotsdownabove-ar/threedotsdownbelow-ar/threedotsdowncenter-ar/threedotsupabove-ar/threedotsupbelow-ar/miniKeheh-ar/gafsarkashabove-ar/gafsarkashcenter-ar/doublestroke-ar ًٰٕٔ٘ՙְֱֲֳִֵֶַָׇֹֺֻּׁׂ̧߲߽߫߬߭߮߯߰߱߳̈̇̀́̂̆̊̃`ʼ/Indian/Paisa/colon-ar/paisa/symbol.svg";

function parseSupportedGlyphsSpec(spec: string): Array<{ name: string; characters: string[] }> {
  const LIGATURE_FF = "\uFB00"; // ﬀ
  const LIGATURE_FT = "\uFB05"; // ﬅ
  const flat: string[] = [];
  const tokens = spec.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const displayPart = token.includes("/") ? token.slice(0, token.indexOf("/")) : token;
    if (displayPart.length > 0) {
      for (const c of [...displayPart]) {
        flat.push(c);
      }
    } else if (token.includes("f_f.dlig")) {
      flat.push(LIGATURE_FF);
    } else if (token.includes("f_t.dlig")) {
      flat.push(LIGATURE_FT);
    }
  }
  function scriptGroup(c: string): string {
    const code = c.codePointAt(0) ?? 0;
    if (c === LIGATURE_FF || c === LIGATURE_FT) return "Latin_Lig";
    if (code >= 0x0041 && code <= 0x005a) return "Latin_UC";
    if (code >= 0x0061 && code <= 0x007a) return "Latin_LC";
    if (code >= 0x00c0 && code <= 0x024f || code >= 0x1e00 && code <= 0x1eff || code >= 0x2c60 && code <= 0x2c7f || code >= 0xa720 && code <= 0xa7ff) {
      try { return (c === c.toUpperCase() && c !== c.toLowerCase()) ? "Latin_UC" : "Latin_LC"; } catch { return "Latin_Any"; }
    }
    if (code >= 0x0400 && code <= 0x04ff) return (code >= 0x0400 && code <= 0x042f) || (code >= 0x0460 && code <= 0x046f) ? "Cyrillic_UC" : "Cyrillic_LC";
    if (code >= 0x0500 && code <= 0x052f) return "Cyrillic_Any";
    if (code >= 0x0370 && code <= 0x03ff) return (code >= 0x0391 && code <= 0x03a9) ? "Greek_UC" : (code >= 0x03b1 && code <= 0x03c9) ? "Greek_LC" : "Greek_Any";
    if (code >= 0x0600 && code <= 0x06ff) return "Arabic";
    if (code >= 0x0530 && code <= 0x058f) return (code >= 0x0530 && code <= 0x0556) ? "Armenian_UC" : "Armenian_LC";
    if (code >= 0x10a0 && code <= 0x10c5) return "Georgian_UC";
    if ((code >= 0x10c6 && code <= 0x10ff) || (code >= 0x1c80 && code <= 0x1c8f)) return "Georgian_LC";
    if ((code >= 0x0590 && code <= 0x05ff) || (code >= 0xfb1d && code <= 0xfb4f)) return "Hebrew";
    if (code >= 0x07c0 && code <= 0x07ff) return (code >= 0x07f4 && code <= 0x07f9) ? "Nko_Num" : "Nko";
    if ((code >= 0x0030 && code <= 0x0039) || (code >= 0x0660 && code <= 0x0669) || (code >= 0x06f0 && code <= 0x06f9) || (code >= 0x0966 && code <= 0x096f) || (code >= 0x2460 && code <= 0x2473) || (code >= 0x24ea && code <= 0x24ff)) return "Number";
    // Superscript figures ⁰¹²³⁴⁵⁶⁷⁸⁹ (U+2070, U+00B9, U+00B2, U+00B3, U+2074–U+2079)
    if (code === 0x2070 || code === 0x00b9 || code === 0x00b2 || code === 0x00b3 || (code >= 0x2074 && code <= 0x2079)) return "Superscript";
    // Subscript figures ₀₁₂₃₄₅₆₇₈₉ (U+2080–U+2089)
    if (code >= 0x2080 && code <= 0x2089) return "Subscript";
    if (".,:;…!¡?¿·•*#/\\-–—_(){}[]‚„\"\"''«»‹›'".includes(c) || (code >= 0x060c && code <= 0x061f) || (code >= 0x066d && code <= 0x066f) || (code >= 0x2000 && code <= 0x206f) || code === 0x002d || (code >= 0x2010 && code <= 0x2014) || code === 0x2018 || code === 0x2019 || code === 0x201c || code === 0x201d) return "Punctuation";
    if ("@&¶§©®™°|¦†ℓ‡℮№₿¢¤$€₴₾₺₽₹₪£₩¥".includes(c) || (code >= 0x20a0 && code <= 0x20cf)) return "Currency";
    if ("+−×÷=≠><≥≤±≈¬~^∅∞∫∆∏∑√∂µ%‰↑↗→↘↓↙←↖↔↕".includes(c)) return "Math";
    if ("🌙🌞🌤🌥🌧🌨🌪🌫🌬🏃💨🚆🚗🚲☀☁⛅⛈◌◊".includes(c)) return "Symbol";
    if (code >= 0x0300 && code <= 0x036f) return "Combining";
    return "Other";
  }
  const groupMap = new Map<string, string[]>();
  const groupOrder: string[] = [];
  for (const c of flat) {
    const g = scriptGroup(c);
    if (!groupMap.has(g)) {
      groupMap.set(g, []);
      groupOrder.push(g);
    }
    groupMap.get(g)!.push(c);
  }
  const nameMap: Record<string, string> = {
    Latin_UC: "Latin Uppercase",
    Latin_LC: "Latin Lowercase",
    Latin_Lig: "Latin Ligatures",
    Latin_Any: "Latin",
    Cyrillic_UC: "Cyrillic Uppercase",
    Cyrillic_LC: "Cyrillic Lowercase",
    Cyrillic_Any: "Cyrillic",
    Greek_UC: "Greek Uppercase",
    Greek_LC: "Greek Lowercase",
    Greek_Any: "Greek",
    Arabic: "Arabic Letters",
    Armenian_UC: "Armenian Uppercase",
    Armenian_LC: "Armenian Lowercase",
    Georgian_UC: "Georgian Mtavruli",
    Georgian_LC: "Georgian Lowercase",
    Hebrew: "Hebrew Letters",
    Nko: "N'Ko Letters",
    Nko_Num: "N'Ko Numerals",
    Number: "Numbers",
    Superscript: "Superscript figures",
    Subscript: "Subscript figures",
    Punctuation: "Punctuation",
    Currency: "Currency",
    Math: "Mathematical",
    Symbol: "Symbols",
    Combining: "Combining",
    Other: "Symbols",
  };
  return groupOrder.map((g) => ({ key: g, name: nameMap[g] ?? g, characters: groupMap.get(g)! }));
}

// Available features from featureMetadata
const availableFeatures = computed(() => {
  if (!props.featureMetadata) return [];
  return Object.entries(props.featureMetadata)
    .filter(([tag]) => !excludedFeatures.has(tag))
    .map(([tag, metadata]) => ({
      tag,
      name: metadata.name,
      description: metadata.description,
      enabledByDefault: metadata.enabledByDefault || false,
      highlighted: metadata.highlighted,
      languageTag: metadata.languageTag,
    }));
});

// Get highlighted characters for the currently hovered feature
const highlightedCharsForHoveredFeature = computed(() => {
  if (!hoveredFeatureTag.value || !props.featureMetadata) return null;
  
  const metadata = props.featureMetadata[hoveredFeatureTag.value];
  if (!metadata?.highlighted) return null;
  
  // highlighted can be string or string[]
  const highlighted = metadata.highlighted;
  if (Array.isArray(highlighted)) {
    return new Set(highlighted.flatMap(h => h.split('')));
  }
  return new Set(highlighted.split(''));
});

// Check if a character should be dimmed (not highlighted by hovered feature)
const isCharDimmed = (char: string): boolean => {
  if (!highlightedCharsForHoveredFeature.value) return false;
  
  // Extract base character for Arabic characters with form markers
  const { baseChar } = getArabicCharAndForm(char);
  return !highlightedCharsForHoveredFeature.value.has(baseChar);
};

// Scroll to first highlighted glyph when hovering a feature
const scrollToFirstHighlightedGlyph = (featureTag: string) => {
  if (!props.featureMetadata) return;
  
  const metadata = props.featureMetadata[featureTag];
  if (!metadata?.highlighted) return;
  
  // Get highlighted characters as a set
  const highlighted = metadata.highlighted;
  const highlightedSet = Array.isArray(highlighted) 
    ? new Set(highlighted.flatMap(h => h.split('')))
    : new Set(highlighted.split(''));
  
  // Find the first character in currentCharacters that matches
  const chars = currentCharacters.value;
  for (let i = 0; i < chars.length; i++) {
    const { baseChar } = getArabicCharAndForm(chars[i]);
    if (highlightedSet.has(baseChar)) {
      // Found the first highlighted character, scroll to it
      const element = gridItemRefs.value.get(i);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      break;
    }
  }
};

// Handle feature hover
const handleFeatureHover = (featureTag: string) => {
  hoveredFeatureTag.value = featureTag;
  scrollToFirstHighlightedGlyph(featureTag);
};

// Initialize active features based on enabledByDefault (excluding irrelevant features)
watch(() => props.featureMetadata, (metadata) => {
  if (metadata) {
    const defaultFeatures = new Set<string>();
    Object.entries(metadata).forEach(([tag, meta]) => {
      if (meta.enabledByDefault && !excludedFeatures.has(tag)) {
        defaultFeatures.add(tag);
      }
    });
    activeFeatures.value = defaultFeatures;
  }
}, { immediate: true });

// Toggle feature
const toggleFeature = (tag: string) => {
  const newSet = new Set(activeFeatures.value);
  if (newSet.has(tag)) {
    newSet.delete(tag);
  } else {
    newSet.add(tag);
  }
  activeFeatures.value = newSet;
};

// Compute font-feature-settings CSS for active features
const fontFeatureSettingsCSS = computed(() => {
  if (availableFeatures.value.length === 0) return undefined;
  
  const settings: string[] = [];
  availableFeatures.value.forEach(({ tag }) => {
    const isActive = activeFeatures.value.has(tag);
    settings.push(`'${tag}' ${isActive ? 1 : 0}`);
  });
  
  return settings.length > 0 ? settings.join(', ') : undefined;
});

const fontLanguageOverride = computed(() => {
  // return "BGR"
  // console.log(availableFeatures.value)
  if (availableFeatures.value.length === 0) return undefined;
  return availableFeatures.value.find(({ tag }) => tag === "locl")?.languageTag;
});

// Display text for active features (e.g., "JALT, TNUM, SS01 + 2")
const activeFeaturesDisplay = computed(() => {
  const activeTags = Array.from(activeFeatures.value).filter(tag => !excludedFeatures.has(tag));
  if (activeTags.length === 0) return null;
  
  const maxVisible = 3;
  const visibleTags = activeTags.slice(0, maxVisible).map(tag => tag.toUpperCase());
  const remaining = activeTags.length - maxVisible;
  
  let display = visibleTags.join(', ');
  if (remaining > 0) {
    display += ` + ${remaining}`;
  }
  return display;
});

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (featureDropdownRef.value && !featureDropdownRef.value.contains(e.target as Node)) {
    showFeatureDropdown.value = false;
    hoveredFeatureTag.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const previewChar = ref<string>("A");
const { displayedGlyphName, loadForChar: loadGlyphNameForChar } = useGlyphNames();

// Codepoint names are stored display-ready from scripts/generate-glyph-map.js (space-separated uppercase).
// No runtime formatting — use as-is and append Arabic form suffix when applicable.
// Arabic form label for preview character (init, medi, fina only — isolated has no suffix)
const arabicFormLabelForPreview: Record<string, string> = {
  "\uE001": " (init)",
  "\uE002": " (medi)",
  "\uE003": " (fina)",
};
const previewCharWithFormLabel = computed(() => {
  const { baseChar } = getArabicCharAndForm(previewChar.value);
  return (baseChar || previewChar.value);
});
const displayedGlyphNameFormatted = computed(() => {
  const base = displayedGlyphName.value ?? "";
  if (!base) return "";
  const { form } = getArabicCharAndForm(previewChar.value);
  const suffix = (form && arabicFormLabelForPreview[form]) ?? "";
  return base + (suffix ? suffix.toUpperCase() : "");
});
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

// JUST axis control for variable fonts
const justAxis = computed(() => {
  if (!samsaFontInstance.value || !samsaFontInstance.value.axes) return null;
  return samsaFontInstance.value.axes.find((axis: any) => axis.tag === "JUST");
});

const hasJustAxis = computed(() => {
  return !!justAxis.value;
});

const justRange = computed(() => {
  if (!justAxis.value) return { min: 0, max: 1000 };
  return {
    min: justAxis.value.min,
    max: justAxis.value.max,
    default:
      justAxis.value.default ||
      (justAxis.value.min + justAxis.value.max) / 2,
  };
});

const currentJust = ref<number>(0);

const justPercentage = computed(() => {
  if (!hasJustAxis.value) return 0;
  const { min, max } = justRange.value;
  return ((currentJust.value - min) / (max - min)) * 100;
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
const { loadFont, getFontMetrics, getGlyphOutline, getGlyph } = useSamsa();
const samsaFontInstance = ref<any>(null);

// Initialize SHPE and JUST values when font loads
watch(
  samsaFontInstance,
  (font) => {
    if (font && hasShapeAxis.value && shapeAxis.value) {
      currentShape.value = 0;
    }
    if (font && hasJustAxis.value && justAxis.value) {
      currentJust.value = 0;
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
    } else if (axis.tag === "JUST") {
      settings.push(`'${axis.tag}' ${currentJust.value}`);
    } else {
      // Use default for other axes
      settings.push(`'${axis.tag}' ${axis.default || 0}`);
    }
  });

  return settings.length > 0 ? settings.join(", ") : undefined;
});

const breaksLigatures =
  /Safari/.test(navigator?.userAgent) &&
  !/Chrome|Chromium|Edg|OPR/.test(navigator?.userAgent);

// Form markers for Arabic characters
const FORM_ISOLATED = "\uE000";
const FORM_INITIAL = "\uE001";
const FORM_MEDIAL = "\uE002";
const FORM_FINAL = "\uE003";

// ZWJ U+200D and ZWNJ U+200C are often part of Arabic character entries in specs; use the base letter for joining.
function getArabicBaseCodePoint(letter: string): number {
  for (let i = 0; i < letter.length; ) {
    const cp = letter.codePointAt(i) ?? 0;
    if (cp !== 0x200c && cp !== 0x200d) return cp;
    i += cp >= 0x10000 ? 2 : 1;
  }
  return 0;
}

// Arabic letter joining behavior lookup
// Based on Unicode joining types: U=Non_Joining, R=Right_Joining, D=Dual_Joining
// Only add init/medi/fina for characters that actually have those positional forms
const getArabicLetterForms = (letter: string): string[] => {
  const codePoint = getArabicBaseCodePoint(letter);
  const forms: string[] = [];

  // Tatweel / kashida: no joining forms
  const specialLetters = new Set([0x0640]); // ـ

  // Non-joining (isolated only): no init/medi/fina
  const nonJoining = new Set([
    0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0626, 0x0671, // ء أ إ آ ؤ إ ئ ٱ
    // Arabic small / superscript (no positional forms): ؕ ٰ etc.
    0x0615, 0x0616, 0x0617, 0x0618, 0x0619, 0x061a, 0x0670, // ARABIC SMALL TAH, small ligature, small ZAIN/FATHA/DAMMA/KASRA, SUPERSCRIPT ALEF
    // Arabic-Indic digits ٠١٢٣٤٥٦٧٨٩
    0x0660, 0x0661, 0x0662, 0x0663, 0x0664, 0x0665, 0x0666, 0x0667, 0x0668, 0x0669,
    // Eastern Arabic-Indic digits ۰۱۲۳۴۵۶۷۸۹
    0x06f0, 0x06f1, 0x06f2, 0x06f3, 0x06f4, 0x06f5, 0x06f6, 0x06f7, 0x06f8, 0x06f9,
    // Punctuation: ٫ ٬ ، ؛ ؟ ٭ ٪ ۔
    0x060c, 0x061b, 0x061f, 0x066a, 0x066b, 0x066c, 0x066d, 0x06d4,
    // Combining / diacritics: ٔ ٕ ً ٘ etc.
    0x064b, 0x064c, 0x064d, 0x064e, 0x064f, 0x0650, 0x0651, 0x0652, 0x0653, 0x0654, 0x0655, 0x0656, 0x0657, 0x0658,
  ]);

  // Right-joining (isolated + final only): ے ە ۓ and standard R-type
  const rightJoining = new Set([
    0x0627, 0x0629, 0x062f, 0x0630, 0x0631, 0x0632, 0x0648, 0x0649, // ا ة د ذ ر ز و ى
    0x06ba, 0x06d2, 0x06d3, 0x06d5, // ں ے ۓ ە (noon ghunna, yeh barree, yeh barree with hamza, ae)
  ]);

  if (nonJoining.has(codePoint) || specialLetters.has(codePoint)) {
    forms.push(FORM_ISOLATED);
    return forms;
  }

  if (rightJoining.has(codePoint)) {
    forms.push(FORM_ISOLATED);
    forms.push(FORM_FINAL);
    return forms;
  }

  // Dual-joining (all four forms): ب ت ث ج ح خ س ش ص ض ط ظ ع غ ف ق ك ل م ن ه ي پ چ گ etc.
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

  // Use supported glyphs spec for diode-global-next
  if (props.fontId === "diode-global-next") {
    const parsed = parseSupportedGlyphsSpec(SUPPORTED_GLYPHS_SPEC) as Array<{ key: string; name: string; characters: string[] }>;
    const scriptByKey: Record<string, boolean> = {
      Latin_UC: supportsLatin,
      Latin_LC: supportsLatin,
      Latin_Lig: supportsLatin,
      Latin_Any: supportsLatin,
      Cyrillic_UC: supportsCyrillic,
      Cyrillic_LC: supportsCyrillic,
      Cyrillic_Any: supportsCyrillic || supportsBelarusian || supportsBulgarian,
      Greek_UC: supportsGreek,
      Greek_LC: supportsGreek,
      Greek_Any: supportsGreek,
      Arabic: supportsArabic,
      Armenian_UC: supportsArmenian,
      Armenian_LC: supportsArmenian,
      Georgian_UC: supportsGeorgian,
      Georgian_LC: supportsGeorgian,
      Hebrew: supportsHebrew,
      Nko: supportsNko,
      Nko_Num: supportsNko,
      Number: true,
      Superscript: true,
      Subscript: true,
      Punctuation: true,
      Currency: true,
      Math: true,
      Symbol: true,
      Combining: true,
      Other: true,
    };
    for (const g of parsed) {
      if (!scriptByKey[g.key]) continue;
      if (g.key === "Arabic") {
        const arabicWithAllForms: string[] = [];
        g.characters.forEach((letter) => {
          const supportedForms = getArabicLetterForms(letter);
          supportedForms.forEach((form) => {
            if (breaksLigatures && (form === FORM_INITIAL || form === FORM_MEDIAL || form === FORM_FINAL)) return;
            arabicWithAllForms.push(letter + form);
          });
        });
        groups.push({ name: g.name, characters: arabicWithAllForms });
      } else {
        groups.push({ name: g.name, characters: g.characters });
      }
    }
    return groups;
  }

  // Latin characters - Standard specimen order: Uppercase → Lowercase → Numerals → Punctuation
  if (supportsLatin) {
    groups.push({
      name: "Latin Uppercase",
      characters: "AÁĂÂÄÀÅÃÆBCÇĊDÐEÉÊËÈẼĖƏFGĞĠHĦIĲÍÎÏİÌĨJKLMNÑOÓÔÖÒŐØÕŒPÞQRSŞȘẞTȚUÚÛÜÙŨŮVWẂŴẄẀXYÝŶŸỲỸZŻꞋ".split(""),
    });
    groups.push({
      name: "Latin Lowercase",
      characters: "aáăâäàåãæbcçċdðeéêëèẽėəfgğġhħiıíîïìĩĳjȷklmnñoóôöòőøõœpþqrsşșßtțuúûüùũůvwẃŵẅẁxyýŷÿỳỹzżꞌ".split(""),
    });
    groups.push({
      name: "Latin Numerals",
      characters: "0123456789⓪①②③④⑤⑥⑦⑧⑨".split(""),
    });
    groups.push({
      name: "Superscript figures",
      characters: "⁰¹²³⁴⁵⁶⁷⁸⁹".split(""),
    });
    groups.push({
      name: "Subscript figures",
      characters: "₀₁₂₃₄₅₆₇₈₉".split(""),
    });
    groups.push({
      name: "Latin Punctuation",
      characters: ".,:;…!¡?¿·•*#/\\-–—_(){}[]‚„\"\"\'\'«»‹›\'\"ʹ".split(""),
    });
  }

  // Hebrew characters - Letters → Numerals → Punctuation
  if (supportsHebrew) {
    const hebrewLetters = "אבגדהוזחטיךכלםמןנסעףפץצקרשת".split("");
    groups.push({
      name: "Hebrew Letters",
      characters: hebrewLetters,
    });
    // const stretchedHebrewLetters = "ﬡﬢﬣﬤﬥﬦﬧﬨ".split("");
    // groups.push({
    //   name: "Hebrew Stretched",
    //   characters: stretchedHebrewLetters,
    // });
  }

  // Arabic characters - Letters → Numerals → Punctuation
  if (supportsArabic) {
    const arabicLetters =
      "ءأإآٱٮبپتثجچحخدذرسشصضطظعغفڤڡٯقكکگلمنںهہھةوؤىيئـ".split("");
    
    arabicLetters.push("ڪ") // supportsSindhi
    
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
      characters: "ּּּ٠١٢٣٤٥٦٧٨٩".split(""),
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

  if (!supportsLatin) {
    groups.push({
      name: "Latin Numerals",
      characters: "0123456789⓪①②③④⑤⑥⑦⑧⑨".split(""),
    });
    groups.push({
      name: "Superscript figures",
      characters: "⁰¹²³⁴⁵⁶⁷⁸⁹".split(""),
    });
    groups.push({
      name: "Subscript figures",
      characters: "₀₁₂₃₄₅₆₇₈₉".split(""),
    });
    groups.push({
      name: "Latin Punctuation",
      characters: ".,:;…!¡?¿·•*#/\\-–—_(){}[]‚„\"\"\'\'«»‹›\'\"ʹ".split(""),
    });
  }

  // Symbols (universal)
  groups.push({
    name: "Symbols",
    characters: "@&¶§©®™°|¦†ℓ‡℮№↑↗→↘↓↙←↖↔↕".split(""),
  });
  // Symbols (weather)
  groups.push({
    name: "Symbols",
    characters: "🌙🌤🌧🌨🌪🌫🌬☀☁⛈".split(""),
  });
  // Symbols (transport)
  groups.push({
    name: "Symbols",
    characters: "🏃🚆🚗🚲".split(""),
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
    characters: "+−×÷=≠><≥≤±≈¬~^∅∞∫∆µ◊%‰◌".split(""),
  });

  // Emojis
  // groups.push({
  //   name: "Emojis",
  //   characters: "🚆".split(""),
  // })

  // console.log(groups);

  return groups;
});
// Character existence detection using font's cmap table
const characterExistsCache = ref<Map<string, boolean>>(new Map());
const isCheckingCharacters = ref(false);

const checkCharacterExists = (char: string): boolean => {
  // Check cache first
  if (characterExistsCache.value.has(char)) {
    return characterExistsCache.value.get(char)!;
  }

  // If font not loaded yet, assume exists (will filter later)
  if (!samsaFontInstance.value?.cmap) {
    return true;
  }

  const charCode = char.codePointAt(0) || 0;
  const glyphIndex = samsaFontInstance.value.cmap?.[charCode];

  // glyphIndex 0 is typically the .notdef glyph (missing character)
  const exists = glyphIndex !== undefined && glyphIndex !== 0;

  // Cache the result
  characterExistsCache.value.set(char, exists);
  return exists;
};

// Filter characters that exist in the font
const allCharacters = computed(() => {
  const all = new Set(
    characterGroups.value.flatMap((group) => group.characters)
  );
  return Array.from(all);
});

const filteredCharacters = ref<string[]>([]);

const filterCharacters = () => {
  if (isCheckingCharacters.value) return;
  
  // If font's cmap not loaded yet, show all characters
  if (!samsaFontInstance.value?.cmap) {
    filteredCharacters.value = allCharacters.value;
    return;
  }

  isCheckingCharacters.value = true;

  filteredCharacters.value = allCharacters.value.filter((char, i) => {
    const { baseChar } = getArabicCharAndForm(char);
    return checkCharacterExists(baseChar);
  });

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

// Fallback glyph name from Samsa or character (used until readable name block loads)
const getFallbackGlyphName = (char: string): string => {
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
    [FORM_INITIAL]: "init",
    [FORM_MEDIAL]: "medi",
    [FORM_FINAL]: "fina",
  };
  const arabicForm = arabicFormMap[form as keyof typeof arabicFormMap] || '';

  // Fallback: return the character itself
  return char === " " ? "space" : baseChar + (arabicForm ? ` (${arabicForm})` : '');
};

// Load readable name from lazy-loaded block files when preview character changes
watch(
  previewChar,
  (char) => {
    const { baseChar } = getArabicCharAndForm(char);
    const fallback = getFallbackGlyphName(char);
    const charForLookup = baseChar || char;
    loadGlyphNameForChar(charForLookup, fallback, () => {
      const { baseChar: cur } = getArabicCharAndForm(previewChar.value);
      return (cur || previewChar.value) === charForLookup;
    });
  },
  { immediate: true }
);

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
        } else if (axis.tag === "JUST") {
          return currentJust.value;
        }
        // Use default value for other axes
        return axis.default || 0;
      });
    }
    const outline = getGlyph(samsaFont, baseChar, tuple)

    console.log(outline);
    if (!outline) {
      console.warn("No outline returned for character:", char);
      return;
    }

    // glyphOutline.value = {
    //   path: outline.svgPath(tuple),
    //   bbox: { xMin: outline.xMin, yMin: outline.yMin, xMax: outline.xMax, yMax: outline.yMax },
    //   scale: 1,
    //   offsetX: 0,
    //   offsetY: 0,
    //   controlPoints: [],
    // };
    console.log(glyphOutline.value);

    const bbox = outline;

    // Calculate scale for rendering
    const fontSize = 320; // 20rem = 320px
    
    // Get metrics from samsa instance using the composable function
    const metrics = getFontMetrics(samsaFont);
    if (!metrics) {
      console.warn("Failed to get font metrics from samsa instance");
      return;
    }
    
    const unitsPerEm = metrics.unitsPerEm;
    const scale = fontSize / unitsPerEm;

    // Convert normalized metrics back to font units for calculations
    const capHeight = metrics.capHeight * unitsPerEm;
    const xHeight = metrics.xHeight * unitsPerEm;
    const ascender = metrics.ascender * unitsPerEm;
    const descender = metrics.descender * unitsPerEm;

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

    console.log(outline);

    // glyphOutline.value = {
    //   ...outline,
    //   path: outline.svgPath(tuple),
    //   scale,
    //   offsetX: -bbox.xMin * scale,
    //   offsetY: bbox.yMax * scale, // Flip Y
    // };
    console.log(glyphOutline.value);
    // glyphOutline.value = {
    //   ...outline,
    //   scale,
    //   offsetX: -bbox.xMin * scale,
    //   offsetY: bbox.yMax * scale, // Flip Y
    // };
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

const isDraggingJustSlider = ref(false);

const startJustSliderDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDraggingJustSlider.value = true;

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

    const { min, max } = justRange.value;
    currentJust.value = min + percentage * (max - min);
  };

  const handleUp = () => {
    isDraggingJustSlider.value = false;
    document.removeEventListener("mousemove", handleMove as EventListener);
    document.removeEventListener("mouseup", handleUp);
    document.removeEventListener("touchmove", handleMove as EventListener);
    document.removeEventListener("touchend", handleUp);
  };

  // Update immediately on click/touch
  const rect = slider.getBoundingClientRect();
  const x = getClientX(e) - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  const { min, max } = justRange.value;
  currentJust.value = min + percentage * (max - min);

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
