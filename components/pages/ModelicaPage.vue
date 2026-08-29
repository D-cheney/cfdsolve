<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileCode2,
  GitBranch,
  Library,
  Link2,
  MousePointer2,
  PanelBottomClose,
  Play,
  Plus,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Table2,
  Workflow,
  Wand2,
  X,
} from "lucide-vue-next";
import type {
  ModelicaComponentAlgorithm,
  ModelicaDiagramNode,
  ModelicaRun,
  ModelicaSeries,
} from "~/types/platform";
import { getModelicaTemplate, modelicaTemplates } from "~/utils/content";
import {
  analyzeModelica,
  compileOutput,
  defaultModelicaDiagram,
  defaultModelicaExperiment,
  runToCsv,
  simulateModelicaLite,
} from "~/utils/modelica/workbench";

const route = useRoute(),
  router = useRouter(),
  store = usePlatformStore();
const hub = computed(() => route.path === "/modelica");
const projectsPage = computed(() => route.path === "/modelica/projects");
const editorPage = computed(() =>
  /^\/modelica\/projects\/[^/]+\/editor\/?$/.test(route.path),
);
const runPage = computed(() => /^\/modelica\/runs\/[^/]+\/?$/.test(route.path));
const librariesPage = computed(() => route.path === "/modelica/libraries");
const templatesPage = computed(() => route.path === "/modelica/templates");
if (
  import.meta.server &&
  !hub.value &&
  !projectsPage.value &&
  !editorPage.value &&
  !runPage.value &&
  !librariesPage.value &&
  !templatesPage.value
) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, 404, "Modelica page not found");
}
const projectId = computed(() => route.path.split("/")[3] || "demo-project");
const project = computed(() =>
  store.projects.find((item) => item.id === projectId.value),
);
const code = ref(""),
  dirty = ref(false),
  compiling = ref(false),
  output = ref("");
const bottomTab = ref<"problems" | "output" | "runs">("problems");
const editorMode = ref<"code" | "canvas">("canvas");
const newDialog = ref(false),
  newName = ref("新的系统模型"),
  newTemplate = ref("MassSpringDamper");
const experiment = ref(defaultModelicaExperiment()),
  parameterValues = ref<Record<string, number>>({});
const selectedNodeId = ref(""),
  connectFrom = ref(""),
  linkType = ref<"physical" | "signal">("physical"),
  designError = ref(""),
  algorithmDraft = ref("");
const dragging = ref<{ id: string; offsetX: number; offsetY: number } | null>(
  null,
);
const variableSearch = ref(""),
  selectedVariables = ref<string[]>([]),
  copied = ref(false);
const resultTab = ref<"curve" | "table" | "statistics">("curve"),
  timeStart = ref<number | null>(null),
  timeStop = ref<number | null>(null);
const derivedSeries = ref<ModelicaSeries[]>([]);

