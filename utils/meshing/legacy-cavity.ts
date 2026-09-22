import type { MeshProject } from '~/types/meshing'

export type LegacyCavityCompatibility = { ok: false; reason: string } | { ok: true; reason: ''; widthMm: number; heightMm: number; nx: number; ny: number }

/** The current browser solver is structured and cannot consume a general unstructured mesh. */
export function checkLegacyCavityCompatibility(project: MeshProject | null): LegacyCavityCompatibility {
  const mesh = project?.result, face = project?.faces[0]
  if (!project || !mesh || !face) return { ok: false, reason: '尚未生成并接受网格。' }
  if (project.faces.length !== 1 || face.holeEdgeIds.length) return { ok: false, reason: '当前内置求解器仅支持单一、无孔矩形方腔。网格与命名可以继续保存和导出。' }
  if (project.settings.method !== 'mapped-quad' || face.outerEdgeIds.length !== 4 || mesh.cells.some(cell => cell.type !== 'quad')) return { ok: false, reason: '当前内置求解器需要四条直边组成的映射四边形网格。' }
  const edges = face.outerEdgeIds.map(id => project.edges.find(edge => edge.id === id)).filter(Boolean)
  if (edges.length !== 4 || edges.some(edge => edge!.points.length !== 2 || (Math.abs(edge!.points[0]!.x - edge!.points[1]!.x) > 1e-8 && Math.abs(edge!.points[0]!.y - edge!.points[1]!.y) > 1e-8))) return { ok: false, reason: '当前内置求解器只接受轴对齐矩形。' }
  const nx = project.settings.mappedNx + 1, ny = project.settings.mappedNy + 1
  if (nx < 33 || nx > 129 || ny < 33 || ny > 129 || mesh.cells.length !== project.settings.mappedNx * project.settings.mappedNy) return { ok: false, reason: '方腔求解器要求两个方向各 33–129 个节点，请调整映射网格分段。' }
  const points = edges.flatMap(edge => edge!.points)
  const widthMm = Math.max(...points.map(point => point.x)) - Math.min(...points.map(point => point.x))
  const heightMm = Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y))
  if (widthMm < 5 || widthMm > 200 || heightMm < 5 || heightMm > 150) return { ok: false, reason: '矩形尺寸超出当前方腔求解器支持范围。' }
  return { ok: true, reason: '', widthMm, heightMm, nx, ny }
}
