<script setup lang="ts">
import { ArrowRight, BookOpen, FlaskConical, Boxes, Calculator, Check, Copy, MousePointer2 } from 'lucide-vue-next'
import { articles, algorithms, formulas, tools } from '~/utils/content'
const activeTool = ref(0)
const copied = ref('')
const showIntro = ref(true)
const introLeaving = ref(false)
const interfaceReady = ref(false)
let introTimer: ReturnType<typeof setTimeout> | undefined

const knowledgeCollections = [
  { name: 'CFD 理论', topics: '流体基础 · 离散方法 · 湍流 · 验证', to: '/knowledge?collection=cfd' },
  { name: 'OpenFOAM', topics: '算例结构 · 网格 · 边界 · 源码', to: '/knowledge?collection=openfoam' },
  { name: 'Modelica', topics: '语言 · 组件 · 事件 · 联合仿真', to: '/knowledge?collection=modelica' },
  { name: 'CAE 算法', topics: '有限元 · 求解器 · 多物理场 · 优化', to: '/knowledge?collection=cae' },
  { name: '无网格法', topics: 'SPH · 核函数 · 边界 · 数值验证', to: '/knowledge?collection=meshfree' },
]

useHead({ title: 'CFD菜鸟｜CFD 知识库与工程工具' })

function revealIntro() {
  if (!showIntro.value || introLeaving.value) return
  interfaceReady.value = true
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    showIntro.value = false
    return
  }
  introLeaving.value = true
  introTimer = setTimeout(() => {
    showIntro.value = false
    introLeaving.value = false
  }, 680)
}

function handleIntroKey(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    revealIntro()
  }
}

watch(showIntro, (visible) => {
  document.documentElement.classList.toggle('home-intro-open', visible)
})

onMounted(() => {
  document.documentElement.classList.add('home-intro-open')
  nextTick(() => (document.querySelector('.cfd-intro') as HTMLElement | null)?.focus({ preventScroll: true }))
})

onBeforeUnmount(() => {
  if (introTimer) clearTimeout(introTimer)
  document.documentElement.classList.remove('home-intro-open')
})

async function copyFormula(text: string, name: string) { await navigator.clipboard?.writeText(text); copied.value = name; setTimeout(() => copied.value = '', 1600) }
</script>

