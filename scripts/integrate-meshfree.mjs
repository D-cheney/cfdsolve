// Read-only import of the project's original research files and completed media.
// Explicit extensions and filenames prevent caches, credentials and run dumps entering the site.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'

const presentation = process.argv[2]
if (!presentation) throw new Error('Usage: node scripts/integrate-meshfree.mjs <completed presentation directory>')
const root = process.cwd()
const model = resolve(root, 'jilong_debrisflow_model')
const output = resolve(root, 'public/meshfree')
const knowledge = resolve(root, 'templates/knowledge/meshfree')
const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const summary = readJson(resolve(presentation, '../summary.json'))
const quality = readJson(resolve(presentation, 'quality_check.json'))
const motion = readJson(resolve(presentation, 'motion_quality_check.json'))
if (!summary.completed || summary.particle_count !== 480000 || summary.duration_s !== 5400 ||
    !quality.finite_states || !quality.mass_constant || quality.frames_checked !== summary.saved_frames) {
  throw new Error('Completed 480k / 5400 s result and matching quality evidence required')
}
const files = []
function copy(source, path) {
  const destination = resolve(output, path)
  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(source, destination)
  const bytes = readFileSync(destination)
  files.push({ path: `/meshfree/${path}`, bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex') })
}
const documents = [
  ['landslide-plan', '无网格法山体滑坡模拟技术方案', resolve(root, '无网格法山体滑坡模拟技术方案.md'), 'meshfree-landslide', '滑坡建模', '从土体本构、地形与粒子离散到起滑、运动和堆积的分阶段技术方案；固体力学 SPH 与流体型 SPH 的范围分别说明。'],
  ['jilong-overview', '吉隆无网格模型：版本与文件导航', resolve(model, 'README.md'), 'meshfree-cases', '案例与复现', '梳理吉隆模型的一维基线、2.5D 展示和三维 SPH 版本，连接输入文件、配置与复现步骤。'],
  ['jilong-historical-report', '吉隆一维与 2.5D 历史初模报告', resolve(model, 'MODEL_REPORT.md'), 'meshfree-cases', '案例与复现', '保存历史一维模型的假设、参数、到达时间和可信度分级；这些数值不属于三维计算结果。'],
  ['reusable-workflow', '无网格泥石流模型：场地替换与复现流程', resolve(model, 'REUSABLE_SIMULATION_TEMPLATE.md'), 'meshfree-cases', '案例与复现', '从场地数据替换、情景配置到历史模型运行与成果交付的完整操作参考，复用前需核对本机路径和环境。'],
  ['sph3d-model', '三维 SPH：控制方程、边界与验证', resolve(model, 'THREE_DIMENSIONAL_TEMPLATE.md'), 'meshfree-sph', 'SPH 理论与实现', '独立三维粒子、Wendland 核、宾汉黏性、固定 DEM 接触与邻居表实现，并列出当前物理范围和数值验证要求。'],
  ['cloud-480k', '48 万粒子：速度云图与颗粒跟随', resolve(model, 'CLOUD_480K_TEMPLATE.md'), 'meshfree-cases', '案例与复现', '记录 48 万独立动力粒子、90 分钟物理过程及八个观察视角，解释云图重建、示踪轨迹和结果局限。'],
]
const docLinks = new Map(documents.map(([slug, , source]) => [source.split(/[\\/]/).at(-1), `/knowledge/meshfree-${slug}`]))
mkdirSync(knowledge, { recursive: true })
for (const [slug, title, source, category, categoryName, description] of documents) {
  copy(source, `documents/${slug}.md`)
  const original = readFileSync(source, 'utf8')
  // Keep fenced source code verbatim; adapt prose math to the existing KaTeX importer.
  const body = original.split(/(```[\s\S]*?```)/g).map((part, i) => i % 2 ? part : part
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, expression) => `$$\n${expression}\n$$`)
    .replace(/\\\((.*?)\\\)/g, (_m, expression) => `$${expression}$`)
    .replace(/\]\(([^)]+)\)/g, (match, link) => docLinks.has(link) ? `](${docLinks.get(link)})` : match)
  ).join('')
  const header = { template_version: 'flowlab-knowledge/1.0', slug: `meshfree-${slug}`, title,
    summary: description, category: { slug: category, name: `无网格法 · ${categoryName}` },
    level: '专题', reading_minutes: Math.max(5, Math.ceil(original.length / 650)), status: 'PUBLISHED',
    author_username: 'codex-generated', published_at: '2026-09-10T00:00:00.000Z',
    tags: ['无网格法', 'SPH', slug.includes('landslide') ? '滑坡' : '泥石流'] }
  const frontMatter = Object.entries(header).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')
  writeFileSync(resolve(knowledge, `meshfree-${slug}.md`), `---\n${frontMatter}\n---\n\n` +
    `> 本文由项目原始资料转为站内阅读版；原文中的本机路径和历史运行记录仅供追溯。` +
    `[下载原始文档](/meshfree/documents/${slug}.md) · [查看专题与模型文件](/meshfree)。\n\n${body}`, 'utf8')
}
for (const directory of ['src', 'config', 'data/processed']) {
  for (const entry of readdirSync(resolve(model, directory), { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const allowed = directory === 'src' ? /\.py$/ : directory === 'config' ? /\.(json|txt)$/ : /^(terrain_model\.npz|flow_path\.csv|source_particles\.csv)$/
    if (allowed.test(entry.name)) copy(resolve(model, directory, entry.name), `model/${directory}/${entry.name}`)
  }
}
const videos = [
  ['01_southeast', '东南斜视'], ['02_northwest', '西北斜视'],
  ['03_low_angle', '低角度侧视'], ['04_top', '垂直俯视'],
  ['05_east', '正东侧视'], ['06_south', '正南视图'],
  ['07_follow', '颗粒群跟随'], ['08_orbit_follow', '环绕跟随'],
].map(([id, title]) => {
  copy(resolve(presentation, `videos/${id}.mp4`), `videos/${id}.mp4`)
  copy(resolve(presentation, `images/${id}.png`), `images/${id}.png`)
  return { id, title, src: `/meshfree/videos/${id}.mp4`, poster: `/meshfree/images/${id}.png` }
})
for (const name of ['process_curves', 'settings']) copy(resolve(presentation, `images/${name}.png`), `images/${name}.png`)
for (const name of ['quality_check.json', 'motion_quality_check.json']) copy(resolve(presentation, name), `evidence/${name}`)
copy(resolve(presentation, '../summary.json'), 'evidence/summary.json')
const manifest = { version: 1, integratedAt: '2026-09-10', summary, quality, motion, videos,
  documents: documents.map(([slug, title]) => ({ slug: `meshfree-${slug}`, title, download: `/meshfree/documents/${slug}.md` })), files }
writeFileSync(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Integrated ${documents.length} documents, ${videos.length} videos, ${files.length} allowlisted files (${Math.round(files.reduce((n, f) => n + f.bytes, 0) / 1024 / 1024)} MiB).`)
