<script setup lang="ts">
type ViewMode = 'geometry' | 'mesh' | 'solution'
type FieldMode = 'velocity' | 'pressure' | 'scalar' | 'vorticity'

const props = withDefaults(defineProps<{
  slug: string
  mode?: ViewMode
  field?: FieldMode
  params: Record<string, string | number>
  result?: Record<string, any>
  showMesh?: boolean
  showVectors?: boolean
}>(), {
  mode: 'geometry',
  field: 'velocity',
  result: () => ({}),
  showMesh: true,
  showVectors: true
})

const canvas = ref<HTMLCanvasElement | null>(null)
const host = ref<HTMLElement | null>(null)
const cursor = reactive({ visible: false, x: 0, y: 0, value: 0 })
let observer: ResizeObserver | undefined

const fieldLabel = computed(() => ({
  velocity: '速度幅值', pressure: '静压', scalar: '标量 φ', vorticity: '涡量 ω'
}[props.field]))

function palette(t: number) {
  const stops = [
    [250, 246, 241], [245, 218, 193], [239, 156, 92], [205, 83, 31], [86, 45, 28]
  ]
  const value = Math.max(0, Math.min(0.999, t)) * (stops.length - 1)
  const index = Math.floor(value)
  const mix = value - index
  const a = stops[index], b = stops[index + 1]
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * mix)).join(',')})`
}

function domainBox(width: number, height: number) {
  const pipe = props.slug === 'pipe-flow' || props.slug === 'convection-diffusion'
  const plate = props.slug === 'turbulence-compare'
  const ratio = pipe ? 3.15 : plate ? 2.7 : 1
  const maxW = width - 116, maxH = height - 92
  let w = maxW, h = w / ratio
  if (h > maxH) { h = maxH; w = h * ratio }
  return { x: (width - w) / 2, y: (height - h) / 2 + 3, w, h }
}

function getField() {
  const fields = props.result?.fields
  const values = fields?.[props.field] || fields?.velocity || []
  return {
    nx: Number(fields?.nx || 48),
    ny: Number(fields?.ny || 32),
    values: Array.isArray(values) ? values.map(Number) : []
  }
}

function sampleField(nx: number, ny: number) {
  const values: number[] = []
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = i / Math.max(1, nx - 1), y = j / Math.max(1, ny - 1)
      let value = 0
      if (props.slug === 'lid-driven-cavity') {
        const r = Math.hypot(x - .55, y - .55)
        value = Math.max(0, 1 - r * 1.7) * (.45 + .55 * y)
        if (props.field === 'pressure') value = .5 + .45 * (x - y)
        if (props.field === 'vorticity') value = Math.max(0, 1 - r * 2.2)
      } else if (props.slug === 'pipe-flow') {
        value = Math.max(0, 1 - (2 * y - 1) ** 2)
        if (props.field === 'pressure') value = 1 - x
      } else if (props.slug === 'turbulence-compare') {
        value = Math.min(1, y / Math.max(.08, .12 + .35 * x))
      } else {
        const pe = Math.max(1, Math.abs(Number(props.params.velocity || 1) * Number(props.params.length || 1) / Number(props.params.diffusivity || .1)))
        value = pe > 40 ? Math.pow(x, 9) : (Math.exp(Math.min(pe, 20) * x) - 1) / (Math.exp(Math.min(pe, 20)) - 1)
      }
      values.push(value)
    }
  }
  return { nx, ny, values }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#7d4b2e') {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 7 * Math.cos(angle - .45), y2 - 7 * Math.sin(angle - .45))
  ctx.lineTo(x2 - 7 * Math.cos(angle + .45), y2 - 7 * Math.sin(angle + .45)); ctx.closePath(); ctx.fill()
}

function drawBoundary(ctx: CanvasRenderingContext2D, box: ReturnType<typeof domainBox>) {
  ctx.strokeStyle = '#332923'
  ctx.lineWidth = 2
  ctx.strokeRect(box.x, box.y, box.w, box.h)
  ctx.font = '11px MiSans, sans-serif'
  ctx.fillStyle = '#6f625a'
  if (props.slug === 'lid-driven-cavity') {
    ctx.strokeStyle = '#e65f18'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x + box.w, box.y); ctx.stroke()
    drawArrow(ctx, box.x + box.w * .35, box.y - 16, box.x + box.w * .64, box.y - 16, '#e65f18')
    ctx.fillText('移动壁面  Uₓ', box.x + box.w * .42, box.y - 24)
    ctx.fillText('无滑移壁面', box.x + 8, box.y + box.h + 20)
  } else if (props.slug === 'pipe-flow') {
    drawArrow(ctx, box.x - 36, box.y + box.h / 2, box.x - 8, box.y + box.h / 2, '#e65f18')
    ctx.fillText('入口', box.x - 34, box.y + box.h / 2 - 10)
    ctx.fillText('压力出口', box.x + box.w - 44, box.y + box.h + 20)
    ctx.setLineDash([5, 5]); ctx.strokeStyle = '#b9a89b'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h / 2); ctx.lineTo(box.x + box.w, box.y + box.h / 2); ctx.stroke(); ctx.setLineDash([])
  } else if (props.slug === 'turbulence-compare') {
    ctx.strokeStyle = '#e65f18'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke()
    drawArrow(ctx, box.x - 36, box.y + box.h * .35, box.x - 8, box.y + box.h * .35, '#e65f18')
    ctx.fillText('自由来流', box.x - 42, box.y + box.h * .35 - 10)
    ctx.fillText('壁面 / 边界层', box.x + box.w * .36, box.y + box.h + 20)
  } else {
    ctx.fillStyle = '#e65f18'; ctx.fillText(`φ = ${props.params.phi_left ?? 1}`, box.x - 48, box.y + box.h / 2)
    ctx.fillText(`φ = ${props.params.phi_right ?? 0}`, box.x + box.w + 10, box.y + box.h / 2)
    drawArrow(ctx, box.x + 24, box.y - 15, box.x + box.w * .3, box.y - 15)
  }
}

function drawGeometry(ctx: CanvasRenderingContext2D, box: ReturnType<typeof domainBox>) {
  const fill = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h)
  fill.addColorStop(0, '#fffaf6'); fill.addColorStop(1, '#f1e6dc')
  ctx.fillStyle = fill; ctx.fillRect(box.x, box.y, box.w, box.h)
  if (props.slug === 'turbulence-compare') {
    ctx.fillStyle = 'rgba(230,95,24,.10)'
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h)
    ctx.bezierCurveTo(box.x + box.w * .22, box.y + box.h * .84, box.x + box.w * .64, box.y + box.h * .46, box.x + box.w, box.y + box.h * .3)
    ctx.lineTo(box.x + box.w, box.y + box.h); ctx.closePath(); ctx.fill()
  }
  drawBoundary(ctx, box)
}

function drawMesh(ctx: CanvasRenderingContext2D, box: ReturnType<typeof domainBox>) {
  drawGeometry(ctx, box)
  const sourceNx = Number(props.params.nx || props.params.samples || 65)
  const sourceNy = Number(props.params.ny || props.params.layers || (props.slug === 'pipe-flow' ? 41 : 33))
  const cols = Math.max(8, Math.min(34, Math.round(Math.sqrt(sourceNx) * 2.6)))
  const rows = Math.max(5, Math.min(26, Math.round(Math.sqrt(sourceNy) * 2.4)))
  ctx.strokeStyle = 'rgba(92,69,54,.28)'; ctx.lineWidth = .65
  for (let i = 1; i < cols; i++) {
    const t = i / cols, x = box.x + box.w * t
    ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke()
  }
  for (let j = 1; j < rows; j++) {
    let t = j / rows
    if (props.slug === 'pipe-flow') t = .5 + Math.sign(t - .5) * Math.pow(Math.abs(t - .5) * 2, 1.5) / 2
    if (props.slug === 'turbulence-compare') t = 1 - Math.pow(1 - t, 1.9)
    const y = box.y + box.h * t
    ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke()
  }
  drawBoundary(ctx, box)
}

function drawSolution(ctx: CanvasRenderingContext2D, box: ReturnType<typeof domainBox>) {
  const fromResult = getField()
  const field = fromResult.values.length === fromResult.nx * fromResult.ny ? fromResult : sampleField(52, 36)
  const finite = field.values.filter(Number.isFinite)
  const min = Math.min(...finite), max = Math.max(...finite), span = max - min || 1
  const cellW = box.w / field.nx, cellH = box.h / field.ny
  for (let j = 0; j < field.ny; j++) {
    for (let i = 0; i < field.nx; i++) {
      const value = field.values[j * field.nx + i]
      ctx.fillStyle = palette((value - min) / span)
      ctx.fillRect(box.x + i * cellW, box.y + (field.ny - 1 - j) * cellH, cellW + .7, cellH + .7)
    }
  }
  if (props.showMesh) {
    ctx.strokeStyle = 'rgba(66,45,32,.12)'; ctx.lineWidth = .5
    const cols = 18, rows = 12
    for (let i = 1; i < cols; i++) { const x = box.x + box.w * i / cols; ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke() }
    for (let j = 1; j < rows; j++) { const y = box.y + box.h * j / rows; ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke() }
  }
  if (props.showVectors) drawVectors(ctx, box)
  drawBoundary(ctx, box)
  const gx = box.x + box.w + 24, gy = box.y, gh = box.h
  const gradient = ctx.createLinearGradient(0, gy + gh, 0, gy)
  for (let i = 0; i <= 4; i++) gradient.addColorStop(i / 4, palette(i / 4))
  ctx.fillStyle = gradient; ctx.fillRect(gx, gy, 12, gh)
  ctx.fillStyle = '#5f5148'; ctx.font = '10px JetBrains Mono, monospace'
  ctx.fillText(max.toPrecision(3), gx + 18, gy + 8)
  ctx.fillText(min.toPrecision(3), gx + 18, gy + gh)
  ctx.save(); ctx.translate(gx + 50, gy + gh / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(fieldLabel.value, 0, 0); ctx.restore()
}

function drawVectors(ctx: CanvasRenderingContext2D, box: ReturnType<typeof domainBox>) {
  const cols = props.slug === 'lid-driven-cavity' ? 8 : 10
  const rows = props.slug === 'lid-driven-cavity' ? 8 : 5
  for (let j = 1; j < rows; j++) {
    for (let i = 1; i < cols; i++) {
      const x = i / cols, y = j / rows
      let u = 1, v = 0
      if (props.slug === 'lid-driven-cavity') {
        const dx = x - .55, dy = y - .55
        u = -dy * 1.4 + .25 * y; v = dx * 1.4
      } else if (props.slug === 'pipe-flow') u = Math.max(.12, 1 - (2 * y - 1) ** 2)
      else if (props.slug === 'turbulence-compare') u = Math.min(1, y / (.12 + .32 * x))
      const scale = Math.min(box.w / cols, box.h / rows) * .42
      const px = box.x + box.w * x, py = box.y + box.h * (1 - y)
      drawArrow(ctx, px - u * scale * .4, py + v * scale * .4, px + u * scale * .4, py - v * scale * .4, 'rgba(75,45,29,.64)')
    }
  }
}

function render() {
  const el = canvas.value, wrapper = host.value
  if (!el || !wrapper) return
  const rect = wrapper.getBoundingClientRect()
  const width = Math.max(320, rect.width), height = Math.max(300, rect.height)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = width * dpr; el.height = height * dpr; el.style.width = `${width}px`; el.style.height = `${height}px`
  const ctx = el.getContext('2d'); if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#fbf7f3'; ctx.fillRect(0, 0, width, height)
  const box = domainBox(width, height)
  if (props.mode === 'mesh') drawMesh(ctx, box)
  else if (props.mode === 'solution') drawSolution(ctx, box)
  else drawGeometry(ctx, box)
}

function onMove(event: MouseEvent) {
  const rect = canvas.value?.getBoundingClientRect(); if (!rect) return
  const box = domainBox(rect.width, rect.height)
  const px = event.clientX - rect.left, py = event.clientY - rect.top
  cursor.visible = px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h
  if (!cursor.visible) return
  cursor.x = (px - box.x) / box.w
  cursor.y = 1 - (py - box.y) / box.h
  const field = getField()
  if (field.values.length === field.nx * field.ny) {
    const i = Math.min(field.nx - 1, Math.round(cursor.x * (field.nx - 1)))
    const j = Math.min(field.ny - 1, Math.round(cursor.y * (field.ny - 1)))
    cursor.value = field.values[j * field.nx + i]
  } else cursor.value = cursor.x * cursor.y
}

function downloadPng(name = 'flowlab-field.png') {
  if (!canvas.value) return
  const link = document.createElement('a'); link.download = name; link.href = canvas.value.toDataURL('image/png'); link.click()
}

watch(() => [props.slug, props.mode, props.field, props.params, props.result, props.showMesh, props.showVectors], render, { deep: true })
onMounted(() => { observer = new ResizeObserver(render); if (host.value) observer.observe(host.value); render() })
onBeforeUnmount(() => observer?.disconnect())
defineExpose({ downloadPng })
</script>

<template>
  <div ref="host" class="simulation-viewport" @mousemove="onMove" @mouseleave="cursor.visible=false">
    <canvas ref="canvas"></canvas>
    <div class="viewport-axis"><span>Y</span><i></i><b></b><span>X</span></div>
    <div v-if="cursor.visible" class="viewport-probe">
      <span>x {{ cursor.x.toFixed(3) }}</span><span>y {{ cursor.y.toFixed(3) }}</span>
      <strong v-if="mode==='solution'">{{ fieldLabel }} {{ cursor.value.toPrecision(4) }}</strong>
    </div>
  </div>
</template>
