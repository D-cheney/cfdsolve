import type { ModelingDiagnostic, ModelingEntity, Vec2 } from '~/types/modeling'

export const EPS = 1e-6
export const TAU = Math.PI * 2

export const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y)
export const midpoint = (a: Vec2, b: Vec2): Vec2 => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
export const finitePoint = (point: Vec2) => Number.isFinite(point.x) && Number.isFinite(point.y)
export const normalizeAngle = (angle: number) => ((angle % TAU) + TAU) % TAU

export function modelingId(prefix = 'obj') {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`
}

export function cloneEntity(entity: ModelingEntity): ModelingEntity {
  return {
    ...entity,
    points: entity.points.map(point => ({ ...point })),
    center: entity.center ? { ...entity.center } : undefined,
  }
}

export function cloneDocument<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function regularPolygonPoints(center: Vec2, radius: number, sides: number, rotation = -Math.PI / 2) {
  return Array.from({ length: Math.max(3, Math.min(256, Math.round(sides))) }, (_, index) => ({
    x: center.x + Math.cos(rotation + index * TAU / sides) * radius,
    y: center.y + Math.sin(rotation + index * TAU / sides) * radius,
  }))
}

export function rectanglePoints(a: Vec2, b: Vec2) {
  return [
    { x: a.x, y: a.y },
    { x: b.x, y: a.y },
    { x: b.x, y: b.y },
    { x: a.x, y: b.y },
  ]
}

export function entityVertices(entity: ModelingEntity): Vec2[] {
  if (entity.kind === 'circle' || entity.kind === 'ellipse' || entity.kind === 'arc') return []
  if (entity.kind === 'polygon' && entity.center && entity.radius) {
    return regularPolygonPoints(entity.center, entity.radius, entity.sides ?? 6, entity.rotation)
  }
  if (entity.kind === 'rectangle' && entity.points.length >= 2) return rectanglePoints(entity.points[0]!, entity.points[1]!)
  return entity.points
}

export function arcEndpoints(entity: ModelingEntity) {
  const center = entity.center ?? { x: 0, y: 0 }
  const radius = entity.radius ?? 0
  const start = entity.startAngle ?? 0
  const end = start + (entity.sweepAngle ?? Math.PI / 2)
  return [
    { x: center.x + Math.cos(start) * radius, y: center.y + Math.sin(start) * radius },
    { x: center.x + Math.cos(end) * radius, y: center.y + Math.sin(end) * radius },
  ]
}

export function modelingEntitySnapPoints(entity: ModelingEntity) {
  const points: Array<Vec2 & { kind: 'endpoint' | 'midpoint' | 'center' | 'quadrant'; label: string }> = []
  const vertices = entityVertices(entity)
  vertices.forEach((point, index) => {
    points.push({ ...point, kind: 'endpoint', label: `端点 ${index + 1}` })
    if (index && (entity.kind === 'polyline' || entity.closed)) {
      points.push({ ...midpoint(vertices[index - 1]!, point), kind: 'midpoint', label: '中点' })
    }
  })
  if (vertices.length > 1 && entity.closed) points.push({ ...midpoint(vertices.at(-1)!, vertices[0]!), kind: 'midpoint', label: '中点' })
  if (entity.center) {
    points.push({ ...entity.center, kind: 'center', label: '圆心' })
    if ((entity.kind === 'circle' || entity.kind === 'ellipse') && entity.radius) {
      const ry = entity.kind === 'ellipse' ? entity.radiusY ?? entity.radius : entity.radius
      const rotation = entity.rotation ?? 0
      for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const local = { x: Math.cos(angle) * entity.radius, y: Math.sin(angle) * ry }
        points.push({
          x: entity.center.x + local.x * Math.cos(rotation) - local.y * Math.sin(rotation),
          y: entity.center.y + local.x * Math.sin(rotation) + local.y * Math.cos(rotation),
          kind: 'quadrant',
          label: '象限点',
        })
      }
    }
  }
  if (entity.kind === 'arc') arcEndpoints(entity).forEach(point => points.push({ ...point, kind: 'endpoint', label: '圆弧端点' }))
  return points
}

export interface EntityBounds { minX: number; minY: number; maxX: number; maxY: number }

export function entityBounds(entity: ModelingEntity): EntityBounds {
  if (entity.center && entity.radius !== undefined) {
    const ry = entity.radiusY ?? entity.radius
    const rotation = entity.rotation ?? 0
    if (entity.kind === 'ellipse') {
      const dx = Math.hypot(entity.radius * Math.cos(rotation), ry * Math.sin(rotation))
      const dy = Math.hypot(entity.radius * Math.sin(rotation), ry * Math.cos(rotation))
      return { minX: entity.center.x - dx, minY: entity.center.y - dy, maxX: entity.center.x + dx, maxY: entity.center.y + dy }
    }
    return { minX: entity.center.x - entity.radius, minY: entity.center.y - entity.radius, maxX: entity.center.x + entity.radius, maxY: entity.center.y + entity.radius }
  }
  const points = entityVertices(entity)
  if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return {
    minX: Math.min(...points.map(point => point.x)),
    minY: Math.min(...points.map(point => point.y)),
    maxX: Math.max(...points.map(point => point.x)),
    maxY: Math.max(...points.map(point => point.y)),
  }
}

export function combinedBounds(entities: ModelingEntity[]): EntityBounds | null {
  const visible = entities.filter(entity => entity.visible)
  if (!visible.length) return null
  const bounds = visible.map(entityBounds)
  return {
    minX: Math.min(...bounds.map(item => item.minX)),
    minY: Math.min(...bounds.map(item => item.minY)),
    maxX: Math.max(...bounds.map(item => item.maxX)),
    maxY: Math.max(...bounds.map(item => item.maxY)),
  }
}

export function polylineLength(points: Vec2[], closed = false) {
  let result = 0
  for (let index = 1; index < points.length; index += 1) result += distance(points[index - 1]!, points[index]!)
  if (closed && points.length > 2) result += distance(points.at(-1)!, points[0]!)
  return result
}

export function polygonArea(points: Vec2[]) {
  if (points.length < 3) return 0
  return Math.abs(points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]!
    return sum + point.x * next.y - next.x * point.y
  }, 0)) / 2
}

export function modelingEntityLength(entity: ModelingEntity) {
  if (entity.kind === 'circle') return TAU * (entity.radius ?? 0)
  if (entity.kind === 'arc') return Math.abs(entity.sweepAngle ?? 0) * (entity.radius ?? 0)
  if (entity.kind === 'ellipse') {
    const a = entity.radius ?? 0
    const b = entity.radiusY ?? a
    return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))
  }
  return polylineLength(entityVertices(entity), Boolean(entity.closed || ['rectangle', 'polygon', 'slot'].includes(entity.kind)))
}

export function entityArea(entity: ModelingEntity) {
  if (entity.construction) return 0
  if (entity.kind === 'circle') return Math.PI * (entity.radius ?? 0) ** 2
  if (entity.kind === 'ellipse') return Math.PI * (entity.radius ?? 0) * (entity.radiusY ?? 0)
  if (entity.kind === 'slot' && entity.points.length >= 2 && entity.radius) {
    return distance(entity.points[0]!, entity.points[1]!) * entity.radius * 2 + Math.PI * entity.radius ** 2
  }
  if (entity.closed || ['rectangle', 'polygon'].includes(entity.kind)) return polygonArea(entityVertices(entity))
  return 0
}

function pointInPolygon(point: Vec2, polygon: Vec2[]) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index]!, b = polygon[previous]!
    if (((a.y > point.y) !== (b.y > point.y)) && point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || EPS) + a.x) inside = !inside
  }
  return inside
}

export function entityContainsEntity(outer: ModelingEntity, inner: ModelingEntity) {
  const samples = modelingEntitySnapPoints(inner).filter(point => point.kind === 'endpoint' || point.kind === 'quadrant' || point.kind === 'center')
  if (!samples.length) return false
  if (outer.kind === 'circle' && outer.center && outer.radius !== undefined) return samples.every(point => distance(point, outer.center!) < outer.radius! - EPS)
  if (outer.kind === 'ellipse' && outer.center && outer.radius && outer.radiusY) {
    const angle = -(outer.rotation ?? 0), cos = Math.cos(angle), sin = Math.sin(angle)
    return samples.every(point => { const dx = point.x - outer.center!.x, dy = point.y - outer.center!.y; const x = dx * cos - dy * sin, y = dx * sin + dy * cos; return (x * x) / (outer.radius! * outer.radius!) + (y * y) / (outer.radiusY! * outer.radiusY!) < 1 - EPS })
  }
  const polygon = entityVertices(outer)
  return polygon.length >= 3 && samples.every(point => pointInPolygon(point, polygon))
}

export function pointSegmentDistance(point: Vec2, a: Vec2, b: Vec2) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length2 = dx * dx + dy * dy
  if (length2 < EPS) return distance(point, a)
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length2))
  return distance(point, { x: a.x + dx * t, y: a.y + dy * t })
}

export function distanceToEntity(point: Vec2, entity: ModelingEntity) {
  if (entity.center && entity.radius !== undefined) {
    if (entity.kind === 'ellipse') {
      const rotation = -(entity.rotation ?? 0)
      const dx = point.x - entity.center.x
      const dy = point.y - entity.center.y
      const localX = dx * Math.cos(rotation) - dy * Math.sin(rotation)
      const localY = dx * Math.sin(rotation) + dy * Math.cos(rotation)
      const a = entity.radius
      const b = entity.radiusY ?? a
      const normalized = Math.hypot(localX / a, localY / b)
      return Math.abs(normalized - 1) * Math.min(a, b)
    }
    return Math.abs(distance(point, entity.center) - entity.radius)
  }
  const points = entityVertices(entity)
  if (entity.kind === 'point') return points[0] ? distance(point, points[0]) : Infinity
  let result = Infinity
  for (let index = 1; index < points.length; index += 1) result = Math.min(result, pointSegmentDistance(point, points[index - 1]!, points[index]!))
  if ((entity.closed || ['rectangle', 'polygon', 'slot'].includes(entity.kind)) && points.length > 2) result = Math.min(result, pointSegmentDistance(point, points.at(-1)!, points[0]!))
  return result
}

export function modelingTranslateEntity(entity: ModelingEntity, delta: Vec2): ModelingEntity {
  const copy = cloneEntity(entity)
  copy.points = copy.points.map(point => ({ x: point.x + delta.x, y: point.y + delta.y }))
  if (copy.center) copy.center = { x: copy.center.x + delta.x, y: copy.center.y + delta.y }
  return copy
}

export function rotatePoint(point: Vec2, center: Vec2, radians: number): Vec2 {
  const x = point.x - center.x
  const y = point.y - center.y
  return { x: center.x + x * Math.cos(radians) - y * Math.sin(radians), y: center.y + x * Math.sin(radians) + y * Math.cos(radians) }
}

export function modelingRotateEntity(entity: ModelingEntity, center: Vec2, radians: number): ModelingEntity {
  const copy = cloneEntity(entity)
  if (entity.kind === 'rectangle') {
    copy.kind = 'polyline'
    copy.closed = true
    copy.points = entityVertices(entity).map(point => rotatePoint(point, center, radians))
  } else copy.points = copy.points.map(point => rotatePoint(point, center, radians))
  if (copy.center) copy.center = rotatePoint(copy.center, center, radians)
  copy.rotation = (copy.rotation ?? 0) + radians
  copy.startAngle = copy.startAngle === undefined ? undefined : copy.startAngle + radians
  return copy
}

export function mirrorPoint(point: Vec2, a: Vec2, b: Vec2): Vec2 {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const denominator = dx * dx + dy * dy
  if (denominator < EPS) return { ...point }
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / denominator
  const projection = { x: a.x + t * dx, y: a.y + t * dy }
  return { x: projection.x * 2 - point.x, y: projection.y * 2 - point.y }
}

export function modelingMirrorEntity(entity: ModelingEntity, a: Vec2, b: Vec2): ModelingEntity {
  const copy = cloneEntity(entity)
  if (entity.kind === 'rectangle') {
    copy.kind = 'polyline'
    copy.closed = true
    copy.points = entityVertices(entity).map(point => mirrorPoint(point, a, b))
  } else copy.points = copy.points.map(point => mirrorPoint(point, a, b))
  if (copy.center) copy.center = mirrorPoint(copy.center, a, b)
  if (copy.kind === 'arc') {
    const [start, end] = arcEndpoints(entity).map(point => mirrorPoint(point, a, b))
    copy.startAngle = Math.atan2(start!.y - copy.center!.y, start!.x - copy.center!.x)
    const endAngle = Math.atan2(end!.y - copy.center!.y, end!.x - copy.center!.x)
    const originalSign = Math.sign(entity.sweepAngle ?? 1) || 1
    let sweep = normalizeAngle(endAngle - copy.startAngle)
    if (originalSign > 0) sweep -= TAU
    copy.sweepAngle = sweep
  }
  return copy
}

export function segmentIntersection(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): Vec2 | null {
  const dax = a2.x - a1.x
  const day = a2.y - a1.y
  const dbx = b2.x - b1.x
  const dby = b2.y - b1.y
  const denominator = dax * dby - day * dbx
  if (Math.abs(denominator) < EPS) return null
  const dx = b1.x - a1.x
  const dy = b1.y - a1.y
  const t = (dx * dby - dy * dbx) / denominator
  const u = (dx * day - dy * dax) / denominator
  if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null
  return { x: a1.x + t * dax, y: a1.y + t * day }
}

export function lineCircleIntersections(a: Vec2, b: Vec2, center: Vec2, radius: number) {
  const d = { x: b.x - a.x, y: b.y - a.y }
  const f = { x: a.x - center.x, y: a.y - center.y }
  const A = d.x * d.x + d.y * d.y
  const B = 2 * (f.x * d.x + f.y * d.y)
  const C = f.x * f.x + f.y * f.y - radius * radius
  const discriminant = B * B - 4 * A * C
  if (A < EPS || discriminant < -EPS) return []
  const root = Math.sqrt(Math.max(0, discriminant))
  return [(-B - root) / (2 * A), (-B + root) / (2 * A)]
    .filter((t, index, values) => t >= -EPS && t <= 1 + EPS && (index === 0 || Math.abs(t - values[0]!) > EPS))
    .map(t => ({ x: a.x + d.x * t, y: a.y + d.y * t }))
}

function entitySegments(entity: ModelingEntity) {
  const points = entityVertices(entity)
  const result: Array<[Vec2, Vec2]> = []
  for (let index = 1; index < points.length; index += 1) result.push([points[index - 1]!, points[index]!])
  if ((entity.closed || ['rectangle', 'polygon', 'slot'].includes(entity.kind)) && points.length > 2) result.push([points.at(-1)!, points[0]!])
  return result
}

export function intersections(a: ModelingEntity, b: ModelingEntity) {
  const result: Vec2[] = []
  const aCircle = (a.kind === 'circle' || a.kind === 'arc') && a.center && a.radius
  const bCircle = (b.kind === 'circle' || b.kind === 'arc') && b.center && b.radius
  if (aCircle && !bCircle) {
    for (const segment of entitySegments(b)) result.push(...lineCircleIntersections(segment[0], segment[1], a.center!, a.radius!))
  } else if (bCircle && !aCircle) {
    for (const segment of entitySegments(a)) result.push(...lineCircleIntersections(segment[0], segment[1], b.center!, b.radius!))
  } else {
    for (const sa of entitySegments(a)) for (const sb of entitySegments(b)) {
      const point = segmentIntersection(sa[0], sa[1], sb[0], sb[1])
      if (point) result.push(point)
    }
  }
  return result.filter((point, index) => result.findIndex(other => distance(point, other) < EPS * 10) === index)
}

export function modelingOffsetEntity(entity: ModelingEntity, offset: number): ModelingEntity | null {
  const copy = cloneEntity(entity)
  if (entity.kind === 'line' && entity.points.length >= 2) {
    const a = entity.points[0]!
    const b = entity.points[1]!
    const length = distance(a, b)
    if (length < EPS) return null
    const normal = { x: -(b.y - a.y) / length * offset, y: (b.x - a.x) / length * offset }
    copy.points = copy.points.map(point => ({ x: point.x + normal.x, y: point.y + normal.y }))
    return copy
  }
  if (entity.kind === 'circle' || entity.kind === 'arc') {
    const radius = (entity.radius ?? 0) + offset
    if (radius <= EPS) return null
    copy.radius = radius
    return copy
  }
  const points = entityVertices(entity)
  if (points.length < 3 || !(entity.closed || ['rectangle', 'polygon', 'slot'].includes(entity.kind))) return null
  const signedArea = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]!
    return sum + point.x * next.y - next.x * point.y
  }, 0) / 2
  const side = signedArea >= 0 ? -1 : 1
  const shiftedLines = points.map((point, index) => {
    const next = points[(index + 1) % points.length]!
    const length = distance(point, next)
    if (length < EPS) return null
    const normal = { x: side * -(next.y - point.y) / length * offset, y: side * (next.x - point.x) / length * offset }
    return [{ x: point.x + normal.x, y: point.y + normal.y }, { x: next.x + normal.x, y: next.y + normal.y }] as [Vec2, Vec2]
  })
  if (shiftedLines.some(line => !line)) return null
  const shifted = points.map((_, index) => {
    const previous = shiftedLines[(index - 1 + shiftedLines.length) % shiftedLines.length]!
    const current = shiftedLines[index]!
    const hit = infiniteLineIntersection(previous[0], previous[1], current[0], current[1])
    return hit ?? current[0]
  })
  if (polygonArea(shifted) < EPS) return null
  copy.kind = 'polyline'
  copy.points = shifted
  copy.closed = true
  delete copy.center
  delete copy.radius
  return copy
}

function infiniteLineIntersection(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): Vec2 | null {
  const dax = a2.x - a1.x
  const day = a2.y - a1.y
  const dbx = b2.x - b1.x
  const dby = b2.y - b1.y
  const denominator = dax * dby - day * dbx
  if (Math.abs(denominator) < EPS) return null
  const t = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denominator
  return { x: a1.x + t * dax, y: a1.y + t * day }
}

export function validateGeometry(entities: ModelingEntity[]) {
  const diagnostics: ModelingDiagnostic[] = []
  const keyMap = new Map<string, string>()
  const add = (code: string, message: string, entityIds: string[], severity: ModelingDiagnostic['severity'] = 'warning', location?: Vec2) => diagnostics.push({ id: modelingId('diag'), code, message, entityIds, severity, location })
  for (const entity of entities) {
    if (!entity.visible) continue
    if (entity.points.some(point => !finitePoint(point)) || (entity.center && !finitePoint(entity.center))) add('INVALID_NUMBER', `${entity.name} 含有无效坐标`, [entity.id], 'error')
    if (entity.kind === 'line' && entity.points.length >= 2 && distance(entity.points[0]!, entity.points[1]!) < EPS * 10) add('ZERO_LENGTH', `${entity.name} 是零长度线`, [entity.id], 'error', entity.points[0])
    if (['circle', 'arc', 'ellipse'].includes(entity.kind) && (entity.radius ?? 0) <= EPS * 10) add('INVALID_RADIUS', `${entity.name} 的半径无效`, [entity.id], 'error', entity.center)
    const vertices = entityVertices(entity)
    for (let index = 1; index < vertices.length; index += 1) if (distance(vertices[index - 1]!, vertices[index]!) < EPS * 10) add('SHORT_EDGE', `${entity.name} 含有极短边`, [entity.id], 'warning', vertices[index])
    const normalized = JSON.stringify({ kind: entity.kind, points: vertices.map(point => [point.x.toFixed(6), point.y.toFixed(6)]), center: entity.center, radius: entity.radius })
    const duplicate = keyMap.get(normalized)
    if (duplicate) add('DUPLICATE', `${entity.name} 与另一对象重复`, [duplicate, entity.id], 'warning')
    else keyMap.set(normalized, entity.id)
    if (vertices.length >= 4 && (entity.closed || entity.kind === 'polyline')) {
      const segments = entitySegments(entity)
      for (let left = 0; left < segments.length; left += 1) for (let right = left + 2; right < segments.length; right += 1) {
        if (left === 0 && right === segments.length - 1) continue
        const point = segmentIntersection(segments[left]![0], segments[left]![1], segments[right]![0], segments[right]![1])
        if (point) add('SELF_INTERSECTION', `${entity.name} 存在自交`, [entity.id], 'error', point)
      }
    }
  }
  return diagnostics
}

export function closedProfileCount(entities: ModelingEntity[]) {
  return entities.filter(entity => !entity.construction && entity.visible && entityArea(entity) > EPS).length
}
