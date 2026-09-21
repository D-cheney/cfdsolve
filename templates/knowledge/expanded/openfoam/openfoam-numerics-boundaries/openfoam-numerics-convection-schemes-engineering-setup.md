---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-convection-schemes-engineering-setup
title: "divSchemes 对流格式：工程设置与参数选择"
summary: "给出可抄用的 divSchemes 字典、限制器系数的取值依据、三轮单因素升阶对照设计，以及极值、守恒与限制器统计三类验收指标，说明网格尺寸与 maxCo 如何决定格式阶数的实际上限。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "divSchemes 对流格式"
  - "工程设置与参数选择"
  - "linearUpwind"
  - "limitedLinear"
seo:
  title: "divSchemes 对流格式：工程设置与参数选择"
  description: "给出可抄用的 divSchemes 字典、限制器系数的取值依据、三轮单因素升阶对照设计，以及极值、守恒与限制器统计三类验收指标，说明网格尺寸与 maxCo 如何决定格式阶数的实际上限。"
  keywords:
    - "divSchemes 对流格式"
    - "工程设置与参数选择"
    - "limitedLinear 系数"
    - "bounded 前缀"
    - "Courant 数"
---

# divSchemes 对流格式：工程设置与参数选择

多数不可压缩算例里，`div(phi,U)` 用 `bounded Gauss linearUpwind grad(U)`、湍流量用 `bounded Gauss limitedLinear 1` 就能覆盖九成需求，真正的工程量在于把限制器系数、`bounded` 前缀、时间步与网格尺寸配成一套自洽的组合。本文给出可直接落地的字典、每个数字的取值依据、三轮单因素升阶对照，以及极值、守恒、限制器统计三类验收指标。

## 限制器系数该取多少

`divSchemes` 里唯一需要按物理量调整的数字是限制器系数，它的含义是限制器函数的上界：

$$
\psi_{vanLeer}(r)=\frac{r+|r|}{1+|r|},\qquad \psi_{limitedLinear}(r)=2\min(r,1)
$$

`limitedLinear 1` 取满限制范围，是速度与湍流量的默认选择；`limitedLinearV 1` 对张量逐分量限制，在强旋流中比标量版更稳；`limitedLinear01 1` 额外把结果夹到 $[0,1]$，是多相体积分数与质量分数的唯一正确选项。把系数写成 `0.5` 会显著抬高耗散，只应在网格极差时临时使用，并在算例说明里标注为待整改项。

面值必须落在相邻单元值之间，这是有界性最直接的操作定义：

$$
\min(\phi_P,\phi_N)\le\phi_f\le\max(\phi_P,\phi_N)
$$

任何违反该式的重构都会在源项或极值附近制造新峰谷。`bounded` 前缀靠延迟修正实现这一点：

$$
\phi_f^{n+1}=\phi_f^{UP}+\left(\phi_f^{HO}-\phi_f^{UP}\right)^{n}
$$

隐式部分保留一阶迎风以维持对角占优，高阶差额显式计算并靠外迭代逐步收敛。代价是残差下降变慢，所以打开 `bounded` 后必须相应增加外迭代次数，否则会看到残差在 $10^{-3}$ 附近长时间停滞。

## 一份可复现的 fvSchemes

```cpp
ddtSchemes      { default backward; }
gradSchemes     { default cellLimited Gauss linear 1; }
divSchemes
{
    default                         none;
    div(phi,U)                      bounded Gauss linearUpwind grad(U);
    div(phi,k)                      bounded Gauss limitedLinear 1;
    div(phi,epsilon)                bounded Gauss limitedLinear 1;
    div(phi,omega)                  bounded Gauss limitedLinear 1;
    div(phi,nuTilda)                bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U)))))   Gauss linear;
}
laplacianSchemes     { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes        { default corrected; }
```

`default none` 是刻意为之：任何未显式列出的 `div` 项都会触发报错，从而避免新增方程悄悄落到一个不安全的默认格式上。

配合上面的字典，运行与取证命令固定成两条：

