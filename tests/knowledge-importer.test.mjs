import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseKnowledgeTemplate, KnowledgeTemplateError } from '../server/services/knowledge-importer.ts'

const source = readFileSync(new URL('../templates/knowledge/examples/boundary-condition-selection.md', import.meta.url), 'utf8')
const blankTemplate = readFileSync(new URL('../templates/knowledge/KNOWLEDGE_ARTICLE.template.md', import.meta.url), 'utf8')
const article = parseKnowledgeTemplate(source, 'boundary-condition-selection.md')

assert.equal(article.slug, 'boundary-condition-selection')
assert.equal(article.status, 'PUBLISHED')
assert.equal(article.category.slug, 'governing-equations')
assert.equal(article.tags.length, 3)
assert.ok(article.html.includes('<h1>CFD 边界条件选择与一致性检查</h1>'))
assert.ok(article.headings.length >= 5)
assert.equal(article.publishedAt, '2026-08-04T00:00:00.000Z')

const unsafe = source.replace('\n# CFD 边界条件选择与一致性检查', '\n# CFD 边界条件选择与一致性检查\n\n<script>alert(1)</script>')
const sanitized = parseKnowledgeTemplate(unsafe, 'unsafe.md')
assert.equal(sanitized.html.includes('<script'), false)

const withMath = source.replace(
  '\n# CFD 边界条件选择与一致性检查',
  '\n# CFD 边界条件选择与一致性检查\n\n行内公式 $Re = \\rho U L / \\mu$。\n\n$$\n\\nabla \\cdot \\boldsymbol{u} = 0\n$$'
)
const renderedMath = parseKnowledgeTemplate(withMath, 'math.md')
assert.ok(renderedMath.html.includes('class="katex"'))
assert.ok(renderedMath.html.includes('<math'))
assert.equal(renderedMath.html.includes('script'), false)

const withTexDelimiters = source.replace(
  '\n# CFD 边界条件选择与一致性检查',
  '\n# CFD 边界条件选择与一致性检查\n\n行内公式 \\(Ma = U / a\\)。\n\n\\[\nGCI = F_s \\frac{|f_2-f_1|}{|f_1|(r^p-1)}\n\\]'
)
const renderedTexDelimiters = parseKnowledgeTemplate(withTexDelimiters, 'tex-delimiters.md')
assert.equal((renderedTexDelimiters.html.match(/class="katex"/g) || []).length, 2)
assert.equal(renderedTexDelimiters.html.includes('\\('), false)
assert.equal(renderedTexDelimiters.html.includes('\\['), false)

assert.throws(
  () => parseKnowledgeTemplate(`${withMath}\n\n非法公式 $\\frac{$。`, 'bad-math.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('公式格式无效'))
)

assert.throws(
  () => parseKnowledgeTemplate(source.replace('boundary-condition-selection', '非法 slug'), 'invalid.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('slug'))
)
assert.throws(
  () => parseKnowledgeTemplate(source.replace('CFD 边界条件选择', 'CFD 锟斤拷边界条件选择'), 'mojibake.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('编码乱码'))
)
assert.throws(
  () => parseKnowledgeTemplate(`${source}\n\n\\[\nE = mc^2`, 'unbalanced-delimiter.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('定界符'))
)
assert.throws(
  () => parseKnowledgeTemplate(blankTemplate, 'KNOWLEDGE_ARTICLE.template.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('模板占位'))
)

console.log('knowledge importer: parsing, validation and sanitization passed')
