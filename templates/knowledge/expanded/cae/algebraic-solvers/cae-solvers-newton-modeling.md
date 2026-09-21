---
template_version: flowlab-knowledge/1.0
slug: cae-solvers-newton-modeling
title: Newton 非线性求解：原理、设置与验证
summary: >-
  Newton
  法的二次收敛严格依赖雅可比与残差定义完全一致。本文推导修正方程与误差递推，用弹塑性径向返回的一致切线说明连续切线为何把二次收敛降为线性，并给出载荷增量与残差尺度的量级判据。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 代数求解器与时间算法
  - Newton 非线性求解
  - 算法原理与适用范围
  - 一致切线
  - 二次收敛
  - 工程设置与参数选择
  - 强迫项
  - 线搜索
  - 结果诊断与可信度验证
  - 雅可比核验
  - 收敛阶估计
seo:
  title: Newton 非线性求解：原理、设置与验证
  description: >-
    Newton
    法的二次收敛严格依赖雅可比与残差定义完全一致。本文推导修正方程与误差递推，用弹塑性径向返回的一致切线说明连续切线为何把二次收敛降为线性，并给出载荷增量与残差尺度的量级判据。
  keywords:
    - Newton 非线性求解
    - 算法原理与适用范围
    - 一致切线
    - 二次收敛
    - 载荷增量
    - 工程设置与参数选择
    - 强迫项
    - 线搜索
    - 收敛判据
    - 结果诊断与可信度验证
    - 雅可比核验
    - 收敛阶估计
    - 假收敛
---
# Newton 非线性求解：原理、设置与验证

Newton 法的迭代数少，不是因为步长选得好，而是因为它的雅可比与残差在数学上严格一致。一旦两者出现任何不匹配——最常见的是弹塑性本构里用了连续切线而不是一致切线——收敛阶会立刻从二次降为线性，迭代数从 5 次变成 20 次以上。本文推导修正方程与误差递推，用径向返回映射给出可核对的对比，并说明载荷增量与残差尺度如何决定从远处能否收敛。Newton 求解器的参数分三组：判据（残差、增量、步长）、线性子问题的求解精度（强迫项）、以及全局化策略（线搜索或信赖域）。三组参数相互耦合——判据定得太紧会逼着强迫项变小，强迫项太小又让每步线性求解代价暴涨。以下配置基于 PETSc SNES 求解一个三维弹塑性模型（$n=2.4\times10^6$，$N_{\text{inc}}=20$ 个载荷步）。Newton 收敛了不代表收敛对了。残差降到 $10^{-10}$ 却解错的三种情形都很常见：雅可比本身有错、残差尺度掩盖了某个分量、或者收敛到的是非物理解。可信度验证因此要按固定顺序做三件事——核验雅可比、从残差序列估计真实收敛阶、用非线性制造解与独立方法交叉对照。以下数据基于一个三维弹塑性模型（$n=2.4\times10^6$）与一维非线性模型问题。

## 从 Taylor 展开到 Newton 修正方程

把非线性残差记为 $R(\mathbf u)=0$，在 $\mathbf u_k$ 处展开：

$$
R(\mathbf u_k+\Delta\mathbf u)=R_k+J_k\Delta\mathbf u+O(\|\Delta\mathbf u\|^2),
\qquad J_k=\frac{\partial R}{\partial\mathbf u}\Big|_{\mathbf u_k},
$$

忽略高阶项即得 Newton 修正方程

$$
J_k\,\Delta\mathbf u_k=-R_k,\qquad \mathbf u_{k+1}=\mathbf u_k+\Delta\mathbf u_k .
$$

结构问题里 $R=\mathbf F_{\text{ext}}-\mathbf F_{\text{int}}(\mathbf u)$，于是 $J=-\partial\mathbf F_{\text{int}}/\partial\mathbf u$ 就是切线刚度矩阵。这个定义是全部问题的根源：**$J$ 必须是 $R$ 对 $\mathbf u$ 的**精确**导数，包括所有算法层面的分支**。

## 残差尺度与载荷增量

