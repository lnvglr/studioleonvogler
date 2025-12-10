<template>
  <div class="font-normal flex flex-col text-stone-700">
    <div
      class="inset-0 fixed z-10 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] via-20% to-50% to-white bg-cover duration-1000 mix-blend-multiply pointer-events-none"
      aria-hidden="true"
      :class="{
        'from-purple-200 via-green-50': route.name === 'contact-about',
        'from-red-200 via-orange-50':
          route.name === 'privacy-policy' || route.name === 'legal-notice',
        'from-teal-200 via-green-50': route.name === 'index' || route.name?.toString().startsWith('projects'),
      }"
      :style="`filter: hue-rotate(${hue}deg);`"
    />
    <div
      class="flex flex-col min-h-screen p-5 sm:p-10 md:px-20 pb-10 sm:pb-20 md:pb-32 gap-5 sm:gap-10"
      :class="{ 'sm:pr-0': route.name === 'index' }"
    >
      <Header />
      <NuxtPage class="flex flex-col" />
    </div>
    <Footer v-if="route.name !== 'index'" class="mt-auto p-5 sm:p-10 md:px-20" />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const hue = ref(Math.floor(Math.random() * 360))

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
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updateHue)
})
</script>
