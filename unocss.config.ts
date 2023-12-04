// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  toEscapedSelector,
  transformerDirectives,
} from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  rules: [
    [
      /^realistic-marker-highlight/,
      ([,], { rawSelector }) => {
        const selector = toEscapedSelector(rawSelector)
        return `
${selector} {
  position: relative;
  z-index: 1;
}
${selector}::before {
  content: '';
  background-color: #ffa33c;
  width: 100%;
  height: 1.2em;
  position: absolute;
  z-index: -1;
  filter: url(#marker-shape);
  left: 0.1em;
  top: 0.1em;
  padding: 0 0.25em;

}
`
      },
    ],
  ],
  shortcuts: [],
  theme: {
    colors: {},
  },
  presets: [presetUno(), presetAttributify(), presetIcons(), presetRemToPx()],
  transformers: [transformerDirectives()],
})
