---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-structured-hexa-engineering-setup
title: 结构六面体网格：工程设置与诊断验证
summary: >-
  把块拓扑、非正交角、长宽比与膨胀率三个可控量写成可核对的取值规则，再用 20 mm 通道算例把首层厚度、线性节点分布与 y+ 一次算清，并给出
  blockMeshDict 的可复算写法。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 结构六面体网格
  - 工程设置与参数选择
  - O 型网格
  - 膨胀率
  - 结果诊断与可信度验证
  - GCI
  - Richardson 外推
seo:
  title: 结构六面体网格：工程设置与诊断验证
  description: >-
    把块拓扑、非正交角、长宽比与膨胀率三个可控量写成可核对的取值规则，再用 20 mm 通道算例把首层厚度、线性节点分布与 y+ 一次算清，并给出
    blockMeshDict 的可复算写法。
  keywords:
    - 结构六面体网格
    - 工程设置与参数选择
    - blockMesh 节点分布
    - 非正交角
    - 长宽比
    - 结果诊断与可信度验证
    - GCI
    - Richardson 外推
    - 观测阶
---
# 结构六面体网格：工程设置与诊断验证

结构六面体网格的质量上限在画第一条块边时就确定了，节点分布只是在这个上限之内做分配。本文给出非正交角、长宽比、膨胀率三个可控量的量化口径与取值区间，再用一个 20 mm 高通道算例把首层厚度、节点分布与 y+ 一次算清，最后给出可以直接改用的 blockMeshDict 片段。结构六面体网格的结果诊断要回答两个不同的问题：误差里有多少是网格造成的，以及局部质量异常有没有污染目标量。前者用三套网格的 GCI 量化，后者用局部场量与积分量的同步监控分离。

## 三套网格的构造与比值控制

GCI 的前提是网格族相似：三套网格只改变单元尺寸，块拓扑、边界层分配方式、离散格式与收敛准则必须完全一致。尺寸比 $r$ 建议取 1.3～2.0，太大则外推阶不可靠，太小则两套解之差被迭代误差淹没。

以某二维通道为例，取 $r = 2$，三套网格单元数为 $0.125\times10^{6}$、$1.0\times10^{6}$、$8.0\times10^{6}$，对应平均单元尺寸 4 mm、2 mm、1 mm。压降目标量分别为 $\phi_3 = 3.42\ \mathrm{kPa}$、$\phi_2 = 3.55\ \mathrm{kPa}$、$\phi_1 = 3.61\ \mathrm{kPa}$（下标 1 为最细）。

## 参数台账与复算要求

交付时至少留下：块拓扑图与块边界坐标、首层厚度及其 $u_\tau$ 来源、$r$ 与 $N$、流向单元尺寸、`simpleGrading` 三元组、`checkMesh` 的最大非正交角与最大长宽比、以及目标量在流向加密一倍后的变化量。若首层厚度只写了数值而没写对应的 $u_\tau$ 与 $y^+$，这份台账在换流体或换流速后无法复用。

## 复算脚本

```python
import math
phi1, phi2, phi3, r, Fs = 3.61, 3.55, 3.42, 2.0, 1.25
e21 = (phi2 - phi1) / phi1
e32 = (phi3 - phi2) / phi2
p = abs(math.log(abs(e32 / e21))) / math.log(r)
gci = Fs * abs(e21) / (r**p - 1)
phi_ext = phi1 + (phi1 - phi2) / (r**p - 1)
print(f"p={p:.2f}  GCI={gci*100:.2f}%  phi_ext={phi_ext:.3f} kPa")
```

## 三个质量量的量化口径

非正交角定义为面法向 $\mathbf{n}_f$ 与相邻单元中心连线 $\mathbf{d}$ 的夹角：

$$
\theta_{non} = \arccos\left(\frac{\mathbf{n}_f \cdot \mathbf{d}}{|\mathbf{n}_f|\,|\mathbf{d}|}\right)
$$

OpenFOAM 的 `checkMesh` 以 `Max non-orthogonality` 报告该量（内部按 180° 减该角度输出），Fluent 报告的 `Maximum Ortho Skew` 是同类指标。工程上限取 65°～70°，超过后扩散项的非正交修正会引入振荡。

膨胀率与长宽比定义为

$$
r = \frac{\Delta x_{i+1}}{\Delta x_i}, \qquad AR = \frac{\Delta x_{stream}}{\Delta t_1}
$$

其中 $\Delta t_1$ 是壁面法向首层厚度。$r$ 取 1.1～1.2 最稳，超过 1.3 会让过渡单元畸变；贴体层允许 $AR$ 到 100 以上，核心区建议控制在 20 以内。

