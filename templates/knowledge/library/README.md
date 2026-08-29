# 流研工坊知识库总索引

本目录是可直接导入流研工坊 SQLite 知识库的文章源文件。每篇非 `README.md` 文件都是一个独立知识块，采用 `flowlab-knowledge/1.0` Front Matter；目录中的 `README.md` 仅用于人工导航，不参与批量导入。

站内可阅读的导航文章：[流研工坊知识库导航与学习路线](knowledge-library-roadmap.md)。

## 专题地图

| 序号 | 专题 | 重点内容 | 建议前置 |
|---|---|---|---|
| 01 | [CFD 基础](01-foundations/README.md) | 问题定义、物性与单位、无量纲数、控制方程 | 无 |
| 02 | [数值方法](02-numerical-methods/README.md) | 有限体积、对流格式、压力速度耦合、时间步与收敛 | CFD 基础 |
| 03 | [网格](03-mesh/README.md) | 拓扑、质量、边界层、网格无关性 | 数值方法 |
| 04 | [边界与初始化](04-boundary-conditions/README.md) | 入口、出口、壁面、对称周期与压力基准 | CFD 基础 |
| 05 | [湍流建模](05-turbulence/README.md) | RANS、k-ε、k-ω SST、壁面处理、LES | 网格、边界条件 |
| 06 | [传热与可压缩流](06-heat-compressible/README.md) | 能量方程、共轭传热、辐射、激波 | 控制方程、数值方法 |
| 07 | [多相与组分输运](07-multiphase-species/README.md) | 模型选择、VOF、颗粒、空化、组分 | 网格、瞬态方法 |
| 08 | [验证、确认与后处理](08-vv-postprocessing/README.md) | 守恒、GCI、不确定度、力系数与报告 | 完成一个计算案例 |
| 09 | [Modelica](09-modelica/README.md) | 方程式建模、连接器、初始化、事件与 CFD 耦合 | 动态系统基础 |
| 10 | [CAE 算法全景图](10-cae-algorithm-map/README.md) | 全物理域、离散、求解、耦合、优化与可信度分类 | 数值方法基础 |
| 11 | [结构与有限元](11-structural-fem/README.md) | 弱式、线弹性、非线性塑性接触、动力学 | 连续介质与线性代数 |
| 12 | [代数求解与时间算法](12-solvers-time/README.md) | Krylov、预条件、Newton、特征值、ODE/DAE | 线性代数与微分方程 |
| 13 | [跨物理场离散](13-physics-discretization/README.md) | 电磁、声学、SPH、DEM、LBM、MPM、BEM | PDE 与离散基础 |
| 14 | [多物理场耦合](14-multiphysics-coupling/README.md) | 单体/分区、FSI、松弛与守恒映射 | 至少两个单场专题 |
| 15 | [优化、不确定性与降阶](15-optimization-uq-rom/README.md) | 伴随、拓扑优化、UQ、POD 与 DMD | 求解器与 V&V |

扩展知识库：[OpenFOAM 工程知识](../openfoam/README.md) · [OpenFOAM 14 源码专题](../openfoam-source-v14/README.md) · [OpenFOAM 14 逐文件源码解析](../openfoam-source-files-v14/README.md) · [Modelica 独立知识库](../modelica/README.md)。

## 推荐学习路线

1. 初学者：01 → 02 → 03 → 04 → 08；
2. 内流与传热：01 → 02 → 03 → 04 → 05 → 06 → 08；
3. 自由液面或颗粒：01 → 02 → 03 → 04 → 07 → 08；
4. 系统联合仿真：01 → 06 → 09 → 08。
5. 结构与非线性：10 → 11 → 12 → 08；
6. 电磁/声学/粒子方法：10 → 12 → 13 → 08；
7. 多物理优化：10 → 12 → 14 → 15 → 08。

## 批量校验与导入

```powershell
npm run knowledge:validate -- templates\knowledge\library
npm run knowledge:import -- templates\knowledge\library
```

再次导入相同 `slug` 会更新已有文章，不会创建重复记录。
