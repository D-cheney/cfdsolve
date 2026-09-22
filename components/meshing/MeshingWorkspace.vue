<script setup lang="ts">
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Grid3X3, Layers3, LoaderCircle, Maximize2, Play, Save, ScanLine, Tags, WandSparkles } from 'lucide-vue-next'
import type { MeshBoundarySet, MeshLayerControl, MeshSettings, MeshSizeControl } from '~/types/meshing'
import { useMeshingStore } from '~/stores/meshing'

const emit = defineEmits<{ back: []; accepted: [] }>()
const store = useMeshingStore()
const activePanel = ref<'settings'|'naming'|'layer'|'quality'>('settings')
const selectedBoundaryId = ref('')
const newBoundaryName = ref('边界组')
const mobilePanel = ref<'none'|'tree'|'properties'>('none')
const selectedCellId = ref<number | null>(null)
const viewport = ref({ centerX: 0, centerY: 0, scale: 1 })
const panning = ref<{ x: number; y: number; centerX: number; centerY: number } | null>(null)

const project = computed(() => store.project)
const result = computed(() => project.value?.result ?? null)
const selectedBoundary = computed(() => project.value?.boundarySets.find(set => set.id === selectedBoundaryId.value) ?? null)
const selectedLayer = computed(() => project.value?.layers.find(layer => layer.boundarySetId === selectedBoundaryId.value) ?? null)
const selectedBoundaryLength = computed(() => {
  const current = project.value
  return current && selectedBoundary.value
    ? selectedBoundary.value.edgeIds.reduce((sum, id) => sum + (current.edges.find(edge => edge.id === id)?.length ?? 0), 0)
    : 0
})
const bounds = computed(() => {
  const points = project.value?.edges.flatMap(edge => edge.points) ?? []
  if (!points.length) return { minX: -50, minY: -50, maxX: 50, maxY: 50 }
  return { minX: Math.min(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxX: Math.max(...points.map(p => p.x)), maxY: Math.max(...points.map(p => p.y)) }
})
const viewBox = computed(() => {
  const width = Math.max(20, bounds.value.maxX - bounds.value.minX) * 1.2 / viewport.value.scale
  const height = Math.max(20, bounds.value.maxY - bounds.value.minY) * 1.2 / viewport.value.scale
  const cx = viewport.value.centerX || (bounds.value.minX + bounds.value.maxX) / 2
  const cy = viewport.value.centerY || (bounds.value.minY + bounds.value.maxY) / 2
  return `${cx - width / 2} ${-cy - height / 2} ${width} ${height}`
})
const cellPaths = computed(() => result.value?.cells.map(cell => ({ ...cell, points: cell.nodeIds.map(id => result.value!.nodes[id]!).filter(Boolean).map(point => `${point.x},${-point.y}`).join(' ') })) ?? [])
const boundaryByEdge = computed(() => {
  const map = new Map<string, MeshBoundarySet>()
  project.value?.boundarySets.forEach(set => set.edgeIds.forEach(id => map.set(id, set)))
  return map
})
const areaDifference = computed(() => {
  const geometry = project.value?.faces.reduce((sum, face) => sum + face.area, 0) ?? 0
  return result.value && geometry ? Math.abs(result.value.quality.totalArea - geometry) / geometry * 100 : 0
})
const qualityBins = computed(() => {
  const bins = [0, 0, 0, 0, 0]
  for (const cell of result.value?.cells ?? []) bins[Math.min(4, Math.floor(cell.quality * 5))] += 1
  const maximum = Math.max(...bins, 1)
  return bins.map((count, index) => ({ label: `${index * 20}–${(index + 1) * 20}`, count, height: count / maximum * 100 }))
})
const selectedCell = computed(() => result.value?.cells.find(cell => cell.id === selectedCellId.value) ?? null)

function edgePath(points: Array<{x:number;y:number}>) { return points.length ? `M ${points.map(point => `${point.x} ${-point.y}`).join(' L ')}` : '' }
function toggleEdge(id: string, append: boolean) {
  if (!append) store.selectedEdgeIds = [id]
  else if (store.selectedEdgeIds.includes(id)) store.selectedEdgeIds = store.selectedEdgeIds.filter(item => item !== id)
  else store.selectedEdgeIds.push(id)
}
function selectBoundary(id: string) {
  selectedBoundaryId.value = id
  const set = project.value?.boundarySets.find(item => item.id === id)
  store.selectedEdgeIds = set ? [...set.edgeIds] : []
  activePanel.value = 'naming'
}
function updateBoundary(field: 'name'|'exportName'|'semantic', event: Event) { if (selectedBoundary.value) store.updateBoundary(selectedBoundary.value.id, { [field]: (event.target as HTMLInputElement).value }) }
function createBoundary() { if (store.createBoundarySet(newBoundaryName.value)) { selectedBoundaryId.value = project.value!.boundarySets.at(-1)!.id; activePanel.value = 'naming' } }
function updateSetting(field: keyof MeshSettings, event: Event) {
  if (!project.value) return
  const input = event.target as HTMLInputElement | HTMLSelectElement
  ;(project.value.settings as any)[field] = input.type === 'number' ? Number(input.value) : input.value
  store.touch(true)
}
function updateLayer(field: keyof MeshLayerControl, event: Event) { if (selectedLayer.value) store.updateLayer(selectedLayer.value.id, { [field]: Number((event.target as HTMLInputElement).value) }) }
function updateSizeControl(id: string, field: keyof MeshSizeControl, event: Event) { store.updateSizeControl(id, { [field]: field === 'name' ? (event.target as HTMLInputElement).value : Number((event.target as HTMLInputElement).value) }) }
function fit() { viewport.value = { centerX: (bounds.value.minX + bounds.value.maxX) / 2, centerY: (bounds.value.minY + bounds.value.maxY) / 2, scale: 1 } }
function wheel(event: WheelEvent) { event.preventDefault(); viewport.value.scale = Math.max(.2, Math.min(20, viewport.value.scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15))) }
function pointerDown(event: PointerEvent) { if (event.button === 1 || event.shiftKey) panning.value = { x: event.clientX, y: event.clientY, centerX: viewport.value.centerX || (bounds.value.minX+bounds.value.maxX)/2, centerY: viewport.value.centerY || (bounds.value.minY+bounds.value.maxY)/2 } }
function pointerMove(event: PointerEvent) { if (!panning.value) return; const size = Math.max(bounds.value.maxX-bounds.value.minX,bounds.value.maxY-bounds.value.minY)/viewport.value.scale; viewport.value.centerX=panning.value.centerX-(event.clientX-panning.value.x)/600*size; viewport.value.centerY=panning.value.centerY+(event.clientY-panning.value.y)/600*size }
function pointerUp() { panning.value = null }
function download(name: string, content: string, type: string) { const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url) }
function exportProject() { if (project.value) download(`${project.value.id}.cfdmesh.json`, JSON.stringify(project.value, null, 2), 'application/json') }
function exportMsh() { if (result.value?.msh) download('cfdrookie-mesh.msh', result.value.msh, 'text/plain') }
function exportVtu() {
  if (!result.value) return
  const offsets:number[]=[];let total=0;result.value.cells.forEach(cell=>{total+=cell.nodeIds.length;offsets.push(total)})
  const points=result.value.nodes.map(node=>`${node.x} ${node.y} 0`).join(' '),connectivity=result.value.cells.flatMap(cell=>cell.nodeIds).join(' '),types=result.value.cells.map(cell=>cell.type==='tri'?5:9).join(' ')
  const xml=`<?xml version="1.0"?><VTKFile type="UnstructuredGrid" version="0.1" byte_order="LittleEndian"><UnstructuredGrid><Piece NumberOfPoints="${result.value.nodes.length}" NumberOfCells="${result.value.cells.length}"><Points><DataArray type="Float64" NumberOfComponents="3" format="ascii">${points}</DataArray></Points><Cells><DataArray type="Int32" Name="connectivity" format="ascii">${connectivity}</DataArray><DataArray type="Int32" Name="offsets" format="ascii">${offsets.join(' ')}</DataArray><DataArray type="UInt8" Name="types" format="ascii">${types}</DataArray></Cells><CellData><DataArray type="Float64" Name="quality" format="ascii">${result.value.cells.map(cell=>cell.quality).join(' ')}</DataArray></CellData></Piece></UnstructuredGrid></VTKFile>`
  download('cfdrookie-mesh.vtu',xml,'application/xml')
}