## 首层厚度与节点分布的手算

几何增长序列前 $N$ 层的总厚度是等比求和：

$$
L_N = \Delta t_1 \frac{r^{N}-1}{r-1}
$$

取 $\Delta t_1 = 0.05\ \mathrm{mm}$、$r = 1.15$、$N = 20$，则

$$
L_{20} = 0.05 \times \frac{1.15^{20}-1}{0.15} = 0.05 \times 102.4 = 5.12\ \mathrm{mm}
$$

反过来，blockMesh 的单值 `simpleGrading` 是**线性**分布（末层与首层尺寸比等于给定值），不是几何分布。半高 10 mm、20 个单元、比例取 4 时，首层由

$$
N \Delta t_1 \frac{1+s}{2} = 20 \times \Delta t_1 \times \frac{5}{2} = 10\ \mathrm{mm}
$$

解得 $\Delta t_1 = 0.2\ \mathrm{mm}$，末层 $0.8\ \mathrm{mm}$。流向取 2 mm 单元，则 $AR = 2/0.2 = 10$。

这 0.2 mm 的首层是否合格，要用壁面摩擦速度换算。该通道中心速度 $12\ \mathrm{m/s}$、空气 $\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$，估算 $u_\tau = 0.55\ \mathrm{m/s}$，则

$$
y^+ = \frac{u_\tau \Delta t_1}{\nu} = \frac{0.55 \times 2\times10^{-4}}{1.5\times10^{-5}} = 7.3
$$

7.3 落在缓冲层，壁函数与低雷诺解析都不成立。要落到壁函数可用的 $y^+ = 30$，首层需放宽到 $30 \times 1.5\times10^{-5}/0.55 = 0.82\ \mathrm{mm}$；要真正解析黏性底层，需缩到 $1 \times 1.5\times10^{-5}/0.55 = 0.027\ \mathrm{mm}$。两者相差 30 倍，必须在建块之前定下来。

## blockMeshDict 的两块对称写法

把通道沿中线切成两块，各自从壁面向中心线性放粗，就能得到上下对称的分布：

```text
blocks
(
    hex (0 1 2 3 4 5 6 7)   (500 20 1) simpleGrading (1 4    1)
    hex (4 5 6 7 8 9 10 11) (500 20 1) simpleGrading (1 0.25 1)
);
edges ();

defaultPatch { name walls; type wall; }
```

下块从壁面（首层）到中线（末层）比例为 4，上块方向相反故取 0.25，两块在中线处尺寸连续。生成后用 `checkMesh -allGeometry -allTopology` 核对 `Max non-orthogonality` 与 `Max aspect ratio`，再确认 `Mesh OK`。

## 故障模式与判定试验

细网格上仍有若干单元非正交角超过 70° 时，要看这些单元是否落在高梯度区。分离方法是把目标量拆成体积分与面积分两类，各自检查：

- 体积分（如总压降）对局部误差不敏感，若它随加密单调收敛，角部异常影响有限。
- 面积分（如壁面总阻力）直接由壁面单元决定，角部异常会带来系统偏差。

算例中壁面阻力在三套网格上为 12.85 N、12.63 N、12.55 N，单调收敛但收敛率只有 0.6；把角部三处圆角块的偏斜从 74° 修到 45° 后，同样三套网格给出 12.71 N、12.62 N、12.58 N，观测阶升到 1.6。这一步证明偏差来自质量而非分辨率。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前缘出现周期性压力尖峰 | H 型拓扑在钝前缘偏斜超 60° | 把前缘块换成 O 型，比较同一位置的偏斜角与压力脉动幅值 |
| 加密流向网格后阻力不变 | 误差由壁面法向分辨率主导 | 只加密法向首层，观察阻力变化是否超过 1% |
| 首层 y+ 云图整片落在 5～30 | 首层厚度按几何尺度过小、未做摩擦速度换算 | 用求解器输出的 `wallShearStress` 反算 $u_\tau$，重算 $\Delta t_1$ |
| 通道中心出现速度过冲 | 两侧块在中线不连续或末层过粗 | 沿中线取节点坐标，检查相邻单元尺寸比是否 ≤ 1.3 |
| `checkMesh` 报高非正交但场量光滑 | 远场块角部扭曲，梯度很小 | 在远场做单块正交化，确认目标量变化 < 0.1% |
| 三套网格目标量单调但观测阶只有 1.1 | 局部高偏斜单元贡献非光滑误差 | 只修角部块质量、不加密，重算观测阶是否回升到 1.6 以上 |
| 粗网格与细网格之差小于迭代残差 | 收敛准则过松，差值被代数误差淹没 | 把残差阈收紧一个量级，确认两套解差值稳定后再算 GCI |
| 壁面阻力不收敛而压降收敛 | 面积分由壁面单元质量主导 | 单独统计壁面单元的最大非正交角与长宽比 |
| 加密后结果反而偏离外推值 | 块边界位置随网格改变，几何不再相似 | 固定块边界坐标，只改变单元数 |
| 三套网格 GCI 差异巨大 | 某套网格未收敛到同一流态 | 比较三套的壁面 $y^+$ 分布与流量，确认物理状态一致 |

