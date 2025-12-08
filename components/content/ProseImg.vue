<template>
  <NuxtImg
    :src="normalizedSrc"
    :alt="alt"
    format="webp"
    quality="85"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 672px"
    fit="inside"
    placeholder
    :class="['prose-img', $attrs.class || 'w-full']"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
})

const { open: openLightbox } = useLightbox()

const normalizedSrc = computed(() => {
  return props.src.startsWith('/') ? props.src : `/${props.src}`
})

const handleClick = () => {
  openLightbox(normalizedSrc.value, props.alt || '')
}
</script>

<style scoped>
.prose-img {
  cursor: pointer;
}
</style>
