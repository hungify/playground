import { transform } from '@babel/standalone'
import { snapshot } from './snapshot'
import { customPlugin } from './plugin'
import {
  type EntryArguments,
  type EntryFunction,
  SNAPSHOTS,
  type Snapshotter,
} from './types'

export const transpileSource = (source: string) => {
  const result = transform(source, {
    plugins: [customPlugin],
  })
  if (!result || !result.code)
    throw new Error(`Something went wrong transpiling ${source}.`)

  return new Function(SNAPSHOTS, result.code)(snapshot.createSnapshot()) as {
    entryPoint: EntryFunction
    snapshots: Snapshotter
    params: string[]
    arguments: EntryArguments<
      string | number | boolean | string[] | number[] | boolean[]
    >
  }
}
