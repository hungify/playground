<script lang="ts" setup>
// fetch data from server/api
const { data } = await useAsyncData('/api/hello', () => {
  return $fetch('/api/hello', {
    params: {
      name: 'world',
    },
  })
})

const gotoGitHub = () => {
  window.open('https://github.com/nuxtbase/nuxt3-starter')
}
</script>

<template>
  <div class="text-secondary-darker bg-black">
    <div
      class="items-top relative min-h-screen flex justify-center sm:items-center sm:pt-0"
    >
      <div class="grid grid-cols-2 mx-auto max-w-screen-2xl lg:px-8 sm:px-6">
        <NuxtWelcome />
        <div class="flex flex-col gap-4 bg-black px-12 py-20 text-white">
          <!-- Plugins -->
          <div class="gradient-border rounded p-4">
            <div class="mb-4">
              <h1 class="text-2xl font-medium">Plugins</h1>

              <ul class="list-disc list-inside pl-2 pt-1 text-gray-300">
                <li>
                  <a
                    class="text-primary hover:underline"
                    href="https://unocss.dev/integrations/nuxt"
                    target="_blank"
                    >@unocss/nuxt</a
                  >
                </li>
                <li>
                  <a
                    class="text-primary hover:underline"
                    href="https://github.com/antfu/unplugin-icons"
                    target="_blank"
                    >unplugin-icons</a
                  >
                </li>
                <li>
                  <a
                    class="text-primary hover:underline"
                    href="https://pinia.esm.dev/ssr/nuxt.html"
                    target="_blank"
                    >@pinia/nuxt</a
                  >
                </li>
                <li>
                  <a
                    class="text-primary hover:underline"
                    href="https://vueuse.org/nuxt/readme.html#vueuse-nuxt"
                    target="_blank"
                    >@vueuse/nuxt3</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <!-- Serverless Functions -->
          <div class="gradient-border rounded p-4">
            <div class="mb-4 flex flex-col gap-6">
              <h1 class="text-2xl font-medium">Serverless Functions</h1>
              <h2 class="text-base">
                Create a Serverless Functions in
                <a
                  class="text-primary hover:underline"
                  href="api/hello?name=World"
                  target="_blank"
                  >server/api.ts</a
                >
              </h2>

              <code>{{ data }}</code>
            </div>
          </div>

          <div
            class="gradient-border flex items-center justify-center rounded p-4 py-8 space-x-2"
          >
            <div class="">
              <button
                class="hover:text-primary rounded-sm bg-transparent px-2 py-1 focus:outline-transparent"
              >
                <carbon:language class="h-5 w-5" />
              </button>
              <ClientOnly>
                <button
                  class="hover:text-primary rounded-md rounded-sm bg-transparent bg-white px-2 py-1 text-black dark:bg-black dark:text-white focus:outline-transparent"
                >
                  <carbon:moon v-if="true" class="h-5 w-5" />
                  <carbon:sun v-else class="h-5 w-5" />
                </button>
              </ClientOnly>
              <button
                class="hover:text-primary rounded-sm bg-transparent px-2 py-1 focus:outline-transparent"
                @click="() => gotoGitHub()"
              >
                <carbon:logo-github class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-border {
  position: relative;
  border-radius: 0.5rem;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  width: 100%;
}
@media (prefers-color-scheme: light) {
  .gradient-border {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .gradient-border::before {
    background: linear-gradient(
      90deg,
      #e2e2e2 0%,
      #e2e2e2 25%,
      #00dc82 50%,
      #36e4da 75%,
      #0047e1 100%
    );
  }
}
@media (prefers-color-scheme: dark) {
  .gradient-border {
    background-color: rgba(20, 20, 20, 0.3);
  }
  .gradient-border::before {
    background: linear-gradient(
      90deg,
      #303030 0%,
      #303030 25%,
      #00dc82 50%,
      #36e4da 75%,
      #0047e1 100%
    );
  }
}
.gradient-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.5rem;
  padding: 2px;
  width: 100%;
  background-size: 400% auto;
  background-position: 0 0;
  opacity: 0.5;
  transition:
    background-position 0.3s ease-in-out,
    opacity 0.2s ease-in-out;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
}
.gradient-border:hover::before {
  background-position: -50% 0;
  opacity: 1;
}
</style>
