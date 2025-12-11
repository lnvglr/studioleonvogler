<template>
  <div
    ref="carouselRef"
    class="relative w-full h-full flex flex-col group"
    style="mix-blend-mode: normal;"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Carousel Container -->
    <div 
      class="relative flex-1 w-full h-full"
      :class="{ 
        'overflow-x-auto snap-x snap-mandatory scrollbar-hide': isMobile,
        'overflow-hidden': !isMobile
      }"
      ref="scrollContainer"
      :style="isMobile ? { 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      } : {}"
    >
      <div
        class="flex h-full"
        :class="{ 
          'transition-transform duration-500': !isDragging && !isMobile,
        }"
        :style="{ 
          transform: isMobile ? 'none' : `translateX(-${currentIndex * 100}%)`,
          transitionTimingFunction: isMobile ? 'none' : 'cubic-bezier(0.1, 1, 0.1, 1)',
          width: isMobile ? `${projects.length * 100}%` : '100%'
        }"
      >
        <div
          v-for="(project, index) in projects"
          :key="project.id"
          class="h-full shrink-0 relative snap-start"
          :style="{ width: isMobile ? `${100 / projects.length}%` : '100%' }"
        >
          <NuxtLink
            :to="`/projects/${project.id}`"
            class="block w-full h-full cursor-pointer"
          >
            <NuxtImg
              v-if="shouldLoadImage(index)"
              :ref="(el) => setImageRef(el, index)"
              :src="project.image.startsWith('/') ? project.image : `/${project.image}`"
              :alt="project.alt"
              class="w-full h-full object-cover"
              :loading="index === currentIndex ? 'eager' : 'lazy'"
              :fetchpriority="index === currentIndex ? 'high' : undefined"
              :placeholder="index === 0 ? true : false"
              format="webp"
              quality="85"
              sizes="(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 512px, (max-width: 1280px) 640px, (max-width: 1536px) 768px, (max-width: 1920px) 960px, 1200px"
              fit="cover"
              width="1920"
              height="1920"
              @load="onImageLoad(index, $event)"
            />
            <div
              v-else
              class="w-full h-full bg-stone-100"
            />
          </NuxtLink>
          
          <!-- Floating Label - Top on desktop, bottom on mobile -->
          <div
            class="absolute left-0 right-0 px-6 sm:px-10 pointer-events-none sm:top-0 sm:pt-6 bottom-0 pb-14 sm:pb-0"
            :class="textColorClass"
          >
            <div class="flex flex-col gap-1.5">
              <div class="text-[10px] tracking-wide text-[var(--header-text-color,inherit)] w-auto me-auto relative px-2 py-0.5 -mx-0.5">
              <div class="block w-full h-full absolute inset-0 rounded-full bg-stone-50 opacity-20" aria-hidden="true"/>
                <span class="relative z-10">{{ getCategoryTag(project.category) }}</span>
              </div>
              <h3 class="text-sm sm:text-base font-medium">
                {{ project.title }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Controls: Arrow-left - Dots Progress - Arrow-right -->
    <div
      class="absolute bottom-6 sm:bottom-10 flex items-center gap-3 z-20 pointer-events-none start-6 sm:start-1/2 sm:-translate-x-1/2"
      :class="textColorClass"
    >
      <!-- Arrow buttons - hidden on mobile -->
      <button
        @click.stop="previous"
        class="hidden sm:block pointer-events-auto hover:opacity-70 transition-opacity duration-300 p-2"
        :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
        aria-label="Previous project"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      <!-- Dots Progress -->
      <div class="flex items-center gap-2">
        <button
          v-for="(project, index) in projects"
          :key="project.id"
          @click.stop="goToIndex(index)"
          class="pointer-events-auto transition-all duration-500 rounded-full relative overflow-hidden"
          :class="index === currentIndex ? 'opacity-100' : 'opacity-40'"
          :style="{ 
            transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)',
            width: index === currentIndex ? '100px' : '4px',
            height: '4px',
            backgroundColor: index === currentIndex ? 'transparent' : 'currentColor'
          }"
          :aria-label="`Go to project ${index + 1}`"
        >
          <!-- Progress bar background -->
          <div
            v-if="index === currentIndex"
            class="absolute inset-0 rounded-full bg-current opacity-20"
          />
          <!-- Progress filler for active dot - grows from left to right -->
          <div
            v-if="index === currentIndex"
            class="absolute left-0 top-0 bottom-0 rounded-full bg-current transition-all duration-100 ease-linear"
            :style="{
              width: `${progress}%`
            }"
          />
        </button>
      </div>
      
      <!-- Arrow buttons - hidden on mobile -->
      <button
        @click.stop="next"
        class="hidden sm:block pointer-events-auto hover:opacity-70 transition-opacity duration-300 p-2"
        :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
        aria-label="Next project"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile: Scroll down indicator animation -->
    <div
      v-if="isMobile"
      class="absolute bottom-6 end-6 z-20 sm:hidden"
      :class="textColorClass"
    >
      <button
        @click="scrollToNextSection"
        class="pointer-events-auto scroll-indicator cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Scroll to next section"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/data/projects'

