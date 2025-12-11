<template>
  <header role="banner">
    <div class="font-medium uppercase text-[var(--header-text-color,inherit)] sm:!text-neutral-700">
      <h1 class="text-xl sm:text-2xl lg:text-3xl">
        <NuxtLink
          to="/"
          rel="home"
          class="hover:underline underline-offset-4"
          >{{ title }}</NuxtLink
        >
      </h1>
      <span
        class="text-base sm:text-xl leading-none opacity-50"
        >{{ description }}</span
      >
    </div>
  </header>
</template>
<script setup lang="ts">
const title = "Studio Leon Vogler";
const description = "Designer & Developer";
</script>
