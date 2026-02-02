<template>
  <div class="font-normal flex flex-col text-stone-700">
    <div
      class="inset-0 fixed -z-10 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] via-20% to-50% to-white bg-cover duration-1000 pointer-events-none"
      aria-hidden="true"
      :class="{
        'from-purple-200 via-green-50': route.name === 'contact-about',
        'from-red-200 via-orange-50':
          route.name === 'privacy-policy' || route.name === 'legal-notice',
        'from-teal-200 via-green-50': route.name === 'index' || route.name?.toString().startsWith('projects'),
      }"
    />
      <!-- :style="`filter: hue-rotate(${hue}deg);`" -->
    <div
      class="flex flex-col min-h-screen portrait:min-h-[100dvh] p-5 sm:p-10 md:px-20 sm:pb-20 md:pb-32 gap-5 sm:gap-10"
      :class="{ 'relative z-10': route.name === 'index' }"
    >
      <Header 
        :class="[
          { 
            'absolute top-0 left-0 right-0 z-50 p-5 sm:p-0 sm:relative sm:z-auto sm:top-auto sm:left-auto sm:right-auto max-sm:text-[var(--header-text-color,inherit)]': route.name === 'index' 
          },
          'transition-all duration-[2s] ease-expressive-out',
          isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]" 
      />
      <NuxtPage 
        class="flex flex-col [&_#desktop-article-section]:transition-all [&_#desktop-article-section]:duration-[2s] [&_#desktop-article-section]:ease-expressive-out [&_#desktop-article-section]:delay-100"
        :class="isReady ? '[&_#desktop-article-section]:opacity-100 [&_#desktop-article-section]:translate-y-0' : '[&_#desktop-article-section]:opacity-0 [&_#desktop-article-section]:translate-y-5'"
      />
    </div>
    <Footer v-if="route.name !== 'index'" class="mt-auto p-5 pt-20 sm:p-10 md:px-20 sm:mx-0" />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const hue = ref(Math.floor(Math.random() * 360))
const isReady = ref(false)

const updateHue = (event) => {
  const x = event.clientX
  const y = event.clientY
  const width = window.innerWidth
  const height = window.innerHeight
  
  // Calculate hue based on pointer position (0-360 degrees)
  // Using both x and y for more variation
  const xHue = (x / width) * 180
  const yHue = (y / height) * 180
  hue.value = Math.floor(xHue + yHue)
}

onMounted(async () => {
  await router.isReady()
  window.addEventListener('mousemove', updateHue)
  
  // Fade in content
  setTimeout(() => {
    isReady.value = true
  }, 50)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updateHue)
})
</script>
