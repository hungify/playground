/// <reference lib="webworker" />
import { transpileSource } from '~/lib/transpile'
import type { CodeMessageEvent } from '~/types'

self.addEventListener('message', (evt: CodeMessageEvent) => {
  const { code } = evt.data
  const { entryPoint, snapshots, params, args } = transpileSource(code)

  const returnValue = entryPoint(...args)
  const cleanSnap = cleanSnapshots(snapshots.data)
  const snapshotsPad = pad(cleanSnap, returnValue, args, params)

  postMessage({ snapshots: snapshotsPad, params, args })
})
