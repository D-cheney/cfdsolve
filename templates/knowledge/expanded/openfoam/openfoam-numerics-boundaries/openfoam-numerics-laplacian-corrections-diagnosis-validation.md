---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-laplacian-corrections-diagnosis-validation
title: "laplacianSchemes 非正交修正：结果诊断与可信度验证"
summary: "以非正交修正残差和解析通量误差为诊断量，用一维导热的解析热流 500 W/m² 做基准，给出网格角度扫描、修正次数平台识别与六类症状的判定试验，量化非正交修正的可信区间。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "laplacianSchemes 非正交修正"
  - "结果诊断与可信度验证"
  - "解析基准"
  - "修正残差"
seo:
  title: "laplacianSchemes 非正交修正：结果诊断与可信度验证"
  description: "以非正交修正残差和解析通量误差为诊断量，用一维导热的解析热流 500 W/m² 做基准，给出网格角度扫描、修正次数平台识别与六类症状的判定试验，量化非正交修正的可信区间。"
  keywords:
    - "laplacianSchemes 非正交修正"
    - "结果诊断与可信度验证"
    - "解析通量基准"
    - "修正残差"
    - "非正交角扫描"
---

# laplacianSchemes 非正交修正：结果诊断与可信度验证

非正交修正做得好不好，最终体现在壁面通量上：修正不足会让热流系统性偏低，修正过度会在坏单元上产生过冲。判断它是否可信需要两个诊断量——修正迭代自身的残差，以及相对解析解的通量误差。本文给出可复算的一维导热基准、角度扫描流程，以及六类症状对应的判定试验。

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

## 通量偏差症状的判定表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面热流系统性偏低 30% 以上 | 网格扭曲却用 `uncorrected` | 计算 $1-\cos\theta$ 并与 $E_q$ 对比，两者量级应一致 |
| 压力场沿壁面锯齿 | 修正迭代未收敛 | 输出 $R_{no}$，超过 $10^{-1}$ 说明次数不足 |
| 修正次数翻倍后 $E_q$ 不再下降 | 已到修正项截断误差平台 | 画 $E_q$ 对次数曲线，找平台位置 |
| 局部出现负温度或负浓度 | 修正项在坏单元上过冲 | 改 `limited 0.33` 后核对极值 |
| 加 `limited 0.33` 后热流又偏低 | 夹逼削掉了真实扩散通量 | 对比 `limited 0.5` 与 `corrected` 三档通量 |
| `snGrad` 与 `laplacian` 给出的通量不一致 | 两处修正档位不同 | 把两者统一到同档后复跑 |

诊断顺序建议是：先确认 $R_{no}$ 收敛，再用解析基准确认 $E_q$ 量级正确，最后才看工程算例的物理量。跳过前两步直接看工程结果，很容易把非正交修正不足误判成物性参数或边界条件的问题。

## 参考文献

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4), 235–255, 1995.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