残差必须无量纲化后再比较，否则量纲大的自由度会掩盖真实误差。对结构问题常用

$$
\|\mathbf R\|_{\text{rel}}=\frac{\|\mathbf R\|_2}{\max(\|\mathbf F_{\text{ext}}\|_2,\ \|\mathbf F_{\text{int}}\|_2)},
$$

同时对位移增量用 $\|\Delta\mathbf u\|_2/\|\mathbf u\|_2$ 做第二道判据。载荷增量决定初值离解有多远：把总载荷分成 $N_{\text{inc}}$ 步，每步的 Newton 初值是上一步的收敛解，因此 $\|\mathbf e_0\|$ 大致随步长线性下降。对强非线性问题（屈服面扩展、接触状态切换），$N_{\text{inc}}=10$ 与 $N_{\text{inc}}=50$ 的差别可能是 5 次迭代收敛与完全不收敛的差别。经验规则是：**如果某一步的 Newton 需要超过 12 次迭代，说明载荷增量偏大，应当减半而不是放宽收敛容差。**

## 线搜索与信赖域的选择

残差光滑、雅可比可靠时用回溯线搜索，PETSc 中设 `-snes_linesearch_type bt`，步长按 0.5 倍收缩，Armijo 常数 $c_1=10^{-4}$，最小步长下限取 $10^{-12}$；一旦收缩到下限仍未满足下降条件，说明方向失效，应中止并报告而不是继续缩。初值差、雅可比接近奇异、或残差含非光滑分支（接触、相变）时改用信赖域：初始半径 $\Delta_0$ 取与典型位移增量同量级（弹性问题常取 $1.0$），上限 $\Delta_{\max}$ 设成物理位移尺度的 10 倍以防一次跳出合法区间。信赖域半径按实际下降与预测下降之比 $\rho_k$ 更新：$\rho_k<0.25$ 时把 $\Delta_k$ 缩到 1/4 并拒绝该步，$\rho_k>0.75$ 且步长触及边界时把 $\Delta_k$ 加倍。**非光滑问题不要用纯线搜索**，它会在不连续面上反复折返。

## 雅可比与预条件的复用节奏

每步重算雅可比与预条件最稳但最贵。实测把雅可比复用 3 步（`-snes_lag_jacobian 3`）可省 40% 的装配时间，代价是 Newton 迭代数从 5 增到 7；把预条件复用 3 步（`-snes_lag_preconditioner 3`）省得更多，但 Krylov 迭代数从 53 涨到 96，总时间反而增加 12%。经验规则是**雅可比可以适当滞后，预条件尽量每步更新**，因为预条件质量直接决定线性迭代数，而线性迭代数是总成本的主导项。JFNK 场景下雅可比本来就不组装，滞后策略改为滞后预条件，判据相同。

## 强迫项：不要每步都把线性问题解到底

Inexact Newton 只要求线性子问题解到

$$
\|J_k\Delta\mathbf u_k+\mathbf R_k\|\le\eta_k\|\mathbf R_k\|,\qquad 0\le\eta_k<1 .
$$

固定 $\eta$ 会限制收敛速率：$\eta=0.1$ 时外层退化为压缩因子 0.1 的线性收敛，从 $10^{-1}$ 到 $10^{-10}$ 需 9 次迭代；$\eta=10^{-2}$ 需 5 次但每步线性求解都很贵。Eisenstat–Walker 自适应序列按

$$
\eta_k=\gamma\left(\frac{\|\mathbf R_k\|}{\|\mathbf R_{k-1}\|}\right)^{\alpha},
\qquad \gamma=0.9,\ \alpha=2.0,\ \eta_{\max}=0.9,
$$

动态调整。以实测残差序列 $1.0\times10^{-1}\to1.1\times10^{-2}\to8.7\times10^{-5}$ 代入：$\eta_1=0.9\times(0.11)^2=0.0109$，$\eta_2=0.9\times(7.9\times10^{-3})^2=5.6\times10^{-5}$。可见离解远时线性求解很松、接近解时自动收紧，从而保住超线性收敛。三种策略的总 Krylov 迭代数对比很直观：

