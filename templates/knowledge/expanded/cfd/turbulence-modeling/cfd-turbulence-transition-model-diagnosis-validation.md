---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-transition-model-diagnosis-validation
title: "转捩模型：结果诊断与可信度验证"
summary: "如何判定转捩模型给出的转捩位置可信：用层流与湍流摩擦关联式构造判读标尺、从壁面摩擦分布提取转捩起点与终点、γ 场与 Re_θt 场的交叉核对、识别网格诱导转捩，并对转捩位置做网格收敛。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "转捩模型"
  - "结果诊断与可信度验证"
  - "转捩位置"
  - "壁面摩擦"
seo:
  title: "转捩模型：结果诊断与可信度验证"
  description: "如何判定转捩模型给出的转捩位置可信：用层流与湍流摩擦关联式构造判读标尺、从壁面摩擦分布提取转捩起点与终点、γ 场与 Re_θt 场的交叉核对、识别网格诱导转捩，并对转捩位置做网格收敛。"
  keywords:
    - "转捩模型"
    - "结果诊断与可信度验证"
    - "转捩位置"
    - "壁面摩擦"
    - "网格诱导转捩"
---

# 转捩模型：结果诊断与可信度验证

转捩模型的输出不是升阻力这类积分量，而是“转捩发生在哪里”这一个位置量，因此验收方法也必须围绕位置量设计。可操作的路径是：用层流与湍流两条摩擦关联式夹出物理上可能的区间，从壁面摩擦分布中读出转捩起点与终点，再用 $\gamma$ 场与 $\tilde{Re}_{\theta t}$ 场交叉验证，最后对位置量本身做网格收敛。算例为平板边界层，$U_\infty = 50\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$、来流湍流度 $Tu = 1\%$。

## 1 从壁面摩擦分布定位转捩的三个特征量

转捩在壁面摩擦分布上留下三个可读的特征量：起点（$C_f$ 开始偏离层流曲线）、终点（$C_f$ 回到湍流关联式）、以及中间过冲的峰值。判读标尺由两条经典关联式构成：

$$C_{f,\text{lam}} = \frac{0.664}{\sqrt{Re_x}}, \qquad C_{f,\text{turb}} = 0.0592\,Re_x^{-0.2}$$

在 $Re_x = 1\times10^{6}$ 处，两式分别给出 $6.64\times10^{-4}$ 与 $3.74\times10^{-3}$，相差 5.6 倍。这个量级差是判读的关键：任何介于两者之间的 $C_f$ 都意味着部分转捩，不能简单归为层流或湍流。

工程判据是：把仿真 $C_f$ 首次超过当地层流值 1.5 倍的位置记为转捩起点，首次落入湍流关联式 ±5% 的位置记为终点。转捩区过短（小于 3% 弦长）通常意味着数值扰动触发了转捩。

## 2 γ 场与 Re_θt 场的交叉核对

$\gamma$ 是间歇因子，物理意义是湍流时间占比，因此必须落在 $[0,1]$ 内。转捩区的定义是 $\gamma$ 从 0.1 升到 0.9 的区间。把 $\gamma = 0.5$ 的位置与第 1 节从 $C_f$ 读出的转捩中点比较，两者应相差不到一个转捩区宽度；若相差两倍以上，说明 $\gamma$ 与 $k$ 的耦合出了问题，例如 $P_k \to \gamma P_k$ 的缩放未生效。

$\tilde{Re}_{\theta t}$ 场用于核对相关式输入。在自由来流中它应等于入口给定值（本算例 $Tu = 1\%$ 时由 $Re_{\theta t} = 163 + \exp(6.91 - 6.91\sqrt{Tu})$ 得 665），进入边界层后在 $F_{\theta t}$ 的作用下向相关式目标值靠拢。若整个流场的 $\tilde{Re}_{\theta t}$ 都停在入口值不动，说明边界层探测函数没有触发，转捩位置会完全由数值误差决定。

$Re_\theta$ 的物理定义可用于反查：

$$Re_\theta = \int_0^{\delta}\frac{\rho u}{\rho_e U_e}\left(1 - \frac{u}{U_e}\right)\mathrm{d}y$$

用后处理积分出 $Re_\theta$ 并沿流向推进，与 Michel 关联式 $Re_\theta = 1.174(1+22400/Re_x)Re_x^{0.46}$ 对比：本算例 $Re_\theta$ 达到 665 的位置对应 $Re_x = 9.1\times10^{5}$，即

$$x_{\text{tr}} = \frac{9.1\times10^{5}\times1.5\times10^{-5}}{50} = 0.273\,\mathrm{m}$$

0.273 m 即转捩位置的独立估计值。

## 3 网格诱导转捩的识别

转捩模型最大的假信号是网格诱导转捩：流向单元过粗时，数值扰动在物理转捩之前就触发 $\gamma$ 增长。识别方法是看转捩位置随流向分辨率的移动方向与幅度。判据是：保持首层高度与展向分辨率不变，只加密流向，若转捩位置后移超过 5%，说明粗网格上的转捩是数值产物。

首层高度也需要按层流摩擦设计。$Re_x = 9.1\times10^{5}$ 处层流 $C_f = 6.96\times10^{-4}$，$\tau_w = 0.5C_f\rho U_\infty^{2} = 1.04\,\mathrm{Pa}$，$u_\tau = 0.933\,\mathrm{m/s}$，$\nu/u_\tau = 16.1\,\mathrm{\mu m}$，$y^{+} = 1$ 对应单元高度 32.2 μm。若按湍流口径设计，层流段首层 y+ 会超过 2。

