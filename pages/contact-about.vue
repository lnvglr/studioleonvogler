<template>
  <main class="max-w-xl gap-5 sm:gap-10">
    <div>
      <h1 class="text-lg sm:text-xl font-bold">Contact / About</h1>
      <p>
        I was born and raised in the south of Germany and started out as a
        graphic designer when I was still a teenager. While I was studying
        Integrated Design in Cologne, I broadened my skill set by getting into
        editorial design and typography on the one hand and web design and
        development on the other. My work is characterised by a clear visual
        language and clean code, which enables me to serve a wide spectrum –
        from visual design to the building of apps.
      </p>
      <p>
        I’ve got a wide range of skills that I can draw on, including design
        expertise, technical proficiency and multilingual communication.
        <!-- <ClientOnly>
          <template #fallback> multilingual communication.</template>
          <VTooltip class="inline">
            <button
              class="text-green-500 underline underline-offset-4 hover:text-green-600"
              role="button"
            >
              multilingual communication
            </button>
            <template #popper>
              Deutsch ist meine Muttersprache, I’m equally at home with English
              as I am with German, no tengo problemas hablar Español, אני מדבר
              עברית טובה וכיף לי מאד и говорю по-русски, хотя и немного ржаво.
            </template> </VTooltip
          >.
        </ClientOnly> -->
      </p>
    </div>
    <div class="flex items-center gap-3">
      <NuxtImg
        src="/img/avatar-leon-vogler.jpg"
        sizes="196px"
        width="100px"
        height="100px"
        quality="70"
        format="webp"
        alt="Leon Vogler"
        loading="lazy"
        class="rounded-full w-16 h-16 sm:w-24 sm:h-24 -ml-2 border border-white object-cover"
      />
      <div class="flex flex-col flex-gap">
        <p class="font-bold text-lg">Leon Vogler</p>
        <ClientOnly
          ><a :href="`mailto:${mail}`" class="hover:underline">{{
            mail
          }}</a></ClientOnly
        >
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
const mail = ref()
onMounted(() => mail.value = 'studio@leonvogler.com')
</script>
<style>
.v-popper--theme-tooltip .v-popper__wrapper .v-popper__inner {
  /* padding: 0px; */
  background-color: #fafafa;
  border: 1px solid #ffffff;
  color: black;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);
  width: 360px;
  padding: 15px 20px;
}
.v-popper--theme-tooltip .v-popper__arrow-outer {
  border-color: white;
}
</style>
