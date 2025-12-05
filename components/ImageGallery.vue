<template>
  <div class="flex flex-col gap-3">
    <div class="overflow-x-auto -mx-5 sm:-mx-10 md:-mx-20 px-5 sm:px-10 md:px-20">
      <div class="flex gap-4 min-w-max">
        <img
          v-for="(image, index) in images"
          :key="index"
          :src="image"
          :alt="`${caption} - Image ${index + 1}`"
          class="h-64 sm:h-80 object-cover rounded-xl bg-stone-50 shrink-0"
        />
      </div>
    </div>
    <p class="text-sm text-neutral-600 italic">{{ caption }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  caption: string
}

defineProps<Props>()
</script>
