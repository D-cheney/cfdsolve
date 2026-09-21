---
template_version: flowlab-knowledge/1.0
slug: cfd-boundary-periodic-boundary-modeling
title: 周期与循环边界：原理与诊断验证
summary: >-
  区分横向周期与流向周期两类用法的物理前提，给出 Zweifel 载荷数、流向周期所需的外部驱动力与最小周期域长度，附 OpenFOAM 周期网格配置。
  全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 边界条件与初始化
  - 周期与循环边界
  - 物理建模与适用边界
  - Zweifel 数
  - 流向周期性
  - 结果诊断与可信度验证
  - 周期性残差
  - 周向模态
seo:
  title: 周期与循环边界：原理与诊断验证
  description: >-
    区分横向周期与流向周期两类用法的物理前提，给出 Zweifel 载荷数、流向周期所需的外部驱动力与最小周期域长度，附 OpenFOAM 周期网格配置。
    全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 周期与循环边界
    - 物理建模与适用边界
    - Zweifel 数
    - 流向周期性
    - 最小流动单元
    - 结果诊断与可信度验证
    - cyclicAMI
    - 周期性残差
    - 周向模态
---
# 周期与循环边界：原理与诊断验证

## 原理与适用范围

周期边界在 CFD 里承担两件完全不同的任务：横向周期把无限重复的叶栅或换热器阵列压缩成单通道，流向周期则把充分发展的管流、槽道流压缩成一个重复单元。前者要求周向载荷分布均匀到一定程度，后者要求外加驱动力把周期单元内的动量亏损补回来，否则周期单元会自己衰减成静止流。两类用法的物理前提不同，混用会导致"收敛但无物理"的结果。本文分别给出它们的成立条件与量化判据。

### 横向周期性成立的物理前提

横向周期边界把相邻通道的流动绑定为同一解，隐含三个前提：周向载荷在通道间完全相同、通道内不存在跨越周期面的净输运、扰动的周向波长与节距匹配。第一条最容易被忽略——当叶片出口气流角沿周向有系统性漂移（例如上游有非均匀来流或叶片加工偏差）时，周期边界会强行抹平这个漂移，得到"平均通道"的解。判据是节距方向上的流动均匀性：在通道进出口各取三个等距采样点，轴向速度的周向不均匀度应低于 $1\%$，出口气流角的周向散布应低于 $0.5^\circ$。

第二条要求更严格：周期面必须是流线的"平行面"，即通过周期面的净质量流量为零。若通道内存在强二次流导致流体斜穿周期面，两侧的通量不再抵消，周期边界会持续注入或抽出质量。检查方法是对两个周期面分别做 $\phi$ 求和，两者必须严格反号且绝对值相等。

### 叶栅载荷与 Zweifel 数

横向周期性是否合理，取决于叶片载荷的周向均匀程度，这一点由 Zweifel 载荷系数刻画：

$$
Z = 2\,\frac{s}{c}\,\cos^2\alpha_2 \left( \tan\alpha_1 - \tan\alpha_2 \right)
$$

其中 $s/c$ 为节距弦长比，$\alpha_1$、$\alpha_2$ 为进出口气流角（自切向度量），$Z \approx 0.8$ 对应工程最优载荷，$Z > 1.1$ 意味着叶片过载、吸力面扩压段容易分离。取 $c = 80\ \mathrm{mm}$、平均半径 $r = 0.5\ \mathrm{m}$、叶片数 $N = 52$，则节距

$$
s = \frac{2\pi r}{N} = \frac{2\pi \times 0.5}{52} = 60.4\ \mathrm{mm}, \qquad \frac{s}{c} = 0.755
$$

设 $\alpha_1 = 55^\circ$、$\alpha_2 = 28^\circ$，则 $\cos^2 28^\circ = 0.7796$，$\tan 55^\circ - \tan 28^\circ = 1.4281 - 0.5317 = 0.8964$，

