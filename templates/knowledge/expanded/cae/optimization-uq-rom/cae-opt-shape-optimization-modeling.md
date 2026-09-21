---
template_version: flowlab-knowledge/1.0
slug: cae-opt-shape-optimization-modeling
title: 形状优化：原理、设置与验证
summary: >-
  比较 Hicks-Henne 鼓包、B-spline 控制点与自由变形三种边界参数化，推导 Hadamard 形状导数与 RBF
  网格变形的耦合关系，给出参数化自由度、幅值上限与网格雅可比门槛的匹配判据。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 进阶
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 优化、不确定性与降阶
  - 形状优化
  - 方法原理与适用范围
  - Hicks-Henne 参数化
  - RBF 网格变形
  - 工程设置与参数选择
  - 有限差分步长
  - p-norm 应力约束
  - 结果诊断与可信度验证
  - 应力集中系数
  - 形状导数校核
seo:
  title: 形状优化：原理、设置与验证
  description: >-
    比较 Hicks-Henne 鼓包、B-spline 控制点与自由变形三种边界参数化，推导 Hadamard 形状导数与 RBF
    网格变形的耦合关系，给出参数化自由度、幅值上限与网格雅可比门槛的匹配判据。
  keywords:
    - 形状优化
    - 方法原理与适用范围
    - 形状导数
    - Hicks-Henne
    - B-spline 参数化
    - 工程设置与参数选择
    - 网格变形
    - SQP
    - 应力聚合
    - 结果诊断与可信度验证
    - 应力集中系数
    - 网格收敛
---
# 形状优化：原理、设置与验证

形状优化不改变拓扑，只调整已有边界的位置，因此全部难度集中在两件事：边界如何被参数化，以及边界移动如何传到内部网格。选错参数化会让最优解被基函数截断，选错网格变形会让灵敏度被伪网格运动污染。形状优化的工程难点不在算法而在接口：设计变量、网格变形与灵敏度三者的容差必须相互匹配，任一处量级错配都会让优化停在一个假的收敛点。形状优化的输出是一条新边界曲线，验证它要把边界几何、灵敏度与应力场三方面证据对齐。仅凭目标函数下降不足以说明结果可信，因为下降可能来自网格退化或约束松弛。

## B-spline 与自由变形的取舍

B-spline 用控制点坐标作设计变量，$p$ 次基函数保证 $C^{p-1}$ 连续，几何天然光顺，是叶型与翼型优化的主流选择。自由变形（FFD）把设计域嵌入控制体，物体随控制体一起变形，适合已有 CAD 模型不便重新参数化的场合。两者设计变量都是控制点坐标，差别在于映射是否直接作用于边界。

## 形状导数只认法向运动

设边界沿法向以速度 $V_n$ 移动，目标泛函的形状导数由 Hadamard–Zolésio 公式给出：

$$ \dot{J}=\int_{\Gamma}\left(\nabla \mathbf{u}\cdot\nabla \mathbf{p}-\Lambda\right)V_n\,ds $$

$\mathbf{p}$ 是伴随变量，$\Lambda$ 是与目标相关的边界量。该式的含义是目标变化只依赖边界法向运动，切向运动不改变形状。因此设计变量必须作用在法向；若参数化给出的位移含切向分量，灵敏度会被稀释，梯度校验会出现系统性偏差。

## 何时形状优化不适用

边界存在尖角时形状导数在角点无定义，需要先圆角平滑；拓扑本身不合理时形状优化只能做局部微调，柔度改善通常不足 5%；若最优形状要求开新孔，形状优化永远达不到，必须回到拓扑优化。以最大应力为目标时，缺口处应力奇异，需配合网格收敛或改用 p-norm 聚合。

## 网格变形必须带质量门槛

内部网格由 RBF 插值随边界移动：

$$ s(\mathbf{x})=\sum_{i=1}^{N_b}\alpha_i\phi\left(\lVert\mathbf{x}-\mathbf{x}_i\rVert\right)+p(\mathbf{x}) $$

