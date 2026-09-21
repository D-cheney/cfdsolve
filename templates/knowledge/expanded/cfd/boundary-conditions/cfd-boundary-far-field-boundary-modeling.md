---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-far-field-boundary-modeling
title: "远场与开放边界：物理建模与适用边界"
summary: "从扰动衰减律反推远场距离，用环量估算远场诱导速度，说明黎曼不变量型远场条件、堵塞修正与 OpenFOAM freestream/waveTransmissive 配置。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "远场与开放边界"
  - "物理建模与适用边界"
  - "黎曼不变量"
  - "堵塞修正"
seo:
  title: "远场与开放边界：物理建模与适用边界"
  description: "从扰动衰减律反推远场距离，用环量估算远场诱导速度，说明黎曼不变量型远场条件、堵塞修正与 OpenFOAM freestream/waveTransmissive 配置。"
  keywords:
    - "远场与开放边界"
    - "物理建模与适用边界"
    - "黎曼不变量"
    - "堵塞修正"
    - "freestream"
---

# 远场与开放边界：物理建模与适用边界

远场边界的目标是让外部边界对目标量的影响小到可忽略，而不是"看起来够远"。判断够不够远有两条可算的线索：一是扰动的衰减律（二维按 $1/r$、三维按 $1/r^2$），二是边界条件的类型是否允许扰动无反射地穿出。把升力体的远场设在 10 倍弦长处并施加固定来流速度，等于在涡的诱导速度还没衰减到 1% 的地方强行把它按为零，升力系数会系统性偏低。本文给出远场距离的反推方法、黎曼不变量型远场条件的适用条件，以及堵塞修正。

## 扰动衰减律决定域要多大

绕流扰动的远场衰减规律由奇点的空间维数决定。二维升力体等价于一个点涡，周向诱导速度按 $1/r$ 衰减：

$$
u_\theta(r) = \frac{\Gamma}{2\pi r}, \qquad \Gamma = \frac{C_L U_\infty c}{2}
$$

其中 $\Gamma$ 为环量，$C_L$ 为升力系数，$c$ 为弦长。三维有限翼展的尾涡系统在远场退化为偶极子型，衰减加快到 $1/r^2$，因此三维外流所需的远场距离（以弦长或展长为单位）比二维小。非升力体（钝体、圆柱）的近场由源汇项主导，也按 $1/r^2$ 衰减（三维），但尾迹中的涡量输运使有效衰减更慢，工程上仍按升力体标准保守取值。

判断"够远"的判据是远场处的扰动速度与来流之比。工程上取 $u_\theta/U_\infty < 0.1\%$ 作为可忽略阈值，由此反推所需半径。注意这是相对判据：升力系数越大、来流越慢，所需的 $r/c$ 越大。

## 一次可核对的远场距离估算

取翼型弦长 $c = 1.0\ \mathrm{m}$、来流马赫数 $M_\infty = 0.20$、升力系数 $C_L = 0.5$。标准大气声速 $a = 340.3\ \mathrm{m/s}$，则

$$
U_\infty = M_\infty a = 0.20 \times 340.3 = 68.1\ \mathrm{m/s}
$$

环量

$$
\Gamma = \frac{C_L U_\infty c}{2} = \frac{0.5 \times 68.1 \times 1.0}{2} = 17.0\ \mathrm{m^2/s}
$$

在 $r = 20c = 20\ \mathrm{m}$ 处，诱导速度

$$
u_\theta = \frac{17.0}{2\pi \times 20} = 0.135\ \mathrm{m/s}, \qquad \frac{u_\theta}{U_\infty} = \frac{0.135}{68.1} = 0.20\%
$$

在 $r = 40\ \mathrm{m}$ 处 $u_\theta = 0.068\ \mathrm{m/s}$，比值 $0.10\%$；在 $r = 10\ \mathrm{m}$ 处比值 $0.40\%$。因此对本例，只有 $r \ge 40c$ 才能满足 $0.1\%$ 阈值，而常用的 $20c$ 只到 $0.2\%$。这个估算解释了为什么升力体算例的远场常取 $50c \sim 100c$，而钝体算例 $20c$ 就够了。

## 特征变量与远场条件的给定方式

可压缩流的远场不能简单地固定所有变量，否则会把本该穿出的扰动反射回域内。正确的做法是按黎曼不变量区分进出信息。一维等熵关系给出两个不变量：

$$
J_\pm = u_n \pm \frac{2a}{\gamma - 1}
$$

亚声速远场中，$J_- = u_n - 2a/(\gamma-1)$ 由域外（自由来流）传入，$J_+ = u_n + 2a/(\gamma-1)$ 由域内外推。代入 $\gamma = 1.4$、$a = 340.3\ \mathrm{m/s}$、$u_n = 68.1\ \mathrm{m/s}$：

$$
J_+ = 68.1 + \frac{2 \times 340.3}{0.4} = 68.1 + 1701.5 = 1769.6\ \mathrm{m/s}
$$

