<script setup lang="ts">
const props = withDefaults(defineProps<{ x?: number[]; y: number[]; y2?: number[]; label?: string; label2?: string; log?: boolean }>(), { x: () => [], y2: () => [], label: '数值结果', label2: '参考解', log: false })
const width = 720, height = 300, pad = { l: 54, r: 20, t: 22, b: 42 }

type PlotPoint = { x: number; y: number }

const hasExplicitX = computed(() => props.x.length > 0)

function points(values: number[]): PlotPoint[] {
  const count = hasExplicitX.value ? Math.min(values.length, props.x.length) : values.length
  const result: PlotPoint[] = []
  for (let index = 0; index < count; index++) {
    const x = hasExplicitX.value ? Number(props.x[index]) : index
    const y = Number(values[index])
    if (!Number.isFinite(x) || !Number.isFinite(y) || (props.log && y <= 0)) continue
    result.push({ x, y: props.log ? Math.log10(y) : y })
  }
  return result
}

const domain = computed(() => {
  const all = [...points(props.y), ...points(props.y2)]
  if (!all.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  const xs = all.map(point => point.x), ys = all.map(point => point.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  return {
    minX,
    maxX: maxX === minX ? minX + 1 : maxX,
    minY,
    maxY: maxY === minY ? minY + 1 : maxY
  }
})

function line(values: number[]) {
  if (!values.length) return ''
  const { minX, maxX, minY, maxY } = domain.value
  const count = hasExplicitX.value ? Math.min(values.length, props.x.length) : values.length
  let drawing = false
  const commands: string[] = []
  for (let index = 0; index < count; index++) {
    const rawX = hasExplicitX.value ? Number(props.x[index]) : index
    const rawY = Number(values[index])
    if (!Number.isFinite(rawX) || !Number.isFinite(rawY) || (props.log && rawY <= 0)) {
      drawing = false
      continue
    }
    const y = props.log ? Math.log10(rawY) : rawY
    const plotX = pad.l + (rawX - minX) / (maxX - minX) * (width - pad.l - pad.r)
    const plotY = pad.t + (maxY - y) / (maxY - minY) * (height - pad.t - pad.b)
    commands.push(`${drawing ? 'L' : 'M'} ${plotX.toFixed(1)} ${plotY.toFixed(1)}`)
    drawing = true
  }
  return commands.join(' ')
}

function axisValue(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) >= 1e4 || (Math.abs(value) > 0 && Math.abs(value) < 1e-3)) return value.toExponential(2)
  return Number(value.toPrecision(4)).toString()
}

const validPointCount = computed(() => points(props.y).length)
const grid = [0, .25, .5, .75, 1]
</script>
<template>
  <div class="chart-wrap" role="img" :aria-label="`${label}曲线图，共 ${validPointCount} 个有效点`">
    <svg viewBox="0 0 720 300" preserveAspectRatio="none" class="data-chart">
      <g class="chart-grid"><line v-for="g in grid" :key="g" :x1="pad.l" :x2="width-pad.r" :y1="pad.t+g*(height-pad.t-pad.b)" :y2="pad.t+g*(height-pad.t-pad.b)" /></g>
      <line class="axis" :x1="pad.l" :x2="width-pad.r" :y1="height-pad.b" :y2="height-pad.b"/><line class="axis" :x1="pad.l" :x2="pad.l" :y1="pad.t" :y2="height-pad.b"/>
      <path class="chart-line secondary" v-if="y2?.length" :d="line(y2)"/><path class="chart-line" :d="line(y)"/>
      <text :x="pad.l" y="274" text-anchor="start">{{ axisValue(domain.minX) }}</text><text :x="width-pad.r" y="274" text-anchor="end">{{ axisValue(domain.maxX) }}</text>
      <text x="360" y="290" text-anchor="middle">横坐标 / 时间 / 迭代步</text><text x="16" y="150" transform="rotate(-90 16 150)" text-anchor="middle">{{ log ? 'log₁₀(残差)' : '计算量' }}</text>
    </svg>
    <div class="chart-legend"><span><i></i>{{ label }}</span><span v-if="y2?.length"><i class="secondary"></i>{{ label2 }}</span></div>
  </div>
</template>
