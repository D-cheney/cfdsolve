---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-non-newtonian-flow-modeling
title: 非牛顿流变：原理与诊断验证
summary: >-
  幂律、Cross、Carreau-Yasuda 与 Herschel-Bulkley
  各有自己的有效剪切率区间，外推会给出荒谬的黏度。本文用血液与钻井液两组实测参数说明本构选择依据、参数来源与越界后的失效信号。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 非牛顿流变
  - 物理建模与适用边界
  - Carreau-Yasuda
  - 本构模型
  - 结果诊断与可信度验证
  - 广义雷诺数
  - 塞流
seo:
  title: 非牛顿流变：原理与诊断验证
  description: >-
    幂律、Cross、Carreau-Yasuda 与 Herschel-Bulkley
    各有自己的有效剪切率区间，外推会给出荒谬的黏度。本文用血液与钻井液两组实测参数说明本构选择依据、参数来源与越界后的失效信号。
  keywords:
    - 非牛顿流变
    - 物理建模与适用边界
    - Carreau-Yasuda
    - 本构模型
    - 结果诊断与可信度验证
    - 广义雷诺数
    - 塞流
---
# 非牛顿流变：原理与诊断验证

本构模型的选择错误会以"黏度不合理"的形式暴露：要么在低剪切率区发散到几十 Pa·s，要么在高剪切率区失去剪切变稀的饱和行为。本文用血液与钻井液两组已发表参数说明四个常用本构的适用范围、参数来源与越界信号，并指出一个高频错误——把 Carreau 模型的拟合时间常数当作黏弹性松弛时间使用。非牛顿算例的失效很少表现为发散，而是表现为"看起来合理但差 30%"：压降偏高、中心速度剖面异常平坦、黏度场在局部跳到上限。这些症状都能对应到具体机制，也都能用手算量独立核对。

## 幂律：只在中等剪切率区间可用

幂律模型只有两个参数，是最常用的起点：

$$
\tau = K\dot\gamma^{\,n}, \qquad \mu_{\text{app}} = K\dot\gamma^{\,n-1}
$$

$n < 1$ 为剪切变稀。问题是当 $\dot\gamma \to 0$ 且 $n < 1$ 时，$\mu_{\text{app}}$ 按幂律发散。取 $K = 5\,\mathrm{Pa\cdot s^{n}}$、$n = 0.6$：$\dot\gamma = 0.1\,\mathrm{s^{-1}}$ 时 $\mu_{\text{app}} = 12.6\,\mathrm{Pa\cdot s}$，$\dot\gamma = 0.01\,\mathrm{s^{-1}}$ 时升到 $31.5\,\mathrm{Pa\cdot s}$，$\dot\gamma = 0.001\,\mathrm{s^{-1}}$ 时达到 $79.4\,\mathrm{Pa\cdot s}$。而真实流体在低剪切率下会趋于零剪切黏度 $\mu_0$ 并出现平台。因此幂律只应在流变仪实测覆盖的剪切率区间内使用，并且求解器里必须给黏度上下限，否则回流区与滞止区会生成大片假胶体。

## Herschel-Bulkley：含屈服应力的钻井液与水泥浆

存在屈服应力时用 Herschel-Bulkley 模型：

$$
\tau = \tau_y + K\dot\gamma^{\,n}, \qquad \mu_{\text{app}} = \frac{\tau_y}{\dot\gamma} + K\dot\gamma^{\,n-1}
$$

取钻井液 $\tau_y = 15\,\mathrm{Pa}$、$K = 8\,\mathrm{Pa\cdot s^{n}}$、$n = 0.7$：$\dot\gamma = 50\,\mathrm{s^{-1}}$ 时 $\mu_{\text{app}} = 15/50+8\times50^{-0.3} = 0.3+2.47 = 2.77\,\mathrm{Pa\cdot s}$；$\dot\gamma = 5\,\mathrm{s^{-1}}$ 时 $\mu_{\text{app}} = 3+4.94 = 7.94\,\mathrm{Pa\cdot s}$。$\tau_y/\dot\gamma$ 项主导低剪切率行为，这正是塞流核的物理来源。用幂律拟合这组数据在 $5\sim50\,\mathrm{s^{-1}}$ 区间内误差可以压到 10% 以内，但在 $\dot\gamma < 1\,\mathrm{s^{-1}}$ 区会完全失真，且无法预测启动压降阈值 $2\tau_y/R$。

