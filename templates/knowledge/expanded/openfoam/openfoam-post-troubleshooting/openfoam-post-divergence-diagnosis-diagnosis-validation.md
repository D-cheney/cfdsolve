---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-divergence-diagnosis-diagnosis-validation
title: "发散定位：结果诊断与可信度验证"
summary: "用日志时间戳反查最早异常步，给出库朗数与扩散数的定量判据和一次时间步手算，并把边界驱动、网格驱动、求解器驱动三类发散用单因素对照区分开。"
category:
  slug: openfoam-post-troubleshooting
  name: "OpenFOAM 后处理与排错"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 后处理与排错"
  - "发散定位"
  - "结果诊断与可信度验证"
  - "Courant 数"
seo:
  title: "发散定位：结果诊断与可信度验证"
  description: "用日志时间戳反查最早异常步，给出库朗数与扩散数的定量判据和一次时间步手算，并把边界驱动、网格驱动、求解器驱动三类发散用单因素对照区分开。"
  keywords:
    - "发散定位"
    - "结果诊断与可信度验证"
    - "Courant 数"
    - "非正交修正"
---

# 发散定位：结果诊断与可信度验证

发散几乎从不在第一次出现 NaN 的那一步才发生，而是在之前某一步越过了稳定性边界。定位的任务是找到最早偏离的时刻，而不是最后崩溃的时刻。本文给出从日志时间戳反查、用库朗数与网格质量做定量判定、以及三类典型发散的区分方法。

## 从日志反查最早异常

```bash
grep -n "Courant Number" log.foamRun | tail -5
grep -n "bounding\|FOAM FATAL\|nan\|inf" log.foamRun | head -5
awk '/Time = /{t=$3} /Courant Number mean/{print t, $NF}' log.foamRun | tail -20
```

第一步看 `Courant Number max` 随时间的变化；第二步找第一条 `bounding` 警告，它通常比 NaN 早几十到几百步；第三步把时间戳对齐，定位到具体时刻。若最大库朗数从 0.8 突增到 3.5 只用了几步，说明时间步或网格在该处失控。

## 库朗数与扩散数的定量判据

$$\mathrm{Co} = \frac{|\mathbf{U}|\,\Delta t}{\Delta x}, \qquad \mathrm{Fo} = \frac{\nu\,\Delta t}{\Delta x^2}$$

显式格式要求 $\mathrm{Co} \le 1$；隐式格式虽无硬性上限，但 $\mathrm{Co} > 5$ 时时间精度严重退化，且对流项的 TVD 限制器会被反复触发。以 $U = 20\ \mathrm{m/s}$、$\Delta x = 2\ \mathrm{mm}$、$\Delta t = 10^{-4}\ \mathrm{s}$ 为例：

$$\mathrm{Co} = \frac{20 \times 10^{-4}}{0.002} = 1.0$$

已在上限。把 $\Delta t$ 降到 $5\times10^{-5}\ \mathrm{s}$ 得 $\mathrm{Co} = 0.5$，代价是步数翻倍。$\mathrm{Fo}$ 用于判断黏性项：$\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$ 时

$$\mathrm{Fo} = \frac{1.5\times10^{-5} \times 5\times10^{-5}}{(0.002)^2} = 1.9\times10^{-4}$$

远小于 1，黏性项不是瓶颈。

## 网格质量导致的发散

`checkMesh` 的三个指标与稳定性直接相关：

- `Max non-orthogonality`：超过 70 时非正交修正迭代不足会导致压力方程发散，`nNonOrthogonalCorrectors` 至少给 2。
- `Max skewness`：超过 4 时面插值误差急剧增大，建议重新划分或局部加密。
- `Max aspect ratio`：超过 1000 的边界层单元在旋转流中容易产生伪扩散。

```bash
checkMesh -allGeometry -allTopology | tee log.checkMesh
grep -E "non-orthogonality|skewness|aspect ratio" log.checkMesh
```

## 三类发散的区分

- **边界驱动**：入口速度突增或出口回流时发散。症状是残差在边界附近先变大，该时刻 `bounding p` 集中出现。判定：把入口速度降到 50% 重跑，若不再发散即为边界驱动。
- **网格驱动**：与边界条件无关，换更粗或更规整的网格后消失。判定：收紧 `maxNonOrtho` 阈值并重划网格，观察是否改善。
- **求解器驱动**：松弛因子过大或格式无界。症状是首个外层迭代就出现 `bounding`。判定：把 `relaxationFactors` 全降到 0.3 并改 `upwind` 格式，若稳定则逐步恢复。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 最大 Co 从 0.8 跳到 3.5 | 局部网格过密或时间步固定过大 | 启用 `adjustableTimeStep` 或减小 $\Delta t$ |
| 压力残差 5 步内到 $10^{6}$ | 非正交修正不足 | 把 `nNonOrthogonalCorrectors` 提到 2～3 |
| 只在高 $Re$ 工况发散 | 网格分辨率不足以支撑湍流尺度 | 用 $\Delta x^+ < 100$ 检查剪切层网格 |
| 换边界条件后立刻稳定 | 出口回流或入口突增 | 检查出口是否出现反向流动 |
| 串行稳定、并行发散 | 分块边界引入的插值或归约顺序问题 | 换 `decomposeParDict` 方法重跑 |

## 参考文献

1. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
2. C. Hirsch, *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
3. P. J. Roache, *Fundamentals of Verification and Validation*, Hermosa Publishers, 2009.
4. R. J. LeVeque, *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, §"Numerical schemes and solution control".
