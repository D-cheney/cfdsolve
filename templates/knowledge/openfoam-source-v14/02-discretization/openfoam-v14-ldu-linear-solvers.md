---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-ldu-linear-solvers
title: OpenFOAM 14 lduMatrix、线性求解器与预条件
summary: 解释有限体积矩阵如何映射为 lower-diagonal-upper 稀疏存储，并梳理矩阵接口、求解器、平滑器、预条件、多重网格和残差控制之间的调用关系。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 工程
reading_minutes: 20
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, lduMatrix, GAMG, 预条件, 线性求解器]
---

# OpenFOAM 14 lduMatrix、线性求解器与预条件

每个内部面连接 owner 与 neighbour，因此多面体有限体积矩阵可用 lower、diagonal、upper 三组系数和寻址表表示：

```text
\mathbf{A}\mathbf{x}=\mathbf{b},\qquad
\mathbf{r}^{(k)}=\mathbf{b}-\mathbf{A}\mathbf{x}^{(k)}
```

## 1. 分层

`fvMatrix` 处理物理场、边界和量纲；`lduMatrix` 处理稀疏代数。`lduMatrix::solver` 依据 `fvSolution` 创建具体求解器，求解器再组合 preconditioner 或 smoother；GAMG 还构造粗层级和限制/延拓。

## 2. 残差

线性初始残差衡量本次矩阵方程的代数不平衡，不等于原始非线性 PDE 误差。`tolerance` 与 `relTol` 只决定内层停止；PIMPLE 外循环、模型校正和时间推进仍可能未收敛。

## 3. 矩阵性质

压力泊松方程常具有对称结构，但边界、非正交处理或其他项可能改变性质；动量和对流输运通常非对称。必须选择兼容的 solver/preconditioner，错误组合会在构造或运行时报错。

## 4. 参考源码

1. `src/OpenFOAM/matrices/LduMatrix/LduMatrix/lduMatrix.H`。
2. `src/OpenFOAM/matrices/lduMatrix/solvers/`、`preconditioners/`、`smoothers/`。
3. `src/fvAgglomerationMethods/`。

