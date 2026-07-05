import { diffLines } from 'diff'
import type { DiffLine, DiffResult } from '~~/shared/types/diff'
import { tokenizeCode } from './useSyntaxHighlight'

interface UseTextDiffOptions {
  /** Debounce delay in ms. Defaults to 150. */
  debounceMs?: number
}

export function useTextDiff(
  leftText: Ref<string>,
  rightText: Ref<string>,
  language: Ref<string>,
  options: UseTextDiffOptions = {},
) {
  const { debounceMs = 150 } = options

  const result = ref<DiffResult>({
    lines: [],
    stats: { addedLines: 0, removedLines: 0, unchangedLines: 0, totalLines: 0 },
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let computeId = 0

  async function compute() {
    const currentId = ++computeId
    const left = leftText.value
    const right = rightText.value
    const lang = language.value

    if (!left && !right) {
      result.value = {
        lines: [],
        stats: { addedLines: 0, removedLines: 0, unchangedLines: 0, totalLines: 0 },
      }
      return
    }

    // Tokenize both texts in parallel
    const [leftTokens, rightTokens] = await Promise.all([
      tokenizeCode(left, lang),
      tokenizeCode(right, lang),
    ])

    // Bail if a newer compute was scheduled
    if (currentId !== computeId) return

    const lineChanges = diffLines(left, right, { ignoreWhitespace: false })

    let leftLineNum = 0
    let rightLineNum = 0
    let addedLines = 0
    let removedLines = 0
    let unchangedLines = 0

    const lines: DiffLine[] = []

    for (const part of lineChanges) {
      const rawLines = part.value.split('\n')
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

        // Attach syntax tokens from pre-computed arrays
        if (leftTokens.length > 0 || rightTokens.length > 0) {
          if (part.removed && entry.lineNumber.left) {
            entry.tokens = leftTokens[entry.lineNumber.left - 1] ?? undefined
          }
          else if (part.added && entry.lineNumber.right) {
            entry.tokens = rightTokens[entry.lineNumber.right - 1] ?? undefined
          }
          else if (entry.lineNumber.left) {
            entry.tokens = leftTokens[entry.lineNumber.left - 1] ?? undefined
          }
        }

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

  function scheduleCompute() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(compute, debounceMs)
  }

  watch([leftText, rightText, language], scheduleCompute, { immediate: true })

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
