import type * as BabelCoreNamespace from '@babel/core'
import type * as BabelTypesNamespace from '@babel/types'

export type Babel = typeof BabelCoreNamespace
export type BabelTypes = typeof BabelTypesNamespace

export type SnapshotState = {
  line?: number
  __returnValue__?: unknown
  [variable: string]: unknown
}

export type Snapshotter = {
  data: SnapshotState[]
  push(val: SnapshotState): void
}

export type Recordable = {
  entryPoint: EntryFunction
  params: string
  code: string
}

export type EntryFunction<T = unknown> = (...args: T[]) => unknown

export type EntryArguments<T> = T extends (
  snapshot: Snapshotter,
) => (...args: infer Params) => unknown
  ? Params
  : unknown[]

export const SNAPSHOTS = '__snapshots'
export const ARGUMENTS = '__arguments'
export const PARAMS = '__params'
export const ENTRY_POINT = '__entryPoint'
export const META = '__meta'
