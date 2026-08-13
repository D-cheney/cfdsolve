<template>
  <div ref="backdropEl" class="fluid-backdrop" aria-hidden="true">
    <span class="ambient-mesh"></span>
    <span class="flow-ribbon ribbon-one"></span>
    <span class="flow-ribbon ribbon-two"></span>
    <span class="flow-ribbon ribbon-three"></span>
    <span class="ambient-orb orb-one"></span>
    <span class="ambient-orb orb-two"></span>
    <span class="ambient-orb orb-three"></span>
    <span class="ambient-grain"></span>
  </div>
  <canvas ref="canvasEl" class="fluid-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
// 全站暖色流场：背景持续循环；鼠标形成多层流光、星屑与扩散涟漪。
const canvasEl = ref(null)
const backdropEl = ref(null)

let ctx = null
let W = 0
let H = 0
let raf = 0
let particles = []
let ripples = []
let trail = []
let lastTs = 0
let running = false
let rippleCooldown = 0

const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, seen: false }
const field = { x: 0, y: 0, targetX: 0, targetY: 0, energy: 0, targetEnergy: 0 }
const PALETTE = [
  [230, 95, 24],
  [255, 135, 66],
  [255, 181, 106],
  [197, 118, 72],
  [239, 198, 150]
]

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

function makeParticle() {
  const hue = PALETTE[(Math.random() * PALETTE.length) | 0]
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: 0,
    vy: 0,
    r: 0.65 + Math.random() * 1.5,
    alpha: 0.035 + Math.random() * 0.085,
    hue
  }
}

function drawAmbientFlow(now, dt) {
  const time = now * 0.00018
  field.x += (field.targetX - field.x) * Math.min(1, dt * 3.8)
  field.y += (field.targetY - field.y) * Math.min(1, dt * 3.8)
  field.energy += (field.targetEnergy - field.energy) * Math.min(1, dt * 7)
  field.targetEnergy *= Math.pow(0.965, dt * 60)

  const backdrop = backdropEl.value
  if (backdrop) {
    backdrop.style.setProperty('--flow-x', `${(field.x / Math.max(1, W) - 0.5) * 64}px`)
    backdrop.style.setProperty('--flow-y', `${(field.y / Math.max(1, H) - 0.5) * 44}px`)
    backdrop.style.setProperty('--flow-energy', String(field.energy))
    backdrop.style.setProperty('--cursor-x', `${field.x}px`)
    backdrop.style.setProperty('--cursor-y', `${field.y}px`)
  }

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const lineCount = W < 720 ? 8 : 14
  const gap = H / (lineCount - 1)
  for (let line = 0; line < lineCount; line++) {
    const baseY = line * gap
    const phase = line * 0.78 + time * (0.72 + (line % 3) * 0.09)
    const points = []

    for (let x = -50; x <= W + 50; x += 34) {
      const wave = Math.sin(x * 0.0056 + phase) * (18 + line % 4 * 4)
      const secondary = Math.sin(x * 0.0021 - time * 0.86 + line * 1.3) * 21
      const noise = (noise2(x * 0.0022 + time, line * 0.23 + time * 0.35) - 0.5) * 34
      let y = baseY + wave + secondary + noise

      // 鼠标像在流体中划动：局部流线被推开并形成可持续一小段时间的旋涡。
      const dx = x - field.x
      const dy = y - field.y
      const distance = Math.hypot(dx, dy)
      if (distance < 330 && field.energy > 0.01) {
        const influence = (1 - distance / 330) ** 2 * field.energy
        const direction = Math.atan2(dy, dx)
        y += Math.sin(direction + time * 3.2) * 82 * influence
        y += mouse.vy * 1.7 * influence
      }
      points.push({ x, y })
    }

    const alpha = 0.09 + (line % 3) * 0.018 + field.energy * 0.03
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i]
      const next = points[i + 1]
      ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2)
    }
    ctx.strokeStyle = `rgba(187,108,61,${alpha})`
    ctx.lineWidth = 1.15 + (line % 2) * 0.45
    ctx.stroke()

    if (line % 3 === 0) {
      ctx.strokeStyle = `rgba(239,137,69,${alpha * 0.58})`
      ctx.lineWidth = 10 + field.energy * 6
      ctx.filter = 'blur(7px)'
      ctx.stroke()
      ctx.filter = 'none'
    }
  }

  // 一个常驻缓慢移动的流场核心，使不操作鼠标时页面也明显处于运动中。
  const coreX = W * (0.52 + Math.sin(time * 0.52) * 0.2)
  const coreY = H * (0.48 + Math.cos(time * 0.43) * 0.22)
  const core = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, Math.min(W, H) * 0.32)
  core.addColorStop(0, `rgba(242,137,70,${0.09 + field.energy * 0.03})`)
  core.addColorStop(0.45, 'rgba(236,174,122,.04)')
  core.addColorStop(1, 'rgba(236,174,122,0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

function drawTrail(dt) {
  if (trail.length > 1) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 外层雾化光晕。
    ctx.filter = 'blur(7px)'
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1]
      const b = trail[i]
      const life = Math.min(a.life, b.life)
      ctx.strokeStyle = `rgba(255,126,54,${life * 0.045})`
      ctx.lineWidth = 14 + life * 18
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(a.x + a.vx * 1.8, a.y + a.vy * 1.8, b.x, b.y)
      ctx.stroke()
    }

    // 中层暖金流光。
    ctx.filter = 'blur(1.8px)'
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1]
      const b = trail[i]
      const life = Math.min(a.life, b.life)
      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      gradient.addColorStop(0, `rgba(230,95,24,${life * 0.075})`)
      gradient.addColorStop(0.5, `rgba(255,177,91,${life * 0.16})`)
      gradient.addColorStop(1, `rgba(255,105,36,${life * 0.085})`)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3 + life * 8
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(a.x + a.vx * 1.45, a.y + a.vy * 1.45, b.x, b.y)
      ctx.stroke()
    }

    // 极细高光让轨迹更清晰。
    ctx.filter = 'none'
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1]
      const b = trail[i]
      const life = Math.min(a.life, b.life)
      ctx.strokeStyle = `rgba(255,235,207,${life * 0.28})`
      ctx.lineWidth = 0.55 + life * 1.15
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(a.x + a.vx, a.y + a.vy, b.x, b.y)
      ctx.stroke()
    }
  }

  trail.forEach(point => { point.life -= dt * 0.54 })
  trail = trail.filter(point => point.life > 0)
}

