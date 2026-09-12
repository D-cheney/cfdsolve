---
template_version: "flowlab-knowledge/1.0"
slug: eigenvalue-krylov-schur
title: 大规模特征值算法：Rayleigh 商、Lanczos、Arnoldi 与 Krylov–Schur
summary: 推导广义特征值的 Rayleigh 商和 Ritz 投影，解释 Lanczos、Arnoldi、shift-invert、重启与模态残差的工程选择。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 专题
reading_minutes: 29
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [特征值, Lanczos, Arnoldi, Krylov-Schur, 模态分析]
seo:
  title: Lanczos、Arnoldi 与 Krylov-Schur 推导｜CFD菜鸟
  description: 从 Rayleigh-Ritz 投影理解大规模广义特征值算法和模态误差。
  keywords: [特征值算法, Lanczos, Arnoldi, Krylov-Schur]
---

# 大规模特征值算法：Rayleigh 商、Lanczos、Arnoldi 与 Krylov–Schur

考虑广义问题

$$
Ax=\lambda Bx,
$$

其中结构模态对应 $A=K,B=M$。若 $A$ 对称、$B$ 正定，Rayleigh 商

$$
\rho(x)=\frac{x^TAx}{x^TBx}
$$

在特征向量处驻定，最小值给出最小特征值。

## 1. Rayleigh–Ritz 投影

取子空间基 $V$，近似 $x=Vy$，要求残差 $r=AVy-\lambda BVy$ 与子空间正交：

$$
V^TAVy=\lambda V^TBVy.
$$

大问题转为小型投影特征问题，所得 $\lambda$ 为 Ritz 值。算法差异主要在如何构造和重启 $V$。

## 2. Arnoldi 与 Lanczos

Arnoldi 对一般矩阵产生

$$
AV_m=V_mH_m+h_{m+1,m}v_{m+1}e_m^T.
$$

$H_m$ 是上 Hessenberg 矩阵。对称矩阵时正交关系退化为三项递推，得到 Lanczos 三对角矩阵，存储更低；有限精度会丢失正交性并产生重复 Ritz 值，需要选择性或完全重正交。

## 3. 谱变换

求靠近目标 $\sigma$ 的内部特征值，可用 shift-invert：

$$
(A-\sigma B)^{-1}Bx=\mu x,qquad \mu=\frac1{\lambda-\sigma}.
$$

目标附近特征值被映射为最大模特征值，但每次算子作用需解线性系统，因子分解或预条件质量决定总成本。

## 4. Krylov–Schur 重启

显式重启直接丢弃子空间，可能损失收敛信息。Krylov–Schur 先把 Arnoldi 分解变为 Schur 形式，保留目标 Ritz 对对应的不变子空间，再截断并扩展；对 Hermitian 问题等价于厚重启 Lanczos。它适合只求少量特征对的大规模 CAE 问题。

## 5. 误差、配对与选型

归一化残差

$$
\eta_i=\frac{\|Ax_i-\lambda_iBx_i\|}{(\|A\|+|\lambda_i|\|B\|)\|x_i\|}
$$

比仅看特征值变化可靠。重根/近重根应比较子空间而非单个向量。非对称系统左右特征向量不同，灵敏度与参与因子需要双边信息。

| 问题 | 建议方法 |
|---|---|
| 对称极端少量特征值 | Lanczos/Krylov–Schur/LOBPCG |
| 一般非对称 | Arnoldi/Krylov–Schur |
| 目标附近内部特征值 | shift-invert + Krylov–Schur |
| 区间内全部特征值 | spectrum slicing/轮廓积分 |

## 6. 参考资料

1. SLEPc, *EPS Eigenvalue Problem Solver*, https://slepc.upv.es/release/documentation/manual/eps.html 。
2. SLEPc, *Krylov–Schur Methods*, https://slepc.upv.es/release/_downloads/5229480744b7c2533563dee75c16dfde/str7.pdf 。
3. Saad, *Numerical Methods for Large Eigenvalue Problems*.
