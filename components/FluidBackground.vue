<template>
  <div ref="backdropEl" class="fluid-backdrop" aria-hidden="true">
    <span class="fluid-wash wash-one"></span>
    <span class="fluid-wash wash-two"></span>
    <span class="fluid-wash wash-three"></span>
    <span class="fluid-grid"></span>
    <span class="fluid-grain"></span>
  </div>
  <canvas ref="canvasEl" class="fluid-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
// 一套贯穿全站的二维流场。示踪线持续随时间演化，指针向速度场注入涡量和动量。
const canvasEl = ref(null)
const backdropEl = ref(null)

const TAU = Math.PI * 2
const COLORS = [
  [205, 76, 20],
  [230, 101, 28],
  [237, 139, 69],
  [166, 105, 68],
  [72, 116, 145]
]

let ctx = null
let width = 1
let height = 1
let dpr = 1
let raf = 0
let resizeFrame = 0
let resizeTimer = 0
let lastTime = 0
let lastPaintTime = 0
let running = false
let quality = 1
let frameInterval = 0
let configuredFrameInterval = 0
let frameCount = 0
let renderSamples = 0
let renderTotal = 0
let particles = []
let wakes = []
let pointerTrail = []
let sparks = []
let ripples = []
let motionPreference = null

const pointer = {
  x: -10000,
  y: -10000,
  previousX: -10000,
  previousY: -10000,
  vx: 0,
  vy: 0,
  energy: 0,
  active: false,
  lastWake: 0,
  lastRipple: 0
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function viewportSize() {
  return {
    width: Math.max(1, Math.round(document.documentElement.clientWidth || window.innerWidth)),
    height: Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight))
  }
}

function createParticle(initial = true, colorIndex = Math.floor(Math.random() * COLORS.length)) {
  const x = initial ? Math.random() * width : -24 - Math.random() * 80
  const y = Math.random() * height
  return {
    x,
    y,
    history: [{ x, y }],
    age: initial ? Math.random() * 8 : 0,
    maxAge: 8 + Math.random() * 12,
    speed: .74 + Math.random() * .62,
    width: .58 + Math.random() * 1.15,
    colorIndex,
    phase: Math.random() * TAU
  }
}

function particleCount() {
  const areaCount = Math.round((width * height) / 3600)
  return Math.round(clamp(areaCount, 200, 560) * quality)
}

function resetParticles() {
  particles = Array.from({ length: particleCount() }, () => createParticle(true))
}

function addVortex(velocity, x, y, centerX, centerY, radius, strength) {
  const dx = x - centerX
  const dy = y - centerY
  const distanceSquared = dx * dx + dy * dy
  const radiusSquared = radius * radius
  if (distanceSquared > radiusSquared * 3) return
  const distance = Math.sqrt(distanceSquared) + 18
  const normalized = 1 - distanceSquared / (radiusSquared * 3)
  const influence = normalized * normalized
  velocity.x += (-dy / distance) * strength * influence
  velocity.y += (dx / distance) * strength * influence
}

