---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-newton-diagnosis-validation
title: "Newton 非线性求解：结果诊断与可信度验证"
summary: "用有限差分逐列核验雅可比、从残差序列估计实际收敛阶以区分二次与线性、识别三类假收敛、统计步长拒绝与活动集切换，并用非线性制造解与 Picard 对照验证收敛质量。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "Newton 非线性求解"
  - "结果诊断与可信度验证"
  - "雅可比核验"
  - "收敛阶估计"
seo:
  title: "Newton 非线性求解：结果诊断与可信度验证"
  description: "用有限差分逐列核验雅可比、从残差序列估计实际收敛阶以区分二次与线性、识别三类假收敛、统计步长拒绝与活动集切换，并用非线性制造解与 Picard 对照验证收敛质量。"
  keywords:
    - "Newton 非线性求解"
    - "结果诊断与可信度验证"
    - "雅可比核验"
    - "收敛阶估计"
    - "假收敛"
---

# Newton 非线性求解：结果诊断与可信度验证

Newton 收敛了不代表收敛对了。残差降到 $10^{-10}$ 却解错的三种情形都很常见：雅可比本身有错、残差尺度掩盖了某个分量、或者收敛到的是非物理解。可信度验证因此要按固定顺序做三件事——核验雅可比、从残差序列估计真实收敛阶、用非线性制造解与独立方法交叉对照。以下数据基于一个三维弹塑性模型（$n=2.4\times10^6$）与一维非线性模型问题。

## 先用有限差分把雅可比单独核验

雅可比是 Newton 的发动机，必须独立验证而不是相信解析推导。对随机方向 $\mathbf v$，用中心差分比较

$$
J\mathbf v\approx\frac{R(\mathbf u+\epsilon\mathbf v)-R(\mathbf u-\epsilon\mathbf v)}{2\epsilon},
\qquad
\epsilon=1.49\times10^{-8}\cdot\max(|\mathbf u_j|,u_{\text{ref}}),
$$

其中 $1.49\times10^{-8}=\sqrt{\epsilon_{\text{mach}}}$ 是使截断误差与舍入误差平衡的最优步长。判据是逐列相对误差

$$
\eta_{\text{col}}=\frac{\|J_{\text{ana}}\mathbf v-J_{\text{fd}}\mathbf v\|_2}{\|J_{\text{ana}}\mathbf v\|_2}
$$

应当低于 $10^{-6}$。实测该模型 2.4e6 列中最大 $\eta_{\text{col}}=3.2\times10^{-7}$，属于健康；若某一列跳到 $4.1\times10^{-2}$，它对应的自由度就是错误位置——弹塑性问题里几乎总是本构导数漏了某一项。**核验必须逐列做而不是整体做**，整体范数会把单列的错误平均掉。

```python
import numpy as np

def check_jacobian(R, Jv, u, ncol=20, eps0=1.49e-8):
    """R: 残差函数; Jv: 解析雅可比乘向量; u: 当前状态"""
    rng = np.random.default_rng(0)
    worst = 0.0
    for _ in range(ncol):
        v = rng.standard_normal(u.shape)
        eps = eps0 * max(np.abs(u).max(), 1.0)
        fd = (R(u + eps * v) - R(u - eps * v)) / (2 * eps)
        ana = Jv(u, v)
        eta = np.linalg.norm(ana - fd) / np.linalg.norm(ana)
        worst = max(worst, eta)
    print(f"max relative column error = {worst:.2e}")  # 期望 < 1e-6
    return worst
```

## 从残差序列估计收敛阶

收敛阶不需要知道真解，直接用残差序列估计：

$$
p\approx\frac{\ln(\|\mathbf R_{k+1}\|/\|\mathbf R_k\|)}{\ln(\|\mathbf R_k\|/\|\mathbf R_{k-1}\|)} .
$$

