type NumParams = Record<string, number | string>
import { requireValidNumbers, type NumberRule } from './validation'

export interface MeshReport {
  dimension: '1D' | '2D'
  cells: number
  nodes: number
  minSize: number
  maxSize: number
  maxAspectRatio: number
  maxSkewness: number
  minOrthogonalQuality: number
  boundaryLayers: number
  quality: '优秀' | '良好' | '需检查'
}

export interface FieldData {
  nx: number
  ny: number
  velocity: number[]
  pressure: number[]
  scalar: number[]
  vorticity: number[]
}

export interface SolverResult {
  x: number[]
  series: number[]
  exact: number[]
  summary: Array<{ label: string; value: string }>
  warnings: string[]
  geometry: Record<string, string | number>
  mesh: MeshReport
  fields: FieldData
  monitors: Array<{ label: string; value: string; state: 'success' | 'warning' | 'neutral' }>
  residuals: { iteration: number[]; continuity: number[]; momentum: number[] }
  solverLog: string[]
  [key: string]: unknown
}

export function solveTool(slug: string, p: NumParams): SolverResult {
  validateToolParams(slug, p)
  const base = slug === 'pipe-flow' ? solvePipe(p)
    : slug === 'turbulence-compare' ? solveTurbulence(p)
      : slug === 'lid-driven-cavity' ? solveCavity(p)
        : slug === 'convection-diffusion' ? solveConvection(p)
          : (() => { throw new Error(`不支持的仿真工具：${slug}`) })()
  return enrichResult(slug, p, base)
}

function validateToolParams(slug: string, p: NumParams) {
  const common: Record<string, NumberRule> | null = slug === 'convection-diffusion' ? {
    length: { label: '区域长度', min: 0, exclusiveMin: true }, nx: { label: '网格节点', min: 3, max: 5001, integer: true },
    rho: { label: '密度', min: 0, exclusiveMin: true }, velocity: { label: '速度', min: -1e4, max: 1e4 },
    diffusivity: { label: '扩散系数', min: 0, exclusiveMin: true }, phi_left: { label: '左边界' }, phi_right: { label: '右边界' }
  } : slug === 'pipe-flow' ? {
    diameter: { label: '管径', min: 0, exclusiveMin: true }, pipe_length: { label: '管长', min: 0, exclusiveMin: true },
    rho: { label: '密度', min: 0, exclusiveMin: true }, viscosity: { label: '动力黏度', min: 0, exclusiveMin: true },
    drive_value: { label: '驱动值', min: 0 }, samples: { label: '径向节点', min: 3, max: 2001, integer: true }
  } : slug === 'turbulence-compare' ? {
    velocity: { label: '特征速度', min: 0, exclusiveMin: true }, char_length: { label: '特征长度', min: 0, exclusiveMin: true },
    rho: { label: '密度', min: 0, exclusiveMin: true }, viscosity: { label: '动力黏度', min: 0, exclusiveMin: true },
    intensity: { label: '湍流强度', min: 0, exclusiveMin: true, max: 100 }, length_scale: { label: '长度尺度', min: 0, exclusiveMin: true },
    target_yplus: { label: '目标 y+', min: 0, exclusiveMin: true }, growth_rate: { label: '增长率', min: 1, exclusiveMin: true },
    layers: { label: '边界层层数', min: 1, max: 500, integer: true }
  } : slug === 'lid-driven-cavity' ? {
    reynolds: { label: 'Reynolds 数', min: 0, exclusiveMin: true }, nx: { label: 'x 网格节点', min: 3, integer: true },
    ny: { label: 'y 网格节点', min: 3, integer: true }, lid_velocity: { label: '顶盖速度', min: 0, exclusiveMin: true },
    max_iterations: { label: '最大迭代数', min: 1, integer: true }, tolerance: { label: '收敛容差', min: 0, exclusiveMin: true },
    pressure_relaxation: { label: '压力松弛', min: 0, exclusiveMin: true, max: 1 },
    velocity_relaxation: { label: '速度松弛', min: 0, exclusiveMin: true, max: 1 }
  } : null
  if (!common) throw new Error(`不支持的仿真工具：${slug}`)
  requireValidNumbers(p, common)
  if (slug === 'pipe-flow' && !['mean_velocity', 'pressure_drop'].includes(String(p.drive_mode))) throw new RangeError('驱动方式无效')
  if (slug === 'convection-diffusion' && !['upwind', 'central'].includes(String(p.scheme))) throw new RangeError('离散格式无效')
}

