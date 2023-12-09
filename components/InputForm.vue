<script lang="ts" setup>
interface InputFormProps {
  inputs: (string | number[] | undefined)[][]
}

defineProps<InputFormProps>()
</script>

<template>
  <div class="w-full flex flex-col justify-between font-mono">
    <span class="mb-2">Arguments</span>
    <div class="flex gap-3">
      <template v-for="[name, value] in inputs" :key="name">
        <label class="relative flex-1">
          <div
            class="w-full rounded-md bg-gray-700 p-2"
            :defaultValue="JSON.stringify(value)"
          >
            {{ JSON.stringify(value) }}
          </div>
          <span class="block">{{ name }}</span>
        </label>
      </template>
    </div>
  </div>
</template>
