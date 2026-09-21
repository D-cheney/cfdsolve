---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-thermal-radiation-modeling
title: "热辐射模型：物理建模与适用边界"
summary: "用光学厚度、平均射线行程和导热—辐射参数三个量划定辐射模型的适用区间，给出 Rosseland 等效导热系数与辐射源项形式，并完成一次圆柱炉膛的平均射线行程、光学厚度、辐射份额与灰体假设误差的估算。"
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
  - "热辐射模型"
  - "物理建模与适用边界"
  - "光学厚度"
  - "平均射线行程"
seo:
  title: "热辐射模型：物理建模与适用边界"
  description: "用光学厚度、平均射线行程和导热—辐射参数三个量划定辐射模型的适用区间，给出 Rosseland 等效导热系数与辐射源项形式，并完成一次圆柱炉膛的平均射线行程、光学厚度、辐射份额与灰体假设误差的估算。"
  keywords:
    - "热辐射模型"
    - "物理建模与适用边界"
    - "光学厚度"
    - "平均射线行程"
    - "辐射导热系数"
---

# 热辐射模型：物理建模与适用边界

辐射是否要建模，取决于它相对对流和导热的份额；用哪一类模型，取决于光学厚度。本文给出三个可直接算出的判据量——平均射线行程、光学厚度、导热—辐射参数——并完成一次圆柱炉膛的完整估算，最后说明灰体假设在什么条件下失效。

## 光学厚度决定模型层级

参与性介质的辐射强度沿程按 Beer 定律衰减，衰减程度由光学厚度度量：

$$
\tau_L=(\kappa_a+\sigma_s)L_m
$$

$\kappa_a$ 是吸收系数、$\sigma_s$ 是散射系数，单位均为 $\mathrm{1/m}$；$L_m$ 是平均射线行程。工程上的分界是：

- $\tau_L<0.1$：介质近似透明，用表面对表面（S2S）或离散坐标（DO）即可，无需考虑介质内的重吸收；
- $0.1<\tau_L<1$：光学薄到中等，方向性强，必须用 DO；
- $1<\tau_L<10$：P1 近似可用，误差通常在 10% 以内；
- $\tau_L>10$：光学厚，Rosseland 扩散近似成立，辐射可并入导热。

把 $\tau_L$ 算错一级，模型选型就错一级，其代价远大于角度分格或网格加密带来的差异。

## 平均射线行程与几何尺度

平均射线行程把三维几何压缩成一个等效光程：

$$
L_m=\frac{3.6V}{A}
$$

$V$ 为介质体积、$A$ 为包围该体积的表面积。对直径 $2\ \mathrm{m}$、长 $4\ \mathrm{m}$ 的圆柱炉膛：

$$
V=\pi\times1^2\times4=12.566\ \mathrm{m^3},\qquad A=2\pi\times1\times4+2\pi\times1^2=31.416\ \mathrm{m^2}
$$

$$
L_m=\frac{3.6\times12.566}{31.416}=1.440\ \mathrm{m}
$$

若烟气在 1200 K 下的等效吸收系数 $\kappa_a=0.5\ \mathrm{m^{-1}}$（散射可忽略），则 $\tau_L=0.5\times1.44=0.72$，落在光学薄到中等区间，应选 DO 而不是 P1。若把 $\kappa_a$ 误取成 $5\ \mathrm{m^{-1}}$，$\tau_L=7.2$ 就会把人引向 P1，方向性被抹平，热点位置偏移。

## 导热—辐射参数与辐射导热系数

辐射相对导热的强弱由导热—辐射参数给出：

$$
N=\frac{k(\kappa_a+\sigma_s)}{4\sigma T^3},\qquad \sigma=5.67\times10^{-8}\ \mathrm{W/(m^2\cdot K^4)}
$$

$N\ll1$ 表示辐射主导，$N\gg1$ 表示导热主导。取烟气 $k=0.05\ \mathrm{W/(m\cdot K)}$、$\kappa_a=0.5\ \mathrm{m^{-1}}$、$T=1200\ \mathrm{K}$：

$$
N=\frac{0.05\times0.5}{4\times5.67\times10^{-8}\times1200^3}=\frac{0.025}{391.9}=6.4\times10^{-5}
$$

$N$ 比 1 小四个量级，辐射彻底主导。光学厚时还可把辐射写成等效导热：

