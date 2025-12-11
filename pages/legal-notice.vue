<template>
  <main class="max-w-xl">
    <h1 class="text-lg sm:text-xl font-medium">Legal Notice</h1>
    <h2>Information according to § 5 TMG</h2>
    <p>Leon Vogler<br />
      Gailhöfe 6<br />
      88699 Frickingen</p>

    <h2 class="font-medium">Contact:</h2>
    <ClientOnly><a :href="`mailto:${mail}`">{{mail}}</a></ClientOnly>
  </main>
</template>

<script setup lang="ts">
const mail = ref()
onMounted(() => mail.value = 'studio@leonvogler.com')
</script>
