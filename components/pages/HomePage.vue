<script setup lang="ts">
import { ArrowRight, BookOpen, FlaskConical, Boxes, Calculator, Check, Copy } from 'lucide-vue-next'
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
  }, 760)
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
      role="button"
      aria-label="进入 CFD菜鸟功能页面"
      tabindex="0"
      @click="revealIntro"
      @keydown="handleIntroKey"
    ></div>

    <div class="home-interface" :inert="showIntro ? true : undefined" :aria-hidden="showIntro ? 'true' : undefined">
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
:global(.app-header) { transition: opacity .5s ease; }
:global(html.home-intro-open .app-header) {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.home-interface {
  opacity: 0;
  transform: translateY(18px) scale(.994);
  transition: opacity .76s ease, transform .76s cubic-bezier(.22, 1, .36, 1);
}

.interface-ready .home-interface {
  opacity: 1;
  transform: none;
}

.cfd-intro {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
  outline: none;
  touch-action: manipulation;
  background: transparent;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: opacity, transform;
}

.cfd-intro.leaving {
  pointer-events: none;
  animation: intro-leave .76s cubic-bezier(.4, 0, .2, 1) forwards;
}

.knowledge-map-section { background: transparent; }
.knowledge-map-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.knowledge-map-grid > a { position: relative; min-height: 178px; padding: 22px; border: 1px solid var(--color-border-200); border-radius: 8px; background: transparent; }
.knowledge-map-grid > a:hover { border-color: var(--color-primary-500); box-shadow: 0 12px 30px rgba(24, 64, 96, .07); }
.knowledge-map-grid span { color: var(--color-primary-600); font: 11px var(--font-mono); }
.knowledge-map-grid h3 { margin: 26px 0 7px; font-size: 18px; }
.knowledge-map-grid p { margin: 0; color: var(--color-text-600); font-size: 12px; line-height: 1.75; }
.knowledge-map-grid svg { position: absolute; right: 18px; bottom: 18px; color: var(--color-primary-600); }

:global(.home-page .hero-section) { background: transparent; }
:global(.home-page .capability-card) { background: transparent; }
:global(.home-page .capability-card:hover) { background: transparent; }
:global(.home-page .knowledge-feature) { background: transparent; }
:global(.home-page .featured-article),
:global(.home-page .article-list a),
:global(.home-page .tool-preview) { background-color: transparent; }
:global(.home-page .simulation-showcase) { background: rgba(16, 43, 65, .91); }

/* Functional entry points float above the flow without rectangular card chrome. */
:global(.home-page .capability-grid) {
  gap: clamp(24px, 3.5vw, 54px);
}

:global(.home-page .capability-card) {
  isolation: isolate;
  overflow: visible;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  filter: drop-shadow(0 14px 14px rgba(25, 63, 91, .08));
  transition: transform .32s cubic-bezier(.22, 1, .36, 1), filter .32s ease;
}

:global(.home-page .capability-card::before) {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 8% 0 2%;
  border-radius: 50%;
  background: radial-gradient(ellipse at 35% 42%, rgba(255, 252, 247, .58), rgba(255, 244, 232, .18) 48%, transparent 75%);
  filter: blur(18px);
  opacity: .56;
  pointer-events: none;
  transition: opacity .32s ease, transform .32s ease;
}

:global(.home-page .capability-card:hover) {
  transform: translateY(-9px);
  filter: drop-shadow(0 22px 18px rgba(25, 63, 91, .13));
}

:global(.home-page .capability-card:hover::before) {
  opacity: .9;
  transform: scale(1.06);
}

:global(.home-page .capability-card .cap-icon) {
  border: 0;
  background: rgba(238, 246, 252, .56);
  box-shadow: 0 10px 28px rgba(23, 105, 170, .12);
  backdrop-filter: blur(5px);
  transition: transform .32s cubic-bezier(.22, 1, .36, 1), box-shadow .32s ease;
}

:global(.home-page .capability-card:hover .cap-icon) {
  transform: translateY(-3px) rotate(-3deg);
  box-shadow: 0 16px 32px rgba(23, 105, 170, .18);
}

:global(.home-page .capability-card .card-link) {
  width: max-content;
  text-shadow: 0 6px 18px rgba(23, 105, 170, .16);
  transition: gap .24s ease, transform .24s ease;
}

:global(.home-page .capability-card:hover .card-link) {
  gap: 12px;
  transform: translateX(3px);
}

.knowledge-map-grid > a {
  isolation: isolate;
  overflow: visible;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  filter: drop-shadow(0 12px 14px rgba(25, 63, 91, .06));
  transition: transform .3s cubic-bezier(.22, 1, .36, 1), filter .3s ease;
}

.knowledge-map-grid > a::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 12% 0 4%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 251, 245, .42), transparent 72%);
  filter: blur(16px);
  pointer-events: none;
}

.knowledge-map-grid > a:hover {
  border-color: transparent;
  box-shadow: none;
  transform: translateY(-7px);
  filter: drop-shadow(0 20px 18px rgba(25, 63, 91, .12));
}

:global(.home-page .hero-actions .button) {
  border: 0;
  border-radius: 999px;
  box-shadow: 0 14px 30px rgba(14, 85, 143, .18);
  transition: transform .26s cubic-bezier(.22, 1, .36, 1), box-shadow .26s ease;
}

:global(.home-page .hero-actions .button:hover) {
  transform: translateY(-4px);
  box-shadow: 0 20px 38px rgba(14, 85, 143, .24);
}

:global(.home-page .hero-actions .button.secondary) {
  background: rgba(255, 255, 255, .18);
  box-shadow: 0 12px 28px rgba(25, 63, 91, .09);
}

@keyframes intro-leave { to { opacity: 0; transform: translateZ(0) scale(1.018); } }

@media (max-width: 820px) {
  .knowledge-map-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .knowledge-map-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .home-interface, .cfd-intro, .cfd-intro.leaving { animation: none; transition: none; }
}
</style>
