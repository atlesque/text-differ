import type { Highlighter } from 'shiki'
import { createHighlighter } from 'shiki'
import type { HighlightToken } from '~~/shared/types/diff'

export const SUPPORTED_LANGUAGES = [
  { label: 'None', value: 'text' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TSX', value: 'tsx' },
  { label: 'JSX', value: 'jsx' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'SQL', value: 'sql' },
  { label: 'Bash', value: 'bash' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'PHP', value: 'php' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Vue', value: 'vue' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'TOML', value: 'toml' },
  { label: 'XML', value: 'xml' },
  { label: 'Diff', value: 'diff' },
  { label: 'Dockerfile', value: 'dockerfile' },
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
