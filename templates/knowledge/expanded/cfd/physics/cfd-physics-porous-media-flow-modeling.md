---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-porous-media-flow-modeling
title: "多孔介质流动：物理建模与适用边界"
summary: "从体积平均的成立前提出发，逐级说明 Darcy、Brinkman、Darcy-Forchheimer 与孔隙尺度模型各自保留了什么物理，给出尺度分离、孔隙稀薄化与热非平衡三类失效边界及对应量级估算。"
category:
  slug: physics
  name: "流体力学基础"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "多孔介质流动"
  - "物理建模与适用边界"
  - "体积平均"
  - "Klinkenberg 效应"
seo:
  title: "多孔介质流动：物理建模与适用边界"
  description: "从体积平均的成立前提出发，逐级说明 Darcy、Brinkman、Darcy-Forchheimer 与孔隙尺度模型各自保留了什么物理，给出尺度分离、孔隙稀薄化与热非平衡三类失效边界及对应量级估算。"
  keywords:
    - "多孔介质流动"
    - "物理建模与适用边界"
    - "体积平均"
    - "Klinkenberg 效应"
    - "Brinkman 方程"
---

# 多孔介质流动：物理建模与适用边界

多孔介质模型的合法性来自一个不等式：代表体元（REV）必须同时远大于孔隙、远小于宏观梯度尺度。这个不等式在填充床、滤芯、土壤里成立得很好，在页岩纳米孔、金属泡沫薄壁和裂隙介质里却经常崩掉。本文按"体积平均留下什么、丢掉什么"的线索梳理四类模型，并给出三条可以先用计算器算出来的失效判据。

## 1 体积平均的三个前提

对孔隙尺度流场做体积平均，把 Navier-Stokes 方程变成 Darcy 定律：

$$
\langle u_i \rangle = -\frac{K_{ij}}{\mu}\frac{\partial \langle p \rangle^{f}}{\partial x_j}
$$

$\langle \cdot \rangle$ 是体积平均，$\langle \cdot \rangle^{f}$ 是孔隙内固有平均，$K_{ij}$ 是二阶渗透率张量，量纲 $\mathrm{m^2}$。这个式子成立需要三个前提同时满足：

1. **尺度分离**：存在 REV，其尺度 $\ell_{REV}$ 满足 $d_p \ll \ell_{REV} \ll L$，$L$ 为宏观梯度尺度；
2. **黏性主导**：孔隙雷诺数足够小，惯性项相对黏性项可忽略；
3. **连续介质在孔隙内成立**：气体分子平均自由程远小于孔径。

三者中任意一条被破坏，Darcy 定律的系数就不再是常数——它开始随流速、压力或位置变化，而求解器仍会把它当作常数读入。

## 2 模型层级：每一级补回一种物理

| 层级 | 补回的物理 | 典型形式 | 升级触发条件 |
|---|---|---|---|
| Darcy | 仅黏性阻力 | $\langle u\rangle=-K/\mu\,\nabla\langle p\rangle$ | 惯性占比超过 10% |
| Darcy-Forchheimer | 惯性阻力 | 加 $\rho C_F/\sqrt{K}\,\|\mathbf{u}\|\mathbf{u}$ | 需要壁面/界面剪切 |
| Brinkman | 界面与壁面剪切、无滑移 | 加 $-\mu/\epsilon\,\nabla^2\langle u\rangle$ | 需要同时含惯性与剪切 |
| 孔隙尺度 | 全部，含局部分离与涡 | 直接解 Navier-Stokes | 需要局部应力、沉积或反应细节 |

Brinkman 项的量纲要核对：$\mu/\epsilon \cdot \nabla^2 u$ 与 $\mu/K \cdot u$ 之比是 $K/(\epsilon L_c^2)$，$L_c$ 是剪切层厚度。当 $L_c \sim \sqrt{K}$ 时两项同量级，此时忽略 Brinkman 项会在壁面附近给出错误的滑移速度——这也是"用 Darcy 算通道内填充层、结果壁面速度不为零"的根源。

## 3 失效边界一：尺度分离被破坏

要求床层高径比与横向尺寸都远大于 $d_p$。工程上常用 $L/d_p>20$ 作为下限；更严格的判据是比较横向扩散时间与停留时间：

$$
\frac{L}{u} \gg \frac{R^2}{\epsilon D_{eff}}
$$

若两侧同量级，径向不均匀性无法被平均掉，一维模型与三维结果会系统性分叉。薄壁金属泡沫（壁厚只有 2~3 个孔胞）属于典型反例，必须走孔隙尺度或至少 Brinkman 层。

## 4 失效边界二：孔隙内稀薄化

气体在低压或小孔下会在孔壁滑移，渗透率变成压力的函数。判据是孔隙 Knudsen 数：

$$
Kn_p = \frac{\lambda}{d_p},\qquad \lambda = \frac{\mu}{\rho}\sqrt{\frac{\pi}{2RT}}
$$

$R=287\,\mathrm{J/(kg\cdot K)}$ 为空气气体常数。取 $T=300\,\mathrm{K}$、$p=101325\,\mathrm{Pa}$，$\rho=1.177\,\mathrm{kg/m^3}$、$\mu=1.86\times10^{-5}\,\mathrm{Pa\cdot s}$：$\mu/\rho=1.581\times10^{-5}$，$\sqrt{\pi/(2RT)}=\sqrt{3.1416/172200}=4.271\times10^{-3}$，得 $\lambda=6.75\times10^{-8}\,\mathrm{m}$，即 67.5 nm。

若孔径 $d_p=10\,\mu\mathrm{m}$，则 $Kn_p=6.75\times10^{-3}$，已超过连续介质的 $10^{-3}$ 门槛。Klinkenberg 用下式修正：

