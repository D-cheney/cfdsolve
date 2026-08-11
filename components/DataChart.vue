<script setup lang="ts">
const props = withDefaults(defineProps<{ x?: number[]; y: number[]; y2?: number[]; label?: string; label2?: string; log?: boolean }>(), { x: () => [], y2: () => [], label: '数值结果', label2: '参考解', log: false })
const width = 720, height = 300, pad = { l: 54, r: 20, t: 22, b: 42 }
function line(values: number[]) {
  if (!values.length) return ''
  const ys = values.map(v => props.log ? Math.log10(Math.max(v, 1e-12)) : v)
  const all = [...props.y, ...props.y2].map(v => props.log ? Math.log10(Math.max(v, 1e-12)) : v)
  const min = Math.min(...all), max = Math.max(...all), range = max - min || 1
  return ys.map((v, i) => `${i ? 'L' : 'M'} ${(pad.l + i * (width-pad.l-pad.r)/(values.length-1 || 1)).toFixed(1)} ${(pad.t + (max-v)/range*(height-pad.t-pad.b)).toFixed(1)}`).join(' ')
}
const grid = [0, .25, .5, .75, 1]
</script>
<template>
  <div class="chart-wrap" role="img" :aria-label="`${label}曲线图，共 ${y.length} 个点`">
    <svg viewBox="0 0 720 300" preserveAspectRatio="none" class="data-chart">
      <g class="chart-grid"><line v-for="g in grid" :key="g" :x1="pad.l" :x2="width-pad.r" :y1="pad.t+g*(height-pad.t-pad.b)" :y2="pad.t+g*(height-pad.t-pad.b)" /></g>
      <line class="axis" :x1="pad.l" :x2="width-pad.r" :y1="height-pad.b" :y2="height-pad.b"/><line class="axis" :x1="pad.l" :x2="pad.l" :y1="pad.t" :y2="height-pad.b"/>
      <path class="chart-line secondary" v-if="y2?.length" :d="line(y2)"/><path class="chart-line" :d="line(y)"/>
      <text x="360" y="290" text-anchor="middle">采样位置 / 迭代步</text><text x="16" y="150" transform="rotate(-90 16 150)" text-anchor="middle">{{ log ? 'log₁₀(残差)' : '计算量' }}</text>
    </svg>
    <div class="chart-legend"><span><i></i>{{ label }}</span><span v-if="y2?.length"><i class="secondary"></i>{{ label2 }}</span></div>
  </div>
</template>
