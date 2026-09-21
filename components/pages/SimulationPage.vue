<script setup lang="ts">
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Play,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Copy,
  XCircle,
  FileJson,
  Table2,
  Activity,
  Gauge,
  ChevronRight,
  FlaskConical,
  ShieldCheck,
} from "lucide-vue-next";
import { tools } from "~/utils/content";
import { SolverInputError, solveTool } from "~/utils/solvers";
import { assessSimulationResult } from "~/utils/simulation-lab";
const route = useRoute(),
  store = usePlatformStore();
const taskRoute = computed(() => route.path.startsWith("/simulation/tasks/"));
const listRoute = computed(() => route.path === "/simulation");
const slug = computed(() => route.path.split("/")[2] || "convection-diffusion");
const tool = computed(() => tools.find((t) => t.slug === slug.value));
const invalidToolRoute = computed(
  () => !listRoute.value && !taskRoute.value && !tool.value,
);
if (import.meta.server && invalidToolRoute.value) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, 404, "Simulation tool not found");
}
const taskId = computed(() =>
  String(route.params.id || route.path.split("/").at(-1) || ""),
);
const task = computed(() => store.tasks.find((t) => t.id === taskId.value));
const credibility = computed(() => {
  if (!task.value?.result || task.value.tool === "parameter-sweep") return null;
  return assessSimulationResult(
    task.value.tool,
    task.value.params,
    task.value.result,
    task.value.warnings || [],
  );
});
const running = ref(false),
  progress = ref(0),
  phase = ref("准备输入"),
  activeTab = ref("model"),
  runError = ref("");
const liveTaskId = ref("");
const parameterTab = ref<"physical" | "numerical" | "output">("physical");
const listQuery = ref(""),
  dimensionFilter = ref("全部"),
  solverFilter = ref("全部"),
  levelFilter = ref("全部"),
  listView = ref<"card" | "compact">("card");
