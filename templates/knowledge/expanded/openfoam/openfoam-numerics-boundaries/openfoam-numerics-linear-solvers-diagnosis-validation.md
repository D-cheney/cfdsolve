---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-linear-solvers-diagnosis-validation
title: "fvSolution 线性求解器：结果诊断与可信度验证"
summary: "用条件数把残差换算成真实解误差上界，说明 OpenFOAM 日志里 initial 与 final 残差的归一化差异，给出迭代数异常、Final 残差台阶等六类症状的判定试验，并用小算例直接解界定代数误差。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "fvSolution 线性求解器"
  - "结果诊断与可信度验证"
  - "条件数"
  - "残差归一化"
seo:
  title: "fvSolution 线性求解器：结果诊断与可信度验证"
  description: "用条件数把残差换算成真实解误差上界，说明 OpenFOAM 日志里 initial 与 final 残差的归一化差异，给出迭代数异常、Final 残差台阶等六类症状的判定试验，并用小算例直接解界定代数误差。"
  keywords:
    - "fvSolution 线性求解器"
    - "结果诊断与可信度验证"
    - "条件数误差上界"
    - "残差归一化"
    - "代数误差"
---

# fvSolution 线性求解器：结果诊断与可信度验证

日志里 `Final residual = 4.2e-09` 看起来非常干净，但这个数只说明当前迭代步的残差小，并不保证解的误差小。残差与真实误差之间差着一个条件数因子，在坏网格或强耦合算例上这个因子可以达到 $10^6$。本文给出把残差换算成误差上界的方法、日志残差的归一化口径差异，以及六类求解器症状的判定试验。

## 残差小不等于误差小

对 $A\phi=b$，第 $k$ 步的误差与残差满足

$$
\frac{\|e_k\|_2}{\|\phi\|_2}\le\kappa(A)\,\frac{\|r_k\|_2}{\|b\|_2},\qquad \kappa(A)=\|A\|_2\|A^{-1}\|_2
$$

这是一条上界，不是等式，但它给出了最坏情况的量级。举一个可核对的数：压力矩阵在长宽比 200 的边界层网格上 $\kappa\approx10^6$，若日志报告相对残差 $10^{-8}$，则相对误差上界为 $10^6\times10^{-8}=10^{-2}$，即 1%。也就是说，残差降到 $10^{-8}$ 的"收敛"解，其压力值仍可能有 1% 的误差。要把误差压到 $10^{-4}$，必须把残差降到 $10^{-10}$，或者把 $\kappa$ 降下来——后者靠改进网格或换更强的预条件器。

上界依赖 $\kappa$ 的估计，而 $\kappa$ 本身很难准确算出。更实用的替代量是范数型后向误差，它不依赖 $\kappa$：

$$
\eta_k=\frac{\|r_k\|_2}{\|A\|_2\|\phi_k\|_2+\|b\|_2}
$$

$\eta_k$ 的含义是"计算解是某个相对扰动为 $\eta_k$ 的邻近系统的精确解"。$\eta_k$ 达到机器精度量级（双精度约 $10^{-16}$）说明线性系统已被解到极限；$\eta_k$ 停在 $10^{-6}$ 说明矩阵或右端项本身的量级导致残差无法再降，继续迭代没有意义。这个量比单纯看残差绝对值更能说明"是否还值得继续迭代"。

```
算例: 边界层网格, 长宽比 200, 压力矩阵 kappa ≈ 1e6
目标: 相对误差 <= 1e-4
需要: ||r||/||b|| <= 1e-4 / 1e6 = 1e-10
若网格长宽比降到 20, kappa ≈ 1e4
需要: ||r||/||b|| <= 1e-8   ← 容差可以放宽两个数量级
结论: 容差的合理取值由 kappa 决定，不由习惯决定
```

## 条件数、容差与迭代次数的换算

误差上界要能用，先得把 $\kappa$ 估出来。结构化网格上离散 Laplace 算子的最小特征值随域长与最小单元尺寸之比的平方下降，最大特征值固定在 $O(h_{\min}^{-2})$ 量级，于是压力矩阵的条件数可写成

$$
\kappa(A)\approx 0.405\left(\frac{L}{h_{\min}}\right)^{2}
$$

取流动方向域长 $L=1.0\ \mathrm{m}$、壁面首层厚度 $h_{\min}=6.3\times10^{-4}\ \mathrm{m}$，得 $L/h_{\min}=1.6\times10^{3}$，

$$
\kappa(A)\approx 0.405\times\left(1.6\times10^{3}\right)^{2}=1.0\times10^{6}
$$

这正是边界层网格上压力矩阵的典型量级。由误差上界反解，要把压力解的相对误差压到 $1.0\times10^{-4}$，相对残差必须满足

$$
\frac{\|r\|}{\|b\|}\le\frac{1.0\times10^{-4}}{1.0\times10^{6}}=1.0\times10^{-10}
$$

