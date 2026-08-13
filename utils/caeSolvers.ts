export type CaeAnalysisKind = 'bar-static' | 'cantilever-beam' | 'steady-heat-2d' | 'modal'
export type CaeIssueLevel = 'error' | 'warning'
export type CaeCheckStatus = 'pass' | 'warning' | 'fail'

export interface CaeValidationIssue {
  level: CaeIssueLevel
  code: string
  message: string
  field?: string
}

export interface CaeValidation {
  valid: boolean
  issues: CaeValidationIssue[]
}

export interface CaeCheck {
  id: string
  label: string
  status: CaeCheckStatus
  value: number
  unit?: string
  tolerance?: number
  message: string
}

export interface CaeSummaryItem {
  label: string
  value: number | string
  unit?: string
}

export interface CaeSolverResult<T> {
  kind: CaeAnalysisKind
  solver: string
  ok: boolean
  validation: CaeValidation
  checks: CaeCheck[]
  summary: CaeSummaryItem[]
  warnings: string[]
  data: T | null
}

export interface BarStaticInput {
  length: number
  area: number
  elasticModulus: number
  elements: number
  endLoad: number
  distributedLoad?: number
}

export interface BarElementResult {
  index: number
  nodeIds: [number, number]
  strain: number
  stress: number
  axialForce: number
}

export interface BarStaticData {
  nodes: number[]
  connectivity: Array<[number, number]>
  displacement: number[]
  analyticalDisplacement: number[]
  nodalLoads: number[]
  reactions: number[]
  elements: BarElementResult[]
  tipDisplacement: number
  strainEnergy: number
  equilibriumError: number
}

export interface CantileverBeamInput {
  length: number
  elasticModulus: number
  secondMoment: number
  elements: number
  tipLoad?: number
  uniformLoad?: number
  tipMoment?: number
}

export interface BeamElementResult {
  index: number
  nodeIds: [number, number]
  endForces: [number, number, number, number]
}

export interface CantileverBeamData {
  nodes: number[]
  connectivity: Array<[number, number]>
  deflection: number[]
  rotation: number[]
  analyticalDeflection: number[]
  analyticalRotation: number[]
  shearForce: number[]
  bendingMoment: number[]
  reactions: { force: number; moment: number }
  elements: BeamElementResult[]
  tipDeflection: number
  tipRotation: number
  strainEnergy: number
  equilibriumError: number
}

export type ThermalBoundary =
  | { type: 'temperature'; value: number }
  | { type: 'flux'; value: number }
  | { type: 'convection'; heatTransferCoefficient: number; ambientTemperature: number }

export interface SteadyHeat2DInput {
  width: number
  height: number
  conductivity: number
  nx: number
  ny: number
  heatSource?: number
  boundaries?: Partial<Record<'left' | 'right' | 'bottom' | 'top', ThermalBoundary>>
  tolerance?: number
  maxIterations?: number
  relaxation?: number
}

export interface SteadyHeat2DData {
  nx: number
  ny: number
  x: number[]
  y: number[]
  temperature: number[]
  heatFluxX: number[]
  heatFluxY: number[]
  heatFluxMagnitude: number[]
  iterations: number
  converged: boolean
  residualHistory: number[]
  equationResidual: number
  minTemperature: number
  maxTemperature: number
  energy: {
    boundaryHeatOut: number
    sourceGeneration: number
    imbalance: number
    relativeImbalance: number
    boundaryHeat: Record<'left' | 'right' | 'bottom' | 'top', number>
  }
}

export interface ModalInput {
  massMatrix: number[][]
  stiffnessMatrix: number[][]
  modes?: number
  tolerance?: number
  maxIterations?: number
}

export interface SdofModalInput {
  mass: number
  stiffness: number
}

export interface ModalMode {
  number: number
  eigenvalue: number
  angularFrequency: number
  frequency: number
  period: number | null
  shape: number[]
  residual: number
}

export interface ModalData {
  modes: ModalMode[]
  eigenvalues: number[]
  massNormalizedModeShapes: number[][]
  rigidBodyModes: number
  eigensolverIterations: number
  eigensolverConverged: boolean
  maxResidual: number
  maxMassOrthogonalityError: number
}

export type CaeCase =
  | { kind: 'bar-static'; input: BarStaticInput }
  | { kind: 'cantilever-beam'; input: CantileverBeamInput }
  | { kind: 'steady-heat-2d'; input: SteadyHeat2DInput }
  | { kind: 'modal'; input: ModalInput }

export type AnyCaeResult =
  | CaeSolverResult<BarStaticData>
  | CaeSolverResult<CantileverBeamData>
  | CaeSolverResult<SteadyHeat2DData>
  | CaeSolverResult<ModalData>

const DEFAULT_THERMAL_BOUNDARIES: Record<'left' | 'right' | 'bottom' | 'top', ThermalBoundary> = {
  left: { type: 'temperature', value: 373.15 },
  right: { type: 'temperature', value: 293.15 },
  bottom: { type: 'flux', value: 0 },
  top: { type: 'flux', value: 0 }
}

function validation(issues: CaeValidationIssue[]): CaeValidation {
  return { valid: !issues.some(issue => issue.level === 'error'), issues }
}

function invalidResult<T>(kind: CaeAnalysisKind, solver: string, issues: CaeValidationIssue[]): CaeSolverResult<T> {
  const resultValidation = validation(issues)
  return {
    kind,
    solver,
    ok: false,
    validation: resultValidation,
    checks: [{
      id: 'input-validation', label: '输入有效性', status: 'fail', value: issues.filter(issue => issue.level === 'error').length,
      message: issues.filter(issue => issue.level === 'error').map(issue => issue.message).join('；') || '输入未通过校验'
    }],
    summary: [],
    warnings: issues.filter(issue => issue.level === 'warning').map(issue => issue.message),
    data: null
  }
}