const defaults: Record<string, Record<string, string | number>> = {
  "convection-diffusion": {
    length: 1,
    nx: 101,
    rho: 1,
    velocity: 1,
    diffusivity: 0.1,
    phi_left: 1,
    phi_right: 0,
    scheme: "upwind",
  },
  "lid-driven-cavity": {
    reynolds: 100,
    nx: 65,
    ny: 65,
    lid_velocity: 1,
    max_iterations: 5000,
    tolerance: 0.00001,
    pressure_relaxation: 0.3,
    velocity_relaxation: 0.7,
  },
  "pipe-flow": {
    diameter: 0.05,
    pipe_length: 2,
    rho: 998,
    viscosity: 0.001,
    drive_mode: "mean_velocity",
    drive_value: 0.02,
    samples: 81,
  },
  "turbulence-compare": {
    flow_type: "internal",
    velocity: 35,
    char_length: 0.2,
    rho: 1.225,
    viscosity: 0.0000181,
    intensity: 5,
    length_scale: 0.014,
    target_yplus: 1,
    growth_rate: 1.2,
    layers: 20,
  },
};
const params = reactive<Record<string, string | number>>({});
watch(slug, reset, { immediate: true });
function reset() {
  Object.keys(params).forEach((k) => delete params[k]);
  Object.assign(
    params,
    defaults[slug.value] || defaults["convection-diffusion"],
  );
  activeTab.value = taskRoute.value ? "overview" : "model";
  parameterTab.value = "physical";
  runError.value = "";
  liveTaskId.value = "";
}
const liveTask = computed(() => store.tasks.find((item) => item.id === liveTaskId.value));
const liveResult = computed(() => (liveTask.value?.result || null) as Record<string, any> | null);
const liveCredibility = computed(() => {
  if (!liveTask.value?.result) return null;
  return assessSimulationResult(liveTask.value.tool, liveTask.value.params, liveTask.value.result, liveTask.value.warnings || []);
});
const toolSpecs: Record<string, {
  method: string;
  equation: string;
  domain: string;
  boundary: string[];
  outputs: string[];
  chartTitle: string;
  chartNote: string;
  xLabel: string;
  yLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
}> = {
  "convection-diffusion": {
    method: "有限体积 · 三对角直接求解",
    equation: "d(ρuφ)/dx = d(Γ dφ/dx)/dx",
    domain: "一维定常输运域，均匀结构化网格",
    boundary: ["左端 Dirichlet：φ = φL", "右端 Dirichlet：φ = φR", "常物性、无源项"],
    outputs: ["数值解与解析解", "L₂ / L∞ 误差", "单元 Péclet 数与有界性"],
    chartTitle: "标量沿程分布", chartNote: "数值离散结果与解析解逐点对照", xLabel: "轴向位置 x (m)", yLabel: "标量 φ", primaryLabel: "数值解", secondaryLabel: "解析解",
  },
  "lid-driven-cavity": {
    method: "涡量—流函数 · 显式伪时间推进",
    equation: "∇²ψ = −ω · ∂ω/∂t + u·∇ω = ν∇²ω",
    domain: "单位二维方腔，结构化正交网格",
    boundary: ["顶盖：u = U，v = 0", "其余壁面：u = v = 0", "不可压、定常目标解"],
    outputs: ["速度矢量与模值场", "主涡中心", "归一化残差历史"],
    chartTitle: "迭代残差历史", chartNote: "残差按顶盖速度归一化，纵轴采用对数尺度", xLabel: "迭代步", yLabel: "log₁₀(归一化残差)", primaryLabel: "归一化残差", secondaryLabel: "",
  },
  "pipe-flow": {
    method: "Hagen–Poiseuille 解析模型",
    equation: "u(r) = 2Ū[1 − (r/R)²]",
    domain: "圆管轴对称充分发展层流",
    boundary: ["壁面无滑移：u(R) = 0", "中心线对称：du/dr = 0", "定常、不可压、牛顿流体"],
    outputs: ["径向速度剖面", "压降、流量与壁面剪切", "入口段长度与层流适用性"],
    chartTitle: "径向速度剖面", chartNote: "从中心线到管壁的解析抛物线分布", xLabel: "半径 r (m)", yLabel: "轴向速度 u (m/s)", primaryLabel: "解析速度", secondaryLabel: "",
  },
  "turbulence-compare": {
    method: "光滑壁关联式 · 近壁网格估算",
    equation: "k = 3/2(UI)² · y⁺ = ρuτΔy/μ",
    domain: "内流或外流的首层网格工程估算",
    boundary: ["给定自由来流与湍流强度", "光滑壁面经验摩阻", "几何增长的边界层网格"],
    outputs: ["k、ε、ω 入口量", "摩擦速度与首层高度", "累计边界层厚度"],
    chartTitle: "边界层累计厚度", chartNote: "按层数和增长率累加的法向网格高度", xLabel: "边界层层号", yLabel: "累计高度 (μm)", primaryLabel: "累计高度", secondaryLabel: "",
  },
};
function specFor(toolSlug: string) {
  return toolSpecs[toolSlug] || toolSpecs["convection-diffusion"];
}
const toolSpec = computed(() => specFor(slug.value));
const fieldHints: Record<string, string> = {
  length: "控制计算域的物理尺度", nx: "节点数越高，离散误差通常越小", ny: "节点数越高，二维场分辨率越高", rho: "按当前工况温度与压力填写",
  velocity: "用于 Reynolds 数与入口湍流量", diffusivity: "输运方程中的 Γ 系数", phi_left: "左端固定标量值", phi_right: "右端固定标量值",
  reynolds: "控制惯性与黏性的相对强弱", lid_velocity: "顶壁沿 x 方向匀速运动", max_iterations: "达到容差前允许的迭代上限", tolerance: "归一化残差停止阈值",
  pressure_relaxation: "流函数 Poisson 迭代松弛", velocity_relaxation: "涡量输运推进松弛", diameter: "圆管内径", pipe_length: "用于压降和入口段检查",
  viscosity: "动力黏度 μ", drive_value: "由上方驱动方式决定物理含义", samples: "结果剖面的径向采样数量", intensity: "入口湍流强度百分比",
  char_length: "Reynolds 数的特征尺度", length_scale: "湍流耗散尺度", target_yplus: "由壁面处理方案确定", growth_rate: "相邻棱柱层厚度比", layers: "边界层网格层数",
};
function fieldUnit(field: any[]) {
  if (field[0] === "drive_value") return params.drive_mode === "pressure_drop" ? "Pa" : "m/s";
  return field[2];
}
const fieldDefs = computed(
  () =>
    (({
      "convection-diffusion": [
        ["length", "区域长度", "m", 0.01, 100],
        ["nx", "网格数", "—", 21, 1001],
        ["rho", "密度", "kg/m³", 0.001, 10000],
        ["velocity", "速度", "m/s", -1000, 1000],
        ["diffusivity", "扩散系数", "m²/s", 1e-8, 1000],
        ["phi_left", "左边界 φ", "—", -1e6, 1e6],
        ["phi_right", "右边界 φ", "—", -1e6, 1e6],
      ],
      "lid-driven-cavity": [
        ["reynolds", "Reynolds 数", "—", 10, 1000],
        ["nx", "x 网格数", "—", 33, 129],
        ["ny", "y 网格数", "—", 33, 129],
        ["lid_velocity", "顶盖速度", "m/s", 0.01, 100],
        ["max_iterations", "最大迭代", "—", 100, 20000],
        ["tolerance", "收敛容差", "—", 1e-8, 1e-4],
        ["pressure_relaxation", "压力松弛", "—", 0.1, 0.8],
        ["velocity_relaxation", "速度松弛", "—", 0.1, 1],
      ],
      "pipe-flow": [
        ["diameter", "管径", "m", 0.001, 10],
        ["pipe_length", "管长", "m", 0.01, 1000],
        ["rho", "密度", "kg/m³", 0.1, 10000],
        ["viscosity", "动力黏度", "Pa·s", 1e-7, 100],
        ["drive_value", "驱动值", "Pa / m·s⁻¹", 0.0001, 1e7],
        ["samples", "径向采样点", "—", 21, 501],
      ],
      "turbulence-compare": [
        ["velocity", "特征速度", "m/s", 0.001, 3000],
        ["char_length", "特征长度", "m", 0.0001, 100],
        ["rho", "密度", "kg/m³", 0.001, 10000],
        ["viscosity", "动力黏度", "Pa·s", 1e-8, 10],
        ["intensity", "湍流强度", "%", 0.01, 50],
        ["length_scale", "长度尺度", "m", 1e-6, 100],
        ["target_yplus", "目标 y⁺", "—", 0.1, 300],
        ["growth_rate", "增长率", "—", 1.01, 2],
        ["layers", "边界层层数", "—", 3, 100],
      ],
    })[slug.value] || []) as any[],
);
const numericalKeys = new Set([
  "nx",
  "ny",
  "max_iterations",
  "tolerance",
  "pressure_relaxation",
  "velocity_relaxation",
  "growth_rate",
  "layers",
]);
const outputKeys = new Set(["samples"]);
const visibleFieldDefs = computed(() =>
  fieldDefs.value.filter((field) =>
    parameterTab.value === "numerical"
      ? numericalKeys.has(field[0])
      : parameterTab.value === "output"
        ? outputKeys.has(field[0])
        : !numericalKeys.has(field[0]) && !outputKeys.has(field[0]),
  ),
);
const filteredTools = computed(() =>
  tools.filter((item) => {
    const q = listQuery.value.trim().toLowerCase(),
      dimension = item.type.includes("2D")
        ? "二维"
        : item.type.includes("1D")
          ? "一维"
          : "其他";
    const solver =
      item.slug === "pipe-flow"
        ? "解析计算"
        : item.slug === "turbulence-compare"
          ? "工程估算"
          : "数值求解";
    return (
      (!q ||
        `${item.name}${item.description}${item.type}`
          .toLowerCase()
          .includes(q)) &&
      (dimensionFilter.value === "全部" ||
        dimensionFilter.value === dimension) &&
      (solverFilter.value === "全部" || solverFilter.value === solver) &&
      (levelFilter.value === "全部" || levelFilter.value === item.level)
    );
  }),
);
function solveInWorker(
  toolSlug: string,
  input: Record<string, string | number>,
) {
  if (toolSlug !== "lid-driven-cavity")
    return Promise.resolve(solveTool(toolSlug, input));
  return new Promise<ReturnType<typeof solveTool>>((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/solver.worker.ts", import.meta.url),
      { type: "module" },
    );
    const finish = () => worker.terminate();
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
      reject(new SolverInputError("方腔求解线程启动失败，请重试。"));
    };
    worker.postMessage({ slug: toolSlug, params: input });
  });
}
async function run() {
  running.value = true;
  progress.value = 7;
  phase.value = "校验参数";
  runError.value = "";
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const started = performance.now();
  try {
    phase.value = "运行数值求解器";
    progress.value = 15;
    const progressTimer = window.setInterval(() => {
      progress.value = Math.min(68, progress.value + 3);
    }, 120);
    let result: ReturnType<typeof solveTool>;
    try {
      result = await solveInWorker(slug.value, { ...params });
    } finally {
      window.clearInterval(progressTimer);
    }
    if (!tool.value) throw new SolverInputError("没有找到这个仿真工具。");
    const t = store.addTask({
      tool: slug.value,
      toolName: tool.value.name,
      params: { ...params },
    });
    const steps = [
      ["组装离散方程", 32],
      ["检查收敛与守恒", 76],
      ["生成结果清单", 100],
    ] as const;
    for (const [name, p] of steps) {
      phase.value = name;
      await new Promise((resolve) => setTimeout(resolve, 100));
      progress.value = p;
    }
    const converged = (result as any).converged !== false;
    store.finishTask(
      t.id,
      result as unknown as Record<string, unknown>,
      (result as any).warnings || [],
      Math.max(1, Math.round(performance.now() - started)),
      converged ? "SUCCEEDED" : "FAILED",
    );
    liveTaskId.value = t.id;
    activeTab.value = "results";
  } catch (error) {
    runError.value =
      error instanceof SolverInputError
        ? error.message
        : "计算未完成，请检查输入后重试。";
  } finally {
    running.value = false;
  }
}
function resultData() {
  return (task.value?.result || {}) as any;
}
function download(kind: "json" | "csv", selectedTask: any = task.value || liveTask.value) {
  if (!selectedTask) return;
  const result = (selectedTask.result || {}) as any;
  let body = "",
    type = "",
    name = "";
  if (kind === "json") {
    body = JSON.stringify(
      {
        manifest: {
          format: "flowlab-result/1.0",
          task: selectedTask.id,
          tool: selectedTask.tool,
          createdAt: selectedTask.createdAt,
        },
        input: selectedTask.params,
        summary: result.summary,
      },
      null,
      2,
    );
    type = "application/json";
    name = `${selectedTask.id}.json`;
  } else {
    const x = result.x || [];
    const y = result.series || [];
    const y2 = result.exact || [];
    body =
      "x,value,reference\n" +
      x
        .map((v: number, i: number) => `${v},${y[i] ?? ""},${y2[i] ?? ""}`)
        .join("\n");
    type = "text/csv;charset=utf-8";
    name = `${selectedTask.id}.csv`;
  }
  const url = URL.createObjectURL(new Blob(["\uFEFF" + body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div v-if="listRoute" class="page">
    <section class="page-hero">
      <div class="container">
        <span class="kicker">CFD SIMULATION TOOLS</span>
        <h1>在线仿真工具</h1>
        <p>
          边界明确、结果可验证的教学型求解器。在浏览器内运行，任务和结果自动保存在本机。
        </p>
        <div class="inline-alert success">
          <CheckCircle2 :size="18" /><span
            ><strong>4 个工具可用</strong> ·
            当前为本地计算模式，无需数据库</span
          >
        </div>
        <div class="page-search">
          <Search :size="19" /><input
            v-model="listQuery"
            placeholder="搜索物理问题或工具…"
          />
        </div>
        <NuxtLink to="/simulation/lab" class="simulation-lab-banner">
          <span><FlaskConical :size="22" /></span>
          <div>
            <strong>新增：参数扫描与工况对比</strong>
            <small>批量运行 2–20 个工况，自动生成趋势曲线与可信度清单。</small>
          </div>
          <b>进入工况实验室 <ArrowRight :size="16" /></b>
        </NuxtLink>
      </div>
    </section>
    <div class="container tools-layout">
      <aside class="filter-aside">
        <div class="aside-title">
          <strong>筛选</strong><SlidersHorizontal :size="17" />
        </div>
        <small>维度</small
        ><button
          v-for="item in ['全部', '一维', '二维']"
          :key="item"
          :class="{ active: dimensionFilter === item }"
          @click="dimensionFilter = item"
        >
          {{ item }}</button
        ><small>求解类型</small
        ><button
          v-for="item in ['全部', '解析计算', '数值求解', '工程估算']"
          :key="item"
          :class="{ active: solverFilter === item }"
          @click="solverFilter = item"
        >
          {{ item }}</button
        ><small>难度</small
        ><button
          v-for="item in ['全部', '入门', '进阶', '工程']"
          :key="item"
          :class="{ active: levelFilter === item }"
          @click="levelFilter = item"
        >
          {{ item }}
        </button>
      </aside>
      <section class="tool-grid" :class="{ compact: listView === 'compact' }">
        <div class="list-toolbar">
          <div>
            <strong>可用工具</strong
            ><span>{{ filteredTools.length }} 个匹配结果</span>
          </div>
          <div class="view-toggle">
            <button
              :class="{ active: listView === 'card' }"
              @click="listView = 'card'"
            >
              卡片</button
            ><button
              :class="{ active: listView === 'compact' }"
              @click="listView = 'compact'"
            >
              紧凑
            </button>
          </div>
        </div>
        <NuxtLink
          v-for="(item, i) in filteredTools"
          :key="item.slug"
          :to="`/simulation/${item.slug}`"
          class="tool-card"
          ><div class="tool-card-visual">
            <div class="heat-field" :class="`field-${i}`">
              <span v-for="n in 18" :key="n" :style="{ '--i': n }"></span>
            </div>
            <span class="tool-status"><i></i>{{ item.status }}</span>
          </div>
          <div class="tool-card-body">
            <div>
              <span>{{ item.type }}</span
              ><span>v1.2.0</span>
            </div>
            <h2>{{ item.name }}</h2>
            <p>{{ item.description }}</p>
            <footer>
              <span>{{ item.level }}</span
              ><span><Clock3 :size="14" />{{ item.time }}</span
              ><strong>打开工具 <ArrowRight :size="15" /></strong>
            </footer></div
        ></NuxtLink>
        <div v-if="!filteredTools.length" class="empty-state">
          <Search :size="32" />
          <h3>没有匹配的工具</h3>
          <p>清除搜索或调整筛选条件。</p>
          <button
            class="button secondary"
            @click="
              listQuery = '';
              dimensionFilter = '全部';
              solverFilter = '全部';
              levelFilter = '全部';
            "
          >
            清除筛选
          </button>
        </div>
      </section>
    </div>
  </div>

  <div v-else-if="invalidToolRoute" class="page">
    <div class="container not-found" role="status">
      <XCircle :size="40" /><span>404</span>
      <h1>没有找到这个仿真工具</h1>
      <p>工具标识可能已变更，请从已验证的工具列表重新进入。</p>
      <NuxtLink to="/simulation" class="button">返回工具列表</NuxtLink>
    </div>
  </div>

  <div v-else-if="!taskRoute && tool" class="page workbench-page">
    <div class="container breadcrumb">
      <NuxtLink to="/simulation">CFD 仿真</NuxtLink
      ><ChevronRight :size="14" /><span>{{ tool.name }}</span>
    </div>
    <div class="container workbench-layout">
      <aside class="parameter-panel">
        <div class="parameter-head">
          <span><i></i>本地求解器 · v1.2.0</span>
          <h1>{{ tool.name }}</h1>
          <p>{{ tool.description }}</p>
        </div>
        <div class="parameter-tabs">
          <button
            :class="{ active: parameterTab === 'physical' }"
            @click="parameterTab = 'physical'"
          >
            物理参数</button
          ><button
            :class="{ active: parameterTab === 'numerical' }"
            @click="parameterTab = 'numerical'"
          >
            网格 / 数值</button
          ><button
            :class="{ active: parameterTab === 'output' }"
            @click="parameterTab = 'output'"
          >
            输出
          </button>
        </div>
        <form @submit.prevent="run">
          <div
            v-if="
              parameterTab === 'physical' && slug === 'convection-diffusion'
            "
            class="field-row"
          >
            <label
              >离散格式<select v-model="params.scheme">
                <option value="upwind">一阶迎风</option>
                <option value="central">中心差分</option></select
              ><small>高 Péclet 数下中心差分可能振荡</small></label
            >
          </div>
          <div
            v-if="parameterTab === 'physical' && slug === 'pipe-flow'"
            class="field-row"
          >
            <label
              >驱动方式<select v-model="params.drive_mode">
                <option value="mean_velocity">指定平均速度</option>
                <option value="pressure_drop">指定压降</option>
              </select></label
            >
          </div>
          <div
            v-if="parameterTab === 'physical' && slug === 'turbulence-compare'"
            class="field-row"
          >
            <label
              >流动类型<select v-model="params.flow_type">
                <option value="internal">内流</option>
                <option value="external">外流</option>
              </select></label
            >
          </div>
          <div class="field-row two">
            <label v-for="field in visibleFieldDefs" :key="field[0]"
              >{{ field[1] }}
              <div class="unit-input">
                <input
                  v-model.number="params[field[0]]"
                  type="number"
                  :min="field[3]"
                  :max="field[4]"
                  :step="
                    [
                      'nx',
                      'ny',
                      'samples',
                      'layers',
                      'max_iterations',
                    ].includes(field[0])
                      ? 1
                      : 'any'
                  "
                  required
                /><span>{{ fieldUnit(field) }}</span>
              </div>
              <small>{{ fieldHints[field[0]] }} · {{ field[3] }}–{{ field[4] }}</small></label
            >
          </div>
          <div v-if="!visibleFieldDefs.length" class="small-empty">
            此工具没有单独的{{
              parameterTab === "output" ? "输出" : "数值"
            }}参数。
          </div>
          <div v-if="runError" class="inline-alert danger">
            <AlertTriangle :size="18" /><span>{{ runError }}</span>
          </div>
          <div class="estimate-box">
            <div>
              <Gauge :size="18" /><span
                >求解方法<strong>{{ toolSpec.method }}</strong></span
              >
            </div>
            <div>
              <Clock3 :size="18" /><span
                >预计耗时<strong>{{ tool.time }}</strong></span
              >
            </div>
          </div>
          <div class="run-actions">
            <button
              type="submit"
              class="button large run-button"
              :disabled="running"
            >
              <Activity v-if="running" class="spin" :size="18" /><Play
                v-else
                :size="18"
              />{{ running ? `${phase} ${progress}%` : "运行仿真" }}</button
            ><button type="button" class="text-button" @click="reset">
              <RotateCcw :size="15" />恢复默认
            </button>
          </div>
        </form>
      </aside>
      <section class="work-area simulation-work-area">
        <div class="work-tabs">
          <button
            :class="{ active: activeTab === 'model' }"
            @click="activeTab = 'model'"
          >
            模型定义</button
          ><button
            :class="{ active: activeTab === 'geometry' }"
            @click="activeTab = 'geometry'"
          >
            计算域</button
          ><button
            :class="{ active: activeTab === 'results' }"
            :disabled="!liveTask"
            @click="activeTab = 'results'"
          >
            运行结果 <span v-if="liveTask" class="tab-ready">已生成</span>
          </button>
        </div>
        <div v-if="running" class="running-overlay">
          <div class="solver-progress">
            <Activity :size="30" />
            <h2>{{ phase }}</h2>
            <p>任务正在本地浏览器中执行，可以安全地等待计算完成。</p>
            <div class="progress large">
              <i :style="{ width: progress + '%' }"></i>
            </div>
            <span>{{ progress }}%</span>
          </div>
        </div>
        <template v-else>
          <div v-if="activeTab === 'model'" class="simulation-model">
            <div class="simulation-title-row">
              <div><span class="kicker">PHYSICAL MODEL</span><h2>{{ tool.name }}</h2><p>{{ toolSpec.domain }}</p></div>
              <span class="method-badge">{{ toolSpec.method }}</span>
            </div>
            <div class="model-equation">{{ toolSpec.equation }}</div>
            <div class="simulation-definition-grid">
              <div><small>边界与假设</small><ul><li v-for="item in toolSpec.boundary" :key="item">{{ item }}</li></ul></div>
              <div><small>计算输出</small><ul><li v-for="item in toolSpec.outputs" :key="item">{{ item }}</li></ul></div>
            </div>
            <div class="workflow-strip"><span>01 参数校验</span><i></i><span>02 方程求解</span><i></i><span>03 误差与适用性检查</span><i></i><span>04 结果导出</span></div>
          </div>
          <div v-else-if="activeTab === 'geometry'" class="simulation-geometry">
            <SimulationScene :slug="slug" :params="params" :result="liveResult" />
            <div class="geometry-notes"><div><small>计算域</small><strong>{{ toolSpec.domain }}</strong></div><div><small>当前离散</small><strong>{{ slug === 'lid-driven-cavity' ? `${params.nx} × ${params.ny}` : slug === 'convection-diffusion' ? `${params.nx} 节点` : '解析 / 工程模型' }}</strong></div><div><small>单位系统</small><strong>SI</strong></div></div>
          </div>
          <div v-else-if="liveTask && liveResult" class="live-results">
            <header class="live-result-head">
              <div><span class="status-badge" :class="liveTask.status === 'SUCCEEDED' ? 'success' : 'danger'"><CheckCircle2 v-if="liveTask.status === 'SUCCEEDED'" :size="15" /><AlertTriangle v-else :size="15" />{{ liveTask.status === 'SUCCEEDED' ? '计算完成' : '未达到收敛条件' }}</span><small>{{ liveTask.id }} · {{ liveTask.duration }} ms</small></div>
              <div><button class="button secondary small" @click="download('csv', liveTask)"><Download :size="14" />CSV</button><NuxtLink class="button small" :to="`/simulation/tasks/${liveTask.id}`">完整报告</NuxtLink></div>
            </header>
            <div class="live-summary"><div v-for="item in liveResult.summary" :key="item.label"><small>{{ item.label }}</small><strong>{{ item.value }}</strong></div></div>
            <div class="live-visual-grid">
              <SimulationScene :slug="slug" :params="params" :result="liveResult" />
              <div class="live-chart-panel"><div class="result-chart-head"><div><h2>{{ toolSpec.chartTitle }}</h2><p>{{ toolSpec.chartNote }}</p></div></div><DataChart :x="liveResult.x" :y="liveResult.series || []" :y2="liveResult.exact || []" :log="slug === 'lid-driven-cavity'" :label="toolSpec.primaryLabel" :label2="toolSpec.secondaryLabel" :x-label="toolSpec.xLabel" :y-label="toolSpec.yLabel" /></div>
            </div>
            <div v-if="liveTask.warnings?.length" class="inline-alert warning"><AlertTriangle :size="18" /><div><strong>适用性提示</strong><p v-for="warning in liveTask.warnings" :key="warning">{{ warning }}</p></div></div>
            <div v-if="liveCredibility" class="live-credibility"><div><ShieldCheck :size="22" /><span><small>可信度自动检查</small><strong>{{ liveCredibility.score }} / 100 · {{ liveCredibility.label }}</strong></span></div><div class="credibility-dots"><i v-for="check in liveCredibility.checks" :key="check.key" :class="check.status" :title="`${check.label}：${check.detail}`"></i></div></div>
          </div>
        </template>
      </section>
    </div>
  </div>

  <div v-else class="page result-page">
    <div v-if="task" class="container">
      <div class="breadcrumb">
        <NuxtLink to="/simulation">CFD 仿真</NuxtLink
        ><ChevronRight :size="14" /><NuxtLink
          :to="task.tool === 'parameter-sweep' ? '/simulation/lab' : `/simulation/${task.tool}`"
          >{{ task.toolName }}</NuxtLink
        ><ChevronRight :size="14" /><span>{{ task.id }}</span>
      </div>
      <header class="result-header">
        <div>
          <span
            class="status-badge"
            :class="task.status === 'SUCCEEDED' ? 'success' : 'danger'"
            ><CheckCircle2
              v-if="task.status === 'SUCCEEDED'"
              :size="16"
            /><AlertTriangle v-else :size="16" />{{
              task.status === "SUCCEEDED" ? "计算成功" : "计算未收敛"
            }}</span
          >
          <h1>{{ task.toolName }}</h1>
          <p>
            {{ task.id }} ·
            {{ new Date(task.createdAt).toLocaleString("zh-CN") }} · 求解器
            v1.2.0
          </p>
        </div>
        <div>
          <button class="button secondary" @click="download('json')">
            <FileJson :size="16" />JSON</button
          ><button class="button" @click="download('csv')">
            <Download :size="16" />下载 CSV
          </button>
        </div>
      </header>
      <div v-if="task.warnings?.length" class="inline-alert warning">
        <AlertTriangle :size="19" />
        <div>
          <strong>结果警告</strong>
          <p v-for="w in task.warnings" :key="w">{{ w }}</p>
        </div>
      </div>
      <section class="summary-grid">
        <div v-for="item in resultData().summary" :key="item.label">
          <small>{{ item.label }}</small
          ><strong>{{ item.value }}</strong>
        </div>
      </section>
      <div class="result-tabs">
        <button
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          概览</button
        ><button
          :class="{ active: activeTab === 'curve' }"
          @click="activeTab = 'curve'"
        >
          曲线</button
        ><button
          :class="{ active: activeTab === 'table' }"
          @click="activeTab = 'table'"
        >
          数据表</button
        ><button
          :class="{ active: activeTab === 'log' }"
          @click="activeTab = 'log'"
        >
          求解日志
        </button>
      </div>
      <section class="result-content">
        <template v-if="activeTab === 'overview' || activeTab === 'curve'"
          ><SimulationScene v-if="activeTab === 'overview' && task.tool !== 'parameter-sweep'" class="report-scene" :slug="task.tool" :params="task.params" :result="resultData()" /><div class="result-chart-head">
            <div>
              <h2>
                {{
                  specFor(task.tool).chartTitle
                }}
              </h2>
              <p>
                {{
                  specFor(task.tool).chartNote
                }}
              </p>
            </div>
            <button class="button secondary small" @click="download('csv')">
              <Download :size="15" />数据
            </button>
          </div>
          <DataChart
            :x="resultData().x"
            :y="resultData().series || []"
            :y2="resultData().exact || []"
            :log="task.tool === 'lid-driven-cavity'"
            :label="specFor(task.tool).primaryLabel"
            :label2="specFor(task.tool).secondaryLabel"
            :x-label="specFor(task.tool).xLabel"
            :y-label="specFor(task.tool).yLabel"
        /></template>
        <div v-else-if="activeTab === 'table'" class="data-table">
          <div>
            <strong>x / step</strong><strong>value</strong
            ><strong>reference</strong>
          </div>
          <div v-for="(x, i) in (resultData().x || []).slice(0, 20)" :key="i">
            <span>{{ Number(x).toPrecision(5) }}</span
            ><span>{{ Number(resultData().series[i]).toPrecision(7) }}</span
            ><span>{{
              resultData().exact?.[i] !== undefined
                ? Number(resultData().exact[i]).toPrecision(7)
                : "—"
            }}</span>
          </div>
        </div>
        <pre
          v-else
          class="solver-log"
        ><code>[INFO] input schema validated\n[INFO] solver package flowlab/{{task.tool}}@1.2.0\n[INFO] system assembled successfully\n[INFO] convergence and applicability checks completed\n[INFO] result manifest written\n[{{task.status==='SUCCEEDED'?'SUCCESS':'WARNING'}}] task {{task.id}} completed in {{task.duration}} ms</code></pre>
      </section>
      <section class="result-lower" :class="{ 'has-credibility': credibility }">
        <div>
          <h3>参数快照</h3>
          <dl>
            <div v-for="(v, k) in task.params" :key="k">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3>结果文件</h3>
          <button @click="download('json')">
            <FileJson :size="18" /><span
              ><strong>manifest.json</strong
              ><small>输入、版本与摘要</small></span
            ><Download :size="16" /></button
          ><button @click="download('csv')">
            <Table2 :size="18" /><span
              ><strong>table.csv</strong><small>采样数据</small></span
            ><Download :size="16" />
          </button>
        </div>
        <div v-if="credibility" class="credibility-panel">
          <header>
            <div>
              <ShieldCheck :size="22" />
              <span><strong>结果可信度清单</strong><small>自动检查，不替代独立 V&amp;V</small></span>
            </div>
            <b :class="`grade-${credibility.grade.toLowerCase()}`">{{ credibility.score }} / 100 · {{ credibility.label }}</b>
          </header>
          <div class="credibility-check-grid">
            <div v-for="check in credibility.checks" :key="check.key" :class="check.status">
              <CheckCircle2 v-if="check.status === 'pass'" :size="17" />
              <AlertTriangle v-else :size="17" />
              <span><strong>{{ check.label }}</strong><small>{{ check.detail }}</small></span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div v-else class="container empty-state">
      <XCircle :size="40" />
      <h1>没有找到这个任务</h1>
      <p>任务可能已被清理，或仅保存在另一台设备中。</p>
      <NuxtLink to="/simulation" class="button">返回工具列表</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.simulation-work-area{min-width:0;overflow:hidden;background:rgba(255,255,255,.9);box-shadow:0 20px 50px rgba(34,62,76,.07)}
.work-tabs button:disabled{cursor:not-allowed;opacity:.42}.tab-ready{margin-left:6px;padding:2px 5px;border-radius:99px;background:#e4f4ea;color:#24744a;font-size:8px}
.simulation-model,.simulation-geometry,.live-results{padding:28px}.simulation-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.simulation-title-row h2{margin:5px 0 3px;font-size:28px}.simulation-title-row p{margin:0;color:var(--color-text-600);font-size:12px}.method-badge{max-width:240px;padding:8px 11px;border:1px solid #b9d6e7;border-radius:7px;background:#eef7fc;color:#075b8d;font-size:10px;font-weight:700;text-align:right}
.simulation-definition-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.simulation-definition-grid>div{padding:18px;border:1px solid var(--color-border-200);border-radius:10px;background:rgba(248,251,252,.8)}.simulation-definition-grid small{font-weight:700;color:var(--color-primary-600);letter-spacing:.06em}.simulation-definition-grid ul{margin:10px 0 0;padding-left:18px;color:var(--color-text-600);font-size:12px;line-height:1.9}
.workflow-strip{display:flex;align-items:center;gap:9px;margin-top:18px;padding:14px 16px;border-radius:9px;background:#102f42;color:#d9edf8;font-size:10px}.workflow-strip i{height:1px;flex:1;background:rgba(255,255,255,.25)}
.simulation-geometry{display:grid;gap:14px}.geometry-notes{display:grid;grid-template-columns:2fr 1fr .6fr;gap:10px}.geometry-notes>div{display:grid;gap:3px;padding:12px 14px;border-left:3px solid #83b9d6;background:#f5f9fb}.geometry-notes small{color:#70808a;font-size:9px}.geometry-notes strong{font-size:11px}
.live-results{display:grid;gap:16px}.live-result-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.live-result-head>div{display:flex;align-items:center;gap:10px}.live-result-head small{color:var(--color-text-600);font:10px var(--font-mono)}.live-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));border:1px solid var(--color-border-200);border-radius:10px;background:#fff;overflow:hidden}.live-summary>div{min-width:0;padding:13px 14px;border-right:1px solid var(--color-border-200)}.live-summary small{display:block;color:var(--color-text-600);font-size:9px}.live-summary strong{display:block;margin-top:3px;overflow:hidden;font:13px var(--font-mono);text-overflow:ellipsis;white-space:nowrap}
.live-visual-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}.live-chart-panel{min-width:0;padding:15px;border:1px solid var(--color-border-200);border-radius:12px;background:#fff;box-shadow:0 16px 38px rgba(34,63,78,.06)}.live-chart-panel :deep(.data-chart){height:255px}.live-chart-panel .result-chart-head{margin-bottom:8px}.live-credibility{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid #c6dfd0;border-radius:10px;background:#f2faf5}.live-credibility>div{display:flex;align-items:center;gap:9px}.live-credibility span{display:grid}.live-credibility small{color:#5f7468;font-size:9px}.live-credibility strong{font-size:12px}.credibility-dots{display:flex;gap:6px}.credibility-dots i{width:10px;height:10px;border-radius:50%;background:#8bbd9d}.credibility-dots i.warning{background:#e4a95c}.credibility-dots i.fail{background:#d76b61}
.parameter-panel form{max-height:calc(100vh - 245px);overflow:auto;scrollbar-width:thin}.field-row.two{grid-template-columns:1fr}.field-row label>small{min-height:auto;margin-top:3px;line-height:1.35}.estimate-box{grid-template-columns:1.45fr .75fr}.estimate-box strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.run-actions{position:sticky;bottom:-16px;margin:8px -16px -16px;padding:13px 16px;background:rgba(255,255,255,.96);border-top:1px solid var(--color-border-200);backdrop-filter:blur(10px)}.report-scene{max-width:900px;margin:0 auto 18px}.result-chart-head{margin-bottom:10px}
@media(max-width:1100px){.live-visual-grid{grid-template-columns:1fr}.parameter-panel form{max-height:none}.run-actions{position:static;margin:8px 0 0;padding:12px 0 0}.simulation-model,.simulation-geometry,.live-results{padding:22px}}
@media(max-width:620px){.simulation-title-row,.live-result-head{align-items:flex-start;flex-direction:column}.method-badge{max-width:none;text-align:left}.simulation-definition-grid,.geometry-notes{grid-template-columns:1fr}.workflow-strip{align-items:flex-start;flex-direction:column}.workflow-strip i{width:1px;height:10px;margin-left:8px;flex:none}.simulation-model,.simulation-geometry,.live-results{padding:16px}.live-result-head>div:last-child{width:100%}.live-result-head>div:last-child>*{flex:1}.live-summary{grid-template-columns:1fr 1fr}.live-summary>div{border-bottom:1px solid var(--color-border-200)}.estimate-box{grid-template-columns:1fr}.run-actions{align-items:stretch;flex-direction:column;gap:8px}.run-button{width:100%;min-width:0}.parameter-tabs{overflow:auto}.parameter-tabs button{flex:none}}
</style>
