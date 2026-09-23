import type { MeshBoundaryElement, MeshCell, MeshProject } from '~/types/meshing'
import type { PhysicsCase, SolidCellResult, SolidNodeResult } from '~/types/physics'

type SparseRows = Map<number, Map<number, number>>
type Point = { id: number; x: number; y: number }
type Triangle = { cellId: number; nodeIds: [number, number, number] }

export interface SolidSolveOptions {
  pressureByElement?: Map<number, number>
}

export interface SolidFemResult {
  converged: boolean
  iterations: number
  residual: number
  nodes: SolidNodeResult[]
  cells: SolidCellResult[]
  maxDisplacement: number
  maxVonMises: number
  reactions: { nodeId: number; rx: number; ry: number }[]
}

function add(rows: SparseRows, i: number, j: number, value: number) {
  let row = rows.get(i)
  if (!row) { row = new Map(); rows.set(i, row) }
  row.set(j, (row.get(j) ?? 0) + value)
}

function trianglesForCell(cell: MeshCell): Triangle[] {
  if (cell.type === 'tri') return [{ cellId: cell.id, nodeIds: cell.nodeIds.slice(0, 3) as [number, number, number] }]
  return [
    { cellId: cell.id, nodeIds: [cell.nodeIds[0]!, cell.nodeIds[1]!, cell.nodeIds[2]!] },
    { cellId: cell.id, nodeIds: [cell.nodeIds[0]!, cell.nodeIds[2]!, cell.nodeIds[3]!] },
  ]
}

function constitutive(value: PhysicsCase) {
  const E = value.solid.youngModulus, nu = value.solid.poissonRatio
  if (value.solid.formulation === 'plane-strain') {
    const c = E / ((1 + nu) * (1 - 2 * nu))
    return [[c * (1 - nu), c * nu, 0], [c * nu, c * (1 - nu), 0], [0, 0, c * (1 - 2 * nu) / 2]]
  }
  const c = E / (1 - nu * nu)
  return [[c, c * nu, 0], [c * nu, c, 0], [0, 0, c * (1 - nu) / 2]]
}

function triangleData(points: [Point, Point, Point]) {
  const [a, b, c] = points
  const twiceArea = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
  const area = Math.abs(twiceArea) / 2
  if (area < 1e-18) throw new Error('固体网格包含零面积三角形。')
  const inv = 1 / twiceArea
  const b1 = b.y - c.y, b2 = c.y - a.y, b3 = a.y - b.y
  const c1 = c.x - b.x, c2 = a.x - c.x, c3 = b.x - a.x
  const B = [
    [b1 * inv, 0, b2 * inv, 0, b3 * inv, 0],
    [0, c1 * inv, 0, c2 * inv, 0, c3 * inv],
    [c1 * inv, b1 * inv, c2 * inv, b2 * inv, c3 * inv, b3 * inv],
  ]
  return { area, B }
}

function matrixVector(matrix: number[][], vector: number[]) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index]!, 0))
}

function elementStiffness(B: number[][], D: number[][], factor: number) {
  const DB = Array.from({ length: 3 }, (_, i) => Array.from({ length: 6 }, (_, j) => D[i]!.reduce((sum, value, k) => sum + value * B[k]![j]!, 0)))
  return Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => factor * B.reduce((sum, row, k) => sum + row[i]! * DB[k]![j]!, 0)))
}