所以 `p` 的 `tolerance` 停在 `1e-8` 时，即便日志显示收敛，压力误差仍可能达 $1.0\times10^{-2}$。把首层厚度放大到 $6.3\times10^{-3}\ \mathrm{m}$，$L/h_{\min}$ 降到 $1.6\times10^{2}$，$\kappa$ 按平方律降到 $1.0\times10^{4}$，所需残差相应放宽到 $1.0\times10^{-8}$：容差是网格长宽比的函数，不是习惯值。

迭代数同样能算。共轭梯度法满足

$$
k_{\mathrm{CG}}\approx\frac{1}{2}\sqrt{\kappa}\,\ln\frac{2}{\varepsilon}
$$

取 $\kappa=1.0\times10^{6}$、$\varepsilon=1.0\times10^{-10}$，得 $\sqrt{\kappa}=1.0\times10^{3}$、$\ln(2/\varepsilon)=23.7$，故 $k_{\mathrm{CG}}\approx0.5\times1.0\times10^{3}\times23.7=1.2\times10^{4}$，一万次以上在工程上不可接受。GAMG 把有效条件数压到 $O(10)$，$\sqrt{\kappa}\approx3.2$，同精度下 $k_{\mathrm{CG}}\approx0.5\times3.2\times23.7=3.8\times10^{1}$，与日志中 `p` 的 15～40 次吻合。反过来，迭代数从几十次跳到几百次，说明预条件失效或长宽比恶化，而不是算例本身变难。

## 日志里两个残差的口径不同

OpenFOAM 打印的 `Initial residual` 是归一化后的量：对对称求解器，它被除以解项范数；`Final residual` 则是**未归一化**的绝对 L2 残差。这导致两个后果：不同方程的 `Initial residual` 可以横向比较，因为它们被各自归一化过；不同方程的 `Final residual` 不能直接比大小，因为场量纲和量级不同——压力的 $10^{-9}$ 与湍动能的 $10^{-9}$ 不代表同等精度。

诊断时应该看三件事：`No Iterations` 是否稳定、`Initial residual` 是否随外迭代单调下降、以及 `Final residual` 是否达到 `tolerance` 量级。若 `Final residual` 卡在 `tolerance` 之上而迭代数达到 `maxIter`，说明求解器根本没解到位。

```bash
grep -E "Solving for (p|U|k|epsilon)" log.foamRun | tail -40
# 关注字段: Initial residual / Final residual / No Iterations
grep -c "solver did not converge" log.foamRun   # 应为 0
grep "time step continuity errors" log.foamRun | tail -10
```

## 用直接解界定代数误差

迭代误差到底有多大，可以用一个缩小版算例直接回答：把网格粗化到 $50\times50$ 以内，用 `PCG` 把 `tolerance` 压到 `1e-14`、`relTol` 设为 0，得到一个近似"精确"的代数解；再在同样网格上用生产设置的容差跑一遍，两者之差就是代数误差。若这个差在 $10^{-6}$ 量级，说明生产容差足够；若在 $10^{-3}$ 量级，就必须收紧容差或改进预条件。

这个方法把"代数误差"从"离散误差"里单独剥出来，是唯一不依赖条件数估计的实证手段。它的代价只在于小网格算例的求解成本可以忽略。

## 残差与迭代异常的判定表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力迭代数突然从 15 涨到 400 | 预条件器与矩阵不匹配或出现坏单元 | 定位最大长宽比单元，同时检查求解器类型 |
| 末步 `Final residual` 出现台阶 | `Final` 段继承了非零 `relTol` | `foamDictionary` 查 `pFinal.relTol` 是否为 0 |
| 残差很低但目标量仍在漂移 | 残差小不等于误差小，$\kappa$ 大 | 用小网格直接解界定代数误差量级 |
| 迭代数随网格加密线性增长 | 未启用多重网格 | 记录两档网格的平均迭代数，对比 $L/h$ 缩放 |
| `solver did not converge` 出现在中间步 | 时间步过大导致矩阵病态 | 减小 `maxCo` 或提高 `nNonOrthogonalCorrectors` |
| 不同场残差不可比 | 混淆了归一化与绝对残差 | 统一用 `Initial residual` 做横向比较 |

诊断顺序是：先确认没有 `solver did not converge`，再确认 `Final residual` 达到量级要求，然后用小网格直接解量化代数误差，最后才把剩余偏差归给离散或模型误差。把这三步倒过来做，很容易把代数误差误判成物理效应。

## 参考文献

1. Saad Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
2. Golub G.H., Van Loan C.F., *Matrix Computations*, 4th ed., Johns Hopkins University Press, 2013.
3. Barrett R., Berry M., Chan T.F., et al., *Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods*, SIAM, 1994.
4. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
6. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
