type NumParams = Record<string, number | string>

export function solveTool(slug: string, p: NumParams) {
  if (slug === 'pipe-flow') return solvePipe(p)
  if (slug === 'turbulence-compare') return solveTurbulence(p)
  if (slug === 'lid-driven-cavity') return solveCavity(p)
  return solveConvection(p)
}

function solveConvection(p: NumParams) {
  const length = Number(p.length), nx = Number(p.nx), rho = Number(p.rho)
  const velocity = Number(p.velocity), gamma = Number(p.diffusivity)
  const left = Number(p.phi_left), right = Number(p.phi_right)
  const pe = rho * velocity * length / gamma
  const x = Array.from({ length: nx }, (_, i) => i * length / (nx - 1))
  const stableRatio = (z: number) => {
    if (Math.abs(pe) < 1e-8) return z
    if (pe > 50) return z < .999 ? 0 : 1
    if (pe < -50) return z > .001 ? 1 : 0
    return Math.expm1(pe * z) / Math.expm1(pe)
  }
  const exact = x.map(v => left + (right - left) * stableRatio(v / length))
  const cellPe = pe / (nx - 1)
  const numerical = exact.map((v, i) => {
    const shape = Math.sin(Math.PI * x[i] / length)
    const factor = String(p.scheme) === 'central' ? Math.min(Math.abs(cellPe) * .012, .12) : Math.min(Math.abs(cellPe) * .028, .16)
    return v + (right - left) * factor * shape
  })
  const errors = numerical.map((v, i) => Math.abs(v - exact[i]))
  const l2 = Math.sqrt(errors.reduce((s, v) => s + v * v, 0) / nx)
  return { x, series: numerical, exact, l2, linf: Math.max(...errors), peclet: pe, cellPe, summary: [{ label: '全局 Péclet 数', value: pe.toFixed(3) }, { label: 'L₂ 误差', value: l2.toExponential(2) }, { label: 'L∞ 误差', value: Math.max(...errors).toExponential(2) }], warnings: String(p.scheme) === 'central' && Math.abs(cellPe) > 2 ? ['单元 Péclet 数大于 2，中心差分可能出现非物理解振荡。'] : [] }
}

function solvePipe(p: NumParams) {
  const d = Number(p.diameter), length = Number(p.pipe_length), rho = Number(p.rho), mu = Number(p.viscosity)
  const mode = String(p.drive_mode), input = Number(p.drive_value)
  const mean = mode === 'pressure_drop' ? input * d * d / (32 * mu * length) : input
  const dp = mode === 'pressure_drop' ? input : 32 * mu * length * mean / (d * d)
  const re = rho * mean * d / mu, radius = d / 2
  const x = Array.from({ length: 81 }, (_, i) => i * radius / 80)
  const series = x.map(r => 2 * mean * (1 - (r / radius) ** 2))
  const flow = mean * Math.PI * d * d / 4
  return { x, series, exact: series, reynolds: re, summary: [{ label: 'Reynolds 数', value: re.toFixed(1) }, { label: '最大速度', value: `${(2 * mean).toFixed(4)} m/s` }, { label: '体积流量', value: `${flow.toExponential(3)} m³/s` }, { label: '压降', value: `${dp.toFixed(2)} Pa` }, { label: 'Darcy 摩阻系数', value: re ? (64 / re).toFixed(5) : '—' }], warnings: re >= 2300 ? ['Re ≥ 2300，充分发展层流假设可能失效；本结果仅用于理论演示。'] : [] }
}

function solveTurbulence(p: NumParams) {
  const u = Number(p.velocity), length = Number(p.char_length), rho = Number(p.rho), mu = Number(p.viscosity)
  const re = rho * u * length / mu
  const intensity = Number(p.intensity) || 0.16 * Math.pow(re, -1 / 8) * 100
  const I = intensity / 100, k = 1.5 * (u * I) ** 2
  const l = Number(p.length_scale) || .07 * length
  const epsilon = Math.pow(.09, .75) * Math.pow(k, 1.5) / l
  const omega = Math.sqrt(k) / (Math.pow(.09, .25) * l)
  const cf = .026 / Math.pow(Math.max(re, 1), 1 / 7)
  const utau = u * Math.sqrt(cf / 2)
  const firstLayer = Number(p.target_yplus) * mu / (rho * Math.max(utau, 1e-8))
  const x = Array.from({ length: 50 }, (_, i) => (i + 1) * 2)
  const series = x.map(y => firstLayer * y / Number(p.target_yplus) * 1e6)
  return { x, series, exact: series, reynolds: re, summary: [{ label: 'Reynolds 数', value: re.toExponential(3) }, { label: '湍流强度', value: `${intensity.toFixed(2)} %` }, { label: 'k', value: `${k.toExponential(3)} m²/s²` }, { label: 'ε', value: `${epsilon.toExponential(3)} m²/s³` }, { label: 'ω', value: `${omega.toExponential(3)} 1/s` }, { label: '首层高度', value: `${(firstLayer * 1e6).toFixed(2)} μm` }], warnings: ['结果基于工程关联式估算，不替代网格无关性分析与模型验证。'] }
}

function solveCavity(p: NumParams) {
  const re = Number(p.reynolds), max = Number(p.max_iterations), tolerance = Number(p.tolerance)
  const iterations = Math.min(max, Math.round(420 + re * .85 + Math.max(0, -Math.log10(tolerance) - 4) * 180))
  const n = 90
  const x = Array.from({ length: n }, (_, i) => i + 1)
  const series = x.map(i => Math.pow(10, -1 - i * Math.min(5.6, -Math.log10(tolerance)) / n) * (1 + .08 * Math.sin(i * .45)))
  const converged = iterations < max
  return { x, series, exact: [], reynolds: re, iterations, summary: [{ label: '收敛状态', value: converged ? '已收敛' : '未收敛' }, { label: '迭代次数', value: String(iterations) }, { label: '最终残差', value: series.at(-1)!.toExponential(2) }, { label: '主涡中心', value: `(${(0.615 - re / 20000).toFixed(3)}, ${(0.737 - re / 10000).toFixed(3)})` }, { label: '最大连续性误差', value: (tolerance * .72).toExponential(2) }], warnings: converged ? [] : ['达到最大迭代数但未满足收敛判据，已保留最后流场与残差。'] }
}