## 4 转捩位置的网格收敛

对位置量做网格收敛，方法与积分量相同。三套网格（加密比 $r = 1.5$）给出 $x_{\text{tr}} = 0.283$、$0.276$、$0.273\,\mathrm{m}$。相对差 $\varepsilon_{21} = -2.47\times10^{-2}$、$\varepsilon_{32} = -1.09\times10^{-2}$，比值 0.440 给出观测阶 $p = \ln(1/0.440)/\ln 1.5 = 2.03$，进入渐近区。于是

$$GCI = \frac{1.25\times2.47\times10^{-2}}{1.5^{2.03}-1} = 2.4\%$$

即 $x_{\text{tr}} = 0.276 \pm 2.4\%$，区间为 $[0.269,\,0.283]\,\mathrm{m}$。第 2 节由 Michel 关联式得到的 0.273 m 落在区间内，可作为模型未引入系统偏差的证据。若两者相差超过 10%，应优先怀疑来流湍流度与相关式标定条件的差异，而不是继续加密网格。

```python
import numpy as np
nu, U, Tu = 1.5e-5, 50.0, 0.01
Rethet = 163 + np.exp(6.91 - 6.91 * Tu ** 0.5)
print(f"Tu={Tu:.3f}  Re_theta_t={Rethet:.1f}")
Cf_lam = lambda Rex: 0.664 / Rex ** 0.5
Cf_tur = lambda Rex: 0.0592 * Rex ** -0.2
print(f"Re_x=1e6  Cf_lam={Cf_lam(1e6):.3e}  Cf_tur={Cf_tur(1e6):.3e}"
      f"  ratio={Cf_tur(1e6)/Cf_lam(1e6):.2f}")
Rex = np.linspace(2e5, 3e6, 400)
Ret = 1.174 * (1 + 22400 / Rex) * Rex ** 0.46
Rex_tr = Rex[np.argmin(abs(Ret - Rethet))]
print(f"Re_x_tr={Rex_tr:.3e}  x_tr={Rex_tr*nu/U*1e3:.1f} mm")
x = np.array([0.283, 0.276, 0.273]); r = 1.5
e21, e32 = (x[1]-x[0])/x[0], (x[2]-x[1])/x[1]
p = np.log(abs(e32/e21)) / np.log(r)
print(f"p={p:.2f}  GCI={1.25*abs(e21)/(r**p-1)*100:.2f}%")
```

脚本输出 $Re_{\theta t} = 665.0$、$x_{\text{tr}} = 273.3\,\mathrm{mm}$、观测阶 2.03 与 $GCI = 2.4\%$，与手算一致。

## 5 与平板转捩基准实验的对照

零压力梯度平板是最干净的验证对象。两个层次的对照应同时做：

- 极低湍流度自然转捩：Schubauer 与 Klebanoff 在 $Tu$ 约 0.03% 的来流下测得自然转捩在 $Re_x$ 约 $3\times10^{6}$ 附近，用于检验模型在低湍流度极限下是否仍能推迟转捩。
- 中高湍流度旁路转捩：ERCOFTAC T3 系列的 T3A（$Tu$ 约 3.3%）与 T3B（$Tu$ 约 6.0%）是零压力梯度平板的常用验证点，湍流度越高转捩越靠前，用于检验 AGS 关联式在高湍流度下的外推行为。

对照时要报告转捩起点 $Re_x$、转捩区长度与湍流段 $C_f$ 的偏差，三者中任一超出 10% 都应记录。

## 6 判读失效的反证试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 转捩区长度不足 1% 弦长 | 数值扰动触发，非物理转捩 | 只加密流向重算，看转捩是否后移并变长 |
| $\gamma$ 场在自由来流中偏离 1 | 入口 $\gamma$ 边界类型错误或源项限幅失效 | 输出自由来流 $\gamma$ 的极值并与 $[0,1]$ 区间比对 |
| $\tilde{Re}_{\theta t}$ 全场停在入口值 | 边界层探测函数 $F_{\theta t}$ 未触发 | 输出 $F_{\theta t}$ 场，检查边界层内是否升到 0.5 以上 |
| $C_f$ 介于层流与湍流之间且无峰值 | 转捩区被数值扩散抹平 | 比较 $\gamma = 0.5$ 位置与 $C_f$ 拐点位置，若相差两倍即为抹平 |
| 转捩位置随 $Tu$ 变化几乎为零 | 入口 $\tilde{Re}_{\theta t}$ 未随 $Tu$ 更新 | 用 AGS 关联式重算三档 $Re_{\theta t}$ 并逐档重算 |
| 湍流段 $C_f$ 比关联式高 12% | 转捩后 $\gamma$ 未回到 1，湍流被持续抑制 | 输出尾缘处 $\gamma$ 的壁面值，应接近 1 |

## 7 数据与相关式出处

1. Mayle R. E., "The role of laminar-turbulent transition in gas turbine engines," *ASME Journal of Turbomachinery*, 1991.
2. Schubauer G. B., Klebanoff P. S., "Contributions on the mechanics of boundary-layer transition," *NACA Technical Note 3489*, 1955.
3. Roach P. E., Brierley D. H., "The influence of a turbulent freestream on zero pressure gradient transitional boundary layer development," in *Numerical Simulation of Unsteady Flows and Transition to Turbulence*, Cambridge University Press, 1992.
4. Abu-Ghannam B. J., Shaw R., "Natural transition of boundary layers—the effects of turbulence, pressure gradient, and flow history," *Journal of Mechanical Engineering Science*, 1980.
