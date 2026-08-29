<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileJson,
  FlaskConical,
  History,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Table2,
  TrendingUp,
  XCircle,
} from "lucide-vue-next";
import type { SimulationTask } from "~/types/platform";
import { SolverInputError, solveTool } from "~/utils/solvers";
import {
  assessSimulationResult,
  generateSweepValues,
  getMetricValue,
  simulationLabTools,
  type CredibilityAssessment,
  type SweepScale,
} from "~/utils/simulation-lab";

interface SweepCaseResult {
  index: number;
  value: number;
  metric?: number;
  status: "SUCCEEDED" | "FAILED";
  duration: number;
  warningCount: number;
  warnings: string[];
  error?: string;
  summary?: Array<{ label: string; value: string }>;
  credibility?: CredibilityAssessment;
}

interface SweepResult {
  x: number[];
  series: number[];
  exact: number[];
  cases: SweepCaseResult[];
  summary: Array<{ label: string; value: string }>;
  credibilityScore: number;
  parameterLabel: string;
  parameterUnit: string;
  metricLabel: string;
  metricUnit: string;
  sourceTool: string;
  scale: SweepScale;
}

const store = usePlatformStore();
const selectedTool = ref(simulationLabTools[0].slug);
const parameterKey = ref(simulationLabTools[0].parameters[0].key);
const metricKey = ref(simulationLabTools[0].metrics[0].key);
const scale = ref<SweepScale>("linear");
const start = ref(simulationLabTools[0].parameters[0].start);
const end = ref(simulationLabTools[0].parameters[0].end);
const count = ref(7);
const running = ref(false);
const progress = ref(0);
const activeCase = ref(0);
const runError = ref("");
const currentTaskId = ref("");
const liveCases = ref<SweepCaseResult[]>([]);
let cancelRequested = false;
let activeWorker: Worker | undefined;

const currentTool = computed(
  () =>
    simulationLabTools.find((item) => item.slug === selectedTool.value) ??
    simulationLabTools[0],
);
const currentParameter = computed(
  () =>
    currentTool.value.parameters.find((item) => item.key === parameterKey.value) ??
    currentTool.value.parameters[0],
);
const currentMetric = computed(
  () =>
    currentTool.value.metrics.find((item) => item.key === metricKey.value) ??
    currentTool.value.metrics[0],
);
const labTasks = computed(() =>
  store.tasks
    .filter((item) => item.tool === "parameter-sweep")
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
);
const currentTask = computed(() =>
  store.tasks.find((item) => item.id === currentTaskId.value),
);
const currentResult = computed(
  () => (currentTask.value?.result ?? null) as SweepResult | null,
);

watch(selectedTool, () => {
  parameterKey.value = currentTool.value.parameters[0].key;
  metricKey.value = currentTool.value.metrics[0].key;
  count.value = Math.min(count.value, currentTool.value.maxCases);
  resetRange();
});

watch(parameterKey, resetRange);

onMounted(async () => {
  await store.init();
  if (!currentTaskId.value && labTasks.value.length)
    currentTaskId.value = labTasks.value[0].id;
});

function resetRange() {
  start.value = currentParameter.value.start;
  end.value = currentParameter.value.end;
  runError.value = "";
}

function resetForm() {
  selectedTool.value = simulationLabTools[0].slug;
  parameterKey.value = simulationLabTools[0].parameters[0].key;
  metricKey.value = simulationLabTools[0].metrics[0].key;
  scale.value = "linear";
  count.value = 7;
  resetRange();
}

function solveInWorker(
  slug: string,
  input: Record<string, string | number>,
) {
  if (slug !== "lid-driven-cavity")
    return Promise.resolve(solveTool(slug, input));
  return new Promise<ReturnType<typeof solveTool>>((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/solver.worker.ts", import.meta.url),
      { type: "module" },
    );
    activeWorker = worker;
    const finish = () => {
      worker.terminate();
      if (activeWorker === worker) activeWorker = undefined;
    };
    worker.onmessage = (
      event: MessageEvent<{
        ok: boolean;
        result?: ReturnType<typeof solveTool>;
        message?: string;
      }>,
    ) => {
      finish();
      if (event.data.ok && event.data.result) resolve(event.data.result);
      else reject(new SolverInputError(event.data.message || "求解器运行失败"));
    };
    worker.onerror = () => {
      finish();
      reject(new SolverInputError("工况计算线程启动失败。"));
    };
    worker.postMessage({ slug, params: input });
  });
}

