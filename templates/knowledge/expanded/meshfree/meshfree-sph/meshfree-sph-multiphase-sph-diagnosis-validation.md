---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-multiphase-sph-diagnosis-validation
title: "多相 SPH：结果诊断与可信度验证"
summary: "把多相 SPH 的异常拆成界面压力振荡、粒子互穿、虚假流动与界面弥散四类可测信号，给出 Laplace 压力手算、密度比上限判据、虚假流强度阈值与相间质量泄漏核对流程。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "多相 SPH"
  - "结果诊断与可信度验证"
  - "Laplace 压力"
  - "密度比"
seo:
  title: "多相 SPH：结果诊断与可信度验证"
  description: "把多相 SPH 的异常拆成界面压力振荡、粒子互穿、虚假流动与界面弥散四类可测信号，给出 Laplace 压力手算、密度比上限判据、虚假流强度阈值与相间质量泄漏核对流程。"
  keywords:
    - "多相 SPH"
    - "结果诊断与可信度验证"
    - "Laplace 压力"
    - "密度比"
    - "虚假流动"
---

# 多相 SPH：结果诊断与可信度验证

多相 SPH 的失败很少表现为"算不出来"，而是界面附近出现局部压力振荡、两相粒子互相穿透、静止液滴里自发产生流动，或界面在几百步内弥散到看不出位置。这四类信号各有独立的判定量，也各有不同的根因。本文给出每类的阈值、一次可核对的 Laplace 压力手算，以及密度比与虚假流的定量判据。

## 界面压力振荡：先确认方程是否成对

多相动量方程应写成压力求和成对形式：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\frac{p_i+p_j}{\rho_i\rho_j}\nabla_i W_{ij}+\mathbf{g}+\frac{\mathbf{f}_{s,i}}{\rho_i}
$$

分子用 $p_i+p_j$ 而不是 $p_i/\rho_i+p_j/\rho_j$，是因为在密度跳变处后者会产生非对称的压力梯度，表现为界面两侧的振荡。判定量是界面带内压力的峰谷差 $\Delta p_{\text{osc}}=\max p-\min p$，在静置分层算例中应低于 $2\rho_0g\Delta p=2\times998.2\times9.81\times0.005=97.9\ \mathrm{Pa}$。若振荡幅度随 $\Delta p$ 加密反而增大，说明方程形式本身有问题，而不是分辨率问题。

## 用 Laplace 压力核对表面张力项

表面张力是否被正确施加，可以用一个静止液滴直接检验。Young–Laplace 关系给出内外压差

$$
\Delta p=\sigma\left(\frac{1}{R_1}+\frac{1}{R_2}\right)=\frac{2\sigma}{R}\quad(\text{球形})
$$

取 $\sigma=0.0728\ \mathrm{N/m}$、液滴半径 $R=1.0\times10^{-3}\ \mathrm{m}$，得 $\Delta p=2\times0.0728/1.0\times10^{-3}=145.6\ \mathrm{Pa}$。同一液滴直径上的静水压差只有 $\rho_0g(2R)=998.2\times9.81\times2.0\times10^{-3}=19.6\ \mathrm{Pa}$，即 Laplace 压力是它的 7.4 倍——液滴尺寸在毫米量级时表面张力绝不能关闭。数值解算出的液滴内外压差若偏离 $145.6\ \mathrm{Pa}$ 超过 10%，先查曲率 $\kappa$ 的离散精度，再查界面法向是否用 $\mathbf{n}_i=\sum_j V_j\nabla_iW_{ij}$ 的归一化形式。

## 密度比决定可用性上限

两相密度比是选择离散方案的首要参数。水—空气为 $998.2/1.225=815$，这个比值下朴素求和密度在界面处会给出介于两相之间的中间值，被状态方程放大成虚假压力。经验上限：压力求和形式（$p_i+p_j$ 型）在密度比 10 以内表现良好；比值到 100 需要引入密度加权的相间平均值

$$
\bar\rho_{ij}=\frac{2\rho_i\rho_j}{\rho_i+\rho_j}
$$

并把它用于压力项分母；比值超过 100（如 815）必须改用粒子数密度形式，或按相分别设定平滑长度与粒子质量。诊断方式很直接：把密度比从 10 依次提到 100、800，记录界面振荡幅度与静止液滴的形变量；若在某一比值处指标突然恶化一个数量级，那就是该方案的适用上限。

## 虚假流动与粒子互穿

