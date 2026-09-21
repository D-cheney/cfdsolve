---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-adaptive-mesh-engineering-setup
title: 自适应网格加密：工程设置与诊断验证
summary: >-
  给出误差指示量、加密层数、阈值与滞后带的取值规则，用 8 mm 基网格与三层加密算出单元增长倍率，并给出 dynamicRefineFvMesh
  的可复算配置片段。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 自适应网格加密
  - 工程设置与参数选择
  - 误差指示量
  - 动态网格细化
  - 结果诊断与可信度验证
  - 守恒误差
  - 悬节点
seo:
  title: 自适应网格加密：工程设置与诊断验证
  description: >-
    给出误差指示量、加密层数、阈值与滞后带的取值规则，用 8 mm 基网格与三层加密算出单元增长倍率，并给出 dynamicRefineFvMesh
    的可复算配置片段。
  keywords:
    - 自适应网格加密
    - 误差指示量
    - dynamicRefineFvMesh
    - 加密层数
    - 滞后带
    - 守恒误差
    - 悬节点
    - 单元数振荡
    - 加密区域
---
# 自适应网格加密：工程设置与诊断验证

自适应加密的成败取决于两件事：指示量是否指向真正影响目标量的区域，以及阈值与层数是否与单元预算匹配。指示量选错，加密会落在漂亮的涡结构上而与目标量无关；层数与阈值失控，单元数会按八倍率爆炸。本文把这两件事算清楚。自适应加密引入了一类新误差：网格本身随解演化，插值、粗化与负载再平衡都会留下痕迹。这类误差不会让残差变大，却会让守恒量缓慢漂移或让目标量随加密历史变化。

## 阈值与滞后带的取值

单一阈值会让单元在加密与粗化之间反复振荡。做法是设置滞后带：$\eta_e > \theta_u$ 才加密，$\eta_e < \theta_l$ 才粗化，且

$$
\theta_l \approx 0.3\,\theta_u
$$

典型取值 $\theta_u = 0.30$、$\theta_l = 0.10$。当 $\theta_u$ 取 0.30 时，上例的 $f$ 约为 0.4%；取 0.15 时 $f$ 升到约 2%。层数上限通常取 3～4，超过 4 后单元尺寸已经接近棱柱层厚度，继续加密对目标量的贡献趋近于零。

## 参数台账

交付需记录：指示量定义与归一化方式、$\theta_u$ 与 $\theta_l$、$L$ 与 `maxRefinement`、`nBufferLayers`、`maxCells` 与是否触发、基网格 $h_0$ 与单元数 $N_0$、每层加密的单元比例 $f$、以及加密前后目标量的变化。若只记录了阈值而没有记录对应的 $f$，换几何后阈值无法复用。

## dynamicRefineFvMesh 配置

```text
dynamicFvMesh   dynamicRefineFvMesh;

dynamicRefineFvMeshCoeffs
{
    field           alpha.water;
    lowerRefineLevel 0.001;
    upperRefineLevel 0.999;
    unrefineLevel    2;
    nBufferLayers    2;
    maxRefinement    3;
    maxCells         3000000;
    correctFluxes    (phi);
    dumpLevel        true;
}
```

`nBufferLayers 2` 保证被标记单元周围两圈单元同步加密，避免出现尺寸比为 4 的界面；`maxRefinement 3` 对应 $h = h_0/8$；`maxCells` 是硬预算闸门，达到后加密自动停止，避免算例在无人值守时撑爆内存。`dumpLevel true` 输出每层加密的单元分布，用于事后核查加密是否落在预期区域。

## 两个诊断量的复算脚本

```python
import numpy as np

# 1) 重网格化插值的守恒误差
V_o = np.array([8.0e-9, 8.0e-9, 8.0e-9])      # 父单元体积 [m3]
a_o = np.array([0.62, 0.58, 0.61])            # 父单元体积分数
V_n = np.repeat(V_o / 8.0, 8)                 # 每个父单元分为 8 个子单元
a_n = np.repeat(a_o, 8)
eps = abs((a_n * V_n).sum() - (a_o * V_o).sum()) / abs(a_o * V_o).sum()
print(f"epsilon_cons = {eps:.2e}")

# 2) 悬节点界面的通量不平衡（粗面 = 三个细面之和）
flux = np.array([1.234e-3, -4.100e-4, -4.100e-4, -4.140e-4])   # [m3/s]
print(f"R_flux = {abs(flux.sum()) / abs(flux).sum():.2e}")
```