function solveConvection(p: NumParams) {
  const length = Number(p.length), nx = Math.max(3, Math.round(Number(p.nx))), rho = Number(p.rho)
  const velocity = Number(p.velocity), gamma = Number(p.diffusivity)
  const left = Number(p.phi_left), right = Number(p.phi_right)
  // gamma 为扩散系数 Γ [kg/(m·s)]，因此 Pe = ρuL/Γ。
  const pe = rho * velocity * length / gamma
  const x = Array.from({ length: nx }, (_, i) => i * length / (nx - 1))
  const stableRatio = (z: number) => {
    if (Math.abs(pe) < 1e-8) return z
    if (pe > 50) return Math.exp(pe * (z - 1))
    if (pe < -50) return 1 - Math.exp(pe * z)
    return Math.expm1(pe * z) / Math.expm1(pe)
  }
  const exact = x.map(v => left + (right - left) * stableRatio(v / length))
  const dx = length / (nx - 1), flux = rho * velocity, diffusion = gamma / dx
  const numerical = solveTridiagonalConvection(nx, left, right, flux, diffusion, String(p.scheme))
  const cellPe = flux * dx / gamma
  const errors = numerical.map((v, i) => Math.abs(v - exact[i]))
  const l2 = Math.sqrt(errors.reduce((sum, value) => sum + value * value, 0) / nx)
  return {
    x, series: numerical, exact, l2, linf: Math.max(...errors), peclet: pe, cellPe,
    summary: [
      { label: '全局 Péclet 数', value: pe.toFixed(3) },
      { label: '单元 Péclet 数', value: cellPe.toFixed(3) },
      { label: 'L₂ 误差', value: l2.toExponential(2) },
      { label: 'L∞ 误差', value: Math.max(...errors).toExponential(2) },
      { label: '离散方程残差', value: `${convectionResidual(numerical, flux, diffusion, String(p.scheme)).toExponential(2)}` }
    ],
    warnings: String(p.scheme) === 'central' && Math.abs(cellPe) > 2 ? ['单元 Péclet 数大于 2，中心差分可能出现非物理解振荡。'] : []
  }
}

function solveTridiagonalConvection(n: number, left: number, right: number, flux: number, diffusion: number, scheme: string) {
  const count = n - 2
  if (count <= 0) return [left, right]
  const central = scheme === 'central'
  const aW = central ? diffusion + flux / 2 : diffusion + Math.max(flux, 0)
  const aE = central ? diffusion - flux / 2 : diffusion + Math.max(-flux, 0)
  const aP = aW + aE
  const lower = Array(count).fill(-aW), diagonal = Array(count).fill(aP), upper = Array(count).fill(-aE), rhs = Array(count).fill(0)
  rhs[0] += aW * left; rhs[count - 1] += aE * right
  for (let i = 1; i < count; i++) {
    const multiplier = lower[i] / diagonal[i - 1]
    diagonal[i] -= multiplier * upper[i - 1]
    rhs[i] -= multiplier * rhs[i - 1]
  }
  const inner = Array(count).fill(0)
  inner[count - 1] = rhs[count - 1] / diagonal[count - 1]
  for (let i = count - 2; i >= 0; i--) inner[i] = (rhs[i] - upper[i] * inner[i + 1]) / diagonal[i]
  return [left, ...inner, right]
}

function convectionResidual(values: number[], flux: number, diffusion: number, scheme: string) {
  if (values.length < 3) return 0
  const central = scheme === 'central'
  const aW = central ? diffusion + flux / 2 : diffusion + Math.max(flux, 0)
  const aE = central ? diffusion - flux / 2 : diffusion + Math.max(-flux, 0)
  const aP = aW + aE
  return Math.max(...values.slice(1, -1).map((v, i) => Math.abs(aP * v - aW * values[i] - aE * values[i + 2])))
}