<template>
  <div class="home-page" :class="{ 'interface-ready': interfaceReady }">
    <div
      v-if="showIntro"
      class="cfd-intro"
      :class="{ leaving: introLeaving }"
      role="dialog"
      aria-modal="true"
      aria-label="CFD菜鸟网站开场"
      tabindex="0"
      @click="revealIntro"
      @keydown="handleIntroKey"
    >
      <div class="intro-grid" aria-hidden="true"></div>
      <div class="intro-flow" aria-hidden="true">
        <i v-for="i in 18" :key="i" :style="{ '--i': i }"></i>
        <span class="intro-vortex"><b>ω</b><small>FLOW FIELD</small></span>
      </div>
      <div class="intro-copy">
        <span class="intro-kicker">COMPUTATIONAL FLUID DYNAMICS</span>
        <h1><span>CFD</span>菜鸟</h1>
        <p>CFD · CAE · Modelica 知识与计算工具</p>
        <button class="intro-enter" type="button" @click.stop="revealIntro">
          <MousePointer2 :size="17" />点击进入
          <ArrowRight :size="18" />
        </button>
      </div>
      <div class="intro-readout" aria-hidden="true">
        <span>Re <b>100</b></span><span>Co <b>0.42</b></span><span>R <b>7.2e−07</b></span>
      </div>
    </div>

    <div class="home-interface">
    <section class="hero-section">
      <div class="contour-bg"></div>
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> CFD · CAE · MODELICA</div>
          <h1>CFD 知识库<br>与<strong>工程工具</strong></h1>
          <p>查找数值方法、OpenFOAM、Modelica、CAE 与无网格法资料，使用浏览器计算工具。</p>
          <div class="hero-actions"><NuxtLink to="/simulation" class="button large">进入仿真平台 <ArrowRight :size="18" /></NuxtLink><NuxtLink to="/knowledge" class="button secondary large">浏览知识库</NuxtLink></div>
        </div>
        <div class="hero-visual" aria-label="流场与 Modelica 系统拓扑示意">
          <div class="visual-toolbar"><span><i></i><i></i><i></i></span><small>cavity_flow · Re 100</small><b>CONVERGED</b></div>
          <div class="flow-field"><div v-for="i in 14" :key="i" class="stream" :style="{ '--i': i }"></div><div class="vortex-core"><span>ω</span><small>主涡中心</small></div><div class="mesh-lines"></div></div>
          <div class="visual-lower"><div class="mini-topology"><span>Source</span><i></i><span>Volume</span><i></i><span>Shaft</span></div><div class="mini-metrics"><small>连续性残差</small><strong>7.2e−07</strong><em>↓ 28.4%</em></div></div>
        </div>
      </div>
    </section>

    <section class="section compact-top">
      <div class="container">
        <div class="section-heading"><div><span class="kicker">主要功能</span><h2>知识、算法与计算工具</h2></div></div>
        <div class="capability-grid">
          <NuxtLink to="/knowledge" class="capability-card"><div class="cap-icon"><BookOpen /></div><span>01</span><h3>知识库</h3><p>按学科和软件分类查找基础概念、工程方法与检查清单。</p><div class="micro-tree"><i></i><b></b><b></b><b></b></div><strong class="card-link">浏览内容 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/algorithms" class="capability-card"><div class="cap-icon"><Calculator /></div><span>02</span><h3>算法与公式</h3><p>对比数值算法，查询公式、适用条件与符号定义。</p><div class="micro-curve"><i></i></div><strong class="card-link">打开速查 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/simulation" class="capability-card"><div class="cap-icon"><FlaskConical /></div><span>03</span><h3>CFD 工具</h3><p>配置参数、观察收敛，并下载计算结果。</p><div class="micro-curve"><i></i></div><strong class="card-link">运行仿真 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/modelica" class="capability-card"><div class="cap-icon"><Boxes /></div><span>04</span><h3>Modelica</h3><p>编写模型、检查方程并分析系统动态响应。</p><div class="micro-nodes"><b></b><i></i><b></b><i></i><b></b></div><strong class="card-link">打开工作台 <ArrowRight :size="16" /></strong></NuxtLink>
        </div>
      </div>
    </section>

    <section class="section knowledge-map-section">
      <div class="container">
        <div class="section-heading"><div><span class="kicker">知识分类</span><h2>五个知识集合</h2></div><NuxtLink to="/knowledge" class="text-link">查看全部 <ArrowRight :size="16" /></NuxtLink></div>
        <div class="knowledge-map-grid">
          <NuxtLink v-for="(item, index) in knowledgeCollections" :key="item.name" :to="item.to">
            <span>0{{ index + 1 }}</span><h3>{{ item.name }}</h3><p>{{ item.topics }}</p><ArrowRight :size="17" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section simulation-showcase">
      <div class="container">
        <div class="section-heading"><div><span class="kicker">在线仿真</span><h2>浏览器计算工具</h2></div><p>设置参数、查看收敛并导出结果。</p></div>
        <div class="tool-showcase">
          <div class="tool-tabs"><button v-for="(tool,i) in tools" :key="tool.slug" :class="{ active: activeTool===i }" @click="activeTool=i"><span>{{ `0${i+1}` }}</span><div><strong>{{ tool.name }}</strong><small>{{ tool.type }} · {{ tool.time }}</small></div><ArrowRight :size="17" /></button></div>
          <div class="tool-preview">
            <div class="preview-head"><div><span class="status-dot"></span>{{ tools[activeTool].status }} · v1.0.0</div><NuxtLink :to="`/simulation/${tools[activeTool].slug}`" class="button small">载入示例</NuxtLink></div>
            <div class="preview-content"><div class="preview-plot"><div class="heat-field" :class="`field-${activeTool}`"><span v-for="i in 22" :key="i" :style="{ '--i': i }"></span></div><div class="colorbar"></div></div><div class="preview-info"><small>问题说明</small><h3>{{ tools[activeTool].name }}</h3><p>{{ tools[activeTool].description }}</p><dl><div><dt>难度</dt><dd>{{ tools[activeTool].level }}</dd></div><div><dt>平均耗时</dt><dd>{{ tools[activeTool].time }}</dd></div><div><dt>结果格式</dt><dd>CSV · JSON · PNG</dd></div></dl></div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section knowledge-feature">
      <div class="container">
        <div class="section-heading"><div><span class="kicker">知识更新</span><h2>最新内容</h2></div><NuxtLink to="/knowledge" class="text-link">查看全部知识 <ArrowRight :size="16" /></NuxtLink></div>
        <div class="featured-layout"><NuxtLink :to="`/knowledge/${articles[0].slug}`" class="featured-article"><div class="article-graphic"><span>∂u/∂t + u·∇u</span><i></i></div><div><small>{{ articles[0].category }} · {{ articles[0].read }}</small><h3>{{ articles[0].title }}</h3><p>{{ articles[0].summary }}</p><strong>阅读全文 <ArrowRight :size="15" /></strong></div></NuxtLink><div class="article-list"><NuxtLink v-for="item in articles.slice(1,5)" :key="item.slug" :to="`/knowledge/${item.slug}`"><span>{{ item.category }}</span><h3>{{ item.title }}</h3><p>{{ item.summary }}</p><small>{{ item.level }} · {{ item.read }}</small></NuxtLink></div></div>
      </div>
    </section>

    <section class="section algorithm-formula">
      <div class="container split-sections">
        <div><div class="subsection-title"><div><span class="kicker">算法库</span><h2>数值方法</h2></div><NuxtLink to="/algorithms">全部算法</NuxtLink></div><div class="algorithm-list"><NuxtLink v-for="item in algorithms.slice(0,4)" :key="item.name" to="/algorithms"><strong>{{ item.name }}</strong><span>{{ item.use }}</span><small>{{ item.stability }}</small><ArrowRight :size="15" /></NuxtLink></div></div>
        <div><div class="subsection-title"><div><span class="kicker">公式速查</span><h2>常用公式</h2></div><div class="formula-heading-links"><NuxtLink to="/formulas/convert">乱码转换</NuxtLink><NuxtLink to="/formulas">全部公式</NuxtLink></div></div><div class="formula-list"><div v-for="item in formulas.slice(0,4)" :key="item.name"><span>{{ item.category }}</span><strong>{{ item.plain }}</strong><small>{{ item.name }} · {{ item.note }}</small><button :aria-label="`复制${item.name}`" @click="copyFormula(item.latex,item.name)"><Check v-if="copied===item.name" :size="16"/><Copy v-else :size="16"/>{{ copied===item.name?'已复制':'复制' }}</button></div></div></div>
      </div>
    </section>
    </div>
  </div>