## 加密层数与单元尺寸的换算

二维四叉树与三维八叉树每次细分把单元边长减半，$L$ 层加密后的单元尺寸为

$$
h_L = \frac{h_0}{2^{L}}
$$

基网格 8 mm、$L = 3$ 时 $h_3 = 1\ \mathrm{mm}$。单个单元细分后的子单元数在三维是 $2^{3L} = 512$。

单元总量由被标记比例 $f$ 决定：

$$
N \approx N_0\left[1 + f\left(2^{3L}-1\right)\right]
$$

基网格 $N_0 = 5.0\times10^{5}$、标记比例 $f = 0.4\%$、$L = 3$：

$$
N \approx 5.0\times10^{5}\left[1 + 0.004 \times 511\right] = 5.0\times10^{5} \times 3.04 = 1.52\times10^{6}
$$

即单元数涨到 3.0 倍。把 $f$ 提到 2% 则 $N = 5.0\times10^{5}(1+10.2) = 5.6\times10^{6}$，涨到 11 倍。**阈值 $\theta$ 每放松一点，$f$ 就可能翻几倍，这是自适应算例超预算的首要原因。**

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密全部落在涡核而非剪切层 | 指示量用了绝对梯度，被大尺度结构主导 | 改用相对梯度指示量，检查加密区域是否随阈值移动 |
| 单元数在两步之间来回跳变 | 阈值无滞后带，单元反复加密与粗化 | 设 $\theta_l = 0.3\theta_u$，观察单元数曲线是否单调 |
| 界面处出现压力锯齿 | 相邻单元尺寸比达到 4 | 把 `nBufferLayers` 从 1 增到 2，检查界面尺寸比 |
| 目标量在加密后不变 | 加密区域不包含目标量敏感区 | 关闭加密重算，若结果相同说明加密无效 |
| 内存溢出或运行时间失控 | 阈值过松且无单元上限 | 加 `maxCells` 闸门并记录触发时刻的 $f$ 与 $L$ |
| 单元数周期性锯齿 | 阈值无滞后带 | 加 $\theta_l = 0.3\theta_u$，观察比例是否稳定 |
| 目标量随加密历史不同 | 指示量对解路径敏感或插值不守恒 | 两种初始加密分布跑到同一时刻，比较目标量 |
| 守恒量单调漂移 | 每步重网格化的插值误差累积 | 统计 $\epsilon_{cons}$，降低重网格化触发频率 |
| 界面处出现虚假源项 | 悬节点通量未配对 | 检查 $R_{flux}$ 与 `correctFluxes` 字段列表 |
| 部分进程空转 | 加密后负载不均 | 统计各进程单元数的最大/平均比，超过 1.3 需再平衡 |

## 振荡、滞后与单元数的锯齿

无滞后带时，单元数会呈锯齿：某单元因 $\eta_e$ 略超阈值被加密，加密后 $\eta_e$ 下降又被粗化，两个步长后回到原状态。诊断量是单元数时间序列的振荡周期与幅值。实测某算例的加密比例在 0.4% 与 1.8% 之间以 2 个时间步为周期振荡，正是滞后带缺失的典型特征。加入 $\theta_l = 0.3\theta_u$ 后比例稳定在 0.5%±0.05%。

另一个诊断量是**加密历史依赖**：用两种不同的初始加密分布跑到同一物理时刻，比较目标量。若差异超过容差，说明解对加密路径敏感，当前设置不具备可复现性。

## 加密-粗化插值的守恒误差

单元细分或合并时，场量需要在父子单元之间传递。守恒误差定义为

$$
\epsilon_{cons} = \frac{\left|\sum_e \phi_e V_e^{new} - \sum_e \phi_e V_e^{old}\right|}{\sum_e \left|\phi_e V_e^{old}\right|}
$$

以体积分数场为例，单次重网格化后实测 $\epsilon_{cons} = 3.0\times10^{-4}$。这个量本身很小，但它是**逐步累积**的：若每个时间步都触发重网格化，1000 步后的累积漂移可达 $1 - (1-3\times10^{-4})^{1000} \approx 26\%$。判据是要求 $\epsilon_{cons} < 10^{-8}$（守恒型插值）或至少 $<10^{-6}$（非守恒但高阶的插值），并且只对真正需要变化的区域做重网格化。

