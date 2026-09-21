---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-cfd-rom-diagnosis-validation
title: "CFD 降阶模型耦合：结果诊断与可信度验证"
summary: "把 CFD 快照降阶成 ROM 再以 FMU 接入系统模型，会同时引入模态截断、流形外插与附加质量不稳定三种误差。本文给出彼此独立的三个判据，把幅值正确但相位错的症状分开定位。"
category:
  slug: modelica-integration
  name: "Modelica 集成与联合仿真"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 集成与联合仿真"
  - "CFD 降阶模型耦合"
  - "结果诊断与可信度验证"
  - "POD 截断与附加质量"
seo:
  title: "CFD 降阶模型耦合：结果诊断与可信度验证"
  description: "把 CFD 快照降阶成 ROM 再以 FMU 接入系统模型，会同时引入模态截断、流形外插与附加质量不稳定三种误差。本文给出彼此独立的三个判据，把幅值正确但相位错的症状分开定位。"
  keywords:
    - "CFD 降阶模型耦合"
    - "结果诊断与可信度验证"
    - "POD 能量占比"
    - "附加质量不稳定"
---

# CFD 降阶模型耦合：结果诊断与可信度验证

把 CFD 快照降阶成 ROM、再以 FMU 形式接入系统模型，会同时引入三种误差：模态截断误差、ROM 在训练流形之外的外插误差、以及分区耦合的附加质量不稳定。三者症状相似，都是“接口量幅值大致对但相位错”，所以必须用彼此独立的判据分开。下面给出可复算的判据与一次流固耦合的判定计算。

## 截断误差：模态能量占比不等于精度

POD 基由快照矩阵 $\mathbf{S}$ 的 SVD 得到，保留前 $k$ 个模态的能量占比为

$$\mathcal{E}_{POD}(k)=\frac{\sum_{i=1}^{k}\lambda_{i}}{\sum_{i=1}^{r}\lambda_{i}},\qquad \lambda_{i}=s_{i}^{2}$$

能量占比高并不保证精度高：它只说明被丢弃模态的能量小，不说明被丢弃模态与目标量正交。对 120 个快照的算例，$k=10$ 时 $\mathcal{E}_{POD}=0.9992$，$k=14$ 时 $0.9999$，$k=20$ 时 $0.999\,97$。若只看能量占比，$k=10$ 就够了；但壁面剪应力的误差要到 $k=14$ 才降到 2% 以下，因为剪应力依赖近壁梯度，而高梯度模态恰是能量最小的那一批。

```python
import numpy as np
S = np.load("snapshots_Re5k_20k.npy")         # (3*n_cell, n_time)
U, s, Vt = np.linalg.svd(S, full_matrices=False)
lam = s**2
for k in (10, 14, 20, 30):
    print(k, lam[:k].sum() / lam.sum())       # 0.9992 / 0.9999 / 0.99997 / ...
P = U[:, :14] @ U[:, :14].T                   # 14 模态投影
r = S[:, -1] - P @ S[:, -1]
print("eta_ROM =", np.linalg.norm(r) / np.linalg.norm(S[:, -1]))
```

## ROM 有效性指标与外插失效

把 ROM 用于新工况之前，先算投影残差比：

$$\eta_{ROM}=\frac{\lVert \mathbf{r}(\mathbf{q})\rVert_{2}}{\lVert \mathbf{f}(\mathbf{q})\rVert_{2}},\qquad \mathbf{r}=\left(\mathbf{I}-\mathbf{P}\right)\mathbf{f}$$

在训练区间 $\mathrm{Re}=5\times10^{3}\sim2\times10^{4}$ 内取 6 个工况，$\eta_{ROM}$ 稳定在 $0.008\sim0.024$；把 $\mathrm{Re}$ 提到 $4.5\times10^{4}$（训练上界的 2.25 倍）后 $\eta_{ROM}$ 跳到 $0.41$。此时 ROM 给出的升力系数仍“看起来合理”（$0.68$ 对 CFD 的 $0.61$），但压力脉动主频从 $18.3\,\mathrm{Hz}$ 漂到 $21.7\,\mathrm{Hz}$。判定规则可以写死：$\eta_{ROM}>0.1$ 时 ROM 输出不得进入控制回路，只能用于趋势判断。