$$
Z = 2 \times 0.755 \times 0.7796 \times 0.8964 = 1.06
$$

$Z = 1.06$ 属于高载荷设计，此时单通道内的载荷沿周向本身变化较大，周期边界的"平均"效应更明显：若真实叶片存在微小几何差异，单通道解与整环解的偏差会随 $Z$ 升高而放大。经验上 $Z < 0.9$ 时单通道周期解与整环解的气动参数偏差小于 $1\%$，$Z > 1.1$ 时偏差可达 $3\% \sim 5\%$。

### 流向周期性需要外部驱动力

流向周期（cyclic inlet/outlet）没有上下游压差可用，因为进出口压力被强制相等。若不在动量方程中补入驱动力，周期性槽道流会在几个流动周期内衰减到静止。标准做法是在流向动量方程加入均匀体积力 $\beta$：

$$
\frac{\partial \mathbf{u}}{\partial t} + \nabla \cdot \left( \mathbf{u}\mathbf{u} \right) = -\frac{1}{\rho}\nabla p + \nu \nabla^2 \mathbf{u} + \beta\, \hat{\mathbf{e}}_x
$$

对充分发展槽道流，$\beta$ 等于平均压力梯度，由壁面切应力平衡给出：

$$
\beta = -\frac{\mathrm{d}p}{\mathrm{d}x} = \frac{\tau_w}{\delta} = \frac{\rho u_\tau^2}{\delta}
$$

取摩擦雷诺数 $Re_\tau = u_\tau \delta/\nu = 180$、半高 $\delta = 0.02\ \mathrm{m}$、空气 $\nu = 1.5\times 10^{-5}\ \mathrm{m^2/s}$，则

$$
u_\tau = \frac{Re_\tau \nu}{\delta} = \frac{180 \times 1.5\times 10^{-5}}{0.02} = 0.135\ \mathrm{m/s}
$$

$$
\beta = \frac{1.2 \times 0.135^2}{0.02} = 1.09\ \mathrm{Pa/m}
$$

这个 $1.09\ \mathrm{Pa/m}$ 就是必须施加的源项。若用固定质量流量驱动（`meanVelocityForce`），源项由求解器每步反算，此时体积流量成为输入，压降成为输出，两者只能选其一。混用固定流量与固定源项会导致流量和压降互相矛盾，表现为源项在迭代中持续增长而流量不变。

### 流向周期域的最小长度

周期域长度必须包含湍流自身的最长结构，否则大尺度结构被周期面切断，湍流无法维持。两个尺度界限需要区分：

- **统计收敛界限**：要复现单点统计量（雷诺应力剖面、均方根脉动），Kim-Moin-Moser 经典算例取 $L_x \times L_z = 4\pi\delta \times 2\pi\delta$。工程上可放宽到 $L_x = 2\pi\delta$、$L_z = \pi\delta$，即 $L_x = 0.1257\ \mathrm{m}$、$L_z = 0.0628\ \mathrm{m}$（$\delta = 0.02\ \mathrm{m}$）。
- **最小流动单元界限**：Jiménez-Moin 指出 $L_x^+ \approx 350$、$L_z^+ \approx 100$ 是湍流能自维持的下限，低于此值湍流会间歇性崩溃。换算成物理尺寸：

$$
L_x^{min} = \frac{L_x^+ \nu}{u_\tau} = \frac{350 \times 1.5\times 10^{-5}}{0.135} = 38.9\ \mathrm{mm}, \qquad
L_z^{min} = \frac{100 \times 1.5\times 10^{-5}}{0.135} = 11.1\ \mathrm{mm}
$$

在最小单元下算出的湍流是"人造"的：只含一个近壁条带结构，雷诺应力各向异性远高于真实槽道流。因此最小单元适合研究自维持机理，不适合标定湍流模型或提供验证数据。

### 网格与拓扑要求

