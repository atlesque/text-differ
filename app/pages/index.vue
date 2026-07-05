<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '~~/app/composables/useSyntaxHighlight'

useHead({
  title: 'Text Differ — Compare texts side by side',
})

const leftText = ref('')
const rightText = ref('')
const compareMode = ref<'realtime' | 'manual'>('realtime')
const activeTab = ref('original')
const viewMode = ref<'split' | 'unified'>('split')
const language = ref('text')

const { result, refresh } = useTextDiff(leftText, rightText, language)
const { leftJsonError, rightJsonError, canSort, sortBoth } = useJsonSort(leftText, rightText, language)

const tabs = computed(() => [
  {
    label: 'Original',
    value: 'original',
    icon: 'i-lucide:file-text',
    badge: leftText.value.length ? `${leftText.value.length} chars` : undefined,
  },
  {
    label: 'Modified',
    value: 'modified',
    icon: 'i-lucide:pencil-line',
    badge: rightText.value.length ? `${rightText.value.length} chars` : undefined,
  },
  {
    label: 'Diff',
    value: 'diff',
    icon: 'i-lucide:diff',
    badge: result.value.stats.totalLines
      ? `${result.value.stats.addedLines}+ ${result.value.stats.removedLines}−`
      : undefined,
  },
])

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
        <h1 class="text-xl font-semibold tracking-tight">
          Text Differ
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <ColorModeToggle />
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 py-6 space-y-4">
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

      <!-- Tabs -->
      <UTabs
        v-model="activeTab"
        :items="tabs"
        :content="false"
        class="w-full"
      />

      <!-- Tab content -->
      <div
        v-if="activeTab === 'original'"
        class="pt-2"
      >
        <UTextarea
          v-model="leftText"
          placeholder="Paste your original text here..."
          class="w-full font-mono text-sm"
          :rows="16"
          autoresize
          color="neutral"
        />
      </div>

      <div
        v-else-if="activeTab === 'modified'"
        class="pt-2"
      >
        <UTextarea
          v-model="rightText"
          placeholder="Paste your modified text here..."
          class="w-full font-mono text-sm"
          :rows="16"
          autoresize
          color="neutral"
        />
      </div>

      <div
        v-else-if="activeTab === 'diff'"
        class="space-y-4 pt-2"
      >
        <!-- JSON validation errors -->
        <UAlert
          v-if="leftJsonError || rightJsonError"
          color="error"
          variant="soft"
          icon="i-lucide:triangle-alert"
          :title="[leftJsonError, rightJsonError].filter(Boolean).join(' · ')"
        />

        <DiffStats :result="result" />

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted">Lang:</span>
            <USelect
              v-model="language"
              :items="SUPPORTED_LANGUAGES"
              size="xs"
              class="w-32"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted">View:</span>
            <UButton
              :variant="viewMode === 'split' ? 'solid' : 'outline'"
              size="xs"
              icon="i-lucide:columns-2"
              @click="viewMode = 'split'"
            >
              Split
            </UButton>
            <UButton
              :variant="viewMode === 'unified' ? 'solid' : 'outline'"
              size="xs"
              icon="i-lucide:align-justify"
              @click="viewMode = 'unified'"
            >
              Unified
            </UButton>
          </div>
          <!-- JSON sort button -->
          <UButton
            v-if="canSort"
            variant="soft"
            size="xs"
            icon="i-lucide:arrow-up-down"
            @click="sortBoth"
          >
            Sort JSON keys
          </UButton>
        </div>

        <DiffViewer :lines="result.lines" :view-mode="viewMode" />
      </div>
    </main>
  </UContainer>
</template>
