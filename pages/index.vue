<template>
  <main class="gap-5 sm:gap-10 -mx-5 sm:-mx-10 md:-mx-20">
    <div class="flex flex-col sm:flex-row sm:h-screen sm:overflow-hidden">
      <!-- Left side: Text + Button + Footer (50%) -->
      <div class="flex flex-col justify-between sm:w-1/2 sm:overflow-y-auto sm:pr-10 gap-5 sm:gap-10 px-5 sm:px-10 md:px-20">
        <div class="flex flex-col gap-5 sm:gap-10">
          <article class="max-w-xs lg:max-w-sm">
            <p class="font-normal">Heyya!</p>
            <p class="font-normal">
              My name is Leon and I am a visual designer and a front-end developer.
            </p>
            <p class="font-normal">
              I design clear and intriguing
              <span class="text-green-400">editorials</span>
              (books, magazines, publications), light and easy
              <span class="text-green-400">graphics</span>
              (posters, typefaces, illustrations) and clear and intuitive
              <span class="text-green-400">interfaces</span>
              (websites, apps, interactions).
            </p>
            <p class="font-normal">
              See the <NuxtLink to="/projects" class="text-green-400 hover:underline underline-offset-4">work</NuxtLink>.
            </p>
            <p class="font-normal">
              In tech, I specialize in front-end development, writing code to create
              the user facing side of websites and apps. I write all my code using
              TypeScript in the frameworks of React and Vue and I use Tailwind CSS to
              apply styles.
            </p>
            <p class="font-normal">
              <Code class="inline" />
            </p>
          </article>
          <NuxtLink
            to="mailto:studio@leonvogler.com"
            class="p-2 py-1 text-green-400 hover:!bg-green-500 hover:text-white border border-current ite rounded mr-auto transition-all duration-300 w-fit"
            :style="{ transitionTimingFunction: 'cubic-bezier(0.1, 1, 0.1, 1)' }"
            >Let's collab ❤️</NuxtLink
          >
        </div>
        <!-- Footer on left side for desktop -->
        <Footer class="hidden sm:flex mt-auto bg-transparent" />
      </div>

      <!-- Right side: Fixed full-size carousel (50%) -->
      <div class="hidden sm:block sm:w-1/2 sm:fixed sm:right-0 sm:top-0 sm:h-screen sm:overflow-hidden">
        <ProjectCarousel v-if="projects" :projects="projects" :autoplay-interval="5000" />
      </div>
    </div>
    
    <!-- Mobile: Carousel below content -->
    <div class="sm:hidden px-5">
      <ProjectCarousel v-if="projects" :projects="projects" :autoplay-interval="5000" />
    </div>
  </main>
</template>
<script setup lang="ts">
import { getProjectsWithDates } from '~/data/projects'

// Shuffle array function (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Load projects with dates and randomize order
const { data: projects } = await useAsyncData('home-projects-with-dates', async () => {
  const projectsData = await getProjectsWithDates()
  return shuffleArray(projectsData)
})

useHead({
  htmlAttrs: {
    lang: 'en-US',
  },
  link: [
    // Preload critical fonts
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/Gramatika-Regular.woff2',
      crossorigin: 'anonymous',
    },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/Heebo-Medium.woff2',
      crossorigin: 'anonymous',
    },
  ],
})
useSeoMeta({
  title: 'Studio Leon Vogler',
  ogTitle: 'Studio Leon Vogler',
  description:
    'Leon Vogler is a developer and designer for in Vue, React, TypeScript.',
  ogDescription:
    'Leon Vogler is a developer and designer for in Vue, React, TypeScript.',
})
</script>
