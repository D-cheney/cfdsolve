import type { ModelicaDiagram, ModelicaDiagramNode, ModelicaExperiment, ModelicaRun, ModelicaSeries, ModelicaSolver } from '~/types/platform'

export interface ModelicaDiagnostic {
  severity: 'error' | 'warning' | 'info'
  line: number
  code: string
  text: string
}

export interface ModelicaSymbol {
  name: string
  kind: 'parameter' | 'variable'
  type: string
  line: number
  unit?: string
  value?: number
  start?: number
}

export interface ModelicaAnalysis {
  modelName?: string
  symbols: ModelicaSymbol[]
  diagnostics: ModelicaDiagnostic[]
  equationCount: number
}

export const defaultModelicaExperiment = (): ModelicaExperiment => ({ startTime: 0, stopTime: 4, interval: 0.025, solver: 'RK4', tolerance: 1e-6 })

const node = (id: string, kind: ModelicaDiagramNode['kind'], label: string, x: number, y: number, parameters: Record<string, number> = {}): ModelicaDiagramNode => ({ id, kind, label, x, y, parameters })
export function defaultModelicaDiagram(modelName = 'MassSpringDamper'): ModelicaDiagram {
  if (modelName === 'ThermalNetwork') return { nodes: [node('heat', 'source', '热源 Q', 50, 130, { Q: 120 }), node('C1', 'thermal-capacity', '热容 C1', 220, 130, { C1: 1200 }), node('R', 'thermal-resistance', '热阻 R', 410, 130, { R: .8 }), node('C2', 'thermal-capacity', '热容 C2', 600, 130, { C2: 900 }), node('T1', 'sensor', '温度 T1', 220, 300), node('T2', 'sensor', '温度 T2', 600, 300)], links: [{ id: 'l1', from: 'heat', to: 'C1', type: 'physical' }, { id: 'l2', from: 'C1', to: 'R', type: 'physical' }, { id: 'l3', from: 'R', to: 'C2', type: 'physical' }, { id: 'l4', from: 'C1', to: 'T1', type: 'signal' }, { id: 'l5', from: 'C2', to: 'T2', type: 'signal' }] }
  if (modelName === 'HydraulicCircuit') return { nodes: [node('input', 'source', '压力源 pIn', 55, 145, { pIn: 100 }), node('volume', 'fluid-volume', '容腔 C', 310, 145, { C: .02 }), node('resistance', 'fluid-resistance', '阻力 R', 550, 145, { R: 1.8 }), node('pressure', 'sensor', '压力 p', 310, 310)], links: [{ id: 'l1', from: 'input', to: 'volume', type: 'physical' }, { id: 'l2', from: 'volume', to: 'resistance', type: 'physical' }, { id: 'l3', from: 'volume', to: 'pressure', type: 'signal' }] }
  if (modelName === 'SingleSpool') return { nodes: [node('drive', 'source', '驱动扭矩', 55, 145, { tauDrive: 18 }), node('shaft', 'shaft', '转子 J', 320, 145, { J: 2.5, d: .12 }), node('load', 'load', '负载扭矩', 590, 145, { tauLoad: 5 }), node('speed', 'sensor', '转速 ω', 320, 310)], links: [{ id: 'l1', from: 'drive', to: 'shaft', type: 'physical' }, { id: 'l2', from: 'shaft', to: 'load', type: 'physical' }, { id: 'l3', from: 'shaft', to: 'speed', type: 'signal' }] }
  return { nodes: [node('fixed', 'source', '固定端', 45, 145), node('spring', 'spring', '弹簧 k', 235, 145, { k: 100 }), node('damper', 'damper', '阻尼 c', 430, 145, { c: .5 }), node('mass', 'mass', '质量 m', 625, 145, { m: 1 }), node('position', 'sensor', '位移 x', 625, 310)], links: [{ id: 'l1', from: 'fixed', to: 'spring', type: 'physical' }, { id: 'l2', from: 'spring', to: 'damper', type: 'physical' }, { id: 'l3', from: 'damper', to: 'mass', type: 'physical' }, { id: 'l4', from: 'mass', to: 'position', type: 'signal' }] }
}

const asNumber = (text: string | undefined) => {
  if (!text) return undefined
  const value = Number(text.trim())
  return Number.isFinite(value) ? value : undefined
}

const unitFrom = (line: string) => line.match(/unit\s*=\s*"([^"]+)"/)?.[1]
const optionFrom = (line: string, option: string) => line.match(new RegExp(`${option}\\s*=\\s*([-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?)`))?.[1]

function stripModelicaComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, '')
}

const supportedEquationSignatures: Record<string, string[]> = {
  MassSpringDamper: ['der(x)=v', 'm*der(v)+c*v+k*x=0'],
  ThermalNetwork: ['C1*der(T1)=Q-(T1-T2)/R', 'C2*der(T2)=(T1-T2)/R'],
  HydraulicCircuit: ['C*der(p)=(pIn-p)/R', 'q=(pIn-p)/R'],
  SingleSpool: ['J*der(omega)=tauDrive-tauLoad-d*omega']
}

function normalizedEquations(source: string, modelName: string) {
  const clean = stripModelicaComments(source)
  const escapedName = modelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = new RegExp(`\\bequation\\b([\\s\\S]*?)\\bend\\s+${escapedName}\\s*;`).exec(clean)?.[1]
  if (!block) return []
  return block.split(';').map(statement => statement.replace(/\s+/g, '')).filter(Boolean).sort()
}

function hasSupportedEquationSignature(source: string, modelName: string) {
  const expected = supportedEquationSignatures[modelName]
  if (!expected) return true
  const actual = normalizedEquations(source, modelName)
  const normalizedExpected = expected.map(statement => statement.replace(/\s+/g, '')).sort()
  return actual.length === normalizedExpected.length && actual.every((statement, index) => statement === normalizedExpected[index])
}

export function analyzeModelica(source: string): ModelicaAnalysis {
  const normalizedSource = source.replace(/\r\n/g, '\n')
  const cleanSource = stripModelicaComments(normalizedSource)
  const lines = cleanSource.split('\n')
  const diagnostics: ModelicaDiagnostic[] = []
  const symbols: ModelicaSymbol[] = []
  const models = [...cleanSource.matchAll(/^\s*model\s+([A-Za-z_]\w*)/gm)]
  const modelName = models[0]?.[1]
  if (!modelName) diagnostics.push({ severity: 'error', line: 1, code: 'MO1001', text: '缺少顶层 model 声明。' })
  if (models.length > 1) diagnostics.push({ severity: 'warning', line: cleanSource.slice(0, models[1].index).split('\n').length, code: 'MO2003', text: 'Modelica Lite 只运行第一个顶层模型。' })
  const endMatch = modelName && new RegExp(`\\bend\\s+${modelName}\\s*;`).exec(cleanSource)
  if (modelName && !endMatch) diagnostics.push({ severity: 'error', line: lines.length, code: 'MO1002', text: `模型缺少 end ${modelName};。` })
  if ((cleanSource.match(/\(/g) ?? []).length !== (cleanSource.match(/\)/g) ?? []).length) diagnostics.push({ severity: 'error', line: 1, code: 'MO1003', text: '圆括号数量不匹配。' })

  let equationStart = -1
  lines.forEach((line, index) => {
    const clean = line.replace(/\/\/.*$/, '')
    if (/^\s*equation\b/.test(clean)) equationStart = index
    const declaration = clean.match(/^\s*(parameter\s+)?(Real|Integer|Boolean)\s+([A-Za-z_]\w*)/)
    if (declaration) {
      const [, parameter, type, name] = declaration
      if (!/;\s*$/.test(clean)) diagnostics.push({ severity: 'warning', line: index + 1, code: 'MO2001', text: `${name} 声明可能缺少分号。` })
      symbols.push({ name, kind: parameter ? 'parameter' : 'variable', type, line: index + 1, unit: unitFrom(clean), value: asNumber(clean.match(/=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*;\s*$/)?.[1]), start: asNumber(optionFrom(clean, 'start')) })
    }
  })
  if (modelName && equationStart < 0) diagnostics.push({ severity: 'warning', line: 1, code: 'MO2002', text: '未找到 equation 段；该模型不能用于动态仿真。' })
  const equationCount = equationStart < 0 ? 0 : lines.slice(equationStart + 1).filter(line => /[=]/.test(line) && !/^\s*end\b/.test(line)).length
  if (modelName && supportedEquationSignatures[modelName] && !hasSupportedEquationSignature(normalizedSource, modelName)) {
    diagnostics.push({ severity: 'error', line: Math.max(1, equationStart + 1), code: 'MO1004', text: '方程与该 Modelica Lite 模板的受支持签名不一致；当前浏览器引擎不会执行任意方程。' })
  }
  return { modelName, symbols, diagnostics, equationCount }
}

