export type SketchPoint = { x: number; y: number }

export type SketchEntityType = 'line' | 'rectangle' | 'circle' | 'arc' | 'polygon'

export interface SketchEntity {
  id: string
  type: SketchEntityType
  x1: number
  y1: number
  x2?: number
  y2?: number
  radius?: number
  startAngle?: number
  endAngle?: number
  sides?: number
  role: 'domain' | 'reference'
  construction: boolean
  locked: boolean
  constraints: string[]
}

export interface SnapOptions {
  grid: boolean
  objects: boolean
  angle: boolean
  gridSize: number
  tolerance: number
  anchor?: SketchPoint | null
}

export interface SnapResult extends SketchPoint {
  kind: 'free' | 'grid' | 'endpoint' | 'midpoint' | 'center' | 'angle'
  label: string
}

const pointDistance = (a: SketchPoint, b: SketchPoint) => Math.hypot(a.x - b.x, a.y - b.y)
const toRadians = (degrees: number) => degrees * Math.PI / 180
const toDegrees = (radians: number) => radians * 180 / Math.PI

export function cloneSketchEntity(entity: SketchEntity): SketchEntity {
  return { ...entity, constraints: [...entity.constraints] }
}

export function cloneSketchEntities(entities: SketchEntity[]) {
  return entities.map(cloneSketchEntity)
}

export function rectangleBounds(entity: SketchEntity) {
  const x2 = entity.x2 ?? entity.x1
  const y2 = entity.y2 ?? entity.y1
  return {
    x: Math.min(entity.x1, x2),
    y: Math.min(entity.y1, y2),
    width: Math.abs(x2 - entity.x1),
    height: Math.abs(y2 - entity.y1),
  }
}

export function polygonPoints(entity: SketchEntity): SketchPoint[] {
  const sides = Math.max(3, Math.min(32, Math.round(entity.sides ?? 6)))
  const radius = Math.max(0, entity.radius ?? 0)
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / sides
    return { x: entity.x1 + Math.cos(angle) * radius, y: entity.y1 + Math.sin(angle) * radius }
  })
}

export function entitySnapPoints(entity: SketchEntity) {
  const points: Array<SketchPoint & { kind: 'endpoint' | 'midpoint' | 'center' }> = []
  if (entity.type === 'line') {
    const end = { x: entity.x2 ?? entity.x1, y: entity.y2 ?? entity.y1 }
    points.push({ x: entity.x1, y: entity.y1, kind: 'endpoint' })
    points.push({ ...end, kind: 'endpoint' })
    points.push({ x: (entity.x1 + end.x) / 2, y: (entity.y1 + end.y) / 2, kind: 'midpoint' })
  } else if (entity.type === 'rectangle') {
    const bounds = rectangleBounds(entity)
    const corners = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height },
    ]
    points.push(...corners.map(point => ({ ...point, kind: 'endpoint' as const })))
    points.push({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, kind: 'center' })
  } else if (entity.type === 'polygon') {
    points.push(...polygonPoints(entity).map(point => ({ ...point, kind: 'endpoint' as const })))
    points.push({ x: entity.x1, y: entity.y1, kind: 'center' })
  } else {
    points.push({ x: entity.x1, y: entity.y1, kind: 'center' })
    if (entity.type === 'arc') {
      const radius = entity.radius ?? 0
      for (const angle of [entity.startAngle ?? 0, entity.endAngle ?? 0]) {
        points.push({ x: entity.x1 + Math.cos(angle) * radius, y: entity.y1 + Math.sin(angle) * radius, kind: 'endpoint' })
      }
    }
  }
  return points
}

export function snapSketchPoint(raw: SketchPoint, entities: SketchEntity[], options: SnapOptions): SnapResult {
  if (options.objects) {
    let nearest: (SketchPoint & { kind: 'endpoint' | 'midpoint' | 'center'; distance: number }) | null = null
    for (const entity of entities) {
      for (const candidate of entitySnapPoints(entity)) {
        const distance = pointDistance(raw, candidate)
        if (distance <= options.tolerance && (!nearest || distance < nearest.distance)) nearest = { ...candidate, distance }
      }
    }
    if (nearest) {
      const labels = { endpoint: '端点', midpoint: '中点', center: '圆心/中心' }
      return { x: nearest.x, y: nearest.y, kind: nearest.kind, label: labels[nearest.kind] }
    }
  }

  if (options.angle && options.anchor) {
    const dx = raw.x - options.anchor.x
    const dy = raw.y - options.anchor.y
    const distance = Math.hypot(dx, dy)
    if (distance > 0) {
      const angle = Math.atan2(dy, dx)
      const snappedAngle = Math.round(angle / toRadians(15)) * toRadians(15)
      const angularDifference = Math.abs(Math.atan2(Math.sin(angle - snappedAngle), Math.cos(angle - snappedAngle)))
      if (angularDifference < toRadians(4)) {
        return {
          x: options.anchor.x + Math.cos(snappedAngle) * distance,
          y: options.anchor.y + Math.sin(snappedAngle) * distance,
          kind: 'angle',
          label: `${Math.round(toDegrees(snappedAngle))}°`,
        }
      }
    }
  }

  if (options.grid) {
    return {
      x: Math.round(raw.x / options.gridSize) * options.gridSize,
      y: Math.round(raw.y / options.gridSize) * options.gridSize,
      kind: 'grid',
      label: '网格',
    }
  }
  return { ...raw, kind: 'free', label: '自由点' }
}

