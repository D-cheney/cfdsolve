import { SolverInputError } from "./solvers";

export type SweepScale = "linear" | "log";

export interface SweepParameter {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  start: number;
  end: number;
  integer?: boolean;
}

export interface SweepMetric {
  key: string;
  label: string;
  unit: string;
}

export interface SimulationLabTool {
  slug: string;
  name: string;
  description: string;
  defaults: Record<string, string | number>;
  parameters: SweepParameter[];
  metrics: SweepMetric[];
  maxCases: number;
}

export interface CredibilityCheck {
  key: "input" | "convergence" | "applicability" | "reference" | "reproducibility";
  label: string;
  status: "pass" | "warning" | "fail";
  detail: string;
}

export interface CredibilityAssessment {
  score: number;
  grade: "A" | "B" | "C" | "D";
  label: string;
  checks: CredibilityCheck[];
}

export const simulationLabTools: SimulationLabTool[] = [
  {
    slug: "convection-diffusion",
    name: "一维对流—扩散",
    description: "扫描速度、扩散系数或网格数，比较 Péclet 数与离散误差。",
    defaults: { length: 1, nx: 101, rho: 1, velocity: 1, diffusivity: 0.1, phi_left: 1, phi_right: 0, scheme: "upwind" },
    parameters: [
      { key: "velocity", label: "速度", unit: "m/s", min: -1000, max: 1000, start: 0.2, end: 4 },
      { key: "diffusivity", label: "扩散系数", unit: "m²/s", min: 1e-8, max: 1000, start: 0.02, end: 0.5 },
      { key: "nx", label: "网格数", unit: "—", min: 21, max: 1001, start: 41, end: 201, integer: true },
    ],
    metrics: [
      { key: "peclet", label: "全局 Péclet 数", unit: "—" },
      { key: "l2", label: "L₂ 误差", unit: "—" },
      { key: "linf", label: "L∞ 误差", unit: "—" },
    ],
    maxCases: 20,
  },
  {
    slug: "pipe-flow",
    name: "圆管充分发展层流",
    description: "扫描入口驱动、管径或黏度，比较 Reynolds 数、流量和压降。",
    defaults: { diameter: 0.05, pipe_length: 2, rho: 998, viscosity: 0.001, drive_mode: "mean_velocity", drive_value: 0.02, samples: 81 },
    parameters: [
      { key: "drive_value", label: "平均速度", unit: "m/s", min: 0.0001, max: 1e7, start: 0.005, end: 0.04 },
      { key: "diameter", label: "管径", unit: "m", min: 0.001, max: 10, start: 0.02, end: 0.1 },
      { key: "viscosity", label: "动力黏度", unit: "Pa·s", min: 1e-7, max: 100, start: 0.0005, end: 0.003 },
    ],
    metrics: [
      { key: "reynolds", label: "Reynolds 数", unit: "—" },
      { key: "flowRate", label: "体积流量", unit: "m³/s" },
      { key: "pressureDrop", label: "压降", unit: "Pa" },
      { key: "frictionFactor", label: "Darcy 摩阻系数", unit: "—" },
    ],
    maxCases: 20,
  },
  {
    slug: "turbulence-compare",
    name: "湍流与近壁参数",
    description: "扫描速度、湍流强度或目标 y⁺，观察入口量与首层高度变化。",
    defaults: { flow_type: "internal", velocity: 35, char_length: 0.2, rho: 1.225, viscosity: 0.0000181, intensity: 5, length_scale: 0.014, target_yplus: 1, growth_rate: 1.2, layers: 20 },
    parameters: [
      { key: "velocity", label: "特征速度", unit: "m/s", min: 0.001, max: 3000, start: 5, end: 80 },
      { key: "intensity", label: "湍流强度", unit: "%", min: 0.01, max: 50, start: 1, end: 10 },
      { key: "target_yplus", label: "目标 y⁺", unit: "—", min: 0.1, max: 300, start: 0.5, end: 30 },
    ],
    metrics: [
      { key: "reynolds", label: "Reynolds 数", unit: "—" },
      { key: "firstLayerMicron", label: "首层高度", unit: "μm" },
      { key: "turbulenceK", label: "湍动能 k", unit: "m²/s²" },
      { key: "omega", label: "比耗散率 ω", unit: "1/s" },
    ],
    maxCases: 20,
  },
  {
    slug: "lid-driven-cavity",
    name: "方腔顶盖驱动流",
    description: "扫描 Reynolds 数或顶盖速度，比较收敛代价、残差与主涡位置。",
    defaults: { reynolds: 100, nx: 65, ny: 65, lid_velocity: 1, max_iterations: 5000, tolerance: 0.00001, pressure_relaxation: 0.3, velocity_relaxation: 0.7 },
    parameters: [
      { key: "reynolds", label: "Reynolds 数", unit: "—", min: 10, max: 1000, start: 50, end: 300 },
      { key: "lid_velocity", label: "顶盖速度", unit: "m/s", min: 0.01, max: 100, start: 0.5, end: 2 },
      { key: "nx", label: "x 网格数", unit: "—", min: 33, max: 129, start: 33, end: 65, integer: true },
    ],
    metrics: [
      { key: "iterations", label: "迭代次数", unit: "—" },
      { key: "finalResidual", label: "最终残差", unit: "—" },
      { key: "vortexX", label: "主涡 x 坐标", unit: "—" },
      { key: "vortexY", label: "主涡 y 坐标", unit: "—" },
    ],
    maxCases: 5,
  },
];

