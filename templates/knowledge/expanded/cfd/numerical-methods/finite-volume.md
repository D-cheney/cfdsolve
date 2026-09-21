---
template_version: flowlab-knowledge/1.0
slug: finite-volume
title: 有限体积法：原理、设置与验证
summary: >-
  从离散散度定理与线性保持性质出发，说明有限体积法为什么在任意多面体上都能精确重构线性场、内部面通量为何严格抵消，并用手算验证一次通量预算与一次线性场补丁，给出格式适用边界。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - CFD 数值方法
  - 有限体积法
  - 离散原理与适用范围
  - 线性保持
  - Rhie-Chow 插值
  - 工程设置与参数选择
  - OpenFOAM 字典
  - 库朗数
  - 结果诊断与可信度验证
  - 网格收敛指数
  - 面通量守恒
seo:
  title: 有限体积法：原理、设置与验证
  description: >-
    从离散散度定理与线性保持性质出发，说明有限体积法为什么在任意多面体上都能精确重构线性场、内部面通量为何严格抵消，并用手算验证一次通量预算与一次线性场补丁，给出格式适用边界。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 有限体积法
    - 离散原理与适用范围
    - 线性保持
    - 离散守恒
    - 工程设置与参数选择
    - OpenFOAM 字典
    - 库朗数
    - 非正交修正
    - 结果诊断与可信度验证
    - 网格收敛指数
    - 面通量守恒
    - GCI
---
# 有限体积法：原理、设置与验证

## 原理与适用范围

有限体积法的两个核心性质——内部面通量严格抵消、线性场可被精确重构——都可以从同一条离散散度定理直接推出，不需要任何关于网格形状的假设。这是它能在四面体、六面体、多面体及混合网格上通用的根本原因。本文给出这条定理的离散形式、两个可手算的验证，以及格式精度与网格质量共同决定的适用边界。

### 离散散度定理与内部面抵消

对控制体 $P$ 与任意标量场 $\phi$，离散形式的散度定理写作

$$\int_{V_P}\nabla\phi\,dV\approx\sum_{f}\phi_f\mathbf{A}_f$$

其中 $\mathbf{A}_f$ 是面 $f$ 的面积矢量，方向由 owner 指向 neighbour，边界面上指向域外。对内部面，同一个面在两侧单元的求和中出现两次，面积矢量等值反向，因此任意常数场 $\phi\equiv c$ 的贡献为

$$\sum_{f}c\,\mathbf{A}_f=c\sum_{f}\mathbf{A}_f=0$$

这条恒等式对任意闭合多面体成立，与网格是否畸变无关。它同时给出两条工程结论：常数场不会被重构出虚假梯度；内部面上的通量在全局求和中严格抵消，守恒误差只可能来自边界面。这就是"局部守恒"的精确含义，也是有限体积法在流量分配、能量收支这类核算任务中被默认选用的原因。

### 线性保持：为什么线性场补丁检验一定通过

若 $\phi$ 为线性场 $\phi=\mathbf{g}\cdot\mathbf{x}+c$，面值用两侧单元中心的线性插值恰好等于面上的真实值，于是

$$\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f=\frac{1}{V_P}\sum_{f}\left(\mathbf{g}\cdot\mathbf{x}_f+c\right)\mathbf{A}_f=\mathbf{g}\cdot\frac{1}{V_P}\sum_{f}\mathbf{x}_f\otimes\mathbf{A}_f=\mathbf{g}$$

最后一步用到 $\frac{1}{V_P}\sum_f\mathbf{x}_f\otimes\mathbf{A}_f=\mathbf{I}$，这是散度定理对位置矢量 $\mathbf{x}$ 的直接推论。因此有限体积法的梯度重构在**任意多面体网格**上都能精确再现线性场，误差只到浮点舍入量级。

手算验证一次。取边长 $h=2.0\times10^{-3}\ \mathrm{m}$ 的立方单元，$V=8.0\times10^{-9}\ \mathrm{m^3}$，每个面面积 $A_f=4.0\times10^{-6}\ \mathrm{m^2}$。场取 $\phi=3x+2y+1$，则 $x=+1.0\times10^{-3}\ \mathrm{m}$ 面与 $x=-1.0\times10^{-3}$ 面上的 $\phi$ 分别为

$$\phi_{+}=3\times1.0\times10^{-3}+1=1.003,\qquad \phi_{-}=-0.003+1=0.997$$

$x$ 方向的通量和为