function velocityAt(x, y, time) {
  const nx = x / Math.max(1, width)
  const ny = y / Math.max(1, height)
  const velocity = {
    x: .77 + Math.sin(ny * TAU * 2.15 + time * .54) * .19
      + Math.cos((nx + ny) * TAU * 1.35 - time * .31) * .11,
    y: Math.sin(nx * TAU * 2.3 - time * .47) * .21
      + Math.cos((nx - ny) * TAU * 1.5 + time * .38) * .13
  }

  // 三个缓慢迁移的涡核让静止状态下的流场也始终发生大尺度变化。
  const span = Math.min(width, height)
  addVortex(
    velocity, x, y,
    width * (.28 + Math.sin(time * .21) * .09),
    height * (.30 + Math.cos(time * .17) * .12),
    span * .31,
    .82
  )
  addVortex(
    velocity, x, y,
    width * (.68 + Math.cos(time * .15) * .11),
    height * (.61 + Math.sin(time * .19) * .13),
    span * .38,
    -.94
  )
  addVortex(
    velocity, x, y,
    width * (.52 + Math.sin(time * .11 + 1.4) * .18),
    height * (.83 + Math.cos(time * .16) * .07),
    span * .27,
    .55
  )

  if (pointer.energy > .002) {
    const dx = x - pointer.x
    const dy = y - pointer.y
    const radius = clamp(span * .34, 190, 360)
    const distanceSquared = dx * dx + dy * dy
    if (distanceSquared < radius * radius) {
      const distance = Math.sqrt(distanceSquared) + 12
      const falloff = (1 - Math.sqrt(distanceSquared) / radius) ** 2
      const direction = Math.sign(pointer.vx || 1)
      const motionScale = clamp(Math.hypot(pointer.vx, pointer.vy) / 28, .35, 1.7)
      velocity.x += pointer.vx * .018 * falloff
      velocity.y += pointer.vy * .018 * falloff
      velocity.x += (-dy / distance) * 1.78 * direction * pointer.energy * motionScale * falloff
      velocity.y += (dx / distance) * 1.78 * direction * pointer.energy * motionScale * falloff
    }
  }

  // 指针留下的涡团继续随背景流移动，形成真正可见的扰动尾迹。
  for (const wake of wakes) {
    addVortex(velocity, x, y, wake.x, wake.y, wake.radius, wake.spin * wake.life)
  }
  return velocity
}

function updateWakes(dt, time) {
  for (const wake of wakes) {
    const driftX = .77 + Math.sin((wake.y / Math.max(1, height)) * TAU * 2.15 + time * .54) * .19
    const driftY = Math.sin((wake.x / Math.max(1, width)) * TAU * 2.3 - time * .47) * .21
    wake.x += driftX * dt * 18
    wake.y += driftY * dt * 18
    wake.radius += dt * 26
    wake.life -= dt * .54
  }
  wakes = wakes.filter(wake => wake.life > 0 && wake.x < width + wake.radius)
}

function updatePointerEffects(dt) {
  for (const point of pointerTrail) point.life -= dt * .72
  pointerTrail = pointerTrail.filter(point => point.life > 0)

  for (const spark of sparks) {
    spark.x += spark.vx * dt
    spark.y += spark.vy * dt
    spark.vx *= Math.pow(.18, dt)
    spark.vy *= Math.pow(.18, dt)
    spark.life -= dt * .78
  }
  sparks = sparks.filter(spark => spark.life > 0)

  for (const ripple of ripples) {
    ripple.radius += dt * 92
    ripple.life -= dt * .86
  }
  ripples = ripples.filter(ripple => ripple.life > 0)
}

function respawnParticle(particle) {
  Object.assign(particle, createParticle(false, particle.colorIndex))
}

function updateParticles(dt, time) {
  const baseSpeed = clamp(Math.min(width, height) * .118, 62, 108)
  const historyLimit = quality < .8 ? 11 : 18

  for (const particle of particles) {
    const velocity = velocityAt(particle.x, particle.y, time + particle.phase * .025)
    const localSpeed = baseSpeed * particle.speed
    particle.x += velocity.x * localSpeed * dt
    particle.y += velocity.y * localSpeed * dt
    particle.age += dt

    const escaped = particle.x < -140 || particle.x > width + 140 || particle.y < -140 || particle.y > height + 140
    if (escaped || particle.age > particle.maxAge) {
      respawnParticle(particle)
      continue
    }
    particle.history.push({ x: particle.x, y: particle.y })
    if (particle.history.length > historyLimit) particle.history.shift()
  }
}

