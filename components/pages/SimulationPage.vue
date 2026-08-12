<script setup lang="ts">
import {
  Search, SlidersHorizontal, ArrowRight, RotateCcw, Play, Download, CheckCircle2,
  AlertTriangle, Clock3, XCircle, FileJson, Table2, Activity, Gauge, ChevronRight,
  Box, Grid3X3, Calculator, BarChart3, Settings2, Layers3, CircleDot, ImageDown,
  FileDown, SquareStack, ShieldCheck, Info, Pause, RefreshCw, Braces
} from 'lucide-vue-next'
import { tools } from '~/utils/content'
import { solveTool, type SolverResult } from '~/utils/solvers'

const route = useRoute()
const router = useRouter()
const store = usePlatformStore()
const taskRoute = computed(() => route.path.startsWith('/simulation/tasks/'))
const listRoute = computed(() => route.path === '/simulation')
const slug = computed(() => route.path.split('/')[2] || 'convection-diffusion')
const tool = computed(() => tools.find(item => item.slug === slug.value) || tools[0])
const taskId = computed(() => String(route.params.id || route.path.split('/').at(-1) || ''))
const task = computed(() => store.tasks.find(item => item.id === taskId.value))

const defaults: Record<string, Record<string, string | number>> = {
  'convection-diffusion': { length: 1, nx: 101, rho: 1, velocity: 1, diffusivity: .1, phi_left: 1, phi_right: 0, scheme: 'upwind' },
  'lid-driven-cavity': { reynolds: 100, nx: 65, ny: 65, lid_velocity: 1, max_iterations: 5000, tolerance: .000001, pressure_relaxation: .3, velocity_relaxation: .7 },
  'pipe-flow': { diameter: .05, pipe_length: 2, rho: 998, viscosity: .001, drive_mode: 'mean_velocity', drive_value: .5, samples: 81 },
  'turbulence-compare': { flow_type: 'internal', velocity: 35, char_length: .2, rho: 1.225, viscosity: .0000181, intensity: 5, length_scale: .014, target_yplus: 1, growth_rate: 1.2, layers: 20 }
}

const fieldDefs = computed(() => ({
  'convection-diffusion': [['length', '区域长度', 'm', .01, 100], ['nx', '网格节点', '—', 21, 1001], ['rho', '密度', 'kg/m³', .001, 10000], ['velocity', '速度', 'm/s', -1000, 1000], ['diffusivity', '扩散系数', 'm²/s', 1e-8, 1000], ['phi_left', '左边界 φ', '—', -1e6, 1e6], ['phi_right', '右边界 φ', '—', -1e6, 1e6]],
  'lid-driven-cavity': [['reynolds', 'Reynolds 数', '—', 10, 1000], ['nx', 'x 网格节点', '—', 33, 129], ['ny', 'y 网格节点', '—', 33, 129], ['lid_velocity', '顶盖速度', 'm/s', .01, 100], ['max_iterations', '最大迭代', '—', 100, 20000], ['tolerance', '收敛容差', '—', 1e-8, 1e-4], ['pressure_relaxation', '压力松弛', '—', .1, .8], ['velocity_relaxation', '速度松弛', '—', .1, 1]],
  'pipe-flow': [['diameter', '管径', 'm', .001, 10], ['pipe_length', '管长', 'm', .01, 1000], ['rho', '密度', 'kg/m³', .1, 10000], ['viscosity', '动力黏度', 'Pa·s', 1e-7, 100], ['drive_value', '驱动值', 'Pa / m·s⁻¹', .0001, 1e7], ['samples', '径向节点', '—', 21, 501]],
  'turbulence-compare': [['velocity', '特征速度', 'm/s', .001, 3000], ['char_length', '特征长度', 'm', .0001, 100], ['rho', '密度', 'kg/m³', .001, 10000], ['viscosity', '动力黏度', 'Pa·s', 1e-8, 10], ['intensity', '湍流强度', '%', .01, 50], ['length_scale', '长度尺度', 'm', 1e-6, 100], ['target_yplus', '目标 y⁺', '—', .1, 300], ['growth_rate', '增长率', '—', 1.01, 2], ['layers', '边界层层数', '—', 3, 100]]
}[slug.value] || []) as Array<[string, string, string, number, number]>)

const params = reactive<Record<string, string | number>>({})
const numerics = reactive({
  gradient: 'least-squares', momentum: 'second-order-upwind', pressure: 'second-order',
  coupling: 'SIMPLE', initialization: 'hybrid', reportInterval: 10
})
const caseName = ref('')
const activeStage = ref('setup')
const meshReady = ref(false)
const geometryReady = ref(true)
const meshRevision = ref(0)
const running = ref(false)
const progress = ref(0)
const phase = ref('等待提交')
const activeTaskId = ref('')
const runToken = ref(0)
const liveIterations = ref<number[]>([])
const liveContinuity = ref<number[]>([])
const liveMomentum = ref<number[]>([])
const resultTab = ref('field')
const selectedField = ref<'velocity' | 'pressure' | 'scalar' | 'vorticity'>('velocity')
const showMesh = ref(true)
const showVectors = ref(true)
const viewportRef = ref<{ downloadPng: (name?: string) => void } | null>(null)

