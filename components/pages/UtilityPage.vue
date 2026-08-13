<script setup lang="ts">
import { ArrowRightLeft, Calculator, Gauge, Grid3X3, RotateCcw, Copy, Check, Info, Ruler, Wind, Clock3, Layers3, ScanText, Sigma, Upload, Image as ImageIcon, LoaderCircle, AlertTriangle, FileCode2 } from 'lucide-vue-next'
import { convertFormula } from '~/utils/formula/converter'

type ToolId = 'units' | 'dimensionless' | 'cfl' | 'boundary' | 'imageFormula' | 'formulaStandard'
const activeTool = ref<ToolId>('units')
const copied = ref('')

const toolList = [
  { id: 'units' as ToolId, name: '工程单位换算', description: '长度、速度、压力、黏度和温度', icon: ArrowRightLeft },
  { id: 'dimensionless' as ToolId, name: '无量纲数计算', description: 'Re、Pe、Ma 与 Pr 快速估算', icon: Calculator },
  { id: 'cfl' as ToolId, name: 'CFL 与时间步', description: '根据网格与速度选择稳定时间步', icon: Gauge },
  { id: 'boundary' as ToolId, name: '边界层网格', description: '首层高度、增长率和总厚度', icon: Grid3X3 }
  ,{ id: 'imageFormula' as ToolId, name: '图片公式识别', description: '本地 OCR、校对与公式提取', icon: ScanText }
  ,{ id: 'formulaStandard' as ToolId, name: '标准公式转换', description: 'LaTeX、MathML、Word 与 Modelica', icon: Sigma }
]

const imageInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
const imageName = ref('')
const ocrText = ref('')
const ocrProgress = ref(0)
const ocrStatus = ref('等待图片')
const ocrRunning = ref(false)
const ocrLanguage = ref('eng')
const ocrCanvas = ref<HTMLCanvasElement | null>(null)
const formulaInput = ref('Re = rho U L / mu')
const formulaResult = computed(() => convertFormula(formulaInput.value))
const formulaOutput = ref<'latex'|'word'|'mathml'|'modelica'>('latex')
const modelicaFormula = computed(() => formulaResult.value.plain
  .replaceAll('×','*').replaceAll('·','*').replaceAll('÷','/').replaceAll('−','-')
  .replace(/√\(([^)]+)\)/g,'sqrt($1)').replace(/([A-Za-z0-9_)]+)\^([A-Za-z0-9(]+)/g,'$1^$2'))
const currentFormulaOutput = computed(() => formulaOutput.value === 'latex' ? formulaResult.value.latex : formulaOutput.value === 'word' ? formulaResult.value.unicodeMath : formulaOutput.value === 'mathml' ? formulaResult.value.mathml : modelicaFormula.value)

function openImagePicker(){ imageInput.value?.click() }
async function loadFormulaImage(event: Event){
  const file=(event.target as HTMLInputElement).files?.[0]; if(!file)return
  if(imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value=URL.createObjectURL(file); imageName.value=file.name; ocrText.value=''; ocrStatus.value='图片已载入'
  await nextTick(); preprocessImage()
}
function preprocessImage(){
  const image=document.querySelector<HTMLImageElement>('.formula-image-preview img'); const canvas=ocrCanvas.value
  if(!image||!canvas||!image.complete)return
  const max=1600, scale=Math.min(1,max/image.naturalWidth), width=Math.max(1,Math.round(image.naturalWidth*scale)), height=Math.max(1,Math.round(image.naturalHeight*scale))
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)return
  ctx.filter='grayscale(1) contrast(1.65)';ctx.drawImage(image,0,0,width,height);ctx.filter='none'
  const data=ctx.getImageData(0,0,width,height);for(let i=0;i<data.data.length;i+=4){const v=data.data[i]>178?255:data.data[i]<70?0:data.data[i];data.data[i]=data.data[i+1]=data.data[i+2]=v}ctx.putImageData(data,0,0)
}
async function recognizeFormula(){
  if(!ocrCanvas.value)return
  ocrRunning.value=true;ocrProgress.value=0;ocrStatus.value='加载本地 OCR 引擎'
  try{
    const { recognize }=await import('tesseract.js')
    const result=await recognize(ocrCanvas.value,ocrLanguage.value,{logger(message:any){if(message.status){ocrStatus.value=message.status;if(message.progress)ocrProgress.value=Math.round(message.progress*100)}}})
    ocrText.value=result.data.text.trim().replace(/\s*\n\s*/g,' ');ocrStatus.value='识别完成';ocrProgress.value=100
    formulaInput.value=ocrText.value
  }catch(error){ocrStatus.value='识别失败，请检查网络或改用手动校对';console.warn(error)}finally{ocrRunning.value=false}
}
function useOcrInConverter(){formulaInput.value=ocrText.value;activeTool.value='formulaStandard'}

