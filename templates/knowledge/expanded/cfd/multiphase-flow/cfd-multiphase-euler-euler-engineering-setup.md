---
template_version: flowlab-knowledge/1.0
slug: cfd-multiphase-euler-euler-engineering-setup
title: Euler–Euler 多流体模型：工程设置与诊断验证
summary: >-
  围绕相间曳力闭合与颗粒动理论展开 Euler–Euler 设置：Gidaspow
  混合曳力的切换点与系数、固相压力与径向分布函数、最小流化速度估算、网格下限，以及 multiphaseEulerFoam 的字典写法。
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
  - Euler–Euler 多流体模型
  - 工程设置与参数选择
  - Gidaspow 曳力
  - 颗粒动理论
  - 结果诊断与可信度验证
  - Ergun 方程
  - Richardson–Zaki
seo:
  title: Euler–Euler 多流体模型：工程设置与诊断验证
  description: >-
    围绕相间曳力闭合与颗粒动理论展开 Euler–Euler 设置：Gidaspow
    混合曳力的切换点与系数、固相压力与径向分布函数、最小流化速度估算、网格下限，以及 multiphaseEulerFoam 的字典写法。
  keywords:
    - Euler–Euler 多流体模型
    - 工程设置与参数选择
    - Gidaspow 曳力
    - 颗粒动理论
    - 结果诊断与可信度验证
    - Ergun 方程
    - Richardson–Zaki
---
# Euler–Euler 多流体模型：工程设置与诊断验证

双流体模型的设置核心是相间动量交换的闭合：曳力模型必须与相分率区间匹配，固相应力必须由颗粒动理论给出，而最小流化速度决定入口流速与网格下限是否合理。本文面向鼓泡流化床、气力输送与气液鼓泡塔，给出各闭合式的适用区间、系数取值和 `multiphaseEulerFoam` 的配置写法。基准物性取 $\rho_g=1.2$ kg/m³、$\rho_s=2500$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s、$d_p=500$ μm。双流体结果的可信度靠三个可核对的量支撑：相分率的有界性、逐相质量守恒，以及压降与床高能否被经典关联式解释。残差收敛只能说明代数方程解开了，不能说明曳力闭合选对了。本文给出用 Ergun 方程反查压降、用 Richardson–Zaki 校验膨胀床床高、用曳力切换点定位突跳的诊断流程，物性取 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s。

## 用 Ergun 方程反查压降

固定床与鼓泡床的压降由 Ergun 方程给出：

$$\frac{\Delta p}{L}=150\frac{(1-\varepsilon)^{2}}{\varepsilon^{3}}\frac{\mu_g u}{d_p^{2}}+1.75\frac{1-\varepsilon}{\varepsilon^{3}}\frac{\rho_g u^{2}}{d_p}$$

取 $\varepsilon=0.4$、$d_p=3\times10^{-3}$ m、$u=0.5$ m/s、$L=0.5$ m。第一项为 $150\times0.36/0.064\times(1.8\times10^{-5}\times0.5/9\times10^{-6})=843.8$ Pa/m；第二项为 $1.75\times0.6/0.064\times(1.2\times0.25/3\times10^{-3})=1640.6$ Pa/m。合计 2484 Pa/m，乘 $L=0.5$ m 得 $\Delta p=1242$ Pa。若数值解压降偏离该值超过 20%，先查曳力模型与网格，而不是先调松弛。

## 相分率有界性与守恒是第一道闸门

任何时刻都应满足

$$\left|\sum_q\alpha_q-1\right|<10^{-6},\qquad 0\le\alpha_s\le\alpha_{s,max}=0.63$$

若日志里出现 $\alpha_s>0.63$ 的单元，说明限幅器被触发，局部堆积是非物理的，床层高度与压降都会偏高。逐相质量守恒则要求

$$\varepsilon_m(t)=\frac{\left|\int_0^{t}\dot m_{in}\,dt-\left(m_{esc}+m_{trap}+m_{domain}\right)\right|}{\int_0^{t}\dot m_{in}\,dt}<0.5\%$$

该误差若随时间单调增长，问题在相间传质项或压力-速度耦合；若只在流化启动瞬间跳一下，属于瞬态压缩，可接受。

## 颗粒动理论给出固相压力与黏度

固相压力由动理论闭合，不能按理想气体硬套：

$$p_s=\alpha_s\rho_s\Theta_s+2\rho_s(1+e)\alpha_s^{2}g_0\Theta_s,\qquad g_0=\left[1-\left(\frac{\alpha_s}{\alpha_{s,max}}\right)^{1/3}\right]^{-1}$$

取恢复系数 $e=0.9$、最大堆积分率 $\alpha_{s,max}=0.63$。在 $\alpha_s=0.5$ 时 $\left(0.5/0.63\right)^{1/3}=0.926$，故 $g_0=(1-0.926)^{-1}=13.5$；在 $\alpha_s=0.6$ 时 $g_0$ 升到 61.7，固相压力急剧发散。这正是必须在求解器里启用 `packingLimiter` 的原因：没有它，局部 $\alpha_s$ 会越过 0.63 并把时间步压到不可接受。

