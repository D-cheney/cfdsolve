import type { MeshCell, MeshNode, MeshQualitySummary } from '~/types/meshing'

type RawCell = Omit<MeshCell, 'quality' | 'area'>

const distance = (a: MeshNode, b: MeshNode) => Math.hypot(a.x - b.x, a.y - b.y)
const cross = (a: MeshNode, b: MeshNode, c: MeshNode) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

function angle(a: MeshNode, b: MeshNode, c: MeshNode) {
  const u = { x: a.x - b.x, y: a.y - b.y }, v = { x: c.x - b.x, y: c.y - b.y }
  const denominator = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)
  return denominator ? Math.acos(Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y) / denominator))) * 180 / Math.PI : 0
}

export function assessMesh(nodes: MeshNode[], rawCells: RawCell[]) {
  let minAngle = 180, maxAspectRatio = 1, invalidCells = 0, totalArea = 0
  const cells: MeshCell[] = rawCells.map(cell => {
    const points = cell.nodeIds.map(id => nodes[id]!).filter(Boolean)
    let area = 0, quality = 0
    if (points.length === 3) {
      const [a, b, c] = points
      area = cross(a!, b!, c!) / 2
      const lengths = [distance(a!, b!), distance(b!, c!), distance(c!, a!)]
      const angles = [angle(c!, a!, b!), angle(a!, b!, c!), angle(b!, c!, a!)]
      minAngle = Math.min(minAngle, ...angles)
      maxAspectRatio = Math.max(maxAspectRatio, Math.max(...lengths) / Math.max(Math.min(...lengths), 1e-14))
      quality = area > 0 ? 4 * Math.sqrt(3) * area / lengths.reduce((sum, value) => sum + value * value, 0) : 0
    } else if (points.length === 4) {
      const [a, b, c, d] = points
      area = (cross(a!, b!, c!) + cross(a!, c!, d!)) / 2
      const lengths = [distance(a!, b!), distance(b!, c!), distance(c!, d!), distance(d!, a!)]
      const angles = [angle(d!, a!, b!), angle(a!, b!, c!), angle(b!, c!, d!), angle(c!, d!, a!)]
      minAngle = Math.min(minAngle, ...angles)
      maxAspectRatio = Math.max(maxAspectRatio, Math.max(...lengths) / Math.max(Math.min(...lengths), 1e-14))
      const jacobians = [cross(a!, b!, d!), cross(b!, c!, a!), cross(c!, d!, b!), cross(d!, a!, c!)]
      quality = area > 0 ? Math.max(0, Math.min(...jacobians) / Math.max(...jacobians.map(Math.abs), 1e-14)) : 0
    }
    if (!(area > 1e-14) || !Number.isFinite(quality)) invalidCells += 1
    totalArea += Math.max(0, area)
    return { ...cell, area: Math.max(0, area), quality: Number.isFinite(quality) ? Math.max(0, Math.min(1, quality)) : 0 }
  })
  const qualities = cells.map(cell => cell.quality)
  const quality: MeshQualitySummary = {
    minQuality: qualities.length ? Math.min(...qualities) : 0,
    meanQuality: qualities.length ? qualities.reduce((sum, value) => sum + value, 0) / qualities.length : 0,
    minAngle: minAngle === 180 ? 0 : minAngle,
    maxAspectRatio,
    invalidCells,
    totalArea,
  }
  return { cells, quality }
}

export function meshSettingsHash(value: unknown) {
  const text = JSON.stringify(value)
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619)
  return (hash >>> 0).toString(16).padStart(8, '0')
}