function solvedResult<T>(
  kind: CaeAnalysisKind,
  solver: string,
  issues: CaeValidationIssue[],
  checks: CaeCheck[],
  summary: CaeSummaryItem[],
  data: T
): CaeSolverResult<T> {
  const resultValidation = validation(issues)
  return {
    kind,
    solver,
    ok: resultValidation.valid && !checks.some(check => check.status === 'fail'),
    validation: resultValidation,
    checks,
    summary,
    warnings: [
      ...issues.filter(issue => issue.level === 'warning').map(issue => issue.message),
      ...checks.filter(check => check.status === 'warning').map(check => check.message)
    ],
    data
  }
}

function addFinitePositive(issues: CaeValidationIssue[], field: string, label: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) issues.push({ level: 'error', code: 'POSITIVE_REQUIRED', field, message: `${label}必须是有限正数。` })
}

function addFinite(issues: CaeValidationIssue[], field: string, label: string, value: number) {
  if (!Number.isFinite(value)) issues.push({ level: 'error', code: 'FINITE_REQUIRED', field, message: `${label}必须是有限数值。` })
}

function addIntegerRange(issues: CaeValidationIssue[], field: string, label: string, value: number, min: number, max: number) {
  if (!Number.isInteger(value) || value < min || value > max) {
    issues.push({ level: 'error', code: 'INTEGER_RANGE', field, message: `${label}必须是 ${min}–${max} 范围内的整数。` })
  }
}

function zeroMatrix(rows: number, columns = rows) {
  return Array.from({ length: rows }, () => Array<number>(columns).fill(0))
}

function identityMatrix(size: number) {
  const result = zeroMatrix(size)
  for (let i = 0; i < size; i++) result[i][i] = 1
  return result
}

function matrixVector(matrix: number[][], vector: number[]) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0))
}

function dot(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0)
}

function norm(vector: number[]) {
  return Math.sqrt(dot(vector, vector))
}

function multiply(left: number[][], right: number[][]) {
  const result = zeroMatrix(left.length, right[0].length)
  for (let i = 0; i < left.length; i++) {
    for (let k = 0; k < right.length; k++) {
      for (let j = 0; j < right[0].length; j++) result[i][j] += left[i][k] * right[k][j]
    }
  }
  return result
}

function transpose(matrix: number[][]) {
  return matrix[0].map((_, column) => matrix.map(row => row[column]))
}

function solveLinearSystem(matrix: number[][], rightHandSide: number[]) {
  const size = matrix.length
  const a = matrix.map(row => [...row])
  const b = [...rightHandSide]
  const scale = Math.max(1, ...a.flat().map(Math.abs))
  const pivotTolerance = Number.EPSILON * scale * size * 100

  for (let column = 0; column < size; column++) {
    let pivot = column
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row
    }
    if (Math.abs(a[pivot][column]) <= pivotTolerance) throw new Error('线性系统奇异或病态，无法获得唯一解。')
    if (pivot !== column) {
      ;[a[column], a[pivot]] = [a[pivot], a[column]]
      ;[b[column], b[pivot]] = [b[pivot], b[column]]
    }
    for (let row = column + 1; row < size; row++) {
      const factor = a[row][column] / a[column][column]
      a[row][column] = 0
      for (let j = column + 1; j < size; j++) a[row][j] -= factor * a[column][j]
      b[row] -= factor * b[column]
    }
  }

  const solution = Array<number>(size).fill(0)
  for (let row = size - 1; row >= 0; row--) {
    let value = b[row]
    for (let column = row + 1; column < size; column++) value -= a[row][column] * solution[column]
    solution[row] = value / a[row][row]
  }
  return solution
}

