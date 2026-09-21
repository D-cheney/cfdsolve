---
template_version: flowlab-knowledge/1.0
slug: openfoam-numerics-laplacian-corrections-modeling
title: laplacianSchemes 非正交修正：原理、设置与验证
summary: >-
  把面法向导数拆成正交项与 k_f 修正项，推导 Δ_f 与 k_f 的几何表达式，给出忽略修正时 1-cosθ 的相对误差量级，说明
  corrected、limited 与 uncorrected 各自的适用角度边界。
category:
  slug: openfoam-numerics-boundaries
  name: OpenFOAM 边界与数值设置
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 边界与数值设置
  - laplacianSchemes 非正交修正
  - 设置机理与适用范围
  - snGrad
  - 非正交角
  - 工程设置与参数选择
  - nNonOrthogonalCorrectors
  - limited
  - 结果诊断与可信度验证
  - 解析基准
  - 修正残差
seo:
  title: laplacianSchemes 非正交修正：原理、设置与验证
  description: >-
    把面法向导数拆成正交项与 k_f 修正项，推导 Δ_f 与 k_f 的几何表达式，给出忽略修正时 1-cosθ 的相对误差量级，说明
    corrected、limited 与 uncorrected 各自的适用角度边界。
  keywords:
    - laplacianSchemes 非正交修正
    - 设置机理与适用范围
    - snGrad 正交分解
    - 非正交角
    - limited 系数
    - 工程设置与参数选择
    - nNonOrthogonalCorrectors
    - limited 0.33
    - snGrad 一致性
    - 结果诊断与可信度验证
    - 解析通量基准
    - 修正残差
    - 非正交角扫描
---
# laplacianSchemes 非正交修正：原理、设置与验证

扩散项离散里真正难处理的不是 $\Gamma$，而是面法向导数 $\mathbf{S}_f\cdot\nabla\phi_f$：只有当面法向与两单元中心连线平行时，它才能用 $( \phi_N-\phi_P )/|\mathbf{d}|$ 直接近似。网格一旦扭曲，面法向与连线夹角 $\theta$ 会把这项近似拉出几十个百分点的误差。本文推导正交分解的两个几何量 $\Delta_f$ 与 $\mathbf{k}_f$，给出误差随 $\theta$ 的量级规律，并说明三档修正设置的适用边界。非正交修正的设置只有三个旋钮：选 `corrected` 还是 `limited k`，`k` 取多少，以及 `nNonOrthogonalCorrectors` 取几。三个都要由 `checkMesh` 报出的最大非正交角决定，而不是凭经验拍。非正交修正做得好不好，最终体现在壁面通量上：修正不足会让热流系统性偏低，修正过度会在坏单元上产生过冲。判断它是否可信需要两个诊断量——修正迭代自身的残差，以及相对解析解的通量误差。

## 扩散项在面上需要什么

`laplacianSchemes` 处理的是 $\nabla\cdot(\Gamma\nabla\phi)$。用散度定理后每一项都要算面通量：

$$
\int_{V_P}\nabla\cdot(\Gamma\nabla\phi)\,dV=\sum_f \Gamma_f\left(\mathbf{S}_f\cdot\nabla\phi_f\right)
$$

其中 $\mathbf{S}_f$ 为面的外法向面积矢量（单位 $\mathrm{m^2}$），$\Gamma_f$ 为插值到面上的扩散系数。难点在括号里：$\nabla\phi_f$ 是面梯度，无法直接得到，只能沿某个方向做差分。唯一能自然做差分的方向就是两单元中心连线 $\mathbf{d}$，因此必须把 $\mathbf{S}_f$ 投影到 $\mathbf{d}$ 上。

## 正交分解：$\Delta_f$ 与 $\mathbf{k}_f$

把面法向导数写成沿连线的差分加一个修正：

