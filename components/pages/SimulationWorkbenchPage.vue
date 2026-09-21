<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  CircleDot,
  Download,
  FileJson,
  Gauge,
  Grid3X3,
  Layers3,
  Play,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  SquareDashed,
} from 'lucide-vue-next'
import { assessSimulationResult } from '~/utils/simulation-lab'
import { SolverInputError, solveTool } from '~/utils/solvers'
import {
  buildCavitySolverInput,
  buildCfdCaseManifest,
  defaultCfdWorkbenchSetup,
  meshMetrics,
  reynoldsNumber,
  validateCfdWorkbench,
} from '~/utils/cfd-workbench'

type StepKey = 'model' | 'mesh' | 'boundary' | 'solve' | 'post'

const store = usePlatformStore()
const setup = reactive(defaultCfdWorkbenchSetup())
const activeStep = ref<StepKey>('model')
const running = ref(false)
const progress = ref(0)
const phase = ref('等待计算')
const errorMessage = ref('')
const result = ref<Record<string, any> | null>(null)
const runDuration = ref(0)
const resultView = ref<'field' | 'residual'>('field')
let currentWorker: Worker | null = null

const steps: Array<{ key: StepKey; index: string; label: string; note: string; icon: any }> = [
  { key: 'model', index: '01', label: '建模', note: '几何与物性', icon: Box },
  { key: 'mesh', index: '02', label: '网格划分', note: '离散与质量', icon: Grid3X3 },
  { key: 'boundary', index: '03', label: '边界设置', note: '壁面与参考量', icon: SquareDashed },
  { key: 'solve', index: '04', label: '计算求解', note: '算法与收敛', icon: Settings2 },
  { key: 'post', index: '05', label: '后处理', note: '流场与报告', icon: Activity },
]

const activeIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value))
const re = computed(() => reynoldsNumber(setup))
const quality = computed(() => meshMetrics(setup))
const meshLines = computed(() => Array.from({ length: 13 }, (_, index) => 8 + index * 7))
const solverInput = computed(() => buildCavitySolverInput(setup))
const assessment = computed(() => result.value
  ? assessSimulationResult('lid-driven-cavity', solverInput.value, result.value, result.value.warnings || [])
  : null)

function stepState(key: StepKey) {
  const index = steps.findIndex((step) => step.key === key)
  if (key === 'post' && !result.value) return 'locked'
  if (key === 'post' && result.value) return activeStep.value === key ? 'active' : 'done'
  if (index === activeIndex.value) return 'active'
  if (index < activeIndex.value || result.value) return 'done'
  return 'ready'
}

function selectStep(key: StepKey) {
  if (key === 'post' && !result.value) return
  errorMessage.value = ''
  activeStep.value = key
}

function nextStep() {
  errorMessage.value = ''
  try {
    validateCfdWorkbench(setup)
    const next = steps[Math.min(activeIndex.value + 1, steps.length - 1)]
    if (next.key !== 'post' || result.value) activeStep.value = next.key
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '当前设置不完整。'
  }
}

function resetCase() {
  const fresh = defaultCfdWorkbenchSetup()
  Object.assign(setup.model, fresh.model)
  Object.assign(setup.mesh, fresh.mesh)
  Object.assign(setup.boundary, fresh.boundary)
  Object.assign(setup.solver, fresh.solver)
  result.value = null
  progress.value = 0
  phase.value = '等待计算'
  errorMessage.value = ''
  activeStep.value = 'model'
}

function solveInWorker(input: Record<string, string | number>) {
  if (!import.meta.client) return Promise.resolve(solveTool('lid-driven-cavity', input))
  return new Promise<ReturnType<typeof solveTool>>((resolve, reject) => {
    const worker = new Worker(new URL('../../workers/solver.worker.ts', import.meta.url), { type: 'module' })
    currentWorker = worker
    const finish = () => {
      worker.terminate()
      if (currentWorker === worker) currentWorker = null
    }
    worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: ReturnType<typeof solveTool>; message?: string }>) => {
      finish()
      if (event.data.ok && event.data.result) resolve(event.data.result)
      else reject(new SolverInputError(event.data.message || '求解器运行失败。'))
    }
    worker.onerror = () => {
      finish()
      reject(new SolverInputError('计算线程启动失败，请重新运行。'))
    }
    worker.postMessage({ slug: 'lid-driven-cavity', params: input })
  })
}

