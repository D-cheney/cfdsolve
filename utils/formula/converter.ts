import katex from 'katex'

export type FormulaFormat = 'auto' | 'latex' | 'mathml' | 'unicodemath' | 'plain'

export interface RepairCandidate {
  label: string
  text: string
  score: number
}

export interface FormulaDiagnostic {
  level: 'info' | 'warning' | 'error'
  code: string
  message: string
}

export interface FormulaConversion {
  original: string
  repaired: string
  detectedFormat: Exclude<FormulaFormat, 'auto'>
  confidence: number
  candidates: RepairCandidate[]
  latex: string
  unicodeMath: string
  mathml: string
  plain: string
  previewHtml: string
  diagnostics: FormulaDiagnostic[]
}

const htmlEntities: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ',
  lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', phi: 'φ', omega: 'ω',
  Delta: 'Δ', Gamma: 'Γ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Omega: 'Ω',
  part: '∂', nabla: '∇', sum: '∑', prod: '∏', int: '∫', infin: '∞',
  times: '×', middot: '·', minus: '−', plusmn: '±', le: '≤', ge: '≥', ne: '≠', asymp: '≈'
}

const cp1252Reverse: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f
}

const greekToLatex: Record<string, string> = {
  α: '\\alpha', β: '\\beta', γ: '\\gamma', δ: '\\delta', ε: '\\epsilon', ϵ: '\\varepsilon',
  ζ: '\\zeta', η: '\\eta', θ: '\\theta', ϑ: '\\vartheta', ι: '\\iota', κ: '\\kappa',
  λ: '\\lambda', μ: '\\mu', ν: '\\nu', ξ: '\\xi', π: '\\pi', ρ: '\\rho',
  σ: '\\sigma', τ: '\\tau', φ: '\\phi', ϕ: '\\varphi', χ: '\\chi', ψ: '\\psi', ω: '\\omega',
  Γ: '\\Gamma', Δ: '\\Delta', Θ: '\\Theta', Λ: '\\Lambda', Ξ: '\\Xi', Π: '\\Pi', Σ: '\\Sigma', Φ: '\\Phi', Ψ: '\\Psi', Ω: '\\Omega'
}

const operatorToLatex: Record<string, string> = {
  '∂': '\\partial ', '∇': '\\nabla ', '∞': '\\infty ', '∑': '\\sum ', '∏': '\\prod ',
  '∫': '\\int ', '∬': '\\iint ', '∭': '\\iiint ', '∮': '\\oint ', '√': '\\sqrt',
  '×': '\\times ', '·': '\\cdot ', '⋅': '\\cdot ', '÷': '\\div ', '±': '\\pm ', '∓': '\\mp ',
  '≤': '\\leq ', '≥': '\\geq ', '≠': '\\neq ', '≈': '\\approx ', '≡': '\\equiv ',
  '→': '\\rightarrow ', '←': '\\leftarrow ', '↔': '\\leftrightarrow ', '∈': '\\in ', '∉': '\\notin ',
  '∝': '\\propto ', '∅': '\\emptyset ', '∧': '\\wedge ', '∨': '\\vee '
}

const latexToUnicode: Record<string, string> = Object.fromEntries([
  ...Object.entries(greekToLatex).map(([symbol, command]) => [command, symbol]),
  ...Object.entries(operatorToLatex).map(([symbol, command]) => [command.trim(), symbol])
].sort((a, b) => b[0].length - a[0].length))

const superToNormal: Record<string, string> = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁻':'-','ⁿ':'n','ⁱ':'i' }
const subToNormal: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','₊':'+','₋':'-','ₐ':'a','ₑ':'e','ₕ':'h','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₘ':'m','ₙ':'n','ₒ':'o','ₚ':'p','ᵣ':'r','ₛ':'s','ₜ':'t','ᵤ':'u','ᵥ':'v','ₓ':'x' }

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-zA-Z]+);/gi, (match, key: string) => {
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16))
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10))
    return htmlEntities[key] ?? match
  })
}