function normalizedExperiment(input?: Partial<ModelicaExperiment>): ModelicaExperiment | null {
  const defaults = defaultModelicaExperiment()
  const experiment = { ...defaults, ...input, solver: input?.solver === 'Euler' ? 'Euler' : 'RK4' as ModelicaSolver }
  if (![experiment.startTime, experiment.stopTime, experiment.interval, experiment.tolerance].every(Number.isFinite) || experiment.stopTime <= experiment.startTime || experiment.interval <= 0 || experiment.tolerance <= 0) return null
  if (Math.ceil((experiment.stopTime - experiment.startTime) / experiment.interval) > 5000) return null
  return experiment
}

type Derivative = (state: number[]) => number[]
class ModelicaRuntimeError extends Error {}
const MAX_STATE_MAGNITUDE = 1e100
const MIN_POSITIVE_PARAMETER = 1e-12

function validateState(values: number[], phase: string) {
  if (values.some(value => !Number.isFinite(value))) throw new ModelicaRuntimeError(`${phase}产生 NaN 或 Infinity。`)
  if (values.some(value => Math.abs(value) > MAX_STATE_MAGNITUDE)) throw new ModelicaRuntimeError(`${phase}超过安全数值范围，积分可能已经发散。`)
  return values
}

function advance(state: number[], h: number, derivative: Derivative, solver: ModelicaSolver) {
  const evaluate = (values: number[]) => validateState(derivative(values), '状态导数')
  if (solver === 'Euler') {
    const slope = evaluate(state)
    return validateState(state.map((value, index) => value + h * slope[index]), 'Euler 积分')
  }
  const k1 = evaluate(state)
  const s2 = state.map((value, index) => value + h * k1[index] / 2)
  const k2 = evaluate(s2)
  const s3 = state.map((value, index) => value + h * k2[index] / 2)
  const k3 = evaluate(s3)
  const s4 = state.map((value, index) => value + h * k3[index])
  const k4 = evaluate(s4)
  return validateState(state.map((value, index) => value + h * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index]) / 6), 'RK4 积分')
}

function integrate(experiment: ModelicaExperiment, initial: number[], derivative: Derivative, names: Array<{ name: string; unit?: string }>, derived?: (state: number[]) => Record<string, number>) {
  const time: number[] = []
  const variables: ModelicaSeries[] = names.map(item => ({ ...item, values: [] }))
  const extra = new Map<string, ModelicaSeries>()
  let state = validateState([...initial], '初始状态')
  const steps = Math.ceil((experiment.stopTime - experiment.startTime) / experiment.interval)
  let currentTime = experiment.startTime
  for (let index = 0; index <= steps; index++) {
    time.push(Number(currentTime.toFixed(12)))
    variables.forEach((series, variableIndex) => series.values.push(state[variableIndex]))
    for (const [name, value] of Object.entries(derived?.(state) ?? {})) {
      if (!Number.isFinite(value)) throw new ModelicaRuntimeError(`派生变量 ${name} 产生 NaN 或 Infinity。`)
      if (!extra.has(name)) extra.set(name, { name, values: [] })
      extra.get(name)!.values.push(value)
    }
    if (index < steps) {
      const stepSize = Math.min(experiment.interval, experiment.stopTime - currentTime)
      state = advance(state, stepSize, derivative, experiment.solver)
      currentTime += stepSize
    }
  }
  return { time, variables: [...variables, ...extra.values()], steps }
}