```bash
checkMesh -allGeometry -allTopology 2>&1 | tee log.checkMesh
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
# v14 及更早版本使用: pimpleFoam 或 simpleFoam
```

## 三轮单因素升阶对照

| 轮次 | 改动项 | 保持不动 | 记录量 |
|---|---|---|---|
| R0 基线 | 全部一阶迎风 | 网格、时间步、线性求解器 | 目标量、极值、平均迭代数 |
| R1 | 仅 `div(phi,U)` 换成 `linearUpwind grad(U)` | 其余全部 | 阻力或压降、$\psi$ 分布 |
| R2 | 仅湍流量换成 `limitedLinear 1` | 其余全部 | 湍动能极值、分离点位置 |

每轮之间只允许一项变化，否则目标量的漂移无法归因到具体格式。若 R1 与 R0 的阻力差小于 0.5%，说明一阶迎风的耗散没有污染目标量，可以放心升到 R2；若差到 3% 以上，就必须先用网格无关性把离散误差压下去，而不是急着叠加更多格式改动。

## 有界性与守恒的验收指标

验收至少覆盖三类量，缺一类都不算通过：

- 极值：体积分数与质量分数落在 $[0,1]$，湍动能、耗散率、比耗散率非负；
- 守恒：进出口质量流量的相对偏差小于 $10^{-4}$，能量或组分总通量闭合；
- 限制器统计：取值接近 0（即退化到迎风）的单元占比，超过 30% 说明网格不足或格式过保守。

对内部流动可以用压降沿程线性度做快速筛查：沿流向每 $0.1\ \mathrm{m}$ 采样一次静压，若相邻区间压降的标准差超过均值的 2%，通常意味着对流项在局部产生了非物理振荡，应先看限制器统计再看网格。

## 时间步与网格如何限制格式收益

格式的稳定性上限由 Courant 数控制：

$$
Co=\frac{\Delta t}{2}\frac{\sum_f|\phi_f|}{V_P}
$$

对 `backward` 时间格式，$Co$ 取到 5 甚至更高也不会发散，但时间离散误差会明显抹平峰值。工程建议：需要捕捉瞬态峰值时把 `maxCo` 设为 0.9 并打开 `adjustTimeStep yes`；只关心时均量时放宽到 2。以一个 $0.02\ \mathrm{m}$ 的网格和 $5\ \mathrm{m/s}$ 的来流为例，$Co=0.9$ 对应 $\Delta t\approx3.6\times10^{-3}\ \mathrm{s}$，而 $Co=2$ 允许 $\Delta t=8\times10^{-3}\ \mathrm{s}$。

网格尺度与格式阶数必须匹配。二阶格式的截断误差正比于 $\Delta x^2$，但如果长宽比超过 100 或最大非正交角超过 $70^\circ$，几何误差会吃掉二阶收益，此时应优先修网格而不是继续升阶。一个实用的判据是：把网格加密一倍后目标量的变化若大于格式换档带来的变化，就说明当前精度受网格而非格式限制。

## 参数记录与异常对照

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 开 `bounded` 后残差停在 $10^{-3}$ | 延迟修正显式项未收敛 | 把外迭代次数加倍，看残差是否继续下降 |
| 体积分数出现 $-0.01$ 的负值 | 限制器未夹到 $[0,1]$ | 换成 `limitedLinear01 1` 复跑并对比极值历史 |
| 湍动能出现负值 | 迎风加过量限制带来过大耗散 | 换 `limitedLinear 1` 并检查 $\psi$ 统计 |
| 同一算例两次运行目标量差 5% | 格式无界或时间步自适应抖动 | 固定时间步、导出极值历史逐时刻比对 |

参数一旦定稿，就应连同网格尺寸、`maxCo`、限制器系数一起写进算例说明。脱离这些条件复制格式，等于把一套在特定网格上验证过的有界设置搬到它从未被检验过的地方。

## 参考文献

1. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5), 995–1011, 1984.
2. Waterson N.P., Deconinck H., *Design principles for bounded higher-order convection schemes*, Journal of Computational Physics, 224(1), 182–207, 2007.
3. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
4. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
5. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
6. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