function traceFieldLine(seedY, time, offset = 0) {
  const points = []
  let x = -50
  let y = seedY
  const stepSize = quality < .8 ? 25 : 21
  const maxSteps = Math.ceil((width + 140) / stepSize)

  for (let index = 0; index <= maxSteps && x < width + 80; index += 1) {
    points.push({ x, y })
    const velocity = velocityAt(x, y, time + offset)
    const flowSlope = velocity.y / Math.max(.38, Math.abs(velocity.x))
    const movingBand = seedY
      + Math.sin((x / Math.max(1, width)) * TAU * .72 + time * .22 + offset * 13) * height * .026
    y += clamp(flowSlope * stepSize * .72, -stepSize * 1.35, stepSize * 1.35)
    // 轻微回归所属高度带，避免涡核把所有流线卷到同一区域而留下大片空白。
    y += (movingBand - y) * .032
    y = clamp(y, -64, height + 64)
    x += stepSize
  }
  return points
}

function strokePath(points) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]
    const next = points[index + 1]
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) * .5, (point.y + next.y) * .5)
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  ctx.stroke()
}

function drawFieldLines(time) {
  const lineCount = quality < .8 ? 10 : 14
  const paths = []
  for (let index = 0; index < lineCount; index += 1) {
    const seed = ((index + .35) / lineCount) * height
      + Math.sin(time * .32 + index * 1.7) * height * .045
    paths.push(traceFieldLine(seed, time, index * .035))
  }

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'multiply'
  ctx.strokeStyle = `rgba(226, 106, 36, ${.04 + pointer.energy * .01})`
  ctx.lineWidth = quality < .8 ? 10 : 14
  for (const path of paths.filter((_, index) => index % 3 === 1)) strokePath(path)

  for (let index = 0; index < paths.length; index += 1) {
    ctx.strokeStyle = index % 4 === 0
      ? `rgba(42, 99, 135, ${.23 + pointer.energy * .035})`
      : `rgba(164, 62, 14, ${.27 + pointer.energy * .04})`
    ctx.lineWidth = index % 3 === 0 ? 1.85 : 1.2
    strokePath(paths[index])
  }

  // 亮色流束沿已经积分出的轨迹前进，让速度方向一眼可见。
  ctx.globalCompositeOperation = 'source-over'
  for (let index = 0; index < paths.length; index += 1) {
    const blue = index % 4 === 0
    ctx.setLineDash(quality < .8 ? [34, 104] : [48, 126])
    ctx.lineDashOffset = -time * (blue ? 66 : 88) - index * 23
    ctx.strokeStyle = blue
      ? `rgba(42, 118, 164, ${.48 + pointer.energy * .05})`
      : `rgba(238, 91, 18, ${.54 + pointer.energy * .065})`
    ctx.lineWidth = quality < .8 ? 2.05 : 2.65
    strokePath(paths[index])
  }

  ctx.setLineDash([])
  ctx.restore()
}

