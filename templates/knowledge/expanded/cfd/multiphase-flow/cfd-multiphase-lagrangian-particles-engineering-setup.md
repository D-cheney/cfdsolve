---
template_version: flowlab-knowledge/1.0
slug: cfd-multiphase-lagrangian-particles-engineering-setup
title: 拉格朗日颗粒跟踪：工程设置与诊断验证
summary: >-
  从注入分布、曳力区、湍流扩散到颗粒时间步，给出拉格朗日颗粒跟踪的可落地设置：Rosin–Rammler 参数、Cunningham
  滑移修正、涡寿命与穿越时间、颗粒 Courant 数，以及 kinematicCloudProperties 字典片段。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 多相流与组分输运
  - 拉格朗日颗粒跟踪
  - 工程设置与参数选择
  - Cunningham 滑移修正
  - 湍流扩散
  - 结果诊断与可信度验证
  - 颗粒 Reynolds 数
  - 统计收敛
seo:
  title: 拉格朗日颗粒跟踪：工程设置与诊断验证
  description: >-
    从注入分布、曳力区、湍流扩散到颗粒时间步，给出拉格朗日颗粒跟踪的可落地设置：Rosin–Rammler 参数、Cunningham
    滑移修正、涡寿命与穿越时间、颗粒 Courant 数，以及 kinematicCloudProperties 字典片段。
  keywords:
    - 拉格朗日颗粒跟踪
    - 工程设置与参数选择
    - Cunningham 滑移修正
    - 湍流扩散
    - 结果诊断与可信度验证
    - 颗粒 Reynolds 数
    - 统计收敛
---
# 拉格朗日颗粒跟踪：工程设置与诊断验证

拉格朗日颗粒跟踪的结果由四个输入决定：粒径分布、曳力所在区间、湍流扩散模型和颗粒时间步。其中任何一项取错默认值，轨迹统计就会系统性偏移，而且不会体现在残差上。基准环境取空气 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s、分子自由程 $\lambda=68$ nm、颗粒密度 $\rho_p=2500$ kg/m³。颗粒跟踪的失效很少表现为残差发散，而是表现为质量账对不上、统计量随颗粒包数漂移、或曳力区选错导致的系统性偏移。诊断顺序因此不同于连续相：先查质量账，再查统计收敛，然后用 $Re_p$ 反算曳力区，最后拿阶跃响应与解析解对照。本文四项诊断都给出阈值与手算过程，环境取空气 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s、$\rho_p=2500$ kg/m³。

## 基础概念与控制关系

### 注入定义：分布与质量流率

喷雾与粉碎产生的粒径分布通常用 Rosin–Rammler 累积分布描述：

$$F(d)=1-\exp\left[-\left(\frac{d}{d_m}\right)^{n}\right]$$

$d_m$ 为质量中位径，$n$ 为均匀性指数，喷雾常取 2.5 到 4。取 $d_m=50$ μm、$n=3$，则小于 25 μm 的颗粒占 $F=1-\exp(-0.5^{3})=1-\exp(-0.125)=11.8\%$。这个 11.8% 的细粉份额必须与实测筛分一致，否则喷雾蒸发与沉积位置都会偏。注入时还要给出总质量流率、释放起止时间与空间分布：OpenFOAM 用 `massTotal`、`SOI`、`flowRateProfile` 与 `cellZone` 共同定义，缺一项就会得到"凭空出现"的颗粒。

## 工程设置与实施

### 参数取值与依据

| 参数 | 推荐取值 | 依据 |
|---|---|---|
| 分布指数 $n$ | 2.5～4 | 喷雾粒径分散度 |
| Cunningham 修正 | $d_p<5$ μm 必开 | 分子滑移效应 |
| 颗粒 Courant 数 | ≤ 0.3 | 单步不跨多单元 |
| 颗粒包数 | 10⁴ 量级 | 统计误差 0.5% |
| 随机种子 | 固定并记录 | 统计可复现 |
| 耦合方式 | 反馈量级 >1% 开双向 | 相间动量交换 |

