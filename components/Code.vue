<template>
    <div class="inline code-links">
      <span class="inline">Check it out on</span>
      <a
        class="inline custom-link"
        href="https://github.com/lnvglr"
        aria-label="GitHub Leon Vogler"
        target="_blank"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          version="1.1"
          width="16"
          data-view-component="true"
          class="octicon octicon-mark-github v-align-middle text-stone-700"
        >
          <path
            fill-rule="evenodd"
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          ></path>
        </svg>
        <span class=" text-stone-700">GitHub</span>
      </a>
      <span class="">and read my contributions on </span>
      <a
        class="custom-link"
        href="https://stackoverflow.com/users/4862595/leon-vogler"
        aria-label="Stackoverflow Leon Vogler"
        target="_blank"
      >
        <svg aria-hidden="true" width="15" viewBox="0 0 32 37" class="text-stone-700">
          <path d="M26 33v-9h4v13H0V24h4v9h22Z" fill="currentColor"></path>
          <path
            d="m21.5 0-2.7 2 9.9 13.3 2.7-2L21.5 0ZM26 18.4 13.3 7.8l2.1-2.5 12.7 10.6-2.1 2.5ZM9.1 15.2l15 7 1.4-3-15-7-1.4 3Zm14 10.79.68-2.95-16.1-3.35L7 23l16.1 2.99ZM23 30H7v-3h16v3Z"
            fill="currentColor"
          ></path>
        </svg>
        <span class="text-stone-700">Stackoverflow</span>
      </a>
    </div>
</template>

<style scoped>
.code-links {
  display: flex;
  align-items: center;
  gap: 0 1ex;
  flex-wrap: wrap;
}
.code-links > * {
  white-space: nowrap;
}

.code-links:after {
  content: '.';
  margin-inline: -1ex;
}

.code-links:after {
  color: currentColor;
}

.custom-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: inherit;
  white-space: nowrap;
}

.custom-link span {
  background: url('/img/code-flow.webp');
  background-size: cover;
  background-position: center;
  background-clip: text;
  -webkit-background-clip: text;
  transition: 0.5s;
}

.custom-link:hover {
  text-decoration: none;
}

.custom-link:hover span {
  transition: 0.5s;
  color: #00000000;
}

.custom-link:hover svg path {
  transition: 0.5s;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0% {
    fill: #00ffff;
  }

  15% {
    fill: #ff00ff;
  }

  40% {
    fill: #3300ff;
  }

  87% {
    fill: #ffaadd;
  }

  100% {
    fill: #00ffff;
  }
}
</style>