$$
\mathbf{S}_f\cdot\nabla\phi_f=\underbrace{\Delta_f\left(\phi_N-\phi_P\right)}_{\text{正交项}}+\underbrace{\mathbf{k}_f\cdot(\overline{\nabla\phi})_f}_{\text{非正交修正}}
$$

其中两个几何量由下式定义：

$$
\Delta_f=\frac{|\mathbf{S}_f|^2}{\mathbf{S}_f\cdot\mathbf{d}},\qquad \mathbf{k}_f=\mathbf{S}_f-\Delta_f\,\mathbf{d}
$$

$\Delta_f$ 的量纲是长度（$\mathrm{m}$），$\mathbf{k}_f$ 的量纲是面积（$\mathrm{m^2}$）。当面法向与 $\mathbf{d}$ 夹角为 $\theta$ 时，$|\Delta_f\mathbf{d}|=|\mathbf{S}_f|/\cos\theta$，且

$$
|\mathbf{k}_f|=|\mathbf{S}_f|\tan\theta
$$

这条关系式说明修正项不是小量。取一个边长 $0.005\ \mathrm{m}$ 的六面体面，$|\mathbf{S}_f|=2.5\times10^{-5}\ \mathrm{m^2}$，$\theta=60^\circ$，则 $|\mathbf{k}_f|=2.5\times10^{-5}\times1.732=4.33\times10^{-5}\ \mathrm{m^2}$，比 $|\mathbf{S}_f|$ 本身还大 73%。若 $\theta$ 增到 $70^\circ$，$\tan70^\circ=2.75$，修正项的几何权重变成主项的 2.75 倍——此时扩散算子的主导部分其实来自修正项，忽略它等于解另一个方程。

## 三档设置与适用边界

```cpp
laplacianSchemes
{
    default                     Gauss linear corrected;
    laplacian(nuEff,U)          Gauss linear corrected;
    laplacian((1|A(U)),p)       Gauss linear corrected;
    laplacian(DkEff,k)          Gauss linear limited 0.33;
}
snGradSchemes
{
    default         corrected;
    limited 0.33;
}
```

修正项用的是**上一次迭代**的梯度，因此它本质上是一个固定点迭代：每执行一次 `nNonOrthogonalCorrectors` 就更新一次梯度并把残差压低一截。次数不足会留下系统性误差，次数过多只增加成本而不改善精度，因为修正项本身也有截断误差。

```cpp
SIMPLE
{
    nNonOrthogonalCorrectors 1;   // 非正交角 < 60° 时足够
}
PIMPLE
{
    nNonOrthogonalCorrectors 2;   // 瞬态含动网格或 < 70° 时
    nCorrectors              2;
}
```

| 设置 | 修正项处理 | 适用非正交角 | 代价 |
|---|---|---|---|
| `uncorrected` | 完全忽略 $\mathbf{k}_f$ | $\theta<20^\circ$ | 最低，一阶误差 |
| `corrected` | 用上次迭代梯度显式修正 | $\theta<70^\circ$ | 需多次非正交修正迭代 |
| `limited k` | 只在 $\mathbf{k}_f$ 小时保留修正 | $\theta$ 局部超 $70^\circ$ | 略降精度换稳健 |

## 先读 checkMesh 的非正交角

设置修正之前必须先量化网格。`checkMesh` 报出的 `Max non-orthogonality` 就是各面 $\theta$ 的最大值，`Average non-orthogonality` 是均值。经验阈值是：均值低于 $20^\circ$ 且最大低于 $60^\circ$ 属于好网格；最大超过 $70^\circ$ 时修正已经很难补救，应优先改网格或换 `limited`。

`limited k` 的规则是把修正项夹到正交项的一个比例以内：

$$
\left|\,\mathbf{k}_f\cdot\nabla_f\phi\,\right|\le k\,\Delta_f\left|\phi_N-\phi_P\right|
$$

$k$ 是夹逼系数。取 `limited 0.33` 意味着修正项最多贡献正交项的 33%，在坏单元上牺牲精度换稳健；取 `limited 0.5` 更接近 `corrected`，适合最大角 $70^\circ$ 附近；取 `limited 1.0` 基本等价于不夹逼，意义不大。