## 最小流化速度决定入口与网格

Wen–Yu 关联式给出最小流化速度的快速估算：

$$u_{mf}=\frac{d_p^{2}\left(\rho_s-\rho_g\right)g}{1650\,\mu_g}=\frac{(5\times10^{-4})^{2}\times2498.8\times9.81}{1650\times1.8\times10^{-5}}=0.206\ \text{m/s}$$

即约 0.21 m/s。入口表速必须高于该值并留出 1.5 到 2 倍裕量，否则床层根本不会流化，任何曳力模型都无意义。网格方面，Euler–Euler 解析的是相含率场而非单颗粒，单元尺寸经验上取 $10\,d_p$ 量级，即 $500$ μm 颗粒对应约 5 mm 单元；再粗会抹平气泡，再细则计算量随单元数三次方增长而收益有限。

## 网格与数值扩散

相含率场的数值扩散会直接抹平气泡。诊断方法是对同一工况做三档网格（5 mm、3 mm、2 mm）并比较气泡当量直径与床层压降；若气泡直径随网格持续变化而无收敛趋势，说明网格仍在数值扩散主导区。经验上单元尺寸降到 $10\,d_p$ 以下后，压降变化应小于 5%，此时才可认为结果与网格无关。

## 参数取值与依据

| 参数 | 推荐取值 | 依据 |
|---|---|---|
| 曳力模型 | 稀相 Schiller–Naumann，稠密 Gidaspow | 相分率 0.2 / 0.8 两个切换点 |
| 恢复系数 $e$ | 0.9（玻璃珠 0.9～0.95） | 颗粒碰撞耗散 |
| 最大堆积分率 | 0.63 | 随机密堆积极限 |
| 网格尺寸 | ≈ $10\,d_p$ | 解析气泡尺度 |
| 入口表速 | 1.5～2 $u_{mf}$ | 保证流化 |
| 相分率松弛 | 0.3～0.5 | 稳定强耦合 |

## multiphaseEulerFoam 配置片段

```cpp
// constant/phaseProperties
phases (air sand);
air
{
    diameterModel    constant;
    constantD        $d;
    d                5e-4;
}
blending
{
    default          linear;
    air_dispersedIn_sand_continuous  { type SchillerNaumann; residualRe 1e-3; }
    air_continuousIn_sand_dispersed  { type GidaspowErgunWenYu; }
}
kineticTheory
{
    type             Lun;
    e                0.9;      // 恢复系数
    alphaMax         0.63;     // 最大堆积分率
    packingLimiter   yes;
    viscosityModel   Gidaspow;
}
// system/fvSolution：给固相压力一个低松弛
"p.*"            { solver PCG; preconditioner DIC; tolerance 1e-8; relTol 0.01; }
```

## 诊断脚本

```python
import math
# 相分率有界性与 Ergun 压降一次性核算
def ergun_dp(eps, dp, u, rho, mu, L):
    visc = 150 * (1-eps)**2 / eps**3 * mu*u/dp**2
    inert = 1.75 * (1-eps) / eps**3 * rho*u**2/dp
    return (visc + inert) * L, visc, inert

dp_tot, v, i = ergun_dp(0.4, 3e-3, 0.5, 1.2, 1.8e-5, 0.5)
print("Ergun: 黏性 %.1f + 惯性 %.1f = %.1f Pa/m" % (v, i, v+i))
print("总压降 = %.0f Pa" % dp_tot)
n, eps = 2.39, 0.6
print("u/ut = %.3f, 床高比 H/H0 = %.2f" % (eps**n, 0.6/0.4))
```

运行输出与上文手算一致：2484 Pa/m、1242 Pa、0.295 与 1.50，可直接与求解器日志对照。

## 曳力模型按相分率区间切换

稀疏区用 Schiller–Naumann，其曳力系数为

$$C_D=\frac{24}{Re_p}\left(1+0.15\,Re_p^{0.687}\right),\qquad Re_p=\frac{\rho_g d_p|\mathbf{u}_g-\mathbf{u}_p|}{\mu_g}$$

取滑移速度 $|\mathbf{u}_g-\mathbf{u}_p|=0.5$ m/s、$d_p=5\times10^{-4}$ m，则 $Re_p=1.2\times5\times10^{-4}\times0.5/1.8\times10^{-5}=16.7$，代入得 $C_D=24/16.7\times(1+0.15\times16.7^{0.687})=2.93$。当分散相分率超过 0.2，颗粒间相互屏蔽使曳力显著下降，必须换成 Gidaspow 混合式：

$$K_{sl}=\begin{cases}\dfrac{3}{4}C_D\dfrac{\alpha_s\alpha_l\rho_l|\mathbf{u}_s-\mathbf{u}_l|}{d_s}\alpha_l^{-2.65}, & \alpha_l>0.8\\[6pt] 150\dfrac{\alpha_s^{2}\mu_l}{\alpha_l d_s^{2}}+1.75\dfrac{\rho_l\alpha_s|\mathbf{u}_s-\mathbf{u}_l|}{d_s}, & \alpha_l\le0.8\end{cases}$$