$\phi$ 常用薄板样条 $\phi(r)=r^2\ln r$。网格节点 5000、边界控制点 30 时，单次变形耗时约 0.2 s。变形后必须检查最小雅可比，低于 0.3 或出现负体积时应触发局部重网格，否则单元畸变会把误差写进目标函数。

## 网格变形与重网格的切换

RBF 变形在边界位移小于网格边长时质量最好。当最小雅可比降到 0.3 以下，或最大单元扭曲超过 60°，应切换到重网格。重网格会引入插值误差，需把目标与约束映射到新网格后再继续，且每 5 次重网格要复算一次梯度以确认导数仍然自洽。

## 边界参数化决定可达形状空间

Hicks–Henne 鼓包函数把边界法向位移写成基函数叠加：

$$ b_k(x)=\sin\left(\pi x^{m_k}\right)^{t},\qquad m_k=\frac{\ln 0.5}{\ln x_k} $$

$x_k$ 是第 $k$ 个鼓包的峰值位置，$t$ 控制锐度。取 $x_k=0.5$ 时 $m_k=1$，$b_k(x)=\sin(\pi x)^t$；在 $x=0.25$ 处 $\sin(45^\circ)^3=0.354$。若法向幅值上限为 2 mm，该点实际位移为 $2\times0.354=0.71$ mm。$t=3$ 的鼓包半宽约为 0.25 弦长，20 个鼓包即可覆盖一条弦长，再多会出现基函数线性相关。

## 参数化自由度与问题规模的匹配

变量数与网格变形能力要匹配：变量数超过边界采样点数的一半时，基函数矩阵条件数迅速恶化，最优解出现锯齿。

| 参数化 | 设计变量数 | 光顺性 | 适用场景 |
|---|---|---|---|
| Hicks–Henne | 10～30 | $C^{1}$ | 二维翼型、型线 |
| B-spline 控制点 | 20～80 | $C^{p-1}$ | 三维曲面、叶栅 |
| FFD 控制体 | 30～150 | 取决于控制体 | 已有 CAD 模型 |

## 参数表

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

## 变量数与幅值上下界

边界采样 200 点、鼓包 12 个时变量数为 12，每个幅值限制在 ±1.0 mm。上限过大会让网格在一次迭代内畸变，下限过小则最优解被截断在边界上。经验规则：单次迭代的边界法向位移不超过局部网格边长的 50%；网格边长 1.5 mm 时单步位移上限 0.75 mm。

## 有限差分步长有硬下限

校验形状导数时，差分步长必须显著大于几何与网格的数值噪声。CAD 与网格节点通常按 $10^{-6}$ m（1 μm）存储，若取相对步长 $10^{-6}$，对 1 mm 幅值只有 1 nm，完全淹没在几何舍入里。正确取法是绝对步长 $10^{-5}$ m（10 μm）：

$$ \Delta a \ge 10\,\epsilon_{geo},\qquad \epsilon_{geo}=10^{-6}\ \mathrm{m} $$

这样相对误差可控制在 $10^{-4}$ 内；若误差随步长减小反而增大，就是舍入噪声主导的直接证据。

## SQP 收敛设置与量纲缩放

SQP 子问题用 BFGS 更新 Hessian。收敛容差取：梯度范数 $10^{-4}$、约束违反 $10^{-6}$、变量变化 $10^{-5}$、最大迭代 50。目标与约束量级相差超过 $10^{3}$ 时必须归一化，否则 Hessian 更新失真：

$$ \tilde{f}=\frac{f-f_{ref}}{s_f},\qquad \tilde{g}_i=\frac{g_i}{s_{g,i}} $$

## 应力约束用 p-norm 聚合

面积约束 $\int_\Gamma n\,ds \le A_0$ 线性可分离，直接给解析梯度。应力约束不可分离，用 p-norm 聚合逼近最大值：

$$ \sigma_{PN}=\left(\sum_{e=1}^{N_e}\sigma_e^{p}\right)^{1/p}\approx\max_e\sigma_e $$

