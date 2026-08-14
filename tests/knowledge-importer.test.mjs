import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseKnowledgeTemplate, KnowledgeTemplateError } from '../server/services/knowledge-importer.ts'

const source = readFileSync(new URL('../templates/knowledge/examples/boundary-condition-selection.md', import.meta.url), 'utf8')
const blankTemplate = readFileSync(new URL('../templates/knowledge/KNOWLEDGE_ARTICLE.template.md', import.meta.url), 'utf8')
const demoSource = readFileSync(new URL('../templates/knowledge/examples/formula-image-demo.md', import.meta.url), 'utf8')
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

assert.throws(
  () => parseKnowledgeTemplate(source.replace('boundary-condition-selection', '非法 slug'), 'invalid.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('slug'))
)
assert.throws(
  () => parseKnowledgeTemplate(blankTemplate, 'KNOWLEDGE_ARTICLE.template.md'),
  error => error instanceof KnowledgeTemplateError && error.issues.some(issue => issue.includes('模板占位'))
)

// ---- 公式渲染（KaTeX）----
const mathArticle = parseKnowledgeTemplate(demoSource, 'formula-image-demo.md')
assert.ok(mathArticle.html.includes('katex'), '正文应包含 KaTeX 渲染结果')
assert.ok(mathArticle.html.includes('class="math-block"'), '块级公式应有 math-block 容器')
assert.ok(mathArticle.html.includes('class="math-inline"'), '行内公式应有 math-inline 容器')
assert.ok(mathArticle.html.includes('Re'), '公式内容应保留')
assert.ok(!mathArticle.html.includes('$\\frac'), 'LaTeX 源码不应原样泄漏为纯文本')

// ---- 图片改写（本地相对路径 → 站内 API 地址）----
assert.equal(mathArticle.images.length, 2, '应识别 2 张图片（1 本地 + 1 外部）')
const localImage = mathArticle.images.find(img => !img.isExternal)
const externalImage = mathArticle.images.find(img => img.isExternal)
assert.ok(localImage, '应识别本地图片')
assert.equal(localImage.urlPath, '/api/knowledge/assets/formula-image-demo/pipe-flow-regimes.png')
assert.ok(localImage.localPath?.endsWith('images/pipe-flow-regimes.png'), '本地图片应解析出源文件路径')
assert.ok(mathArticle.html.includes('src="/api/knowledge/assets/formula-image-demo/pipe-flow-regimes.png"'), '正文 img src 应被改写')
assert.ok(mathArticle.html.includes('src="https://example.com/cfd-schematic.png"'), '外部图片地址应保留')
assert.equal(externalImage.isExternal, true)

console.log('knowledge importer: parsing, validation, sanitization, math and image processing passed')
