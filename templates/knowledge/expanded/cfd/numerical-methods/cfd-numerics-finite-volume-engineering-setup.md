---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-volume-engineering-setup
title: "有限体积法：工程设置与参数选择"
summary: "给出一套可直接运行的 OpenFOAM 有限体积配置：fvSchemes 的格式选择、fvSolution 的求解器与松弛因子、库朗数与非正交修正次数的反算，以及网格检查阈值。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "有限体积法"
  - "工程设置与参数选择"
  - "OpenFOAM 字典"
  - "库朗数"
seo:
  title: "有限体积法：工程设置与参数选择"
  description: "给出一套可直接运行的 OpenFOAM 有限体积配置：fvSchemes 的格式选择、fvSolution 的求解器与松弛因子、库朗数与非正交修正次数的反算，以及网格检查阈值。"
  keywords:
    - "有限体积法"
    - "工程设置与参数选择"
    - "OpenFOAM 字典"
    - "库朗数"
    - "非正交修正"
---

# 有限体积法：工程设置与参数选择

有限体积的工程配置由三张字典和一组松弛因子决定：`fvSchemes` 定离散格式、`fvSolution` 定线性求解器与压力修正、`fvOptions` 定源项。本文给出一套可运行的 OpenFOAM 配置，逐项说明取值依据，并给出库朗数与非正交修正次数的反算。

## 一、格式选择与延迟修正

对流项在二阶精度与有界性之间用延迟修正折中：以稳定的一阶迎风为隐式部分，把高阶修正显式加入右端。

$$
\phi_f=(1-\gamma)\,\phi_f^{\mathrm{UD}}+\gamma\,\phi_f^{\mathrm{CD}}
$$

$\gamma=1$ 即纯中心格式，精度高但在高库朗数下振荡；$\gamma=0$ 即纯迎风，稳定但耗散大。工程上常用带限制的梯度格式代替显式混合，由限制器自动决定每个面上的 $\gamma$，无需手工给定。扩散项一律用中心格式，并配非正交修正：

$$
\Gamma_f\left(\nabla\phi\right)_f\cdot\mathbf A_f=D_f\left(\phi_N-\phi_P\right)+E_f
$$

$E_f$ 是非正交修正项，用上一次迭代的梯度显式计算，因此需要多迭代几次才收敛。

## 二、库朗数与非正交修正次数

瞬态计算的时间步由库朗数控制：

$$
Co=\frac{\Delta t}{2V_P}\sum_f\left|\mathbf u_f\cdot\mathbf A_f\right|
$$

取 $Co_{\max}=0.5$、最小网格尺度 $\Delta x=5\times10^{-3}$ m、$|\mathbf u|=10$ m/s，则 $\Delta t=0.5\times5\times10^{-3}/10=2.5\times10^{-4}$ s。非正交修正次数按最大非正交角选取：小于 40° 取 1 次，40°～60° 取 2 次，60°～70° 取 3 次；超过 70° 应先改善网格，而不是继续加迭代。

## 三、OpenFOAM 配置

```cpp
// system/fvSchemes
ddtSchemes      { default backward; }        // 瞬态二阶
gradSchemes     { default cellLimited Gauss linear 1; }
divSchemes
{
    default         none;
    div(phi,U)      Gauss linearUpwind grad(U);   // 二阶、有界
    div(phi,k)      Gauss limitedLinear 1;         // 湍流量用限制格式
}
laplacianSchemes { default Gauss linear corrected; }  // 非正交修正
interpolationSchemes { default linear; }
snGradSchemes   { default corrected; }
fluxRequired    { default no; p; }
```

```cpp
// system/fvSolution
solvers
{
    p
    {
        solver          GAMG;
        smoother        GaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
    }
    U
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-8;
        relTol          0.1;
    }
}
SIMPLE
{
    nNonOrthogonalCorrectors 2;
    consistent      yes;
}
relaxationFactors
{
    fields     { p 0.3; }
    equations  { U 0.7; }
}
```

## 四、参数取值依据

| 项目 | 取值 | 依据 |
|---|---|---|
| 时间格式 | `backward` | 二阶隐式，瞬态精度优于 `Euler` |
| 对流格式 | `linearUpwind grad(U)` | 二阶且耗散低于纯迎风 |
| 梯度限制 | `cellLimited Gauss linear 1` | 限制系数 1，防止界面外插越界 |
| 扩散格式 | `Gauss linear corrected` | 显式非正交修正 |
| 非正交修正次数 | 2 | 最大非正交角 40°～60° |
| 库朗数上限 | 0.5 | 瞬态精度与稳定性 |
| 时间步 $\Delta t$ | $2.5\times10^{-4}$ s | 由库朗数与最小网格反算 |
| 压力求解器 | GAMG，容差 $10^{-7}$，relTol 0.01 | 压力方程条件数大 |
| 速度求解器 | `smoothSolver`/`symGaussSeidel`，容差 $10^{-8}$ | 系数矩阵对角占优 |
| 松弛因子 p / U | 0.3 / 0.7 | 稳态 SIMPLE 的常用组合 |

## 五、症状、根因与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差停在平台不再下降 | 非正交修正次数不足，或网格非正交角过大 | 用 `checkMesh` 查非正交角，并把修正次数加 1 重算 |
| 高库朗数下出现非物理振荡 | 对流格式用了纯中心，或限制器未启用 | 换 `linearUpwind` 或加 `limitedLinear`，比较振荡幅度 |
| 稳态计算压力场缓慢漂移 | 压力参考点未固定 | 检查 `pRefCell`/`pRefValue` 是否设置 |
| 收敛很慢但残差平滑 | 松弛因子过小 | 把 p 从 0.3 提到 0.5、U 从 0.7 提到 0.8，比较迭代数 |
| 湍流量出现负值 | 湍流输运方程用了无限制格式 | 对 k 与 epsilon 改用 `limitedLinear 1` |
| 时间步减半后结果明显变化 | 时间格式仅一阶，或库朗数偏高 | 换 `backward` 并降低库朗数，比较两次结果之差 |

## 六、参考书目

1. OpenFOAM Foundation, *OpenFOAM User Guide*, `fvSchemes` 与 `fvSolution` 章节.
2. Patankar S. V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
3. Versteeg H. K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. Moukalled F., Mangani L., Darwish M., *The Finite Volume Method in Computational Fluid Dynamics: An Advanced Introduction with OpenFOAM and Matlab*, Springer, 2016.
5. Ferziger J.H., Perić M., Street R.L. 《Computational Methods for Fluid Dynamics》. Springer, 2020.
6. Jasak H. 《Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows》. Imperial College London, 1996.
7. Weller H.G., Tabor G., Jasak H., Fureby C. 《A tensorial approach to computational continuum mechanics using object-oriented techniques》. Computers in Physics, 1998.
