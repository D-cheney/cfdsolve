import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, relative, resolve, sep } from 'node:path'
import matter from 'gray-matter'

const expandedRoot = resolve(process.cwd(), 'templates', 'knowledge', 'expanded')
const apply = process.argv.includes('--apply')
const wrapperHeadings = new Set(['原理与适用范围', '工程设置与参数选择', '诊断与可信度验证'])
const wrapperKinds = {
  '原理与适用范围': 'principle',
  '工程设置与参数选择': 'setup',
  '诊断与可信度验证': 'validation'
}

const stages = [
  { key: 'foundation', title: '基础概念与控制关系' },
  { key: 'selection', title: '适用边界与方案选择' },
  { key: 'setup', title: '工程设置与实施' },
  { key: 'diagnosis', title: '异常诊断与失效模式' },
  { key: 'verification', title: '验证、验收与复现' }
]

const stageTerms = {
  foundation: ['定义', '原理', '机理', '方程', '守恒', '推导', '离散', '矩阵', '算子', '通量', '理论', '物理', '数学', '尺度', '基础', '语义', '结构', '模型形式'],
  selection: ['适用', '适用边界', '判据', '选择', '选型', '比较', '区分', '何时', '条件', '假设', '范围', '分类', '取值', '模型层级'],
  setup: ['设置', '配置', '参数', '网格', '时间步', '边界条件', '初始化', '实现', '脚本', '命令', '字典', '求解器', '预处理', '工作流', '建模步骤', '运行', '构造', '工程', '部署', '分区'],
  diagnosis: ['失败', '失效', '故障', '诊断', '症状', '排查', '异常', '根因', '陷阱', '发散', '振荡', '不收敛', '错误', '修复', '恢复', '定位'],
  verification: ['验证', '校核', '验收', '收敛', '敏感性', '误差', '守恒检查', '可信度', '基准', '检查清单', '记录', '复现', '监测', '质量收支', '独立性', '一致性', '审计']
}

const stageDefaults = { principle: 'foundation', setup: 'setup', validation: 'verification' }

function collect(path) {
  if (statSync(path).isFile()) return [path]
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = resolve(path, entry.name)
    return entry.isDirectory() ? collect(child) : [child]
  })
}

function assertInsideRoot(path) {
  const absolute = resolve(path)
  if (!absolute.startsWith(`${expandedRoot}${sep}`)) throw new Error(`拒绝修改 expanded 目录之外的文件：${absolute}`)
}

function cleanHeading(heading) {
  return heading
    .replace(/^\s*\d+(?:\.\d+)*(?:[.、．])?\s*/u, '')
    .replace(/^\s*[一二三四五六七八九十]+[、．.]\s*/u, '')
    .trim()
}

function splitMergedBody(body) {
  const lines = body.replace(/\r\n/gu, '\n').split('\n')
  const starts = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+?)\s*$/u)
    if (match && wrapperHeadings.has(match[1])) starts.push({ index, label: match[1] })
  }
  if (starts.length < 2) return null

  const sources = starts.map((start, sourceIndex) => {
    const end = starts[sourceIndex + 1]?.index ?? lines.length
    const chunk = lines.slice(start.index + 1, end)
    const sectionStarts = []
    for (let index = 0; index < chunk.length; index += 1) {
      const match = chunk[index].match(/^###\s+(.+?)\s*$/u)
      if (match) sectionStarts.push({ index, heading: cleanHeading(match[1]) })
    }
    const introEnd = sectionStarts[0]?.index ?? chunk.length
    const intro = chunk.slice(0, introEnd).join('\n').trim()
    const sections = sectionStarts.map((section, sectionIndex) => ({
      heading: section.heading,
      body: chunk.slice(section.index + 1, sectionStarts[sectionIndex + 1]?.index ?? chunk.length).join('\n').trim(),
      source: wrapperKinds[start.label]
    }))
    return { kind: wrapperKinds[start.label], intro, sections }
  })
  return sources
}

