---
template_version: flowlab-knowledge/1.0
slug: cfd-thermal-thermal-radiation-modeling
title: 热辐射模型：原理与诊断验证
summary: >-
  用光学厚度、平均射线行程和导热—辐射参数三个量划定辐射模型的适用区间，给出 Rosseland
  等效导热系数与辐射源项形式，并完成一次圆柱炉膛的平均射线行程、光学厚度、辐射份额与灰体假设误差的估算。
category:
  slug: heat-transfer
  name: 传热与可压缩流
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 传热与可压缩流
  - 热辐射模型
  - 物理建模与适用边界
  - 光学厚度
  - 平均射线行程
  - 结果诊断与可信度验证
  - 视角系数
  - 辐射收支
seo:
  title: 热辐射模型：原理与诊断验证
  description: >-
    用光学厚度、平均射线行程和导热—辐射参数三个量划定辐射模型的适用区间，给出 Rosseland
    等效导热系数与辐射源项形式，并完成一次圆柱炉膛的平均射线行程、光学厚度、辐射份额与灰体假设误差的估算。
  keywords:
    - 热辐射模型
    - 物理建模与适用边界
    - 光学厚度
    - 平均射线行程
    - 辐射导热系数
    - 结果诊断与可信度验证
    - 视角系数
    - 辐射收支
    - 离散坐标
---
# 热辐射模型：原理与诊断验证

辐射是否要建模，取决于它相对对流和导热的份额；用哪一类模型，取决于光学厚度。辐射算例的结果很少出现明显的发散或负温度，问题往往藏在几个百分点的偏差里，靠看温度云图发现不了。可用的验收手段是三类独立证据：几何视角关系的自洽性、包腔内的辐射收支、以及角度离散的收敛行为。

## 基础概念与控制关系

### 平均射线行程与几何尺度

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

### 辐射源项与壁面热流

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

## 适用边界与方案选择

### 光学厚度决定模型层级

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

## 工程设置与实施

### 导热—辐射参数与辐射导热系数

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

## 异常诊断与失效模式

### 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 视角系数闭合误差 $3\times10^{-3}$ | 半立方体投影漏面，或遮挡面未被识别 | 逐面重算 $F_{ij}$ 并与面积积分法对照 |
| 包腔辐射收支偏差 3% | 存在透明或镜反射面未被计入，或对称面被当壁面 | 列出每个面的 $A_iq''_i$ 并逐项求和 |
| 角度分格从 $2\times8$ 到 $6\times24$ 热流变化 7% | 射线效应，方向数不足 | 按 $4\times16$ 与 $6\times24$ 的结果判断是否进入渐近区 |
| 灰体与 WSGG 结果相差 22% | 强选择吸收气体不能用单一灰体常数 | 用多灰气模型重算并比较总辐射热流 |
| 总热流几乎不变但辐射份额应为 98% | 辐射未耦合进能量方程，或只输出了对流项 | 单独提取 $q''_{rad}$ 与 $q''_{conv}$ 并核对份额 |

### 故障模式与判定试验

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

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 炉内温度剖面比实测低 200 K | 参与介质被当作透明，气相辐射被漏掉 | 计算 $\tau_L$，若大于 0.1 则开启参与介质模型 |
| 壁面净辐射热流为负值 | 发射率或环境温度定义错，符号反了 | 用 $\varepsilon\sigma(T_s^4-T_\infty^4)$ 手算符号核对 |
| 光学薄区出现负温度 | 在 $\tau_L<1$ 的区间误用 P1 | 换 DO 重算，比较温度极值 |
| 辐射源项开了但总热流不变 | 辐射未与能量方程耦合，或欠松弛过强 | 检查能量方程残差与辐射在总热流中的份额 |
| 燃烧烟气热流偏差 20% 以上 | 用单一灰体常数处理强选择吸收气体 | 换 WSGG 多灰气模型重算 |

## 验证、验收与复现

### 角度离散的收敛曲线

