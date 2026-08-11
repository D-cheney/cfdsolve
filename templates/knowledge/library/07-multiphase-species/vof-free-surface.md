---
template_version: "flowlab-knowledge/1.0"
slug: vof-free-surface
title: VOF 自由液面、表面张力与界面捕捉
summary: 介绍体积分数输运、界面重构、表面张力和壁面接触角，说明自由液面问题的网格、时间步、初始化和质量守恒检查方法。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 工程
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [VOF, 自由液面, 表面张力, 接触角, 界面捕捉]
seo:
  title: VOF 自由液面与界面捕捉｜流研工坊
  description: 正确设置 VOF 体积分数、表面张力、接触角、网格和时间步。
  keywords: [VOF 方法, 自由液面 CFD, 表面张力, 接触角]
---

# VOF 自由液面、表面张力与界面捕捉

VOF 在固定网格上输运各相体积分数，用 0～1 之间的过渡单元表示界面。它适合大尺度连续界面，但无法在网格以下自动保持真实薄膜或液滴分布。

## 1. 体积分数

每个单元的各相体积分数之和应为 1。界面压缩或几何重构用于减少数值扩散，但过强压缩可能产生锯齿和非物理小液滴。

## 2. 表面张力

表面张力通过界面曲率产生压力跳跃。曲率对网格噪声敏感，粗糙界面会引起寄生流。毛细主导问题需用足够平滑、近似均匀的界面网格，并考虑毛细时间步限制。

## 3. 壁面接触

接触角决定界面在固壁处的法向。输入角度需明确从哪一相测量，并区分静态角与推进/后退动态角。微通道中接触角不确定度可能主导结果。

## 4. 初始化与时间步

用几何区域精确初始化液位，避免大量模糊界面单元。控制界面 Courant 数，使界面每步穿越的单元距离有限；激烈晃荡、破碎和喷溅通常需要更小时间步。

## 5. 验证

监控每相总体积、液位、压力和界面面积。用静水压力、静态液滴 Laplace 压差、溃坝或晃荡基准检查重力、表面张力和界面输运。

## 6. 参考资料

1. Hirt & Nichols, “Volume of Fluid Method for the Dynamics of Free Boundaries,” 1981.
2. Scardovelli & Zaleski, “Direct Numerical Simulation of Free-Surface and Interfacial Flow,” 1999.

