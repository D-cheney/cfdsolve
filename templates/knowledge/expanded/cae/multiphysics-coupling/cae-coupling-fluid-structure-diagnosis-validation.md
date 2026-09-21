---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-fluid-structure-diagnosis-validation
title: "流固耦合：结果诊断与可信度验证"
summary: "给出流固耦合的三类诊断量与阈值、附加质量失稳的交替放大波形判据、界面功守恒残差计算，并以 Turek–Hron 基准和 GCI 完成可信度验证。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "流固耦合"
  - "结果诊断与可信度验证"
  - "Turek-Hron 基准"
  - "界面功守恒"
seo:
  title: "流固耦合：结果诊断与可信度验证"
  description: "给出流固耦合的三类诊断量与阈值、附加质量失稳的交替放大波形判据、界面功守恒残差计算，并以 Turek–Hron 基准和 GCI 完成可信度验证。"
  keywords:
    - "流固耦合"
    - "结果诊断与可信度验证"
    - "附加质量失稳"
    - "网格收敛指数"
---

# 流固耦合：结果诊断与可信度验证

结构振幅、界面残差与守恒量经常给出互相矛盾的信号：残差收敛了但振幅还在漂移，或者振幅稳定但界面合力不为零。诊断的任务是判断这些信号里哪一个是物理、哪一个是数值伪影。本文给出可直接采集的诊断量、阈值、失稳波形判据，以及以 Turek–Hron 基准为参照的验证流程。

## 三类诊断量必须同时采集

只看流体残差或只看固体残差都不足以说明耦合收敛。每次运行至少要同时记录：

- 界面残差相对范数 $\lVert r_\Gamma^{(k)}\rVert/\lVert d^{(k)}\rVert$，逐子迭代输出，阈值 $10^{-5}$；
- 界面功残差 $\epsilon_W$，逐时间步输出，阈值 $10^{-4}$；
- 结构目标量：梁端位移振幅 $A$ 与主频 $f$，逐周期输出。

三者趋势应当一致：子迭代次数随耦合强度单调上升，$\epsilon_W$ 始终在阈值以下，$A$ 在若干周期后进入统计稳态。任何一条背离，都要先怀疑数值来源而不是直接解释为物理现象。

## 附加质量失稳的波形特征

显式耦合中界面误差按

$$e^{n+1}\approx-\frac{m_a}{m_s}\,e^n$$

演化：不仅逐拍放大，还交替变号。把相邻两步的界面位移差相除，若比值稳定停在某个负值 $-\beta$ 附近，就说明存在附加质量效应且 $\beta\approx m_a/m_s$。实测中若每步包络增长因子为 1.15 且符号交替，则 $m_a/m_s\approx1.15$，对应 $\mu\gtrsim1$，此时任何常数松弛都难以稳住，应转隐式或单体。反之若误差单调衰减（比值为正且小于 1），那是正常的时间耗散，不能误判为附加质量问题而白白增加子迭代。

## 界面功守恒的定量检验

界面力必须与位移映射功率共轭。把两侧在界面上的做功分别积分再作差：

$$\epsilon_W=\frac{\left|\int_\Gamma \mathbf{t}_f\cdot\delta\mathbf{d}\,d\Gamma+\int_\Gamma \mathbf{t}_s\cdot\delta\mathbf{d}\,d\Gamma\right|}{\int_\Gamma\left|\mathbf{t}_f\cdot\delta\mathbf{d}\right|d\Gamma}$$

某一步若 $\int_\Gamma \mathbf{t}_f\cdot\delta\mathbf{d}\,d\Gamma=12.5\ \mathrm{J}$、$\int_\Gamma \mathbf{t}_s\cdot\delta\mathbf{d}\,d\Gamma=-12.48\ \mathrm{J}$，则 $\epsilon_W=0.02/12.5=1.6\times10^{-3}$，比阈值 $10^{-4}$ 高出一个数量级，说明力映射不是位移映射的转置，界面在人为注入能量。这类误差在短时程里常被结构阻尼掩盖，只有做长时程能量积分才会暴露。

## 用 Turek–Hron 基准锁定参考量

该基准给出通道内圆柱后方柔性梁的层流 FSI 标准算例，参数完全公开：通道 $2.5\ \mathrm{m}\times0.41\ \mathrm{m}$，圆柱直径 $D=0.1\ \mathrm{m}$，梁长 $0.35\ \mathrm{m}$、厚 $0.02\ \mathrm{m}$；流体 $\rho_f=1000\ \mathrm{kg/m^3}$、$\nu=1\times10^{-3}\ \mathrm{m^2/s}$；FSI2 工况取入口平均速度 $1\ \mathrm{m/s}$（即 $Re=100$），固体 $\rho_s=10000\ \mathrm{kg/m^3}$、$E=1.4\times10^6\ \mathrm{Pa}$、$\nu_s=0.4$。

