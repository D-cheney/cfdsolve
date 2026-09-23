import type { MeshBoundaryElement, MeshProject } from '~/types/meshing'
import type { PhysicsCase, PhysicsSolveResult } from '~/types/physics'
import { checkLegacyCavityCompatibility } from '~/utils/meshing/legacy-cavity'
import { solveTool } from '~/utils/solvers'
import { solveSolidFem } from '~/utils/solid-fem'

function interpolateProfile(profile: { x: number; pressure: number }[], x: number) {
  if (x <= profile[0]!.x) return profile[0]!.pressure
  if (x >= profile.at(-1)!.x) return profile.at(-1)!.pressure
  for (let index = 1; index < profile.length; index += 1) {
    const right = profile[index]!, left = profile[index - 1]!
    if (x <= right.x) {
      const ratio = (x - left.x) / Math.max(right.x - left.x, 1e-15)
      return left.pressure + ratio * (right.pressure - left.pressure)
    }
  }
  return profile.at(-1)!.pressure
}

function couplingElements(project: MeshProject, value: PhysicsCase) {
  const ids = new Set(value.boundaries.filter(item => item.type === 'fsi-interface').map(item => item.boundarySetId))
  return project.result!.boundaryElements.filter(element => ids.has(element.boundarySetId))
}

function pressureSolution(project: MeshProject, value: PhysicsCase, elements: MeshBoundaryElement[], displacement: Map<number, number>) {
  const meshNodes = new Map(project.result!.nodes.map(node => [node.id, node]))
  const unique = [...new Set(elements.flatMap(element => element.nodeIds))]
    .map(id => meshNodes.get(id)!)
    .sort((a, b) => a.x - b.x)
  if (unique.length < 2) throw new Error('流固接口至少需要两个网格节点。')
  const xSpan = (unique.at(-1)!.x - unique[0]!.x) * value.lengthScale
  const ySpan = (Math.max(...unique.map(node => node.y)) - Math.min(...unique.map(node => node.y))) * value.lengthScale
  if (xSpan <= Math.max(ySpan * 1.5, 1e-12)) throw new Error('内置薄通道耦合求解器要求流固接口主要沿 x 方向延伸。')
  const samples = unique.map(node => ({
    nodeId: node.id,
    x: (node.x - unique[0]!.x) * value.lengthScale,
    gap: value.fsi.referenceGap + value.fsi.deformationSign * (displacement.get(node.id) ?? 0),
  }))
  if (samples.some(item => item.gap <= value.fsi.referenceGap * .02)) throw new Error('流固耦合迭代检测到流道闭合，请降低压差或提高结构刚度。')
  let resistance = 0
  for (let index = 1; index < samples.length; index += 1) {
    const left = samples[index - 1]!, right = samples[index]!
    const gap = (left.gap + right.gap) / 2
    resistance += 12 * value.fluid.dynamicViscosity * (right.x - left.x) / gap ** 3
  }
  const flowRatePerDepth = (value.fsi.inletPressure - value.fsi.outletPressure) / resistance
  let pressure = value.fsi.inletPressure
  const profile = [{ nodeId: samples[0]!.nodeId, x: samples[0]!.x, pressure }]
  for (let index = 1; index < samples.length; index += 1) {
    const left = samples[index - 1]!, right = samples[index]!, gap = (left.gap + right.gap) / 2
    pressure -= 12 * value.fluid.dynamicViscosity * flowRatePerDepth * (right.x - left.x) / gap ** 3
    profile.push({ nodeId: right.nodeId, x: right.x, pressure })
  }
  profile.at(-1)!.pressure = value.fsi.outletPressure
  const pressureByElement = new Map<number, number>()
  for (const element of elements) {
    const a = meshNodes.get(element.nodeIds[0])!, b = meshNodes.get(element.nodeIds[1])!
    const x = ((a.x + b.x) / 2 - unique[0]!.x) * value.lengthScale
    pressureByElement.set(element.id, interpolateProfile(profile, x))
  }
  return { profile, pressureByElement, flowRatePerDepth, minimumGap: Math.min(...samples.map(item => item.gap)) }
}

