import type { ModelingDocument, ModelingEntity, Vec2 } from '~/types/modeling'
import type { MeshBoundarySet, MeshCellZone, MeshProject, MeshTopologyEdge, MeshTopologyFace } from '~/types/meshing'
import { distance, entityArea, modelingEntityLength, modelingId, rectanglePoints, regularPolygonPoints } from '~/utils/modeling-geometry'
import polygonClipping, { type MultiPolygon, type Polygon, type Ring } from 'polygon-clipping'

const COLORS = ['#1677b8', '#e67e3f', '#4c9a73', '#8b69b6', '#c55663', '#778899', '#bea43b', '#2d9aa0']

function polylineLength(points: Vec2[]) {
  return points.slice(1).reduce((sum, point, index) => sum + distance(points[index]!, point), 0)
}

function sampleArc(center: Vec2, rx: number, ry: number, start: number, sweep: number, segments: number, rotation = 0) {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = start + sweep * index / segments
    const x = Math.cos(angle) * rx, y = Math.sin(angle) * ry
    return { x: center.x + x * Math.cos(rotation) - y * Math.sin(rotation), y: center.y + x * Math.sin(rotation) + y * Math.cos(rotation) }
  })
}

function entityEdges(entity: ModelingEntity, targetSize: number): Array<{ suffix: string; name: string; points: Vec2[] }> {
  const minSegments = Math.max(4, Math.ceil(modelingEntityLength(entity) / Math.max(targetSize, 0.1)))
  if (entity.kind === 'rectangle' && entity.points.length >= 2) {
    const points = rectanglePoints(entity.points[0]!, entity.points[1]!)
    return points.map((point, index) => ({ suffix: `${index}`, name: `${entity.name} · ${['下边', '右边', '上边', '左边'][index]}`, points: [point, points[(index + 1) % 4]!] }))
  }
  if (entity.kind === 'circle' && entity.center && entity.radius) {
    const perQuarter = Math.max(2, Math.ceil(minSegments / 4))
    return Array.from({ length: 4 }, (_, index) => ({ suffix: `${index}`, name: `${entity.name} · ${['右上', '左上', '左下', '右下'][index]}圆弧`, points: sampleArc(entity.center!, entity.radius!, entity.radius!, index * Math.PI / 2, Math.PI / 2, perQuarter) }))
  }
  if (entity.kind === 'ellipse' && entity.center && entity.radius && entity.radiusY) {
    const perQuarter = Math.max(3, Math.ceil(minSegments / 4))
    return Array.from({ length: 4 }, (_, index) => ({ suffix: `${index}`, name: `${entity.name} · ${index + 1}`, points: sampleArc(entity.center!, entity.radius!, entity.radiusY!, index * Math.PI / 2, Math.PI / 2, perQuarter, entity.rotation ?? 0) }))
  }
  if (entity.kind === 'polygon' && entity.center && entity.radius) {
    const points = regularPolygonPoints(entity.center, entity.radius, entity.sides ?? 6, entity.rotation)
    return points.map((point, index) => ({ suffix: `${index}`, name: `${entity.name} · 边 ${index + 1}`, points: [point, points[(index + 1) % points.length]!] }))
  }
  if (entity.kind === 'slot' && entity.points.length >= 2 && entity.radius) {
    const [a, b] = entity.points, angle = Math.atan2(b!.y - a!.y, b!.x - a!.x), normal = { x: -Math.sin(angle) * entity.radius, y: Math.cos(angle) * entity.radius }
    const p1 = { x: a!.x + normal.x, y: a!.y + normal.y }, p2 = { x: b!.x + normal.x, y: b!.y + normal.y }
    const p3 = { x: b!.x - normal.x, y: b!.y - normal.y }, p4 = { x: a!.x - normal.x, y: a!.y - normal.y }
    const semi = Math.max(4, Math.ceil(Math.PI * entity.radius / Math.max(targetSize, .1)))
    return [
      { suffix: '0', name: `${entity.name} · 上边`, points: [p1, p2] },
      { suffix: '1', name: `${entity.name} · 右圆弧`, points: sampleArc(b!, entity.radius, entity.radius, angle + Math.PI / 2, -Math.PI, semi) },
      { suffix: '2', name: `${entity.name} · 下边`, points: [p3, p4] },
      { suffix: '3', name: `${entity.name} · 左圆弧`, points: sampleArc(a!, entity.radius, entity.radius, angle - Math.PI / 2, -Math.PI, semi) },
    ]
  }
  const points = entity.points
  if (points.length >= 2) {
    const count = entity.closed ? points.length : points.length - 1
    return Array.from({ length: count }, (_, index) => ({ suffix: `${index}`, name: `${entity.name} · 边 ${index + 1}`, points: [points[index]!, points[(index + 1) % points.length]!] }))
  }
  return []
}

