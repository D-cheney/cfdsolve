---
template_version: "flowlab-knowledge/1.0"
slug: sampling-error-and-integral-metrics
title: 后处理采样误差与积分量核对
summary: 说明点值、截面平均、面积分和通量加权量的区别，避免插值位置、法向方向和单位换算改变工程结论。
category: { slug: verification-validation, name: "验证确认与后处理" }
level: 工程
reading_minutes: 7
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [后处理, 采样误差, 面积分, 质量流量, 验证]
---

# 后处理采样误差与积分量核对

单元中心值、节点插值值和面中心值不是同一个离散量。比较基准或实验前，应明确采样坐标、插值算法和参考数据的位置。高梯度区的点值对网格与插值特别敏感，截面或区域积分通常更稳健。

面积平均和质量流量加权平均分别为：

$$
\bar\phi_A=\frac{\int_A\phi\,dA}{\int_A dA},\qquad
\bar\phi_m=\frac{\int_A\rho(\mathbf{u}\cdot\mathbf{n})\phi\,dA}{\int_A\rho(\mathbf{u}\cdot\mathbf{n})\,dA}.
$$

存在回流时，分母和局部权重可能变号。此时应说明采用净通量、流入部分还是绝对通量权重。法向方向错误会同时改变质量流率、力和热流的符号。

## 导出前核对

1. 保存采样几何和坐标系，而不只保存曲线图片。
2. 标明瞬时值、时间平均值及平均窗口。
3. 对入口、出口和壁面计算统一符号下的守恒预算。
4. 检查面积、密度、压力和温度的单位与基准状态。
5. 在两种网格或两种插值方式下复算关键指标。

后处理脚本和求解配置应使用同一版本管理。否则相同流场可能因区域选择或权重变化得到不同结论。
