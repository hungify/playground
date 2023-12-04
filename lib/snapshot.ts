import rfdc from 'rfdc'
import type { Snapshotter } from './types'

const clone = rfdc()

export const snapshot = {
  createSnapshot(): Snapshotter {
    const data: Snapshotter['data'] = []
    return {
      data,
      push(ss) {
        data.push(clone(ss))
      },
    }
  },
}
