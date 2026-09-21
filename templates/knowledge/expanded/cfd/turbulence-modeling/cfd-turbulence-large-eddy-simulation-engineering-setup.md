---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-large-eddy-simulation-engineering-setup
title: "大涡模拟：工程设置与参数选择"
summary: "大涡模拟的网格、时间步与统计时长怎么定：由湍流耗散率估 Kolmogorov 尺度与 Taylor 尺度、按分辨率比反推网格量、用三个时间尺度约束时间步与采样长度、壁面解析与壁面模化两条路线的取舍。"
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
  - "大涡模拟"
  - "工程设置与参数选择"
  - "亚格子模型"
  - "Kolmogorov 尺度"
seo:
  title: "大涡模拟：工程设置与参数选择"
  description: "大涡模拟的网格、时间步与统计时长怎么定：由湍流耗散率估 Kolmogorov 尺度与 Taylor 尺度、按分辨率比反推网格量、用三个时间尺度约束时间步与采样长度、壁面解析与壁面模化两条路线的取舍。"
  keywords:
    - "大涡模拟"
    - "工程设置与参数选择"
    - "亚格子模型"
    - "Kolmogorov 尺度"
    - "壁面模化"
---

# 大涡模拟：工程设置与参数选择

大涡模拟的成本不是靠调参降下来的，而是靠分辨率判据定下来的：先用湍流耗散率估出 Kolmogorov 尺度，再按可接受的分辨率比反推网格，最后用涡脱落周期与流动通过时间约束时间步和采样长度。任何跳过这三步的“先跑起来看看”都会在统计量上付出代价。本文以圆柱绕流为例，直径 $D = 0.1\,\mathrm{m}$、来流 $U = 10\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re_D = 6.7\times10^{4}$，处于亚临界涡脱落区间。

## 1 滤波尺度与亚格子黏度的量纲关系

LES 对速度场做空间滤波，滤波宽度取单元体积的立方根 $\Delta = V^{1/3}$。Smagorinsky 模型的亚格子黏度为

$$\nu_{sgs} = \left(C_s\Delta\right)^{2}\left|\bar S\right|, \qquad \left|\bar S\right| = \sqrt{2\bar S_{ij}\bar S_{ij}}$$

均匀湍流标定的 $C_s = 0.17$，工程算例常用 0.1 以减小过度耗散。壁面解析时必须加 Van Driest 阻尼 $\left(1 - e^{-y^{+}/A^{+}}\right)^{2}$，$A^{+} = 25$，否则壁面附近的 $\nu_{sgs}$ 不趋于零。

WALE 模型不需要阻尼，其形式基于速度梯度张量的平方：

$$\nu_{sgs} = \left(C_w\Delta\right)^{2}\frac{\left(S^{d}_{ij}S^{d}_{ij}\right)^{3/2}}{\left(\bar S_{ij}\bar S_{ij}\right)^{5/2} + \left(S^{d}_{ij}S^{d}_{ij}\right)^{5/4}}, \qquad C_w = 0.325$$

在纯剪切区 WALE 的 $\nu_{sgs}$ 自动趋于零，这是它比 Smagorinsky 更适合剪切主导流动的原因。判断选型是否合理，看后处理的 $\nu_{sgs}/\nu$：体区应低于 20。取 $\Delta = 5\,\mathrm{mm}$、$\left|\bar S\right| = 100\,\mathrm{s^{-1}}$，Smagorinsky 给出 $\nu_{sgs} = (0.17\times0.005)^{2}\times100 = 7.2\times10^{-5}\,\mathrm{m^2/s}$，比值 4.8；若改用 $C_s = 0.1$ 则为 $2.5\times10^{-5}\,\mathrm{m^2/s}$、比值 1.7。两者都合格，但 $C_s = 0.17$ 在粗网格上会把亚格子耗散推到主导地位。

## 2 由耗散率估算 Kolmogorov 尺度并反推网格

耗散率用大尺度量估算：$\varepsilon \approx u'^{3}/L$，其中 $u' = \sqrt{2k/3}$。取 $k = 0.06\,\mathrm{m^2/s^2}$ 得 $u' = 0.20\,\mathrm{m/s}$，取含能尺度 $L = 0.01\,\mathrm{m}$ 得 $\varepsilon = 0.80\,\mathrm{m^2/s^3}$。于是