export function solveBarStatic(input: BarStaticInput): CaeSolverResult<BarStaticData> {
  const issues: CaeValidationIssue[] = []
  addFinitePositive(issues, 'length', '杆长', input.length)
  addFinitePositive(issues, 'area', '截面积', input.area)
  addFinitePositive(issues, 'elasticModulus', '弹性模量', input.elasticModulus)
  addIntegerRange(issues, 'elements', '单元数', input.elements, 1, 500)
  addFinite(issues, 'endLoad', '端部载荷', input.endLoad)
  addFinite(issues, 'distributedLoad', '均布轴向载荷', input.distributedLoad ?? 0)
  if (!validation(issues).valid) return invalidResult('bar-static', '一维线性杆有限元', issues)

  const elementCount = input.elements
  const nodeCount = elementCount + 1
  const elementLength = input.length / elementCount
  const distributedLoad = input.distributedLoad ?? 0
  const stiffness = zeroMatrix(nodeCount)
  const loads = Array<number>(nodeCount).fill(0)
  const connectivity: Array<[number, number]> = []
  const factor = input.elasticModulus * input.area / elementLength

  for (let element = 0; element < elementCount; element++) {
    const nodes: [number, number] = [element, element + 1]
    connectivity.push(nodes)
    stiffness[nodes[0]][nodes[0]] += factor
    stiffness[nodes[0]][nodes[1]] -= factor
    stiffness[nodes[1]][nodes[0]] -= factor
    stiffness[nodes[1]][nodes[1]] += factor
    loads[nodes[0]] += distributedLoad * elementLength / 2
    loads[nodes[1]] += distributedLoad * elementLength / 2
  }
  loads[nodeCount - 1] += input.endLoad

  let freeDisplacements: number[]
  try {
    freeDisplacements = solveLinearSystem(stiffness.slice(1).map(row => row.slice(1)), loads.slice(1))
  } catch (error) {
    issues.push({ level: 'error', code: 'SINGULAR_STIFFNESS', message: error instanceof Error ? error.message : '刚度矩阵求解失败。' })
    return invalidResult('bar-static', '一维线性杆有限元', issues)
  }

  const displacement = [0, ...freeDisplacements]
  const nodes = Array.from({ length: nodeCount }, (_, index) => index * elementLength)
  const internalLoads = matrixVector(stiffness, displacement)
  const reactions = internalLoads.map((value, index) => value - loads[index])
  const analyticalDisplacement = nodes.map(x => (
    input.endLoad * x + distributedLoad * (input.length * x - x * x / 2)
  ) / (input.elasticModulus * input.area))
  const elements = connectivity.map(([left, right], index): BarElementResult => {
    const strain = (displacement[right] - displacement[left]) / elementLength
    const stress = input.elasticModulus * strain
    return { index, nodeIds: [left, right], strain, stress, axialForce: stress * input.area }
  })
  const appliedResultant = input.endLoad + distributedLoad * input.length
  const equilibriumError = Math.abs(reactions[0] + appliedResultant)
  const equilibriumScale = Math.max(1, Math.abs(appliedResultant))
  const maxReferenceError = Math.max(...displacement.map((value, index) => Math.abs(value - analyticalDisplacement[index])))
  const displacementScale = Math.max(1e-15, ...analyticalDisplacement.map(Math.abs))
  const strainEnergy = 0.5 * dot(displacement, internalLoads)
  const checks: CaeCheck[] = [
    {
      id: 'force-equilibrium', label: '整体力平衡', status: equilibriumError / equilibriumScale <= 1e-10 ? 'pass' : 'fail',
      value: equilibriumError, unit: 'N', tolerance: equilibriumScale * 1e-10,
      message: `支座反力与外载合力误差为 ${equilibriumError.toExponential(3)} N。`
    },
    {
      id: 'analytical-reference', label: '解析解校核', status: maxReferenceError / displacementScale <= 1e-9 ? 'pass' : 'fail',
      value: maxReferenceError, unit: 'm', tolerance: displacementScale * 1e-9,
      message: `线性杆节点位移与解析解最大差值为 ${maxReferenceError.toExponential(3)} m。`
    },
    {
      id: 'strain-energy', label: '应变能非负', status: strainEnergy >= -1e-12 ? 'pass' : 'fail',
      value: strainEnergy, unit: 'J', message: `系统应变能为 ${strainEnergy.toExponential(3)} J。`
    }
  ]
  const data: BarStaticData = {
    nodes, connectivity, displacement, analyticalDisplacement, nodalLoads: loads, reactions, elements,
    tipDisplacement: displacement.at(-1)!, strainEnergy, equilibriumError
  }
  return solvedResult('bar-static', '一维线性杆有限元', issues, checks, [
    { label: '端部位移', value: data.tipDisplacement, unit: 'm' },
    { label: '固定端反力', value: reactions[0], unit: 'N' },
    { label: '最大应力', value: Math.max(...elements.map(element => Math.abs(element.stress))), unit: 'Pa' },
    { label: '应变能', value: strainEnergy, unit: 'J' }
  ], data)
}

export const solveAxialBar = solveBarStatic

