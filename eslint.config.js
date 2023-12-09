import { GLOB_TS, GLOB_TSX, sxzz } from '@sxzz/eslint-config'

export default sxzz(
  {
    files: [GLOB_TS, GLOB_TSX],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    vue: true,
    prettier: true,
    markdown: true,
    unocss: true,
    sortKeys: true,
  },
)
