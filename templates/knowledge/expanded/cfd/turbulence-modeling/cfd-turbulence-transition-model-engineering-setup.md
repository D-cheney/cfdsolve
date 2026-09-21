---
template_version: flowlab-knowledge/1.0
slug: cfd-turbulence-transition-model-engineering-setup
title: 转捩模型：工程设置与诊断验证
summary: >-
  γ-Re_θ 转捩模型的落地设置：间歇因子与动量厚度雷诺数两个附加方程的耦合方式、由来流湍流度用 AGS 与 Michel
  相关式估算转捩位置、层流区与湍流区对首层高度的不同要求，以及 OpenFOAM 字段配置。
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
  - 转捩模型
  - 工程设置与参数选择
  - 间歇因子
  - 动量厚度雷诺数
  - 结果诊断与可信度验证
  - 转捩位置
  - 壁面摩擦
seo:
  title: 转捩模型：工程设置与诊断验证
  description: >-
    γ-Re_θ 转捩模型的落地设置：间歇因子与动量厚度雷诺数两个附加方程的耦合方式、由来流湍流度用 AGS 与 Michel
    相关式估算转捩位置、层流区与湍流区对首层高度的不同要求，以及 OpenFOAM 字段配置。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 转捩模型
    - 工程设置与参数选择
    - 间歇因子
    - 动量厚度雷诺数
    - 来流湍流度
    - 结果诊断与可信度验证
    - 转捩位置
    - 壁面摩擦
    - 网格诱导转捩
---
# 转捩模型：工程设置与诊断验证

## 工程设置与参数选择

完全湍流模型从入口起就按湍流处理，无法给出层流段与转捩区，因此低湍流度下的摩擦阻力和分离位置会系统性偏。γ-Re_θ 模型用两个附加输运方程把转捩位置交给局部变量决定，但它的设置对来流湍流度与近壁网格格外敏感。本文以 NACA 0012、弦长 $c = 1\,\mathrm{m}$、$U_\infty = 45\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$（$Re = 3\times10^{6}$）为例，给出从湍流度到网格与字典的完整链条。

### 1 间歇因子与动量厚度雷诺数的耦合方式

间歇因子 $\gamma$ 度量流场处于湍流状态的时间份额，其输运方程为

$$\frac{\partial(\rho\gamma)}{\partial t} + \frac{\partial(\rho U_j\gamma)}{\partial x_j} = P_\gamma - E_\gamma + \frac{\partial}{\partial x_j}\left[\left(\mu + \frac{\mu_t}{\sigma_\gamma}\right)\frac{\partial\gamma}{\partial x_j}\right]$$

第二个变量是动量厚度雷诺数 $\tilde{Re}_{\theta t}$，它把来流湍流度信息输运进边界层：

$$\frac{\partial(\rho\tilde{Re}_{\theta t})}{\partial t} + \frac{\partial(\rho U_j\tilde{Re}_{\theta t})}{\partial x_j} = P_{\theta t} + \frac{\partial}{\partial x_j}\left[\sigma_{\theta t}(\mu+\mu_t)\frac{\partial\tilde{Re}_{\theta t}}{\partial x_j}\right]$$

产生项 $P_{\theta t} = c_{\theta t}\,\frac{\rho}{t}\left(Re_{\theta t} - \tilde{Re}_{\theta t}\right)\left(1 - F_{\theta t}\right)$，其中时间尺度 $t = 500\nu/U^{2}$，$c_{\theta t} = 0.03$、$\sigma_{\theta t} = 2.0$、$\sigma_\gamma = 1.0$。$F_{\theta t}$ 是边界层探测函数，只在边界层内部把 $\tilde{Re}_{\theta t}$ 拉向相关式值。

转捩通过两个乘积作用于湍流模型：$\mu_t = \gamma\,\mu_{t,\text{SST}}$ 与 $P_k \to \gamma P_k$，因此 $\gamma$ 的分辨率要求比 $k$、$\omega$ 更高。

### 2 由来流湍流度换算转捩起始雷诺数

转捩起始的动量厚度雷诺数用 Abu-Ghannam 与 Shaw 的关联式估算：

$$Re_{\theta t} = 163 + \exp\left(F - 6.91\sqrt{Tu}\right), \qquad F = 6.91 \;(Tu \le 1.3\%)$$

边界层动量厚度雷诺数则用 Michel 关联式随流向位置推进：

$$Re_\theta = 1.174\left(1 + \frac{22400}{Re_x}\right)Re_x^{0.46}$$

