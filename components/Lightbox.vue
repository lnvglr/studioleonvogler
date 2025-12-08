<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="close"
      >
        <!-- Close Button -->
        <button
          @click="close"
          class="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
          aria-label="Close lightbox"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Image Container -->
        <div class="relative max-w-[95vw] max-h-[95vh] p-4 w-auto h-auto">
          <NuxtImg
            v-if="imageSrc"
            :src="imageSrc"
            :alt="imageAlt"
            class="object-contain rounded-lg w-auto h-auto"
            format="webp"
            quality="90"
            sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1920px"
            fit="inside"
            width="1920"
            height="1080"
            placeholder
            @click.stop
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { isOpen, imageSrc, imageAlt, close } = useLightbox()

// Close on Escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      close()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active img,
.lightbox-leave-active img {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.lightbox-enter-from img,
.lightbox-leave-to img {
  transform: scale(0.9);
  opacity: 0;
}
</style>

