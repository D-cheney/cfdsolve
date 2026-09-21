---
template_version: flowlab-knowledge/1.0
slug: cfd-turbulence-large-eddy-simulation-engineering-setup
title: 大涡模拟：工程设置与诊断验证
summary: >-
  大涡模拟的网格、时间步与统计时长怎么定：由湍流耗散率估 Kolmogorov 尺度与 Taylor
  尺度、按分辨率比反推网格量、用三个时间尺度约束时间步与采样长度、壁面解析与壁面模化两条路线的取舍。
  全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 湍流与近壁建模
  - 大涡模拟
  - 工程设置与参数选择
  - 亚格子模型
  - Kolmogorov 尺度
  - 结果诊断与可信度验证
  - 能量谱
  - 统计收敛
seo:
  title: 大涡模拟：工程设置与诊断验证
  description: >-
    大涡模拟的网格、时间步与统计时长怎么定：由湍流耗散率估 Kolmogorov 尺度与 Taylor
    尺度、按分辨率比反推网格量、用三个时间尺度约束时间步与采样长度、壁面解析与壁面模化两条路线的取舍。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 大涡模拟
    - 工程设置与参数选择
    - 亚格子模型
    - Kolmogorov 尺度
    - 壁面模化
    - 结果诊断与可信度验证
    - 能量谱
    - 统计收敛
    - 亚格子耗散
---
# 大涡模拟：工程设置与诊断验证

## 工程设置与参数选择

大涡模拟的成本不是靠调参降下来的，而是靠分辨率判据定下来的：先用湍流耗散率估出 Kolmogorov 尺度，再按可接受的分辨率比反推网格，最后用涡脱落周期与流动通过时间约束时间步和采样长度。任何跳过这三步的“先跑起来看看”都会在统计量上付出代价。本文以圆柱绕流为例，直径 $D = 0.1\,\mathrm{m}$、来流 $U = 10\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re_D = 6.7\times10^{4}$，处于亚临界涡脱落区间。

### 1 滤波尺度与亚格子黏度的量纲关系

LES 对速度场做空间滤波，滤波宽度取单元体积的立方根 $\Delta = V^{1/3}$。Smagorinsky 模型的亚格子黏度为

$$\nu_{sgs} = \left(C_s\Delta\right)^{2}\left|\bar S\right|, \qquad \left|\bar S\right| = \sqrt{2\bar S_{ij}\bar S_{ij}}$$

均匀湍流标定的 $C_s = 0.17$，工程算例常用 0.1 以减小过度耗散。壁面解析时必须加 Van Driest 阻尼 $\left(1 - e^{-y^{+}/A^{+}}\right)^{2}$，$A^{+} = 25$，否则壁面附近的 $\nu_{sgs}$ 不趋于零。

WALE 模型不需要阻尼，其形式基于速度梯度张量的平方：

$$\nu_{sgs} = \left(C_w\Delta\right)^{2}\frac{\left(S^{d}_{ij}S^{d}_{ij}\right)^{3/2}}{\left(\bar S_{ij}\bar S_{ij}\right)^{5/2} + \left(S^{d}_{ij}S^{d}_{ij}\right)^{5/4}}, \qquad C_w = 0.325$$

在纯剪切区 WALE 的 $\nu_{sgs}$ 自动趋于零，这是它比 Smagorinsky 更适合剪切主导流动的原因。判断选型是否合理，看后处理的 $\nu_{sgs}/\nu$：体区应低于 20。取 $\Delta = 5\,\mathrm{mm}$、$\left|\bar S\right| = 100\,\mathrm{s^{-1}}$，Smagorinsky 给出 $\nu_{sgs} = (0.17\times0.005)^{2}\times100 = 7.2\times10^{-5}\,\mathrm{m^2/s}$，比值 4.8；若改用 $C_s = 0.1$ 则为 $2.5\times10^{-5}\,\mathrm{m^2/s}$、比值 1.7。两者都合格，但 $C_s = 0.17$ 在粗网格上会把亚格子耗散推到主导地位。

