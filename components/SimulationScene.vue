<script setup lang="ts">
const props = withDefaults(defineProps<{
  slug: string
  result?: Record<string, any> | null
  params?: Record<string, string | number>
}>(), { result: null, params: () => ({}) })

const field = computed(() => props.result?.field as { nx: number; ny: number; u: number[]; v: number[]; speed: number[] } | undefined)
const maxSpeed = computed(() => Math.max(...(field.value?.speed || [1]), 1e-9))
const cavityCells = computed(() => {
  if (!field.value) return []
  const { nx, ny, speed } = field.value
  return speed.map((value, index) => ({
    x: 86 + (index % nx) * 500 / nx,
    y: 42 + Math.floor(index / nx) * 320 / ny,
    width: 500 / nx + .7,
    height: 320 / ny + .7,
    value: Math.min(1, value / maxSpeed.value),
  }))
})
const cavityVectors = computed(() => {
  if (!field.value) return []
  const { nx, ny, u, v } = field.value
  const vectors = []
  for (let j = 1; j < ny - 1; j += 3) for (let i = 1; i < nx - 1; i += 3) {
    const index = j * nx + i
    const magnitude = Math.hypot(u[index], v[index])
    const scale = magnitude ? Math.min(20, 9 + magnitude * 28) / magnitude : 0
    const x = 86 + (i + .5) * 500 / nx
    const y = 42 + (ny - j - .5) * 320 / ny
    vectors.push({ x, y, x2: x + u[index] * scale, y2: y - v[index] * scale })
  }
  return vectors
})
const profilePath = computed(() => {
  const values = props.result?.series as number[] | undefined
  const normalized = values?.length ? values.map(value => value / Math.max(...values, 1e-12)) : Array.from({ length: 25 }, (_, index) => 1 - (index / 24) ** 2)
  const upper = normalized.map((value, index) => `${230 + value * 260},${205 - index * 145 / (normalized.length - 1)}`)
  const lower = normalized.slice(1).reverse().map((value, reverseIndex) => `${230 + value * 260},${205 + (normalized.length - 1 - reverseIndex) * 145 / (normalized.length - 1)}`)
  return `M ${upper.join(' L ')} L ${lower.join(' L ')}`
})
const layerHeights = computed(() => {
  const count = Math.min(18, Math.max(6, Number(props.params.layers || 12)))
  const growth = Number(props.params.growth_rate || 1.2)
  const raw = Array.from({ length: count }, (_, index) => growth ** index)
  const total = raw.reduce((sum, value) => sum + value, 0)
  let y = 330
  return raw.map((value, index) => {
    const height = value / total * 245
    y -= height
    return { y, height, index }
  })
})
</script>

