---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-fluid-structure-engineering-setup
title: "流固耦合：工程设置与参数选择"
summary: "从附加质量比估算出发，给出流固耦合的耦合强弱判据、松弛因子上界、两侧时间步匹配、preCICE 接口配置与界面映射容差的完整设置流程。"
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
  - "流固耦合"
  - "工程设置与参数选择"
  - "附加质量"
  - "preCICE"
seo:
  title: "流固耦合：工程设置与参数选择"
  description: "从附加质量比估算出发，给出流固耦合的耦合强弱判据、松弛因子上界、两侧时间步匹配、preCICE 接口配置与界面映射容差的完整设置流程。"
  keywords:
    - "流固耦合"
    - "工程设置与参数选择"
    - "附加质量"
    - "preCICE"
---

# 流固耦合：工程设置与参数选择

水中的薄钢板与空气中的桥梁翼段，几何与流速可以完全相同，耦合行为却截然不同：前者几乎必然需要隐式强耦合，后者用每步交换一次数据的显式格式即可稳定。差别来自附加质量比，而不是软件默认值。本文给出从附加质量比估算到时间步、界面映射与求解器配置的完整设置流程，面向流体与固体各用成熟求解器、在界面交换位移与牵引力的分区式 FSI。

## 先算附加质量比，再决定耦合强弱

判断显式耦合是否可行，只需要一个无量纲数。把浸没结构的附加质量与结构自身质量之比写成

$$\mu=\frac{\rho_f L}{\rho_s h}$$

其中 $\rho_f$、$\rho_s$ 为流体与固体密度，$L$ 为结构特征长度（如板宽），$h$ 为板厚。取水 $\rho_f=998\ \mathrm{kg/m^3}$、钢 $\rho_s=7850\ \mathrm{kg/m^3}$、板宽 $L=0.2\ \mathrm{m}$、厚 $h=0.002\ \mathrm{m}$，代入得 $\mu=998\times0.2/(7850\times0.002)=199.6/15.7\approx12.7$；同一块板置于空气（$\rho_f=1.2\ \mathrm{kg/m^3}$）时 $\mu\approx0.015$，两者相差约 850 倍。

$\mu\ll1$ 时显式耦合的时间滞后可接受；$\mu\gtrsim1$ 时应直接上隐式强耦合。更贴近物理的估算是不可压缩流中刚性板的附加质量，单位展长 $m_a\approx\rho_f\pi L^2/4$。对上例 $m_a\approx998\times3.1416\times0.04/4\approx31.3\ \mathrm{kg/m}$，而结构线质量 $\rho_s h L=7850\times0.002\times0.2=3.14\ \mathrm{kg/m}$，比值 $m_a/m_s\approx10.0$，与 $\mu=12.7$ 同量级，说明这个廉价判据可信，可以在建网格之前就定下耦合方式。

## 松弛因子的初值与上界

隐式耦合在同一时间步内做界面子迭代。若用常数松弛，稳定上界由附加质量比给出

$$\omega_{\max}=\frac{2}{1+m_a/m_s}$$

代入 $m_a/m_s\approx10$ 得 $\omega_{\max}\approx0.18$，意味着常数松弛因子必须压到 0.2 以下，否则界面误差会逐拍交替放大。工程上更稳妥的做法是用 Aitken 动态松弛，初值取 $\omega_0=0.3$，并限制 $\omega_k\in[0.05,1.0]$，子迭代上限取 50，收敛判据用

$$\frac{\lVert r_\Gamma^{(k)}\rVert}{\lVert d^{(k)}\rVert}\le10^{-5},\qquad r_\Gamma^{(k)}=\mathcal{G}(d^{(k)})-d^{(k)}$$

这里 $\mathcal{G}$ 表示"给定界面位移、求解两侧并回代得到新位移"的一次完整扫描。判据应与流体、固体求解器自身容差保持同一量级，过严只会白耗子迭代而不改善结果。

## 两侧时间步的匹配

固体步长必须能分辨结构最低阶模态。取薄板等效刚度 $k=1\times10^5\ \mathrm{N/m}$、线质量 $3.14\ \mathrm{kg/m}$，固有频率 $f_n=\frac{1}{2\pi}\sqrt{k/m}=\frac{1}{2\pi}\sqrt{1\times10^5/3.14}\approx28.4\ \mathrm{Hz}$，对应周期约 35 ms。按每周期 20 步，固体步长应满足 $\Delta t_s\le1.8\ \mathrm{ms}$，工程上取 $\Delta t_s=1\ \mathrm{ms}$。流体步长通常取相同值以保证交换窗口对齐；若流体因 CFL 条件需要更小步长，则用整数子循环 $n_f=\Delta t_s/\Delta t_f$，并显式声明窗口内界面量的保持阶次——零阶保持最稳但引入相位滞后，线性插值精度更高却可能在不连续载荷处过冲。

