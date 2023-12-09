<script lang="ts" setup>
import equal from 'fast-deep-equal'
import { Motion, Presence } from 'motion/vue'
import type { SnapshotState } from '~/lib/types'

interface Props {
  value: [string, unknown][]
  previousValue?: SnapshotState
}
const { previousValue, value } = defineProps<Props>()

const hasLast = (key: string) => {
  return (
    previousValue && Object.prototype.hasOwnProperty.call(previousValue, key)
  )
}

const isLastItem = (key: string, val: unknown) => {
  return hasLast(key) && equal(previousValue?.[key], val)
}
</script>

<template>
  <ul class="mt-2 flex flex-col gap-3">
    <template v-for="[key, val] in value" :key="key">
      <Presence>
        <Motion
          :key="key"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{
            y: 0,
            opacity: isLastItem(key, val) ? 0.2 : 1,
            transition: {
              duration: 0.5,
              delay: 0.2,
            },
          }"
          :exit="{ y: 10, opacity: 0 }"
        >
          <li class="grid grid-cols-2 w-full gap-4 break-words">
            <VariableItem>{{ key }}</VariableItem>
            <VariableItem>{{ JSON.stringify(val) }}</VariableItem>
          </li>
        </Motion>
      </Presence>
    </template>
  </ul>
</template>
