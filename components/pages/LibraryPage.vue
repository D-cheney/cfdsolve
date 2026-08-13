<script setup lang="ts">
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, Copy, Check, ArrowRight, Clock, BookOpen, ChevronRight, Share2, Layers3, Route, Grid2X2, List, Wrench, CheckCircle2 } from 'lucide-vue-next'
import { articles as fallbackArticles, algorithms, formulas as fallbackFormulas, tools, caeTools, forumTopics, knowledgeModules, learningPaths } from '~/utils/content'
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
const { data: knowledgeData, error: knowledgeError } = await useFetch<{ items: KnowledgeArticle[], total: number }>('/api/knowledge', { query: { limit: 500 } })
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
const articleSlug = computed(() => route.path.split('/')[2] || '')
const { data: detailData } = await useFetch<KnowledgeArticle>(() => `/api/knowledge/${articleSlug.value}`, { immediate: isDetail.value })
const article = computed(() => {
  if (detailData.value?.slug === articleSlug.value) return detailData.value
  return articles.value.find(a => a.slug === articleSlug.value)
})
const knowledgeCategoryOrder = ['知识库导航', '流体力学基础', '控制方程与物理建模', 'CFD 数值方法', '网格与离散质量', '边界条件与初始化', '湍流与近壁建模', '传热与可压缩流', '多相流与组分输运', '验证确认与后处理', 'Modelica 系统建模', '数值离散方法']
const categories = computed(() => ['全部', ...[...new Set(articles.value.map(item => item.category).filter(Boolean))].sort((a, b) => {
  const aIndex = knowledgeCategoryOrder.indexOf(a)
  const bIndex = knowledgeCategoryOrder.indexOf(b)
  return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex) || a.localeCompare(b, 'zh-CN')
})])
const categoryCounts = computed(() => Object.fromEntries(categories.value.map(item => [item, item === '全部' ? articles.value.length : articles.value.filter(articleItem => articleItem.category === item).length])))
const relatedArticles = computed(() => articles.value.filter(item => item.category === article.value?.category && item.slug !== article.value?.slug).slice(0, 8))
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
async function share(){ await navigator.clipboard?.writeText(location.href); copied.value='link'; setTimeout(()=>copied.value='',1600) }
// 公式分类筛选
const formulaCategory=ref('全部公式')
const filteredFormulas=computed(()=>formulas.value.filter(f=>(formulaCategory.value==='全部公式'||f.category===formulaCategory.value)&&(!query.value||`${f.name}${f.category}${f.note}`.toLowerCase().includes(query.value.toLowerCase()))))
// 全站搜索类型筛选
const searchType=ref('全部')
const filteredSearchResults=computed(()=>{
  if(searchType.value==='全部') return searchResults.value
  const t=searchType.value
  return searchResults.value.filter(x=>{
    if(t==='知识') return x.type==='知识'
    if(t==='算法') return x.type==='算法'
    if(t==='公式') return x.type==='公式'
    if(t==='CFD 工具') return x.type==='工具'
    if(t==='社区') return x.type==='社区'
    if(t==='Modelica') return x.type==='社区'&&x.meta==='Modelica'
    return true
  })
})
// 算法筛选与对比
const algoFilter=ref('全部用途')
function algoUseOf(use:string){
  if(use.includes('瞬态')) return '时间推进'
  if(use.includes('不可压缩流')||use.includes('压力—速度')) return '压力—速度耦合'
  if(use.includes('离散')||use.includes('插值')) return '空间离散'
  if(use.includes('线性系统')) return '线性求解'
  return '其他'
}
const filteredAlgorithms=computed(()=>algoFilter.value==='全部用途'?algorithms:algorithms.filter(a=>algoUseOf(a.use)===algoFilter.value))
const selectedAlgos=ref<string[]>([])
const compareOpen=ref(false)
function toggleAlgo(name:string){
  if(selectedAlgos.value.includes(name)) selectedAlgos.value=selectedAlgos.value.filter(v=>v!==name)
  else if(selectedAlgos.value.length<4) selectedAlgos.value=[...selectedAlgos.value,name]
}
const compareItems=computed(()=>algorithms.filter(a=>selectedAlgos.value.includes(a.name)))
// 知识库排序
const sortBy=ref('推荐排序')
const viewMode=ref<'cards'|'list'>('cards')
const levelFilter=ref('全部级别')
const activeModule=ref('全部模块')
const sortedArticles=computed(()=>{
  let items=filteredArticles.value.filter(item=>levelFilter.value==='全部级别'||item.level===levelFilter.value)
  if(activeModule.value!=='全部模块'){
    const module=knowledgeModules.find(item=>item.id===activeModule.value)
    items=items.filter(item=>module?.categories.includes(item.category))
  }
  if(sortBy.value==='最近更新') return [...items].sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))
  if(sortBy.value==='阅读时长') return [...items].sort((a,b)=>parseInt(a.read) - parseInt(b.read))
  return items
})
const moduleArticleCount=(moduleId:string)=>{
  const module=knowledgeModules.find(item=>item.id===moduleId)
  return articles.value.filter(item=>module?.categories.includes(item.category)).length
}
function selectModule(id:string){activeModule.value=id;category.value='全部'}
</script>