### kinematicCloudProperties 配置片段

```cpp
solution
{
    active          true;
    coupled         true;      // 双向耦合
    transient       yes;
    cellValueSourceCorrection on;
    maxCo           0.3;       // 颗粒 Courant 上限
    sourceTerms     { schemes { U U; } }
}
subModels
{
    particleForces  { sphereDrag; gravity; }
    dispersionModel stochasticDispersionRAS;   // 随机游走
    injectionModels
    {
        model1
        {
            type            coneInjection;
            massTotal       0.01;      // kg
            SOI             0;         // s
            duration        5;         // s
            parcelsPerSecond 5000;
            flowRateProfile constant 1;
            sizeDistribution
            {
                type        RosinRammler;
                RosinRammlerDistribution
                {
                    minDiameter 1e-6;
                    maxDiameter 1e-4;
                    d           5e-5;      // d_m = 50 um
                    n           3;
                }
            }
        }
    }
}
```

### 诊断脚本

```python
import math
rho_g, mu_g, rho_p = 1.2, 1.8e-5, 2500.0
dp, g = 80e-6, 9.81

ut_st = (rho_p - rho_g) * dp**2 * g / (18 * mu_g)
re_p = rho_g * dp * ut_st / mu_g
f = 1 + 0.15 * re_p**0.687
tau_p = rho_p * dp**2 / (18 * mu_g)

print("Stokes 终速 = %.3f m/s, Re_p = %.2f" % (ut_st, re_p))
print("Schiller-Naumann 修正因子 = %.2f -> 终速 %.3f m/s" % (f, ut_st/f))
print("tau_p = %.4f s, t=tau_p 时响应 %.1f%%" % (tau_p, 100*(1-math.exp(-1))))
# 统计误差
for N in (1e3, 1e4):
    print("N=%5.0f, Y=0.5 -> sigma = %.4f" % (N, math.sqrt(0.25/N)))
```

输出给出 $Re_p=2.58$、修正因子 1.29、$\tau_p=0.049$ s 与 63.2% 响应，可直接与求解器日志逐项对照。

### Cunningham 滑移修正决定微米颗粒的曳力

当颗粒直径接近气体分子自由程时，颗粒表面出现速度滑移，实际曳力小于连续介质预测值。修正系数为

$$C_c=1+\frac{2\lambda}{d_p}\left(1.257+0.4\,e^{-1.1 d_p/(2\lambda)}\right)$$

取 $d_p=1$ μm、$\lambda=68$ nm，则 $2\lambda/d_p=0.136$、$d_p/(2\lambda)=7.35$，指数项 $e^{-8.09}=3.1\times10^{-4}$，得 $C_c=1+0.136\times1.257=1.17$。也就是说，不启用滑移修正会把 1 μm 颗粒的曳力高估约 17%，终端速度低估同样比例。经验门槛是 $d_p<5$ μm 时必须打开 `Cunningham` 修正，$d_p>50$ μm 时可忽略。

### 湍流扩散：涡寿命与穿越时间

RANS 只给平均速度场，颗粒的湍流扩散必须靠随机模型补足。Gosman–Ioannides 模型用两个时间尺度判断颗粒能否被涡携带：

$$\tau_e=0.3\frac{k}{\varepsilon},\qquad l_e=C_\mu^{3/4}\frac{k^{3/2}}{\varepsilon},\qquad t_c=\frac{l_e}{|\mathbf{u}_c-\mathbf{u}_p|}$$

其中 $C_\mu=0.09$。取 $k=1$ m²/s²、$\varepsilon=10$ m²/s³，则 $\tau_e=0.03$ s，$l_e=0.09^{0.75}\times1/10=0.0164$ m。若颗粒穿越时间 $t_c$ 小于涡寿命 $\tau_e$，颗粒会穿过涡而扩散减弱；反之则被涡完整携带。这两个量的比值正是判断"是否需要湍流扩散模型"的依据：$St$ 很小的细粉必须开启，$St>10$ 的大颗粒可关闭以省算力。

