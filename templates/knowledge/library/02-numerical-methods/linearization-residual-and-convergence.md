---
template_version: "flowlab-knowledge/1.0"
slug: linearization-residual-and-convergence
title: 非线性线性化、残差与收敛判定
summary: 区分离散方程残差、归一化残差和目标量稳定性，说明 Picard、Newton 与欠松弛迭代的基本关系。
category: { slug: numerical-methods, name: "CFD 数值方法" }
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [非线性迭代, 残差, 欠松弛, Newton, 收敛]
---

# 非线性线性化、残差与收敛判定

离散后的 CFD 方程可写成 $\mathbf{F}(\mathbf{x})=0$。Picard 迭代用上一步系数构造线性系统，通常较稳健但收敛较慢；Newton 方法求解：

$$
\mathbf{J}(\mathbf{x}^{k})\Delta\mathbf{x}=-\mathbf{F}(\mathbf{x}^{k}),\qquad
\mathbf{x}^{k+1}=\mathbf{x}^{k}+\alpha\Delta\mathbf{x}.
$$

$\alpha$ 是阻尼或欠松弛因子。它可扩大收敛域，但过小会掩盖模型或边界设置问题，并显著增加迭代次数。

残差是离散代数系统的不平衡量，不等于真实解误差。不同软件的缩放、归一化和初始残差定义可能不同，因此“降到 $10^{-5}$”只有在明确残差定义后才可比较。

## 联合收敛判据

- 每个守恒方程的缩放残差下降并达到设定阈值；
- 全域质量、能量和组分不平衡满足工程容限；
- 压降、升阻力、换热量等目标量进入稳定区间；
- 稳态迭代中不存在持续周期振荡，或已确认问题本身应为瞬态；
- 增加迭代次数不会改变报告结论。

残差停滞时应先定位离散质量、边界相容性、网格非正交、源项刚性和线性求解误差，再调整松弛因子。只降低松弛通常不能修复不适定模型。