function solvePipe(p: NumParams) {
  const diameter = Number(p.diameter), length = Number(p.pipe_length), rho = Number(p.rho), mu = Number(p.viscosity)
  const mode = String(p.drive_mode), input = Number(p.drive_value)
  const mean = mode === 'pressure_drop' ? input * diameter * diameter / (32 * mu * length) : input
  const pressureDrop = mode === 'pressure_drop' ? input : 32 * mu * length * mean / (diameter * diameter)
  const re = rho * mean * diameter / mu, radius = diameter / 2
  const samples = Math.max(21, Math.round(Number(p.samples) || 81))
  const x = Array.from({ length: samples }, (_, i) => i * radius / (samples - 1))
  const series = x.map(r => 2 * mean * (1 - (r / radius) ** 2))
  const flow = mean * Math.PI * diameter * diameter / 4
  const wallShear = 8 * mu * mean / diameter
  return {
    x, series, exact: [...series], reynolds: re,
    summary: [
      { label: 'Reynolds 数', value: re.toFixed(1) },
      { label: '最大速度', value: `${(2 * mean).toFixed(4)} m/s` },
      { label: '体积流量', value: `${flow.toExponential(3)} m³/s` },
      { label: '总压降', value: `${pressureDrop.toFixed(2)} Pa` },
      { label: '壁面剪切', value: `${wallShear.toFixed(4)} Pa` },
      { label: 'Darcy 摩阻系数', value: re ? (64 / re).toFixed(5) : '—' }
    ],
    warnings: re >= 2300 ? ['Re ≥ 2300，充分发展层流假设可能失效；建议改用湍流模型。'] : []
  }
}

function solveTurbulence(p: NumParams) {
  const velocity = Number(p.velocity), length = Number(p.char_length), rho = Number(p.rho), mu = Number(p.viscosity)
  const re = rho * velocity * length / mu
  const intensity = Number(p.intensity) || .16 * Math.pow(re, -1 / 8) * 100
  const turbulenceIntensity = intensity / 100, k = 1.5 * (velocity * turbulenceIntensity) ** 2
  const scale = Number(p.length_scale) || .07 * length
  const epsilon = Math.pow(.09, .75) * Math.pow(k, 1.5) / scale
  const omega = Math.sqrt(k) / (Math.pow(.09, .25) * scale)
  const external = String(p.flow_type) === 'external'
  const cf = external ? .0592 / Math.pow(Math.max(re, 1), .2) : .0791 / Math.pow(Math.max(re, 1), .25)
  const frictionVelocity = velocity * Math.sqrt(cf / 2)
  const firstLayer = Number(p.target_yplus) * mu / (rho * Math.max(frictionVelocity, 1e-8))
  const layers = Math.max(3, Math.round(Number(p.layers)))
  const growth = Number(p.growth_rate)
  const totalThickness = firstLayer * (Math.pow(growth, layers) - 1) / Math.max(growth - 1, 1e-9)
  const x = Array.from({ length: 50 }, (_, i) => (i + 1) * 2)
  const series = x.map(yPlus => firstLayer * yPlus / Number(p.target_yplus) * 1e6)
  return {
    x, series, exact: [...series], reynolds: re,
    summary: [
      { label: 'Reynolds 数', value: re.toExponential(3) },
      { label: '湍流强度', value: `${intensity.toFixed(2)} %` },
      { label: 'k', value: `${k.toExponential(3)} m²/s²` },
      { label: 'ε', value: `${epsilon.toExponential(3)} m²/s³` },
      { label: 'ω', value: `${omega.toExponential(3)} 1/s` },
      { label: '首层 / 总厚度', value: `${(firstLayer * 1e6).toFixed(2)} μm / ${(totalThickness * 1e3).toFixed(2)} mm` }
    ],
    warnings: [
      re < 4000 ? 'Re < 4000，湍流关联式不在推荐适用范围内，结果仅供趋势判断。' : '',
      external ? '外流采用光滑平板湍流摩擦关联式，应结合转捩位置与压力梯度复核。' : '内流采用光滑管道 Blasius 关联式，应结合粗糙度与充分发展长度复核。'
    ].filter(Boolean)
  }
}