const unitCategory = ref('length')
const unitValue = ref(1)
const unitFrom = ref('m')
const unitTo = ref('mm')
const unitGroups: Record<string, { label: string; units: Record<string, { label: string; factor: number; offset?: number }> }> = {
  length: { label: '长度', units: { m: { label: '米 m', factor: 1 }, mm: { label: '毫米 mm', factor: .001 }, um: { label: '微米 μm', factor: 1e-6 }, in: { label: '英寸 in', factor: .0254 }, ft: { label: '英尺 ft', factor: .3048 } } },
  velocity: { label: '速度', units: { ms: { label: 'm/s', factor: 1 }, kmh: { label: 'km/h', factor: 1 / 3.6 }, knot: { label: '节 knot', factor: .514444 }, fts: { label: 'ft/s', factor: .3048 } } },
  pressure: { label: '压力', units: { pa: { label: 'Pa', factor: 1 }, kpa: { label: 'kPa', factor: 1000 }, mpa: { label: 'MPa', factor: 1e6 }, bar: { label: 'bar', factor: 1e5 }, atm: { label: 'atm', factor: 101325 }, psi: { label: 'psi', factor: 6894.757 } } },
  viscosity: { label: '动力黏度', units: { pas: { label: 'Pa·s', factor: 1 }, mpas: { label: 'mPa·s', factor: .001 }, cp: { label: 'cP', factor: .001 }, p: { label: 'P', factor: .1 } } },
  temperature: { label: '温度', units: { c: { label: '°C', factor: 1 }, k: { label: 'K', factor: 1 }, f: { label: '°F', factor: 1 } } }
}
const unitOptions = computed(() => unitGroups[unitCategory.value].units)
const unitResult = computed(() => {
  const value = Number(unitValue.value)
  if (unitCategory.value === 'temperature') {
    let kelvin = unitFrom.value === 'c' ? value + 273.15 : unitFrom.value === 'f' ? (value - 32) * 5 / 9 + 273.15 : value
    return unitTo.value === 'c' ? kelvin - 273.15 : unitTo.value === 'f' ? (kelvin - 273.15) * 9 / 5 + 32 : kelvin
  }
  return value * unitOptions.value[unitFrom.value].factor / unitOptions.value[unitTo.value].factor
})
watch(unitCategory, () => {
  const keys = Object.keys(unitGroups[unitCategory.value].units)
  unitFrom.value = keys[0]; unitTo.value = keys[1] || keys[0]
})

const dimensionless = reactive({ rho: 1.225, velocity: 30, length: .5, mu: .0000181, alpha: .0000215, sound: 343, cp: 1005, k: .0257 })
const dimensionlessValid = computed(() => [dimensionless.rho, dimensionless.length, dimensionless.mu, dimensionless.alpha, dimensionless.sound, dimensionless.cp, dimensionless.k].every(value => Number.isFinite(value) && value > 0) && Number.isFinite(dimensionless.velocity))
const re = computed(() => dimensionlessValid.value ? dimensionless.rho * Math.abs(dimensionless.velocity) * dimensionless.length / dimensionless.mu : NaN)
const pe = computed(() => dimensionlessValid.value ? Math.abs(dimensionless.velocity) * dimensionless.length / dimensionless.alpha : NaN)
const ma = computed(() => dimensionlessValid.value ? Math.abs(dimensionless.velocity) / dimensionless.sound : NaN)
const pr = computed(() => dimensionlessValid.value ? dimensionless.cp * dimensionless.mu / dimensionless.k : NaN)