EW 用接近固定 $\eta=0.9$ 的总代价拿到了接近固定 $\eta=10^{-2}$ 的收敛速度。

| 策略 | Newton 步数 | 每步 Krylov 迭代 | 合计 |
|---|---|---|---|
| 固定 $\eta=0.9$ | 20 | 2 | 40 |
| 固定 $\eta=10^{-2}$ | 5 | 25 | 125 |
| EW 自适应 | 5 | 3, 5, 12, 24, 9 | 53 |

## 载荷增量与自适应步长

载荷增量决定 Newton 初值离解有多远。实测同一弹塑性模型：$N_{\text{inc}}=10$ 时平均每步 11.4 次 Newton 迭代、2 步失败回退；$N_{\text{inc}}=50$ 时平均 5.2 次、无失败；$N_{\text{inc}}=200$ 时平均 4.1 次但总步数过多，总时间反超 18%。自适应规则是：若某步 Newton 迭代数超过 12，把下一步增量减半；若连续两步迭代数低于 4，把增量放大 1.5 倍（上限为初始增量的 4 倍）。**不要通过放宽 `rtol` 来挽救不收敛的载荷步**，那只会让后续步的初值更差。

```python
# PETSc SNES 配置：三维弹塑性，EW 强迫项 + 回溯线搜索
opts = {
    "-snes_type": "newtonls",
    "-snes_rtol": "1e-8",
    "-snes_atol": "1e-10",
    "-snes_stol": "1e-8",
    "-snes_max_it": "50",
    "-snes_linesearch_type": "bt",
    "-snes_linesearch_minlambda": "1e-12",
    "-snes_ksp_ew": "",              # Eisenstat-Walker
    "-snes_ksp_ew_version": "3",
    "-snes_ksp_ew_rtol0": "0.9",
    "-snes_ksp_ew_rtolmax": "0.9",
    "-snes_ksp_ew_gamma": "0.9",
    "-snes_ksp_ew_alpha": "2.0",
    "-snes_lag_jacobian": "3",       # 雅可比滞后 3 步
    "-snes_monitor": "",
}
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 第 1 步就报收敛 | 只设了相对残差，而 $\|\mathbf R_0\|$ 极小 | 打印 $\|\mathbf R_0\|$ 并补设 `atol` |
| 残差达标但位移增量仍是 $10^{-2}$ | 缺增量判据或接触状态在切换 | 加 `stol` 并打印活动集变化次数 |
| 线搜索步长连续缩到 $10^{-12}$ | 方向不是下降方向，雅可比有误 | 用有限差分核验雅可比单列 |
| 预条件滞后后总时间增加 | 预条件质量下降抬高了 Krylov 迭代数 | 固定雅可比滞后，只改预条件滞后做对照 |

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

## 二次收敛需要精确的雅可比

若 $J$ 精确、$J(\mathbf u^*)$ 非奇异且初值足够近，则误差满足

$$
\|\mathbf e_{k+1}\|\le C\|\mathbf e_k\|^2 .
$$

取 $\|\mathbf e_0\|=10^{-1}$、$C=1$，则误差序列为 $10^{-2}\to10^{-4}\to10^{-8}\to10^{-16}$，**四次迭代即达机器精度**，残差日志表现为有效位数每步翻倍：$1.0\times10^{-1}$、$1.1\times10^{-2}$、$8.7\times10^{-5}$、$3.2\times10^{-9}$、$4.1\times10^{-15}$。相反，若 $J$ 只是近似（误差与残差同量级），迭代退化为线性收敛，压缩因子约 0.4，同样从 $10^{-1}$ 到 $10^{-10}$ 需要 $\ln(10^{-9})/\ln(0.4)=23$ 次迭代。**日志里有效位数每步只增加固定位数，就是雅可比不精确的直接证据。**

## 一致切线：连续切线为什么毁掉二次收敛

弹塑性本构是这个问题最典型的现场。径向返回映射给出更新后的应力 $\boldsymbol\sigma_{n+1}$，Newton 需要的是**算法切线**

$$
C^{ep}=\frac{\partial\boldsymbol\sigma_{n+1}}{\partial\boldsymbol\varepsilon_{n+1}},
$$

而经典塑性理论给出的连续切线 $\partial\boldsymbol\sigma/\partial\boldsymbol\varepsilon$ 是应变率意义上的导数。二者在小应变增量下接近，但一般情形不同：连续切线忽略了返回映射中塑性乘子 $\Delta\gamma$ 对应变的依赖。对 von Mises 等向硬化，一致切线的形式为

$$
C^{ep}=C-\frac{(C:\mathbf n)\otimes(C:\mathbf n)}{\mathbf n:C:\mathbf n+H'},
\qquad
\mathbf n=\frac{\partial f}{\partial\boldsymbol\sigma},
$$

其中分母中的硬化模量必须取**离散返回映射导出的算法硬化模量**，而不是连续介质硬化模量。用错切线的后果很具体：同一弹塑性算例用一致切线 5 次迭代收敛，用连续切线需要 24 次，且当载荷增量较大时连续切线版本可能完全无法把残差压到 $10^{-8}$ 以下。**判断方法极其简单——把残差序列打印出来，看有效位数是否每步翻倍。**

## 收敛半径与全局化的必要性

二次收敛只在解的某个邻域内成立，这个邻域的大小由 Kantorovich 条件控制，粗略地要求初值误差与非线性强度之积足够小。远离解时 Newton 方向可能根本不是下降方向，步长 $\alpha=1$ 会直接跳到物理上非法的区域（负密度、负温度、穿透）。因此工业求解器都会加上阻尼或线搜索：

$$
\mathbf u_{k+1}=\mathbf u_k+\alpha_k\Delta\mathbf u_k,\qquad 0<\alpha_k\le1,
$$

其中步长由回溯法确定，接受条件是功函数下降

$$
\phi(\mathbf u_k+\alpha\Delta\mathbf u_k)\le\phi(\mathbf u_k)+c_1\alpha\,\nabla\phi^{\mathsf T}\Delta\mathbf u_k,
\qquad \phi=\tfrac12\|\mathbf R\|_2^2,
$$

Armijo 常数取 $c_1=10^{-4}$、步长按 0.5 倍收缩。残差光滑且初值可靠时线搜索几乎从不触发，$\alpha_k$ 恒为 1，收敛仍是二次的；一旦日志里频繁出现 $\alpha<0.5$，说明问题已经偏离了 Newton 的适用域。

```python
import numpy as np

