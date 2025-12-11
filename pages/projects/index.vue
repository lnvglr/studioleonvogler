<template>
  <main class="gap-5 sm:gap-10 max-w-7xl">
    <div class="flex flex-col gap-2 mb-5">
      <NuxtLink
        to="/"
        class="text-green-500 hover:underline underline-offset-4 mb-2 inline-block"
      >
        ← Back to home
      </NuxtLink>
      <h1 class="text-3xl sm:text-4xl font-medium">Projects</h1>
    </div>

    <!-- Filter Tags -->
    <div class="flex flex-wrap gap-2 mb-8">
      <button
        @click="selectedCategory = null"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300',
          selectedCategory === null
            ? 'bg-green-500 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        ]"
        :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
      >
        All
      </button>
      <button
        v-for="category in categories"
        :key="category.value"
        @click="selectedCategory = category.value"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300',
          selectedCategory === category.value
            ? 'bg-green-500 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 mix-blend-multiply',
        ]"
        :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 z-20">
      <NuxtLink
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="flex flex-col gap-3 group"
      >
        <div class="overflow-hidden bg-stone-50">
          <NuxtImg
            :src="project.image.startsWith('/') ? project.image : `/${project.image}`"
            :alt="project.alt"
            class="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-500"
            :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
            format="webp"
            quality="80"
            sizes="480px"
            fit="cover"
            width="600"
            height="400"
            placeholder
            loading="lazy"
          />
        </div>
        <div class="flex items-center gap-2 flex-wrap mix-blend-multiply">
          <span
            class="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-neutral-600 uppercase mix-blend-multiply"
          >
            {{ getCategoryTag(project.category) }}
          </span>
          <span
            v-if="project.date"
            class="text-xs text-neutral-500"
          >
            {{ formatDate(project.date) }}
          </span>
        </div>
        <h3 class="font-medium text-lg group-hover:text-green-400 transition-colors duration-300"
            :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }">
          {{ project.title }}
        </h3>
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { getProjectsWithDates } from '~/data/projects'

const categories = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'type', label: 'Type' },
  { value: 'graphic', label: 'Graphic' },
  { value: 'web', label: 'Interface' },
]

const selectedCategory = ref<string | null>(null)

// Load projects with dates
const { data: projects } = await useAsyncData('projects-with-dates', () => getProjectsWithDates())

const filteredProjects = computed(() => {
  if (!projects.value) return []
  if (selectedCategory.value === null) {
    return projects.value
  }
  return projects.value.filter((p) => p.category === selectedCategory.value)
})

const getCategoryTag = (category: string) => {
  const tags: Record<string, string> = {
    editorial: 'Editorial',
    type: 'Type',
    graphic: 'Graphic',
    web: 'Interface',
  }
  return tags[category] || category
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${month} ${year}`
  } catch (e) {
    return dateString
  }
}

useHead({
  htmlAttrs: {
    lang: 'en-US',
  },
})

useSeoMeta({
  title: 'Projects – Studio Leon Vogler',
  ogTitle: 'Projects – Studio Leon Vogler',
  description: 'Browse all design projects by Leon Vogler.',
  ogDescription: 'Browse all design projects by Leon Vogler.',
})
</script>
