---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-fvc-fvm-fvmatrix
title: OpenFOAM 14 fvc/fvm 有限体积算子与 fvMatrix
summary: 以瞬态对流扩散方程为主线，解释 fvc 显式场计算、fvm 隐式矩阵装配、离散格式运行时选择以及 fvMatrix 中对角、上下三角、源项和边界贡献。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 工程
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, fvc, fvm, fvMatrix, 有限体积法]
---

# OpenFOAM 14 fvc/fvm 有限体积算子与 fvMatrix

考虑守恒输运方程：

```text
\frac{\partial(\rho\psi)}{\partial t}
+\nabla\cdot(\rho\mathbf{U}\psi)
-\nabla\cdot(\Gamma\nabla\psi)=S_\psi
```

对控制体积分后，时间项进入对角与旧时间源，对流和扩散在相邻单元间形成耦合系数，源项进入右端或被线性化到对角。

## 1. fvc 与 fvm

`fvc::` 返回已计算的场，代表显式操作；`fvm::` 返回 `tmp<fvMatrix<Type>>`，把未知场系数装入矩阵。典型写法的数学结构是：

```text
A_P\psi_P+\sum_N A_N\psi_N=b_P
```

一个项显式还是隐式会改变稳定性、内存和迭代耦合，不能只看公式表面相同。

## 2. 格式选择

`fvm::div(phi, psi)` 根据 mesh 的 schemes 字典查找对应离散方案；方案对象再完成面插值、限制和矩阵系数装配。这是 `fvSchemes` 能在不重编译时改变数值方法的根本原因。

## 3. fvMatrix

`fvMatrix` 组合 LDU 系数、体积源、边界内部/边界系数、未知场引用和量纲。方程运算符构造表达式树式临时对象，最终 `solve()` 下沉到 ldu 层。

## 4. 参考源码

1. `src/finiteVolume/finiteVolume/fvc/` 与 `fvm/`。
2. `src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H`。
3. `src/finiteVolume/finiteVolume/convectionSchemes/`。