export function entityLength(entity: SketchEntity) {
  if (entity.type === 'line') return Math.hypot((entity.x2 ?? entity.x1) - entity.x1, (entity.y2 ?? entity.y1) - entity.y1)
  if (entity.type === 'circle') return Math.PI * 2 * (entity.radius ?? 0)
  if (entity.type === 'arc') {
    let sweep = (entity.endAngle ?? 0) - (entity.startAngle ?? 0)
    if (sweep < 0) sweep += Math.PI * 2
    return (entity.radius ?? 0) * sweep
  }
  if (entity.type === 'polygon') return 2 * (entity.sides ?? 6) * (entity.radius ?? 0) * Math.sin(Math.PI / (entity.sides ?? 6))
  const bounds = rectangleBounds(entity)
  return 2 * (bounds.width + bounds.height)
}

export function entityCenter(entity: SketchEntity): SketchPoint {
  if (entity.type === 'line') return { x: (entity.x1 + (entity.x2 ?? entity.x1)) / 2, y: (entity.y1 + (entity.y2 ?? entity.y1)) / 2 }
  if (entity.type === 'rectangle') {
    const bounds = rectangleBounds(entity)
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
  }
  return { x: entity.x1, y: entity.y1 }
}

export function translateEntity(entity: SketchEntity, dx: number, dy: number) {
  const moved = cloneSketchEntity(entity)
  moved.x1 += dx
  moved.y1 += dy
  if (moved.x2 !== undefined) moved.x2 += dx
  if (moved.y2 !== undefined) moved.y2 += dy
  return moved
}

export function mirrorEntity(entity: SketchEntity, axis: 'horizontal' | 'vertical', coordinate: number) {
  const mirrored = cloneSketchEntity(entity)
  if (axis === 'horizontal') {
    mirrored.y1 = coordinate * 2 - mirrored.y1
    if (mirrored.y2 !== undefined) mirrored.y2 = coordinate * 2 - mirrored.y2
    if (mirrored.type === 'arc') {
      mirrored.startAngle = -(mirrored.startAngle ?? 0)
      mirrored.endAngle = -(mirrored.endAngle ?? 0)
    }
  } else {
    mirrored.x1 = coordinate * 2 - mirrored.x1
    if (mirrored.x2 !== undefined) mirrored.x2 = coordinate * 2 - mirrored.x2
    if (mirrored.type === 'arc') {
      mirrored.startAngle = Math.PI - (mirrored.startAngle ?? 0)
      mirrored.endAngle = Math.PI - (mirrored.endAngle ?? 0)
    }
  }
  return mirrored
}

export function rotateEntity(entity: SketchEntity, center: SketchPoint, degrees: number) {
  const radians = toRadians(degrees)
  const rotatePoint = (point: SketchPoint) => {
    const dx = point.x - center.x
    const dy = point.y - center.y
    return { x: center.x + dx * Math.cos(radians) - dy * Math.sin(radians), y: center.y + dx * Math.sin(radians) + dy * Math.cos(radians) }
  }
  const rotated = cloneSketchEntity(entity)
  const start = rotatePoint({ x: entity.x1, y: entity.y1 })
  rotated.x1 = start.x
  rotated.y1 = start.y
  if (entity.x2 !== undefined && entity.y2 !== undefined) {
    const end = rotatePoint({ x: entity.x2, y: entity.y2 })
    rotated.x2 = end.x
    rotated.y2 = end.y
  }
  if (entity.type === 'arc') {
    rotated.startAngle = (entity.startAngle ?? 0) + radians
    rotated.endAngle = (entity.endAngle ?? 0) + radians
  }
  return rotated
}

