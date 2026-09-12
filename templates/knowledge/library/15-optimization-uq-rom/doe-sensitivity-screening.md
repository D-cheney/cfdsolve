---
template_version: "flowlab-knowledge/1.0"
slug: doe-sensitivity-screening
title: 试验设计与参数敏感性筛选
summary: 从局部导数、Morris 筛选到方差分解说明参数重要度分析，帮助在昂贵 CAE 模型中缩小标定与优化空间。
category: { slug: optimization-uq-rom, name: "优化、不确定性与降阶" }
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [试验设计, 敏感性分析, Morris, Sobol, 不确定性]
---

# 试验设计与参数敏感性筛选

## 1. 为什么先做筛选

昂贵 CAE 模型通常不能直接对几十个参数做高精度全局优化。先进行敏感性筛选，可以识别几乎不影响目标的参数、强交互参数和需要补充数据的区间。

## 2. 局部灵敏度

局部归一化灵敏度可写成：

$$
S_i=\frac{x_i}{y}\frac{\partial y}{\partial x_i}.
$$

它计算便宜，但只描述一个工作点附近的变化。Morris 方法在参数空间中采样基本效应，用均值绝对值衡量总体影响，用离散程度提示非线性或交互。Sobol 指数基于输出方差分解，可区分主效应和总效应，但需要更多样本或代理模型。

## 3. 全局筛选与方差分解

Morris 方法适合先筛掉低影响变量。对保留参数，可用 Sobol 主效应指数衡量单个参数贡献，用总效应指数包含其全部交互贡献。两者差异较大时，说明交互不可忽略。

## 4. 实施步骤

1. 为每个参数定义物理可行范围和概率分布。
2. 固定网格、求解容差和失败判据，避免数值噪声冒充敏感性。
3. 用空间填充设计或 Morris 方法完成初筛。
4. 对高影响参数建立收敛的代理模型并交叉验证。
5. 在缩小后的参数集上做 Sobol 分析、标定或优化。

## 5. 失败样本与结果验收

求解失败本身也是信息。应记录失败区域并判断是不可行物理状态、网格问题还是求解器不稳，不能简单删除失败样本。报告敏感性时应同时给出参数范围；离开该范围，排序可能改变。

验收时复算代表性高、低敏感参数扰动，确认排序可由原始求解器重现。代理模型应给出独立验证误差，并避免在训练样本凸包之外解释全局灵敏度。

## 6. 参考资料

1. M. D. Morris, Factorial sampling plans for preliminary computational experiments, *Technometrics*.
2. A. Saltelli et al., *Global Sensitivity Analysis: The Primer*, Wiley.