## 弹性效应：松弛时间与拟合常数的区别

判断是否需要黏弹性本构，用魏森贝格数：

$$
Wi = \lambda_{\text{relax}}\,\dot\gamma
$$

$Wi < 1$ 时广义牛顿模型足够，$Wi > 1$ 时法向应力差与弹性不稳定不可忽略。聚合物溶液的松弛时间通常在 $10^{-2}\sim10^{-1}\,\mathrm{s}$ 量级，取 $\lambda_{\text{relax}} = 0.05\,\mathrm{s}$、$\dot\gamma = 93\,\mathrm{s^{-1}}$，$Wi = 4.7$，需要 Oldroyd-B 或 Giesekus 类模型。

这里有一个必须澄清的点：Carreau-Yasuda 中的 $\lambda$ 是曲线拟合的时间常数，与分子松弛时间没有对应关系。血液的 $\lambda = 3.313\,\mathrm{s}$ 若被当成松弛时间代入 $Wi$，会得到 $Wi = 3.313\times600 = 1988$ 这样荒谬的数值，进而误判为强弹性流动。松弛时间必须来自独立的振荡剪切或应力松弛实验。

## 本构选择顺序

1. 用流变仪确定实测覆盖的剪切率区间与是否出现零剪切平台。
2. 有零剪切平台且无屈服应力：用 Carreau-Yasuda，参数由曲线拟合给出。
3. 有明确屈服应力：用 Herschel-Bulkley，并用启动压降实验核对 $\tau_y$。
4. 只有中等剪切率数据且精度要求不高：可用幂律，但必须限定适用范围并设置黏度限幅。
5. 由独立实验得到松弛时间后计算 $Wi$，超过 1 才切换到黏弹性本构。
6. 记录所有流变参数的温度、浓度与测量方法，避免跨工况复制。

## Carreau-Yasuda：带零剪切与无穷剪切平台的四参数模型

要同时描述低剪切率平台与高剪切率饱和，用 Carreau-Yasuda 模型：

$$
\mu = \mu_\infty + \left(\mu_0-\mu_\infty\right)\left[1+\left(\lambda\dot\gamma\right)^{a}\right]^{\frac{n-1}{a}}
$$

$a = 2$ 时退化为经典 Carreau 模型。血液的经典参数为 $\mu_0 = 0.056\,\mathrm{Pa\cdot s}$、$\mu_\infty = 0.00345\,\mathrm{Pa\cdot s}$、$\lambda = 3.313\,\mathrm{s}$、$n = 0.3568$（$\rho \approx 1060\,\mathrm{kg/m^3}$）。核算两个剪切率：

- $\dot\gamma = 1\,\mathrm{s^{-1}}$：$\left[1+3.313^{2}\right]^{-0.3216} = 0.450$，$\mu = 0.00345+0.05255\times0.450 = 0.0271\,\mathrm{Pa\cdot s}$
- $\dot\gamma = 100\,\mathrm{s^{-1}}$：$\left[1+331.3^{2}\right]^{-0.3216} = 0.0239$，$\mu = 0.00345+0.05255\times0.0239 = 0.0047\,\mathrm{Pa\cdot s}$

表观黏度从 27 mPa·s 降到 4.7 mPa·s，跨越 5.8 倍，正是血液剪切变稀的典型幅度。用于动脉流动时，壁面剪切率 $\dot\gamma_w = 8U/D$，取 $D = 4\,\mathrm{mm}$、$U = 0.3\,\mathrm{m/s}$ 得 $600\,\mathrm{s^{-1}}$，代入得 $\mu = 0.0038\,\mathrm{Pa\cdot s}$，$Re = \rho UD/\mu = 331$，仍为层流。若按零剪切黏度 $\mu_0 = 0.056\,\mathrm{Pa\cdot s}$ 估算，$Re$ 只有 22.7，虽然区制判断相同，但压降会被高估一个数量级。

## 求解器配置示例

OpenFOAM 的广义牛顿求解器通过 `transportProperties` 切换本构：

