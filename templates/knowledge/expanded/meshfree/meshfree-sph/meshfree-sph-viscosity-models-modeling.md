---
template_version: flowlab-knowledge/1.0
slug: meshfree-sph-viscosity-models-modeling
title: 物理与人工黏性：原理、设置与验证
summary: >-
  区分层流黏性与人工黏性两类耗散的物理来源与离散式，给出由 α 反算等效运动黏度的手算、Balsara 开关的构造，以及数值黏度如何封顶可达到的雷诺数。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-sph
  name: 无网格法 · SPH 理论与实现
level: 进阶
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - 无网格法
  - 无网格法 · SPH 理论与实现
  - 物理与人工黏性
  - SPH 离散原理与适用边界
  - Monaghan 人工黏性
  - Balsara 开关
  - 工程设置与参数选择
  - α 反算
  - 动力黏度
  - 结果诊断与可信度验证
  - Taylor-Green 涡
seo:
  title: 物理与人工黏性：原理、设置与验证
  description: >-
    区分层流黏性与人工黏性两类耗散的物理来源与离散式，给出由 α 反算等效运动黏度的手算、Balsara 开关的构造，以及数值黏度如何封顶可达到的雷诺数。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 物理与人工黏性
    - SPH 离散原理与适用边界
    - Monaghan 人工黏性
    - Balsara 开关
    - 等效运动黏度
    - 工程设置与参数选择
    - α 反算
    - 动力黏度
    - 结果诊断与可信度验证
    - Taylor-Green 涡
    - Poiseuille
---
# 物理与人工黏性：原理、设置与验证

## 原理与适用范围

SPH 里存在两类完全不同的黏性：一类是代表真实流体动量输运的层流黏性项，另一类是为抑制冲击振荡与粒子飞散而人为加入的数值黏性。把二者混为一谈会让雷诺数失去物理意义，也会让"调黏性"变成掩盖其他误差的手段。本文给出两类项的离散式、由系数反算等效运动黏度的方法，以及 Balsara 开关把人工黏性限制在激波处的条件。

### 层流黏性项的离散构造

真实黏性来自动量方程的 $\nabla\cdot(\mu\nabla\mathbf{v})$，SPH 用核近似把它写成沿粒子连线的差分：

$$
\mathbf{a}_{\nu,i}=\sum_j m_j\frac{\mu_i+\mu_j}{\rho_i\rho_j}\frac{\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}\nabla_i W_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$，$\mathbf{x}_{ij}=\mathbf{x}_i-\mathbf{x}_j$，$\epsilon=0.01$ 防止粒子接近时除零。该式对 $\mu_i=\mu_j=\mu$ 退化为标准的拉普拉斯近似，量纲为 $\mathrm{m/s^2}$。它的耗散正比于真实动力黏度，因此 $\mu$ 应由流体物性给定，而非调节。

### 人工黏性的 Monaghan 形式

人工黏性以压力项附加量的形式进入动量方程：

$$
\Pi_{ij}=
\begin{cases}
\dfrac{-\alpha_\Pi\,\bar c_{ij}\,\phi_{ij}+\beta_\Pi\,\phi_{ij}^2}{\bar\rho_{ij}}, & \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}<0\\[6pt]
0, & \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}\ge0
\end{cases},\qquad
\phi_{ij}=\frac{h\,\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}
$$

$\bar c_{ij}=(c_i+c_j)/2$、$\bar\rho_{ij}=(\rho_i+\rho_j)/2$，$\Pi_{ij}$ 只在与粒子相互接近时激活。$\alpha_\Pi$ 控制线性项，用于平滑冲击与抑制飞散，常用 $0.01\sim0.1$；$\beta_\Pi$ 控制二次项，仅在超音速冲击中启用，亚音速算例取 $0$。水动力问题马赫数 $Ma=u_{\max}/c_s=2.80/30=0.093$，$\phi_{ij}^2$ 项比线性项小两个量级，因此 $\beta_\Pi=0$ 是正确选择。

### 由 α 反算等效运动黏度

人工黏性在连续极限下等效为一个运动黏度，二维近似为

