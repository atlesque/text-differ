export type DiffViewMode = 'split' | 'unified'

export interface HighlightToken {
  content: string
  htmlStyle: string
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  lineNumber: {
    left?: number
    right?: number
  }
  wordDiffs?: WordDiff[]
  tokens?: HighlightToken[]
}

export interface WordDiff {
  type: 'added' | 'removed' | 'unchanged'
  value: string
}

export interface DiffStats {
  addedLines: number
  removedLines: number
  unchangedLines: number
  totalLines: number
}

export interface DiffResult {
  lines: DiffLine[]
  stats: DiffStats
}