function drawParticlePass(fromEnd, alphaScale, widthScale) {
  for (let colorIndex = 0; colorIndex < COLORS.length; colorIndex += 1) {
    const [red, green, blue] = COLORS[colorIndex]
    ctx.beginPath()
    for (const particle of particles) {
      if (particle.colorIndex !== colorIndex || particle.history.length < 2) continue
      const start = Math.max(0, particle.history.length - fromEnd)
      const first = particle.history[start]
      ctx.moveTo(first.x, first.y)
      for (let index = start + 1; index < particle.history.length; index += 1) {
        ctx.lineTo(particle.history[index].x, particle.history[index].y)
      }
    }
    ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alphaScale})`
    ctx.lineWidth = widthScale
    ctx.stroke()
  }
}

function drawParticles() {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'multiply'
  drawParticlePass(18, quality < .8 ? .11 : .095, .86)
  drawParticlePass(5, quality < .8 ? .28 : .25, 1.38)

  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(255, 244, 231, .72)'
  ctx.beginPath()
  for (let index = 0; index < particles.length; index += quality < .8 ? 5 : 4) {
    const particle = particles[index]
    ctx.moveTo(particle.x + 1.3, particle.y)
    ctx.arc(particle.x, particle.y, 1.3, 0, TAU)
  }
  ctx.fill()
  ctx.restore()
}

function drawPointerTrail() {
  if (pointerTrail.length < 2) return
  const first = pointerTrail[0]
  const last = pointerTrail[pointerTrail.length - 1]
  const gradient = ctx.createLinearGradient(first.x, first.y, last.x, last.y)
  gradient.addColorStop(0, 'rgba(238, 92, 18, 0)')
  gradient.addColorStop(.45, 'rgba(243, 112, 30, .3)')
  gradient.addColorStop(1, 'rgba(255, 224, 187, .92)')

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(first.x, first.y)
  for (let index = 1; index < pointerTrail.length - 1; index += 1) {
    const point = pointerTrail[index]
    const next = pointerTrail[index + 1]
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) * .5, (point.y + next.y) * .5)
  }
  ctx.lineTo(last.x, last.y)
  ctx.strokeStyle = 'rgba(225, 75, 8, .11)'
  ctx.lineWidth = 25
  ctx.stroke()
  ctx.strokeStyle = gradient
  ctx.lineWidth = 6.5
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255, 249, 238, .86)'
  ctx.lineWidth = 1.15
  ctx.stroke()
  ctx.restore()
}

function drawPointerParticles() {
  if (!sparks.length) return
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.beginPath()
  for (const spark of sparks) {
    ctx.moveTo(spark.x + spark.size, spark.y)
    ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, TAU)
  }
  ctx.fillStyle = 'rgba(238, 94, 19, .72)'
  ctx.fill()
  ctx.restore()
}

function drawInteraction() {
  drawPointerTrail()
  drawPointerParticles()

  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  for (const ripple of ripples) {
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, TAU)
    ctx.strokeStyle = `rgba(233, 85, 15, ${ripple.life * .34})`
    ctx.lineWidth = 1.2 + ripple.life * 2
    ctx.stroke()
  }

  if (pointer.energy < .015) {
    ctx.restore()
    return
  }
  const radius = 82 + pointer.energy * 62
  const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius)
  glow.addColorStop(0, `rgba(255, 245, 227, ${.42 * pointer.energy})`)
  glow.addColorStop(.22, `rgba(240, 104, 25, ${.17 * pointer.energy})`)
  glow.addColorStop(1, 'rgba(222, 91, 20, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2)
  ctx.restore()
}

function publishState() {
  const backdrop = backdropEl.value
  if (backdrop) {
    backdrop.style.setProperty('--flow-x', `${((pointer.x / width) - .5) * 34}px`)
    backdrop.style.setProperty('--flow-y', `${((pointer.y / height) - .5) * 26}px`)
    backdrop.style.setProperty('--flow-energy', String(pointer.energy))
    backdrop.style.setProperty('--cursor-x', `${pointer.x}px`)
    backdrop.style.setProperty('--cursor-y', `${pointer.y}px`)
  }
  if (canvasEl.value && frameCount % 8 === 0) {
    canvasEl.value.dataset.frame = String(frameCount)
    canvasEl.value.dataset.wakes = String(wakes.length)
    canvasEl.value.dataset.pointerTrail = String(pointerTrail.length)
    canvasEl.value.dataset.sparks = String(sparks.length)
    canvasEl.value.dataset.ripples = String(ripples.length)
    canvasEl.value.dataset.pointerEnergy = pointer.energy.toFixed(3)
    canvasEl.value.dataset.fieldLines = String(quality < .8 ? 10 : 14)
  }
}

function step(now) {
  if (!running || !ctx) return
  raf = requestAnimationFrame(step)
  if (frameInterval && now - lastPaintTime < frameInterval) return
  lastPaintTime = now

  const renderStart = performance.now()
  const dt = clamp((now - lastTime) / 1000 || .016, .001, .034)
  const time = now * .001
  lastTime = now
  pointer.vx *= Math.pow(.16, dt)
  pointer.vy *= Math.pow(.16, dt)
  pointer.energy *= Math.pow(.29, dt)

  updateWakes(dt, time)
  updatePointerEffects(dt)
  updateParticles(dt, time)
  ctx.clearRect(0, 0, width, height)
  drawFieldLines(time)
  drawParticles()
  drawInteraction()
  frameCount += 1
  publishState()

  renderSamples += 1
  renderTotal += performance.now() - renderStart
  if (renderSamples >= 48) {
    const average = renderTotal / renderSamples
    if (average > 11.5 && quality > .72) {
      quality = .72
      configuredFrameInterval = 1000 / 50
      applyMotionPreference()
      particles = particles.slice(0, particleCount())
      if (canvasEl.value) canvasEl.value.dataset.quality = 'adaptive'
    }
    renderSamples = 0
    renderTotal = 0
  }
}

function applyResize(force = false) {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return
  const next = viewportSize()
  const dprLimit = quality < .8 ? 1 : next.width * next.height > 2_100_000 ? 1.15 : 1.35
  const nextDpr = Math.min(window.devicePixelRatio || 1, dprLimit)
  const pixelWidth = Math.round(next.width * nextDpr)
  const pixelHeight = Math.round(next.height * nextDpr)
  if (!force && width === next.width && height === next.height && canvas.width === pixelWidth && canvas.height === pixelHeight) return

  let snapshot = null
  if (canvas.width && canvas.height) {
    snapshot = document.createElement('canvas')
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
  }

  const scaleX = next.width / width
  const scaleY = next.height / height
  width = next.width
  height = next.height
  dpr = nextDpr
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  if (snapshot) ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, width, height)
  if (Number.isFinite(scaleX) && Number.isFinite(scaleY)) {
    for (const particle of particles) {
      particle.x *= scaleX
      particle.y *= scaleY
      particle.history = particle.history.map(point => ({ x: point.x * scaleX, y: point.y * scaleY }))
    }
    for (const wake of wakes) {
      wake.x *= scaleX
      wake.y *= scaleY
    }
  }

  const wanted = particleCount()
  if (particles.length > wanted) particles = particles.slice(0, wanted)
  while (particles.length < wanted) particles.push(createParticle(true))
}

function scheduleResize() {
  window.clearTimeout(resizeTimer)
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeTimer = window.setTimeout(() => applyResize(), 120)
  })
}

function addWake(x, y, now) {
  const speed = Math.hypot(pointer.vx, pointer.vy)
  if (speed < 2.4 || now - pointer.lastWake < 54) return
  wakes.push({
    x,
    y,
    vx: pointer.vx,
    vy: pointer.vy,
    radius: clamp(92 + speed * 1.7, 100, 185),
    spin: clamp((pointer.vx >= 0 ? 1 : -1) * (.72 + speed * .026), -1.65, 1.65),
    life: 1
  })
  if (wakes.length > (quality < .8 ? 3 : 5)) wakes.shift()
  pointer.lastWake = now
}

function addPointerEffects(x, y, now) {
  const speed = Math.hypot(pointer.vx, pointer.vy)
  pointerTrail.push({ x, y, life: 1 })
  const trailLimit = quality < .8 ? 28 : 42
  if (pointerTrail.length > trailLimit) pointerTrail.splice(0, pointerTrail.length - trailLimit)

  if (speed > 3) {
    const count = quality < .8 ? 1 : 2
    for (let index = 0; index < count; index += 1) {
      sparks.push({
        x: x + (Math.random() - .5) * 8,
        y: y + (Math.random() - .5) * 8,
        vx: -pointer.vx * (.18 + Math.random() * .18) + (Math.random() - .5) * 34,
        vy: -pointer.vy * (.18 + Math.random() * .18) + (Math.random() - .5) * 34,
        size: 1.3 + Math.random() * 2.2,
        life: .68 + Math.random() * .32
      })
    }
    const sparkLimit = quality < .8 ? 34 : 66
    if (sparks.length > sparkLimit) sparks.splice(0, sparks.length - sparkLimit)
  }

  if (speed > 7 && now - pointer.lastRipple > 170) {
    ripples.push({ x, y, radius: 8, life: 1 })
    if (ripples.length > 6) ripples.shift()
    pointer.lastRipple = now
  }
}

function onPointerMove(event) {
  const x = event.clientX
  const y = event.clientY
  if (!Number.isFinite(x) || !Number.isFinite(y)) return
  if (pointer.active) {
    pointer.vx = pointer.vx * .46 + (x - pointer.previousX) * .54
    pointer.vy = pointer.vy * .46 + (y - pointer.previousY) * .54
    const now = performance.now()
    addWake(x, y, now)
    addPointerEffects(x, y, now)
  }
  pointer.x = x
  pointer.y = y
  pointer.previousX = x
  pointer.previousY = y
  pointer.active = true
  pointer.energy = clamp(.52 + Math.hypot(pointer.vx, pointer.vy) * .032, .52, 1.35)
}

function onPointerLeave() {
  pointer.active = false
  pointer.energy *= .65
}

function setRunningState() {
  const paused = document.hidden
  backdropEl.value?.classList.toggle('is-paused', paused)
  if (paused) {
    running = false
    cancelAnimationFrame(raf)
    return
  }
  if (!running && ctx) {
    running = true
    lastTime = performance.now()
    raf = requestAnimationFrame(step)
  }
}

function applyMotionPreference() {
  const reduced = Boolean(motionPreference?.matches)
  frameInterval = reduced
    ? Math.max(configuredFrameInterval, 1000 / 30)
    : configuredFrameInterval
  if (canvasEl.value) canvasEl.value.dataset.motion = reduced ? 'reduced-rate' : 'full'
  setRunningState()
}

function init() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  const mobileLike = window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 720
  const memory = Number(navigator.deviceMemory || 8)
  const cores = Number(navigator.hardwareConcurrency || 8)
  if (mobileLike) {
    quality = .62
    frameInterval = 1000 / 45
    canvas.dataset.quality = 'mobile'
  } else if (memory <= 4 || cores <= 4 || window.innerWidth * window.innerHeight > 2_800_000) {
    quality = .74
    frameInterval = 1000 / 50
    canvas.dataset.quality = 'balanced'
  } else {
    frameInterval = 1000 / 50
    canvas.dataset.quality = 'full'
  }
  configuredFrameInterval = frameInterval

  applyResize(true)
  resetParticles()
  pointer.x = pointer.previousX = width * .5
  pointer.y = pointer.previousY = height * .5
  lastTime = performance.now()
  running = true
  raf = requestAnimationFrame(step)
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  init()
  applyMotionPreference()
  motionPreference.addEventListener('change', applyMotionPreference)
  window.addEventListener('resize', scheduleResize, { passive: true })
  window.addEventListener('orientationchange', scheduleResize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('mouseleave', onPointerLeave)
  document.addEventListener('visibilitychange', setRunningState)
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  cancelAnimationFrame(resizeFrame)
  window.clearTimeout(resizeTimer)
  motionPreference?.removeEventListener('change', applyMotionPreference)
  window.removeEventListener('resize', scheduleResize)
  window.removeEventListener('orientationchange', scheduleResize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('mouseleave', onPointerLeave)
  document.removeEventListener('visibilitychange', setRunningState)
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
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 7%, rgba(255, 184, 124, .3), transparent 34%),
    radial-gradient(circle at 86% 78%, rgba(211, 133, 78, .21), transparent 38%),
    linear-gradient(125deg, #fffdfb 0%, #f8eee5 46%, #fff9f3 72%, #f6e8db 100%);
  background-size: 150% 150%;
  transform: translateZ(0);
  animation: fluid-breathe 18s ease-in-out infinite alternate;
}

.fluid-backdrop::before {
  content: '';
  position: absolute;
  inset: -28%;
  opacity: calc(.2 + var(--flow-energy) * .075);
  background:
    conic-gradient(from 105deg at 48% 52%, transparent 0 18%, rgba(236, 113, 41, .11) 25%, transparent 35% 61%, rgba(84, 126, 151, .075) 70%, transparent 79%),
    radial-gradient(circle 300px at var(--cursor-x) var(--cursor-y), rgba(237, 115, 41, .18), transparent 72%);
  transform: translate3d(var(--flow-x), var(--flow-y), 0) rotate(-4deg);
  transition: opacity .28s ease;
  animation: fluid-caustic 24s ease-in-out infinite alternate;
  will-change: transform, opacity;
}

.fluid-canvas {
  position: fixed;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: .9;
  pointer-events: none;
  mix-blend-mode: multiply;
  contain: strict;
  transform: translateZ(0);
  backface-visibility: hidden;
}

:global(html.home-intro-open) .fluid-canvas {
  opacity: 1;
}

.fluid-wash,
.fluid-grid,
.fluid-grain {
  position: absolute;
  display: block;
  pointer-events: none;
}

.fluid-wash {
  width: 68vmax;
  aspect-ratio: 1.8;
  border-radius: 50%;
  opacity: calc(.32 + var(--flow-energy) * .035);
  filter: blur(64px);
  will-change: transform;
}

.wash-one {
  top: -22vmax;
  left: -28vmax;
  background: radial-gradient(ellipse, rgba(247, 137, 66, .36), transparent 68%);
  animation: wash-one 21s ease-in-out infinite alternate;
}

.wash-two {
  top: 31vh;
  right: -34vmax;
  background: radial-gradient(ellipse, rgba(192, 113, 69, .28), transparent 68%);
  animation: wash-two 27s ease-in-out infinite alternate;
}

.wash-three {
  bottom: -29vmax;
  left: 18vw;
  background: radial-gradient(ellipse, rgba(91, 137, 164, .16), transparent 68%);
  animation: wash-three 31s ease-in-out infinite alternate;
}

.fluid-grid {
  inset: -12%;
  opacity: .18;
  background-image:
    linear-gradient(rgba(96, 77, 64, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 77, 64, .055) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse at center, #000 8%, transparent 76%);
  transform: translate3d(calc(var(--flow-x) * .22), calc(var(--flow-y) * .22), 0);
  animation: grid-drift 22s linear infinite;
}

.fluid-grain {
  inset: 0;
  opacity: .1;
  background-image: radial-gradient(rgba(70, 47, 32, .2) .55px, transparent .7px);
  background-size: 5px 5px;
  mask-image: linear-gradient(to bottom, #000, transparent 84%);
}

.fluid-backdrop.is-paused,
.fluid-backdrop.is-paused * {
  animation-play-state: paused;
}

@keyframes fluid-breathe {
  0% { background-position: 0% 16%; }
  48% { background-position: 82% 48%; }
  100% { background-position: 21% 100%; }
}

@keyframes fluid-caustic {
  from { transform: translate3d(calc(-4% + var(--flow-x)), calc(-2% + var(--flow-y)), 0) rotate(-6deg) scale(.94); }
  to { transform: translate3d(calc(5% + var(--flow-x)), calc(4% + var(--flow-y)), 0) rotate(7deg) scale(1.08); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 72px 72px, 72px 72px; }
}

@keyframes wash-one {
  to { transform: translate3d(48vw, 25vh, 0) rotate(14deg) scale(1.12); }
}

@keyframes wash-two {
  to { transform: translate3d(-52vw, -21vh, 0) rotate(-17deg) scale(.9); }
}

@keyframes wash-three {
  to { transform: translate3d(18vw, -31vh, 0) rotate(9deg) scale(1.16); }
}

@media (max-width: 720px), (hover: none) and (pointer: coarse) {
  .fluid-canvas { opacity: .8; mix-blend-mode: normal; contain: layout paint; }
  :global(html.home-intro-open) .fluid-canvas { opacity: .94; }
  .fluid-wash { filter: blur(42px); }
  .fluid-grid { opacity: .1; }
  .fluid-grain { opacity: .065; }
}

@media (prefers-reduced-motion: reduce) {
  .fluid-backdrop,
  .fluid-backdrop::before,
  .fluid-wash,
  .fluid-grid { animation-duration: 48s; }
}
</style>