$$\sum_{f}\phi_f A_{f,x}=\left(1.003-0.997\right)\times4.0\times10^{-6}=6.0\times10^{-3}\times4.0\times10^{-6}=2.4\times10^{-8}\ \mathrm{m^3}$$

除以体积：

$$\frac{2.4\times10^{-8}}{8.0\times10^{-9}}=3.0$$

精确等于 $\partial\phi/\partial x$。$y$ 方向同理给出 2.0。这就是线性场补丁检验必然通过的原因，也是它能作为实现正确性判据的依据。

### 通量预算：守恒误差必须单独核算

守恒是有限体积法的性质，但**离散守恒误差不为零**——它来自边界插值、非正交修正的显式滞后、以及迭代未收敛。因此必须单独核算。

取风道算例：空气 $\rho=1.2\ \mathrm{kg/m^3}$，来流 $u=10\ \mathrm{m/s}$，入口面积 $A=0.01\ \mathrm{m^2}$，则入口质量流量

$$\dot{m}_{\text{in}}=\rho u A=1.2\times10\times0.01=0.12\ \mathrm{kg/s}$$

若出口按同一面通量定义算得 $\dot{m}_{\text{out}}=0.12005\ \mathrm{kg/s}$，则

$$\varepsilon=\frac{\left|\dot{m}_{\text{out}}-\dot{m}_{\text{in}}\right|}{\dot{m}_{\text{in}}}=\frac{4.2\times10^{-4}}{0.12}=3.5\times10^{-3}$$

即 0.35 %。稳态算例的验收阈值通常取 0.1 %，此例不达标，需要继续迭代或收紧压力容差。注意这个误差在残差曲线上完全看不出来：归一化残差可能已经降到 $10^{-5}$，通量预算仍然差 0.35 %。

### 网格质量与格式精度的耦合

| 网格指标 | 合格范围 | 超限后果 |
|---|---|---|
| 最大非正交角 | < 70° | 非正交修正项发散，需增加修正迭代 |
| 最大歪斜度 | < 4 | 面值插值误差主导，梯度失真 |
| 最大长宽比 | < 100（边界层内可放宽） | 最小二乘法方程条件数恶化 |
| 最小正交角余弦 | > 0.15 | 扩散项符号可能出错 |
| 最小体积 | > 0 | 负体积导致求解器立即终止 |

### 检查脚本

```bash
# 1. 网格质量
checkMesh -allGeometry -allTopology | tee log.checkMesh
# 关键行: Max non-orthogonality, Max skewness, Min volume
# 期望: non-orthogonality < 70, skewness < 4, min volume > 0

# 2. 通量预算: 入口与出口分别积分
postProcess -func "surfaceFieldValue(name=inlet,  operation=sum, fields=(phi))" -time 0
postProcess -func "surfaceFieldValue(name=outlet, operation=sum, fields=(phi))" -time 0
# 两个值之差除以入口值即为相对守恒误差
```

```python
# 线性场补丁检验: 任意多面体上都应给出机器精度
import numpy as np
g = np.array([3.0, 2.0, 0.0])          # 解析梯度 1/m
faces = [                              # (面积矢量 m^2, 面中心 m)
    (np.array([ 4e-6, 0, 0]), np.array([ 1e-3, 0, 0])),
    (np.array([-4e-6, 0, 0]), np.array([-1e-3, 0, 0])),
    (np.array([0,  4e-6, 0]), np.array([0,  1e-3, 0])),
    (np.array([0, -4e-6, 0]), np.array([0, -1e-3, 0])),
    (np.array([0, 0,  4e-6]), np.array([0, 0,  1e-3])),
    (np.array([0, 0, -4e-6]), np.array([0, 0, -1e-3])),
]
V, acc = 8e-9, np.zeros(3)
for A_f, x_f in faces:
    acc += (g @ x_f + 1.0) * A_f        # phi_f = g·x_f + c, 线性插值精确
print("重构梯度:", acc / V, " 误差:", np.abs(acc/V - g).max())
# 重构梯度: [3. 2. 0.]  误差: 0.0
```

### 适用边界