onMounted(async()=>{await store.initialize();fit();selectedBoundaryId.value=project.value?.boundarySets[0]?.id??''})
</script>

<template>
  <section v-if="project" class="mesher">
    <header class="mesh-head">
      <div class="head-actions"><button @click="emit('back')"><ArrowLeft :size="18"/><span>返回建模</span></button><button @click="store.save"><Save :size="18"/><span>保存</span></button></div>
      <div class="mesh-title"><strong>二维网格划分</strong><small>{{ store.saveStatus }} · 源模型修订 {{ project.sourceRevision }}</small></div>
      <div class="head-actions right"><button @click="exportProject"><Download :size="18"/><span>工程</span></button><button :disabled="!result?.msh" @click="exportMsh"><Download :size="18"/><span>MSH</span></button><button :disabled="!result" @click="exportVtu"><Download :size="18"/><span>VTU</span></button><button class="generate" @click="store.status==='生成中'?store.cancelGenerate():store.generate()"><LoaderCircle v-if="store.status==='生成中'" class="spin" :size="18"/><Play v-else :size="18"/>{{ store.status==='生成中'?'取消生成':'生成网格' }}</button></div>
    </header>

    <nav class="mesh-tabs">
      <button :class="{active:activePanel==='settings'}" @click="activePanel='settings'"><Grid3X3 :size="16"/>网格设置</button>
      <button :class="{active:activePanel==='naming'}" @click="activePanel='naming'"><Tags :size="16"/>边界与面域</button>
      <button :class="{active:activePanel==='layer'}" @click="activePanel='layer'"><Layers3 :size="16"/>边界层</button>
      <button :class="{active:activePanel==='quality'}" @click="activePanel='quality'"><ScanLine :size="16"/>质量检查</button>
    </nav>

    <div v-if="store.error" class="message error"><AlertTriangle :size="17"/>{{ store.error }}</div>
    <div v-if="store.diagnostics.length" class="message warning"><AlertTriangle :size="17"/>{{ store.diagnostics.join('；') }}</div>

    <div class="mobile-tools"><button @click="mobilePanel=mobilePanel==='tree'?'none':'tree'">工程树</button><button @click="mobilePanel=mobilePanel==='properties'?'none':'properties'">当前设置</button></div>
    <div class="mesh-body" :class="`mobile-${mobilePanel}`">
      <aside class="mesh-tree">
        <h3>网格工程</h3>
        <section><h4>面域 <em>{{ project.faces.length }}</em></h4><button v-for="zone in project.cellZones" :key="zone.id" @click="activePanel='naming'"><span class="swatch zone"></span><b>{{ zone.name }}</b><small>{{ zone.role==='fluid'?'流体':zone.role==='solid'?'固体':'待指定' }}</small></button></section>
        <section><h4>边界 <em>{{ project.boundarySets.length }}</em></h4><button v-for="set in project.boundarySets" :key="set.id" :class="{selected:selectedBoundaryId===set.id}" @click="selectBoundary(set.id)"><span class="swatch" :style="{background:set.color}"></span><b>{{ set.name }}</b><small>{{ set.edgeIds.length }} 边</small></button></section>
        <section><h4>边界层 <em>{{ project.layers.length }}</em></h4><button v-for="layer in project.layers" :key="layer.id" @click="selectBoundary(layer.boundarySetId);activePanel='layer'"><span class="swatch layer"></span><b>{{ project.boundarySets.find(s=>s.id===layer.boundarySetId)?.name }}</b><small>{{ layer.layers }} 层</small></button></section>
        <section v-if="result"><h4>结果</h4><div class="result-row">节点<strong>{{ result.nodes.length.toLocaleString() }}</strong></div><div class="result-row">单元<strong>{{ result.cells.length.toLocaleString() }}</strong></div></section>
      </aside>

      <main class="mesh-canvas">
        <button class="fit" title="适合窗口" @click="fit"><Maximize2 :size="18"/></button>
        <svg :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" @wheel="wheel" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp">
          <g v-if="result" class="cells" aria-hidden="true"><polygon v-for="cell in cellPaths" :key="cell.id" :points="cell.points" :class="{selected:selectedCellId===cell.id}" :style="{fill:activePanel==='quality'?`hsl(${cell.quality*120} 52% ${88-cell.quality*34}%)`:'#f7fbfd'}" @click="selectedCellId=cell.id"/></g>
          <g class="topology"><path v-for="edge in project.edges" :key="edge.id" :d="edgePath(edge.points)" :class="{selected:store.selectedEdgeIds.includes(edge.id)}" :style="{stroke:boundaryByEdge.get(edge.id)?.color??'#496779'}" @click.stop="toggleEdge(edge.id,$event.ctrlKey||$event.metaKey)"/></g>
        </svg>
        <div class="canvas-note">单击选择边，Ctrl/Cmd 多选 · Shift 拖动或中键平移 · 滚轮缩放</div>
        <div v-if="store.status==='生成中'" class="generating"><LoaderCircle class="spin" :size="28"/><strong>正在生成真实二维网格</strong><small>复杂面域可能需要一些时间</small></div>
      </main>

      <aside class="properties">
        <template v-if="activePanel==='settings'">
          <h3>网格设置</h3><p>尺寸采用模型内部单位 mm。</p>
          <label><span>网格方法</span><select :value="project.settings.method" @change="updateSetting('method',$event)"><option value="tri">自动三角形</option><option value="quad-dominant">四边形占优</option><option value="mapped-quad">映射四边形</option></select></label>
          <div class="two"><label><span>目标尺寸</span><input type="number" min=".001" :value="project.settings.targetSize" @change="updateSetting('targetSize',$event)"></label><label><span>平滑次数</span><input type="number" min="0" max="100" :value="project.settings.smoothing" @change="updateSetting('smoothing',$event)"></label></div>
          <div class="two"><label><span>最小尺寸</span><input type="number" min=".001" :value="project.settings.minSize" @change="updateSetting('minSize',$event)"></label><label><span>最大尺寸</span><input type="number" min=".001" :value="project.settings.maxSize" @change="updateSetting('maxSize',$event)"></label></div>
          <label><span>曲率每周分段</span><input type="number" min="8" max="256" :value="project.settings.curvatureSegments" @change="updateSetting('curvatureSegments',$event)"></label>
          <div v-if="project.settings.method==='mapped-quad'" class="two"><label><span>X 单元数</span><input type="number" min="2" :value="project.settings.mappedNx" @change="updateSetting('mappedNx',$event)"></label><label><span>Y 单元数</span><input type="number" min="2" :value="project.settings.mappedNy" @change="updateSetting('mappedNy',$event)"></label></div>
          <h4>局部边加密</h4><p>在画布选择边后添加尺寸控制，影响范围内平滑过渡到全局尺寸。</p>
          <button class="secondary" :disabled="!store.selectedEdgeIds.length" @click="store.addSizeControl">为选中边添加加密</button>
          <div v-for="control in project.sizeControls" :key="control.id" class="size-control"><input :value="control.name" @change="updateSizeControl(control.id,'name',$event)"><div class="two"><label><span>目标尺寸</span><input type="number" min=".001" :value="control.targetSize" @change="updateSizeControl(control.id,'targetSize',$event)"></label><label><span>影响距离</span><input type="number" min=".001" :value="control.influenceDistance" @change="updateSizeControl(control.id,'influenceDistance',$event)"></label></div><small>{{ control.edgeIds.length }} 条边</small><button @click="store.removeSizeControl(control.id)">删除</button></div>
          <button class="primary" @click="store.generate"><WandSparkles :size="17"/>生成并检查</button>
        </template>

        <template v-else-if="activePanel==='naming'">
          <h3>边界与面域命名</h3><p>选择画布中的一条或多条边，再建立或替换边界组。</p>
          <div class="create-set"><input v-model="newBoundaryName" placeholder="新边界名称"><button :disabled="!store.selectedEdgeIds.length" @click="createBoundary">建立</button></div>
          <template v-if="selectedBoundary"><h4>当前边界</h4><label><span>显示名称</span><input :value="selectedBoundary.name" @change="updateBoundary('name',$event)"></label><label><span>导出名称</span><input :value="selectedBoundary.exportName" @change="updateBoundary('exportName',$event)"></label><label><span>建议语义</span><select :value="selectedBoundary.semantic" @change="updateBoundary('semantic',$event)"><option value="inlet">入口</option><option value="outlet">出口</option><option value="wall">壁面</option><option value="symmetry">对称</option><option value="farfield">远场</option><option value="interface">接口</option><option value="custom">自定义</option></select></label><div class="summary"><span>几何边<strong>{{ selectedBoundary.edgeIds.length }}</strong></span><span>总长度<strong>{{ selectedBoundaryLength.toFixed(2) }} mm</strong></span></div><button class="danger" @click="store.removeBoundary(selectedBoundary.id);selectedBoundaryId=''">删除此边界组</button></template>
          <h4>面域</h4><div v-for="zone in project.cellZones" :key="zone.id" class="zone-form"><input :value="zone.name" @change="store.updateZone(zone.id,{name:($event.target as HTMLInputElement).value})"><input :value="zone.exportName" @change="store.updateZone(zone.id,{exportName:($event.target as HTMLInputElement).value})"><select :value="zone.role" @change="store.updateZone(zone.id,{role:($event.target as HTMLSelectElement).value as any})"><option value="fluid">流体</option><option value="solid">固体</option><option value="unassigned">待指定</option></select></div>
        </template>

        <template v-else-if="activePanel==='layer'">
          <h3>边界层</h3><p>在当前边界的面域侧生成近壁四边形层。</p>
          <select v-model="selectedBoundaryId"><option v-for="set in project.boundarySets" :key="set.id" :value="set.id">{{ set.name }}</option></select>
          <button v-if="!selectedLayer" class="primary" :disabled="!selectedBoundaryId" @click="store.addLayer(selectedBoundaryId)">添加边界层</button>
          <template v-else><label><span>首层厚度 mm</span><input type="number" min=".0001" step=".01" :value="selectedLayer.firstLayer" @change="updateLayer('firstLayer',$event)"></label><label><span>层数</span><input type="number" min="1" max="100" :value="selectedLayer.layers" @change="updateLayer('layers',$event)"></label><label><span>增长率</span><input type="number" min="1" max="2" step=".05" :value="selectedLayer.growth" @change="updateLayer('growth',$event)"></label><div class="derived">总厚度 <strong>{{ selectedLayer.thickness.toFixed(4) }} mm</strong></div></template>
        </template>

        <template v-else>
          <h3>网格质量</h3><div v-if="!result" class="empty">生成网格后显示真实质量统计。</div><template v-else><div class="quality-score" :class="{bad:result.quality.invalidCells}"><strong>{{ (result.quality.minQuality*100).toFixed(1) }}</strong><span>最小质量 / 100</span></div><div class="metrics"><span>平均质量<strong>{{ (result.quality.meanQuality*100).toFixed(1) }}</strong></span><span>最小角<strong>{{ result.quality.minAngle.toFixed(1) }}°</strong></span><span>最大边长比<strong>{{ result.quality.maxAspectRatio.toFixed(2) }}</strong></span><span>无效单元<strong>{{ result.quality.invalidCells }}</strong></span><span>网格面积<strong>{{ result.quality.totalArea.toFixed(3) }} mm²</strong></span><span>面积偏差<strong>{{ areaDifference.toFixed(4) }}%</strong></span></div><h4>质量分布</h4><div class="histogram"><span v-for="bin in qualityBins" :key="bin.label"><i :style="{height:`${bin.height}%`}"></i><b>{{ bin.count }}</b><small>{{ bin.label }}</small></span></div><div v-if="selectedCell" class="derived">单元 {{ selectedCell.id }}<strong>Q {{ selectedCell.quality.toFixed(3) }} · {{ selectedCell.area.toFixed(3) }} mm²</strong></div><div v-if="!result.quality.invalidCells" class="pass"><CheckCircle2 :size="18"/>网格拓扑检查通过</div></template>
        </template>
      </aside>
    </div>

    <footer class="mesh-status"><span>{{ store.status }}</span><span>{{ project.edges.length }} 条几何边</span><span>{{ project.faces.length }} 个面域</span><span v-if="result">{{ result.nodes.length }} 节点 · {{ result.cells.length }} 单元</span><i></i><button :disabled="!store.canAccept" @click="emit('accepted')">接受网格并进入边界设置</button></footer>
  </section>
