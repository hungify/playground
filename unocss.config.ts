// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
} from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  shortcuts: [
    {
      'flex-center': 'flex justify-center items-center',
    },
  ],
  theme: {
    colors: {
      // ...
    },
  },
  presets: [presetUno(), presetAttributify(), presetIcons(), presetRemToPx()],
  transformers: [transformerDirectives()],
})
