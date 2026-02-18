<template>
  <div ref="containerRef" class="prose-video my-16 mb-20 rounded-xl overflow-hidden">
    <video
      v-if="srcToLoad"
      ref="videoRef"
      :src="srcToLoad"
      class="w-full"
      muted
      loop
      playsinline
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const srcToLoad = ref<string | null>(null)

const normalizedSrc = computed(() =>
  props.src.startsWith('/') ? props.src : `/${props.src}`
)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target !== containerRef.value) continue
        if (entry.isIntersecting) {
          if (!srcToLoad.value) srcToLoad.value = normalizedSrc.value
          nextTick(() => {
            videoRef.value?.play().catch(() => {})
          })
        } else if (videoRef.value) {
          videoRef.value.pause()
        }
      }
    },
    { rootMargin: '0px 0px 50px 0px', threshold: 0.1 }
  )
  observer.observe(containerRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.removeAttribute('src')
    videoRef.value.load()
  }
})
</script>