function anomalyScore(text: string) {
  const suspicious = (text.match(/[ÃÂâÏÎÐÑæå¤]|[\u0080-\u009f]|�/g) || []).length
  const controls = (text.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g) || []).length
  const math = (text.match(/[α-ωΑ-Ω∂∇∑∏∫√≤≥≠≈∞×·]/g) || []).length
  return math * 3 - suspicious * 5 - controls * 8
}

function decodeUtf8Mojibake(text: string) {
  const bytes: number[] = []
  for (const char of text) {
    const cp = char.codePointAt(0)!
    if (cp <= 0xff) bytes.push(cp)
    else if (cp1252Reverse[cp] !== undefined) bytes.push(cp1252Reverse[cp])
    else return null
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
  } catch {
    return null
  }
}

function normalizeCharacters(text: string) {
  let normalized = text.normalize('NFC')
    .replace(/[\u200b\u200c\u200d\u2060\ufeff]/g, '')
    .replace(/\u00ad/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  normalized = [...normalized].map(char => {
    const cp = char.codePointAt(0)!
    if (cp === 0x3000) return ' '
    if (cp >= 0xff01 && cp <= 0xff5e) return String.fromCodePoint(cp - 0xfee0)
    return char
  }).join('')
  return normalized
    .replace(/[–—‐‑]/g, '−')
    .replace(/[∙⋅]/g, '·')
    .replace(/\u2215/g, '/')
}

export function buildRepairCandidates(raw: string): RepairCandidate[] {
  const decodedEntities = decodeEntities(raw)
  const base = normalizeCharacters(decodedEntities)
  const candidates: RepairCandidate[] = [{ label: decodedEntities !== raw ? 'HTML 实体与字符清理' : '原始内容清理', text: base, score: anomalyScore(base) }]
  let current = base
  for (let pass = 1; pass <= 2; pass++) {
    const repaired = decodeUtf8Mojibake(current)
    if (!repaired || repaired === current) break
    const normalized = normalizeCharacters(repaired)
    candidates.push({ label: pass === 1 ? 'UTF-8 / Windows 编码修复' : '二次编码修复', text: normalized, score: anomalyScore(normalized) + pass })
    current = normalized
  }
  return [...new Map(candidates.map(item => [item.text, item])).values()].sort((a, b) => b.score - a.score)
}

export function detectFormulaFormat(text: string): Exclude<FormulaFormat, 'auto'> {
  const value = text.trim()
  if (/<(?:math|mrow|mfrac|msqrt|msub|msup|mi|mn|mo)(?:\s|>)/i.test(value)) return 'mathml'
  if (/\\(?:frac|sqrt|partial|nabla|sum|int|begin|mathbf|mathrm|left|right|alpha|rho|mu)\b/.test(value) || /^\$+[^$]+\$+$/.test(value)) return 'latex'
  if (/\\(?:matrix|eqarray|overbar|below)\s*\(/.test(value) || /\^\([^)]*\)|_\([^)]*\)/.test(value)) return 'unicodemath'
  if (/[α-ωΑ-Ω∂∇∑∏∫√≤≥≠≈∞]|[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/.test(value)) return 'unicodemath'
  return 'plain'
}

function stripLatexDelimiters(text: string) {
  return text.trim()
    .replace(/^\$\$([\s\S]*)\$\$$/, '$1')
    .replace(/^\$([\s\S]*)\$$/, '$1')
    .replace(/^\\\[([\s\S]*)\\\]$/, '$1')
    .replace(/^\\\(([\s\S]*)\\\)$/, '$1')
    .trim()
}

function convertScripts(text: string) {
  let output = ''
  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    if (superToNormal[char]) {
      let value = ''
      let cursor = i
      while (cursor < chars.length) {
        if (superToNormal[chars[cursor]]) value += superToNormal[chars[cursor++]]
        else if ((chars[cursor] === '.' || chars[cursor] === '·') && superToNormal[chars[cursor + 1]]) { value += '.'; cursor++ }
        else break
      }
      i = cursor - 1
      output += `^{${value}}`
    } else if (subToNormal[char]) {
      let value = ''
      while (i < chars.length && subToNormal[chars[i]]) value += subToNormal[chars[i++]]
      i--
      output += `_{${value}}`
    } else output += char
  }
  return output
}

