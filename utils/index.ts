import type { Snapshotter } from '../lib/types'

export function cleanSnapshots(snapshots: Snapshotter['data']) {
  return snapshots.map((snapshot) => {
    return Object.fromEntries(
      Object.entries(snapshot).filter(([, val]) => typeof val !== 'function'),
    )
  }) as Snapshotter['data']
}

/**
 * Pad the snapshots with two additional states:
 *  - Start consisting of just the passed inputs
 *  - End consisting of the passed inputs and return value
 */
export function pad(
  snapshots: Snapshotter['data'],
  returnValue: unknown,
  inputs: unknown[],
  paramKeys: string[],
) {
  const args = Object.fromEntries(zip(paramKeys, inputs))
  snapshots.unshift(args)
  snapshots.push({ ...args, __returnValue__: returnValue })
  return snapshots
}

function zip<T, U>(arr1: T[], arr2: U[]) {
  return arr1.map((item, index) => [item, arr2[index]])
}
