---
template_version: "flowlab-knowledge/1.0"
slug: verification-validation-uncertainty
title: CFD 验证、确认与不确定度基础
summary: 区分代码验证、计算验证和模型确认，说明输入、离散、迭代、模型与实验不确定度的来源，并给出分层证据链的组织方式。
category:
  slug: verification-validation
  name: 验证确认与后处理
level: 工程
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [验证, 确认, 不确定度, V&V, CFD质量]
seo:
  title: CFD 验证、确认与不确定度｜流研工坊
  description: 区分方程是否算对与模型是否代表现实，建立 CFD 可信度证据链。
  keywords: [CFD 验证, CFD 确认, 不确定度, V&V]
---

# CFD 验证、确认与不确定度基础

验证回答“方程是否被正确求解”，确认回答“所选方程和模型是否足以代表目标现实”。两者不能互相替代，残差收敛也不等于实验一致。

## 1. 三个层次

代码验证检查软件对已知数学问题的实现，可用制造解或解析解。计算验证估计具体案例的迭代、网格和时间步误差。模型确认把计算与实验或高可信数据比较，并考虑双方不确定度。

## 2. 不确定度来源

- 几何尺寸、粗糙度和装配偏差；
- 边界测量与物性；
- 网格、时间步和迭代误差；
- 湍流、多相、反应等模型形式；
- 实验传感器、重复性和数据处理。

## 3. 分层验证路线

先验证单物理基准和简化部件，再验证耦合子系统，最后进入完整设备。每层只增加有限复杂度，便于定位误差来源。

## 4. 比较方式

不要只比较一个峰值。应比较积分量、剖面、位置、趋势和不确定度区间。计算与实验的空间位置、时间平均、滤波和参考量必须一致。

## 5. 结论表达

用“在给定工况和验证范围内，目标量误差/不确定度为……”表达，而不是笼统声称“模型已验证”。外推到未验证工况时应提高风险等级。

## 6. 参考资料

1. Roache, *Verification and Validation in Computational Science and Engineering*.
2. ASME V&V 20, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*.