export function solveCantileverBeam(input: CantileverBeamInput): CaeSolverResult<CantileverBeamData> {
  const issues: CaeValidationIssue[] = []
  addFinitePositive(issues, 'length', '梁长', input.length)
  addFinitePositive(issues, 'elasticModulus', '弹性模量', input.elasticModulus)
  addFinitePositive(issues, 'secondMoment', '截面二次矩', input.secondMoment)
  addIntegerRange(issues, 'elements', '单元数', input.elements, 1, 250)
  addFinite(issues, 'tipLoad', '端部集中力', input.tipLoad ?? 0)
  addFinite(issues, 'uniformLoad', '均布载荷', input.uniformLoad ?? 0)
  addFinite(issues, 'tipMoment', '端部力矩', input.tipMoment ?? 0)
  if (!validation(issues).valid) return invalidResult('cantilever-beam', 'Euler–Bernoulli 梁有限元', issues)

  const tipLoad = input.tipLoad ?? 0
  const uniformLoad = input.uniformLoad ?? 0
  const tipMoment = input.tipMoment ?? 0
  const elementLength = input.length / input.elements
  const nodeCount = input.elements + 1
  const dofCount = 2 * nodeCount
  const stiffness = zeroMatrix(dofCount)
  const loads = Array<number>(dofCount).fill(0)
  const connectivity: Array<[number, number]> = []
  const ei = input.elasticModulus * input.secondMoment
  const l = elementLength
  const scale = ei / l ** 3
  const elementStiffness = [
    [12, 6 * l, -12, 6 * l],
    [6 * l, 4 * l * l, -6 * l, 2 * l * l],
    [-12, -6 * l, 12, -6 * l],
    [6 * l, 2 * l * l, -6 * l, 4 * l * l]
  ].map(row => row.map(value => value * scale))
  const consistentLoad = [uniformLoad * l / 2, uniformLoad * l * l / 12, uniformLoad * l / 2, -uniformLoad * l * l / 12]

  for (let element = 0; element < input.elements; element++) {
    const nodeIds: [number, number] = [element, element + 1]
    connectivity.push(nodeIds)
    const dofs = [2 * element, 2 * element + 1, 2 * element + 2, 2 * element + 3]
    for (let row = 0; row < 4; row++) {
      loads[dofs[row]] += consistentLoad[row]
      for (let column = 0; column < 4; column++) stiffness[dofs[row]][dofs[column]] += elementStiffness[row][column]
    }
  }
  loads[dofCount - 2] += tipLoad
  loads[dofCount - 1] += tipMoment

  let freeDisplacements: number[]
  try {
    freeDisplacements = solveLinearSystem(stiffness.slice(2).map(row => row.slice(2)), loads.slice(2))
  } catch (error) {
    issues.push({ level: 'error', code: 'SINGULAR_STIFFNESS', message: error instanceof Error ? error.message : '梁刚度矩阵求解失败。' })
    return invalidResult('cantilever-beam', 'Euler–Bernoulli 梁有限元', issues)
  }
  const degreesOfFreedom = [0, 0, ...freeDisplacements]
  const nodes = Array.from({ length: nodeCount }, (_, index) => index * elementLength)
  const internalLoads = matrixVector(stiffness, degreesOfFreedom)
  const reactionsVector = internalLoads.map((value, index) => value - loads[index])
  const deflection = nodes.map((_, index) => degreesOfFreedom[2 * index])
  const rotation = nodes.map((_, index) => degreesOfFreedom[2 * index + 1])
  const analyticalDeflection = nodes.map(x => (
    tipLoad * x * x * (3 * input.length - x) / 6
    + uniformLoad * x * x * (6 * input.length ** 2 - 4 * input.length * x + x * x) / 24
    + tipMoment * x * x / 2
  ) / ei)
  const analyticalRotation = nodes.map(x => (
    tipLoad * x * (2 * input.length - x) / 2
    + uniformLoad * x * (3 * input.length ** 2 - 3 * input.length * x + x * x) / 6
    + tipMoment * x
  ) / ei)
  const shearForce = nodes.map(x => tipLoad + uniformLoad * (input.length - x))
  const bendingMoment = nodes.map(x => tipMoment + tipLoad * (input.length - x) + uniformLoad * (input.length - x) ** 2 / 2)
  const elements = connectivity.map(([left, right], index): BeamElementResult => {
    const dofs = [2 * left, 2 * left + 1, 2 * right, 2 * right + 1]
    const localDisplacements = dofs.map(dof => degreesOfFreedom[dof])
    const localForces = matrixVector(elementStiffness, localDisplacements).map((value, i) => value - consistentLoad[i])
    return { index, nodeIds: [left, right], endForces: localForces as [number, number, number, number] }
  })
  const forceError = Math.abs(reactionsVector[0] + tipLoad + uniformLoad * input.length)
  const momentError = Math.abs(reactionsVector[1] + tipLoad * input.length + uniformLoad * input.length ** 2 / 2 + tipMoment)
  const forceScale = Math.max(1, Math.abs(tipLoad) + Math.abs(uniformLoad * input.length))
  const momentScale = Math.max(1, Math.abs(tipLoad * input.length) + Math.abs(uniformLoad * input.length ** 2 / 2) + Math.abs(tipMoment))
  const equilibriumError = Math.max(forceError / forceScale, momentError / momentScale)
  const tipReferenceError = Math.abs(deflection.at(-1)! - analyticalDeflection.at(-1)!)
  const referenceScale = Math.max(1e-15, Math.abs(analyticalDeflection.at(-1)!))
  const strainEnergy = 0.5 * dot(degreesOfFreedom, internalLoads)
  const checks: CaeCheck[] = [
    {
      id: 'force-moment-equilibrium', label: '力与力矩平衡', status: equilibriumError <= 1e-9 ? 'pass' : 'fail',
      value: equilibriumError, tolerance: 1e-9, message: `归一化整体平衡误差为 ${equilibriumError.toExponential(3)}。`
    },
    {
      id: 'analytical-tip-deflection', label: '端点解析解校核', status: tipReferenceError / referenceScale <= 1e-9 ? 'pass' : 'fail',
      value: tipReferenceError, unit: 'm', tolerance: referenceScale * 1e-9,
      message: `端点挠度与 Euler–Bernoulli 解析解差值为 ${tipReferenceError.toExponential(3)} m。`
    },
    {
      id: 'strain-energy', label: '应变能非负', status: strainEnergy >= -1e-12 ? 'pass' : 'fail',
      value: strainEnergy, unit: 'J', message: `系统应变能为 ${strainEnergy.toExponential(3)} J。`
    }
  ]
  const data: CantileverBeamData = {
    nodes, connectivity, deflection, rotation, analyticalDeflection, analyticalRotation, shearForce, bendingMoment,
    reactions: { force: reactionsVector[0], moment: reactionsVector[1] }, elements,
    tipDeflection: deflection.at(-1)!, tipRotation: rotation.at(-1)!, strainEnergy, equilibriumError
  }
  return solvedResult('cantilever-beam', 'Euler–Bernoulli 梁有限元', issues, checks, [
    { label: '自由端挠度', value: data.tipDeflection, unit: 'm' },
    { label: '自由端转角', value: data.tipRotation, unit: 'rad' },
    { label: '固定端反力', value: data.reactions.force, unit: 'N' },
    { label: '固定端反力矩', value: data.reactions.moment, unit: 'N·m' },
    { label: '最大弯矩', value: Math.max(...bendingMoment.map(Math.abs)), unit: 'N·m' }
  ], data)
}

function normalizeThermalBoundaries(input: SteadyHeat2DInput) {
  return {
    left: input.boundaries?.left ?? DEFAULT_THERMAL_BOUNDARIES.left,
    right: input.boundaries?.right ?? DEFAULT_THERMAL_BOUNDARIES.right,
    bottom: input.boundaries?.bottom ?? DEFAULT_THERMAL_BOUNDARIES.bottom,
    top: input.boundaries?.top ?? DEFAULT_THERMAL_BOUNDARIES.top
  }
}

function validateThermalBoundary(issues: CaeValidationIssue[], side: string, boundary: ThermalBoundary) {
  if (boundary.type === 'temperature') addFinite(issues, `boundaries.${side}.value`, `${side} 定温边界`, boundary.value)
  else if (boundary.type === 'flux') addFinite(issues, `boundaries.${side}.value`, `${side} 热流边界`, boundary.value)
  else if (boundary.type === 'convection') {
    addFinitePositive(issues, `boundaries.${side}.heatTransferCoefficient`, `${side} 对流换热系数`, boundary.heatTransferCoefficient)
    addFinite(issues, `boundaries.${side}.ambientTemperature`, `${side} 环境温度`, boundary.ambientTemperature)
  } else issues.push({ level: 'error', code: 'BOUNDARY_TYPE', field: `boundaries.${side}`, message: `${side} 边界类型不受支持。` })
}

