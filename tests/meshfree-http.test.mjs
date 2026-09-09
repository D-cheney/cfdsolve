import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Run against a completed production build with knowledge already imported.
const base = new URL(process.argv[2] || 'http://127.0.0.1:4317')
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Use a local validation server')
const manifest = JSON.parse(readFileSync('public/meshfree/manifest.json', 'utf8'))
const get = async path => {
  const response = await fetch(new URL(path, base))
  assert.equal(response.status, 200, path)
  return response
}
const collection = await (await get('/api/knowledge?collection=meshfree&limit=100')).json()
assert.equal(collection.total, 9)
for (const article of collection.items) {
  const detail = await (await get(`/api/knowledge/${article.slug}`)).json()
  assert.ok(detail.bodyHtml.includes('<h1>'))
  const html = await (await get(`/knowledge/${article.slug}`)).text()
  assert.ok(html.includes(article.title), article.slug)
}
assert.ok((await (await get('/knowledge?collection=meshfree')).text()).includes('共 9 篇'))
assert.ok((await (await get('/meshfree')).text()).includes('下载模型 ZIP'))
assert.equal((await fetch(new URL('/api/knowledge/meshfree-does-not-exist', base))).status, 404)
for (let index = 0; index < manifest.files.length; index += 4) {
  await Promise.all(manifest.files.slice(index, index + 4).map(async file => {
    const response = await get(file.path)
    if (file.path.endsWith('.mp4')) assert.match(response.headers.get('content-type') || '', /video\/mp4/)
    const bytes = Buffer.from(await response.arrayBuffer())
    assert.equal(bytes.length, file.bytes, file.path)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path)
  }))
}
console.log(`Production HTTP checks passed: 9 rendered articles, list/detail APIs, 404, ${manifest.files.length} exact downloads and video MIME types.`)
