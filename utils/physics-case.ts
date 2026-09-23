import type { MeshProject } from '~/types/meshing'
import type { AnalysisMode, BoundaryConditionType, PhysicsCase, PhysicsDiagnostic } from '~/types/physics'
import { checkLegacyCavityCompatibility } from '~/utils/meshing/legacy-cavity'

const fluidTypes: BoundaryConditionType[] = ['wall', 'moving-wall', 'velocity-inlet', 'pressure-inlet', 'pressure-outlet', 'symmetry']
const solidTypes: BoundaryConditionType[] = ['fixed', 'roller-x', 'roller-y', 'traction', 'pressure-load', 'free']

function defaultBoundaryType(semantic: string, mode: AnalysisMode): BoundaryConditionType {
  if (semantic === 'interface' && mode.startsWith('fsi')) return 'fsi-interface'
  if (mode === 'solid') return semantic === 'wall' ? 'fixed' : 'free'
  if (semantic === 'inlet') return 'velocity-inlet'
  if (semantic === 'outlet') return 'pressure-outlet'
  if (semantic === 'symmetry') return 'symmetry'
  return 'wall'
}

export function createPhysicsCase(project: MeshProject, previous?: PhysicsCase | null): PhysicsCase {
  const mode = previous?.mode ?? (project.cellZones.some(zone => zone.role === 'solid') ? 'solid' : 'fluid')
  const old = new Map(previous?.boundaries.map(item => [item.boundarySetId, item]))
  return {
    format: 'cfdrookie-physics2d', schemaVersion: 1,
    id: previous?.id ?? `physics-${project.id}`,
    name: previous?.name ?? '二维多物理场算例', mode, meshProjectId: project.id,
    lengthScale: previous?.lengthScale ?? .001,
    fluid: previous?.fluid ?? { density: 1.225, dynamicViscosity: 1.789e-5 },
    solid: previous?.solid ?? { youngModulus: 2.1e11, poissonRatio: .3, density: 7850, thickness: .001, formulation: 'plane-stress' },
    boundaries: project.boundarySets.map(set => old.get(set.id) ?? {
      boundarySetId: set.id, type: defaultBoundaryType(set.semantic, mode), valueX: set.semantic === 'inlet' ? 1 : 0, valueY: 0, pressure: 0,
    }),
    fsi: previous?.fsi ?? { referenceGap: .01, inletPressure: 1000, outletPressure: 0, deformationSign: 1, maxCouplingIterations: 50, couplingTolerance: 1e-6, relaxation: .35 },
    solver: previous?.solver ?? { engine: 'native', maxIterations: 2000, tolerance: 1e-7 },
  }
}

export function changePhysicsMode(value: PhysicsCase, project: MeshProject, mode: AnalysisMode) {
  value.mode = mode
  for (const boundary of value.boundaries) {
    const set = project.boundarySets.find(item => item.id === boundary.boundarySetId)
    boundary.type = defaultBoundaryType(set?.semantic ?? 'custom', mode)
  }
}

export function boundaryTypesForMode(mode: AnalysisMode): BoundaryConditionType[] {
  return mode === 'solid' ? solidTypes : mode.startsWith('fsi') ? [...new Set([...fluidTypes, ...solidTypes, 'fsi-interface' as const])] : fluidTypes
}

export function validatePhysicsCase(project: MeshProject | null, value: PhysicsCase | null): PhysicsDiagnostic[] {
  const issues: PhysicsDiagnostic[] = []
  if (!project?.result) return [{ level: 'error', code: 'MESH_MISSING', message: '请先生成并接受网格。' }]
  if (!value) return [{ level: 'error', code: 'CASE_MISSING', message: '物理算例尚未初始化。' }]
  if (project.result.geometryRevision !== project.sourceRevision) issues.push({ level: 'error', code: 'MESH_STALE', message: '几何已变化，请重新生成网格。' })
  if (project.result.quality.invalidCells) issues.push({ level: 'error', code: 'MESH_INVALID', message: `网格包含 ${project.result.quality.invalidCells} 个无效单元。` })
  if (value.lengthScale <= 0) issues.push({ level: 'error', code: 'SCALE', message: '长度换算系数必须大于零。' })
  if (value.fluid.density <= 0 || value.fluid.dynamicViscosity <= 0) issues.push({ level: 'error', code: 'FLUID_MATERIAL', message: '流体密度和动力黏度必须大于零。' })
  if (value.solid.youngModulus <= 0 || value.solid.poissonRatio <= -.99 || value.solid.poissonRatio >= .499 || value.solid.thickness <= 0) issues.push({ level: 'error', code: 'SOLID_MATERIAL', message: '固体材料参数无效：请检查弹性模量、泊松比与厚度。' })
  if (value.boundaries.length !== project.boundarySets.length) issues.push({ level: 'error', code: 'BOUNDARY_SYNC', message: '边界设置与当前网格命名不一致，请重新同步。' })
  if (value.mode === 'solid' || value.mode.startsWith('fsi')) {
    if (!project.cellZones.some(zone => zone.role === 'solid')) issues.push({ level: 'error', code: 'SOLID_ZONE', message: '至少需要一个角色为“固体”的面域。' })
    if (!value.boundaries.some(item => ['fixed', 'roller-x', 'roller-y'].includes(item.type))) issues.push({ level: 'error', code: 'RIGID_BODY', message: '固体缺少位移约束，会产生刚体运动。' })
  }
  if (value.mode === 'fluid' || value.mode.startsWith('fsi')) {
    if (!project.cellZones.some(zone => zone.role === 'fluid')) issues.push({ level: 'warning', code: 'FLUID_ZONE', message: '没有标记为“流体”的面域；本地固体/FSI 求解仍可运行，但通用流体域导出会被阻止。' })
  }
  if (value.mode.startsWith('fsi')) {
    if (!value.boundaries.some(item => item.type === 'fsi-interface')) issues.push({ level: 'error', code: 'FSI_INTERFACE', message: '流固耦合算例至少需要一个“流固接口”边界。' })
    if (value.fsi.referenceGap <= 0 || value.fsi.inletPressure <= value.fsi.outletPressure) issues.push({ level: 'error', code: 'FSI_CONTROL', message: '参考流道高度必须为正，入口压力必须高于出口压力。' })
  }
  if (value.mode === 'fluid' && project.result) {
    const compatibility = checkLegacyCavityCompatibility(project)
    if (!compatibility.ok) issues.push({ level: 'error', code: 'NATIVE_FLUID_MESH', message: `${compatibility.reason} 当前尚未接入通用流体后端。` })
    else issues.push({ level: 'info', code: 'NATIVE_CAVITY', message: '此规则映射方腔可由内置流体求解器计算。' })
  }
  return issues
}
