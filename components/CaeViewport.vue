<script setup lang="ts">
const props = defineProps<{ kind: string; stage: string; params: Record<string, number>; result?: Record<string, any> | null }>()
const canvas = ref<HTMLCanvasElement | null>(null)
const host = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined

function color(t: number) {
  const value = Math.max(0, Math.min(1, t))
  const a = [248, 229, 211], b = [218, 85, 28]
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * value)).join(',')})`
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, length: number) {
  ctx.strokeStyle = '#d95318'; ctx.fillStyle = '#d95318'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x, y - length); ctx.lineTo(x, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y - 10); ctx.lineTo(x + 6, y - 10); ctx.closePath(); ctx.fill()
}

function render() {
  const el = canvas.value, wrapper = host.value
  if (!el || !wrapper) return
  const rect = wrapper.getBoundingClientRect(), w = Math.max(320, rect.width), h = Math.max(300, rect.height)
  const dpr = Math.min(devicePixelRatio || 1, 2); el.width = w * dpr; el.height = h * dpr; el.style.width = `${w}px`; el.style.height = `${h}px`
  const ctx = el.getContext('2d'); if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h)
  const grad = ctx.createLinearGradient(0, 0, w, h); grad.addColorStop(0, '#fffaf6'); grad.addColorStop(1, '#f1e7df'); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  ctx.font = '11px MiSans, sans-serif'; ctx.fillStyle = '#6d5d54'
  if (props.kind === 'heat-plate') drawHeat(ctx, w, h)
  else if (props.kind === 'sdof-modal') drawModal(ctx, w, h)
  else drawStructure(ctx, w, h)
}

function drawStructure(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const left = 86, right = w - 80, cy = h * .52, elements = Math.max(1, Math.round(props.params.elements || 8))
  const isBeam = props.kind === 'cantilever-beam', solved = props.stage === 'results' && props.result?.data
  ctx.fillStyle = '#5d5049'; ctx.fillRect(left - 8, cy - 54, 8, 108)
  ctx.strokeStyle = 'rgba(91,75,65,.25)'; for (let y = cy - 54; y < cy + 54; y += 10) { ctx.beginPath(); ctx.moveTo(left - 22, y + 10); ctx.lineTo(left - 8, y); ctx.stroke() }
  ctx.lineWidth = 7; ctx.strokeStyle = '#7f6c60'; ctx.beginPath(); ctx.moveTo(left, cy)
  for (let i = 0; i <= 70; i++) {
    const x = left + (right - left) * i / 70
    const y = solved && isBeam ? cy + Number(props.result?.data?.tipDeflection || 0) / Math.max(1e-12, Math.abs(Number(props.result?.data?.tipDeflection || 1))) * 58 * (i / 70) ** 2 : cy
    ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.strokeStyle = 'rgba(230,95,24,.38)'; ctx.lineWidth = 1
  for (let i = 0; i <= Math.min(24, elements); i++) { const x = left + (right - left) * i / Math.min(24, elements); ctx.beginPath(); ctx.moveTo(x, cy - 22); ctx.lineTo(x, cy + 22); ctx.stroke() }
  if (isBeam) drawArrow(ctx, right, cy - 2, 78)
  else { ctx.strokeStyle = '#d95318'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(right, cy); ctx.lineTo(right + 44, cy); ctx.stroke(); ctx.fillStyle = '#d95318'; ctx.beginPath(); ctx.moveTo(right + 44, cy); ctx.lineTo(right + 31, cy - 7); ctx.lineTo(right + 31, cy + 7); ctx.fill() }
  ctx.fillStyle = '#6d5d54'; ctx.fillText(isBeam ? '固定端' : 'u = 0', left - 30, cy + 78); ctx.fillText(isBeam ? '端部载荷' : '轴向载荷', right - 24, cy - 68)
}

function drawHeat(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x0 = 84, y0 = 48, bw = w - 168, bh = h - 96, nx = 34, ny = 22
  const data = props.result?.data, values: number[] = data?.temperature || []
  const min = values.length ? Math.min(...values) : Number(props.params.rightTemperature || 293.15)
  const max = values.length ? Math.max(...values) : Number(props.params.leftTemperature || 373.15)
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const sourceI = data ? Math.round(i / (nx - 1) * (data.nx - 1)) : i
    const sourceJ = data ? Math.round(j / (ny - 1) * (data.ny - 1)) : j
    const value = data ? values[sourceJ * data.nx + sourceI] : max + (min - max) * i / (nx - 1)
    ctx.fillStyle = color((value - min) / Math.max(1e-9, max - min)); ctx.fillRect(x0 + i * bw / nx, y0 + (ny - 1 - j) * bh / ny, bw / nx + .6, bh / ny + .6)
  }
  ctx.strokeStyle = '#5d5049'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, bw, bh)
  ctx.fillStyle = '#6d5d54'; ctx.fillText(`${max.toFixed(1)} K`, x0 - 10, y0 - 14); ctx.fillText(`${min.toFixed(1)} K`, x0 + bw - 32, y0 + bh + 24)
}

function drawModal(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2, top = 45, massY = h * .58
  ctx.fillStyle = '#63564f'; ctx.fillRect(cx - 80, top, 160, 8)
  ctx.strokeStyle = '#d75d20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, top + 8)
  for (let i = 0; i < 9; i++) { const y = top + 22 + i * (massY - top - 45) / 9; ctx.lineTo(cx + (i % 2 ? -22 : 22), y) }
  ctx.lineTo(cx, massY); ctx.stroke(); ctx.fillStyle = '#8a7568'; ctx.fillRect(cx - 58, massY, 116, 66)
  ctx.fillStyle = '#fff'; ctx.font = '600 15px MiSans'; ctx.fillText('m', cx - 6, massY + 39)
  if (props.result?.data?.modes?.[0]) { const mode = props.result.data.modes[0]; ctx.fillStyle = '#6d5d54'; ctx.font = '12px MiSans'; ctx.fillText(`f₁ = ${Number(mode.frequency).toFixed(4)} Hz`, cx - 54, massY + 96) }
}

watch(() => [props.kind, props.stage, props.params, props.result], render, { deep: true })
onMounted(() => { observer = new ResizeObserver(render); if (host.value) observer.observe(host.value); render() })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template><div ref="host" class="cae-viewport"><canvas ref="canvas"></canvas><span class="cae-viewport-badge">{{stage==='results'?'RESULT FIELD':stage.toUpperCase()}}</span></div></template>