<template>
  <div class="simulation-scene" :class="`scene-${slug}`">
    <header><span>计算域</span><small>{{ result ? '当前工况结果' : '模型与边界预览' }}</small></header>
    <svg v-if="slug === 'lid-driven-cavity'" viewBox="0 0 680 410" role="img" aria-label="方腔速度场">
      <defs>
        <marker id="scene-arrow-blue" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#0877bd" /></marker>
        <linearGradient id="cavity-empty" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f3f6f8"/><stop offset="1" stop-color="#dceefa"/></linearGradient>
      </defs>
      <rect x="86" y="42" width="500" height="320" rx="4" :fill="field ? '#edf4f8' : 'url(#cavity-empty)'" stroke="#7e929f" stroke-width="2" />
      <rect v-for="(cell, index) in cavityCells" :key="index" :x="cell.x" :y="402-cell.y-cell.height" :width="cell.width" :height="cell.height" :fill="`hsl(${205 - cell.value * 175} 72% ${96 - cell.value * 48}%)`" opacity=".86" />
      <line v-for="(vector, index) in cavityVectors" :key="`v-${index}`" :x1="vector.x" :y1="vector.y" :x2="vector.x2" :y2="vector.y2" stroke="#075b8d" stroke-width="1.4" opacity=".72" marker-end="url(#scene-arrow-blue)" />
      <path v-if="!field" d="M160 120 C300 65 510 100 520 205 C530 305 350 345 215 285 C115 240 120 160 220 135" fill="none" stroke="#71a8c7" stroke-width="3" stroke-dasharray="7 7" />
      <line x1="106" y1="25" x2="560" y2="25" stroke="#0877bd" stroke-width="4" marker-end="url(#scene-arrow-blue)" />
      <text x="330" y="17">移动顶盖 U</text><text x="22" y="210" transform="rotate(-90 22 210)">无滑移壁面</text>
      <circle v-if="result" :cx="86 + Number(result.vortexX) * 500" :cy="362 - Number(result.vortexY) * 320" r="7" fill="none" stroke="#ef7f45" stroke-width="3" />
    </svg>

    <svg v-else-if="slug === 'pipe-flow'" viewBox="0 0 680 410" role="img" aria-label="圆管层流速度剖面">
      <defs><marker id="scene-arrow-orange" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#ef7f45" /></marker><linearGradient id="pipe-fill" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#edf6fb"/><stop offset="1" stop-color="#a9d6ef"/></linearGradient></defs>
      <path d="M70 58 H610 M70 352 H610" stroke="#718894" stroke-width="5" />
      <rect x="72" y="61" width="536" height="288" fill="url(#pipe-fill)" opacity=".55" />
      <path :d="profilePath" fill="rgba(8,119,189,.16)" stroke="#0877bd" stroke-width="4" />
      <line x1="230" y1="205" x2="540" y2="205" stroke="#ef7f45" stroke-width="3" marker-end="url(#scene-arrow-orange)" />
      <line x1="230" y1="58" x2="230" y2="352" stroke="#78909c" stroke-dasharray="5 5" />
      <text x="305" y="188">中心线最大速度</text><text x="82" y="48">充分发展入口</text><text x="535" y="378">r = R</text>
    </svg>

    <svg v-else-if="slug === 'convection-diffusion'" viewBox="0 0 680 410" role="img" aria-label="一维对流扩散计算域">
      <defs><marker id="scene-arrow-flow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0877bd" /></marker><linearGradient id="scalar-field" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ef7f45"/><stop offset=".55" stop-color="#d7eaf5"/><stop offset="1" stop-color="#0877bd"/></linearGradient></defs>
      <rect x="70" y="145" width="540" height="120" rx="5" fill="url(#scalar-field)" stroke="#6d8592" stroke-width="2" />
      <g stroke="rgba(255,255,255,.7)"><line v-for="n in 20" :key="n" :x1="70+n*540/21" :x2="70+n*540/21" y1="145" y2="265" /></g>
      <line x1="110" y1="110" x2="565" y2="110" stroke="#0877bd" stroke-width="4" marker-end="url(#scene-arrow-flow)" />
      <text x="315" y="92">对流速度 u</text><text x="55" y="290">φL</text><text x="595" y="290">φR</text><text x="300" y="330">L · 结构化一维网格</text>
    </svg>

    <svg v-else viewBox="0 0 680 410" role="img" aria-label="近壁层网格分布">
      <defs><linearGradient id="boundary-field" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#d9edf8"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
      <rect x="70" y="70" width="540" height="270" fill="url(#boundary-field)" />
      <rect x="70" y="330" width="540" height="12" fill="#526a78" />
      <rect v-for="layer in layerHeights" :key="layer.index" x="70" :y="layer.y" width="540" :height="layer.height" fill="none" stroke="#5a9fc7" stroke-width="1" />
      <path d="M95 325 C175 250 285 185 575 105" fill="none" stroke="#ef7f45" stroke-width="4" />
      <text x="82" y="365">壁面 y = 0</text><text x="430" y="92">速度边界层</text><text x="88" y="320">首层高度 Δy₁</text>
    </svg>
    <footer><span><i></i>数值场 / 剖面</span><span><i class="accent"></i>边界与关键量</span></footer>
  </div>
</template>

<style scoped>
.simulation-scene{min-width:0;border:1px solid #dce4e9;border-radius:12px;background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(245,249,251,.9));box-shadow:0 16px 38px rgba(34,63,78,.08);overflow:hidden}
.simulation-scene header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e2e8ec}.simulation-scene header span{font-size:12px;font-weight:700;letter-spacing:.08em}.simulation-scene header small{color:#71818b;font-size:10px}.simulation-scene svg{display:block;width:100%;height:auto;max-height:430px}.simulation-scene text{font:12px var(--font-sans);fill:#49606d}.simulation-scene footer{display:flex;justify-content:center;gap:18px;padding:9px;border-top:1px solid #e2e8ec;color:#60727d;font-size:10px}.simulation-scene footer span{display:flex;align-items:center;gap:6px}.simulation-scene footer i{width:18px;border-top:2px solid #0877bd}.simulation-scene footer i.accent{border-color:#ef7f45}
@media(max-width:560px){.simulation-scene header{padding:10px 12px}.simulation-scene svg{min-height:260px}.simulation-scene footer{justify-content:flex-start;overflow:auto}}
</style>
