import CodeWorker from '~/assets/workers/code?worker'
import type { SnapshotState } from '~/lib/types'
import type { TranspileMessageEvent } from '~/types'

const defaultOptions = {
  timeout: 2000,
  onError: () => {},
  onExecuteStart: () => {},
  onExecuteEnd: () => {},
  debugger: {
    onStep: () => {},
    onStepBack: () => {},
    currentStep: 0,
  },
}

interface Options {
  timeout?: number
  onError?: (evt: ErrorEvent | null) => void
  onExecuteStart?: () => void
  onExecuteEnd?: () => void
  debugger?: {
    onStep: () => void
    onStepBack: () => void
    currentStep: number
  }
}

export function useCode(code: Ref<string>, opts: Options = defaultOptions) {
  const snapshots = ref<SnapshotState[]>([])
  const inputs = ref<((string | number)[] | (string | number[])[])[]>([])
  const isExecuting = ref(false)
  const isExecuted = ref(false)
  const error = ref<ErrorEvent | null>(null)
  const activeIndex = ref(0)

  const execute = () => {
    const worker = new CodeWorker()
    isExecuting.value = true
    const options = { ...defaultOptions, ...opts }
    options.onExecuteStart?.()

    const timeout = setTimeout(() => {
      worker.terminate()
      isExecuting.value = false
      error.value = new ErrorEvent(`Timed out while running algorithm`)
    }, options.timeout)

    worker.addEventListener('message', (evt: TranspileMessageEvent) => {
      clearTimeout(timeout)
      const { params } = evt.data
      inputs.value = params.map((param, index) => {
        return [param, evt.data.args[index]]
      })

      snapshots.value = evt.data.snapshots

      worker.terminate()
      isExecuted.value = true
      isExecuting.value = false
      options.onExecuteEnd?.()
      activeIndex.value = 0
    })

    worker.addEventListener('error', (evt) => {
      clearTimeout(timeout)
      isExecuting.value = false
      isExecuted.value = true
      error.value = evt
    })

    worker.postMessage({
      code: toValue(code),
    })
  }

  const handleStepBack = () => {
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  }

  const handleStep = () => {
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      snapshots.value.length - 1,
    )
  }

  const params = computed(() => {
    return inputs.value.map((input) => input[0])
  })

  const currentStep = computed(
    () => `Step ${activeIndex.value + 1} of ${snapshots.value.length}`,
  )

  watch(code, () => {
    isExecuted.value = false
    error.value = null
    isExecuting.value = false
    snapshots.value = []
  })

  return {
    isExecuting,
    snapshots,
    inputs,
    execute,
    isExecuted,
    error,
    params,
    debugger: {
      activeIndex,
      onStep: handleStep,
      onStepBack: handleStepBack,
      currentStep,
    },
  }
}
