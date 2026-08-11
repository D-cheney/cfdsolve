---
template_version: "flowlab-knowledge/1.0"
slug: conservation-balance-checks
title: CFD 质量、动量、能量与组分守恒检查
summary: 给出稳态和瞬态控制体的质量、能量、组分与动量收支计算方式，说明符号约定、积分面选择和相对不平衡指标。
category:
  slug: verification-validation
  name: 验证确认与后处理
level: 工程
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [质量守恒, 能量守恒, 组分守恒, 控制体, 后处理]
seo:
  title: CFD 全局守恒检查方法｜流研工坊
  description: 用控制体通量与源项检查质量、能量、动量和组分平衡。
  keywords: [CFD 质量不平衡, 能量平衡, 通量积分, 守恒检查]
---

# CFD 质量、动量、能量与组分守恒检查

守恒检查把所有边界通量和体源项汇总，是发现边界符号、源项、接口和未收敛问题的最直接方法。应使用求解器的守恒面通量，而不是仅靠插值场量。

## 1. 符号约定

先固定外法向为正。流入的 `u·n` 为负，流出为正。报告可以转换为“入口正、出口正”的工程形式，但公式和软件输出的符号必须清楚。

## 2. 质量平衡

```text
imbalance_m = |Σṁ_boundary - S_m - dM_domain/dt| / Σ|ṁ_boundary|
```

稳态时域内储存项为零；多相问题还应分别检查各相质量，反应问题检查元素质量。

## 3. 能量平衡

汇总入口/出口焓流、壁面热流、轴功、辐射、体热源和域内储能。总温或焓定义必须与求解器一致，避免只积分温度。

## 4. 动量平衡

控制体动量通量、压力力、黏性力、体力和外部支撑力应平衡。它可用于独立核对表面力系数和设备推力。

## 5. 局部化诊断

若全局不平衡偏大，将计算域分成多个子控制体，定位问题接口、源项或出口。瞬态问题应对同一时刻或同一统计窗口计算各项。

## 6. 参考资料

1. White, *Fluid Mechanics*.
2. Ferziger, Perić & Street, *Computational Methods for Fluid Dynamics*.

