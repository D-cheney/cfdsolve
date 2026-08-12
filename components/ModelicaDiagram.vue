<script setup lang="ts">
import { MousePointer2, Cable, ZoomIn, ZoomOut, Maximize2, Trash2, WandSparkles, Boxes, CircleDot } from 'lucide-vue-next'

type NodeItem = { id: string; type: string; label: string; x: number; y: number; parameters: Record<string, string | number> }
type LinkItem = { id: string; from: string; to: string }
const emit = defineEmits<{ select: [node: NodeItem | null]; change: [payload: { nodes: NodeItem[]; links: LinkItem[] }] }>()

const nodes = ref<NodeItem[]>([
  { id: 'fixed1', type: 'Fixed', label: 'fixed', x: 90, y: 190, parameters: {} },
  { id: 'spring1', type: 'Spring', label: 'spring', x: 285, y: 190, parameters: { c: 100 } },
  { id: 'damper1', type: 'Damper', label: 'damper', x: 285, y: 315, parameters: { d: .5 } },
  { id: 'mass1', type: 'Mass', label: 'mass', x: 500, y: 245, parameters: { m: 1 } }
])
const links = ref<LinkItem[]>([
  { id: 'l1', from: 'fixed1', to: 'spring1' }, { id: 'l2', from: 'fixed1', to: 'damper1' },
  { id: 'l3', from: 'spring1', to: 'mass1' }, { id: 'l4', from: 'damper1', to: 'mass1' }
])
const selectedId = ref('mass1')
const mode = ref<'select' | 'connect'>('select')
const connectFrom = ref('')
const zoom = ref(1)
const dragging = reactive({ id: '', dx: 0, dy: 0 })