function mapUnicodeSymbols(text: string) {
  const chars = [...text]
  return chars.map((char, index) => {
    const greek = greekToLatex[char]
    if (greek) return greek + (/[A-Za-z0-9]/.test(chars[index + 1] || '') ? ' ' : '')
    return operatorToLatex[char] ?? (char === '−' ? '-' : char)
  }).join('')
}

function unicodeToLatex(text: string) {
  let value = convertScripts(text)
  value = value.replace(/∂\s*([A-Za-zΑ-Ωα-ω]+)\s*\/\s*∂\s*([A-Za-zΑ-Ωα-ω]+)/g, (_match, a, b) => `\\frac{\\partial ${mapUnicodeSymbols(a)}}{\\partial ${mapUnicodeSymbols(b)}}`)
  value = value.replace(/√\s*\(([^()]*)\)/g, (_match, inner) => `\\sqrt{${unicodeToLatex(inner)}}`)
  value = value.replace(/√\s*([A-Za-zΑ-Ωα-ω0-9]+)/g, (_match, inner) => `\\sqrt{${unicodeToLatex(inner)}}`)
  value = value.replace(/([A-Za-zΑ-Ωα-ω0-9]+)\s*\/\s*(\([^()]+\)|[A-Za-zΑ-Ωα-ω0-9]+)/g, (_match, numerator, denominator) => {
    const den = denominator.startsWith('(') ? denominator.slice(1, -1) : denominator
    return `\\frac{${mapUnicodeSymbols(numerator)}}{${mapUnicodeSymbols(den)}}`
  })
  return mapUnicodeSymbols(value).replace(/\s+/g, ' ').trim()
}

function findClosingBrace(text: string, start: number) {
  if (text[start] !== '{') return -1
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) return i
  }
  return -1
}

function replaceLatexCommand(text: string, command: string, arity: number, formatter: (args: string[]) => string) {
  let result = text
  let cursor = 0
  while ((cursor = result.indexOf(command, cursor)) >= 0) {
    let pos = cursor + command.length
    while (result[pos] === ' ') pos++
    const args: string[] = []
    let end = pos
    for (let index = 0; index < arity; index++) {
      if (result[end] !== '{') break
      const close = findClosingBrace(result, end)
      if (close < 0) break
      args.push(result.slice(end + 1, close))
      end = close + 1
      while (result[end] === ' ') end++
    }
    if (args.length !== arity) { cursor += command.length; continue }
    result = result.slice(0, cursor) + formatter(args) + result.slice(end)
    cursor += 1
  }
  return result
}

function latexToUnicodeMath(latex: string) {
  let value = stripLatexDelimiters(latex)
  value = replaceLatexCommand(value, '\\frac', 2, ([a, b]) => `(${latexToUnicodeMath(a)})/(${latexToUnicodeMath(b)})`)
  value = replaceLatexCommand(value, '\\sqrt', 1, ([a]) => `√(${latexToUnicodeMath(a)})`)
  for (const command of ['\\mathbf', '\\mathrm', '\\mathit', '\\operatorname', '\\text']) {
    value = replaceLatexCommand(value, command, 1, ([a]) => latexToUnicodeMath(a))
  }
  value = value.replace(/\\left|\\right/g, '')
  for (const [command, symbol] of Object.entries(latexToUnicode)) value = value.split(command).join(symbol)
  value = value.replace(/\\,/g, ' ').replace(/\\;/g, ' ').replace(/\\!/g, '')
  value = value.replace(/\{([^{}]*)\}/g, '($1)')
  return value.replace(/\s+/g, ' ').trim()
}

