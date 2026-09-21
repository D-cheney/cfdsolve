---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-mass-conservation-engineering-setup
title: "质量守恒与连续性：工程设置与参数选择"
summary: "给出连续性方程在求解器中的两种形态与对应设置：压力方程的收敛判据、时间步与柯朗数上限、逐 patch 通量审计的函数对象配置，并用一条水管算例完成流量不平衡率的可核对手算。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "质量守恒与连续性"
  - "工程设置与参数选择"
  - "通量审计"
  - "压力方程"
seo:
  title: "质量守恒与连续性：工程设置与参数选择"
  description: "给出连续性方程在求解器中的两种形态与对应设置：压力方程的收敛判据、时间步与柯朗数上限、逐 patch 通量审计的函数对象配置，并用一条水管算例完成流量不平衡率的可核对手算。"
  keywords:
    - "质量守恒与连续性"
    - "工程设置与参数选择"
    - "通量审计"
    - "压力方程"
    - "连续性误差"
---

# 质量守恒与连续性：工程设置与参数选择

质量守恒在 CFD 里不是一个需要额外施加的约束，而是压力方程的解所要满足的条件；也正因如此，"残差降下去了但流量对不上"是最常见的隐性错误。本文给出连续性方程在两类求解器中的形态、时间步与压力修正的设置取值，以及逐 patch 通量审计的完整做法。

## 连续性方程的两种形态

守恒形式对所有求解器通用：

$$
\frac{\partial\rho}{\partial t}+\nabla\cdot(\rho\mathbf{u})=S_m
$$

不可压求解器不直接解它，而是把密度移出散度算子，得到运动学约束：

$$
\nabla\cdot\mathbf{u}=0
$$

然后用压力方程强制它成立。压力方程由动量离散的预测量 $\mathbf{HbyA}$ 构造：

$$
\nabla\cdot\left(\frac{1}{a_P}\nabla p\right)=\nabla\cdot\mathbf{HbyA}
$$

$a_P$ 是动量方程的对角系数。压力在这里扮演拉格朗日乘子的角色：它不改变总动量平衡，只负责把速度场投影到散度为零的空间。因此压力方程的收敛程度直接等于质量守恒的满足程度——这是设置时最需要记住的一条因果链。

## 时间步与柯朗数

瞬态求解应开启自适应时间步，把流场柯朗数压在 1 以下：

$$
\mathrm{Co}=\frac{|\mathbf{u}|\Delta t}{\Delta x}
$$

```
// system/controlDict
adjustTimeStep  yes;
maxCo           0.9;
maxDeltaT       1.0e-03;

// system/fvSolution —— 压力修正次数决定连续性误差
PIMPLE
{
    nOuterCorrectors         2;
    nCorrectors              3;
    nNonOrthogonalCorrectors 1;
}

// system/controlDict —— 逐 patch 记录体积通量，用于质量审计
functions
{
    inletFlow
    {
        type            surfaceFieldValue;
        surfaceFormat   none;
        fields          (phi);
        operation       sum;
        regionType      patch;
        name            inlet;
        writeFields     false;
    }
}
```

`nCorrectors` 是 PISO 的压力修正次数，取 2～3 时连续性误差通常能降到 $10^{-6}$ 量级；取 1 虽然便宜，但 `global` 项往往停留在 $10^{-3}$ 不再下降。`nNonOrthogonalCorrectors` 针对网格非正交性，取值应与最大非正交角挂钩：非正交角小于 $60^\circ$ 取 1 即可，$70^\circ$ 以上建议取 2～3。

## 手算：入口流量与不平衡率

一条圆管水路：密度 $\rho=998.2\ \mathrm{kg/m^3}$（$20\ ^\circ\mathrm{C}$ 水），入口面积 $A=0.01\ \mathrm{m^2}$，入口速度 $U=2.0\ \mathrm{m/s}$。质量流量

$$
\dot m_{\mathrm{in}}=\rho UA=998.2\times2.0\times0.01=19.964\ \mathrm{kg/s}
$$

