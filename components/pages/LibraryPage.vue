<script setup lang="ts">
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, Copy, Check, ArrowRight, Clock, BookOpen, ChevronRight, Share2 } from 'lucide-vue-next'
import { articles as fallbackArticles, algorithms, formulas as fallbackFormulas, tools, forumTopics } from '~/utils/content'
const route = useRoute()
const store = usePlatformStore()
interface KnowledgeArticle {
  slug: string
  title: string
  summary: string
  category: string
  level: string
  read: string
  tags: string[]
  bodyHtml?: string
  author?: string
  updatedAt?: string
}
const { data: knowledgeData } = await useFetch<{ items: KnowledgeArticle[], total: number }>('/api/knowledge', { query: { limit: 100 } })
const articles = computed<KnowledgeArticle[]>(() => {
  const merged = new Map<string, KnowledgeArticle>(fallbackArticles.map(item => [item.slug, item]))
  for (const item of knowledgeData.value?.items || []) {
    const fallback = merged.get(item.slug)
    merged.set(item.slug, { ...fallback, ...item, tags: item.tags?.length ? item.tags : (fallback?.tags || []) })
  }
  return [...merged.values()]
})
const { data: formulaData } = await useFetch<{ items: typeof fallbackFormulas }>('/api/formulas')
const formulas = computed(() => formulaData.value?.items?.length ? formulaData.value.items : fallbackFormulas)
const query = ref(String(route.query.q || ''))
const category = ref('全部')
const copied = ref('')
const isDetail = computed(() => route.path.startsWith('/knowledge/') && route.path.split('/').length > 2)
const article = computed(() => articles.value.find(a => a.slug === route.path.split('/')[2]) || articles.value[0])
const knowledgeCategoryOrder = ['知识库导航', '流体力学基础', '控制方程与物理建模', 'CFD 数值方法', '网格与离散质量', '边界条件与初始化', '湍流与近壁建模', '传热与可压缩流', '多相流与组分输运', '验证确认与后处理', 'Modelica 系统建模', '数值离散方法']
const categories = computed(() => ['全部', ...[...new Set(articles.value.map(item => item.category).filter(Boolean))].sort((a, b) => {
  const aIndex = knowledgeCategoryOrder.indexOf(a)
  const bIndex = knowledgeCategoryOrder.indexOf(b)
  return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex) || a.localeCompare(b, 'zh-CN')
})])
const categoryCounts = computed(() => Object.fromEntries(categories.value.map(item => [item, item === '全部' ? articles.value.length : articles.value.filter(articleItem => articleItem.category === item).length])))
const relatedArticles = computed(() => articles.value.filter(item => item.category === article.value?.category).slice(0, 8))
const filteredArticles = computed(() => articles.value.filter(a => (category.value==='全部'||a.category===category.value) && (!query.value || `${a.title}${a.summary}${a.tags.join('')}`.toLowerCase().includes(query.value.toLowerCase()))))
const searchResults = computed(() => {
  const q = query.value.toLowerCase()
  return [
    ...articles.value.map(x => ({type:'知识', title:x.title, text:x.summary, to:`/knowledge/${x.slug}`, meta:`${x.category} · ${x.read}`})),
    ...algorithms.map(x => ({type:'算法', title:x.name, text:`${x.use}；${x.limitation}`, to:'/algorithms', meta:`${x.order} · ${x.stability}`})),
    ...formulas.value.map(x => ({type:'公式', title:x.name, text:x.note, to:'/formulas', meta:x.category})),
    ...tools.map(x => ({type:'工具', title:x.name, text:x.description, to:`/simulation/${x.slug}`, meta:`${x.type} · ${x.status}`})),
    ...forumTopics.map(x => ({type:'社区', title:x.title, text:`${x.replies} 个回复`, to:`/forum/posts/${x.id}`, meta:x.section}))
  ].filter(x => !q || `${x.title}${x.text}${x.meta}`.toLowerCase().includes(q))
})
async function copy(text:string,name:string){ await navigator.clipboard?.writeText(text); copied.value=name; setTimeout(()=>copied.value='',1600) }
</script>