const componentTypes: Array<{ type: string; label: string; group: string; parameters: Record<string, string | number> }> = [
  { type: 'Mass', label: '质量', group: '机械', parameters: { m: 1 } },
  { type: 'Spring', label: '弹簧', group: '机械', parameters: { c: 100 } },
  { type: 'Damper', label: '阻尼', group: '机械', parameters: { d: .5 } },
  { type: 'Fixed', label: '固定端', group: '机械', parameters: {} },
  { type: 'Constant', label: '常量', group: '信号', parameters: { k: 1 } },
  { type: 'Sine', label: '正弦源', group: '信号', parameters: { amplitude: 1, freqHz: 1 } },
  { type: 'Gain', label: '增益', group: '信号', parameters: { k: 1 } },
  { type: 'ThermalCapacitor', label: '热容', group: '热学', parameters: { C: 1000 } },
  { type: 'Conductor', label: '热阻', group: '热学', parameters: { G: 10 } },
  { type: 'Sensor', label: '传感器', group: '测量', parameters: {} }
]
const selected = computed(() => nodes.value.find(item => item.id === selectedId.value) || null)
const linkPaths = computed(() => links.value.map(link => {
  const from = nodes.value.find(item => item.id === link.from), to = nodes.value.find(item => item.id === link.to)
  if (!from || !to) return { ...link, d: '' }
  const x1 = from.x + 70, y1 = from.y + 34, x2 = to.x, y2 = to.y + 34
  const mid = (x1 + x2) / 2
  return { ...link, d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}` }
}))

function addComponent(type: string) {
  const definition = componentTypes.find(item => item.type === type); if (!definition) return
  const count = nodes.value.filter(item => item.type === type).length + 1
  const node = { id: `${type.toLowerCase()}${Date.now().toString(36)}`, type, label: `${type.toLowerCase()}${count}`, x: 170 + (nodes.value.length % 4) * 150, y: 100 + (nodes.value.length % 3) * 120, parameters: { ...definition.parameters } }
  nodes.value.push(node); selectNode(node.id); changed()
}
function selectNode(id: string) {
  if (mode.value === 'connect') {
    if (!connectFrom.value) connectFrom.value = id
    else if (connectFrom.value !== id) {
      links.value.push({ id: `link${Date.now().toString(36)}`, from: connectFrom.value, to: id }); connectFrom.value = ''; changed()
    }
    return
  }
  selectedId.value = id; emit('select', selected.value)
}
function pointerDown(event: PointerEvent, node: NodeItem) {
  if (mode.value !== 'select') return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture?.(event.pointerId); dragging.id = node.id; dragging.dx = event.clientX / zoom.value - node.x; dragging.dy = event.clientY / zoom.value - node.y
  selectNode(node.id)
}
function pointerMove(event: PointerEvent) {
  if (!dragging.id) return
  const node = nodes.value.find(item => item.id === dragging.id); if (!node) return
  node.x = Math.max(10, Math.min(740, event.clientX / zoom.value - dragging.dx)); node.y = Math.max(10, Math.min(470, event.clientY / zoom.value - dragging.dy))
}
function pointerUp() { if (dragging.id) changed(); dragging.id = '' }
function removeSelected() {
  if (!selectedId.value) return
  nodes.value = nodes.value.filter(item => item.id !== selectedId.value); links.value = links.value.filter(item => item.from !== selectedId.value && item.to !== selectedId.value); selectedId.value = ''; emit('select', null); changed()
}
function autoLayout() {
  nodes.value.forEach((node, index) => { node.x = 80 + (index % 4) * 190; node.y = 100 + Math.floor(index / 4) * 150 }); changed()
}
function updateSelectedParameter(key: string, value: string | number) { if (selected.value) { selected.value.parameters[key] = value; changed() } }
function changed() { emit('change', { nodes: nodes.value, links: links.value }) }
function modelicaFragment() {
  const declarations = nodes.value.map(node => `  Modelica.${node.type} ${node.label}${Object.keys(node.parameters).length ? `(${Object.entries(node.parameters).map(([key,value]) => `${key}=${value}`).join(', ')})` : ''};`)
  const equations = links.value.map(link => { const from = nodes.value.find(item => item.id === link.from), to = nodes.value.find(item => item.id === link.to); return from && to ? `  connect(${from.label}.port_b, ${to.label}.port_a);` : '' }).filter(Boolean)
  return `${declarations.join('\n')}\nequation\n${equations.join('\n')}`
}
defineExpose({ addComponent, modelicaFragment, updateSelectedParameter })
</script>

<template>
  <div class="om-diagram-shell">
    <aside class="om-component-palette"><div class="panel-title"><span>组件库</span><small>{{ componentTypes.length }}</small></div><div v-for="group in ['机械','信号','热学','测量']" :key="group" class="om-palette-group"><strong>{{ group }}</strong><button v-for="item in componentTypes.filter(entry=>entry.group===group)" :key="item.type" @click="addComponent(item.type)"><span><Boxes :size="16" /></span>{{ item.label }}<small>{{ item.type }}</small></button></div></aside>
    <section class="om-diagram-main">
      <div class="om-diagram-toolbar"><button :class="{active:mode==='select'}" @click="mode='select';connectFrom=''" title="选择与移动"><MousePointer2 :size="15" />选择</button><button :class="{active:mode==='connect'}" @click="mode='connect'" title="连接组件"><Cable :size="15" />连接</button><i></i><button @click="zoom=Math.min(1.4,zoom+.1)"><ZoomIn :size="15" /></button><button @click="zoom=Math.max(.7,zoom-.1)"><ZoomOut :size="15" /></button><button @click="zoom=1"><Maximize2 :size="15" /></button><button @click="autoLayout"><WandSparkles :size="15" />自动布局</button><button :disabled="!selected" @click="removeSelected"><Trash2 :size="15" /></button><span>{{ Math.round(zoom*100) }}%</span></div>
      <div class="om-diagram-canvas" :class="{connecting:mode==='connect'}" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp">
        <div class="om-diagram-stage" :style="{transform:`scale(${zoom})`}">
          <svg class="om-connections" viewBox="0 0 820 540" preserveAspectRatio="none"><path v-for="link in linkPaths" :key="link.id" :d="link.d" /></svg>
          <button v-for="node in nodes" :key="node.id" class="om-node" :class="[{selected:selectedId===node.id,source:connectFrom===node.id},`type-${node.type.toLowerCase()}`]" :style="{left:node.x+'px',top:node.y+'px'}" @click.stop="selectNode(node.id)" @pointerdown="pointerDown($event,node)"><span><component :is="node.type==='Fixed'?CircleDot:Boxes" :size="20" /></span><strong>{{ node.label }}</strong><small>{{ node.type }}</small><i class="port left"></i><i class="port right"></i></button>
        </div>
        <div v-if="mode==='connect'" class="om-connect-tip">{{ connectFrom ? '选择目标组件以创建 connect()' : '选择连接起点' }}</div>
      </div>
    </section>
  </div>
</template>