$p=8$ 时聚合值对最大应力的高估在 5% 以内；$p$ 再大会让梯度出现数值溢出。$N_e=2\times10^{4}$ 个单元、$\sigma_e$ 量级 100 MPa 时，需先把应力按 100 MPa 归一化再求 $p$ 次幂。

## 故障模式与判定试验

```text
Hicks-Henne 参数化 + RBF 变形流程
输入: 边界采样 x_b (N=200), 鼓包数 nb=20, 幅值上限 A=2mm
1) 由 x_k 计算 m_k = ln(0.5)/ln(x_k), 组装基函数矩阵 B (N x nb)
2) 设计变量 a (nb) -> 边界法向位移 d = B @ a, |d| <= A
3) RBF 插值: s(x) = sum alpha_i phi(||x - x_i||) + poly(x)
4) 更新网格 X <- X + s(X), 检查 min Jacobian >= 0.3
5) 求解, 由 Hadamard 公式算 dJ/da, 交 SQP 更新 a
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 边界出现短波振荡 | 鼓包函数过密、幅值无滤波 | 把鼓包数从 30 降到 12 重算 |
| 网格出现负体积 | 变形幅值超过局部网格尺寸 | 检查最小雅可比是否小于 0.3 |
| 灵敏度方向与实际目标变化相反 | 位移含切向分量或网格速度未计入 | 用有限差分核对形状导数 |
| 最优解落在变量上界 | 幅值上限过小 | 把上限从 1 mm 放宽到 2 mm |
| 改善量不足 2% | 拓扑本身不合理 | 先做拓扑优化再谈形状 |
| 梯度校验误差 30% | 差分步长小于几何容差 | 步长从 $10^{-6}$ 提到 $10^{-5}$ m |
| 迭代 3 次后网格畸变 | 幅值上限过大 | 单步位移限制到 0.75 mm |
| 目标在重网格后跳变 8% | 未做场插值 | 检查插值前后积分量 |
| 优化停在变量边界 | 上限过小 | 放宽到 ±1.0 mm |
| SQP 不收敛 | 目标与约束量级差 $10^{3}$ 以上 | 归一化后重跑 |
| p-norm 聚合值比最大应力低 | $p$ 过小 | $p$ 从 4 提到 8 |

## 边界振荡要用频谱判定

参数化基函数过密时，最优解会出现波长约等于网格边长的锯齿。把边界位移做离散 Fourier 变换，若高频分量幅值超过总幅值的 10%，说明噪声主导，应减少鼓包数或加 Tikhonov 正则：

$$ J_{reg}=J+\eta\left\lVert \mathbf{B}\mathbf{a}\right\rVert_2^{2} $$

$\eta$ 取 $10^{-4}$ 量级，可用 L 曲线法确定：把解范数与残差范数画成双对数曲线，取拐点处的 $\eta$。

## 诊断表

```text
形状优化可信度检查
1) K_t = sigma_max / (F / (W*t))                       # 与 3.0 对照
2) h = 1e-5; fd = (J(a+h) - J(a-h)) / (2*h)
   rel_err = |adj - fd| / |adj|                        # 判据 < 1e-4
3) for h in [0.5, 0.25, 0.125] mm: sigma_peak(h)
   ratio = (s1 - s2) / (s2 - s3)                       # 缺口处应接近 2
4) FFT(a); hf = sum(|A_k|, k > 0.1*N) / sum(|A_k|)     # 判据 < 0.10
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $K_t$ 优化后仍为 3.0 | 设计变量未作用于孔边法向 | 检查鼓包是否覆盖孔周 |
| 差分误差随 $h$ 减小而增大 | 步长小于几何容差 $10^{-6}$ m | 用 $h=10^{-5}$ m 重算 |
| 峰值应力三套网格差 3% 以上 | 缺口奇异未收敛 | 加密到 0.125 mm 并外推 |
| 边界出现短波锯齿 | 鼓包过密 | FFT 查高频占比是否超 10% |
| 目标下降但质量增加 20% | 面积约束未激活 | 检查约束违反是否小于 $10^{-6}$ |
| 改善量在重网格后消失 | 目标随网格变化 | 固定网格后再优化一次 |