$$
K_g = K_l\left(1+\frac{b}{\bar p}\right),\qquad b=\frac{4c\lambda\bar p}{r}
$$

取 $c\approx1$、孔半径 $r=5\,\mu\mathrm{m}$：$b=4\times6.75\times10^{-8}\times101325/5\times10^{-6}=5472\,\mathrm{Pa}$。

- 常压 $101325\,\mathrm{Pa}$：$K_g/K_l=1+5472/101325=1.054$，偏高 5.4%，多数工况可忽略；
- $10\,\mathrm{bar}=10^6\,\mathrm{Pa}$：$K_g/K_l=1.005$，修正消失；
- $0.1\,\mathrm{bar}=10132\,\mathrm{Pa}$：$K_g/K_l=1.54$，偏高 54%，必须修正。

结论是：微米级孔隙的 Klinkenberg 修正在 $p<10\,\mathrm{bar}$ 才显著，而纳米级孔隙在常压下就已经进入滑移区。这条边界与第 3 节的不等式无关，是独立的一维。

## 5 失效边界三：局部热平衡假设

Darcy 模型的能量方程默认固相与流体同温（LTE）。判据是孔隙内换热与相间换热的比值：

$$
\Lambda = \frac{h_{sf}\,a_{sf}\,L^2}{k_{eff}}
$$

$a_{sf}$ 是比表面积（球形颗粒填充 $\epsilon=0.4$ 时约 $1800\,\mathrm{m^{-1}}$，对应 $d_p=2\,\mathrm{mm}$）。当流速高、颗粒大或瞬态加热时 $\Lambda$ 变小，LTE 失效，需要双温度（LTNE）模型，多解一个固相能量方程。快速蓄热、催化反应器和微波加热都属于这一类。

## 6 量级估算：三个判据一次算完

给定 $d_p=2\,\mathrm{mm}$、$\epsilon=0.40$、$u=0.5\,\mathrm{m/s}$、空气（$\rho=1.2$、$\mu=1.8\times10^{-5}$）：

- $K=\epsilon^3 d_p^2/[150(1-\epsilon)^2]=0.064\times4\times10^{-6}/(150\times0.36)=4.74\times10^{-9}\,\mathrm{m^2}$；
- $Re_K=\rho u\sqrt{K}/\mu=1.2\times0.5\times6.885\times10^{-5}/1.8\times10^{-5}=2.30$；
- $C_F=0.1429/\epsilon^{1.5}=0.565$，惯性占比 $=C_F Re_K=1.30$。

惯性占比 130% 说明 Darcy 模型完全不可用，必须上 Darcy-Forchheimer。反过来，若把 $u$ 降到 $0.005\,\mathrm{m/s}$，$Re_K=0.023$、惯性占比 1.3%，Darcy 就够了。两个工况的物理是同一个，模型却必须换——这正是"模型选择由无量纲数而非几何决定"的含义。

```python
import math
def porous_regime(dp, eps, u, rho=1.2, mu=1.8e-5, T=300.0, p=101325.0):
    K = eps**3 * dp**2 / (150 * (1 - eps)**2)
    CF = 0.1429 / eps**1.5
    ReK = rho * u * math.sqrt(K) / mu
    lam = (mu / (p / (287 * T))) * math.sqrt(math.pi / (2 * 287 * T))
    return dict(K=K, CF=CF, ReK=ReK, inertial_share=CF * ReK, Kn_p=lam / dp)

print(porous_regime(2e-3, 0.40, 0.5))    # 惯性占比约 1.30 -> Forchheimer
print(porous_regime(2e-3, 0.40, 0.005))  # 惯性占比约 0.013 -> Darcy
print(porous_regime(1e-8, 0.30, 0.005))  # Kn_p >> 1e-3 -> 孔隙滑移/需动理学
```

## 7 假设被违反时的失败信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 同一床层用不同 $u$ 拟合出的 $K$ 不唯一 | 惯性项未纳入，Darcy 假设被 $Re_K$ 破坏 | 做 $u$ 扫描，看 $K_{fit}$ 是否随 $u$ 单调下降 |
| 渗透率随气体压力上升而下降 | 孔隙稀薄化，Klinkenberg 滑移贡献被忽略 | 在三个压力下测 $K_g$，拟合 $1/\bar p$ 直线 |
| 壁面附近速度不为零、壁面剪应力为零 | 缺少 Brinkman 项，无法施加无滑移 | 加密壁面网格并加入 Brinkman 项，看壁面速度是否趋零 |
| 瞬态升温时固流温差始终算不出来 | LTE 假设不成立 | 用 LTNE 重算，比较固相温度峰值 |
| 二维轴对称模型与三维结果分叉 | 径向扩散时间与停留时间同量级 | 计算 $R^2/(\epsilon D_{eff})$ 与 $L/u$ 的比值 |
| 薄壁泡沫压降比厚件显著偏高 | 壁厚不足一个 REV，无滑移壁效应主导 | 换孔隙尺度模型复算同一构件 |

## 参考资料

1. Bear J., *Dynamics of Fluids in Porous Media*, American Elsevier, New York, 1972.
2. Whitaker S., "The Forchheimer Equation: A Theoretical Development," *Transport in Porous Media*, 25(1), 27-61, 1996.
3. Klinkenberg L.J., "The Permeability of Porous Media to Liquids and Gases," *API Drilling and Production Practice*, 200-213, 1941.
4. Nield D.A., Bejan A., *Convection in Porous Media*, 5th ed., Springer, 2017.
5. Vafai K. (ed.), *Handbook of Porous Media*, 3rd ed., CRC Press, 2015.
