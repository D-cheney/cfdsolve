<script setup lang="ts">
import { ArrowRight, BookOpen, FlaskConical, Boxes, MessagesSquare, Check, Copy, Activity, Layers3 } from 'lucide-vue-next'
import { articles, algorithms, formulas, tools, forumTopics } from '~/utils/content'
const activeTool = ref(0)
const copied = ref('')
async function copyFormula(text: string, name: string) { await navigator.clipboard?.writeText(text); copied.value = name; setTimeout(() => copied.value = '', 1600) }
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="contour-bg"></div>
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> CFD × MODELICA ENGINEERING LAB</div>
          <h1>让每一次仿真<br>都<strong>可理解、可复现</strong></h1>
          <p>从数值方法到在线求解，从系统模型到工程讨论。把知识、计算与验证组织成一条清晰的学习和实践路径。</p>
          <div class="hero-actions"><NuxtLink to="/simulation" class="button large">进入仿真平台 <ArrowRight :size="18" /></NuxtLink><NuxtLink to="/knowledge" class="button secondary large">浏览知识库</NuxtLink></div>
          <div class="trust-row"><span><Check :size="15" />基础工具免费使用</span><span><Check :size="15" />结果可下载</span><span><Check :size="15" />浏览器本地保存</span></div>
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
        <div class="section-heading"><div><span class="kicker">一体化工作流</span><h2>从原理到结果，不断链</h2></div><p>每个知识点都能连接到公式、算法、可运行案例和真实工程讨论。</p></div>
        <div class="capability-grid home-capability-grid">
          <NuxtLink to="/knowledge" class="capability-card"><div class="cap-icon"><BookOpen /></div><span>01</span><h3>系统化学习</h3><p>沿着控制方程、离散方法、耦合算法与验证路径建立知识结构。</p><div class="micro-tree"><i></i><b></b><b></b><b></b></div><strong class="card-link">进入知识库 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/simulation" class="capability-card"><div class="cap-icon"><FlaskConical /></div><span>02</span><h3>CFD 工具</h3><p>配置参数、观察收敛、核对解析解，并下载可复核的计算数据。</p><div class="micro-curve"><i></i></div><strong class="card-link">运行仿真 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/cae" class="capability-card"><div class="cap-icon"><Layers3 /></div><span>03</span><h3>CAE 分析</h3><p>完成结构、热与模态的真实方程组装、结果检查和解析解校核。</p><div class="micro-curve"><i></i></div><strong class="card-link">创建分析 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/modelica" class="capability-card"><div class="cap-icon"><Boxes /></div><span>04</span><h3>Modelica 建模</h3><p>编写模型、检查方程、配置实验，分析多物理系统动态响应。</p><div class="micro-nodes"><b></b><i></i><b></b><i></i><b></b></div><strong class="card-link">打开工作台 <ArrowRight :size="16" /></strong></NuxtLink>
          <NuxtLink to="/forum" class="capability-card"><div class="cap-icon"><MessagesSquare /></div><span>05</span><h3>解决工程问题</h3><p>围绕算法、软件、论文和案例交换可以复现的分析过程。</p><div class="micro-discussion"><i></i><i></i><i></i></div><strong class="card-link">浏览社区 <ArrowRight :size="16" /></strong></NuxtLink>
        </div>
      </div>
    </section>

    <section class="section path-section">
      <div class="container path-layout">
        <div class="path-intro"><span class="kicker">推荐学习路径</span><h2>用五个阶段构建<br>可信的 CFD 能力</h2><p>不从软件按钮开始，而从物理假设、离散误差和验证标准开始。每一阶段都有明确完成条件。</p><NuxtLink to="/knowledge" class="text-link">查看完整路径 <ArrowRight :size="16" /></NuxtLink></div>
        <div class="learning-path">
          <div v-for="(item, i) in ['流体基础','离散方法','压力—速度耦合','湍流与近壁面','工程验证']" :key="item" class="path-step" :class="{ recommended: i===0 }"><span>0{{ i+1 }}</span><div><small v-if="i===0">建议从这里开始</small><h3>{{ item }}</h3><p>{{ ['理解守恒定律与控制方程','从积分方程建立离散矩阵','掌握 SIMPLE / PISO 的收敛机制','选择模型并规划首层网格','量化数值误差与模型不确定度'][i] }}</p><em>{{ [8,11,9,13,7][i] }} 篇内容 · {{ ['4h','6h','5h','7h','5h'][i] }}</em></div></div>
        </div>
      </div>
    </section>

    <section class="section simulation-showcase">
      <div class="container">
        <div class="section-heading"><div><span class="kicker">在线仿真</span><h2>小而可信的数值实验</h2></div><p>所有工具都包含参数边界、数值警告、参考结果和结果导出。</p></div>
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
        <div class="section-heading"><div><span class="kicker">精选知识</span><h2>今天值得深入的内容</h2></div><NuxtLink to="/knowledge" class="text-link">查看全部知识 <ArrowRight :size="16" /></NuxtLink></div>
        <div class="featured-layout"><NuxtLink :to="`/knowledge/${articles[0].slug}`" class="featured-article"><div class="article-graphic"><span>∂u/∂t + u·∇u</span><i></i></div><div><small>{{ articles[0].category }} · {{ articles[0].read }}</small><h3>{{ articles[0].title }}</h3><p>{{ articles[0].summary }}</p><strong>阅读全文 <ArrowRight :size="15" /></strong></div></NuxtLink><div class="article-list"><NuxtLink v-for="item in articles.slice(1,5)" :key="item.slug" :to="`/knowledge/${item.slug}`"><span>{{ item.category }}</span><h3>{{ item.title }}</h3><p>{{ item.summary }}</p><small>{{ item.level }} · {{ item.read }}</small></NuxtLink></div></div>
      </div>
    </section>

    <section class="section algorithm-formula">
      <div class="container split-sections">
        <div><div class="subsection-title"><div><span class="kicker">算法库</span><h2>选择正确的数值方法</h2></div><NuxtLink to="/algorithms">全部算法</NuxtLink></div><div class="algorithm-list"><NuxtLink v-for="item in algorithms.slice(0,4)" :key="item.name" to="/algorithms"><strong>{{ item.name }}</strong><span>{{ item.use }}</span><small>{{ item.stability }}</small><ArrowRight :size="15" /></NuxtLink></div></div>
        <div><div class="subsection-title"><div><span class="kicker">公式速查</span><h2>让关键表达式随手可得</h2></div><div class="formula-heading-links"><NuxtLink to="/formulas/convert">乱码转换</NuxtLink><NuxtLink to="/formulas">全部公式</NuxtLink></div></div><div class="formula-list"><div v-for="item in formulas.slice(0,4)" :key="item.name"><span>{{ item.category }}</span><strong>{{ item.plain }}</strong><small>{{ item.name }} · {{ item.note }}</small><button :aria-label="`复制${item.name}`" @click="copyFormula(item.latex,item.name)"><Check v-if="copied===item.name" :size="16"/><Copy v-else :size="16"/>{{ copied===item.name?'已复制':'复制' }}</button></div></div></div>
      </div>
    </section>

    <section class="section community-section">
      <div class="container"><div class="section-heading"><div><span class="kicker">工程社区</span><h2>讨论可定位的问题，沉淀可复用的答案</h2></div><NuxtLink to="/forum" class="button secondary">进入社区</NuxtLink></div><div class="topic-table"><div class="topic-head"><span>状态</span><span>主题</span><span>板块</span><span>回复 / 浏览</span><span>最后活跃</span></div><NuxtLink v-for="topic in forumTopics" :key="topic.id" :to="`/forum/posts/${topic.id}`"><span><i :class="topic.status==='已解决'?'resolved':topic.status==='精华'?'featured':''">{{ topic.status }}</i></span><strong>{{ topic.title }}</strong><span>{{ topic.section }}</span><span>{{ topic.replies }} / {{ topic.views }}</span><span>{{ topic.time }}</span></NuxtLink></div></div>
    </section>
  </div>
</template>