用这些参数先做两个量级判断。其一，附加质量比 $\mu=\rho_f L/(\rho_s h)=1000\times0.35/(10000\times0.02)=1.75$，处在强耦合边缘，显式格式很可能振荡。其二，圆柱脱落频率按 $St\approx0.165$ 估算 $f_{shed}=St\,U/D=0.165\times1/0.1\approx1.65\ \mathrm{Hz}$；梁的一阶弯曲频率 $f_1\approx\frac{1.875^2}{2\pi}\sqrt{EI/(\rho_s A L^4)}$，代入 $I=6.67\times10^{-7}\ \mathrm{m^4}$ 得 $f_1\approx0.31\ \mathrm{Hz}$，远低于脱落频率，说明响应以准静态弯曲为主，不易出现锁定。把算得的 $f_{shed}$ 与 $f_1$ 同频谱峰值对照，是判断结果可信与否最快的门槛。

## 网格与时间步收敛

用至少三套网格估计网格收敛指数：

$$GCI_{fine}=F_s\frac{|\epsilon|}{r^p-1}$$

取安全因子 $F_s=1.25$、细化比 $r=2$、观测阶 $p=2$。若梁端位移在中网格与细网格之差为 0.6 mm，而位移量级为 34 mm，相对差 1.76%，则 $GCI=1.25\times0.0176/3\approx7.3\times10^{-3}$，即细网格解的不确定度约 0.73%，小于工程容差 2%。时间步同样要收敛：把 $\Delta t$ 从 1 ms 减到 0.5 ms，若振幅变化小于 1% 且相位差小于 2°，可认为时间离散已经足够。

## 诊断脚本

下面用日志数据同时算界面功残差与失稳增长因子，作为每次提交的固定检查：

```python
import numpy as np
# 每步记录: 界面位移 d[n, :], 界面力 t_f[n, :], 界面面积权重 w[:]
d = np.load("disp.npy"); tf = np.load("force.npy"); w = np.load("w.npy")
dd = np.gradient(d, axis=0)                     # 界面速度
work_f = np.sum(tf * dd * w, axis=1)            # 流体侧做功
eps_W = abs(work_f.sum()) / np.sum(abs(tf * dd * w))   # 界面功残差
ratio = np.diff(d[:, 0], 2) / (np.diff(d[:, 0])[:-2] + 1e-30)  # 相邻步比值
print(f"eps_W = {eps_W:.2e}  (阈值 1e-4)")
print(f"失稳比值中位数 = {np.median(ratio):+.3f}")
```

`eps_W` 高于 $10^{-4}$ 时优先查映射共轭性；比值中位数为负且绝对值大于 1 时，直接判定附加质量失稳，不要再靠调小时间步硬撑。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 振幅包络交替放大 | 附加质量比 $\gtrsim1$ 却用显式耦合 | 相邻步位移比值，应为负且绝对值大于 1 |
| 残差收敛但总功单调漂移 | 力映射非位移映射转置 | 计算 $\epsilon_W$，应小于 $10^{-4}$ |
| 脱落频率与 $St\,U/D$ 偏差大于 10% | 时间步过大或界面网格过粗 | 步长减半、界面加密，看频率是否回落到 1.65 Hz 附近 |
| 加密网格后位移不单调 | 界面插值阶次与流体格式阶次不匹配 | 固定映射方式只改网格，看 GCI 是否随 $r$ 收敛 |
| 长时程出现低频漂移 | ALE 网格未满足几何守恒律 | 用零流场做动网格测试，检查是否产生伪通量 |

## 参考文献

1. Turek S., Hron J., "Proposal for numerical benchmarking of fluid–structure interaction between an elastic object and laminar incompressible flow," in *Fluid–Structure Interaction*, Springer LNCSE 53, 2006.
2. Causin P., Gerbeau J.F., Nobile F., "Added-mass effect in the design of partitioned algorithms for fluid–structure problems," *Computer Methods in Applied Mechanics and Engineering*, 194, 2005.
3. Förster C., Wall W.A., Ramm E., "Artificial added mass instabilities in sequential staggered coupling of nonlinear structures and incompressible viscous flows," *Computer Methods in Applied Mechanics and Engineering*, 196, 2007.
4. Roache P.J., "Perspective: a method for uniform reporting of grid refinement studies," *ASME Journal of Fluids Engineering*, 116, 1994.
5. Felippa C.A., Park K.C., Farhat C., "Partitioned analysis of coupled mechanical systems," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
6. Bungartz H.-J., Schäfer M. (eds.), *Fluid–Structure Interaction: Modelling, Simulation, Optimisation*, Springer LNCSE 53, 2006.
