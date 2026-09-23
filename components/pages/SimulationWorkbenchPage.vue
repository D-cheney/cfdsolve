<script setup lang="ts">
import { Activity, Box, Grid3X3, RotateCcw, Settings2, SquareDashed } from 'lucide-vue-next'
import type { ModelingSummary } from '~/types/modeling'
import type { AnalysisMode, PhysicsSolveResult } from '~/types/physics'
import { useMeshingStore } from '~/stores/meshing'
import { useModelingStore } from '~/stores/modeling'

type StepKey = 'model' | 'mesh' | 'boundary' | 'solve' | 'post'

const meshingStore = useMeshingStore()
const modelingStore = useModelingStore()
const route = useRoute()
const router = useRouter()
const activeStep = ref<StepKey>('model')
const result = ref<PhysicsSolveResult | null>(null)
const caseValid = ref(false)
const caseMode = ref<AnalysisMode | null>(null)
const resetToken = ref(0)
const sketchStats = ref<Pick<ModelingSummary, 'entities' | 'closedProfiles' | 'hasDomain'>>({ entities: 0, closedProfiles: 0, hasDomain: false })
const currentGeometry = ref('')

const steps = [
  { key: 'model' as const, index: '01', label: '建模', note: '精确二维几何', icon: Box },
  { key: 'mesh' as const, index: '02', label: '网格划分', note: '离散、面域与边界', icon: Grid3X3 },
  { key: 'boundary' as const, index: '03', label: '物理设置', note: '材料与边界条件', icon: SquareDashed },
  { key: 'solve' as const, index: '04', label: '计算求解', note: '流体、固体与耦合', icon: Settings2 },
  { key: 'post' as const, index: '05', label: '后处理', note: '位移、应力与流场', icon: Activity },
]

const activeIndex = computed(() => steps.findIndex(step => step.key === activeStep.value))
const physicsStage = computed(() => ['boundary', 'solve', 'post'].includes(activeStep.value) ? activeStep.value as 'boundary' | 'solve' | 'post' : null)
const mesh = computed(() => meshingStore.project?.result)
const modeName = computed(() => caseMode.value ? ({ fluid: '流体', solid: '固体', 'fsi-one-way': '单向流固耦合', 'fsi-two-way': '双向流固耦合' }[caseMode.value]) : '待设置')

function stepState(key: StepKey) {
  const index = steps.findIndex(step => step.key === key)
  if (index === activeIndex.value) return 'active'
  if (key === 'model') return modelingStore.closedProfiles ? 'done' : 'ready'
  if (key === 'mesh') return meshingStore.canAccept ? 'done' : 'ready'
  if (key === 'boundary') return meshingStore.canAccept && caseValid.value ? 'done' : 'ready'
  if (key === 'solve') return result.value ? 'done' : 'ready'
  if (key === 'post') return result.value ? 'done' : 'ready'
  return 'ready'
}

function selectStep(key: StepKey) {
  if (['boundary', 'solve', 'post'].includes(key) && !meshingStore.project?.result) {
    activeStep.value = 'mesh'
    return
  }
  activeStep.value = key
}

function handleGeometryChange(value: ModelingSummary) {
  sketchStats.value = value
  const signature = `${value.documentId}:${value.revision}`
  if (currentGeometry.value && currentGeometry.value !== signature) { result.value = null; caseValid.value = false }
  currentGeometry.value = signature
}

function acceptMesh() {
  result.value = null
  caseValid.value = false
  activeStep.value = 'boundary'
}

function navigatePhysics(stage: 'mesh' | 'boundary' | 'solve' | 'post') {
  activeStep.value = stage
}

function resetCase() {
  result.value = null
  caseValid.value = false
  caseMode.value = null
  modelingStore.newDocument()
  meshingStore.$reset()
  activeStep.value = 'model'
}
onMounted(async () => {
  await meshingStore.initialize()
  const saved = sessionStorage.getItem('cfdrookie:simulation-step') as StepKey | null
  const requested = route.query.step as StepKey | undefined
  if (requested && steps.some(step => step.key === requested)) selectStep(requested)
  else if (saved && steps.some(step => step.key === saved)) selectStep(saved)
})
watch(activeStep, value => {
  if (!import.meta.client) return
  sessionStorage.setItem('cfdrookie:simulation-step', value)
  if (route.query.step !== value) void router.push({ query: { ...route.query, step: value } })
})
watch(() => route.query.step, value => {
  if (typeof value === 'string' && steps.some(step => step.key === value) && value !== activeStep.value) selectStep(value as StepKey)
})
watch(() => mesh.value?.id, (next, previous) => {
  if (previous && next !== previous) {
    result.value = null
    caseValid.value = false
  }
})
</script>