function escapeLatex(text: string) {
  return text.replace(/([#$%&_{}])/g, '\\$1')
}

function mathmlToLatex(source: string, diagnostics: FormulaDiagnostic[]) {
  if (typeof DOMParser === 'undefined') {
    diagnostics.push({ level: 'error', code: 'MML_ENV', message: '当前环境无法解析 MathML，请在浏览器中重试。' })
    return ''
  }
  const document = new DOMParser().parseFromString(source, 'application/xml')
  if (document.querySelector('parsererror')) {
    diagnostics.push({ level: 'error', code: 'MML_PARSE', message: 'MathML 结构无效，请检查标签是否闭合。' })
    return ''
  }
  const annotation = [...document.querySelectorAll('annotation')].find(node => /tex|latex/i.test(node.getAttribute('encoding') || ''))
  if (annotation?.textContent?.trim()) return stripLatexDelimiters(annotation.textContent)
  const allowed = new Set(['math','semantics','annotation','annotation-xml','mrow','mi','mn','mo','mtext','mfrac','msqrt','mroot','msub','msup','msubsup','munder','mover','munderover','mfenced','mtable','mtr','mtd','mspace'])
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeLatex(node.textContent || '')
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const element = node as Element
    const tag = element.localName.toLowerCase()
    if (!allowed.has(tag)) {
      diagnostics.push({ level: 'warning', code: 'MML_TAG', message: `已忽略不支持的 MathML 标签 <${tag}>。` })
      return ''
    }
    const children = [...element.childNodes].map(walk)
    const child = (index: number) => children[index] || ''
    if (tag === 'semantics') return child(0)
    if (['math','mrow','mi','mn','mtext','mtd'].includes(tag)) return children.join('')
    if (tag === 'mo') return mapUnicodeSymbols(element.textContent || '')
    if (tag === 'mfrac') return `\\frac{${child(0)}}{${child(1)}}`
    if (tag === 'msqrt') return `\\sqrt{${children.join('')}}`
    if (tag === 'mroot') return `\\sqrt[${child(1)}]{${child(0)}}`
    if (tag === 'msub') return `{${child(0)}}_{${child(1)}}`
    if (tag === 'msup') return `{${child(0)}}^{${child(1)}}`
    if (tag === 'msubsup') return `{${child(0)}}_{${child(1)}}^{${child(2)}}`
    if (tag === 'munder') return `{${child(0)}}_{${child(1)}}`
    if (tag === 'mover') return element.textContent?.includes('¯') ? `\\overline{${child(0)}}` : `\\overset{${child(1)}}{${child(0)}}`
    if (tag === 'munderover') return `{${child(0)}}_{${child(1)}}^{${child(2)}}`
    if (tag === 'mfenced') return `\\left(${children.join('')}\\right)`
    if (tag === 'mtr') return children.join(' & ') + ' \\\\'
    if (tag === 'mtable') return `\\begin{matrix}${children.join('')}\\end{matrix}`
    return ''
  }
  return walk(document.documentElement)
}

function balanceDiagnostics(latex: string, diagnostics: FormulaDiagnostic[]) {
  const pairs: Array<[string, string, string]> = [['{','}','花括号'],['(',')','圆括号'],['[',']','方括号']]
  for (const [open, close, name] of pairs) {
    const left = [...latex].filter(char => char === open).length
    const right = [...latex].filter(char => char === close).length
    if (left !== right) diagnostics.push({ level: 'error', code: 'UNBALANCED', message: `${name}不匹配：${left} 个左括号，${right} 个右括号。` })
  }
  if (latex.includes('�')) diagnostics.push({ level: 'error', code: 'DATA_LOST', message: '内容中包含替换字符 �，原始字符已经丢失，需要人工核对。' })
}

function renderLatex(latex: string, diagnostics: FormulaDiagnostic[]) {
  if (!latex) return { html: '', mathml: '' }
  try {
    const html = katex.renderToString(latex, { throwOnError: true, displayMode: true, strict: 'ignore', trust: false, output: 'htmlAndMathml' })
    return { html, mathml: html.match(/<math[\s\S]*?<\/math>/)?.[0] || '' }
  } catch (error) {
    diagnostics.push({ level: 'error', code: 'LATEX_PARSE', message: error instanceof Error ? error.message.replace(/^KaTeX parse error:\s*/, '') : 'LaTeX 解析失败。' })
    return { html: `<span class="formula-preview-error">${latex.replace(/[<>&]/g, char => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[char]!))}</span>`, mathml: '' }
  }
}

export function convertFormula(raw: string, selectedFormat: FormulaFormat = 'auto', preferredText?: string): FormulaConversion {
  const diagnostics: FormulaDiagnostic[] = []
  const candidates = buildRepairCandidates(raw)
  const repaired = preferredText ?? candidates[0]?.text ?? ''
  const detected = selectedFormat === 'auto' ? detectFormulaFormat(repaired) : selectedFormat
  if (!repaired) diagnostics.push({ level: 'info', code: 'EMPTY', message: '请粘贴或输入需要转换的公式。' })
  if (candidates.length > 1 && candidates[0].text !== normalizeCharacters(decodeEntities(raw))) {
    diagnostics.push({ level: 'info', code: 'ENCODING_REPAIRED', message: '检测到可能的编码乱码，已采用评分最高的修复结果。' })
  }
  let latex = ''
  if (detected === 'latex') {
    latex = stripLatexDelimiters(repaired)
      .replace(/(?<!\\)\b(frac|sqrt|partial|nabla|sum|prod|int|iint|iiint|alpha|beta|gamma|rho|mu|nu|omega)(?=\s*\{)/g, '\\$1')
  } else if (detected === 'mathml') latex = mathmlToLatex(repaired, diagnostics)
  else latex = unicodeToLatex(repaired)
  balanceDiagnostics(latex, diagnostics)
  const rendered = latex.includes('�')
    ? { html: '<span class="formula-preview-error">包含无法恢复的字符 �，请根据原文人工补全。</span>', mathml: '' }
    : renderLatex(latex, diagnostics)
  const unicodeMath = latexToUnicodeMath(latex)
  const confidenceBase = detected === 'mathml' || detected === 'latex' ? 96 : detected === 'unicodemath' ? 90 : 78
  const confidence = Math.max(20, Math.min(99, confidenceBase - diagnostics.filter(item => item.level === 'error').length * 25 - (candidates.length > 1 ? 3 : 0)))
  return {
    original: raw,
    repaired,
    detectedFormat: detected,
    confidence,
    candidates,
    latex,
    unicodeMath,
    mathml: rendered.mathml,
    plain: unicodeMath.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim(),
    previewHtml: rendered.html,
    diagnostics
  }
}

export const formulaSamples = [
  { name: 'UTF-8 编码乱码', value: 'Re = ÏUL/Î¼' },
  { name: '偏导数乱码', value: 'âˆ‚u/âˆ‚t + uÂ·âˆ‡u = âˆ’(1/Ï)âˆ‡p + Î½âˆ‡Â²u' },
  { name: 'Unicode 公式', value: 'Nu = hL/k = 0.023Re⁰·⁸Pr⁰·⁴' },
  { name: 'LaTeX 公式', value: '\\frac{d}{dx}(\\rho u \\phi)=\\frac{d}{dx}\\left(\\Gamma\\frac{d\\phi}{dx}\\right)' },
  { name: 'HTML 实体', value: 'Re = &rho;UL/&mu;, &nabla;&middot;u = 0' },
  { name: 'Word 线性公式', value: 'k = 3/2(UI)², ε = C_μ^(3/4) k^(3/2)/l' }
]
