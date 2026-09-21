---
template_version: "flowlab-knowledge/1.0"
slug: cfd-multiphase-lagrangian-particles-diagnosis-validation
title: "拉格朗日颗粒跟踪：结果诊断与可信度验证"
summary: "用质量账闭合、颗粒包统计误差、颗粒 Reynolds 数反算曳力区、阶跃响应对照解析解四项诊断验收拉格朗日颗粒跟踪，给出各阈值、手算过程与可复现的随机游走检查脚本。"
category:
  slug: multiphase-flow
  name: "多相流与组分输运"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "多相流与组分输运"
  - "拉格朗日颗粒跟踪"
  - "结果诊断与可信度验证"
  - "颗粒 Reynolds 数"
  - "统计收敛"
seo:
  title: "拉格朗日颗粒跟踪：结果诊断与可信度验证"
  description: "用质量账闭合、颗粒包统计误差、颗粒 Reynolds 数反算曳力区、阶跃响应对照解析解四项诊断验收拉格朗日颗粒跟踪，给出各阈值、手算过程与可复现的随机游走检查脚本。"
  keywords:
    - "拉格朗日颗粒跟踪"
    - "结果诊断与可信度验证"
    - "颗粒 Reynolds 数"
    - "统计收敛"
---

# 拉格朗日颗粒跟踪：结果诊断与可信度验证

颗粒跟踪的失效很少表现为残差发散，而是表现为质量账对不上、统计量随颗粒包数漂移、或曳力区选错导致的系统性偏移。诊断顺序因此不同于连续相：先查质量账，再查统计收敛，然后用 $Re_p$ 反算曳力区，最后拿阶跃响应与解析解对照。本文四项诊断都给出阈值与手算过程，环境取空气 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s、$\rho_p=2500$ kg/m³。

## 质量账必须逐时闭合

注入、逃逸、捕集与域内存量必须逐时平衡：

$$\varepsilon_m(t)=\frac{\left|\dot m_{in}\,t-m_{esc}-m_{trap}-m_{domain}(t)\right|}{\dot m_{in}\,t}<0.5\%$$

取 $\dot m_{in}=0.01$ kg/s、$t=10$ s，则累计注入 0.1 kg。若日志给出逃逸 0.06 kg、捕集 0.02 kg、域内 0.0198 kg，合计 0.0998 kg，误差 $0.0002/0.1=0.2\%$，在容差内。若误差随 $t$ 单调增长，问题在壁面行为或蒸发源项；若在注入启动瞬间跳一次，属于颗粒包一次性释放的正常瞬态。

## 颗粒包数量决定统计误差

沉积率、分离效率这类比值量的统计标准差为

$$\sigma_Y=\sqrt{\frac{Y(1-Y)}{N}}$$

取 $Y=0.5$、$N=10^4$，得 $\sigma_Y=5.0\times10^{-3}$，即 0.5%；若只投放 $N=10^3$，误差升到 1.58%。因此要 0.5% 量级的效率精度，颗粒包数需 $10^4$ 起步。诊断方法是把 $N$ 依次取 $10^3$、$5\times10^3$、$10^4$、$2\times10^4$ 各跑一遍，看效率是否落在 $\pm2\sigma_Y$ 带内；若始终单调漂移，说明统计尚未收敛而非随机波动。

## 用 $Re_p$ 反算曳力区

Stokes 沉降公式只在小 $Re_p$ 成立，必须用反算结果判断是否越界。对 $d_p=80$ μm：

$$u_t^{St}=\frac{(\rho_p-\rho_g)d_p^{2}g}{18\mu_g}=\frac{2498.8\times6.4\times10^{-9}\times9.81}{3.24\times10^{-4}}=0.484\ \text{m/s}$$

再算颗粒 Reynolds 数

$$Re_p=\frac{\rho_g d_p u_t^{St}}{\mu_g}=\frac{1.2\times8\times10^{-5}\times0.484}{1.8\times10^{-5}}=2.58$$

$Re_p=2.58$ 已明显大于 1，Stokes 假设失效。改用 Schiller–Naumann 的修正因子 $f=1+0.15Re_p^{0.687}=1+0.15\times1.92=1.29$，曳力增大，终速降到约 $0.484/1.29=0.375$ m/s，比 Stokes 估计低约 22%。若求解器仍按 Stokes 曳力给出 0.48 m/s，就是曳力区选错的直接证据。

## 阶跃响应对照颗粒时间常数

把颗粒放入速度阶跃的流体中，其速度响应有解析解：

$$u_p(t)=u_c\left(1-e^{-t/\tau_p}\right),\qquad \tau_p=\frac{\rho_p d_p^{2}}{18\mu_g}$$

对 80 μm 颗粒，$\tau_p=2500\times6.4\times10^{-9}/3.24\times10^{-4}=0.049$ s。在 $t=\tau_p=49$ ms 时颗粒速度应为流体速度的 63.2%，在 $t=3\tau_p=148$ ms 时达到 95%。这是最容易复算的验证：在零重力、无湍流的均匀流里给一个阶跃，看数值解是否落在该解析曲线上。若响应过快，多半是曳力被高估；响应过慢则是时间步不足或滑移修正遗漏。

## 湍流扩散的可复现性

随机游走模型必须固定随机种子，否则两次运行结果无法区分"物理变化"与"随机波动"。诊断方法是固定种子跑两遍，若沉积率逐位不一致，说明模型读取了并行进程数或时间步作为随机源。另外要用至少 5 个不同种子评估统计带：若不同种子间的效率差异超过 $2\sigma_Y$，说明 $N$ 不足或扩散模型参数未被标定。

## 诊断脚本

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

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 质量账误差逐时增长 | 壁面捕集或蒸发源项不闭合 | 关蒸发重算，看误差是否停止增长 |
| 沉积率随颗粒包数单调漂移 | 统计未收敛 | 依次加倍 $N$，看是否落进 $2\sigma_Y$ 带 |
| 终速与 Stokes 估计一致 | 曳力区选错，未用 $Re_p$ 修正 | 用 $Re_p$ 反算，比较 Schiller–Naumann 终速 |
| 阶跃响应快于解析解 | 曳力被高估或滑移修正缺失 | 零重力均匀流给阶跃，对照 $1-e^{-t/\tau_p}$ |
| 两次运行结果不同 | 随机种子未固定 | 固定种子复跑，比较是否逐位一致 |

## 校验顺序与文献

先闭合质量账，再确认统计收敛，然后用 $Re_p$ 与阶跃响应锁定曳力闭合是否正确，最后才与实验比较效率与沉积分布。任何一步未过，后续对比都失去意义；被否定的假设与对应证据同样要留档。

1. Crowe, C.T., Sommerfeld, M. & Tsuji, Y., *Multiphase Flows with Droplets and Particles*, CRC Press, 1998.
2. Morsi, S.A. & Alexander, A.J., "An Investigation of Particle Trajectories in Two-Phase Flow Systems," *Journal of Fluid Mechanics*, 55(2), 1972.
3. Gosman, A.D. & Ioannides, E., "Aspects of Computer Simulation of Liquid-Fuelled Combustors," *Journal of Energy*, 7(6), 1983.
4. Maxey, M.R. & Riley, J.J., "Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow," *Physics of Fluids*, 26(4), 1983.
5. Sommerfeld, M., Kohnen, G. & Rüger, M., "Some Comments on the Applicability of the Standard k-ε Turbulence Model," *Applied Scientific Research*, 51, 1993.
6. Rosin, P. & Rammler, E., "The Laws Governing the Fineness of Powdered Coal," *Journal of the Institute of Fuel*, 7, 1933.