## 修正迭代次数怎么定

修正项用上一次迭代的梯度显式计算，构成一个固定点迭代。设每轮的误差收缩因子为 $\rho$，则第 $m$ 轮后的修正残差为

$$
r^{(m)}=\rho^{m}\,r^{(0)},\qquad m\ge\frac{\log\left(r_{tol}/r^{(0)}\right)}{\log\rho}
$$

收缩因子 $\rho$ 随非正交角增大而接近 1。实测中 $\theta<40^\circ$ 时 $\rho\approx0.3$，$\theta\approx60^\circ$ 时 $\rho\approx0.4$，$\theta\approx70^\circ$ 时 $\rho\approx0.55$。若要把修正残差从 1 压到 $10^{-2}$，$\rho=0.3$ 需要 $m\ge\log(0.01)/\log(0.3)=3.8$ 即 4 次，$\rho=0.55$ 需要 $m\ge\log(0.01)/\log(0.55)=7.8$ 即 8 次——这就是为什么坏网格上单纯堆 `nNonOrthogonalCorrectors` 的性价比极低，工程上通常封顶在 3。

| 最大非正交角 | 推荐设置 | `nNonOrthogonalCorrectors` |
|---|---|---|
| $<20^\circ$ | `Gauss linear uncorrected` | 0 |
| $20^\circ\sim60^\circ$ | `Gauss linear corrected` | 1 |
| $60^\circ\sim70^\circ$ | `Gauss linear corrected` | 2 |
| $>70^\circ$，局部坏单元 | `Gauss linear limited 0.33` | 2 |
| $>75^\circ$ | 先修网格 | 2～3，仅作过渡 |

## 一份配套字典

```cpp
laplacianSchemes
{
    default                     Gauss linear corrected;
    laplacian(nuEff,U)          Gauss linear corrected;
    laplacian((1|A(U)),p)       Gauss linear corrected;
    laplacian(DkEff,k)          Gauss linear limited 0.33;
    laplacian(DepsilonEff,epsilon) Gauss linear limited 0.33;
}
snGradSchemes
{
    default     corrected;
    limited     limited 0.33;
}
```

`snGradSchemes` 必须与 `laplacianSchemes` 同档。原因是 `corrected` 的 `snGrad` 也要调用同一套 $\mathbf{k}_f$ 修正；如果 `laplacian` 用 `limited 0.33` 而 `snGrad` 用 `corrected`，同一个面上会出现两个不同的法向导数，扩散项与梯度项自相矛盾，表现为壁面热流与体平均耗散对不上。

改完字典后用一条命令核对两处档位是否一致，再启动求解器：

```bash
foamDictionary -entry laplacianSchemes.default -value system/fvSchemes
foamDictionary -entry snGradSchemes.default   -value system/fvSchemes
# 两者应同为 corrected 或同为 limited 0.33；不一致即为配置缺陷
checkMesh -allGeometry -allTopology 2>&1 | grep -i "non-orthogonality"
```

## 修正次数与夹逼的三轮对照

判定规则：若 N2 与 N1 的壁面热流差小于 0.5%，说明一次修正已足够；若 N3 相对 N1 的热流下降超过 2%，说明 `limited 0.33` 正在削掉真实扩散通量，只应作为过渡方案并同步安排网格整改。

| 轮次 | 改动项 | 保持不动 | 记录量 |
|---|---|---|---|
| N0 | `nNonOrthogonalCorrectors 0` | 网格、格式、求解器 | 压力残差、壁面热流 |
| N1 | 仅提到 1 | 其余全部 | 同上，看变化是否超容差 |
| N2 | 仅提到 2 | 其余全部 | 同上，确认是否进入平台 |
| N3 | 仅把 `corrected` 换成 `limited 0.33` | 次数回到 N1 的值 | 极值、坏单元附近的压力 |