</template>

<style scoped>
.mesher{--blue:#1677b8;--line:#d9e2e7;--ink:#17313f;--muted:#71838d;display:flex;flex-direction:column;height:calc(100vh - 145px);min-height:720px;border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden;color:var(--ink);box-shadow:0 16px 42px rgba(22,58,79,.08)}button,input,select{font:inherit;box-sizing:border-box}.mobile-tools{display:none}.mesh-head{display:grid;grid-template-columns:1fr minmax(220px,360px) 1fr;align-items:center;gap:12px;min-height:52px;padding:7px 12px;border-bottom:1px solid var(--line);background:#fbfcfd}.head-actions{display:flex;gap:4px}.head-actions.right{justify-content:flex-end}.head-actions button,.mesh-tabs button,.mesh-status button{display:flex;align-items:center;gap:6px;min-height:36px;padding:0 10px;border:0;border-radius:7px;background:transparent;color:var(--ink);cursor:pointer}.head-actions button:hover,.mesh-tabs button:hover{background:#edf5f9;color:var(--blue)}.head-actions .generate,.properties .primary{background:var(--blue);color:#fff}.mesh-title{text-align:center}.mesh-title strong,.mesh-title small{display:block}.mesh-title strong{font-size:15px}.mesh-title small{margin-top:2px;color:#78909b;font-size:10px}.mesh-tabs{display:flex;gap:3px;padding:5px 12px;border-bottom:1px solid var(--line);overflow-x:auto}.mesh-tabs button.active{background:#e8f4fa;color:var(--blue)}.message{display:flex;align-items:flex-start;gap:8px;padding:9px 13px;font-size:11px}.message.error{background:#fff0ef;color:#9c3e35}.message.warning{background:#fff8e9;color:#835f21}.mesh-body{display:grid;grid-template-columns:220px minmax(0,1fr) 290px;flex:1;min-height:0}.mesh-tree,.properties{overflow:auto;background:#fbfcfd}.mesh-tree{border-right:1px solid var(--line)}.properties{border-left:1px solid var(--line);padding:14px}.mesh-tree h3{height:42px;margin:0;padding:0 13px;display:flex;align-items:center;border-bottom:1px solid var(--line);font-size:13px}.mesh-tree section{padding:10px 7px;border-bottom:1px solid var(--line)}.mesh-tree h4{display:flex;justify-content:space-between;margin:0 6px 6px;color:var(--muted);font-size:10px;font-weight:600}.mesh-tree h4 em{font-style:normal}.mesh-tree section>button{display:grid;grid-template-columns:12px 1fr auto;gap:7px;align-items:center;width:100%;min-height:33px;padding:4px 7px;border:0;border-radius:6px;background:transparent;text-align:left;cursor:pointer}.mesh-tree section>button:hover,.mesh-tree section>button.selected{background:#e8f4fa;color:var(--blue)}.mesh-tree b{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mesh-tree small{font-size:9px;color:var(--muted)}.swatch{width:8px;height:20px;border-radius:3px}.swatch.zone{background:#5e9abc}.swatch.layer{background:linear-gradient(90deg,#176fa3,#b8d8e8)}.result-row{display:flex;justify-content:space-between;padding:4px 7px;font-size:11px}.mesh-canvas{position:relative;min-width:0;overflow:hidden;background:#f8fafb}.mesh-canvas svg{display:block;width:100%;height:100%;min-height:500px;touch-action:none}.cells polygon{stroke:#afc4ce;stroke-width:.45;vector-effect:non-scaling-stroke;cursor:pointer}.cells polygon.selected{stroke:#e25e34;stroke-width:2}.topology path{fill:none;stroke-width:2.1;vector-effect:non-scaling-stroke;cursor:pointer;pointer-events:stroke}.topology path:hover,.topology path.selected{stroke:#ed7432!important;stroke-width:4}.fit{position:absolute;z-index:2;top:10px;left:10px;width:36px;height:36px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--blue)}.canvas-note{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);padding:7px 10px;border:1px solid var(--line);border-radius:7px;background:rgba(255,255,255,.94);color:var(--muted);font-size:10px;white-space:nowrap}.generating{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:8px;background:rgba(248,251,252,.85)}.generating small{color:var(--muted)}.spin{animation:spin .85s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.properties h3{margin:0 0 5px;font-size:15px}.properties h4{margin:18px 0 9px;font-size:11px}.properties>p{margin:0 0 15px;color:var(--muted);font-size:10px;line-height:1.5}.properties .secondary{width:100%;height:36px;border:1px solid #9bc7dc;border-radius:7px;background:#edf7fb;color:var(--blue)}.properties .danger{width:100%;height:34px;margin-top:9px;border:1px solid #e8bab5;border-radius:7px;background:#fff5f4;color:#a5463d}.size-control{display:grid;grid-template-columns:1fr auto;gap:6px;margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:8px}.size-control>.two{grid-column:1/-1}.size-control>small{color:var(--muted)}.size-control>button{border:0;background:transparent;color:#a74b45;font-size:10px}.properties label{display:grid;gap:5px;margin-bottom:11px;color:var(--muted);font-size:10px}.properties input,.properties select,.create-set input,.create-set button,.zone-form input,.zone-form select{width:100%;min-width:0;height:36px;padding:0 8px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink)}.two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.properties .primary{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:39px;margin-top:12px;border:0;border-radius:7px}.create-set{display:grid;grid-template-columns:1fr 58px;gap:6px}.create-set button{color:var(--blue);cursor:pointer}.summary,.metrics{display:grid;grid-template-columns:1fr 1fr;gap:7px}.summary span,.metrics span{padding:9px;border-radius:7px;background:#edf5f8;color:var(--muted);font-size:9px}.summary strong,.metrics strong{display:block;margin-top:4px;color:var(--ink);font-size:11px}.zone-form{display:grid;grid-template-columns:1fr 1fr .8fr;gap:4px;margin-bottom:6px}.zone-form input,.zone-form select{height:31px;font-size:10px}.derived,.pass{margin-top:10px;padding:11px;border-radius:7px;background:#edf5f8;font-size:11px}.derived{display:flex;justify-content:space-between}.quality-score{display:flex;align-items:center;gap:10px;margin:16px 0;padding:14px;border-radius:8px;background:#eaf6f0;color:#2f7459}.quality-score.bad{background:#fff0ef;color:#a03f38}.quality-score strong{font-size:30px}.quality-score span{font-size:10px}.histogram{display:flex;align-items:flex-end;gap:5px;height:110px;padding:10px 5px 0;border-bottom:1px solid var(--line)}.histogram span{position:relative;display:flex;flex:1;align-items:center;justify-content:flex-end;flex-direction:column;height:100%;font-size:8px;color:var(--muted)}.histogram i{width:70%;min-height:2px;background:linear-gradient(#58a6ca,#1677b8);border-radius:3px 3px 0 0}.histogram b{position:absolute;top:-2px;font-size:8px}.histogram small{margin-top:3px;font-size:7px}.pass{display:flex;align-items:center;gap:7px;background:#eaf6f0;color:#2f7459}.empty{display:grid;place-content:center;min-height:260px;color:var(--muted);font-size:11px;text-align:center}.mesh-status{display:flex;align-items:center;gap:14px;min-height:37px;padding:0 12px;border-top:1px solid var(--line);background:#f9fbfc;color:var(--muted);font-size:10px}.mesh-status i{flex:1}.mesh-status button{background:var(--blue);color:#fff}.mesh-status button:disabled,.head-actions button:disabled{opacity:.38;cursor:not-allowed}
@media(max-width:1100px){.mesh-body{grid-template-columns:190px minmax(0,1fr) 250px}.head-actions button span{display:none}}
@media(max-width:760px){.mesher{height:calc(100vh - 80px);min-height:640px;border-radius:0}.mesh-head{grid-template-columns:auto 1fr}.mesh-title{display:none}.head-actions.right{min-width:0}.mobile-tools{display:flex;justify-content:space-between;padding:5px 10px;border-bottom:1px solid var(--line);background:#fbfcfd}.mobile-tools button{height:30px;padding:0 12px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--blue)}.mesh-body{position:relative;display:block}.mesh-canvas{width:100%;height:100%}.mesh-tree,.properties{position:absolute;z-index:8;top:0;bottom:0;width:min(86vw,320px);box-shadow:0 12px 30px rgba(20,45,60,.15);transition:transform .2s ease}.mesh-tree{left:0;transform:translateX(-105%)}.properties{right:0;transform:translateX(105%)}.mesh-body.mobile-tree .mesh-tree,.mesh-body.mobile-properties .properties{transform:translateX(0)}.mesh-tabs{scrollbar-width:thin}.canvas-note{max-width:80%;overflow:hidden;text-overflow:ellipsis}.mesh-status span:nth-of-type(n+3){display:none}.mesh-title small{display:none}}
</style>