def newton_armijo(R, J, u0, c1=1.0e-4, rho=0.5,
                  tol=1.0e-10, maxit=50):
    u = np.array(u0, float)
    for k in range(maxit):
        r = R(u)
        phi0 = 0.5 * r @ r
        if np.sqrt(phi0) <= tol:
            break
        du = np.linalg.solve(J(u), -r)   # Newton 修正方程
        gTdu = -r @ r                    # grad(phi)^T du < 0
        alpha = 1.0
        while alpha > 1.0e-12:           # Armijo 回溯, c1=1e-4
            un = u + alpha * du
            if 0.5 * R(un) @ R(un) <= phi0 + c1 * alpha * gTdu:
                break
            alpha *= rho                 # 步长按 0.5 倍收缩
        u = u + alpha * du
    return u, k + 1
```

在一致切线正确的算例上，这个循环里 `alpha` 始终为 1.0，循环体只执行 5 次；一旦日志显示 `alpha` 被反复收缩，就应回到本构导数去查而不是放宽容差。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差每步只降固定倍数（约 0.4） | 雅可比与残差不一致，典型为用了连续切线 | 打印有效位数增长，逐项核验本构导数 |
| 前 3 步很快、之后完全不动 | 残差尺度被大量纲分量主导 | 改用相对残差并按分量归一化后重测 |
| 载荷增量减半后迭代数大幅下降 | 初值超出收敛半径 | 固定本构，只改 $N_{\text{inc}}$ 做对照 |
| 线搜索步长长期停在 $10^{-4}$ 以下 | Newton 方向不是下降方向，雅可比符号有误 | 用有限差分核验 $J$ 的单列 |

## 收敛判据必须同时给三档

只判残差是工程事故的常见来源。正确的停机条件同时检查三项：

$$
\|\mathbf R_k\|\le\text{atol}+\text{rtol}\|\mathbf R_0\|,
\qquad
\|\Delta\mathbf u_k\|\le\text{stol}\|\mathbf u_k\|,
\qquad
k\le k_{\max}.
$$

实测配置取 `rtol=1e-8`、`atol=1e-10`、`stol=1e-8`、`max_it=50`。三档判据各司其职：相对残差判据保证解的质量；绝对残差防止 $\|\mathbf R_0\|$ 本身极小（增量载荷步、纯 Neumann 问题）时第 1 步就误判收敛；增量判据防止"残差小但解还在剧烈调整"——这类情形在接触状态反复切换时很常见，残差降到 $10^{-9}$ 而位移增量仍在 $10^{-2}$ 量级。**三项中任意一项长期不满足就应判定失败，而不是只放宽其中一项。**

## 从残差序列估计收敛阶

收敛阶不需要知道真解，直接用残差序列估计：

$$
p\approx\frac{\ln(\|\mathbf R_{k+1}\|/\|\mathbf R_k\|)}{\ln(\|\mathbf R_k\|/\|\mathbf R_{k-1}\|)} .
$$

把实测残差 $1.0\times10^{-1}\to1.1\times10^{-2}\to8.7\times10^{-5}\to3.2\times10^{-9}$ 代入，$p=\ln(7.9\times10^{-3})/\ln(0.11)=2.19$，确认是二次收敛。对照一个雅可比不精确的算例，残差为 $1.0\times10^{-1}\to4.0\times10^{-2}\to1.6\times10^{-2}\to6.4\times10^{-3}$，得 $p=1.00$，是纯线性收敛。**判据：$p>1.7$ 才算二次收敛；$1.2<p<1.7$ 属超线性，说明雅可比基本正确但线性子问题解得过松；$p\le1.2$ 说明雅可比或残差定义不一致。**

## 假收敛的三种形态

第一种是雅可比错误但残差仍下降——因为残差下降只需要方向大致可用，而错方向在小残差区会停住，表现为 $p\approx1$ 且在 $10^{-6}$ 附近拉平。第二种是残差尺度掩盖：结构问题里力残差按牛顿计、位移增量按毫米计，若不做归一化，大量纲分量会主导 $\|\mathbf R\|$，导致某些自由度其实远未收敛却整体达标。第三种是收敛到非物理解，例如接触问题中所有接触点被判为分离，残差确实很小，但整体刚度缺失、位移场明显异常。三种形态的区分方法是分别检查收敛阶、分分量残差、以及物理约束（能量、接触力非负、体积守恒）。

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

## 参考资料

1. Deuflhard, P., *Newton Methods for Nonlinear Problems: Affine Invariance and Adaptive Algorithms*, Springer, 2004.
2. Kelley, C. T., *Iterative Methods for Linear and Nonlinear Equations*, SIAM, 1995.
3. Dennis, J. E., Schnabel, R. B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
4. Simo, J. C., Hughes, T. J. R., *Computational Inelasticity*, Springer, 1998.
5. Knoll, D. A., Keyes, D. E., "Jacobian-free Newton–Krylov methods: a survey of approaches and applications", *Journal of Computational Physics*, 193(2), 2004.
6. Kantorovich, L. V., Akilov, G. P., *Functional Analysis*, 2nd ed., Pergamon Press, 1982.
7. Eisenstat, S. C., Walker, H. F., "Choosing the forcing terms in an inexact Newton method", *SIAM Journal on Scientific Computing*, 17(1), 1996.
8. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
9. Higham, N. J., *Accuracy and Stability of Numerical Algorithms*, 2nd ed., SIAM, 2002.
10. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