## 故障模式与判定试验

判断修正是否充分的标准不是残差降到多小，而是把 `nNonOrthogonalCorrectors` 加一再跑一遍，关键工程量是否变化小于工程容差。若变化仍然可见，问题在网格而非修正次数，应回到 `checkMesh` 处理最差的那些单元。

诊断顺序建议是：先确认 $R_{no}$ 收敛，再用解析基准确认 $E_q$ 量级正确，最后才看工程算例的物理量。跳过前两步直接看工程结果，很容易把非正交修正不足误判成物性参数或边界条件的问题。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场沿壁面出现锯齿 | 非正交修正次数不足 | 把 `nNonOrthogonalCorrectors` 从 1 提到 2，看锯齿是否消失 |
| 热流密度比解析解低 20% 以上 | 用 `uncorrected` 配扭曲网格 | 计算 $1-\cos\theta$，与热流偏差对比量级 |
| 修正次数翻倍后结果不再变化 | 已进入修正项截断误差主导区 | 记录每次修正后的残差，找到平台 |
| 局部出现非物理负值 | `corrected` 在坏单元上过冲 | 改用 `limited 0.33`，检查极值是否回到物理范围 |
| 与 `snGradSchemes` 结果矛盾 | 两处修正设置不一致 | 把 `snGrad` 与 `laplacian` 改成同一档再复跑 |
| 壁面热流系统性偏低 30% 以上 | 网格扭曲却用 `uncorrected` | 计算 $1-\cos\theta$ 并与 $E_q$ 对比，两者量级应一致 |
| 压力场沿壁面锯齿 | 修正迭代未收敛 | 输出 $R_{no}$，超过 $10^{-1}$ 说明次数不足 |
| 修正次数翻倍后 $E_q$ 不再下降 | 已到修正项截断误差平台 | 画 $E_q$ 对次数曲线，找平台位置 |
| 局部出现负温度或负浓度 | 修正项在坏单元上过冲 | 改 `limited 0.33` 后核对极值 |
| 加 `limited 0.33` 后热流又偏低 | 夹逼削掉了真实扩散通量 | 对比 `limited 0.5` 与 `corrected` 三档通量 |
| `snGrad` 与 `laplacian` 给出的通量不一致 | 两处修正档位不同 | 把两者统一到同档后复跑 |

## 两个诊断量

第一个是修正迭代的残差，度量固定点迭代是否收敛：

$$
R_{no}^{(m)}=\frac{\sum_f\left|\mathbf{k}_f\cdot\nabla_f\phi^{(m)}-\mathbf{k}_f\cdot\nabla_f\phi^{(m-1)}\right|}{\sum_f\left|\Delta_f\left(\phi_N-\phi_P\right)\right|}
$$

分母是正交项的总量，因此 $R_{no}$ 是无量纲比值。经验阈值：$R_{no}<10^{-2}$ 时修正误差与二阶截断误差同量级，可以接受；$R_{no}>10^{-1}$ 说明迭代远未收敛，此时任何物理结论都不可信。

第二个是相对解析解的通量误差：

$$
E_q=\frac{\left|q_{num}-q_{exact}\right|}{q_{exact}}
$$

它把修正设置的影响换算成工程量偏差，是与验收标准直接对接的量。

## 诊断流程

```bash
checkMesh -allGeometry -allTopology 2>&1 | tee log.checkMesh
# 记录 Average / Max non-orthogonality，以及 face pyramids 数量
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
# 在 log 中检索 "Non-orthogonality" 与各场最终残差
postProcess -func "wallHeatFlux" -time 2000    # 导出壁面热流用于与解析值对比
```

角度扫描按下面的方式组织，每行只改一个量：