$$
\nu_{\mathrm{art}}\approx\frac{\alpha_\Pi\,c_s\,h}{8}
$$

取 $\alpha_\Pi=0.05$、$c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$，得 $\nu_{\mathrm{art}}=0.05\times30\times0.012/8=2.25\times10^{-3}\ \mathrm{m^2/s}$。20 °C 水的真实运动黏度为 $\nu=\mu/\rho=1.004\times10^{-3}/998.2=1.006\times10^{-6}\ \mathrm{m^2/s}$。两者相差 $2237$ 倍，说明默认 $\alpha_\Pi$ 的耗散完全由数值黏性主导。

### 数值黏度如何封顶雷诺数

雷诺数 $Re=UL/\nu$。取 $U=1.0\ \mathrm{m/s}$、$L=0.10\ \mathrm{m}$、$\nu=1.006\times10^{-6}\ \mathrm{m^2/s}$，真实 $Re=9.94\times10^4$。但求解器实际感受到的是 $\nu+\nu_{\mathrm{art}}=2.251\times10^{-3}\ \mathrm{m^2/s}$，对应 $Re_{\mathrm{eff}}=UL/(\nu+\nu_{\mathrm{art}})=1.0\times0.10/2.251\times10^{-3}=44.4$。也就是说，用 $\alpha_\Pi=0.05$ 的默认设置，无论怎么加密都只能得到 $Re\approx44$ 的流动。要模拟高雷诺数问题，必须把 $\alpha_\Pi$ 降到 $0.01$ 以下并配 Balsara 开关，或改用层流项承担全部物理黏性。

### Balsara 开关把耗散限制在激波处

Balsara 提出用当地压缩与剪切之比调制 $\alpha$：

$$
f_i=\frac{\left|\nabla\cdot\mathbf{v}\right|_i}{\left|\nabla\cdot\mathbf{v}\right|_i+\left|\nabla\times\mathbf{v}\right|_i+0.0001\,c_i/h_i},\qquad \alpha_i=\alpha_0 f_i
$$

纯剪切区 $\nabla\cdot\mathbf{v}\to0$ 时 $f_i\to0$，人工黏性自动关闭，涡结构得以保留；激波处 $\nabla\times\mathbf{v}\to0$、$\nabla\cdot\mathbf{v}$ 大，$f_i\to1$，耗散恢复。分母的 $0.0001c_i/h_i$ 是防止两者同时为零的奇异性项，量级上等于 $0.0001\times30/0.012=0.25\ \mathrm{s^{-1}}$。

### 失效边界与判定信号

层流项在 $\epsilon h^2$ 与 $\lvert\mathbf{x}_{ij}\rvert^2$ 可比时失效：$\sqrt{\epsilon}h=0.1\times0.012=1.2\times10^{-3}\ \mathrm{m}$，即粒子间距小于 $1.2\ \mathrm{mm}$ 时该项被正则化主导，此时应改用更高阶的拉普拉斯算子。人工黏性在拉伸区（$\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}>0$）完全不激活，因此它无法抑制拉伸不稳定性，后者需靠应力正则化处理。若关闭 $\alpha_\Pi$ 后流场立即出现高频振荡，说明数值黏性在承担本应由分辨率承担的稳定作用，此时应先加密而非恢复 $\alpha$。