function drawRipples(dt) {
  ctx.save()
  ctx.filter = 'none'
  ctx.globalCompositeOperation = 'lighter'
  ripples.forEach(ripple => {
    ripple.life -= dt * 0.58
    ripple.radius += dt * 54
    const gradient = ctx.createRadialGradient(
      ripple.x,
      ripple.y,
      Math.max(0, ripple.radius - 5),
      ripple.x,
      ripple.y,
      ripple.radius + 5
    )
    gradient.addColorStop(0, 'rgba(235,106,35,0)')
    gradient.addColorStop(0.5, `rgba(235,106,35,${ripple.life * 0.13})`)
    gradient.addColorStop(1, 'rgba(255,185,124,0)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.2 + ripple.life * 1.6
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.stroke()
  })
  ripples = ripples.filter(ripple => ripple.life > 0)
  ctx.restore()
}

function step(now) {
  if (!running) return
  const dt = Math.min(0.05, (now - lastTs) / 1000 || 0.016)
  lastTs = now
  const t = now * 0.0001

  ctx.clearRect(0, 0, W, H)
  mouse.vx *= 0.9
  mouse.vy *= 0.9
  rippleCooldown = Math.max(0, rippleCooldown - dt)

  drawAmbientFlow(now, dt)
  ctx.globalCompositeOperation = 'lighter'
  drawTrail(dt)
  drawRipples(dt)

  particles.forEach(particle => {
    const angle = noise2(particle.x * 0.00145 + t * 0.15, particle.y * 0.00145 + t) * Math.PI * 4
    particle.vx += Math.cos(angle) * 0.008 * dt * 60
    particle.vy += Math.sin(angle) * 0.008 * dt * 60

    const dx = particle.x - mouse.x
    const dy = particle.y - mouse.y
    const distanceSquared = dx * dx + dy * dy
    if (mouse.seen && distanceSquared < 300 * 300) {
      const distance = Math.sqrt(distanceSquared) || 1
      const falloff = 1 - distance / 300
      const speed = Math.min(3.1, Math.hypot(mouse.vx, mouse.vy) * 0.16 + 0.55)
      particle.vx += ((-dy / distance) * 2.5 - (dx / distance) * 0.35) * falloff * speed * 0.045 * dt * 60
      particle.vy += ((dx / distance) * 2.5 - (dy / distance) * 0.35) * falloff * speed * 0.045 * dt * 60
    }

    particle.vx *= 0.964
    particle.vy *= 0.964
    particle.x += particle.vx * dt * 60
    particle.y += particle.vy * dt * 60

    if (particle.x < -30) particle.x = W + 30
    else if (particle.x > W + 30) particle.x = -30
    if (particle.y < -30) particle.y = H + 30
    else if (particle.y > H + 30) particle.y = -30

    const [r, g, b] = particle.hue
    ctx.strokeStyle = `rgba(${r},${g},${b},${particle.alpha})`
    ctx.lineWidth = particle.r
    ctx.beginPath()
    ctx.moveTo(particle.x - particle.vx * 3.4, particle.y - particle.vy * 3.4)
    ctx.lineTo(particle.x, particle.y)
    ctx.stroke()
  })

  if (mouse.seen) {
    const pulse = 6 + Math.sin(now * 0.012) * 2
    const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 38)
    glow.addColorStop(0, 'rgba(255,244,225,.72)')
    glow.addColorStop(0.18, 'rgba(255,166,90,.25)')
    glow.addColorStop(1, 'rgba(230,95,24,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, 38 + pulse, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.filter = 'none'
  ctx.globalCompositeOperation = 'source-over'
  raf = requestAnimationFrame(step)
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  W = window.innerWidth
  H = window.innerHeight
  if (!field.x && !field.y) {
    field.x = field.targetX = W * 0.5
    field.y = field.targetY = H * 0.5
  }
  const canvas = canvasEl.value
  if (!canvas) return
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function init() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  const count = Math.round(Math.min(118, Math.max(58, (W * H) / 17500)))
  particles = Array.from({ length: count }, makeParticle)
  running = true
  lastTs = performance.now()
  raf = requestAnimationFrame(step)
}

function onMove(event) {
  const point = event.touches?.[0] || event
  const x = point.clientX
  const y = point.clientY
  if (!Number.isFinite(x) || !Number.isFinite(y)) return

  if (mouse.seen) {
    mouse.vx = (mouse.vx + x - mouse.px) * 0.5
    mouse.vy = (mouse.vy + y - mouse.py) * 0.5
    if (rippleCooldown === 0 && Math.hypot(mouse.vx, mouse.vy) > 4.5) {
      ripples.push({ x, y, radius: 8, life: 1 })
      rippleCooldown = 0.26
      if (ripples.length > 10) ripples.shift()
    }
  }

  mouse.x = x
  mouse.y = y
  field.targetX = x
  field.targetY = y
  field.targetEnergy = Math.min(1.45, 0.38 + Math.hypot(mouse.vx, mouse.vy) * 0.045)
  trail.push({ x, y, vx: mouse.vx, vy: mouse.vy, life: 1 })
  if (trail.length > 68) trail.splice(0, trail.length - 68)
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
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.fluid-backdrop {
  --flow-x: 0px;
  --flow-y: 0px;
  --flow-energy: 0;
  --cursor-x: 50vw;
  --cursor-y: 50vh;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 177, 111, 0.32), transparent 31%),
    radial-gradient(circle at 82% 76%, rgba(228, 143, 82, 0.24), transparent 34%),
    linear-gradient(125deg, #fffdfb 0%, #f9efe6 46%, #fff9f3 72%, #f7e9dc 100%);
  background-size: 135% 135%;
  animation: backdrop-breathe 18s ease-in-out infinite alternate;
}

.fluid-backdrop::after {
  content: '';
  position: absolute;
  inset: -140px;
  opacity: calc(.24 + var(--flow-energy) * .1);
  background: radial-gradient(circle 280px at var(--cursor-x) var(--cursor-y), rgba(244, 112, 38, .27), transparent 72%);
  transform: translate3d(var(--flow-x), var(--flow-y), 0);
  transition: opacity .35s ease;
  will-change: transform, opacity;
}

.fluid-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 1;
  mix-blend-mode: multiply;
}

.ambient-mesh,
.ambient-grain,
.flow-ribbon,
.ambient-orb {
  position: absolute;
  display: block;
  pointer-events: none;
}

.ambient-mesh {
  inset: -18%;
  opacity: 0.36;
  background-image:
    linear-gradient(rgba(116, 78, 52, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(116, 78, 52, 0.045) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(ellipse at center, #000 12%, transparent 72%);
  transform: translate3d(calc(var(--flow-x) * .25), calc(var(--flow-y) * .25), 0);
  animation: mesh-drift 18s linear infinite;
}

.flow-ribbon {
  width: 72vw;
  height: 18vw;
  min-height: 150px;
  border-radius: 50%;
  filter: blur(44px);
  opacity: calc(.46 + var(--flow-energy) * .1);
  will-change: transform;
}

.ribbon-one {
  top: 10vh;
  left: -25vw;
  background: linear-gradient(90deg, transparent, rgba(246, 122, 42, 0.68), rgba(255, 190, 128, 0.38), transparent);
  transform: rotate(-12deg);
  animation: ribbon-one 24s cubic-bezier(.45, 0, .55, 1) infinite;
}

.ribbon-two {
  right: -28vw;
  top: 44vh;
  background: linear-gradient(90deg, transparent, rgba(192, 112, 61, 0.48), rgba(255, 148, 70, 0.6), transparent);
  transform: rotate(14deg);
  animation: ribbon-two 29s cubic-bezier(.45, 0, .55, 1) infinite reverse;
}

.ribbon-three {
  left: 12vw;
  bottom: -9vw;
  background: linear-gradient(90deg, transparent, rgba(255, 166, 95, 0.55), rgba(223, 78, 14, 0.34), transparent);
  transform: rotate(-5deg);
  animation: ribbon-three 34s ease-in-out infinite;
}

.ambient-orb {
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.46;
  will-change: transform;
}

.orb-one {
  width: 42vw;
  height: 42vw;
  top: -20vw;
  right: -10vw;
  background: radial-gradient(circle, rgba(255, 163, 99, 0.3), transparent 68%);
  animation: orb-one 22s ease-in-out infinite alternate;
}

.orb-two {
  width: 38vw;
  height: 38vw;
  left: -16vw;
  top: 32vh;
  background: radial-gradient(circle, rgba(215, 175, 137, 0.26), transparent 68%);
  animation: orb-two 28s ease-in-out infinite alternate;
}

.orb-three {
  width: 30vw;
  height: 30vw;
  right: 18vw;
  bottom: -17vw;
  background: radial-gradient(circle, rgba(240, 138, 75, 0.2), transparent 68%);
  animation: orb-three 25s ease-in-out infinite alternate;
}

.ambient-grain {
  inset: 0;
  opacity: 0.17;
  background-image: radial-gradient(rgba(78, 50, 32, 0.16) 0.55px, transparent 0.7px);
  background-size: 5px 5px;
  mask-image: linear-gradient(to bottom, #000, transparent 78%);
}

@keyframes backdrop-breathe {
  0% { background-position: 0% 20%; }
  50% { background-position: 80% 55%; }
  100% { background-position: 20% 100%; }
}

@keyframes mesh-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 68px 68px, 68px 68px; }
}

@keyframes ribbon-one {
  0%, 100% { transform: translate3d(calc(-5vw + var(--flow-x) * .8), calc(-2vh + var(--flow-y) * .8), 0) rotate(-12deg) scaleX(.9); }
  50% { transform: translate3d(calc(72vw + var(--flow-x) * .8), calc(18vh + var(--flow-y) * .8), 0) rotate(8deg) scaleX(1.16); }
}

@keyframes ribbon-two {
  0%, 100% { transform: translate3d(calc(8vw - var(--flow-x) * .65), calc(8vh - var(--flow-y) * .65), 0) rotate(14deg) scaleX(.95); }
  50% { transform: translate3d(calc(-66vw - var(--flow-x) * .65), calc(-20vh - var(--flow-y) * .65), 0) rotate(-9deg) scaleX(1.12); }
}

@keyframes ribbon-three {
  0%, 100% { transform: translate3d(calc(-18vw + var(--flow-x) * .45), calc(2vh + var(--flow-y) * .45), 0) rotate(-5deg) scale(.9); }
  50% { transform: translate3d(calc(42vw + var(--flow-x) * .45), calc(-34vh + var(--flow-y) * .45), 0) rotate(12deg) scale(1.15); }
}

@keyframes orb-one {
  to { transform: translate3d(-8vw, 9vh, 0) scale(1.12); }
}

@keyframes orb-two {
  to { transform: translate3d(11vw, -8vh, 0) scale(.9); }
}

@keyframes orb-three {
  to { transform: translate3d(-6vw, -10vh, 0) scale(1.15); }
}

@media (max-width: 720px) {
  .fluid-canvas { opacity: 0.72; }
  .ambient-mesh { opacity: 0.14; }
  .flow-ribbon { width: 105vw; height: 32vw; filter: blur(50px); }
  .ambient-grain { opacity: 0.1; }
}

@media (prefers-reduced-motion: reduce) {
  .fluid-canvas { display: none; }
  .fluid-backdrop,
  .ambient-mesh,
  .flow-ribbon,
  .ambient-orb { animation: none; }
}
</style>