function conjugateGradient(rows: SparseRows, rhs: number[], free: number[], maxIterations: number, tolerance: number) {
  const index = new Map(free.map((dof, i) => [dof, i]))
  const x = new Array(free.length).fill(0), b = free.map(dof => rhs[dof] ?? 0)
  const multiply = (v: number[]) => free.map(dof => {
    let sum = 0
    for (const [column, value] of rows.get(dof) ?? []) {
      const local = index.get(column)
      if (local !== undefined) sum += value * v[local]!
    }
    return sum
  })
  const diagonal = free.map(dof => Math.max(Math.abs(rows.get(dof)?.get(dof) ?? 0), 1e-30))
  let r = [...b], z = r.map((value, i) => value / diagonal[i]!), p = [...z]
  let rz = r.reduce((sum, value, i) => sum + value * z[i]!, 0)
  const normB = Math.max(Math.sqrt(b.reduce((sum, value) => sum + value * value, 0)), 1)
  let relative = Math.sqrt(r.reduce((sum, value) => sum + value * value, 0)) / normB
  let iteration = 0
  for (; iteration < maxIterations && relative > tolerance; iteration += 1) {
    const Ap = multiply(p)
    const denominator = p.reduce((sum, value, i) => sum + value * Ap[i]!, 0)
    if (!Number.isFinite(denominator) || denominator <= 1e-30) throw new Error('固体刚度矩阵不是正定矩阵，请检查约束和材料。')
    const alpha = rz / denominator
    for (let i = 0; i < x.length; i += 1) { x[i] += alpha * p[i]!; r[i] -= alpha * Ap[i]! }
    relative = Math.sqrt(r.reduce((sum, value) => sum + value * value, 0)) / normB
    if (relative <= tolerance) break
    z = r.map((value, i) => value / diagonal[i]!)
    const nextRz = r.reduce((sum, value, i) => sum + value * z[i]!, 0)
    const beta = nextRz / rz
    p = z.map((value, i) => value + beta * p[i]!)
    rz = nextRz
  }
  const full = new Array(rhs.length).fill(0)
  free.forEach((dof, i) => { full[dof] = x[i] })
  return { values: full, iterations: iteration + 1, residual: relative, converged: relative <= tolerance }
}

function boundaryNormal(project: MeshProject, element: MeshBoundaryElement, points: Map<number, Point>) {
  const a = points.get(element.nodeIds[0])!, b = points.get(element.nodeIds[1])!
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy)
  let nx = dy / length, ny = -dx / length
  const cell = project.result!.cells.find(item => item.nodeIds.includes(a.id) && item.nodeIds.includes(b.id) && item.nodeIds.every(id => points.has(id)))
  if (cell) {
    const centroid = cell.nodeIds.reduce((acc, id) => { const p = points.get(id)!; acc.x += p.x; acc.y += p.y; return acc }, { x: 0, y: 0 })
    centroid.x /= cell.nodeIds.length; centroid.y /= cell.nodeIds.length
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    if ((midpoint.x - centroid.x) * nx + (midpoint.y - centroid.y) * ny < 0) { nx *= -1; ny *= -1 }
  }
  return { nx, ny, length }
}