export function solveSteadyHeat2D(input: SteadyHeat2DInput): CaeSolverResult<SteadyHeat2DData> {
  const issues: CaeValidationIssue[] = []
  const tolerance = input.tolerance ?? 1e-8
  const maxIterations = input.maxIterations ?? 10_000
  const relaxation = input.relaxation ?? 1.5
  const source = input.heatSource ?? 0
  const boundaries = normalizeThermalBoundaries(input)
  addFinitePositive(issues, 'width', '区域宽度', input.width)
  addFinitePositive(issues, 'height', '区域高度', input.height)
  addFinitePositive(issues, 'conductivity', '导热系数', input.conductivity)
  addIntegerRange(issues, 'nx', 'x 方向节点数', input.nx, 3, 201)
  addIntegerRange(issues, 'ny', 'y 方向节点数', input.ny, 3, 201)
  if (Number.isInteger(input.nx) && Number.isInteger(input.ny) && input.nx * input.ny > 40_000) {
    issues.push({ level: 'error', code: 'GRID_TOO_LARGE', field: 'nx', message: '热传导网格不得超过 40,000 个节点。' })
  }
  addFinite(issues, 'heatSource', '体积热源', source)
  addFinitePositive(issues, 'tolerance', '迭代容差', tolerance)
  addIntegerRange(issues, 'maxIterations', '最大迭代数', maxIterations, 1, 200_000)
  if (!Number.isFinite(relaxation) || relaxation <= 0 || relaxation >= 2) {
    issues.push({ level: 'error', code: 'RELAXATION_RANGE', field: 'relaxation', message: 'SOR 松弛因子必须大于 0 且小于 2。' })
  }
  for (const side of ['left', 'right', 'bottom', 'top'] as const) validateThermalBoundary(issues, side, boundaries[side])
  const hasTemperature = Object.values(boundaries).some(boundary => boundary.type === 'temperature')
  const hasConvection = Object.values(boundaries).some(boundary => boundary.type === 'convection')
  if (!hasTemperature && !hasConvection) {
    issues.push({ level: 'error', code: 'THERMAL_REFERENCE_REQUIRED', field: 'boundaries', message: '纯热流边界没有温度基准；至少需要一个定温或对流边界。' })
  }
  if (!validation(issues).valid) return invalidResult('steady-heat-2d', '二维稳态有限差分/SOR', issues)

  const nx = input.nx, ny = input.ny
  const dx = input.width / (nx - 1), dy = input.height / (ny - 1)
  const ax = 1 / (dx * dx), ay = 1 / (dy * dy)
  const index = (i: number, j: number) => j * nx + i
  const x = Array.from({ length: nx }, (_, i) => i * dx)
  const y = Array.from({ length: ny }, (_, j) => j * dy)
  const referenceTemperatures = Object.values(boundaries).flatMap(boundary => (
    boundary.type === 'temperature' ? [boundary.value] : boundary.type === 'convection' ? [boundary.ambientTemperature] : []
  ))
  const initialMean = referenceTemperatures.reduce((sum, value) => sum + value, 0) / referenceTemperatures.length
  const temperature = Array<number>(nx * ny).fill(initialMean)
  if (boundaries.left.type === 'temperature' && boundaries.right.type === 'temperature') {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) temperature[index(i, j)] = boundaries.left.value + (boundaries.right.value - boundaries.left.value) * i / (nx - 1)
    }
  }

  function fixedTemperature(i: number, j: number) {
    const values: number[] = []
    if (i === 0 && boundaries.left.type === 'temperature') values.push(boundaries.left.value)
    if (i === nx - 1 && boundaries.right.type === 'temperature') values.push(boundaries.right.value)
    if (j === 0 && boundaries.bottom.type === 'temperature') values.push(boundaries.bottom.value)
    if (j === ny - 1 && boundaries.top.type === 'temperature') values.push(boundaries.top.value)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const fixed = fixedTemperature(i, j)
      if (fixed !== null) temperature[index(i, j)] = fixed
    }
  }

  function openBoundaryContribution(boundary: ThermalBoundary, neighbor: number, coefficient: number, spacing: number) {
    let numerator = 2 * coefficient * neighbor
    let denominator = 2 * coefficient
    if (boundary.type === 'flux') numerator -= 2 * boundary.value / (input.conductivity * spacing)
    if (boundary.type === 'convection') {
      const robin = 2 * boundary.heatTransferCoefficient / (input.conductivity * spacing)
      numerator += robin * boundary.ambientTemperature
      denominator += robin
    }
    return { numerator, denominator }
  }

  function targetTemperature(i: number, j: number) {
    let numerator = source / input.conductivity
    let denominator = 0
    if (i > 0 && i < nx - 1) {
      numerator += ax * (temperature[index(i - 1, j)] + temperature[index(i + 1, j)])
      denominator += 2 * ax
    } else {
      const side = i === 0 ? boundaries.left : boundaries.right
      const neighbor = temperature[index(i === 0 ? 1 : nx - 2, j)]
      const contribution = openBoundaryContribution(side, neighbor, ax, dx)
      numerator += contribution.numerator; denominator += contribution.denominator
    }
    if (j > 0 && j < ny - 1) {
      numerator += ay * (temperature[index(i, j - 1)] + temperature[index(i, j + 1)])
      denominator += 2 * ay
    } else {
      const side = j === 0 ? boundaries.bottom : boundaries.top
      const neighbor = temperature[index(i, j === 0 ? 1 : ny - 2)]
      const contribution = openBoundaryContribution(side, neighbor, ay, dy)
      numerator += contribution.numerator; denominator += contribution.denominator
    }
    return numerator / denominator
  }

  const residualHistory: number[] = []
  let converged = false
  let iterations = 0
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    let maxUpdate = 0
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        if (fixedTemperature(i, j) !== null) continue
        const location = index(i, j)
        const previous = temperature[location]
        const updated = previous + relaxation * (targetTemperature(i, j) - previous)
        temperature[location] = updated
        maxUpdate = Math.max(maxUpdate, Math.abs(updated - previous))
      }
    }
    residualHistory.push(maxUpdate)
    iterations = iteration
    if (maxUpdate <= tolerance) { converged = true; break }
  }

  let equationResidual = 0
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (fixedTemperature(i, j) === null) equationResidual = Math.max(equationResidual, Math.abs(targetTemperature(i, j) - temperature[index(i, j)]))
    }
  }

  const heatFluxX = Array<number>(nx * ny).fill(0)
  const heatFluxY = Array<number>(nx * ny).fill(0)
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const dTdx = i === 0
        ? (-3 * temperature[index(i, j)] + 4 * temperature[index(i + 1, j)] - temperature[index(i + 2, j)]) / (2 * dx)
        : i === nx - 1
          ? (3 * temperature[index(i, j)] - 4 * temperature[index(i - 1, j)] + temperature[index(i - 2, j)]) / (2 * dx)
          : (temperature[index(i + 1, j)] - temperature[index(i - 1, j)]) / (2 * dx)
      const dTdy = j === 0
        ? (-3 * temperature[index(i, j)] + 4 * temperature[index(i, j + 1)] - temperature[index(i, j + 2)]) / (2 * dy)
        : j === ny - 1
          ? (3 * temperature[index(i, j)] - 4 * temperature[index(i, j - 1)] + temperature[index(i, j - 2)]) / (2 * dy)
          : (temperature[index(i, j + 1)] - temperature[index(i, j - 1)]) / (2 * dy)
      heatFluxX[index(i, j)] = -input.conductivity * dTdx
      heatFluxY[index(i, j)] = -input.conductivity * dTdy
    }
  }
  const heatFluxMagnitude = heatFluxX.map((value, location) => Math.hypot(value, heatFluxY[location]))

  function outwardFlux(side: 'left' | 'right' | 'bottom' | 'top', i: number, j: number) {
    const boundary = boundaries[side]
    const surfaceTemperature = temperature[index(i, j)]
    if (boundary.type === 'flux') return boundary.value
    if (boundary.type === 'convection') return boundary.heatTransferCoefficient * (surfaceTemperature - boundary.ambientTemperature)
    if (side === 'left') return -heatFluxX[index(i, j)]
    if (side === 'right') return heatFluxX[index(i, j)]
    if (side === 'bottom') return -heatFluxY[index(i, j)]
    return heatFluxY[index(i, j)]
  }

  function integrateSide(side: 'left' | 'right' | 'bottom' | 'top') {
    const vertical = side === 'left' || side === 'right'
    const count = vertical ? ny : nx
    const spacing = vertical ? dy : dx
    let total = 0
    for (let position = 0; position < count; position++) {
      const i = vertical ? (side === 'left' ? 0 : nx - 1) : position
      const j = vertical ? position : (side === 'bottom' ? 0 : ny - 1)
      total += (position === 0 || position === count - 1 ? 0.5 : 1) * outwardFlux(side, i, j)
    }
    return total * spacing
  }

  const boundaryHeat = {
    left: integrateSide('left'), right: integrateSide('right'),
    bottom: integrateSide('bottom'), top: integrateSide('top')
  }
  const boundaryHeatOut = Object.values(boundaryHeat).reduce((sum, value) => sum + value, 0)
  const sourceGeneration = source * input.width * input.height
  const imbalance = boundaryHeatOut - sourceGeneration
  const relativeImbalance = Math.abs(imbalance) / Math.max(1, Math.abs(boundaryHeatOut), Math.abs(sourceGeneration))
  const minTemperature = Math.min(...temperature), maxTemperature = Math.max(...temperature)
  const checks: CaeCheck[] = [
    {
      id: 'iterative-convergence', label: '迭代收敛', status: converged && equationResidual <= tolerance * 2 ? 'pass' : 'fail',
      value: equationResidual, unit: 'K', tolerance: tolerance * 2,
      message: converged ? `离散方程最大温度残差为 ${equationResidual.toExponential(3)} K。` : `达到 ${maxIterations} 次迭代仍未满足容差。`
    },
    {
      id: 'energy-balance', label: '全局能量平衡',
      status: relativeImbalance <= 0.01 ? 'pass' : relativeImbalance <= 0.05 ? 'warning' : 'fail',
      value: relativeImbalance, tolerance: 0.01,
      message: `边界净流出与区域热源的相对不平衡为 ${(relativeImbalance * 100).toFixed(3)}%。`
    },
    {
      id: 'finite-temperature', label: '温度场有限性', status: temperature.every(Number.isFinite) ? 'pass' : 'fail',
      value: temperature.filter(Number.isFinite).length / temperature.length, tolerance: 1,
      message: '温度场节点均应为有限数值。'
    }
  ]
  const data: SteadyHeat2DData = {
    nx, ny, x, y, temperature, heatFluxX, heatFluxY, heatFluxMagnitude, iterations, converged, residualHistory,
    equationResidual, minTemperature, maxTemperature,
    energy: { boundaryHeatOut, sourceGeneration, imbalance, relativeImbalance, boundaryHeat }
  }
  return solvedResult('steady-heat-2d', '二维稳态有限差分/SOR', issues, checks, [
    { label: '最低温度', value: minTemperature, unit: 'K' },
    { label: '最高温度', value: maxTemperature, unit: 'K' },
    { label: '求解迭代', value: iterations },
    { label: '能量不平衡', value: relativeImbalance * 100, unit: '%' },
    { label: '最大热流密度', value: Math.max(...heatFluxMagnitude), unit: 'W/m²' }
  ], data)
}

