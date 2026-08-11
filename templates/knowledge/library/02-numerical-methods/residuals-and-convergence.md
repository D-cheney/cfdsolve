---
template_version: "flowlab-knowledge/1.0"
slug: residuals-and-convergence
title: 残差、监控量与 CFD 收敛判定
summary: 区分代数残差、缩放残差、守恒误差和工程目标量，给出稳态与瞬态计算的多证据收敛标准以及残差停滞的诊断顺序。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 工程
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [残差, 收敛判定, 守恒误差, 监控量, CFD]
seo:
  title: CFD 残差与收敛判定｜流研工坊
  description: 联合残差、守恒和工程监控量判断 CFD 是否真正达到可接受的收敛状态。
  keywords: [CFD 残差, 收敛标准, 质量不平衡, 监控量]
---

# 残差、监控量与 CFD 收敛判定

残差衡量离散方程当前解的不平衡，不直接衡量模型误差或实验误差。不同软件的归一化方式不同，不能脱离定义机械比较“下降几阶”。

## 1. 四类证据

1. 方程残差：反映代数迭代程度；
2. 全局守恒：质量、能量、组分和动量收支；
3. 工程监控量：压降、力、温度、流量等是否稳定；
4. 场量合理性：是否出现负绝对温度、越界组分或异常峰值。

## 2. 稳态判定

稳态结果至少应满足残差显著下降、全局不平衡低于项目容差、关键目标量在一段迭代内变化很小。若监控量呈稳定周期振荡，物理问题可能本来就是非定常，继续稳态迭代不会得到唯一常数解。

## 3. 瞬态判定

瞬态计算区分“每个时间步的内迭代收敛”和“统计状态收敛”。前者控制方程求解误差，后者需要足够长的采样时间，并检查分段均值、方差和频谱是否稳定。

## 4. 残差停滞诊断

依次检查网格质量、边界回流、初始场、时间步/伪时间步、物性非线性、源项刚性和离散格式。先解决局部非物理状态，再调整松弛和线性求解器；不要用极小松弛掩盖错误边界。

## 5. 报告方式

报告残差定义、阈值、迭代或时间步数量、守恒误差和关键监控量历史。只截取最后一张残差图不足以证明计算可复现。

## 6. 参考资料

1. Roache, *Verification and Validation in Computational Science and Engineering*.
2. Ferziger, Perić & Street, *Computational Methods for Fluid Dynamics*.

