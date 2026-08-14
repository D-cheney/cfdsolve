import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import katex from 'katex'

/**
 * markdown-it 数学公式插件（基于 KaTeX）
 *
 * 支持的语法：
 *   - 行内公式：$...$，例如 $Re = \\frac{\\rho U L}{\\mu}$
 *   - 块级公式：独立成段的 $$...$$，例如
 *       $$
 *       \\frac{\\partial \\rho}{\\partial t} + \\nabla \\cdot (\\rho \\mathbf{u}) = 0
 *       $$
 *   - 转义：\\$ 表示普通美元符号（不会触发公式解析）
 *
 * 渲染：服务端导入时直接渲染为 KaTeX HTML 并存入 body_html，
 * 客户端无需额外处理；LaTeX 源码保留在 body_json.markdown 中。
 */

/** 判断当前位置的 $ 是否可以作为公式定界符（前后不能紧挨另一个 $） */
function isValidDelim(state: any, pos: number) {
  const max = state.posMax
  const prev = pos > 0 ? state.src.charCodeAt(pos - 1) : -1
  const next = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1
  return prev !== 0x24 && next !== 0x24 && prev !== 0x5c // 不是 $$ 也不是 \$ 的 $
}

function renderMath(source: string, displayMode: boolean) {
  try {
    const html = katex.renderToString(source, {
      throwOnError: false,
      displayMode,
      strict: false,
      output: 'htmlAndMathml'
    })
    return displayMode
      ? `<div class="math-block">${html}</div>`
      : `<span class="math-inline">${html}</span>`
  } catch {
    const escaped = source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return displayMode
      ? `<pre class="math-error">${escaped}</pre>`
      : `<code class="math-error">${escaped}</code>`
  }
}

export default function mathPlugin(md: MarkdownIt) {
  // ---------------------------------------------------------------
  // 行内公式：$...$
  // ---------------------------------------------------------------
  function inlineMath(state: any, silent: boolean) {
    if (state.src[state.pos] !== '$') return false
    if (!isValidDelim(state, state.pos)) return false

    const start = state.pos + 1
    let match = start
    while ((match = state.src.indexOf('$', match)) !== -1) {
      if (state.src[match - 1] === '\\') { match += 1; continue }
      if (!isValidDelim(state, match)) { match += 1; continue }
      const content = state.src.slice(start, match)
      if (content.length) break
      match += 1
    }
    if (match === -1 || match === start) return false

    if (!silent) {
      const token = state.push('math_inline', 'math', 0)
      token.markup = '$'
      token.content = state.src.slice(start, match)
    }
    state.pos = match + 1
    return true
  }

  md.inline.ruler.before('escape', 'math_inline', inlineMath)

  // ---------------------------------------------------------------
  // 块级公式：$$ ... $$（起始行以 $$ 开头，结束行为独立的 $$）
  // ---------------------------------------------------------------
  function blockMath(state: any, startLine: number, endLine: number, silent: boolean) {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (state.src.slice(pos, pos + 2) !== '$$') return false
    // 缩进超过 4 空格视为代码块
    if (state.sCount[startLine] - state.blkIndent >= 4) return false

    let nextLine = startLine + 1
    let content = ''
    let found = false
    for (; nextLine < endLine; nextLine++) {
      const bpos = state.bMarks[nextLine] + state.tShift[nextLine]
      const emax = state.eMarks[nextLine]
      const lineText = state.src.slice(bpos, emax).trim()
      if (lineText === '$$') {
        found = true
        break
      }
      content += (content ? '\n' : '') + lineText
    }
    if (!found) return false
    if (!content.trim()) return false

    if (!silent) {
      const token = state.push('math_block', 'math', 0)
      token.block = true
      token.markup = '$$'
      token.content = content
      token.map = [startLine, nextLine + 1]
    }
    state.line = nextLine + 1
    return true
  }

  md.block.ruler.before('fence', 'math_block', blockMath, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })

  // ---------------------------------------------------------------
  // 渲染规则
  // ---------------------------------------------------------------
  md.renderer.rules.math_inline = (tokens: Token[], idx: number) =>
    renderMath(tokens[idx].content, false)

  md.renderer.rules.math_block = (tokens: Token[], idx: number) =>
    renderMath(tokens[idx].content, true)
}