静置液滴在无外力时应保持静止。虚假流强度取 $u_{sp}=\max_i|\mathbf{v}_i|/u_{\text{ref}}$，$u_{\text{ref}}$ 为工况特征速度；合格阈值是 $u_{sp}<0.01$。若 $u_{sp}$ 达到 0.05 并在液滴内形成环流，根因通常是表面张力与压力梯度在离散上不同步，而不是时间步不足。粒子互穿则用另一个量度量：统计相 A 粒子中最近邻为相 B 且距离小于 $0.5\Delta p$ 的比例 $f_{\text{cross}}$，正常应低于 0.2%；轻相粒子被压入重相时该值会跳到 2% 以上，且与密度比成正比。

界面弥散宽度也要记录。支持半径为 $r_c=2h$，取 $\Delta p=0.005\ \mathrm{m}$、$h=1.2\Delta p=0.006\ \mathrm{m}$，界面过渡带在 $t=0.5\ \mathrm{s}$ 内的合理宽度是 $2h=0.012\ \mathrm{m}$；若扩到 0.05 m 以上，说明密度扩散系数过大，物理界面已被抹平。

## 相间质量泄漏的核对

按相分别累计质量 $M_A=\sum_{i\in A}m_i$ 与 $M_B=\sum_{i\in B}m_i$。由于相标签不随时间改变，两者应逐位守恒；若 $M_A$ 在 1.0 s 内漂移超过 0.01%，说明存在把粒子在相间搬移的后处理或重采样操作。同时核对界面两侧的体积：$\sum_{i\in A}V_i$ 应与初始值一致，这一项能捕捉到密度被状态方程压偏但质量仍守恒的情形。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面压力峰谷差超过 97.9 Pa | 压力项非成对，密度跳变处梯度不对称 | 把压力项改为 $p_i+p_j$ 形式后复跑 |
| 静止液滴内外压差偏离 145.6 Pa | 曲率或界面法向离散不准 | 关表面张力对比，检查 $\mathbf{n}_i$ 是否归一化 |
| 密度比提到 800 后界面破裂 | 超出压力求和形式的适用上限 | 依次跑 10、100、800，记录振荡幅度拐点 |
| 静止液滴内出现环流 | 表面张力与压力梯度不同步 | 测 $u_{sp}$，阈值 0.01，并检查是否同步施加 |
| 轻相粒子压入重相 | 密度比过大或缺少相间斥力 | 统计 $f_{\text{cross}}$，正常低于 0.2% |
| 界面弥散到 0.05 m 以上 | 密度扩散系数过大 | 对比过渡带宽度与 $2h=0.012\ \mathrm{m}$ |
| 单相质量在 1 s 内漂移 0.01% | 存在跨相重采样或粒子搬移 | 按相分别累计 $M_A$、$M_B$ 并画时间序列 |

## 诊断脚本

```python
import numpy as np

def interface_diagnostics(x, v, rho, phase, sigma, R, dp, u_ref):
    n = len(x)
    # 1. 相间互穿比例: 最近邻为异相且距离 < 0.5*dp
    cross = 0
    for i in range(n):
        d = np.linalg.norm(x - x[i], axis=1)
        d[i] = np.inf
        j = int(np.argmin(d))
        if phase[j] != phase[i] and d[j] < 0.5 * dp:
            cross += 1
    f_cross = cross / n
    # 2. 虚假流强度
    u_sp = np.max(np.linalg.norm(v, axis=1)) / u_ref
    # 3. Laplace 压力基准
    dp_laplace = 2.0 * sigma / R            # 145.6 Pa at R = 1 mm
    # 4. 按相质量预算
    M = {p: np.sum(rho[phase == p]) for p in np.unique(phase)}
    return dict(f_cross=f_cross,          # 目标 < 0.002
                u_sp=u_sp,                # 目标 < 0.01
                dp_laplace=dp_laplace,
                mass=M)

def density_ratio_sweep(ratios, run_case):
    # 依次跑 10 / 100 / 800, 记录界面振荡幅度拐点
    return {r: run_case(r)["p_osc"] for r in ratios}
```

判读顺序：先看 `dp_laplace` 是否为 145.6 Pa 量级（确认表面张力项已生效），再看 `u_sp` 是否低于 0.01，然后看 `f_cross` 是否低于 0.002。三者都通过而结果仍不合理时，才去跑 `density_ratio_sweep`，用拐点定位方案的密度比上限。

## 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
3. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
4. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
5. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
7. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