function validateSquareMatrix(issues: CaeValidationIssue[], matrix: number[][], field: string, label: string) {
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 24 || matrix.some(row => !Array.isArray(row) || row.length !== matrix.length)) {
    issues.push({ level: 'error', code: 'SQUARE_MATRIX', field, message: `${label}必须是阶数为 1–24 的方阵。` })
    return
  }
  if (matrix.some(row => row.some(value => !Number.isFinite(value)))) {
    issues.push({ level: 'error', code: 'FINITE_MATRIX', field, message: `${label}只能包含有限数值。` })
  }
  const matrixScale = Math.max(1, ...matrix.flat().map(Math.abs))
  let symmetryError = 0
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix.length; j++) symmetryError = Math.max(symmetryError, Math.abs(matrix[i][j] - matrix[j][i]))
  }
  if (symmetryError > matrixScale * 1e-10) issues.push({ level: 'error', code: 'SYMMETRY_REQUIRED', field, message: `${label}必须为对称矩阵。` })
}

function cholesky(matrix: number[][]) {
  const size = matrix.length
  const lower = zeroMatrix(size)
  const scale = Math.max(1, ...matrix.flat().map(Math.abs))
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= i; j++) {
      let value = matrix[i][j]
      for (let k = 0; k < j; k++) value -= lower[i][k] * lower[j][k]
      if (i === j) {
        if (value <= Number.EPSILON * scale * size * 100) throw new Error('质量矩阵不是正定矩阵。')
        lower[i][j] = Math.sqrt(value)
      } else lower[i][j] = value / lower[j][j]
    }
  }
  return lower
}