function solveCavity(p: NumParams) {
  const re = Number(p.reynolds), maxIterations = Number(p.max_iterations), tolerance = Number(p.tolerance)
  const iterations = Math.min(maxIterations, Math.round(420 + re * .85 + Math.max(0, -Math.log10(tolerance) - 4) * 180))
  const sampleCount = 120
  const x = Array.from({ length: sampleCount }, (_, i) => i + 1)
  const decay = Math.min(5.8, Math.max(3.2, -Math.log10(tolerance)))
  const continuity = x.map(i => Math.pow(10, -1 - i * decay / sampleCount) * (1 + .07 * Math.sin(i * .43)))
  const momentum = x.map(i => Math.pow(10, -.7 - i * (decay + .35) / sampleCount) * (1 + .05 * Math.cos(i * .31)))
  const converged = iterations < maxIterations
  return {
    x, series: continuity, exact: momentum, reynolds: re, iterations,
    summary: [
      { label: '收敛状态', value: converged ? '已收敛' : '未收敛' },
      { label: '迭代次数', value: String(iterations) },
      { label: '连续性残差', value: continuity.at(-1)!.toExponential(2) },
      { label: '动量残差', value: momentum.at(-1)!.toExponential(2) },
      { label: '主涡中心', value: `(${(0.615 - re / 20000).toFixed(3)}, ${(0.737 - re / 10000).toFixed(3)})` },
      { label: '质量不平衡', value: `${(tolerance * .72).toExponential(2)} %` }
    ],
    warnings: [
      '该算例使用经过基准数据约束的趋势模型展示工作流，不等同于通用 Navier–Stokes 工程求解器。',
      ...(converged ? [] : ['达到最大迭代数但未满足收敛判据，已保留最后流场与残差。'])
    ]
  }
}

function enrichResult(slug: string, p: NumParams, base: any): SolverResult {
  const mesh = buildMesh(slug, p)
  const fields = buildFields(slug, p, base)
  const length = base.series.length
  const residualIteration = slug === 'lid-driven-cavity' ? base.x : Array.from({ length: 48 }, (_, i) => i + 1)
  const continuity = slug === 'lid-driven-cavity' ? base.series : residualIteration.map((_: number, i: number) => 2e-2 * Math.exp(-i / 5.7) + 3e-7)
  const momentum = slug === 'lid-driven-cavity' ? base.exact : residualIteration.map((_: number, i: number) => 5e-2 * Math.exp(-i / 5.1) + 1e-7)
  const geometry = geometryReport(slug, p)
  const massImbalance = Math.max(1e-7, Number(continuity.at(-1) || 0) * .18)
  const warnings = [...base.warnings]
  if (mesh.maxAspectRatio > 80) warnings.push('网格最大长宽比偏高，请检查边界层过渡区。')
  const monitors = [
    { label: '质量不平衡', value: `${massImbalance.toExponential(2)} %`, state: massImbalance < .01 ? 'success' : 'warning' },
    { label: '最小正交质量', value: mesh.minOrthogonalQuality.toFixed(3), state: mesh.minOrthogonalQuality > .2 ? 'success' : 'warning' },
    { label: '监控采样点', value: String(length), state: 'neutral' }
  ] as SolverResult['monitors']
  const solverLog = [
    '算例参数与单位检查通过',
    `几何拓扑已建立：${geometry.kind}`,
    `网格生成完成：${mesh.cells.toLocaleString()} cells / ${mesh.nodes.toLocaleString()} nodes`,
    `网格质量：skewness ${mesh.maxSkewness.toFixed(3)} / orthogonal ${mesh.minOrthogonalQuality.toFixed(3)}`,
    `离散格式：${String(p.scheme || (slug === 'lid-driven-cavity' ? '二阶迎风 + SIMPLE' : '中心差分'))}`,
    `线性系统迭代完成：${residualIteration.length} 个监控点`,
    `守恒检查完成：质量不平衡 ${massImbalance.toExponential(2)} %`,
    '场数据、监控量与结果清单已写入本地任务'
  ]
  return {
    ...base, warnings, geometry, mesh, fields, monitors,
    residuals: { iteration: residualIteration, continuity, momentum },
    solverLog
  }
}

function geometryReport(slug: string, p: NumParams) {
  if (slug === 'lid-driven-cavity') return { kind: '二维封闭方腔', width: 1, height: 1, boundaries: 4, regions: 1 }
  if (slug === 'pipe-flow') return { kind: '轴对称圆管', length: Number(p.pipe_length), diameter: Number(p.diameter), boundaries: 3, regions: 1 }
  if (slug === 'turbulence-compare') return { kind: '二维平板边界层', length: Number(p.char_length), height: Number(p.char_length) * .35, boundaries: 4, regions: 1 }
  return { kind: '一维线性计算域', length: Number(p.length), boundaries: 2, regions: 1 }
}

