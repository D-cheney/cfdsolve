<script setup lang="ts">
import type { MeshProject } from '~/types/meshing'
import type { PhysicsCase, PhysicsSolveResult } from '~/types/physics'
import { encodeFieldCsv, finiteRange, fluidFields, readCavityField, solidFields, type FluidFieldKey, type SolidFieldKey } from '~/utils/postprocessing'

const props = defineProps<{ project: MeshProject; physicsCase: PhysicsCase; result: PhysicsSolveResult }>()
const solidField = ref<SolidFieldKey>('vonMises')
const fluidField = ref<FluidFieldKey>('speed')
const deformation = ref(0)
const selected = ref<{ id: number; value: number } | null>(null)
const solidDef = computed(() => solidFields.find(item => item.key === solidField.value)!)
const fluidDef = computed(() => fluidFields.find(item => item.key === fluidField.value)!)
const movingSpeed = computed(() => props.physicsCase.boundaries.find(item => item.type === 'moving-wall')?.valueX ?? 0)
const cavity = computed(() => readCavityField(props.result, movingSpeed.value))
const mesh = computed(() => props.project.result)
const bounds = computed(() => {
  const nodes = mesh.value?.nodes ?? []
  if (!nodes.length) return { minX: 0, minY: 0, span: 1, width: 1, height: 1 }
  const xs = nodes.map(node => node.x), ys = nodes.map(node => node.y)
  const minX = Math.min(...xs), minY = Math.min(...ys), width = Math.max(...xs) - minX, height = Math.max(...ys) - minY
  return { minX, minY, width, height, span: Math.max(width, height, 1e-9) }
})
const solidValues = computed(() => {
  const data = props.result.solid
  if (!data) return new Map<number, number>()
  if (solidDef.value.location === 'cell') return new Map(data.cells.map(cell => [cell.cellId, cell[solidField.value as 'vonMises'] ?? 0]))
  const values = new Map(data.nodes.map(node => [node.nodeId, node[solidField.value as 'magnitude'] ?? 0]))
  return new Map((mesh.value?.cells ?? []).map(cell => [cell.id, cell.nodeIds.reduce((sum, id) => sum + (values.get(id) ?? 0), 0) / cell.nodeIds.length]))
})
const displayValues = computed(() => {
  if (props.result.solid) return solidDef.value.location === 'node'
    ? props.result.solid.nodes.map(node => node[solidField.value as 'magnitude'] ?? 0)
    : [...solidValues.value.values()]
  return (cavity.value?.[fluidField.value] ?? []).map(value => value * cavity.value!.lidVelocity)
})
const range = computed(() => finiteRange(displayValues.value))
function color(value: number) {
  const ratio = range.value.max === range.value.min ? .5 : Math.max(0, Math.min(1, (value - range.value.min) / (range.value.max - range.value.min)))
  return `hsl(${210 - ratio * 170} 68% ${89 - ratio * 37}%)`
}
function position(x: number, y: number) {
  return { x: 30 + (x - bounds.value.minX) / bounds.value.span * 580, y: 410 - (y - bounds.value.minY) / bounds.value.span * 380 }
}
const nodeDisplacements = computed(() => new Map(props.result.solid?.nodes.map(node => [node.nodeId, node]) ?? []))
const solidPolygons = computed(() => {
  const nodes = new Map(mesh.value?.nodes.map(node => [node.id, node]) ?? [])
  return (mesh.value?.cells ?? []).filter(cell => solidValues.value.has(cell.id)).map(cell => {
    const points = cell.nodeIds.map(id => {
      const node = nodes.get(id)!, shift = nodeDisplacements.value.get(id)
      return position(node.x + (shift?.ux ?? 0) / props.physicsCase.lengthScale * deformation.value, node.y + (shift?.uy ?? 0) / props.physicsCase.lengthScale * deformation.value)
    }).map(point => `${point.x},${point.y}`).join(' ')
    const original = cell.nodeIds.map(id => position(nodes.get(id)!.x, nodes.get(id)!.y)).map(point => `${point.x},${point.y}`).join(' ')
    const value = solidValues.value.get(cell.id)!
    return { id: cell.id, points, original, value, fill: color(value) }
  })
})
const fluidCells = computed(() => {
  const field = cavity.value
  if (!field) return []
  const values = field[fluidField.value], output = []
  const dx = bounds.value.width / field.nx, dy = bounds.value.height / field.ny
  for (let j = 0; j < field.ny; j++) for (let i = 0; i < field.nx; i++) {
    const index = j * field.nx + i, p = position(bounds.value.minX + i * dx, bounds.value.minY + (j + 1) * dy)
    const value = values[index]! * field.lidVelocity
    output.push({ id: index, x: p.x, y: p.y, width: dx / bounds.value.span * 580 + .4, height: dy / bounds.value.span * 380 + .4, value, fill: color(value) })
  }
  return output
})
function linePath(values: { x: number; y: number }[]) {
  if (!values.length) return ''
  const x = finiteRange(values.map(item => item.x)), y = finiteRange(values.map(item => item.y))
  return values.map((item, i) => `${i ? 'L' : 'M'} ${28 + (item.x - x.min) / Math.max(x.max - x.min, 1e-12) * 562} ${176 - (item.y - y.min) / Math.max(y.max - y.min, 1e-12) * 150}`).join(' ')
}
const pressurePath = computed(() => linePath(props.result.fsi?.pressureProfile.map(item => ({ x: item.x, y: item.pressure })) ?? []))
const residualPath = computed(() => linePath((props.result.fsi?.residuals ?? cavity.value?.residuals.map(item => item.value) ?? []).map((value, index) => ({ x: index, y: Math.log10(Math.max(value, 1e-16)) }))))
function format(value: number) { return Number.isFinite(value) ? value.toPrecision(5) : '—' }
function exportCsv() {
  const unit = props.result.solid ? solidDef.value.unit : fluidDef.value.unit
  const idLabel = !props.result.solid ? 'sample_index' : solidDef.value.location === 'node' ? 'node_id' : 'cell_id'
  const rows: Array<[number, number]> = !props.result.solid ? displayValues.value.map((value, id) => [id, value])
    : solidDef.value.location === 'node' ? props.result.solid.nodes.map(node => [node.nodeId, node[solidField.value as 'magnitude'] ?? 0])
      : [...solidValues.value]
  const csv = encodeFieldCsv(idLabel, props.result.solid ? solidField.value : fluidField.value, unit, rows)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `cfd-result-${props.physicsCase.id}.csv`; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
watch([solidField, fluidField], () => { selected.value = null })
</script>

<template>
  <div class="post-results">
    <div class="post-toolbar">
      <label v-if="result.solid">显示字段<select v-model="solidField"><option v-for="field in solidFields" :key="field.key" :value="field.key">{{ field.label }} ({{ field.unit }})</option></select></label>
      <label v-else-if="cavity">显示字段<select v-model="fluidField"><option v-for="field in fluidFields" :key="field.key" :value="field.key">{{ field.label }} ({{ field.unit }})</option></select></label>
      <label v-if="result.solid">变形放大倍数<input v-model.number="deformation" type="number" min="0" max="100000" step="1"></label>
      <button type="button" :disabled="!result.solid && !cavity" @click="exportCsv">导出字段 CSV</button>
    </div>
    <div v-if="result.solid || cavity" class="post-layout">
      <div class="map-panel"><div class="map-title"><strong>{{ result.solid ? solidDef.label : fluidDef.label }}</strong><span>{{ result.solid ? solidDef.unit : fluidDef.unit }} · {{ result.solid ? (solidDef.location === 'node' ? '节点场，单元均值着色' : '网格单元') : '规则采样点' }}</span></div>
        <svg viewBox="0 0 640 440" role="img" :aria-label="`${result.solid ? solidDef.label : fluidDef.label}云图`">
          <g v-if="result.solid"><polygon v-if="deformation" v-for="cell in solidPolygons" :key="`original-${cell.id}`" :points="cell.original" fill="none" stroke="#8498a6" stroke-width=".6" opacity=".35"/><polygon v-for="cell in solidPolygons" :key="cell.id" :points="cell.points" :fill="cell.fill" stroke="#fff" stroke-width=".45" @click="selected = { id: cell.id, value: cell.value }"/></g>
          <g v-else><rect v-for="cell in fluidCells" :key="cell.id" :x="cell.x" :y="cell.y" :width="cell.width" :height="cell.height" :fill="cell.fill" @click="selected = { id: cell.id, value: cell.value }"/></g>
        </svg>
        <div class="scale"><span>{{ format(range.min) }}</span><i></i><span>{{ format(range.max) }} {{ result.solid ? solidDef.unit : fluidDef.unit }}</span></div>
      </div>
      <aside class="post-info"><strong>字段信息</strong><p>最小值 {{ format(range.min) }} {{ result.solid ? solidDef.unit : fluidDef.unit }}</p><p>最大值 {{ format(range.max) }} {{ result.solid ? solidDef.unit : fluidDef.unit }}</p><p v-if="selected">选中{{ result.solid ? '单元' : '采样点' }} {{ selected.id }}{{ result.solid && solidDef.location === 'node' ? '（节点均值）' : '' }}：{{ format(selected.value) }} {{ result.solid ? solidDef.unit : fluidDef.unit }}</p><p v-else>点击云图可查看局部数值。</p><p v-if="result.solid">变形倍数 0 表示真实未变形位置；其他倍数仅影响展示。</p><p v-else>方腔流场为内置规则采样结果，速度已换算为 m/s；此求解器不输出压力场。</p></aside>
    </div>
    <p v-else class="post-empty">当前求解结果没有可绘制的二维场数据。</p>
    <div class="chart-grid">
      <section v-if="result.fsi?.pressureProfile.length" class="chart"><header><strong>薄通道沿程压力</strong><small>横轴 x (m) · 纵轴压力 (Pa)</small></header><svg viewBox="0 0 620 200" role="img" aria-label="薄通道沿程压力曲线"><path :d="pressurePath" /></svg><p>这是薄通道降阶压力曲线，不代表二维流场云图。</p></section>
      <section v-if="result.fsi?.residuals.length || cavity?.residuals.length" class="chart"><header><strong>{{ result.fsi ? '耦合残差' : '流体残差' }}</strong><small>横轴迭代 · 纵轴 log10(残差)</small></header><svg viewBox="0 0 620 200" role="img" aria-label="残差曲线"><path :d="residualPath" /></svg></section>
    </div>
  </div>
</template>

<style scoped>
.post-results,.post-results *{box-sizing:border-box}.post-toolbar{display:flex;align-items:end;flex-wrap:wrap;gap:12px;margin:16px 0}.post-toolbar label{display:grid;gap:6px;color:#627782;font-size:11px}.post-toolbar select,.post-toolbar input{min-width:145px;height:38px;padding:0 10px;border:1px solid #cdd9df;border-radius:6px;background:#fff;color:#193442}.post-toolbar button{height:38px;padding:0 15px;border:0;border-radius:6px;background:#167cad;color:white;font-weight:700;cursor:pointer}.post-toolbar button:disabled{opacity:.5;cursor:not-allowed}.post-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(220px,.5fr);gap:14px}.map-panel,.post-info,.chart{padding:16px;border:1px solid #dce5e9;border-radius:9px;background:#f8fafb}.map-title,.chart header{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px}.map-title strong,.chart strong,.post-info strong{font-size:12px}.map-title span,.chart small{color:#758b96;font-size:10px}.map-panel svg{display:block;width:100%;max-height:520px;background:white}.map-panel polygon,.map-panel rect{cursor:crosshair}.scale{display:flex;align-items:center;gap:9px;margin-top:11px;color:#59707b;font-size:9px}.scale i{flex:1;height:8px;border-radius:9px;background:linear-gradient(90deg,hsl(210 68% 89%),hsl(40 68% 52%))}.post-info p,.chart p{color:#58717e;font-size:10px;line-height:1.6}.chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;margin-top:14px}.chart svg{display:block;width:100%;background:#fff}.chart path{fill:none;stroke:#167cad;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.post-empty{padding:24px;border:1px solid #dce5e9;border-radius:9px;color:#71848e;text-align:center}@media(max-width:850px){.post-layout{grid-template-columns:1fr}}
</style>