DO 的角度分格数直接决定辐射热流的收敛程度。对同一算例逐步加密：

解析值为 $32174\ \mathrm{W/m^2}$。$2\times8$ 时偏差 7.2%，是典型的射线效应；从 $3\times12$ 到 $4\times16$ 偏差从 1.3% 降到 0.11%，说明已经进入渐近区。工程上取 $4\times16$ 通常足够，但若壁面附近存在强遮挡或局部热点，需要按局部热流而不是平均值判断收敛。

| 角度分格（$\theta\times\varphi$） | 壁面净辐射热流 $(\mathrm{W/m^2})$ | 相对解析值偏差 |
|---|---|---|
| $2\times8$ | 34500 | 7.2% |
| $3\times12$ | 32600 | 1.3% |
| $4\times16$ | 32210 | 0.11% |
| $6\times24$ | 32180 | 0.02% |

### 视角系数的闭合与互换检查

视角系数必须同时满足互换性与闭合性：

$$
A_iF_{ij}=A_jF_{ji},\qquad \sum_{j=1}^{N}F_{ij}=1
$$

前者是几何对称性要求，后者是能量守恒要求。工程判据取

$$
\left|\sum_{j=1}^{N}F_{ij}-1\right|<10^{-3}
$$

对两块 $1\ \mathrm{m}\times1\ \mathrm{m}$ 平行相对、间距 $1\ \mathrm{m}$ 的平板，制表值 $F_{12}=0.1999$。CFD 若给出 0.1998，闭合检查得到 $F_{11}=1-0.1998=0.8002$；由对称性 $A_1F_{12}=A_2F_{21}$ 应得 $F_{21}=0.1998$，若两者相差超过 0.5% 说明半立方体投影或面积积分的方向处理有误。遮挡复杂时必须逐面检查，而不是只看总量。

### 包腔内净辐射收支必须为零

对封闭包腔，各表面净辐射功率之和应为零：

$$
\sum_i A_i q''_{rad,i}=0
$$

这是比温度场更硬的一条检验，因为它是纯能量守恒，与模型精度无关。工程容差取各表面辐射功率绝对值之和的 0.5%。若收支偏差 3%，先查是否有表面被设成了透明或镜反射而未被计入，再查对称面是否被错误地当成了壁面。

### 灰体与非灰体的对照

灰体与加权灰气模型的差距随光学厚度增大。对 $\tau_L\approx0.5$ 的烟气，两者总辐射热流相差约 9%；$\tau_L\approx2$ 时相差约 22%。诊断方法是固定几何、温度与壁面发射率，只切换辐射性质模型重算一次：若切换带来的变化小于角度离散带来的变化，说明灰体假设在当前工况下够用；若切换带来的变化大于 20%，则所有基于灰体的结论都应标注为待定。

### 壁面热流必须拆成对流与辐射两部分

壁面总热流是两项之和，验收时必须分开报告：

$$
q''_w=q''_{conv}+q''_{rad}=h\left(T_w-T_f\right)+\varepsilon\sigma\left(T_w^4-T_\infty^4\right)
$$

以 $T_w=1173\ \mathrm{K}$、$T_\infty=373\ \mathrm{K}$、$\varepsilon=0.85$、$h=15\ \mathrm{W/(m^2\cdot K)}$、$T_f=1073\ \mathrm{K}$ 为例：辐射项为 $90300\ \mathrm{W/m^2}$，对流项为 $15\times100=1500\ \mathrm{W/m^2}$，辐射占 98.4%。若报告里只给总热流，就无法判断辐射模型是否真的生效——这个工况下即使辐射算错 20%，总热流也只差 19.7%，而只看对流项则会完全掩盖问题。

### 算例：两块表面的收支核对

取一个由两个表面组成的包腔：$A_1=1.0\ \mathrm{m^2}$、$\varepsilon_1=0.9$、$T_1=900\ \mathrm{K}$；$A_2=4.0\ \mathrm{m^2}$、$\varepsilon_2=0.6$、$T_2=400\ \mathrm{K}$；表面 1 完全被表面 2 包围，故 $F_{12}=1$。

