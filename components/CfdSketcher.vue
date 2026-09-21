<script setup lang="ts">
import {
  Circle,
  Construction,
  Copy,
  Crosshair,
  Download,
  Eye,
  FilePlus2,
  FlipHorizontal2,
  FlipVertical2,
  Grid3X3,
  Hexagon,
  Lock,
  LockOpen,
  Magnet,
  Maximize2,
  Minus,
  MousePointer2,
  Move,
  Redo2,
  RotateCw,
  Ruler,
  ScanLine,
  Scissors,
  SlidersHorizontal,
  Spline,
  Square,
  Trash2,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'
import {
  cloneSketchEntities,
  countClosedProfiles,
  entityCenter,
  entityLength,
  mirrorEntity,
  offsetEntity,
  polygonPoints,
  rectangleBounds,
  rotateEntity,
  snapSketchPoint,
  translateEntity,
  trimLineAtPoint,
  type SketchEntity,
  type SketchPoint,
  type SnapResult,
} from '~/utils/sketch-geometry'

type SketchTool = 'select' | 'line' | 'polyline' | 'rectangle' | 'circle' | 'arc' | 'polygon' | 'dimension' | 'trim' | 'offset'

const props = defineProps<{ width: number; height: number; resetToken?: number }>()
const emit = defineEmits<{
  'update:width': [value: number]
  'update:height': [value: number]
  'geometry-change': [value: { entities: number; closedProfiles: number; hasDomain: boolean }]
}>()

const worldWidth = 300
const worldHeight = 190
const svgRef = ref<SVGSVGElement | null>(null)
const importInput = ref<HTMLInputElement | null>(null)
const activeTool = ref<SketchTool>('select')
const selectedIds = ref<string[]>(['domain-1'])
const draftPoints = ref<SketchPoint[]>([])
const cursor = ref<SnapResult>({ x: 0, y: 0, kind: 'free', label: '自由点' })
const gridSize = ref(5)
const offsetDistance = ref(5)
const polygonSides = ref(6)
const snapGrid = ref(true)
const snapObjects = ref(true)
const snapAngle = ref(true)
const showGrid = ref(true)
const showDimensions = ref(true)
const zoom = ref(1)
const viewCenter = ref({ x: worldWidth / 2, y: worldHeight / 2 })
const spacePressed = ref(false)
const notice = ref('')
const dragState = ref<{
  start: SketchPoint
  originals: Map<string, SketchEntity>
  moved: boolean
} | null>(null)
const panState = ref<{ start: { x: number; y: number }; center: SketchPoint } | null>(null)
let entitySequence = 1

function defaultEntities(): SketchEntity[] {
  const width = Math.min(220, Math.max(10, props.width * 1000))
  const height = Math.min(150, Math.max(10, props.height * 1000))
  return [{
    id: 'domain-1',
    type: 'rectangle',
    x1: (worldWidth - width) / 2,
    y1: (worldHeight - height) / 2,
    x2: (worldWidth + width) / 2,
    y2: (worldHeight + height) / 2,
    role: 'domain',
    construction: false,
    locked: false,
    constraints: ['水平', '竖直'],
  }]
}

const entities = ref<SketchEntity[]>(defaultEntities())
const history = ref<SketchEntity[][]>([cloneSketchEntities(entities.value)])
const historyIndex = ref(0)

const createTools: Array<{ key: SketchTool; label: string; shortcut: string; icon: any }> = [
  { key: 'select', label: '选择', shortcut: 'V', icon: MousePointer2 },
  { key: 'line', label: '直线', shortcut: 'L', icon: Minus },
  { key: 'polyline', label: '连续线', shortcut: 'P', icon: Spline },
  { key: 'rectangle', label: '矩形', shortcut: 'R', icon: Square },
  { key: 'circle', label: '圆', shortcut: 'C', icon: Circle },
  { key: 'arc', label: '圆弧', shortcut: 'A', icon: ScanLine },
  { key: 'polygon', label: '多边形', shortcut: 'G', icon: Hexagon },
]

const modifyTools: Array<{ key: SketchTool; label: string; shortcut: string; icon: any }> = [
  { key: 'dimension', label: '尺寸', shortcut: 'D', icon: Ruler },
  { key: 'trim', label: '修剪', shortcut: 'T', icon: Scissors },
  { key: 'offset', label: '偏移', shortcut: 'O', icon: Copy },
]

const allTools = [...createTools, ...modifyTools]
const selectedEntities = computed(() => entities.value.filter(entity => selectedIds.value.includes(entity.id)))
const selected = computed(() => selectedEntities.value[0] ?? null)
const closedProfiles = computed(() => countClosedProfiles(entities.value))
const constructionCount = computed(() => entities.value.filter(entity => entity.construction).length)
const constrainedCount = computed(() => entities.value.filter(entity => entity.locked || entity.constraints.length > 0).length)
const viewBox = computed(() => {
  const width = worldWidth / zoom.value
  const height = worldHeight / zoom.value
  return `${viewCenter.value.x - width / 2} ${viewCenter.value.y - height / 2} ${width} ${height}`
})
const gridLinesX = computed(() => Array.from({ length: Math.floor(worldWidth / gridSize.value) + 1 }, (_, index) => index * gridSize.value))
const gridLinesY = computed(() => Array.from({ length: Math.floor(worldHeight / gridSize.value) + 1 }, (_, index) => index * gridSize.value))
const currentPointLabel = computed(() => `${cursor.value.x.toFixed(1)}, ${cursor.value.y.toFixed(1)} mm`)
const instruction = computed(() => {
  if (spacePressed.value || panState.value) return '拖动平移视图'
  if (activeTool.value === 'select') return selectedIds.value.length > 1 ? `已选择 ${selectedIds.value.length} 个对象` : '单击选择，Shift 多选；拖动可移动'
  if (activeTool.value === 'trim') return '单击直线，删除交点之间的线段'
  if (activeTool.value === 'offset') return `单击对象，偏移 ${offsetDistance.value} mm`
  if (activeTool.value === 'dimension') return '选择对象，在右侧输入精确尺寸'
  if (activeTool.value === 'arc') return ['单击圆心', '单击起点', '单击终点'][draftPoints.value.length] ?? '单击终点'
  if (activeTool.value === 'polyline') return draftPoints.value.length ? '继续单击；Enter 结束连续线' : '单击连续线起点'
  return draftPoints.value.length ? '单击确定第二点' : '单击确定第一点'
})

function entityName(entity: SketchEntity, index?: number) {
  if (entity.role === 'domain') return '流体计算域'
  const names = { line: '直线', rectangle: '矩形', circle: '圆', arc: '圆弧', polygon: '多边形' }
  return `${entity.construction ? '构造' : ''}${names[entity.type]}${index === undefined ? '' : ` ${index + 1}`}`
}

function normalizeRawPoint(event: MouseEvent | PointerEvent) {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const bounds = svg.getBoundingClientRect()
  const [viewX, viewY, viewWidth, viewHeight] = viewBox.value.split(' ').map(Number)
  return {
    x: Math.max(0, Math.min(worldWidth, viewX + (event.clientX - bounds.left) / bounds.width * viewWidth)),
    y: Math.max(0, Math.min(worldHeight, viewY + (event.clientY - bounds.top) / bounds.height * viewHeight)),
  }
}

function normalizePoint(event: MouseEvent | PointerEvent) {
  const raw = normalizeRawPoint(event)
  if (event.shiftKey) return { ...raw, kind: 'free', label: '临时自由点' } as SnapResult
  return snapSketchPoint(raw, entities.value, {
    grid: snapGrid.value,
    objects: snapObjects.value,
    angle: snapAngle.value,
    gridSize: gridSize.value,
    tolerance: 4 / zoom.value,
    anchor: draftPoints.value.at(-1) ?? null,
  })
}

function ensureSingleDomain() {
  const domains = entities.value.filter(entity => entity.role === 'domain' && entity.type === 'rectangle')
  if (domains.length > 1) for (const duplicate of domains.slice(1)) duplicate.role = 'reference'
  for (const entity of entities.value) if (entity.type !== 'rectangle' && entity.role === 'domain') entity.role = 'reference'
}

function emitGeometry() {
  ensureSingleDomain()
  const domain = entities.value.find(entity => entity.type === 'rectangle' && entity.role === 'domain')
  if (domain) {
    const bounds = rectangleBounds(domain)
    emit('update:width', bounds.width / 1000)
    emit('update:height', bounds.height / 1000)
  }
  emit('geometry-change', { entities: entities.value.length, closedProfiles: closedProfiles.value, hasDomain: Boolean(domain) })
}

function recordHistory(message = '') {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(cloneSketchEntities(entities.value))
  historyIndex.value = history.value.length - 1
  notice.value = message
  emitGeometry()
}

function restoreHistory(index: number) {
  if (index < 0 || index >= history.value.length) return
  historyIndex.value = index
  entities.value = cloneSketchEntities(history.value[index])
  selectedIds.value = selectedIds.value.filter(id => entities.value.some(entity => entity.id === id))
  if (!selectedIds.value.length && entities.value.length) selectedIds.value = [entities.value[0].id]
  notice.value = index < historyIndex.value ? '已恢复' : '历史状态已更新'
  emitGeometry()
}

function undo() { restoreHistory(historyIndex.value - 1) }
function redo() { restoreHistory(historyIndex.value + 1) }

function chooseTool(tool: SketchTool) {
  activeTool.value = tool
  draftPoints.value = []
  notice.value = ''
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${++entitySequence}`
}

function baseEntity(type: SketchEntity['type'], point: SketchPoint): SketchEntity {
  return {
    id: nextId(type),
    type,
    x1: point.x,
    y1: point.y,
    role: 'reference',
    construction: false,
    locked: false,
    constraints: [],
  }
}

function createFromDraft(point: SketchPoint) {
  const points = [...draftPoints.value, point]
  if (activeTool.value === 'arc' && points.length < 3) {
    draftPoints.value = points
    return
  }
  if (points.length < 2) {
    draftPoints.value = points
    return
  }
  const [start, second, third] = points
  const distance = Math.hypot(second.x - start.x, second.y - start.y)
  if (distance < 0.5) return
  let entity: SketchEntity
  if (activeTool.value === 'rectangle') {
    entity = { ...baseEntity('rectangle', start), x2: second.x, y2: second.y }
    if (!entities.value.some(item => item.role === 'domain')) entity.role = 'domain'
  } else if (activeTool.value === 'circle') {
    entity = { ...baseEntity('circle', start), radius: distance }
  } else if (activeTool.value === 'polygon') {
    entity = { ...baseEntity('polygon', start), radius: distance, sides: polygonSides.value }
  } else if (activeTool.value === 'arc' && third) {
    entity = {
      ...baseEntity('arc', start),
      radius: distance,
      startAngle: Math.atan2(second.y - start.y, second.x - start.x),
      endAngle: Math.atan2(third.y - start.y, third.x - start.x),
    }
  } else {
    entity = { ...baseEntity('line', start), x2: second.x, y2: second.y }
    const dx = Math.abs(second.x - start.x)
    const dy = Math.abs(second.y - start.y)
    if (dy < 0.25) entity.constraints.push('水平')
    if (dx < 0.25) entity.constraints.push('竖直')
  }
  entities.value.push(entity)
  selectedIds.value = [entity.id]
  draftPoints.value = activeTool.value === 'polyline' ? [second] : []
  recordHistory(`已创建${entityName(entity)}`)
}

function beginCanvasAction(event: MouseEvent) {
  if (spacePressed.value || event.button === 1) return
  const point = normalizePoint(event)
  cursor.value = point
  if (activeTool.value === 'select' || activeTool.value === 'dimension') {
    if (!event.shiftKey) selectedIds.value = []
    return
  }
  if (activeTool.value === 'trim' || activeTool.value === 'offset') return
  createFromDraft(point)
}

function startCanvasPointer(event: PointerEvent) {
  if (!spacePressed.value && event.button !== 1) return
  event.preventDefault()
  panState.value = { start: { x: event.clientX, y: event.clientY }, center: { ...viewCenter.value } }
  svgRef.value?.setPointerCapture(event.pointerId)
}

function movePointer(event: PointerEvent) {
  if (panState.value && svgRef.value) {
    const bounds = svgRef.value.getBoundingClientRect()
    const [,, viewWidth, viewHeight] = viewBox.value.split(' ').map(Number)
    viewCenter.value = {
      x: panState.value.center.x - (event.clientX - panState.value.start.x) / bounds.width * viewWidth,
      y: panState.value.center.y - (event.clientY - panState.value.start.y) / bounds.height * viewHeight,
    }
    return
  }
  const point = normalizePoint(event)
  cursor.value = point
  if (!dragState.value) return
  const dx = point.x - dragState.value.start.x
  const dy = point.y - dragState.value.start.y
  for (const [id, original] of dragState.value.originals) {
    const index = entities.value.findIndex(entity => entity.id === id)
    if (index >= 0 && !original.locked) entities.value[index] = translateEntity(original, dx, dy)
  }
  dragState.value.moved = true
  emitGeometry()
}

function finishPointer() {
  if (dragState.value?.moved) recordHistory('已移动所选对象')
  dragState.value = null
  panState.value = null
}

function selectEntity(entity: SketchEntity, event: PointerEvent) {
  if (event.shiftKey) {
    selectedIds.value = selectedIds.value.includes(entity.id)
      ? selectedIds.value.filter(id => id !== entity.id)
      : [...selectedIds.value, entity.id]
  } else if (!selectedIds.value.includes(entity.id)) selectedIds.value = [entity.id]
}

function selectFromTree(entity: SketchEntity, event: MouseEvent) {
  if (event.shiftKey) {
    selectedIds.value = selectedIds.value.includes(entity.id)
      ? selectedIds.value.filter(id => id !== entity.id)
      : [...selectedIds.value, entity.id]
  } else selectedIds.value = [entity.id]
}

function trimEntity(entity: SketchEntity, point: SketchPoint) {
  const index = entities.value.findIndex(item => item.id === entity.id)
  if (index < 0) return
  if (entity.type === 'line') {
    const pieces = trimLineAtPoint(entity, entities.value, point)
    entities.value.splice(index, 1, ...pieces)
    notice.value = pieces.length ? `修剪完成，保留 ${pieces.length} 段` : '已删除未被交点分割的直线'
  } else {
    entities.value.splice(index, 1)
    notice.value = '当前仅支持直线分段修剪；该对象已删除'
  }
  selectedIds.value = []
  recordHistory(notice.value)
}

function createOffset(entity: SketchEntity) {
  const offset = offsetEntity(entity, offsetDistance.value)
  offset.id = nextId(`${entity.type}-offset`)
  offset.role = 'reference'
  entities.value.push(offset)
  selectedIds.value = [offset.id]
  recordHistory(`已偏移 ${offsetDistance.value} mm`)
}

function entityPointerDown(entity: SketchEntity, event: PointerEvent) {
  event.stopPropagation()
  const point = normalizePoint(event)
  cursor.value = point
  if (activeTool.value === 'trim') { trimEntity(entity, point); return }
  if (activeTool.value === 'offset') { createOffset(entity); return }
  if (!['select', 'dimension'].includes(activeTool.value)) { createFromDraft(point); return }
  selectEntity(entity, event)
  if (activeTool.value === 'dimension') { showDimensions.value = true; return }
  if (entity.locked) return
  const originals = new Map(selectedEntities.value.map(item => [item.id, { ...item, constraints: [...item.constraints] }]))
  dragState.value = { start: point, originals, moved: false }
  svgRef.value?.setPointerCapture(event.pointerId)
}

function handleWheel(event: WheelEvent) {
  const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
  zoom.value = Math.max(0.65, Math.min(5, zoom.value * factor))
}

function fitView() {
  zoom.value = 1
  viewCenter.value = { x: worldWidth / 2, y: worldHeight / 2 }
}

function zoomBy(delta: number) {
  zoom.value = Math.max(0.65, Math.min(5, zoom.value + delta))
}

function deleteSelected() {
  if (!selectedIds.value.length) return
  const count = selectedIds.value.length
  entities.value = entities.value.filter(entity => !selectedIds.value.includes(entity.id))
  selectedIds.value = []
  recordHistory(`已删除 ${count} 个对象`)
}

function duplicateSelected() {
  if (!selectedEntities.value.length) return
  const copies = selectedEntities.value.map(entity => ({
    ...translateEntity(entity, gridSize.value, gridSize.value),
    id: nextId(`${entity.type}-copy`),
    role: 'reference' as const,
    locked: false,
  }))
  entities.value.push(...copies)
  selectedIds.value = copies.map(entity => entity.id)
  recordHistory(`已复制 ${copies.length} 个对象`)
}

function selectionCenter() {
  if (!selectedEntities.value.length) return { x: worldWidth / 2, y: worldHeight / 2 }
  const centers = selectedEntities.value.map(entityCenter)
  return { x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length, y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length }
}

function replaceSelected(transform: (entity: SketchEntity) => SketchEntity, message: string) {
  if (!selectedEntities.value.length) return
  entities.value = entities.value.map(entity => selectedIds.value.includes(entity.id) && !entity.locked ? transform(entity) : entity)
  recordHistory(message)
}

function mirrorSelection(axis: 'horizontal' | 'vertical') {
  const center = selectionCenter()
  replaceSelected(entity => mirrorEntity(entity, axis, axis === 'horizontal' ? center.y : center.x), axis === 'horizontal' ? '已水平镜像' : '已竖直镜像')
}

function rotateSelection() {
  const center = selectionCenter()
  replaceSelected(entity => rotateEntity(entity, center, 90), '已旋转 90°')
}

function toggleConstruction() {
  if (!selectedEntities.value.length) return
  for (const entity of selectedEntities.value) {
    entity.construction = !entity.construction
    if (entity.construction && entity.role === 'domain') entity.role = 'reference'
  }
  recordHistory('已切换构造几何')
}

function toggleLock() {
  if (!selectedEntities.value.length) return
  const lock = selectedEntities.value.some(entity => !entity.locked)
  for (const entity of selectedEntities.value) entity.locked = lock
  recordHistory(lock ? '所选对象已固定' : '所选对象已解除固定')
}

function applyLineConstraint(kind: '水平' | '竖直') {
  let changed = 0
  for (const entity of selectedEntities.value) {
    if (entity.type !== 'line' || entity.locked) continue
    if (kind === '水平') entity.y2 = entity.y1
    else entity.x2 = entity.x1
    entity.constraints = [...new Set([...entity.constraints.filter(item => item !== (kind === '水平' ? '竖直' : '水平')), kind])]
    changed += 1
  }
  if (changed) recordHistory(`已添加${kind}约束`)
  else notice.value = '请先选择至少一条未固定直线'
}

function orderedSelection(type: 'line' | 'curve') {
  return selectedIds.value
    .map(id => entities.value.find(entity => entity.id === id))
    .filter((entity): entity is SketchEntity => Boolean(entity))
    .filter(entity => type === 'line' ? entity.type === 'line' : ['circle', 'arc'].includes(entity.type))
}

function applyPairLineConstraint(kind: '平行' | '垂直' | '等长') {
  const lines = orderedSelection('line')
  if (lines.length < 2) { notice.value = `请按顺序选择两条直线以添加${kind}约束`; return }
  const [target, anchor] = lines
  if (target.locked) { notice.value = '目标直线已固定'; return }
  const targetLength = entityLength(target)
  const anchorLength = entityLength(anchor)
  const targetAngle = Math.atan2((target.y2 ?? target.y1) - target.y1, (target.x2 ?? target.x1) - target.x1)
  const anchorAngle = Math.atan2((anchor.y2 ?? anchor.y1) - anchor.y1, (anchor.x2 ?? anchor.x1) - anchor.x1)
  const angle = kind === '平行' ? anchorAngle : kind === '垂直' ? anchorAngle + Math.PI / 2 : targetAngle
  const length = kind === '等长' ? anchorLength : targetLength
  target.x2 = target.x1 + Math.cos(angle) * length
  target.y2 = target.y1 + Math.sin(angle) * length
  target.constraints = [...new Set([...target.constraints, kind])]
  recordHistory(`已添加${kind}约束`)
}

function applyCurveConstraint(kind: '同心' | '等半径') {
  const curves = orderedSelection('curve')
  if (curves.length < 2) { notice.value = `请按顺序选择两个圆或圆弧以添加${kind}约束`; return }
  const [target, anchor] = curves
  if (target.locked) { notice.value = '目标曲线已固定'; return }
  if (kind === '同心') {
    target.x1 = anchor.x1
    target.y1 = anchor.y1
  } else target.radius = anchor.radius
  target.constraints = [...new Set([...target.constraints, kind])]
  recordHistory(`已添加${kind}约束`)
}

function makeDomain() {
  if (!selected.value || selected.value.type !== 'rectangle' || selected.value.construction) return
  for (const entity of entities.value) if (entity.role === 'domain') entity.role = 'reference'
  selected.value.role = 'domain'
  recordHistory('已设为 CFD 流体计算域')
}

type EditableField = 'x1' | 'y1' | 'x2' | 'y2' | 'width' | 'height' | 'radius' | 'startAngle' | 'endAngle' | 'sides' | 'length' | 'angle'

function updateSelected(field: EditableField, rawValue: string) {
  const entity = selected.value
  const value = Number(rawValue)
  if (!entity || entity.locked || !Number.isFinite(value)) return
  if (field === 'x1' || field === 'y1') {
    const delta = value - entity[field]
    entity[field] = value
    const paired = field === 'x1' ? 'x2' : 'y2'
    if (entity[paired] !== undefined) entity[paired]! += delta
  } else if (field === 'x2' || field === 'y2') entity[field] = value
  else if (field === 'length' && entity.type === 'line') {
    const angle = Math.atan2((entity.y2 ?? entity.y1) - entity.y1, (entity.x2 ?? entity.x1) - entity.x1)
    entity.x2 = entity.x1 + Math.cos(angle) * Math.max(0.5, value)
    entity.y2 = entity.y1 + Math.sin(angle) * Math.max(0.5, value)
  } else if (field === 'angle' && entity.type === 'line') {
    const length = entityLength(entity)
    const angle = value * Math.PI / 180
    entity.x2 = entity.x1 + Math.cos(angle) * length
    entity.y2 = entity.y1 + Math.sin(angle) * length
  }
  else if (field === 'width' && entity.type === 'rectangle') entity.x2 = entity.x1 + Math.max(0.5, value)
  else if (field === 'height' && entity.type === 'rectangle') entity.y2 = entity.y1 + Math.max(0.5, value)
  else if (field === 'radius' && ['circle', 'arc', 'polygon'].includes(entity.type)) entity.radius = Math.max(0.5, value)
  else if (field === 'startAngle' && entity.type === 'arc') entity.startAngle = value * Math.PI / 180
  else if (field === 'endAngle' && entity.type === 'arc') entity.endAngle = value * Math.PI / 180
  else if (field === 'sides' && entity.type === 'polygon') entity.sides = Math.max(3, Math.min(32, Math.round(value)))
  recordHistory('尺寸已更新')
}

function resetSketch() {
  entities.value = defaultEntities()
  history.value = [cloneSketchEntities(entities.value)]
  historyIndex.value = 0
  selectedIds.value = ['domain-1']
  draftPoints.value = []
  activeTool.value = 'select'
  fitView()
  notice.value = '已恢复默认计算域'
  emitGeometry()
}

function newSketch() {
  entities.value = []
  selectedIds.value = []
  draftPoints.value = []
  activeTool.value = 'rectangle'
  recordHistory('新草图已创建，请绘制一个矩形计算域')
}

function exportSketch() {
  const payload = JSON.stringify({
    format: 'cfdrookie-sketch/2.0',
    unit: 'mm',
    entities: cloneSketchEntities(entities.value),
  }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'cfdrookie-2d-sketch.json'
  anchor.click()
  URL.revokeObjectURL(url)
  notice.value = '草图文件已导出'
}

function openImportDialog() {
  importInput.value?.click()
}

async function importSketch(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const parsed = JSON.parse(await file.text()) as { format?: string; entities?: SketchEntity[] }
    const allowedTypes = new Set(['line', 'rectangle', 'circle', 'arc', 'polygon'])
    if (!parsed.format?.startsWith('cfdrookie-sketch/') || !Array.isArray(parsed.entities)) throw new Error('文件格式不正确')
    if (parsed.entities.length > 1000 || parsed.entities.some(entity => !entity.id || !allowedTypes.has(entity.type))) throw new Error('草图对象无效或数量过多')
    entities.value = parsed.entities.map(entity => ({
      ...entity,
      role: entity.role === 'domain' && entity.type === 'rectangle' ? 'domain' : 'reference',
      construction: Boolean(entity.construction),
      locked: Boolean(entity.locked),
      constraints: Array.isArray(entity.constraints) ? entity.constraints.map(String).slice(0, 20) : [],
    }))
    selectedIds.value = entities.value[0] ? [entities.value[0].id] : []
    ensureSingleDomain()
    recordHistory(`已导入 ${entities.value.length} 个对象`)
  } catch (error) {
    notice.value = error instanceof Error ? `导入失败：${error.message}` : '导入失败'
  }
}

function arcPath(entity: SketchEntity) {
  const radius = entity.radius ?? 0
  const start = entity.startAngle ?? 0
  const end = entity.endAngle ?? 0
  let sweep = end - start
  if (sweep < 0) sweep += Math.PI * 2
  const startPoint = { x: entity.x1 + Math.cos(start) * radius, y: entity.y1 + Math.sin(start) * radius }
  const endPoint = { x: entity.x1 + Math.cos(end) * radius, y: entity.y1 + Math.sin(end) * radius }
  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${endPoint.x} ${endPoint.y}`
}

function pointList(points: SketchPoint[]) {
  return points.map(point => `${point.x},${point.y}`).join(' ')
}

function draftArcPath() {
  if (draftPoints.value.length < 2) return ''
  const [center, start] = draftPoints.value
  const radius = Math.hypot(start.x - center.x, start.y - center.y)
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  const endAngle = Math.atan2(cursor.value.y - center.y, cursor.value.x - center.x)
  return arcPath({ id: 'draft-arc', type: 'arc', x1: center.x, y1: center.y, radius, startAngle, endAngle, role: 'reference', construction: false, locked: false, constraints: [] })
}

function selectionHandlePoints(entity: SketchEntity) {
  if (entity.type === 'line') return [
    { x: entity.x1, y: entity.y1 },
    { x: entity.x2 ?? entity.x1, y: entity.y2 ?? entity.y1 },
  ]
  return [entityCenter(entity)]
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select')) return
  const key = event.key.toLowerCase()
  if (event.code === 'Space') { event.preventDefault(); spacePressed.value = true; return }
  if ((event.ctrlKey || event.metaKey) && key === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return }
  if ((event.ctrlKey || event.metaKey) && key === 'y') { event.preventDefault(); redo(); return }
  if ((event.ctrlKey || event.metaKey) && key === 'd') { event.preventDefault(); duplicateSelected(); return }
  if (key === 'delete' || key === 'backspace') { event.preventDefault(); deleteSelected(); return }
  if (key === 'enter' && activeTool.value === 'polyline') { draftPoints.value = []; activeTool.value = 'select'; return }
  if (key === 'escape') { draftPoints.value = []; activeTool.value = 'select'; return }
  const shortcut = allTools.find(tool => tool.shortcut.toLowerCase() === key)
  if (shortcut) chooseTool(shortcut.key)
}

function handleKeyup(event: KeyboardEvent) {
  if (event.code === 'Space') spacePressed.value = false
}

watch(() => props.resetToken, resetSketch)
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  emitGeometry()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
})
</script>