```text
// blockMeshDict：流向周期需要在 boundary 段直接声明成对 patch
boundary
(
    inlet
    {
        type            cyclic;
        neighbourPatch  outlet;
        faces           ((0 4 7 3));
    }
    outlet
    {
        type            cyclic;
        neighbourPatch  inlet;
        faces           ((1 5 6 2));
    }
    lowerWall
    {
        type            wall;
        faces           ((0 3 2 1));
    }
    upperWall
    {
        type            wall;
        faces           ((4 5 6 7));
    }
);

// system/fvOptions：流向驱动，固定体积流量
momentumSource
{
    type            meanVelocityForce;
    selectionMode   all;
    fields          (U);
    Ubar            (2.50 0 0);        // 目标体积平均速度 m/s
}
```

流向周期的两个 patch 必须**几何完全相同**（顶点坐标逐点相等），因为 `cyclic` 按平移变换匹配面；若两侧网格在流向位置上有偏移，只能改用 `cyclicAMI` 并接受插值误差。

### 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 流向周期算例速度单调衰减至零 | 未施加动量源项，无压差驱动 | 输出体积平均速度时程，应稳定在 `Ubar` 附近 |
| 源项随迭代持续增长但流量不变 | 同时指定了固定流量与固定源项 | 检查 `fvOptions` 与 `boundaryField` 是否重复约束 |
| 周期面两侧通量不反号 | 通道内存在斜穿周期面的二次流 | 两侧 `surfaceFieldValue` 求和，必须严格反号 |
| 湍流在最小单元下间歇崩溃 | $L_x^+ < 350$，低于自维持下限 | 输出壁面切应力时程，看是否出现周期性归零 |
| 单通道与整环解偏差 $4\%$ | 叶片载荷过高（$Z > 1.1$） | 计算 Zweifel 数，超过 1.1 需用多通道 |
| 横向周期算例出口气流角周向漂移被抹平 | 上游来流非均匀，周期边界强制平均 | 在进出口各取三点比较周向不均匀度，应 $< 1\%$ |

### 参考文献

1. Jiménez J., Moin P., "The Minimal Flow Unit in Near-Wall Turbulence", *Journal of Fluid Mechanics*, 225, 213-240, 1991.
2. Kim J., Moin P., Moser R., "Turbulence Statistics in Fully Developed Channel Flow at Low Reynolds Number", *Journal of Fluid Mechanics*, 177, 133-166, 1987.
3. Zweifel O., "Die Frage der optimalen Schaufelteilung bei Beschaufelungen von Turbomaschinen", *Brown Boveri Mitteilungen*, 32, 1945.
4. Denton J.D., "Loss Mechanisms in Turbomachines", *ASME Journal of Turbomachinery*, 115(4), 621-656, 1993.
5. OpenFOAM Foundation, *OpenFOAM v2312 User Guide*, chapter on cyclic and cyclicAMI patches, 2023.

## 诊断与可信度验证

单通道周期计算把整环的 $N$ 个叶片压缩成 1 个，代价是只保留周向模态中节点直径为 $N$ 的整数倍那一小部分。绝大多数叶轮机械算例中这个假设成立，但一旦出现非整数倍节点直径的旋转失速、周向不均匀来流或长波长进口畸变，单通道结果就会给出虚假的稳定解。本文给出三项可量化检查——周期面匹配残差、通道通量闭合、周向模态可分辨性——以及用 2～3 通道算例做对照的验证流程。

### 周期角与通道几何的换算

旋转周期边界的两侧相差一个节距角。对 $N$ 个均布叶片，

$$
\theta_p = \frac{360^\circ}{N}
$$

取平均半径 $r = 0.5\ \mathrm{m}$、叶片数 $N = 46$，则 $\theta_p = 360/46 = 7.826^\circ$，周向节距

$$
s = \frac{2\pi r}{N} = \frac{2\pi \times 0.5}{46} = 68.3\ \mathrm{mm}
$$

