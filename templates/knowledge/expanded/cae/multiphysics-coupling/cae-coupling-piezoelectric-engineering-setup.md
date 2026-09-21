---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-piezoelectric-engineering-setup
title: "压电耦合：工程设置与参数选择"
summary: "给出压电耦合分析的落地配置：材料常数 d/e 形式换算、极化坐标系与电极等电位约束、按波长反算网格、扫频与 Rayleigh 阻尼取值，附 ANSYS APDL 关键卡片。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "压电耦合"
  - "工程设置与参数选择"
  - "极化坐标系"
  - "Rayleigh 阻尼"
seo:
  title: "压电耦合：工程设置与参数选择"
  description: "给出压电耦合分析的落地配置：材料常数 d/e 形式换算、极化坐标系与电极等电位约束、按波长反算网格、扫频与 Rayleigh 阻尼取值，附 ANSYS APDL 关键卡片。"
  keywords:
    - "压电耦合"
    - "工程设置与参数选择"
    - "极化坐标系"
    - "Rayleigh 阻尼"
    - "等电位约束"
---

# 压电耦合：工程设置与参数选择

压电耦合分析的设置清单比普通结构分析多三项：材料常数以哪种形式输入、极化方向如何随几何传递、电极用等电位约束还是逐个节点约束。这三项任一设错，谐振频率和输出电荷都会偏，而且偏得"像物理"。本文给出材料常数换算、网格波长约束、电极边界与扫频阻尼的具体取值，工具层面以 ANSYS APDL 的压电耦合单元为例。

## 材料常数的形式选择与换算

压电材料卡有 d-形式（应变-电荷）与 e-形式（应变-电位移）两类。d-形式读起来直观，$d_{33}=+593\ \text{pC/N}$、$d_{31}=-274\ \text{pC/N}$；e-形式是求解器的自然变量，两者由弹性常数桥接：

$$e_{ij}=d_{ik}c_{kj}^{E}$$

以 PZT-5H 为例，$e_{31}\approx-6.62\ \text{C/m}^2$、$e_{33}\approx+23.2\ \text{C/m}^2$。**换算后必须检查符号的相对关系**：$d_{31}$ 为负、$d_{33}$ 为正，因此 $e_{31}$ 为负、$e_{33}$ 为正；若只核对了一个分量的绝对值，符号错误会漏检。另一项常被忽略的是介电常数：恒应力 $\varepsilon_{33}^{T}$ 与恒应变 $\varepsilon_{33}^{S}$ 相差 $(1-k_{33}^{2})$ 倍，$k_{33}=0.751$ 时两者相差 56%，用错会让自由电容从 3.01 nF 变成 4.7 nF。

## 极化坐标系与电极边界的设置

极化方向必须绑定在材料坐标系上，而不是全局坐标系。装配体里每个压电片的极化方向可能不同，要在各自的局部坐标系下定义材料方向，并确认几何旋转后方向随动。判定方法：给单片施加 10 N 轴向力，读取电荷应为 $5.93\ \text{nC}$；若装配后整堆输出接近零，说明各片极化方向未按设计反接。

电极边界有两种：接地电极用 $V=0$ 的 Dirichlet 条件；悬空电极必须用等电位约束（把该电极所有节点的电势耦合为一个自由度），否则求解器会给出电极面上非物理的电势分布，自由电容随之偏大。开路面还要再叠一条总电荷为零的约束，否则等电位约束下电荷会通过接地路径泄漏。

## 网格：波长与电极厚度的约束

网格尺寸由最高关注频率对应的波长决定。声速 $c=\sqrt{1/(\rho s_{33}^{E})}$，PZT-5H 取 $\rho=7500\ \text{kg/m}^3$、$s_{33}^{E}=2.07\times10^{-11}\ \text{m}^2/\text{N}$，得 $c=2538\ \text{m/s}$。在 $f=126.9\ \text{kHz}$ 时

$$\lambda=\frac{c}{f}=\frac{2538}{1.269\times10^{5}}=2.0\times10^{-2}\ \text{m}$$

即 20 mm。要求每个波长至少 6 个单元：

$$\Delta x\le\frac{\lambda_{\min}}{6}=\frac{20}{6}=3.3\ \text{mm}$$

若扫频上限取 500 kHz（$\lambda=5.1\ \text{mm}$），则 $\Delta x\le0.85\ \text{mm}$，单元数增加约 $(3.3/0.85)^{3}=58$ 倍——所以扫频上限必须在建模前定死，不能事后追加。

