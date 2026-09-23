import type { PhysicsSolveResult, SolidCellResult, SolidNodeResult } from '../types/physics'

export type SolidFieldKey = keyof Pick<SolidCellResult, 'vonMises' | 'stressX' | 'stressY' | 'stressZ' | 'shearXY'>
  | keyof Pick<SolidNodeResult, 'magnitude' | 'ux' | 'uy'>
export type FluidFieldKey = 'speed' | 'u' | 'v'

export const solidFields: { key: SolidFieldKey; label: string; unit: string; location: 'cell' | 'node' }[] = [
  { key: 'vonMises', label: '等效应力', unit: 'Pa', location: 'cell' },
  { key: 'stressX', label: 'X 向正应力', unit: 'Pa', location: 'cell' },
  { key: 'stressY', label: 'Y 向正应力', unit: 'Pa', location: 'cell' },
  { key: 'stressZ', label: 'Z 向正应力', unit: 'Pa', location: 'cell' },
  { key: 'shearXY', label: 'XY 剪应力', unit: 'Pa', location: 'cell' },
  { key: 'magnitude', label: '位移幅值', unit: 'm', location: 'node' },
  { key: 'ux', label: 'X 向位移', unit: 'm', location: 'node' },
  { key: 'uy', label: 'Y 向位移', unit: 'm', location: 'node' },
]
export const fluidFields: { key: FluidFieldKey; label: string; unit: string }[] = [
  { key: 'speed', label: '速度幅值', unit: 'm/s' },
  { key: 'u', label: 'X 向速度', unit: 'm/s' },
  { key: 'v', label: 'Y 向速度', unit: 'm/s' },
]

export interface CavityField {
  nx: number
  ny: number
  u: number[]
  v: number[]
  speed: number[]
  lidVelocity: number
  residuals: { iteration: number; value: number }[]
}

// The cavity solver stores velocity normalized by the moving-wall speed.
export function readCavityField(result: PhysicsSolveResult, wallVelocity: number): CavityField | null {
  const raw = result.fluid as Record<string, unknown> | undefined
  const field = raw?.field as Record<string, unknown> | undefined
  const nx = Number(field?.nx), ny = Number(field?.ny)
  if (!Number.isInteger(nx) || !Number.isInteger(ny) || nx < 2 || ny < 2 || nx * ny > 100000) return null
  const arrays = [field?.u, field?.v, field?.speed]
  if (arrays.some(value => !Array.isArray(value) || value.length !== nx * ny || value.some(item => typeof item !== 'number' || !Number.isFinite(item)))) return null
  const x = raw?.x, y = raw?.series
  const residuals = Array.isArray(x) && Array.isArray(y) && x.length === y.length
    ? x.map((iteration, index) => ({ iteration: Number(iteration), value: Number(y[index]) })).filter(item => Number.isFinite(item.iteration) && Number.isFinite(item.value))
    : []
  return {
    nx, ny, u: field!.u as number[], v: field!.v as number[], speed: field!.speed as number[],
    lidVelocity: Math.abs(wallVelocity), residuals,
  }
}

export function finiteRange(values: number[]) {
  let min = Infinity, max = -Infinity
  for (const value of values) if (Number.isFinite(value)) { min = Math.min(min, value); max = Math.max(max, value) }
  return Number.isFinite(min) ? { min, max } : { min: 0, max: 0 }
}

export function encodeFieldCsv(idLabel: 'node_id' | 'cell_id' | 'sample_index', field: string, unit: string, rows: Array<[number, number]>) {
  return `\uFEFF${idLabel},${field},unit\n${rows.map(([id, value]) => `${id},${value},${unit}`).join('\n')}`
}