```cpp
// constant/transportProperties  (nonNewtonianIcoFoam / icoFoam + generalisedNewtonian)
transportModel  BirdCarreau;

BirdCarreauCoeffs
{
    nu0             5.28e-05;   // 0.056 / 1060, m^2/s
    nuInf           3.26e-06;   // 0.00345 / 1060, m^2/s
    k               3.313;      // 拟合时间常数, s
    n               0.3568;
}

// 含屈服应力时改为:
// transportModel  HerschelBulkley;
// HerschelBulkleyCoeffs
// {
//     nu0         1e-03;      // 正则化黏度, 用于限制 tau0/gammaDot 的发散
//     tau0        15;         // Pa
//     k           8;          // Pa.s^n
//     n           0.7;
// }
```

注意 `nu0` 在 Herschel-Bulkley 条目中的含义是正则化黏度而不是零剪切黏度，取值过大会把塞流核抹平；一般取 $\tau_y/\dot\gamma_{\max}$ 的十分之一量级并做敏感性检查。

## 用独立脚本核对黏度与压降

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

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 回流区黏度升到几十 Pa·s 并形成假固体 | 幂律在低剪切率外推发散 | 换 Carreau-Yasuda 或加黏度上限，比较压降变化 |
| 计算 $Wi$ 高达上千，被判为强弹性 | 把 Carreau 的 $\lambda$ 当松弛时间 | 用振荡剪切实验的松弛时间重算 $Wi$ |
| 高剪切率区黏度不再下降、偏离实验 | 幂律缺少高剪切饱和平台 | 换 Cross 或 Carreau 模型，核对 $\mu_\infty$ |
| 无屈服应力的模型算不出启动压降阈值 | 本构缺少 $\tau_y$ 项 | 用 Herschel-Bulkley 复算，核对 $2\tau_y/R$ |
| 塞流核被抹平为抛物线剖面 | 正则化黏度 `nu0` 取值过大 | 把 `nu0` 减小一个量级，观察核区是否变平坦 |
| 温度变化 20 K 后压降偏差 30% | $K$、$n$ 未随温度更新 | 用两个温度下的流变数据重新拟合并做敏感性分析 |
| 黏度场在低速区跳到上限并形成大片"胶状"区 | 剪切率趋零导致 $\mu_{\text{app}} = K\dot\gamma^{n-1}$ 发散 | 检查是否设置了黏度上下限，核对限值是否落在实验剪切率范围内 |
| 压降比幂律手算高 30% 以上 | 忽略了屈服应力，或存在壁面滑移 | 用 $r_p$ 公式估算塞流核，并检查壁面是否设滑移 |
| 中心速度剖面呈抛物线而非平坦 | 屈服应力未写入本构，或正则化参数过大 | 把 $\tau_y$ 从 0 调到实验值，观察塞流核是否出现 |
| 网格加密后压降持续下降 | 高剪切率区（近壁）网格不足 | 检查近壁单元尺度与 $\dot\gamma_w$ 的匹配，补到 5 层以上 |
| 出口出现周期性压力振荡 | $Wi > 1$ 的弹性不稳定被纯黏性模型捕捉成数值噪声 | 计算 $Wi$，超过 1 换黏弹性本构复算 |
| 用等效牛顿黏度后区制判断错 | 等效黏度取在错误的剪切率上 | 用 $\dot\gamma_w$ 处的 $\mu_{\text{app}}$ 重算 $Re_{MR}$ |

## 验收时要能回答的问题

1. 黏度场的取值范围是否与实验剪切率区间内的表观黏度一致？
2. $Re_{MR}$ 是否用壁面剪切率处的表观黏度计算，区制判断是否可靠？
3. 压降是否与幂律解析解和等效牛顿解都在合理区间内一致？
4. 含屈服应力时，CFD 速度剖面的塞流核半径是否与 $r_p$ 公式吻合？
5. $Wi$ 是否超过 1，若超过是否说明为何仍使用广义牛顿模型？
6. 近壁网格是否足以解析高剪切率梯度（至少 5 层）？
7. 是否检查了黏度限幅值对压降的影响（改动限幅后结果是否变化）？

## 表观黏度必须随剪切率核对

幂律流体 $\tau = K\dot\gamma^{n}$ 的表观黏度为

$$
\mu_{\text{app}} = \frac{\tau}{\dot\gamma} = K\dot\gamma^{\,n-1}
$$

