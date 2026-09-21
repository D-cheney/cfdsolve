---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-non-newtonian-flow-diagnosis-validation
title: "非牛顿流变：结果诊断与可信度验证"
summary: "非牛顿算例的偏差集中在黏度场的剪切率依赖、屈服应力造成的塞流区、以及黏弹性效应。本文给出广义雷诺数、壁面剪切率、塞流半径与魏森贝格数的实算核对方法及判定阈值。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "非牛顿流变"
  - "结果诊断与可信度验证"
  - "广义雷诺数"
  - "塞流"
seo:
  title: "非牛顿流变：结果诊断与可信度验证"
  description: "非牛顿算例的偏差集中在黏度场的剪切率依赖、屈服应力造成的塞流区、以及黏弹性效应。本文给出广义雷诺数、壁面剪切率、塞流半径与魏森贝格数的实算核对方法及判定阈值。"
  keywords:
    - "非牛顿流变"
    - "结果诊断与可信度验证"
    - "广义雷诺数"
    - "塞流"
---

# 非牛顿流变：结果诊断与可信度验证

非牛顿算例的失效很少表现为发散，而是表现为"看起来合理但差 30%"：压降偏高、中心速度剖面异常平坦、黏度场在局部跳到上限。这些症状都能对应到具体机制，也都能用手算量独立核对。本文给出四个诊断量——表观黏度、广义雷诺数、壁面剪切率与塞流半径——以及各自的判定阈值。

## 1 表观黏度必须随剪切率核对

幂律流体 $\tau = K\dot\gamma^{n}$ 的表观黏度为

$$
\mu_{\text{app}} = \frac{\tau}{\dot\gamma} = K\dot\gamma^{\,n-1}
$$

取羧甲基纤维素溶液 $K = 5\,\mathrm{Pa\cdot s^{n}}$、$n = 0.6$、$\rho = 1000\,\mathrm{kg/m^3}$，在两个剪切率下核算：

- $\dot\gamma = 10\,\mathrm{s^{-1}}$：$\mu_{\text{app}} = 5\times10^{-0.4} = 1.99\,\mathrm{Pa\cdot s}$
- $\dot\gamma = 100\,\mathrm{s^{-1}}$：$\mu_{\text{app}} = 5\times100^{-0.4} = 0.794\,\mathrm{Pa\cdot s}$

同一流体在两个剪切率下表观黏度相差 2.5 倍。诊断的第一件事是把 CFD 的黏度场与这个区间对照：如果全场黏度几乎恒定（例如都在 $2\,\mathrm{Pa\cdot s}$ 附近），说明剪切率场没有被正确计算，多半是求解器把黏度当常数处理，或者剪切率张量的不变量取错。

## 2 广义雷诺数与区制判断

非牛顿流动不能直接用 $\mu$ 算雷诺数，需要用 Metzner-Reed 广义雷诺数：

