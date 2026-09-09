import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseKnowledgeTemplate, importKnowledgeArticles } from '../server/services/knowledge-importer.ts'
import { closeDatabase } from '../server/utils/database.ts'
import { knowledgeCollectionFor } from '../server/utils/knowledge-collections.ts'

const root = resolve('templates/knowledge/meshfree')
const articles = readdirSync(root).filter(name => name.endsWith('.md') && name !== 'README.md')
  .map(name => parseKnowledgeTemplate(readFileSync(join(root, name), 'utf8'), `templates/knowledge/meshfree/${name}`))
assert.equal(articles.length, 9)
const slugs = new Set(articles.map(article => article.slug))
assert.equal(slugs.size, articles.length)
for (const article of articles) {
  assert.equal(article.status, 'PUBLISHED')
  assert.equal(knowledgeCollectionFor(article.category.slug), 'meshfree')
  assert.ok(article.headings.length >= 4)
  assert.ok(!article.html.includes('katex-error'))
  for (const match of article.html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1]
    if (href.startsWith('/knowledge/meshfree-')) assert.ok(slugs.has(href.split('/').at(-1)), href)
    else if (href.startsWith('/meshfree/')) assert.ok(existsSync(resolve('public', `.${href}`)), href)
    else assert.ok(href === '/meshfree' || /^https?:\/\//.test(href), `Unresolved link: ${href}`)
  }
}
for (const slug of ['meshfree-landslide-plan', 'meshfree-sph-foundations', 'meshfree-validation']) {
  assert.ok(articles.find(article => article.slug === slug).html.includes('class="katex'), `${slug}: math must render`)
}
const manifest = JSON.parse(readFileSync('public/meshfree/manifest.json', 'utf8'))
assert.equal(manifest.videos.length, 8)
assert.equal(manifest.summary.completed, true)
assert.equal(manifest.summary.duration_s, 5400)
assert.equal(manifest.summary.particle_count, 480000)
assert.equal(manifest.quality.frames_checked, manifest.summary.saved_frames)
assert.equal(manifest.motion.length, 8)
for (const file of manifest.files) {
  assert.ok(file.path.startsWith('/meshfree/') && !file.path.includes('..'))
  assert.ok(!/(?:^|\/)(?:\.env|credentials|secrets|token)(?:[./]|$)|\.(?:pem|key|p12|pfx)$/i.test(file.path))
  const bytes = readFileSync(resolve('public', `.${file.path}`))
  assert.equal(bytes.length, file.bytes, file.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path)
}
for (const video of manifest.videos) {
  const evidence = manifest.motion.find(item => `/meshfree/videos/${item.file}` === video.src)
  assert.ok(evidence?.decode_ok, video.src)
  assert.equal(evidence.bytes, manifest.files.find(file => file.path === video.src)?.bytes)
  assert.ok(manifest.files.some(file => file.path === video.poster))
}

// Exercise the actual query handlers against an isolated, seeded SQLite database.
const directory = mkdtempSync(join(tmpdir(), 'cfdsolve-meshfree-'))
const previousPath = process.env.CFDSOLVE_DB_PATH
process.env.CFDSOLVE_DB_PATH = join(directory, 'test.sqlite')
Object.assign(globalThis, {
  defineEventHandler: handler => handler,
  getQuery: event => event.query || {},
})
try {
  assert.ok(importKnowledgeArticles(articles).every(result => result.action === 'created'))
  assert.ok(importKnowledgeArticles(articles).every(result => result.action === 'updated'))
  const list = (await import('../server/api/knowledge/index.get.ts')).default
  const categories = (await import('../server/api/knowledge/categories.get.ts')).default
  const all = list({ query: { collection: 'meshfree', limit: 100 } })
  assert.equal(all.total, 9)
  assert.equal(all.items.length, 9)
  assert.ok(all.items.every(item => slugs.has(item.slug)))
  assert.ok(list({ query: { collection: 'cfd', limit: 100 } }).items.every(item => !slugs.has(item.slug)))
  const page = list({ query: { collection: 'meshfree', limit: 2, offset: 2 } })
  assert.equal(page.items.length, 2)
  assert.equal(page.total, 9)
  assert.equal(page.hasMore, true)
  assert.ok(page.items.every(item => !all.items.slice(0, 2).some(first => first.slug === item.slug)))
  const search = list({ query: { collection: 'meshfree', q: 'Wendland' } })
  assert.ok(search.items.some(item => item.slug === 'meshfree-sph-foundations'))
  assert.equal(list({ query: { collection: 'meshfree', q: 'definitely-no-result-12345' } }).total, 0)
  const filtered = list({ query: { category: 'meshfree-foundations' } })
  assert.equal(filtered.total, 2)
  assert.equal(categories().items.filter(item => item.collection === 'meshfree').reduce((n, item) => n + item.count, 0), 9)
} finally {
  closeDatabase()
  if (previousPath === undefined) delete process.env.CFDSOLVE_DB_PATH
  else process.env.CFDSOLVE_DB_PATH = previousPath
  // Only remove the uniquely created directory inside the OS temp directory.
  assert.ok(directory.startsWith(join(tmpdir(), 'cfdsolve-meshfree-')))
  rmSync(directory, { recursive: true, force: true })
}
console.log(`Meshfree integration passed: 9 articles, API filters/search/pagination, idempotent import, ${manifest.files.length} asset hashes, 8 video records.`)