若弦长 $c = 80\ \mathrm{mm}$，节距弦长比 $s/c = 0.854$，落在轴流涡轮的常规区间 $0.7 \sim 0.9$。若计算时把 $N$ 误填成 45，$\theta_p$ 变成 $8.000^\circ$，节距变成 $69.8\ \mathrm{mm}$，周期面在几何上就错位 $1.5\ \mathrm{mm}$——`checkMesh` 会报周期面不匹配，但若使用 `cyclicAMI` 容错匹配，几何错误会被插值抹平而不报错，这时必须靠通量闭合检查来发现。

### 周期面匹配残差

`cyclic` 要求两侧面网格一一对应，`cyclicAMI` 允许非一致网格但引入插值误差。诊断量是映射后两侧场量的最大相对偏差：

$$
\varepsilon_\phi = \frac{\max \left| \phi_A - \phi_B^{\,\mathrm{rot}} \right|}{\phi_{ref}} \times 100\%
$$

以入口轴向速度 $60\ \mathrm{m/s}$ 为参考，若映射后两侧最大偏差为 $0.03\ \mathrm{m/s}$，则 $\varepsilon_\phi = 0.05\%$。阈值：`cyclic` 应低于 $0.01\%$（此时残差纯粹来自迭代未收敛），`cyclicAMI` 允许到 $0.1\%$，超过 $0.5\%$ 说明插值权重或面法向有系统性错误，会持续污染下游尾迹。

残差还随迭代单调下降才正常。若 $\varepsilon_\phi$ 在收敛后稳定在 $2\%$ 不再下降，典型的根因是两侧面的旋转轴定义不一致：OpenFOAM 中 `rotationAxis` 与 `rotationCentre` 必须与几何建模时的实际轴完全一致，轴偏 0.5 mm 在 $r = 0.5\ \mathrm{m}$ 处就产生 $0.1\%$ 的角向错位。

### 通道通量与整环量的闭合

周期边界不传递净质量，因此穿过周期面对的通量必须严格抵消：

$$
\dot m_A + \dot m_B = 0
$$

更实用的检查是把单通道结果外推到整环，与已知总流量对照。单通道入口面积 $A = s \times b = 68.3\ \mathrm{mm} \times 100\ \mathrm{mm} = 6.83\times 10^{-3}\ \mathrm{m^2}$，空气密度 $\rho = 1.20\ \mathrm{kg/m^3}$，入口法向速度 $32.0\ \mathrm{m/s}$：

$$
\dot m_{passage} = \rho A u_n = 1.20 \times 6.83\times 10^{-3} \times 32.0 = 0.262\ \mathrm{kg/s}
$$

整环 46 个通道合计 $0.262 \times 46 = 12.1\ \mathrm{kg/s}$。若试验台测得总流量 $12.0\ \mathrm{kg/s}$，相对偏差 $0.8\%$，属可接受；若偏差超过 $3\%$，先检查是否把 $N$ 用错，再检查入口是否被施加了额外的堵塞。

### 周向模态：单通道能分辨什么

整环上的周向扰动可分解为节点直径 $m$ 的模态，波长 $\lambda_m = 2\pi r/m$。单通道只允许满足

$$
m = k N, \qquad k = 0, 1, 2, \dots
$$

的模态存在，其余模态在周期边界上被迫"首尾相接"，被人为抑制或混叠到 $m = 0$。这意味着 $N = 46$ 的单通道算例原则上无法捕捉任何 $m = 1 \sim 45$ 的低阶模态，而旋转失速、进口畸变传递、叶片颤振的典型模态恰恰落在这个区间。物理上这类模态的判据是周向波长与节距之比：若 $\lambda_m / s > 3$，单通道假设即失效，必须改用多通道或全环。

### 与多通道算例的对照

最可靠的验证是复制 2～3 个通道做同一算例，比较积分量：