$$
Re_{MR} = \frac{\rho U^{2-n}D^{n}}{K'\,8^{\,n-1}}, \qquad K' = K\left(\frac{3n+1}{4n}\right)^{n}
$$

壁面剪切率由幂律速度剖面的解析解给出：

$$
\dot\gamma_w = \frac{3n+1}{4n}\cdot\frac{8U}{D}
$$

取 $D = 0.05\,\mathrm{m}$、$U = 0.5\,\mathrm{m/s}$：$\dot\gamma_w = (2.8/2.4)\times80 = 93.3\,\mathrm{s^{-1}}$，$\mu_{\text{app}} = 5\times93.3^{-0.4} = 0.815\,\mathrm{Pa\cdot s}$，简单雷诺数 $\rho UD/\mu_{\text{app}} = 30.7$。再用 Metzner-Reed 式：$K' = 5\times1.1667^{0.6} = 5.48$，$Re_{MR} = 1000\times0.5^{1.4}\times0.05^{0.6}/(5.48\times8^{-0.4}) = 62.8/2.39 = 26.3$。层流摩擦因子 $f = 64/Re_{MR} = 2.43$，10 m 管段的压降为

$$
\Delta p = f\frac{L}{D}\frac{1}{2}\rho U^{2} = 2.43\times200\times125 = 60.8\,\mathrm{kPa}
$$

用 Hagen-Poiseuille 式以 $\mu_{\text{app}} = 0.815\,\mathrm{Pa\cdot s}$ 独立验算：$\Delta p = 32\mu LU/D^{2} = 32\times0.815\times10\times0.5/0.0025 = 52.2\,\mathrm{kPa}$。两者相差 16%，说明幂律与牛顿等效之间的换算存在系统差异——这正是为什么不能拿等效牛顿黏度去代替幂律模型。

## 3 屈服应力与塞流区

含屈服应力的 Herschel-Bulkley 流体在管道中会出现中心塞流区，其半径由力平衡给出：

$$
r_p = \frac{2\tau_y}{\Delta p/L}
$$

若 $\Delta p/L$ 低于 $2\tau_y/R$，流体完全不流动。取 $\tau_y = 10\,\mathrm{Pa}$、$R = 25\,\mathrm{mm}$，启动压降梯度阈值为 $2\times10/0.025 = 800\,\mathrm{Pa/m}$。在 $\Delta p/L = 6080\,\mathrm{Pa/m}$（对应上节的 60.8 kPa / 10 m）下，$r_p = 2\times10/6080 = 3.3\,\mathrm{mm}$，占半径的 13%，塞流核很小；而若梯度只有 $1000\,\mathrm{Pa/m}$，$r_p = 20\,\mathrm{mm}$，占半径 80%，此时中心几乎全部是未屈服区。诊断时把 CFD 的轴向速度剖面与 $r_p$ 对照：塞流核内速度应严格平坦，若剖面呈抛物线，说明屈服应力没有生效。

## 4 黏弹性与魏森贝格数

弹性效应由魏森贝格数衡量：

$$
Wi = \lambda\dot\gamma
$$

$\lambda$ 为松弛时间。$Wi \lesssim 1$ 时弹性可忽略，广义牛顿模型足够；$Wi > 1$ 时出现法向应力差、爬杆效应与弹性湍流，必须用黏弹性本构。取 $\lambda = 0.05\,\mathrm{s}$、$\dot\gamma_w = 93.3\,\mathrm{s^{-1}}$，$Wi = 4.7$，已进入弹性主导区。此时若仍用纯黏性模型，弯头下游的二次流强度会被低估一半以上，且出口会出现非物理的压力振荡。

## 5 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 黏度场在低速区跳到上限并形成大片"胶状"区 | 剪切率趋零导致 $\mu_{\text{app}} = K\dot\gamma^{n-1}$ 发散 | 检查是否设置了黏度上下限，核对限值是否落在实验剪切率范围内 |
| 压降比幂律手算高 30% 以上 | 忽略了屈服应力，或存在壁面滑移 | 用 $r_p$ 公式估算塞流核，并检查壁面是否设滑移 |
| 中心速度剖面呈抛物线而非平坦 | 屈服应力未写入本构，或正则化参数过大 | 把 $\tau_y$ 从 0 调到实验值，观察塞流核是否出现 |
| 网格加密后压降持续下降 | 高剪切率区（近壁）网格不足 | 检查近壁单元尺度与 $\dot\gamma_w$ 的匹配，补到 5 层以上 |
| 出口出现周期性压力振荡 | $Wi > 1$ 的弹性不稳定被纯黏性模型捕捉成数值噪声 | 计算 $Wi$，超过 1 换黏弹性本构复算 |
| 用等效牛顿黏度后区制判断错 | 等效黏度取在错误的剪切率上 | 用 $\dot\gamma_w$ 处的 $\mu_{\text{app}}$ 重算 $Re_{MR}$ |

## 6 用独立脚本核对黏度与压降

```bash
# 提取剪切率与黏度场，检查是否落在实验区间内
postProcess -func "components(volFieldValue)" -latestTime   # 或 shearRate
foamDictionary -entry "functions.shearRate" -set true system/controlDict

python3 - <<'PY'
K, n, rho, U, D, L = 5.0, 0.6, 1000.0, 0.5, 0.05, 10.0
gdot_w = (3*n+1)/(4*n) * 8*U/D
mu_app = K * gdot_w**(n-1)
Kp = K * ((3*n+1)/(4*n))**n
ReMR = rho * U**(2-n) * D**n / (Kp * 8**(n-1))
f = 64 / ReMR
dp = f * L/D * 0.5*rho*U**2
print(f"gdot_w={gdot_w:.1f} 1/s  mu_app={mu_app:.3f} Pa.s")
print(f"Re_MR={ReMR:.1f}  f={f:.3f}  dp={dp/1000:.1f} kPa")
print(f"mu at 10 and 100 1/s: {K*10**(n-1):.3f}, {K*100**(n-1):.3f} Pa.s")
PY
```

## 7 验收时要能回答的问题

1. 黏度场的取值范围是否与实验剪切率区间内的表观黏度一致？
2. $Re_{MR}$ 是否用壁面剪切率处的表观黏度计算，区制判断是否可靠？
3. 压降是否与幂律解析解和等效牛顿解都在合理区间内一致？
4. 含屈服应力时，CFD 速度剖面的塞流核半径是否与 $r_p$ 公式吻合？
5. $Wi$ 是否超过 1，若超过是否说明为何仍使用广义牛顿模型？
6. 近壁网格是否足以解析高剪切率梯度（至少 5 层）？
7. 是否检查了黏度限幅值对压降的影响（改动限幅后结果是否变化）？

## 8 参考文献

1. Metzner A.B., Reed J.C., "Flow of Non-Newtonian Fluids — Correlation of the Laminar, Transition, and Turbulent-Flow Regions," *AIChE Journal*, 1955.
2. Bird R.B., Armstrong R.C., Hassager O., *Dynamics of Polymeric Liquids, Vol. 1: Fluid Mechanics*, 2nd ed., Wiley, 1987.
3. Chhabra R.P., Richardson J.F., *Non-Newtonian Flow and Applied Rheology*, 2nd ed., Butterworth-Heinemann, 2008.
4. Barnes H.A., Hutton J.F., Walters K., *An Introduction to Rheology*, Elsevier, 1989.