const analysis = computed(() => analyzeModelica(code.value));
const diagnostics = computed(() => analysis.value.diagnostics);
const parameters = computed(() =>
  analysis.value.symbols.filter((item) => item.kind === "parameter"),
);
const modelStats = computed(() => ({
  parameters: parameters.value.length,
  variables: analysis.value.symbols.filter((item) => item.kind === "variable")
    .length,
  equations: analysis.value.equationCount,
}));
const design = computed(
  () => project.value?.diagram ?? { nodes: [], links: [] },
);
const selectedNode = computed(() =>
  design.value.nodes.find((item) => item.id === selectedNodeId.value),
);
const nodeAlgorithm = computed(() =>
  project.value?.algorithms?.find(
    (item) => item.nodeId === selectedNodeId.value,
  ),
);
const currentRun = computed<ModelicaRun | undefined>(() => {
  const runs = project.value?.runs ?? [],
    requested = typeof route.query.run === "string" ? route.query.run : "";
  return runs.find((item) => item.id === requested) ?? runs[0];
});
const allResultVariables = computed(() => [
  ...(currentRun.value?.variables ?? []),
  ...derivedSeries.value,
]);
const filteredRunVariables = computed(() =>
  allResultVariables.value.filter((item) =>
    item.name.toLowerCase().includes(variableSearch.value.toLowerCase()),
  ),
);
const timeIndices = computed(() =>
  (currentRun.value?.time ?? [])
    .map((value, index) => ({ value, index }))
    .filter(
      (item) =>
        (timeStart.value === null || item.value >= timeStart.value) &&
        (timeStop.value === null || item.value <= timeStop.value),
    ),
);
const processedTime = computed(() =>
  timeIndices.value.map((item) => item.value),
);
const plotVariables = computed(() =>
  allResultVariables.value
    .filter((item) => selectedVariables.value.includes(item.name))
    .slice(0, 2)
    .map((series) => ({
      ...series,
      values: timeIndices.value.map((item) => series.values[item.index]),
    })),
);
const selectedProperty = computed(
  () => plotVariables.value[0] ?? allResultVariables.value[0],
);
const seriesStats = computed(() => {
  const values = selectedProperty.value?.values ?? [];
  if (!values.length) return { min: "—", max: "—", final: "—", mean: "—" };
  return {
    min: Math.min(...values).toPrecision(5),
    max: Math.max(...values).toPrecision(5),
    final: values.at(-1)!.toPrecision(5),
    mean: (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toPrecision(5),
  };
});
const palette: Array<{ kind: ModelicaDiagramNode["kind"]; label: string }> = [
  { kind: "source", label: "源/边界" },
  { kind: "mass", label: "质量/惯量" },
  { kind: "spring", label: "弹簧" },
  { kind: "damper", label: "阻尼" },
  { kind: "thermal-capacity", label: "热容" },
  { kind: "thermal-resistance", label: "热阻" },
  { kind: "fluid-volume", label: "容腔" },
  { kind: "fluid-resistance", label: "管阻" },
  { kind: "shaft", label: "转轴" },
  { kind: "sensor", label: "传感器" },
];
const nodeParameterDefaults: Partial<
  Record<ModelicaDiagramNode["kind"], Record<string, number>>
> = {
  mass: { m: 1 },
  spring: { k: 100 },
  damper: { c: 0.5 },
  "thermal-capacity": { C: 1000 },
  "thermal-resistance": { R: 0.8 },
  "fluid-volume": { C: 0.02 },
  "fluid-resistance": { R: 1.8 },
  shaft: { J: 2.5, d: 0.12 },
  load: { tauLoad: 5 },
  source: { value: 1 },
  sensor: {},
};
function physicalDomain(kind: ModelicaDiagramNode["kind"]) {
  if (["mass", "spring", "damper", "shaft", "load"].includes(kind))
    return "mechanical";
  if (["thermal-capacity", "thermal-resistance"].includes(kind))
    return "thermal";
  if (["fluid-volume", "fluid-resistance"].includes(kind)) return "fluid";
  return "boundary";
}
const libraries = [
  {
    name: "Platform.Base",
    version: "1.0.0",
    classes: 28,
    desc: "类型、接口、单位与基础图标",
  },
  {
    name: "Platform.Math",
    version: "1.0.0",
    classes: 34,
    desc: "数学函数与插值工具",
  },
  {
    name: "Platform.Blocks",
    version: "1.0.0",
    classes: 46,
    desc: "信号与控制组件",
  },
  {
    name: "Platform.Thermal",
    version: "1.0.0",
    classes: 22,
    desc: "热容、导热、边界与传感器",
  },
];

function loadProject() {
  if (!project.value) return;
  code.value = project.value.code;
  experiment.value = {
    ...defaultModelicaExperiment(),
    ...(project.value.experiment ?? {}),
  };
  parameterValues.value = Object.fromEntries(
    analyzeModelica(code.value)
      .symbols.filter((item) => item.kind === "parameter")
      .map((item) => [item.name, item.value ?? 0]),
  );
  const parameterNames = new Set(Object.keys(parameterValues.value));
  for (const item of project.value.diagram?.nodes ?? []) {
    for (const [key, value] of Object.entries(item.parameters)) {
      if (
        parameterNames.has(key) &&
        Number.isFinite(parameterValues.value[key])
      )
        item.parameters[key] = parameterValues.value[key];
    }
  }
  selectedNodeId.value = project.value.diagram?.nodes[0]?.id ?? "";
  algorithmDraft.value =
    project.value.algorithms?.find(
      (item) => item.nodeId === selectedNodeId.value,
    )?.code ?? "";
  dirty.value = false;
  derivedSeries.value = [];
}
watch(project, loadProject, { immediate: true });
watch(code, () => {
  if (project.value && code.value !== project.value.code) dirty.value = true;
});
watch(
  parameters,
  (items) => {
    for (const item of items) {
      if (Number.isFinite(item.value))
        parameterValues.value[item.name] = item.value!;
      else if (!Number.isFinite(parameterValues.value[item.name]))
        parameterValues.value[item.name] = 0;
      for (const node of design.value.nodes)
        if (Object.hasOwn(node.parameters, item.name))
          node.parameters[item.name] = parameterValues.value[item.name];
    }
  },
  { deep: true },
);
watch(selectedNodeId, (id) => {
  algorithmDraft.value =
    project.value?.algorithms?.find((item) => item.nodeId === id)?.code ?? "";
});
watch(
  currentRun,
  (run) => {
    selectedVariables.value =
      run?.variables.slice(0, 2).map((item) => item.name) ?? [];
    timeStart.value = run?.time[0] ?? null;
    timeStop.value = run?.time.at(-1) ?? null;
    derivedSeries.value = [];
  },
  { immediate: true },
);

function save() {
  if (project.value) {
    store.saveProject(project.value.id, code.value, experiment.value);
    dirty.value = false;
  }
}
function syncParameterToSource(key: string, value: number) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const numeric = "[-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?";
  const declaration = new RegExp(
    `(^\\s*parameter\\s+(?:Real|Integer)\\s+${escapedKey}\\b[^\\n]*?=\\s*)${numeric}`,
    "m",
  );
  code.value = code.value.replace(
    declaration,
    (_match, prefix: string) => `${prefix}${value}`,
  );
}
function numberInput(event: Event, key: string) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) {
    parameterValues.value[key] = value;
    for (const item of design.value.nodes)
      if (Object.hasOwn(item.parameters, key)) item.parameters[key] = value;
    syncParameterToSource(key, value);
  }
}
async function compile() {
  save();
  compiling.value = true;
  bottomTab.value = "output";
  await new Promise((resolve) => setTimeout(resolve, 180));
  output.value = compileOutput(analysis.value);
  if (project.value) {
    project.value.lastCompile = diagnostics.value.some(
      (item) => item.severity === "error",
    )
      ? "有诊断"
      : "成功";
    store.persist(["projects"]);
  }
  compiling.value = false;
}
async function run() {
  await compile();
  if (
    !project.value ||
    diagnostics.value.some((item) => item.severity === "error")
  )
    return;
  const run = simulateModelicaLite(
    code.value,
    experiment.value,
    parameterValues.value,
  );
  output.value += `\n[runtime] ${run.messages.join(" ")}`;
  store.addModelicaRun(project.value.id, run);
  if (run.status === "SUCCEEDED")
    router.push({
      path: `/modelica/runs/${project.value.id}`,
      query: { run: run.id },
    });
}
function create() {
  const template = getModelicaTemplate(newTemplate.value),
    item = store.createProject(newName.value || template.name, template.class);
  newDialog.value = false;
  router.push(`/modelica/projects/${item.id}/editor`);
}
function useTemplate(template: (typeof modelicaTemplates)[number]) {
  newName.value = template.name;
  newTemplate.value = template.class;
  create();
}
function resetParameters() {
  if (!project.value) return;
  const defaults = analyzeModelica(
    getModelicaTemplate(project.value.template).source,
  ).symbols.filter((item) => item.kind === "parameter");
  for (const item of defaults) {
    const value = item.value ?? 0;
    parameterValues.value[item.name] = value;
    for (const node of design.value.nodes)
      if (Object.hasOwn(node.parameters, item.name))
        node.parameters[item.name] = value;
    syncParameterToSource(item.name, value);
  }
  save();
  persistDesign();
}
function persistDesign() {
  if (project.value)
    store.saveModelicaDesign(
      project.value.id,
      { nodes: design.value.nodes, links: design.value.links },
      project.value.algorithms ?? [],
    );
}
function addNode(kind: ModelicaDiagramNode["kind"], label: string) {
  if (!project.value) return;
  const id = `${kind}-${Date.now().toString(36)}`;
  project.value.diagram ??= { nodes: [], links: [] };
  project.value.diagram.nodes.push({
    id,
    kind,
    label,
    x: 60 + (project.value.diagram.nodes.length % 4) * 165,
    y: 80 + Math.floor(project.value.diagram.nodes.length / 4) * 145,
    parameters: { ...(nodeParameterDefaults[kind] ?? {}) },
  });
  selectedNodeId.value = id;
  persistDesign();
}
function selectNode(id: string) {
  selectedNodeId.value = id;
  if (connectFrom.value && connectFrom.value !== id) {
    const source = design.value.nodes.find(
      (item) => item.id === connectFrom.value,
    );
    const target = design.value.nodes.find((item) => item.id === id);
    if (linkType.value === "physical" && source && target) {
      const sourceDomain = physicalDomain(source.kind),
        targetDomain = physicalDomain(target.kind);
      if (
        sourceDomain !== "boundary" &&
        targetDomain !== "boundary" &&
        sourceDomain !== targetDomain
      ) {
        designError.value = `不能把 ${sourceDomain} 物理端口连接到 ${targetDomain} 元件。`;
        connectFrom.value = "";
        return;
      }
    }
    if (
      !design.value.links.some(
        (item) => item.from === connectFrom.value && item.to === id,
      )
    ) {
      design.value.links.push({
        id: `link-${Date.now().toString(36)}`,
        from: connectFrom.value,
        to: id,
        type: linkType.value,
      });
      persistDesign();
    }
    designError.value = "";
    connectFrom.value = "";
  }
}
function removeLink(id: string) {
  if (!project.value) return;
  project.value.diagram!.links = project.value.diagram!.links.filter(
    (item) => item.id !== id,
  );
  persistDesign();
}
function removeNode() {
  if (!project.value || !selectedNodeId.value) return;
  const id = selectedNodeId.value;
  project.value.diagram!.nodes = project.value.diagram!.nodes.filter(
    (item) => item.id !== id,
  );
  project.value.diagram!.links = project.value.diagram!.links.filter(
    (item) => item.from !== id && item.to !== id,
  );
  selectedNodeId.value = project.value.diagram!.nodes[0]?.id ?? "";
  persistDesign();
}
function beginDrag(event: PointerEvent, item: ModelicaDiagramNode) {
  dragging.value = {
    id: item.id,
    offsetX: event.offsetX,
    offsetY: event.offsetY,
  };
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}
function moveNode(event: PointerEvent) {
  if (!dragging.value) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect(),
    item = design.value.nodes.find((node) => node.id === dragging.value!.id);
  if (!item) return;
  item.x = Math.max(
    6,
    Math.min(
      rect.width - 140,
      event.clientX - rect.left - dragging.value.offsetX,
    ),
  );
  item.y = Math.max(
    6,
    Math.min(
      rect.height - 76,
      event.clientY - rect.top - dragging.value.offsetY,
    ),
  );
}
function endDrag() {
  if (dragging.value) persistDesign();
  dragging.value = null;
}
function updateNodeParameter(event: Event, key: string) {
  if (!selectedNode.value) return;
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) {
    selectedNode.value.parameters[key] = value;
    if (parameters.value.some((item) => item.name === key)) {
      parameterValues.value[key] = value;
      syncParameterToSource(key, value);
      if (project.value) {
        store.saveProject(project.value.id, code.value, experiment.value);
        dirty.value = false;
      }
    }
    persistDesign();
  }
}
function saveAlgorithm() {
  if (!project.value || !selectedNode.value) return;
  const algorithms = project.value.algorithms ?? [],
    index = algorithms.findIndex(
      (item) => item.nodeId === selectedNode.value!.id,
    );
  const algorithm: ModelicaComponentAlgorithm = {
    nodeId: selectedNode.value.id,
    name: `${selectedNode.value.label} 算法`,
    code: algorithmDraft.value,
    enabled: true,
  };
  if (index >= 0) algorithms[index] = algorithm;
  else algorithms.push(algorithm);
  project.value.algorithms = algorithms;
  persistDesign();
}
function generateSourceFromCanvas() {
  if (!project.value) return;
  const notes = [
    "  // <flowlab-canvas>",
    ...design.value.nodes.map(
      (item) =>
        `  // component ${item.id}: ${item.kind} ${item.label}; parameters=${JSON.stringify(item.parameters)}`,
    ),
    ...design.value.links.map(
      (item) => `  // connect ${item.from} -> ${item.to} (${item.type})`,
    ),
    "  // </flowlab-canvas>",
  ].join("\n");
  const cleaned = code.value.replace(
    /^\s*\/\/ <flowlab-canvas>[\s\S]*?^\s*\/\/ <\/flowlab-canvas>\s*\n?/m,
    "",
  );
  code.value = cleaned.includes("equation")
    ? cleaned.replace(/^equation\s*$/m, `${notes}\nequation`)
    : `${cleaned.trimEnd()}\n${notes}\n`;
  dirty.value = true;
  save();
}
function syncCanvasFromSource() {
  if (!project.value) return;
  if (
    !window.confirm(
      "这会用当前项目模板重建画布，现有画布元件、连线和算法关联将被替换。是否继续？",
    )
  )
    return;
  project.value.diagram = defaultModelicaDiagram(project.value.template);
  project.value.algorithms = [];
  selectedNodeId.value = project.value.diagram.nodes[0]?.id ?? "";
  persistDesign();
}
function toggleVariable(name: string) {
  if (selectedVariables.value.includes(name))
    selectedVariables.value = selectedVariables.value.filter(
      (item) => item !== name,
    );
  else if (selectedVariables.value.length < 2)
    selectedVariables.value = [...selectedVariables.value, name];
}
function addDerivative() {
  const selected = selectedProperty.value,
    run = currentRun.value;
  if (!selected || !run) return;
  const series =
    allResultVariables.value.find((item) => item.name === selected.name) ??
    selected;
  if (derivedSeries.value.some((item) => item.name === `der(${series.name})`))
    return;
  derivedSeries.value = [
    ...derivedSeries.value,
    {
      name: `der(${series.name})`,
      unit: series.unit ? `${series.unit}/s` : "1/s",
      values: series.values.map((value, index) =>
        index
          ? (value - series.values[index - 1]) /
            (run.time[index] - run.time[index - 1] || 1)
          : 0,
      ),
    },
  ];
  selectedVariables.value = [series.name, `der(${series.name})`];
}
function exportRun() {
  if (!currentRun.value || !import.meta.client) return;
  const url = URL.createObjectURL(
      new Blob([runToCsv(currentRun.value)], {
        type: "text/csv;charset=utf-8",
      }),
    ),
    link = document.createElement("a");
  link.href = url;
  link.download = `${project.value?.template ?? "modelica"}-${currentRun.value.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
async function copyIdentifier() {
  if (!currentRun.value || !navigator.clipboard) return;
  await navigator.clipboard.writeText(
    `${currentRun.value.engine} · ${currentRun.value.id}`,
  );
  copied.value = true;
  setTimeout(() => (copied.value = false), 1200);
}
</script>

<template>
  <div v-if="hub" class="page modelica-hub">
    <section class="modelica-hero">
      <div class="container">
        <div>
          <span class="kicker">MODELICA WORKBENCH</span>
          <h1>系统仿真与数字样机工作台</h1>
          <p>
            画布建模、元件算法、源码、仿真实验与结果后处理在同一项目内完成。
          </p>
          <div class="hero-actions">
            <NuxtLink to="/modelica/projects" class="button large"
              ><Plus :size="18" />新建项目</NuxtLink
            ><NuxtLink to="/modelica/templates" class="button secondary large"
              >使用可运行模板</NuxtLink
            >
          </div>
        </div>
        <div class="model-topology">
          <div class="topo-toolbar"><span>Workflow</span><b>LOCAL LITE</b></div>
          <div class="topo-nodes">
            <div><Boxes /><span>组件</span></div>
            <i></i>
            <div><Workflow /><span>画布</span></div>
            <i></i>
            <div><Activity /><span>结果</span></div>
          </div>
          <div class="topo-code">
            <span>run</span><code>edit → check → simulate → post-process</code>
          </div>
        </div>
      </div>
    </section>
    <section class="container modelica-steps">
      <div
        v-for="(item, index) in [
          { t: '图形建模', d: '元件、端口与连线', icon: Workflow },
          { t: '源码与算法', d: '可追踪的 Modelica 文本', icon: Code2 },
          { t: '实验仿真', d: '参数、求解器、快照', icon: Play },
          { t: '后处理', d: '筛选、派生量、导出', icon: Activity },
        ]"
        :key="item.t"
      >
        <span>0{{ index + 1 }}</span
        ><component :is="item.icon" />
        <h2>{{ item.t }}</h2>
        <p>{{ item.d }}</p>
        <ArrowRight v-if="index < 3" class="step-arrow" />
      </div>
    </section>
    <section class="modelica-support">
      <div class="container">
        <div>
          <span class="kicker">SAFE EXECUTION</span>
          <h2>完整工作流，明确运行边界</h2>
          <p>
            画布、连线、算法草稿和后处理均可离线保存；当前数值运行仅覆盖内置方程模板，不会在浏览器执行任意用户脚本。
          </p>
        </div>
        <div>
          <span><CheckCircle2 />画布与源码并行保存</span
          ><span><CheckCircle2 />元件算法版本化草稿</span
          ><span><CheckCircle2 />实验快照与 CSV</span
          ><span><AlertTriangle />完整 Modelica 编译需接入 omc</span>
        </div>
      </div>
    </section>
  </div>

  <div v-else-if="projectsPage" class="page account-like">
    <div class="container content-section">
      <header class="page-title-row">
        <div>
          <span class="kicker">MY WORKSPACE</span>
          <h1>Modelica 项目</h1>
          <p>画布、源码、算法和运行结果均按项目保存。</p>
        </div>
        <button class="button" @click="newDialog = true">
          <Plus :size="17" />新建项目
        </button>
      </header>
      <div class="project-table">
        <div class="table-head">
          <span>项目</span><span>顶层模型</span><span>画布</span
          ><span>运行记录</span><span>最近编译</span><span></span>
        </div>
        <div v-for="item in store.projects" :key="item.id" class="table-row">
          <span
            ><FileCode2 :size="19" /><span
              ><strong>{{ item.name }}</strong
              ><small>{{ item.id }}</small></span
            ></span
          ><span>{{ item.template }}</span
          ><span>{{ item.diagram?.nodes.length ?? 0 }} 元件</span
          ><span>{{ item.runs?.length ?? 0 }} 次</span
          ><span
            ><i
              class="status"
              :class="
                item.lastCompile === '成功'
                  ? 'success'
                  : item.lastCompile === '有诊断'
                    ? 'danger'
                    : ''
              "
              >{{ item.lastCompile }}</i
            ></span
          ><span
            ><NuxtLink
              :to="`/modelica/projects/${item.id}/editor`"
              class="button secondary small"
              >打开</NuxtLink
            ></span
          >
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="(editorPage || runPage) && !store.ready" class="page">
    <div class="container not-found">
      <Activity class="spin" :size="36" />
      <h1>正在载入本地项目</h1>
    </div>
  </div>

  <div v-else-if="(editorPage || runPage) && !project" class="page">
    <div class="container not-found" role="status">
      <FileCode2 :size="40" /><span>404</span>
      <h1>没有找到这个 Modelica 项目</h1>
      <p>项目可能已删除，或只存在于另一台设备的本地工作区。</p>
      <NuxtLink to="/modelica/projects" class="button">返回项目列表</NuxtLink>
    </div>
  </div>

  <div v-else-if="editorPage && project" class="modelica-ide">
    <div class="ide-toolbar">
      <div class="ide-project">
        <NuxtLink to="/modelica/projects"
          ><ChevronRight class="back-chevron" :size="16" /></NuxtLink
        ><strong>{{ project.name }}</strong
        ><span
          ><GitBranch :size="13" />画布 {{ design.nodes.length }} 元件 ·
          {{ project.runs?.length ?? 0 }} 快照</span
        >
      </div>
      <div class="ide-actions">
        <button class="button secondary small" @click="save">
          <Save :size="15" />保存</button
        ><button
          class="button secondary small"
          :disabled="compiling"
          @click="compile"
        >
          <Bug :size="15" />{{ compiling ? "检查中" : "检查" }}</button
        ><button class="button small" @click="run">
          <Play :size="15" />运行实验
        </button>
      </div>
    </div>
    <div class="ide-grid workbench-grid">
      <aside class="project-explorer">
        <div class="panel-title"><span>元件库</span><Library :size="15" /></div>
        <div class="component-palette">
          <button
            v-for="item in palette"
            :key="item.kind"
            @click="addNode(item.kind, item.label)"
          >
            <Boxes :size="15" />{{ item.label }}
          </button>
        </div>
        <div class="tree-section">
          <strong><ChevronDown :size="14" />项目文件</strong
          ><button><FileCode2 :size="15" />{{ project.template }}.mo</button
          ><button><Workflow :size="15" />系统画布</button>
        </div>
        <div class="outline">
          <div class="panel-title">模型大纲</div>
          <button v-for="symbol in analysis.symbols" :key="symbol.name">
            {{ symbol.name }} <small>{{ symbol.kind }}</small>
          </button>
        </div>
      </aside>
      <section class="editor-center">
        <div class="editor-tabs">
          <button
            :class="{ active: editorMode === 'canvas' }"
            @click="editorMode = 'canvas'"
          >
            <Workflow :size="14" />图形画布</button
          ><button
            :class="{ active: editorMode === 'code' }"
            @click="editorMode = 'code'"
          >
            <FileCode2 :size="14" />源码 <i v-if="dirty"></i></button
          ><span>{{ dirty ? "有未保存修改" : "已保存" }}</span>
        </div>
        <div v-if="editorMode === 'canvas'" class="canvas-workbench">
          <div class="canvas-toolbar">
            <span><MousePointer2 :size="15" />拖动元件布置</span>
            <label
              >连线<select v-model="linkType">
                <option value="physical">物理</option>
                <option value="signal">信号</option>
              </select></label
            ><button
              class="button secondary small"
              :class="{ active: connectFrom }"
              @click="connectFrom = selectedNodeId"
            >
              <Link2 :size="14" />{{
                connectFrom ? "选择目标元件" : "从选中元件连线"
              }}</button
            ><button
              v-if="connectFrom"
              class="button secondary small"
              @click="connectFrom = ''"
            >
              取消</button
            ><button
              class="button secondary small"
              @click="generateSourceFromCanvas"
            >
              <Wand2 :size="14" />写入画布清单</button
            ><button
              class="button secondary small"
              @click="syncCanvasFromSource"
            >
              <Code2 :size="14" />重建模板画布
            </button>
          </div>
          <div v-if="designError" class="inline-alert danger" role="alert">
            <AlertTriangle :size="16" /><span>{{ designError }}</span>
          </div>
          <div
            class="model-canvas"
            @pointermove="moveNode"
            @pointerup="endDrag"
            @pointerleave="endDrag"
          >
            <svg class="canvas-links" preserveAspectRatio="none">
              <line
                v-for="link in design.links"
                :key="link.id"
                :class="link.type"
                :x1="
                  (design.nodes.find((n) => n.id === link.from)?.x ?? 0) + 60
                "
                :y1="
                  (design.nodes.find((n) => n.id === link.from)?.y ?? 0) + 32
                "
                :x2="(design.nodes.find((n) => n.id === link.to)?.x ?? 0) + 60"
                :y2="(design.nodes.find((n) => n.id === link.to)?.y ?? 0) + 32"
              /></svg
            ><button
              v-for="item in design.nodes"
              :key="item.id"
              class="canvas-node"
              :class="[{ selected: item.id === selectedNodeId }, item.kind]"
              :style="{ left: `${item.x}px`, top: `${item.y}px` }"
              @click.stop="selectNode(item.id)"
              @pointerdown.stop="beginDrag($event, item)"
            >
              <Boxes :size="18" /><strong>{{ item.label }}</strong
              ><small>{{ item.kind }}</small>
            </button>
            <p v-if="!design.nodes.length" class="canvas-empty">
              从左侧组件库添加元件，或由模板重建画布。
            </p>
          </div>
        </div>
        <div v-else class="code-editor">
          <div class="line-numbers">
            <span v-for="line in code.split('\n').length" :key="line">{{
              line
            }}</span>
          </div>
          <textarea
            v-model="code"
            spellcheck="false"
            aria-label="Modelica 源码编辑器"
          ></textarea>
        </div>
        <div class="bottom-panel">
          <div class="bottom-tabs">
            <button
              :class="{ active: bottomTab === 'problems' }"
              @click="bottomTab = 'problems'"
            >
              问题 <b>{{ diagnostics.length }}</b></button
            ><button
              :class="{ active: bottomTab === 'output' }"
              @click="bottomTab = 'output'"
            >
              检查输出</button
            ><button
              :class="{ active: bottomTab === 'runs' }"
              @click="bottomTab = 'runs'"
            >
              运行历史</button
            ><PanelBottomClose :size="16" />
          </div>
          <div v-if="bottomTab === 'problems'" class="problems">
            <div v-if="!diagnostics.length" class="ide-empty">
              <CheckCircle2 :size="18" />未发现基础语法与结构问题
            </div>
            <button v-for="item in diagnostics" :key="item.code + item.line">
              <AlertTriangle :size="15" :class="item.severity" /><span>{{
                item.text
              }}</span
              ><code>{{ item.code }}</code
              ><small>第{{ item.line }}行</small>
            </button>
          </div>
          <pre
            v-else-if="bottomTab === 'output'"
            class="compile-output"
          ><code>{{output || compileOutput(analysis)}}</code></pre>
          <div v-else class="problems">
            <div v-if="!project.runs?.length" class="ide-empty">
              尚未运行实验
            </div>
            <button
              v-for="item in project.runs"
              :key="item.id"
              @click="
                router.push({
                  path: `/modelica/runs/${project.id}`,
                  query: { run: item.id },
                })
              "
            >
              <CheckCircle2 :size="15" /><span>{{ item.label }}</span
              ><code>{{ item.status }}</code
              ><small>{{
                new Date(item.createdAt).toLocaleString("zh-CN")
              }}</small>
            </button>
          </div>
        </div>
      </section>
      <aside class="model-inspector">
        <div class="panel-title">
          <span>属性与流程</span><Settings2 :size="15" />
        </div>
        <div class="class-badge">
          <Boxes />
          <div>
            <small>model</small
            ><strong>{{ analysis.modelName || project.template }}</strong>
          </div>
        </div>
        <dl>
          <div>
            <dt>元件</dt>
            <dd>{{ design.nodes.length }}</dd>
          </div>
          <div>
            <dt>连线</dt>
            <dd>{{ design.links.length }}</dd>
          </div>
          <div>
            <dt>方程</dt>
            <dd>{{ modelStats.equations }}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>
              <i
                class="status"
                :class="
                  diagnostics.some((item) => item.severity === 'error')
                    ? 'danger'
                    : 'success'
                "
                >{{
                  diagnostics.some((item) => item.severity === "error")
                    ? "有错误"
                    : "可运行"
                }}</i
              >
            </dd>
          </div>
        </dl>
        <div class="inspector-section">
          <strong>选中元件</strong
          ><template v-if="selectedNode"
            ><label
              >名称<input
                v-model="selectedNode.label"
                @change="persistDesign" /></label
            ><label
              >类型 <span>{{ selectedNode.kind }}</span></label
            ><label v-for="(value, key) in selectedNode.parameters" :key="key"
              >{{ key
              }}<input
                type="number"
                :value="value"
                @input="updateNodeParameter($event, String(key))" /></label
            ><button
              class="button secondary small"
              :class="{ active: connectFrom }"
              @click="connectFrom = selectedNode.id"
            >
              <Link2 :size="14" />从此元件连线</button
            ><button class="button secondary small" @click="removeNode">
              <X :size="14" />删除元件
            </button></template
          >
          <p v-else>在画布中选择元件以编辑属性。</p>
        </div>
        <div class="inspector-section">
          <strong>元件算法</strong>
          <p v-if="selectedNode">
            {{ nodeAlgorithm?.enabled ? "已保存" : "草稿未保存" }} ·
            仅保存为模型设计说明，不会执行任意脚本。
          </p>
          <textarea
            v-model="algorithmDraft"
            :disabled="!selectedNode"
            placeholder="algorithm\n  // 在接入 omc 后执行受控 Modelica 算法"
          ></textarea
          ><button
            class="button secondary small"
            :disabled="!selectedNode"
            @click="saveAlgorithm"
          >
            <Save :size="14" />保存算法草稿
          </button>
        </div>
        <div class="inspector-section">
          <strong>连线管理</strong>
          <p v-if="!design.links.length">尚未创建连线。</p>
          <button
            v-for="link in design.links"
            :key="link.id"
            class="button secondary small"
            @click="removeLink(link.id)"
          >
            <X :size="14" />{{
              design.nodes.find((item) => item.id === link.from)?.label
            }}
            → {{ design.nodes.find((item) => item.id === link.to)?.label }}（{{
              link.type === "physical" ? "物理" : "信号"
            }}）
          </button>
        </div>
        <div class="inspector-section">
          <strong>实验流程</strong
          ><label
            >起始
            <input
              v-model.number="experiment.startTime"
              type="number"
              step="any" /></label
          ><label
            >结束
            <input
              v-model.number="experiment.stopTime"
              type="number"
              step="any" /></label
          ><label
            >间隔
            <input
              v-model.number="experiment.interval"
              type="number"
              min="0.0001"
              step="any" /></label
          ><label
            >求解器<select v-model="experiment.solver">
              <option>RK4</option>
              <option>Euler</option>
            </select></label
          ><label v-for="item in parameters" :key="item.name"
            >{{ item.name
            }}<input
              type="number"
              :value="parameterValues[item.name]"
              @input="numberInput($event, item.name)"
              @change="save" /></label
          ><button class="button secondary small" @click="resetParameters">
            恢复参数默认值
          </button>
        </div>
      </aside>
    </div>
  </div>

  <div v-else-if="runPage" class="page modelica-result">
    <div class="container">
      <div class="breadcrumb">
        <NuxtLink to="/modelica/projects">Modelica 项目</NuxtLink
        ><ChevronRight :size="14" /><span>{{ project?.name }}</span
        ><ChevronRight :size="14" /><span>运行结果</span>
      </div>
      <template v-if="currentRun"
        ><header class="result-header">
          <div>
            <span
              class="status-badge"
              :class="currentRun.status === 'SUCCEEDED' ? 'success' : 'danger'"
              ><CheckCircle2 :size="16" />{{
                currentRun.status === "SUCCEEDED" ? "仿真成功" : "仿真失败"
              }}</span
            >
            <h1>{{ project?.template }} · {{ currentRun.label }}</h1>
            <p>
              {{ currentRun.id }} · {{ currentRun.engine }} ·
              {{ currentRun.experiment.solver }}
            </p>
          </div>
          <button
            class="button"
            :disabled="!currentRun.time.length"
            @click="exportRun"
          >
            <Download :size="16" />导出 CSV
          </button>
        </header>
        <section class="summary-grid">
          <div>
            <small>积分区间</small
            ><strong
              >{{ currentRun.experiment.startTime }}–{{
                currentRun.experiment.stopTime
              }}
              s</strong
            >
          </div>
          <div>
            <small>输出点</small
            ><strong>{{ currentRun.summary.points }}</strong>
          </div>
          <div>
            <small>求解步数</small
            ><strong>{{ currentRun.summary.steps }}</strong>
          </div>
          <div>
            <small>事件</small><strong>{{ currentRun.summary.events }}</strong>
          </div>
          <div>
            <small>最大绝对值</small
            ><strong>{{
              currentRun.summary.maximum?.toPrecision(5) ?? "—"
            }}</strong>
          </div>
        </section>
        <div v-if="currentRun.status === 'SUCCEEDED'" class="model-result-grid">
          <aside class="variable-tree">
            <div class="page-search inline">
              <Search :size="15" /><input
                v-model="variableSearch"
                placeholder="筛选变量"
              />
            </div>
            <strong><ChevronDown :size="14" />{{ project?.template }}</strong
            ><label
              v-for="(item, index) in filteredRunVariables"
              :key="item.name"
              ><input
                type="checkbox"
                :checked="selectedVariables.includes(item.name)"
                @change="toggleVariable(item.name)"
              /><i :style="{ '--series': index ? '#18a999' : '#1769aa' }"></i
              >{{ item.name }} <small>{{ item.unit || "—" }}</small></label
            >
            <p>最多同时绘制两条曲线。</p>
          </aside>
          <section class="model-chart">
            <div class="result-chart-head">
              <div>
                <h2>后处理工作台</h2>
                <p>
                  {{
                    plotVariables.map((item) => item.name).join(" / ") ||
                    "选择变量以查看曲线"
                  }}
                </p>
              </div>
              <div class="view-toggle">
                <button
                  :class="{ active: resultTab === 'curve' }"
                  @click="resultTab = 'curve'"
                >
                  曲线</button
                ><button
                  :class="{ active: resultTab === 'table' }"
                  @click="resultTab = 'table'"
                >
                  数据表</button
                ><button
                  :class="{ active: resultTab === 'statistics' }"
                  @click="resultTab = 'statistics'"
                >
                  统计
                </button>
              </div>
            </div>
            <div class="post-toolbar">
              <label
                >开始
                <input
                  v-model.number="timeStart"
                  type="number"
                  :min="currentRun.time[0]"
                  :max="currentRun.time.at(-1)"
                  step="any" /></label
              ><label
                >结束
                <input
                  v-model.number="timeStop"
                  type="number"
                  :min="currentRun.time[0]"
                  :max="currentRun.time.at(-1)"
                  step="any" /></label
              ><button class="button secondary small" @click="addDerivative">
                <SlidersHorizontal :size="14" />新增导数量
              </button>
            </div>
            <DataChart
              v-if="resultTab === 'curve' && plotVariables.length"
              :x="processedTime"
              :y="plotVariables[0]?.values ?? []"
              :y2="plotVariables[1]?.values"
              :label="`${plotVariables[0]?.name}/${plotVariables[0]?.unit || '—'}`"
              :label2="
                plotVariables[1]
                  ? `${plotVariables[1].name}/${plotVariables[1].unit || '—'}`
                  : undefined
              "
            />
            <div v-else-if="resultTab === 'table'" class="data-table">
              <div>
                <strong>time</strong
                ><strong v-for="item in plotVariables" :key="item.name"
                  >{{ item.name }} / {{ item.unit }}</strong
                >
              </div>
              <div
                v-for="(time, index) in processedTime.slice(0, 200)"
                :key="index"
              >
                <span>{{ time.toPrecision(6) }}</span
                ><span v-for="item in plotVariables" :key="item.name">{{
                  item.values[index]?.toPrecision(7)
                }}</span>
              </div>
            </div>
            <div v-else-if="resultTab === 'statistics'" class="post-stats">
              <div>
                <small>采样窗口</small
                ><strong>{{ processedTime.length }} 点</strong>
              </div>
              <div>
                <small>最小值</small><strong>{{ seriesStats.min }}</strong>
              </div>
              <div>
                <small>最大值</small><strong>{{ seriesStats.max }}</strong>
              </div>
              <div>
                <small>平均值</small><strong>{{ seriesStats.mean }}</strong>
              </div>
              <div>
                <small>终值</small><strong>{{ seriesStats.final }}</strong>
              </div>
            </div>
            <div v-else class="ide-empty">选择一个变量以显示曲线</div>
          </section>
          <aside class="run-properties">
            <div class="panel-title">变量属性</div>
            <strong>{{ selectedProperty?.name || "—" }}</strong>
            <dl>
              <div>
                <dt>类型</dt>
                <dd>Real</dd>
              </div>
              <div>
                <dt>单位</dt>
                <dd>{{ selectedProperty?.unit || "—" }}</dd>
              </div>
              <div>
                <dt>最小值</dt>
                <dd>{{ seriesStats.min }}</dd>
              </div>
              <div>
                <dt>最大值</dt>
                <dd>{{ seriesStats.max }}</dd>
              </div>
              <div>
                <dt>终值</dt>
                <dd>{{ seriesStats.final }}</dd>
              </div>
            </dl>
            <div class="inspector-section">
              <strong>参数快照</strong>
              <p v-for="(value, key) in currentRun.parameters" :key="key">
                {{ key }} = {{ value }}
              </p>
            </div>
          </aside>
        </div>
        <section class="result-content">
          <h2>求解摘要</h2>
          <div class="inline-alert success">
            <CheckCircle2 :size="18" /><span>{{
              currentRun.messages.join(" ")
            }}</span>
          </div>
          <div class="repro-id">
            <span>可复现标识</span
            ><code
              >{{ currentRun.engine }} · {{ currentRun.id }} ·
              {{ currentRun.createdAt }}</code
            ><button @click="copyIdentifier">
              <Copy :size="15" />{{ copied ? "已复制" : "复制" }}
            </button>
          </div>
        </section></template
      >
      <section v-else class="result-content">
        <h1>尚无运行结果</h1>
        <p>请先打开项目，检查模型后运行一个实验。</p>
        <NuxtLink
          v-if="project"
          :to="`/modelica/projects/${project.id}/editor`"
          class="button"
          >打开编辑器</NuxtLink
        >
      </section>
    </div>
  </div>

  <div v-else-if="librariesPage" class="page">
    <section class="page-hero">
      <div class="container">
        <span class="kicker">COMPONENT LIBRARIES</span>
        <h1>Modelica 组件库</h1>
        <p>为画布建模准备的类型化组件目录。</p>
      </div>
    </section>
    <div class="container content-section">
      <div class="library-grid">
        <div v-for="library in libraries" :key="library.name">
          <div>
            <Library :size="24" /><span class="status success">已验证</span>
          </div>
          <h2>{{ library.name }}</h2>
          <p>{{ library.desc }}</p>
          <dl>
            <div>
              <dt>版本</dt>
              <dd>{{ library.version }}</dd>
            </div>
            <div>
              <dt>公开类</dt>
              <dd>{{ library.classes }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="templatesPage" class="page">
    <section class="page-hero">
      <div class="container">
        <span class="kicker">PROJECT TEMPLATES</span>
        <h1>示例项目与模板</h1>
        <p>每个模板附带画布、源码、实验与参考后处理流程。</p>
      </div>
    </section>
    <div class="container content-section">
      <div class="template-grid large">
        <div v-for="template in modelicaTemplates" :key="template.class">
          <div>
            <span>{{ template.type }}</span
            ><Boxes :size="28" />
          </div>
          <h2>{{ template.name }}</h2>
          <p>{{ template.desc }}</p>
          <small>{{ template.class }} · Modelica Lite</small
          ><button class="button" @click="useTemplate(template)">
            使用此模板
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="page">
    <div class="container not-found" role="status">
      <FileCode2 :size="40" /><span>404</span>
      <h1>没有找到这个 Modelica 页面</h1>
      <p>请从项目、模板或组件库入口继续。</p>
      <NuxtLink to="/modelica" class="button">返回 Modelica 工作台</NuxtLink>
    </div>
  </div>
  <div v-if="newDialog" class="modal-backdrop" @click.self="newDialog = false">
    <form class="dialog-card" @submit.prevent="create">
      <div>
        <h2>新建 Modelica 项目</h2>
        <button type="button" class="icon-button" @click="newDialog = false">
          ×
        </button>
      </div>
      <label>项目名称<input v-model="newName" required maxlength="60" /></label
      ><label
        >可运行模板<select v-model="newTemplate">
          <option
            v-for="template in modelicaTemplates"
            :key="template.class"
            :value="template.class"
          >
            {{ template.name }}（{{ template.class }}）
          </option>
        </select></label
      >
      <footer>
        <button
          type="button"
          class="button secondary"
          @click="newDialog = false"
        >
          取消</button
        ><button class="button">创建并打开</button>
      </footer>
    </form>
  </div>
</template>