interface Props {
  projects: Project[]
  autoplayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoplayInterval: 5000, // 5 seconds default
})

const currentIndex = ref(0)
const progress = ref(0)
const intervalId = ref<NodeJS.Timeout | null>(null)
const progressIntervalId = ref<NodeJS.Timeout | null>(null)
const isPaused = ref(false)
const progressStartTime = ref(0)
const imageRefs = ref<(HTMLImageElement | null)[]>([])
const imageBrightness = ref<number[]>([])
const isMobile = ref(false)
const isDragging = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
let resizeHandler: (() => void) | null = null

// Computed property to get indices that should be loaded (current, previous, next only)
const indicesToLoad = computed(() => {
  const total = props.projects.length
  const current = currentIndex.value
  const indices = new Set<number>()
  
  // Always load current image
  indices.add(current)
  
  // Load previous image (handle wrap-around)
  const prevIndex = current === 0 ? total - 1 : current - 1
  indices.add(prevIndex)
  
  // Load next image (handle wrap-around)
  const nextIndex = current === total - 1 ? 0 : current + 1
  indices.add(nextIndex)
  
  return indices
})

// Determine which images should be loaded (current, previous, next)
const shouldLoadImage = (index: number): boolean => {
  return indicesToLoad.value.has(index)
}

const textColorClass = computed(() => {
  if (imageBrightness.value[currentIndex.value] === undefined) {
    return 'text-white' // Default to white
  }
  return imageBrightness.value[currentIndex.value] > 128 ? 'text-black' : 'text-white'
})

// Update CSS variable for header text color
const updateHeaderTextColor = () => {
  if (typeof document !== 'undefined') {
    const brightness = imageBrightness.value[currentIndex.value]
    if (brightness !== undefined) {
      const textColor = brightness > 128 ? '#000000' : '#ffffff'
      document.documentElement.style.setProperty('--header-text-color', textColor)
    } else {
      document.documentElement.style.setProperty('--header-text-color', '#ffffff')
    }
  }
}

// Watch for brightness changes and update CSS variable
watch([currentIndex, imageBrightness], () => {
  updateHeaderTextColor()
}, { deep: true, immediate: true })

// Also watch currentIndex specifically to ensure immediate updates
watch(currentIndex, () => {
  updateHeaderTextColor()
  // Force reactivity update
  nextTick(() => {
    updateHeaderTextColor()
  })
})

const setImageRef = (el: any, index: number) => {
  if (el) {
    // NuxtImg wraps the img element, so we need to get the actual img
    const imgElement = el.$el?.tagName === 'IMG' ? el.$el : el.$el?.querySelector('img')
    imageRefs.value[index] = imgElement || el
  }
}

