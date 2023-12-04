// https://nuxt.com/docs/api/configuration/nuxt-config
import ViteComponents from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Playground',
      link: [{ rel: 'icon', type: 'image/*', href: '/favicon.svg' }],
    },
  },
  modules: [
    '@unocss/nuxt',
    'unplugin-icons/nuxt',
    '@vueuse/nuxt',
    'nuxt-monaco-editor',
  ],
  vite: {
    plugins: [
      ViteComponents({
        resolvers: [
          IconsResolver({
            componentPrefix: '',
          }),
        ],
        dts: true,
      }),
    ],
  },
  vue: {
    defineModel: true,
    propsDestructure: true,
  },
})
