<script setup lang="ts">
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Download, PackageOpen, Play, Settings2, Square, SquareDashed } from 'lucide-vue-next'
import type { MeshProject, ZoneRole } from '~/types/meshing'
import type { AnalysisMode, BoundaryConditionType, ExternalCasePackage, PhysicsCase, PhysicsJob, PhysicsSolveResult, SolverCapabilities } from '~/types/physics'
import { boundaryTypesForMode, changePhysicsMode, createPhysicsCase, validatePhysicsCase } from '~/utils/physics-case'
import { useMeshingStore } from '~/stores/meshing'

const props = defineProps<{ stage: 'boundary' | 'solve' | 'post'; resetToken?: number }>()
const emit = defineEmits<{ navigate: [stage: 'mesh' | 'boundary' | 'solve' | 'post']; solved: [result: PhysicsSolveResult | null]; caseState: [state: { valid: boolean; mode: AnalysisMode }] }>()
const meshingStore = useMeshingStore()
const project = computed(() => meshingStore.project as MeshProject | null)
const physicsCase = ref<PhysicsCase | null>(null)
const result = ref<PhysicsSolveResult | null>(null)
const running = ref(false)
const error = ref('')
const capabilities = ref<SolverCapabilities | null>(null)
const job = ref<PhysicsJob | null>(null)
const history = ref<PhysicsJob[]>([])
const compatibleHistory = computed(() => history.value.filter(item => item.status === 'SUCCEEDED' && item.result && item.meshResultId === project.value?.result?.id))
const resultCase = computed(() => job.value?.caseSnapshot ?? physicsCase.value)
const resultIsOldRevision = computed(() => Boolean(result.value && job.value?.caseSnapshot && physicsCase.value && JSON.stringify(job.value.caseSnapshot) !== JSON.stringify(physicsCase.value)))
let pollTimer: ReturnType<typeof setTimeout> | null = null

const modeLabels: Record<AnalysisMode, string> = { fluid: '流体', solid: '固体', 'fsi-one-way': '单向流固耦合', 'fsi-two-way': '双向流固耦合' }
const typeLabels: Record<BoundaryConditionType, string> = {
  wall: '无滑移壁面', 'moving-wall': '移动壁面', 'velocity-inlet': '速度入口', 'pressure-inlet': '压力入口', 'pressure-outlet': '压力出口', symmetry: '对称',
  fixed: '固定约束', 'roller-x': '约束 X 位移', 'roller-y': '约束 Y 位移', traction: '面力', 'pressure-load': '压力载荷', 'fsi-interface': '流固接口', free: '自由边界',
}
const diagnostics = computed(() => validatePhysicsCase(project.value, physicsCase.value))
const hasErrors = computed(() => diagnostics.value.some(item => item.level === 'error'))
const boundaryOptions = computed(() => physicsCase.value ? boundaryTypesForMode(physicsCase.value.mode) : [])

