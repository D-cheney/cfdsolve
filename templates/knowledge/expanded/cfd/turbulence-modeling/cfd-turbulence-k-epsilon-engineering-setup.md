---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-k-epsilon-engineering-setup
title: "k–epsilon 模型：工程设置与参数选择"
summary: "把标准 k-ε 落到求解器字典层面：常数覆盖、入口 k 与 ε 的换算口径、壁函数类型与首层高度的联动、松弛因子与限幅设置、浮力与可压缩修正开关，附矩形风道完整算例。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "k–epsilon 模型"
  - "工程设置与参数选择"
  - "壁函数"
  - "入口湍流量换算"
seo:
  title: "k–epsilon 模型：工程设置与参数选择"
  description: "把标准 k-ε 落到求解器字典层面：常数覆盖、入口 k 与 ε 的换算口径、壁函数类型与首层高度的联动、松弛因子与限幅设置、浮力与可压缩修正开关，附矩形风道完整算例。"
  keywords:
    - "k–epsilon 模型"
    - "工程设置与参数选择"
    - "壁函数"
    - "入口湍流量"
    - "松弛因子"
---

# k–epsilon 模型：工程设置与参数选择

标准 k-ε 的设置风险不在方程形式，而在常数口径、入口换算和近壁匹配三处细节上被悄悄改掉。本文按求解器字典的落地顺序走一遍：先确认常数写在哪个文件、再算入口 k 与 ε、然后按首层高度选壁函数、最后定松弛与限幅。算例取矩形风道，水力直径 $D_h = 0.2\,\mathrm{m}$、平均速度 $U = 15\,\mathrm{m/s}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re = 2\times10^{5}$。

## 1 三类常数在字典里到底写在哪

标准 k-ε 的五个常数 $C_\mu = 0.09$、$C_{\varepsilon 1} = 1.44$、$C_{\varepsilon 2} = 1.92$、$\sigma_k = 1.0$、$\sigma_\varepsilon = 1.3$ 必须逐项核对，而不是信任软件默认值。默认值一般与上列一致，但迁移项目时常被上一版算例的覆盖值带过来：

```cpp
// constant/turbulenceProperties
RAS
{
    RASModel        kEpsilon;
    turbulence      on;
    printCoeffs     on;      // 打开后 log 里会打印实际生效的常数
}

kEpsilonCoeffs
{
    Cmu         0.09;
    C1          1.44;   // C_eps1
    C2          1.92;   // C_eps2
    C3          0.0;    // 浮力对 epsilon 方程的贡献系数
    sigmak      1.0;
    sigmaEps    1.3;
}
```

`printCoeffs on` 是最省事的防错手段：它把生效常数打进日志，验收时直接与上表比对，不必逐层追查字典继承关系。RNG 变体的 $C_{\varepsilon 2}$ 与可实现变体的 $A_0$ 都不等于标准值，混用会让比较失去意义。

## 2 水力直径与入口湍流量的换算口径

由湍流强度与长度尺度换算入口量：

$$k = \frac{3}{2}\left(U I\right)^{2}, \qquad \varepsilon = C_\mu^{3/4}\frac{k^{3/2}}{l}, \qquad l = 0.07\,D_h$$

取 $I = 5\%$，则 $k = 1.5\times(15\times0.05)^{2} = 0.844\,\mathrm{m^2/s^2}$；取 $l = 0.07\times0.2 = 0.014\,\mathrm{m}$，则 $\varepsilon = 0.1643\times0.844^{1.5}/0.014 = 9.10\,\mathrm{m^2/s^3}$。由此得到入口湍流黏度

$$\mu_t = \rho C_\mu \frac{k^{2}}{\varepsilon} = 1.2\times0.09\times\frac{0.712}{9.10} = 8.45\times10^{-3}\,\mathrm{Pa\cdot s}$$

分子黏度 $\mu = 1.8\times10^{-5}\,\mathrm{Pa\cdot s}$，故 $\mu_t/\mu \approx 470$，落在内流核心的常见区间内。若这个比值算出来是 $10^{4}$ 量级，说明长度尺度填得过大，应回到 $l$ 的取值上找原因。

一个容易被忽略的事实：由 $I$ 和 $l$ 得到的入口量与对数律平衡态并不相等。对数律区的平衡值是 $k = u_\tau^{2}/\sqrt{C_\mu}$、$\varepsilon = u_\tau^{3}/(\kappa y)$。本算例壁面剪切 $C_f = 0.316\,Re^{-0.25} = 0.0149$，$\tau_w = f\rho U^{2}/8 = 0.504\,\mathrm{Pa}$，$u_\tau = 0.648\,\mathrm{m/s}$，于是 $k_{\text{平衡}} = 1.40\,\mathrm{m^2/s^2}$，是入口值 0.844 的 1.66 倍；在 $y = 0.01\,\mathrm{m}$ 处 $\varepsilon_{\text{平衡}} = 66.4\,\mathrm{m^2/s^3}$，是入口值的 7.3 倍。这一差距决定了发展段长度，也解释了为什么短域算例对入口湍流量格外敏感。

## 3 壁函数类型与首层高度的联动