厚度方向还有一条独立约束：压电片厚度 $t=1.0\ \text{mm}$ 时，厚度方向至少 2 层单元才能捕捉厚度模态（$f\approx c/(2t)=1.27\ \text{MHz}$）；只关心低频驱动时可 1 层，但要显式说明忽略了厚度模态。

## 载荷步、扫频与阻尼参数

谐响应扫频用模态叠加或完全法。完全法在谐振峰附近步长要细：品质因数 $Q\approx1/(2\zeta)$，取 $\zeta=0.02$ 时 $Q=25$，半功率带宽约 $f_r/Q=126.9/25=5.1\ \text{kHz}$，故扫频步长不超过 0.5 kHz 才能在峰值附近取到足够点。

阻尼用 Rayleigh 形式 $[C]=\alpha[M]+\beta[K]$，由两个频率点的目标阻尼比反解：

$$\alpha=\frac{2\zeta\omega_{1}\omega_{2}}{\omega_{1}+\omega_{2}},\qquad \beta=\frac{2\zeta}{\omega_{1}+\omega_{2}}$$

取 $\zeta=0.02$、$f_1=50\ \text{kHz}$（$\omega_1=3.142\times10^{5}\ \text{rad/s}$）、$f_2=200\ \text{kHz}$（$\omega_2=1.257\times10^{6}\ \text{rad/s}$），则 $\alpha=2\times0.02\times3.142\times10^{5}\times1.257\times10^{6}/(1.571\times10^{6})=1.01\times10^{4}\ \text{rad/s}$，$\beta=0.04/1.571\times10^{6}=2.55\times10^{-8}\ \text{s}$。回代校验：$\zeta_1=\alpha/(2\omega_1)+\beta\omega_1/2=0.016+0.004=0.020$，与设定一致。

```text
! ANSYS APDL 压电耦合谐响应关键设置
/PREP7
MP,DENS,1,7500                 ! kg/m^3
TB,ANEL,1,,,1                  ! 弹性常数（需与 s^E 换算）
TBDATA,1, 1.27e10, 8.02e9, 8.02e9, 1.27e10, 8.02e9, 1.27e10
TB,PIEZ,1,,,1                  ! e-形式压电常数
TBDATA,1, 0, 0, -6.62, 0, 0, -6.62, 0, 0, 23.2
TB,DPER,1,,,1                  ! 恒应力介电常数
TBDATA,1, 1.53e-8, 1.53e-8, 1.30e-8

ET,1,SOLID226,100              ! 100 = 压电耦合场
ESIZE,0.0008                   ! m, <= lambda_min/6
CP,1,VOLT,ALL                  ! 悬空电极：等电位耦合
D,node_ground,VOLT,0           ! 接地电极
! 局部坐标系定义极化方向，并随几何旋转
LOCAL,11,0,0,0,0, 0,0,90
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由电容偏大 50% | 用了 $\varepsilon^{S}$ 而非 $\varepsilon^{T}$ | 按 $C=\varepsilon A/t$ 手算 3.01 nF 对照 |
| 位移方向反 | 材料方向未随几何旋转 | 打印各片极化矢量并核对装配方向 |
| 谐振峰位置随网格移动 | 每波长单元数不足 | 按 $\Delta x\le\lambda_{\min}/6$ 重划并复算 |
| 电极面电势分布不均 | 未用等电位耦合约束 | 检查电极节点电势极差，应小于 $10^{-6}$ V |
| 扫频峰值被削平 | 步长太粗或阻尼过大 | 用 $Q=1/(2\zeta)=25$ 估带宽 5.1 kHz |
| 整堆输出接近零 | 各片极化方向未交替反接 | 逐片读电荷符号 |
| 高频段结果发散 | 扫频上限未预先定网格 | 按 500 kHz 的 $\lambda=5.1$ mm 反算网格 |

## 参考文献

1. IEEE Std 176-1987, *IEEE Standard on Piezoelectricity*, IEEE, 1987.
2. Jaffe B., Cook W.R., Jaffe H., *Piezoelectric Ceramics*, Academic Press, 1971.
3. APC International, *Piezoelectric Ceramics: Principles and Applications*, 2nd ed., 2011.
4. Ansys Inc., *Mechanical APDL Coupled-Field Analysis Guide*, 2023.
5. Yang J., *An Introduction to the Theory of Piezoelectricity*, Springer, 2005.
6. Crawley E.F., de Luis J., "Use of piezoelectric actuators as elements of intelligent structures," *AIAA Journal*, 25(10), 1987.