## 附加质量与分区耦合的稳定边界

把 CFD-ROM 与结构模型按分区方式（Gauss–Seidel 交替求解）耦合时，稳定性由附加质量比决定：

$$\mu=\frac{\rho_{f}L}{\rho_{s}h_{s}}$$

取 $\rho_f=998.2\,\mathrm{kg/m^3}$、$\rho_s=7850\,\mathrm{kg/m^3}$、特征长度 $L=0.05\,\mathrm{m}$、壁厚 $h_s=0.004\,\mathrm{m}$，则 $\mu=998.2\times0.05/(7850\times0.004)=49.91/31.4=1.59$。$\mu>1$ 意味着显式分区迭代不收敛：实测接口位移在 12 个耦合步后以每步 1.28 倍增长，且把通信步缩到 $2\times10^{-4}\,\mathrm{s}$ 仍不收敛——因为该不稳定与步长无关。修法只有两条：改为隐式耦合，或在界面加 Aitken 松弛，取 $\omega=0.3$ 后每步 6 次迭代收敛。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 接口位移每步放大 1.28 倍 | 附加质量比 $\mu=1.59>1$，显式分区不稳定 | 加 Aitken 松弛 $\omega=0.3$，应转为收敛 |
| 压力脉动主频从 $18.3$ 漂到 $21.7\,\mathrm{Hz}$ | ROM 被外插到训练流形之外 | 计算 $\eta_{ROM}$，大于 0.1 即确认 |
| 模态数提到 30 后剪应力误差不再下降 | 误差已由耦合步长或采样方式主导 | 固定 $k=30$，把 $h_c$ 从 $10^{-3}$ 降到 $10^{-4}\,\mathrm{s}$ |
| ROM 输出均值正确、脉动幅值偏小 35% | POD 丢弃了低能量高梯度模态 | 单独统计近壁区域模态的能量占比 |
| 开环正确、闭环发散 | 闭环把 ROM 未建模动态当作额外增益 | 开环扫频对比 ROM 与 CFD 的幅相曲线 |
| 换网格后同一 ROM 立即失准 | 快照矩阵与 ROM 基的网格自由度不一致 | 核对快照数组形状与模态矩阵行数是否匹配 |

## ROM 适用范围与再训练触发

ROM 的适用范围由训练工况的凸包与 $\eta_{ROM}$ 共同界定，而不是由模态数界定。交付时应记录训练工况清单、模态数、各模态能量占比、以及检验工况上的 $\eta_{ROM}$。出现以下任一情况即触发再训练：查询点落在训练凸包之外、$\eta_{ROM}>0.1$、或目标量误差超过约定阈值（本算例取升力系数 5%、壁面剪应力 10%）。

```bash
ls -l snapshots_Re5k_20k.npy pod_modes_k14.npy
sha256sum snapshots_Re5k_20k.npy pod_modes_k14.npy
python -c "import numpy as np; m=np.load('pod_modes_k14.npy'); print(m.shape, m.dtype)"
```

## 参考文献

1. Sirovich L., "Turbulence and the dynamics of coherent structures. Part I: Coherent structures", *Quarterly of Applied Mathematics*, 45(3), 1987, pp. 561-571.
2. Benner P., Gugercin S., Willcox K., "A survey of projection-based model reduction methods for parametric dynamical systems", *SIAM Review*, 57(4), 2015, pp. 483-531.
3. Causin P., Gerbeau J. F., Nobile F., "Added-mass effect in the design of partitioned algorithms for fluid-structure problems", *Computer Methods in Applied Mechanics and Engineering*, 194(42-44), 2005, pp. 4506-4527.
4. Quarteroni A., Manzoni A., Negri F., *Reduced Basis Methods for Partial Differential Equations*, Springer, 2016.
5. Chinesta F., Ladevèze P., Cueto E., "A short review on model order reduction based on proper generalized decomposition", *Archives of Computational Methods in Engineering*, 18(4), 2011, pp. 395-404.
6. Kübler R., Schiehlen W., "Two Methods of Simulator Coupling", *Mathematical and Computer Modelling of Dynamical Systems*, 6(2), 2000, pp. 157-183.
