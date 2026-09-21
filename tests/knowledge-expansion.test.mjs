import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import matter from 'gray-matter'
import { parseKnowledgeTemplate } from '../server/services/knowledge-importer.ts'
import { knowledgeCollectionFor } from '../server/utils/knowledge-collections.ts'

const root = resolve(process.cwd(), 'templates/knowledge')
const contentRoots = ['assets', 'examples', 'library', 'meshfree', 'modelica', 'openfoam', 'openfoam-source-v14', 'expanded']

function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? collect(path) : [path]
  })
}

const files = contentRoots.flatMap(directory => collect(resolve(root, directory))).filter(path =>
  extname(path).toLowerCase() === '.md' &&
  !['README.md', 'FORMAT.md'].includes(basename(path)) &&
  !basename(path).endsWith('.template.md') &&
  readFileSync(path, 'utf8').includes('flowlab-knowledge/1.0')
)

const articles = files.map(path => ({ path, article: parseKnowledgeTemplate(readFileSync(path, 'utf8'), path) }))
assert.equal(articles.length, 340, `同主题合并后，深度知识文章应精确为 340 篇，实际 ${articles.length}`)
assert.equal(new Set(articles.map(item => item.article.slug)).size, articles.length, '文章 slug 必须全局唯一')
assert.equal(new Set(articles.map(item => item.article.title)).size, articles.length, '文章标题必须全局唯一')

const collectionCounts = { cfd: 0, openfoam: 0, modelica: 0, cae: 0, meshfree: 0 }
for (const { article } of articles) collectionCounts[knowledgeCollectionFor(article.category.slug)] += 1
assert.deepEqual(collectionCounts, { cfd: 99, openfoam: 82, modelica: 60, cae: 64, meshfree: 35 })

const expanded = articles.filter(item => item.path.includes(`${resolve(root, 'expanded')}`))
assert.equal(expanded.length, 222, `同主题合并后，扩展文章应为 222 篇，实际 ${expanded.length}`)
assert.equal(new Set(expanded.map(item => item.article.summary)).size, expanded.length, '扩展文章摘要不得重复')
assert.equal(new Set(expanded.map(item => item.article.markdown)).size, expanded.length, '扩展文章正文不得重复')

const topicKeys = expanded.map(item => {
  const topic = item.article.title.split('：')[0].trim()
  return `${item.article.category.slug}\u0000${topic}`
})
assert.equal(new Set(topicKeys).size, topicKeys.length, '同一分类中的相同主题前缀必须合并为单篇文章')

// 套话黑名单：这些句子是脚本套模板生成的产物，出现即说明内容仍是空壳。
const boilerplate = [
  '只改变这一类因素',
  '记录设置依据和预期影响',
  '另一位使用者应能在不询问原作者的情况下重建基线',
  '先写出目标量、允许误差、截止时间和资源上限',
  '这些资料用于追溯',
  '不能只以残差下降作为收敛依据',
  '目标量变化低于容差、守恒或平衡误差没有恶化、计算成本仍与决策价值相称',
  '自动失效，需要重新执行敏感性与基准对比',
  '建立清晰的问题边界，并用守恒、尺度和误差证据闭合结论',
  '对象、尺度与适用域',
  '先锁定不应同时变化的量',
  '用两个关系式约束判断',
  '从变化趋势确定可信区间',
  '一次只改变一类因素'
]

// 通用小标题：同一套标题被套用到所有主题，说明文章没有主题专属结构。
const genericHeadings = [
  '核心机理与可证伪命题',
  '哪些现象应由模型解释',
  '输入台账与基线工况',
  '把参数变成可审计输入',
  '先记录症状，不急着调参',
  '异常现象的第一轮分流',
  '容易误判的情形',
  '高频错误及其反证',
  '交付前逐项核对',
  '什么证据足以支持结论',
  '继续阅读与采用边界'
]