```
# 黏性加速度：层流项 + Balsara 调制的人工黏性
for i in range(N):
    for j in neighbors[i]:
        vij, xij = v[i]-v[j], x[i]-x[j]
        r2  = dot(xij, xij) + 1e-2*h*h
        # 层流（物理）项
        mu_ij = (mu[i]+mu[j]) / (rho[i]*rho[j])
        a_visc[i] += m[j]*mu_ij*dot(vij,xij)/r2 * gradW(xij,h)
        # 人工黏性（数值）项，仅接近时激活
        if dot(vij, xij) < 0:
            phi  = h*dot(vij,xij)/r2
            cbar = 0.5*(cs[i]+cs[j]); rbar = 0.5*(rho[i]+rho[j])
            Pi   = (-alpha*Balsara[i]*cbar*phi + beta*phi*phi)/rbar
            a_pres[i] -= m[j]*Pi*gradW(xij,h)
```

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 涡结构迅速衰减、涡量对消 | 人工黏性过大，数值黏度主导 | 由 $\alpha_\Pi c_s h/8$ 算 $\nu_{\mathrm{art}}$，与 $\nu$ 比较量级 |
| 冲击后出现高频振荡 | 线性项 $\alpha_\Pi$ 偏小或 $\beta_\Pi$ 未启用 | 固定 $\alpha_\Pi$ 扫 $\beta_\Pi=0,1,2$，看冲击后密度振荡幅值 |
| 剪切层被过度抹平 | 缺少 Balsara 开关，剪切区也在耗散 | 对比开/关 Balsara 后涡量峰值 |
| 加密后仍达不到目标 $Re$ | 数值黏度封顶了有效雷诺数 | 算 $Re_{\mathrm{eff}}=UL/(\nu+\nu_{\mathrm{art}})$ |
| 粒子近距离时加速度爆增 | $\epsilon h^2$ 正则化不足 | 检查最小粒子间距是否低于 $1.2\times10^{-3}\ \mathrm{m}$ |

### 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., Gingold R.A., *Shock simulation by the particle method SPH*, Journal of Computational Physics, Vol. 52, 1983.
3. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
4. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
5. Español P., Revenga M., *Smoothed dissipative particle dynamics*, Physical Review E, Vol. 67, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.

## 工程设置与参数选择

黏性设置之所以容易出错，是因为 $\alpha_\Pi$ 这类系数看上去只是"稳定性参数"，实际却等价于一个可换算的运动黏度。落地时只有四步：先由流体物性填层流黏度，再由目标等效黏度反算 $\alpha_\Pi$，按马赫数决定 $\beta_\Pi$，最后用 Balsara 开关把数值耗散限制在激波处。本文给出每一步的数值依据与配置模板。

### 先由流体物性填层流黏度

层流项的两个系数必须是物理量，不能调节。20 °C 水的动力黏度 $\mu=1.004\times10^{-3}\ \mathrm{Pa\cdot s}$，密度 $\rho_0=998.2\ \mathrm{kg/m^3}$，运动黏度

$$
\nu=\frac{\mu}{\rho_0}=\frac{1.004\times10^{-3}}{998.2}=1.006\times10^{-6}\ \mathrm{m^2/s}
$$

空气 20 °C 为 $\mu=1.825\times10^{-5}\ \mathrm{Pa\cdot s}$、$\rho=1.204\ \mathrm{kg/m^3}$，$\nu=1.516\times10^{-5}\ \mathrm{m^2/s}$。这两个值填错会让整个算例的雷诺数错一个量级，且症状隐蔽——流场依然"看起来像流体"。

### 由目标等效黏度反算 α

若希望数值黏度不超过物理黏度的某一比例，可用二维近似式反算：

$$
\alpha_\Pi=\frac{8\nu_{\mathrm{target}}}{c_s h}
$$

取 $c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$。若目标是让 $\nu_{\mathrm{art}}$ 不超过水的 $\nu$（即 $\nu_{\mathrm{target}}=1.006\times10^{-6}\ \mathrm{m^2/s}$），则 $\alpha_\Pi=8\times1.006\times10^{-6}/(30\times0.012)=2.24\times10^{-5}$，远低于稳定所需的 $0.01$。这解释了一个常见现象：想同时兼顾高雷诺数与稳定性，唯一出路是提高分辨率（增大 $c_s h$ 的乘积会降低 $\nu_{\mathrm{art}}$）而非把 $\alpha_\Pi$ 压到零。实践中取 $\alpha_\Pi=0.01$ 作为稳定性下限，此时 $\nu_{\mathrm{art}}=0.01\times30\times0.012/8=4.5\times10^{-4}\ \mathrm{m^2/s}$，仍比水高 $447$ 倍。

### β 的启用条件