const cflInput = reactive({ velocity: 10, cell: .005, cfl: .8, duration: 1 })
const cflValid = computed(() => cflInput.cell > 0 && cflInput.cfl > 0 && cflInput.duration > 0 && Number.isFinite(cflInput.velocity) && Math.abs(cflInput.velocity) > 0)
const deltaT = computed(() => cflValid.value ? cflInput.cfl * cflInput.cell / Math.abs(cflInput.velocity) : NaN)
const steps = computed(() => cflValid.value ? Math.ceil(cflInput.duration / deltaT.value) : 0)

const layer = reactive({ rho: 1.225, velocity: 40, length: .5, mu: .0000181, yplus: 1, growth: 1.2, count: 20 })
const layerValid = computed(() => [layer.rho, layer.velocity, layer.length, layer.mu, layer.yplus, layer.growth, layer.count].every(value => Number.isFinite(value) && value > 0) && layer.growth >= 1 && Number.isInteger(layer.count))
const layerRe = computed(() => layerValid.value ? layer.rho * Math.abs(layer.velocity) * layer.length / layer.mu : NaN)
const cf = computed(() => .026 / Math.pow(Math.max(layerRe.value, 1), 1 / 7))
const frictionVelocity = computed(() => layerValid.value ? Math.abs(layer.velocity) * Math.sqrt(cf.value / 2) : NaN)
const firstHeight = computed(() => layerValid.value ? layer.yplus * layer.mu / (layer.rho * frictionVelocity.value) : NaN)
const totalThickness = computed(() => !layerValid.value ? NaN : Math.abs(layer.growth - 1) < 1e-8 ? firstHeight.value * layer.count : firstHeight.value * (Math.pow(layer.growth, layer.count) - 1) / (layer.growth - 1))

function format(value: number, digits = 6) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) >= 1e5 || (Math.abs(value) > 0 && Math.abs(value) < 1e-4)) return value.toExponential(4)
  return Number(value.toPrecision(digits)).toString()
}
async function copyResult(key: string, text: string) {
  await navigator.clipboard?.writeText(text); copied.value = key; setTimeout(() => copied.value = '', 1200)
}
function resetActive() {
  if (activeTool.value === 'units') { unitCategory.value = 'length'; unitValue.value = 1; unitFrom.value = 'm'; unitTo.value = 'mm' }
  if (activeTool.value === 'dimensionless') Object.assign(dimensionless, { rho: 1.225, velocity: 30, length: .5, mu: .0000181, alpha: .0000215, sound: 343, cp: 1005, k: .0257 })
  if (activeTool.value === 'cfl') Object.assign(cflInput, { velocity: 10, cell: .005, cfl: .8, duration: 1 })
  if (activeTool.value === 'boundary') Object.assign(layer, { rho: 1.225, velocity: 40, length: .5, mu: .0000181, yplus: 1, growth: 1.2, count: 20 })
  if (activeTool.value === 'imageFormula') { ocrText.value='';ocrProgress.value=0;ocrStatus.value=imageUrl.value?'图片已载入':'等待图片' }
  if (activeTool.value === 'formulaStandard') formulaInput.value='Re = rho U L / mu'
}
</script>

