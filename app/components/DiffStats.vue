<script setup lang="ts">
import type { DiffResult } from '~~/shared/types/diff'

const props = defineProps<{
  result: DiffResult
}>()

const addedCount = computed(() => props.result.stats.addedLines)
const removedCount = computed(() => props.result.stats.removedLines)
const unchangedCount = computed(() => props.result.stats.unchangedLines)
</script>

<template>
  <div
    v-if="result.stats.totalLines > 0"
    class="flex flex-wrap items-center gap-3 py-3"
  >
    <div class="flex items-center gap-1.5 text-sm">
      <span class="inline-block size-2.5 rounded-full bg-success-500" />
      <span class="text-muted">+{{ addedCount }} added</span>
    </div>
    <div class="flex items-center gap-1.5 text-sm">
      <span class="inline-block size-2.5 rounded-full bg-error-500" />
      <span class="text-muted">&minus;{{ removedCount }} removed</span>
    </div>
    <div class="flex items-center gap-1.5 text-sm">
      <span class="inline-block size-2.5 rounded-full bg-muted" />
      <span class="text-muted">{{ unchangedCount }} unchanged</span>
    </div>
  </div>
</template>