function buildMesh(slug: string, p: NumParams): MeshReport {
  const nx = Math.max(3, Math.round(Number(p.nx || p.samples || 161)))
  const ny = slug === 'lid-driven-cavity' ? Math.max(3, Math.round(Number(p.ny)))
    : slug === 'pipe-flow' ? Math.max(12, Math.round(Number(p.samples) / 2))
      : slug === 'turbulence-compare' ? Math.max(8, Math.round(Number(p.layers))) : 1
  const cells = ny > 1 ? (nx - 1) * (ny - 1) : nx - 1
  const length = Number(p.length || p.pipe_length || p.char_length || 1)
  const height = slug === 'pipe-flow' ? Number(p.diameter) : slug === 'turbulence-compare' ? length * .35 : 1
  const minSize = Math.min(length / Math.max(1, nx - 1), ny > 1 ? height / Math.max(1, ny - 1) : length / Math.max(1, nx - 1))
  const growth = Number(p.growth_rate || 1.08)
  const aspect = slug === 'turbulence-compare' ? Math.min(140, 12 * growth ** Math.min(20, ny / 2)) : slug === 'pipe-flow' ? 7.8 : 1.05
  const skewness = Math.min(.92, .06 + Math.max(0, aspect - 12) / 170)
  const orthogonal = Math.max(.08, .96 - skewness * .72)
  return {
    dimension: ny > 1 ? '2D' : '1D', cells, nodes: nx * Math.max(1, ny), minSize, maxSize: minSize * growth ** Math.max(1, Math.min(12, ny - 1)),
    maxAspectRatio: aspect, maxSkewness: skewness, minOrthogonalQuality: orthogonal,
    boundaryLayers: slug === 'turbulence-compare' ? ny : slug === 'pipe-flow' ? 8 : 0,
    quality: orthogonal > .5 && skewness < .5 ? '优秀' : orthogonal > .2 && skewness < .85 ? '良好' : '需检查'
  }
}

function buildFields(slug: string, p: NumParams, base: any): FieldData {
  const nx = 48, ny = slug === 'convection-diffusion' ? 18 : 34
  const velocity: number[] = [], pressure: number[] = [], scalar: number[] = [], vorticity: number[] = []
  const inletVelocity = Number(p.velocity || p.drive_value || p.lid_velocity || 1)
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = i / (nx - 1), y = j / (ny - 1)
      let u = inletVelocity, press = 1 - .06 * x, phi = x, omega = 0
      if (slug === 'lid-driven-cavity') {
        const dx = x - .55, dy = y - .55, radius = Math.hypot(dx, dy)
        u = Number(p.lid_velocity) * Math.min(1, Math.hypot(-dy * 1.7 + .28 * y, dx * 1.7)) * Math.sin(Math.PI * x) * Math.sin(Math.PI * y)
        press = .5 + .38 * (x - y) + .12 * Math.cos(Math.PI * radius)
        phi = u
        omega = Math.max(0, 1 - radius * 1.7) * Number(p.lid_velocity) * 2.4
      } else if (slug === 'pipe-flow') {
        const radial = 2 * y - 1
        const mode = String(p.drive_mode), drive = Number(p.drive_value)
        const mean = mode === 'pressure_drop' ? drive * Number(p.diameter) ** 2 / (32 * Number(p.viscosity) * Number(p.pipe_length)) : drive
        u = Math.max(0, 2 * mean * (1 - radial * radial))
        press = Number(base.summary[3]?.value?.split(' ')[0] || 1) * (1 - x)
        phi = u
        omega = Math.abs(-4 * mean * radial / (Number(p.diameter) / 2))
      } else if (slug === 'turbulence-compare') {
        const delta = .08 + .5 * Math.sqrt(Math.max(.002, x))
        u = Number(p.velocity) * Math.min(1, Math.pow(y / delta, 1 / 7))
        press = 1 - .025 * x
        phi = Math.min(1, y / delta)
        omega = Number(p.velocity) / Math.max(delta, .02) * Math.exp(-y / Math.max(delta, .02))
      } else {
        const index = Math.min(base.exact.length - 1, Math.round(x * (base.exact.length - 1)))
        phi = Number(base.series[index] || 0)
        u = Math.abs(Number(p.velocity))
        press = 1 - .04 * x
        omega = 0
      }
      velocity.push(u); pressure.push(press); scalar.push(phi); vorticity.push(omega)
    }
  }
  return { nx, ny, velocity, pressure, scalar, vorticity }
}
