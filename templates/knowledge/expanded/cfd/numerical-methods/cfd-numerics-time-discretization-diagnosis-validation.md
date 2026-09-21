---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-time-discretization-diagnosis-validation
title: "时间离散与误差控制：结果诊断与可信度验证"
summary: "用观测时间阶、稳定性上限与刚性模态放大因子三条指标定位时间离散误差：给出 Richardson 外推的手算、Crank–Nicolson 在刚性模态下放大因子趋于 -1 的推导，以及伪时间残差与物理时间精度的区分方法。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "时间离散与误差控制"
  - "结果诊断与可信度验证"
  - "Richardson 外推"
  - "刚性稳定性"
seo:
  title: "时间离散与误差控制：结果诊断与可信度验证"
  description: "用观测时间阶、稳定性上限与刚性模态放大因子三条指标定位时间离散误差：给出 Richardson 外推的手算、Crank–Nicolson 在刚性模态下放大因子趋于 -1 的推导，以及伪时间残差与物理时间精度的区分方法。"
  keywords:
    - "时间离散与误差控制"
    - "结果诊断与可信度验证"
    - "Richardson 外推"
    - "刚性稳定性"
---

# 时间离散与误差控制：结果诊断与可信度验证

时间方向的误差最难诊断，因为它在空间网格不变的情况下不会随迭代次数下降，残差曲线也完全看不出来。真正能区分"物理上确实在演化"和"数值上在漂移"的只有三件事：观测时间阶是否等于格式的名义阶、步长是否还在稳定性域内、刚性模态有没有被正确耗散。

## 指标一：用 Richardson 外推读出观测时间阶

设某个目标量在步长 $\Delta t$、$\Delta t/2$、$\Delta t/4$ 下的解为 $\phi_1,\phi_2,\phi_3$，相邻差作为误差估计：

$$p=\frac{\ln\left(\dfrac{\left\|\phi_1-\phi_2\right\|}{\left\|\phi_2-\phi_3\right\|}\right)}{\ln 2}$$

手算一次。某算例的涡脱频率在三个步长下的解依次为 1.0023 kHz、1.0006 kHz、1.0002 kHz，则相邻差为 $1.7\ \mathrm{Hz}$ 与 $0.4\ \mathrm{Hz}$：

$$p=\frac{\ln\left(1.7/0.4\right)}{\ln 2}=\frac{\ln 4.25}{0.6931}=\frac{1.447}{0.6931}=2.09$$

观测阶 2.09 与二阶格式的名义阶相符，说明时间步已经进入渐近区。若观测阶只有 0.8，先怀疑内迭代没有收敛，而不是怀疑格式。

## 指标二：步长是否还在稳定性域内

显式欧拉推进扩散项，放大因子 $G=1+\lambda\Delta t$，要求 $\left|G\right|\le1$ 即 $\lambda\Delta t\ge-2$。取 $\lambda=-2\nu/\Delta x^{2}$，得到

$$\Delta t\le\frac{\Delta x^{2}}{2\nu}$$

手算：$\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，$\Delta x=5.0\times10^{-4}\ \mathrm{m}$：

$$\Delta t_{\text{diff}}\le\frac{\left(5.0\times10^{-4}\right)^{2}}{2\times1.5\times10^{-5}}=\frac{2.5\times10^{-7}}{3.0\times10^{-5}}=8.3\times10^{-3}\ \mathrm{s}$$

同一网格上取 $u=1.0\ \mathrm{m/s}$，对流 CFL 限制为

$$\Delta t_{\text{adv}}\le\frac{\Delta x}{u}=\frac{5.0\times10^{-4}}{1.0}=5.0\times10^{-4}\ \mathrm{s}$$

对流限制比扩散紧 17 倍。诊断时如果发现解在 $\Delta t=10^{-3}\ \mathrm{s}$ 附近开始振荡，对应的其实是对流 CFL 被突破（$\mathrm{CFL}=2$），不是扩散不稳定。

## 指标三：刚性模态被耗散还是被保留

Crank–Nicolson 的放大因子是

