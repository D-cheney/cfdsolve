export const articles = [
  { slug: 'navier-stokes', title: '从连续方程到 Navier–Stokes 方程', category: '控制方程与物理建模', level: '入门', read: '12 分钟', summary: '从质量与动量守恒出发，建立不可压缩流动的控制方程，并解释每一项的物理意义。', tags: ['控制方程', '不可压缩流'] },
  { slug: 'finite-volume', title: '有限体积法：守恒离散的核心思路', category: '数值离散方法', level: '进阶', read: '18 分钟', summary: '理解控制体积分、面通量和离散系数，建立从方程到可计算矩阵的完整联系。', tags: ['FVM', '离散'] },
  { slug: 'simple-method', title: 'SIMPLE 压力—速度耦合算法', category: '压力—速度耦合', level: '进阶', read: '16 分钟', summary: '推导压力修正方程，理解欠松弛、质量守恒与收敛判据。', tags: ['SIMPLE', '压力修正'] },
  { slug: 'wall-y-plus', title: 'y⁺、首层网格与近壁面处理', category: '网格与近壁面处理', level: '工程', read: '14 分钟', summary: '从壁面尺度出发选择目标 y⁺，估算首层高度，并识别壁函数使用中的常见误区。', tags: ['y+', '网格'] },
  { slug: 'verification-validation', title: '验证、确认与网格无关性分析', category: '验证、确认与误差分析', level: '工程', read: '20 分钟', summary: '区分代码验证、解验证与模型确认，使用 GCI 给出可复核的不确定度。', tags: ['V&V', 'GCI'] },
  { slug: 'turbulence-models', title: '工程湍流模型选择指南', category: '湍流模型', level: '进阶', read: '15 分钟', summary: '比较 k–ε、Realizable k–ε 与 k–ω SST 的适用边界、近壁要求和风险。', tags: ['湍流', 'RANS'] }
]

export const knowledgeModules = [
  { id: 'foundations', name: '基础与控制方程', short: '从物理守恒建立模型', categories: ['流体力学基础', '控制方程与物理建模'], level: '起步', color: '#e65f18' },
  { id: 'numerics', name: '数值方法与求解器', short: '离散、耦合、稳定与收敛', categories: ['CFD 数值方法', '数值离散方法', '压力—速度耦合'], level: '进阶', color: '#a44b20' },
  { id: 'mesh', name: '网格与边界条件', short: '把计算域转化为可信离散系统', categories: ['网格与离散质量', '网格与近壁面处理', '边界条件与初始化'], level: '实践', color: '#c98543' },
  { id: 'physics', name: '工程物理模型', short: '湍流、传热、可压缩与多相流', categories: ['湍流与近壁建模', '湍流模型', '传热与可压缩流', '多相流与组分输运'], level: '工程', color: '#7f5140' },
  { id: 'verification', name: '验证与后处理', short: '误差、不确定度与结果解释', categories: ['验证确认与后处理', '验证、确认与误差分析'], level: '工程', color: '#8f684a' },
  { id: 'systems', name: 'Modelica 系统建模', short: '方程建模、连接与联合仿真', categories: ['Modelica 系统建模'], level: '拓展', color: '#775b51' }
]

export const learningPaths = [
  { id: 'cfd-zero-to-case', name: 'CFD 从零到首个可信算例', description: '按问题定义、离散、网格、求解和验证建立完整闭环。', audience: '初学者', duration: '约 6 小时', modules: ['foundations', 'numerics', 'mesh', 'verification'] },
  { id: 'turbulence-practice', name: '湍流与近壁工程实践', description: '从 Reynolds 数、模型选择到 y⁺ 与网格无关性检查。', audience: '工程用户', duration: '约 4 小时', modules: ['foundations', 'mesh', 'physics', 'verification'] },
  { id: 'multiphysics-modeling', name: '多物理系统建模', description: '连接 CFD 物理知识与 Modelica 动态系统表达。', audience: '进阶用户', duration: '约 3 小时', modules: ['foundations', 'physics', 'systems'] }
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
  { slug: 'convection-diffusion', name: '一维对流—扩散', type: '稳态 · 1D', level: '入门', time: '< 1 秒', status: '稳定', description: '比较迎风与中心差分，观察 Péclet 数对数值解的影响。' },
  { slug: 'lid-driven-cavity', name: '方腔顶盖驱动流基准演示', type: '稳态 · 2D', level: '进阶', time: '约 3 秒', status: '演示', description: '基于公开基准趋势演示压力—速度耦合、残差和后处理流程，不替代工程求解器。' },
  { slug: 'pipe-flow', name: '圆管充分发展层流', type: '解析 · 1D', level: '入门', time: '< 1 秒', status: '稳定', description: '计算速度剖面、流量、压降、壁面剪切与摩擦因子。' },
  { slug: 'turbulence-compare', name: '湍流与近壁参数对比', type: '工程估算', level: '工程', time: '< 1 秒', status: '稳定', description: '估算 k、ε、ω、首层高度并对比常见 RANS 模型。' }
]

export const caeTools = [
  { slug: 'axial-bar', name: '轴向杆静力分析', discipline: '结构静力', dimension: '1D', level: '入门', description: '实际组装杆单元刚度矩阵，计算位移、应力、应变、反力与平衡误差。' },
  { slug: 'cantilever-beam', name: '悬臂梁弯曲分析', discipline: '结构静力', dimension: '1D 梁', level: '进阶', description: '采用 Euler–Bernoulli 梁单元，求解挠度、转角、弯矩并与解析解核对。' },
  { slug: 'heat-plate', name: '二维稳态热传导', discipline: '热分析', dimension: '2D', level: '进阶', description: '在规则网格上迭代求解温度场，输出热流、能量平衡和收敛历史。' },
  { slug: 'sdof-modal', name: '单自由度模态分析', discipline: '模态分析', dimension: '0D / 系统', level: '入门', description: '由质量与刚度求解固有频率、周期和质量归一化振型。' }
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
