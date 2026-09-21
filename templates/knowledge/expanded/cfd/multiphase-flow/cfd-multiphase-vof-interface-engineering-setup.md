---
template_version: "flowlab-knowledge/1.0"
slug: cfd-multiphase-vof-interface-engineering-setup
title: "VOF 自由液面：工程设置与参数选择"
summary: "按先定时间步、再定界面压缩、最后定网格的顺序，给出 VOF 自由液面的可落地参数：cAlpha 取值、毛细时间步与界面 Courant 数的联立、Bond 数分界、接触角边界与 interFoam 配置片段。"
category:
  slug: multiphase-flow
  name: "多相流与组分输运"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "多相流与组分输运"
  - "VOF 自由液面"
  - "工程设置与参数选择"
  - "界面压缩系数"
  - "毛细时间步"
seo:
  title: "VOF 自由液面：工程设置与参数选择"
  description: "按先定时间步、再定界面压缩、最后定网格的顺序，给出 VOF 自由液面的可落地参数：cAlpha 取值、毛细时间步与界面 Courant 数的联立、Bond 数分界、接触角边界与 interFoam 配置片段。"
  keywords:
    - "VOF 自由液面"
    - "工程设置与参数选择"
    - "界面压缩系数"
    - "毛细时间步"
---

# VOF 自由液面：工程设置与参数选择

VOF 自由液面的成本与可信度在开算前就被三件事锁定：界面压缩系数决定界面锐度与是否产生假液滴，毛细时间步与界面 Courant 数共同决定时间步上限，网格尺度决定曲率能否被解析。本文按"先定时间步、再定压缩、最后定网格"的顺序给出一套可直接抄用的取值，适用于水–空气体系中界面尺度在毫米量级以上的溃坝、晃荡、液体注入与波浪问题。以下算例统一取 $\rho_w=998$ kg/m³、$\rho_a=1.2$ kg/m³、$\sigma=0.072$ N/m、$\mu_w=1.0\times10^{-3}$ Pa·s。

## 界面压缩系数决定锐度与假液滴

代数 VOF 在相输运方程中追加一个只作用于界面过渡区的压缩通量，把相分数重新压回 1 到 2 个单元内：

$$\frac{\partial \alpha_1}{\partial t} + \nabla\cdot(\alpha_1\mathbf{u}) + \nabla\cdot\left[\alpha_1\alpha_2\,c_\alpha|\mathbf{u}|\hat{\mathbf{n}}\right]=0,\qquad \hat{\mathbf{n}}=\frac{\nabla\alpha_1}{|\nabla\alpha_1|+\delta}$$

其中 $c_\alpha$ 即 OpenFOAM 的 `cAlpha`，$\delta$ 是防止除零的小量。$c_\alpha=1$ 时压缩项与对流项同量级，界面维持在最锐状态；$c_\alpha=0$ 退化为纯迎风，界面会被数值扩散抹开到 5 到 10 个单元，表面张力与接触角随之失真。落地取值：平滑工况用 1.0，出现锯齿或飞溅破碎时降到 0.5 到 0.25；`nAlphaCorr` 取 1，`nAlphaSubCycles` 取 2 到 4，`icAlpha` 保持 0。

## 毛细时间步与界面 Courant 数谁更紧

表面张力在显式格式下受毛细波速限制，其时间步上界为

$$\Delta t_\sigma = \sqrt{\frac{\rho_m h^{3}}{2\pi\sigma}}$$

取水–空气的算术平均密度 $\rho_m=(998+1.2)/2\approx 500$ kg/m³，网格 $h=1$ mm $=1\times10^{-3}$ m，代入得

$$\rho_m h^{3} = 500\times(10^{-3})^{3} = 5.0\times10^{-7}\ \text{kg},\qquad 2\pi\sigma = 0.452\ \text{N/m}$$

$$\Delta t_\sigma = \sqrt{5.0\times10^{-7}/0.452} = \sqrt{1.105\times10^{-6}} = 1.05\times10^{-3}\ \text{s}$$

再乘 0.5 的安全系数，得 $\Delta t_\sigma \le 5.3\times10^{-4}$ s。界面 Courant 数给出另一个上限，它限制单步内界面不穿越多个单元：

$$Co_\alpha = \frac{|\mathbf{u}|\,\Delta t}{h} \le 0.25 \;\Rightarrow\; \Delta t \le \frac{0.25\times10^{-3}}{1.5} = 1.67\times10^{-4}\ \text{s}$$

在特征流速 $|\mathbf{u}|=1.5$ m/s 时，Courant 限制比毛细限制紧约 3 倍，初始时间步应取 $1.5\times10^{-4}$ s 量级。

## 曲率解析度与 Bond 数分界

曲率由相分数梯度的散度估计，网格越粗噪声越大。经验门槛是界面被至少 3 到 5 个单元覆盖，液滴问题再要求 $R/h \ge 10$。静止液滴的 Laplace 压差给出可直接核对的标尺：

