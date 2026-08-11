<template>
  <canvas ref="canvasEl" class="fluid-bg" aria-hidden="true"></canvas>
</template>

<script setup>
// 全站鼠标跟随流体背景：粒子在噪声流场中漂移，沿速度方向绘制流线笔触，
// 鼠标划过产生涡旋扰动与粒子迸发。每帧清空画布，不残留任何覆盖色膜。
const canvasEl = ref(null)

let ctx = null
let W = 0
let H = 0
let raf = 0
let particles = []
let lastTs = 0
let running = false
let moveAccum = 0

const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, seen: false }

// 蓝灰为主的柔和配色（与站点品牌色一致），少量淡青点缀
const PALETTE = [
  [23, 105, 170], // 品牌蓝
  [64, 132, 186],
  [128, 158, 186], // 灰蓝
  [90, 148, 160], // 淡青
  [150, 172, 194]
]

// —— 简单值噪声（确定性，无外部依赖）——
function hash2(x, y) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return (h >>> 0) / 4294967295
}
function smooth(t) {
  return t * t * (3 - 2 * t)
}
function noise2(x, y) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const a = hash2(x0, y0)
  const b = hash2(x0 + 1, y0)
  const c = hash2(x0, y0 + 1)
  const d = hash2(x0 + 1, y0 + 1)
  const ux = smooth(fx)
  const uy = smooth(fy)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function makeParticle(randomize) {
  const base = PALETTE[(Math.random() * PALETTE.length) | 0]
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: 0,
    vy: 0,
    r: 1.2 + Math.random() * 2,
    alpha: 0.12 + Math.random() * 0.24,
    hue: base
  }
}

function spawnBurst(x, y, power) {
  const n = 2
  for (let i = 0; i < n; i++) {
    const p = makeParticle(true)
    p.x = x + (Math.random() - 0.5) * 16
    p.y = y + (Math.random() - 0.5) * 16
    const ang = Math.random() * Math.PI * 2
    const sp = (0.5 + Math.random() * 1.1) * Math.min(1.4, power / 5 + 0.35)
    p.vx = Math.cos(ang) * sp
    p.vy = Math.sin(ang) * sp
    particles.push(p)
    if (particles.length > 220) particles.splice(0, particles.length - 220)
  }
}

function step(now) {
  if (!running) return
  const dt = Math.min(0.05, (now - lastTs) / 1000 || 0.016)
  lastTs = now
  const t = now * 0.00011

  // 每帧完全清空画布 —— 不叠加任何颜色膜，页面始终通透
  ctx.clearRect(0, 0, W, H)

  // 鼠标惯性衰减
  mouse.vx *= 0.9
  mouse.vy *= 0.9

  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    // 流场漂移
    const ang = noise2(p.x * 0.0016, p.y * 0.0016 + t) * Math.PI * 4
    p.vx += Math.cos(ang) * 0.014 * dt * 60
    p.vy += Math.sin(ang) * 0.014 * dt * 60

    // 鼠标涡旋扰动
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d2 = dx * dx + dy * dy
    if (d2 < 260 * 260 && mouse.seen) {
      const d = Math.sqrt(d2) || 1
      const fall = 1 - d / 260
      const spd = Math.min(2.6, Math.hypot(mouse.vx, mouse.vy) * 0.18 + 0.5)
      p.vx += ((-dy / d) * 3.4 - (dx / d) * 0.7) * fall * spd * 0.075 * dt * 60
      p.vy += ((dx / d) * 3.4 - (dy / d) * 0.7) * fall * spd * 0.075 * dt * 60
    }

    // 阻尼与位移
    p.vx *= 0.962
    p.vy *= 0.962
    p.x += p.vx * dt * 60
    p.y += p.vy * dt * 60

    // 边界环绕
    if (p.x < -30) p.x = W + 30
    else if (p.x > W + 30) p.x = -30
    if (p.y < -30) p.y = H + 30
    else if (p.y > H + 30) p.y = -30

    // 流线笔触：沿速度方向画短线（拖出流动感），头部加亮斑
    const [r, g, b] = p.hue
    const sx = p.x - p.vx * 2.4
    const sy = p.y - p.vy * 2.4
    ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.8})`
    ctx.lineWidth = p.r * 1.4
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()

    ctx.fillStyle = `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)},${Math.min(0.55, p.alpha * 1.5)})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  raf = requestAnimationFrame(step)
}

function init() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  const count = Math.round(Math.min(180, Math.max(90, (W * H) / 11000)))
  particles = []
  for (let i = 0; i < count; i++) particles.push(makeParticle(false))
  running = true
  lastTs = performance.now()
  raf = requestAnimationFrame(step)
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  W = window.innerWidth
  H = window.innerHeight
  const canvas = canvasEl.value
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  ctx && ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function onMove(e) {
  const x = e.clientX
  const y = e.clientY
  if (mouse.seen) {
    mouse.vx = (mouse.vx + (x - mouse.px)) * 0.5
    mouse.vy = (mouse.vy + (y - mouse.py)) * 0.5
    // 移动超过阈值才迸发粒子，避免疯狂生成
    moveAccum += Math.abs(x - mouse.px) + Math.abs(y - mouse.py)
    if (moveAccum > 14) {
      spawnBurst(x, y, Math.hypot(mouse.vx, mouse.vy))
      moveAccum = 0
    }
  }
  mouse.x = x
  mouse.y = y
  mouse.px = x
  mouse.py = y
  mouse.seen = true
}

function onLeave() {
  mouse.seen = false
  mouse.x = -9999
  mouse.y = -9999
}

function onVisibility() {
  if (document.hidden) {
    running = false
    cancelAnimationFrame(raf)
  } else if (!running && ctx) {
    running = true
    lastTs = performance.now()
    raf = requestAnimationFrame(step)
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  init()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('touchmove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.fluid-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 140;
  pointer-events: none;
  opacity: 0.6;
}
@media (prefers-reduced-motion: reduce) {
  .fluid-bg {
    display: none;
  }
}
</style>
