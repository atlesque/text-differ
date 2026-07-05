<script setup lang="ts">
import type { DiffLine, DiffViewMode } from '~~/shared/types/diff'

const props = defineProps<{
  lines: DiffLine[]
  viewMode: DiffViewMode
}>()

// ---------------------------------------------------------------------------
// Split-view helpers — pair lines so both sides have the same row count
// ---------------------------------------------------------------------------

interface SplitRow {
  left: DiffLine | null
  right: DiffLine | null
}

const splitRows = computed<SplitRow[]>(() => {
  const rows: SplitRow[] = []

  for (const line of props.lines) {
    if (line.type === 'unchanged') {
      rows.push({ left: line, right: line })
    }
    else if (line.type === 'removed') {
      rows.push({ left: line, right: null })
    }
    else {
      rows.push({ left: null, right: line })
    }
  }

  return rows
})

// ---------------------------------------------------------------------------
// Unified-view helpers — every line rendered in a single column
// ---------------------------------------------------------------------------

const unifiedLines = computed(() => props.lines)

// ---------------------------------------------------------------------------
// Sync-scroll for split view
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lineTypeClass(type: DiffLine['type']): string {
  return {
    added: 'diff-line-add',
    removed: 'diff-line-remove',
    unchanged: 'diff-line-context',
  }[type]
}

function linePrefix(type: DiffLine['type']): string {
  return {
    added: '+',
    removed: '−',
    unchanged: '',
  }[type]
}
</script>

<template>
  <div
    v-if="lines.length > 0"
    class="diff-viewer rounded-lg overflow-hidden border border-muted"
  >
    <!-- ================================================================= -->
    <!-- SPLIT VIEW                                                         -->
    <!-- ================================================================= -->
    <div
      v-if="viewMode === 'split'"
      class="grid grid-cols-1 md:grid-cols-2"
    >
      <!-- Left (original) panel ----------------------------------------- -->
      <div
        ref="leftPanel"
        class="diff-panel overflow-auto max-h-150"
        @scroll="onLeftScroll"
      >
        <div
          v-for="(row, idx) in splitRows"
          :key="`split-l-${idx}`"
          class="diff-row flex font-mono text-xs leading-5 min-h-5"
          :class="row.left ? lineTypeClass(row.left.type) : 'diff-line-context'"
        >
          <!-- gutter -->
          <span class="diff-gutter w-13 shrink-0 text-right pr-2 select-none border-r border-muted/50 opacity-60">
            {{ row.left?.lineNumber.left ?? '' }}
          </span>
          <!-- sign column -->
          <span class="w-4 shrink-0 text-center select-none opacity-60">
            {{ row.left ? linePrefix(row.left.type) : '' }}
          </span>
          <!-- content -->
          <span class="diff-content pl-0.5 whitespace-pre-wrap break-all flex-1">
            <template v-if="row.left">
              <template v-if="row.left.tokens && row.left.tokens.length > 0">
                <span
                  v-for="(t, ti) in row.left.tokens"
                  :key="ti"
                  :style="t.htmlStyle"
                >{{ t.content }}</span>
              </template>
              <template v-else-if="row.left.wordDiffs && row.left.wordDiffs.length > 0">
                <span
                  v-for="(wd, wi) in row.left.wordDiffs"
                  :key="wi"
                  :class="{
                    'diff-word-add': wd.type === 'added',
                    'diff-word-remove': wd.type === 'removed',
                  }"
                >{{ wd.value }}</span>
              </template>
              <template v-else>{{ row.left.value }}</template>
            </template>
          </span>
        </div>
      </div>

      <!-- Right (modified) panel ---------------------------------------- -->
      <div
        ref="rightPanel"
        class="diff-panel overflow-auto max-h-150 border-l border-muted"
        @scroll="onRightScroll"
      >
        <div
          v-for="(row, idx) in splitRows"
          :key="`split-r-${idx}`"
          class="diff-row flex font-mono text-xs leading-5 min-h-5"
          :class="row.right ? lineTypeClass(row.right.type) : 'diff-line-context'"
        >
          <!-- gutter -->
          <span class="diff-gutter w-13 shrink-0 text-right pr-2 select-none border-r border-muted/50 opacity-60">
            {{ row.right?.lineNumber.right ?? '' }}
          </span>
          <!-- sign column -->
          <span class="w-4 shrink-0 text-center select-none opacity-60">
            {{ row.right ? linePrefix(row.right.type) : '' }}
          </span>
          <!-- content -->
          <span class="diff-content pl-0.5 whitespace-pre-wrap break-all flex-1">
            <template v-if="row.right">
              <template v-if="row.right.tokens && row.right.tokens.length > 0">
                <span
                  v-for="(t, ti) in row.right.tokens"
                  :key="ti"
                  :style="t.htmlStyle"
                >{{ t.content }}</span>
              </template>
              <template v-else-if="row.right.wordDiffs && row.right.wordDiffs.length > 0">
                <span
                  v-for="(wd, wi) in row.right.wordDiffs"
                  :key="wi"
                  :class="{
                    'diff-word-add': wd.type === 'added',
                    'diff-word-remove': wd.type === 'removed',
                  }"
                >{{ wd.value }}</span>
              </template>
              <template v-else>{{ row.right.value }}</template>
            </template>
          </span>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- UNIFIED VIEW                                                       -->
    <!-- ================================================================= -->
    <div
      v-else
      class="diff-panel overflow-auto max-h-150"
    >
      <div
        v-for="(line, idx) in unifiedLines"
        :key="`uni-${idx}`"
        class="diff-row flex font-mono text-xs leading-5 min-h-5"
        :class="lineTypeClass(line.type)"
      >
        <!-- gutter: old number | new number -->
        <span class="diff-gutter w-18 shrink-0 text-right pr-2 select-none border-r border-muted/50 opacity-60">
          <template v-if="line.type === 'added'">
            &nbsp;{{ line.lineNumber.right }}
          </template>
          <template v-else-if="line.type === 'removed'">
            {{ line.lineNumber.left }}&nbsp;
          </template>
          <template v-else>
            {{ line.lineNumber.left }} {{ line.lineNumber.right }}
          </template>
        </span>
        <!-- sign column -->
        <span class="w-4 shrink-0 text-center select-none opacity-60">
          {{ linePrefix(line.type) }}
        </span>
        <!-- content -->
        <span class="diff-content pl-0.5 whitespace-pre-wrap break-all flex-1">
          <template v-if="line.tokens && line.tokens.length > 0">
            <span
              v-for="(t, ti) in line.tokens"
              :key="ti"
              :style="t.htmlStyle"
            >{{ t.content }}</span>
          </template>
          <template v-else-if="line.wordDiffs && line.wordDiffs.length > 0">
            <span
              v-for="(wd, wi) in line.wordDiffs"
              :key="wi"
              :class="{
                'diff-word-add': wd.type === 'added',
                'diff-word-remove': wd.type === 'removed',
              }"
            >{{ wd.value }}</span>
          </template>
          <template v-else>{{ line.value }}</template>
        </span>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="flex items-center justify-center py-12 text-muted text-sm border border-dashed border-muted rounded-lg"
  >
    Enter text in both panels to see differences
  </div>