$$\Delta p = \frac{2\sigma}{R},\qquad R = 1\ \text{mm} \Rightarrow \Delta p = \frac{2\times0.072}{10^{-3}} = 144\ \text{Pa}$$

若求解器报告的界面附近最大速度换算成毛细数 $Ca=\mu_w u_{sp}/\sigma$ 超过 $10^{-3}$，说明曲率噪声已在驱动非物理流动，此时 144 Pa 的 Laplace 压差也会被污染。重力与表面张力的分界由毛细长度给出：

$$\ell_c = \sqrt{\frac{\sigma}{\rho_w g}} = \sqrt{\frac{0.072}{998\times9.81}} = 2.7\times10^{-3}\ \text{m}$$

即 2.7 mm。Bond 数 $Bo=\rho_w g L^{2}/\sigma$ 在 $L=1$ mm 时为 0.136，重力可忽略；在 $L=1$ cm 时为 13.6，重力主导。据此决定是否必须开启表面张力与壁面接触角。

## 一份可直接套用的 interFoam 配置

```cpp
// system/fvSolution
"alpha.water"
{
    nAlphaCorr      1;
    nAlphaSubCycles 2;
    cAlpha          1.0;      // 飞溅破碎段降到 0.5
    MULESCorr       yes;
    icAlpha         0;
    nLimiterIter    3;
}
// system/fvSchemes
div(phi,alpha)     Gauss vanLeer;
div(phirb,alpha)   Gauss interfaceCompression;
// 0/alpha.water 壁面边界
type            contactAngle;
theta0          70;        // 静态角，deg
thetaA          90;        // 推进角
thetaR          60;        // 后退角
uTheta          0.1;       // 动态角速度尺度，m/s
```

`uTheta` 取 0.1 m/s 表示接触线速度达到该量级时动态角在 60° 到 90° 之间过渡。微通道问题中该值的不确定度常主导结果，必须与实测动态角一同标定，不能沿用默认。

## 参数取值与依据

| 参数 | 推荐取值 | 依据 |
|---|---|---|
| cAlpha | 1.0，破碎工况 0.5 | 界面锐度与假液滴的权衡 |
| 界面 Courant 数 | ≤ 0.25 | 单步界面不穿越多单元 |
| 网格 $h$ | ≤ 液滴半径/10 | 曲率解析度 |
| 时间步 | $\min(\Delta t_\sigma,\ Co_\alpha h/|\mathbf{u}|)$ | 两约束取紧 |
| 界面单元数 | ≥ 3～5 | 抑制寄生流 |
| 初始化 | 几何区域直接置 $\alpha=1$ | 避免大量模糊界面单元 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面出现锯齿状毛刺 | cAlpha 过大或界面欠解析 | 固定网格把 cAlpha 从 1.0 降到 0.5，看毛刺是否减弱 |
| 液滴体积逐时漂移 | 界面 Courant 数超限致通量误差 | 打印 max Co_α，若大于 0.25 则时间步减半 |
| 静止液滴内部持续流动 | 曲率噪声驱动寄生流 | 算 $Ca=\mu_w u_{sp}/\sigma$，超 $10^{-3}$ 则加密界面网格 |
| 液柱初始即振荡 | 初始化界面与静水压不平衡 | 关重力算 0.1 s，压力场仍漂移则重设初始 $\alpha$ |
| 接触角方向相反 | 法向符号或测量相约定错误 | 交换 $\theta_0$ 的补角，观察润湿趋势是否翻转 |

## 落地顺序与延伸阅读

先按最大预期流速算出 $Co_\alpha$ 时间步，再算 $\Delta t_\sigma$ 并取二者较小值；随后按目标液滴尺度确定 $h$，最后才调 cAlpha 与子循环数。每次只动一个参数，并同步记录界面 Courant 数与每相总体积，作为该参数是否可用的判据。

1. Hirt, C.W. & Nichols, B.D., "Volume of Fluid (VOF) Method for the Dynamics of Free Boundaries," *Journal of Computational Physics*, 39(1), 1981.
2. Brackbill, J.U., Kothe, D.B. & Zemach, C., "A Continuum Method for Modeling Surface Tension," *Journal of Computational Physics*, 100(2), 1992.
3. Rusche, H., "Computational Fluid Dynamics of Dispersed Two-Phase Flows at High Phase Fractions," PhD thesis, Imperial College London, 2002.
4. Lafaurie, B., Nardone, C., Scardovelli, R., Zaleski, S. & Zanetti, G., "Modelling Merging and Fragmentation in Multiphase Flows with SURFER," *Journal of Computational Physics*, 113(1), 1994.
5. Roenby, J., Bredmose, H. & Jasak, H., "A Computational Method for Sharp Interface Advection," *Royal Society Open Science*, 3(11), 2016.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, v2312, 2023.