const getCategoryTag = (category: string) => {
  const tags: Record<string, string> = {
    editorial: 'Editorial',
    type: 'Type',
    graphic: 'Graphic',
    web: 'Interface',
  }
  return tags[category] || category
}

const calculateBrightness = (img: HTMLImageElement): Promise<number> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(128) // Default to medium brightness
      return
    }
    
    canvas.width = Math.min(img.width, 100)
    canvas.height = Math.min(img.height, 100)
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    try {
      // Get image data from the top third and bottom third of the image
      const sectionHeight = Math.floor(canvas.height / 4)
      const topSectionData = ctx.getImageData(0, 0, canvas.width, sectionHeight)
      const bottomSectionStart = canvas.height - sectionHeight
      const bottomSectionData = ctx.getImageData(0, bottomSectionStart, canvas.width, sectionHeight)
      
      // Calculate brightness for top third
      const topData = topSectionData.data
      let topR = 0
      let topG = 0
      let topB = 0
      let topCount = 0
      
      // Sample pixels (every 10th pixel for performance)
      for (let i = 0; i < topData.length; i += 40) {
        topR += topData[i]
        topG += topData[i + 1]
        topB += topData[i + 2]
        topCount++
      }
      
      const avgTopR = topR / topCount
      const avgTopG = topG / topCount
      const avgTopB = topB / topCount
      const topBrightness = (avgTopR * 0.299 + avgTopG * 0.587 + avgTopB * 0.114)
      
      // Calculate brightness for bottom third
      const bottomData = bottomSectionData.data
      let bottomR = 0
      let bottomG = 0
      let bottomB = 0
      let bottomCount = 0
      
      // Sample pixels (every 10th pixel for performance)
      for (let i = 0; i < bottomData.length; i += 40) {
        bottomR += bottomData[i]
        bottomG += bottomData[i + 1]
        bottomB += bottomData[i + 2]
        bottomCount++
      }
      
      const avgBottomR = bottomR / bottomCount
      const avgBottomG = bottomG / bottomCount
      const avgBottomB = bottomB / bottomCount
      const bottomBrightness = (avgBottomR * 0.299 + avgBottomG * 0.587 + avgBottomB * 0.114)
      
      // Average the top and bottom brightness
      const brightness = (topBrightness + bottomBrightness) / 2
      resolve(brightness)
    } catch (e) {
      resolve(128) // Default to medium brightness on error
    }
  })
}

const onImageLoad = async (index: number, event: Event) => {
  // NuxtImg emits load event from the underlying img element
  const target = event.target as HTMLImageElement
  if (target && target.tagName === 'IMG') {
    const brightness = await calculateBrightness(target)
    imageBrightness.value[index] = brightness
    // Update CSS variable if this is the current image or if brightness was just calculated
    if (index === currentIndex.value) {
      nextTick(() => {
        updateHeaderTextColor()
      })
    }
  }
}

const goToIndex = (index: number) => {
  currentIndex.value = index
  if (isMobile.value) {
    scrollToIndex(index)
  }
  resetProgress()
  updateHeaderTextColor()
}

const next = () => {
  const newIndex = (currentIndex.value + 1) % props.projects.length
  currentIndex.value = newIndex
  if (isMobile.value) {
    scrollToIndex(newIndex)
  }
  resetProgress()
  updateHeaderTextColor()
}

const previous = () => {
  const newIndex = currentIndex.value === 0
    ? props.projects.length - 1
    : currentIndex.value - 1
  currentIndex.value = newIndex
  if (isMobile.value) {
    scrollToIndex(newIndex)
  }
  resetProgress()
  updateHeaderTextColor()
}

const resetProgress = () => {
  progress.value = 0
  progressStartTime.value = Date.now()
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
  }
  startProgress()
}

const startProgress = () => {
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
  }
  progressStartTime.value = Date.now()
  
  const updateInterval = 16 // ~60fps
  
  progressIntervalId.value = setInterval(() => {
    if (!isPaused.value) {
      const elapsed = Date.now() - progressStartTime.value
      progress.value = Math.min((elapsed / props.autoplayInterval) * 100, 100)
      if (progress.value >= 100) {
        next()
      }
    }
  }, updateInterval)
}