</template>

<style scoped>
/* ---- Row backgrounds (GitHub-style) ---- */
.diff-line-add {
  background-color: #dafbe1;
}
.diff-line-remove {
  background-color: #ffebe9;
}
.diff-line-context {
  background-color: transparent;
}

/* ---- Dark mode row backgrounds ---- */
:global(.dark) .diff-line-add {
  background-color: rgba(63, 185, 80, 0.15);
}
:global(.dark) .diff-line-remove {
  background-color: rgba(248, 81, 73, 0.15);
}
@media (prefers-color-scheme: dark) {
  .diff-line-add {
    background-color: rgba(63, 185, 80, 0.15);
  }
  .diff-line-remove {
    background-color: rgba(248, 81, 73, 0.15);
  }
}

/* ---- Word-level diff highlighting ---- */
.diff-word-add {
  background-color: #acf2bd;
  border-radius: 2px;
}
.diff-word-remove {
  background-color: #fdb8c0;
  border-radius: 2px;
}

/* ---- Dark mode word-level ---- */
:global(.dark) .diff-word-add {
  background-color: rgba(63, 185, 80, 0.35);
}
:global(.dark) .diff-word-remove {
  background-color: rgba(248, 81, 73, 0.35);
}
@media (prefers-color-scheme: dark) {
  .diff-word-add {
    background-color: rgba(63, 185, 80, 0.35);
  }
  .diff-word-remove {
    background-color: rgba(248, 81, 73, 0.35);
  }
}

/* ---- Hover ---- */
.diff-row:hover {
  filter: brightness(0.97);
}
:global(.dark) .diff-row:hover {
  filter: brightness(1.08);
}
@media (prefers-color-scheme: dark) {
  .diff-row:hover {
    filter: brightness(1.08);
  }
}
</style>