取羧甲基纤维素溶液 $K = 5\,\mathrm{Pa\cdot s^{n}}$、$n = 0.6$、$\rho = 1000\,\mathrm{kg/m^3}$，在两个剪切率下核算：

- $\dot\gamma = 10\,\mathrm{s^{-1}}$：$\mu_{\text{app}} = 5\times10^{-0.4} = 1.99\,\mathrm{Pa\cdot s}$
- $\dot\gamma = 100\,\mathrm{s^{-1}}$：$\mu_{\text{app}} = 5\times100^{-0.4} = 0.794\,\mathrm{Pa\cdot s}$

同一流体在两个剪切率下表观黏度相差 2.5 倍。诊断的第一件事是把 CFD 的黏度场与这个区间对照：如果全场黏度几乎恒定（例如都在 $2\,\mathrm{Pa\cdot s}$ 附近），说明剪切率场没有被正确计算，多半是求解器把黏度当常数处理，或者剪切率张量的不变量取错。

## 广义雷诺数与区制判断

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

## 屈服应力与塞流区

含屈服应力的 Herschel-Bulkley 流体在管道中会出现中心塞流区，其半径由力平衡给出：

$$
r_p = \frac{2\tau_y}{\Delta p/L}
$$

若 $\Delta p/L$ 低于 $2\tau_y/R$，流体完全不流动。取 $\tau_y = 10\,\mathrm{Pa}$、$R = 25\,\mathrm{mm}$，启动压降梯度阈值为 $2\times10/0.025 = 800\,\mathrm{Pa/m}$。在 $\Delta p/L = 6080\,\mathrm{Pa/m}$（对应上节的 60.8 kPa / 10 m）下，$r_p = 2\times10/6080 = 3.3\,\mathrm{mm}$，占半径的 13%，塞流核很小；而若梯度只有 $1000\,\mathrm{Pa/m}$，$r_p = 20\,\mathrm{mm}$，占半径 80%，此时中心几乎全部是未屈服区。诊断时把 CFD 的轴向速度剖面与 $r_p$ 对照：塞流核内速度应严格平坦，若剖面呈抛物线，说明屈服应力没有生效。

## 黏弹性与魏森贝格数

弹性效应由魏森贝格数衡量：

$$
Wi = \lambda\dot\gamma
$$

$\lambda$ 为松弛时间。$Wi \lesssim 1$ 时弹性可忽略，广义牛顿模型足够；$Wi > 1$ 时出现法向应力差、爬杆效应与弹性湍流，必须用黏弹性本构。取 $\lambda = 0.05\,\mathrm{s}$、$\dot\gamma_w = 93.3\,\mathrm{s^{-1}}$，$Wi = 4.7$，已进入弹性主导区。此时若仍用纯黏性模型，弯头下游的二次流强度会被低估一半以上，且出口会出现非物理的压力振荡。

## 参考资料

1. Carreau P.J., "Rheological Equations from Molecular Network Theories," *Transactions of the Society of Rheology*, 1972.
2. Yasuda K., Armstrong R.C., Cohen R.E., "Shear Flow Properties of Concentrated Solutions of Linear and Star Branched Polystyrenes," *Rheologica Acta*, 1981.
3. Cho Y.I., Kensey K.R., "Effects of the Non-Newtonian Viscosity of Blood on Flows in a Diseased Arterial Vessel," *Biorheology*, 1991.
4. Herschel W.H., Bulkley R., "Konsistenzmessungen von Gummi-Benzollösungen," *Kolloid-Zeitschrift*, 1926.
5. Metzner A.B., Reed J.C., "Flow of Non-Newtonian Fluids — Correlation of the Laminar, Transition, and Turbulent-Flow Regions," *AIChE Journal*, 1955.
6. Bird R.B., Armstrong R.C., Hassager O., *Dynamics of Polymeric Liquids, Vol. 1: Fluid Mechanics*, 2nd ed., Wiley, 1987.
7. Chhabra R.P., Richardson J.F., *Non-Newtonian Flow and Applied Rheology*, 2nd ed., Butterworth-Heinemann, 2008.
8. Barnes H.A., Hutton J.F., Walters K., *An Introduction to Rheology*, Elsevier, 1989.