二次项系数 $\beta_\Pi$ 只在压缩主导的强冲击中起作用。判据是当地马赫数：$Ma<0.3$ 时取 $\beta_\Pi=0$；$Ma>1$ 的冲击（如高速射流撞击、爆炸波）取 $\beta_\Pi=1.0\sim2.0$。溃坝算例 $u_{\max}=2.80\ \mathrm{m/s}$、$c_s=30\ \mathrm{m/s}$，$Ma=0.093$，二次项比线性项小约 $0.093$ 倍，启用 $\beta_\Pi$ 只会增加无谓耗散。

### Balsara 开关的参数

开关本身没有自由参数，但分母的奇异性保护项需要与分辨率匹配：

$$
f_i=\frac{\left|\nabla\cdot\mathbf{v}\right|_i}{\left|\nabla\cdot\mathbf{v}\right|_i+\left|\nabla\times\mathbf{v}\right|_i+0.0001\,c_i/h_i}
$$

保护项量级 $0.0001c/h=0.0001\times30/0.012=0.25\ \mathrm{s^{-1}}$。在纯剪切区该值使 $f_i$ 略大于零但接近 $0$，足以避免 $\alpha_i$ 突变为零导致的不连续。启用后应验证：剪切层内 $f_i<0.1$，激波面 $f_i>0.8$。

### 单因素对照设计

黏性系数不能与其他参数同时改。建议固定 $\Delta p=0.010\ \mathrm{m}$、$h=0.012\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$，只扫 $\alpha_\Pi=0.01,0.05,0.1$ 三档，每档记录涡量峰值与动能衰减率。若 $\alpha_\Pi$ 从 $0.01$ 增到 $0.1$ 使涡量峰值下降超过 $20\%$，说明数值黏性已主导，需先加密再谈物理黏性。

### 配置清单

| 设置项 | 基线取值 | 依据 |
|---|---|---|
| 动力黏度 $\mu$ | $1.004\times10^{-3}\ \mathrm{Pa\cdot s}$ | 20 °C 水物性 |
| 运动黏度 $\nu$ | $1.006\times10^{-6}\ \mathrm{m^2/s}$ | $\mu/\rho_0$ |
| 人工黏性 $\alpha_\Pi$ | $0.01$ | 稳定性下限，$\nu_{\mathrm{art}}=4.5\times10^{-4}$ |
| 二次项 $\beta_\Pi$ | $0$ | $Ma=0.093<0.3$ |
| Balsara 开关 | 启用 | 剪切区 $f_i<0.1$ |
| 正则化 $\epsilon$ | $0.01$ | 防止近距离除零 |

```
# 黏性参数片段（伪 YAML）
viscosity:
  model: laminar_plus_artificial
  mu: 1.004e-3        # Pa.s, water @20C
  rho0: 998.2         # kg/m^3
  nu: 1.006e-6        # m^2/s
artificial:
  alpha: 0.01         # -> nu_art = 4.5e-4 m^2/s
  beta: 0.0           # Ma = 0.093
  balsara: true
  eps_h2: 0.01
```

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 低雷诺数算例结果与解析解偏差大 | 层流 $\mu$ 填成了运动黏度或单位错 | 核对 $\nu=\mu/\rho_0$ 是否为 $1.006\times10^{-6}$ |
| 剪切层被抹平 | $\alpha_\Pi$ 远大于目标等效黏度 | 用 $\alpha_\Pi c_s h/8$ 算 $\nu_{\mathrm{art}}$ 与 $\nu$ 比较 |
| 剪切区也在耗散 | Balsara 未启用或 $f_i$ 恒为 $1$ | 输出剪切层 $f_i$ 分布，检查是否低于 $0.1$ |
| 提高 $\alpha_\Pi$ 后结果不变 | 该算例的耗散不由人工黏性主导 | 分解能量预算，看数值耗散占比 |
| 冲击后振荡不收敛 | $\beta_\Pi=0$ 但 $Ma>1$ | 计算当地 $Ma$，若超 $1$ 则启用 $\beta_\Pi=1.0$ |

### 参考

1. Monaghan J.J., Gingold R.A., *Shock simulation by the particle method SPH*, Journal of Computational Physics, Vol. 52, 1983.
2. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
3. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
5. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.

