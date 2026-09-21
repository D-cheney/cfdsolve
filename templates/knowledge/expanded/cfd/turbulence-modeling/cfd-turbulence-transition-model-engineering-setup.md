---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-transition-model-engineering-setup
title: "转捩模型：工程设置与参数选择"
summary: "γ-Re_θ 转捩模型的落地设置：间歇因子与动量厚度雷诺数两个附加方程的耦合方式、由来流湍流度用 AGS 与 Michel 相关式估算转捩位置、层流区与湍流区对首层高度的不同要求，以及 OpenFOAM 字段配置。"
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
  - "转捩模型"
  - "工程设置与参数选择"
  - "间歇因子"
  - "动量厚度雷诺数"
seo:
  title: "转捩模型：工程设置与参数选择"
  description: "γ-Re_θ 转捩模型的落地设置：间歇因子与动量厚度雷诺数两个附加方程的耦合方式、由来流湍流度用 AGS 与 Michel 相关式估算转捩位置、层流区与湍流区对首层高度的不同要求，以及 OpenFOAM 字段配置。"
  keywords:
    - "转捩模型"
    - "工程设置与参数选择"
    - "间歇因子"
    - "动量厚度雷诺数"
    - "来流湍流度"
---

# 转捩模型：工程设置与参数选择

完全湍流模型从入口起就按湍流处理，无法给出层流段与转捩区，因此低湍流度下的摩擦阻力和分离位置会系统性偏。γ-Re_θ 模型用两个附加输运方程把转捩位置交给局部变量决定，但它的设置对来流湍流度与近壁网格格外敏感。本文以 NACA 0012、弦长 $c = 1\,\mathrm{m}$、$U_\infty = 45\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$（$Re = 3\times10^{6}$）为例，给出从湍流度到网格与字典的完整链条。

## 1 间歇因子与动量厚度雷诺数的耦合方式

间歇因子 $\gamma$ 度量流场处于湍流状态的时间份额，其输运方程为

$$\frac{\partial(\rho\gamma)}{\partial t} + \frac{\partial(\rho U_j\gamma)}{\partial x_j} = P_\gamma - E_\gamma + \frac{\partial}{\partial x_j}\left[\left(\mu + \frac{\mu_t}{\sigma_\gamma}\right)\frac{\partial\gamma}{\partial x_j}\right]$$

第二个变量是动量厚度雷诺数 $\tilde{Re}_{\theta t}$，它把来流湍流度信息输运进边界层：

$$\frac{\partial(\rho\tilde{Re}_{\theta t})}{\partial t} + \frac{\partial(\rho U_j\tilde{Re}_{\theta t})}{\partial x_j} = P_{\theta t} + \frac{\partial}{\partial x_j}\left[\sigma_{\theta t}(\mu+\mu_t)\frac{\partial\tilde{Re}_{\theta t}}{\partial x_j}\right]$$

产生项 $P_{\theta t} = c_{\theta t}\,\frac{\rho}{t}\left(Re_{\theta t} - \tilde{Re}_{\theta t}\right)\left(1 - F_{\theta t}\right)$，其中时间尺度 $t = 500\nu/U^{2}$，$c_{\theta t} = 0.03$、$\sigma_{\theta t} = 2.0$、$\sigma_\gamma = 1.0$。$F_{\theta t}$ 是边界层探测函数，只在边界层内部把 $\tilde{Re}_{\theta t}$ 拉向相关式值。

转捩通过两个乘积作用于湍流模型：$\mu_t = \gamma\,\mu_{t,\text{SST}}$ 与 $P_k \to \gamma P_k$，因此 $\gamma$ 的分辨率要求比 $k$、$\omega$ 更高。

## 2 由来流湍流度换算转捩起始雷诺数

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

## 3 网格要求：y+ 与流向分辨率的双重约束