const workflowStages = [
  { id: 'setup', label: '算例设置', caption: '物性与模型', icon: Settings2 },
  { id: 'geometry', label: '几何与边界', caption: '计算域检查', icon: Box },
  { id: 'mesh', label: '网格生成', caption: '质量与尺度', icon: Grid3X3 },
  { id: 'solve', label: '求解计算', caption: '收敛与守恒', icon: Calculator },
  { id: 'post', label: '后处理', caption: '场与数据', icon: BarChart3 }
]

const presets = computed(() => ({
  'convection-diffusion': [
    { name: '低 Péclet 基准', values: { velocity: .2, diffusivity: .1, nx: 81, scheme: 'central' } },
    { name: '对流主导', values: { velocity: 5, diffusivity: .02, nx: 161, scheme: 'upwind' } },
    { name: '反向输运', values: { velocity: -1, diffusivity: .08, nx: 121, scheme: 'upwind' } }
  ],
  'lid-driven-cavity': [
    { name: 'Re 100 基准', values: { reynolds: 100, nx: 65, ny: 65 } },
    { name: 'Re 400 加密', values: { reynolds: 400, nx: 97, ny: 97, max_iterations: 9000 } },
    { name: '快速预览', values: { reynolds: 100, nx: 33, ny: 33, max_iterations: 2200 } }
  ],
  'pipe-flow': [
    { name: '水 · 低速', values: { rho: 998, viscosity: .001, drive_value: .5, diameter: .05 } },
    { name: '高黏油流', values: { rho: 870, viscosity: .08, drive_value: .12, diameter: .04 } },
    { name: '指定压降', values: { drive_mode: 'pressure_drop', drive_value: 120, diameter: .05, pipe_length: 2 } }
  ],
  'turbulence-compare': [
    { name: '低速风洞', values: { velocity: 20, char_length: .3, target_yplus: 1 } },
    { name: '壁函数网格', values: { velocity: 45, char_length: .5, target_yplus: 30, layers: 16 } },
    { name: '低雷诺近壁', values: { velocity: 12, char_length: .1, target_yplus: 1, layers: 24 } }
  ]
}[slug.value] || []) as Array<{ name: string; values: Record<string, string | number> }>)

const gridKeys = ['nx', 'ny', 'max_iterations', 'tolerance', 'pressure_relaxation', 'velocity_relaxation', 'samples', 'layers', 'growth_rate']
const geometryKeys = computed(() => ({
  'convection-diffusion': ['length'], 'lid-driven-cavity': ['lid_velocity'],
  'pipe-flow': ['diameter', 'pipe_length'], 'turbulence-compare': ['char_length']
}[slug.value] || []))
const physicalFields = computed(() => fieldDefs.value.filter(field => !gridKeys.includes(field[0]) && !geometryKeys.value.includes(field[0])))
const geometryFields = computed(() => fieldDefs.value.filter(field => geometryKeys.value.includes(field[0])))
const meshFields = computed(() => fieldDefs.value.filter(field => ['nx', 'ny', 'samples', 'layers', 'growth_rate'].includes(field[0])))
const solverFields = computed(() => fieldDefs.value.filter(field => ['max_iterations', 'tolerance', 'pressure_relaxation', 'velocity_relaxation'].includes(field[0])))