async function runSimulation() {
  errorMessage.value = ''
  let input: ReturnType<typeof buildCavitySolverInput>
  try {
    input = buildCavitySolverInput(setup)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '设置校验失败。'
    return
  }

  running.value = true
  result.value = null
  progress.value = 8
  phase.value = '检查模型与边界'
  const started = performance.now()
  const timer = window.setInterval(() => {
    progress.value = Math.min(82, progress.value + 2)
    if (progress.value > 55) phase.value = '迭代求解动量与流函数'
    else if (progress.value > 25) phase.value = '组装离散方程'
  }, 100)

  try {
    const solved = await solveInWorker(input)
    phase.value = '生成速度场与收敛报告'
    progress.value = 92
    await new Promise((resolve) => setTimeout(resolve, 120))
    result.value = solved as unknown as Record<string, any>
    runDuration.value = Math.max(1, Math.round(performance.now() - started))
    progress.value = 100
    const cavityResult = solved as any
    phase.value = cavityResult.converged ? '计算完成' : '计算结束，尚未收敛'

    const task = store.addTask({
      tool: 'lid-driven-cavity',
      toolName: setup.model.name,
      params: { ...input, case_name: setup.model.name, length: setup.model.length, density: setup.model.density, viscosity: setup.model.viscosity },
    })
    store.finishTask(
      task.id,
      solved as unknown as Record<string, unknown>,
      (solved as any).warnings || [],
      runDuration.value,
      cavityResult.converged ? 'SUCCEEDED' : 'FAILED',
    )
    activeStep.value = 'post'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '计算未完成，请检查设置。'
    phase.value = '计算失败'
  } finally {
    window.clearInterval(timer)
    running.value = false
  }
}

onBeforeUnmount(() => currentWorker?.terminate())

function formatNumber(value: number, digits = 3) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) return value.toExponential(2)
  return value.toFixed(digits)
}

const fieldCells = computed(() => {
  const field = result.value?.field
  if (!field) return []
  const maximum = Math.max(...field.speed, 1e-12)
  const width = 100 / field.nx
  const height = 100 / field.ny
  return field.speed.map((speed: number, index: number) => {
    const x = index % field.nx
    const y = Math.floor(index / field.nx)
    return { x: x * width, y: 100 - (y + 1) * height, width, height, ratio: speed / maximum }
  })
})

const vectorSamples = computed(() => {
  const field = result.value?.field
  if (!field) return []
  const vectors = []
  const stride = Math.max(2, Math.floor(field.nx / 8))
  for (let y = 1; y < field.ny - 1; y += stride) {
    for (let x = 1; x < field.nx - 1; x += stride) {
      const index = y * field.nx + x
      const startX = (x + 0.5) / field.nx * 100
      const startY = 100 - (y + 0.5) / field.ny * 100
      vectors.push({
        x1: startX,
        y1: startY,
        x2: startX + field.u[index] * 5.5,
        y2: startY - field.v[index] * 5.5,
      })
    }
  }
  return vectors
})

function fieldColor(ratio: number) {
  const start = [242, 246, 248]
  const middle = [133, 190, 218]
  const end = [16, 104, 152]
  const local = ratio < 0.5 ? ratio * 2 : (ratio - 0.5) * 2
  const from = ratio < 0.5 ? start : middle
  const to = ratio < 0.5 ? middle : end
  return `rgb(${from.map((value, index) => Math.round(value + (to[index] - value) * local)).join(',')})`
}

const residualPath = computed(() => {
  const x = result.value?.x as number[] | undefined
  const y = result.value?.series as number[] | undefined
  if (!x?.length || !y?.length) return ''
  const logs = y.map((value) => Math.log10(Math.max(value, 1e-14)))
  const minX = x[0]
  const maxX = x.at(-1) || minX + 1
  const minY = Math.min(...logs)
  const maxY = Math.max(...logs)
  return x.map((value, index) => {
    const px = 28 + (value - minX) / Math.max(maxX - minX, 1) * 564
    const py = 16 + (maxY - logs[index]) / Math.max(maxY - minY, 1e-9) * 164
    return `${px.toFixed(2)},${py.toFixed(2)}`
  }).join(' ')
})

function downloadFile(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', body], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function exportResult(kind: 'json' | 'csv') {
  if (!result.value) return
  const safeName = setup.model.name.replace(/[^\p{L}\p{N}-]+/gu, '-')
  if (kind === 'json') {
    downloadFile(`${safeName}.json`, 'application/json', JSON.stringify(buildCfdCaseManifest(setup, result.value), null, 2))
    return
  }
  const field = result.value.field
  const rows = ['x_index,y_index,u_over_lid,v_over_lid,speed_over_lid']
  for (let y = 0; y < field.ny; y += 1) {
    for (let x = 0; x < field.nx; x += 1) {
      const index = y * field.nx + x
      rows.push(`${x},${y},${field.u[index]},${field.v[index]},${field.speed[index]}`)
    }
  }
  downloadFile(`${safeName}-field.csv`, 'text/csv;charset=utf-8', rows.join('\n'))
}
</script>

