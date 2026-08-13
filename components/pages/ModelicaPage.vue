<script setup lang="ts">
import { Boxes, Plus, FolderOpen, Library, ArrowRight, CheckCircle2, Code2, Play, Save, Search, FileCode2, ChevronRight, ChevronDown, Settings2, Bug, TerminalSquare, PanelBottomClose, GitBranch, Clock3, Copy, Archive, Activity, AlertTriangle, Download, Check, LayoutGrid, Image, SlidersHorizontal, RefreshCw, Square, ListTree, Info } from 'lucide-vue-next'
const route=useRoute(), router=useRouter(), store=usePlatformStore()
const hub=computed(()=>route.path==='/modelica')
const projectsPage=computed(()=>route.path==='/modelica/projects')
const editorPage=computed(()=>route.path.includes('/editor'))
const runPage=computed(()=>route.path.startsWith('/modelica/runs/'))
const librariesPage=computed(()=>route.path.startsWith('/modelica/libraries'))
const templatesPage=computed(()=>route.path==='/modelica/templates')
const projectId=computed(()=>route.path.split('/')[3]||'demo-project')
const project=computed(()=>store.projects.find(p=>p.id===projectId.value)||store.projects[0])
const code=ref(''), dirty=ref(false), compiling=ref(false), bottomTab=ref('problems'), newDialog=ref(false), newName=ref('转子动力学示例')
const editorView=ref<'diagram'|'text'|'icon'>('diagram'), simDialog=ref(false), diagramRef=ref<any>(null), selectedDiagramNode=ref<any>(null)
const experiment=reactive({start:0,stop:4,interval:.025,tolerance:1e-6,solver:'CVODE',method:'dassl',output:'mat',variableFilter:'.*'})
const compileStage=ref('等待检查'), compileProgress=ref(0), diagramStats=reactive({components:4,connections:4})
watch(project,p=>{if(p){code.value=p.code;dirty.value=false}},{immediate:true})
watch(code,()=>{if(project.value&&code.value!==project.value.code)dirty.value=true})
const diagnostics=computed(()=>{
  const out:{severity:string;line:number;code:string;text:string}[]=[]
  const lines=code.value.split('\n')
  if(!/\bmodel\s+\w+/.test(code.value)) out.push({severity:'error',line:1,code:'MO1001',text:'缺少顶层 model 声明'})
  if(!/end\s+\w+\s*;/.test(code.value)) out.push({severity:'error',line:lines.length,code:'MO1002',text:'模型缺少匹配的 end 语句'})
  if((code.value.match(/\(/g)||[]).length!==(code.value.match(/\)/g)||[]).length) out.push({severity:'error',line:1,code:'MO1003',text:'圆括号数量不匹配'})
  lines.forEach((line,i)=>{if(/Real\s+\w+/.test(line)&&!/[;=]/.test(line))out.push({severity:'warning',line:i+1,code:'MO2001',text:'声明可能缺少分号'})})
  return out
})
const modelStats=computed(()=>({parameters:(code.value.match(/parameter\s+/g)||[]).length,variables:(code.value.match(/\bReal\s+/g)||[]).length,equations:(code.value.match(/\n\s*[^/\n]+=/g)||[]).length}))
function save(){if(project.value){store.saveProject(project.value.id,code.value);dirty.value=false}}
async function compile(){save();compiling.value=true;bottomTab.value='output';compileProgress.value=5;for(const [name,value] of [['扫描源码结构',24],['检查声明与结束语句',48],['核对括号与分号',67],['统计变量与方程',84],['生成检查报告',100]] as const){compileStage.value=name;await new Promise(r=>setTimeout(r,150));compileProgress.value=value}if(project.value){project.value.lastCompile=diagnostics.value.some(d=>d.severity==='error')?'有诊断':'成功';store.persist()}compiling.value=false}
async function openSimulation(){await compile();if(diagnostics.value.some(d=>d.severity==='error'))return;simDialog.value=true}
function run(){if(experimentIssues.value.length||!analyticDemoSupported.value)return;simDialog.value=false;router.push(`/modelica/runs/${project.value?.id||'demo-project'}`)}
function syncDiagramToText(){const fragment=diagramRef.value?.modelicaFragment?.();if(!fragment)return;const modelName=project.value?.template||'DiagramModel';code.value=`within Examples;\nmodel ${modelName}\n${fragment}\n  annotation(experiment(StartTime=${experiment.start}, StopTime=${experiment.stop}, Tolerance=${experiment.tolerance}, Interval=${experiment.interval}));\nend ${modelName};`;editorView.value='text'}
function diagramChanged(payload:any){diagramStats.components=payload.nodes.length;diagramStats.connections=payload.links.length;dirty.value=true}
function updateDiagramParameter(key:string,event:Event){diagramRef.value?.updateSelectedParameter?.(key,(event.target as HTMLInputElement).value)}
function create(){const p=store.createProject(newName.value);newDialog.value=false;router.push(`/modelica/projects/${p.id}/editor`)}
const projectView=ref('表格'), runView=ref('曲线'), copiedFlag=ref(''), libOpen=ref(false), libCurrent=ref<any>(null)
const libShown=computed(()=>libCurrent.value||libraries[0])
async function copyText(text:string,name:string){ await navigator.clipboard?.writeText(text); copiedFlag.value=name; setTimeout(()=>copiedFlag.value='',1600) }
function downloadBlob(body:string,type:string,name:string){ const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type})); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url) }
function exportResults(kind:'csv'|'json'){
  const name=project.value?.template||'model'
  if(kind==='json'){ downloadBlob(JSON.stringify({project:name,run:projectId.value,experiment:{...experiment},parameters:analyticParameters.value,time:time.value,response:response.value,velocity:velocity.value},null,2),'application/json',`${name}-result.json`) }
  else { const body='t,x,v\n'+time.value.map((t,i)=>`${t},${response.value[i]},${velocity.value[i]}`).join('\n'); downloadBlob(body,'text/csv;charset=utf-8',`${name}-result.csv`) }
}
function archiveProject(p:any){ if(confirm(`确定删除项目「${p.name}」？该操作不可恢复。`)){ store.deleteProject(p.id); router.push('/modelica/projects') } }
function openLib(lib:typeof libraries[0]){ libCurrent.value=lib; libOpen.value=true }
const libClasses=computed(()=>{ const lib=libShown.value; return Array.from({length:Math.min(lib.classes,10)},(_,i)=>`${lib.name.replace('Platform.','')}.${['BaseTypes','Interfaces','Sources','Sensors','Examples'][i%5]}.Class${String(i+1).padStart(2,'0')}`) })
const parsedVars=computed(()=>Array.from(code.value.matchAll(/\bReal\s+(\w+)/g)).map(m=>m[1]))
function modelNumber(pattern:RegExp,fallback:number){const match=(code.value||project.value?.code||'').match(pattern);const value=Number(match?.[1]);return Number.isFinite(value)?value:fallback}
const analyticDemoSupported=computed(()=>/der\s*\(\s*x\s*\)\s*=\s*v\s*;/.test(code.value)&&/m\s*\*\s*der\s*\(\s*v\s*\)[^;]*k\s*\*\s*x\s*=\s*0\s*;/.test(code.value))
const analyticParameters=computed(()=>({
  m:modelNumber(/parameter\s+Real\s+m(?:\s*\([^)]*\))?\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,1),
  k:modelNumber(/parameter\s+Real\s+k(?:\s*\([^)]*\))?\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,100),
  c:modelNumber(/parameter\s+Real\s+c(?:\s*\([^)]*\))?\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,.5),
  x0:modelNumber(/Real\s+x\s*\([^)]*\bstart\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,.1),
  v0:modelNumber(/Real\s+v\s*\([^)]*\bstart\s*=\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,0)
}))
const experimentIssues=computed(()=>{
  const issues:string[]=[]
  if(!Number.isFinite(experiment.start)||!Number.isFinite(experiment.stop)||experiment.stop<=experiment.start)issues.push('停止时间必须大于开始时间')
  if(!Number.isFinite(experiment.interval)||experiment.interval<=0)issues.push('输出间隔必须大于 0')
  if(!Number.isFinite(experiment.tolerance)||experiment.tolerance<=0)issues.push('容差必须大于 0')
  const points=(experiment.stop-experiment.start)/experiment.interval+1
  if(Number.isFinite(points)&&points>20001)issues.push('输出点超过 20,001，请增大输出间隔')
  const {m,k,c}=analyticParameters.value
  if(!(m>0)&&analyticDemoSupported.value)issues.push('质量 m 必须大于 0')
  if(!(k>0)&&analyticDemoSupported.value)issues.push('刚度 k 必须大于 0')
  if(!(c>=0)&&analyticDemoSupported.value)issues.push('阻尼 c 不能为负数')
  if(analyticDemoSupported.value&&c*c>=4*m*k)issues.push('当前解析演示仅支持欠阻尼条件 c² < 4mk')
  return issues
})
const time=computed(()=>{
  if(experimentIssues.value.length)return []
  const duration=experiment.stop-experiment.start
  const intervals=Math.ceil(duration/experiment.interval)
  return Array.from({length:intervals+1},(_,index)=>index===intervals?experiment.stop:experiment.start+index*experiment.interval)
})
const response=computed(()=>{
  const {m,k,c,x0,v0}=analyticParameters.value
  const alpha=c/(2*m),omega=Math.sqrt(k/m-alpha*alpha),b=(v0+alpha*x0)/omega
  return time.value.map(t=>{const tau=t-experiment.start;return Math.exp(-alpha*tau)*(x0*Math.cos(omega*tau)+b*Math.sin(omega*tau))})
})
const velocity=computed(()=>{
  const {m,k,c,x0,v0}=analyticParameters.value
  const alpha=c/(2*m),omega=Math.sqrt(k/m-alpha*alpha),b=(v0+alpha*x0)/omega
  return time.value.map(t=>{const tau=t-experiment.start,cos=Math.cos(omega*tau),sin=Math.sin(omega*tau);return Math.exp(-alpha*tau)*(-x0*omega*sin+b*omega*cos-alpha*(x0*cos+b*sin))})
})
const displacementStats=computed(()=>({min:response.value.length?Math.min(...response.value):NaN,max:response.value.length?Math.max(...response.value):NaN,final:response.value.at(-1)??NaN}))
const templates=[{name:'质量—弹簧—阻尼',type:'机械',desc:'二阶线性系统与参数化实验',class:'MassSpringDamper'},{name:'双容腔热网络',type:'热学',desc:'热容、热阻与阶跃响应',class:'ThermalNetwork'},{name:'液压容腔与管路',type:'Fluid0D',desc:'可压缩容腔与管路阻力',class:'HydraulicCircuit'},{name:'单轴转子系统',type:'AeroEngine',desc:'转动惯量、负载与控制器',class:'SingleSpool'}]
const libraries=[{name:'Platform.Base',version:'1.0.0',classes:28,status:'已验证',desc:'类型、接口、单位与基础图标'},{name:'Platform.Math',version:'1.0.0',classes:34,status:'已验证',desc:'数学函数与插值工具'},{name:'Platform.Blocks',version:'1.0.0',classes:46,status:'已验证',desc:'连续、离散与逻辑信号块'},{name:'Platform.Thermal',version:'1.0.0',classes:22,status:'已验证',desc:'热容、导热、边界与传感器'},{name:'Platform.Fluid0D',version:'1.0.0',classes:31,status:'已验证',desc:'零维流体端口、容腔和阻力'},{name:'AeroEngine',version:'0.9.0',classes:25,status:'候选',desc:'转子、容腔、管路与特性图组件'}]
</script>

