---
template_version: "flowlab-knowledge/1.0"
slug: mesh-independence-study
title: CFD 网格无关性与系统加密方法
summary: 给出粗、中、细三套网格的系统加密原则，说明目标量比较、局部场检查、表观收敛阶和网格不确定度记录方法。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [网格无关性, 网格加密, 数值不确定度, GCI, 验证]
seo:
  title: CFD 网格无关性研究方法｜流研工坊
  description: 用系统加密、目标量和局部场比较完成可审计的 CFD 网格无关性研究。
  keywords: [网格无关性, 网格收敛, GCI, CFD 验证]
---

# CFD 网格无关性与系统加密方法

网格无关性不是“细网格和中网格差得不多”一句话，而是证明主要工程结论对空间离散尺度不敏感，并估计剩余数值不确定度。

## 1. 网格系列

至少准备粗、中、细三套网格，尽量保持相同拓扑、边界层策略和局部加密逻辑。三维问题若各方向尺度按固定比例缩小，单元总数会近似按比例的三次方增长。

## 2. 保持其他设置一致

物理模型、边界、收敛标准、离散格式和后处理定义必须一致。每套网格都要达到相当的代数收敛程度，避免把迭代误差误认为网格误差。

## 3. 比较内容

选择与决策相关的积分量，例如压降、力、流量和总热流，同时比较峰值位置、截面剖面、分离点与激波位置。只比较一项全局平均量可能掩盖局部场未收敛。

## 4. 结果判断

若三套网格结果单调趋近，可估计表观阶次并计算 GCI。若结果振荡，应检查拓扑变化、局部加密不一致、未收敛或目标量定义不稳定，不能强行套用单调外推公式。

## 5. 报告表格

记录每套网格的单元数、代表尺度、质量指标、y+、目标量、相对差异和计算成本。最终选择应平衡不确定度与成本，并保留细网格作为核验依据。

## 6. 参考资料

1. Roache, *Verification and Validation in Computational Science and Engineering*.
2. Celik et al., “Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications,” 2008.

