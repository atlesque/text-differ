import type { Highlighter } from 'shiki'
import { createHighlighter } from 'shiki'
import type { HighlightToken } from '~~/shared/types/diff'

export const SUPPORTED_LANGUAGES = [
  { label: 'None', value: 'text' },
  { label: 'Bash', value: 'bash' },
  { label: 'C', value: 'c' },
  { label: 'C#', value: 'csharp' },
  { label: 'C++', value: 'cpp' },
  { label: 'CSS', value: 'css' },
  { label: 'Diff', value: 'diff' },
  { label: 'Dockerfile', value: 'dockerfile' },
  { label: 'Go', value: 'go' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'HTML', value: 'html' },
  { label: 'JSON', value: 'json' },
  { label: 'JSX', value: 'jsx' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'PHP', value: 'php' },
  { label: 'Python', value: 'python' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TOML', value: 'toml' },
  { label: 'TSX', value: 'tsx' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Vue', value: 'vue' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
]

const LANGS = SUPPORTED_LANGUAGES.map(l => l.value)

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: LANGS,
      themes: ['github-dark-default'],
    })
  }
  return highlighterPromise
}

export async function tokenizeCode(
  code: string,
  lang: string,
): Promise<HighlightToken[][]> {
  if (!code || lang === 'text') return []

  try {
    const highlighter = await getHighlighter()
    const loadedLangs = highlighter.getLoadedLanguages()
    const useLang = loadedLangs.includes(lang as (typeof loadedLangs)[number]) ? lang : 'text'

    if (useLang === 'text') return []

    const { tokens } = highlighter.codeToTokens(code, {
      lang: useLang,
      theme: 'github-dark-default',
    })

    return tokens.map(line =>
      line.map(token => {
        const styles: string[] = []
        if (token.color) styles.push(`color:${token.color}`)
        if (token.fontStyle) {
          if (token.fontStyle & 1) styles.push('font-style:italic')
          if (token.fontStyle & 2) styles.push('font-weight:bold')
          if (token.fontStyle & 4) styles.push('text-decoration:underline')
        }
        return {
          content: token.content,
          htmlStyle: styles.join(';'),
        }
      }),
    )
  }
  catch {
    return []
  }
}
