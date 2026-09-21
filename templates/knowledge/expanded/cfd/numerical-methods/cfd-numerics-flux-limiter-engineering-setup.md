---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-flux-limiter-engineering-setup
title: "通量限制器：工程设置与参数选择"
summary: "把 Sweby TVD 约束翻译成 OpenFOAM fvSchemes 里可填的限制器函数与系数：给出 minmod、van Leer、superbee、limitedLinear 的取值对照，并从单元 Péclet 数与 CFL 反推时间步，附一张五工况单因素对照矩阵。"
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
  - "通量限制器"
  - "工程设置与参数选择"
  - "TVD"
  - "OpenFOAM fvSchemes"
seo:
  title: "通量限制器：工程设置与参数选择"
  description: "把 Sweby TVD 约束翻译成 OpenFOAM fvSchemes 里可填的限制器函数与系数：给出 minmod、van Leer、superbee、limitedLinear 的取值对照，并从单元 Péclet 数与 CFL 反推时间步，附一张五工况单因素对照矩阵。"
  keywords:
    - "通量限制器"
    - "工程设置与参数选择"
    - "TVD"
    - "limitedLinear"
---

# 通量限制器：工程设置与参数选择

通量限制器的工程配置真正需要拍板的只有两件事：选哪个限制器函数、给它多大的系数。其余设置——单元 Péclet 数、CFL、线性求解容差——决定的是限制器有没有机会起作用。本文把 Sweby 的 TVD 约束逐条映射到 `fvSchemes` 条目，给出四个常用限制器在同一 $r$ 处的取值对照，并说明怎样用五组工况在半天内定下参数。

## Sweby 图划出的合法取值带

记上游、中心、下游单元值为 $\phi_U,\phi_C,\phi_D$，归一化梯度比为

$$r=\frac{\phi_C-\phi_U}{\phi_D-\phi_C}$$

Harten 与 Sweby 证明：二阶精度且保持总变差不增的格式，其限制器必须落在

$$0\le\psi(r)\le\min\left(2r,\,2\right),\qquad r>0$$

这条带子排除了两个极端。$\psi\equiv 0$ 是一阶迎风，贴在下边界；$\psi\equiv 1$ 是中心差分，只在 $r\le 0.5$ 时留在带内。工程上所谓"高阶又有界"，可选的余地就只有这条带子本身，任何超出带子的写法都会在阶跃附近产生新的极值。

## 四个限制器的解析形式

$$\psi_{\min\bmod}(r)=\max\left(0,\min\left(r,1\right)\right)$$

$$\psi_{\text{van Leer}}(r)=\frac{r+|r|}{1+|r|}$$

$$\psi_{\text{superbee}}(r)=\max\left(0,\min\left(2r,1\right),\min\left(r,2\right)\right)$$

OpenFOAM 的 `limitedLinear` 用系数 $k$ 参数化，$\psi(r)=\max\left(0,\min\left(2r/k,\,1\right)\right)$；$k=1$ 最耗散，$k=2$ 的压缩程度与 minmod 接近。速度场常用 `limitedLinearV`，它对三个分量分别施加限制，避免剪切层里某一分量的限制器被其他分量带偏。

## 手算：r = 0.5 处的取值与 TVD 校验

取 $r=0.5$，此时带子上界为 $\min(2\times0.5,\,2)=1$。

- minmod：$\min(0.5,\,1)=0.5$；
- van Leer：$(0.5+0.5)/(1+0.5)=0.667$；
- superbee：$\max(0,\ \min(1,1),\ \min(0.5,2))=\max(0,1,0.5)=1$；
- limitedLinear 1：$\min(2\times0.5/1,\,1)=1$。

四者都 $\le 1$，校验通过。superbee 在 $r=0.5$ 就顶到上界，这解释了它在阶跃附近最陡、同时最容易把本应圆滑的解压成阶梯；van Leer 在 $r$ 的整个正半轴上都留有余量，是默认配置里最省心的选择。

## 先定时间步：Péclet 数与 CFL 反算