## 用应力集中系数做解析对照

无限大板中心圆孔受单向拉伸时理论应力集中系数 $K_t=3.0$。名义应力 100 MPa 时孔边峰值 300 MPa。形状优化把圆孔改为长短轴比 0.5 的椭圆并加过渡圆角后，$K_t$ 降到约 1.42，峰值 142 MPa，降幅 $(300-142)/300=52.7\%$。

$$ K_t=\frac{\sigma_{\max}}{\sigma_{nom}},\qquad \sigma_{nom}=\frac{F}{Wt} $$

$W$ 为板宽、$t$ 为板厚。若优化后 $K_t$ 低于 1.0，说明名义应力取错或载荷未按新截面更新。

## 应力对网格的收敛比位移慢

位移误差为 $O(h^{2})$，而缺口处应力因奇异只有 $O(h^{0.5})$。同一缺口用 0.5 mm、0.25 mm、0.125 mm 网格算得峰值应力 148.2、145.1、143.6 MPa，差分比

$$ \frac{\sigma_1-\sigma_2}{\sigma_2-\sigma_3}=\frac{148.2-145.1}{145.1-143.6}=2.07 $$

接近 2 而不是 4，正是低阶收敛的表现。因此以应力为目标的形状优化必须做网格收敛并外推，不能只看单套网格。

## 形状导数的有限差分校核

把解析形状导数与中心差分比较：

$$ \epsilon_{rel}=\frac{\left|\dot{J}_{adj}-\dfrac{J(a+h)-J(a-h)}{2h}\right|}{\left|\dot{J}_{adj}\right|} $$

$h=10^{-5}$ m 时相对误差应低于 $10^{-4}$。若误差在 $10^{-1}$ 量级且随 $h$ 减小而增大，是几何舍入主导；若随 $h$ 增大而增大，是截断误差主导。两者对应的修正方向完全相反，不能笼统地"调小步长"。

## 参考资料

1. Sokolowski J., Zolésio J.-P., *Introduction to Shape Optimization: Shape Sensitivity Analysis*, Springer, 1992.
2. Pironneau O., *Optimal Shape Design for Elliptic Systems*, Springer, 1984.
3. Hicks R.M., Henne P.A., "Wing design by numerical optimization," *Journal of Aircraft*, 15, 1978.
4. Samareh J.A., "Survey of shape parameterization techniques for high-fidelity multidisciplinary shape optimization," *AIAA Journal*, 39, 2001.
5. de Boer A., van der Schoot M.S., Bijl H., "Mesh deformation based on radial basis function interpolation," *Computers & Structures*, 85, 2007.
6. Haftka R.T., Grandhi R.V., "Structural shape optimization—a survey," *Computer Methods in Applied Mechanics and Engineering*, 57, 1986.
7. Vanderplaats G.N., *Numerical Optimization Techniques for Engineering Design: With Applications*, McGraw-Hill, 1984.
8. Bletzinger K.-U., Ramm E., "Structural optimization and form finding of light weight structures," *Computers & Structures*, 79, 2001.
9. Choi K.K., Kim N.H., *Structural Sensitivity Analysis and Optimization 1: Linear Systems*, Springer, 2005.
10. Martins J.R.R.A., Ning A., *Engineering Design Optimization*, Cambridge University Press, 2021.
11. Jameson A., "Aerodynamic design via control theory," *Journal of Scientific Computing*, 3, 1988.
12. Giles M.B., Pierce N.A., "An introduction to the adjoint approach to design," *Flow, Turbulence and Combustion*, 65, 2000.
13. Mohammadi B., Pironneau O., *Applied Shape Optimization for Fluids*, Oxford University Press, 2001.
14. Haftka R.T., Adelman H.M., "Sensitivity analysis of discrete structural systems," *AIAA Journal*, 24, 1985.
15. Dems K., Mróz Z., "Variational approach by means of adjoint systems to structural optimization and sensitivity analysis," *International Journal of Solids and Structures*, 20, 1984.