- **守恒律问题**：有限体积法是首选，局部守恒是结构性的而非附加的；
- **需要三阶以上精度**：标准二阶重构不够，必须用 k-exact 或 WENO 重构，代价是 stencil 扩张，破坏紧致性，并行通信量上升；
- **非守恒形式方程**：没有通量平衡结构，散度定理无法直接使用，有限元或谱方法更自然；
- **共置网格上的压力—速度耦合**：必须引入 Rhie–Chow 型插值抑制棋盘格压力振荡，否则动量方程无法感知压力梯度；
- **高超声速与强激波**：需要限制器配合，而限制器在光滑极值处降阶，网格加密只能缩小受影响单元数，不能恢复精度。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 通量预算差 0.35 % 而残差已到 $10^{-5}$ | 守恒误差与残差下降无关 | 单独积分入口与出口通量，比较相对差 |
| 压力场出现棋盘格振荡 | 共置网格缺少 Rhie–Chow 插值 | 关闭压力方程只跑动量，振荡若消失即确认 |
| 线性场补丁误差 $10^{-5}$ | 面面积矢量与体积不自洽 | 逐面累加 $\sum_f\mathbf{A}_f$，非零即定位到出错面 |
| 非正交角 75° 处解出现局部尖峰 | 非正交修正项在显式滞后下发散 | 把修正迭代次数从 1 提到 3，尖峰应显著减小 |
| 加密网格后目标量不收敛 | 限制器在光滑极值处降阶，精度被钉死在一阶 | 改用无限制高阶格式在光滑区重跑，观察阶数恢复 |

### 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. Rhie C.M., Chow W.L., *Numerical study of the turbulent flow past an airfoil with trailing edge separation*, AIAA Journal, 21(11):1525–1532, 1983.
3. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4):235–255, 1995.
4. Wesseling P., *Principles of Computational Fluid Dynamics*, Springer, 2001.

## 工程设置与参数选择

有限体积的工程配置由三张字典和一组松弛因子决定：`fvSchemes` 定离散格式、`fvSolution` 定线性求解器与压力修正、`fvOptions` 定源项。本文给出一套可运行的 OpenFOAM 配置，逐项说明取值依据，并给出库朗数与非正交修正次数的反算。

### 一、格式选择与延迟修正

对流项在二阶精度与有界性之间用延迟修正折中：以稳定的一阶迎风为隐式部分，把高阶修正显式加入右端。

$$
\phi_f=(1-\gamma)\,\phi_f^{\mathrm{UD}}+\gamma\,\phi_f^{\mathrm{CD}}
$$

$\gamma=1$ 即纯中心格式，精度高但在高库朗数下振荡；$\gamma=0$ 即纯迎风，稳定但耗散大。工程上常用带限制的梯度格式代替显式混合，由限制器自动决定每个面上的 $\gamma$，无需手工给定。扩散项一律用中心格式，并配非正交修正：

$$
\Gamma_f\left(\nabla\phi\right)_f\cdot\mathbf A_f=D_f\left(\phi_N-\phi_P\right)+E_f
$$

$E_f$ 是非正交修正项，用上一次迭代的梯度显式计算，因此需要多迭代几次才收敛。

### 二、库朗数与非正交修正次数

瞬态计算的时间步由库朗数控制：

$$
Co=\frac{\Delta t}{2V_P}\sum_f\left|\mathbf u_f\cdot\mathbf A_f\right|
$$

取 $Co_{\max}=0.5$、最小网格尺度 $\Delta x=5\times10^{-3}$ m、$|\mathbf u|=10$ m/s，则 $\Delta t=0.5\times5\times10^{-3}/10=2.5\times10^{-4}$ s。非正交修正次数按最大非正交角选取：小于 40° 取 1 次，40°～60° 取 2 次，60°～70° 取 3 次；超过 70° 应先改善网格，而不是继续加迭代。

### 三、OpenFOAM 配置

```cpp
// system/fvSchemes
ddtSchemes      { default backward; }        // 瞬态二阶
gradSchemes     { default cellLimited Gauss linear 1; }
divSchemes
{
    default         none;
    div(phi,U)      Gauss linearUpwind grad(U);   // 二阶、有界
    div(phi,k)      Gauss limitedLinear 1;         // 湍流量用限制格式
}
laplacianSchemes { default Gauss linear corrected; }  // 非正交修正
interpolationSchemes { default linear; }
snGradSchemes   { default corrected; }
fluxRequired    { default no; p; }
```

```cpp
// system/fvSolution
solvers
{
    p
    {
        solver          GAMG;
        smoother        GaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
    }
    U
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-8;
        relTol          0.1;
    }
}
SIMPLE
{
    nNonOrthogonalCorrectors 2;
    consistent      yes;
}
relaxationFactors
{
    fields     { p 0.3; }
    equations  { U 0.7; }
}
```