const value = (values: Record<string, number>, name: string, fallback: number) => Number.isFinite(values[name]) ? values[name] : fallback
const initial = (symbols: ModelicaSymbol[], name: string, fallback: number) => symbols.find(symbol => symbol.name === name)?.start ?? fallback
const newRunId = () => `RUN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
const positiveParameter = (parameter: number) => parameter >= MIN_POSITIVE_PARAMETER

export function simulateModelicaLite(source: string, experimentInput: Partial<ModelicaExperiment>, overrides: Record<string, number> = {}): ModelicaRun {
  const analysis = analyzeModelica(source)
  const experiment = normalizedExperiment(experimentInput)
  const parameters = Object.fromEntries(analysis.symbols.filter(symbol => symbol.kind === 'parameter').map(symbol => [symbol.name, value(overrides, symbol.name, symbol.value ?? 0)]))
  const base = { id: newRunId(), label: `实验 ${new Date().toLocaleString('zh-CN')}`, createdAt: new Date().toISOString(), engine: 'FlowLab Modelica Lite 1.0', experiment: experiment ?? defaultModelicaExperiment(), parameters }
  const errors = analysis.diagnostics.filter(item => item.severity === 'error')
  if (errors.length || !experiment) return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [...errors.map(item => `${item.code}: ${item.text}`), ...(experiment ? [] : ['MO9002: 实验配置无效；请检查起止时间、输出间隔和容差。'])] }
  let result: ReturnType<typeof integrate>
  const name = analysis.modelName
  try {
  if (name === 'MassSpringDamper') {
    const m = value(parameters, 'm', 1), k = value(parameters, 'k', 100), c = value(parameters, 'c', .5)
    if (!positiveParameter(m) || !positiveParameter(k)) return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9003: m 与 k 必须大于等于 ${MIN_POSITIVE_PARAMETER}。`] }
    result = integrate(experiment, [initial(analysis.symbols, 'x', .1), initial(analysis.symbols, 'v', 0)], ([x, v]) => [v, -(c * v + k * x) / m], [{ name: 'x', unit: 'm' }, { name: 'v', unit: 'm/s' }])
  } else if (name === 'ThermalNetwork') {
    const C1 = value(parameters, 'C1', 1200), C2 = value(parameters, 'C2', 900), R = value(parameters, 'R', .8), Q = value(parameters, 'Q', 120)
    if (![C1, C2, R].every(positiveParameter)) return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9003: C1、C2 与 R 必须大于等于 ${MIN_POSITIVE_PARAMETER}。`] }
    result = integrate(experiment, [initial(analysis.symbols, 'T1', 293.15), initial(analysis.symbols, 'T2', 293.15)], ([T1, T2]) => [(Q - (T1 - T2) / R) / C1, (T1 - T2) / (R * C2)], [{ name: 'T1', unit: 'K' }, { name: 'T2', unit: 'K' }])
  } else if (name === 'HydraulicCircuit') {
    const C = value(parameters, 'C', .02), R = value(parameters, 'R', 1.8), pIn = value(parameters, 'pIn', 100)
    if (![C, R].every(positiveParameter)) return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9003: C 与 R 必须大于等于 ${MIN_POSITIVE_PARAMETER}。`] }
    result = integrate(experiment, [initial(analysis.symbols, 'p', 0)], ([p]) => [(pIn - p) / (R * C)], [{ name: 'p', unit: 'Pa' }], ([p]) => ({ q: (pIn - p) / R }))
    result.variables.find(series => series.name === 'q')!.unit = 'm3/s'
  } else if (name === 'SingleSpool') {
    const J = value(parameters, 'J', 2.5), d = value(parameters, 'd', .12), tauDrive = value(parameters, 'tauDrive', 18), tauLoad = value(parameters, 'tauLoad', 5)
    if (!positiveParameter(J)) return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9003: J 必须大于等于 ${MIN_POSITIVE_PARAMETER}。`] }
    result = integrate(experiment, [initial(analysis.symbols, 'omega', 0)], ([omega]) => [(tauDrive - tauLoad - d * omega) / J], [{ name: 'omega', unit: 'rad/s' }])
  } else return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9001: ${name ?? '当前'} 模型不在 Modelica Lite 的可运行模板范围内。`] }
  } catch (error) {
    const message = error instanceof ModelicaRuntimeError ? error.message : '积分过程发生未知数值错误。'
    return { ...base, status: 'FAILED', time: [], variables: [], summary: { points: 0, steps: 0, events: 0 }, messages: [`MO9005: ${message}`] }
  }
  const maximum = Math.max(...result.variables.flatMap(series => series.values.map(item => Math.abs(item))))
  return { ...base, status: 'SUCCEEDED', time: result.time, variables: result.variables, summary: { points: result.time.length, steps: result.steps, events: 0, maximum }, messages: ['初始化完成。', `${experiment.solver} 积分完成；未检测到状态事件。`] }
}

export function compileOutput(analysis: ModelicaAnalysis) {
  const errors = analysis.diagnostics.filter(item => item.severity === 'error').length
  return `[checker] FlowLab Modelica Lite 1.0\n[parser] ${analysis.modelName ?? 'unknown'} · ${analysis.symbols.length} symbols\n[semantic] ${analysis.equationCount} equations · ${errors} error(s)\n${errors ? '[failed] 请先修复错误再运行。' : '[success] 源码检查完成；可运行受支持模板。'}`
}

export function runToCsv(run: ModelicaRun) {
  const columns = ['time', ...run.variables.map(item => item.name)]
  const rows = run.time.map((time, index) => [time, ...run.variables.map(item => item.values[index])].join(','))
  return [columns.join(','), ...rows].join('\n')
}