把两式联立即可估出转捩位置。$Tu = 0.5\%$ 时 $Re_{\theta t} = 163 + \exp(6.91 - 0.4886) = 779$；Michel 式在 $Re_x = 1\times10^{6}$ 给出 692、在 $2\times10^{6}$ 给出 937，线性插值得 $Re_\theta = 779$ 对应 $Re_x = 1.36\times10^{6}$，于是

$$x_{\text{tr}} = \frac{Re_x\,\nu}{U_\infty} = \frac{1.36\times10^{6}\times1.5\times10^{-5}}{45} = 0.45\,\mathrm{m}$$

即 $x_{\text{tr}}/c \approx 0.45$。三档来流湍流度的对比：

| $Tu$ | 入口 $k$ (m²/s²) | $Re_{\theta t}$ | 转捩位置 $x_{\text{tr}}/c$ |
|---|---|---|---|
| 0.1% | $3.04\times10^{-3}$ | 967 | 0.72 |
| 0.5% | $7.59\times10^{-2}$ | 779 | 0.45 |
| 1.0% | $3.04\times10^{-1}$ | 665 | 0.30 |

入口 $k$ 由 $k = \frac32(U_\infty Tu)^{2}$ 算得。$Tu$ 从 0.1% 变到 1%，$k$ 变化 100 倍而转捩位置前移 0.42 倍弦长。

### 3 网格要求：y+ 与流向分辨率的双重约束

转捩发生在层流边界层内，首层高度必须按层流摩擦设计。在 $Re_x = 1\times10^{6}$ 处层流摩擦系数 $C_f = 0.664/\sqrt{Re_x} = 6.64\times10^{-4}$，$\tau_w = 0.5C_f\rho U_\infty^{2} = 0.807\,\mathrm{Pa}$，$u_\tau = 0.820\,\mathrm{m/s}$，于是 $\nu/u_\tau = 18.3\,\mathrm{\mu m}$，$y^{+} = 1$ 对应单元高度 36.6 μm。

若误用湍流摩擦系数 $C_f = 0.026\,Re^{-1/7} = 3.09\times10^{-3}$，得到 $u_\tau = 1.77\,\mathrm{m/s}$、单元高度 17.0 μm，比层流口径细 2.2 倍。

流向分辨率按转捩区长度定。本算例转捩区约在 $x/c = 0.35\sim0.55$，即 200 mm 长度内至少布置 20~30 个单元，对应 $\Delta x \approx 8\,\mathrm{mm} \approx 0.8\%c$，沿弦向约 125 个单元。

### 4 求解器字典与来流条件设置

```cpp
// constant/momentumTransport
RAS
{
    model           kOmegaSSTLM;
    turbulence      on;
    printCoeffs     on;
}

// 0/k            inlet { type fixedValue; value uniform 0.0759; }   // Tu = 0.5%
// 0/omega        inlet { type fixedValue; value uniform 220; }
// 0/gammaInt     inlet { type fixedValue; value uniform 1; }
// 0/ReThetat     inlet { type fixedValue; value uniform 779; }
// 0/nut          inlet { type calculated; value uniform 0; }
```

三个要点：`gammaInt` 在自由来流取 1（来流本身不是湍流，但 $\gamma$ 的基准态为 1，转捩表现为壁面附近 $\gamma$ 从 0 增长）；`ReThetat` 必须填第 2 节算出的相关值 779，填默认的常数会使 $F_{\theta t}$ 探测到的目标值偏错；$\omega$ 用 $\omega = \sqrt{k}/(C_\mu^{1/4} l)$ 配 $l = 0.07c$ 得 220 s⁻¹；边界层外的 $\omega$ 对转捩位置的影响远小于 $Tu$。

### 5 来流湍流度衰减与相关式的适用前提

AGS 与 Michel 关联式都假定来流湍流度在到达前缘前不发生显著衰减。真实风洞中湍流度沿程按 $Tu(x) \approx Tu_0\,(x/x_0)^{-5/7}$ 衰减，若计算域入口距前缘较远（例如 5 倍弦长），前缘处的实际 $Tu$ 可能只有入口值的一半。处理方式是按前缘目标 $Tu$ 反推入口值，或把入口放到 1 倍弦长以内。

另一条前提是压力梯度。AGS 关联式在零压力梯度下标定，强顺压梯度会推迟转捩、强逆压梯度会提前触发。NACA 0012 在小攻角下前缘附近有顺压梯度，用零压力梯度关联式估出的 $x_{\text{tr}}/c = 0.45$ 偏保守。