### 颗粒时间步与 Courant 数

颗粒时间步应同时满足响应与穿越两个限制：

$$\Delta t_p=\min\left(\frac{\tau_p}{5},\ \frac{h}{|\mathbf{u}_p|}\right)$$

取 $d_p=80$ μm，$\tau_p=\rho_p d_p^{2}/(18\mu_g)=2500\times6.4\times10^{-9}/(3.24\times10^{-4})=0.049$ s，则 $\tau_p/5=9.9\times10^{-3}$ s；网格 $h=2$ mm、颗粒速度 10 m/s 时 $h/|\mathbf{u}_p|=2\times10^{-4}$ s。取小者得 $\Delta t_p=2\times10^{-4}$ s，即 Courant 限制主导。开启 `subCycling` 让颗粒在流体步内多次积分，是保证 $\Delta t_p$ 不被流体时间步拖大的常用做法。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 细粉沉积率偏高 | 未启用 Cunningham 修正 | 开修正后看 1 μm 颗粒终速是否下降约 17% |
| 颗粒轨迹沿流线堆叠 | 未开湍流扩散 | 打开随机游走，看颗粒是否铺展到湍流核心 |
| 重复作业统计不一致 | 随机种子未固定 | 固定种子跑两遍，比较沉积率是否逐位一致 |
| 颗粒穿过单元边界无变化 | 时间步过大越单元 | 把 maxCo 从 0.3 降到 0.1，看轨迹是否改变 |
| 连续相被"抽空" | 双向耦合源项过强 | 关耦合算单向，看连续相剖面是否恢复 |
| 质量账误差逐时增长 | 壁面捕集或蒸发源项不闭合 | 关蒸发重算，看误差是否停止增长 |
| 沉积率随颗粒包数单调漂移 | 统计未收敛 | 依次加倍 $N$，看是否落进 $2\sigma_Y$ 带 |
| 终速与 Stokes 估计一致 | 曳力区选错，未用 $Re_p$ 修正 | 用 $Re_p$ 反算，比较 Schiller–Naumann 终速 |
| 阶跃响应快于解析解 | 曳力被高估或滑移修正缺失 | 零重力均匀流给阶跃，对照 $1-e^{-t/\tau_p}$ |
| 两次运行结果不同 | 随机种子未固定 | 固定种子复跑，比较是否逐位一致 |

## 验证、验收与复现

### 颗粒包数量决定统计误差

沉积率、分离效率这类比值量的统计标准差为

$$\sigma_Y=\sqrt{\frac{Y(1-Y)}{N}}$$

取 $Y=0.5$、$N=10^4$，得 $\sigma_Y=5.0\times10^{-3}$，即 0.5%；若只投放 $N=10^3$，误差升到 1.58%。因此要 0.5% 量级的效率精度，颗粒包数需 $10^4$ 起步。诊断方法是把 $N$ 依次取 $10^3$、$5\times10^3$、$10^4$、$2\times10^4$ 各跑一遍，看效率是否落在 $\pm2\sigma_Y$ 带内；若始终单调漂移，说明统计尚未收敛而非随机波动。

### 湍流扩散的可复现性

随机游走模型必须固定随机种子，否则两次运行结果无法区分"物理变化"与"随机波动"。诊断方法是固定种子跑两遍，若沉积率逐位不一致，说明模型读取了并行进程数或时间步作为随机源。另外要用至少 5 个不同种子评估统计带：若不同种子间的效率差异超过 $2\sigma_Y$，说明 $N$ 不足或扩散模型参数未被标定。

### 质量账必须逐时闭合

注入、逃逸、捕集与域内存量必须逐时平衡：

$$\varepsilon_m(t)=\frac{\left|\dot m_{in}\,t-m_{esc}-m_{trap}-m_{domain}(t)\right|}{\dot m_{in}\,t}<0.5\%$$