限制器只在对流主导时才有意义，所以先把两个无量纲数算出来。取水，$\rho=1000\ \mathrm{kg/m^3}$、$\mu=1.0\times10^{-3}\ \mathrm{Pa\cdot s}$，来流 $u=2\ \mathrm{m/s}$，网格 $\Delta x=0.01\ \mathrm{m}$：

$$Pe_\Delta=\frac{\rho u\Delta x}{\mu}=\frac{1000\times2\times0.01}{1.0\times10^{-3}}=2.0\times10^{4}$$

$Pe_\Delta\gg2$，中心差分会振荡，必须启用限制器。再取 $\mathrm{CFL}=0.5$：

$$\Delta t=\frac{\mathrm{CFL}\cdot\Delta x}{u}=\frac{0.5\times0.01}{2}=2.5\times10^{-3}\ \mathrm{s}$$

域长 $L=1\ \mathrm{m}$，流过时间 $L/u=0.5\ \mathrm{s}$，折合 200 步。步数少，正适合做参数对照。

## fvSchemes 落地写法

```cpp
// system/fvSchemes
ddtSchemes      { default CrankNicolson 0.9; }
gradSchemes     { default Gauss linear; }
divSchemes
{
    default        none;
    div(phi,U)     Gauss limitedLinearV 1;   // 分量式限制，剪切层友好
    div(phi,k)     Gauss limitedLinear 1;
    div(phi,omega) Gauss limitedLinear 1;
    div(phi,nuTilda) Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes     { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes        { default corrected; }
fluxRequired         { default no; p; }
```

换成 van Leer 只需把 `div(phi,U)` 一行改成 `Gauss vanLeer`，换 superbee 改成 `Gauss superbee`。限制器函数是这一行的第二个词，系数是第三个词，改动范围只有一处。

## 单因素对照矩阵

| 工况 | div(phi,U) | CFL | Δx / m | 观察量 | 预期 |
|---|---|---|---|---|---|
| B0 | limitedLinearV 1 | 0.5 | 0.010 | 尾迹峰值 | 基准 |
| S1 | vanLeer | 0.5 | 0.010 | 尾迹峰值 | 峰值略降 |
| S2 | superbee | 0.5 | 0.010 | 尾迹峰值 | 峰值升高、阶跃变陡 |
| S3 | limitedLinearV 1 | 0.25 | 0.010 | 尾迹峰值 | 与 B0 差异应 < 1 % |
| S4 | limitedLinearV 1 | 0.5 | 0.005 | 尾迹峰值 | 向同一极限收敛 |

S3 是判据关键：$\Delta t$ 减半后目标量变化小于 1 %，说明时间误差不主导，此时 S1、S2 的差异才可归因于限制器；若 S3 差异明显，前面比较的其实是时间耗散。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶跃下游出现 $-0.08$ 的负浓度 | 限制器系数过大，或汇项未按 $S_p\le0$ 线性化 | 把该项临时改为 `Gauss upwind` 重跑，负值消失即格式无界 |
| 尾迹峰值随网格加密持续升高 | superbee 的压缩性人为抬高峰值 | 换 vanLeer 在同一网格重跑，比较峰值差 |
| 换限制器后残差曲线完全重合 | 该方程的对流项没被这一行覆盖 | 检查 `divSchemes` 中对应项是否仍是 `linear` |
| CFL 减半结果变化 8 % | 时间误差主导，限制器比较失效 | 固定限制器，CFL 取 0.5/0.25/0.125 看收敛趋势 |
| 并行后阶跃位置随分区数改变 | 限制器 stencil 跨处理器面被截断 | 单核重跑同一算例，比对阶跃坐标 |

## 参考文献

1. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5):995–1011, 1984.
2. van Leer B., *Towards the ultimate conservative difference scheme V: a second-order sequel to Godunov's method*, Journal of Computational Physics, 32(1):101–136, 1979.
3. Harten A., *High resolution schemes for hyperbolic conservation laws*, Journal of Computational Physics, 49(3):357–393, 1983.
4. Leonard B.P., *The ULTIMATE conservative difference scheme applied to unsteady one-dimensional advection*, Computer Methods in Applied Mechanics and Engineering, 88(1):17–74, 1991.