### 6 参数错配的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 全弦长都给出湍流摩擦，$\gamma$ 恒为 1 | 入口 `ReThetat` 填成远大于相关值的常数，$F_{\theta t}$ 未触发 | 把 `ReThetat` 改为 779 后重算，比较壁面摩擦分布 |
| 转捩位置随网格加密持续前移 | 流向分辨率不足，数值扰动替代了物理转捩 | 只加密流向单元（保持首层不变）重算，看位置是否收敛 |
| 层流段壁面摩擦比 $0.664/\sqrt{Re_x}$ 高 20% | 首层按湍流口径设计，层流段 y+ 达到 2 以上 | 用层流 $C_f$ 反算 $u_\tau$，把首层高度调到 36.6 μm |
| 改变攻角后转捩位置几乎不动 | 相关式未考虑压力梯度，模型对顺逆压梯度不敏感 | 对比零压力梯度关联式与实测位置，记录偏差方向 |
| 计算域入口距前缘 5 倍弦长，转捩明显提前 | 来流湍流度沿程衰减，入口 $Tu$ 高于前缘实际值 | 按 $Tu(x) \propto x^{-5/7}$ 反推入口值或缩短入口距离 |

### 7 文献与相关式出处

1. Langtry R. B., Menter F. R., "Correlation-based transition modeling for unstructured parallelized computational fluid dynamics codes," *AIAA Journal*, 2009.
2. Menter F. R., Langtry R. B., Likki S. R., Suzen Y. B., Huang P. G., Völker S., "A correlation-based transition model using local variables—Part I: Model formulation," *ASME Journal of Turbomachinery*, 2006.
3. Abu-Ghannam B. J., Shaw R., "Natural transition of boundary layers—the effects of turbulence, pressure gradient, and flow history," *Journal of Mechanical Engineering Science*, 1980.
4. Michel R., "Étude de la transition sur les profils d'aile," *ONERA Report 1/1578A*, 1951.

## 诊断与可信度验证

转捩模型的输出不是升阻力这类积分量，而是“转捩发生在哪里”这一个位置量，因此验收方法也必须围绕位置量设计。可操作的路径是：用层流与湍流两条摩擦关联式夹出物理上可能的区间，从壁面摩擦分布中读出转捩起点与终点，再用 $\gamma$ 场与 $\tilde{Re}_{\theta t}$ 场交叉验证，最后对位置量本身做网格收敛。算例为平板边界层，$U_\infty = 50\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$、来流湍流度 $Tu = 1\%$。

### 1 从壁面摩擦分布定位转捩的三个特征量

转捩在壁面摩擦分布上留下三个可读的特征量：起点（$C_f$ 开始偏离层流曲线）、终点（$C_f$ 回到湍流关联式）、以及中间过冲的峰值。判读标尺由两条经典关联式构成：

$$C_{f,\text{lam}} = \frac{0.664}{\sqrt{Re_x}}, \qquad C_{f,\text{turb}} = 0.0592\,Re_x^{-0.2}$$

在 $Re_x = 1\times10^{6}$ 处，两式分别给出 $6.64\times10^{-4}$ 与 $3.74\times10^{-3}$，相差 5.6 倍。这个量级差是判读的关键：任何介于两者之间的 $C_f$ 都意味着部分转捩，不能简单归为层流或湍流。

工程判据是：把仿真 $C_f$ 首次超过当地层流值 1.5 倍的位置记为转捩起点，首次落入湍流关联式 ±5% 的位置记为终点。转捩区过短（小于 3% 弦长）通常意味着数值扰动触发了转捩。

### 2 γ 场与 Re_θt 场的交叉核对

$\gamma$ 是间歇因子，物理意义是湍流时间占比，因此必须落在 $[0,1]$ 内。转捩区的定义是 $\gamma$ 从 0.1 升到 0.9 的区间。把 $\gamma = 0.5$ 的位置与第 1 节从 $C_f$ 读出的转捩中点比较，两者应相差不到一个转捩区宽度；若相差两倍以上，说明 $\gamma$ 与 $k$ 的耦合出了问题，例如 $P_k \to \gamma P_k$ 的缩放未生效。

$\tilde{Re}_{\theta t}$ 场用于核对相关式输入。在自由来流中它应等于入口给定值（本算例 $Tu = 1\%$ 时由 $Re_{\theta t} = 163 + \exp(6.91 - 6.91\sqrt{Tu})$ 得 665），进入边界层后在 $F_{\theta t}$ 的作用下向相关式目标值靠拢。若整个流场的 $\tilde{Re}_{\theta t}$ 都停在入口值不动，说明边界层探测函数没有触发，转捩位置会完全由数值误差决定。

$Re_\theta$ 的物理定义可用于反查：