const unitNumber = /\d+\.\d+/g
const latexUnit = /\d+\s*(?:\\,\s*)?\\mathrm\{/g
const plainUnit = /\d+(?:\.\d+)?\s*(?:%|mm|cm|km|Pa|kPa|MPa|GPa|K\b|Hz|kHz|ms|s\b|N\b|m\b|W\b|J\b|V\b|A\b|rad|deg|°)/g
const tableSeparator = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/mu

const headingSignatures = new Set()
const longParagraphCounts = new Map()
const longSentenceCounts = new Map()
const formulaBlockCounts = new Map()

let codeBlockArticles = 0
let numericArticles = 0
let referenceArticles = 0

for (const { path, article } of expanded) {
  const source = readFileSync(path, 'utf8')
  const body = matter(source).content.trim()

  // —— 体量 ——
  assert.ok(body.length >= 2400, `${article.slug} 正文不足 2400 字符：${body.length}`)
  assert.ok(article.headings.length >= 5, `${article.slug} 缺少分层结构（二级标题 ${article.headings.length} 个）`)

  // —— 主题专属公式：至少两个独立公式块 ——
  const formulas = body.match(/\$\$[\s\S]*?\$\$/g) || []
  assert.ok(formulas.length >= 2, `${article.slug} 至少需要两个独立公式，实际 ${formulas.length}`)
  for (const block of formulas) {
    formulaBlockCounts.set(block.replace(/\s+/gu, ''), (formulaBlockCounts.get(block.replace(/\s+/gu, '')) || 0) + 1)
  }

  // —— 真实数值证据：带单位的数值与可核对的小数，证明文章做过计算 ——
  const numbers = (body.match(unitNumber) || []).length + (body.match(latexUnit) || []).length + (body.match(plainUnit) || []).length
  assert.ok(numbers >= 6, `${article.slug} 至少需要 6 处真实数值证据，实际 ${numbers}`)
  if (numbers >= 6) numericArticles += 1

  // —— 可执行的代码/配置/命令块 ——
  const fences = (body.match(/```/g) || []).length
  assert.ok(fences >= 2, `${article.slug} 缺少代码、配置或命令块`)
  if (fences >= 2) codeBlockArticles += 1

  // —— 失败模式表与数据表 ——
  assert.ok(tableSeparator.test(body), `${article.slug} 缺少 Markdown 表格`)
  assert.match(body, /\|[^|\n]*现象[^|\n]*\|[^|\n]*根因[^|\n]*\|/u, `${article.slug} 缺少「现象 | 根因 | 判定试验」失败模式表`)

  // —— 真实参考文献 ——
  const references = body.split('\n').filter(line => /^\d+\.\s+\S/u.test(line.trim()) && /(?:19|20)\d{2}/u.test(line))
  assert.ok(references.length >= 4, `${article.slug} 真实参考文献不足 4 条，实际 ${references.length}`)
  if (references.length >= 4) referenceArticles += 1

  // —— 套话与小标题黑名单 ——
  for (const phrase of boilerplate) {
    assert.ok(!body.includes(phrase), `${article.slug} 含脚本套话：「${phrase}」`)
  }
  for (const heading of article.headings) {
    assert.ok(!genericHeadings.includes(heading.text.replace(/^\d+\.?\s*/u, '').trim()), `${article.slug} 含通用小标题：「${heading.text}」`)
  }

  // —— 渲染与编码 ——
  assert.doesNotMatch(body, /TODO|待补充|在这里填写|占位/u, `${article.slug} 含占位内容`)
  assert.doesNotMatch(body, /�|锟斤拷|Ã|Â|â€/u, `${article.slug} 含常见乱码`)
  assert.ok(article.html.includes('class="katex'), `${article.slug} 未生成 KaTeX`)
  assert.ok(article.html.includes('<math'), `${article.slug} 未生成 MathML`)

  const topic = article.title.split('：')[0]
  headingSignatures.add(article.headings
    .filter(heading => heading.level >= 2)
    .map(heading => heading.text.replace(/^\d+\.?\s*/u, '').replaceAll(topic, '{主题}'))
    .join(' > '))

  for (const paragraph of body.split(/\n\s*\n/u)) {
    const normalized = paragraph.replace(/\s+/gu, ' ').trim()
    if (normalized.length < 120 || /^(?:#|\$\$|\||- \[ \]|\d+\.)/u.test(normalized)) continue
    longParagraphCounts.set(normalized, (longParagraphCounts.get(normalized) || 0) + 1)
  }

  const prose = body.split('\n').filter(line => !/^(?:#|\$\$|\||- \[ \]|\d+\.)/u.test(line.trim())).join('\n')
  for (const sentence of prose.split(/(?<=[。！？；])/u)) {
    const normalized = sentence.replace(/\s+/gu, ' ').trim()
    if (normalized.length < 40) continue
    longSentenceCounts.set(normalized, (longSentenceCounts.get(normalized) || 0) + 1)
  }
}

// —— 全库层面：结构、公式、段落、句子都不允许被批量复用 ——
assert.ok(headingSignatures.size >= 200, `文章结构变化不足：只有 ${headingSignatures.size} 种去主题化结构`)

const reusedFormulaBlocks = [...formulaBlockCounts.values()].filter(count => count > 3)
assert.equal(reusedFormulaBlocks.length, 0, `存在被 4 篇以上文章共用的公式块：${reusedFormulaBlocks.length} 组`)

const repeatedLongParagraphs = [...longParagraphCounts.values()].filter(count => count > 2)
assert.equal(repeatedLongParagraphs.length, 0, `存在被 3 篇以上文章共用的长段落：${repeatedLongParagraphs.length} 组`)

const repeatedLongSentences = [...longSentenceCounts.values()].filter(count => count > 3)
assert.equal(repeatedLongSentences.length, 0, `存在被 4 篇以上文章共用的长句：${repeatedLongSentences.length} 句`)

assert.equal(codeBlockArticles, expanded.length, `有 ${expanded.length - codeBlockArticles} 篇扩展文章缺少代码块`)
assert.equal(numericArticles, expanded.length, `有 ${expanded.length - numericArticles} 篇扩展文章缺少带单位数值`)
assert.equal(referenceArticles, expanded.length, `有 ${expanded.length - referenceArticles} 篇扩展文章缺少真实参考文献`)

console.log(
  `Knowledge expansion passed: ${articles.length} articles; collections ${JSON.stringify(collectionCounts)}; ` +
  `${expanded.length} rewritten additions; ${headingSignatures.size} normalized structures; ` +
  `all ${expanded.length} articles carry code blocks, unit-bearing numbers and real references`
)
