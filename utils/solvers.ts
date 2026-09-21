type NumParams = Record<string, number | string>

export class SolverInputError extends Error {
  constructor(message: string) { super(message); this.name = 'SolverInputError' }
}

function finite(p: NumParams, key: string, label: string, min?: number, max?: number) {
  const value = Number(p[key])
  if (!Number.isFinite(value)) throw new SolverInputError(`${label}必须是有限数值。`)
  if (min !== undefined && value < min) throw new SolverInputError(`${label}不能小于 ${min}。`)
  if (max !== undefined && value > max) throw new SolverInputError(`${label}不能大于 ${max}。`)
  return value
}

function integer(p: NumParams, key: string, label: string, min: number, max: number) {
  const value = finite(p, key, label, min, max)
  if (!Number.isInteger(value)) throw new SolverInputError(`${label}必须是整数。`)
  return value
}

export function solveTool(slug: string, p: NumParams) {
  if (slug === 'pipe-flow') return solvePipe(p)
  if (slug === 'turbulence-compare') return solveTurbulence(p)
  if (slug === 'lid-driven-cavity') return solveCavity(p)
  if (slug === 'convection-diffusion') return solveConvection(p)
  throw new SolverInputError(`不支持的求解工具：${slug}`)
}

function solveTridiagonal(lower: number[], diagonal: number[], upper: number[], rhs: number[]) {
  const n = diagonal.length, c = [...upper], d = [...rhs], b = [...diagonal]
  for (let i = 1; i < n; i++) {
    if (Math.abs(b[i - 1]) < 1e-14) throw new SolverInputError('离散矩阵接近奇异，请调整网格或离散格式。')
    const ratio = lower[i] / b[i - 1]
    b[i] -= ratio * c[i - 1]
    d[i] -= ratio * d[i - 1]
  }
  const x = Array<number>(n)
  if (Math.abs(b[n - 1]) < 1e-14) throw new SolverInputError('离散矩阵接近奇异，请调整网格或离散格式。')
  x[n - 1] = d[n - 1] / b[n - 1]
  for (let i = n - 2; i >= 0; i--) x[i] = (d[i] - c[i] * x[i + 1]) / b[i]
  return x
}

function solveConvection(p: NumParams) {
  const length = finite(p, 'length', '区域长度', .01, 100), nx = integer(p, 'nx', '网格数', 21, 1001)
  const rho = finite(p, 'rho', '密度', .001, 10000), velocity = finite(p, 'velocity', '速度', -1000, 1000)
  const gamma = finite(p, 'diffusivity', '扩散系数', 1e-8, 1000), left = finite(p, 'phi_left', '左边界', -1e6, 1e6), right = finite(p, 'phi_right', '右边界', -1e6, 1e6)
  const scheme = String(p.scheme)
  if (!['upwind', 'central'].includes(scheme)) throw new SolverInputError('离散格式无效。')
  const dx = length / (nx - 1), flux = rho * velocity, diffusion = gamma / dx
  const interior = nx - 2, lower = Array(interior).fill(0), diagonal = Array(interior).fill(0), upper = Array(interior).fill(0), rhs = Array(interior).fill(0)
  for (let row = 0; row < interior; row++) {
    const aW = scheme === 'central' ? diffusion + flux / 2 : diffusion + Math.max(flux, 0)
    const aE = scheme === 'central' ? diffusion - flux / 2 : diffusion + Math.max(-flux, 0)
    lower[row] = row ? -aW : 0
    diagonal[row] = aW + aE
    upper[row] = row < interior - 1 ? -aE : 0
    if (row === 0) rhs[row] += aW * left
    if (row === interior - 1) rhs[row] += aE * right
  }
  const numerical = [left, ...solveTridiagonal(lower, diagonal, upper, rhs), right]
  const pe = rho * velocity * length / gamma, cellPe = pe / (nx - 1)
  const stableRatio = (z: number) => {
    if (Math.abs(pe) < 1e-8) return z
    if (pe > 50) return z >= 1 ? 1 : Math.exp(pe * (z - 1))
    if (pe < -50) return z <= 0 ? 0 : 1 - Math.exp(pe * z)
    return Math.expm1(pe * z) / Math.expm1(pe)
  }
  const x = Array.from({ length: nx }, (_, i) => i * dx), exact = x.map(value => left + (right - left) * stableRatio(value / length))
  const errors = numerical.map((value, i) => Math.abs(value - exact[i])), l2 = Math.sqrt(errors.reduce((sum, value) => sum + value * value, 0) / nx), linf = Math.max(...errors)
  const minValue = Math.min(...numerical), maxValue = Math.max(...numerical)
  const lowerBound = Math.min(left, right), upperBound = Math.max(left, right)
  const bounded = minValue >= lowerBound - 1e-9 && maxValue <= upperBound + 1e-9
  const warnings: string[] = []
  if (scheme === 'central' && Math.abs(cellPe) > 2) warnings.push('单元 Péclet 数大于 2，中心差分系数失去有界性，结果可能振荡。')
  return { x, series: numerical, exact, l2, linf, peclet: pe, cellPe, bounded, minValue, maxValue, summary: [{ label: '全局 Péclet 数', value: pe.toFixed(3) }, { label: '单元 Péclet 数', value: cellPe.toFixed(3) }, { label: 'L₂ 误差', value: l2.toExponential(2) }, { label: 'L∞ 误差', value: linf.toExponential(2) }, { label: '有界性', value: bounded ? '通过' : '存在超调' }], warnings }
}

