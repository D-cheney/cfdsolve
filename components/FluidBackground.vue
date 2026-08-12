<template>
  <div class="fluid-backdrop" aria-hidden="true">
    <span class="ambient-orb orb-one"></span>
    <span class="ambient-orb orb-two"></span>
    <span class="ambient-orb orb-three"></span>
  </div>
  <canvas ref="canvasEl" class="fluid-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
// 全站暖色流场背景：低密度粒子缓慢漂移，鼠标经过时只产生轻微扰动。
const canvasEl = ref(null)

let ctx = null
let W = 0
let H = 0
let raf = 0
let particles = []
let lastTs = 0
let running = false
let moveAccum = 0
let trail = []

const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, seen: false }

// 米金与暖橙，保持低透明度，避免影响正文阅读。
const PALETTE = [
  [230, 95, 24],
  [240, 138, 75],
  [206, 157, 113],
  [181, 139, 103],
  [225, 190, 158]
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
    r: 0.8 + Math.random() * 1.45,
    alpha: 0.045 + Math.random() * 0.1,
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
    if (particles.length > 170) particles.splice(0, particles.length - 170)
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

  // 鼠标移动形成柔和的暖橙流迹，约半秒内自然消散。
  if (trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1]
      const b = trail[i]
      const life = Math.min(a.life, b.life)
      ctx.strokeStyle = `rgba(230,95,24,${life * 0.2})`
      ctx.lineWidth = 2.4 + life * 9.6
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(a.x + a.vx * 1.6, a.y + a.vy * 1.6, b.x, b.y)
      ctx.stroke()
    }
  }
  trail.forEach(point => { point.life -= dt * 0.72 })
  trail = trail.filter(point => point.life > 0)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    // 流场漂移
    const ang = noise2(p.x * 0.0016, p.y * 0.0016 + t) * Math.PI * 4
    p.vx += Math.cos(ang) * 0.009 * dt * 60
    p.vy += Math.sin(ang) * 0.009 * dt * 60

    // 鼠标涡旋扰动
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d2 = dx * dx + dy * dy
    if (d2 < 260 * 260 && mouse.seen) {
      const d = Math.sqrt(d2) || 1
      const fall = 1 - d / 260
      const spd = Math.min(2.6, Math.hypot(mouse.vx, mouse.vy) * 0.18 + 0.5)
      p.vx += ((-dy / d) * 2.4 - (dx / d) * 0.5) * fall * spd * 0.045 * dt * 60
      p.vy += ((dx / d) * 2.4 - (dy / d) * 0.5) * fall * spd * 0.045 * dt * 60
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
    ctx.lineWidth = p.r
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()

    ctx.fillStyle = `rgba(${Math.min(255, r + 42)},${Math.min(255, g + 42)},${Math.min(255, b + 42)},${Math.min(0.18, p.alpha * 1.25)})`
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
  const count = Math.round(Math.min(105, Math.max(52, (W * H) / 19000)))
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
  const point = e.touches?.[0] || e
  const x = point.clientX
  const y = point.clientY
  if (!Number.isFinite(x) || !Number.isFinite(y)) return
  if (mouse.seen) {
    mouse.vx = (mouse.vx + (x - mouse.px)) * 0.5
    mouse.vy = (mouse.vy + (y - mouse.py)) * 0.5
    // 移动超过阈值才迸发粒子，避免疯狂生成
    moveAccum += Math.abs(x - mouse.px) + Math.abs(y - mouse.py)
    if (moveAccum > 20) {
      spawnBurst(x, y, Math.hypot(mouse.vx, mouse.vy))
      moveAccum = 0
    }
  }
  mouse.x = x
  mouse.y = y
  trail.push({ x, y, vx: mouse.vx, vy: mouse.vy, life: 1 })
  if (trail.length > 56) trail.splice(0, trail.length - 56)
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
.fluid-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: #fcfaf8;
}
.fluid-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 135;
  pointer-events: none;
  opacity: 0.82;
  mix-blend-mode: multiply;
}
.ambient-orb {
  position: absolute;
  display: block;
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.34;
  will-change: transform;
}
.orb-one {
  width: 42vw;
  height: 42vw;
  top: -20vw;
  right: -10vw;
  background: radial-gradient(circle, rgba(255, 163, 99, 0.24), transparent 68%);
  animation: orb-one 22s ease-in-out infinite alternate;
}
.orb-two {
  width: 38vw;
  height: 38vw;
  left: -16vw;
  top: 32vh;
  background: radial-gradient(circle, rgba(215, 175, 137, 0.2), transparent 68%);
  animation: orb-two 28s ease-in-out infinite alternate;
}
.orb-three {
  width: 30vw;
  height: 30vw;
  right: 18vw;
  bottom: -17vw;
  background: radial-gradient(circle, rgba(240, 138, 75, 0.14), transparent 68%);
  animation: orb-three 25s ease-in-out infinite alternate;
}
@keyframes orb-one {
  to { transform: translate3d(-8vw, 9vh, 0) scale(1.12); }
}
@keyframes orb-two {
  to { transform: translate3d(11vw, -8vh, 0) scale(0.9); }
}
@keyframes orb-three {
  to { transform: translate3d(-6vw, -10vh, 0) scale(1.15); }
}
@media (prefers-reduced-motion: reduce) {
  .fluid-canvas { display: none; }
  .ambient-orb { animation: none; }
}
</style>
