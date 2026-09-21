---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-shock-capturing-modeling
title: "激波捕捉：物理建模与适用边界"
summary: "把激波捕捉当作守恒律的数值问题来处理：给出守恒变量与通量形式、MUSCL 重构与限制器函数的具体表达式、TVD 区域判据、熵修正阈值，以及 Ms=1.728 时波后状态与总压损失的手算核对，并说明网格尺度与涂抹宽度的对应关系。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "激波捕捉"
  - "物理建模与适用边界"
  - "限制器"
  - "黎曼求解器"
seo:
  title: "激波捕捉：物理建模与适用边界"
  description: "把激波捕捉当作守恒律的数值问题来处理：给出守恒变量与通量形式、MUSCL 重构与限制器函数的具体表达式、TVD 区域判据、熵修正阈值，以及 Ms=1.728 时波后状态与总压损失的手算核对，并说明网格尺度与涂抹宽度的对应关系。"
  keywords:
    - "激波捕捉"
    - "物理建模与适用边界"
    - "限制器"
    - "黎曼求解器"
    - "TVD"
---

# 激波捕捉：物理建模与适用边界

激波是守恒律的间断解，不能靠加密网格"磨"出真实厚度，只能让离散格式在守恒、有界与间断分辨率之间取得平衡。本文给出守恒形式、限制器函数与 TVD 判据的具体表达式、熵修正的阈值，以及一次波后状态的手算核对。

## 守恒律与间断解

无黏可压缩流动写成守恒形式

$$
\frac{\partial\mathbf{U}}{\partial t}+\nabla\cdot\mathbf{F}(\mathbf{U})=0,\qquad \mathbf{U}=\left[\rho,\ \rho\mathbf{u},\ \rho E\right]^{T}
$$

守恒形式的含义是：只要通量在单元面上是单值的，跨过激波的 Rankine–Hugoniot 关系就自动成立，激波位置由守恒决定而非由网格决定。任何把方程改写成非守恒形式（例如以 $p$、$u$ 为未知量）的做法都会在间断处引入错误，这是激波捕捉类格式必须坚持守恒变量的根本原因。

## 通量函数与重构

单元面上的数值通量由近似黎曼求解器给出，工程上常用 Roe、HLLC、AUSM 与中心型（Kurganov、KNP）四类。它们的差别在耗散量：Roe 对接触间断分辨率最好但需要熵修正；HLLC 更稳健，对接触间断仍有分辨能力；中心型格式不需求解黎曼问题，在强激波下更鲁棒但数值耗散偏大。

重构把单元平均值提升到面值，MUSCL 形式为

$$
u_{i+1/2}=u_i+\frac{1}{2}\psi(r_i)\left(u_{i+1}-u_i\right),\qquad r_i=\frac{u_i-u_{i-1}}{u_{i+1}-u_i}
$$

$r_i$ 是相邻梯度比。$\psi$ 取 0 时退化为迎风，取 1 时退化为二阶中心。限制器的任务是让重构在光滑区接近二阶、在间断附近回到一阶，从而不产生新极值。

## 限制器函数与 TVD 区域

三个常用限制器的显式形式是

$$
\psi_{vanLeer}(r)=\frac{r+|r|}{1+|r|},\quad \psi_{minmod}(r)=\max\!\left(0,\min(1,r)\right)
$$

$$
\psi_{superbee}(r)=\max\!\left(0,\min(2r,1),\min(r,2)\right)
$$

它们都落在 TVD 区域内，即满足

$$
0\le\psi(r)\le2,\qquad 0\le\frac{\psi(r)}{r}\le2
$$

三者的差别在于对间断的分辨能力：minmod 最耗散，激波通常跨 4～6 个单元；van Leer 居中；superbee 最锐利但容易把光滑极值压平。工程上先用 van Leer 建立基线，只有在确认光滑区极值不重要时才换 superbee。

## 熵修正与膨胀扇

Roe 类格式在声速点附近特征值趋零，会捕捉到非物理的膨胀激波。标准做法是把特征值做熵修正：

$$
|\lambda|\ \rightarrow\ \frac{\lambda^2+\delta^2}{2\delta}\quad (|\lambda|<\delta),\qquad \delta=0.1a
$$

$\delta$ 取当地声速的 10%，是 OpenFOAM 与多数商业求解器的默认量级。$\delta$ 取得过小会让膨胀扇处出现网格尺度的振荡，取得过大则在接触间断上加额外耗散。判据很简单：把 $\delta$ 从 0.05a 增到 0.2a，若激波位置移动超过一个单元宽度，说明格式对熵修正过于敏感。

## 网格尺度与涂抹宽度

激波捕捉得到的激波厚度完全是数值产物，通常为

$$
\delta_{smear}\approx N_c\Delta x
$$