<template>
  <div class="sketcher-shell">
    <div class="document-bar">
      <div><strong>草图 1</strong><span>XY 平面 · mm</span></div>
      <div>
        <button type="button" title="新建空白草图" @click="newSketch"><FilePlus2 :size="15" />新建</button>
        <button type="button" title="导入 CFD菜鸟草图文件" @click="openImportDialog"><Upload :size="15" />导入</button>
        <button type="button" title="导出 CFD菜鸟草图文件" @click="exportSketch"><Download :size="15" />导出</button>
        <input ref="importInput" class="hidden-input" type="file" accept=".json,.cfdsketch" @change="importSketch">
      </div>
    </div>

    <div class="sketch-ribbon">
      <div class="ribbon-group create-group">
        <small>创建</small>
        <button v-for="tool in createTools" :key="tool.key" type="button" :class="{ active: activeTool===tool.key }" :title="`${tool.label} (${tool.shortcut})`" @click="chooseTool(tool.key)">
          <component :is="tool.icon" :size="17" /><span>{{ tool.label }}</span><kbd>{{ tool.shortcut }}</kbd>
        </button>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group modify-group">
        <small>修改</small>
        <button v-for="tool in modifyTools" :key="tool.key" type="button" :class="{ active: activeTool===tool.key }" :title="`${tool.label} (${tool.shortcut})`" @click="chooseTool(tool.key)">
          <component :is="tool.icon" :size="17" /><span>{{ tool.label }}</span><kbd>{{ tool.shortcut }}</kbd>
        </button>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group constraint-group">
        <small>约束</small>
        <button type="button" title="水平约束" @click="applyLineConstraint('水平')"><Minus :size="17" /><span>水平</span></button>
        <button type="button" title="竖直约束" @click="applyLineConstraint('竖直')"><span class="vertical-icon"></span><span>竖直</span></button>
        <button type="button" title="平行约束，需要选择两条直线" @click="applyPairLineConstraint('平行')"><span class="constraint-symbol">∥</span><span>平行</span></button>
        <button type="button" title="垂直约束，需要选择两条直线" @click="applyPairLineConstraint('垂直')"><span class="constraint-symbol">⊥</span><span>垂直</span></button>
        <button type="button" title="等长约束，需要选择两条直线" @click="applyPairLineConstraint('等长')"><span class="constraint-symbol">=</span><span>等长</span></button>
        <button type="button" title="同心约束，需要选择两个圆或圆弧" @click="applyCurveConstraint('同心')"><span class="constraint-symbol">◎</span><span>同心</span></button>
        <button type="button" title="等半径约束，需要选择两个圆或圆弧" @click="applyCurveConstraint('等半径')"><span class="constraint-symbol">R</span><span>等半径</span></button>
        <button type="button" title="切换构造几何" @click="toggleConstruction"><Construction :size="17" /><span>构造</span></button>
        <button type="button" title="固定或解除固定" @click="toggleLock"><Lock :size="17" /><span>固定</span></button>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group edit-group">
        <small>变换</small>
        <div>
          <button type="button" title="撤销 (Ctrl+Z)" :disabled="historyIndex===0" @click="undo"><Undo2 :size="17" /></button>
          <button type="button" title="重做 (Ctrl+Y)" :disabled="historyIndex>=history.length-1" @click="redo"><Redo2 :size="17" /></button>
          <button type="button" title="复制 (Ctrl+D)" :disabled="!selectedIds.length" @click="duplicateSelected"><Copy :size="17" /></button>
          <button type="button" title="水平镜像" :disabled="!selectedIds.length" @click="mirrorSelection('horizontal')"><FlipHorizontal2 :size="17" /></button>
          <button type="button" title="竖直镜像" :disabled="!selectedIds.length" @click="mirrorSelection('vertical')"><FlipVertical2 :size="17" /></button>
          <button type="button" title="旋转 90°" :disabled="!selectedIds.length" @click="rotateSelection"><RotateCw :size="17" /></button>
          <button type="button" title="删除" :disabled="!selectedIds.length" @click="deleteSelected"><Trash2 :size="17" /></button>
        </div>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group view-group">
        <small>视图</small>
        <div>
          <button type="button" title="缩小" @click="zoomBy(-.25)"><ZoomOut :size="17" /></button>
          <button type="button" title="放大" @click="zoomBy(.25)"><ZoomIn :size="17" /></button>
          <button type="button" title="适合窗口" @click="fitView"><Maximize2 :size="17" /></button>
        </div>
      </div>
    </div>

    <div class="options-bar">
      <label><input v-model="snapObjects" type="checkbox"><Magnet :size="13" />对象捕捉</label>
      <label><input v-model="snapGrid" type="checkbox"><Grid3X3 :size="13" />网格捕捉</label>
      <label><input v-model="snapAngle" type="checkbox"><Ruler :size="13" />15° 角度捕捉</label>
      <label><input v-model="showGrid" type="checkbox"><Eye :size="13" />显示网格</label>
      <label class="numeric-option">网格 <input v-model.number="gridSize" type="number" min="1" max="25"> mm</label>
      <label v-if="activeTool==='offset'" class="numeric-option accent-option">偏移 <input v-model.number="offsetDistance" type="number" min="-50" max="50"> mm</label>
      <label v-if="activeTool==='polygon'" class="numeric-option accent-option">边数 <input v-model.number="polygonSides" type="number" min="3" max="32"></label>
    </div>

    <div class="sketch-main">
      <aside class="structure-tree">
        <div class="pane-title"><span>结构</span><Eye :size="13" /></div>
        <div class="plane-row"><Grid3X3 :size="14" /><span>XY 草图平面</span><Lock :size="11" /></div>
        <button v-for="(entity,index) in entities" :key="entity.id" type="button" :class="{ selected: selectedIds.includes(entity.id) }" @click="selectFromTree(entity,$event)">
          <Square v-if="entity.type==='rectangle'" :size="13" />
          <Circle v-else-if="entity.type==='circle'" :size="13" />
          <Hexagon v-else-if="entity.type==='polygon'" :size="13" />
          <ScanLine v-else-if="entity.type==='arc'" :size="13" />
          <Minus v-else :size="13" />
          <span>{{ entityName(entity,index) }}</span>
          <Construction v-if="entity.construction" :size="10" class="tree-state" />
          <Lock v-if="entity.locked" :size="10" class="tree-state" />
        </button>
        <div class="tree-summary">
          <span><strong>{{ entities.length }}</strong> 对象</span>
          <span><strong>{{ closedProfiles }}</strong> 封闭轮廓</span>
          <span><strong>{{ constructionCount }}</strong> 构造几何</span>
        </div>
      </aside>

      <div class="sketch-canvas-wrap">
        <div class="canvas-head">
          <span><Crosshair :size="13" />顶视图 · XY 平面</span>
          <span>{{ instruction }}</span>
        </div>
        <svg
          ref="svgRef"
          class="sketch-canvas"
          :class="{ panning: spacePressed || panState }"
          :viewBox="viewBox"
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label="二维草图绘图区"
          @pointerdown="startCanvasPointer"
          @click="beginCanvasAction"
          @pointermove="movePointer"
          @pointerup="finishPointer"
          @pointerleave="finishPointer"
          @wheel.prevent="handleWheel"
        >
          <rect x="0" y="0" :width="worldWidth" :height="worldHeight" class="canvas-background" />
          <g v-if="showGrid" class="minor-grid">
            <line v-for="x in gridLinesX" :key="`gx-${x}`" :x1="x" y1="0" :x2="x" :y2="worldHeight" />
            <line v-for="y in gridLinesY" :key="`gy-${y}`" x1="0" :y1="y" :x2="worldWidth" :y2="y" />
          </g>
          <line x1="0" :y1="worldHeight/2" :x2="worldWidth" :y2="worldHeight/2" class="axis x-axis" />
          <line :x1="worldWidth/2" y1="0" :x2="worldWidth/2" :y2="worldHeight" class="axis y-axis" />
          <text :x="worldWidth-7" :y="worldHeight/2-2" class="axis-label x-label">X</text>
          <text :x="worldWidth/2+2" y="7" class="axis-label y-label">Y</text>

          <g
            v-for="entity in entities"
            :key="entity.id"
            class="sketch-entity"
            :class="{ selected:selectedIds.includes(entity.id), domain:entity.role==='domain', construction:entity.construction, locked:entity.locked }"
            @pointerdown="entityPointerDown(entity,$event)"
            @click.stop
          >
            <template v-if="entity.type==='rectangle'">
              <rect v-bind="rectangleBounds(entity)" />
              <template v-if="showDimensions || selectedIds.includes(entity.id)">
                <line :x1="rectangleBounds(entity).x" :y1="rectangleBounds(entity).y-4" :x2="rectangleBounds(entity).x+rectangleBounds(entity).width" :y2="rectangleBounds(entity).y-4" class="dimension-line" />
                <text :x="rectangleBounds(entity).x+rectangleBounds(entity).width/2" :y="rectangleBounds(entity).y-6" class="dimension-text">{{ rectangleBounds(entity).width.toFixed(1) }}</text>
                <text :x="rectangleBounds(entity).x+rectangleBounds(entity).width+4" :y="rectangleBounds(entity).y+rectangleBounds(entity).height/2" class="dimension-text vertical">{{ rectangleBounds(entity).height.toFixed(1) }}</text>
              </template>
            </template>
            <template v-else-if="entity.type==='circle'">
              <circle :cx="entity.x1" :cy="entity.y1" :r="entity.radius" />
              <line v-if="showDimensions || selectedIds.includes(entity.id)" :x1="entity.x1" :y1="entity.y1" :x2="entity.x1+(entity.radius||0)" :y2="entity.y1" class="dimension-line" />
              <text v-if="showDimensions || selectedIds.includes(entity.id)" :x="entity.x1" :y="entity.y1-3" class="dimension-text">Ø {{ ((entity.radius||0)*2).toFixed(1) }}</text>
            </template>
            <polygon v-else-if="entity.type==='polygon'" :points="pointList(polygonPoints(entity))" />
            <path v-else-if="entity.type==='arc'" :d="arcPath(entity)" />
            <template v-else>
              <line :x1="entity.x1" :y1="entity.y1" :x2="entity.x2" :y2="entity.y2" />
              <text v-if="showDimensions || selectedIds.includes(entity.id)" :x="(entity.x1+(entity.x2??entity.x1))/2" :y="(entity.y1+(entity.y2??entity.y1))/2-3" class="dimension-text">{{ entityLength(entity).toFixed(1) }}</text>
            </template>
            <g v-if="selectedIds.includes(entity.id)" class="selection-handles">
              <circle v-for="(point,index) in selectionHandlePoints(entity)" :key="index" :cx="point.x" :cy="point.y" r="1.5" />
            </g>
          </g>

          <g v-if="draftPoints.length" class="draft-shape">
            <line v-if="['line','polyline'].includes(activeTool)" :x1="draftPoints.at(-1)!.x" :y1="draftPoints.at(-1)!.y" :x2="cursor.x" :y2="cursor.y" />
            <rect v-else-if="activeTool==='rectangle'" :x="Math.min(draftPoints[0].x,cursor.x)" :y="Math.min(draftPoints[0].y,cursor.y)" :width="Math.abs(cursor.x-draftPoints[0].x)" :height="Math.abs(cursor.y-draftPoints[0].y)" />
            <circle v-else-if="activeTool==='circle' || activeTool==='polygon'" :cx="draftPoints[0].x" :cy="draftPoints[0].y" :r="Math.hypot(cursor.x-draftPoints[0].x,cursor.y-draftPoints[0].y)" />
            <line v-if="activeTool==='arc' && draftPoints.length===1" :x1="draftPoints[0].x" :y1="draftPoints[0].y" :x2="cursor.x" :y2="cursor.y" />
            <path v-else-if="activeTool==='arc' && draftPoints.length===2" :d="draftArcPath()" />
          </g>
          <g v-if="cursor.kind!=='free'" class="snap-marker">
            <circle :cx="cursor.x" :cy="cursor.y" r="2.2" />
            <text :x="cursor.x+3" :y="cursor.y-3">{{ cursor.label }}</text>
          </g>
          <circle v-else :cx="cursor.x" :cy="cursor.y" r="1.1" class="cursor-point" />
        </svg>
        <div class="canvas-status">
          <span><i></i>{{ cursor.kind==='free' ? '自由绘制' : `捕捉：${cursor.label}` }}</span>
          <span>缩放 {{ Math.round(zoom*100) }}%</span>
          <span>X, Y: {{ currentPointLabel }}</span>
        </div>
      </div>

      <aside class="property-panel">
        <div class="pane-title"><span>属性</span><SlidersHorizontal :size="13" /></div>
        <template v-if="selected">
          <div class="property-type">
            <span>{{ entityName(selected) }}</span>
            <strong>{{ selected.role==='domain' ? 'CFD 流体计算域' : selected.construction ? '构造几何' : '草图几何' }}</strong>
          </div>
          <div v-if="selectedIds.length>1" class="multi-selection"><Move :size="14" />已选择 {{ selectedIds.length }} 个对象，可整体移动、复制、镜像或旋转。</div>
          <template v-else>
            <label><span>X <em>mm</em></span><input type="number" :disabled="selected.locked" :value="selected.x1.toFixed(2)" @change="updateSelected('x1',($event.target as HTMLInputElement).value)"></label>
            <label><span>Y <em>mm</em></span><input type="number" :disabled="selected.locked" :value="selected.y1.toFixed(2)" @change="updateSelected('y1',($event.target as HTMLInputElement).value)"></label>
            <template v-if="selected.type==='line'">
              <label><span>终点 X <em>mm</em></span><input type="number" :disabled="selected.locked" :value="(selected.x2??0).toFixed(2)" @change="updateSelected('x2',($event.target as HTMLInputElement).value)"></label>
              <label><span>终点 Y <em>mm</em></span><input type="number" :disabled="selected.locked" :value="(selected.y2??0).toFixed(2)" @change="updateSelected('y2',($event.target as HTMLInputElement).value)"></label>
              <label><span>长度 <em>mm</em></span><input type="number" min="0.5" :disabled="selected.locked" :value="entityLength(selected).toFixed(2)" @change="updateSelected('length',($event.target as HTMLInputElement).value)"></label>
              <label><span>角度 <em>°</em></span><input type="number" :disabled="selected.locked" :value="(Math.atan2((selected.y2??selected.y1)-selected.y1,(selected.x2??selected.x1)-selected.x1)*180/Math.PI).toFixed(1)" @change="updateSelected('angle',($event.target as HTMLInputElement).value)"></label>
            </template>
            <template v-else-if="selected.type==='rectangle'">
              <label><span>宽度 <em>mm</em></span><input type="number" min="0.5" :disabled="selected.locked" :value="rectangleBounds(selected).width.toFixed(2)" @change="updateSelected('width',($event.target as HTMLInputElement).value)"></label>
              <label><span>高度 <em>mm</em></span><input type="number" min="0.5" :disabled="selected.locked" :value="rectangleBounds(selected).height.toFixed(2)" @change="updateSelected('height',($event.target as HTMLInputElement).value)"></label>
              <button v-if="selected.role!=='domain' && !selected.construction" type="button" class="domain-button" @click="makeDomain">设为 CFD 流体域</button>
            </template>
            <template v-else-if="['circle','arc','polygon'].includes(selected.type)">
              <label><span>半径 <em>mm</em></span><input type="number" min="0.5" :disabled="selected.locked" :value="(selected.radius??0).toFixed(2)" @change="updateSelected('radius',($event.target as HTMLInputElement).value)"></label>
              <label v-if="selected.type==='arc'"><span>起始角 <em>°</em></span><input type="number" :disabled="selected.locked" :value="((selected.startAngle??0)*180/Math.PI).toFixed(1)" @change="updateSelected('startAngle',($event.target as HTMLInputElement).value)"></label>
              <label v-if="selected.type==='arc'"><span>终止角 <em>°</em></span><input type="number" :disabled="selected.locked" :value="((selected.endAngle??0)*180/Math.PI).toFixed(1)" @change="updateSelected('endAngle',($event.target as HTMLInputElement).value)"></label>
              <label v-if="selected.type==='polygon'"><span>边数</span><input type="number" min="3" max="32" :disabled="selected.locked" :value="selected.sides??6" @change="updateSelected('sides',($event.target as HTMLInputElement).value)"></label>
            </template>
          </template>
          <div class="constraint-list">
            <strong>约束与状态</strong>
            <span v-if="selected.locked"><Lock :size="11" />固定</span>
            <span v-else><LockOpen :size="11" />未完全约束</span>
            <span v-for="constraint in selected.constraints" :key="constraint"><Magnet :size="11" />{{ constraint }}</span>
          </div>
        </template>
        <div v-else class="empty-property"><MousePointer2 :size="22" /><span>选择草图对象<br>查看并编辑几何属性</span></div>
        <div class="model-scope">
          <strong>当前建模状态</strong>
          <p>{{ closedProfiles }} 个封闭轮廓，{{ constrainedCount }}/{{ entities.length }} 个对象包含约束或已固定。蓝色矩形是当前可传递给 CFD 网格的流体域。</p>
        </div>
      </aside>
    </div>

    <div class="sketch-footer">
      <span>{{ notice || 'Shift 临时关闭捕捉 · 空格拖动平移 · 滚轮缩放 · Esc 退出工具' }}</span>
      <button type="button" @click="resetSketch">恢复默认草图</button>
    </div>
  </div>