$$
q''_{rad,1}=0.9\times5.67\times10^{-8}\times\left(900^4-400^4\right)=0.9\times5.67\times10^{-8}\times6.305\times10^{11}=32174\ \mathrm{W/m^2}
$$

$$
Q_1=A_1q''_{rad,1}=1.0\times32174=32174\ \mathrm{W}
$$

由收支为零，$Q_2=-Q_1=-32174\ \mathrm{W}$，折算到 $A_2$ 上为 $q''_{rad,2}=-8044\ \mathrm{W/m^2}$。核对 $\sum A_iq''_{rad,i}=32174-32174=0$，闭合。CFD 若给出 $Q_1=33600\ \mathrm{W}$，偏差 4.4%，优先怀疑角度分格太粗或 $\varepsilon_1$ 在温度依赖下被重算。

```cpp
// constant/radiationProperties —— 角度分格与迭代控制
radiationModel  fvDOM;
fvDOMCoeffs
{
    nPhi            4;
    nTheta          16;
    tolerance       1e-6;
    maxIter         10;
    convergence     1e-4;
}
// 壁面光学性质
boundaryField
{
    hotWall
    {
        type            greyDiffusiveRadiation;
        emissivityMode  lookup;
        emissivity      0.9;
        T               uniform 900;
    }
    coldWall
    {
        type            greyDiffusiveRadiation;
        emissivityMode  lookup;
        emissivity      0.6;
        T               uniform 400;
    }
}
```

```bash
# 提取辐射热流与入射辐射
postProcess -func "wallHeatFlux" -time 2000
postProcess -func "fieldMinMax(G)" -time 2000
postProcess -func "fieldMinMax(Radiation)" -time 2000
```

```python
sigma, e1, T1, T2, A1, A2 = 5.67e-8, 0.9, 900.0, 400.0, 1.0, 4.0
q1 = e1 * sigma * (T1**4 - T2**4)      # 32174 W/m^2
Q1 = A1 * q1                           # 32174 W
q2 = -Q1 / A2                          # -8044 W/m^2
print(q1, Q1, q2, A1 * q1 + A2 * q2)
```

## 参考资料

1. Modest M.F., *Radiative Heat Transfer*, 3rd ed., Academic Press, 2013.
2. Siegel R., Howell J.R., *Thermal Radiation Heat Transfer*, 4th ed., Taylor & Francis, 2002.
3. Hottel H.C., Sarofim A.F., *Radiative Transfer*, McGraw-Hill, 1967.
4. Smith T.F., Shen Z.F., Friedman J.N., "Evaluation of coefficients for the weighted sum of gray gases model", *Journal of Heat Transfer*, 104(4), 602–608, 1982.
5. Chandrasekhar S., *Radiative Transfer*, Dover Publications, 1960.
6. Modest M.F., Haworth D.C., *Radiative Heat Transfer in Turbulent Combustion Systems*, Springer, 2016.
7. Howell J.R., Mengüç M.P., Siegel R., *Thermal Radiation Heat Transfer*, 6th ed., CRC Press, 2020.
8. Viskanta R., Mengüç M.P., "Radiation heat transfer in combustion systems", *Progress in Energy and Combustion Science*, 13(2), 97–160, 1987.
9. Lockwood F.C., Shah N.G., "A new radiation solution method for incorporation in general combustion prediction procedures", *Symposium (International) on Combustion*, 18(1), 1405–1414, 1981.
10. Sparrow E.M., Cess R.D., *Radiation Heat Transfer*, Hemisphere Publishing, 1978.
11. Edwards D.K., "Molecular gas band radiation", *Advances in Heat Transfer*, 12, 115–193, 1976.
12. Fiveland W.A., "Three-dimensional radiative heat-transfer solutions by the discrete-ordinates method", *Journal of Thermophysics and Heat Transfer*, 2(4), 309–316, 1988.
