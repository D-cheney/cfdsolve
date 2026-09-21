---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-shape-optimization-diagnosis-validation
title: "形状优化：结果诊断与可信度验证"
summary: "以应力集中系数解析对照、形状导数有限差分校核、缺口应力网格收敛比与边界高频分量占比四组证据审查形状优化结果，给出各自阈值与一次可核对的手算。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "形状优化"
  - "结果诊断与可信度验证"
  - "应力集中系数"
  - "形状导数校核"
seo:
  title: "形状优化：结果诊断与可信度验证"
  description: "以应力集中系数解析对照、形状导数有限差分校核、缺口应力网格收敛比与边界高频分量占比四组证据审查形状优化结果，给出各自阈值与一次可核对的手算。"
  keywords:
    - "形状优化"
    - "结果诊断与可信度验证"
    - "应力集中系数"
    - "形状导数"
    - "网格收敛"
---

# 形状优化：结果诊断与可信度验证

形状优化的输出是一条新边界曲线，验证它要把边界几何、灵敏度与应力场三方面证据对齐。仅凭目标函数下降不足以说明结果可信，因为下降可能来自网格退化或约束松弛。

## 用应力集中系数做解析对照

无限大板中心圆孔受单向拉伸时理论应力集中系数 $K_t=3.0$。名义应力 100 MPa 时孔边峰值 300 MPa。形状优化把圆孔改为长短轴比 0.5 的椭圆并加过渡圆角后，$K_t$ 降到约 1.42，峰值 142 MPa，降幅 $(300-142)/300=52.7\%$。

$$ K_t=\frac{\sigma_{\max}}{\sigma_{nom}},\qquad \sigma_{nom}=\frac{F}{Wt} $$

$W$ 为板宽、$t$ 为板厚。若优化后 $K_t$ 低于 1.0，说明名义应力取错或载荷未按新截面更新。

## 形状导数的有限差分校核

把解析形状导数与中心差分比较：

$$ \epsilon_{rel}=\frac{\left|\dot{J}_{adj}-\dfrac{J(a+h)-J(a-h)}{2h}\right|}{\left|\dot{J}_{adj}\right|} $$

$h=10^{-5}$ m 时相对误差应低于 $10^{-4}$。若误差在 $10^{-1}$ 量级且随 $h$ 减小而增大，是几何舍入主导；若随 $h$ 增大而增大，是截断误差主导。两者对应的修正方向完全相反，不能笼统地"调小步长"。

## 应力对网格的收敛比位移慢

位移误差为 $O(h^{2})$，而缺口处应力因奇异只有 $O(h^{0.5})$。同一缺口用 0.5 mm、0.25 mm、0.125 mm 网格算得峰值应力 148.2、145.1、143.6 MPa，差分比

$$ \frac{\sigma_1-\sigma_2}{\sigma_2-\sigma_3}=\frac{148.2-145.1}{145.1-143.6}=2.07 $$

接近 2 而不是 4，正是低阶收敛的表现。因此以应力为目标的形状优化必须做网格收敛并外推，不能只看单套网格。

## 边界振荡要用频谱判定

参数化基函数过密时，最优解会出现波长约等于网格边长的锯齿。把边界位移做离散 Fourier 变换，若高频分量幅值超过总幅值的 10%，说明噪声主导，应减少鼓包数或加 Tikhonov 正则：

$$ J_{reg}=J+\eta\left\lVert \mathbf{B}\mathbf{a}\right\rVert_2^{2} $$

$\eta$ 取 $10^{-4}$ 量级，可用 L 曲线法确定：把解范数与残差范数画成双对数曲线，取拐点处的 $\eta$。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $K_t$ 优化后仍为 3.0 | 设计变量未作用于孔边法向 | 检查鼓包是否覆盖孔周 |
| 差分误差随 $h$ 减小而增大 | 步长小于几何容差 $10^{-6}$ m | 用 $h=10^{-5}$ m 重算 |
| 峰值应力三套网格差 3% 以上 | 缺口奇异未收敛 | 加密到 0.125 mm 并外推 |
| 边界出现短波锯齿 | 鼓包过密 | FFT 查高频占比是否超 10% |
| 目标下降但质量增加 20% | 面积约束未激活 | 检查约束违反是否小于 $10^{-6}$ |
| 改善量在重网格后消失 | 目标随网格变化 | 固定网格后再优化一次 |

```text
形状优化可信度检查
1) K_t = sigma_max / (F / (W*t))                       # 与 3.0 对照
2) h = 1e-5; fd = (J(a+h) - J(a-h)) / (2*h)
   rel_err = |adj - fd| / |adj|                        # 判据 < 1e-4
3) for h in [0.5, 0.25, 0.125] mm: sigma_peak(h)
   ratio = (s1 - s2) / (s2 - s3)                       # 缺口处应接近 2
4) FFT(a); hf = sum(|A_k|, k > 0.1*N) / sum(|A_k|)     # 判据 < 0.10
```

## 参考文献

1. Jameson A., "Aerodynamic design via control theory," *Journal of Scientific Computing*, 3, 1988.
2. Giles M.B., Pierce N.A., "An introduction to the adjoint approach to design," *Flow, Turbulence and Combustion*, 65, 2000.
3. Mohammadi B., Pironneau O., *Applied Shape Optimization for Fluids*, Oxford University Press, 2001.
4. Haftka R.T., Adelman H.M., "Sensitivity analysis of discrete structural systems," *AIAA Journal*, 24, 1985.
5. Dems K., Mróz Z., "Variational approach by means of adjoint systems to structural optimization and sensitivity analysis," *International Journal of Solids and Structures*, 20, 1984.
