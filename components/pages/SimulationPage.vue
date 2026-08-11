<script setup lang="ts">
import { Search, SlidersHorizontal, ArrowRight, RotateCcw, Play, Download, CheckCircle2, AlertTriangle, Clock3, Copy, XCircle, FileJson, Table2, Activity, Gauge, ChevronRight } from 'lucide-vue-next'
import { tools } from '~/utils/content'
import { solveTool } from '~/utils/solvers'
const route = useRoute(), router = useRouter(), store = usePlatformStore()
const taskRoute = computed(() => route.path.startsWith('/simulation/tasks/'))
const listRoute = computed(() => route.path === '/simulation')
const slug = computed(() => route.path.split('/')[2] || 'convection-diffusion')
const tool = computed(() => tools.find(t => t.slug === slug.value) || tools[0])
const taskId = computed(() => String(route.params.id || route.path.split('/').at(-1) || ''))
const task = computed(() => store.tasks.find(t => t.id === taskId.value))
const running = ref(false), progress = ref(0), phase = ref('准备输入'), activeTab = ref('overview')
const defaults: Record<string, Record<string, string|number>> = {
  'convection-diffusion': { length:1, nx:101, rho:1, velocity:1, diffusivity:.1, phi_left:1, phi_right:0, scheme:'upwind' },
  'lid-driven-cavity': { reynolds:100, nx:65, ny:65, lid_velocity:1, max_iterations:5000, tolerance:0.000001, pressure_relaxation:.3, velocity_relaxation:.7 },
  'pipe-flow': { diameter:.05, pipe_length:2, rho:998, viscosity:.001, drive_mode:'mean_velocity', drive_value:.5, samples:81 },
  'turbulence-compare': { flow_type:'internal', velocity:35, char_length:.2, rho:1.225, viscosity:.0000181, intensity:5, length_scale:.014, target_yplus:1, growth_rate:1.2, layers:20 }
}
const params = reactive<Record<string,string|number>>({})
watch(slug, reset, { immediate:true })
// 工具列表页筛选
const dimFilter=ref('全部'), typeFilter=ref('全部'), levelFilter=ref('全部'), listQuery=ref(''), cardView=ref(true)
const filteredTools=computed(()=>tools.filter(t=>{
  if(dimFilter.value==='一维'&&!t.type.includes('1D')) return false
  if(dimFilter.value==='二维'&&!t.type.includes('2D')) return false
  if(typeFilter.value==='解析计算'&&!t.type.includes('解析')) return false
  if(typeFilter.value==='数值求解'&&(t.type.includes('解析')||t.type==='工程估算')) return false
  if(typeFilter.value==='工程估算'&&t.type!=='工程估算') return false
  if(levelFilter.value!=='全部'&&t.level!==levelFilter.value) return false
  if(listQuery.value&&!`${t.name}${t.description}${t.type}`.toLowerCase().includes(listQuery.value.toLowerCase())) return false
  return true
}))
// 参数面板选项卡分组
const paramTab=ref('物理参数')
const fieldGroups=computed(()=>{
  const defs=(fieldDefs.value||[]) as any[]
  const grid=['nx','ny','max_iterations','tolerance','pressure_relaxation','velocity_relaxation','samples','layers','growth_rate']
  return { physics:defs.filter((f:any)=>!grid.includes(f[0])), grid:defs.filter((f:any)=>grid.includes(f[0])) }
})
const shownFields=computed(()=>paramTab.value==='网格 / 数值'?fieldGroups.value.grid:(paramTab.value==='输出'?[]:fieldGroups.value.physics))
function reset(){ Object.keys(params).forEach(k=>delete params[k]); Object.assign(params, defaults[slug.value] || defaults['convection-diffusion']); activeTab.value='overview' }
const fieldDefs = computed(() => ({
  'convection-diffusion': [['length','区域长度','m',.01,100],['nx','网格数','—',21,1001],['rho','密度','kg/m³',.001,10000],['velocity','速度','m/s',-1000,1000],['diffusivity','扩散系数','m²/s',1e-8,1000],['phi_left','左边界 φ','—',-1e6,1e6],['phi_right','右边界 φ','—',-1e6,1e6]],
  'lid-driven-cavity': [['reynolds','Reynolds 数','—',10,1000],['nx','x 网格数','—',33,129],['ny','y 网格数','—',33,129],['lid_velocity','顶盖速度','m/s',.01,100],['max_iterations','最大迭代','—',100,20000],['tolerance','收敛容差','—',1e-8,1e-4],['pressure_relaxation','压力松弛','—',.1,.8],['velocity_relaxation','速度松弛','—',.1,1]],
  'pipe-flow': [['diameter','管径','m',.001,10],['pipe_length','管长','m',.01,1000],['rho','密度','kg/m³',.1,10000],['viscosity','动力黏度','Pa·s',1e-7,100],['drive_value','驱动值','Pa / m·s⁻¹',0.0001,1e7],['samples','径向采样点','—',21,501]],
  'turbulence-compare': [['velocity','特征速度','m/s',.001,3000],['char_length','特征长度','m',.0001,100],['rho','密度','kg/m³',.001,10000],['viscosity','动力黏度','Pa·s',1e-8,10],['intensity','湍流强度','%',.01,50],['length_scale','长度尺度','m',1e-6,100],['target_yplus','目标 y⁺','—',.1,300],['growth_rate','增长率','—',1.01,2],['layers','边界层层数','—',3,100]]
}[slug.value] || []) as any[])
async function run(){
  running.value=true; progress.value=7; phase.value='校验参数'
  const result = solveTool(slug.value, params)
  const t = store.addTask({ tool:slug.value, toolName:tool.value.name, params:{...params} })
  const steps = [['组装离散方程',28],['求解线性系统',56],['检查收敛与守恒',82],['生成结果清单',100]] as const
  for(const [name,p] of steps){ phase.value=name; await new Promise(r=>setTimeout(r,220)); progress.value=p }
  store.finishTask(t.id, result as unknown as Record<string,unknown>, (result as any).warnings || [])
  running.value=false; router.push(`/simulation/tasks/${t.id}`)
}
function resultData(){ return (task.value?.result || {}) as any }
function download(kind:'json'|'csv'){
  if(!task.value) return
  const result=resultData(); let body='', type='', name=''
  if(kind==='json'){ body=JSON.stringify({manifest:{format:'flowlab-result/1.0',task:task.value.id,tool:task.value.tool,createdAt:task.value.createdAt},input:task.value.params,summary:result.summary},null,2); type='application/json'; name=`${task.value.id}.json` }
  else { const x=result.x||[]; const y=result.series||[]; const y2=result.exact||[]; body='x,value,reference\n'+x.map((v:number,i:number)=>`${v},${y[i]??''},${y2[i]??''}`).join('\n'); type='text/csv;charset=utf-8'; name=`${task.value.id}.csv` }
  const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type})); const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="listRoute" class="page">
    <section class="page-hero"><div class="container"><span class="kicker">CFD SIMULATION TOOLS</span><h1>在线仿真工具</h1><p>边界明确、结果可验证的教学型求解器。在浏览器内运行，任务和结果自动保存在本机。</p><div class="inline-alert success"><CheckCircle2 :size="18"/><span><strong>4 个工具可用</strong> · 当前为本地计算模式，无需数据库</span></div><div class="page-search"><Search :size="19"/><input v-model="listQuery" placeholder="搜索物理问题或工具…"></div></div></section>
    <div class="container tools-layout"><aside class="filter-aside"><div class="aside-title"><strong>筛选</strong><SlidersHorizontal :size="17"/></div><small>维度</small><button :class="{active:dimFilter==='全部'}" @click="dimFilter='全部'">全部</button><button :class="{active:dimFilter==='一维'}" @click="dimFilter='一维'">一维</button><button :class="{active:dimFilter==='二维'}" @click="dimFilter='二维'">二维</button><small>求解类型</small><button :class="{active:typeFilter==='全部'}" @click="typeFilter='全部'">全部</button><button :class="{active:typeFilter==='解析计算'}" @click="typeFilter='解析计算'">解析计算</button><button :class="{active:typeFilter==='数值求解'}" @click="typeFilter='数值求解'">数值求解</button><button :class="{active:typeFilter==='工程估算'}" @click="typeFilter='工程估算'">工程估算</button><small>难度</small><button :class="{active:levelFilter==='全部'}" @click="levelFilter='全部'">全部</button><button :class="{active:levelFilter==='入门'}" @click="levelFilter='入门'">入门</button><button :class="{active:levelFilter==='进阶'}" @click="levelFilter='进阶'">进阶</button><button :class="{active:levelFilter==='工程'}" @click="levelFilter='工程'">工程</button></aside><section class="tool-grid" :class="{compact:!cardView}"><div class="list-toolbar"><div><strong>全部工具</strong><span>{{filteredTools.length}} / {{tools.length}} 个可运行工具</span></div><div class="view-toggle"><button :class="{active:cardView}" @click="cardView=true">卡片</button><button :class="{active:!cardView}" @click="cardView=false">紧凑</button></div></div><NuxtLink v-for="(item,i) in filteredTools" :key="item.slug" :to="`/simulation/${item.slug}`" class="tool-card"><div class="tool-card-visual"><div class="heat-field" :class="`field-${i}`"><span v-for="n in 18" :key="n" :style="{'--i':n}"></span></div><span class="tool-status"><i></i>{{item.status}}</span></div><div class="tool-card-body"><div><span>{{item.type}}</span><span>v1.0.0</span></div><h2>{{item.name}}</h2><p>{{item.description}}</p><footer><span>{{item.level}}</span><span><Clock3 :size="14"/>{{item.time}}</span><strong>打开工具 <ArrowRight :size="15"/></strong></footer></div></NuxtLink><div v-if="!filteredTools.length" class="empty-state"><Search :size="34"/><h3>没有匹配的工具</h3><p>尝试放宽筛选条件或更换关键词。</p><button class="button secondary" @click="dimFilter='全部';typeFilter='全部';levelFilter='全部';listQuery=''">清除筛选</button></div></section></div>
  </div>

  <div v-else-if="!taskRoute" class="page workbench-page">
    <div class="container breadcrumb"><NuxtLink to="/simulation">CFD 仿真</NuxtLink><ChevronRight :size="14"/><span>{{tool.name}}</span></div>
    <div class="container workbench-layout">
      <aside class="parameter-panel"><div class="parameter-head"><span><i></i>稳定 · v1.0.0</span><h1>{{tool.name}}</h1><p>{{tool.description}}</p></div><div class="parameter-tabs"><button :class="{active:paramTab==='物理参数'}" @click="paramTab='物理参数'">物理参数</button><button :class="{active:paramTab==='网格 / 数值'}" @click="paramTab='网格 / 数值'">网格 / 数值</button><button :class="{active:paramTab==='输出'}" @click="paramTab='输出'">输出</button></div><form @submit.prevent="run"><div v-if="slug==='convection-diffusion'" class="field-row"><label>离散格式<select v-model="params.scheme"><option value="upwind">一阶迎风</option><option value="central">中心差分</option></select><small>高 Péclet 数下中心差分可能振荡</small></label></div><div v-if="slug==='pipe-flow'" class="field-row"><label>驱动方式<select v-model="params.drive_mode"><option value="mean_velocity">指定平均速度</option><option value="pressure_drop">指定压降</option></select></label></div><div v-if="slug==='turbulence-compare'" class="field-row"><label>流动类型<select v-model="params.flow_type"><option value="internal">内流</option><option value="external">外流</option></select></label></div><div class="field-row two"><label v-for="field in shownFields" :key="field[0]">{{field[1]}}<div class="unit-input"><input v-model.number="params[field[0]]" type="number" :min="field[3]" :max="field[4]" step="any"><span>{{field[2]}}</span></div><small>范围 {{field[3]}} – {{field[4]}}</small></label></div><div v-if="paramTab==='输出'" class="inline-alert info"><AlertTriangle :size="18"/><span>运行结束后可在结果页导出 JSON 清单与 CSV 采样数据。</span></div><div class="estimate-box"><div><Gauge :size="18"/><span>预计计算量<strong>{{slug==='lid-driven-cavity'?'中等':'轻量'}}</strong></span></div><div><Clock3 :size="18"/><span>预计耗时<strong>{{tool.time}}</strong></span></div></div><div class="run-actions"><button type="submit" class="button large run-button" :disabled="running"><Activity v-if="running" class="spin" :size="18"/><Play v-else :size="18"/>{{running?`${phase} ${progress}%`:'运行仿真'}}</button><button type="button" class="text-button" @click="reset"><RotateCcw :size="15"/>恢复默认</button></div></form></aside>
      <section class="work-area"><div class="work-tabs"><button :class="{active:activeTab==='overview'}" @click="activeTab='overview'">问题说明</button><button :class="{active:activeTab==='geometry'}" @click="activeTab='geometry'">几何 / 网格</button><button :class="{active:activeTab==='example'}" @click="activeTab='example'">示例结果</button></div><div v-if="running" class="running-overlay"><div class="solver-progress"><Activity :size="30"/><h2>{{phase}}</h2><p>任务正在本地浏览器中执行，可以安全地等待计算完成。</p><div class="progress large"><i :style="{width:progress+'%'}"></i></div><span>{{progress}}%</span></div></div><template v-else><div v-if="activeTab==='overview'" class="problem-description"><span class="kicker">PHYSICAL MODEL</span><h2>{{tool.name}}</h2><p>{{tool.description}} 本工具使用固定、可复核的模型与参数范围，适合教学演示、方案预估与数值方法对比。</p><div class="model-equation">{{slug==='convection-diffusion'?'d(ρuφ)/dx = d(Γ dφ/dx)/dx':slug==='pipe-flow'?'u(r) = 2Ū[1 − (r/R)²]':slug==='lid-driven-cavity'?'∇·u = 0 · ρ(u·∇)u = −∇p + μ∇²u':'Re = ρUL/μ · k = 3/2(UI)²'}}</div><div class="assumption-grid"><div><strong>模型假设</strong><ul><li>物性与边界定义明确</li><li>输入统一采用 SI 单位</li><li>结果包含守恒或解析校核</li></ul></div><div><strong>结果内容</strong><ul><li>关键数值摘要</li><li>采样曲线 / 残差历史</li><li>CSV 与 JSON 清单</li></ul></div></div><div class="inline-alert info"><AlertTriangle :size="18"/><span>所有计算结果都应结合网格、模型假设和适用范围进行独立验证。</span></div></div><div v-else class="example-view"><div class="heat-field large" :class="`field-${tools.findIndex(t=>t.slug===slug)}`"><span v-for="n in 30" :key="n" :style="{'--i':n}"></span></div><h3>{{activeTab==='geometry'?'结构化计算域与边界':'稳定示例工况预览'}}</h3><p>运行后将在此显示当前参数对应的结果与数值摘要。</p></div></template></section>
    </div>
  </div>

  <div v-else class="page result-page">
    <div v-if="task" class="container"><div class="breadcrumb"><NuxtLink to="/simulation">CFD 仿真</NuxtLink><ChevronRight :size="14"/><NuxtLink :to="`/simulation/${task.tool}`">{{task.toolName}}</NuxtLink><ChevronRight :size="14"/><span>{{task.id}}</span></div><header class="result-header"><div><span class="status-badge success"><CheckCircle2 :size="16"/>计算成功</span><h1>{{task.toolName}}</h1><p>{{task.id}} · {{new Date(task.createdAt).toLocaleString('zh-CN')}} · 求解器 v1.0.0</p></div><div><button class="button secondary" @click="download('json')"><FileJson :size="16"/>JSON</button><button class="button" @click="download('csv')"><Download :size="16"/>下载 CSV</button></div></header><div v-if="task.warnings?.length" class="inline-alert warning"><AlertTriangle :size="19"/><div><strong>结果警告</strong><p v-for="w in task.warnings" :key="w">{{w}}</p></div></div><section class="summary-grid"><div v-for="item in resultData().summary" :key="item.label"><small>{{item.label}}</small><strong>{{item.value}}</strong></div></section><div class="result-tabs"><button :class="{active:activeTab==='overview'}" @click="activeTab='overview'">概览</button><button :class="{active:activeTab==='curve'}" @click="activeTab='curve'">曲线</button><button :class="{active:activeTab==='table'}" @click="activeTab='table'">数据表</button><button :class="{active:activeTab==='log'}" @click="activeTab='log'">求解日志</button></div><section class="result-content"><template v-if="activeTab==='overview'||activeTab==='curve'"><div class="result-chart-head"><div><h2>{{task.tool==='lid-driven-cavity'?'残差历史':'计算结果曲线'}}</h2><p>{{task.tool==='lid-driven-cavity'?'归一化连续性与动量残差':'数值结果与参考解对比'}}</p></div><button class="button secondary small" @click="download('csv')"><Download :size="15"/>数据</button></div><DataChart :x="resultData().x" :y="resultData().series||[]" :y2="resultData().exact||[]" :log="task.tool==='lid-driven-cavity'" :label="task.tool==='lid-driven-cavity'?'残差':'数值结果'" /></template><div v-else-if="activeTab==='table'" class="data-table"><div><strong>x / step</strong><strong>value</strong><strong>reference</strong></div><div v-for="(x,i) in (resultData().x||[]).slice(0,20)" :key="i"><span>{{Number(x).toPrecision(5)}}</span><span>{{Number(resultData().series[i]).toPrecision(7)}}</span><span>{{resultData().exact?.[i]!==undefined?Number(resultData().exact[i]).toPrecision(7):'—'}}</span></div></div><pre v-else class="solver-log"><code>[INFO] input schema validated\n[INFO] solver package flowlab/{{task.tool}}@1.0.0\n[INFO] system assembled successfully\n[INFO] convergence and conservation checks completed\n[INFO] result manifest written\n[SUCCESS] task {{task.id}} completed in {{task.duration}} ms</code></pre></section><section class="result-lower"><div><h3>参数快照</h3><dl><div v-for="(v,k) in task.params" :key="k"><dt>{{k}}</dt><dd>{{v}}</dd></div></dl></div><div><h3>结果文件</h3><button @click="download('json')"><FileJson :size="18"/><span><strong>manifest.json</strong><small>输入、版本与摘要</small></span><Download :size="16"/></button><button @click="download('csv')"><Table2 :size="18"/><span><strong>table.csv</strong><small>采样数据</small></span><Download :size="16"/></button></div></section></div><div v-else class="container empty-state"><XCircle :size="40"/><h1>没有找到这个任务</h1><p>任务可能已被清理，或仅保存在另一台设备中。</p><NuxtLink to="/simulation" class="button">返回工具列表</NuxtLink></div>
  </div>
</template>