function normalized(value) {
  return value.toLowerCase().replace(/[\s`*_#，。；：、,.!?！？（）()[\]{}'"“”‘’\-—]/gu, '')
}

function bigrams(value) {
  const clean = normalized(value)
  const result = new Set()
  for (let index = 0; index < clean.length - 1; index += 1) result.add(clean.slice(index, index + 2))
  return result
}

function similarity(left, right) {
  const a = bigrams(left)
  const b = bigrams(right)
  if (!a.size || !b.size) return 0
  let overlap = 0
  for (const item of a) if (b.has(item)) overlap += 1
  return overlap / Math.max(a.size, b.size)
}

function uniqueSimilar(values, threshold = 0.88) {
  const result = []
  for (const value of values.map(item => item.trim()).filter(Boolean)) {
    if (!result.some(existing => normalized(existing) === normalized(value) || similarity(existing, value) >= threshold)) result.push(value)
  }
  return result
}

function mergeIntroductions(sources) {
  const sentences = []
  for (const source of sources) {
    const paragraphs = source.intro.split(/\n\s*\n/gu).map(item => item.trim()).filter(Boolean)
    for (const paragraph of paragraphs) {
      if (/^(?:```|\||\$\$)/u.test(paragraph)) continue
      for (const sentence of paragraph.split(/(?<=[。！？；])/u).map(item => item.trim()).filter(Boolean)) {
        if (/^(?:本文|下文)(?:将|给出|说明|围绕|按照|按|从|用|同时|重点)/u.test(sentence) && sentence.length < 80) continue
        sentences.push(sentence)
      }
    }
  }
  return uniqueSimilar(sentences, 0.76).join('')
}

function referenceHeading(heading) {
  return /参考(?:文献|资料)?|文献|资料来源|继续阅读/u.test(heading)
}

function referenceSection(section) {
  if (referenceHeading(section.heading)) return true
  const lines = section.body.split('\n').map(line => line.trim()).filter(Boolean)
  const citations = lines.filter(line => /^\d+[.)、]\s+.+(?:19|20)\d{2}/u.test(line))
  return citations.length >= 3 && citations.length >= lines.length - 2
}

function failureHeading(heading) {
  return /失败|失效|故障|症状|异常|误判|常见错误|高频错误/u.test(heading)
}

function classifySection(section) {
  if (referenceSection(section)) return 'references'
  const sample = `${section.heading} ${section.body.slice(0, 500)}`
  const scores = Object.fromEntries(stages.map(stage => [stage.key, 0]))
  scores[stageDefaults[section.source]] += 3
  for (const [stage, terms] of Object.entries(stageTerms)) {
    for (const term of terms) {
      if (section.heading.includes(term)) scores[stage] += 6
      if (sample.slice(section.heading.length).includes(term)) scores[stage] += 1
    }
  }
  if (failureHeading(section.heading)) scores.diagnosis += 12
  if (/诊断|失稳|排查|定位/u.test(section.heading)) scores.diagnosis += 8
  if (/验收|校核|验证|可信度|收敛判据/u.test(section.heading)) scores.verification += 10
  if (/收敛/u.test(section.heading) && !/设置|控制|参数/u.test(section.heading)) scores.verification += 8
  if (/注解|字典|配置|脚本|命令/u.test(section.heading) && !/验证|校核/u.test(section.heading)) scores.setup += 8
  return stages.reduce((best, stage) => scores[stage.key] > scores[best] ? stage.key : best, stageDefaults[section.source])
}

function stagePriority(stage, heading) {
  const orders = {
    foundation: ['问题', '定义', '基础', '方程', '守恒', '机理', '推导', '离散', '算法', '尺度'],
    selection: ['目标', '判据', '适用', '选择', '比较', '边界', '取值', '假设'],
    setup: ['输入', '几何', '网格', '边界', '参数', '配置', '初始化', '求解器', '实现', '脚本', '运行', '步骤', '工作流'],
    diagnosis: ['症状', '现象', '失败', '失效', '故障', '异常', '根因', '排查', '定位', '修复'],
    verification: ['手算', '基准', '发展段', '局部损失', '流量分配', '解析', '守恒', '交叉', '收敛', '误差', '敏感', '独立性', '验证', '校核', '验收', '清单', '记录', '复现']
  }
  const index = orders[stage].findIndex(term => heading.includes(term))
  return index < 0 ? orders[stage].length : index
}

function tableBlocks(body) {
  const blocks = body.split(/\n\s*\n/gu).map(item => item.trim()).filter(Boolean)
  const tables = []
  const prose = []
  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length >= 2 && lines.every(line => /^\s*\|.*\|\s*$/u.test(line)) && /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/u.test(lines[1])) tables.push(lines)
    else prose.push(block)
  }
  return { prose, tables }
}