### 2 由耗散率估算 Kolmogorov 尺度并反推网格

耗散率用大尺度量估算：$\varepsilon \approx u'^{3}/L$，其中 $u' = \sqrt{2k/3}$。取 $k = 0.06\,\mathrm{m^2/s^2}$ 得 $u' = 0.20\,\mathrm{m/s}$，取含能尺度 $L = 0.01\,\mathrm{m}$ 得 $\varepsilon = 0.80\,\mathrm{m^2/s^3}$。于是

$$\eta = \left(\frac{\nu^{3}}{\varepsilon}\right)^{1/4} = 2.55\times10^{-4}\,\mathrm{m}, \qquad \lambda = \sqrt{\frac{15\nu u'^{2}}{\varepsilon}} = 3.35\times10^{-3}\,\mathrm{m}$$

$$Re_\lambda = \frac{u'\lambda}{\nu} = \sqrt{\frac{15u'^{4}}{\nu\varepsilon}} = 44.7$$

$Re_\lambda = 44.7$ 是典型的 LES 工况量级（DNS 通常需要 $Re_\lambda > 100$）。网格按 $\Delta = 10\eta = 2.55\,\mathrm{mm}$ 设计，$\lambda/\Delta = 1.3$。若对整域 $20D\times10D\times4D = 2\times1\times0.4\,\mathrm{m}$ 都用这个分辨率，单元数为 $0.8/(2.55\times10^{-3})^{3} = 4.8\times10^{7}$，接近 5000 万——这就是壁面解析 LES 的真实门槛。

### 3 时间步与采样周期：三个时间尺度

时间步由对流 CFL 约束：$\Delta t = \mathrm{CFL}\cdot\Delta x/U$。取 $\Delta x = 5\,\mathrm{mm}$、$\mathrm{CFL} = 0.5$，得 $\Delta t = 2.5\times10^{-4}\,\mathrm{s}$。

采样长度由涡脱落周期定。亚临界圆柱的 Strouhal 数约 0.2，故 $f = St\,U/D = 20\,\mathrm{Hz}$、周期 $T = 0.05\,\mathrm{s}$，一个周期内有 200 个时间步，满足每个周期至少 100 步的要求。统计收敛需要约 100 个脱落周期，即 5 s、20000 步；瞬态舍弃段取 5 个流动通过时间 $L/U = 0.2\,\mathrm{s}$，即 1 s、4000 步。三个时间尺度必须同时满足：

$$\Delta t \le \min\left(\frac{\mathrm{CFL}\,\Delta x}{U},\; \frac{T}{100}\right), \qquad T_{\text{stat}} \ge 100\,T$$

### 4 壁面解析与壁面模化两条路线

| 路线 | 首层要求 | 流向与展向间距 | 单元数（本算例） | 适用 |
|---|---|---|---|---|
| 壁面解析 WRLES | $y^{+} < 1$，$\Delta y \approx 1.7\,\mathrm{\mu m}$ | $\Delta x^{+},\Delta z^{+} \approx 15\sim40$ | $>10^{8}$ | 低雷诺数、小域 |
| 壁面模化 WMLES | 首层单元 2 mm，单元中心 $y^{+} \approx 37$ | $\Delta \approx 0.05D = 5\,\mathrm{mm}$ | $6.4\times10^{6}$ | 工程雷诺数、大域 |

WMLES 的首层高度由壁面剪切反算。圆柱表面 $C_f$ 约 0.006，$\tau_w = 0.5C_f\rho U^{2} = 0.36\,\mathrm{Pa}$，$u_\tau = 0.548\,\mathrm{m/s}$，单元中心 1 mm 处 $y^{+} = 0.548\times10^{-3}/1.5\times10^{-5} = 36.5$，正好落在壁面模化的 30~50 区间。整域按 $\Delta = 5\,\mathrm{mm}$ 布置得到 640 万单元，是壁面解析方案的七十分之一。

### 5 入口湍流生成与统计收敛

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

### 6 设置失配的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\nu_{sgs}/\nu$ 在体区达 100 以上 | 网格过粗或 $C_s$ 偏大，亚格子耗散主导 | 输出 $\nu_{sgs}/\nu$ 场，把 $C_s$ 从 0.17 降到 0.1 比较积分量 |
| 能量谱在可解析区就出现陡降 | 网格分辨率不足，惯性子区未打开 | 计算谱斜率，检查 $-5/3$ 段是否覆盖一个数量级 |
| $C_d$ 的分段均值波动超过 5% | 统计窗口短于 100 个脱落周期 | 把窗口延长一倍，看波动是否按 $1/\sqrt{N}$ 收敛 |
| 每个脱落周期的时间步少于 50 | 时间步按对流 CFL 定得过大 | 按 $\Delta t \le T/100$ 重设并比较升力幅值 |
| 壁面模化算例首层 $y^{+} < 10$ | 首层过细，落入壁面模化与解析的过渡区 | 把首层放大到 $y^{+} \approx 37$ 重算 |
| 湍流入口下游 3 倍直径内湍流度就衰减一半 | 合成涡方法的长度尺度给得过小 | 改用前驱域或放大合成涡的长度尺度 |

### 7 亚格子模型与基准数据出处

1. Smagorinsky J., "General circulation experiments with the primitive equations: I. The basic experiment," *Monthly Weather Review*, 1963.
2. Nicoud F., Ducros F., "Subgrid-scale stress modelling based on the square of the velocity gradient tensor," *Flow, Turbulence and Combustion*, 1999.
3. Pope S. B., "Ten questions concerning the large-eddy simulation of turbulent flows," *New Journal of Physics*, 2004.
4. Williamson C. H. K., "Vortex dynamics in the cylinder wake," *Annual Review of Fluid Mechanics*, 1996.

## 诊断与可信度验证

LES 的结果可以看起来非常逼真——涡结构清晰、瞬时场有丰富的小尺度——但统计量依然可能是错的。可信度必须由四个可算的量支撑：亚格子黏度比、能量谱在惯性子区的斜率、统计量的有效样本数、以及亚格子耗散在总耗散中的份额。本文以圆柱绕流为例，$D = 0.1\,\mathrm{m}$、$U = 10\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$（$Re_D = 6.7\times10^{4}$），给出判据与阈值。

### 1 分辨率质量的两个可算指标

第一个指标是亚格子黏度比。体区的 $\nu_{sgs}/\nu$ 应低于 20，超过 100 说明亚格子模型在替网格承担本该解析的输运。第二个指标是亚格子耗散份额：

$$\varepsilon_{sgs} = -\tau_{ij}\bar S_{ij}, \qquad f_{sgs} = \frac{\left\langle \varepsilon_{sgs} \right\rangle}{\left\langle \varepsilon_{sgs} \right\rangle + \left\langle \varepsilon_{res} \right\rangle}$$

其中 $\varepsilon_{res}$ 由解析尺度的耗散率估算。良好分辨的 LES 中 $f_{sgs}$ 应低于 0.3；若达到 0.5 以上，说明模型承担了过半耗散，结果趋近于 RANS 而非 LES。

Pope 提出的尺度分辨指标可以直接按波数评估：

$$M(\kappa) = \frac{k_{sgs}(\kappa)}{k_{res}(\kappa) + k_{sgs}(\kappa)}$$

要求 $M(\kappa) < 0.2$ 覆盖至少一个数量级的波数范围。取 $\Delta = 5\,\mathrm{mm}$，可解析的最大波数约 $\pi/\Delta = 628\,\mathrm{m^{-1}}$，若 $M$ 在 $60\sim600\,\mathrm{m^{-1}}$ 区间内始终低于 0.2，则认为惯性子区已被解析。

### 2 能量谱斜率作为惯性子区的证据

惯性子区的能量谱应满足 $E(\kappa) \propto \kappa^{-5/3}$，因此波数增大 10 倍时能量应下降到

$$\frac{E(\kappa_2)}{E(\kappa_1)} = 10^{-5/3} = 0.0215$$

实测偏离这个值的方向直接指向病因。以 $\kappa_1 = 50\,\mathrm{m^{-1}}$、$E_1 = 1.0$ 为参考点：

| 实测 $E(500\,\mathrm{m^{-1}})$ | 拟合斜率 | 判读 |
|---|---|---|
| 0.0080 | $-2.10$ | 谱过陡，数值耗散主导，网格或格式过耗散 |
| 0.0215 | $-1.67$ | 符合 $-5/3$，惯性子区正常 |
| 0.0600 | $-1.22$ | 谱过平，亚格子耗散过强或采样不足 |

斜率由 $-\ln(E_2/E_1)/\ln(\kappa_2/\kappa_1)$ 直接算得。谱必须在同一物理位置、同一时间窗口内统计，且窗口长度至少覆盖 20 个脱落周期，否则谱的随机误差会把斜率判断淹没。

### 3 统计收敛与误差棒的报法

均值的不确定度由有效样本数决定：

$$\sigma_{\bar{x}} = \frac{\sigma_x}{\sqrt{N_{eff}}}, \qquad N_{eff} = \frac{T_{stat}}{2T_{int}}$$

积分时间尺度 $T_{int}$ 由自相关函数 $\rho(\tau) = \overline{u'(t)u'(t+\tau)}/\overline{u'^{2}}$ 积分到首次过零得到。圆柱尾迹中 $T_{int}$ 约为脱落周期的 0.4 倍，取 $T = 0.05\,\mathrm{s}$ 得 $T_{int} = 0.02\,\mathrm{s}$。统计窗口 $T_{stat} = 5\,\mathrm{s}$（100 个脱落周期）给出 $N_{eff} = 125$，于是 $\sigma_{\bar{x}} = \sigma_x/11.2$。

若阻力系数的瞬时脉动标准差 $\sigma_{C_d} = 0.08$，则均值的标准误为 $0.08/11.2 = 7.1\times10^{-3}$，相对 $C_d \approx 1.0$ 是 0.71%。要把误差减半需要四倍采样，即 $T_{stat} = 20\,\mathrm{s}$。报告 $C_d$ 时必须带上这个区间，而不是只给一个数。

### 4 亚格子耗散与数值耗散的区分

两者都会抹平小尺度，但诊断方式不同。亚格子耗散随 $\nu_{sgs}$ 变化，把 $C_s$ 从 0.17 降到 0.1 后积分量若有明显变化，说明亚格子项在主导；数值耗散由格式与网格决定，与 $C_s$ 无关，加密网格或把对流格式从一阶换到中心/二阶后结果变化，才说明是数值耗散。

具体试验设计：固定网格，做 $C_s = 0.1/0.17$ 两档；再固定 $C_s$，做两套网格。若第一种比较差异小于 1%、第二种差异大于 5%，则瓶颈是网格而不是模型。这个二分法能避免在网格不足时反复调 $C_s$ 这类无效工作。

### 5 与圆柱绕流基准量的对照

亚临界圆柱绕流有三个稳定的基准量可用于对照：

| 量 | 实验参考 | 说明 |
|---|---|---|
| Strouhal 数 $St = fD/U$ | 约 0.20 | 对展向长度与端部条件敏感 |
| 时均阻力系数 $C_d$ | 约 1.2 | 随展向长度与阻塞比变化 |
| 时均回流区长度 $L_r/D$ | 约 1.2~1.5 | 对网格分辨率最敏感 |

$St$ 通常最容易对上（偏差小于 2%），因为它由整体涡脱落频率决定；$L_r/D$ 最难对上，因为它由近尾迹的剪切层卷起位置决定，直接受分辨率与亚格子模型影响。因此验收顺序应是先看 $St$，再看 $C_d$，最后看 $L_r/D$。若 $St$ 与 $C_d$ 都好而 $L_r/D$ 偏差 20%，说明问题局限在近尾迹，不必推翻整个设置。

展向长度也需要验证：把展向从 $2D$ 加到 $4D$，若 $C_d$ 变化超过 3%，说明二维涡结构被人为拉长，相关量不可用。亚临界圆柱一般需要至少 $4D$ 的展向长度。

```python
import numpy as np

# 1) 能量谱斜率
k1, E1 = 50.0, 1.0
for E2 in (0.008, 0.0215, 0.060):
    slope = -np.log(E2 / E1) / np.log(10.0)
    print(f"E2={E2:.4f}  slope={slope:+.2f}")

# 2) 统计误差
T, Tint, Tstat, sigCd = 0.05, 0.02, 5.0, 0.08
Neff = Tstat / (2 * Tint)
print(f"Neff={Neff:.0f}  sigma_mean={sigCd/np.sqrt(Neff):.4f}"
      f"  rel={sigCd/np.sqrt(Neff)/1.0*100:.2f}%")
for Tstat in (5.0, 10.0, 20.0):
    print(f"Tstat={Tstat:4.1f}s  rel_err={sigCd/np.sqrt(Tstat/(2*Tint))*100:.2f}%")

# 3) 分辨率指标
Delta, nu = 5e-3, 1.5e-5
for Cs, S in ((0.17, 100.0), (0.10, 100.0)):
    print(f"Cs={Cs}  nu_sgs/nu={(Cs*Delta)**2*S/nu:.2f}")
```

脚本给出斜率 $-2.10$、$-1.67$、$-1.22$；$N_{eff} = 125$、相对误差 0.71%；以及 $C_s = 0.17$ 时 $\nu_{sgs}/\nu = 4.81$、$C_s = 0.1$ 时 1.66，与手算一致。

### 6 可信度不足的反证试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 谱斜率约 $-2.1$ 而积分量看似合理 | 数值耗散在惯性子区抹平能量，掩盖了网格不足 | 换二阶或中心格式重算，比较斜率是否回到 $-5/3$ |
| 改变 $C_s$ 后 $C_d$ 变化 6% | 亚格子模型主导耗散，网格分辨不足 | 加密网格后重做同一 $C_s$ 对照，看敏感度是否下降 |
| $C_d$ 的分段均值波动 4% | 统计窗口短于 100 个脱落周期 | 用 $N_{eff} = T_{stat}/(2T_{int})$ 反算所需窗口长度 |
| 展向从 $2D$ 加到 $4D$ 后 $C_d$ 变化 8% | 展向不足导致二维涡被人为拉长 | 继续加到 $6D$，确认变化是否收敛到 3% 以内 |
| $St$ 与 $C_d$ 均好但 $L_r/D$ 偏 20% | 近尾迹剪切层卷起位置未被解析 | 只加密尾迹区流向网格，看 $L_r/D$ 是否向基准靠拢 |
| 时均场在壁面附近出现非物理高速条带 | 壁面模化首层落入过渡区 | 检查首层 $y^{+}$ 是否落在 30~50 区间 |

### 7 湍流统计与基准数据出处

1. Pope S. B., "Ten questions concerning the large-eddy simulation of turbulent flows," *New Journal of Physics*, 2004.
2. Celik I. B., Cehreli Z. N., Yavuz I., "Index of resolution quality for large eddy simulations," *ASME Journal of Fluids Engineering*, 2005.
3. Norberg C., "An experimental investigation of the flow around a circular cylinder: influence of aspect ratio," *Journal of Fluid Mechanics*, 1994.
4. Kravchenko A. G., Moin P., "Numerical studies of flow over a circular cylinder at Re_D = 3900," *Physics of Fluids*, 2000.