## 诊断与可信度验证

"结果太黏"至少有三个来源：真实物性、Monaghan 型人工黏性、分辨率不足带来的隐式耗散。三者都让动能单调下降，单看能量曲线无法区分。本文用 Taylor-Green 涡衰减率、Poiseuille 剖面与耗散预算三项基准把它们分开，并给出反算等效黏度的流程。

### 两个黏性项的离散形式

层流黏性用对称化的 Morris 形式，保证粒子间黏性力成对：

$$
\mathbf{a}_{\nu,i}=\sum_j m_j\frac{2\mu_i\mu_j}{\mu_i+\mu_j}\cdot\frac{\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}\nabla_iW_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$、$\mathbf{x}_{ij}=\mathbf{x}_i-\mathbf{x}_j$、$\epsilon=0.01$ 防止粒子接近时除零。人工黏性伴随压力项出现：

$$
\Pi_{ij}=-\alpha\frac{c_sh\,\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{\bar\rho_{ij}\left(|\mathbf{x}_{ij}|^2+\epsilon h^2\right)},\qquad \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}<0\ \text{时才激活}
$$

$\alpha$ 的工程取值是 0.01~0.1：激波主导取 0.1 附近，剪切主导取 0.01~0.02。

### 由 Taylor-Green 涡衰减率反算等效黏度

二维 Taylor-Green 涡的速度幅值按解析解衰减：

$$
u(t)=u_0\exp\left(-2\nu k^2t\right),\qquad k=\frac{2\pi}{L}
$$

取 $u_0=1.0\ \mathrm{m/s}$、$L=1.0\ \mathrm{m}$，则 $k=6.2832\ \mathrm{rad/m}$、$k^2=39.478\ \mathrm{rad^2/m^2}$。20 °C 水 $\nu=1.006\times10^{-6}\ \mathrm{m^2/s}$，$t=1.0\ \mathrm{s}$ 的衰减因子为 $\exp(-2\times1.006\times10^{-6}\times39.478)=0.99992$，幅值仅降 0.008%。人工黏性按 $\nu_{\text{art}}\approx\alpha c_sh/8$ 折算，取 $\alpha=0.05$、$c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$ 得 $\nu_{\text{art}}=2.25\times10^{-3}\ \mathrm{m^2/s}$，衰减因子变为 $\exp(-0.1777)=0.837$，幅值下降 16.3%。两者相差约 2000 倍，实测衰减率因此可唯一确定有效黏度：

$$
\nu_{\text{eff}}=-\frac{\ln\left(u(t)/u_0\right)}{2k^2t}
$$

若实测 $t=1.0\ \mathrm{s}$ 时 $u/u_0=0.96$，则 $\nu_{\text{eff}}=0.040822/78.956=5.17\times10^{-4}\ \mathrm{m^2/s}$，反算 $\alpha_{\text{eff}}=8\times5.17\times10^{-4}/(30\times0.012)=0.0115$。该值落在 0.01~0.02 区间，与设定的 0.05 不符，说明额外耗散来自邻居数不足而非黏性系数本身。

### Poiseuille 剖面：分辨率不足会伪装成黏性

压力驱动槽道流有解析抛物线剖面：

$$
u(y)=\frac{G}{2\mu}y(H-y),\qquad u_{\max}=\frac{GH^2}{8\mu}
$$

取 $H=0.010\ \mathrm{m}$、$G=1.0\ \mathrm{Pa/m}$、$\mu=1.004\times10^{-3}\ \mathrm{Pa\cdot s}$，得 $u_{\max}=1.0\times10^{-4}/(8\times1.004\times10^{-3})=1.245\times10^{-2}\ \mathrm{m/s}$，$Re=998.2\times1.245\times10^{-2}\times0.010/1.004\times10^{-3}=124$，抛物线剖面应被严格保持。叠加 $\nu_{\text{art}}=2.25\times10^{-3}\ \mathrm{m^2/s}$ 后 $Re_{\text{eff}}=1.245\times10^{-4}/2.251\times10^{-3}=0.055$，剖面被压成接近塞流；判据是中心速度与 $1.245\times10^{-2}\ \mathrm{m/s}$ 的偏差小于 3%。

