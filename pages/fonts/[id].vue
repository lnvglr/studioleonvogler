<template>
  <main class="max-w-6xl">
    <FontSpecimen v-if="font" :font="font" :standalone="true" />
    <div v-else class="flex flex-col gap-5">
      <p>Font not found.</p>
      <NuxtLink
        to="/"
        class="text-green-500 hover:underline underline-offset-4"
      >
        ← Back to home
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { getFontById } from '~/data/fonts'

const route = useRoute()
const fontId = route.params.id as string

const font = computed(() => getFontById(fontId))

if (!font.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Font not found',
  })
}

useHead({
  htmlAttrs: {
    lang: 'en-US',
  },
})

useSeoMeta({
  title: `${font.value.name} Specimen – Studio Leon Vogler`,
  ogTitle: `${font.value.name} Specimen – Studio Leon Vogler`,
  description: font.value.description,
  ogDescription: font.value.description,
})
</script>

