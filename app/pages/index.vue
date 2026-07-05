<script setup lang="ts">
useHead({
  title: 'Text Differ — Compare texts side by side',
})

const leftText = ref('')
const rightText = ref('')
const compareMode = ref<'realtime' | 'manual'>('realtime')

const { result, refresh } = useTextDiff(leftText, rightText)

function handleSwap() {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
}

function handleClear() {
  leftText.value = ''
  rightText.value = ''
}

function handleCompare() {
  refresh()
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between py-4 border-b border-muted">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide:diff"
          class="size-6 text-primary"
        />
        <h1
          class="text-xl font-semibold tracking-tight"
        >
          Text Differ
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <ColorModeToggle />
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 py-6 space-y-6">
      <!-- Input panels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Original Text</label>
            <span class="text-xs text-muted">{{ leftText.length }} chars</span>
          </div>
          <UTextarea
            v-model="leftText"
            placeholder="Paste your original text here..."
            class="w-full font-mono text-sm"
            :rows="10"
            autoresize
            color="neutral"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Modified Text</label>
            <span class="text-xs text-muted">{{ rightText.length }} chars</span>
          </div>
          <UTextarea
            v-model="rightText"
            placeholder="Paste your modified text here..."
            class="w-full font-mono text-sm"
            :rows="10"
            autoresize
            color="neutral"
          />
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <UButton
            variant="soft"
            icon="i-lucide:arrow-left-right"
            size="sm"
            @click="handleSwap"
          >
            Swap
          </UButton>
          <UButton
            variant="soft"
            icon="i-lucide:trash-2"
            size="sm"
            color="neutral"
            @click="handleClear"
          >
            Clear
          </UButton>
        </div>
        <div class="flex items-center gap-2">
          <URadioGroup
            v-model="compareMode"
            :items="[
              { value: 'realtime', label: 'Real-time' },
              { value: 'manual', label: 'Manual' },
            ]"
            size="sm"
          />
          <UButton
            v-if="compareMode === 'manual'"
            variant="solid"
            icon="i-lucide:play"
            size="sm"
            @click="handleCompare"
          >
            Compare
          </UButton>
        </div>
      </div>

      <!-- Stats -->
      <DiffStats :result="result" />

      <!-- Diff output -->
      <DiffViewer :lines="result.lines" />
    </main>
  </UContainer>
</template>