async function runSweep() {
  runError.value = "";
  const parameter = currentParameter.value;
  if (start.value < parameter.min || start.value > parameter.max)
    return (runError.value = `扫描起点应位于 ${parameter.min}–${parameter.max}。`);
  if (end.value < parameter.min || end.value > parameter.max)
    return (runError.value = `扫描终点应位于 ${parameter.min}–${parameter.max}。`);
  if (count.value > currentTool.value.maxCases)
    return (runError.value = `${currentTool.value.name} 最多允许 ${currentTool.value.maxCases} 个工况。`);

  let values: number[];
  try {
    values = generateSweepValues(
      Number(start.value),
      Number(end.value),
      Number(count.value),
      scale.value,
      parameter.integer,
    );
  } catch (error) {
    runError.value = error instanceof Error ? error.message : "扫描范围无效。";
    return;
  }

  running.value = true;
  progress.value = 0;
  activeCase.value = 0;
  liveCases.value = [];
  cancelRequested = false;
  const started = performance.now();
  const task = store.addTask({
    tool: "parameter-sweep",
    toolName: `工况扫描 · ${currentTool.value.name}`,
    params: {
      source_tool: currentTool.value.slug,
      parameter: parameter.key,
      metric: currentMetric.value.key,
      start: start.value,
      end: end.value,
      cases: values.length,
      scale: scale.value,
    },
  });
  currentTaskId.value = task.id;

  for (let index = 0; index < values.length; index++) {
    if (cancelRequested) break;
    activeCase.value = index + 1;
    const caseStarted = performance.now();
    const value = values[index];
    const input = {
      ...currentTool.value.defaults,
      [parameter.key]: value,
    };
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const result = await solveInWorker(currentTool.value.slug, input);
      if (cancelRequested) break;
      const record = result as unknown as Record<string, unknown>;
      const warnings = (record.warnings as string[] | undefined) ?? [];
      const credibility = assessSimulationResult(
        currentTool.value.slug,
        input,
        record,
        warnings,
      );
      liveCases.value.push({
        index: index + 1,
        value,
        metric: getMetricValue(
          currentTool.value.slug,
          currentMetric.value.key,
          record,
        ),
        status: record.converged === false ? "FAILED" : "SUCCEEDED",
        duration: Math.max(1, Math.round(performance.now() - caseStarted)),
        warningCount: warnings.length,
        warnings,
        summary: (record.summary as Array<{ label: string; value: string }>) ?? [],
        credibility,
      });
    } catch (error) {
      liveCases.value.push({
        index: index + 1,
        value,
        status: "FAILED",
        duration: Math.max(1, Math.round(performance.now() - caseStarted)),
        warningCount: 0,
        warnings: [],
        error: error instanceof Error ? error.message : "工况求解失败",
      });
    }
    progress.value = Math.round(((index + 1) / values.length) * 100);
  }

  if (cancelRequested) {
    store.cancelTask(task.id);
    running.value = false;
    return;
  }

  const successful = liveCases.value.filter(
    (item) => item.status === "SUCCEEDED" && Number.isFinite(item.metric),
  );
  const warningCount = liveCases.value.reduce(
    (sum, item) => sum + item.warningCount,
    0,
  );
  const score = successful.length
    ? Math.round(
        successful.reduce(
          (sum, item) => sum + (item.credibility?.score ?? 0),
          0,
        ) / successful.length,
      )
    : 0;
  const result: SweepResult = {
    x: successful.map((item) => item.value),
    series: successful.map((item) => item.metric!),
    exact: [],
    cases: liveCases.value,
    credibilityScore: score,
    parameterLabel: parameter.label,
    parameterUnit: parameter.unit,
    metricLabel: currentMetric.value.label,
    metricUnit: currentMetric.value.unit,
    sourceTool: currentTool.value.slug,
    scale: scale.value,
    summary: [
      { label: "基础工具", value: currentTool.value.name },
      { label: "扫描参数", value: parameter.label },
      { label: "成功工况", value: `${successful.length} / ${values.length}` },
      { label: "平均可信度", value: `${score} / 100` },
      { label: "适用性警告", value: String(warningCount) },
    ],
  };
  const sweepWarnings = [
    ...(warningCount
      ? [`${warningCount} 条适用性警告，请逐个查看工况可信度。`]
      : []),
    ...(successful.length !== values.length
      ? [`${values.length - successful.length} 个工况失败或未收敛。`]
      : []),
  ];
  store.finishTask(
    task.id,
    result as unknown as Record<string, unknown>,
    sweepWarnings,
    performance.now() - started,
    successful.length ? "SUCCEEDED" : "FAILED",
  );
  running.value = false;
}