<template>
  <div v-if="isDetail && !article" class="page"><div class="container knowledge-not-found"><BookOpen :size="42"/><span class="kicker">ARTICLE NOT FOUND</span><h1>没有找到这篇知识文章</h1><p>链接可能已失效，或内容尚未发布。你可以返回知识地图继续浏览。</p><NuxtLink to="/knowledge" class="button">返回知识库</NuxtLink></div></div>
  <div v-else-if="isDetail && article" class="page reading-page">
    <div class="container breadcrumb"><NuxtLink to="/knowledge">知识库</NuxtLink><ChevronRight :size="14"/><span>{{ article.category }}</span><ChevronRight :size="14"/><span>{{ article.title }}</span></div>
    <div class="container reading-layout">
      <aside class="chapter-tree"><small>专题知识路径</small><strong>{{ article.category }}</strong><NuxtLink v-for="(item,i) in relatedArticles" :key="item.slug" :to="`/knowledge/${item.slug}`" :class="{active:item.slug===article.slug}"><span>{{String(i+1).padStart(2,'0')}}</span>{{ item.title }}</NuxtLink></aside>
      <article class="article-body">
        <template v-if="article.bodyHtml">
          <header><span class="content-label">{{ article.category }}</span><h1>{{ article.title }}</h1><p class="article-lead">{{ article.summary }}</p><div class="article-meta"><span>{{ article.author || '流研工坊编辑部' }}</span><span><Clock :size="15"/>{{ article.read }}</span><span>{{ article.updatedAt ? `更新于 ${new Date(article.updatedAt).toLocaleDateString('zh-CN')}` : '知识库导入内容' }}</span></div><div class="tag-row"><span v-for="tag in article.tags" :key="tag">{{tag}}</span><span>{{article.level}}</span></div></header>
          <div class="imported-knowledge-body" v-html="article.bodyHtml"></div>
          <div class="article-actions"><button :class="{active:store.bookmarks.includes(article.slug)}" @click="store.toggleBookmark(article.slug)"><BookmarkCheck v-if="store.bookmarks.includes(article.slug)" :size="18"/><Bookmark v-else :size="18"/>{{store.bookmarks.includes(article.slug)?'已收藏':'收藏'}}</button><button @click="share"><Check v-if="copied==='link'" :size="18"/><Share2 v-else :size="18"/>{{copied==='link'?'链接已复制':'分享'}}</button></div>
        </template>
        <template v-else>
        <header><span class="content-label">{{ article.category }}</span><h1>{{ article.title }}</h1><p class="article-lead">{{ article.summary }}</p><div class="article-meta"><span>周致远 · 数值方法编辑</span><span><Clock :size="15"/>{{ article.read }}</span><span>更新于 2026-07-28</span></div><div class="tag-row"><span v-for="tag in article.tags" :key="tag">{{tag}}</span><span>{{article.level}}</span></div></header>
        <div class="article-summary"><strong>本文要点</strong><p>建立物理量、守恒形式和离散方程之间的联系；识别模型假设；用量纲与极限工况检查推导结果。</p></div>
        <section id="background"><h2>1. 问题与物理背景</h2><p>计算流体力学的核心不是把连续方程直接交给计算机，而是把一个物理问题转化为有限、守恒且可以验证的代数系统。任何可靠的求解都应明确研究对象、控制体、时间尺度与边界条件。</p><p>对不可压缩牛顿流体，质量守恒要求速度场满足零散度条件。动量守恒则刻画惯性、压力、黏性和体力之间的平衡：</p><div class="equation"><span>∂u/∂t + (u · ∇)u = −(1/ρ)∇p + ν∇²u + f</span><small>(1)</small><button @click="copy('momentum equation','eq1')"><Check v-if="copied==='eq1'" :size="15"/><Copy v-else :size="15"/></button></div></section>
        <section id="conservation"><h2>2. 守恒形式与控制体</h2><p>积分守恒形式是有限体积离散的自然起点。通过高斯定理，体积分中的散度项被转换为控制体各表面的通量之和，从而使相邻控制体共享同一面通量。</p><div class="callout info"><strong>工程提示</strong><p>守恒不等于精确。严格守恒的离散格式仍可能有较大的耗散或色散误差，因此必须同时检查精度、稳定性和网格收敛性。</p></div><table><thead><tr><th>方程项</th><th>物理含义</th><th>数值关注点</th></tr></thead><tbody><tr><td>∂u/∂t</td><td>局部加速度</td><td>时间步长与阶数</td></tr><tr><td>u · ∇u</td><td>对流惯性</td><td>有界性与数值耗散</td></tr><tr><td>∇p</td><td>压力驱动</td><td>压力—速度耦合</td></tr><tr><td>ν∇²u</td><td>黏性扩散</td><td>网格正交性</td></tr></tbody></table></section>
        <section id="discretization"><h2>3. 从连续方程到离散系统</h2><p>空间离散决定各控制体之间如何交换质量、动量与能量。时间离散决定不同时间层之间的信息传播。离散后通常得到稀疏线性或非线性代数系统。</p><pre><code>while residual &gt; tolerance:\n  solve_momentum()\n  solve_pressure_correction()\n  correct_fluxes()</code></pre></section>
        <section id="verification"><h2>4. 验证与可信度</h2><p>计算结束不意味着结论成立。至少需要检查残差、全局守恒、网格敏感性以及与解析解、实验数据或公开基准的偏差。</p><ol><li>先确认输入量纲与边界条件。</li><li>观察残差是否稳定下降，避免只看单一方程。</li><li>核对质量或能量的全局不平衡。</li><li>使用至少三组网格评估离散误差。</li></ol></section>
        <div class="article-actions"><button :class="{active:store.bookmarks.includes(article.slug)}" @click="store.toggleBookmark(article.slug)"><BookmarkCheck v-if="store.bookmarks.includes(article.slug)" :size="18"/><Bookmark v-else :size="18"/>{{store.bookmarks.includes(article.slug)?'已收藏':'收藏'}}</button><button @click="share"><Check v-if="copied==='link'" :size="18"/><Share2 v-else :size="18"/>{{copied==='link'?'链接已复制':'分享'}}</button></div>
        <section class="references"><h2>参考与修订</h2><p>[1] Ferziger, Perić & Street, Computational Methods for Fluid Dynamics.<br>[2] Versteeg & Malalasekera, An Introduction to Computational Fluid Dynamics.</p><small>修订 1.3 · 补充了守恒检查与网格收敛说明</small></section>
        </template>
      </article>
      <aside v-if="!article.bodyHtml" class="page-toc"><small>本页目录</small><a href="#background">问题与物理背景</a><a href="#conservation">守恒形式与控制体</a><a href="#discretization">离散系统</a><a href="#verification">验证与可信度</a><div><strong>关联工具</strong><NuxtLink to="/simulation/convection-diffusion">一维对流—扩散 <ArrowRight :size="14"/></NuxtLink></div></aside>
      <aside v-else class="page-toc"><small>数据库知识文章</small><strong>{{article.category}}</strong><span>{{article.read}} · {{article.level}}</span><div><strong>内容标签</strong><span v-for="tag in article.tags" :key="tag">{{tag}}</span></div></aside>
    </div>
  </div>

  <div v-else-if="route.path==='/knowledge'" class="page discovery-page knowledge-hub-page">
    <section class="page-hero knowledge-hero"><div class="container"><span class="kicker">ENGINEERING KNOWLEDGE HUB</span><h1>把知识组织成工程能力</h1><p>按领域模块、学习路径和仿真工作流理解 CFD、CAE 与系统建模；每个主题都能回到可验证的计算实践。</p><div class="page-search"><Search :size="19"/><input v-model="query" placeholder="搜索概念、方法、物理模型或软件实践…"></div><div class="knowledge-hero-stats"><span><strong>{{articles.length}}</strong> 篇知识</span><span><strong>{{knowledgeModules.length}}</strong> 个领域模块</span><span><strong>{{learningPaths.length}}</strong> 条学习路径</span></div></div></section>
    <div class="container knowledge-hub"><div v-if="knowledgeError" class="inline-alert info knowledge-offline-note"><BookOpen :size="18"/><span><strong>当前使用内置知识索引</strong> 数据库暂不可用，基础文章、分类与学习路径仍可浏览。</span></div>
      <section class="knowledge-module-section"><div class="knowledge-section-head"><div><span class="kicker">MODULE MAP</span><h2>领域模块</h2><p>先选择问题所属领域，再深入概念、方法与工程检查。</p></div><button v-if="activeModule!=='全部模块'" class="text-button" @click="selectModule('全部模块')">查看全部模块</button></div><div class="knowledge-module-grid"><button v-for="(item,index) in knowledgeModules" :key="item.id" :class="{active:activeModule===item.id}" @click="selectModule(item.id)"><span class="module-index">0{{index+1}}</span><i :style="{background:item.color}"></i><div><small>{{item.level}} · {{moduleArticleCount(item.id)}} 篇</small><h3>{{item.name}}</h3><p>{{item.short}}</p></div><ArrowRight :size="17"/></button></div></section>
      <section class="knowledge-path-section"><div class="knowledge-section-head"><div><span class="kicker">GUIDED PATHS</span><h2>按目标学习</h2></div></div><div class="knowledge-path-grid"><article v-for="(path,index) in learningPaths" :key="path.id"><header><span>PATH 0{{index+1}}</span><Route :size="20"/></header><h3>{{path.name}}</h3><p>{{path.description}}</p><div class="path-module-chain"><i v-for="module in path.modules" :key="module" :title="knowledgeModules.find(item=>item.id===module)?.name"></i></div><footer><span>{{path.audience}}</span><strong>{{path.duration}}</strong></footer></article></div></section>
      <section class="knowledge-catalog"><aside class="filter-aside"><div class="aside-title"><strong>专题分类</strong><SlidersHorizontal :size="17"/></div><button v-for="item in categories" :key="item" :class="{active:category===item}" @click="category=item"><span>{{item}}</span><small>{{categoryCounts[item]}}</small></button></aside><section class="content-list" :class="`view-${viewMode}`"><div class="list-toolbar knowledge-toolbar"><div><strong>{{activeModule==='全部模块'?category:knowledgeModules.find(item=>item.id===activeModule)?.name}}</strong><span>共 {{sortedArticles.length}} 篇</span></div><div class="knowledge-toolbar-actions"><select v-model="levelFilter"><option>全部级别</option><option>入门</option><option>进阶</option><option>工程</option></select><select v-model="sortBy"><option>推荐排序</option><option>最近更新</option><option>阅读时长</option></select><span class="view-toggle"><button :class="{active:viewMode==='cards'}" aria-label="卡片视图" @click="viewMode='cards'"><Grid2X2 :size="15"/></button><button :class="{active:viewMode==='list'}" aria-label="列表视图" @click="viewMode='list'"><List :size="16"/></button></span></div></div><div class="knowledge-article-grid"><NuxtLink v-for="item in sortedArticles" :key="item.slug" :to="`/knowledge/${item.slug}`" class="article-row knowledge-article-card"><div><span>{{item.category}}</span><h2>{{item.title}}</h2><p>{{item.summary}}</p><div><i v-for="tag in item.tags" :key="tag">{{tag}}</i></div></div><aside><strong>{{item.level}}</strong><small><Clock :size="13"/>{{item.read}}</small><ArrowRight :size="18"/></aside></NuxtLink></div><div v-if="!sortedArticles.length" class="empty-state"><BookOpen :size="34"/><h3>未找到匹配文章</h3><p>尝试清除模块、分类或关键词筛选。</p><button class="button secondary" @click="query='';category='全部';activeModule='全部模块';levelFilter='全部级别'">清除筛选</button></div></section></section>
      <section class="knowledge-practice"><div><span class="kicker">FROM KNOWLEDGE TO PRACTICE</span><h2>把方法放进真实计算流程</h2><p>知识条目不仅解释“是什么”，也连接到对应的 CFD 与 CAE 可运行案例。</p></div><NuxtLink to="/simulation"><Wrench :size="21"/><span><strong>CFD 工作流</strong><small>流动、湍流与输运</small></span><ArrowRight :size="17"/></NuxtLink><NuxtLink to="/cae"><Layers3 :size="21"/><span><strong>CAE 工作流</strong><small>结构、热与模态</small></span><ArrowRight :size="17"/></NuxtLink></section>
    </div>
  </div>

  <div v-else-if="route.path==='/algorithms'" class="page">
    <section class="page-hero"><div class="container"><span class="kicker">ALGORITHM LIBRARY</span><h1>算法库</h1><p>比较适用问题、精度、稳定性与计算成本，为离散和求解选择提供依据。</p></div></section>
    <div class="container content-section"><div class="filter-strip"><button :class="{active:algoFilter==='全部用途'}" @click="algoFilter='全部用途'">全部用途</button><button :class="{active:algoFilter==='压力—速度耦合'}" @click="algoFilter='压力—速度耦合'">压力—速度耦合</button><button :class="{active:algoFilter==='空间离散'}" @click="algoFilter='空间离散'">空间离散</button><button :class="{active:algoFilter==='线性求解'}" @click="algoFilter='线性求解'">线性求解</button><button :class="{active:algoFilter==='时间推进'}" @click="algoFilter='时间推进'">时间推进</button></div><div class="comparison-note"><span>可勾选 2–4 个算法进行对比（已选 {{selectedAlgos.length}}）</span><button class="button secondary small" :disabled="selectedAlgos.length<2||selectedAlgos.length>4" @click="compareOpen=true">开始对比</button></div><div class="algorithm-table"><div class="table-head"><span>算法</span><span>主要用途</span><span>精度 / 类型</span><span>稳定性</span><span>成本</span><span>主要限制</span></div><div v-for="item in filteredAlgorithms" :key="item.name" class="table-row"><span><input type="checkbox" :checked="selectedAlgos.includes(item.name)" @change="toggleAlgo(item.name)"><strong>{{item.name}}</strong></span><span>{{item.use}}</span><span>{{item.order}}</span><span><i class="status success">{{item.stability}}</i></span><span>{{item.cost}}</span><span>{{item.limitation}}</span></div></div><section class="algorithm-detail-card"><div><span class="kicker">FEATURED METHOD</span><h2>SIMPLE 压力—速度耦合</h2><p>通过动量预测、压力修正和通量校正，在稳态不可压缩流求解中迭代满足连续性。</p></div><dl><div><dt>适用问题</dt><dd>稳态不可压缩流</dd></div><div><dt>收敛控制</dt><dd>压力 / 速度欠松弛</dd></div><div><dt>关联工具</dt><dd><NuxtLink to="/simulation/lid-driven-cavity">方腔顶盖驱动流</NuxtLink></dd></div></dl></section></div>
  </div>

  <FormulaConverter v-else-if="route.path==='/formulas/convert'" />

  <div v-else-if="route.path==='/formulas'" class="page">
    <section class="page-hero slim"><div class="container formula-page-heading"><div><span class="kicker">FORMULA REFERENCE</span><h1>公式速查</h1><p>查找公式、核对量纲，并以 LaTeX 或纯文本复制。</p></div><NuxtLink to="/formulas/convert" class="button large">修复乱码公式 <ArrowRight :size="17"/></NuxtLink><div class="page-search"><Search :size="19"/><input v-model="query" placeholder="搜索名称、符号或物理量…"></div></div></section>
    <div class="container formula-layout"><aside class="filter-aside"><strong>分类</strong><button v-for="cat in ['全部公式','控制方程','无量纲数','湍流','传热','数值稳定性']" :key="cat" :class="{active:formulaCategory===cat}" @click="formulaCategory=cat">{{cat}} <small>{{cat==='全部公式'?formulas.length:formulas.filter(f=>f.category===cat).length}}</small></button></aside><section class="formula-cards"><div v-for="item in filteredFormulas" :key="item.name" class="formula-card"><div class="formula-meta"><span>{{item.category}}</span><button @click="store.toggleBookmark('formula-'+item.name)"><BookmarkCheck v-if="store.bookmarks.includes('formula-'+item.name)" :size="17"/><Bookmark v-else :size="17"/></button></div><h2>{{item.name}}</h2><div class="formula-display">{{item.plain}}</div><p>{{item.note}}</p><div class="formula-actions"><button @click="copy(item.latex,item.name+'latex')"><Check v-if="copied===item.name+'latex'" :size="15"/><Copy v-else :size="15"/>LaTeX</button><button @click="copy(item.plain,item.name+'plain')"><Check v-if="copied===item.name+'plain'" :size="15"/><Copy v-else :size="15"/>纯文本</button></div></div></section><aside class="discovery-side"><div class="side-card"><strong>最近复制</strong><p v-if="!copied">复制过的公式将在本次会话中显示。</p><span v-else>{{copied.replace('latex','').replace('plain','')}}</span></div><div class="side-card"><strong>使用提示</strong><p>关键工程计算应同时核对公式的适用假设、变量单位与来源。</p></div></aside></div>
  </div>

  <div v-else class="page search-page">
    <section class="page-hero slim"><div class="container"><h1>全站搜索</h1><form class="page-search large" @submit.prevent><Search :size="20"/><input v-model="query" placeholder="输入关键词…"><button class="button">搜索</button></form><p>找到 {{filteredSearchResults.length}} 条相关内容</p></div></section>
    <div class="container search-layout"><aside class="filter-aside"><strong>内容类型</strong><button :class="{active:searchType==='全部'}" @click="searchType='全部'">全部 <small>{{searchResults.length}}</small></button><button :class="{active:searchType==='知识'}" @click="searchType='知识'">知识</button><button :class="{active:searchType==='算法'}" @click="searchType='算法'">算法</button><button :class="{active:searchType==='公式'}" @click="searchType='公式'">公式</button><button :class="{active:searchType==='CFD 工具'}" @click="searchType='CFD 工具'">CFD 工具</button><button :class="{active:searchType==='Modelica'}" @click="searchType='Modelica'">Modelica</button><button :class="{active:searchType==='社区'}" @click="searchType='社区'">社区</button></aside><section class="search-result-list"><NuxtLink v-for="item in filteredSearchResults" :key="item.type+item.title" :to="item.to"><span>{{item.type}}</span><h2>{{item.title}}</h2><p>{{item.text}}</p><small>{{item.meta}}</small></NuxtLink><div v-if="!filteredSearchResults.length" class="empty-state"><Search :size="34"/><h3>没有找到“{{query}}”</h3><p>尝试缩短关键词、检查拼写，或浏览推荐入口。</p><NuxtLink to="/knowledge" class="button secondary">浏览知识库</NuxtLink></div></section></div>
  </div>

  <div v-if="compareOpen" class="modal-backdrop" @click.self="compareOpen=false"><div class="dialog-card compare-card"><div><h2>算法对比</h2><button type="button" class="icon-button" @click="compareOpen=false">×</button></div><div class="algorithm-table compare-table"><div class="table-head"><span>对比项</span><span v-for="a in compareItems" :key="a.name">{{a.name}}</span></div><div class="table-row"><span>主要用途</span><span v-for="a in compareItems" :key="'u'+a.name">{{a.use}}</span></div><div class="table-row"><span>精度 / 类型</span><span v-for="a in compareItems" :key="'o'+a.name">{{a.order}}</span></div><div class="table-row"><span>稳定性</span><span v-for="a in compareItems" :key="'s'+a.name"><i class="status success">{{a.stability}}</i></span></div><div class="table-row"><span>计算成本</span><span v-for="a in compareItems" :key="'c'+a.name">{{a.cost}}</span></div><div class="table-row"><span>主要限制</span><span v-for="a in compareItems" :key="'l'+a.name">{{a.limitation}}</span></div></div><footer><button class="button secondary" @click="compareOpen=false">关闭</button></footer></div></div>
</template>
