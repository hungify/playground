<script lang="ts" setup>
import type { SnapshotState } from '~/lib/types'

interface Props {
  value: [string, unknown][]
  previousValue?: SnapshotState
}

defineProps<Props>()
</script>

<template>
  <ul class="mt-2 flex flex-col gap-3">
    <template v-for="[key, val] in value" :key="key">
      <li class="grid grid-cols-2 w-full gap-4 break-words">
        <VariableItem>{{ key }}</VariableItem>
        <VariableItem>{{ JSON.stringify(val) }}</VariableItem>
      </li>
    </template>
  </ul>
</template>
