---
template_version: "flowlab-knowledge/1.0"
slug: cae-algorithm-taxonomy
title: CAE 算法全景图：物理模型、离散、求解与可信度
summary: 建立覆盖 CFD、结构、热、电磁、声学、多体、粒子法、多物理耦合、优化、降阶和不确定性量化的 CAE 算法分类，说明每层输入输出、选择条件与验证责任。
category:
  slug: cae-algorithm-map
  name: CAE 算法全景图
level: 专题
reading_minutes: 32
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [CAE, 算法地图, 数值方法, 多物理场, 验证确认]
seo:
  title: CAE 全领域算法分类与学习地图｜CFD菜鸟
  description: 从连续模型到离散、代数求解、耦合、优化和 V&V 的完整 CAE 算法地图。
  keywords: [CAE 算法, 有限元, 有限体积, 多物理场, 数值求解]
---

# CAE 算法全景图：物理模型、离散、求解与可信度

CAE 不是某一种求解器，而是从物理假设到工程决策的一条算法链。任何计算都可写成：连续模型 $\mathcal{L}(u;\mu)=f$，空间离散 $R_h(U;\mu)=0$，代数或时间求解，最后进行误差与不确定性评估。所谓“覆盖全部算法”，应理解为覆盖这条链上的主流算法族、适用条件与验证方法；厂商专有实现和持续出现的论文变体不能被一个静态清单穷尽。

## 1. 五层统一框架

$$
\text{物理守恒/变分原理}\rightarrow\text{空间离散}\rightarrow\text{代数求解}\rightarrow\text{耦合与优化}\rightarrow\text{V\&V/UQ}
$$

1. **物理层**：质量、动量、能量、电荷、角动量、熵增与材料本构；
2. **离散层**：FDM、FVM、FEM、DG、谱方法、BEM、LBM、SPH、DEM、MPS、无网格法；
3. **求解层**：直接法、Krylov、Multigrid、Newton、拟 Newton、线搜索、信赖域、特征值和时间积分；
4. **系统层**：单体/分区耦合、网格映射、协同仿真、灵敏度、伴随、优化、ROM；
5. **可信度层**：代码验证、解验证、网格/时间步收敛、确认、参数/模型不确定性与风险传播。

## 2. 物理域算法覆盖矩阵

| 领域 | 连续模型 | 主要离散与算法 | 典型输出 |
|---|---|---|---|
| 固体与结构 | 线弹性、超弹性、塑性、黏弹、蠕变、损伤、断裂 | 位移/混合 FEM、壳梁单元、XFEM、相场、接触、显式动力学 | 位移、应力、屈曲、疲劳寿命 |
| 结构动力学 | $M\ddot u+C\dot u+Ku=f$ | 模态叠加、Newmark、广义-$\alpha$、中心差分、谱分析 | 固有频率、FRF、冲击响应 |
| CFD | Navier–Stokes、Euler、RANS/LES/DNS、多相/反应 | FVM、FEM、DG、谱元、LBM；SIMPLE/PISO/耦合压力法 | 流量、压降、力、热流、组分 |
| 热 | 导热、对流、辐射、相变 | FEM/FVM、焓法、视角系数、DOM、P1、Monte Carlo | 温度、热流、热应力 |
| 电磁 | Maxwell、静电、磁静、涡流、波动 | $H^1$、$H(\mathrm{curl})$、$H(\mathrm{div})$ FEM，FDTD、MoM、BEM | 场强、损耗、阻抗、S 参数 |
| 声学 | Helmholtz、线化 Euler、波动方程 | FEM、BEM、DG、FDTD、PML、模态法 | 声压、声功率、传递损失 |
| 多体系统 | Newton–Euler、约束 DAE、柔性体 | 递归牛顿欧拉、绝对节点坐标、坐标分割、BDF | 轨迹、关节力、控制响应 |
| 颗粒/离散介质 | 接触动力学、Boltzmann、核积分 | DEM、LBM、SPH、MPS、DPM、PIC/MPM | 颗粒流、自由面、冲击和破坏 |
| 地学与渗流 | Darcy、Biot、多孔介质、多场反应输运 | 混合 FEM、FVM、有限差分、离散裂缝、迭代分裂 | 压力、饱和度、沉降、产量 |

## 3. 空间离散算法族

