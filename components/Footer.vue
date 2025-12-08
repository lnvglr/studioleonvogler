<template>
  <footer role="banner" class="flex flex-col gap-5 bg-neutral-100  mix-blend-multiply">
    <nav role="navigation">
      <ul aria-expanded="false" class="flex flex-col sm:flex-row sm:items-center gap-3">
        <li v-for="(item, i) in menu" :key="i">
          <NuxtLink :to="item.link" class="hover:underline leading-none">{{ item.name }}</NuxtLink>
        </li>
      </ul>
    </nav>
    <div class="text-sm text-neutral-400">
      <span>Copyright © {{new Date().getFullYear()}} Leon Vogler. All rights reserved</span>
    </div>
  </footer>
</template>
<script setup lang="ts">
const menu = [
  {
    name: 'Projects',
    link: '/projects',
  },
  {
    name: 'Contact / About',
    link: '/contact-about',
  },
  {
    name: 'Legal Notice',
    link: '/legal-notice',
  },
  {
    name: 'Privacy Policy',
    link: '/privacy-policy',
  },
]
</script>
