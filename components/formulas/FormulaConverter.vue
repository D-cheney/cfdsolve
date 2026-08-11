<script setup lang="ts">
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clipboard, Code2, Copy, FileCode2, History, RotateCcw, ShieldCheck, Sparkles, Trash2, WandSparkles, XCircle } from 'lucide-vue-next'
import { convertFormula, formulaSamples, type FormulaConversion, type FormulaFormat } from '~/utils/formula/converter'

type OutputTab = 'word' | 'latex' | 'mathml' | 'plain'
interface HistoryItem { id: string; input: string; output: string; format: OutputTab; createdAt: string }

const raw = ref('Re = ÏUL/Î¼')
const format = ref<FormulaFormat>('auto')
const outputTab = ref<OutputTab>('word')
const result = ref<FormulaConversion>(convertFormula(raw.value))
const copied = ref(false)
const history = ref<HistoryItem[]>([])
const historyOpen = ref(false)
const converting = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const formatLabels: Record<string, string> = { latex: 'LaTeX', mathml: 'MathML', unicodemath: 'UnicodeMath', plain: '普通文本' }
const currentOutput = computed(() => outputTab.value === 'word' ? result.value.unicodeMath : outputTab.value === 'latex' ? result.value.latex : outputTab.value === 'mathml' ? result.value.mathml : result.value.plain)
const issueCount = computed(() => result.value.diagnostics.filter(item => item.level !== 'info').length)
const hasRepair = computed(() => result.value.repaired !== raw.value.trim())

function runConversion(preferred?: string) {
  converting.value = true
  result.value = convertFormula(raw.value, format.value, preferred)
  window.setTimeout(() => converting.value = false, 120)
}

watch([raw, format], () => {
  clearTimeout(timer)
  timer = setTimeout(() => runConversion(), 260)
})

function chooseCandidate(text: string) { runConversion(text) }
function useSample(value: string) { raw.value = value }
function clearAll() { raw.value = ''; copied.value = false }

function loadHistory() {
  if (!import.meta.client) return
  try { history.value = JSON.parse(localStorage.getItem('flowlab-formula-history-v1') || '[]') } catch { history.value = [] }
}

function saveHistory() {
  if (!import.meta.client || !raw.value.trim() || !currentOutput.value) return
  const item: HistoryItem = { id: `${Date.now()}`, input: raw.value, output: currentOutput.value, format: outputTab.value, createdAt: new Date().toISOString() }
  history.value = [item, ...history.value.filter(old => old.input !== item.input || old.format !== item.format)].slice(0, 20)
  localStorage.setItem('flowlab-formula-history-v1', JSON.stringify(history.value))
}

async function copyOutput() {
  if (!currentOutput.value) return
  const plain = currentOutput.value
  const html = result.value.mathml ? `<div>${result.value.mathml}</div>` : `<span>${plain.replace(/[<>&]/g, char => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;' }[char]!))}</span>`
  try {
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' })
      })])
    } else await navigator.clipboard.writeText(plain)
    copied.value = true
    saveHistory()
    setTimeout(() => copied.value = false, 1800)
  } catch {
    await navigator.clipboard?.writeText(plain)
    copied.value = true
    setTimeout(() => copied.value = false, 1800)
  }
}

function capturePaste(event: ClipboardEvent) {
  const html = event.clipboardData?.getData('text/html') || ''
  const text = event.clipboardData?.getData('text/plain') || ''
  if (/<(?:math|mrow|mfrac|annotation)(?:\s|>)/i.test(html)) {
    event.preventDefault()
    const math = html.match(/<math[\s\S]*?<\/math>/i)?.[0]
    raw.value = math || text
  }
}

function restoreHistory(item: HistoryItem) { raw.value = item.input; outputTab.value = item.format; historyOpen.value = false }
function clearHistory() { history.value = []; localStorage.removeItem('flowlab-formula-history-v1') }