- **有限差分 FDM**：Taylor 展开得到差分模板；规则网格高效，边界与复杂几何处理较弱。
- **有限体积 FVM**：对控制体积分并以面通量闭合；局部守恒突出，是工业 CFD 主力。
- **有限元 FEM**：弱式、试验函数与分片多项式；适合复杂几何、结构和多物理变分问题。
- **间断 Galerkin DG**：单元内高阶、界面数值通量；兼具高阶、局部守恒与并行性。
- **谱/谱元方法**：全局或单元内高阶正交基；光滑解呈指数型收敛，但间断处需滤波或捕捉。
- **边界元 BEM/MoM**：用基本解把维数降低一阶；适合无限域和线性均匀介质，矩阵通常稠密。
- **无网格/粒子法**：SPH、MPS、EFG、RBF、MPM；大变形和自由面有优势，一致性与边界修正关键。
- **格子 Boltzmann LBM**：离散速度空间演化分布函数；并行友好，低马赫与格子各向同性是主要约束。
- **离散元 DEM**：逐颗粒积分平动和转动，接触律闭合；时间步由最高接触频率限制。

## 4. 代数与非线性算法族

线性系统 $Ax=b$ 的方法按矩阵性质选择：SPD 系统优先 Cholesky/CG；对称不定用 LDL$^T$/MINRES；一般非对称用 LU/GMRES/BiCGStab。大规模计算的核心不是孤立的 Krylov 名称，而是预条件后的谱：

$$
M_L^{-1}AM_R^{-1}y=M_L^{-1}b,\qquad x=M_R^{-1}y.
$$

预条件包括 Jacobi、Gauss–Seidel、ILU/ICC、块分解、Schur 补、域分解和几何/代数多重网格。非线性残量 $R(U)=0$ 常用 Newton、修正 Newton、Picard、拟 Newton、Jacobian-free Newton–Krylov，并以线搜索或信赖域增强全局收敛。

## 5. 时间、特征值与稳定性算法

- 显式：Forward Euler、RK2/3/4、SSP-RK、Leapfrog、中心差分；受 CFL 或最高频率限制。
- 隐式：Backward Euler、Crank–Nicolson、BDF1–6、SDIRK、Rosenbrock；每步需要非线性/线性求解。
- 结构动力学：Newmark、HHT-$\alpha$、广义-$\alpha$、Wilson-$\theta$、显式中心差分。
- 辛/变分积分：Stormer–Verlet、Gauss 配点，用于长期保持 Hamilton 结构。
- 特征值：Power、Lanczos、Arnoldi、Krylov–Schur、Davidson、LOBPCG、Jacobi–Davidson、子空间迭代和轮廓积分。

## 6. 耦合、优化与不确定性

多物理耦合有单体和分区两路。弱耦合显式交换一次，强耦合在时间步内迭代到界面残差满足容差；Aitken 松弛、IQN-ILS 和准 Newton 可加速。优化算法包括梯度下降、SQP、内点法、MMA、信赖域、遗传算法、粒子群、贝叶斯优化；梯度可由有限差分、自动微分、直接灵敏度或离散/连续伴随得到。UQ 包括 Monte Carlo、拉丁超立方、Polynomial Chaos、随机配置、可靠度 FORM/SORM、区间与证据理论。ROM 包括 POD、DMD、Krylov、平衡截断、DEIM/GNAT 和代理模型。

## 7. 算法选型的最低证据

每次选型至少记录：控制方程与本构、边界/初始条件、离散空间与阶次、稳定化/限制器、矩阵性质、非线性策略、收敛准则、守恒误差、网格/时间步研究、参考解或实验数据。残差下降只说明离散方程迭代停止，不能替代物理确认。

## 8. 本库学习路径

1. CFD：01～08 专题；
2. 结构与有限元：11 专题；
3. 通用求解器与时间积分：12 专题；
4. 电磁、声学、热与粒子方法：13 专题；
5. 多物理耦合：14 专题；
6. 优化、降阶与 UQ：15 专题；
7. V&V：08 专题。

## 9. 参考资料

1. MFEM, *Weak Formulations*，https://mfem.org/fem_weak_form/ 。
2. PETSc, *KSP: Linear System Solvers*，https://petsc.org/main/manual/ksp/ 。
3. SLEPc, *EPS Eigenvalue Problem Solver*，https://slepc.upv.es/release/documentation/manual/eps.html 。
4. SUNDIALS, *IDA Mathematical Considerations*，https://sundials.readthedocs.io/en/latest/ida/Mathematics_link.html 。
5. Oberkampf & Roy, *Verification and Validation in Scientific Computing*.