远场边界在每个面元上保留 $J_-$ 为来流值、允许 $J_+$ 随域内解变化，从而让出射波自由穿出。超声速远场则全部由上游值确定，不设不变量外推。工程实现上，OpenFOAM 的 `freestream` 类型对速度与湍流量按"入流给来流值、出流零梯度"处理，`waveTransmissive` 对压力用类似辐射条件的处理，两者常配对使用。

## 不可压与可压的远场差异

不可压缩远场没有波的传播，信息以椭圆方式瞬间传递，因此远场距离的影响比可压缩流更"整体"：域缩小时不只是局部扰动增加，而是整个压力场被重新标定。可压缩亚声速流中远场误差主要通过声波反馈体现，表现为目标量的高频振荡。判别方法是看残差与目标量的时程：若远场太近，可压缩算例的 $C_L$ 时程会出现与远场距离相关的低频振荡，不可压算例则表现为收敛后 $C_L$ 的稳态偏差。

## 堵塞效应与镜像涡

当外流算例使用有限尺寸的"风洞式"远场（上下为壁面）时，必须计入堵塞。二维物体在高度 $H$ 的通道中，实心堵塞系数为

$$
\epsilon_s = \frac{\pi^2}{48} \left( \frac{c}{H} \right)^2
$$

取 $c = 1.0\ \mathrm{m}$、$H = 40\ \mathrm{m}$：

$$
\epsilon_s = \frac{\pi^2}{48} \left( \frac{1.0}{40} \right)^2 = 0.2056 \times 6.25\times 10^{-4} = 1.29\times 10^{-4} = 0.013\%
$$

$0.013\%$ 可忽略。若把 $H$ 降到 $5\ \mathrm{m}$，$\epsilon_s = 0.2056 \times 0.04 = 0.82\%$，对应的速度修正约 $0.8\%$，直接进入升力系数的误差预算。更隐蔽的是镜像涡效应：壁面会引入无穷多个镜像涡，最近一对镜像涡对翼型的诱导下洗约为 $u_i/U_\infty \approx (c/H)^2/(2\pi)$ 量级，在 $H = 5\ \mathrm{m}$ 时约 $0.64\%$，与实心堵塞同量级。因此外流算例应优先用无反射的开放远场（`freestream` + `waveTransmissive`），而不是带壁面的风洞式远场，除非目的就是复现风洞修正。

## 远场字典配置

```text
// 0/U：不可压或亚声速外流，远场用 freestream
boundaryField
{
    farfield
    {
        type            freestream;
        freestreamValue uniform (68.1 0 0);      // M=0.20 对应的来流速度 m/s
    }
}

// 0/p：可压缩外流，压力用波透射条件，避免声波反射
boundaryField
{
    farfield
    {
        type            waveTransmissive;
        field           p;
        gamma           1.4;
        fieldInf        101325;                  // 远场静压 Pa
        lInf            20;                      // 松弛长度，取 0.5 ~ 1 倍域尺度 m
    }
}

// 0/k：远场湍流量按来流强度给，避免默认值污染
boundaryField
{
    farfield
    {
        type            freestream;
        freestreamValue uniform 0.0456;          // I=0.1%, U=68.1 m/s 时 k=1.5*(U*I)^2
    }
}
```

`lInf` 是 `waveTransmissive` 的关键参数，它决定辐射条件的松弛尺度，经验取域尺度的 $0.5 \sim 1$ 倍。设得过小会使边界对压力扰动过于敏感，表现为压力场在远场附近出现高频抖动。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 升力系数比薄翼理论低 $5\%$ 以上 | 远场太近，环量诱导速度被强制为零 | 用 $\Gamma/(2\pi r U)$ 估远场扰动比，应 $< 0.1\%$ |
| 压力场在远场附近高频抖动 | `waveTransmissive` 的 `lInf` 过小 | 把 `lInf` 调到 $0.5 \sim 1$ 倍域尺度，看抖动是否消失 |
| $C_L$ 时程出现低频振荡 | 远场距离不足，声波反馈 | 远场外移一倍重算，比较振荡幅度 |
| 壁面式远场算例阻力偏高 $0.8\%$ | 实心堵塞与镜像涡未修正 | 用 $\epsilon_s = \pi^2 c^2/(48H^2)$ 估算并扣除 |
| 亚声速远场给固定压力导致残差平台 | 固定了应外推的特征变量 | 改用黎曼不变量型条件，检查压力残差是否下降 |
| 远场湍流量出现异常值 | 用了默认 $\nu_t/\nu$ 而非来流强度 | 输出远场面 $\nu_t/\nu$，应与来流反算值一致 |

## 参考文献

1. Thomas J.L., Salas M.D., "Far-Field Boundary Conditions for Transonic Lifting Solutions to the Euler Equations", *AIAA Journal*, 24(7), 1074-1080, 1986.
2. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
3. Abbott I.H., von Doenhoff A.E., *Theory of Wing Sections*, Dover Publications, 1959.
4. Barlow J.B., Rae W.H., Pope A., *Low-Speed Wind Tunnel Testing*, 3rd ed., Wiley, 1999.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, freestream and waveTransmissive boundaries, v2312, 2023.
