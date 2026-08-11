---
template_version: "flowlab-knowledge/1.0"
slug: gci-discretization-uncertainty
title: GCI 与 CFD 离散不确定度报告
summary: 介绍三套系统加密网格、有效加密比、表观收敛阶、Richardson 外推和网格收敛指数 GCI 的使用条件与报告格式。
category:
  slug: verification-validation
  name: 验证确认与后处理
level: 专题
reading_minutes: 15
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [GCI, Richardson外推, 离散误差, 网格收敛, 数值验证]
seo:
  title: CFD 网格收敛指数 GCI｜流研工坊
  description: 使用系统加密网格、表观阶次和 GCI 量化 CFD 空间离散不确定度。
  keywords: [GCI, 网格收敛指数, Richardson 外推, 离散不确定度]
---

# GCI 与 CFD 离散不确定度报告

GCI 用系统网格加密结果估计目标量的空间离散不确定度。它依赖渐近收敛和一致网格系列，不能对任意两套网格机械计算。

## 1. 输入数据

至少需要粗、中、细三套网格的目标量 `φ3, φ2, φ1` 和代表网格尺度 `h3, h2, h1`。非均匀网格可用与单元体积和数量相关的有效尺度，但定义要保持一致。

## 2. 检查收敛行为

先判断结果是单调收敛、振荡收敛还是发散。只有在合理的渐近区间内，表观阶次和 Richardson 外推才有稳定意义。阶次异常时先检查未收敛、网格拓扑变化和后处理位置漂移。

## 3. GCI 表达

GCI 通常用安全因子、细/中网格相对差异、有效加密比和表观阶次计算。报告百分比时必须说明对应哪两个网格和哪个目标量。

## 4. 多目标量

压降可能已收敛，而峰值温度或分离位置尚未收敛。对所有关键验收量分别计算或解释，不要用一个 GCI 代表整个流场。

## 5. 报告最低项

列出网格数、尺度、加密比、目标量、迭代容差、表观阶次、外推值、GCI 和渐近性检查。GCI 只覆盖离散不确定度，不包括物性、边界和模型形式误差。

## 6. 参考资料

1. Celik et al., “Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications,” 2008.
2. Roache, *Verification and Validation in Computational Science and Engineering*.