</template>

<style scoped>
:global(html.home-intro-open) { overflow: hidden; }

.home-interface {
  opacity: .18;
  transform: translateY(24px) scale(.992);
  transition: opacity .75s ease, transform .75s cubic-bezier(.22, 1, .36, 1);
}

.interface-ready .home-interface {
  opacity: 1;
  transform: none;
}

.cfd-intro {
  --intro-orange: #e65f18;
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
  color: #173247;
  background:
    radial-gradient(circle at 72% 46%, rgba(255, 181, 106, .56), transparent 21%),
    radial-gradient(circle at 26% 20%, rgba(255, 255, 255, .86), transparent 32%),
    linear-gradient(125deg, rgba(255, 253, 251, .98), rgba(248, 235, 224, .97) 55%, rgba(255, 248, 241, .98));
  isolation: isolate;
  animation: intro-arrive .65s ease both;
}

.cfd-intro.leaving {
  pointer-events: none;
  animation: intro-leave .68s cubic-bezier(.7, 0, .3, 1) forwards;
}

.intro-grid {
  position: absolute;
  inset: -20%;
  opacity: .38;
  background-image:
    linear-gradient(rgba(23, 105, 170, .09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23, 105, 170, .09) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(circle at 62% 50%, #000 0 18%, transparent 66%);
  transform: perspective(900px) rotateX(62deg) translateY(21%);
  animation: intro-grid-drift 13s linear infinite;
}

.intro-flow {
  position: absolute;
  inset: 7% -9% 3% 34%;
  filter: drop-shadow(0 24px 42px rgba(153, 76, 28, .12));
}

.intro-flow > i {
  --i: 1;
  position: absolute;
  left: calc((var(--i) - 1) * 1.75%);
  top: calc(4% + var(--i) * 4.25%);
  width: calc(100% - var(--i) * 2.1%);
  height: calc(74% - var(--i) * 2.3%);
  border: 1px solid rgba(222, 91, 20, calc(.2 + var(--i) * .006));
  border-left-color: transparent;
  border-radius: 48% 58% 53% 44%;
  transform: rotate(calc((var(--i) - 9) * .9deg));
  animation: streamline-pulse calc(5.8s + var(--i) * .12s) ease-in-out infinite alternate;
}

.intro-vortex {
  position: absolute;
  left: 50%;
  top: 39%;
  display: grid;
  place-items: center;
  width: clamp(94px, 10vw, 148px);
  aspect-ratio: 1;
  border: 1px solid rgba(230, 95, 24, .45);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 250, 245, .9), rgba(255, 158, 87, .16) 52%, transparent 72%);
  box-shadow: 0 0 0 18px rgba(230, 95, 24, .035), 0 0 0 42px rgba(230, 95, 24, .025);
  animation: vortex-float 5s ease-in-out infinite;
}