首层高度仍由 y+ 目标反算。由 $\tau_w = 0.504\,\mathrm{Pa}$ 得 $u_\tau = 0.648\,\mathrm{m/s}$，$\nu/u_\tau = 23.1\,\mathrm{\mu m}$，因此 $y^{+} = 50$ 对应单元中心高度 1.16 mm、单元高度 2.31 mm。

壁面边界类型必须与这一高度匹配：

```cpp
// 0/k
wall { type kqRWallFunction;      value uniform 0.844; }
// 0/epsilon
wall { type epsilonWallFunction;  value uniform 9.10;
       Cmu 0.09; kappa 0.41; E 9.8; }
// 0/nut
wall { type nutkWallFunction;     value uniform 0; }
```

这里有一个跨软件迁移的常见陷阱：OpenFOAM 的 `epsilonWallFunction` 用 $E = 9.8$，对应 $B = \ln E/\kappa = 5.57$，而教科书里 $u^{+} = \ln y^{+}/\kappa + B$ 常写 $B = 5.2$（对应 $E \approx 8.4$）。两者在对数律区内给出约 2.5% 的 $u^{+}$ 差异，若把两个口径的 $E$ 与 $B$ 混用，壁面剪切会被系统性偏置。

## 4 松弛因子、限幅与收敛判据

ε 方程的源项与汇项量级接近、符号相反，是收敛最困难的一环，因此欠松弛通常压得比 k 更低。

| 量 | 常规欠松弛 | 强分离或强旋流 | 说明 |
|---|---|---|---|
| 压力 p | 0.3 | 0.2 | 与压力—速度耦合算法一起调 |
| 速度 U | 0.7 | 0.5 | 降到 0.5 以下会显著拉长迭代 |
| 湍动能 k | 0.7 | 0.5 | 与 ε 同步调整 |
| 耗散率 ε | 0.7 | 0.4 | 最难收敛的方程 |
| 湍流黏度 $\mu_t$ | 1.0 | 1.0 | 由 k、ε 代数求得，一般不单独松弛 |

限幅同样必要：ε 必须保持正值，$\mu_t$ 需要设上限以避免入口长度尺度填错时把整个流场黏住。收敛判据不能只看残差，应同时满足三项：压力残差低于 $10^{-4}$、k 与 ε 残差低于 $10^{-5}$、目标积分量（本算例为进出口总压差）在连续 500 次迭代内变化小于 0.5%。

## 5 浮力、可压缩与旋流修正开关

三组开关默认关闭，但对应场景下必须打开，且打开后要重新核对常数：

- 浮力生成项：自然对流、热羽流、大温差换热器。层流普朗特数取 0.7（空气）时，湍流普朗特数常取 0.85，$C_3$ 在垂直分层方向取 1.0、水平分层方向取 0.0。
- 可压缩修正（膨胀耗散）：马赫数超过 0.3 的射流与跨声速内流，需在 ε 方程中加入膨胀耗散源项。
- 旋流修正：切向速度与轴向速度之比超过 0.5 的旋流器与旋风分离器，标准模型会低估切向速度衰减，应换 RNG 或带旋流修正的变体。

开关状态必须写进结果台账，否则同一模型名下的两次计算无法比较。

## 6 求解异常的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代 20 步内残差发散 | 入口 ε 过小使 $\mu_t$ 达 $10^{4}$ 量级，动量方程被强源项冲击 | 打印入口 $\mu_t/\mu$，与 $\rho C_\mu k^{2}/\varepsilon$ 手算值比对 |
| 压力降比经验值低 15%，速度剖面在对数律区偏低 | 首层 y+ 在 10 附近，`epsilonWallFunction` 的对数律外推失效 | 保持流向网格不变，把首层高度调到 y+≈50 重算 |
| 长直段前 20 倍直径内压降偏高 | 入口 $k$ 低于对数律平衡值 1.66 倍，发展段被拉长 | 把入口 k 改为 $u_\tau^{2}/\sqrt{C_\mu}$ 后重算，比较发展段长度 |
| 换 RNG 后同一网格结果差 8% | 两变体的 $C_{\varepsilon 2}$ 与应变率相关项不同，近壁要求也不同 | 打印生效常数，并用同一 $\tau_w$ 重算 y+ 确认网格仍匹配 |
| 温度场出现非物理分层 | 浮力开关未开，$\varepsilon$ 方程缺少 $C_3$ 项 | 打开浮力项并置 $C_3 = 1.0$，观察分层强度是否与瑞利数趋势一致 |

## 7 参考来源

1. Launder B. E., Spalding D. B., "The numerical computation of turbulent flows," *Computer Methods in Applied Mechanics and Engineering*, 1974.
2. Jones W. P., Launder B. E., "The prediction of laminarization with a two-equation model of turbulence," *International Journal of Heat and Mass Transfer*, 1972.
3. Patel V. C., Rodi W., Scheuerer G., "Turbulence models for near-wall and low Reynolds number flows: A review," *AIAA Journal*, 1985.
4. OpenFOAM Foundation, *OpenFOAM User Guide*, v11, 2024.