$$
k_{rad}=\frac{16\sigma T^3}{3(\kappa_a+\sigma_s)}=\frac{16\times5.67\times10^{-8}\times1.728\times10^9}{3\times0.5}=1045\ \mathrm{W/(m\cdot K)}
$$

$k_{rad}$ 是分子导热系数的约 20900 倍，把两者相加会得到严重高估的有效导热系数——这正是 Rosseland 近似只在介质深处成立、靠近壁面必须修正的原因。

## 辐射源项与壁面热流

介质吸收的净辐射进入能量方程，源项为

$$
\Phi_{rad}=\kappa_a\left(4\sigma T^4-G\right)
$$

$G$ 为入射辐射。壁面上的净辐射热流用发射率与温度四次方表达：

$$
q''_{rad}=\varepsilon\sigma\left(T_s^4-T_\infty^4\right)
$$

取壁温 $T_s=1173\ \mathrm{K}$（900 °C）、环境 $T_\infty=373\ \mathrm{K}$（100 °C）、$\varepsilon=0.85$：

$$
q''_{rad}=0.85\times5.67\times10^{-8}\times\left(1.893\times10^{12}-1.936\times10^{10}\right)=90300\ \mathrm{W/m^2}
$$

若同一处对流换热系数 $h=15\ \mathrm{W/(m^2\cdot K)}$、温差 $800\ \mathrm{K}$，对流传热为 $12000\ \mathrm{W/m^2}$，辐射是对流的 7.5 倍。此时关闭辐射相当于丢掉 88% 的热流。

## 灰体假设的失效条件

灰体把光谱吸收系数按一个等效值处理。对强选择吸收的烟气（$\mathrm{CO_2}$、$\mathrm{H_2O}$），灰体与加权灰气模型（WSGG）的差距随光学厚度增大：$\tau_L\approx0.5$ 时总辐射热流偏差约 9%，$\tau_L\approx2$ 时偏差可达 22%，$\tau_L>5$ 时偏差继续增大但增幅趋缓。因此 $\tau_L>1$ 的燃烧系统应使用多灰气或波段模型，而不是单一灰体常数。

```cpp
// constant/radiationProperties —— 参与性介质的 DO 设置
radiation       on;
radiationModel  fvDOM;

fvDOMCoeffs
{
    nPhi        4;          // 方位角分格
    nTheta      16;         // 极角分格
    tolerance   1e-6;
    maxIter     10;
    convergence 1e-4;
}

absorptionEmissionModel  constantAbsorptionEmission;
constantAbsorptionEmissionCoeffs
{
    absorptivity    absorptivity;
    emissivity      emissivity;
    E               E;
}
```

## 失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 炉内温度剖面比实测低 200 K | 参与介质被当作透明，气相辐射被漏掉 | 计算 $\tau_L$，若大于 0.1 则开启参与介质模型 |
| 壁面净辐射热流为负值 | 发射率或环境温度定义错，符号反了 | 用 $\varepsilon\sigma(T_s^4-T_\infty^4)$ 手算符号核对 |
| 光学薄区出现负温度 | 在 $\tau_L<1$ 的区间误用 P1 | 换 DO 重算，比较温度极值 |
| 辐射源项开了但总热流不变 | 辐射未与能量方程耦合，或欠松弛过强 | 检查能量方程残差与辐射在总热流中的份额 |
| 燃烧烟气热流偏差 20% 以上 | 用单一灰体常数处理强选择吸收气体 | 换 WSGG 多灰气模型重算 |

## 参考文献

1. Modest M.F., *Radiative Heat Transfer*, 3rd ed., Academic Press, 2013.
2. Siegel R., Howell J.R., *Thermal Radiation Heat Transfer*, 4th ed., Taylor & Francis, 2002.
3. Hottel H.C., Sarofim A.F., *Radiative Transfer*, McGraw-Hill, 1967.
4. Smith T.F., Shen Z.F., Friedman J.N., "Evaluation of coefficients for the weighted sum of gray gases model", *Journal of Heat Transfer*, 104(4), 602–608, 1982.
5. Chandrasekhar S., *Radiative Transfer*, Dover Publications, 1960.
6. Modest M.F., Haworth D.C., *Radiative Heat Transfer in Turbulent Combustion Systems*, Springer, 2016.