<template>
  <div class="page utility-page">
    <section class="utility-hero">
      <div class="container"><span class="kicker">ENGINEERING UTILITIES</span><h1>实用工具</h1><p>把工程中最常用的换算、估算和检查集中到一个页面。所有计算均在浏览器本地完成，不上传输入数据。</p><div class="utility-trust"><span><Ruler :size="16" />SI 单位优先</span><span><Wind :size="16" />面向流体工程</span><span><Clock3 :size="16" />输入即得结果</span></div></div>
    </section>
    <div class="container utility-layout">
      <aside class="utility-nav"><div class="utility-nav-title"><strong>工具箱</strong><span>{{ toolList.length }} 个工具</span></div><button v-for="item in toolList" :key="item.id" :class="{active:activeTool===item.id}" @click="activeTool=item.id"><span><component :is="item.icon" :size="19" /></span><div><strong>{{ item.name }}</strong><small>{{ item.description }}</small></div></button></aside>
      <main class="utility-workspace">
        <header><div><span class="kicker">{{ toolList.find(item=>item.id===activeTool)?.description }}</span><h2>{{ toolList.find(item=>item.id===activeTool)?.name }}</h2></div><button class="text-button" @click="resetActive"><RotateCcw :size="15" />恢复默认</button></header>

        <section v-if="activeTool==='units'" class="utility-tool-body">
          <div class="utility-input-panel"><label>物理量<select v-model="unitCategory"><option v-for="(group,key) in unitGroups" :key="key" :value="key">{{ group.label }}</option></select></label><label>数值<input v-model.number="unitValue" type="number" step="any"></label><div class="unit-convert-row"><label>从<select v-model="unitFrom"><option v-for="(unit,key) in unitOptions" :key="key" :value="key">{{ unit.label }}</option></select></label><ArrowRightLeft :size="19" /><label>到<select v-model="unitTo"><option v-for="(unit,key) in unitOptions" :key="key" :value="key">{{ unit.label }}</option></select></label></div></div>
          <div class="utility-result-card"><small>换算结果</small><strong>{{ format(unitResult) }}</strong><span>{{ unitOptions[unitTo]?.label }}</span><code>{{ unitValue }} {{ unitOptions[unitFrom]?.label }} = {{ format(unitResult) }} {{ unitOptions[unitTo]?.label }}</code><button @click="copyResult('unit',`${format(unitResult)} ${unitOptions[unitTo]?.label}`)"><Check v-if="copied==='unit'" :size="16" /><Copy v-else :size="16" />{{ copied==='unit'?'已复制':'复制结果' }}</button></div>
        </section>

        <section v-else-if="activeTool==='dimensionless'" class="utility-tool-body">
          <div class="utility-input-panel utility-field-grid"><label>密度 ρ<input v-model.number="dimensionless.rho" type="number" step="any"><small>kg/m³</small></label><label>速度 U<input v-model.number="dimensionless.velocity" type="number" step="any"><small>m/s</small></label><label>特征长度 L<input v-model.number="dimensionless.length" type="number" step="any"><small>m</small></label><label>动力黏度 μ<input v-model.number="dimensionless.mu" type="number" step="any"><small>Pa·s</small></label><label>热扩散率 α<input v-model.number="dimensionless.alpha" type="number" step="any"><small>m²/s</small></label><label>声速 a<input v-model.number="dimensionless.sound" type="number" step="any"><small>m/s</small></label><label>定压比热 Cp<input v-model.number="dimensionless.cp" type="number" step="any"><small>J/(kg·K)</small></label><label>导热系数 k<input v-model.number="dimensionless.k" type="number" step="any"><small>W/(m·K)</small></label></div>
          <div v-if="!dimensionlessValid" class="inline-alert warning"><AlertTriangle :size="17"/><span>除速度外的物性与尺度必须为正数；当前输入不会生成计算结果。</span></div><div class="utility-results-grid"><div><small>Reynolds 数</small><strong>{{ format(re) }}</strong><span>{{ Number.isFinite(re)?(re<2300?'管内层流参考区间':re<4000?'管内过渡参考区间':'管内湍流参考区间'):'输入无效' }}</span></div><div><small>Péclet 数</small><strong>{{ format(pe) }}</strong><span>{{ Number.isFinite(pe)?(pe>1?'对流占优':'扩散占优'):'输入无效' }}</span></div><div><small>Mach 数</small><strong>{{ format(ma) }}</strong><span>{{ Number.isFinite(ma)?(ma<.3?'可按不可压缩处理':'考虑可压缩性'):'输入无效' }}</span></div><div><small>Prandtl 数</small><strong>{{ format(pr) }}</strong><span>动量/热扩散率比</span></div></div>
        </section>

        <section v-else-if="activeTool==='cfl'" class="utility-tool-body">
          <div class="utility-input-panel utility-field-grid"><label>特征速度<input v-model.number="cflInput.velocity" type="number" step="any"><small>m/s</small></label><label>最小网格尺寸<input v-model.number="cflInput.cell" type="number" step="any"><small>m</small></label><label>目标 CFL<input v-model.number="cflInput.cfl" type="number" step="any"><small>显式格式通常 ≤ 1</small></label><label>物理时长<input v-model.number="cflInput.duration" type="number" step="any"><small>s</small></label></div>
          <div v-if="!cflValid" class="inline-alert warning"><AlertTriangle :size="17"/><span>速度绝对值、网格尺寸、CFL 与物理时长必须大于零。</span></div><div class="utility-result-card"><small>推荐时间步 Δt</small><strong>{{ format(deltaT) }}</strong><span>s</span><code>CFL = UΔt/Δx = {{ format(cflInput.cfl) }}</code><div class="utility-mini-metrics"><span><small>预计步数</small><strong>{{ steps.toLocaleString() }}</strong></span><span><small>单步流经比例</small><strong>{{ format(cflInput.cfl) }}</strong></span></div></div>
        </section>

        <section v-else-if="activeTool==='boundary'" class="utility-tool-body">
          <div class="utility-input-panel utility-field-grid"><label>密度 ρ<input v-model.number="layer.rho" type="number" step="any"><small>kg/m³</small></label><label>外流速度 U<input v-model.number="layer.velocity" type="number" step="any"><small>m/s</small></label><label>特征长度 L<input v-model.number="layer.length" type="number" step="any"><small>m</small></label><label>动力黏度 μ<input v-model.number="layer.mu" type="number" step="any"><small>Pa·s</small></label><label>目标 y⁺<input v-model.number="layer.yplus" type="number" step="any"><small>SST 常取 1；壁函数 30+</small></label><label>增长率<input v-model.number="layer.growth" type="number" min="1" step=".01"><small>建议 1.1–1.25</small></label><label>层数<input v-model.number="layer.count" type="number" min="1" step="1"><small>棱柱层数量</small></label></div>
          <div v-if="!layerValid" class="inline-alert warning"><AlertTriangle :size="17"/><span>近壁估算要求正物性、正速度、增长率不小于 1，且层数为正整数。</span></div><div class="utility-result-card"><small>建议首层高度</small><strong>{{ format(firstHeight * 1e6) }}</strong><span>μm</span><code>y₁ = y⁺ μ / (ρuτ)</code><div class="utility-mini-metrics"><span><small>Reynolds 数</small><strong>{{ format(layerRe) }}</strong></span><span><small>摩擦速度 uτ</small><strong>{{ format(frictionVelocity) }} m/s</strong></span><span><small>边界层总厚度</small><strong>{{ format(totalThickness * 1e3) }} mm</strong></span></div></div>
        </section>
        <section v-else-if="activeTool==='imageFormula'" class="utility-tool-body formula-ocr-body">
          <div class="formula-upload-panel">
            <input ref="imageInput" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="loadFormulaImage">
            <button v-if="!imageUrl" class="formula-dropzone" @click="openImagePicker"><Upload :size="34"/><strong>选择公式图片</strong><span>支持 PNG、JPG、WebP；建议裁剪到单行公式</span></button>
            <div v-else class="formula-image-preview"><img :src="imageUrl" alt="待识别公式图片" @load="preprocessImage"><button @click="openImagePicker"><ImageIcon :size="16"/>更换图片</button><span>{{imageName}}</span></div>
            <canvas ref="ocrCanvas" class="formula-preprocess-canvas"></canvas>
            <div class="ocr-controls"><label>识别语言<select v-model="ocrLanguage"><option value="eng">英文 / 数学符号</option><option value="chi_sim+eng">中文 + 英文</option></select></label><button class="button" :disabled="!imageUrl||ocrRunning" @click="recognizeFormula"><LoaderCircle v-if="ocrRunning" class="spin" :size="17"/><ScanText v-else :size="17"/>{{ocrRunning?'正在识别':'开始识别'}}</button></div>
            <div class="ocr-progress"><div><i :style="{width:ocrProgress+'%'}"></i></div><span>{{ocrStatus}} · {{ocrProgress}}%</span></div>
          </div>
          <div class="ocr-review-panel"><header><div><small>OCR 识别结果</small><strong>人工校对</strong></div><button :disabled="!ocrText" @click="copyResult('ocr',ocrText)"><Check v-if="copied==='ocr'" :size="15"/><Copy v-else :size="15"/>复制</button></header><textarea v-model="ocrText" placeholder="识别结果将显示在这里。请重点检查 0/O、1/l、μ/u、上下标与括号。" spellcheck="false"></textarea><div class="ocr-warning"><AlertTriangle :size="17"/><span>通用 OCR 能识别打印字符，但复杂分式、根号、矩阵和手写公式仍需人工校对。</span></div><button class="button full" :disabled="!ocrText.trim()" @click="useOcrInConverter"><Sigma :size="17"/>进入标准公式转换</button></div>
        </section>
        <section v-else class="formula-standard-workspace">
          <div class="formula-standard-input"><label>输入公式<textarea v-model="formulaInput" spellcheck="false" placeholder="粘贴 LaTeX、UnicodeMath、MathML 或普通公式文本"></textarea></label><div class="formula-format-tabs"><button v-for="item in [{id:'latex',label:'LaTeX'},{id:'word',label:'Word / WPS'},{id:'mathml',label:'MathML'},{id:'modelica',label:'Modelica'}]" :key="item.id" :class="{active:formulaOutput===item.id}" @click="formulaOutput=item.id as any">{{item.label}}</button></div><div class="formula-standard-preview"><small>标准排版预览</small><div v-if="formulaResult.previewHtml" v-html="formulaResult.previewHtml"></div><span v-else>输入公式后显示预览</span></div></div>
          <div class="formula-standard-output"><header><div><small>检测格式</small><strong>{{formulaResult.detectedFormat}}</strong></div><span :class="formulaResult.confidence>75?'success':'warning'">{{formulaResult.confidence}}% 可信度</span></header><pre><code>{{currentFormulaOutput||'暂无输出'}}</code></pre><button class="button full" :disabled="!currentFormulaOutput" @click="copyResult('formula',currentFormulaOutput)"><Check v-if="copied==='formula'" :size="16"/><Copy v-else :size="16"/>{{copied==='formula'?'已复制':'复制标准公式'}}</button><div class="formula-diagnostic-list"><div v-for="item in formulaResult.diagnostics" :key="item.code+item.message" :class="item.level"><Info v-if="item.level==='info'" :size="15"/><AlertTriangle v-else :size="15"/><span><strong>{{item.code}}</strong>{{item.message}}</span></div></div><NuxtLink to="/formulas/convert" class="text-link"><FileCode2 :size="16"/>打开高级乱码修复与转换器</NuxtLink></div>
        </section>
        <div class="inline-alert info utility-note"><Info :size="17" /><span>这些结果用于前期估算与设置检查。关键工程分析仍应结合实际几何、流动状态、网格无关性和实验数据复核。</span></div>
      </main>
    </div>
  </div>
</template>
