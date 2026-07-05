<script setup lang="ts">
import type { DiffLine } from '~~/shared/types/diff'

defineProps<{
  lines: DiffLine[]
}>()

const leftPanel = ref<HTMLElement | null>(null)
const rightPanel = ref<HTMLElement | null>(null)
let syncingLeft = false
let syncingRight = false

function onLeftScroll() {
  if (syncingRight) return
  syncingLeft = true
  if (rightPanel.value) {
    rightPanel.value.scrollTop = leftPanel.value!.scrollTop
    rightPanel.value.scrollLeft = leftPanel.value!.scrollLeft
  }
  requestAnimationFrame(() => {
    syncingLeft = false
  })
}

function onRightScroll() {
  if (syncingLeft) return
  syncingRight = true
  if (leftPanel.value) {
    leftPanel.value.scrollTop = rightPanel.value!.scrollTop
    leftPanel.value.scrollLeft = rightPanel.value!.scrollLeft
  }
  requestAnimationFrame(() => {
    syncingRight = false
  })
}

function lineClass(type: DiffLine['type']) {
  return {
    'diff-line-added': type === 'added',
    'diff-line-removed': type === 'removed',
    'diff-line-unchanged': type === 'unchanged',
  }
}
</script>

<template>
  <div
    v-if="lines.length > 0"
    class="diff-viewer grid grid-cols-1 md:grid-cols-2 border border-muted rounded-lg overflow-hidden"
  >
    <!-- Left panel -->
    <div
      ref="leftPanel"
      class="diff-panel-left overflow-auto max-h-[600px] border-r border-muted"
      @scroll="onLeftScroll"
    >
      <div
        v-for="(line, index) in lines.filter(l => l.type !== 'added')"
        :key="`left-${index}`"
        class="diff-row flex font-mono text-xs leading-5"
        :class="lineClass(line.type)"
      >
        <span class="diff-gutter w-12 shrink-0 text-right pr-2 select-none text-muted/50 border-r border-muted">
          {{ line.lineNumber.left ?? '' }}
        </span>
        <span class="diff-content pl-2 whitespace-pre-wrap break-all">{{ line.value }}</span>
      </div>
    </div>

    <!-- Right panel -->
    <div
      ref="rightPanel"
      class="diff-panel-right overflow-auto max-h-[600px]"
      @scroll="onRightScroll"
    >
      <div
        v-for="(line, index) in lines.filter(l => l.type !== 'removed')"
        :key="`right-${index}`"
        class="diff-row flex font-mono text-xs leading-5"
        :class="lineClass(line.type)"
      >
        <span class="diff-gutter w-12 shrink-0 text-right pr-2 select-none text-muted/50 border-r border-muted">
          {{ line.lineNumber.right ?? '' }}
        </span>
        <span class="diff-content pl-2 whitespace-pre-wrap break-all">{{ line.value }}</span>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex items-center justify-center py-12 text-muted text-sm border border-dashed border-muted rounded-lg"
  >
    Enter text in both panels to see differences
  </div>
</template>

<style scoped>
.diff-row {
  min-height: 1.25rem;
}

.diff-line-added {
  background-color: var(--ui-bg-success);
}

.diff-line-removed {
  background-color: var(--ui-bg-error);
}

.diff-line-unchanged {
  background-color: transparent;
}
</style>