$$G_{\text{CN}}=\frac{1+\lambda\Delta t/2}{1-\lambda\Delta t/2}$$

当 $\lambda\Delta t\to-\infty$ 时 $G_{\text{CN}}\to-1$：模值趋于 1 且符号交替，意味着刚性模态既不被耗散也不被放大，会以 $2\Delta t$ 周期长期驻留。后向欧拉

$$G_{\text{BE}}=\frac{1}{1-\lambda\Delta t}\xrightarrow{\ \lambda\Delta t\to-\infty\ }0$$

则把刚性模态直接抹掉。这就是 L-稳定性与 A-稳定性的差别：两者都稳定，但只有 L-稳定能抑制刚性振荡。

工程判据：若时间步内 $2\Delta t$ 周期的锯齿在固定位置反复出现、且降低内迭代次数不改变其幅值，就是 CN 的非 L-稳定行为，应改用 `Euler` 或 `backward` 推进启动阶段，或用 `CrankNicolson 0.9` 加上限。

## 区分伪时间残差与物理时间精度

```bash
# 1. 观测时间阶: 三档步长, 同一物理时刻取样
for dt in 1e-3 5e-4 2.5e-4; do
  sed -i "s/^deltaT .*/deltaT ${dt};/" system/controlDict
  ./Allrun
  postProcess -func "probes" -time 0.5 > probe_${dt}.dat
done

# 2. 内迭代是否收敛: 固定步长, 只改 nCorrectors
for nc in 1 2 4; do
  sed -i "s/nCorrectors .*/nCorrectors ${nc};/" system/fvSolution
  ./Allrun && postProcess -func "probes" -time 0.5 > nc_${nc}.dat
done

# 3. 伪时间残差单独观察: 稳态求解器下看 continuity 误差
grep "time step continuity errors" log.run | tail -20
```

第 2 步是关键对照：内迭代从 1 加到 4 后探针值变化小于 0.5 %，说明代数误差已不主导，此时步长研究才有意义。若内迭代次数改变就让结果跳变 5 % 以上，前面做的三档步长比较测的是内迭代残差而不是时间离散误差。

## 诊断量汇总

| 诊断量 | 计算方式 | 合格阈值 | 不合格时的含义 |
|---|---|---|---|
| 观测时间阶 | Richardson 公式 | 与名义阶差 < 0.3 | 未进入渐近区或内迭代不足 |
| 对流 CFL | $u\Delta t/\Delta x$ | $\le1$（显式） | 对流不稳定 |
| 扩散数 | $\nu\Delta t/\Delta x^{2}$ | $\le0.5$ | 扩散不稳定 |
| 内迭代敏感性 | nCorrectors 1→4 的目标量差 | < 0.5 % | 代数误差主导 |
| 刚性模态放大因子 | $\left|G(\lambda\Delta t)\right|$ | 刚性模态应 $\to0$ | 格式非 L-稳定 |
| 周期平均窗口 | 至少 20 个周期 | 统计量漂移 < 1 % | 统计未收敛 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 目标量以 $2\Delta t$ 周期锯齿 | Crank–Nicolson 非 L-稳定 | 改 `backward` 重跑，锯齿应消失 |
| 观测阶在细步长上掉到 0.5 | 内迭代残差地板高于时间误差 | nCorrectors 翻倍，观测阶应回升 |
| 残差降到 $10^{-6}$ 但探针值持续漂移 | 伪时间收敛不等于物理时间收敛 | 固定内迭代，改步长看探针值是否收敛 |
| $\Delta t$ 减半结果变化 8 % | 仍在稳定性边缘附近 | 计算 CFL 与扩散数，确认哪一个被突破 |
| 稳态求解器给出周期性解 | 流动本质非定常，被伪时间推进掩盖 | 换成瞬态求解器重跑，周期性应更清晰 |

## 参考文献

1. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
2. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
3. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, ASME Journal of Fluids Engineering, 130(7):078001, 2008.
4. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems involving differential equations*, Philosophical Transactions of the Royal Society A, 210:307–357, 1911.