function loopEdges(entityIds: string[], document: ModelingDocument, faceId: string, targetSize: number, edgeMap: Map<string, MeshTopologyEdge>) {
  const ids: string[] = []
  for (const entityId of entityIds) {
    const source = document.entities.find(entity => entity.id === entityId)
    if (!source) continue
    for (const part of entityEdges(source, targetSize)) {
      const generatedId = `${source.id}:edge:${part.suffix}`
      const first = part.points[0], last = part.points.at(-1)
      const existing = [...edgeMap.values()].find(edge => {
        const edgeFirst = edge.points[0], edgeLast = edge.points.at(-1)
        if (!first || !last || !edgeFirst || !edgeLast || edge.points.length !== part.points.length) return false
        const forward = distance(first, edgeFirst) < 1e-8 && distance(last, edgeLast) < 1e-8
        const reverse = distance(first, edgeLast) < 1e-8 && distance(last, edgeFirst) < 1e-8
        return forward || reverse
      }) ?? edgeMap.get(generatedId)
      const id = existing?.id ?? generatedId
      if (existing) { if (!existing.faceIds.includes(faceId)) existing.faceIds.push(faceId) }
      else edgeMap.set(id, { id, sourceEntityId: source.id, name: part.name, points: part.points, length: polylineLength(part.points), faceIds: [faceId] })
      ids.push(id)
    }
  }
  return ids
}

function safeExportName(value: string, prefix: string, index: number) {
  const ascii = value.normalize('NFKD').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')
  return /^[A-Za-z_]/.test(ascii) ? ascii : `${prefix}_${index + 1}`
}

function faceRing(edgeIds: string[], edgeMap: Map<string, MeshTopologyEdge>): Ring {
  const ring: Ring = []
  for (const edgeId of edgeIds) {
    let points = edgeMap.get(edgeId)?.points ?? []
    const tail = ring.at(-1)
    if (tail && points.length > 1) {
      const first = points[0]!, last = points.at(-1)!
      if (Math.hypot(tail[0] - last.x, tail[1] - last.y) < Math.hypot(tail[0] - first.x, tail[1] - first.y)) points = [...points].reverse()
    }
    for (const point of points) {
      const pair: [number, number] = [point.x, point.y]
      const previous = ring.at(-1)
      if (!previous || Math.hypot(previous[0] - pair[0], previous[1] - pair[1]) > 1e-9) ring.push(pair)
    }
  }
  if (ring.length && (ring[0]![0] !== ring.at(-1)![0] || ring[0]![1] !== ring.at(-1)![1])) ring.push([...ring[0]!] as [number, number])
  return ring
}

function facePolygon(face: MeshTopologyFace, edgeMap: Map<string, MeshTopologyEdge>): Polygon {
  return [faceRing(face.outerEdgeIds, edgeMap), ...face.holeEdgeIds.map(ids => faceRing(ids, edgeMap))]
}

function ringArea(ring: Ring) {
  return Math.abs(ring.slice(0, -1).reduce((sum, point, index) => {
    const next = ring[index + 1]!
    return sum + point[0] * next[1] - next[0] * point[1]
  }, 0)) / 2
}

function multiPolygonArea(value: MultiPolygon) {
  return value.reduce((total, polygon) => total + Math.max(0, ringArea(polygon[0] ?? []) - polygon.slice(1).reduce((sum, ring) => sum + ringArea(ring), 0)), 0)
}