onMounted(loadHistory)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="formula-converter-page page">
    <section class="converter-hero">
      <div class="container converter-hero-inner">
        <div>
          <div class="breadcrumb compact"><NuxtLink to="/formulas">公式速查</NuxtLink><ArrowRight :size="13"/><span>公式修复与转换</span></div>
          <span class="kicker">FORMULA REPAIR & CONVERSION</span>
          <h1>把乱码公式，恢复成可用公式</h1>
          <p>粘贴从 PDF、网页、邮件或旧文档复制的公式，自动修复常见编码乱码，并转换为 Word/WPS、LaTeX、MathML 和 Unicode 标准格式。</p>
        </div>
        <div class="converter-trust"><ShieldCheck :size="21"/><div><strong>全部在浏览器本地处理</strong><span>公式不会上传到服务器，也不需要数据库</span></div></div>
      </div>
    </section>

    <div class="container converter-shell">
      <section class="converter-workspace">
        <header class="converter-panel-head">
          <div><span>01</span><div><h2>粘贴原始公式</h2><p>支持乱码文本、LaTeX、MathML 和 Word 线性公式</p></div></div>
          <div class="converter-head-actions"><button @click="historyOpen = !historyOpen"><History :size="16"/>历史</button><button @click="clearAll"><Trash2 :size="16"/>清空</button></div>
        </header>

        <div v-if="historyOpen" class="converter-history">
          <div class="history-head"><strong>本地转换历史</strong><button v-if="history.length" @click="clearHistory">清空记录</button></div>
          <button v-for="item in history" :key="item.id" @click="restoreHistory(item)"><span>{{ item.input }}</span><small>{{ item.format.toUpperCase() }} · {{ new Date(item.createdAt).toLocaleString('zh-CN') }}</small></button>
          <div v-if="!history.length" class="history-empty">还没有转换记录；成功复制后会保存到这里。</div>
        </div>

        <div class="formula-input-wrap">
          <textarea v-model="raw" aria-label="粘贴需要修复或转换的公式" spellcheck="false" placeholder="例如：Re = ÏUL/Î¼" @paste="capturePaste"></textarea>
          <div class="input-footer"><span>{{ raw.length }} / 10000 字符</span><label>输入格式<select v-model="format"><option value="auto">自动识别</option><option value="latex">LaTeX</option><option value="mathml">MathML</option><option value="unicodemath">UnicodeMath</option><option value="plain">普通文本</option></select></label></div>
        </div>

        <div class="sample-row"><span>试试示例</span><button v-for="sample in formulaSamples" :key="sample.name" @click="useSample(sample.value)">{{ sample.name }}</button></div>

        <div v-if="result.candidates.length > 1 || hasRepair" class="repair-review">
          <div class="repair-review-head"><div><WandSparkles :size="18"/><span><strong>检测到可能的编码乱码</strong><small>请核对修复结果，系统不会覆盖原始内容</small></span></div><span class="confidence">{{ result.confidence }}% 可信度</span></div>
          <div class="repair-diff"><div><small>原始内容</small><code>{{ raw }}</code></div><ArrowRight :size="18"/><div><small>建议修复</small><code>{{ result.repaired }}</code></div></div>
          <div v-if="result.candidates.length > 1" class="candidate-list"><span>其他候选：</span><button v-for="candidate in result.candidates" :key="candidate.text" :class="{ active: candidate.text === result.repaired }" @click="chooseCandidate(candidate.text)">{{ candidate.label }}</button></div>
        </div>
      </section>

      <section class="converter-workspace output-workspace">
        <header class="converter-panel-head">
          <div><span>02</span><div><h2>检查并复制标准公式</h2><p>识别为 {{ formatLabels[result.detectedFormat] }} · {{ issueCount ? `${issueCount} 项需要检查` : '结构检查通过' }}</p></div></div>
          <span class="parse-status" :class="issueCount ? 'warning' : 'success'"><AlertTriangle v-if="issueCount" :size="15"/><CheckCircle2 v-else :size="15"/>{{ issueCount ? '需要核对' : '可复制' }}</span>
        </header>

        <div class="formula-preview-card" :class="{ loading: converting }">
          <div class="preview-label"><span>公式预览</span><small>KaTeX 标准排版</small></div>
          <div v-if="result.previewHtml" class="rendered-formula" v-html="result.previewHtml"></div>
          <div v-else class="formula-preview-empty"><Sparkles :size="24"/><span>输入公式后将在这里预览</span></div>
        </div>

        <div v-if="result.diagnostics.length" class="formula-diagnostics">
          <div v-for="item in result.diagnostics" :key="item.code + item.message" :class="item.level"><CheckCircle2 v-if="item.level==='info'" :size="16"/><AlertTriangle v-else-if="item.level==='warning'" :size="16"/><XCircle v-else :size="16"/><span><strong>{{ item.code }}</strong>{{ item.message }}</span></div>
        </div>

        <div class="output-tabs" role="tablist" aria-label="输出格式">
          <button :class="{ active: outputTab==='word' }" @click="outputTab='word'"><Clipboard :size="15"/>Word / WPS</button>
          <button :class="{ active: outputTab==='latex' }" @click="outputTab='latex'"><Code2 :size="15"/>LaTeX</button>
          <button :class="{ active: outputTab==='mathml' }" @click="outputTab='mathml'"><FileCode2 :size="15"/>MathML</button>
          <button :class="{ active: outputTab==='plain' }" @click="outputTab='plain'">Unicode 文本</button>
        </div>

        <div class="output-code"><pre><code>{{ currentOutput || '暂无可用输出' }}</code></pre><button :disabled="!currentOutput" @click="copyOutput"><Check v-if="copied" :size="16"/><Copy v-else :size="16"/>{{ copied ? '已复制' : outputTab==='word' ? '复制到 Word / WPS' : '复制结果' }}</button></div>

        <div v-if="outputTab==='word'" class="word-guide"><strong>粘贴进 Word 的方法</strong><ol><li>在 Word 或 WPS 中按 <kbd>Alt</kbd> + <kbd>=</kbd> 创建公式区域。</li><li>粘贴刚刚复制的 UnicodeMath 公式。</li><li>在公式工具中选择“转换为专业格式”。</li></ol></div>
        <div v-else-if="outputTab==='latex'" class="word-guide"><strong>适用范围</strong><p>可直接粘贴到 Word 的 LaTeX 模式、Markdown、Typora、论文系统或其他公式编辑器。</p></div>
        <div v-else-if="outputTab==='mathml'" class="word-guide"><strong>适用范围</strong><p>适用于网页、出版工具和支持 MathML Core 的文档系统。</p></div>
      </section>
    </div>

    <section class="converter-notes">
      <div class="container">
        <div><RotateCcw :size="19"/><span><strong>可恢复</strong><p>UTF-8 被按 Windows 编码错误解读、HTML 实体、全角符号和隐藏字符。</p></span></div>
        <div><AlertTriangle :size="19"/><span><strong>需要人工确认</strong><p>原文中已经出现 � 或字符被完全删除时，无法确定性恢复。</p></span></div>
        <div><ShieldCheck :size="19"/><span><strong>隐私安全</strong><p>转换历史只保存在本机浏览器，可以随时清空。</p></span></div>
      </div>
    </section>
  </div>
</template>
