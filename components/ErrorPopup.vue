<script lang="ts" setup>
interface ErrorPopupProps {
  message: string
}

defineProps<ErrorPopupProps>()
</script>

<template>
  <div
    v-if="message"
    class="w-3/4 rounded-lg bg-red-800 p-4 text-xs font-mono text-white shadow-lg"
  >
    {{ message }}
  </div>
</template>