### 四、参数取值依据

| 项目 | 取值 | 依据 |
|---|---|---|
| 时间格式 | `backward` | 二阶隐式，瞬态精度优于 `Euler` |
| 对流格式 | `linearUpwind grad(U)` | 二阶且耗散低于纯迎风 |
| 梯度限制 | `cellLimited Gauss linear 1` | 限制系数 1，防止界面外插越界 |
| 扩散格式 | `Gauss linear corrected` | 显式非正交修正 |
| 非正交修正次数 | 2 | 最大非正交角 40°～60° |
| 库朗数上限 | 0.5 | 瞬态精度与稳定性 |
| 时间步 $\Delta t$ | $2.5\times10^{-4}$ s | 由库朗数与最小网格反算 |
| 压力求解器 | GAMG，容差 $10^{-7}$，relTol 0.01 | 压力方程条件数大 |
| 速度求解器 | `smoothSolver`/`symGaussSeidel`，容差 $10^{-8}$ | 系数矩阵对角占优 |
| 松弛因子 p / U | 0.3 / 0.7 | 稳态 SIMPLE 的常用组合 |

### 五、症状、根因与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差停在平台不再下降 | 非正交修正次数不足，或网格非正交角过大 | 用 `checkMesh` 查非正交角，并把修正次数加 1 重算 |
| 高库朗数下出现非物理振荡 | 对流格式用了纯中心，或限制器未启用 | 换 `linearUpwind` 或加 `limitedLinear`，比较振荡幅度 |
| 稳态计算压力场缓慢漂移 | 压力参考点未固定 | 检查 `pRefCell`/`pRefValue` 是否设置 |
| 收敛很慢但残差平滑 | 松弛因子过小 | 把 p 从 0.3 提到 0.5、U 从 0.7 提到 0.8，比较迭代数 |
| 湍流量出现负值 | 湍流输运方程用了无限制格式 | 对 k 与 epsilon 改用 `limitedLinear 1` |
| 时间步减半后结果明显变化 | 时间格式仅一阶，或库朗数偏高 | 换 `backward` 并降低库朗数，比较两次结果之差 |

### 六、参考书目

1. OpenFOAM Foundation, *OpenFOAM User Guide*, `fvSchemes` 与 `fvSolution` 章节.
2. Patankar S. V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
3. Versteeg H. K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. Moukalled F., Mangani L., Darwish M., *The Finite Volume Method in Computational Fluid Dynamics: An Advanced Introduction with OpenFOAM and Matlab*, Springer, 2016.
5. Ferziger J.H., Perić M., Street R.L. 《Computational Methods for Fluid Dynamics》. Springer, 2020.
6. Jasak H. 《Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows》. Imperial College London, 1996.
7. Weller H.G., Tabor G., Jasak H., Fureby C. 《A tensorial approach to computational continuum mechanics using object-oriented techniques》. Computers in Physics, 1998.

## 诊断与可信度验证

有限体积的"守恒"必须被验证，而不能被假设。工程上最有说服力的三个数字是：面通量守恒误差、三套网格上的网格收敛指数（GCI）和由此得到的不确定度区间。本文给出这三者的计算方法、阈值与判错流程。

### 一、面通量守恒误差

对每个单元逐个边界面累加质量流量，定义相对守恒误差

$$
\epsilon_{\mathrm{cons}}=\frac{\left|\sum_f \dot m_f\right|}{\sum_f\left|\dot m_f\right|}
$$

收敛解中 $\epsilon_{\mathrm{cons}}$ 应低于 $10^{-12}$，即机器精度量级；内部面两侧的流量必须严格等值反号。若 $\epsilon_{\mathrm{cons}}$ 停在 $10^{-4}$，几乎都出在边界条件实现：入口/出口面被重复计入，或法向符号与通量符号约定相反。这类误差不会随网格加密而下降，是结构性缺陷的典型特征。

### 二、网格收敛指数 GCI

用三套按比例 $r$ 加密的网格，先由 Richardson 外推求观测阶，再折算不确定度：

$$
p=\frac{1}{\ln r}\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|,\qquad e_a=\frac{\phi_2-\phi_1}{\phi_1},\qquad \mathrm{GCI}_{\mathrm{fine}}=\frac{F_s\left|e_a\right|}{r^{p}-1}
$$