function invertLower(lower: number[][]) {
  const size = lower.length
  const inverse = zeroMatrix(size)
  for (let column = 0; column < size; column++) {
    for (let row = 0; row < size; row++) {
      if (row < column) continue
      let value = row === column ? 1 : 0
      for (let k = column; k < row; k++) value -= lower[row][k] * inverse[k][column]
      inverse[row][column] = value / lower[row][row]
    }
  }
  return inverse
}

function jacobiEigen(matrix: number[][], tolerance: number, maxIterations: number) {
  const size = matrix.length
  const a = matrix.map(row => [...row])
  const vectors = identityMatrix(size)
  const scale = Math.max(1, ...a.flat().map(Math.abs))
  let converged = size === 1
  let iterations = 0
  for (let iteration = 1; iteration <= maxIterations && size > 1; iteration++) {
    let p = 0, q = 1, largest = Math.abs(a[p][q])
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        if (Math.abs(a[i][j]) > largest) { largest = Math.abs(a[i][j]); p = i; q = j }
      }
    }
    if (largest <= tolerance * scale) { converged = true; iterations = iteration - 1; break }
    const angle = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p])
    const cosine = Math.cos(angle), sine = Math.sin(angle)
    const app = a[p][p], aqq = a[q][q], apq = a[p][q]
    for (let k = 0; k < size; k++) {
      if (k === p || k === q) continue
      const akp = a[k][p], akq = a[k][q]
      a[k][p] = a[p][k] = cosine * akp - sine * akq
      a[k][q] = a[q][k] = sine * akp + cosine * akq
    }
    a[p][p] = cosine * cosine * app - 2 * sine * cosine * apq + sine * sine * aqq
    a[q][q] = sine * sine * app + 2 * sine * cosine * apq + cosine * cosine * aqq
    a[p][q] = a[q][p] = 0
    for (let k = 0; k < size; k++) {
      const vkp = vectors[k][p], vkq = vectors[k][q]
      vectors[k][p] = cosine * vkp - sine * vkq
      vectors[k][q] = sine * vkp + cosine * vkq
    }
    iterations = iteration
  }
  return { values: a.map((row, index) => row[index]), vectors, converged, iterations }
}

