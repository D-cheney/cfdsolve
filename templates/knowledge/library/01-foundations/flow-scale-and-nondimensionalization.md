---
template_version: "flowlab-knowledge/1.0"
slug: flow-scale-and-nondimensionalization
title: 流动尺度、无量纲化与主导机制判断
summary: 用特征长度、速度和时间尺度把控制方程无量纲化，识别惯性、黏性、浮力、压缩性与非定常效应的相对重要性。
category: { slug: physics, name: "流体力学基础" }
level: 入门
reading_minutes: 7
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [无量纲化, 雷诺数, 马赫数, 弗劳德数, 尺度分析]
---

# 流动尺度、无量纲化与主导机制判断

建立 CFD 模型前，先选取特征长度 $L$、速度 $U$、密度 $\rho_0$ 和时间 $T$。令 $\mathbf{x}=L\mathbf{x}^*$、$\mathbf{u}=U\mathbf{u}^*$，不可压缩动量方程可写成：

$$
St\frac{\partial\mathbf{u}^*}{\partial t^*}+\mathbf{u}^*\cdot\nabla^*\mathbf{u}^*
=-\nabla^*p^*+\frac{1}{Re}\nabla^{*2}\mathbf{u}^*+\frac{1}{Fr^2}\mathbf{g}^*.
$$

其中 $Re=\rho_0UL/\mu$，$St=L/(UT)$，$Fr=U/\sqrt{gL}$。可压缩流还需检查 $Ma=U/c$；传热问题常用 $Pr=\nu/\alpha$ 与 $Pe=RePr$。

无量纲数必须使用与研究现象一致的尺度。内流可取水力直径和截面平均速度；旋转机械可取叶尖速度；自然对流更适合从温差和浮力构造 Rayleigh 数。混用入口速度、局部最大速度和几何总长会让工况比较失去意义。

## 建模前的四步

1. 写出目标量及其空间、时间尺度。
2. 列出控制方程中的力、通量和源项。
3. 用统一特征量无量纲化，不只计算孤立的经验数。
4. 对接近临界范围的机制保留敏感性分析。

尺度分析能帮助选择稳态或瞬态、不可压缩或可压缩、层流或湍流模型，也能给网格和时间步提供第一组数量级。