function solvePipe(p: NumParams) {
  const d = finite(p, 'diameter', '管径', .001, 10), length = finite(p, 'pipe_length', '管长', .01, 1000)
  const rho = finite(p, 'rho', '密度', .1, 10000), mu = finite(p, 'viscosity', '动力黏度', 1e-7, 100), input = finite(p, 'drive_value', '驱动值', .0001, 1e7)
  const samples = integer(p, 'samples', '径向采样点', 21, 501), mode = String(p.drive_mode)
  if (!['mean_velocity', 'pressure_drop'].includes(mode)) throw new SolverInputError('驱动方式无效。')
  const mean = mode === 'pressure_drop' ? input * d * d / (32 * mu * length) : input
  const dp = mode === 'pressure_drop' ? input : 32 * mu * length * mean / (d * d), re = rho * mean * d / mu, radius = d / 2
  const x = Array.from({ length: samples }, (_, i) => i * radius / (samples - 1)), series = x.map(r => 2 * mean * (1 - (r / radius) ** 2)), flow = mean * Math.PI * d * d / 4
  const wallShear = 8 * mu * mean / d
  const entranceLength = .05 * re * d
  return { x, series, exact: [...series], reynolds: re, meanVelocity: mean, maxVelocity: 2 * mean, flowRate: flow, pressureDrop: dp, frictionFactor: 64 / re, wallShear, entranceLength, summary: [{ label: 'Reynolds 数', value: re.toFixed(1) }, { label: '最大速度', value: `${(2 * mean).toFixed(4)} m/s` }, { label: '体积流量', value: `${flow.toExponential(3)} m³/s` }, { label: '压降', value: `${dp.toFixed(2)} Pa` }, { label: '壁面剪切', value: `${wallShear.toFixed(4)} Pa` }, { label: '入口段估算', value: `${entranceLength.toFixed(3)} m` }], warnings: re >= 2300 ? ['Re ≥ 2300，充分发展层流假设可能失效；本结果仅用于理论演示。'] : entranceLength > length ? [`估算入口段长度 ${entranceLength.toFixed(3)} m 大于管长，充分发展假设不成立。`] : [] }
}

