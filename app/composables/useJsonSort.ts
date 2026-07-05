/**
 * Composable for JSON validation and deep key sorting.
 * Shows validation errors when language is 'json' and the input is invalid,
 * and provides a sort action that recursively sorts object keys.
 */

function isValidJson(text: string): boolean {
  if (!text.trim()) return true
  try {
    JSON.parse(text)
    return true
  }
  catch {
    return false
  }
}

function sortJsonKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    Object.keys(record)
      .sort()
      .forEach((key) => {
        sorted[key] = sortJsonKeys(record[key])
      })
    return sorted
  }
  return obj
}

export function useJsonSort(
  leftText: Ref<string>,
  rightText: Ref<string>,
  language: Ref<string>,
) {
  const leftJsonError = computed(() => {
    if (language.value !== 'json') return ''
    if (!leftText.value.trim()) return ''
    return isValidJson(leftText.value) ? '' : 'Invalid JSON in the Original panel'
  })

  const rightJsonError = computed(() => {
    if (language.value !== 'json') return ''
    if (!rightText.value.trim()) return ''
    return isValidJson(rightText.value) ? '' : 'Invalid JSON in the Modified panel'
  })

  const canSort = computed(() => {
    return (
      language.value === 'json'
      && leftText.value.trim()
      && rightText.value.trim()
      && !leftJsonError.value
      && !rightJsonError.value
    )
  })

  function sortBoth() {
    try {
      const parsedLeft = JSON.parse(leftText.value)
      leftText.value = JSON.stringify(sortJsonKeys(parsedLeft), null, 2)

      const parsedRight = JSON.parse(rightText.value)
      rightText.value = JSON.stringify(sortJsonKeys(parsedRight), null, 2)
    }
    catch {
      // Safety net — should not happen because canSort guards against invalid JSON
    }
  }

  return {
    leftJsonError,
    rightJsonError,
    canSort,
    sortBoth,
  }
}