<template>
  <div v-if="isDetail" class="page reading-page">
    <div class="container breadcrumb"><NuxtLink to="/knowledge">知识库</NuxtLink><ChevronRight :size="14"/><span>{{ article.category }}</span><ChevronRight :size="14"/><span>{{ article.title }}</span></div>
    <div class="container reading-layout">
      <aside class="chapter-tree"><small>专题知识路径</small><strong>{{ article.category }}</strong><NuxtLink v-for="(item,i) in relatedArticles" :key="item.slug" :to="`/knowledge/${item.slug}`" :class="{active:item.slug===article.slug}"><span>{{String(i+1).padStart(2,'0')}}</span>{{ item.title }}</NuxtLink></aside>
      <article class="article-body">
        <template v-if="article.bodyHtml">
          <header><span class="content-label">{{ article.category }}</span><h1>{{ article.title }}</h1><p class="article-lead">{{ article.summary }}</p><div class="article-meta"><span>{{ article.author || '流研工坊编辑部' }}</span><span><Clock :size="15"/>{{ article.read }}</span><span>{{ article.updatedAt ? `更新于 ${new Date(article.updatedAt).toLocaleDateString('zh-CN')}` : '知识库导入内容' }}</span></div><div class="tag-row"><span v-for="tag in article.tags" :key="tag">{{tag}}</span><span>{{article.level}}</span></div></header>
          <div class="imported-knowledge-body" v-html="article.bodyHtml"></div>
          <div class="article-actions"><button :class="{active:store.bookmarks.includes(article.slug)}" @click="store.toggleBookmark(article.slug)"><BookmarkCheck v-if="store.bookmarks.includes(article.slug)" :size="18"/><Bookmark v-else :size="18"/>{{store.bookmarks.includes(article.slug)?'已收藏':'收藏'}}</button><button><Share2 :size="18"/>分享</button></div>
        </template>
        <template v-else>
        <header><span class="content-label">{{ article.category }}</span><h1>{{ article.title }}</h1><p class="article-lead">{{ article.summary }}</p><div class="article-meta"><span>周致远 · 数值方法编辑</span><span><Clock :size="15"/>{{ article.read }}</span><span>更新于 2026-07-28</span></div><div class="tag-row"><span v-for="tag in article.tags" :key="tag">{{tag}}</span><span>{{article.level}}</span></div></header>
        <div class="article-summary"><strong>本文要点</strong><p>建立物理量、守恒形式和离散方程之间的联系；识别模型假设；用量纲与极限工况检查推导结果。</p></div>
        <section id="background"><h2>1. 问题与物理背景</h2><p>计算流体力学的核心不是把连续方程直接交给计算机，而是把一个物理问题转化为有限、守恒且可以验证的代数系统。任何可靠的求解都应明确研究对象、控制体、时间尺度与边界条件。</p><p>对不可压缩牛顿流体，质量守恒要求速度场满足零散度条件。动量守恒则刻画惯性、压力、黏性和体力之间的平衡：</p><div class="equation"><span>∂u/∂t + (u · ∇)u = −(1/ρ)∇p + ν∇²u + f</span><small>(1)</small><button @click="copy('momentum equation','eq1')"><Check v-if="copied==='eq1'" :size="15"/><Copy v-else :size="15"/></button></div></section>
        <section id="conservation"><h2>2. 守恒形式与控制体</h2><p>积分守恒形式是有限体积离散的自然起点。通过高斯定理，体积分中的散度项被转换为控制体各表面的通量之和，从而使相邻控制体共享同一面通量。</p><div class="callout info"><strong>工程提示</strong><p>守恒不等于精确。严格守恒的离散格式仍可能有较大的耗散或色散误差，因此必须同时检查精度、稳定性和网格收敛性。</p></div><table><thead><tr><th>方程项</th><th>物理含义</th><th>数值关注点</th></tr></thead><tbody><tr><td>∂u/∂t</td><td>局部加速度</td><td>时间步长与阶数</td></tr><tr><td>u · ∇u</td><td>对流惯性</td><td>有界性与数值耗散</td></tr><tr><td>∇p</td><td>压力驱动</td><td>压力—速度耦合</td></tr><tr><td>ν∇²u</td><td>黏性扩散</td><td>网格正交性</td></tr></tbody></table></section>
        <section id="discretization"><h2>3. 从连续方程到离散系统</h2><p>空间离散决定各控制体之间如何交换质量、动量与能量。时间离散决定不同时间层之间的信息传播。离散后通常得到稀疏线性或非线性代数系统。</p><pre><code>while residual &gt; tolerance:\n  solve_momentum()\n  solve_pressure_correction()\n  correct_fluxes()</code></pre></section>
        <section id="verification"><h2>4. 验证与可信度</h2><p>计算结束不意味着结论成立。至少需要检查残差、全局守恒、网格敏感性以及与解析解、实验数据或公开基准的偏差。</p><ol><li>先确认输入量纲与边界条件。</li><li>观察残差是否稳定下降，避免只看单一方程。</li><li>核对质量或能量的全局不平衡。</li><li>使用至少三组网格评估离散误差。</li></ol></section>
        <div class="article-actions"><button :class="{active:store.bookmarks.includes(article.slug)}" @click="store.toggleBookmark(article.slug)"><BookmarkCheck v-if="store.bookmarks.includes(article.slug)" :size="18"/><Bookmark v-else :size="18"/>{{store.bookmarks.includes(article.slug)?'已收藏':'收藏'}}</button><button><Share2 :size="18"/>分享</button></div>
        <section class="references"><h2>参考与修订</h2><p>[1] Ferziger, Perić & Street, Computational Methods for Fluid Dynamics.<br>[2] Versteeg & Malalasekera, An Introduction to Computational Fluid Dynamics.</p><small>修订 1.3 · 补充了守恒检查与网格收敛说明</small></section>
        </template>
      </article>
      <aside v-if="!article.bodyHtml" class="page-toc"><small>本页目录</small><a href="#background">问题与物理背景</a><a href="#conservation">守恒形式与控制体</a><a href="#discretization">离散系统</a><a href="#verification">验证与可信度</a><div><strong>关联工具</strong><NuxtLink to="/simulation/convection-diffusion">一维对流—扩散 <ArrowRight :size="14"/></NuxtLink></div></aside>
      <aside v-else class="page-toc"><small>数据库知识文章</small><strong>{{article.category}}</strong><span>{{article.read}} · {{article.level}}</span><div><strong>内容标签</strong><span v-for="tag in article.tags" :key="tag">{{tag}}</span></div></aside>
    </div>
  </div>

  <div v-else-if="route.path==='/knowledge'" class="page discovery-page">
    <section class="page-hero"><div class="container"><span class="kicker">KNOWLEDGE BASE</span><h1>体系化理解 CFD</h1><p>从物理守恒到工程验证，用结构化路径组织理论、算法与软件实践。</p><div class="page-search"><Search :size="19"/><input v-model="query" placeholder="搜索知识主题、概念或软件…"></div></div></section>
    <div class="container discovery-layout"><aside class="filter-aside"><div class="aside-title"><strong>知识树</strong><SlidersHorizontal :size="17"/></div><button v-for="item in categories" :key="item" :class="{active:category===item}" @click="category=item"><span>{{item}}</span><small>{{categoryCounts[item]}}</small></button></aside><section class="content-list"><div class="list-toolbar"><div><strong>{{category}}</strong><span>共 {{filteredArticles.length}} 篇</span></div><select><option>推荐排序</option><option>最近更新</option><option>阅读时长</option></select></div><NuxtLink v-for="item in filteredArticles" :key="item.slug" :to="`/knowledge/${item.slug}`" class="article-row"><div><span>{{item.category}}</span><h2>{{item.title}}</h2><p>{{item.summary}}</p><div><i v-for="tag in item.tags" :key="tag">{{tag}}</i></div></div><aside><strong>{{item.level}}</strong><small>{{item.read}}</small><ArrowRight :size="18"/></aside></NuxtLink><div v-if="!filteredArticles.length" class="empty-state"><BookOpen :size="34"/><h3>未找到匹配文章</h3><p>尝试清除筛选或使用更宽泛的关键词。</p><button class="button secondary" @click="query='';category='全部'">清除筛选</button></div></section><aside class="discovery-side"><div class="side-card"><small>推荐路径</small><strong>CFD 基础到验证</strong><p>9 个专题 · {{articles.length}} 篇内容</p><div class="progress"><i style="width:18%"></i></div><NuxtLink to="/knowledge/knowledge-library-roadmap">查看知识地图</NuxtLink></div><div class="side-card"><strong>热门标签</strong><div class="tag-cloud"><span>SIMPLE</span><span>y+</span><span>有限体积</span><span>RANS</span><span>网格</span><span>Modelica</span></div></div></aside></div>
  </div>

  <div v-else-if="route.path==='/algorithms'" class="page">
    <section class="page-hero"><div class="container"><span class="kicker">ALGORITHM LIBRARY</span><h1>算法库</h1><p>比较适用问题、精度、稳定性与计算成本，为离散和求解选择提供依据。</p></div></section>
    <div class="container content-section"><div class="filter-strip"><button class="active">全部用途</button><button>压力—速度耦合</button><button>空间离散</button><button>线性求解</button><button>时间推进</button></div><div class="comparison-note"><span>可勾选 2–4 个算法进行对比</span><button class="button secondary small" disabled>开始对比</button></div><div class="algorithm-table"><div class="table-head"><span>算法</span><span>主要用途</span><span>精度 / 类型</span><span>稳定性</span><span>成本</span><span>主要限制</span></div><div v-for="item in algorithms" :key="item.name" class="table-row"><span><input type="checkbox"><strong>{{item.name}}</strong></span><span>{{item.use}}</span><span>{{item.order}}</span><span><i class="status success">{{item.stability}}</i></span><span>{{item.cost}}</span><span>{{item.limitation}}</span></div></div><section class="algorithm-detail-card"><div><span class="kicker">FEATURED METHOD</span><h2>SIMPLE 压力—速度耦合</h2><p>通过动量预测、压力修正和通量校正，在稳态不可压缩流求解中迭代满足连续性。</p></div><dl><div><dt>适用问题</dt><dd>稳态不可压缩流</dd></div><div><dt>收敛控制</dt><dd>压力 / 速度欠松弛</dd></div><div><dt>关联工具</dt><dd><NuxtLink to="/simulation/lid-driven-cavity">方腔顶盖驱动流</NuxtLink></dd></div></dl></section></div>
  </div>

  <FormulaConverter v-else-if="route.path==='/formulas/convert'" />

  <div v-else-if="route.path==='/formulas'" class="page">
    <section class="page-hero slim"><div class="container formula-page-heading"><div><span class="kicker">FORMULA REFERENCE</span><h1>公式速查</h1><p>查找公式、核对量纲，并以 LaTeX 或纯文本复制。</p></div><NuxtLink to="/formulas/convert" class="button large">修复乱码公式 <ArrowRight :size="17"/></NuxtLink><div class="page-search"><Search :size="19"/><input v-model="query" placeholder="搜索名称、符号或物理量…"></div></div></section>
    <div class="container formula-layout"><aside class="filter-aside"><strong>分类</strong><button class="active">全部公式 <small>{{formulas.length}}</small></button><button>控制方程</button><button>无量纲数</button><button>湍流</button><button>传热</button><button>数值稳定性</button></aside><section class="formula-cards"><div v-for="item in formulas.filter(f=>!query||`${f.name}${f.category}${f.note}`.toLowerCase().includes(query.toLowerCase()))" :key="item.name" class="formula-card"><div class="formula-meta"><span>{{item.category}}</span><button @click="store.toggleBookmark('formula-'+item.name)"><BookmarkCheck v-if="store.bookmarks.includes('formula-'+item.name)" :size="17"/><Bookmark v-else :size="17"/></button></div><h2>{{item.name}}</h2><div class="formula-display">{{item.plain}}</div><p>{{item.note}}</p><div class="formula-actions"><button @click="copy(item.latex,item.name+'latex')"><Check v-if="copied===item.name+'latex'" :size="15"/><Copy v-else :size="15"/>LaTeX</button><button @click="copy(item.plain,item.name+'plain')"><Check v-if="copied===item.name+'plain'" :size="15"/><Copy v-else :size="15"/>纯文本</button></div></div></section><aside class="discovery-side"><div class="side-card"><strong>最近复制</strong><p v-if="!copied">复制过的公式将在本次会话中显示。</p><span v-else>{{copied.replace('latex','').replace('plain','')}}</span></div><div class="side-card"><strong>使用提示</strong><p>关键工程计算应同时核对公式的适用假设、变量单位与来源。</p></div></aside></div>
  </div>

  <div v-else class="page search-page">
    <section class="page-hero slim"><div class="container"><h1>全站搜索</h1><form class="page-search large" @submit.prevent><Search :size="20"/><input v-model="query" placeholder="输入关键词…"><button class="button">搜索</button></form><p>找到 {{searchResults.length}} 条相关内容</p></div></section>
    <div class="container search-layout"><aside class="filter-aside"><strong>内容类型</strong><button class="active">全部 <small>{{searchResults.length}}</small></button><button>知识</button><button>算法</button><button>公式</button><button>CFD 工具</button><button>Modelica</button><button>社区</button></aside><section class="search-result-list"><NuxtLink v-for="item in searchResults" :key="item.type+item.title" :to="item.to"><span>{{item.type}}</span><h2>{{item.title}}</h2><p>{{item.text}}</p><small>{{item.meta}}</small></NuxtLink><div v-if="!searchResults.length" class="empty-state"><Search :size="34"/><h3>没有找到“{{query}}”</h3><p>尝试缩短关键词、检查拼写，或浏览推荐入口。</p><NuxtLink to="/knowledge" class="button secondary">浏览知识库</NuxtLink></div></section></div>
  </div>
</template>