## Richardson 外推与观测阶的手算

相对变化与观测阶为

$$
\varepsilon_{21} = \frac{\phi_2-\phi_1}{\phi_1}, \qquad p = \frac{1}{\ln r}\left|\ln\left|\frac{\varepsilon_{32}}{\varepsilon_{21}}\right|\right|
$$

代入数值：$\varepsilon_{21} = (3.55-3.61)/3.61 = -0.01662$，$\varepsilon_{32} = (3.42-3.55)/3.55 = -0.03662$，比值 $2.203$，于是

$$
p = \frac{\ln 2.203}{\ln 2} = \frac{0.7899}{0.6931} = 1.14
$$

二阶格式配贴体六面体通常给出 $p \approx 1.8\sim2.2$；这里只有 1.14，说明误差里有相当一部分不是光滑的截断误差，而是角部高偏斜单元贡献的局部误差。继续加密之前应先修角部质量。

网格收敛指数与 Richardson 外推值：

$$
GCI_{fine} = \frac{F_s |\varepsilon_{21}|}{r^{p}-1}, \qquad \phi_{ext} = \phi_1 + \frac{\phi_1-\phi_2}{r^{p}-1}
$$

取安全因子 $F_s = 1.25$（三套网格时用 1.25，只有两套时用 3.0）：

$$
GCI_{fine} = \frac{1.25 \times 0.01662}{2.203-1} = 0.0173 = 1.73\%
$$

$$
\phi_{ext} = 3.61 + \frac{3.61-3.55}{1.203} = 3.61 + 0.050 = 3.66\ \mathrm{kPa}
$$

结论应写成「压降 $3.61\ \mathrm{kPa}$，离散不确定度 1.73%，外推极限 3.66 kPa」，而不是只报一个数。

## 块拓扑决定了误差的方向性

贴体六面体网格的离散误差有明显的方向性：法向与流向正交时，对流项与扩散项的截断误差各自沿一个网格方向分布，误差可以逐方向诊断；拓扑一旦扭曲，误差就在两个方向之间耦合，任何单方向的加密都收不到效果。

翼型、圆柱这类曲面物面用 O 型拓扑，把物面用一圈四边形包住，前缘处的偏斜可以压到 20° 以内；带尾迹的翼型用 C 型，把尾迹包进块内；H 型只适合远场或规则直通道，它在钝前缘会产生超过 60° 的偏斜。判据很简单：块边界的走向应与主要梯度方向平行，且不得穿过高梯度区。

## 报告与验收

可信的结论需要同时给出：三套网格的单元数与平均尺寸、目标量、$\varepsilon$ 与观测阶、$GCI$、外推极限、以及外推极限与最细网格之差是否小于 $GCI$。若外推极限落在最细网格与次细网格之间，说明序列合理；若落在两者之外，序列不单调，必须先查质量或收敛问题。局部质量异常必须记录修复前后的对比，否则后续使用者无法判断当前观测阶是网格分辨率的真实反映还是质量缺陷的残留。

## 参考资料

1. Thompson J.F., Warsi Z.U.A., Mastin C.W., *Numerical Grid Generation: Foundations and Applications*, North-Holland, 1985.
2. Knupp P., Steinberg S., *Fundamentals of Grid Generation*, CRC Press, 1993.
3. Baker T.J., "Mesh Generation: Art or Science?", *Progress in Aerospace Sciences*, 41(1): 29-63, 2005.
4. Soni B.K., "Grid Generation for Internal Flow Configurations", *Computers & Mathematics with Applications*, 24(5-6): 191-201, 1992.
5. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies", *Journal of Fluids Engineering*, 116(3): 405-413, 1994.
6. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *Journal of Fluids Engineering*, 130(7): 078001, 2008.
7. Richardson L.F., "The Approximate Arithmetical Solution by Finite Differences of Physical Problems", *Philosophical Transactions of the Royal Society A*, 210: 307-357, 1911.
8. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
