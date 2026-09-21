<script setup lang="ts">
import {
  Circle,
  Crosshair,
  Eye,
  Grid3X3,
  Lock,
  Magnet,
  Maximize2,
  Minus,
  MousePointer2,
  Redo2,
  Ruler,
  Scissors,
  SlidersHorizontal,
  Square,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'

type SketchTool = 'select' | 'line' | 'rectangle' | 'circle' | 'dimension' | 'trim'
type SketchEntity = {
  id: string
  type: 'line' | 'rectangle' | 'circle'
  x1: number
  y1: number
  x2?: number
  y2?: number
  radius?: number
  role: 'domain' | 'reference'
}

const props = defineProps<{ width: number; height: number; resetToken?: number }>()
const emit = defineEmits<{
  'update:width': [value: number]
  'update:height': [value: number]
  'geometry-change': [value: { entities: number; closedProfiles: number; hasDomain: boolean }]
}>()

const worldWidth = 240
const worldHeight = 150
const gridSize = 5
const svgRef = ref<SVGSVGElement | null>(null)
const activeTool = ref<SketchTool>('select')
const snapEnabled = ref(true)
const showDimensions = ref(true)
const zoom = ref(1)
const selectedId = ref('domain-1')
const draftStart = ref<{ x: number; y: number } | null>(null)
const cursor = ref({ x: 0, y: 0 })
const dragState = ref<{ start: { x: number; y: number }; original: SketchEntity; moved: boolean } | null>(null)

function defaultEntities(): SketchEntity[] {
  const width = Math.min(190, Math.max(10, props.width * 1000))
  const height = Math.min(120, Math.max(10, props.height * 1000))
  return [{
    id: 'domain-1',
    type: 'rectangle',
    x1: (worldWidth - width) / 2,
    y1: (worldHeight - height) / 2,
    x2: (worldWidth + width) / 2,
    y2: (worldHeight + height) / 2,
    role: 'domain',
  }]
}

function cloneEntity(entity: SketchEntity): SketchEntity {
  return { ...entity }
}

function cloneEntities(source: SketchEntity[]): SketchEntity[] {
  return source.map(cloneEntity)
}

const entities = ref<SketchEntity[]>(defaultEntities())
const history = ref<SketchEntity[][]>([cloneEntities(entities.value)])
const historyIndex = ref(0)
let entitySequence = 1

const tools: Array<{ key: SketchTool; label: string; shortcut: string; icon: any }> = [
  { key: 'select', label: '选择', shortcut: 'V', icon: MousePointer2 },
  { key: 'line', label: '直线', shortcut: 'L', icon: Minus },
  { key: 'rectangle', label: '矩形', shortcut: 'R', icon: Square },
  { key: 'circle', label: '圆', shortcut: 'C', icon: Circle },
  { key: 'dimension', label: '尺寸', shortcut: 'D', icon: Ruler },
  { key: 'trim', label: '修剪', shortcut: 'T', icon: Scissors },
]

const selected = computed(() => entities.value.find((entity) => entity.id === selectedId.value) || null)
const viewBox = computed(() => {
  const width = worldWidth / zoom.value
  const height = worldHeight / zoom.value
  return `${(worldWidth - width) / 2} ${(worldHeight - height) / 2} ${width} ${height}`
})
const gridLinesX = computed(() => Array.from({ length: Math.floor(worldWidth / gridSize) + 1 }, (_, index) => index * gridSize))
const gridLinesY = computed(() => Array.from({ length: Math.floor(worldHeight / gridSize) + 1 }, (_, index) => index * gridSize))
const closedProfiles = computed(() => entities.value.filter((entity) => entity.type !== 'line').length)
const currentPointLabel = computed(() => `${cursor.value.x.toFixed(1)}, ${cursor.value.y.toFixed(1)} mm`)

function rectangleBounds(entity: SketchEntity) {
  return {
    x: Math.min(entity.x1, entity.x2 || entity.x1),
    y: Math.min(entity.y1, entity.y2 || entity.y1),
    width: Math.abs((entity.x2 || entity.x1) - entity.x1),
    height: Math.abs((entity.y2 || entity.y1) - entity.y1),
  }
}

function entityLength(entity: SketchEntity) {
  if (entity.type === 'line') return Math.hypot((entity.x2 || 0) - entity.x1, (entity.y2 || 0) - entity.y1)
  if (entity.type === 'circle') return (entity.radius || 0) * 2
  const bounds = rectangleBounds(entity)
  return Math.hypot(bounds.width, bounds.height)
}

function normalizePoint(event: MouseEvent | PointerEvent) {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  const [viewX, viewY, viewWidth, viewHeight] = viewBox.value.split(' ').map(Number)
  let x = viewX + (event.clientX - rect.left) / rect.width * viewWidth
  let y = viewY + (event.clientY - rect.top) / rect.height * viewHeight
  x = Math.max(0, Math.min(worldWidth, x))
  y = Math.max(0, Math.min(worldHeight, y))
  if (snapEnabled.value && !event.shiftKey) {
    x = Math.round(x / gridSize) * gridSize
    y = Math.round(y / gridSize) * gridSize
  }
  return { x, y }
}

function emitGeometry() {
  const domain = entities.value.find((entity) => entity.type === 'rectangle' && entity.role === 'domain')
  if (domain) {
    const bounds = rectangleBounds(domain)
    emit('update:width', bounds.width / 1000)
    emit('update:height', bounds.height / 1000)
  }
  emit('geometry-change', {
    entities: entities.value.length,
    closedProfiles: closedProfiles.value,
    hasDomain: Boolean(domain),
  })
}

function recordHistory() {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(cloneEntities(entities.value))
  historyIndex.value = history.value.length - 1
  emitGeometry()
}

function restoreHistory(index: number) {
  if (index < 0 || index >= history.value.length) return
  historyIndex.value = index
  entities.value = cloneEntities(history.value[index])
  if (!entities.value.some((entity) => entity.id === selectedId.value)) selectedId.value = entities.value[0]?.id || ''
  emitGeometry()
}

function undo() { restoreHistory(historyIndex.value - 1) }
function redo() { restoreHistory(historyIndex.value + 1) }

function chooseTool(tool: SketchTool) {
  activeTool.value = tool
  draftStart.value = null
}

function beginCanvasAction(event: MouseEvent) {
  const point = normalizePoint(event)
  cursor.value = point
  if (activeTool.value === 'select' || activeTool.value === 'dimension' || activeTool.value === 'trim') {
    selectedId.value = ''
    return
  }
  if (!draftStart.value) {
    draftStart.value = point
    return
  }

  const start = draftStart.value
  const distance = Math.hypot(point.x - start.x, point.y - start.y)
  if (distance < 1) return
  const type = activeTool.value === 'rectangle' ? 'rectangle' : activeTool.value === 'circle' ? 'circle' : 'line'
  const hasDomain = entities.value.some((entity) => entity.role === 'domain')
  const entity: SketchEntity = {
    id: `entity-${++entitySequence}`,
    type,
    x1: start.x,
    y1: start.y,
    x2: type === 'circle' ? undefined : point.x,
    y2: type === 'circle' ? undefined : point.y,
    radius: type === 'circle' ? distance : undefined,
    role: type === 'rectangle' && !hasDomain ? 'domain' : 'reference',
  }
  entities.value.push(entity)
  selectedId.value = entity.id
  draftStart.value = null
  recordHistory()
}

function movePointer(event: PointerEvent) {
  const point = normalizePoint(event)
  cursor.value = point
  if (!dragState.value || !selected.value) return
  const dx = point.x - dragState.value.start.x
  const dy = point.y - dragState.value.start.y
  const original = dragState.value.original
  selected.value.x1 = original.x1 + dx
  selected.value.y1 = original.y1 + dy
  if (original.x2 !== undefined) selected.value.x2 = original.x2 + dx
  if (original.y2 !== undefined) selected.value.y2 = original.y2 + dy
  dragState.value.moved = true
  emitGeometry()
}

function finishPointer() {
  if (dragState.value?.moved) recordHistory()
  dragState.value = null
}

function entityPointerDown(entity: SketchEntity, event: PointerEvent) {
  event.stopPropagation()
  if (activeTool.value === 'trim') {
    selectedId.value = entity.id
    removeSelected()
    return
  }
  selectedId.value = entity.id
  if (activeTool.value === 'dimension') {
    showDimensions.value = true
    return
  }
  if (activeTool.value !== 'select') return
  const point = normalizePoint(event)
  dragState.value = { start: point, original: cloneEntity(entity), moved: false }
  svgRef.value?.setPointerCapture(event.pointerId)
}

function ensureDomainAfterDelete() {
  if (entities.value.some((entity) => entity.role === 'domain')) return
  const rectangle = entities.value.find((entity) => entity.type === 'rectangle')
  if (rectangle) rectangle.role = 'domain'
}

function removeSelected() {
  if (!selectedId.value) return
  entities.value = entities.value.filter((entity) => entity.id !== selectedId.value)
  ensureDomainAfterDelete()
  selectedId.value = entities.value[0]?.id || ''
  recordHistory()
}

function makeDomain() {
  if (!selected.value || selected.value.type !== 'rectangle') return
  for (const entity of entities.value) if (entity.role === 'domain') entity.role = 'reference'
  selected.value.role = 'domain'
  recordHistory()
}

function updateSelected(field: 'x1' | 'y1' | 'width' | 'height' | 'radius', rawValue: string) {
  const entity = selected.value
  const value = Number(rawValue)
  if (!entity || !Number.isFinite(value)) return
  if (field === 'x1') {
    const delta = value - entity.x1
    entity.x1 = value
    if (entity.x2 !== undefined) entity.x2 += delta
  } else if (field === 'y1') {
    const delta = value - entity.y1
    entity.y1 = value
    if (entity.y2 !== undefined) entity.y2 += delta
  } else if (field === 'radius' && entity.type === 'circle') entity.radius = Math.max(1, value)
  else if (field === 'width' && entity.type === 'rectangle') entity.x2 = entity.x1 + Math.max(1, value)
  else if (field === 'height' && entity.type === 'rectangle') entity.y2 = entity.y1 + Math.max(1, value)
  recordHistory()
}

function zoomBy(delta: number) {
  zoom.value = Math.max(1, Math.min(2.5, zoom.value + delta))
}

function resetSketch() {
  entities.value = defaultEntities()
  history.value = [cloneEntities(entities.value)]
  historyIndex.value = 0
  selectedId.value = 'domain-1'
  activeTool.value = 'select'
  draftStart.value = null
  zoom.value = 1
  emitGeometry()
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select')) return
  const key = event.key.toLowerCase()
  if ((event.ctrlKey || event.metaKey) && key === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return }
  if ((event.ctrlKey || event.metaKey) && key === 'y') { event.preventDefault(); redo(); return }
  if (key === 'delete' || key === 'backspace') { event.preventDefault(); removeSelected(); return }
  const shortcut = tools.find((tool) => tool.shortcut.toLowerCase() === key)
  if (shortcut) chooseTool(shortcut.key)
  if (key === 'escape') chooseTool('select')
}

watch(() => props.resetToken, resetSketch)
onMounted(() => { window.addEventListener('keydown', handleKeydown); emitGeometry() })
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="sketcher-shell">
    <div class="sketch-ribbon">
      <div class="ribbon-group create-group">
        <small>草图</small>
        <button v-for="tool in tools" :key="tool.key" type="button" :class="{ active: activeTool===tool.key }" :title="`${tool.label} (${tool.shortcut})`" @click="chooseTool(tool.key)">
          <component :is="tool.icon" :size="17" /><span>{{ tool.label }}</span><kbd>{{ tool.shortcut }}</kbd>
        </button>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group edit-group">
        <small>编辑</small>
        <div>
          <button type="button" title="撤销 (Ctrl+Z)" :disabled="historyIndex===0" @click="undo"><Undo2 :size="17" /></button>
          <button type="button" title="重做 (Ctrl+Y)" :disabled="historyIndex>=history.length-1" @click="redo"><Redo2 :size="17" /></button>
          <button type="button" title="删除选中对象" :disabled="!selected" @click="removeSelected"><Trash2 :size="17" /></button>
        </div>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group view-group">
        <small>视图</small>
        <div>
          <button type="button" :class="{ active: snapEnabled }" title="网格捕捉，按 Shift 临时关闭" @click="snapEnabled=!snapEnabled"><Magnet :size="17" /></button>
          <button type="button" :class="{ active: showDimensions }" title="显示尺寸" @click="showDimensions=!showDimensions"><Ruler :size="17" /></button>
          <button type="button" title="缩小" @click="zoomBy(-.25)"><ZoomOut :size="17" /></button>
          <button type="button" title="放大" @click="zoomBy(.25)"><ZoomIn :size="17" /></button>
          <button type="button" title="适合窗口" @click="zoom=1"><Maximize2 :size="17" /></button>
        </div>
      </div>
    </div>

    <div class="sketch-main">
      <aside class="structure-tree">
        <div class="pane-title"><span>结构</span><Eye :size="13" /></div>
        <div class="plane-row"><Grid3X3 :size="14" /><span>XY 草图平面</span><Lock :size="11" /></div>
        <button v-for="(entity,index) in entities" :key="entity.id" type="button" :class="{ selected: selectedId===entity.id }" @click="selectedId=entity.id">
          <Square v-if="entity.type==='rectangle'" :size="13" />
          <Circle v-else-if="entity.type==='circle'" :size="13" />
          <Minus v-else :size="13" />
          <span>{{ entity.role==='domain' ? '流体域' : entity.type==='rectangle' ? `矩形 ${index+1}` : entity.type==='circle' ? `圆 ${index+1}` : `直线 ${index+1}` }}</span>
        </button>
        <div class="tree-summary"><strong>{{ entities.length }}</strong> 个草图对象<br><strong>{{ closedProfiles }}</strong> 个封闭轮廓</div>
      </aside>

      <div class="sketch-canvas-wrap">
        <div class="canvas-head"><span><Crosshair :size="13" />顶视图 · XY 平面</span><span>{{ activeTool==='select' ? '拖动对象或单击选择' : draftStart ? '单击确定第二点' : '单击确定第一点' }}</span></div>
        <svg
          ref="svgRef"
          class="sketch-canvas"
          :viewBox="viewBox"
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label="二维草图绘图区"
          @click="beginCanvasAction"
          @pointermove="movePointer"
          @pointerup="finishPointer"
          @pointerleave="finishPointer"
        >
          <rect x="0" y="0" :width="worldWidth" :height="worldHeight" class="canvas-background" />
          <g class="minor-grid">
            <line v-for="x in gridLinesX" :key="`gx-${x}`" :x1="x" y1="0" :x2="x" :y2="worldHeight" />
            <line v-for="y in gridLinesY" :key="`gy-${y}`" x1="0" :y1="y" :x2="worldWidth" :y2="y" />
          </g>
          <line x1="0" :y1="worldHeight/2" :x2="worldWidth" :y2="worldHeight/2" class="axis x-axis" />
          <line :x1="worldWidth/2" y1="0" :x2="worldWidth/2" :y2="worldHeight" class="axis y-axis" />
          <text :x="worldWidth-7" :y="worldHeight/2-2" class="axis-label x-label">X</text>
          <text :x="worldWidth/2+2" y="7" class="axis-label y-label">Y</text>

          <g v-for="entity in entities" :key="entity.id" class="sketch-entity" :class="{ selected:selectedId===entity.id, domain:entity.role==='domain' }" @pointerdown="entityPointerDown(entity,$event)" @click.stop>
            <template v-if="entity.type==='rectangle'">
              <rect v-bind="rectangleBounds(entity)" />
              <template v-if="showDimensions || selectedId===entity.id">
                <line :x1="rectangleBounds(entity).x" :y1="rectangleBounds(entity).y-4" :x2="rectangleBounds(entity).x+rectangleBounds(entity).width" :y2="rectangleBounds(entity).y-4" class="dimension-line" />
                <text :x="rectangleBounds(entity).x+rectangleBounds(entity).width/2" :y="rectangleBounds(entity).y-6" class="dimension-text">{{ rectangleBounds(entity).width.toFixed(1) }} mm</text>
                <text :x="rectangleBounds(entity).x+rectangleBounds(entity).width+4" :y="rectangleBounds(entity).y+rectangleBounds(entity).height/2" class="dimension-text vertical">{{ rectangleBounds(entity).height.toFixed(1) }} mm</text>
              </template>
            </template>
            <template v-else-if="entity.type==='circle'">
              <circle :cx="entity.x1" :cy="entity.y1" :r="entity.radius" />
              <line v-if="showDimensions || selectedId===entity.id" :x1="entity.x1" :y1="entity.y1" :x2="entity.x1+(entity.radius||0)" :y2="entity.y1" class="dimension-line" />
              <text v-if="showDimensions || selectedId===entity.id" :x="entity.x1" :y="entity.y1-3" class="dimension-text">Ø {{ ((entity.radius||0)*2).toFixed(1) }}</text>
            </template>
            <template v-else>
              <line :x1="entity.x1" :y1="entity.y1" :x2="entity.x2" :y2="entity.y2" />
              <text v-if="showDimensions || selectedId===entity.id" :x="(entity.x1+(entity.x2||0))/2" :y="(entity.y1+(entity.y2||0))/2-3" class="dimension-text">{{ entityLength(entity).toFixed(1) }}</text>
            </template>
          </g>

          <g v-if="draftStart" class="draft-shape">
            <line v-if="activeTool==='line'" :x1="draftStart.x" :y1="draftStart.y" :x2="cursor.x" :y2="cursor.y" />
            <rect v-else-if="activeTool==='rectangle'" :x="Math.min(draftStart.x,cursor.x)" :y="Math.min(draftStart.y,cursor.y)" :width="Math.abs(cursor.x-draftStart.x)" :height="Math.abs(cursor.y-draftStart.y)" />
            <circle v-else-if="activeTool==='circle'" :cx="draftStart.x" :cy="draftStart.y" :r="Math.hypot(cursor.x-draftStart.x,cursor.y-draftStart.y)" />
          </g>
          <circle :cx="cursor.x" :cy="cursor.y" r="1.2" class="cursor-point" />
        </svg>
        <div class="canvas-status"><span><i></i>{{ snapEnabled ? '网格捕捉 5 mm' : '自由绘制' }}</span><span>缩放 {{ Math.round(zoom*100) }}%</span><span>X, Y: {{ currentPointLabel }}</span></div>
      </div>

      <aside class="property-panel">
        <div class="pane-title"><span>属性</span><SlidersHorizontal :size="13" /></div>
        <template v-if="selected">
          <div class="property-type"><span>{{ selected.type==='rectangle' ? '矩形' : selected.type==='circle' ? '圆' : '直线' }}</span><strong>{{ selected.role==='domain' ? '流体计算域' : '辅助草图' }}</strong></div>
          <label><span>X <em>mm</em></span><input type="number" :value="selected.x1.toFixed(1)" @input="updateSelected('x1',($event.target as HTMLInputElement).value)"></label>
          <label><span>Y <em>mm</em></span><input type="number" :value="selected.y1.toFixed(1)" @input="updateSelected('y1',($event.target as HTMLInputElement).value)"></label>
          <template v-if="selected.type==='rectangle'">
            <label><span>宽度 <em>mm</em></span><input type="number" min="1" :value="rectangleBounds(selected).width.toFixed(1)" @input="updateSelected('width',($event.target as HTMLInputElement).value)"></label>
            <label><span>高度 <em>mm</em></span><input type="number" min="1" :value="rectangleBounds(selected).height.toFixed(1)" @input="updateSelected('height',($event.target as HTMLInputElement).value)"></label>
            <button v-if="selected.role!=='domain'" type="button" class="domain-button" @click="makeDomain">设为流体域</button>
          </template>
          <label v-else-if="selected.type==='circle'"><span>半径 <em>mm</em></span><input type="number" min="1" :value="(selected.radius||0).toFixed(1)" @input="updateSelected('radius',($event.target as HTMLInputElement).value)"></label>
          <div class="constraint-list"><span><Lock :size="11" />草图平面固定</span><span v-if="snapEnabled"><Magnet :size="11" />坐标捕捉生效</span></div>
        </template>
        <div v-else class="empty-property"><MousePointer2 :size="22" /><span>选择草图对象<br>查看或输入精确尺寸</span></div>
        <div class="model-scope"><strong>求解域说明</strong><p>蓝色矩形作为当前流体计算域。其他线、圆和矩形用于二维草图构造与尺寸参考。</p></div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.sketcher-shell,.sketcher-shell *{box-sizing:border-box}.sketcher-shell{overflow:hidden;border:1px solid #cfdbe1;border-radius:7px;background:#f7f9fa}.sketch-ribbon{display:flex;align-items:stretch;gap:7px;min-height:75px;padding:7px 10px;border-bottom:1px solid #cbd8de;background:#fff}.ribbon-group{display:flex;position:relative;align-items:center;gap:3px;padding-top:13px}.ribbon-group>small{position:absolute;top:0;left:3px;color:#84949c;font-size:8px;letter-spacing:.08em}.ribbon-group button{display:inline-flex;position:relative;align-items:center;justify-content:center;gap:5px;min-width:44px;height:45px;padding:0 7px;border:1px solid transparent;border-radius:4px;background:transparent;color:#36515e;font-size:9px;cursor:pointer}.ribbon-group button:hover,.ribbon-group button.active{border-color:#a9cad9;background:#e9f4f8;color:#126e9b}.ribbon-group button:disabled{cursor:not-allowed;opacity:.35}.ribbon-group button span{display:block}.ribbon-group kbd{position:absolute;right:2px;bottom:1px;color:#8da0aa;font-size:7px;font-family:inherit}.edit-group>div,.view-group>div{display:flex}.edit-group button,.view-group button{min-width:35px;width:35px;padding:0}.ribbon-divider{width:1px;margin:6px 2px;background:#dce5e9}.sketch-main{display:grid;grid-template-columns:165px minmax(0,1fr) 190px;min-height:510px}.structure-tree,.property-panel{min-width:0;background:#f9fbfc}.structure-tree{border-right:1px solid #d3dfe5}.property-panel{border-left:1px solid #d3dfe5}.pane-title{display:flex;align-items:center;justify-content:space-between;height:34px;padding:0 10px;border-bottom:1px solid #d8e2e7;color:#58717d;font-size:9px;font-weight:800;letter-spacing:.08em}.plane-row,.structure-tree>button{display:flex;align-items:center;gap:7px;width:100%;min-height:32px;padding:0 10px;border:0;border-bottom:1px solid #e7ecef;background:transparent;color:#546d79;font-size:9px;text-align:left}.plane-row{background:#edf3f6}.plane-row svg:last-child{margin-left:auto}.structure-tree>button{padding-left:22px;cursor:pointer}.structure-tree>button:hover,.structure-tree>button.selected{background:#e4f1f7;color:#126d99}.tree-summary{margin:12px;padding:10px;border-radius:4px;background:#edf3f6;color:#70848e;font-size:8px;line-height:1.7}.tree-summary strong{color:#315361}.sketch-canvas-wrap{display:grid;grid-template-rows:34px minmax(0,1fr) 27px;min-width:0;background:#eef3f5}.canvas-head,.canvas-status{display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#f8fafb;color:#738791;font-size:8px}.canvas-head{border-bottom:1px solid #d5e0e5}.canvas-head span{display:flex;align-items:center;gap:5px}.canvas-status{border-top:1px solid #cedbe1}.canvas-status span{display:flex;align-items:center;gap:5px}.canvas-status i{width:6px;height:6px;border-radius:50%;background:#39a56e}.sketch-canvas{display:block;width:100%;height:100%;min-height:440px;touch-action:none;cursor:crosshair}.canvas-background{fill:#fbfcfd}.minor-grid line{stroke:#dfe8ec;stroke-width:.25;vector-effect:non-scaling-stroke}.axis{stroke-width:.7;vector-effect:non-scaling-stroke}.x-axis{stroke:#d38c8c}.y-axis{stroke:#7ca7ce}.axis-label{font-size:4px;font-weight:800}.x-label{fill:#bd6262}.y-label{fill:#4d82b2}.sketch-entity{cursor:pointer}.sketch-entity rect,.sketch-entity circle{fill:rgba(105,154,178,.05);stroke:#516f7d;stroke-width:1;vector-effect:non-scaling-stroke}.sketch-entity line{stroke:#516f7d;stroke-width:1;vector-effect:non-scaling-stroke}.sketch-entity.domain rect{fill:rgba(44,143,187,.08);stroke:#1684b8;stroke-width:1.6}.sketch-entity.selected rect,.sketch-entity.selected circle,.sketch-entity.selected>line{stroke:#ed8b3a;stroke-width:1.8}.dimension-line{stroke:#8297a1!important;stroke-width:.45!important;stroke-dasharray:2 1;pointer-events:none}.dimension-text{fill:#58717d;font-size:3px;text-anchor:middle;pointer-events:none}.dimension-text.vertical{writing-mode:vertical-rl}.draft-shape>*{fill:rgba(25,132,182,.06);stroke:#1684b8;stroke-width:1;stroke-dasharray:3 2;vector-effect:non-scaling-stroke}.cursor-point{fill:#fff;stroke:#1684b8;stroke-width:.7;pointer-events:none;vector-effect:non-scaling-stroke}.property-panel{padding-bottom:12px}.property-type{display:grid;gap:3px;padding:12px;border-bottom:1px solid #dce5e9}.property-type span{font-size:11px;font-weight:800}.property-type strong{color:#1780ae;font-size:8px}.property-panel label{display:grid;grid-template-columns:1fr 84px;align-items:center;gap:7px;padding:7px 10px;color:#58707b;font-size:8px}.property-panel label span{display:flex;justify-content:space-between}.property-panel label em{color:#8e9da4;font-style:normal}.property-panel input{width:100%;min-width:0;height:29px;padding:0 7px;border:1px solid #cbd8de;border-radius:3px;background:#fff;color:#223f4d;font-size:9px}.domain-button{display:block;width:calc(100% - 20px);height:31px;margin:7px 10px;border:1px solid #8ebdd2;border-radius:4px;background:#e8f4f8;color:#126d99;font-size:9px;font-weight:700;cursor:pointer}.constraint-list{display:grid;gap:7px;margin:10px;padding:10px;border-top:1px solid #dfe6e9;color:#6e838d;font-size:8px}.constraint-list span{display:flex;align-items:center;gap:5px}.empty-property{display:grid;place-items:center;gap:8px;padding:45px 12px;color:#8a9ba3;font-size:9px;text-align:center;line-height:1.5}.model-scope{margin:14px 10px 0;padding:10px;border-left:2px solid #65a8c7;background:#edf5f8}.model-scope strong{font-size:8px}.model-scope p{margin:5px 0 0;color:#6f848e;font-size:8px;line-height:1.55}
@media(max-width:900px){.sketch-main{grid-template-columns:1fr}.structure-tree{display:none}.property-panel{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid #d3dfe5;border-left:0}.property-panel>.pane-title,.property-panel>.property-type,.property-panel>.constraint-list,.property-panel>.model-scope,.property-panel>.empty-property{grid-column:1/-1}.sketch-ribbon{overflow-x:auto}.ribbon-group{flex:0 0 auto}}
@media(max-width:620px){.sketch-main{min-height:440px}.sketch-canvas{min-height:330px}.ribbon-group button{min-width:48px}.ribbon-group kbd{display:none}.property-panel{grid-template-columns:1fr 1fr}.canvas-status span:nth-child(2){display:none}}
</style>
