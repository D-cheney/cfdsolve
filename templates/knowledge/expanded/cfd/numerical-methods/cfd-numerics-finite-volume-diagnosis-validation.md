---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-volume-diagnosis-validation
title: "有限体积法：结果诊断与可信度验证"
summary: "有限体积的守恒必须被验证而非假设；本文给出面通量守恒误差、三套网格的网格收敛指数 GCI 的完整手算过程、非正交性与歪斜度阈值，以及顶盖方腔基准对照。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "有限体积法"
  - "结果诊断与可信度验证"
  - "网格收敛指数"
  - "面通量守恒"
seo:
  title: "有限体积法：结果诊断与可信度验证"
  description: "有限体积的守恒必须被验证而非假设；本文给出面通量守恒误差、三套网格的网格收敛指数 GCI 的完整手算过程、非正交性与歪斜度阈值，以及顶盖方腔基准对照。"
  keywords:
    - "有限体积法"
    - "结果诊断与可信度验证"
    - "网格收敛指数"
    - "面通量守恒"
    - "GCI"
---

# 有限体积法：结果诊断与可信度验证

有限体积的"守恒"必须被验证，而不能被假设。工程上最有说服力的三个数字是：面通量守恒误差、三套网格上的网格收敛指数（GCI）和由此得到的不确定度区间。本文给出这三者的计算方法、阈值与判错流程。

## 一、面通量守恒误差

对每个单元逐个边界面累加质量流量，定义相对守恒误差

$$
\epsilon_{\mathrm{cons}}=\frac{\left|\sum_f \dot m_f\right|}{\sum_f\left|\dot m_f\right|}
$$

收敛解中 $\epsilon_{\mathrm{cons}}$ 应低于 $10^{-12}$，即机器精度量级；内部面两侧的流量必须严格等值反号。若 $\epsilon_{\mathrm{cons}}$ 停在 $10^{-4}$，几乎都出在边界条件实现：入口/出口面被重复计入，或法向符号与通量符号约定相反。这类误差不会随网格加密而下降，是结构性缺陷的典型特征。

## 二、网格收敛指数 GCI

用三套按比例 $r$ 加密的网格，先由 Richardson 外推求观测阶，再折算不确定度：

$$
p=\frac{1}{\ln r}\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|,\qquad e_a=\frac{\phi_2-\phi_1}{\phi_1},\qquad \mathrm{GCI}_{\mathrm{fine}}=\frac{F_s\left|e_a\right|}{r^{p}-1}
$$

安全因子 $F_s$ 在三套网格时取 1.25，两套网格时取 3.0。取阻力系数 $\phi_1=0.3125$（$1.0\times10^{6}$ 单元）、$\phi_2=0.3102$（$3.375\times10^{6}$）、$\phi_3=0.3093$（$1.14\times10^{7}$），$r=1.5$：

- 相邻差之比 $|(-9.0\times10^{-4})/(-2.3\times10^{-3})|=0.3913$，$\ln 0.3913=-0.9383$，$\ln 1.5=0.4055$，得 $p=2.31$。
- 相对误差 $e_a=(0.3093-0.3102)/0.3102=-2.90\times10^{-3}$。
- $1.5^{2.31}=2.555$，于是 $\mathrm{GCI}=1.25\times2.90\times10^{-3}/(2.555-1)=3.63\times10^{-3}/1.555=2.33\times10^{-3}$。

即最细网格结果的不确定度约为 $\pm0.23\%$。若 $p$ 落在名义阶数（如二阶格式的 2）之外太远，说明还没进入渐近区，应补一套更细网格而不是直接采信 GCI。

## 三、非正交性与歪斜度

OpenFOAM 的 `checkMesh` 直接给出两个几何指标：最大非正交角（面法向与单元中心连线夹角）与最大歪斜度。工程阈值为最大非正交角小于 70°、最大歪斜度小于 4、最小面权重大于 0.05。非正交角超过 70° 时，显式非正交修正的迭代次数需从 1 提到 2～3，否则残差会停在平台不再下降。

## 四、GCI 计算脚本

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

## 五、失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 全局守恒误差停在 $10^{-4}$ | 边界通量符号反了或被重复计入 | 逐个边界面积分流量，与设定值对差 |
| 阻力系数随加密非单调 | 多类误差同时变化，或未进入渐近区 | 保持格式一致，补一套中间网格再算 $p$ |
| 残差降到 $10^{-6}$ 但目标量仍漂移 | 残差平不代表面通量平衡 | 打印目标量随迭代的历史，看最后 200 步是否平直 |
| 加密后 GCI 反而变大 | 格式在细网格上退化，限制器主导误差 | 关闭限制器重算同一组网格，比较 $p$ |
| 局部出现负浓度或负温度 | 对流格式无界，或源项线性化破坏对角占优 | 换一阶迎风重算，看是否仍越界 |
| 非正交修正次数加倍后残差才下降 | 网格最大非正交角超过 70° | 用 `checkMesh` 输出非正交角分布，定位最差单元 |

## 六、与基准解对照

二维顶盖驱动方腔是有限体积最常用的公开基准。取 $Re=1000$（$U_{\text{lid}}=1$ m/s、腔宽 1 m、$\nu=1\times10^{-3}$ m²/s），Ghia 等（1982）给出的竖直中心线（$x=0.5$）在 $y=0.5$ 处水平速度为 $u=-0.3829$。用 $256\times256$ 网格、二阶迎风配限制器计算，该点速度应落在 $-0.383\pm0.008$（约 2%）内。若偏差超过 5%，先检查面通量守恒误差是否达标，再检查非正交修正；因为这两项都会在光滑解上留下系统性偏差，而不是随机噪声。

## 七、主要文献

1. Roache P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
2. Celik I. B., Ghia U., Roache P. J., Freitas C. J., Coleman H., Raad P. E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *ASME Journal of Fluids Engineering*, 130(7), 078001, 2008.
3. Ghia U., Ghia K. N., Shin C. T., "High-Re Solutions for Incompressible Flow Using the Navier-Stokes Equations and a Multigrid Method", *Journal of Computational Physics*, 48(3), 387-411, 1982.
4. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD Thesis, Imperial College London, 1996.