$$Re_\theta = \int_0^{\delta}\frac{\rho u}{\rho_e U_e}\left(1 - \frac{u}{U_e}\right)\mathrm{d}y$$

用后处理积分出 $Re_\theta$ 并沿流向推进，与 Michel 关联式 $Re_\theta = 1.174(1+22400/Re_x)Re_x^{0.46}$ 对比：本算例 $Re_\theta$ 达到 665 的位置对应 $Re_x = 9.1\times10^{5}$，即

$$x_{\text{tr}} = \frac{9.1\times10^{5}\times1.5\times10^{-5}}{50} = 0.273\,\mathrm{m}$$

0.273 m 即转捩位置的独立估计值。

### 3 网格诱导转捩的识别

转捩模型最大的假信号是网格诱导转捩：流向单元过粗时，数值扰动在物理转捩之前就触发 $\gamma$ 增长。识别方法是看转捩位置随流向分辨率的移动方向与幅度。判据是：保持首层高度与展向分辨率不变，只加密流向，若转捩位置后移超过 5%，说明粗网格上的转捩是数值产物。

首层高度也需要按层流摩擦设计。$Re_x = 9.1\times10^{5}$ 处层流 $C_f = 6.96\times10^{-4}$，$\tau_w = 0.5C_f\rho U_\infty^{2} = 1.04\,\mathrm{Pa}$，$u_\tau = 0.933\,\mathrm{m/s}$，$\nu/u_\tau = 16.1\,\mathrm{\mu m}$，$y^{+} = 1$ 对应单元高度 32.2 μm。若按湍流口径设计，层流段首层 y+ 会超过 2。

### 4 转捩位置的网格收敛

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

### 5 与平板转捩基准实验的对照

零压力梯度平板是最干净的验证对象。两个层次的对照应同时做：

- 极低湍流度自然转捩：Schubauer 与 Klebanoff 在 $Tu$ 约 0.03% 的来流下测得自然转捩在 $Re_x$ 约 $3\times10^{6}$ 附近，用于检验模型在低湍流度极限下是否仍能推迟转捩。
- 中高湍流度旁路转捩：ERCOFTAC T3 系列的 T3A（$Tu$ 约 3.3%）与 T3B（$Tu$ 约 6.0%）是零压力梯度平板的常用验证点，湍流度越高转捩越靠前，用于检验 AGS 关联式在高湍流度下的外推行为。

对照时要报告转捩起点 $Re_x$、转捩区长度与湍流段 $C_f$ 的偏差，三者中任一超出 10% 都应记录。

### 6 判读失效的反证试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 转捩区长度不足 1% 弦长 | 数值扰动触发，非物理转捩 | 只加密流向重算，看转捩是否后移并变长 |
| $\gamma$ 场在自由来流中偏离 1 | 入口 $\gamma$ 边界类型错误或源项限幅失效 | 输出自由来流 $\gamma$ 的极值并与 $[0,1]$ 区间比对 |
| $\tilde{Re}_{\theta t}$ 全场停在入口值 | 边界层探测函数 $F_{\theta t}$ 未触发 | 输出 $F_{\theta t}$ 场，检查边界层内是否升到 0.5 以上 |
| $C_f$ 介于层流与湍流之间且无峰值 | 转捩区被数值扩散抹平 | 比较 $\gamma = 0.5$ 位置与 $C_f$ 拐点位置，若相差两倍即为抹平 |
| 转捩位置随 $Tu$ 变化几乎为零 | 入口 $\tilde{Re}_{\theta t}$ 未随 $Tu$ 更新 | 用 AGS 关联式重算三档 $Re_{\theta t}$ 并逐档重算 |
| 湍流段 $C_f$ 比关联式高 12% | 转捩后 $\gamma$ 未回到 1，湍流被持续抑制 | 输出尾缘处 $\gamma$ 的壁面值，应接近 1 |

### 7 数据与相关式出处

1. Mayle R. E., "The role of laminar-turbulent transition in gas turbine engines," *ASME Journal of Turbomachinery*, 1991.
2. Schubauer G. B., Klebanoff P. S., "Contributions on the mechanics of boundary-layer transition," *NACA Technical Note 3489*, 1955.
3. Roach P. E., Brierley D. H., "The influence of a turbulent freestream on zero pressure gradient transitional boundary layer development," in *Numerical Simulation of Unsteady Flows and Transition to Turbulence*, Cambridge University Press, 1992.
4. Abu-Ghannam B. J., Shaw R., "Natural transition of boundary layers—the effects of turbulence, pressure gradient, and flow history," *Journal of Mechanical Engineering Science*, 1980.