转捩发生在层流边界层内，首层高度必须按层流摩擦设计。在 $Re_x = 1\times10^{6}$ 处层流摩擦系数 $C_f = 0.664/\sqrt{Re_x} = 6.64\times10^{-4}$，$\tau_w = 0.5C_f\rho U_\infty^{2} = 0.807\,\mathrm{Pa}$，$u_\tau = 0.820\,\mathrm{m/s}$，于是 $\nu/u_\tau = 18.3\,\mathrm{\mu m}$，$y^{+} = 1$ 对应单元高度 36.6 μm。

若误用湍流摩擦系数 $C_f = 0.026\,Re^{-1/7} = 3.09\times10^{-3}$，得到 $u_\tau = 1.77\,\mathrm{m/s}$、单元高度 17.0 μm，比层流口径细 2.2 倍。

流向分辨率按转捩区长度定。本算例转捩区约在 $x/c = 0.35\sim0.55$，即 200 mm 长度内至少布置 20~30 个单元，对应 $\Delta x \approx 8\,\mathrm{mm} \approx 0.8\%c$，沿弦向约 125 个单元。

## 4 求解器字典与来流条件设置

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

## 5 来流湍流度衰减与相关式的适用前提

AGS 与 Michel 关联式都假定来流湍流度在到达前缘前不发生显著衰减。真实风洞中湍流度沿程按 $Tu(x) \approx Tu_0\,(x/x_0)^{-5/7}$ 衰减，若计算域入口距前缘较远（例如 5 倍弦长），前缘处的实际 $Tu$ 可能只有入口值的一半。处理方式是按前缘目标 $Tu$ 反推入口值，或把入口放到 1 倍弦长以内。

另一条前提是压力梯度。AGS 关联式在零压力梯度下标定，强顺压梯度会推迟转捩、强逆压梯度会提前触发。NACA 0012 在小攻角下前缘附近有顺压梯度，用零压力梯度关联式估出的 $x_{\text{tr}}/c = 0.45$ 偏保守。

## 6 参数错配的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 全弦长都给出湍流摩擦，$\gamma$ 恒为 1 | 入口 `ReThetat` 填成远大于相关值的常数，$F_{\theta t}$ 未触发 | 把 `ReThetat` 改为 779 后重算，比较壁面摩擦分布 |
| 转捩位置随网格加密持续前移 | 流向分辨率不足，数值扰动替代了物理转捩 | 只加密流向单元（保持首层不变）重算，看位置是否收敛 |
| 层流段壁面摩擦比 $0.664/\sqrt{Re_x}$ 高 20% | 首层按湍流口径设计，层流段 y+ 达到 2 以上 | 用层流 $C_f$ 反算 $u_\tau$，把首层高度调到 36.6 μm |
| 改变攻角后转捩位置几乎不动 | 相关式未考虑压力梯度，模型对顺逆压梯度不敏感 | 对比零压力梯度关联式与实测位置，记录偏差方向 |
| 计算域入口距前缘 5 倍弦长，转捩明显提前 | 来流湍流度沿程衰减，入口 $Tu$ 高于前缘实际值 | 按 $Tu(x) \propto x^{-5/7}$ 反推入口值或缩短入口距离 |

## 7 文献与相关式出处

1. Langtry R. B., Menter F. R., "Correlation-based transition modeling for unstructured parallelized computational fluid dynamics codes," *AIAA Journal*, 2009.
2. Menter F. R., Langtry R. B., Likki S. R., Suzen Y. B., Huang P. G., Völker S., "A correlation-based transition model using local variables—Part I: Model formulation," *ASME Journal of Turbomachinery*, 2006.
3. Abu-Ghannam B. J., Shaw R., "Natural transition of boundary layers—the effects of turbulence, pressure gradient, and flow history," *Journal of Mechanical Engineering Science*, 1980.
4. Michel R., "Étude de la transition sur les profils d'aile," *ONERA Report 1/1578A*, 1951.