export function createMeshProject(document: ModelingDocument, previous?: MeshProject | null): MeshProject {
  const settings = previous?.settings ?? { method: 'tri' as const, targetSize: 5, minSize: 0.5, maxSize: 20, curvatureSegments: 24, mappedNx: 40, mappedNy: 20, smoothing: 5 }
  const edgeMap = new Map<string, MeshTopologyEdge>()
  const faces: MeshTopologyFace[] = document.regions.filter(region => region.valid).map(region => ({
    id: `face:${region.id}`,
    sourceRegionId: region.id,
    name: region.name,
    outerEdgeIds: loopEdges(region.outerEntityIds, document, `face:${region.id}`, settings.targetSize, edgeMap),
    holeEdgeIds: region.holeEntityIds.map(ids => loopEdges(ids, document, `face:${region.id}`, settings.targetSize, edgeMap)),
    area: region.area,
  })).filter(face => face.outerEdgeIds.length > 0)
  const edges = [...edgeMap.values()]
  const previousBoundaries = new Map((previous?.boundarySets ?? []).map(item => [item.id, item]))
  const assigned = new Set<string>()
  const boundarySets: MeshBoundarySet[] = []
  for (const item of previousBoundaries.values()) {
    const edgeIds = item.edgeIds.filter(id => edgeMap.has(id))
    if (edgeIds.length) { boundarySets.push({ ...item, edgeIds }); edgeIds.forEach(id => assigned.add(id)) }
  }
  edges.filter(edge => !assigned.has(edge.id)).forEach(edge => boundarySets.push({ id: modelingId('boundary'), name: edge.faceIds.length > 1 ? `${edge.name} · 接口` : edge.name, exportName: `boundary_${boundarySets.length + 1}`, semantic: edge.faceIds.length > 1 ? 'interface' : 'custom', color: COLORS[boundarySets.length % COLORS.length]!, edgeIds: [edge.id] }))
  const previousZones = previous?.cellZones ?? []
  const cellZones: MeshCellZone[] = faces.map((face, index) => {
    const old = previousZones.find(zone => zone.faceIds.includes(face.id))
    return old ? { ...old, faceIds: [face.id] } : { id: modelingId('zone'), name: face.name, exportName: safeExportName(face.name, 'zone', index), role: 'fluid', faceIds: [face.id] }
  })
  const edgeIds = new Set(edges.map(edge => edge.id))
  return { format: 'cfdrookie-mesh2d', schemaVersion: 1, id: previous?.id ?? modelingId('mesh'), documentId: document.id, sourceRevision: document.revision, updatedAt: new Date().toISOString(), edges, faces, boundarySets, cellZones, layers: (previous?.layers ?? []).filter(layer => boundarySets.some(set => set.id === layer.boundarySetId)), sizeControls: (previous?.sizeControls ?? []).map(control => ({ ...control, edgeIds: control.edgeIds.filter(id => edgeIds.has(id)) })).filter(control => control.edgeIds.length), settings, result: previous?.sourceRevision === document.revision ? previous.result : null }
}

export function meshProjectDiagnostics(project: MeshProject) {
  const issues: string[] = []
  if (!project.faces.length) issues.push('没有可划分的有效二维面域')
  const boundaryEdges = project.edges.filter(edge => edge.faceIds.length === 1)
  const counts = new Map<string, number>()
  project.boundarySets.flatMap(set => set.edgeIds).forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))
  const missing = boundaryEdges.filter(edge => !counts.has(edge.id))
  const duplicates = boundaryEdges.filter(edge => (counts.get(edge.id) ?? 0) > 1)
  if (missing.length) issues.push(`有 ${missing.length} 条外边界尚未命名`)
  if (duplicates.length) issues.push(`有 ${duplicates.length} 条外边界重复归属`)
  const faceAssigned = new Map<string, number>()
  project.cellZones.flatMap(zone => zone.faceIds).forEach(id => faceAssigned.set(id, (faceAssigned.get(id) ?? 0) + 1))
  const badFaces = project.faces.filter(face => faceAssigned.get(face.id) !== 1)
  if (badFaces.length) issues.push(`有 ${badFaces.length} 个面域未正确归属`)
  const exportNames = [...project.boundarySets.map(item => item.exportName), ...project.cellZones.map(item => item.exportName)]
  const invalidNames = exportNames.filter(name => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
  if (invalidNames.length) issues.push(`有 ${invalidNames.length} 个导出名称不符合字母、数字和下划线规则`)
  const duplicateNames = exportNames.filter((name, index) => exportNames.indexOf(name) !== index)
  if (duplicateNames.length) issues.push(`导出名称重复：${[...new Set(duplicateNames)].join('、')}`)
  const edgeMap = new Map(project.edges.map(edge => [edge.id, edge]))
  for (let left = 0; left < project.faces.length; left += 1) {
    for (let right = left + 1; right < project.faces.length; right += 1) {
      const a = project.faces[left]!, b = project.faces[right]!
      try {
        const overlapArea = multiPolygonArea(polygonClipping.intersection(facePolygon(a, edgeMap), facePolygon(b, edgeMap)))
        if (overlapArea > Math.max(1e-8, Math.min(a.area, b.area) * 1e-8)) issues.push(`面域“${a.name}”与“${b.name}”发生重叠，请返回建模重新生成区域`)
      } catch {
        issues.push(`面域“${a.name}”或“${b.name}”的轮廓无法完成拓扑检查`)
      }
    }
  }
  return issues
}