function storageKey() { return project.value ? `cfdrookie:physics:${project.value.id}` : '' }
function initialize() {
  if (!project.value) return
  let saved: PhysicsCase | null = null
  if (import.meta.client) {
    try { saved = JSON.parse(localStorage.getItem(storageKey()) || 'null') } catch { saved = null }
  }
  physicsCase.value = createPhysicsCase(project.value, saved)
  result.value = null
  job.value = null
  emit('solved', null)
}
function setMode(event: Event) {
  if (!physicsCase.value || !project.value) return
  changePhysicsMode(physicsCase.value, project.value, (event.target as HTMLSelectElement).value as AnalysisMode)
  result.value = null; emit('solved', null)
}
function updateZone(id: string, role: ZoneRole) {
  meshingStore.updateZone(id, { role })
  result.value = null; emit('solved', null)
}
function next() {
  error.value = ''
  if (hasErrors.value) { error.value = diagnostics.value.filter(item => item.level === 'error').map(item => item.message).join('；'); return }
  emit('navigate', 'solve')
}
function jobStorageKey() { return project.value ? `cfdrookie:physics-job:${project.value.id}` : '' }
function finishJob(value: PhysicsJob) {
  job.value = value
  if (value.status === 'SUCCEEDED' && value.result) {
    running.value = false
    if (value.meshResultId && value.meshResultId !== project.value?.result?.id) {
      error.value = '该任务使用旧网格计算。请返回原网格工程查看结果，或用当前网格重新求解。'
      job.value = null
      return
    }
    result.value = value.result; emit('solved', value.result)
    void loadHistory()
    if (props.stage === 'solve') emit('navigate', 'post')
  } else if (value.status === 'FAILED' || value.status === 'CANCELED') {
    running.value = false
    if (value.status === 'FAILED') error.value = value.error || '求解任务失败。'
  }
}
async function loadHistory() {
  if (!project.value) return
  history.value = await $fetch<PhysicsJob[]>('/api/analysis/jobs', { query: { projectId: project.value.id, limit: 50 } }).catch(() => [])
}
async function selectHistory(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (!id) return
  try {
    const saved = await $fetch<PhysicsJob>(`/api/analysis/jobs/${id}`)
    if (!saved.result || saved.status !== 'SUCCEEDED' || saved.meshResultId !== project.value?.result?.id) return
    if (pollTimer) clearTimeout(pollTimer)
    job.value = saved; result.value = saved.result; running.value = false; error.value = ''
    localStorage.setItem(jobStorageKey(), saved.id)
    emit('solved', saved.result)
  } catch { error.value = '无法读取历史结果。' }
}
async function pollJob(id: string) {
  try {
    const value = await $fetch<PhysicsJob>(`/api/analysis/jobs/${id}`)
    if (job.value?.id !== id) return
    finishJob(value)
    if (value.status === 'QUEUED' || value.status === 'RUNNING') pollTimer = setTimeout(() => { void pollJob(id) }, 300)
  } catch (cause: any) {
    running.value = false; error.value = cause?.data?.message || cause?.statusMessage || cause?.message || '无法读取求解任务。'
  }
}
async function restoreJob() {
  if (!import.meta.client || !jobStorageKey()) return
  const id = localStorage.getItem(jobStorageKey())
  if (!id) return
  try {
    const value = await $fetch<PhysicsJob>(`/api/analysis/jobs/${id}`)
    if (value.meshResultId !== project.value?.result?.id) return
    job.value = value
    if (value.status === 'QUEUED' || value.status === 'RUNNING') { running.value = true; void pollJob(id) }
    else if (value.status === 'SUCCEEDED' && value.result && (!value.meshResultId || value.meshResultId === project.value?.result?.id)) { result.value = value.result; emit('solved', value.result) }
  } catch { localStorage.removeItem(jobStorageKey()) }
}
async function run() {
  if (!project.value || !physicsCase.value || hasErrors.value) return
  if (!capabilities.value?.native.workerReady) {
    capabilities.value = await $fetch<SolverCapabilities>('/api/analysis/capabilities').catch(() => null)
    if (!capabilities.value?.native.workerReady) { error.value = 'Linux 计算服务未启动，请联系站点管理员。'; return }
  }
  running.value = true; error.value = ''; result.value = null; emit('solved', null)
  if (pollTimer) clearTimeout(pollTimer)
  try {
    const created = await $fetch<PhysicsJob>('/api/analysis/jobs', { method: 'POST', body: { project: project.value, case: physicsCase.value } })
    job.value = created
    void loadHistory()
    if (import.meta.client) localStorage.setItem(jobStorageKey(), created.id)
    void pollJob(created.id)
  } catch (cause: any) { error.value = cause?.data?.message || cause?.statusMessage || cause?.message || '求解失败。' }
}
async function cancelRun() {
  if (!job.value || !running.value) return
  if (pollTimer) clearTimeout(pollTimer)
  try { finishJob(await $fetch<PhysicsJob>(`/api/analysis/jobs/${job.value.id}`, { method: 'DELETE' })) }
  catch (cause: any) { error.value = cause?.data?.message || cause?.statusMessage || cause?.message || '取消任务失败。' }
}
function format(value: number | undefined, digits = 3) {
  if (value === undefined || !Number.isFinite(value)) return '—'
  return Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < .001) ? value.toExponential(3) : value.toFixed(digits)
}
function downloadResult() {
  if (!result.value || !resultCase.value) return
  const body = JSON.stringify({ jobId: job.value?.id, meshResultId: job.value?.meshResultId, case: resultCase.value, result: result.value }, null, 2)
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' })), anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${resultCase.value.name.replace(/[^\p{L}\p{N}-]+/gu, '-')}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
async function downloadExternalPackage() {
  if (!project.value || !physicsCase.value || hasErrors.value) return
  error.value = ''
  try {
    const pack = await $fetch<ExternalCasePackage>('/api/analysis/package', { method: 'POST', body: { project: project.value, case: physicsCase.value } })
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })), anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${physicsCase.value.name.replace(/[^\p{L}\p{N}-]+/gu, '-')}-external-case.json`; anchor.click(); URL.revokeObjectURL(url)
  } catch (cause: any) { error.value = cause?.data?.message || cause?.statusMessage || cause?.message || '外部求解包生成失败。' }
}

watch(physicsCase, value => {
  if (import.meta.client && value && storageKey()) localStorage.setItem(storageKey(), JSON.stringify(value))
}, { deep: true })
watch([physicsCase, diagnostics], () => {
  if (physicsCase.value) emit('caseState', { valid: !hasErrors.value, mode: physicsCase.value.mode })
}, { deep: true, immediate: true })
watch(() => props.resetToken, initialize)
watch(() => project.value?.id, initialize)
watch(() => project.value?.result?.id, (next, previous) => {
  if (previous && next !== previous) {
    if (pollTimer) clearTimeout(pollTimer)
    job.value = null; result.value = null; running.value = false
    emit('solved', null)
  }
})
onMounted(async () => {
  initialize()
  capabilities.value = await $fetch<SolverCapabilities>('/api/analysis/capabilities').catch(() => null)
  await loadHistory()
  await restoreJob()
})
onBeforeUnmount(() => { if (pollTimer) clearTimeout(pollTimer) })
</script>

<template>
  <div v-if="physicsCase && project" class="physics-workbench">
    <div v-if="error" class="physics-alert error"><AlertTriangle :size="17" />{{ error }}</div>

    <template v-if="stage === 'boundary'">
      <div class="physics-head"><div><span>STEP 03</span><h2>物理场与边界条件</h2><p>面域角色、材料和边界直接绑定到已命名网格。</p></div><SquareDashed :size="34" /></div>
      <div class="mode-bar">
        <label><span>分析类型</span><select :value="physicsCase.mode" @change="setMode"><option v-for="(label, key) in modeLabels" :key="key" :value="key">{{ label }}</option></select></label>
        <label><span>算例名称</span><input v-model.trim="physicsCase.name"></label>
        <label><span>几何单位</span><select v-model.number="physicsCase.lengthScale"><option :value="1">m</option><option :value="0.001">mm</option><option :value="0.01">cm</option></select></label>
      </div>

      <section class="physics-section">
        <header><div><strong>计算面域</strong><small>每个面域必须指定流体或固体角色</small></div><span>{{ project.cellZones.length }} 个</span></header>
        <div class="zone-grid"><label v-for="zone in project.cellZones" :key="zone.id"><span><b>{{ zone.name }}</b><small>{{ zone.exportName }}</small></span><select :value="zone.role" @change="updateZone(zone.id, ($event.target as HTMLSelectElement).value as ZoneRole)"><option value="fluid">流体</option><option value="solid">固体</option><option value="unassigned">未指定</option></select></label></div>
      </section>

      <div class="material-grid">
        <section v-if="physicsCase.mode !== 'solid'" class="physics-section"><header><div><strong>流体材料</strong><small>不可压缩牛顿流体</small></div></header><div class="field-grid"><label><span>密度 kg/m³</span><input v-model.number="physicsCase.fluid.density" type="number" min="0" step="0.1"></label><label><span>动力黏度 Pa·s</span><input v-model.number="physicsCase.fluid.dynamicViscosity" type="number" min="0" step="0.000001"></label></div></section>
        <section v-if="physicsCase.mode !== 'fluid'" class="physics-section"><header><div><strong>固体材料</strong><small>各向同性线弹性</small></div></header><div class="field-grid"><label><span>弹性模量 Pa</span><input v-model.number="physicsCase.solid.youngModulus" type="number" min="0"></label><label><span>泊松比</span><input v-model.number="physicsCase.solid.poissonRatio" type="number" min="-0.99" max="0.499" step="0.01"></label><label><span>厚度 m</span><input v-model.number="physicsCase.solid.thickness" type="number" min="0" step="0.001"></label><label><span>二维假设</span><select v-model="physicsCase.solid.formulation"><option value="plane-stress">平面应力</option><option value="plane-strain">平面应变</option></select></label></div></section>
      </div>

      <section class="physics-section"><header><div><strong>命名边界</strong><small>载荷采用国际单位；压力正值沿边界内法向</small></div><span>{{ project.boundarySets.length }} 条</span></header>
        <div class="bc-table"><div class="bc-row bc-header"><span>边界</span><span>类型</span><span>数值 X / 压力</span><span>数值 Y</span></div><div v-for="bc in physicsCase.boundaries" :key="bc.boundarySetId" class="bc-row"><span class="bc-name"><i :style="{ background: project.boundarySets.find(item => item.id === bc.boundarySetId)?.color }"></i><b>{{ project.boundarySets.find(item => item.id === bc.boundarySetId)?.name }}</b><small>{{ project.boundarySets.find(item => item.id === bc.boundarySetId)?.exportName }}</small></span><select v-model="bc.type"><option v-for="type in boundaryOptions" :key="type" :value="type">{{ typeLabels[type] }}</option></select><input v-if="bc.type === 'pressure-load' || bc.type === 'pressure-inlet' || bc.type === 'pressure-outlet'" v-model.number="bc.pressure" type="number" aria-label="压力"><input v-else v-model.number="bc.valueX" type="number" :disabled="!['traction','velocity-inlet','moving-wall'].includes(bc.type)" aria-label="X 数值"><input v-model.number="bc.valueY" type="number" :disabled="!['traction','velocity-inlet','moving-wall'].includes(bc.type)" aria-label="Y 数值"></div></div>
      </section>

      <div class="diagnostics"><div v-for="item in diagnostics" :key="item.code" :class="item.level"><CheckCircle2 v-if="item.level !== 'error'" :size="15"/><AlertTriangle v-else :size="15"/><span>{{ item.message }}</span></div><div v-if="!diagnostics.length" class="success"><CheckCircle2 :size="15"/><span>材料、面域和边界设置通过完整性检查。</span></div></div>
      <div class="physics-actions"><button class="secondary" type="button" @click="emit('navigate','mesh')">返回网格</button><button class="primary" type="button" :disabled="hasErrors" @click="next">配置求解器<ArrowRight :size="16"/></button></div>
    </template>

    <template v-else-if="stage === 'solve'">
      <div class="physics-head"><div><span>STEP 04</span><h2>计算求解</h2><p>执行实际离散方程组，并记录收敛状态。</p></div><Settings2 :size="34" /></div>
      <div class="solve-grid"><section class="physics-section"><header><div><strong>数值控制</strong><small>{{ modeLabels[physicsCase.mode] }}<template v-if="physicsCase.mode !== 'fluid'"> · {{ physicsCase.solid.formulation === 'plane-stress' ? '平面应力' : '平面应变' }}</template></small></div></header><div class="field-grid"><label><span>最大迭代次数</span><input v-model.number="physicsCase.solver.maxIterations" type="number" min="100" max="20000"></label><label><span>收敛残差</span><input v-model.number="physicsCase.solver.tolerance" type="number" min="1e-12" max="1e-2" step="1e-7"></label></div>
        <div v-if="physicsCase.mode.startsWith('fsi')" class="fsi-fields"><h3>薄通道耦合控制</h3><div class="field-grid"><label><span>参考流道高度 m</span><input v-model.number="physicsCase.fsi.referenceGap" type="number" min="0"></label><label><span>入口压力 Pa</span><input v-model.number="physicsCase.fsi.inletPressure" type="number"></label><label><span>出口压力 Pa</span><input v-model.number="physicsCase.fsi.outletPressure" type="number"></label><label><span>变形方向</span><select v-model.number="physicsCase.fsi.deformationSign"><option :value="1">+Y 增大间隙</option><option :value="-1">+Y 减小间隙</option></select></label><label v-if="physicsCase.mode === 'fsi-two-way'"><span>耦合迭代上限</span><input v-model.number="physicsCase.fsi.maxCouplingIterations" type="number" min="2" max="200"></label><label v-if="physicsCase.mode === 'fsi-two-way'"><span>耦合残差</span><input v-model.number="physicsCase.fsi.couplingTolerance" type="number" min="1e-10" max=".1"></label><label v-if="physicsCase.mode === 'fsi-two-way'"><span>位移松弛</span><input v-model.number="physicsCase.fsi.relaxation" type="number" min=".05" max="1" step=".05"></label></div></div>
      </section>
      <aside class="solver-console">
        <strong>求解后端</strong>
        <div class="engine" :class="{ active: capabilities?.native.workerReady }"><i></i><span>Linux 内置计算服务<small>规则方腔 · 结构 FEM · 薄通道 FSI</small></span><b>{{ capabilities?.native.workerReady ? '已连接' : '未连接' }}</b></div>
        <div class="engine"><i></i><span>OpenFOAM<small>{{ capabilities?.external.openfoam.version || '未检测到' }}</small></span><b>{{ capabilities?.external.openfoam.available ? '可用' : '未安装' }}</b></div>
        <div class="engine"><i></i><span>CalculiX<small>{{ capabilities?.external.calculix.version || '未检测到' }}</small></span><b>{{ capabilities?.external.calculix.available ? '可用' : '未安装' }}</b></div>
        <div class="engine"><i></i><span>preCICE<small>{{ capabilities?.external.precice.version || '未检测到' }}</small></span><b>{{ capabilities?.external.precice.available ? '可用' : '未安装' }}</b></div>
        <p v-if="physicsCase.mode === 'fluid'">通用非结构流体网格需要 OpenFOAM；规则映射方腔可直接使用内置流函数求解器。</p>
        <p v-else-if="physicsCase.mode.startsWith('fsi')">内置 FSI 针对沿 x 方向的二维薄通道；任意流场耦合需要 OpenFOAM + CalculiX + preCICE。</p>
        <div v-if="job" class="job-progress"><span><b>{{ job.phase }}</b><small>{{ job.status }} · {{ job.id.slice(0,8) }}</small></span><strong>{{ job.progress }}%</strong><i><em :style="{ width: `${job.progress}%` }"></em></i></div>
        <button v-if="!running" type="button" :disabled="hasErrors || !capabilities?.native.workerReady" @click="run"><Play :size="16"/>开始计算</button>
        <button v-else class="cancel-button" type="button" @click="cancelRun"><Square :size="15"/>取消任务</button>
        <button class="package-button" type="button" :disabled="hasErrors || running" @click="downloadExternalPackage"><PackageOpen :size="16"/>生成外部求解包</button>
      </aside></div>
      <div v-if="hasErrors" class="diagnostics"><div v-for="item in diagnostics.filter(item => item.level === 'error')" :key="item.code" class="error"><AlertTriangle :size="15"/>{{ item.message }}</div></div>
      <div class="physics-actions"><button class="secondary" type="button" @click="emit('navigate','boundary')">返回边界</button><span>计算完成后自动进入后处理</span></div>
    </template>

    <template v-else>
      <div class="physics-head"><div><span>STEP 05</span><h2>结果与后处理</h2><p>查看结果字段、收敛曲线和局部数值。</p></div><Activity :size="34" /></div>
      <label v-if="compatibleHistory.length" class="history-select">历史任务<select :value="job?.id || ''" @change="selectHistory"><option value="">选择已完成任务</option><option v-for="item in compatibleHistory" :key="item.id" :value="item.id">{{ item.caseName }} · {{ item.finishedAt?.slice(0, 19).replace('T', ' ') }} · {{ item.id.slice(0, 8) }}</option></select></label>
      <div v-if="result" class="result-content"><div v-if="resultIsOldRevision" class="physics-alert error"><AlertTriangle :size="17" />当前物理设置已更改；此处展示任务提交时的原始结果。</div><div class="result-cards"><div><small>状态</small><strong :class="{ good: result.converged }">{{ result.converged ? '已收敛' : '未完全收敛' }}</strong></div><div><small>求解器</small><strong>{{ result.engine }}</strong></div><div v-if="result.solid"><small>最大位移</small><strong>{{ format(result.solid.maxDisplacement) }} m</strong></div><div v-if="result.solid"><small>最大等效应力</small><strong>{{ format(result.solid.maxVonMises) }} Pa</strong></div><div v-if="result.fsi"><small>流量 / 单位深度</small><strong>{{ format(result.fsi.flowRatePerDepth) }} m²/s</strong></div><div v-if="result.fsi"><small>耦合迭代</small><strong>{{ result.fsi.iterations }}</strong></div></div>
        <CfdPostResults v-if="resultCase" :project="project" :physics-case="resultCase" :result="result" />
        <div class="physics-actions"><button class="secondary" type="button" @click="emit('navigate','solve')">返回求解设置</button><button class="primary" type="button" @click="downloadResult"><Download :size="16"/>导出算例与结果</button></div>
      </div><div v-else class="empty-result"><AlertTriangle :size="28"/><strong>尚无计算结果</strong><button type="button" @click="emit('navigate','solve')">前往求解</button></div>
    </template>
  </div>
</template>

<style scoped>
.physics-workbench,.physics-workbench *{box-sizing:border-box}.physics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:24px}.physics-head span{color:#167cad;font-size:10px;font-weight:800;letter-spacing:.16em}.physics-head h2{margin:5px 0;font-size:clamp(24px,3vw,34px);letter-spacing:-.035em}.physics-head p,.physics-actions span{margin:0;color:#71848e;font-size:11px}.physics-head>svg{color:#87adbf}.physics-alert{display:flex;gap:8px;margin-bottom:16px;padding:12px;border-radius:7px;font-size:11px}.physics-alert.error{background:#fff0ee;color:#a44336}.mode-bar{display:grid;grid-template-columns:1fr 1.4fr .7fr;gap:12px;margin-bottom:16px;padding:16px;border:1px solid #dce5e9;border-radius:9px;background:#f8fafb}.mode-bar label,.field-grid label{display:grid;gap:6px}.mode-bar span,.field-grid span{color:#607681;font-size:9px;font-weight:700}.physics-workbench input,.physics-workbench select{width:100%;min-width:0;height:39px;padding:0 10px;border:1px solid #cdd9df;border-radius:5px;background:#fff;color:#193442;font:inherit;font-size:11px}.physics-workbench input:focus,.physics-workbench select:focus{outline:0;border-color:#45a0ca;box-shadow:0 0 0 3px rgba(69,160,202,.12)}.physics-workbench input:disabled{background:#eef2f4;color:#93a2aa}.physics-section{margin-bottom:16px;padding:18px;border:1px solid #dce5e9;border-radius:9px;background:#fff}.physics-section>header,.result-plot>header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.physics-section header strong,.physics-section header small{display:block}.physics-section header strong{font-size:12px}.physics-section header small{margin-top:3px;color:#81939c;font-size:9px}.physics-section>header>span{padding:4px 7px;border-radius:4px;background:#e9f3f7;color:#167cad;font-size:9px;font-weight:800}.zone-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.zone-grid label{display:grid;grid-template-columns:1fr 130px;align-items:center;gap:12px;padding:10px 12px;border-radius:6px;background:#f7f9fa}.zone-grid b,.zone-grid small{display:block}.zone-grid b{font-size:10px}.zone-grid small{margin-top:2px;color:#85969e;font-size:8px}.material-grid,.solve-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.material-grid .physics-section{margin:0 0 16px}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.bc-table{overflow-x:auto}.bc-row{display:grid;grid-template-columns:minmax(150px,1.2fr) minmax(145px,1fr) minmax(125px,.8fr) minmax(105px,.7fr);align-items:center;gap:8px;min-width:650px;padding:8px;border-bottom:1px solid #e6ecef}.bc-header{padding-top:0;color:#82939b;font-size:8px;font-weight:800}.bc-name{display:grid;grid-template-columns:5px 1fr;column-gap:8px}.bc-name i{grid-row:span 2;width:4px;height:28px;border-radius:3px}.bc-name b{font-size:10px}.bc-name small{color:#8999a1;font-size:8px}.diagnostics{display:grid;gap:6px;margin:12px 0}.diagnostics>div{display:flex;align-items:center;gap:7px;padding:10px 12px;border-radius:6px;background:#eef7f2;color:#357157;font-size:10px}.diagnostics .error{background:#fff0ee;color:#a44336}.diagnostics .warning{background:#fff7e8;color:#8a6019}.diagnostics .info{background:#edf5f9;color:#416f84}.physics-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;padding-top:18px;border-top:1px solid #e1e8eb}.physics-actions button,.solver-console button,.empty-result button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 16px;border-radius:6px;font-weight:700;cursor:pointer}.physics-actions .secondary{border:1px solid #cad7dd;background:#fff;color:#36505c}.physics-actions .primary{border:0;background:#167cad;color:#fff}.physics-actions button:disabled{cursor:not-allowed;opacity:.4}.solve-grid{grid-template-columns:minmax(0,1.25fr) minmax(290px,.75fr)}.fsi-fields{margin-top:20px;padding-top:18px;border-top:1px solid #e2e9ed}.fsi-fields h3{margin:0 0 13px;font-size:11px}.solver-console{padding:20px;border-radius:9px;background:#173746;color:#eaf5f9}.solver-console>strong{font-size:12px}.engine{display:grid;grid-template-columns:7px 1fr auto;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid #35515e}.engine i{width:7px;height:7px;border-radius:50%;background:#738b96}.engine.active i{background:#53bd8d;box-shadow:0 0 0 4px rgba(83,189,141,.12)}.engine span,.engine small{display:block}.engine span{font-size:10px;font-weight:700}.engine small{margin-top:3px;color:#8faab6;font-size:8px;font-weight:400}.engine b{color:#9bb1bb;font-size:8px}.engine.active b{color:#6bd5a3}.solver-console p{color:#9bb3bd;font-size:9px;line-height:1.55}.solver-console button{width:100%;margin-top:12px;border:0;background:#eef8fc;color:#126c99}.solver-console button:disabled{opacity:.5;cursor:not-allowed}.spin{animation:spin .8s linear infinite}.result-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1px;margin-bottom:16px;border:1px solid #d8e2e7;border-radius:8px;background:#d8e2e7;overflow:hidden}.result-cards>div{padding:14px;background:#fff}.result-cards small,.result-cards strong{display:block}.result-cards small{margin-bottom:5px;color:#80929b;font-size:8px}.result-cards strong{font-size:11px}.result-cards .good{color:#25815c}.post-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.6fr);gap:16px}.result-plot,.result-details{padding:18px;border:1px solid #dce5e9;border-radius:9px;background:#f8fafb}.result-plot header strong{font-size:11px}.result-plot header small{color:#7d9099;font-size:9px}.result-plot svg{display:block;width:100%;max-height:430px;background:#fff}.result-plot polygon{stroke:#fff;stroke-width:.65}.legend{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;color:#7a8c95;font-size:8px}.legend i{width:140px;height:7px;border-radius:5px;background:linear-gradient(90deg,hsl(205 65% 88%),hsl(30 65% 52%))}.result-details h3{margin:0 0 14px;font-size:12px}.result-details dl{margin:0}.result-details dl div{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #dfe7eb;font-size:9px}.result-details dt{color:#748791}.result-details dd{margin:0;font-weight:700}.warning-list p{padding:8px;background:#fff4e3;color:#8b611e;font-size:8px}.fluid-result,.empty-result{display:flex;align-items:center;justify-content:center;gap:13px;min-height:220px;border:1px solid #dce5e9;border-radius:9px;color:#2c7659}.fluid-result p{margin:5px 0;color:#768b95;font-size:10px}.empty-result{flex-direction:column;color:#71848e}.empty-result button{border:0;background:#167cad;color:#fff}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:900px){.material-grid,.solve-grid,.post-grid{grid-template-columns:1fr}.mode-bar{grid-template-columns:1fr 1fr}.zone-grid{grid-template-columns:1fr}}@media(max-width:620px){.mode-bar,.field-grid{grid-template-columns:1fr}.physics-section{padding:13px}.physics-actions{align-items:stretch;flex-direction:column-reverse}.physics-actions>*{width:100%}}
.solver-console .cancel-button{background:#ffe9e5;color:#9b4337}.solver-console .package-button{border:1px solid #53717e;background:transparent;color:#d9e8ee}.job-progress{display:grid;grid-template-columns:1fr auto;align-items:center;gap:9px;margin-top:14px;padding:11px;border-radius:6px;background:#102d3b}.job-progress span b,.job-progress span small{display:block}.job-progress span b{font-size:9px}.job-progress span small{margin-top:3px;color:#84a4b2;font-size:7px}.job-progress>strong{font-size:9px}.job-progress>i{grid-column:1/-1;height:4px;overflow:hidden;border-radius:3px;background:#365461}.job-progress>i em{display:block;height:100%;background:#5fc496;transition:width .2s}
.history-select{display:grid;gap:5px;max-width:440px;margin-bottom:14px;color:#607681;font-size:10px}.history-select select{height:38px}
</style>