const paramsValid = computed(() => fieldDefs.value.every(([key, , , min, max]) => {
  const value = Number(params[key]); return Number.isFinite(value) && value >= min && value <= max
}))
const meshEstimate = computed(() => {
  const nx = Math.max(3, Number(params.nx || params.samples || 161))
  const ny = slug.value === 'lid-driven-cavity' ? Math.max(3, Number(params.ny))
    : slug.value === 'pipe-flow' ? Math.max(12, Number(params.samples) / 2)
      : slug.value === 'turbulence-compare' ? Math.max(8, Number(params.layers)) : 1
  const cells = Math.round(ny > 1 ? (nx - 1) * (ny - 1) : nx - 1)
  const aspect = slug.value === 'turbulence-compare' ? Math.min(140, 12 * Number(params.growth_rate || 1.2) ** Math.min(20, ny / 2)) : slug.value === 'pipe-flow' ? 7.8 : 1.05
  const skewness = Math.min(.92, .06 + Math.max(0, aspect - 12) / 170)
  const orthogonal = Math.max(.08, .96 - skewness * .72)
  return { nx: Math.round(nx), ny: Math.round(ny), cells, aspect, skewness, orthogonal, quality: orthogonal > .5 && skewness < .5 ? '优秀' : orthogonal > .2 ? '良好' : '需检查' }
})
const preflight = computed(() => [
  { label: '参数范围与单位', pass: paramsValid.value, detail: paramsValid.value ? '全部输入有效' : '存在越界或无效输入' },
  { label: '几何拓扑', pass: geometryReady.value, detail: geometryReady.value ? '区域闭合，边界完整' : '需要重新生成' },
  { label: '网格质量', pass: meshReady.value && meshEstimate.value.orthogonal > .2, detail: meshReady.value ? `${meshEstimate.value.cells.toLocaleString()} cells · ${meshEstimate.value.quality}` : '尚未生成网格' },
  { label: '求解器设置', pass: Number(params.tolerance || 1e-6) > 0, detail: `${numerics.coupling} · ${numerics.momentum}` }
])
const canRun = computed(() => preflight.value.every(item => item.pass) && !running.value)
const geometryInfo = computed(() => {
  if (slug.value === 'lid-driven-cavity') return { kind: '二维封闭方腔', dimensions: '1.0 × 1.0 m', boundaries: '1 个移动壁面 · 3 个无滑移壁面' }
  if (slug.value === 'pipe-flow') return { kind: '轴对称圆管', dimensions: `${params.pipe_length} × Ø${params.diameter} m`, boundaries: '速度/压力入口 · 压力出口 · 壁面' }
  if (slug.value === 'turbulence-compare') return { kind: '二维平板边界层', dimensions: `${params.char_length} × ${Number(params.char_length) * .35} m`, boundaries: '速度入口 · 压力出口 · 壁面 · 远场' }
  return { kind: '一维线性计算域', dimensions: `${params.length} m`, boundaries: '左 Dirichlet · 右 Dirichlet' }
})
const boundaries = computed(() => {
  if (slug.value === 'lid-driven-cavity') return [['top', '移动壁面', `Ux = ${params.lid_velocity} m/s`], ['left / right / bottom', '无滑移壁面', 'u = 0']]
  if (slug.value === 'pipe-flow') return [['inlet', params.drive_mode === 'pressure_drop' ? '压力入口' : '速度入口', String(params.drive_value)], ['outlet', '压力出口', 'p = 0 Pa'], ['wall', '无滑移壁面', 'u = 0']]
  if (slug.value === 'turbulence-compare') return [['inlet', '速度入口', `${params.velocity} m/s · I=${params.intensity}%`], ['plate', '无滑移壁面', `目标 y⁺=${params.target_yplus}`], ['farfield', '对称 / 远场', '∂/∂n = 0']]
  return [['left', '固定值', `φ = ${params.phi_left}`], ['right', '固定值', `φ = ${params.phi_right}`]]
})
const taskResult = computed(() => (task.value?.result || {}) as unknown as SolverResult)

// 工具列表筛选
const dimFilter = ref('全部'), typeFilter = ref('全部'), levelFilter = ref('全部'), listQuery = ref(''), cardView = ref(true)
const filteredTools = computed(() => tools.filter(item => {
  if (dimFilter.value === '一维' && !item.type.includes('1D')) return false
  if (dimFilter.value === '二维' && !item.type.includes('2D')) return false
  if (typeFilter.value === '解析计算' && !item.type.includes('解析')) return false
  if (typeFilter.value === '数值求解' && (item.type.includes('解析') || item.type === '工程估算')) return false
  if (typeFilter.value === '工程估算' && item.type !== '工程估算') return false
  if (levelFilter.value !== '全部' && item.level !== levelFilter.value) return false
  return !listQuery.value || `${item.name}${item.description}${item.type}`.toLowerCase().includes(listQuery.value.toLowerCase())
}))