.intro-vortex b { font: 400 clamp(35px, 4vw, 58px)/1 Georgia, serif; color: var(--intro-orange); }
.intro-vortex small { margin-top: -22px; color: #8b5d3f; font: 8px/1 var(--font-mono); letter-spacing: .16em; }

.intro-copy {
  position: relative;
  z-index: 2;
  width: min(1180px, calc(100% - 56px));
  padding-right: 48%;
}

.intro-kicker {
  color: #9b5830;
  font: 700 11px/1 var(--font-mono);
  letter-spacing: .17em;
}

.intro-copy h1 {
  margin: 18px 0 18px;
  font-size: clamp(62px, 8vw, 126px);
  font-weight: 650;
  line-height: .94;
  letter-spacing: -.065em;
}

.intro-copy h1 span { color: var(--color-primary-600); }
.intro-copy p { max-width: 520px; margin: 0 0 32px; color: #526a7a; font-size: clamp(15px, 1.4vw, 19px); line-height: 1.8; }

.intro-enter {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 17px;
  border: 1px solid rgba(23, 105, 170, .28);
  border-radius: 7px;
  background: rgba(255, 255, 255, .72);
  color: var(--color-primary-700);
  box-shadow: 0 14px 36px rgba(45, 73, 94, .09);
  backdrop-filter: blur(12px);
  font-size: 13px;
}

.intro-enter svg:last-child { margin-left: 5px; animation: intro-arrow 1.5s ease-in-out infinite; }

.knowledge-map-section { background: var(--color-surface-50); }
.knowledge-map-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.knowledge-map-grid > a { position: relative; min-height: 178px; padding: 22px; border: 1px solid var(--color-border-200); border-radius: 8px; background: #fff; }
.knowledge-map-grid > a:hover { border-color: var(--color-primary-500); box-shadow: 0 12px 30px rgba(24, 64, 96, .07); }
.knowledge-map-grid span { color: var(--color-primary-600); font: 11px var(--font-mono); }
.knowledge-map-grid h3 { margin: 26px 0 7px; font-size: 18px; }
.knowledge-map-grid p { margin: 0; color: var(--color-text-600); font-size: 12px; line-height: 1.75; }
.knowledge-map-grid svg { position: absolute; right: 18px; bottom: 18px; color: var(--color-primary-600); }

.intro-readout {
  position: absolute;
  right: clamp(24px, 5vw, 74px);
  bottom: clamp(22px, 5vh, 54px);
  display: flex;
  gap: 22px;
  color: #8a6c59;
  font: 9px var(--font-mono);
  letter-spacing: .08em;
}

.intro-readout b { margin-left: 4px; color: #345267; font-weight: 600; }

@keyframes intro-arrive { from { transform: scale(1.025); } }
@keyframes intro-leave { to { opacity: 0; transform: scale(1.035); filter: blur(9px); } }
@keyframes intro-grid-drift { to { background-position: 46px 46px, 46px 46px; } }
@keyframes streamline-pulse { to { transform: rotate(calc((var(--i) - 9) * .9deg + 2deg)) translate3d(9px, -4px, 0); opacity: .55; } }
@keyframes vortex-float { 50% { transform: translate3d(10px, -9px, 0) scale(1.04); } }
@keyframes intro-arrow { 50% { transform: translateX(4px); } }

@media (max-width: 820px) {
  .knowledge-map-grid { grid-template-columns: repeat(2, 1fr); }
  .intro-copy { padding: 0 10% 42%; text-align: center; }
  .intro-copy p { margin-inline: auto; }
  .intro-flow { inset: 46% -38% -12% -20%; opacity: .8; }
  .intro-vortex { left: 48%; top: 32%; }
  .intro-readout { right: 50%; transform: translateX(50%); white-space: nowrap; }
}

@media (max-width: 560px) {
  .knowledge-map-grid { grid-template-columns: 1fr; }
  .intro-copy { width: calc(100% - 28px); padding: 0 4% 48%; }
  .intro-copy h1 { font-size: clamp(58px, 20vw, 84px); }
  .intro-copy p { font-size: 14px; line-height: 1.7; }
  .intro-enter { width: 100%; justify-content: center; font-size: 12px; }
  .intro-flow { inset: 48% -58% -8% -44%; }
  .intro-readout { gap: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .home-interface, .cfd-intro, .cfd-intro.leaving, .intro-grid, .intro-flow > i,
  .intro-vortex, .intro-enter svg:last-child { animation: none; transition: none; }
}
</style>
