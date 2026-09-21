import { SolverInputError } from './solvers'

export interface CfdModelSetup {
  name: string
  width: number
  height: number
  density: number
  viscosity: number
}

export interface CfdMeshSetup {
  nx: number
  ny: number
}

export interface CfdBoundarySetup {
  lidVelocity: number
  pressureReference: number
}

export interface CfdSolverSetup {
  maxIterations: number
  tolerance: number
  pressureRelaxation: number
  velocityRelaxation: number
}

export interface CfdWorkbenchSetup {
  model: CfdModelSetup
  mesh: CfdMeshSetup
  boundary: CfdBoundarySetup
  solver: CfdSolverSetup
}

export const defaultCfdWorkbenchSetup = (): CfdWorkbenchSetup => ({
  model: {
    name: '二维方腔顶盖驱动流',
    width: 0.1,
    height: 0.1,
    density: 1000,
    viscosity: 0.01,
  },
  mesh: {
    nx: 65,
    ny: 65,
  },
  boundary: {
    lidVelocity: 0.01,
    pressureReference: 0,
  },
  solver: {
    maxIterations: 5000,
    tolerance: 1e-5,
    pressureRelaxation: 0.3,
    velocityRelaxation: 0.7,
  },
})

function finite(value: unknown, label: string, min: number, max: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) throw new SolverInputError(`${label}必须是有限数值。`)
  if (number < min || number > max) throw new SolverInputError(`${label}应在 ${min}–${max} 之间。`)
  return number
}

function integer(value: unknown, label: string, min: number, max: number) {
  const number = finite(value, label, min, max)
  if (!Number.isInteger(number)) throw new SolverInputError(`${label}必须是整数。`)
  return number
}

export function reynoldsNumber(setup: Pick<CfdWorkbenchSetup, 'model' | 'boundary'>) {
  return setup.model.density * setup.boundary.lidVelocity * setup.model.height / setup.model.viscosity
}

export function meshMetrics(setup: Pick<CfdWorkbenchSetup, 'model' | 'mesh'>) {
  const dx = setup.model.width / (setup.mesh.nx - 1)
  const dy = setup.model.height / (setup.mesh.ny - 1)
  return {
    cells: (setup.mesh.nx - 1) * (setup.mesh.ny - 1),
    nodes: setup.mesh.nx * setup.mesh.ny,
    dx,
    dy,
    aspectRatio: Math.max(dx / dy, dy / dx),
  }
}

export function validateCfdWorkbench(setup: CfdWorkbenchSetup) {
  if (!setup.model.name.trim()) throw new SolverInputError('算例名称不能为空。')
  finite(setup.model.width, '计算域宽度', 0.005, 0.2)
  finite(setup.model.height, '计算域高度', 0.005, 0.15)
  finite(setup.model.density, '流体密度', 0.001, 20000)
  finite(setup.model.viscosity, '动力黏度', 1e-7, 1000)
  integer(setup.mesh.nx, 'x 方向节点数', 33, 129)
  integer(setup.mesh.ny, 'y 方向节点数', 33, 129)
  finite(setup.boundary.lidVelocity, '顶盖速度', 0.01, 100)
  finite(setup.boundary.pressureReference, '参考压力', -1e9, 1e9)
  integer(setup.solver.maxIterations, '最大迭代数', 100, 20000)
  finite(setup.solver.tolerance, '收敛容差', 1e-8, 1e-3)
  finite(setup.solver.pressureRelaxation, '流函数松弛因子', 0.1, 0.8)
  finite(setup.solver.velocityRelaxation, '速度松弛因子', 0.1, 1)
  const re = reynoldsNumber(setup)
  if (re < 10 || re > 1000) throw new SolverInputError(`当前浏览器求解器支持 Re=10–1000，现为 ${re.toFixed(1)}。`)
  const quality = meshMetrics(setup)
  if (quality.aspectRatio > 5) throw new SolverInputError('网格纵横比超过 5，请调整两个方向的节点数。')
  return { reynolds: re, ...quality }
}

export function buildCavitySolverInput(setup: CfdWorkbenchSetup) {
  const validated = validateCfdWorkbench(setup)
  return {
    reynolds: validated.reynolds,
    nx: setup.mesh.nx,
    ny: setup.mesh.ny,
    lid_velocity: setup.boundary.lidVelocity,
    max_iterations: setup.solver.maxIterations,
    tolerance: setup.solver.tolerance,
    pressure_relaxation: setup.solver.pressureRelaxation,
    velocity_relaxation: setup.solver.velocityRelaxation,
    aspect_ratio: setup.model.width / setup.model.height,
  }
}

export function buildCfdCaseManifest(setup: CfdWorkbenchSetup, result: Record<string, unknown>) {
  const quality = validateCfdWorkbench(setup)
  return {
    format: 'cfdrookie-case/1.0',
    generatedAt: new Date().toISOString(),
    model: {
      ...setup.model,
      physics: '二维稳态不可压缩层流',
      equations: ['continuity', 'momentum-x', 'momentum-y'],
    },
    mesh: { ...setup.mesh, topology: 'structured-orthogonal', ...meshMetrics(setup) },
    boundaries: {
      top: { type: 'moving-wall', velocity: [setup.boundary.lidVelocity, 0] },
      left: { type: 'no-slip-wall', velocity: [0, 0] },
      right: { type: 'no-slip-wall', velocity: [0, 0] },
      bottom: { type: 'no-slip-wall', velocity: [0, 0] },
      pressureReference: setup.boundary.pressureReference,
    },
    numerics: { ...setup.solver, formulation: 'vorticity-streamfunction' },
    derived: quality,
    result,
  }
}