| 检查项 | 单通道 | 3 通道 | 判据 |
| --- | --- | --- | --- |
| 单通道质量流量 | $0.262\ \mathrm{kg/s}$ | $0.259\ \mathrm{kg/s}$ | 偏差 $< 2\%$ |
| 总压损失系数 | $0.0812$ | $0.0796$ | 偏差 $< 5\%$ |
| 出口气流角 | $62.4^\circ$ | $61.8^\circ$ | 偏差 $< 1^\circ$ |
| 周期面残差 | $0.05\%$ | $0.04\%$ | 量级一致 |

若 3 通道结果与单通道偏差超过上表判据，且 3 通道内部三个通道之间本身就不一致（例如通道间流量相差 $4\%$），说明物理上存在非整数倍节点直径模态，单通道结论不可用。反之，若三个通道互相一致且与单通道一致，则单通道假设得到验证。

### 配置与检查命令

```text
// constant/polyMesh/boundary 中的周期对（由 createPatch 生成）
periodic1
{
    type            cyclic;
    inGroups        1(cyclic);
    nFaces          1240;
    startFace       48210;
    matchTolerance  1e-4;
    neighbourPatch  periodic2;
    transform       rotational;
    rotationAxis    (0 0 1);
    rotationCentre  (0 0 0);
    rotationAngle   7.82608695652174;      // 360/46
}
```

```bash
# 1) 几何与周期对检查
checkMesh -allGeometry -allTopology 2>&1 | grep -i -E "cyclic|non-orthogonality"

# 2) 周期面通量与残差
postProcess -func "surfaceFieldValue(name=periodic1,operation=sum,fields=(phi))" -latestTime
postProcess -func "surfaceFieldValue(name=periodic2,operation=sum,fields=(phi))" -latestTime

# 3) 两侧压力场的映射偏差（需先输出面场）
postProcess -func "patchAverage(name=periodic1,p)" -latestTime
postProcess -func "patchAverage(name=periodic2,p)" -latestTime
```

第 2 步两条命令的输出必须数值相等、符号相反；若相差超过入口通量的 $0.1\%$，说明周期对在拓扑上没有被求解器识别为同一对。

### 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 收敛后 $\varepsilon_\phi$ 停在 $2\%$ 不降 | `rotationCentre` 与几何实际轴不一致 | 比较两侧面质心到轴的距离，差值应 $< 10^{-5}\ \mathrm{m}$ |
| 周期面两侧 $\phi$ 通量不等 | 周期对未被识别，退化为两个独立 patch | 两条 `surfaceFieldValue` 命令结果比对，必须严格反号 |
| 单通道流量外推与试验差 $> 3\%$ | 叶片数 $N$ 用错或节距算错 | 复核 $\theta_p = 360/N$ 与 $s = 2\pi r/N$ |
| 3 通道算例内部通道间流量差 $4\%$ | 存在 $m$ 非 $N$ 倍数的周向模态 | 检查是否为旋转失速工况，改用全环 |
| 出口气流角比试验小 $3^\circ$ 以上 | 单通道抑制了周向混合与二次流 | 对比 3 通道出口气流角，偏差应 $< 1^\circ$ |
| `cyclicAMI` 算例残差周期性尖峰 | AMI 插值在低权重点产生噪声 | 输出 AMI 权重场，检查是否有面权重 $< 0.1$ |

### 参考文献

1. Erdos J.I., Alzner E., McNally W., "Numerical Solution of Periodic Transonic Flow through a Fan Stage", *AIAA Journal*, 15(11), 1559-1568, 1977.
2. Denton J.D., "Loss Mechanisms in Turbomachines", *ASME Journal of Turbomachinery*, 115(4), 621-656, 1993.
3. Horlock J.H., *Axial Flow Turbines: Fluid Mechanics and Thermodynamics*, Butterworths, 1966.
4. Cumpsty N.A., *Compressor Aerodynamics*, Longman Scientific & Technical, 1989.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, section "Cyclic patches", v2312, 2023.
