<template>
  <main class="max-w-4xl">
    <NuxtLink
      to="/projects"
      class="text-green-500 hover:underline underline-offset-4 mb-8 inline-block"
    >
      ← Back to projects
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-medium mb-4">Font Specimens</h1>
      <p class="text-lg text-neutral-600">
        Interactive type specimens for exploring and testing fonts.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink
        v-for="font in fonts"
        :key="font.id"
        :to="`/fonts/${font.id}`"
        class="p-6 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200"
      >
        <h2
          class="text-2xl font-medium mb-2"
          :style="{ fontFamily: getFontFamily(font.name) }"
        >
          {{ font.name }}
        </h2>
        <p class="text-sm text-neutral-600 mb-4">
          {{ font.description }}
        </p>
        <div class="flex gap-2 flex-wrap">
          <span
            v-for="variant in font.variants"
            :key="variant.id"
            class="text-xs px-2 py-1 rounded bg-stone-200"
          >
            {{ variant.name }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { fonts } from '~/data/fonts'

const getFontFamily = (fontName: string) => {
  return `"${fontName}", system-ui, sans-serif`
}

useHead({
  htmlAttrs: {
    lang: 'en-US',
  },
})

useSeoMeta({
  title: 'Font Specimens – Studio Leon Vogler',
  ogTitle: 'Font Specimens – Studio Leon Vogler',
  description: 'Interactive type specimens for exploring and testing fonts.',
})
</script>
