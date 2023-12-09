<script lang="ts" setup>
import { Motion, Presence } from 'motion/vue'
import type { SnapshotState } from '~/lib/types'

interface VariablesProps {
  params: (string | number[] | undefined)[]
  snapshots: SnapshotState[]
  index: number
}
const blacklist = new Set(['line', '__returnValue__'])

const { snapshots, index, params } = defineProps<VariablesProps>()

const animate = ref({
  y: 10,
  opacity: 1,
  transition: {
    duration: 0.5,
    delay: 0.2,
  },
})
const exit = ref({
  y: 10,
  opacity: 0,
})

const currentValue = computed(() => snapshots[index])

const previousValue = computed(() => snapshots[index - 1])

const values = computed(() => {
  const value = currentValue.value
  if (!value) return []
  return Object.entries(value).filter(([key]) => !blacklist.has(key))
})
const parameters = computed(() =>
  values.value.filter(([key]) => params.includes(key)),
)
const localVariables = computed(() =>
  values.value.filter(([key]) => !params.includes(key)),
)
const hasReturnValue = computed(() =>
  Object.prototype.hasOwnProperty.call(currentValue.value, '__returnValue__'),
)
const hasParameters = computed(() => parameters.value.length > 0)

const hasLocalVariables = computed(() => localVariables.value.length > 0)

const hasBreakpoint = computed(() => !!currentValue.value?.line)
</script>

<template>
  <section
    className="font-mono w-full overflow-y-auto max-w-4xl mx-auto py-8 bg-gray-800 rounded-lg"
    flex="col justify-between"
  >
    <Presence>
      <Motion v-model="hasBreakpoint" :animate="animate" :exit="exit">
        <h1 v-if="currentValue?.line" className="text-center mb-4 ">
          debugger @ line
          <span class="realistic-marker-highlight">
            {{ currentValue?.line }}
          </span>
        </h1>
      </Motion>
    </Presence>

    <ul className="w-full">
      <Presence>
        <Motion v-model="hasParameters" :animate="animate" :exit="exit">
          <li v-if="hasParameters" className="mb-4">
            <span>Parameters</span>
            <VariableList :value="parameters" :previous-value="previousValue" />
          </li>
        </Motion>
      </Presence>

      <Presence>
        <Motion v-model="hasLocalVariables" :animate="animate" :exit="exit">
          <li v-if="hasLocalVariables">
            Local Variables
            <VariableList
              :value="localVariables"
              :previous-value="previousValue"
            />
          </li>
        </Motion>
      </Presence>

      <Presence>
        <Motion v-model="hasReturnValue" :animate="animate" :exit="exit">
          <li v-if="hasReturnValue">
            Return Value
            <VariableItem class="mt-2">
              {{ JSON.stringify(currentValue?.__returnValue__) }}
            </VariableItem>
          </li>
        </Motion>
      </Presence>
    </ul>
  </section>
</template>