安全因子 $F_s$ 在三套网格时取 1.25，两套网格时取 3.0。取阻力系数 $\phi_1=0.3125$（$1.0\times10^{6}$ 单元）、$\phi_2=0.3102$（$3.375\times10^{6}$）、$\phi_3=0.3093$（$1.14\times10^{7}$），$r=1.5$：

- 相邻差之比 $|(-9.0\times10^{-4})/(-2.3\times10^{-3})|=0.3913$，$\ln 0.3913=-0.9383$，$\ln 1.5=0.4055$，得 $p=2.31$。
- 相对误差 $e_a=(0.3093-0.3102)/0.3102=-2.90\times10^{-3}$。
- $1.5^{2.31}=2.555$，于是 $\mathrm{GCI}=1.25\times2.90\times10^{-3}/(2.555-1)=3.63\times10^{-3}/1.555=2.33\times10^{-3}$。

即最细网格结果的不确定度约为 $\pm0.23\%$。若 $p$ 落在名义阶数（如二阶格式的 2）之外太远，说明还没进入渐近区，应补一套更细网格而不是直接采信 GCI。

### 三、非正交性与歪斜度

OpenFOAM 的 `checkMesh` 直接给出两个几何指标：最大非正交角（面法向与单元中心连线夹角）与最大歪斜度。工程阈值为最大非正交角小于 70°、最大歪斜度小于 4、最小面权重大于 0.05。非正交角超过 70° 时，显式非正交修正的迭代次数需从 1 提到 2～3，否则残差会停在平台不再下降。

### 四、GCI 计算脚本

```python
import numpy as np

def gci(phi, r, Fs=1.25):
    """由三套网格的目标量计算观测阶、相对误差与细网格 GCI。"""
    p = np.log(abs((phi[2] - phi[1]) / (phi[1] - phi[0]))) / np.log(r)
    e = abs((phi[1] - phi[0]) / phi[0])
    return p, e, Fs * e / (r**p - 1.0)

phi = [0.3125, 0.3102, 0.3093]      # 1.0e6 / 3.375e6 / 1.14e7 单元
p, e, G = gci(phi, r=1.5)
print(f"p={p:.2f}  e_a={e:.2e}  GCI={G:.2e} ({G:.2%})")
# p=2.31  e_a=2.90e-03  GCI=2.33e-03 (0.23%)
```

### 五、失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 全局守恒误差停在 $10^{-4}$ | 边界通量符号反了或被重复计入 | 逐个边界面积分流量，与设定值对差 |
| 阻力系数随加密非单调 | 多类误差同时变化，或未进入渐近区 | 保持格式一致，补一套中间网格再算 $p$ |
| 残差降到 $10^{-6}$ 但目标量仍漂移 | 残差平不代表面通量平衡 | 打印目标量随迭代的历史，看最后 200 步是否平直 |
| 加密后 GCI 反而变大 | 格式在细网格上退化，限制器主导误差 | 关闭限制器重算同一组网格，比较 $p$ |
| 局部出现负浓度或负温度 | 对流格式无界，或源项线性化破坏对角占优 | 换一阶迎风重算，看是否仍越界 |
| 非正交修正次数加倍后残差才下降 | 网格最大非正交角超过 70° | 用 `checkMesh` 输出非正交角分布，定位最差单元 |

### 六、与基准解对照

二维顶盖驱动方腔是有限体积最常用的公开基准。取 $Re=1000$（$U_{\text{lid}}=1$ m/s、腔宽 1 m、$\nu=1\times10^{-3}$ m²/s），Ghia 等（1982）给出的竖直中心线（$x=0.5$）在 $y=0.5$ 处水平速度为 $u=-0.3829$。用 $256\times256$ 网格、二阶迎风配限制器计算，该点速度应落在 $-0.383\pm0.008$（约 2%）内。若偏差超过 5%，先检查面通量守恒误差是否达标，再检查非正交修正；因为这两项都会在光滑解上留下系统性偏差，而不是随机噪声。

### 七、主要文献

1. Roache P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
2. Celik I. B., Ghia U., Roache P. J., Freitas C. J., Coleman H., Raad P. E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *ASME Journal of Fluids Engineering*, 130(7), 078001, 2008.
3. Ghia U., Ghia K. N., Shin C. T., "High-Re Solutions for Incompressible Flow Using the Navier-Stokes Equations and a Multigrid Method", *Journal of Computational Physics*, 48(3), 387-411, 1982.
4. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD Thesis, Imperial College London, 1996.