function solveTurbulence(p: NumParams) {
  const u = finite(p, 'velocity', '特征速度', .001, 3000), length = finite(p, 'char_length', '特征长度', .0001, 100)
  const rho = finite(p, 'rho', '密度', .001, 10000), mu = finite(p, 'viscosity', '动力黏度', 1e-8, 10)
  const intensity = finite(p, 'intensity', '湍流强度', .01, 50), l = finite(p, 'length_scale', '长度尺度', 1e-6, 100)
  const targetYPlus = finite(p, 'target_yplus', '目标 y+', .1, 300), growth = finite(p, 'growth_rate', '增长率', 1.01, 2), layers = integer(p, 'layers', '边界层层数', 3, 100)
  const flowType = String(p.flow_type)
  if (!['internal', 'external'].includes(flowType)) throw new SolverInputError('流动类型无效。')
  const re = rho * u * length / mu, I = intensity / 100, k = 1.5 * (u * I) ** 2
  const epsilon = Math.pow(.09, .75) * Math.pow(k, 1.5) / l, omega = Math.sqrt(k) / (Math.pow(.09, .25) * l)
  const cf = flowType === 'internal' ? .0791 / Math.pow(Math.max(re, 1), .25) : .026 / Math.pow(Math.max(re, 1), 1 / 7)
  const utau = u * Math.sqrt(cf / 2), firstLayer = targetYPlus * mu / (rho * Math.max(utau, 1e-12))
  const x = Array.from({ length: layers }, (_, i) => i + 1), series: number[] = []
  let cumulative = 0
  for (let i = 0; i < layers; i++) { cumulative += firstLayer * growth ** i; series.push(cumulative * 1e6) }
  return { x, series, exact: [], reynolds: re, turbulenceK: k, epsilon, omega, frictionCoefficient: cf, frictionVelocity: utau, firstLayerHeight: firstLayer, boundaryLayerThickness: cumulative, summary: [{ label: 'Reynolds 数', value: re.toExponential(3) }, { label: '摩擦速度', value: `${utau.toFixed(4)} m/s` }, { label: 'k', value: `${k.toExponential(3)} m²/s²` }, { label: 'ε', value: `${epsilon.toExponential(3)} m²/s³` }, { label: 'ω', value: `${omega.toExponential(3)} 1/s` }, { label: '首层高度', value: `${(firstLayer * 1e6).toFixed(2)} μm` }, { label: '边界层总厚度', value: `${cumulative.toFixed(5)} m` }], warnings: ['结果基于光滑壁工程关联式估算，必须结合目标壁面处理和网格无关性分析复核。'] }
}