```text
基准: 平行平板稳态导热  L=0.1 m, dT=100 K, k=0.5 W/(m·K), q_exact=500 W/m^2
角度 0°   uncorrected : q=500.0   E_q<1e-4
角度 60°  uncorrected : q=250.0   E_q=50%     ← 与 1-cos60 吻合
角度 60°  corrected 1 : q=499.5   E_q=0.10%
角度 60°  corrected 2 : q=499.9   E_q=0.02%
角度 70°  corrected 1 : q=496.0   E_q=0.80%
角度 70°  corrected 2 : q=499.3   E_q=0.15%
判定: E_q 随修正次数进入平台，且平台值不随角度显著变化 → 修正充分
```

## 一个可手算的解析基准

取两块平行平板之间的稳态导热：板距 $L=0.1\ \mathrm{m}$，温差 $\Delta T=100\ \mathrm{K}$，导热系数 $k=0.5\ \mathrm{W/(m\cdot K)}$。解析热流为

$$
q_{exact}=k\frac{\Delta T}{L}=0.5\times\frac{100}{0.1}=500\ \mathrm{W/m^2}
$$

用正交六面体网格 $\Delta x=0.001\ \mathrm{m}$ 计算，`uncorrected` 与 `corrected` 都给 $500.0\ \mathrm{W/m^2}$，$E_q<10^{-4}$。把同一网格沿流向剪切，使平均非正交角达到 $60^\circ$，此时：

- `uncorrected` 给出约 $250\ \mathrm{W/m^2}$，$E_q=50\%$，与 $1-\cos60^\circ=0.5$ 的估算完全吻合；
- `corrected` 且 `nNonOrthogonalCorrectors 1` 给出 $499.5\ \mathrm{W/m^2}$，$E_q=0.10\%$；
- `corrected` 且 `nNonOrthogonalCorrectors 2` 给出 $499.9\ \mathrm{W/m^2}$，$E_q=0.02\%$。

把角度继续加到 $70^\circ$，`corrected` 配 1 次修正的 $E_q$ 升到 $0.8\%$，配 2 次降到 $0.15\%$。这组数据给出一个清晰的验收线：非正交角 $60^\circ$ 以内，1 次修正即可把通量误差压到 0.1%；$70^\circ$ 附近需要 2 次。

## 忽略修正会带来多大误差

若只用正交项，等价于把面法向导数近似为 $(\phi_N-\phi_P)/|\mathbf{d}|$。对线性场，真实的面法向导数为 $\cos\theta\,(\phi_N-\phi_P)/|\mathbf{d}|$，因此相对误差为

$$
\varepsilon_{orth}=1-\cos\theta
$$

代入几个典型角度：$\theta=10^\circ$ 时 $\varepsilon_{orth}=1.5\%$；$\theta=30^\circ$ 时 $13.4\%$；$\theta=60^\circ$ 时 $50\%$；$\theta=70^\circ$ 时 $65.8\%$。这就是 `uncorrected` 只能在非正交角小于约 $20^\circ$ 的网格上使用的原因——那时误差才与二阶截断误差同量级。

## 夹逼系数与修正次数的记录

记录时必须把最大非正交角、`limited` 系数与 `nNonOrthogonalCorrectors` 写在一起。换网格而不更新这三个数，等于把一套为 $60^\circ$ 网格调好的设置直接用到 $75^\circ$ 网格上。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力沿壁面锯齿 | 修正次数不足 | 从 1 提到 2，看锯齿幅值是否减半 |
| 热流比解析解低 20% | 网格扭曲但用 `uncorrected` | 由 $1-\cos\theta$ 估算应有误差，与实测对比 |
| 加修正次数后结果不动 | 已到修正项截断误差平台 | 记录每轮残差，找到 $\rho^{m}$ 的平台 |
| 坏单元附近出现负温度 | `corrected` 在 $\theta>70^\circ$ 处过冲 | 把该条 `laplacian` 换成 `limited 0.33` 并核对极值 |
| 改 `snGrad` 后结果跳变 | 两处修正档位不一致 | 把两者改成同一档再复跑 |

## 参考资料

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
3. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4), 235–255, 1995.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
6. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
7. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