<template>
  <main class="simulation-workbench">
    <header class="workbench-head">
      <div>
        <span>CFD WORKBENCH</span>
        <h1>{{ activeStep === 'model' ? '二维建模工作区' : activeStep === 'mesh' ? '二维网格划分工作区' : '二维多物理场仿真工作台' }}</h1>
        <p>{{ activeStep === 'model' ? '绘制、约束并检查二维封闭区域。' : activeStep === 'mesh' ? '生成计算网格，并完成边界及面域命名。' : '配置并计算流体、固体或流固耦合问题。' }}</p>
      </div>
      <button type="button" @click="resetCase"><RotateCcw :size="15" />重置算例</button>
    </header>

    <section v-if="physicsStage" class="case-strip" aria-label="当前算例摘要">
      <div><small>分析类型</small><strong>{{ modeName }}</strong></div>
      <div><small>面域 / 边界</small><strong>{{ meshingStore.project?.cellZones.length ?? 0 }} / {{ meshingStore.project?.boundarySets.length ?? 0 }}</strong></div>
      <div><small>网格节点</small><strong>{{ mesh?.nodes.length ?? 0 }}</strong></div>
      <div><small>网格单元</small><strong>{{ mesh?.cells.length ?? 0 }}</strong></div>
      <span class="case-status" :class="{ solved: result }"><i></i>{{ result ? (result.converged ? '计算已收敛' : '已有计算结果') : '设置中' }}</span>
    </section>

    <nav class="workflow-nav" aria-label="CFD 仿真流程">
      <button v-for="step in steps" :key="step.key" type="button" :class="['workflow-step', stepState(step.key)]" :aria-current="activeStep === step.key ? 'step' : undefined" @click="selectStep(step.key)">
        <span class="step-index">{{ stepState(step.key) === 'done' ? '✓' : step.index }}</span><component :is="step.icon" :size="18"/><span><strong>{{ step.label }}</strong><small>{{ step.note }}</small></span>
      </button>
    </nav>
    <div class="workbench-shell" :class="{ expanded: activeStep === 'model' || activeStep === 'mesh' }">
      <section class="stage-panel">
        <CfdSketcher v-if="activeStep === 'model'" :reset-token="resetToken" @geometry-change="handleGeometryChange" @go-mesh="activeStep='mesh'" />
        <MeshingWorkspace v-else-if="activeStep === 'mesh'" @back="activeStep='model'" @accepted="acceptMesh" />
        <CfdPhysicsWorkbench v-else-if="physicsStage" :key="`physics-${resetToken}`" :stage="physicsStage" :reset-token="resetToken" @navigate="navigatePhysics" @solved="result=$event" @case-state="caseValid=$event.valid; caseMode=$event.mode" />
      </section>
    </div>
  </main>
</template>