二阶 TVD 格式 $N_c\approx3$，一阶迎风 $N_c\approx8\sim10$。对 1 m 长的管道、激波位于 $x=0.3\ \mathrm{m}$：单元尺度 2 mm（500 单元）时涂抹宽度约 6 mm；加密到 0.5 mm（2000 单元）时约 1.5 mm。因此看激波位置与总压损失比看激波厚度更有意义——位置误差应随网格按阶收敛，而厚度永远与 $\Delta x$ 同量级。

## 算例：Ms=1.728 的波后状态与总压损失

空气 $T_1=300\ \mathrm{K}$、$p_1=101325\ \mathrm{Pa}$、$\gamma=1.4$、$R=287\ \mathrm{J/(kg\cdot K)}$，测得激波以 $W=600\ \mathrm{m/s}$ 向右推进。先算声速与激波马赫数：

$$
a_1=\sqrt{1.4\times287\times300}=347.2\ \mathrm{m/s},\qquad M_s=\frac{600}{347.2}=1.728
$$

波后压力比与密度比：

$$
\frac{p_2}{p_1}=1+\frac{2\gamma}{\gamma+1}(M_s^2-1)=1+1.1667\times1.9867=3.318
$$

$$
\frac{\rho_2}{\rho_1}=\frac{(\gamma+1)M_s^2}{2+(\gamma-1)M_s^2}=\frac{7.168}{3.195}=2.244
$$

故 $p_2=3.318\times101325=336180\ \mathrm{Pa}$，$T_2=T_1\,(p_2/p_1)/(\rho_2/\rho_1)=300\times3.318/2.244=443.6\ \mathrm{K}$。

总压损失：

$$
\frac{p_{0,2}}{p_{0,1}}=\left[\frac{(\gamma+1)M_s^2}{2+(\gamma-1)M_s^2}\right]^{\frac{\gamma}{\gamma-1}}\left[\frac{\gamma+1}{2\gamma M_s^2-(\gamma-1)}\right]^{\frac{1}{\gamma-1}}=2.244^{3.5}\times0.3014^{2.5}=0.8427
$$

即跨这道激波损失 15.7% 总压。这个数就是检验格式耗散是否合理的标尺：数值结果偏离 0.843 超过 3% 时，问题在网格或限制器，而不在物性。

```cpp
// system/fvSchemes —— rhoCentralFoam 类求解器的激波捕捉设置
fluxScheme      Kurganov;

divSchemes
{
    default         none;
    div(tauMC)      Gauss linear;
    div(phi,U)      Gauss limitedLinearV 1;
    div(phi,e)      Gauss limitedLinear 1;
    div(phi,K)      Gauss limitedLinear 1;
    div(phiv,p)     Gauss limitedLinear 1;
}
```

```bash
# 定常与瞬态激波算例
rhoCentralFoam
# 或使用 shockFluid（KNP 通量，可处理强激波与低马赫预处理）
shockFluid
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 波后压力高出解析值 12% | 限制器失效，格式在间断处产生过冲 | 换 van Leer 限制器重算，比较波后压力峰值 |
| 膨胀扇处出现网格尺度振荡 | 熵修正阈值过小，特征值穿零 | 把 $\delta$ 从 0.05a 增到 0.1a 再看振荡是否消失 |
| 激波位置随网格细化持续右移 | 格式非守恒，或通量面法向定义不一致 | 检查通量是否由守恒变量构造，比较不同网格的波位置 |
| 接触间断被抹成 20 个单元宽 | 用了 HLL 型通量，接触波耗散过大 | 换 HLLC 或 Roe，观察接触间断宽度是否收敛到 3～5 单元 |
| 强激波算例出现负密度 | 重构未做保正限制 | 开启保正限制或降低 CFL 至 0.2 以下 |

## 参考文献

1. Godunov S.K., "A difference method for numerical calculation of discontinuous solutions of the equations of hydrodynamics", *Matematicheskii Sbornik*, 47(3), 271–306, 1959.
2. Roe P.L., "Approximate Riemann solvers, parameter vectors, and difference schemes", *Journal of Computational Physics*, 43(2), 357–372, 1981.
3. Harten A., "High resolution schemes for hyperbolic conservation laws", *Journal of Computational Physics*, 49(3), 357–393, 1983.
4. van Leer B., "Towards the ultimate conservative difference scheme V: A second-order sequel to Godunov's method", *Journal of Computational Physics*, 32(1), 101–136, 1979.
5. Kurganov A., Tadmor E., "New high-resolution central schemes for nonlinear conservation laws and convection-diffusion equations", *Journal of Computational Physics*, 160(1), 241–282, 2000.
6. Greenshields C.J., Weller H.G., Gasparini L., Reese J.M., "Implementation of semi-discrete, non-staggered central schemes in a colocated, polyhedral, finite volume framework, for high-speed viscous flows", *International Journal for Numerical Methods in Fluids*, 63(1), 1–21, 2010.
