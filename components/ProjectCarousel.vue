<template>
  <div
    ref="carouselRef"
    class="relative w-full h-full flex flex-col group"
    style="mix-blend-mode: normal;"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
  >
    <!-- Carousel Container -->
    <div class="relative flex-1 overflow-hidden w-full h-full">
      <div
        class="flex transition-transform duration-500 h-full w-full"
        :style="{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)'
        }"
      >
        <div
          v-for="(project, index) in projects"
          :key="project.id"
          class="w-full h-full shrink-0 relative"
        >
          <NuxtLink
            :to="`/projects/${project.id}`"
            class="block w-full h-full cursor-pointer"
          >
            <NuxtImg
              :ref="(el) => setImageRef(el, index)"
              :src="project.image.startsWith('/') ? project.image : `/${project.image}`"
              :alt="project.alt"
              class="w-full h-full object-cover"
              :loading="index === 0 ? 'eager' : 'lazy'"
              format="webp"
              quality="70"
              sizes="(max-width: 320px) 640px, (max-width: 640px) 1280px, 1920px"
              fit="cover"
              placeholder
              @load="onImageLoad(index, $event)"
            />
          </NuxtLink>
          
          <!-- Floating Label -->
          <div
            class="absolute top-0 left-0 right-0 pt-6 sm:pt-10 px-6 sm:px-10 pointer-events-none"
            :class="textColorClass"
          >
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] uppercase tracking-wide opacity-70">
                {{ getCategoryTag(project.category) }}
              </span>
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
      class="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 pointer-events-none"
      :class="textColorClass"
    >
      <button
        @click.stop="previous"
        class="pointer-events-auto hover:opacity-70 transition-opacity duration-300 p-2"
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
      
      <button
        @click.stop="next"
        class="pointer-events-auto hover:opacity-70 transition-opacity duration-300 p-2"
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
const textColorClass = computed(() => {
  if (imageBrightness.value[currentIndex.value] === undefined) {
    return 'text-white' // Default to white
  }
  return imageBrightness.value[currentIndex.value] > 128 ? 'text-black' : 'text-white'
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
      // Only get image data from the top third of the image
      const topThirdHeight = Math.floor(canvas.height / 3)
      const imageData = ctx.getImageData(0, 0, canvas.width, topThirdHeight)
      const data = imageData.data
      let r = 0
      let g = 0
      let b = 0
      let count = 0
      
      // Sample pixels (every 10th pixel for performance)
      for (let i = 0; i < data.length; i += 40) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }
      
      const avgR = r / count
      const avgG = g / count
      const avgB = b / count
      
      // Calculate perceived brightness
      const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114)
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
  }
}

const goToIndex = (index: number) => {
  currentIndex.value = index
  resetProgress()
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.projects.length
  resetProgress()
}

const previous = () => {
  currentIndex.value =
    currentIndex.value === 0
      ? props.projects.length - 1
      : currentIndex.value - 1
  resetProgress()
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

onMounted(() => {
  startAutoplay()
  startProgress()
  // Initialize brightness array
  imageBrightness.value = new Array(props.projects.length).fill(undefined)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
  }
})

const carouselRef = ref<HTMLElement | null>(null)
</script>

<style scoped>
/* Smooth transitions */
</style>

