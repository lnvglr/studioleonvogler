<template>
  <main class="gap-5 sm:gap-10 max-w-4xl">
    <!-- Type Design Projects: Show only specimen -->
    <article v-if="project && project.category === 'type' && font" class="flex flex-col gap-5 sm:gap-10">
      <NuxtLink
        to="/projects"
        class="text-green-500 hover:underline underline-offset-4 mb-5 inline-block"
      >
        ← Back to projects
      </NuxtLink>
      <FontSpecimen 
        :font="font" 
        :title="project.title"
        :fontName="project.fontName"
        :content="content"
      />
    </article>

    <!-- Other Projects: Show normal project layout -->
    <article v-else-if="project" class="flex flex-col gap-5 sm:gap-10">
      <NuxtLink
        to="/projects"
        class="text-green-500 hover:underline underline-offset-4 mb-5 inline-block"
      >
        ← Back to projects
      </NuxtLink>
      <div class="flex flex-col gap-2">
        <span class="text-xs text-neutral-500 uppercase">{{
          project.categoryName || project.category
        }}</span>
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl sm:text-3xl font-medium">{{ project.title }}</h1>
          <span
            v-if="project.date"
            class="text-sm text-neutral-500"
          >
            {{ formatDate(project.date) }}
          </span>
        </div>
      </div>

      <div class="max-w-2xl">
        <p class="text-lg leading-relaxed mb-8 sm:mb-10 font-normal">{{ project.description }}</p>
      </div>

      <div class="w-full">
        <img
          :src="getImagePath(project.image)"
          :alt="project.alt || project.title"
          class="rounded-xl bg-stone-50 w-full object-cover"
          loading="lazy"
        />
      </div>

      <div
        ref="contentRef"
        class="max-w-2xl"
      >
        <!-- Render content from markdown if available -->
        <ContentRenderer
          v-if="content"
          :value="content"
          class="prose prose-neutral max-w-none prose-headings:font-medium prose-p:font-normal prose-p:text-neutral-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:my-16 prose-img:mb-20 prose-p:mb-8 prose-img:cursor-pointer prose-img:hover:opacity-90 prose-img:transition-opacity"
        />
      </div>
    </article>

    <div v-else class="flex flex-col gap-5">
      <p>Project not found.</p>
      <NuxtLink
        to="/"
        class="text-green-500 hover:underline underline-offset-4"
      >
        ← Back to home
      </NuxtLink>
    </div>

    <!-- Lightbox Component -->
    <Lightbox />
  </main>
</template>

<script setup lang="ts">
import { projects, getProjectById } from '~/data/projects'
import { getFontById } from '~/data/fonts'

const route = useRoute()
const projectId = route.params.id as string
const contentRef = ref<HTMLElement | null>(null)
const { open: openLightbox } = useLightbox()

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

const font = computed(() => getFontById(projectId))

const hasFontSpecimen = (projectId: string): boolean => {
  return !!getFontById(projectId)
}

// Try to fetch from content first, fallback to data
const { data: content } = await useAsyncData(`project-${projectId}`, async () => {
  try {
    const contentData = await queryContent(`projects/${projectId}`).findOne()
    if (contentData) {
      return contentData
    }
  } catch (e) {
    // Content file doesn't exist, will fallback to data
    console.log('Content file not found, using data fallback')
  }
  return null
})

// Get project data (from content or fallback to data file)
const project = computed(() => {
  if (content.value) {
    return content.value
  }
  return getProjectById(projectId)
})

const contentHtml = computed(() => {
  // Use ContentRenderer or get body from content
  if (content.value && content.value.body) {
    return content.value.body
  }
  return null
})

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

const getImagePath = (imagePath: string) => {
  if (!imagePath) return ''
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

// Attach click handlers to images in markdown content
const attachImageHandlers = () => {
  nextTick(() => {
    if (contentRef.value) {
      const images = contentRef.value.querySelectorAll('img')
      images.forEach((img) => {
        // Skip if already has handler
        if (img.dataset.lightboxHandler === 'true') return
        
        img.style.cursor = 'pointer'
        img.dataset.lightboxHandler = 'true'
        img.addEventListener('click', () => {
          const src = img.getAttribute('src') || ''
          const alt = img.getAttribute('alt') || ''
          // Handle relative paths
          const fullSrc = src.startsWith('/') ? src : `/${src}`
          openLightbox(fullSrc, alt)
        })
      })
    }
  })
}

// Watch for content changes and attach handlers
watch(() => content.value, () => {
  attachImageHandlers()
}, { immediate: true })

onMounted(() => {
  attachImageHandlers()
})

useHead({
  htmlAttrs: {
    lang: 'en-US',
  },
})

useSeoMeta({
  title: `${project.value.title} – Studio Leon Vogler`,
  ogTitle: `${project.value.title} – Studio Leon Vogler`,
  description: project.value.description,
  ogDescription: project.value.description,
  ogImage: getImagePath(project.value.image),
})
</script>