export function solveModal(input: ModalInput): CaeSolverResult<ModalData> {
  const issues: CaeValidationIssue[] = []
  validateSquareMatrix(issues, input.massMatrix, 'massMatrix', '质量矩阵')
  validateSquareMatrix(issues, input.stiffnessMatrix, 'stiffnessMatrix', '刚度矩阵')
  if (input.massMatrix.length !== input.stiffnessMatrix.length) {
    issues.push({ level: 'error', code: 'MATRIX_SIZE_MISMATCH', field: 'stiffnessMatrix', message: '质量矩阵与刚度矩阵的阶数必须相同。' })
  }
  const size = input.massMatrix.length
  const requestedModes = input.modes ?? size
  addIntegerRange(issues, 'modes', '输出模态数', requestedModes, 1, Math.max(1, size))
  const tolerance = input.tolerance ?? 1e-12
  const maxIterations = input.maxIterations ?? Math.max(50, size * size * 100)
  addFinitePositive(issues, 'tolerance', '特征值容差', tolerance)
  addIntegerRange(issues, 'maxIterations', '特征值最大迭代数', maxIterations, 1, 1_000_000)
  if (!validation(issues).valid) return invalidResult('modal', '对称广义特征值/Jacobi', issues)

  let inverseLower: number[][]
  try {
    inverseLower = invertLower(cholesky(input.massMatrix))
  } catch (error) {
    issues.push({ level: 'error', code: 'MASS_NOT_POSITIVE_DEFINITE', field: 'massMatrix', message: error instanceof Error ? error.message : '质量矩阵必须正定。' })
    return invalidResult('modal', '对称广义特征值/Jacobi', issues)
  }
  const transformed = multiply(multiply(inverseLower, input.stiffnessMatrix), transpose(inverseLower))
  const eigensystem = jacobiEigen(transformed, tolerance, maxIterations)
  const inverseLowerTranspose = transpose(inverseLower)
  const rawModes = eigensystem.values.map((eigenvalue, column) => {
    const transformedVector = eigensystem.vectors.map(row => row[column])
    let shape = matrixVector(inverseLowerTranspose, transformedVector)
    const modalMass = dot(shape, matrixVector(input.massMatrix, shape))
    shape = shape.map(value => value / Math.sqrt(modalMass))
    const largestIndex = shape.reduce((best, value, index) => Math.abs(value) > Math.abs(shape[best]) ? index : best, 0)
    if (shape[largestIndex] < 0) shape = shape.map(value => -value)
    return { eigenvalue, shape }
  }).sort((left, right) => left.eigenvalue - right.eigenvalue)
  const eigenScale = Math.max(1, ...rawModes.map(mode => Math.abs(mode.eigenvalue)))
  const negativeTolerance = eigenScale * 1e-10
  const selected = rawModes.slice(0, requestedModes)
  const modes: ModalMode[] = selected.map((mode, index) => {
    const eigenvalue = Math.abs(mode.eigenvalue) <= negativeTolerance ? 0 : mode.eigenvalue
    const angularFrequency = eigenvalue > 0 ? Math.sqrt(eigenvalue) : 0
    const stiffnessAction = matrixVector(input.stiffnessMatrix, mode.shape)
    const massAction = matrixVector(input.massMatrix, mode.shape)
    const residualVector = stiffnessAction.map((value, row) => value - eigenvalue * massAction[row])
    const residual = norm(residualVector) / Math.max(1, norm(stiffnessAction), Math.abs(eigenvalue) * norm(massAction))
    return {
      number: index + 1, eigenvalue, angularFrequency, frequency: angularFrequency / (2 * Math.PI),
      period: angularFrequency > 0 ? 2 * Math.PI / angularFrequency : null, shape: mode.shape, residual
    }
  })
  let maxMassOrthogonalityError = 0
  for (let i = 0; i < modes.length; i++) {
    for (let j = 0; j < modes.length; j++) {
      const product = dot(modes[i].shape, matrixVector(input.massMatrix, modes[j].shape))
      maxMassOrthogonalityError = Math.max(maxMassOrthogonalityError, Math.abs(product - (i === j ? 1 : 0)))
    }
  }
  const maxResidual = Math.max(...modes.map(mode => mode.residual))
  const negativeModes = rawModes.filter(mode => mode.eigenvalue < -negativeTolerance).length
  const rigidBodyModes = rawModes.filter(mode => Math.abs(mode.eigenvalue) <= negativeTolerance).length
  if (rigidBodyModes) issues.push({ level: 'warning', code: 'RIGID_BODY_MODES', message: `检测到 ${rigidBodyModes} 个零频刚体模态。` })
  const checks: CaeCheck[] = [
    {
      id: 'eigensolver-convergence', label: '特征值迭代收敛', status: eigensystem.converged ? 'pass' : 'fail',
      value: eigensystem.iterations, tolerance: maxIterations, message: eigensystem.converged ? `Jacobi 迭代在 ${eigensystem.iterations} 步内收敛。` : 'Jacobi 迭代未在上限内收敛。'
    },
    {
      id: 'positive-semidefinite-stiffness', label: '刚度半正定性', status: negativeModes === 0 ? 'pass' : 'fail',
      value: negativeModes, tolerance: 0, message: negativeModes ? `检测到 ${negativeModes} 个负特征值，模型可能不稳定。` : '未检测到超出数值容差的负特征值。'
    },
    {
      id: 'modal-residual', label: '模态方程残差', status: maxResidual <= 1e-9 ? 'pass' : 'fail',
      value: maxResidual, tolerance: 1e-9, message: `Kφ−λMφ 的最大归一化残差为 ${maxResidual.toExponential(3)}。`
    },
    {
      id: 'mass-orthogonality', label: '质量正交性', status: maxMassOrthogonalityError <= 1e-9 ? 'pass' : 'fail',
      value: maxMassOrthogonalityError, tolerance: 1e-9, message: `质量归一化正交误差为 ${maxMassOrthogonalityError.toExponential(3)}。`
    }
  ]
  const data: ModalData = {
    modes, eigenvalues: modes.map(mode => mode.eigenvalue), massNormalizedModeShapes: modes.map(mode => mode.shape),
    rigidBodyModes, eigensolverIterations: eigensystem.iterations, eigensolverConverged: eigensystem.converged,
    maxResidual, maxMassOrthogonalityError
  }
  return solvedResult('modal', '对称广义特征值/Jacobi', issues, checks, [
    { label: '自由度', value: size },
    { label: '输出模态', value: modes.length },
    { label: '一阶固有频率', value: modes.find(mode => mode.frequency > 0)?.frequency ?? 0, unit: 'Hz' },
    { label: '零频模态', value: rigidBodyModes },
    { label: '最大模态残差', value: maxResidual }
  ], data)
}

export function solveSdofModal(input: SdofModalInput) {
  return solveModal({ massMatrix: [[input.mass]], stiffnessMatrix: [[input.stiffness]], modes: 1 })
}

export function solveCae(caseDefinition: CaeCase): AnyCaeResult {
  if (caseDefinition.kind === 'bar-static') return solveBarStatic(caseDefinition.input)
  if (caseDefinition.kind === 'cantilever-beam') return solveCantileverBeam(caseDefinition.input)
  if (caseDefinition.kind === 'steady-heat-2d') return solveSteadyHeat2D(caseDefinition.input)
  return solveModal(caseDefinition.input)
}