<template>
  <main class="cfd-workbench">
    <header class="workbench-head">
      <div>
        <span class="eyebrow">CFD WORKBENCH</span>
        <h1>二维流场仿真工作台</h1>
        <p>从物理模型到速度场结果，按工程步骤完成一次可复现计算。</p>
      </div>
      <button class="ghost-button" type="button" @click="resetCase">
        <RotateCcw :size="15" />重置算例
      </button>
    </header>

    <section class="case-strip" aria-label="当前算例摘要">
      <div><small>算例</small><strong>{{ setup.model.name }}</strong></div>
      <div><small>物理模型</small><strong>二维 · 稳态 · 层流</strong></div>
      <div><small>Reynolds 数</small><strong>{{ formatNumber(re, 1) }}</strong></div>
      <div><small>计算网格</small><strong>{{ setup.mesh.nx }} × {{ setup.mesh.ny }}</strong></div>
      <span class="case-status" :class="{ solved: result }"><i></i>{{ result ? '已有计算结果' : '设置中' }}</span>
    </section>

    <div class="workbench-shell">
      <aside class="workflow-nav">
        <div class="workflow-title">
          <small>工作流程</small>
          <strong>完成五个步骤</strong>
        </div>
        <button
          v-for="step in steps"
          :key="step.key"
          type="button"
          class="workflow-step"
          :class="stepState(step.key)"
          :disabled="stepState(step.key) === 'locked'"
          @click="selectStep(step.key)"
        >
          <span class="step-index">{{ stepState(step.key) === 'done' ? '✓' : step.index }}</span>
          <component :is="step.icon" :size="18" />
          <span><strong>{{ step.label }}</strong><small>{{ step.note }}</small></span>
        </button>
        <div class="workflow-foot">
          <CircleDot :size="15" />
          <span>本地浏览器求解<br><small>输入与结果保存在本机</small></span>
        </div>
      </aside>

      <section class="stage-panel">
        <div v-if="errorMessage" class="stage-alert error" role="alert">
          <AlertTriangle :size="17" />{{ errorMessage }}
        </div>

        <template v-if="activeStep === 'model'">
          <div class="stage-head">
            <div><span>STEP 01</span><h2>建立物理模型</h2><p>定义计算对象、几何尺度和流体物性。</p></div>
            <Box :size="34" />
          </div>
          <div class="two-column-stage">
            <div class="form-card">
              <label class="wide-field"><span>算例名称</span><input v-model="setup.model.name" type="text"></label>
              <div class="form-grid">
                <label><span>方腔边长 <em>m</em></span><input v-model.number="setup.model.length" type="number" min="0.001" step="0.01"></label>
                <label><span>计算维度</span><select disabled><option>二维平面</option></select></label>
                <label><span>流体密度 <em>kg/m³</em></span><input v-model.number="setup.model.density" type="number" min="0.001" step="1"></label>
                <label><span>动力黏度 <em>Pa·s</em></span><input v-model.number="setup.model.viscosity" type="number" min="0.0000001" step="0.001"></label>
              </div>
            </div>
            <div class="model-preview">
              <div class="cavity-sketch">
                <span class="dimension top">L = {{ setup.model.length }} m</span>
                <span class="dimension side">L</span>
                <div class="sketch-vortex">↻</div>
              </div>
              <dl class="definition-list">
                <div><dt>控制方程</dt><dd>连续性方程、二维动量方程</dd></div>
                <div><dt>流动假设</dt><dd>稳态、不可压、牛顿流体、层流</dd></div>
                <div><dt>求解形式</dt><dd>涡量—流函数，无压力棋盘格</dd></div>
              </dl>
            </div>
          </div>
          <div class="equation-row">
            <span>∇ · u = 0</span><span>ρ(u · ∇)u = −∇p + μ∇²u</span><strong>Re = {{ formatNumber(re, 1) }}</strong>
          </div>
          <div class="stage-actions"><span></span><button class="primary-button" type="button" @click="nextStep">确认模型并划分网格<ArrowRight :size="16" /></button></div>
        </template>

        <template v-else-if="activeStep === 'mesh'">
          <div class="stage-head">
            <div><span>STEP 02</span><h2>划分计算网格</h2><p>生成结构化正交网格，并在求解前检查离散质量。</p></div>
            <Grid3X3 :size="34" />
          </div>
          <div class="two-column-stage mesh-stage">
            <div class="form-card">
              <div class="form-grid">
                <label><span>x 方向节点数</span><input v-model.number="setup.mesh.nx" type="number" min="33" max="129" step="2"></label>
                <label><span>y 方向节点数</span><input v-model.number="setup.mesh.ny" type="number" min="33" max="129" step="2"></label>
                <label><span>网格拓扑</span><select disabled><option>结构化正交</option></select></label>
                <label><span>节点分布</span><select disabled><option>均匀分布</option></select></label>
              </div>
              <div class="quality-grid">
                <div><small>控制体</small><strong>{{ quality.cells.toLocaleString() }}</strong></div>
                <div><small>节点数</small><strong>{{ quality.nodes.toLocaleString() }}</strong></div>
                <div><small>Δx</small><strong>{{ formatNumber(quality.dx) }} m</strong></div>
                <div><small>纵横比</small><strong>{{ formatNumber(quality.aspectRatio, 2) }}</strong></div>
              </div>
              <div class="quality-pass"><CheckCircle2 :size="17" /><span><strong>网格质量可用</strong><small>正交度 1.00，纵横比小于 5</small></span></div>
            </div>
            <div class="mesh-preview-card">
              <div class="preview-label"><span>网格预览</span><small>显示抽样网格线</small></div>
              <svg viewBox="0 0 100 100" role="img" aria-label="结构化网格预览">
                <rect x="8" y="8" width="84" height="84" class="mesh-domain" />
                <template v-for="line in meshLines" :key="line">
                  <line :x1="line" y1="8" :x2="line" y2="92" />
                  <line x1="8" :y1="line" x2="92" :y2="line" />
                </template>
              </svg>
              <p>{{ setup.mesh.nx }} × {{ setup.mesh.ny }} 节点 · {{ quality.cells.toLocaleString() }} 个有限体积控制体</p>
            </div>
          </div>
          <div class="stage-actions"><button class="ghost-button" type="button" @click="activeStep='model'">返回建模</button><button class="primary-button" type="button" @click="nextStep">接受网格并设置边界<ArrowRight :size="16" /></button></div>
        </template>

        <template v-else-if="activeStep === 'boundary'">
          <div class="stage-head">
            <div><span>STEP 03</span><h2>设置边界条件</h2><p>为每一条边界指定物理类型和数值约束。</p></div>
            <SquareDashed :size="34" />
          </div>
          <div class="boundary-layout">
            <div class="boundary-diagram">
              <div class="bc-domain">
                <div class="bc-edge bc-top"><span>移动壁面</span><i>→ → →</i></div>
                <div class="bc-edge bc-left"><span>无滑移</span></div>
                <div class="bc-edge bc-right"><span>无滑移</span></div>
                <div class="bc-edge bc-bottom"><span>无滑移壁面</span></div>
                <div class="bc-vortex">↻</div>
              </div>
            </div>
            <div class="boundary-list">
              <div class="boundary-item accent"><span class="bc-swatch top"></span><div><strong>顶部 · movingWall</strong><small>速度 Dirichlet 边界</small></div><label><input v-model.number="setup.boundary.lidVelocity" type="number" min="0.01" step="0.01"><em>m/s</em></label></div>
              <div class="boundary-item"><span class="bc-swatch wall"></span><div><strong>左 / 右 / 底部 · wall</strong><small>无滑移、不可穿透，u = v = 0</small></div><span class="locked-value">固定</span></div>
              <div class="boundary-item"><span class="bc-swatch pressure"></span><div><strong>压力参考</strong><small>消除不可压压力场常数自由度</small></div><label><input v-model.number="setup.boundary.pressureReference" type="number" step="100"><em>Pa</em></label></div>
              <div class="boundary-item"><span class="bc-swatch initial"></span><div><strong>初始场</strong><small>全域静止，u₀ = v₀ = 0</small></div><span class="locked-value">自动</span></div>
            </div>
          </div>
          <div class="boundary-check"><Check :size="16" />四条几何边界均已闭合，没有未定义面；当前 Reynolds 数为 {{ formatNumber(re, 1) }}。</div>
          <div class="stage-actions"><button class="ghost-button" type="button" @click="activeStep='mesh'">返回网格</button><button class="primary-button" type="button" @click="nextStep">确认边界并配置求解器<ArrowRight :size="16" /></button></div>
        </template>

        <template v-else-if="activeStep === 'solve'">
          <div class="stage-head">
            <div><span>STEP 04</span><h2>计算求解</h2><p>配置离散迭代参数，检查设置后启动本地计算。</p></div>
            <Settings2 :size="34" />
          </div>
          <div class="solver-layout">
            <div class="form-card solver-settings">
              <div class="form-grid">
                <label><span>最大迭代数</span><input v-model.number="setup.solver.maxIterations" type="number" min="100" max="20000" step="100"></label>
                <label><span>收敛容差</span><input v-model.number="setup.solver.tolerance" type="number" min="0.00000001" max="0.001" step="0.000001"></label>
                <label><span>流函数松弛</span><input v-model.number="setup.solver.pressureRelaxation" type="number" min="0.1" max="0.8" step="0.05"></label>
                <label><span>速度松弛</span><input v-model.number="setup.solver.velocityRelaxation" type="number" min="0.1" max="1" step="0.05"></label>
              </div>
              <div class="numerics-table">
                <div><span>空间离散</span><strong>二阶中心差分</strong></div>
                <div><span>压力—速度处理</span><strong>涡量—流函数</strong></div>
                <div><span>Poisson 方程</span><strong>Gauss–Seidel 迭代</strong></div>
                <div><span>计算线程</span><strong>Web Worker</strong></div>
              </div>
            </div>
            <div class="run-console">
              <div class="run-summary">
                <span><small>Re</small><strong>{{ formatNumber(re, 1) }}</strong></span>
                <span><small>控制体</small><strong>{{ quality.cells.toLocaleString() }}</strong></span>
                <span><small>目标残差</small><strong>{{ setup.solver.tolerance.toExponential(0) }}</strong></span>
              </div>
              <div class="progress-track"><i :style="{ width: `${progress}%` }"></i></div>
              <div class="phase-line"><span><i :class="{ pulse: running }"></i>{{ phase }}</span><strong>{{ progress }}%</strong></div>
              <button class="run-button" type="button" :disabled="running" @click="runSimulation">
                <SlidersHorizontal v-if="running" :size="18" />
                <Play v-else :size="18" fill="currentColor" />
                {{ running ? '正在计算' : result ? '重新计算' : '启动求解' }}
              </button>
              <p>计算在独立线程运行，页面不会因迭代过程失去响应。</p>
            </div>
          </div>
          <div class="stage-actions"><button class="ghost-button" type="button" @click="activeStep='boundary'">返回边界</button><span class="solve-hint">求解完成后自动进入后处理</span></div>
        </template>

        <template v-else-if="activeStep === 'post' && result">
          <div class="stage-head post-head">
            <div><span>STEP 05</span><h2>后处理与结果检查</h2><p>查看流场、收敛历史、关键量和可信度检查。</p></div>
            <div class="result-status" :class="{ warning: !result.converged }"><CheckCircle2 v-if="result.converged" :size="19" /><AlertTriangle v-else :size="19" />{{ result.converged ? '求解收敛' : '未达到容差' }}</div>
          </div>
          <div class="result-summary-grid">
            <div><Gauge :size="18" /><span><small>最终残差</small><strong>{{ Number(result.finalResidual).toExponential(2) }}</strong></span></div>
            <div><Layers3 :size="18" /><span><small>实际网格</small><strong>{{ result.actualNx }} × {{ result.actualNy }}</strong></span></div>
            <div><Activity :size="18" /><span><small>迭代次数</small><strong>{{ result.iterations }}</strong></span></div>
            <div><CircleDot :size="18" /><span><small>主涡中心</small><strong>({{ formatNumber(result.vortexX) }}, {{ formatNumber(result.vortexY) }})</strong></span></div>
          </div>
          <div class="post-layout">
            <div class="result-visual">
              <div class="result-toolbar">
                <div><button :class="{ active: resultView==='field' }" @click="resultView='field'">速度场</button><button :class="{ active: resultView==='residual' }" @click="resultView='residual'">残差曲线</button></div>
                <span>{{ resultView === 'field' ? '|U| / U_lid' : 'log₁₀ residual' }}</span>
              </div>
              <div v-if="resultView === 'field'" class="field-view">
                <svg viewBox="0 0 100 100" role="img" aria-label="方腔速度场云图">
                  <rect v-for="(cell, index) in fieldCells" :key="index" :x="cell.x" :y="cell.y" :width="cell.width + .15" :height="cell.height + .15" :fill="fieldColor(cell.ratio)" />
                  <defs><marker id="arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#173d55" /></marker></defs>
                  <line v-for="(vector, index) in vectorSamples" :key="`v-${index}`" v-bind="vector" stroke="#173d55" stroke-width=".32" marker-end="url(#arrow)" opacity=".78" />
                  <rect x=".4" y=".4" width="99.2" height="99.2" fill="none" stroke="#183f58" stroke-width=".8" />
                </svg>
                <div class="legend"><span>0</span><i></i><span>最大</span></div>
              </div>
              <div v-else class="residual-view">
                <svg viewBox="0 0 620 205" role="img" aria-label="残差收敛曲线">
                  <line x1="28" y1="180" x2="594" y2="180" />
                  <line x1="28" y1="16" x2="28" y2="180" />
                  <line v-for="n in 4" :key="n" x1="28" :y1="16+n*32.8" x2="594" :y2="16+n*32.8" class="chart-grid" />
                  <polyline :points="residualPath" fill="none" stroke="#167cae" stroke-width="2.5" />
                </svg>
                <div class="chart-labels"><span>0</span><span>迭代步 {{ result.iterations }}</span></div>
              </div>
            </div>
            <div class="verification-panel">
              <div class="score-head"><span :class="`grade grade-${assessment?.grade}`">{{ assessment?.grade }}</span><div><strong>{{ assessment?.label }}</strong><small>可信度评分 {{ assessment?.score }}/100</small></div></div>
              <div class="check-list">
                <div v-for="check in assessment?.checks" :key="check.key" :class="check.status"><span><CheckCircle2 v-if="check.status==='pass'" :size="16" /><AlertTriangle v-else :size="16" /></span><div><strong>{{ check.label }}</strong><small>{{ check.detail }}</small></div></div>
              </div>
            </div>
          </div>
          <div v-if="result.warnings?.length" class="stage-alert warning"><AlertTriangle :size="17" /><span><strong>计算提示</strong>{{ result.warnings.join(' ') }}</span></div>
          <div class="post-actions">
            <span>计算耗时 {{ runDuration }} ms · 结果包含完整输入快照</span>
            <div><button class="ghost-button" type="button" @click="exportResult('csv')"><Download :size="15" />导出流场 CSV</button><button class="primary-button" type="button" @click="exportResult('json')"><FileJson :size="15" />导出完整算例</button></div>
          </div>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.cfd-workbench{min-height:100vh;padding:32px clamp(18px,4vw,64px) 56px;background:#f4f7f9;color:#142a38}.cfd-workbench,.cfd-workbench *{box-sizing:border-box}.workbench-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;max-width:1480px;margin:0 auto 22px}.eyebrow,.stage-head span{color:#167cad;font-size:10px;font-weight:800;letter-spacing:.16em}.workbench-head h1{margin:7px 0 6px;font-size:clamp(28px,4vw,46px);letter-spacing:-.045em}.workbench-head p,.stage-head p{margin:0;color:#647783;font-size:13px}.ghost-button,.primary-button,.run-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:7px;font-weight:700;cursor:pointer}.ghost-button{min-height:38px;padding:0 14px;border:1px solid #cbd7de;background:#fff;color:#294654}.primary-button{min-height:40px;padding:0 17px;border:0;background:#167cad;color:#fff}.case-strip{display:grid;grid-template-columns:1.4fr 1fr .7fr .8fr auto;align-items:center;gap:1px;max-width:1480px;margin:0 auto 14px;overflow:hidden;border:1px solid #d7e0e5;border-radius:9px;background:#d7e0e5}.case-strip>div{height:66px;padding:13px 18px;background:#fff}.case-strip small,.definition-list dt,.quality-grid small,.run-summary small,.result-summary-grid small{display:block;margin-bottom:4px;color:#7a8b94;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.case-strip strong{font-size:12px}.case-status{display:flex;align-items:center;gap:7px;height:66px;padding:0 18px;background:#fff;color:#687a84;font-size:11px;font-weight:700}.case-status i,.phase-line i{width:7px;height:7px;border-radius:50%;background:#9caeb7}.case-status.solved{color:#167349}.case-status.solved i{background:#25a268}.workbench-shell{display:grid;grid-template-columns:230px minmax(0,1fr);max-width:1480px;min-height:680px;margin:auto;border:1px solid #d7e0e5;border-radius:10px;background:#fff;box-shadow:0 18px 45px rgba(29,55,70,.07);overflow:hidden}.workflow-nav{display:flex;flex-direction:column;padding:24px 14px;border-right:1px solid #dfe7eb;background:#f9fbfc}.workflow-title{padding:0 12px 18px}.workflow-title small{display:block;color:#8a9aa3;font-size:9px;letter-spacing:.12em}.workflow-title strong{font-size:14px}.workflow-step{display:grid;grid-template-columns:29px 20px 1fr;align-items:center;gap:8px;width:100%;padding:14px 10px;border:0;border-radius:7px;background:transparent;color:#67808e;text-align:left;cursor:pointer}.workflow-step:hover:not(:disabled){background:#edf4f7}.workflow-step.active{background:#e8f3f8;color:#126c99}.workflow-step.done{color:#2a6d5a}.workflow-step:disabled{cursor:not-allowed;opacity:.45}.step-index{display:grid;place-items:center;width:25px;height:25px;border:1px solid #cad8df;border-radius:50%;font-size:9px;font-weight:800}.workflow-step.active .step-index{border-color:#167cad;background:#167cad;color:#fff}.workflow-step.done .step-index{border-color:#7ab69e;background:#e6f5ee}.workflow-step strong,.workflow-step small{display:block}.workflow-step strong{font-size:12px}.workflow-step small{margin-top:3px;color:#91a0a7;font-size:9px}.workflow-foot{display:flex;align-items:flex-start;gap:9px;margin-top:auto;padding:16px 12px 0;border-top:1px solid #e2e9ed;color:#526d7b;font-size:10px;line-height:1.45}.workflow-foot small{color:#91a0a8}.stage-panel{min-width:0;padding:clamp(22px,3vw,42px)}.stage-alert{display:flex;align-items:flex-start;gap:9px;margin-bottom:18px;padding:12px 14px;border-radius:6px;font-size:11px}.stage-alert.error{background:#fff0ee;color:#a44336}.stage-alert.warning{margin-top:16px;background:#fff7e8;color:#8a6019}.stage-alert span{display:grid;gap:3px}.stage-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:28px}.stage-head h2{margin:5px 0 5px;font-size:clamp(24px,3vw,34px);letter-spacing:-.035em}.stage-head>svg{color:#87adbf}.two-column-stage{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:22px}.form-card,.model-preview,.mesh-preview-card,.run-console,.result-visual,.verification-panel{border:1px solid #dce5e9;border-radius:9px;background:#fff}.form-card{padding:22px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.form-card label,.boundary-item label{display:grid;gap:7px;min-width:0}.form-card label span{color:#526975;font-size:10px;font-weight:700}.form-card label em{float:right;color:#91a0a8;font-style:normal;font-weight:500}.form-card input,.form-card select,.boundary-item input{width:100%;min-width:0;height:42px;padding:0 11px;border:1px solid #cdd9df;border-radius:5px;background:#fbfcfd;color:#193442;font:inherit;font-size:12px;outline:none}.form-card input:focus,.boundary-item input:focus{border-color:#45a0ca;box-shadow:0 0 0 3px rgba(69,160,202,.12)}.form-card select:disabled{color:#576e79;opacity:1}.wide-field{margin-bottom:16px}.model-preview{display:grid;grid-template-columns:minmax(190px,.8fr) 1.2fr;align-items:center;gap:24px;padding:24px;background:#f8fafb}.cavity-sketch{position:relative;aspect-ratio:1;border:3px solid #678b9d;border-top-color:#1685b8;background:linear-gradient(135deg,#eef5f7,#fff)}.cavity-sketch:before{position:absolute;top:-10px;left:8%;width:84%;border-top:2px solid #1685b8;content:""}.cavity-sketch:after{position:absolute;top:-14px;right:3%;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid #1685b8;content:""}.dimension{position:absolute;color:#68808d;font-size:9px}.dimension.top{top:-30px;left:35%}.dimension.side{top:47%;left:-20px}.sketch-vortex{display:grid;place-items:center;height:100%;color:#78a8bf;font-size:50px}.definition-list{display:grid;gap:13px;margin:0}.definition-list div{padding-bottom:11px;border-bottom:1px solid #e1e8eb}.definition-list div:last-child{border:0}.definition-list dd{margin:0;color:#284653;font-size:11px;line-height:1.5}.equation-row{display:flex;align-items:center;gap:16px;margin-top:18px;padding:14px 18px;border-left:3px solid #1685b8;background:#f1f7fa;color:#45616e;font-family:Cambria,serif;font-size:14px}.equation-row strong{margin-left:auto;color:#126d99}.stage-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:28px;padding-top:20px;border-top:1px solid #e1e8eb}.mesh-stage{grid-template-columns:minmax(330px,.8fr) minmax(320px,1.2fr)}.quality-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:20px;background:#dce6eb}.quality-grid div{padding:12px;background:#f7fafb}.quality-grid strong{font-size:12px}.quality-pass{display:flex;align-items:center;gap:9px;margin-top:16px;padding:12px;border-radius:5px;background:#eaf6f0;color:#267157}.quality-pass span,.quality-pass strong,.quality-pass small{display:block}.quality-pass small{margin-top:3px;font-size:9px}.mesh-preview-card{padding:18px;background:#f8fafb}.preview-label{display:flex;justify-content:space-between;color:#4a6471;font-size:11px;font-weight:700}.preview-label small{color:#8b9ba3;font-weight:500}.mesh-preview-card svg{display:block;width:min(100%,390px);margin:10px auto}.mesh-preview-card line{stroke:#a9c1cc;stroke-width:.35}.mesh-domain{fill:#fdfefe;stroke:#416b7f;stroke-width:1}.mesh-preview-card p{text-align:center;color:#758993;font-size:10px}.boundary-layout{display:grid;grid-template-columns:minmax(300px,.8fr) minmax(400px,1.2fr);gap:28px}.boundary-diagram{display:grid;place-items:center;padding:28px;border-radius:9px;background:#f5f8fa}.bc-domain{position:relative;width:min(82%,320px);aspect-ratio:1;border:4px solid #6e8793;background:linear-gradient(135deg,#fff,#edf5f8)}.bc-edge{position:absolute;color:#617681;font-size:9px;font-weight:700}.bc-top{top:-25px;left:25%;color:#167cad}.bc-top i{display:block;margin-top:3px;color:#1685b8;font-style:normal;letter-spacing:8px}.bc-left{top:46%;left:-42px;transform:rotate(-90deg)}.bc-right{top:46%;right:-42px;transform:rotate(90deg)}.bc-bottom{bottom:-22px;left:34%}.bc-vortex{display:grid;place-items:center;height:100%;color:#7aabc2;font-size:58px}.boundary-list{display:grid;gap:9px}.boundary-item{display:grid;grid-template-columns:8px 1fr minmax(120px,.45fr);align-items:center;gap:14px;padding:14px;border:1px solid #dce5e9;border-radius:7px}.boundary-item.accent{border-color:#93c5dd;background:#f5fbfe}.boundary-item strong,.boundary-item small{display:block}.boundary-item strong{font-size:11px}.boundary-item small{margin-top:4px;color:#80919a;font-size:9px}.bc-swatch{width:4px;height:30px;border-radius:4px;background:#6f8793}.bc-swatch.top{background:#1685b8}.bc-swatch.pressure{background:#d8a843}.bc-swatch.initial{background:#7fae99}.boundary-item label{position:relative}.boundary-item label input{height:36px;padding-right:43px}.boundary-item label em{position:absolute;right:9px;bottom:10px;color:#8b9aa2;font-size:9px;font-style:normal}.locked-value{justify-self:end;padding:5px 8px;border-radius:4px;background:#eef3f5;color:#70838d;font-size:9px}.boundary-check{display:flex;align-items:center;gap:8px;margin-top:16px;padding:12px 14px;border-left:3px solid #4f9f7a;background:#f0f8f4;color:#3f6855;font-size:10px}.solver-layout{display:grid;grid-template-columns:minmax(420px,1.15fr) minmax(300px,.85fr);gap:22px}.solver-settings{display:grid;gap:20px}.numerics-table{display:grid;border-top:1px solid #dce5e9}.numerics-table div{display:flex;justify-content:space-between;gap:12px;padding:10px 2px;border-bottom:1px solid #e6ecef;color:#71838d;font-size:10px}.numerics-table strong{color:#284754}.run-console{padding:24px;background:#163544;color:#e9f5fa}.run-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#3d5662}.run-summary span{padding:11px;background:#163544}.run-summary small{color:#8fb1c0}.run-summary strong{font-size:13px}.progress-track{height:5px;margin:28px 0 10px;border-radius:4px;background:#405d6a;overflow:hidden}.progress-track i{display:block;height:100%;background:#66b8dc;transition:width .15s linear}.phase-line{display:flex;justify-content:space-between;color:#abc0c9;font-size:10px}.phase-line span{display:flex;align-items:center;gap:7px}.phase-line i{background:#6b8793}.phase-line i.pulse{background:#62c596;box-shadow:0 0 0 4px rgba(98,197,150,.13)}.run-button{width:100%;height:48px;margin-top:25px;border:0;background:#eef8fc;color:#126c99;font-size:12px}.run-button:disabled{cursor:wait;opacity:.75}.run-console p{margin:11px 0 0;color:#8ca8b4;font-size:9px;text-align:center}.solve-hint{color:#81929b;font-size:10px}.post-head{align-items:center}.result-status{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:5px;background:#e8f6ef;color:#247151;font-size:10px;font-weight:700}.result-status.warning{background:#fff4df;color:#94641d}.result-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-bottom:18px;border:1px solid #d8e2e7;border-radius:7px;background:#d8e2e7;overflow:hidden}.result-summary-grid>div{display:flex;align-items:center;gap:11px;padding:15px;background:#fff}.result-summary-grid svg{color:#4386a5}.result-summary-grid span,.result-summary-grid strong{display:block}.result-summary-grid strong{font-size:12px}.post-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);gap:18px}.result-visual{min-width:0;overflow:hidden;background:#f7fafb}.result-toolbar{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #dce5e9}.result-toolbar button{padding:7px 10px;border:0;border-radius:4px;background:transparent;color:#748791;font-size:10px;font-weight:700;cursor:pointer}.result-toolbar button.active{background:#e4f1f7;color:#126e9b}.result-toolbar span{font-size:9px;color:#7d9099}.field-view,.residual-view{padding:18px}.field-view svg{display:block;width:min(100%,460px);max-height:440px;margin:auto}.legend{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;color:#78909b;font-size:9px}.legend i{width:150px;height:7px;border-radius:5px;background:linear-gradient(90deg,#f2f6f8,#85beda,#106898)}.residual-view svg{display:block;width:100%;min-height:300px}.residual-view line{stroke:#718892;stroke-width:1}.residual-view .chart-grid{stroke:#dce6ea;stroke-width:1}.chart-labels{display:flex;justify-content:space-between;color:#758a94;font-size:9px}.verification-panel{padding:20px}.score-head{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #e0e7ea}.grade{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#e6f4ed;color:#257052;font-size:18px;font-weight:800}.grade-C,.grade-D{background:#fff0df;color:#97621d}.score-head strong,.score-head small{display:block}.score-head strong{font-size:13px}.score-head small{margin-top:3px;color:#84959d;font-size:9px}.check-list{display:grid;gap:13px;margin-top:17px}.check-list>div{display:grid;grid-template-columns:22px 1fr;gap:8px}.check-list>div.pass>span{color:#2f8a65}.check-list>div.warning>span,.check-list>div.fail>span{color:#c18226}.check-list strong,.check-list small{display:block}.check-list strong{font-size:10px}.check-list small{margin-top:3px;color:#7b8d96;font-size:9px;line-height:1.45}.post-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:22px;padding-top:18px;border-top:1px solid #e0e7ea;color:#7d8f98;font-size:9px}.post-actions>div{display:flex;gap:8px}
@media(max-width:1050px){.case-strip{grid-template-columns:repeat(2,1fr)}.case-status{grid-column:span 2}.workbench-shell{grid-template-columns:190px minmax(0,1fr)}.two-column-stage,.mesh-stage,.boundary-layout,.solver-layout,.post-layout{grid-template-columns:1fr}.model-preview{grid-template-columns:220px 1fr}.result-summary-grid{grid-template-columns:1fr 1fr}}
@media(max-width:720px){.cfd-workbench{padding:20px 12px 36px}.workbench-head{align-items:flex-start;flex-direction:column}.case-strip{grid-template-columns:1fr 1fr}.case-strip>div{padding:12px}.workbench-shell{display:block}.workflow-nav{position:sticky;top:0;z-index:4;display:flex;flex-direction:row;overflow-x:auto;padding:8px;border-right:0;border-bottom:1px solid #dfe7eb}.workflow-title,.workflow-foot{display:none}.workflow-step{display:flex;flex:0 0 auto;width:auto;padding:9px}.workflow-step>svg,.workflow-step small{display:none}.stage-panel{padding:22px 15px}.form-grid{grid-template-columns:1fr}.model-preview{grid-template-columns:1fr}.cavity-sketch{width:70%;margin:25px auto 5px}.equation-row{align-items:flex-start;flex-direction:column}.equation-row strong{margin-left:0}.boundary-item{grid-template-columns:7px 1fr}.boundary-item label,.locked-value{grid-column:2}.result-summary-grid{grid-template-columns:1fr 1fr}.post-actions{align-items:stretch;flex-direction:column}.post-actions>div{display:grid}.stage-actions{align-items:stretch;flex-direction:column-reverse}.stage-actions>*{width:100%}.stage-actions>span:empty{display:none}}
</style>