## preCICE 接口配置

以 preCICE 2.x 为例，显式与隐式的差别只在耦合方案一节。隐式 Aitken 配置如下：

```xml
<coupling-scheme:serial-implicit>
  <participants first="Fluid" second="Solid"/>
  <max-time-windows value="2000"/>
  <time-window-size value="1.0e-3"/>
  <max-iterations value="50"/>
  <exchange data="Displacement" mesh="Solid-Mesh"
            from="Solid" to="Fluid" initialize="true"/>
  <exchange data="Force" mesh="Fluid-Mesh"
            from="Fluid" to="Solid" initialize="true"/>
  <acceleration:aitken>
    <initial-relaxation value="0.3"/>
    <max-used-iterations value="50"/>
    <time-windows-reused value="10"/>
  </acceleration:aitken>
  <absolute-convergence-measure limit="1.0e-5" mesh="Solid-Mesh" data="Displacement"/>
</coupling-scheme:serial-implicit>
```

把 `serial-implicit` 换成 `serial-explicit` 并删去 `acceleration` 一节，就退化为弱耦合。`time-window-size` 即通信步长，必须与两侧求解器的 `deltaT` 完全一致，否则 preCICE 会因时间戳不匹配直接报错，而不是给出可疑结果。

## 界面网格与映射

位移属点值变量，用一致映射；牵引力属对偶变量，必须用守恒（功率共轭）映射，否则界面会漏功。映射的一致性用"再现常数场"检验，守恒性用界面合力相对误差检验，容差取 $10^{-8}\sim10^{-6}$。流体侧界面附近网格加密到 $y^+\approx1$，固体侧壳单元尺寸不宜大于流体界面单元的 2 倍，避免插值引入虚假梯度。曲面界面需逐点重建法向，防止出现切向虚假力。

## 单因素对照与参数台账

设置完成后按下表做单因素对照，每次只改一行，记录结构振幅、界面残差与子迭代次数：

| 对照项 | 基线取值 | 受控替代 | 观察量 |
|---|---|---|---|
| 松弛初值 $\omega_0$ | 0.3 | 0.1 / 0.5 | 子迭代次数、残差下降斜率 |
| 通信步长 $\Delta t$ | 1 ms | 0.5 ms / 2 ms | 振幅漂移、相位滞后 |
| 映射方式 | 守恒映射 | 点插值 | 界面合力相对误差 |
| 子迭代上限 | 50 | 20 | 是否触顶仍未收敛 |

## 失败模式与工程处置

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首个时间步即交替发散 | $m_a/m_s>1$ 却用了显式耦合 | 打印相邻步位移比值，若接近 $-m_a/m_s$ 即确认 |
| 残差先降后卡住 | Aitken 初值过小或残差含噪声 | 把 $\omega_0$ 提到 0.5，看是否恢复下降 |
| 结构振幅随时间缓慢增长 | 力映射不是位移映射的转置，界面漏功 | 计算界面功残差，应小于 $10^{-4}$ |
| 通信步长减半后相位明显前移 | 窗口内用了零阶保持 | 改线性插值，检查不连续载荷处是否过冲 |
| 加密网格后界面压力出现锯齿 | 映射未逐点重建法向 | 比较目标法向与源法向夹角，应小于 1° |

## 参考文献

1. Felippa C.A., Park K.C., Farhat C., "Partitioned analysis of coupled mechanical systems," *Computer Methods in Applied Mechanics and Engineering*, 190(24–25), 2001.
2. Causin P., Gerbeau J.F., Nobile F., "Added-mass effect in the design of partitioned algorithms for fluid–structure problems," *Computer Methods in Applied Mechanics and Engineering*, 194(42–44), 2005.
3. Küttler U., Wall W.A., "Fixed-point fluid–structure interaction solvers with dynamic relaxation," *Computational Mechanics*, 43(1), 2008.
4. Degroote J., Bathe K.J., Vierendeels J., "Performance of a new partitioned procedure versus a monolithic procedure in fluid–structure interaction," *Computers & Structures*, 87(11–12), 2009.
5. Bungartz H.-J., Schäfer M. (eds.), *Fluid–Structure Interaction: Modelling, Simulation, Optimisation*, Springer LNCSE 53, 2006.
6. Functional Mock-up Interface Specification 3.0, Modelica Association, 2022.
