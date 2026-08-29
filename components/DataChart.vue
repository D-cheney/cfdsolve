<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x?: number[]
  y: number[]
  y2?: number[]
  label?: string
  label2?: string
  log?: boolean
}>(), {
  x: () => [],
  y2: () => [],
  label: '数值结果',
  label2: '参考解',
  log: false
})

const width = 720
const height = 300
const pad = { l: 58, r: 22, t: 22, b: 46 }

interface PlotPoint {
  index: number
  x: number
  y: number
}

interface ChartDomain {
  min: number
  max: number
  dataMin: number
  dataMax: number
}

function transformedY(value: number) {
  if (!Number.isFinite(value)) return null
  return props.log ? Math.log10(Math.max(value, 1e-12)) : value
}

function pointAt(values: number[], index: number): PlotPoint | null {
  const x = props.x.length ? props.x[index] : index
  const y = transformedY(values[index])
  if (!Number.isFinite(x) || y === null || !Number.isFinite(y)) return null
  return { index, x, y }
}

function collectPoints(values: number[]) {
  const points: PlotPoint[] = []
  for (let index = 0; index < values.length; index++) {
    const point = pointAt(values, index)
    if (point) points.push(point)
  }
  return points
}

function createDomain(values: number[], paddingRatio: number): ChartDomain | null {
  if (!values.length) return null
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const span = dataMax - dataMin
  if (span === 0) {
    const padding = Math.max(Math.abs(dataMin) * 0.05, 1)
    return { min: dataMin - padding, max: dataMax + padding, dataMin, dataMax }
  }
  const padding = span * paddingRatio
  return { min: dataMin - padding, max: dataMax + padding, dataMin, dataMax }
}

function createTicks(domain: ChartDomain | null, count = 5) {
  if (!domain) return []
  if (domain.dataMin === domain.dataMax) return [domain.dataMin]
  return Array.from({ length: count }, (_, index) => domain.dataMin + (domain.dataMax - domain.dataMin) * index / (count - 1))
}

const primaryPoints = computed(() => collectPoints(props.y))
const secondaryPoints = computed(() => collectPoints(props.y2))
const allPoints = computed(() => [...primaryPoints.value, ...secondaryPoints.value])
const xDomain = computed(() => createDomain(allPoints.value.map(point => point.x), 0.02))
const yDomain = computed(() => createDomain(allPoints.value.map(point => point.y), 0.08))
const xTicks = computed(() => createTicks(xDomain.value))
const yTicks = computed(() => createTicks(yDomain.value))
const validPointCount = computed(() => allPoints.value.length)
const xAxisLabel = computed(() => props.x.length ? 'x 坐标' : '采样位置 / 迭代步')

function scaleX(value: number) {
  const domain = xDomain.value
  if (!domain) return pad.l
  return pad.l + (value - domain.min) / (domain.max - domain.min) * (width - pad.l - pad.r)
}

function scaleY(value: number) {
  const domain = yDomain.value
  if (!domain) return height - pad.b
  return pad.t + (domain.max - value) / (domain.max - domain.min) * (height - pad.t - pad.b)
}

function linePath(values: number[]) {
  let path = ''
  let drawing = false
  for (let index = 0; index < values.length; index++) {
    const point = pointAt(values, index)
    if (!point) {
      drawing = false
      continue
    }
    path += `${drawing ? 'L' : 'M'} ${scaleX(point.x).toFixed(2)} ${scaleY(point.y).toFixed(2)} `
    drawing = true
  }
  return path.trim()
}

function formatTick(value: number) {
  if (Math.abs(value) < 1e-12) return '0'
  const absolute = Math.abs(value)
  if (absolute >= 1e4 || absolute < 1e-3) return value.toExponential(2)
  return Number(value.toPrecision(4)).toString()
}
</script>

<template>
  <div class="chart-wrap" role="img" :aria-label="`${label}曲线图，共 ${validPointCount} 个有效点`">
    <svg viewBox="0 0 720 300" preserveAspectRatio="none" class="data-chart">
      <g class="chart-grid">
        <line v-for="tick in yTicks" :key="`grid-${tick}`" :x1="pad.l" :x2="width-pad.r" :y1="scaleY(tick)" :y2="scaleY(tick)" />
      </g>

      <line class="axis" :x1="pad.l" :x2="width-pad.r" :y1="height-pad.b" :y2="height-pad.b" />
      <line class="axis" :x1="pad.l" :x2="pad.l" :y1="pad.t" :y2="height-pad.b" />

      <g class="chart-ticks">
        <template v-for="tick in xTicks" :key="`x-${tick}`">
          <line class="chart-tick" :x1="scaleX(tick)" :x2="scaleX(tick)" :y1="height-pad.b" :y2="height-pad.b+5" />
          <text :x="scaleX(tick)" :y="height-pad.b+17" text-anchor="middle">{{ formatTick(tick) }}</text>
        </template>
        <template v-for="tick in yTicks" :key="`y-${tick}`">
          <line class="chart-tick" :x1="pad.l-5" :x2="pad.l" :y1="scaleY(tick)" :y2="scaleY(tick)" />
          <text :x="pad.l-8" :y="scaleY(tick)+3" text-anchor="end">{{ formatTick(tick) }}</text>
        </template>
      </g>

      <path v-if="secondaryPoints.length" class="chart-line secondary" :d="linePath(y2)" />
      <path v-if="primaryPoints.length" class="chart-line" :d="linePath(y)" />
      <circle v-if="primaryPoints.length === 1" class="chart-point" :cx="scaleX(primaryPoints[0].x)" :cy="scaleY(primaryPoints[0].y)" r="3.5" />
      <circle v-if="secondaryPoints.length === 1" class="chart-point secondary" :cx="scaleX(secondaryPoints[0].x)" :cy="scaleY(secondaryPoints[0].y)" r="3.5" />

      <text v-if="!validPointCount" class="chart-empty" x="386" y="142" text-anchor="middle">暂无有效数据</text>
      <text x="386" y="294" text-anchor="middle">{{ xAxisLabel }}</text>
      <text x="16" y="150" transform="rotate(-90 16 150)" text-anchor="middle">{{ log ? 'log₁₀(残差)' : '计算量' }}</text>
    </svg>
    <div class="chart-legend">
      <span><i></i>{{ label }}</span>
      <span v-if="secondaryPoints.length"><i class="secondary"></i>{{ label2 }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-tick{stroke:#9eabb5;stroke-width:1;vector-effect:non-scaling-stroke}
.chart-point{fill:var(--color-primary-600);vector-effect:non-scaling-stroke}
.chart-point.secondary{fill:var(--color-accent-500)}
.chart-empty{font-size:13px;fill:#788590}
</style>