function solveCavity(p: NumParams) {
  const re = finite(p, 'reynolds', 'Reynolds 数', 10, 1000), nx = integer(p, 'nx', 'x 网格数', 33, 129), ny = integer(p, 'ny', 'y 网格数', 33, 129)
  const lid = finite(p, 'lid_velocity', '顶盖速度', .01, 100), maxIterations = integer(p, 'max_iterations', '最大迭代数', 100, 20000), tolerance = finite(p, 'tolerance', '收敛容差', 1e-8, 1e-4)
  const pressureRelax = finite(p, 'pressure_relaxation', '压力松弛因子', .1, .8), velocityRelax = finite(p, 'velocity_relaxation', '速度松弛因子', .1, 1)
  const aspectRatio = p.aspect_ratio === undefined ? 1 : finite(p, 'aspect_ratio', '计算域宽高比', .2, 5)
  const actualNx = Math.min(65, nx), actualNy = Math.min(65, ny)
  const hx = aspectRatio / (actualNx - 1), hy = 1 / (actualNy - 1), minSpacing = Math.min(hx, hy), size = actualNx * actualNy
  let psi = new Float64Array(size), omega = new Float64Array(size), nextOmega = new Float64Array(size)
  const viscosity = lid / re
  const diffusionStep = .1 / (viscosity * (1 / (hx * hx) + 1 / (hy * hy)))
  const residuals: number[] = [], iterationsAxis: number[] = [], dt = Math.min(.2 * minSpacing / lid, diffusionStep), cap = Math.min(maxIterations, 5000)
  let converged = false, iterations = 0, lastResidual = Infinity
  const at = (i: number, j: number) => j * actualNx + i
  for (let iteration = 1; iteration <= cap; iteration++) {
    iterations = iteration
    for (let i = 1; i < actualNx - 1; i++) { omega[at(i, 0)] = -2 * psi[at(i, 1)] / (hy * hy); omega[at(i, actualNy - 1)] = -2 * psi[at(i, actualNy - 2)] / (hy * hy) - 2 * lid / hy }
    for (let j = 1; j < actualNy - 1; j++) { omega[at(0, j)] = -2 * psi[at(1, j)] / (hx * hx); omega[at(actualNx - 1, j)] = -2 * psi[at(actualNx - 2, j)] / (hx * hx) }
    let residual = 0
    for (let j = 1; j < actualNy - 1; j++) for (let i = 1; i < actualNx - 1; i++) {
      const index = at(i, j)
      const updated = ((psi[at(i + 1, j)] + psi[at(i - 1, j)]) / (hx * hx) + (psi[at(i, j + 1)] + psi[at(i, j - 1)]) / (hy * hy) + omega[index]) / (2 / (hx * hx) + 2 / (hy * hy))
      const change = pressureRelax * (updated - psi[index]); psi[index] += change; residual = Math.max(residual, Math.abs(change))
    }
    nextOmega.set(omega)
    for (let j = 1; j < actualNy - 1; j++) for (let i = 1; i < actualNx - 1; i++) {
      const index = at(i, j), u = (psi[at(i, j + 1)] - psi[at(i, j - 1)]) / (2 * hy), v = -(psi[at(i + 1, j)] - psi[at(i - 1, j)]) / (2 * hx)
      const laplace = (omega[at(i + 1, j)] - 2 * omega[index] + omega[at(i - 1, j)]) / (hx * hx) + (omega[at(i, j + 1)] - 2 * omega[index] + omega[at(i, j - 1)]) / (hy * hy)
      const convection = u * (omega[at(i + 1, j)] - omega[at(i - 1, j)]) / (2 * hx) + v * (omega[at(i, j + 1)] - omega[at(i, j - 1)]) / (2 * hy)
      const updated = omega[index] + velocityRelax * dt * (viscosity * laplace - convection); nextOmega[index] = updated; residual = Math.max(residual, Math.abs(updated - omega[index]) * minSpacing * minSpacing)
    }
    ;[omega, nextOmega] = [nextOmega, omega]
    const normalizedResidual = residual / lid
    lastResidual = Math.max(normalizedResidual, 1e-14)
    if (iteration === 1 || iteration % 10 === 0) { iterationsAxis.push(iteration); residuals.push(lastResidual) }
    if (iteration > 50 && normalizedResidual < tolerance) { converged = true; break }
  }
  if (iterationsAxis.at(-1) !== iterations) { iterationsAxis.push(iterations); residuals.push(lastResidual) }
  let minPsi = Infinity, vortexI = 0, vortexJ = 0
  for (let j = 1; j < actualNy - 1; j++) for (let i = 1; i < actualNx - 1; i++) if (psi[at(i, j)] < minPsi) { minPsi = psi[at(i, j)]; vortexI = i; vortexJ = j }
  const fieldNx = Math.min(25, actualNx), fieldNy = Math.min(25, actualNy)
  const fieldU: number[] = [], fieldV: number[] = [], fieldSpeed: number[] = []
  for (let sy = 0; sy < fieldNy; sy++) for (let sx = 0; sx < fieldNx; sx++) {
    const i = Math.min(actualNx - 2, Math.max(1, Math.round(sx * (actualNx - 1) / (fieldNx - 1))))
    const j = Math.min(actualNy - 2, Math.max(1, Math.round(sy * (actualNy - 1) / (fieldNy - 1))))
    const u = (psi[at(i, j + 1)] - psi[at(i, j - 1)]) / (2 * hy)
    const v = -(psi[at(i + 1, j)] - psi[at(i - 1, j)]) / (2 * hx)
    fieldU.push(u / lid); fieldV.push(v / lid); fieldSpeed.push(Math.hypot(u, v) / lid)
  }
  const warnings: string[] = []
  if (actualNx !== nx || actualNy !== ny) warnings.push(`浏览器求解器将 ${nx}×${ny} 网格降采样为 ${actualNx}×${actualNy}；高分辨率计算应使用后端求解器。`)
  if (maxIterations > 5000) warnings.push('浏览器计算最多执行 5000 次迭代，以避免页面长时间无响应。')
  if (!converged) warnings.push('迭代未达到目标容差；请降低 Reynolds 数、调整松弛因子或增加后端计算能力。')
  const vortexX = vortexI * hx / aspectRatio, vortexY = vortexJ * hy
  return { x: iterationsAxis, series: residuals, exact: [], reynolds: re, aspectRatio, iterations, converged, finalResidual: residuals.at(-1)!, vortexX, vortexY, actualNx, actualNy, field: { nx: fieldNx, ny: fieldNy, u: fieldU, v: fieldV, speed: fieldSpeed }, summary: [{ label: '收敛状态', value: converged ? '已收敛' : '未收敛' }, { label: '实际网格', value: `${actualNx} × ${actualNy}` }, { label: '迭代次数', value: String(iterations) }, { label: '最终残差', value: residuals.at(-1)!.toExponential(2) }, { label: '主涡中心', value: `(${vortexX.toFixed(3)}, ${vortexY.toFixed(3)})` }], warnings }
}