// Ensure autoplay works on mobile - the next() function already handles scrolling

const startAutoplay = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
}

const pauseAutoplay = () => {
  isPaused.value = true
}

const resumeAutoplay = () => {
  isPaused.value = false
  // Adjust start time to account for pause duration
  const remainingTime = props.autoplayInterval * (1 - progress.value / 100)
  progressStartTime.value = Date.now() - (props.autoplayInterval - remainingTime)
}


const carouselRef = ref<HTMLElement | null>(null)

// Touch/swipe handlers for natural mobile gestures (using native scroll)
const handleTouchStart = () => {
  if (!isMobile.value) return
  pauseAutoplay()
}

const handleTouchMove = () => {
  // Let native scroll handle it
}

const handleTouchEnd = () => {
  if (!isMobile.value) return
  // Update index after scroll settles
  setTimeout(() => {
    if (scrollContainer.value) {
      syncIndexFromScroll()
    }
    resumeAutoplay()
  }, 100)
}

// Sync currentIndex from scroll position
const syncIndexFromScroll = () => {
  if (!scrollContainer.value || !isMobile.value) return
  const scrollLeft = scrollContainer.value.scrollLeft
  const containerWidth = scrollContainer.value.clientWidth
  const newIndex = Math.round(scrollLeft / containerWidth)
  if (newIndex !== currentIndex.value && newIndex >= 0 && newIndex < props.projects.length) {
    currentIndex.value = newIndex
    resetProgress()
    // Explicitly update header text color when index changes - use nextTick to ensure reactivity
    nextTick(() => {
      updateHeaderTextColor()
    })
  } else if (newIndex === currentIndex.value) {
    // Even if index hasn't changed, ensure text color is synced (in case brightness was just calculated)
    updateHeaderTextColor()
  }
}

// Handle scroll events for mobile to sync currentIndex
const handleScroll = () => {
  if (!isMobile.value) return
  // Use requestAnimationFrame for smoother updates
  requestAnimationFrame(() => {
    syncIndexFromScroll()
  })
}

// Scroll to current index on mobile
const scrollToIndex = (index: number) => {
  if (!isMobile.value || !scrollContainer.value) return
  const containerWidth = scrollContainer.value.clientWidth
  scrollContainer.value.scrollTo({
    left: index * containerWidth,
    behavior: 'smooth'
  })
}

// Scroll to next section (article) on mobile
const scrollToNextSection = () => {
  if (!isMobile.value || typeof window === 'undefined') return
  const articleSection = document.getElementById('mobile-article-section')
  if (articleSection) {
    articleSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  startAutoplay()
  startProgress()
  // Initialize brightness array
  imageBrightness.value = new Array(props.projects.length).fill(undefined)
  
  // Check if mobile
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640 // sm breakpoint
    resizeHandler = () => {
      const wasMobile = isMobile.value
      isMobile.value = window.innerWidth < 640
      // If switching to mobile, scroll to current index
      if (isMobile.value && !wasMobile && scrollContainer.value) {
        nextTick(() => {
          scrollToIndex(currentIndex.value)
        })
      }
    }
    window.addEventListener('resize', resizeHandler)
    
    // Set up scroll listener for mobile
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll, { passive: true })
        // Scroll to initial index on mobile
        if (isMobile.value) {
          scrollToIndex(currentIndex.value)
        }
      }
    })
    
    // Initial CSS variable
    updateHeaderTextColor()
  }
  
  // Initial images will be loaded via shouldLoadImage computed property
  // which automatically includes current (0), next (1), and previous (last)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
  }
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (typeof window !== 'undefined' && resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
/* Smooth transitions */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Scroll indicator animation */
.scroll-indicator {
  animation: nudgeDown 2s ease-in-out infinite;
}

@keyframes nudgeDown {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(8px);
    opacity: 1;
  }
}
</style>

