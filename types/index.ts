import type { SnapshotState } from '~/lib/types'

export type CodeMessageEvent = MessageEvent<{
  code: string
}>

export type TranspileMessageEvent = MessageEvent<{
  snapshots: SnapshotState[]
  params: string[]
  args: [number[], string]
}>
