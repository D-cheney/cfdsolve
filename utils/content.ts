export const articles = [
  { slug: 'navier-stokes', title: '从连续方程到 Navier–Stokes 方程', category: '控制方程与物理建模', level: '入门', read: '12 分钟', summary: '从质量与动量守恒出发，建立不可压缩流动的控制方程，并解释每一项的物理意义。', tags: ['控制方程', '不可压缩流'] },
  { slug: 'finite-volume', title: '有限体积法：守恒离散的核心思路', category: '数值离散方法', level: '进阶', read: '18 分钟', summary: '理解控制体积分、面通量和离散系数，建立从方程到可计算矩阵的完整联系。', tags: ['FVM', '离散'] },
  { slug: 'simple-method', title: 'SIMPLE 压力—速度耦合算法', category: '压力—速度耦合', level: '进阶', read: '16 分钟', summary: '推导压力修正方程，理解欠松弛、质量守恒与收敛判据。', tags: ['SIMPLE', '压力修正'] },
  { slug: 'wall-y-plus', title: 'y⁺、首层网格与近壁面处理', category: '网格与近壁面处理', level: '工程', read: '14 分钟', summary: '从壁面尺度出发选择目标 y⁺，估算首层高度，并识别壁函数使用中的常见误区。', tags: ['y+', '网格'] },
  { slug: 'verification-validation', title: '验证、确认与网格无关性分析', category: '验证、确认与误差分析', level: '工程', read: '20 分钟', summary: '区分代码验证、解验证与模型确认，使用 GCI 给出可复核的不确定度。', tags: ['V&V', 'GCI'] },
  { slug: 'turbulence-models', title: '工程湍流模型选择指南', category: '湍流模型', level: '进阶', read: '15 分钟', summary: '比较 k–ε、Realizable k–ε 与 k–ω SST 的适用边界、近壁要求和风险。', tags: ['湍流', 'RANS'] }
]

export const algorithms = [
  { name: 'SIMPLE', use: '稳态不可压缩流', order: '一阶迭代', stability: '稳健', cost: '中', limitation: '欠松弛敏感' },
  { name: 'PISO', use: '瞬态压力—速度耦合', order: '多校正', stability: '较高', cost: '中高', limitation: '单步计算量较大' },
  { name: 'Rhie–Chow', use: '同位网格压力插值', order: '二阶兼容', stability: '抑制棋盘格', cost: '低', limitation: '需保持离散一致性' },
  { name: 'QUICK', use: '对流项高精度离散', order: '三阶/二阶', stability: '条件稳定', cost: '中', limitation: '非结构网格实现复杂' },
  { name: 'GMRES', use: '非对称线性系统', order: 'Krylov', stability: '依赖预条件', cost: '中高', limitation: '内存随子空间增长' }
]

export const formulas = [
  { name: '雷诺数', latex: 'Re = \\rho U L / \\mu', plain: 'Re = ρUL/μ', category: '无量纲数', note: '惯性力与黏性力之比' },
  { name: 'Péclet 数', latex: 'Pe = uL / \\alpha', plain: 'Pe = uL/α', category: '无量纲数', note: '对流输运与扩散输运之比' },
  { name: '连续性方程', latex: '\\nabla \\cdot \\mathbf{u}=0', plain: '∇·u = 0', category: '控制方程', note: '不可压缩流质量守恒' },
  { name: '壁面摩擦速度', latex: 'u_\\tau = \\sqrt{\\tau_w/\\rho}', plain: 'uτ = √(τw/ρ)', category: '湍流', note: '近壁面尺度的基础量' },
  { name: 'CFL 数', latex: 'C = u\\Delta t/\\Delta x', plain: 'C = uΔt/Δx', category: '数值稳定性', note: '时间推进与网格尺度关系' }
]

export const tools = [
  { slug: 'workbench', name: '二维流场全流程仿真', type: '建模 · 网格 · 求解', level: '进阶', time: '约 1–3 秒', status: '稳定', description: '依次完成物理建模、结构化网格、边界设置、迭代求解和流场后处理。' }
]

export const forumTopics = [
  { id: '1001', title: '方腔流 Re=100 时中心线速度偏差如何定位？', section: '理论与算法', replies: 18, views: 1264, status: '已解决', time: '12 分钟前' },
  { id: '1002', title: 'SST 模型目标 y⁺=1，首层高度应如何迭代？', section: '工程案例', replies: 11, views: 842, status: '精华', time: '36 分钟前' },
  { id: '1003', title: 'Modelica 初始化中的结构奇异诊断', section: 'Modelica', replies: 9, views: 510, status: '讨论中', time: '1 小时前' },
  { id: '1004', title: 'OpenFOAM 中非正交修正次数的选择', section: 'OpenFOAM', replies: 7, views: 690, status: '讨论中', time: '2 小时前' },
  { id: '1005', title: '网格无关性分析结果如何写进验证报告？', section: '论文与资料', replies: 14, views: 1120, status: '精华', time: '昨天' }
]

export const defaultModelicaCode = `within Examples;
model MassSpringDamper
  parameter Real m(unit="kg") = 1.0;
  parameter Real k(unit="N/m") = 100.0;
  parameter Real c(unit="N.s/m") = 0.5;
  Real x(start=0.1, unit="m");
  Real v(start=0, unit="m/s");
equation
  der(x) = v;
  m * der(v) + c * v + k * x = 0;
end MassSpringDamper;`

export const modelicaTemplates = [
  { name: '质量—弹簧—阻尼', type: '机械', desc: '二阶线性系统与参数化实验', class: 'MassSpringDamper', source: defaultModelicaCode },
  { name: '双容腔热网络', type: '热学', desc: '热容、热阻与阶跃响应', class: 'ThermalNetwork', source: `within Examples;
model ThermalNetwork
  parameter Real C1(unit="J/K") = 1200;
  parameter Real C2(unit="J/K") = 900;
  parameter Real R(unit="K/W") = 0.8;
  parameter Real Q(unit="W") = 120;
  Real T1(start=293.15, unit="K");
  Real T2(start=293.15, unit="K");
equation
  C1 * der(T1) = Q - (T1 - T2) / R;
  C2 * der(T2) = (T1 - T2) / R;
end ThermalNetwork;` },
  { name: '液压容腔与管路', type: 'Fluid0D', desc: '可压缩容腔与管路阻力', class: 'HydraulicCircuit', source: `within Examples;
model HydraulicCircuit
  parameter Real C(unit="m3/Pa") = 0.02;
  parameter Real R(unit="Pa.s/m3") = 1.8;
  parameter Real pIn(unit="Pa") = 100;
  Real p(start=0, unit="Pa");
  Real q(unit="m3/s");
equation
  C * der(p) = (pIn - p) / R;
  q = (pIn - p) / R;
end HydraulicCircuit;` },
  { name: '单轴转子系统', type: 'AeroEngine', desc: '转动惯量、负载与阻尼响应', class: 'SingleSpool', source: `within Examples;
model SingleSpool
  parameter Real J(unit="kg.m2") = 2.5;
  parameter Real d(unit="N.m.s") = 0.12;
  parameter Real tauDrive(unit="N.m") = 18;
  parameter Real tauLoad(unit="N.m") = 5;
  Real omega(start=0, unit="rad/s");
equation
  J * der(omega) = tauDrive - tauLoad - d * omega;
end SingleSpool;` }
] as const

export function getModelicaTemplate(modelClass: string) {
  return modelicaTemplates.find(template => template.class === modelClass) ?? modelicaTemplates[0]
}