export function offsetEntity(entity: SketchEntity, distance: number) {
  const offset = cloneSketchEntity(entity)
  if (entity.type === 'line') {
    const dx = (entity.x2 ?? entity.x1) - entity.x1
    const dy = (entity.y2 ?? entity.y1) - entity.y1
    const length = Math.hypot(dx, dy) || 1
    return translateEntity(offset, -dy / length * distance, dx / length * distance)
  }
  if (entity.type === 'rectangle') {
    const bounds = rectangleBounds(entity)
    offset.x1 = bounds.x - distance
    offset.y1 = bounds.y - distance
    offset.x2 = bounds.x + bounds.width + distance
    offset.y2 = bounds.y + bounds.height + distance
    return offset
  }
  offset.radius = Math.max(0.5, (entity.radius ?? 0) + distance)
  return offset
}

function pointKey(point: SketchPoint, tolerance: number) {
  return `${Math.round(point.x / tolerance)},${Math.round(point.y / tolerance)}`
}

export function countClosedProfiles(entities: SketchEntity[], tolerance = 0.5) {
  let profiles = entities.filter(entity => !entity.construction && ['rectangle', 'circle', 'polygon'].includes(entity.type)).length
  const lines = entities.filter(entity => entity.type === 'line' && !entity.construction)
  if (!lines.length) return profiles

  const adjacency = new Map<string, Set<string>>()
  for (const line of lines) {
    const a = pointKey({ x: line.x1, y: line.y1 }, tolerance)
    const b = pointKey({ x: line.x2 ?? line.x1, y: line.y2 ?? line.y1 }, tolerance)
    if (a === b) continue
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    if (!adjacency.has(b)) adjacency.set(b, new Set())
    adjacency.get(a)!.add(b)
    adjacency.get(b)!.add(a)
  }
  const visited = new Set<string>()
  for (const start of adjacency.keys()) {
    if (visited.has(start)) continue
    let vertices = 0
    let degreeSum = 0
    const stack = [start]
    while (stack.length) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      vertices += 1
      const neighbours = adjacency.get(current) ?? new Set()
      degreeSum += neighbours.size
      for (const next of neighbours) if (!visited.has(next)) stack.push(next)
    }
    const edges = degreeSum / 2
    profiles += Math.max(0, edges - vertices + 1)
  }
  return profiles
}

function cross(a: SketchPoint, b: SketchPoint) {
  return a.x * b.y - a.y * b.x
}

export function lineIntersection(first: SketchEntity, second: SketchEntity) {
  if (first.type !== 'line' || second.type !== 'line') return null
  const p = { x: first.x1, y: first.y1 }
  const r = { x: (first.x2 ?? first.x1) - first.x1, y: (first.y2 ?? first.y1) - first.y1 }
  const q = { x: second.x1, y: second.y1 }
  const s = { x: (second.x2 ?? second.x1) - second.x1, y: (second.y2 ?? second.y1) - second.y1 }
  const denominator = cross(r, s)
  if (Math.abs(denominator) < 1e-9) return null
  const qp = { x: q.x - p.x, y: q.y - p.y }
  const t = cross(qp, s) / denominator
  const u = cross(qp, r) / denominator
  if (t <= 1e-6 || t >= 1 - 1e-6 || u < -1e-6 || u > 1 + 1e-6) return null
  return { x: p.x + t * r.x, y: p.y + t * r.y, t }
}

export function trimLineAtPoint(target: SketchEntity, others: SketchEntity[], click: SketchPoint) {
  if (target.type !== 'line') return []
  const intersections = others
    .filter(entity => entity.id !== target.id)
    .map(entity => lineIntersection(target, entity))
    .filter((point): point is SketchPoint & { t: number } => Boolean(point))
    .sort((a, b) => a.t - b.t)
  const x2 = target.x2 ?? target.x1
  const y2 = target.y2 ?? target.y1
  const dx = x2 - target.x1
  const dy = y2 - target.y1
  const lengthSquared = dx * dx + dy * dy || 1
  const clickT = Math.max(0, Math.min(1, ((click.x - target.x1) * dx + (click.y - target.y1) * dy) / lengthSquared))
  const cuts = [0, ...intersections.map(point => point.t), 1]
  let removeIndex = 0
  for (let index = 0; index < cuts.length - 1; index++) if (clickT >= cuts[index] && clickT <= cuts[index + 1]) removeIndex = index
  const result: SketchEntity[] = []
  for (let index = 0; index < cuts.length - 1; index++) {
    if (index === removeIndex || cuts[index + 1] - cuts[index] < 1e-6) continue
    const startT = cuts[index]
    const endT = cuts[index + 1]
    result.push({
      ...cloneSketchEntity(target),
      id: `${target.id}-trim-${index}`,
      x1: target.x1 + dx * startT,
      y1: target.y1 + dy * startT,
      x2: target.x1 + dx * endT,
      y2: target.y1 + dy * endT,
      role: 'reference',
    })
  }
  return result
}