把实测残差 $1.0\times10^{-1}\to1.1\times10^{-2}\to8.7\times10^{-5}\to3.2\times10^{-9}$ 代入，$p=\ln(7.9\times10^{-3})/\ln(0.11)=2.19$，确认是二次收敛。对照一个雅可比不精确的算例，残差为 $1.0\times10^{-1}\to4.0\times10^{-2}\to1.6\times10^{-2}\to6.4\times10^{-3}$，得 $p=1.00$，是纯线性收敛。**判据：$p>1.7$ 才算二次收敛；$1.2<p<1.7$ 属超线性，说明雅可比基本正确但线性子问题解得过松；$p\le1.2$ 说明雅可比或残差定义不一致。**

## 假收敛的三种形态

第一种是雅可比错误但残差仍下降——因为残差下降只需要方向大致可用，而错方向在小残差区会停住，表现为 $p\approx1$ 且在 $10^{-6}$ 附近拉平。第二种是残差尺度掩盖：结构问题里力残差按牛顿计、位移增量按毫米计，若不做归一化，大量纲分量会主导 $\|\mathbf R\|$，导致某些自由度其实远未收敛却整体达标。第三种是收敛到非物理解，例如接触问题中所有接触点被判为分离，残差确实很小，但整体刚度缺失、位移场明显异常。三种形态的区分方法是分别检查收敛阶、分分量残差、以及物理约束（能量、接触力非负、体积守恒）。

## 步长拒绝与活动集切换的诊断

线搜索的行为本身就是诊断量。健康配置下 $\alpha_k$ 几乎恒为 1，拒绝次数为 0；实测该模型 20 个载荷步共 104 次 Newton 迭代、拒绝 3 次（$\alpha$ 分别取 0.5、0.25、0.5），均在首次屈服的载荷步上，属正常。若拒绝次数超过总迭代数的 20%，或 $\alpha$ 连续缩到 $10^{-4}$ 以下，说明 Newton 方向不可用。活动集切换同样要看次数：接触问题中每个载荷步的活动集变化若超过 5 次，残差会呈锯齿状，此时应改用光滑化接触模型或信赖域，而不是继续加阻尼。

## 与解析解和 Picard 的对照

非线性问题也能构造离散误差可控的制造解。取 $u=\sin(\pi x)$ 代入 $-u''+u^3=f$，得源项

$$
f(x)=\pi^2\sin(\pi x)+\sin^3(\pi x).
$$

用它验证整条链路：$h=1/100$ 时误差 $2.8\times10^{-3}$，$h=1/200$ 时 $7.0\times10^{-4}$，比值 $4.00$，与二阶格式理论值吻合，说明 Newton 解与离散格式都正确。第二重对照是同一问题用 Picard 迭代求解：Picard 需要 34 次迭代（压缩因子约 0.55）而 Newton 只需 5 次。若实测 Newton 的迭代数接近 Picard，几乎可以断定雅可比不精确——这正是把"收敛快慢"当作雅可比正确性的间接证据。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差降到 $10^{-6}$ 后拉平，$p\approx1$ | 雅可比某列有误或本构导数缺项 | 逐列有限差分核验，定位相对误差 $10^{-2}$ 的那一列 |
| 整体残差达标但某自由度位移异常 | 残差未按分量归一化 | 打印分分量残差与位移增量，检查量纲跨度 |
| Newton 迭代数与 Picard 接近 | 雅可比精度不足 | 用有限差分核验并对比 $p$ 值 |
| 每个载荷步活动集切换超过 5 次 | 接触或相变状态反复翻转 | 统计切换次数，改用信赖域或光滑化模型 |

## 参考

1. Kelley, C. T., *Iterative Methods for Linear and Nonlinear Equations*, SIAM, 1995.
2. Dennis, J. E., Schnabel, R. B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
3. Deuflhard, P., *Newton Methods for Nonlinear Problems: Affine Invariance and Adaptive Algorithms*, Springer, 2004.
4. Higham, N. J., *Accuracy and Stability of Numerical Algorithms*, 2nd ed., SIAM, 2002.
5. Knoll, D. A., Keyes, D. E., "Jacobian-free Newton–Krylov methods: a survey of approaches and applications", *Journal of Computational Physics*, 193(2), 2004.
6. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