### Balsara 开关读数

剪切区不需要激波级黏性，开关用散度与旋度之比给出逐粒子权重：

$$
f_i=\frac{|\nabla\cdot\mathbf{v}_i|}{|\nabla\cdot\mathbf{v}_i|+|\nabla\times\mathbf{v}_i|+10^{-4}c_s/h}
$$

人工黏性乘 $(f_i+f_j)/2$。纯剪切层中 $|\nabla\times\mathbf{v}|\gg|\nabla\cdot\mathbf{v}|$，$f\approx0.05$；正激波中散度主导，$f\approx1.00$。取 $c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$，正则项为 $10^{-4}\times30/0.012=0.25\ \mathrm{s^{-1}}$。

### 耗散能量预算

$\dot E_{\text{diss}}=\sum_im_i(\mathbf{a}_{\nu,i}+\mathbf{a}_{\Pi,i})\cdot\mathbf{v}_i$ 分别统计层流项与人工项，人工占比应与 $\nu_{\text{art}}/(\nu+\nu_{\text{art}})=2.25\times10^{-3}/(1.006\times10^{-6}+2.25\times10^{-3})=0.9996$ 一致。层流算例中 99.96% 的耗散来自人工黏性，这本身就是错误信号。

### 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 涡量峰值快速下降 | 人工黏性主导 | 由 TGV 衰减反算 $\nu_{\text{eff}}$，与 $1.006\times10^{-6}\ \mathrm{m^2/s}$ 比较 |
| 槽道剖面被压平 | 有效雷诺数从 124 掉到 0.055 | 比较中心速度与 $1.245\times10^{-2}\ \mathrm{m/s}$ |
| 近壁速度不衰减到零 | 缺无滑移切向约束 | 提取近壁 $0.5h$ 内速度剖面 |
| 反算 $\alpha_{\text{eff}}=0.0115$ 却设定 0.05 | 邻居数不足产生额外隐式耗散 | 统计平均邻居数，二维应不低于 20 |
| 剪切区耗散过大 | 未启用 Balsara 开关 | 打印 $f_i$ 分布，剪切区应为 0.05 量级 |

### 反算脚本

```python
import numpy as np

def nu_eff(u0, u_t, L, t):          # Taylor-Green 反算等效黏度
    return -np.log(u_t / u0) / (2.0 * (2.0 * np.pi / L) ** 2 * t)

def alpha_eff(nu, cs, h):           # nu_art ~ alpha*cs*h/8
    return 8.0 * nu / (cs * h)

def poiseuille(H, G, mu, rho0):     # 解析剖面与雷诺数
    u_max = G * H**2 / (8.0 * mu)
    return u_max, rho0 * u_max * H / mu

def balsara(div_v, curl_v, cs, h):
    return abs(div_v) / (abs(div_v) + abs(curl_v) + 1e-4 * cs / h)

print(nu_eff(1.0, 0.96, 1.0, 1.0))             # 5.17e-4 m^2/s
print(alpha_eff(5.17e-4, 30.0, 0.012))         # 0.0115
print(poiseuille(0.010, 1.0, 1.004e-3, 998.2)) # (0.01245, 124.0)
print(balsara(0.0, 40.0, 30.0, 0.012))         # ~0.0   纯剪切
print(balsara(40.0, 0.0, 30.0, 0.012))         # ~0.99  纯压缩
```

判读顺序：先反算 $\nu_{\text{eff}}$，若比物理黏度大两个量级以上则问题在人工黏性；再核对 $Re$ 是否从 124 掉到 0.055 量级；最后看剪切区 $f$ 是否接近 0.05。

### 参考

1. Taylor G.I., Green A.E., *Mechanism of the production of small eddies from large ones*, Proceedings of the Royal Society A, Vol. 158, 1937.
2. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
3. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
4. Español P., Revenga M., *Smoothed dissipative particle dynamics*, Physical Review E, Vol. 67, 2003.
5. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
