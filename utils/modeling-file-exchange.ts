import type { ModelingEntity, ModelingLayer, Vec2 } from '~/types/modeling'
import { modelingId } from '~/utils/modeling-geometry'

export interface ModelingImportResult {
  entities: ModelingEntity[]
  layers: ModelingLayer[]
  warnings: string[]
}

function finite(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function entity(kind: ModelingEntity['kind'], name: string, layerId = 'layer-default'): ModelingEntity {
  return { id: modelingId(kind), kind, name, layerId, points: [], construction: false, locked: false, visible: true }
}

function layerId(name: string) {
  return `layer-${name.replace(/[^\p{L}\p{N}_-]+/gu, '-').toLowerCase() || 'default'}`
}

export function importAsciiDxf(text: string): ModelingImportResult {
  const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (rows.length < 4 || rows.length % 2 !== 0) throw new Error('DXF 组码结构不完整')
  const pairs = Array.from({ length: rows.length / 2 }, (_, index) => ({ code: rows[index * 2]!.trim(), value: rows[index * 2 + 1]!.trim() }))
  const insunitsIndex = pairs.findIndex(pair => pair.code === '9' && pair.value === '$INSUNITS')
  const unitCode = insunitsIndex >= 0 ? finite(pairs.slice(insunitsIndex + 1, insunitsIndex + 5).find(pair => pair.code === '70')?.value, 4) : 4
  const scale = unitCode === 6 ? 1000 : unitCode === 5 ? 10 : unitCode === 1 ? 25.4 : 1
  const start = pairs.findIndex(pair => pair.code === '2' && pair.value === 'ENTITIES')
  if (start < 0) throw new Error('DXF 缺少 ENTITIES 段')
  const records: Array<{ type: string; pairs: typeof pairs }> = []
  let current: { type: string; pairs: typeof pairs } | null = null
  for (let index = start + 1; index < pairs.length; index += 1) {
    const pair = pairs[index]!
    if (pair.code === '0') {
      if (current) records.push(current)
      if (pair.value === 'ENDSEC' || pair.value === 'EOF') { current = null; break }
      current = { type: pair.value, pairs: [] }
    } else if (current) current.pairs.push(pair)
  }
  if (current) records.push(current)
  const warnings: string[] = []
  const entities: ModelingEntity[] = []
  const layerNames = new Set<string>()
  const value = (record: (typeof records)[number], code: string, fallback = 0) => finite(record.pairs.find(pair => pair.code === code)?.value, fallback) * scale
  for (const record of records) {
    const layerName = record.pairs.find(pair => pair.code === '8')?.value || '0'
    layerNames.add(layerName)
    const lid = layerId(layerName)
    if (record.type === 'POINT') {
      const item = entity('point', `点 ${entities.length + 1}`, lid)
      item.points = [{ x: value(record, '10'), y: value(record, '20') }]
      entities.push(item)
    } else if (record.type === 'LINE') {
      const item = entity('line', `直线 ${entities.length + 1}`, lid)
      item.points = [{ x: value(record, '10'), y: value(record, '20') }, { x: value(record, '11'), y: value(record, '21') }]
      entities.push(item)
    } else if (record.type === 'CIRCLE') {
      const item = entity('circle', `圆 ${entities.length + 1}`, lid)
      item.center = { x: value(record, '10'), y: value(record, '20') }
      item.radius = Math.abs(value(record, '40'))
      item.closed = true
      if (item.radius > 0) entities.push(item); else warnings.push('忽略了半径无效的圆')
    } else if (record.type === 'ARC') {
      const item = entity('arc', `圆弧 ${entities.length + 1}`, lid)
      item.center = { x: value(record, '10'), y: value(record, '20') }
      item.radius = Math.abs(value(record, '40'))
      item.startAngle = finite(record.pairs.find(pair => pair.code === '50')?.value) * Math.PI / 180
      let sweep = (finite(record.pairs.find(pair => pair.code === '51')?.value) * Math.PI / 180) - item.startAngle
      while (sweep <= 0) sweep += Math.PI * 2
      item.sweepAngle = sweep
      if (item.radius > 0) entities.push(item); else warnings.push('忽略了半径无效的圆弧')
    } else if (record.type === 'ELLIPSE') {
      const major = { x: value(record, '11'), y: value(record, '21') }
      const item = entity('ellipse', `椭圆 ${entities.length + 1}`, lid)
      item.center = { x: value(record, '10'), y: value(record, '20') }
      item.radius = Math.hypot(major.x, major.y)
      item.radiusY = item.radius * Math.abs(finite(record.pairs.find(pair => pair.code === '40')?.value, 1))
      item.rotation = Math.atan2(major.y, major.x)
      item.closed = true
      if ((item.radius ?? 0) > 0 && (item.radiusY ?? 0) > 0) entities.push(item); else warnings.push('忽略了轴长无效的椭圆')
    } else if (record.type === 'LWPOLYLINE') {
      const xs = record.pairs.filter(pair => pair.code === '10').map(pair => finite(pair.value) * scale)
      const ys = record.pairs.filter(pair => pair.code === '20').map(pair => finite(pair.value) * scale)
      const points = xs.slice(0, Math.min(xs.length, ys.length)).map((x, index) => ({ x, y: ys[index]! }))
      if (points.length >= 2) {
        const item = entity('polyline', `连续线 ${entities.length + 1}`, lid)
        item.points = points
        item.closed = (Math.trunc(finite(record.pairs.find(pair => pair.code === '70')?.value)) & 1) === 1
        entities.push(item)
        if (record.pairs.some(pair => pair.code === '42' && Math.abs(finite(pair.value)) > 1e-12)) warnings.push('当前导入将带 bulge 的多段线保留为折线，请核对圆弧段')
      }
    } else if (!['SEQEND', 'VERTEX'].includes(record.type)) warnings.push(`未导入 DXF 对象：${record.type}`)
  }
  if (!entities.length) throw new Error('DXF 中没有可导入的二维几何')
  const layers = [...layerNames].map((name, index) => ({ id: layerId(name), name, color: index === 0 ? '#267bb9' : '#647d8b', visible: true, locked: false }))
  return { entities, layers, warnings }
}

function svgPoints(value: string, flipY = true): Vec2[] {
  const numbers = value.trim().split(/[\s,]+/).map(Number).filter(Number.isFinite)
  const points: Vec2[] = []
  for (let index = 0; index + 1 < numbers.length; index += 2) points.push({ x: numbers[index]!, y: flipY ? -numbers[index + 1]! : numbers[index + 1]! })
  return points
}

export function importSvg(text: string): ModelingImportResult {
  const xml = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (xml.querySelector('parsererror')) throw new Error('SVG XML 无法解析')
  const entities: ModelingEntity[] = []
  const warnings: string[] = []
  const add = (item: ModelingEntity) => { entities.push(item) }
  for (const node of xml.querySelectorAll('line,rect,circle,ellipse,polyline,polygon,path')) {
    const tag = node.tagName.toLowerCase()
    if (node.hasAttribute('transform')) warnings.push(`${tag} 的 transform 暂未展开，请核对位置`)
    if (tag === 'line') {
      const item = entity('line', `直线 ${entities.length + 1}`)
      item.points = [{ x: finite(node.getAttribute('x1')), y: -finite(node.getAttribute('y1')) }, { x: finite(node.getAttribute('x2')), y: -finite(node.getAttribute('y2')) }]
      add(item)
    } else if (tag === 'rect') {
      const item = entity('rectangle', `矩形 ${entities.length + 1}`)
      const x = finite(node.getAttribute('x')), y = finite(node.getAttribute('y')), width = finite(node.getAttribute('width')), height = finite(node.getAttribute('height'))
      item.points = [{ x, y: -y }, { x: x + width, y: -(y + height) }]
      item.closed = true
      if (width > 0 && height > 0) add(item)
    } else if (tag === 'circle') {
      const item = entity('circle', `圆 ${entities.length + 1}`)
      item.center = { x: finite(node.getAttribute('cx')), y: -finite(node.getAttribute('cy')) }
      item.radius = Math.abs(finite(node.getAttribute('r'))); item.closed = true
      if (item.radius > 0) add(item)
    } else if (tag === 'ellipse') {
      const item = entity('ellipse', `椭圆 ${entities.length + 1}`)
      item.center = { x: finite(node.getAttribute('cx')), y: -finite(node.getAttribute('cy')) }
      item.radius = Math.abs(finite(node.getAttribute('rx'))); item.radiusY = Math.abs(finite(node.getAttribute('ry'))); item.closed = true
      if (item.radius > 0 && item.radiusY > 0) add(item)
    } else if (tag === 'polyline' || tag === 'polygon') {
      const item = entity('polyline', `${tag === 'polygon' ? '多边形' : '连续线'} ${entities.length + 1}`)
      item.points = svgPoints(node.getAttribute('points') || '')
      item.closed = tag === 'polygon'
      if (item.points.length >= 2) add(item)
    } else {
      const d = node.getAttribute('d') || ''
      const commands = [...d.matchAll(/([MLHVZmlhvz])([^MLHVZmlhvz]*)/g)]
      if (!commands.length || /[CSQTAcsqta]/.test(d)) { warnings.push('未导入含曲线命令的 SVG path'); continue }
      const points: Vec2[] = []; let cursor = { x: 0, y: 0 }; let closed = false
      for (const command of commands) {
        const op = command[1]!, relative = op === op.toLowerCase(), values = (command[2]!.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi) || []).map(Number)
        if (op.toUpperCase() === 'Z') { closed = true; continue }
        if (op.toUpperCase() === 'H') for (const x of values) { cursor = { x: relative ? cursor.x + x : x, y: cursor.y }; points.push({ ...cursor }) }
        else if (op.toUpperCase() === 'V') for (const y of values) { cursor = { x: cursor.x, y: relative ? cursor.y - y : -y }; points.push({ ...cursor }) }
        else for (let index = 0; index + 1 < values.length; index += 2) { const x = values[index]!, y = values[index + 1]!; cursor = { x: relative ? cursor.x + x : x, y: relative ? cursor.y - y : -y }; points.push({ ...cursor }) }
      }
      if (points.length >= 2) { const item = entity('polyline', `SVG 路径 ${entities.length + 1}`); item.points = points; item.closed = closed; add(item) }
    }
  }
  if (!entities.length) throw new Error('SVG 中没有可导入的二维几何')
  return { entities, layers: [{ id: 'layer-default', name: '默认图层', color: '#267bb9', visible: true, locked: false }], warnings }
}