<style scoped>
.simulation-workbench,.simulation-workbench *{box-sizing:border-box}.simulation-workbench{min-height:100vh;padding:32px clamp(18px,4vw,64px) 56px;background:#f4f7f9;color:#142a38}.workbench-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;max-width:1480px;margin:0 auto 22px}.workbench-head>div>span{color:#167cad;font-size:10px;font-weight:800;letter-spacing:.16em}.workbench-head h1{margin:7px 0 6px;font-size:clamp(28px,4vw,46px);letter-spacing:-.045em}.workbench-head p{margin:0;color:#647783;font-size:13px}.workbench-head button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0 14px;border:1px solid #cbd7de;border-radius:7px;background:#fff;color:#294654;font-weight:700;cursor:pointer}.case-strip{display:grid;grid-template-columns:repeat(4,1fr) auto;align-items:center;gap:1px;max-width:1480px;margin:0 auto 14px;overflow:hidden;border:1px solid #d7e0e5;border-radius:9px;background:#d7e0e5}.case-strip>div{height:66px;padding:13px 18px;background:#fff}.case-strip small,.case-strip strong{display:block}.case-strip small{margin-bottom:4px;color:#7a8b94;font-size:9px;font-weight:700;letter-spacing:.08em}.case-strip strong{font-size:12px}.case-status{display:flex;align-items:center;gap:7px;height:66px;padding:0 18px;background:#fff;color:#687a84;font-size:11px;font-weight:700}.case-status i{width:7px;height:7px;border-radius:50%;background:#9caeb7}.case-status.solved{color:#167349}.case-status.solved i{background:#25a268}.workbench-shell{display:grid;grid-template-columns:230px minmax(0,1fr);max-width:1480px;min-height:680px;margin:auto;border:1px solid #d7e0e5;border-radius:10px;background:#fff;box-shadow:0 18px 45px rgba(29,55,70,.07);overflow:hidden}.workbench-shell.expanded{display:block;max-width:none;min-height:0;border:0;background:transparent;box-shadow:none;overflow:visible}.workflow-nav{display:flex;flex-direction:column;padding:24px 14px;border-right:1px solid #dfe7eb;background:#f9fbfc}.workflow-title{padding:0 12px 18px}.workflow-title small,.workflow-title strong{display:block}.workflow-title small{color:#8a9aa3;font-size:9px;letter-spacing:.12em}.workflow-title strong{font-size:14px}.workflow-step{display:grid;grid-template-columns:29px 20px 1fr;align-items:center;gap:8px;width:100%;padding:14px 10px;border:0;border-radius:7px;background:transparent;color:#67808e;text-align:left;cursor:pointer}.workflow-step:hover:not(:disabled){background:#edf4f7}.workflow-step.active{background:#e8f3f8;color:#126c99}.workflow-step.done{color:#2a6d5a}.workflow-step:disabled{cursor:not-allowed;opacity:.45}.step-index{display:grid;place-items:center;width:25px;height:25px;border:1px solid #cad8df;border-radius:50%;font-size:9px;font-weight:800}.workflow-step.active .step-index{border-color:#167cad;background:#167cad;color:#fff}.workflow-step.done .step-index{border-color:#7ab69e;background:#e6f5ee}.workflow-step strong,.workflow-step small{display:block}.workflow-step strong{font-size:12px}.workflow-step small{margin-top:3px;color:#91a0a7;font-size:9px}.workflow-foot{display:flex;align-items:flex-start;gap:9px;margin-top:auto;padding:16px 12px 0;border-top:1px solid #e2e9ed;color:#526d7b;font-size:10px;line-height:1.45}.workflow-foot small{color:#91a0a8}.stage-panel{min-width:0;padding:clamp(22px,3vw,42px)}.expanded .stage-panel{padding:0;background:transparent}
@media(max-width:900px){.case-strip{grid-template-columns:1fr 1fr}.case-status{grid-column:span 2}.workbench-shell{grid-template-columns:190px minmax(0,1fr)}}@media(max-width:700px){.simulation-workbench{padding:20px 12px 36px}.workbench-head{align-items:flex-start;flex-direction:column}.workbench-shell{display:block}.workflow-nav{position:sticky;top:0;z-index:4;display:flex;flex-direction:row;overflow-x:auto;padding:8px;border-right:0;border-bottom:1px solid #dfe7eb}.workflow-title,.workflow-foot{display:none}.workflow-step{display:flex;flex:0 0 auto;width:auto;padding:9px}.workflow-step>svg,.workflow-step small{display:none}.stage-panel{padding:22px 15px}}
.workflow-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;max-width:1480px;margin:0 auto 14px;padding:5px;border:1px solid #d7e0e5;border-radius:9px;background:#fff}.workflow-step{grid-template-columns:28px 18px minmax(0,1fr);margin:0}.workflow-step.active{background:#e8f3f8}.workbench-shell:not(.expanded){display:block}.workbench-head{margin-bottom:14px}.case-strip{margin-bottom:14px}@media(max-width:700px){.workflow-nav{display:flex;overflow-x:auto;position:sticky;top:55px;z-index:5}.workflow-step{min-width:max-content;padding:9px 12px}.workflow-step strong{font-size:12px}}
</style>