</template>

<style scoped>
.sketcher-shell,.sketcher-shell *{box-sizing:border-box}
.sketcher-shell{overflow:hidden;border:1px solid #cbd8de;border-radius:8px;background:#f7f9fa;color:#274451}
button,input{font:inherit}
.document-bar{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:42px;padding:0 12px;border-bottom:1px solid #d6e0e5;background:#f2f6f8}
.document-bar>div{display:flex;align-items:center;gap:10px}.document-bar strong{font-size:10px}.document-bar span{color:#82949d;font-size:8px}.document-bar button{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 9px;border:1px solid transparent;border-radius:4px;background:transparent;color:#516d79;font-size:8px;cursor:pointer}.document-bar button:hover{border-color:#b7cbd5;background:#fff;color:#126f9c}.hidden-input{display:none}
.sketch-ribbon{display:flex;align-items:stretch;gap:6px;min-height:78px;padding:7px 10px;border-bottom:1px solid #cbd8de;background:#fff;overflow-x:auto}
.ribbon-group{display:flex;position:relative;flex:0 0 auto;align-items:center;gap:3px;padding-top:14px}.ribbon-group>small{position:absolute;top:0;left:3px;color:#84949c;font-size:8px;letter-spacing:.08em}.ribbon-group button{display:inline-flex;position:relative;align-items:center;justify-content:center;gap:4px;min-width:46px;height:47px;padding:0 7px;border:1px solid transparent;border-radius:4px;background:transparent;color:#36515e;font-size:8px;cursor:pointer}.ribbon-group button:hover,.ribbon-group button.active{border-color:#9fc4d5;background:#e7f3f8;color:#126e9b}.ribbon-group button:disabled{cursor:not-allowed;opacity:.3}.ribbon-group kbd{position:absolute;right:2px;bottom:1px;color:#8da0aa;font-size:6px}.ribbon-divider{flex:0 0 1px;width:1px;margin:6px 2px;background:#dce5e9}.edit-group>div,.view-group>div{display:flex}.edit-group button,.view-group button{min-width:34px;width:34px;padding:0}.vertical-icon{display:block;width:1px;height:18px;background:currentColor}
.constraint-symbol{font-family:Cambria,serif;font-size:16px;line-height:1}
.options-bar{display:flex;align-items:center;gap:14px;min-height:36px;padding:4px 12px;border-bottom:1px solid #d5e0e5;background:#f8fafb;overflow-x:auto}.options-bar label{display:flex;flex:0 0 auto;align-items:center;gap:5px;color:#647a85;font-size:8px}.options-bar input[type=checkbox]{width:12px;height:12px;margin:0;accent-color:#1684b8}.numeric-option input{width:46px;height:24px;padding:0 5px;border:1px solid #c7d6dd;border-radius:3px;background:#fff;color:#294754}.accent-option{padding-left:10px;border-left:1px solid #cbd9df;color:#126f9c!important}
.sketch-main{display:grid;grid-template-columns:185px minmax(0,1fr) 220px;min-height:570px}
.structure-tree,.property-panel{min-width:0;background:#f9fbfc}.structure-tree{border-right:1px solid #d3dfe5}.property-panel{border-left:1px solid #d3dfe5;padding-bottom:12px}.pane-title{display:flex;align-items:center;justify-content:space-between;height:34px;padding:0 10px;border-bottom:1px solid #d8e2e7;color:#58717d;font-size:9px;font-weight:800;letter-spacing:.08em}.plane-row,.structure-tree>button{display:flex;align-items:center;gap:7px;width:100%;min-height:32px;padding:0 10px;border:0;border-bottom:1px solid #e7ecef;background:transparent;color:#546d79;font-size:8px;text-align:left}.plane-row{background:#edf3f6}.plane-row svg:last-child{margin-left:auto}.structure-tree>button{padding-left:18px;cursor:pointer}.structure-tree>button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.structure-tree>button:hover,.structure-tree>button.selected{background:#e4f1f7;color:#126d99}.tree-state{margin-left:auto}.tree-summary{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:12px;padding:9px;border-radius:4px;background:#edf3f6;color:#70848e;font-size:8px}.tree-summary span:last-child{grid-column:1/-1}.tree-summary strong{color:#315361}
.sketch-canvas-wrap{display:grid;grid-template-rows:34px minmax(0,1fr) 27px;min-width:0;background:#eef3f5}.canvas-head,.canvas-status{display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#f8fafb;color:#738791;font-size:8px}.canvas-head{border-bottom:1px solid #d5e0e5}.canvas-head span,.canvas-status span{display:flex;align-items:center;gap:5px}.canvas-status{border-top:1px solid #cedbe1}.canvas-status i{width:6px;height:6px;border-radius:50%;background:#39a56e}.sketch-canvas{display:block;width:100%;height:100%;min-height:500px;touch-action:none;cursor:crosshair}.sketch-canvas.panning{cursor:grab}.canvas-background{fill:#fbfcfd}.minor-grid line{stroke:#dfe8ec;stroke-width:.24;vector-effect:non-scaling-stroke}.axis{stroke-width:.7;vector-effect:non-scaling-stroke}.x-axis{stroke:#d38c8c}.y-axis{stroke:#7ca7ce}.axis-label{font-size:4px;font-weight:800}.x-label{fill:#bd6262}.y-label{fill:#4d82b2}
.sketch-entity{cursor:pointer}.sketch-entity rect,.sketch-entity circle,.sketch-entity polygon,.sketch-entity path{fill:rgba(105,154,178,.04);stroke:#526f7c;stroke-width:1;vector-effect:non-scaling-stroke}.sketch-entity>line{stroke:#526f7c;stroke-width:1;vector-effect:non-scaling-stroke}.sketch-entity.domain rect{fill:rgba(44,143,187,.08);stroke:#1684b8;stroke-width:1.5}.sketch-entity.construction rect,.sketch-entity.construction circle,.sketch-entity.construction polygon,.sketch-entity.construction path,.sketch-entity.construction>line{fill:none;stroke:#81a0ae;stroke-dasharray:4 2}.sketch-entity.locked{opacity:.72}.sketch-entity.selected rect,.sketch-entity.selected circle,.sketch-entity.selected polygon,.sketch-entity.selected path,.sketch-entity.selected>line{stroke:#ed8b3a;stroke-width:1.8}.dimension-line{stroke:#8297a1!important;stroke-width:.45!important;stroke-dasharray:2 1;pointer-events:none}.dimension-text{fill:#58717d;font-size:3px;text-anchor:middle;pointer-events:none}.dimension-text.vertical{writing-mode:vertical-rl}.selection-handles circle{fill:#fff!important;stroke:#ed8b3a!important;stroke-width:.8!important;pointer-events:none}.draft-shape>*{fill:rgba(25,132,182,.05);stroke:#1684b8;stroke-width:1;stroke-dasharray:3 2;vector-effect:non-scaling-stroke}.snap-marker{pointer-events:none}.snap-marker circle{fill:rgba(255,255,255,.8);stroke:#e28235;stroke-width:1;vector-effect:non-scaling-stroke}.snap-marker text{fill:#bd6d2d;font-size:3px}.cursor-point{fill:#fff;stroke:#1684b8;stroke-width:.7;pointer-events:none;vector-effect:non-scaling-stroke}
.sketch-entity path,.draft-shape path{fill:none}
.property-type{display:grid;gap:3px;padding:12px;border-bottom:1px solid #dce5e9}.property-type span{font-size:11px;font-weight:800}.property-type strong{color:#1780ae;font-size:8px}.multi-selection{display:flex;align-items:flex-start;gap:7px;margin:10px;padding:10px;background:#edf5f8;color:#58717d;font-size:8px;line-height:1.5}.property-panel label{display:grid;grid-template-columns:1fr 90px;align-items:center;gap:7px;padding:6px 10px;color:#58707b;font-size:8px}.property-panel label span{display:flex;justify-content:space-between}.property-panel label em{color:#8e9da4;font-style:normal}.property-panel input{width:100%;min-width:0;height:29px;padding:0 7px;border:1px solid #cbd8de;border-radius:3px;background:#fff;color:#223f4d;font-size:9px}.property-panel input:disabled{background:#edf1f3;color:#80929b}.read-only-value{display:flex;justify-content:space-between;margin:6px 10px;padding:8px;border-top:1px solid #dfe6e9;color:#6d818b;font-size:8px}.domain-button{display:block;width:calc(100% - 20px);height:31px;margin:7px 10px;border:1px solid #8ebdd2;border-radius:4px;background:#e8f4f8;color:#126d99;font-size:9px;font-weight:700;cursor:pointer}.constraint-list{display:grid;gap:7px;margin:10px;padding:10px;border-top:1px solid #dfe6e9;color:#6e838d;font-size:8px}.constraint-list strong{font-size:8px}.constraint-list span{display:flex;align-items:center;gap:5px}.empty-property{display:grid;place-items:center;gap:8px;padding:48px 12px;color:#8a9ba3;font-size:9px;text-align:center;line-height:1.5}.model-scope{margin:14px 10px 0;padding:10px;border-left:2px solid #65a8c7;background:#edf5f8}.model-scope strong{font-size:8px}.model-scope p{margin:5px 0 0;color:#6f848e;font-size:8px;line-height:1.55}
.sketch-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:35px;padding:5px 12px;border-top:1px solid #cbd8de;background:#f2f6f8;color:#71858f;font-size:8px}.sketch-footer button{height:25px;border:1px solid #c2d1d8;border-radius:4px;background:#fff;color:#536d78;font-size:8px;cursor:pointer}
@media(max-width:1100px){.sketch-main{grid-template-columns:155px minmax(0,1fr) 200px}.ribbon-group button{min-width:48px}.ribbon-group kbd{display:none}}
@media(max-width:900px){.sketch-main{grid-template-columns:1fr}.structure-tree{display:none}.property-panel{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid #d3dfe5;border-left:0}.property-panel>.pane-title,.property-panel>.property-type,.property-panel>.multi-selection,.property-panel>.constraint-list,.property-panel>.model-scope,.property-panel>.empty-property{grid-column:1/-1}.sketch-canvas{min-height:430px}}
@media(max-width:620px){.document-bar{align-items:flex-start;flex-direction:column;padding:8px 10px}.sketch-ribbon{min-height:72px}.ribbon-group button{min-width:43px;height:42px}.options-bar{gap:10px}.sketch-canvas{min-height:340px}.property-panel{grid-template-columns:1fr 1fr}.canvas-status span:nth-child(2){display:none}.sketch-footer{align-items:flex-start;flex-direction:column}.sketch-footer button{width:100%}}
</style>