function mergeBodies(sections) {
  const prose = []
  const tablesByHeader = new Map()
  for (const section of sections) {
    const blocks = tableBlocks(section.body)
    prose.push(...blocks.prose)
    for (const table of blocks.tables) {
      const key = normalized(table[0])
      if (!tablesByHeader.has(key)) tablesByHeader.set(key, { header: table.slice(0, 2), rows: [] })
      tablesByHeader.get(key).rows.push(...table.slice(2))
    }
  }
  const merged = uniqueSimilar(prose)
  for (const table of tablesByHeader.values()) {
    const rows = uniqueSimilar(table.rows, 0.96)
    merged.push([...table.header, ...rows].join('\n'))
  }
  return merged.join('\n\n')
}

function consolidateStage(sections, stage) {
  const groups = new Map()
  for (const section of sections) {
    const key = failureHeading(section.heading) && stage === 'diagnosis' ? '__failures__' : normalized(section.heading)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(section)
  }
  return [...groups.entries()].map(([key, group], index) => ({
    heading: key === '__failures__' ? '故障模式与判定试验' : group[0].heading,
    body: mergeBodies(group),
    order: Math.min(...group.map(item => stagePriority(stage, item.heading))),
    stable: index
  })).sort((left, right) => left.order - right.order || left.stable - right.stable)
}

function collectReferences(sections) {
  const entries = []
  const notes = []
  for (const section of sections) {
    for (const line of section.body.split('\n')) {
      const match = line.trim().match(/^\d+[.)、]\s*(.+)$/u)
      if (match) entries.push(match[1].trim())
      else if (line.trim() && !/^[-*]\s*$/u.test(line.trim())) notes.push(line.trim())
    }
  }
  const uniqueEntries = uniqueSimilar(entries, 0.94)
  const uniqueNotes = uniqueSimilar(notes, 0.94)
  return [...uniqueNotes, ...uniqueEntries.map((entry, index) => `${index + 1}. ${entry}`)].join('\n')
}

function reorganize(parsed) {
  const sources = splitMergedBody(parsed.content)
  if (!sources) return null
  const allSections = sources.flatMap(source => source.sections)
  const references = allSections.filter(section => classifySection(section) === 'references')
  const buckets = Object.fromEntries(stages.map(stage => [stage.key, []]))
  for (const section of allSections) {
    const stage = classifySection(section)
    if (stage !== 'references') buckets[stage].push(section)
  }

  const title = String(parsed.data.title || '').trim()
  const introduction = mergeIntroductions(sources)
  const parts = [`# ${title}`, introduction]
  const stageCounts = {}
  for (const stage of stages) {
    const sections = consolidateStage(buckets[stage.key], stage.key)
    if (!sections.length) continue
    stageCounts[stage.key] = sections.length
    parts.push(`## ${stage.title}`)
    for (const section of sections) parts.push(`### ${section.heading}\n\n${section.body}`)
  }
  if (references.length) parts.push(`## 参考资料\n\n${collectReferences(references)}`)

  const data = {
    ...parsed.data,
    summary: String(parsed.data.summary || '').replace(/\s*全文同时覆盖[^。]+。?$/u, '').trim(),
    seo: {
      ...(parsed.data.seo || {}),
      description: String(parsed.data.seo?.description || parsed.data.summary || '').replace(/\s*全文同时覆盖[^。]+。?$/u, '').trim().slice(0, 300)
    }
  }
  return { content: matter.stringify(`${parts.filter(Boolean).join('\n\n')}\n`, data), stageCounts, sourceCount: sources.length, sectionCount: allSections.length }
}

if (!existsSync(expandedRoot)) throw new Error(`目录不存在：${expandedRoot}`)

const files = collect(expandedRoot).filter(file => extname(file).toLowerCase() === '.md' && !basename(file).endsWith('.template.md'))
const report = []
for (const file of files) {
  const parsed = matter(readFileSync(file, 'utf8'))
  const result = reorganize(parsed)
  if (!result) continue
  report.push({ file: relative(process.cwd(), file).replaceAll('\\', '/'), ...result })
  if (apply) {
    assertInsideRoot(file)
    writeFileSync(file, result.content, 'utf8')
  }
}

const stageTotals = Object.fromEntries(stages.map(stage => [stage.key, report.reduce((sum, item) => sum + (item.stageCounts[stage.key] || 0), 0)]))
console.log(`${apply ? '已重排' : '待重排'} ${report.length} 篇合并专题，共 ${report.reduce((sum, item) => sum + item.sourceCount, 0)} 份原稿、${report.reduce((sum, item) => sum + item.sectionCount, 0)} 个内容小节。`)
console.log(`重排后章节分布：${Object.entries(stageTotals).map(([key, value]) => `${key}=${value}`).join('，')}`)
for (const item of report) console.log(`- ${item.file}：${item.sourceCount} 份原稿，${item.sectionCount} 个小节`)