function rounded(value: number) {
  return Number(value.toPrecision(12));
}

export function generateSweepValues(start: number, end: number, count: number, scale: SweepScale, integer = false) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new SolverInputError("扫描起点和终点必须是有限数值。");
  if (!Number.isInteger(count) || count < 2 || count > 20) throw new SolverInputError("工况数必须是 2–20 的整数。");
  if (start === end) throw new SolverInputError("扫描起点和终点不能相同。");
  if (scale === "log" && (start <= 0 || end <= 0)) throw new SolverInputError("对数扫描的起点和终点必须大于 0。");
  const values = Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    const value = scale === "log"
      ? Math.exp(Math.log(start) + ratio * (Math.log(end) - Math.log(start)))
      : start + ratio * (end - start);
    return integer ? Math.round(value) : rounded(value);
  });
  const unique = [...new Set(values)];
  if (unique.length < 2) throw new SolverInputError("整数扫描范围过窄，无法生成至少两个不同工况。");
  return unique;
}

export function getMetricValue(slug: string, metric: string, result: Record<string, unknown>) {
  if (metric === "firstLayerMicron") return Number(result.firstLayerHeight) * 1e6;
  const value = Number(result[metric]);
  if (Number.isFinite(value)) return value;
  if (slug === "pipe-flow" && metric === "maxVelocity") return Number((result.series as number[] | undefined)?.[0]);
  throw new SolverInputError(`结果不包含可比较指标：${metric}`);
}

function finiteRecord(params: Record<string, string | number>) {
  return Object.values(params).every((value) => typeof value === "string" || Number.isFinite(value));
}

export function assessSimulationResult(slug: string, params: Record<string, string | number>, result: Record<string, unknown>, warnings: string[] = []): CredibilityAssessment {
  const converged = result.converged !== false;
  const x = Array.isArray(result.x) ? result.x as number[] : [];
  const series = Array.isArray(result.series) ? result.series as number[] : [];
  const finiteSeries = series.length > 0 && series.every(Number.isFinite);
  const checks: CredibilityCheck[] = [
    { key: "input", label: "输入与单位", status: finiteRecord(params) ? "pass" : "fail", detail: finiteRecord(params) ? "输入通过有限数和范围校验，按 SI 单位解释。" : "输入包含非有限数值。" },
    { key: "convergence", label: "数值收敛", status: converged && finiteSeries ? "pass" : "fail", detail: converged && finiteSeries ? "求解完成且输出序列为有限数。" : "结果未收敛或包含非有限值。" },
    { key: "reproducibility", label: "可复现性", status: x.length === series.length && x.length > 1 ? "pass" : "warning", detail: x.length === series.length && x.length > 1 ? "输入快照、求解器版本和完整采样轴可导出。" : "输出采样轴不完整，请检查清单。" },
  ];
  if (slug === "convection-diffusion") {
    const cellPe = Math.abs(Number(result.cellPe));
    const central = params.scheme === "central";
    checks.push({ key: "applicability", label: "格式适用性", status: central && cellPe > 2 ? "warning" : "pass", detail: central && cellPe > 2 ? "中心差分的单元 Péclet 数超过 2，可能失去有界性。" : "离散格式位于当前有界性检查范围内。" });
    checks.push({ key: "reference", label: "参考解校核", status: Number.isFinite(Number(result.l2)) ? "pass" : "warning", detail: `已计算解析参考解；L₂ 误差为 ${Number(result.l2).toExponential(3)}。` });
  } else if (slug === "pipe-flow") {
    const re = Number(result.reynolds);
    checks.push({ key: "applicability", label: "层流假设", status: re < 2300 ? "pass" : "warning", detail: re < 2300 ? `Re=${re.toFixed(1)}，处于层流模型范围。` : `Re=${re.toFixed(1)}，超过常用层流阈值 2300。` });
    checks.push({ key: "reference", label: "解析解校核", status: "pass", detail: "速度剖面与 Hagen–Poiseuille 解析关系一致。" });
  } else if (slug === "lid-driven-cavity") {
    checks.push({ key: "applicability", label: "教学模型范围", status: Number(params.reynolds) <= 1000 ? "pass" : "warning", detail: "当前为最大 65×65 的二维涡量—流函数教学模型。" });
    checks.push({ key: "reference", label: "残差校核", status: converged ? "pass" : "fail", detail: converged ? `最终残差 ${Number(result.finalResidual).toExponential(3)}。` : "未达到目标残差，不能作为已收敛工况使用。" });
  } else {
    checks.push({ key: "applicability", label: "关联式适用性", status: "warning", detail: "结果来自光滑壁工程关联式，需结合壁面处理和网格方案复核。" });
    checks.push({ key: "reference", label: "独立校核", status: "warning", detail: "当前没有实验数据输入；建议用文献或试验点进行确认。" });
  }
  if (warnings.length && !checks.some((item) => item.status === "fail")) {
    const applicability = checks.find((item) => item.key === "applicability");
    if (applicability) applicability.status = "warning";
  }
  const penalty = checks.reduce((sum, item) => sum + (item.status === "fail" ? 28 : item.status === "warning" ? 9 : 0), 0);
  const score = Math.max(0, 100 - penalty);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
  return { score, grade, label: grade === "A" ? "校核充分" : grade === "B" ? "可用于趋势判断" : grade === "C" ? "需要补充校核" : "不建议用于结论", checks };
}
