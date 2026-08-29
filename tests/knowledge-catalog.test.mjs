import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import matter from 'gray-matter'

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
  return [{ path, data: parsed.data }]
})

assert.ok(articles.length >= 11_000, `统一知识库应至少包含 11000 篇，实际 ${articles.length}`)
assert.equal(new Set(articles.map(item => item.data.slug)).size, articles.length, '知识库 slug 必须全局唯一')
assert.equal(articles.filter(item => item.data.status !== 'PUBLISHED').length, 0, '站内知识源必须处于 PUBLISHED 状态')

const sourceCards = articles.filter(item => String(item.data.slug).startsWith('openfoam-v14-file-'))
assert.equal(sourceCards.length, 10_907, 'OpenFOAM 14 逐文件知识卡数量与生成报告不一致')
assert.equal(new Set(sourceCards.map(item => item.data.category?.slug)).size, 17, 'OpenFOAM 源码分类应为 17 类')
assert.ok(sourceCards.every(item => String(item.data.category?.slug).startsWith('openfoam-v14-')), '源码分类 slug 必须带 OpenFOAM 命名空间')
assert.ok(sourceCards.every(item => item.data.level === '源码参考'), '源码文件卡层级必须为源码参考')
assert.ok(sourceCards.every(item => item.data.author_username === 'codex-generated'), '源码文件卡作者标识不一致')

assert.ok(articles.some(item => String(item.data.slug).startsWith('modelica-kb-')), '缺少 Modelica 专题知识库')
assert.ok(articles.some(item => String(item.data.slug).startsWith('openfoam-')), '缺少 OpenFOAM 使用知识库')
assert.ok(articles.some(item => item.data.slug === 'cae-algorithm-taxonomy'), '缺少 CAE 算法总览')

console.log(`Unified knowledge catalog passed: ${articles.length} articles, ${sourceCards.length} OpenFOAM source cards`)
