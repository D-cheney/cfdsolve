import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import matter from 'gray-matter'
import { knowledgeCollectionFor } from '../server/utils/knowledge-collections.ts'

const root = resolve(process.cwd(), 'templates/knowledge')

function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? collect(path) : [path]
  })
}

const files = collect(root).filter(path =>
  extname(path).toLowerCase() === '.md' &&
  basename(path) !== 'README.md' &&
  basename(path) !== 'FORMAT.md' &&
  !basename(path).endsWith('.template.md')
)

const articles = files.flatMap(path => {
  const source = readFileSync(path, 'utf8')
  if (!source.includes('template_version:') || !source.includes('flowlab-knowledge/1.0')) return []
  const parsed = matter(source)
  return [{ path, data: parsed.data, content: parsed.content }]
})

assert.ok(articles.length >= 11_000, `统一知识库应至少包含 11000 篇，实际 ${articles.length}`)
assert.equal(new Set(articles.map(item => item.data.slug)).size, articles.length, '知识库 slug 必须全局唯一')
assert.equal(articles.filter(item => item.data.status !== 'PUBLISHED').length, 0, '站内知识源必须处于 PUBLISHED 状态')

const suspiciousEncoding = /\uFFFD|锟斤拷|鈥[\u0080-\uFFFF]?|â(?:€™|€œ|€)|Ã[\u0080-\uFFFF]/u
assert.deepEqual(
  articles.filter(item => suspiciousEncoding.test(`${item.data.title}\n${item.data.summary}\n${item.content}`)).map(item => item.path),
  [],
  '知识库不应包含替换字符或常见编码乱码'
)
assert.deepEqual(
  articles.filter(item => !String(item.data.summary || '').trim() || !Array.isArray(item.data.tags) || !item.data.tags.length).map(item => item.path),
  [],
  '每篇知识文章必须提供摘要与标签'
)

const categoryNames = new Map()
for (const item of articles) {
  const slug = String(item.data.category?.slug || '')
  const name = String(item.data.category?.name || '')
  if (!categoryNames.has(slug)) categoryNames.set(slug, new Set())
  categoryNames.get(slug).add(name)
}
assert.deepEqual(
  [...categoryNames].filter(([, names]) => names.size !== 1).map(([slug, names]) => [slug, [...names]]),
  [],
  '同一分类 slug 必须只对应一个中文名称'
)

const sourceCards = articles.filter(item => String(item.data.slug).startsWith('openfoam-v14-file-'))
assert.equal(sourceCards.length, 10_907, 'OpenFOAM 14 逐文件知识卡数量与生成报告不一致')
assert.equal(new Set(sourceCards.map(item => item.data.category?.slug)).size, 17, 'OpenFOAM 源码分类应为 17 类')
assert.ok(sourceCards.every(item => String(item.data.category?.slug).startsWith('openfoam-v14-')), '源码分类 slug 必须带 OpenFOAM 命名空间')
assert.ok(sourceCards.every(item => item.data.level === '源码参考'), '源码文件卡层级必须为源码参考')
assert.ok(sourceCards.every(item => item.data.author_username === 'codex-generated'), '源码文件卡作者标识不一致')

assert.ok(articles.some(item => String(item.data.slug).startsWith('modelica-kb-')), '缺少 Modelica 专题知识库')
assert.ok(articles.some(item => String(item.data.slug).startsWith('openfoam-')), '缺少 OpenFOAM 使用知识库')
assert.ok(articles.some(item => item.data.slug === 'cae-algorithm-taxonomy'), '缺少 CAE 算法总览')
for (const requiredSlug of [
  'cfd-problem-definition',
  'conservation-equations-overview',
  'finite-volume-method',
  'pressure-velocity-coupling',
  'verification-validation-uncertainty',
  'meshfree-sph-foundations',
  'meshfree-validation'
]) {
  assert.ok(articles.some(item => item.data.slug === requiredSlug), `知识路径缺少关键主题：${requiredSlug}`)
}

const collectionCounts = Object.fromEntries(['cfd', 'openfoam', 'modelica', 'cae', 'meshfree'].map(name => [name, 0]))
for (const item of articles) collectionCounts[knowledgeCollectionFor(String(item.data.category?.slug || ''))] += 1
assert.ok(Object.values(collectionCounts).every(count => count > 0), `五大知识集合必须都有内容：${JSON.stringify(collectionCounts)}`)

console.log(`Unified knowledge catalog passed: ${articles.length} articles; collections ${JSON.stringify(collectionCounts)}; ${sourceCards.length} OpenFOAM source cards`)