function cancelSweep() {
  cancelRequested = true;
  activeWorker?.terminate();
  activeWorker = undefined;
}

function formatNumber(value: number | undefined) {
  if (!Number.isFinite(value)) return "—";
  const number = Number(value);
  if (number === 0) return "0";
  if (Math.abs(number) >= 1e5 || Math.abs(number) < 1e-3)
    return number.toExponential(4);
  return number.toLocaleString("zh-CN", { maximumSignificantDigits: 7 });
}

function download(kind: "json" | "csv") {
  if (!currentTask.value || !currentResult.value) return;
  let body: string;
  let type: string;
  if (kind === "json") {
    body = JSON.stringify(
      {
        format: "flowlab-sweep/1.0",
        task: currentTask.value.id,
        createdAt: currentTask.value.createdAt,
        input: currentTask.value.params,
        result: currentResult.value,
      },
      null,
      2,
    );
    type = "application/json";
  } else {
    body = [
      [
        "case",
        currentResult.value.parameterLabel,
        currentResult.value.metricLabel,
        "status",
        "credibility",
        "warnings",
        "duration_ms",
      ].join(","),
      ...currentResult.value.cases.map((item) =>
        [
          item.index,
          item.value,
          item.metric ?? "",
          item.status,
          item.credibility?.score ?? "",
          item.warningCount,
          item.duration,
        ].join(","),
      ),
    ].join("\n");
    type = "text/csv;charset=utf-8";
  }
  const url = URL.createObjectURL(new Blob(["\uFEFF" + body], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${currentTask.value.id}.${kind}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function openHistory(task: SimulationTask) {
  currentTaskId.value = task.id;
  liveCases.value = [];
  runError.value = "";
}
</script>

<template>
  <div class="page simulation-lab-page">
    <section class="page-hero slim lab-hero">
      <div class="container">
        <div class="breadcrumb compact-breadcrumb">
          <NuxtLink to="/simulation">CFD 仿真</NuxtLink>
          <ChevronRight :size="14" /><span>工况实验室</span>
        </div>
        <div class="lab-hero-grid">
          <div>
            <span class="kicker">PARAMETRIC EXPERIMENT</span>
            <h1>参数扫描与工况对比</h1>
            <p>
              一次定义参数范围，自动运行多个可复现工况，并比较指标、收敛状态和模型适用性。
            </p>
          </div>
          <div class="lab-feature-list" aria-label="实验室能力">
            <span><TrendingUp :size="18" />线性 / 对数扫描</span>
            <span><ShieldCheck :size="18" />可信度清单</span>
            <span><Download :size="18" />CSV / JSON 清单</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container lab-layout">
      <aside class="lab-config-card">
        <header>
          <span><FlaskConical :size="19" /></span>
          <div><strong>实验设置</strong><small>单参数、多工况</small></div>
        </header>
        <form @submit.prevent="runSweep">
          <label>
            基础求解器
            <select v-model="selectedTool" :disabled="running">
              <option
                v-for="item in simulationLabTools"
                :key="item.slug"
                :value="item.slug"
              >
                {{ item.name }}
              </option>
            </select>
            <small>{{ currentTool.description }}</small>
          </label>
          <div class="field-row two">
            <label>
              扫描参数
              <select v-model="parameterKey" :disabled="running">
                <option
                  v-for="item in currentTool.parameters"
                  :key="item.key"
                  :value="item.key"
                >
                  {{ item.label }}
                </option>
              </select>
            </label>
            <label>
              比较指标
              <select v-model="metricKey" :disabled="running">
                <option
                  v-for="item in currentTool.metrics"
                  :key="item.key"
                  :value="item.key"
                >
                  {{ item.label }}
                </option>
              </select>
            </label>
          </div>
          <div class="field-row two">
            <label>
              起点
              <div class="unit-input">
                <input
                  v-model.number="start"
                  type="number"
                  step="any"
                  :min="currentParameter.min"
                  :max="currentParameter.max"
                  :disabled="running"
                  required
                /><span>{{ currentParameter.unit }}</span>
              </div>
            </label>
            <label>
              终点
              <div class="unit-input">
                <input
                  v-model.number="end"
                  type="number"
                  step="any"
                  :min="currentParameter.min"
                  :max="currentParameter.max"
                  :disabled="running"
                  required
                /><span>{{ currentParameter.unit }}</span>
              </div>
            </label>
          </div>
          <div class="field-row two">
            <label>
              分布
              <select v-model="scale" :disabled="running">
                <option value="linear">线性等距</option>
                <option value="log">对数等比</option>
              </select>
            </label>
            <label>
              工况数
              <div class="unit-input">
                <input
                  v-model.number="count"
                  type="number"
                  min="2"
                  :max="currentTool.maxCases"
                  step="1"
                  :disabled="running"
                  required
                /><span>组</span>
              </div>
            </label>
          </div>
          <div class="lab-defaults">
            <strong>固定参数快照</strong>
            <div>
              <span
                v-for="(value, key) in currentTool.defaults"
                :key="key"
                :class="{ varied: key === parameterKey }"
              >
                {{ key }} = {{ value }}
              </span>
            </div>
          </div>
          <div v-if="runError" class="inline-alert danger" role="alert">
            <AlertTriangle :size="17" /><span>{{ runError }}</span>
          </div>
          <div class="lab-actions">
            <button
              v-if="!running"
              type="submit"
              class="button large full"
            >
              <Play :size="18" />运行参数扫描
            </button>
            <button
              v-else
              type="button"
              class="button secondary large full"
              @click="cancelSweep"
            >
              <Square :size="17" />停止实验
            </button>
            <button
              type="button"
              class="text-button"
              :disabled="running"
              @click="resetForm"
            >
              <RotateCcw :size="15" />恢复推荐设置
            </button>
          </div>
        </form>
      </aside>

      <main class="lab-main">
        <section v-if="running" class="lab-running-panel">
          <Activity class="spin" :size="34" />
          <span class="kicker">EXPERIMENT RUNNING</span>
          <h2>正在运行第 {{ activeCase }} / {{ count }} 个工况</h2>
          <p>
            {{ currentParameter.label }} 从 {{ start }} 到 {{ end }}
            {{ currentParameter.unit }}；已完成 {{ liveCases.length }} 个结果。
          </p>
          <div class="progress large"><i :style="{ width: `${progress}%` }"></i></div>
          <strong>{{ progress }}%</strong>
          <div v-if="liveCases.length" class="live-case-strip">
            <span
              v-for="item in liveCases"
              :key="item.index"
              :class="item.status === 'SUCCEEDED' ? 'success' : 'danger'"
            >
              #{{ item.index }} · {{ formatNumber(item.value) }}
            </span>
          </div>
        </section>

        <template v-else-if="currentResult && currentTask">
          <section class="lab-result-card">
            <header class="lab-result-header">
              <div>
                <span class="status-badge success"><CheckCircle2 :size="15" />实验完成</span>
                <h2>{{ currentTask.toolName }}</h2>
                <p>{{ currentTask.id }} · {{ new Date(currentTask.createdAt).toLocaleString("zh-CN") }}</p>
              </div>
              <div>
                <button class="button secondary small" @click="download('json')">
                  <FileJson :size="15" />JSON
                </button>
                <button class="button secondary small" @click="download('csv')">
                  <Download :size="15" />CSV
                </button>
              </div>
            </header>
            <div class="lab-metrics">
              <div v-for="item in currentResult.summary" :key="item.label">
                <small>{{ item.label }}</small><strong>{{ item.value }}</strong>
              </div>
            </div>
            <div class="lab-chart-head">
              <div>
                <h3>{{ currentResult.metricLabel }}</h3>
                <p>
                  横轴：{{ currentResult.parameterLabel }}（{{ currentResult.parameterUnit }}） ·
                  纵轴：{{ currentResult.metricLabel }}（{{ currentResult.metricUnit }}）
                </p>
              </div>
              <span class="credibility-score" :class="`grade-${currentResult.credibilityScore >= 90 ? 'a' : currentResult.credibilityScore >= 75 ? 'b' : 'c'}`">
                <ShieldCheck :size="18" />平均可信度 {{ currentResult.credibilityScore }}
              </span>
            </div>
            <DataChart
              :x="currentResult.x"
              :y="currentResult.series"
              :label="currentResult.metricLabel"
            />
          </section>

          <section class="lab-case-card">
            <div class="panel-header">
              <div><h2>工况对比</h2><p>每个工况都保留参数、警告和可信度状态。</p></div>
              <Table2 :size="20" />
            </div>
            <div class="lab-case-table">
              <div class="lab-case-head">
                <span>工况</span><span>{{ currentResult.parameterLabel }}</span><span>{{ currentResult.metricLabel }}</span><span>可信度</span><span>耗时</span><span>状态</span>
              </div>
              <div v-for="item in currentResult.cases" :key="item.index" class="lab-case-row">
                <span>#{{ item.index }}</span>
                <strong>{{ formatNumber(item.value) }}</strong>
                <strong>{{ formatNumber(item.metric) }}</strong>
                <span>{{ item.credibility?.score ?? 0 }} / 100</span>
                <span>{{ item.duration }} ms</span>
                <span class="case-status" :class="item.status === 'SUCCEEDED' ? 'success' : 'danger'">
                  <CheckCircle2 v-if="item.status === 'SUCCEEDED'" :size="14" />
                  <XCircle v-else :size="14" />
                  {{ item.status === "SUCCEEDED" ? (item.warningCount ? `${item.warningCount} 警告` : "通过") : "失败" }}
                </span>
                <details v-if="item.credibility" class="case-checks">
                  <summary>查看校核清单</summary>
                  <div>
                    <span v-for="check in item.credibility.checks" :key="check.key" :class="check.status">
                      <CheckCircle2 v-if="check.status === 'pass'" :size="14" />
                      <AlertTriangle v-else :size="14" />
                      <b>{{ check.label }}</b><small>{{ check.detail }}</small>
                    </span>
                  </div>
                </details>
                <p v-else-if="item.error" class="case-error">{{ item.error }}</p>
              </div>
            </div>
          </section>
        </template>

        <section v-else class="lab-empty-panel">
          <FlaskConical :size="42" />
          <h2>建立第一个参数实验</h2>
          <p>
            选择基础求解器、扫描参数和比较指标。实验结果会保存在本地任务中，刷新后仍可查看。
          </p>
          <div>
            <span><CheckCircle2 :size="16" />自动生成工况</span>
            <span><CheckCircle2 :size="16" />逐工况适用性检查</span>
            <span><CheckCircle2 :size="16" />统一曲线与表格</span>
          </div>
        </section>

        <section class="lab-history-card">
          <div class="panel-header">
            <div><h2>实验历史</h2><p>最近的参数扫描保存在浏览器和工作区数据库。</p></div>
            <History :size="20" />
          </div>
          <div v-if="labTasks.length" class="lab-history-list">
            <button
              v-for="item in labTasks.slice(0, 8)"
              :key="item.id"
              :class="{ active: item.id === currentTaskId }"
              @click="openHistory(item)"
            >
              <span :class="item.status === 'SUCCEEDED' ? 'success' : item.status === 'CANCELLED' ? 'muted' : 'danger'"></span>
              <div><strong>{{ item.toolName }}</strong><small>{{ item.params.parameter }} · {{ item.params.cases }} 工况</small></div>
              <time><Clock3 :size="13" />{{ new Date(item.createdAt).toLocaleDateString("zh-CN") }}</time>
            </button>
          </div>
          <div v-else class="small-empty">尚无参数实验记录。</div>
        </section>
      </main>
    </div>
  </div>
</template>