$$\eta = \left(\frac{\nu^{3}}{\varepsilon}\right)^{1/4} = 2.55\times10^{-4}\,\mathrm{m}, \qquad \lambda = \sqrt{\frac{15\nu u'^{2}}{\varepsilon}} = 3.35\times10^{-3}\,\mathrm{m}$$

$$Re_\lambda = \frac{u'\lambda}{\nu} = \sqrt{\frac{15u'^{4}}{\nu\varepsilon}} = 44.7$$

$Re_\lambda = 44.7$ 是典型的 LES 工况量级（DNS 通常需要 $Re_\lambda > 100$）。网格按 $\Delta = 10\eta = 2.55\,\mathrm{mm}$ 设计，$\lambda/\Delta = 1.3$。若对整域 $20D\times10D\times4D = 2\times1\times0.4\,\mathrm{m}$ 都用这个分辨率，单元数为 $0.8/(2.55\times10^{-3})^{3} = 4.8\times10^{7}$，接近 5000 万——这就是壁面解析 LES 的真实门槛。

## 3 时间步与采样周期：三个时间尺度

时间步由对流 CFL 约束：$\Delta t = \mathrm{CFL}\cdot\Delta x/U$。取 $\Delta x = 5\,\mathrm{mm}$、$\mathrm{CFL} = 0.5$，得 $\Delta t = 2.5\times10^{-4}\,\mathrm{s}$。

采样长度由涡脱落周期定。亚临界圆柱的 Strouhal 数约 0.2，故 $f = St\,U/D = 20\,\mathrm{Hz}$、周期 $T = 0.05\,\mathrm{s}$，一个周期内有 200 个时间步，满足每个周期至少 100 步的要求。统计收敛需要约 100 个脱落周期，即 5 s、20000 步；瞬态舍弃段取 5 个流动通过时间 $L/U = 0.2\,\mathrm{s}$，即 1 s、4000 步。三个时间尺度必须同时满足：

$$\Delta t \le \min\left(\frac{\mathrm{CFL}\,\Delta x}{U},\; \frac{T}{100}\right), \qquad T_{\text{stat}} \ge 100\,T$$

## 4 壁面解析与壁面模化两条路线

| 路线 | 首层要求 | 流向与展向间距 | 单元数（本算例） | 适用 |
|---|---|---|---|---|
| 壁面解析 WRLES | $y^{+} < 1$，$\Delta y \approx 1.7\,\mathrm{\mu m}$ | $\Delta x^{+},\Delta z^{+} \approx 15\sim40$ | $>10^{8}$ | 低雷诺数、小域 |
| 壁面模化 WMLES | 首层单元 2 mm，单元中心 $y^{+} \approx 37$ | $\Delta \approx 0.05D = 5\,\mathrm{mm}$ | $6.4\times10^{6}$ | 工程雷诺数、大域 |

WMLES 的首层高度由壁面剪切反算。圆柱表面 $C_f$ 约 0.006，$\tau_w = 0.5C_f\rho U^{2} = 0.36\,\mathrm{Pa}$，$u_\tau = 0.548\,\mathrm{m/s}$，单元中心 1 mm 处 $y^{+} = 0.548\times10^{-3}/1.5\times10^{-5} = 36.5$，正好落在壁面模化的 30~50 区间。整域按 $\Delta = 5\,\mathrm{mm}$ 布置得到 640 万单元，是壁面解析方案的七十分之一。

## 5 入口湍流生成与统计收敛

圆柱绕流的湍流由分离自身产生，入口用均匀来流即可，不需要湍流入口。需要湍流入口的是平板边界层、槽道和叶栅这类流动，两条常用路线是：合成涡方法（在入口面上按给定 $u'$、长度尺度与时间尺度生成随机涡并叠加）；或先算一个周期性前驱域，把出口面插值到主域入口。前驱法的湍流结构最真实，代价是多一次计算；合成涡法便宜，但入口下游需要一段发展距离才能恢复真实谱。

```cpp
// constant/momentumTransport
LES
{
    LESModel        WALE;
    turbulence      on;
    delta           cubeRootVol;   // 或 maxDeltaxyz
    printCoeffs     on;
}
WALECoeffs { Cw 0.325; }

// system/controlDict
deltaT          2.5e-4;
writeInterval   0.05;              // 每 20 个脱落周期写一次
```

统计量的收敛必须用运行平均加误差棒报告。做法是把统计窗口切成 10 段，分别算 $C_d$ 与 $C_l$ 的均值与标准差，若分段均值的波动超过总均值的 2%，说明窗口还不够长，继续采样而不是停止。

## 6 设置失配的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\nu_{sgs}/\nu$ 在体区达 100 以上 | 网格过粗或 $C_s$ 偏大，亚格子耗散主导 | 输出 $\nu_{sgs}/\nu$ 场，把 $C_s$ 从 0.17 降到 0.1 比较积分量 |
| 能量谱在可解析区就出现陡降 | 网格分辨率不足，惯性子区未打开 | 计算谱斜率，检查 $-5/3$ 段是否覆盖一个数量级 |
| $C_d$ 的分段均值波动超过 5% | 统计窗口短于 100 个脱落周期 | 把窗口延长一倍，看波动是否按 $1/\sqrt{N}$ 收敛 |
| 每个脱落周期的时间步少于 50 | 时间步按对流 CFL 定得过大 | 按 $\Delta t \le T/100$ 重设并比较升力幅值 |
| 壁面模化算例首层 $y^{+} < 10$ | 首层过细，落入壁面模化与解析的过渡区 | 把首层放大到 $y^{+} \approx 37$ 重算 |
| 湍流入口下游 3 倍直径内湍流度就衰减一半 | 合成涡方法的长度尺度给得过小 | 改用前驱域或放大合成涡的长度尺度 |

## 7 亚格子模型与基准数据出处

1. Smagorinsky J., "General circulation experiments with the primitive equations: I. The basic experiment," *Monthly Weather Review*, 1963.
2. Nicoud F., Ducros F., "Subgrid-scale stress modelling based on the square of the velocity gradient tensor," *Flow, Turbulence and Combustion*, 1999.
3. Pope S. B., "Ten questions concerning the large-eddy simulation of turbulent flows," *New Journal of Physics*, 2004.
4. Williamson C. H. K., "Vortex dynamics in the cylinder wake," *Annual Review of Fluid Mechanics*, 1996.