对应的体积流量 $\dot V=UA=2.0\times0.01=0.02\ \mathrm{m^3/s}$，即 OpenFOAM 中入口 patch 上 $\sum\varphi=+0.02$，出口应为 $-0.02$。

若求解器输出出口质量流量 $19.940\ \mathrm{kg/s}$，不平衡率

$$
\varepsilon_m=\frac{\left|\dot m_{\mathrm{in}}-\dot m_{\mathrm{out}}\right|}{\dot m_{\mathrm{in}}}=\frac{0.024}{19.964}=1.2\times10^{-3}
$$

即 $0.12\%$，对于工程验收偏高，应把 `nCorrectors` 提到 3 并检查出口边界类型。若出口质量流量为 $19.960\ \mathrm{kg/s}$，不平衡率降到 $2.0\times10^{-4}$，即 $0.02\%$，可以接受。

时间步侧核对：单元尺度 $\Delta x=2.0\ \mathrm{mm}$，若手动固定 $\Delta t=1.0\times10^{-3}\ \mathrm{s}$，则 $\mathrm{Co}=2.0\times1.0\times10^{-3}/2.0\times10^{-3}=1.0$，已到上限；开启 `adjustTimeStep` 后求解器会把 $\Delta t$ 压到 $\Delta t=0.9\Delta x/|\mathbf{u}|=0.9\times2.0\times10^{-3}/2.0=9.0\times10^{-4}\ \mathrm{s}$。

顺带核对流动状态：圆管水力直径 $D=\sqrt{4A/\pi}=\sqrt{4\times0.01/\pi}=0.113\ \mathrm{m}$，$20\ ^\circ\mathrm{C}$ 水 $\mu=1.002\times10^{-3}\ \mathrm{Pa\cdot s}$，

$$
Re=\frac{\rho UD}{\mu}=\frac{998.2\times2.0\times0.113}{1.002\times10^{-3}}=2.25\times10^{5}
$$

处于充分湍流区，入口湍流量必须按 $Re$ 与湍流强度给定，否则前几倍管径内的质量分配会偏离。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 每步 `global` 连续性误差同号累积 | 压力方程未收敛到容差 | 把 `nCorrectors` 从 2 提到 3，看该项是否降到 $10^{-6}$ |
| 残差很低但出入口流量差 2% | 出口速度用 `fixedValue`，与入口质量流量不匹配 | 逐 patch 对 `phi` 求和并与入口对比 |
| 不可压算例里密度出现 5% 变化 | 马赫数不低，不可压假设已失效 | 计算 $\gamma M^2/2$ 并与容差比较 |
| 局部单元质量不守恒 | 网格非正交度大而修正次数不足 | `nNonOrthogonalCorrectors` 由 1 加到 3，看是否改善 |
| 瞬态解质量随时间缓慢漂移 | 关闭自适应步且柯朗数超过 1 | 监控 `maxCo` 与累计连续性误差 |
| 出入口流量相等但压力场不平 | 压力参考点缺失或与封闭边界冲突 | 检查 `pressureReference` 设置是否与边界类型相容 |

## 验收时要留的三条证据

第一条是逐 patch 的体积通量积分，覆盖全部进出口与壁面（壁面应为零），并给出不平衡率的具体数值。第二条是压力方程的最终残差与 `nCorrectors` 的对应关系，用来证明容差不是靠放松换来的。第三条是柯朗数的时间序列，确认整个统计窗口内没有被时间步放大掩盖的局部超限。三条证据都指向同一个物理量——面通量，因此它们可以互相校验：任一条对不上，优先怀疑边界类型而不是数值格式。

## 参考资料

1. Patankar S.V., Numerical Heat Transfer and Fluid Flow, Hemisphere, 1980.
2. Issa R.I., "Solution of the implicitly discretised fluid flow equations by operator-splitting", Journal of Computational Physics, 62(1), 1986, 40-65.
3. Rhie C.M., Chow W.L., "Numerical study of the turbulent flow past an airfoil with trailing edge separation", AIAA Journal, 21(11), 1983, 1525-1532.
4. Versteeg H.K., Malalasekera W., An Introduction to Computational Fluid Dynamics: The Finite Volume Method, 2nd ed., Pearson, 2007.
