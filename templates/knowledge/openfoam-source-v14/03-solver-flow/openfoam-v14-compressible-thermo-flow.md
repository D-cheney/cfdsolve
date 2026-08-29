---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-compressible-thermo-flow
title: OpenFOAM 14 可压缩流、能量与热物性调用链
summary: 以 fluid solver 模块为主线，梳理质量、动量、能量、状态方程和热物性模型之间的依赖，说明密度、压力、焓或内能、温度及热输运的预测校正顺序。
category: { slug: openfoam-v14-solver-flow, name: OpenFOAM 14 求解流程 }
level: 专题
reading_minutes: 25
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, fluid, 可压缩流, 能量方程, basicThermo]
---

# OpenFOAM 14 可压缩流、能量与热物性调用链

可压缩流需要同时闭合质量、动量、能量和状态关系：

```text
\frac{\partial\rho}{\partial t}+\nabla\cdot(\rho\mathbf{U})=0

\frac{\partial(\rho E)}{\partial t}
+\nabla\cdot[(\rho E+p)\mathbf{U}]
=\nabla\cdot(k\nabla T)+\nabla\cdot(\boldsymbol{\tau}\cdot\mathbf{U})+S_E

p=p(\rho,T),\qquad h=e+p/\rho
```

## 1. 类层次

`applications/modules/fluid` 在等温流体基类之上加入热力学与热物性输运。`src/thermophysicalModels/basic/basicThermo` 定义公共接口，具体 thermo 组合通过运行时选择与模板将状态方程、热容、能量表述和输运性质组装起来。

## 2. 生命周期

foamRun 的 `thermophysicalPredictor` 调用能量/热力学预测，`thermophysicalTransportPredictor/Corrector` 处理热扩散闭合；压力校正同时通过可压缩性关系更新密度和质量通量。具体顺序以 `fluid.C` 及其基类为准。

## 3. 阅读检查

追踪能量字段实际是 `h`、`e` 或其他变量；确认 `T` 是求解量还是由 thermo 反算；查清 `rho` 的拥有者和校正时机；把 `thermophysicalProperties` 中的每个选择映射到最终模板实例。

## 4. 验证

除连续性外，应核算总焓/总能量通量、壁面热流、体源与储能。物性超出有效温压范围时，线性求解器报错往往只是后果。

## 5. 参考源码

1. `applications/modules/fluid/`、`isothermalFluid/`。
2. `src/thermophysicalModels/basic/` 与 `specie/`。
3. `src/ThermophysicalTransportModels/`。