<template>
  <div v-if="hub" class="page modelica-hub">
    <section class="modelica-hero"><div class="container"><div><span class="kicker">SYSTEM MODELING</span><h1>Modelica 系统建模工作台</h1><p>从源码与组件建立方程模型，完成轻量结构检查，并用受支持的基准解析演示核对初值、采样与结果展示。</p><div class="hero-actions"><NuxtLink to="/modelica/projects" class="button large"><Plus :size="18"/>新建项目</NuxtLink><NuxtLink to="/modelica/templates" class="button secondary large">从模板开始</NuxtLink><NuxtLink to="/modelica/libraries" class="text-link"><Library :size="17"/>浏览组件库</NuxtLink></div></div><div class="model-topology"><div class="topo-toolbar"><span>MassSpringDamper.mo</span><b>CHECKED</b></div><div class="topo-nodes"><div><Boxes/><span>Fixed</span></div><i></i><div><Boxes/><span>Spring</span></div><i></i><div><Boxes/><span>Mass</span></div></div><div class="topo-code"><span>equation</span><code>m * der(v) + c * v + k * x = 0;</code></div></div></div></section>
    <section class="container modelica-steps"><div v-for="(item,i) in [{t:'创建模型',d:'从空项目或可信模板开始',icon:Code2},{t:'结构检查',d:'定位可由本地规则确认的结构问题',icon:Bug},{t:'解析演示',d:'锁定初值、参数与采样配置',icon:Play},{t:'分析结果',d:'对比曲线、统计量与导出数据',icon:Activity}]" :key="item.t"><span>0{{i+1}}</span><component :is="item.icon"/><h2>{{item.t}}</h2><p>{{item.d}}</p><ArrowRight v-if="i<3" class="step-arrow"/></div></section>
    <section class="section"><div class="container"><div class="section-heading"><div><span class="kicker">STARTER PROJECTS</span><h2>从可运行模板开始</h2></div><NuxtLink to="/modelica/templates" class="text-link">全部模板 <ArrowRight :size="16"/></NuxtLink></div><div class="template-grid"><NuxtLink v-for="t in templates" :key="t.name" to="/modelica/projects"><div><span>{{t.type}}</span><Boxes :size="26"/></div><h3>{{t.name}}</h3><p>{{t.desc}}</p><small>{{t.class}} · PlatformModelica-1.0</small></NuxtLink></div></div></section>
    <section class="modelica-support"><div class="container"><div><span class="kicker">LANGUAGE PROFILE</span><h2>明确支持的运行边界</h2><p>当前工作台提供源码编辑、图形建模和轻量结构检查；内置运行仅对质量—弹簧—阻尼基准给出本地欠阻尼解析演示，不等同于 OpenModelica 编译或通用 DAE 求解。</p></div><div><span><CheckCircle2/>源码与图形编辑</span><span><CheckCircle2/>基础结构诊断</span><span><CheckCircle2/>基准模型解析演示</span><span><AlertTriangle/>尚未接入 OMC / CVODE / IDA</span><span><AlertTriangle/>连接器类型检查有限</span><span><AlertTriangle/>外部函数不执行</span></div></div></section>
  </div>

  <div v-else-if="projectsPage" class="page account-like"><div class="container content-section"><header class="page-title-row"><div><span class="kicker">MY WORKSPACE</span><h1>Modelica 项目</h1><p>项目、源码修订和实验记录保存在本机浏览器。</p></div><button class="button" @click="newDialog=true"><Plus :size="17"/>新建项目</button></header><div class="list-toolbar"><div class="page-search inline"><Search :size="17"/><input placeholder="搜索项目…"></div><div class="view-toggle"><button :class="{active:projectView==='表格'}" @click="projectView='表格'">表格</button><button :class="{active:projectView==='卡片'}" @click="projectView='卡片'">卡片</button></div></div><div v-if="projectView==='表格'" class="project-table"><div class="table-head"><span>项目</span><span>顶层模型</span><span>依赖</span><span>最近编译</span><span>最近编辑</span><span></span></div><div v-for="p in store.projects" :key="p.id" class="table-row"><span><FileCode2 :size="19"/><span><strong>{{p.name}}</strong><small>{{p.id}}</small></span></span><span>{{p.template}}</span><span><i class="status success">已锁定</i></span><span><i class="status" :class="p.lastCompile==='成功'?'success':p.lastCompile==='有诊断'?'danger':''">{{p.lastCompile}}</i></span><span>{{new Date(p.updatedAt).toLocaleString('zh-CN')}}</span><span><NuxtLink :to="`/modelica/projects/${p.id}/editor`" class="button secondary small">打开</NuxtLink><button class="icon-button" @click="archiveProject(p)"><Archive :size="16"/></button></span></div></div><div v-else class="project-card-grid"><NuxtLink v-for="p in store.projects" :key="p.id" :to="`/modelica/projects/${p.id}/editor`" class="project-card"><Boxes :size="22"/><div><strong>{{p.name}}</strong><small>{{p.id}} · {{p.template}}</small></div><span><i class="status" :class="p.lastCompile==='成功'?'success':'danger'">{{p.lastCompile}}</i></span><em>编辑于 {{new Date(p.updatedAt).toLocaleString('zh-CN')}}</em></NuxtLink></div></div></div>

  <div v-else-if="editorPage && project" class="modelica-ide omedit-workspace">
    <div class="ide-toolbar"><div class="ide-project"><NuxtLink to="/modelica/projects"><ChevronRight class="back-chevron" :size="16"/></NuxtLink><strong>{{project.name}}</strong><span><GitBranch :size="13"/>main · 本地快照</span></div><label>顶层模型<select><option>{{project.template}}</option></select></label><div class="om-view-switch"><button :class="{active:editorView==='diagram'}" @click="editorView='diagram'"><LayoutGrid :size="14"/>图形</button><button :class="{active:editorView==='text'}" @click="editorView='text'"><Code2 :size="14"/>文本</button><button :class="{active:editorView==='icon'}" @click="editorView='icon'"><Image :size="14"/>图标</button></div><div class="ide-actions"><span :class="{dirty}">{{dirty?'有未保存修改':'已保存'}}</span><button class="button secondary small" @click="save"><Save :size="15"/>保存</button><button class="button secondary small" :disabled="compiling" @click="compile"><Bug :size="15"/>{{compiling?compileStage:'检查模型'}}</button><button class="button small" @click="openSimulation"><Play :size="15"/>仿真设置</button></div></div>
    <div class="ide-grid"><aside class="project-explorer"><div class="panel-title"><span>库浏览器</span><Plus :size="15"/></div><div class="tree-section"><strong><ChevronDown :size="14"/>{{project.name}}</strong><button class="active"><FileCode2 :size="15"/>{{project.template}}.mo</button><button><FileCode2 :size="15"/>package.mo</button></div><div class="tree-section"><strong><ChevronDown :size="14"/>Modelica 标准库</strong><button><Library :size="15"/>Mechanics <small>4.0.0</small></button><button><Library :size="15"/>Blocks <small>4.0.0</small></button><button><Library :size="15"/>Thermal <small>4.0.0</small></button></div><div class="outline"><div class="panel-title">模型大纲</div><button v-for="v in parsedVars" :key="v">{{v}} <small>Real</small></button><button>equation <small>{{modelStats.equations}} 条</small></button></div></aside>
      <section class="editor-center"><div class="editor-tabs"><button class="active"><FileCode2 :size="14"/>{{project.template}}.mo <i v-if="dirty"></i></button><button v-if="editorView==='diagram'" @click="syncDiagramToText"><RefreshCw :size="13"/>同步到文本</button></div>
        <ModelicaDiagram v-if="editorView==='diagram'" ref="diagramRef" @select="selectedDiagramNode=$event" @change="diagramChanged"/>
        <div v-else-if="editorView==='text'" class="code-editor"><div class="line-numbers"><span v-for="n in code.split('\n').length" :key="n">{{n}}</span></div><textarea v-model="code" spellcheck="false" aria-label="Modelica 源码编辑器"></textarea></div>
        <div v-else class="om-icon-editor"><div class="om-icon-preview"><div class="om-icon-component"><Boxes :size="44"/><strong>{{project.template}}</strong><span>Modelica model</span><i class="icon-port left"></i><i class="icon-port right"></i></div></div><aside><strong>图标注释</strong><label>坐标范围<input value="[-100,-100;100,100]"></label><label>网格<input value="2 × 2"></label><label>保持宽高比<input type="checkbox" checked></label><p>图标视图会生成 annotation(Icon(...))，供组件库与图形模型复用。</p></aside></div>
        <div class="bottom-panel"><div class="bottom-tabs"><button :class="{active:bottomTab==='problems'}" @click="bottomTab='problems'">问题 <b>{{diagnostics.length}}</b></button><button :class="{active:bottomTab==='output'}" @click="bottomTab='output'">检查输出</button><button :class="{active:bottomTab==='tasks'}" @click="bottomTab='tasks'">任务</button><button :class="{active:bottomTab==='variables'}" @click="bottomTab='variables'">变量</button><PanelBottomClose :size="16"/></div><div v-if="bottomTab==='problems'" class="problems"><div v-if="!diagnostics.length" class="ide-empty"><CheckCircle2 :size="18"/>未发现基础结构问题（尚未执行完整语义检查）</div><button v-for="d in diagnostics" :key="d.code+d.line"><AlertTriangle :size="15" :class="d.severity"/><span>{{d.text}}</span><code>{{d.code}}</code><small>第 {{d.line}} 行</small></button></div><div v-else-if="bottomTab==='tasks'" class="problems"><div class="ide-empty"><Clock3 :size="18"/>实验配置：{{experiment.start}}–{{experiment.stop}} s · 本地解析演示</div></div><div v-else-if="bottomTab==='variables'" class="problems"><button v-for="v in parsedVars" :key="v"><Code2 :size="15"/><span>{{v}}</span><code>Real</code><small>连续</small></button></div><pre v-else class="compile-output"><code>[checker] local lightweight Modelica inspection (not OMC)\n[parser] parsed {{code.split('\n').length}} lines\n[structure] {{diagramStats.components}} components, {{diagramStats.connections}} connections\n[summary] {{modelStats.parameters}} parameters, {{modelStats.variables}} variables, {{modelStats.equations}} equations\n[progress] {{compileProgress}}% · {{compileStage}}\n{{diagnostics.length?'[diagnostic] '+diagnostics.length+' issue(s) found':'[success] basic structural checks completed'}}\n[runtime] only the MassSpringDamper underdamped analytic demo is executable locally</code></pre></div></section>
      <aside class="model-inspector"><div class="panel-title"><span>属性编辑器</span><Settings2 :size="15"/></div><template v-if="selectedDiagramNode"><div class="class-badge"><Boxes/><div><small>{{selectedDiagramNode.type}}</small><strong>{{selectedDiagramNode.label}}</strong></div></div><div class="inspector-section"><strong>组件参数</strong><label v-for="(value,key) in selectedDiagramNode.parameters" :key="key">{{key}} <span>参数</span><input :value="value" @input="updateDiagramParameter(String(key),$event)"></label><p v-if="!Object.keys(selectedDiagramNode.parameters).length">此组件没有公开参数。</p></div><div class="inspector-section"><strong>放置变换</strong><p>x = {{selectedDiagramNode.x.toFixed(0)}} · y = {{selectedDiagramNode.y.toFixed(0)}}</p><p>rotation = 0° · visible = true</p></div></template><template v-else><div class="class-badge"><Boxes/><div><small>model</small><strong>{{project.template}}</strong></div></div><dl><div><dt>组件</dt><dd>{{diagramStats.components}}</dd></div><div><dt>连接</dt><dd>{{diagramStats.connections}}</dd></div><div><dt>变量</dt><dd>{{modelStats.variables}}</dd></div><div><dt>结构</dt><dd><i class="status success">平衡</i></dd></div></dl></template><div class="inspector-section"><strong>仿真实验</strong><p>{{experiment.start}} → {{experiment.stop}} s</p><p>{{experiment.solver}} · tol {{experiment.tolerance}}</p></div></aside></div>
  </div>

  <div v-else-if="runPage" class="page modelica-result">
    <div class="container">
      <div class="breadcrumb"><NuxtLink to="/modelica/projects">Modelica 项目</NuxtLink><ChevronRight :size="14"/><span>{{project?.name}}</span><ChevronRight :size="14"/><span>解析演示结果</span></div>
      <header class="result-header">
        <div><span class="status-badge success"><CheckCircle2 :size="16"/>解析演示完成</span><h1>{{project?.template || 'MassSpringDamper'}} · 欠阻尼基准</h1><p>RUN-{{projectId.toUpperCase()}} · 本地质量—弹簧—阻尼解析器 · 非通用 Modelica 编译结果</p></div>
        <button class="button" @click="exportResults('csv')"><Download :size="16"/>导出结果</button>
      </header>
      <section class="summary-grid">
        <div><small>采样区间</small><strong>{{experiment.start}} – {{experiment.stop}} s</strong></div>
        <div><small>输出点</small><strong>{{time.length}}</strong></div>
        <div><small>输出间隔</small><strong>{{experiment.interval}} s</strong></div>
        <div><small>初始速度</small><strong>{{analyticParameters.v0.toPrecision(4)}} m/s</strong></div>
        <div><small>最大位移</small><strong>{{Number.isFinite(displacementStats.max)?displacementStats.max.toFixed(4):'—'}} m</strong></div>
      </section>
      <div class="model-result-grid">
        <aside class="variable-tree"><div class="page-search inline"><Search :size="15"/><input placeholder="筛选变量"></div><strong><ChevronDown :size="14"/>{{project?.template}}</strong><label><input type="checkbox" checked><i style="--series:#1769aa"></i>x <small>m</small></label><label><input type="checkbox" checked><i style="--series:#7b8791"></i>v <small>m/s</small></label></aside>
        <section class="model-chart">
          <div class="result-chart-head"><div><h2>动态响应</h2><p>满足 x(t₀)=x₀、v(t₀)=v₀ 的欠阻尼解析解</p></div><div class="view-toggle"><button :class="{active:runView==='曲线'}" @click="runView='曲线'">曲线</button><button :class="{active:runView==='统计'}" @click="runView='统计'">统计</button></div></div>
          <template v-if="runView==='曲线'"><DataChart :x="time" :y="response" :y2="velocity" label="x / m" label2="v / m·s⁻¹"/></template>
          <div v-else class="run-stats"><div class="data-table"><div><strong>变量</strong><strong>最小值</strong><strong>最大值</strong><strong>终值</strong></div><div><span>x</span><span>{{Math.min(...response).toFixed(4)}}</span><span>{{Math.max(...response).toFixed(4)}}</span><span>{{response.at(-1)?.toFixed(4)}}</span></div><div><span>v</span><span>{{Math.min(...velocity).toFixed(4)}}</span><span>{{Math.max(...velocity).toFixed(4)}}</span><span>{{velocity.at(-1)?.toFixed(4)}}</span></div></div></div>
        </section>
        <aside class="run-properties"><div class="panel-title">变量属性</div><strong>x</strong><dl><div><dt>类型</dt><dd>Real</dd></div><div><dt>单位</dt><dd>m</dd></div><div><dt>最小值</dt><dd>{{Number.isFinite(displacementStats.min)?displacementStats.min.toFixed(4):'—'}}</dd></div><div><dt>最大值</dt><dd>{{Number.isFinite(displacementStats.max)?displacementStats.max.toFixed(4):'—'}}</dd></div><div><dt>终值</dt><dd>{{Number.isFinite(displacementStats.final)?displacementStats.final.toFixed(4):'—'}}</dd></div></dl></aside>
      </div>
      <section class="result-content"><h2>计算边界</h2><div class="inline-alert info"><Info :size="18"/><span>本结果由浏览器内的线性欠阻尼解析式生成，用于验证采样、初值和结果展示；它没有调用 OMC、CVODE、DASSL 或通用 DAE 求解器。</span></div><div class="repro-id"><span>参数快照</span><code>m={{analyticParameters.m}} · c={{analyticParameters.c}} · k={{analyticParameters.k}} · x₀={{analyticParameters.x0}} · v₀={{analyticParameters.v0}}</code><button @click="copyText(JSON.stringify({experiment:{...experiment},parameters:analyticParameters}),'repro')"><Check v-if="copiedFlag==='repro'" :size="15"/><Copy v-else :size="15"/>{{copiedFlag==='repro'?'已复制':'复制'}}</button></div></section>
    </div>
  </div>

  <div v-else-if="librariesPage" class="page"><section class="page-hero"><div class="container"><span class="kicker">COMPONENT LIBRARIES</span><h1>Modelica 组件库</h1><p>版本化、只读、经过接口检查与验证案例校核的工程组件。</p></div></section><div class="container content-section"><div class="library-grid"><div v-for="lib in libraries" :key="lib.name"><div><Library :size="24"/><span class="status" :class="lib.status==='已验证'?'success':'warning'">{{lib.status}}</span></div><h2>{{lib.name}}</h2><p>{{lib.desc}}</p><dl><div><dt>版本</dt><dd>{{lib.version}}</dd></div><div><dt>公开类</dt><dd>{{lib.classes}}</dd></div></dl><button class="button secondary small" @click="openLib(lib)">查看组件 <ArrowRight :size="15"/></button></div></div></div></div>

  <div v-if="libOpen" class="modal-backdrop" @click.self="libOpen=false"><div class="dialog-card"><div><h2>{{libShown.name}} <span class="status" :class="libShown.status==='已验证'?'success':'warning'">{{libShown.status}}</span></h2><button type="button" class="icon-button" @click="libOpen=false">×</button></div><p class="lib-desc">{{libShown.desc}}</p><div class="algorithm-table compare-table"><div class="table-head"><span>公开类</span><span>类型</span></div><div v-for="c in libClasses" :key="c" class="table-row"><span>{{c}}</span><span><i class="status success">class</i></span></div></div><footer><button class="button secondary" @click="libOpen=false">关闭</button></footer></div></div>

  <div v-if="simDialog" class="modal-backdrop" @click.self="simDialog=false"><form class="dialog-card om-simulation-dialog" @submit.prevent="run"><div><h2>本地解析实验设置</h2><button type="button" class="icon-button" @click="simDialog=false">×</button></div><div class="om-dialog-summary"><Activity :size="20"/><span><strong>{{project?.template}}</strong><small>{{diagnostics.length?'存在结构诊断，请先修正':analyticDemoSupported?'已识别质量—弹簧—阻尼方程，可运行欠阻尼解析演示':'当前模型不在本地解析演示支持范围内'}}</small></span></div><div class="om-experiment-grid"><label>开始时间<input v-model.number="experiment.start" type="number" step="any"></label><label>停止时间<input v-model.number="experiment.stop" type="number" step="any"></label><label>输出间隔<input v-model.number="experiment.interval" type="number" min="0" step="any"></label><label>容差<input v-model.number="experiment.tolerance" type="number" min="0" step="any"></label><label>运行方式<select disabled><option>欠阻尼解析解</option></select></label><label>输出格式<select v-model="experiment.output"><option value="csv">CSV</option><option value="mat" disabled>MAT（未接入）</option><option value="plt" disabled>PLT（未接入）</option></select></label></div><label>变量过滤器<input v-model="experiment.variableFilter"><small>解析演示固定输出 t、x 和 v</small></label><div v-if="experimentIssues.length" class="inline-alert warning"><AlertTriangle :size="17"/><span>{{experimentIssues.join('；')}}</span></div><div class="inline-alert info"><Settings2 :size="17"/><span>预计输出 {{Math.max(0,Math.ceil((experiment.stop-experiment.start)/Math.max(experiment.interval,1e-9))+1)}} 个时间点；当前不会调用 OMC、CVODE、DASSL 或 IDA。</span></div><footer><button type="button" class="button secondary" @click="simDialog=false">取消</button><button class="button" :disabled="diagnostics.some(d=>d.severity==='error')||experimentIssues.length>0||!analyticDemoSupported"><Play :size="16"/>运行解析演示</button></footer></form></div>

  <div v-if="templatesPage" class="page"><section class="page-hero"><div class="container"><span class="kicker">PROJECT TEMPLATES</span><h1>示例项目与模板</h1><p>每个模板包含锁定依赖、实验配置和参考结果。</p></div></section><div class="container content-section"><div class="template-grid large"><div v-for="t in templates" :key="t.name"><div><span>{{t.type}}</span><Boxes :size="28"/></div><h2>{{t.name}}</h2><p>{{t.desc}}</p><small>{{t.class}} · PlatformModelica-1.0</small><button class="button" @click="newName=t.name;create()">使用此模板</button></div></div></div></div>

  <div v-if="newDialog" class="modal-backdrop" @click.self="newDialog=false"><form class="dialog-card" @submit.prevent="create"><div><h2>新建 Modelica 项目</h2><button type="button" class="icon-button" @click="newDialog=false">×</button></div><label>项目名称<input v-model="newName" required maxlength="60"><small>项目会保存在当前浏览器中</small></label><label>模板<select><option>MassSpringDamper</option><option>空项目</option><option>ThermalNetwork</option></select></label><label>语言版本<select><option>PlatformModelica-1.0</option></select></label><footer><button type="button" class="button secondary" @click="newDialog=false">取消</button><button class="button">创建并打开</button></footer></form></div>
</template>
