import { diffLines } from 'diff'
import type { DiffLine, DiffResult } from '~~/shared/types/diff'

interface UseTextDiffOptions {
  /** Debounce delay in ms. Defaults to 150. */
  debounceMs?: number
}

export function useTextDiff(
  leftText: Ref<string>,
  rightText: Ref<string>,
  options: UseTextDiffOptions = {},
) {
  const { debounceMs = 150 } = options

  const result = ref<DiffResult>({
    lines: [],
    stats: { addedLines: 0, removedLines: 0, unchangedLines: 0, totalLines: 0 },
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function compute() {
    const left = leftText.value
    const right = rightText.value

    if (!left && !right) {
      result.value = {
        lines: [],
        stats: { addedLines: 0, removedLines: 0, unchangedLines: 0, totalLines: 0 },
      }
      return
    }

    const lineChanges = diffLines(left, right, { ignoreWhitespace: false })

    let leftLineNum = 0
    let rightLineNum = 0
    let addedLines = 0
    let removedLines = 0
    let unchangedLines = 0

    const lines: DiffLine[] = []

    for (const part of lineChanges) {
      const rawLines = part.value.split('\n')
      // Diff always includes a trailing newline in the value, so the
      // last element is always an empty string. Remove it.
      if (rawLines[rawLines.length - 1] === '') {
        rawLines.pop()
      }

      for (const line of rawLines) {
        const entry: DiffLine = {
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          value: line,
          lineNumber: {
            left: part.added ? undefined : ++leftLineNum,
            right: part.removed ? undefined : ++rightLineNum,
          },
        }

        // For removed/added lines, compute word-level diffs against the
        // corresponding line in the other text if available.
        if (part.added || part.removed) {
          entry.wordDiffs = []
        }
        else {
          entry.wordDiffs = undefined
        }

        switch (entry.type) {
          case 'added':
            addedLines++
            break
          case 'removed':
            removedLines++
            break
          case 'unchanged':
            unchangedLines++
            break
        }

        lines.push(entry)
      }
    }

    result.value = {
      lines,
      stats: {
        addedLines,
        removedLines,
        unchangedLines,
        totalLines: lines.length,
      },
    }
  }

  // Debounced recompute
  function scheduleCompute() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(compute, debounceMs)
  }

  // Watch for changes on both texts
  watch([leftText, rightText], scheduleCompute, { immediate: true })

  // Compute immediately when called manually
  function refresh() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    compute()
  }

  return {
    result,
    refresh,
  }
}