切换点取液相分率 0.8，低分率支路即 Ergun 型稠密修正。气液鼓泡塔中若液相分率始终高于 0.8，用 Ishii–Zuber 关联式比 Gidaspow 更稳，因为后者在过渡区会出现曳力系数的非物理跳变。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 床层完全不动 | 入口表速低于 $u_{mf}$ | 用 Wen–Yu 式核算 $u_{mf}$，比较入口表速 |
| 局部固相分率超过 0.63 | 未启用 packingLimiter | 打开限幅器，看越界单元是否消失 |
| 相间曳力在过渡区震荡 | 跨过 Gidaspow 切换点 | 固定其余参数，只改切换阈值看是否平滑 |
| 气泡尺寸随网格单调变化 | 网格未解析气泡 | 三档网格做加密对比，看气泡直径是否收敛 |
| 计算时间步骤降 | $g_0$ 在 $\alpha_s\to0.63$ 发散 | 打印最大 $g_0$，超过 100 即需收紧限幅 |
| 局部 $\alpha_s$ 越 0.63 | packingLimiter 未开或过松 | 打印最大 $\alpha_s$，开启限幅后越界是否消失 |
| 压降比 Ergun 高 30% | 曳力模型低估滑移或网格过粗 | 用 Ergun 式核算并对比三档网格压降 |
| 床高随网格持续变化 | 相含率数值扩散未收敛 | 加密到 $10\,d_p$ 后看床高变化是否小于 5% |
| 参数微调结果突跳 | 曳力模型分支硬切换 | 平移切换阈值，看目标量是否出现台阶 |
| 压降正常但床层不膨胀 | 固相压力过大压制流化 | 打印 $g_0$ 与 $p_s$，与动理论量级对比 |

## 曳力切换导致的突跳定位

双流体结果最典型的伪影是"参数微调、结果突跳"，根因几乎都在曳力模型的分支切换。诊断方法是固定其余输入，只把切换阈值沿相分率轴平移，观察目标量（床高、压降）是否平滑过渡。若在某个分率处出现台阶，说明两支路在切换点未做混合，应改用连续混合（如 `blending` 线性权重）而不是硬切换。同理，Ishii–Zuber 与 Gidaspow 在小分率区的差异可达 30%，选型必须用同一算例交叉验证。

## Richardson–Zaki 校验膨胀床床高

均匀膨胀床的滑移速度满足

$$\frac{u}{u_t}=\varepsilon^{n},\qquad n\approx4.65\ (Re_p<0.2),\quad n\approx2.39\ (Re_p>500)$$

取 $\varepsilon=0.6$、$n=2.39$，则 $u/u_t=0.6^{2.39}=0.295$。若单颗粒终速 $u_t=0.48$ m/s，则表观液速应为 $0.142$ m/s。床高由固相质量守恒给出：

$$\frac{H}{H_0}=\frac{1-\varepsilon_0}{1-\varepsilon}=\frac{0.6}{0.4}=1.5$$

即床层膨胀 50%。数值解若给出 1.2 或 1.8 倍膨胀，说明曳力或固相黏度偏离，需按该式反推有效 $u_t$ 再回查曳力系数。

## 参考资料

先定颗粒物性（$\rho_s$、$d_p$、$e$）与堆积分率，再按相分率区间选曳力模型，然后用 $u_{mf}$ 校验入口条件，最后调 `packingLimiter` 与松弛因子。相分率上限、曳力模型类型与 $g_0$ 上限三项必须写进交付记录，因为它们直接决定结果是否物理。
先用相分率有界性排除数值越界，再用 Ergun 与 Richardson–Zaki 把压降与床高钉在解析量级，最后才比较气泡形态与实验。三档网格必须与这两个关联式同时通过，否则加密只是把误差搬了个位置。
1. Gidaspow, D., *Multiphase Flow and Fluidization: Continuum and Kinetic Theory Descriptions*, Academic Press, 1994.
2. Wen, C.Y. & Yu, Y.H., "A Generalized Method for Predicting the Minimum Fluidization Velocity," *AIChE Journal*, 12(3), 1966.
3. Ergun, S., "Fluid Flow through Packed Columns," *Chemical Engineering Progress*, 48(2), 1952.
4. Lun, C.K.K., Savage, S.B., Jeffrey, D.J. & Chepurniy, N., "Kinetic Theories for Granular Flow," *Journal of Fluid Mechanics*, 140, 1984.
5. Syamlal, M. & O'Brien, T.J., "Computer Simulation of Bubbles in a Fluidized Bed," *AIChE Symposium Series*, 85, 1989.
6. Passalacqua, A. & Fox, R.O., "Implementation of an Iterative Solution of the Population Balance Equation in CFD Codes," *Chemical Engineering Science*, 66(20), 2011.
7. Richardson, J.F. & Zaki, W.N., "Sedimentation and Fluidisation: Part I," *Transactions of the Institution of Chemical Engineers*, 32, 1954.
