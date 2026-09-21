---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-shape-optimization-engineering-setup
title: "形状优化：工程设置与参数选择"
summary: "给出形状优化的落地配置：设计变量数与幅值上下界、有限差分步长相对几何容差的量级下限、网格变形与重网格的切换条件、SQP 收敛设置与 p-norm 应力约束取值。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "形状优化"
  - "工程设置与参数选择"
  - "有限差分步长"
  - "p-norm 应力约束"
seo:
  title: "形状优化：工程设置与参数选择"
  description: "给出形状优化的落地配置：设计变量数与幅值上下界、有限差分步长相对几何容差的量级下限、网格变形与重网格的切换条件、SQP 收敛设置与 p-norm 应力约束取值。"
  keywords:
    - "形状优化"
    - "工程设置与参数选择"
    - "网格变形"
    - "SQP"
    - "应力聚合"
---

# 形状优化：工程设置与参数选择

形状优化的工程难点不在算法而在接口：设计变量、网格变形与灵敏度三者的容差必须相互匹配，任一处量级错配都会让优化停在一个假的收敛点。本文给出一套可直接复用的配置，以 12 个 Hicks–Henne 变量的二维问题为例。

## 变量数与幅值上下界

边界采样 200 点、鼓包 12 个时变量数为 12，每个幅值限制在 ±1.0 mm。上限过大会让网格在一次迭代内畸变，下限过小则最优解被截断在边界上。经验规则：单次迭代的边界法向位移不超过局部网格边长的 50%；网格边长 1.5 mm 时单步位移上限 0.75 mm。

## 有限差分步长有硬下限

校验形状导数时，差分步长必须显著大于几何与网格的数值噪声。CAD 与网格节点通常按 $10^{-6}$ m（1 μm）存储，若取相对步长 $10^{-6}$，对 1 mm 幅值只有 1 nm，完全淹没在几何舍入里。正确取法是绝对步长 $10^{-5}$ m（10 μm）：

$$ \Delta a \ge 10\,\epsilon_{geo},\qquad \epsilon_{geo}=10^{-6}\ \mathrm{m} $$

这样相对误差可控制在 $10^{-4}$ 内；若误差随步长减小反而增大，就是舍入噪声主导的直接证据。

## 网格变形与重网格的切换

RBF 变形在边界位移小于网格边长时质量最好。当最小雅可比降到 0.3 以下，或最大单元扭曲超过 60°，应切换到重网格。重网格会引入插值误差，需把目标与约束映射到新网格后再继续，且每 5 次重网格要复算一次梯度以确认导数仍然自洽。

## SQP 收敛设置与量纲缩放

SQP 子问题用 BFGS 更新 Hessian。收敛容差取：梯度范数 $10^{-4}$、约束违反 $10^{-6}$、变量变化 $10^{-5}$、最大迭代 50。目标与约束量级相差超过 $10^{3}$ 时必须归一化，否则 Hessian 更新失真：

$$ \tilde{f}=\frac{f-f_{ref}}{s_f},\qquad \tilde{g}_i=\frac{g_i}{s_{g,i}} $$

## 应力约束用 p-norm 聚合

面积约束 $\int_\Gamma n\,ds \le A_0$ 线性可分离，直接给解析梯度。应力约束不可分离，用 p-norm 聚合逼近最大值：

$$ \sigma_{PN}=\left(\sum_{e=1}^{N_e}\sigma_e^{p}\right)^{1/p}\approx\max_e\sigma_e $$

$p=8$ 时聚合值对最大应力的高估在 5% 以内；$p$ 再大会让梯度出现数值溢出。$N_e=2\times10^{4}$ 个单元、$\sigma_e$ 量级 100 MPa 时，需先把应力按 100 MPa 归一化再求 $p$ 次幂。

## 参数表

| 参数 | 取值 | 说明 |
|---|---|---|
| 鼓包数 | 12 | 200 点边界采样 |
| 幅值上限 | ±1.0 mm | 单步不超 0.75 mm |
| 网格边长 | 1.5 mm | 二维壳单元 |
| 最小雅可比阈值 | 0.30 | 低于则重网格 |
| 差分步长 | $10^{-5}$ m | 大于几何容差 10 倍 |
| 梯度容差 | $10^{-4}$ | SQP 收敛 |
| 约束容差 | $10^{-6}$ | 面积与应力约束 |
| 最大迭代 | 50 | 含 3 次重启 |
| 应力聚合阶数 | $p=8$ | 高估不超过 5% |

```python
from scipy.optimize import minimize
cfg = dict(nb=12, amp=1.0e-3, h=1.5e-3, jac_min=0.30,
           fd_step=1e-5, gtol=1e-4, ctol=1e-6, maxiter=50, pnorm=8)

def obj(a):
    X = deform(mesh, hicks_henne(a, cfg["nb"], cfg["amp"]))
    if min_jacobian(X) < cfg["jac_min"]:
        X = remesh(X)                      # 畸变超限则重网格
    return compliance(X)

res = minimize(obj, a0, method="SLSQP",
               bounds=[(-cfg["amp"], cfg["amp"])] * cfg["nb"],
               constraints=[{"type": "ineq", "fun": area_con}],
               options=dict(ftol=cfg["gtol"], maxiter=cfg["maxiter"]))
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 梯度校验误差 30% | 差分步长小于几何容差 | 步长从 $10^{-6}$ 提到 $10^{-5}$ m |
| 迭代 3 次后网格畸变 | 幅值上限过大 | 单步位移限制到 0.75 mm |
| 目标在重网格后跳变 8% | 未做场插值 | 检查插值前后积分量 |
| 优化停在变量边界 | 上限过小 | 放宽到 ±1.0 mm |
| SQP 不收敛 | 目标与约束量级差 $10^{3}$ 以上 | 归一化后重跑 |
| p-norm 聚合值比最大应力低 | $p$ 过小 | $p$ 从 4 提到 8 |

## 参考文献

1. Haftka R.T., Grandhi R.V., "Structural shape optimization—a survey," *Computer Methods in Applied Mechanics and Engineering*, 57, 1986.
2. Vanderplaats G.N., *Numerical Optimization Techniques for Engineering Design: With Applications*, McGraw-Hill, 1984.
3. Bletzinger K.-U., Ramm E., "Structural optimization and form finding of light weight structures," *Computers & Structures*, 79, 2001.
4. Choi K.K., Kim N.H., *Structural Sensitivity Analysis and Optimization 1: Linear Systems*, Springer, 2005.
5. Martins J.R.R.A., Ning A., *Engineering Design Optimization*, Cambridge University Press, 2021.