export function solveSolidFem(project: MeshProject, value: PhysicsCase, options: SolidSolveOptions = {}): SolidFemResult {
  const mesh = project.result
  if (!mesh) throw new Error('缺少计算网格。')
  const solidZones = new Set(project.cellZones.filter(zone => zone.role === 'solid').map(zone => zone.id))
  const cells = mesh.cells.filter(cell => solidZones.has(cell.zoneId))
  if (!cells.length) throw new Error('没有可计算的固体单元。')
  const usedNodeIds = new Set(cells.flatMap(cell => cell.nodeIds))
  const sourcePoints = new Map(mesh.nodes.filter(node => usedNodeIds.has(node.id)).map(node => [node.id, { id: node.id, x: node.x * value.lengthScale, y: node.y * value.lengthScale }]))
  const nodeIds = [...sourcePoints.keys()], nodeIndex = new Map(nodeIds.map((id, index) => [id, index]))
  const rows: SparseRows = new Map(), rhs = new Array(nodeIds.length * 2).fill(0)
  const D = constitutive(value), triangles = cells.flatMap(trianglesForCell)
  for (const triangle of triangles) {
    const points = triangle.nodeIds.map(id => sourcePoints.get(id)) as [Point, Point, Point]
    if (points.some(point => !point)) throw new Error('固体单元引用了缺失节点。')
    const { area, B } = triangleData(points), stiffness = elementStiffness(B, D, area * value.solid.thickness)
    const dofs = triangle.nodeIds.flatMap(id => { const i = nodeIndex.get(id)!; return [i * 2, i * 2 + 1] })
    for (let i = 0; i < 6; i += 1) for (let j = 0; j < 6; j += 1) add(rows, dofs[i]!, dofs[j]!, stiffness[i]![j]!)
  }

  const constrained = new Set<number>()
  for (const bc of value.boundaries) {
    const elements = mesh.boundaryElements.filter(element => element.boundarySetId === bc.boundarySetId && element.nodeIds.every(id => usedNodeIds.has(id)))
    const boundaryNodes = new Set(elements.flatMap(element => element.nodeIds))
    if (bc.type === 'fixed' || bc.type === 'roller-x') for (const id of boundaryNodes) constrained.add(nodeIndex.get(id)! * 2)
    if (bc.type === 'fixed' || bc.type === 'roller-y') for (const id of boundaryNodes) constrained.add(nodeIndex.get(id)! * 2 + 1)
    for (const element of elements) {
      const { nx, ny, length } = boundaryNormal(project, element, sourcePoints)
      let tx = 0, ty = 0
      const coupledPressure = options.pressureByElement?.get(element.id)
      if (coupledPressure !== undefined || bc.type === 'pressure-load') {
        const pressure = coupledPressure ?? bc.pressure
        tx = -pressure * nx; ty = -pressure * ny
      } else if (bc.type === 'traction') { tx = bc.valueX; ty = bc.valueY }
      const scale = length * value.solid.thickness / 2
      for (const id of element.nodeIds) {
        const i = nodeIndex.get(id)!
        rhs[i * 2] += tx * scale; rhs[i * 2 + 1] += ty * scale
      }
    }
  }
  if (!constrained.size) throw new Error('固体没有位移约束。')
  const free = Array.from({ length: rhs.length }, (_, index) => index).filter(index => !constrained.has(index))
  const solved = conjugateGradient(rows, rhs, free, value.solver.maxIterations, value.solver.tolerance)
  const nodes = nodeIds.map((nodeId, index) => {
    const ux = solved.values[index * 2]!, uy = solved.values[index * 2 + 1]!
    return { nodeId, ux, uy, magnitude: Math.hypot(ux, uy) }
  })
  const stressBuckets = new Map<number, number[][]>()
  for (const triangle of triangles) {
    const points = triangle.nodeIds.map(id => sourcePoints.get(id)) as [Point, Point, Point]
    const { B } = triangleData(points)
    const displacement = triangle.nodeIds.flatMap(id => { const i = nodeIndex.get(id)!; return [solved.values[i * 2]!, solved.values[i * 2 + 1]!] })
    const strain = matrixVector(B, displacement), stress = matrixVector(D, strain)
    const list = stressBuckets.get(triangle.cellId) ?? []; list.push(stress); stressBuckets.set(triangle.cellId, list)
  }
  const stresses: SolidCellResult[] = cells.map(cell => {
    const bucket = stressBuckets.get(cell.id)!, count = bucket.length
    const [stressX, stressY, shearXY] = [0, 1, 2].map(i => bucket.reduce((sum, item) => sum + item[i]!, 0) / count)
    const stressZ = value.solid.formulation === 'plane-strain' ? value.solid.poissonRatio * (stressX + stressY) : 0
    const vonMises = Math.sqrt(((stressX - stressY) ** 2 + (stressY - stressZ) ** 2 + (stressZ - stressX) ** 2) / 2 + 3 * shearXY ** 2)
    return { cellId: cell.id, stressX, stressY, stressZ, shearXY, vonMises }
  })
  const reactions = nodeIds.filter((_, index) => constrained.has(index * 2) || constrained.has(index * 2 + 1)).map((nodeId, indexInList) => {
    const nodePosition = nodeIndex.get(nodeId)!, force = [0, 0]
    for (let component = 0; component < 2; component += 1) {
      const dof = nodePosition * 2 + component
      force[component] = [...(rows.get(dof) ?? [])].reduce((sum, [column, stiffness]) => sum + stiffness * solved.values[column]!, 0) - rhs[dof]!
    }
    return { nodeId, rx: force[0]!, ry: force[1]! }
  })
  return {
    converged: solved.converged, iterations: solved.iterations, residual: solved.residual, nodes, cells: stresses,
    maxDisplacement: Math.max(...nodes.map(node => node.magnitude)),
    maxVonMises: Math.max(...stresses.map(cell => cell.vonMises)), reactions,
  }
}
