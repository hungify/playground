<script lang="ts" setup>
import type * as Monaco from 'monaco-editor'

const exampleAlgorithm = {
  code: `/**
 * Export default a function with a debugger statement and
 * watch it run on the right :)
 */

const findAllAverages = (arr, k) => {
  const result = [];
  let windowStart = 0;
  let windowSum = 0;
  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    debugger;
    if (windowEnd >= k - 1) {
      result.push((windowSum / k).toFixed(2));
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }

  debugger;
  return result;
}
export default findAllAverages;
findAllAverages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5);
`,
}

const options: Monaco.editor.IStandaloneEditorConstructionOptions = {
  fontFamily: "'Input Mono', Menlo, 'Courier New', monospace",
  fontSize: 13,
  minimap: {
    enabled: false,
  },
  theme: 'vs-dark',
}

const code = ref(exampleAlgorithm.code)
const codeDebounced = refDebounced(code, 500)
const loading = ref(true)

const {
  error,
  isExecuted,
  isExecuting,
  snapshots,
  inputs,
  execute,
  params,
  debugger: { activeIndex, onStep, onStepBack, currentStep },
} = useCode(codeDebounced)
</script>

<template>
  <main class="h-screen w-screen flex overflow-hidden text-sm">
    <Overlay v-show="loading"> Loading... </Overlay>
    <section class="flex flex-1 items-center bg-gray-800 py-8">
      <MonacoEditor
        v-model="code"
        class="h-screen w-full text-white"
        :options="options"
        lang="javascript"
        @load="loading = false"
      />
    </section>
    <section
      class="relative flex flex-1 flex-col items-center overflow-auto bg-gray-800 p-8 text-white"
      :class="{
        'justify-between': isExecuted,
      }"
    >
      <ErrorPopup v-if="error" :message="error.message" />
      <Overlay v-else-if="isExecuting">Executing...</Overlay>
      <template v-else-if="isExecuted">
        <template v-if="snapshots?.length > 0">
          <InputForm v-if="inputs.length > 0" :inputs="inputs" />
          <Variables
            :params="params"
            :snapshots="snapshots"
            :index="activeIndex"
          />
          <div class="bottom-8 w-full flex items-center justify-around">
            <div class="flex items-center">
              <button
                class="rounded-lg bg-gray-700 px-4 py-2 font-semibold"
                @click="onStepBack"
              >
                Prev
              </button>
              <p className="mx-4">
                {{ currentStep }}
              </p>
              <button
                class="rounded-lg bg-gray-700 px-4 py-2 font-semibold"
                @click="onStep"
              >
                Next
              </button>
            </div>
          </div>
        </template>
      </template>
      <template v-else>
        <button
          class="mt-a min-w-[5rem] self-center rounded-lg bg-gray-700 px-4 py-2 text-center font-semibold"
          @click="execute"
        >
          Run
        </button>
        <p class="mt-a text-base">
          Add a
          <span class="h-screen-3/6 realistic-marker-highlight">debugger</span>
          statement to your code to get started.
        </p>
      </template>
    </section>
  </main>
  <svg version="1.1" class="svg-filters" style="display: none">
    <defs>
      <filter id="marker-shape">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0 0.15"
          numOctaves="1"
          result="warp"
        />
        <feDisplacementMap
          xChannelSelector="R"
          yChannelSelector="G"
          scale="30"
          in="SourceGraphic"
          in2="warp"
        />
      </filter>
    </defs>
  </svg>
</template>