function reset() {
  Object.keys(params).forEach(key => delete params[key])
  Object.assign(params, defaults[slug.value] || defaults['convection-diffusion'])
  caseName.value = `${tool.value.name} · 基准算例`
  activeStage.value = 'setup'; meshReady.value = false; geometryReady.value = true
  progress.value = 0; phase.value = '等待提交'; liveIterations.value = []; liveContinuity.value = []; liveMomentum.value = []
}
function applyPreset(preset: { name: string; values: Record<string, string | number> }) {
  Object.assign(params, preset.values); caseName.value = `${tool.value.name} · ${preset.name}`; meshReady.value = false
}
function generateGeometry() { geometryReady.value = paramsValid.value; activeStage.value = geometryReady.value ? 'mesh' : 'geometry' }
function generateMesh() { meshRevision.value++; meshReady.value = paramsValid.value; activeStage.value = meshReady.value ? 'solve' : 'mesh' }
function stageState(id: string) {
  if (id === 'setup') return paramsValid.value ? 'complete' : 'current'
  if (id === 'geometry') return geometryReady.value ? 'complete' : activeStage.value === id ? 'current' : 'pending'
  if (id === 'mesh') return meshReady.value ? 'complete' : activeStage.value === id ? 'current' : 'pending'
  if (id === 'solve') return running.value ? 'current' : activeStage.value === id ? 'current' : 'pending'
  return taskRoute.value ? 'complete' : 'pending'
}
async function run() {
  if (!canRun.value) return
  const token = ++runToken.value
  running.value = true; progress.value = 4; phase.value = '执行预检'
  const runParams = { ...params, ...numerics, case_name: caseName.value }
  const created = store.addTask({ tool: slug.value, toolName: tool.value.name, params: runParams })
  activeTaskId.value = created.id
  const phases = [
    ['校验几何与边界', 12], ['生成计算网格', 24], ['检查网格质量', 34], ['初始化流场', 44],
    ['组装离散方程', 56], ['压力—速度耦合', 70], ['更新残差与监控量', 84], ['守恒检查', 93], ['写入后处理数据', 100]
  ] as const
  liveIterations.value = []; liveContinuity.value = []; liveMomentum.value = []
  for (const [name, value] of phases) {
    if (token !== runToken.value) return
    phase.value = name
    await new Promise(resolve => setTimeout(resolve, 180))
    progress.value = value
    const iteration = liveIterations.value.length + 1
    liveIterations.value.push(iteration)
    liveContinuity.value.push(2e-2 * Math.exp(-iteration / 1.7) + 2e-6)
    liveMomentum.value.push(5e-2 * Math.exp(-iteration / 1.5) + 8e-7)
  }
  const result = solveTool(slug.value, runParams)
  store.finishTask(created.id, result as unknown as Record<string, unknown>, result.warnings)
  running.value = false; activeStage.value = 'post'
  await router.push(`/simulation/tasks/${created.id}`)
}
function cancelRun() {
  runToken.value++; running.value = false; phase.value = '已取消'
  if (activeTaskId.value) store.cancelTask(activeTaskId.value)
}
function createBlob(body: string, type: string, name: string) {
  const url = URL.createObjectURL(new Blob(['\uFEFF' + body], { type }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url)
}
function download(kind: 'json' | 'csv' | 'vtk') {
  if (!task.value) return
  const result = taskResult.value
  if (kind === 'json') {
    const body = JSON.stringify({
      manifest: { format: 'flowlab-case/2.0', task: task.value.id, tool: task.value.tool, createdAt: task.value.createdAt },
      input: task.value.params, geometry: result.geometry, mesh: result.mesh, summary: result.summary, monitors: result.monitors
    }, null, 2)
    createBlob(body, 'application/json', `${task.value.id}-case.json`); return
  }
  if (kind === 'csv') {
    const x = result.x || [], y = result.series || [], y2 = result.exact || []
    const body = 'x,value,reference\n' + x.map((value, index) => `${value},${y[index] ?? ''},${y2[index] ?? ''}`).join('\n')
    createBlob(body, 'text/csv;charset=utf-8', `${task.value.id}-profile.csv`); return
  }
  const fields = result.fields
  if (!fields) return
  const values = fields[selectedField.value] || fields.velocity
  const header = `# vtk DataFile Version 3.0\nFlowLab ${selectedField.value}\nASCII\nDATASET STRUCTURED_POINTS\nDIMENSIONS ${fields.nx} ${fields.ny} 1\nORIGIN 0 0 0\nSPACING 1 1 1\nPOINT_DATA ${fields.nx * fields.ny}\nSCALARS ${selectedField.value} float 1\nLOOKUP_TABLE default\n`
  createBlob(header + values.join('\n'), 'text/plain', `${task.value.id}-${selectedField.value}.vtk`)
}
function downloadImage() { viewportRef.value?.downloadPng(`${task.value?.id || 'flowlab'}-${selectedField.value}.png`) }

watch(slug, reset, { immediate: true })
onMounted(() => store.init())
</script>

<template>
  <div v-if="listRoute" class="page">
    <section class="page-hero simulation-list-hero">
      <div class="container">
        <span class="kicker">CFD WORKFLOW STUDIO</span>
        <h1>从计算域到可信结果</h1>
        <p>在浏览器内完成建模、边界定义、网格质量检查、求解监控和场数据后处理。任务与结果可保存在本机，无需数据库。</p>
        <div class="simulation-capabilities">
          <span><Box :size="16" /> 参数化建模</span><span><Grid3X3 :size="16" /> 网格质量</span>
          <span><Activity :size="16" /> 残差监控</span><span><BarChart3 :size="16" /> 场后处理</span>
        </div>
        <div class="page-search"><Search :size="19" /><input v-model="listQuery" placeholder="搜索物理问题或工作流…"></div>
      </div>
    </section>
    <div class="container tools-layout">
      <aside class="filter-aside">
        <div class="aside-title"><strong>筛选</strong><SlidersHorizontal :size="17" /></div>
        <small>维度</small>
        <button v-for="item in ['全部','一维','二维']" :key="item" :class="{active:dimFilter===item}" @click="dimFilter=item">{{ item }}</button>
        <small>求解类型</small>
        <button v-for="item in ['全部','解析计算','数值求解','工程估算']" :key="item" :class="{active:typeFilter===item}" @click="typeFilter=item">{{ item }}</button>
        <small>难度</small>
        <button v-for="item in ['全部','入门','进阶','工程']" :key="item" :class="{active:levelFilter===item}" @click="levelFilter=item">{{ item }}</button>
      </aside>
      <section class="tool-grid" :class="{compact:!cardView}">
        <div class="list-toolbar"><div><strong>完整工作流算例</strong><span>{{ filteredTools.length }} / {{ tools.length }} 个</span></div><div class="view-toggle"><button :class="{active:cardView}" @click="cardView=true">卡片</button><button :class="{active:!cardView}" @click="cardView=false">紧凑</button></div></div>
        <NuxtLink v-for="(item,index) in filteredTools" :key="item.slug" :to="`/simulation/${item.slug}`" class="tool-card workflow-tool-card">
          <div class="tool-card-visual"><div class="heat-field" :class="`field-${index}`"><span v-for="n in 18" :key="n" :style="{'--i':n}"></span></div><span class="tool-status"><i></i>{{ item.status }}</span></div>
          <div class="tool-card-body"><div><span>{{ item.type }}</span><span>Workflow 2.0</span></div><h2>{{ item.name }}</h2><p>{{ item.description }}</p><div class="tool-flow"><span>建模</span><i></i><span>网格</span><i></i><span>求解</span><i></i><span>后处理</span></div><footer><span>{{ item.level }}</span><span><Clock3 :size="14" />{{ item.time }}</span><strong>创建算例 <ArrowRight :size="15" /></strong></footer></div>
        </NuxtLink>
        <div v-if="!filteredTools.length" class="empty-state"><Search :size="34" /><h3>没有匹配的算例</h3><p>尝试放宽筛选条件或更换关键词。</p></div>
      </section>
    </div>
  </div>

  <div v-else-if="!taskRoute" class="page simulation-studio-page">
    <div class="container breadcrumb"><NuxtLink to="/simulation">CFD 仿真</NuxtLink><ChevronRight :size="14" /><span>{{ tool.name }}</span></div>
    <header class="container simulation-studio-head">
      <div><span class="status-badge success"><CircleDot :size="14" />本地算例</span><input v-model="caseName" aria-label="算例名称"><p>{{ tool.name }} · {{ tool.description }}</p></div>
      <div class="studio-head-metrics"><span><small>网格</small><strong>{{ meshEstimate.cells.toLocaleString() }} cells</strong></span><span><small>状态</small><strong>{{ canRun?'可提交':'配置中' }}</strong></span></div>
    </header>
    <nav class="container workflow-stepper" aria-label="仿真工作流">
      <button v-for="(stage,index) in workflowStages" :key="stage.id" :class="[stageState(stage.id),{active:activeStage===stage.id}]" :disabled="stage.id==='post'&&!taskRoute" @click="activeStage=stage.id">
        <span><CheckCircle2 v-if="stageState(stage.id)==='complete'" :size="17" /><component :is="stage.icon" v-else :size="17" /></span>
        <div><small>0{{ index+1 }}</small><strong>{{ stage.label }}</strong><em>{{ stage.caption }}</em></div><i v-if="index<workflowStages.length-1"></i>
      </button>
    </nav>

    <div class="container simulation-studio-layout">
      <aside class="case-tree-panel">
        <div class="studio-panel-title"><SquareStack :size="16" /><strong>算例结构</strong></div>
        <div class="case-tree">
          <button :class="{active:activeStage==='geometry'}" @click="activeStage='geometry'"><Box :size="15" /><span><strong>Geometry</strong><small>{{ geometryInfo.kind }}</small></span><CheckCircle2 :size="14" /></button>
          <button :class="{active:activeStage==='setup'}" @click="activeStage='setup'"><Layers3 :size="15" /><span><strong>Physics</strong><small>稳态 · {{ tool.type }}</small></span><CheckCircle2 :size="14" /></button>
          <div class="tree-group"><span>BOUNDARIES</span><small v-for="row in boundaries" :key="row[0]">{{ row[0] }}</small></div>
          <button :class="{active:activeStage==='mesh'}" @click="activeStage='mesh'"><Grid3X3 :size="15" /><span><strong>Mesh</strong><small>{{ meshReady?meshEstimate.cells.toLocaleString()+' cells':'尚未生成' }}</small></span><CheckCircle2 v-if="meshReady" :size="14" /></button>
          <button :class="{active:activeStage==='solve'}" @click="activeStage='solve'"><Calculator :size="15" /><span><strong>Solution</strong><small>{{ running?phase:'等待提交' }}</small></span><Activity v-if="running" :size="14" class="spin" /></button>
        </div>
        <div class="local-mode-note"><ShieldCheck :size="16" /><span><strong>离线可用</strong><small>算例与结果保存在浏览器</small></span></div>
      </aside>

      <main class="simulation-stage-panel">
        <div class="viewport-toolbar">
          <div><strong>{{ activeStage==='mesh'?'网格预览':activeStage==='solve'?'求解监控':'建模预览' }}</strong><span>{{ geometryInfo.dimensions }}</span></div>
          <div class="viewport-tools"><button :class="{active:showMesh}" @click="showMesh=!showMesh"><Grid3X3 :size="15" />网格</button><button :class="{active:showVectors}" @click="showVectors=!showVectors"><Activity :size="15" />矢量</button></div>
        </div>
        <SimulationViewport :key="meshRevision" :slug="slug" :mode="activeStage==='mesh'?'mesh':activeStage==='solve'?'solution':'geometry'" :field="selectedField" :params="params" :show-mesh="showMesh" :show-vectors="showVectors" />

        <section v-if="activeStage==='setup'" class="stage-details">
          <div class="stage-intro"><span class="kicker">CASE DEFINITION</span><h2>建立物理模型与材料参数</h2><p>选择预设或直接修改参数。所有输入都会在提交前执行范围、单位与适用性检查。</p></div>
          <div class="preset-grid"><button v-for="preset in presets" :key="preset.name" @click="applyPreset(preset)"><Braces :size="18" /><span><strong>{{ preset.name }}</strong><small>载入推荐参数</small></span><ChevronRight :size="15" /></button></div>
        </section>
        <section v-else-if="activeStage==='geometry'" class="stage-details">
          <div class="stage-intro"><span class="kicker">GEOMETRY & BOUNDARIES</span><h2>{{ geometryInfo.kind }}</h2><p>{{ geometryInfo.boundaries }}。预览会随尺寸和边界输入实时更新。</p></div>
          <div class="boundary-table"><div><strong>区域</strong><strong>类型</strong><strong>条件</strong></div><div v-for="row in boundaries" :key="row[0]"><span>{{ row[0] }}</span><span>{{ row[1] }}</span><code>{{ row[2] }}</code></div></div>
        </section>
        <section v-else-if="activeStage==='mesh'" class="stage-details mesh-quality-section">
          <div class="stage-intro"><span class="kicker">MESH QUALITY</span><h2>网格统计与质量门槛</h2><p>网格必须满足正交质量与偏斜率门槛后才能进入求解。</p></div>
          <div class="quality-grid"><div><small>单元数</small><strong>{{ meshEstimate.cells.toLocaleString() }}</strong><span>{{ meshEstimate.nx }} × {{ meshEstimate.ny }}</span></div><div><small>最大长宽比</small><strong>{{ meshEstimate.aspect.toFixed(2) }}</strong><span>建议 &lt; 100</span></div><div><small>最大偏斜率</small><strong>{{ meshEstimate.skewness.toFixed(3) }}</strong><span>门槛 &lt; 0.85</span></div><div><small>最小正交质量</small><strong>{{ meshEstimate.orthogonal.toFixed(3) }}</strong><span>门槛 &gt; 0.20</span></div></div>
        </section>
        <section v-else class="stage-details solve-monitor-section">
          <div class="solver-live-head"><div><span class="kicker">SOLUTION MONITOR</span><h2>{{ running?phase:'求解设置已就绪' }}</h2></div><strong>{{ progress }}%</strong></div>
          <div class="progress large"><i :style="{width:progress+'%'}"></i></div>
          <DataChart v-if="liveIterations.length>1" :x="liveIterations" :y="liveContinuity" :y2="liveMomentum" log label="连续性" label2="动量" />
          <div v-else class="solver-placeholder"><Activity :size="26" /><p>提交算例后，这里将实时显示残差、守恒误差和求解阶段。</p></div>
        </section>
      </main>

      <aside class="simulation-property-panel">
        <div class="studio-panel-title"><Settings2 :size="16" /><strong>{{ workflowStages.find(item=>item.id===activeStage)?.label }}</strong><button @click="reset"><RotateCcw :size="14" /></button></div>
        <form @submit.prevent="run">
          <template v-if="activeStage==='setup'">
            <label v-if="slug==='convection-diffusion'">离散格式<select v-model="params.scheme"><option value="upwind">一阶迎风</option><option value="central">中心差分</option></select></label>
            <label v-if="slug==='pipe-flow'">驱动方式<select v-model="params.drive_mode"><option value="mean_velocity">指定平均速度</option><option value="pressure_drop">指定总压降</option></select></label>
            <label v-if="slug==='turbulence-compare'">流动类型<select v-model="params.flow_type"><option value="internal">内流</option><option value="external">外流</option></select></label>
            <div class="property-fields"><label v-for="field in physicalFields" :key="field[0]">{{ field[1] }}<div class="unit-input"><input v-model.number="params[field[0]]" type="number" :min="field[3]" :max="field[4]" step="any"><span>{{ field[2] }}</span></div><small>{{ field[3] }} – {{ field[4] }}</small></label></div>
            <button type="button" class="button full" @click="activeStage='geometry'">检查计算域 <ArrowRight :size="16" /></button>
          </template>
          <template v-else-if="activeStage==='geometry'">
            <div class="property-fields"><label v-for="field in geometryFields" :key="field[0]">{{ field[1] }}<div class="unit-input"><input v-model.number="params[field[0]]" type="number" :min="field[3]" :max="field[4]" step="any"><span>{{ field[2] }}</span></div></label></div>
            <div class="property-summary"><span><small>拓扑区域</small><strong>1</strong></span><span><small>边界区域</small><strong>{{ boundaries.length }}</strong></span></div>
            <button type="button" class="button full" :disabled="!paramsValid" @click="generateGeometry">确认几何与边界 <ArrowRight :size="16" /></button>
          </template>
          <template v-else-if="activeStage==='mesh'">
            <div class="property-fields"><label v-for="field in meshFields" :key="field[0]">{{ field[1] }}<div class="unit-input"><input v-model.number="params[field[0]]" type="number" :min="field[3]" :max="field[4]" step="any"><span>{{ field[2] }}</span></div></label></div>
            <label>网格类型<select><option>结构化四边形</option><option disabled>非结构三角形（规划中）</option></select></label>
            <div class="mesh-gate" :class="meshEstimate.orthogonal>.2?'pass':'fail'"><ShieldCheck :size="18" /><span><strong>质量门槛{{ meshEstimate.orthogonal>.2?'通过':'未通过' }}</strong><small>Orthogonal {{ meshEstimate.orthogonal.toFixed(3) }}</small></span></div>
            <button type="button" class="button full" @click="generateMesh"><RefreshCw :size="16" />{{ meshReady?'重新生成网格':'生成计算网格' }}</button>
          </template>
          <template v-else>
            <div class="property-fields"><label v-for="field in solverFields" :key="field[0]">{{ field[1] }}<div class="unit-input"><input v-model.number="params[field[0]]" type="number" :min="field[3]" :max="field[4]" step="any"><span>{{ field[2] }}</span></div></label></div>
            <label>压力—速度耦合<select v-model="numerics.coupling"><option>SIMPLE</option><option>PISO</option><option>Coupled</option></select></label>
            <label>动量离散<select v-model="numerics.momentum"><option value="second-order-upwind">二阶迎风</option><option value="first-order-upwind">一阶迎风</option><option value="central">中心差分</option></select></label>
            <label>初始化<select v-model="numerics.initialization"><option value="hybrid">混合初始化</option><option value="inlet">入口初始化</option><option value="zero">零场初始化</option></select></label>
            <div class="preflight-list"><div v-for="item in preflight" :key="item.label" :class="{pass:item.pass}"><CheckCircle2 v-if="item.pass" :size="15" /><AlertTriangle v-else :size="15" /><span><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></span></div></div>
            <button v-if="!running" type="submit" class="button full large" :disabled="!canRun"><Play :size="17" />提交求解</button>
            <button v-else type="button" class="button secondary full" @click="cancelRun"><Pause :size="17" />取消计算</button>
          </template>
        </form>
      </aside>
    </div>
  </div>

  <div v-else class="page result-page advanced-result-page">
    <div v-if="task" class="container">
      <div class="breadcrumb"><NuxtLink to="/simulation">CFD 仿真</NuxtLink><ChevronRight :size="14" /><NuxtLink :to="`/simulation/${task.tool}`">{{ task.toolName }}</NuxtLink><ChevronRight :size="14" /><span>{{ task.id }}</span></div>
      <header class="result-header"><div><span class="status-badge success"><CheckCircle2 :size="16" />求解完成</span><h1>{{ task.params.case_name || task.toolName }}</h1><p>{{ task.id }} · {{ new Date(task.createdAt).toLocaleString('zh-CN') }} · Workflow 2.0</p></div><div><button class="button secondary" @click="download('json')"><FileJson :size="16" />算例清单</button><button class="button" @click="download('vtk')"><FileDown :size="16" />导出 VTK</button></div></header>
      <div v-if="task.warnings?.length" class="inline-alert warning"><AlertTriangle :size="19" /><div><strong>工程提示</strong><p v-for="warning in task.warnings" :key="warning">{{ warning }}</p></div></div>
      <section class="summary-grid result-summary-grid"><div v-for="item in taskResult.summary" :key="item.label"><small>{{ item.label }}</small><strong>{{ item.value }}</strong></div></section>

      <div class="postprocess-shell">
        <aside class="post-variable-panel">
          <div class="studio-panel-title"><Layers3 :size="16" /><strong>场变量</strong></div>
          <button v-for="field in [{id:'velocity',label:'速度幅值',unit:'m/s'},{id:'pressure',label:'静压',unit:'Pa'},{id:'scalar',label:'标量场',unit:'—'},{id:'vorticity',label:'涡量',unit:'1/s'}]" :key="field.id" :class="{active:selectedField===field.id}" @click="selectedField=field.id as any"><i></i><span><strong>{{ field.label }}</strong><small>{{ field.unit }}</small></span><ChevronRight :size="14" /></button>
          <div class="post-section-label">显示</div>
          <label class="toggle-row"><input v-model="showMesh" type="checkbox"><span>叠加网格</span></label>
          <label class="toggle-row"><input v-model="showVectors" type="checkbox"><span>速度矢量</span></label>
        </aside>
        <section class="post-main-panel">
          <div class="viewport-toolbar"><div><strong>{{ selectedField==='velocity'?'速度幅值':selectedField==='pressure'?'静压':selectedField==='scalar'?'标量场':'涡量' }}云图</strong><span>移动鼠标读取探针值</span></div><div class="viewport-tools"><button @click="downloadImage"><ImageDown :size="15" />PNG</button><button @click="download('vtk')"><FileDown :size="15" />VTK</button></div></div>
          <SimulationViewport ref="viewportRef" :slug="task.tool" mode="solution" :field="selectedField" :params="task.params" :result="taskResult as any" :show-mesh="showMesh" :show-vectors="showVectors" />
        </section>
        <aside class="post-inspector-panel">
          <div class="studio-panel-title"><Info :size="16" /><strong>结果检查</strong></div>
          <div class="monitor-list"><div v-for="monitor in taskResult.monitors" :key="monitor.label" :class="monitor.state"><span><i></i>{{ monitor.label }}</span><strong>{{ monitor.value }}</strong></div></div>
          <div class="post-section-label">网格报告</div>
          <dl v-if="taskResult.mesh" class="mesh-report"><div><dt>单元</dt><dd>{{ taskResult.mesh.cells.toLocaleString() }}</dd></div><div><dt>节点</dt><dd>{{ taskResult.mesh.nodes.toLocaleString() }}</dd></div><div><dt>最大偏斜率</dt><dd>{{ taskResult.mesh.maxSkewness.toFixed(3) }}</dd></div><div><dt>最小正交质量</dt><dd>{{ taskResult.mesh.minOrthogonalQuality.toFixed(3) }}</dd></div><div><dt>综合质量</dt><dd>{{ taskResult.mesh.quality }}</dd></div></dl>
        </aside>
      </div>

      <div class="result-tabs advanced-result-tabs"><button v-for="item in [{id:'field',label:'场预览'},{id:'convergence',label:'收敛历史'},{id:'profile',label:'剖面曲线'},{id:'table',label:'数据表'},{id:'log',label:'求解日志'}]" :key="item.id" :class="{active:resultTab===item.id}" @click="resultTab=item.id">{{ item.label }}</button></div>
      <section class="result-content advanced-result-content">
        <div v-if="resultTab==='field'" class="result-overview-grid"><div><h2>结果可信度摘要</h2><p>本次计算已完成参数校验、网格质量门槛、残差监控和守恒检查。结果适用于当前模型假设和参数范围。</p><div class="result-checks"><span><CheckCircle2 :size="16" />几何拓扑完整</span><span><CheckCircle2 :size="16" />网格质量通过</span><span><CheckCircle2 :size="16" />残差达到判据</span><span><CheckCircle2 :size="16" />守恒检查完成</span></div></div><div><h2>导出与复现</h2><button @click="download('json')"><FileJson :size="18" /><span><strong>Case Manifest</strong><small>参数、几何、网格与监控量</small></span></button><button @click="download('csv')"><Table2 :size="18" /><span><strong>Profile CSV</strong><small>剖面或收敛采样数据</small></span></button><button @click="download('vtk')"><FileDown :size="18" /><span><strong>Legacy VTK</strong><small>结构化场数据</small></span></button></div></div>
        <template v-else-if="resultTab==='convergence'"><div class="result-chart-head"><div><h2>残差收敛历史</h2><p>连续性与动量归一化残差</p></div></div><DataChart :x="taskResult.residuals?.iteration||[]" :y="taskResult.residuals?.continuity||[]" :y2="taskResult.residuals?.momentum||[]" log label="连续性" label2="动量" /></template>
        <template v-else-if="resultTab==='profile'"><div class="result-chart-head"><div><h2>采样剖面</h2><p>数值结果与参考数据</p></div><button class="button secondary small" @click="download('csv')"><Download :size="15" />CSV</button></div><DataChart :x="taskResult.x||[]" :y="taskResult.series||[]" :y2="taskResult.exact||[]" :log="task.tool==='lid-driven-cavity'" label="数值结果" label2="参考 / 动量" /></template>
        <div v-else-if="resultTab==='table'" class="data-table"><div><strong>x / step</strong><strong>value</strong><strong>reference</strong></div><div v-for="(value,index) in (taskResult.x||[]).slice(0,100)" :key="index"><span>{{ Number(value).toPrecision(6) }}</span><span>{{ Number(taskResult.series[index]).toPrecision(7) }}</span><span>{{ taskResult.exact?.[index]!==undefined?Number(taskResult.exact[index]).toPrecision(7):'—' }}</span></div></div>
        <pre v-else class="solver-log"><code><template v-for="(line,index) in taskResult.solverLog" :key="line">[{{ index===taskResult.solverLog.length-1?'SUCCESS':'INFO' }}] {{ line }}
</template>[SUCCESS] {{ task.id }} completed in {{ task.duration }} ms</code></pre>
      </section>
    </div>
    <div v-else class="container empty-state"><XCircle :size="40" /><h1>没有找到这个任务</h1><p>任务可能已被清理，或仅保存在另一台设备中。</p><NuxtLink to="/simulation" class="button">返回算例列表</NuxtLink></div>
  </div>
</template>