取 $\dot m_{in}=0.01$ kg/s、$t=10$ s，则累计注入 0.1 kg。若日志给出逃逸 0.06 kg、捕集 0.02 kg、域内 0.0198 kg，合计 0.0998 kg，误差 $0.0002/0.1=0.2\%$，在容差内。若误差随 $t$ 单调增长，问题在壁面行为或蒸发源项；若在注入启动瞬间跳一次，属于颗粒包一次性释放的正常瞬态。

### 用 $Re_p$ 反算曳力区

Stokes 沉降公式只在小 $Re_p$ 成立，必须用反算结果判断是否越界。对 $d_p=80$ μm：

$$u_t^{St}=\frac{(\rho_p-\rho_g)d_p^{2}g}{18\mu_g}=\frac{2498.8\times6.4\times10^{-9}\times9.81}{3.24\times10^{-4}}=0.484\ \text{m/s}$$

再算颗粒 Reynolds 数

$$Re_p=\frac{\rho_g d_p u_t^{St}}{\mu_g}=\frac{1.2\times8\times10^{-5}\times0.484}{1.8\times10^{-5}}=2.58$$

$Re_p=2.58$ 已明显大于 1，Stokes 假设失效。改用 Schiller–Naumann 的修正因子 $f=1+0.15Re_p^{0.687}=1+0.15\times1.92=1.29$，曳力增大，终速降到约 $0.484/1.29=0.375$ m/s，比 Stokes 估计低约 22%。若求解器仍按 Stokes 曳力给出 0.48 m/s，就是曳力区选错的直接证据。

### 阶跃响应对照颗粒时间常数

把颗粒放入速度阶跃的流体中，其速度响应有解析解：

$$u_p(t)=u_c\left(1-e^{-t/\tau_p}\right),\qquad \tau_p=\frac{\rho_p d_p^{2}}{18\mu_g}$$

对 80 μm 颗粒，$\tau_p=2500\times6.4\times10^{-9}/3.24\times10^{-4}=0.049$ s。在 $t=\tau_p=49$ ms 时颗粒速度应为流体速度的 63.2%，在 $t=3\tau_p=148$ ms 时达到 95%。这是最容易复算的验证：在零重力、无湍流的均匀流里给一个阶跃，看数值解是否落在该解析曲线上。若响应过快，多半是曳力被高估；响应过慢则是时间步不足或滑移修正遗漏。

## 参考资料

先定粒径分布与质量流率，再按 $d_p$ 判断是否需要 Cunningham 修正，随后按 $k$、$\varepsilon$ 估涡寿命决定扩散模型，最后用 $\tau_p$ 与 $h/|\mathbf{u}_p|$ 的较小值定时间步并设 `maxCo`。这四步的顺序不能颠倒，因为后一步的取值依赖前一步的结论。
先闭合质量账，再确认统计收敛，然后用 $Re_p$ 与阶跃响应锁定曳力闭合是否正确，最后才与实验比较效率与沉积分布。任何一步未过，后续对比都失去意义；被否定的假设与对应证据同样要留档。
1. Crowe, C.T., Sommerfeld, M. & Tsuji, Y., *Multiphase Flows with Droplets and Particles*, CRC Press, 1998.
2. Morsi, S.A. & Alexander, A.J., "An Investigation of Particle Trajectories in Two-Phase Flow Systems," *Journal of Fluid Mechanics*, 55(2), 1972.
3. Gosman, A.D. & Ioannides, E., "Aspects of Computer Simulation of Liquid-Fuelled Combustors," *Journal of Energy*, 7(6), 1983.
4. Rosin, P. & Rammler, E., "The Laws Governing the Fineness of Powdered Coal," *Journal of the Institute of Fuel*, 7, 1933.
5. Cunningham, E., "On the Velocity of Steady Fall of Spherical Particles through Fluid Medium," *Proceedings of the Royal Society A*, 83(563), 1910.
6. Sommerfeld, M., Kohnen, G. & Rüger, M., "Some Comments on the Applicability of the Standard k-ε Turbulence Model," *Applied Scientific Research*, 51, 1993.
7. Maxey, M.R. & Riley, J.J., "Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow," *Physics of Fluids*, 26(4), 1983.