function solveFsi(project: MeshProject, value: PhysicsCase) {
  const elements = couplingElements(project, value)
  if (!elements.length) throw new Error('未找到流固接口网格边。')
  let relaxed = new Map<number, number>(), lastSolid: ReturnType<typeof solveSolidFem> | null = null
  let lastPressure: ReturnType<typeof pressureSolution> | null = null
  const residuals: number[] = []
  const maximum = value.mode === 'fsi-one-way' ? 1 : value.fsi.maxCouplingIterations
  for (let iteration = 0; iteration < maximum; iteration += 1) {
    lastPressure = pressureSolution(project, value, elements, relaxed)
    lastSolid = solveSolidFem(project, value, { pressureByElement: lastPressure.pressureByElement })
    const vertical = new Map(lastSolid.nodes.map(node => [node.nodeId, node.uy]))
    let delta = 0
    const next = new Map<number, number>()
    for (const element of elements) for (const nodeId of element.nodeIds) {
      const oldValue = relaxed.get(nodeId) ?? 0, raw = vertical.get(nodeId) ?? 0
      const nextValue = value.mode === 'fsi-one-way' ? raw : oldValue + value.fsi.relaxation * (raw - oldValue)
      next.set(nodeId, nextValue)
      delta = Math.max(delta, Math.abs(nextValue - oldValue))
    }
    relaxed = next
    const normalized = delta / value.fsi.referenceGap
    residuals.push(normalized)
    if (value.mode === 'fsi-one-way' || normalized <= value.fsi.couplingTolerance) break
  }
  if (!lastSolid || !lastPressure) throw new Error('流固耦合没有生成结果。')
  return { solid: lastSolid, pressure: lastPressure, residuals }
}

export function solvePhysicsCase(project: MeshProject, value: PhysicsCase): PhysicsSolveResult {
  const started = Date.now(), warnings: string[] = []
  if (!project.result) throw new Error('缺少计算网格。')
  if (value.mode === 'fluid') {
    const compatibility = checkLegacyCavityCompatibility(project)
    if (!compatibility.ok) throw new Error(`${compatibility.reason} 通用流体网格请安装 OpenFOAM 后端。`)
    const moving = value.boundaries.find(item => item.type === 'moving-wall')
    if (!moving) throw new Error('内置方腔求解需要一个移动壁面。')
    const length = compatibility.heightMm * value.lengthScale
    const reynolds = value.fluid.density * Math.abs(moving.valueX) * length / value.fluid.dynamicViscosity
    const fluid = solveTool('lid-driven-cavity', {
      reynolds, nx: compatibility.nx, ny: compatibility.ny, lid_velocity: Math.abs(moving.valueX),
      max_iterations: value.solver.maxIterations, tolerance: value.solver.tolerance,
      pressure_relaxation: .3, velocity_relaxation: .7,
      aspect_ratio: compatibility.widthMm / compatibility.heightMm,
    }) as unknown as Record<string, unknown>
    return { mode: value.mode, engine: 'native-vorticity-streamfunction', converged: Boolean(fluid.converged), durationMs: Date.now() - started, warnings: (fluid.warnings as string[]) ?? [], fluid }
  }
  if (value.mode === 'solid') {
    const solid = solveSolidFem(project, value)
    if (!solid.converged) warnings.push(`结构线性方程残差 ${solid.residual.toExponential(2)} 未达到目标。`)
    return { mode: value.mode, engine: 'native-linear-triangle-fem', converged: solid.converged, durationMs: Date.now() - started, warnings, solid }
  }
  const coupled = solveFsi(project, value)
  const coupledConverged = value.mode === 'fsi-one-way' || coupled.residuals.at(-1)! <= value.fsi.couplingTolerance
  if (!coupledConverged) warnings.push('耦合迭代达到上限，位移残差尚未收敛。')
  return {
    mode: value.mode, engine: value.mode === 'fsi-one-way' ? 'native-one-way-thin-channel-fsi' : 'native-implicit-thin-channel-fsi',
    converged: coupled.solid.converged && coupledConverged, durationMs: Date.now() - started, warnings,
    solid: coupled.solid,
    fsi: { iterations: coupled.residuals.length, residuals: coupled.residuals, flowRatePerDepth: coupled.pressure.flowRatePerDepth, minimumGap: coupled.pressure.minimumGap, pressureProfile: coupled.pressure.profile },
  }
}