用体积守恒手算：容器内液相体积 $V_l = 1.0\times10^{-3}\ \mathrm{m^3}$，密度 $\rho_l = 1000\ \mathrm{kg/m^3}$，若 $\epsilon_{cons} = 3.0\times10^{-4}$ 且每步触发，则单步质量误差为 $3.0\times10^{-4} \times 1000 \times 1.0\times10^{-3} = 3.0\times10^{-4}\ \mathrm{kg}$。相对于 1 kg 的液相总质量，每步 0.03%，1000 步后不可忽略。

## 误差指示量决定加密落在哪里

最简单可用的指示量是相对梯度指示量：

$$
\eta_e = \frac{h_e \left|\nabla \phi\right|_e}{\left|\phi\right|_{ref}}
$$

$h_e$ 是单元尺度，$\left|\phi\right|_{ref}$ 取该场量的特征幅值（如入口与出口压差）。当 $\eta_e$ 超过阈值 $\theta$ 时标记该单元。用特征幅值归一化很关键：不归一化的绝对梯度会让量纲大的场（压力，单位 Pa）永远压过量纲小的场（组分质量分数，无量纲）。

更严格的估计用梯度恢复型后验误差估计：

$$
\left\|e\right\| \approx \left(\sum_e \int_{\Omega_e} \left(\mathbf{q}^{*} - \nabla\phi_h\right)^{2} dV\right)^{1/2}
$$

其中 $\mathbf{q}^{*}$ 是由节点值重构得到的平滑梯度。它的好处是给出全局误差范数，可以直接判断「加密到何时为止」，代价是需要额外的重构步骤。

## 复算与验收

可信的自适应结果需要给出：加密区域与目标量敏感区的重合比例、单元数时间序列（含最大值与最小值）、$\epsilon_{cons}$ 与重网格化触发次数、界面 $R_{flux}$ 与 $\Delta_{jump}$、各进程负载比、以及与固定均匀细网格的目标量对照。缺少与固定网格对照的自适应结果无法排除「加密本身改变了离散误差方向」这一可能。

## 加密区域是否跟对了目标量

先做一次「关闭加密」的对照：固定同一基网格，分别跑加密与不加密两个算例。若目标量差异小于工程容差，说明加密区域没有覆盖敏感区，加密只是在浪费成本。若差异明显，再检查加密区域与目标量敏感区是否重合——方法是在目标量敏感的位置（如分离点、激波、相界面）打标记，统计标记区内被加密的单元比例。这个比例低于 60% 就说明指示量跑偏了。

## 悬节点界面的通量一致性

粗单元与细单元交界处，粗面被细面分割。若通量累加不严格配对，界面会变成一个虚假源。诊断量取界面法向通量的相对不平衡：

$$
R_{flux} = \frac{\left|\sum_f \phi_f\right|}{\sum_f \left|\phi_f\right|}
$$

单精度算术下 $R_{flux}$ 通常小于 $10^{-6}$；若达到 $10^{-3}$ 量级，说明 `correctFluxes` 未包含全部通量场，或存在未配对的悬节点。同时应检查界面两侧的场量跳变：

$$
\Delta_{jump} = \frac{\left|\phi_{coarse} - \overline{\phi}_{fine}\right|}{\left|\phi\right|_{ref}}
$$

$\Delta_{jump} > 2\%$ 时，界面会污染局部梯度，需要在界面周围补一层缓冲加密。

## 参考资料

1. Berger M.J., Oliger J., "Adaptive Mesh Refinement for Hyperbolic Partial Differential Equations", *Journal of Computational Physics*, 53(3): 484-512, 1984.
2. Zienkiewicz O.C., Zhu J.Z., "A Simple Error Estimator and Adaptive Procedure for Practical Engineering Analysis", *International Journal for Numerical Methods in Engineering*, 24(2): 337-357, 1987.
3. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD Thesis, Imperial College London, 1996.
4. Löhner R., *Applied CFD Techniques: An Introduction Based on Finite Element Methods*, 2nd ed., John Wiley & Sons, 2008.
5. Verfürth R., *A Posteriori Error Estimation Techniques for Finite Element Methods*, Oxford University Press, 2013.
6. Popinet S., "Gerris: A Tree-Based Adaptive Solver for the Incompressible Euler Equations in Complex Geometries", *Journal of Computational Physics*, 190(2): 572-600, 2003.
7. DeZeeuw D., Powell K.G., "An Adaptively Refined Cartesian Mesh Solver for the Euler Equations", *Journal of Computational Physics*, 104(1): 56-68, 1993.
8. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
