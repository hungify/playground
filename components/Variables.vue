<script lang="ts" setup>
import type { SnapshotState } from '~/lib/types'

interface VariablesProps {
  params: (string | number | number[])[]
  snapshots: SnapshotState[]
  index: number
}
const { snapshots, index, params } = defineProps<VariablesProps>()

const blacklist = new Set(['line', '__returnValue__'])

const currentValue = computed(() => snapshots[index])
const previousValue = computed(() => snapshots[index - 1])

const values = computed(() => {
  const value = currentValue.value
  const previous = previousValue.value
  if (!value) return []
  return Object.entries(value).filter(
    ([key, value]) =>
      !blacklist.has(key) &&
      (previous ? previous[key] !== value : true) &&
      (typeof value !== 'function' || params.includes(key)),
  )
})
const parameters = computed(() =>
  values.value.filter(([key]) => params.includes(key)),
)
const localVariables = computed(() =>
  values.value.filter(([key]) => !params.includes(key)),
)
</script>

<template>
  <section
    className="font-mono w-full overflow-y-auto flex flex-col justify-center
      max-w-4xl mx-auto py-8 bg-gray-800 rounded-lg
      "
  >
    <h1 v-if="currentValue?.line" layout className="text-center mb-4 ">
      debugger @ line
      <span class="realistic-marker-highlight">
        {{ currentValue?.line }}
      </span>
    </h1>

    <ul className="w-full">
      <li layout className="mb-4">
        <span layout>Parameters</span>
        <VariableList :value="parameters" :previous-value="previousValue" />
      </li>
      <li v-if="Object.keys(localVariables).length > 0">
        Local Variables
        <VariableList :value="localVariables" :previous-value="previousValue" />
      </li>

      <li
        v-if="
          Object.prototype.hasOwnProperty.call(currentValue, '__returnValue__')
        "
        className="grid"
      >
        Return Value
        <VariableItem class-name="mt-2">
          {{ JSON.stringify(currentValue?.__returnValue__) }}
        </VariableItem>
      </li>
    </ul>
  </section>
</template>
