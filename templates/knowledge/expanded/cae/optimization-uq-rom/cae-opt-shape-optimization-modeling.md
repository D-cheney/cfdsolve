---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-shape-optimization-modeling
title: "形状优化：方法原理与适用范围"
summary: "比较 Hicks-Henne 鼓包、B-spline 控制点与自由变形三种边界参数化，推导 Hadamard 形状导数与 RBF 网格变形的耦合关系，给出参数化自由度、幅值上限与网格雅可比门槛的匹配判据。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "形状优化"
  - "方法原理与适用范围"
  - "Hicks-Henne 参数化"
  - "RBF 网格变形"
seo:
  title: "形状优化：方法原理与适用范围"
  description: "比较 Hicks-Henne 鼓包、B-spline 控制点与自由变形三种边界参数化，推导 Hadamard 形状导数与 RBF 网格变形的耦合关系，给出参数化自由度、幅值上限与网格雅可比门槛的匹配判据。"
  keywords:
    - "形状优化"
    - "方法原理与适用范围"
    - "形状导数"
    - "Hicks-Henne"
    - "B-spline 参数化"
---

# 形状优化：方法原理与适用范围

形状优化不改变拓扑，只调整已有边界的位置，因此全部难度集中在两件事：边界如何被参数化，以及边界移动如何传到内部网格。选错参数化会让最优解被基函数截断，选错网格变形会让灵敏度被伪网格运动污染。

## 边界参数化决定可达形状空间

Hicks–Henne 鼓包函数把边界法向位移写成基函数叠加：

$$ b_k(x)=\sin\left(\pi x^{m_k}\right)^{t},\qquad m_k=\frac{\ln 0.5}{\ln x_k} $$

$x_k$ 是第 $k$ 个鼓包的峰值位置，$t$ 控制锐度。取 $x_k=0.5$ 时 $m_k=1$，$b_k(x)=\sin(\pi x)^t$；在 $x=0.25$ 处 $\sin(45^\circ)^3=0.354$。若法向幅值上限为 2 mm，该点实际位移为 $2\times0.354=0.71$ mm。$t=3$ 的鼓包半宽约为 0.25 弦长，20 个鼓包即可覆盖一条弦长，再多会出现基函数线性相关。

## B-spline 与自由变形的取舍

B-spline 用控制点坐标作设计变量，$p$ 次基函数保证 $C^{p-1}$ 连续，几何天然光顺，是叶型与翼型优化的主流选择。自由变形（FFD）把设计域嵌入控制体，物体随控制体一起变形，适合已有 CAD 模型不便重新参数化的场合。两者设计变量都是控制点坐标，差别在于映射是否直接作用于边界。

## 形状导数只认法向运动

设边界沿法向以速度 $V_n$ 移动，目标泛函的形状导数由 Hadamard–Zolésio 公式给出：

$$ \dot{J}=\int_{\Gamma}\left(\nabla \mathbf{u}\cdot\nabla \mathbf{p}-\Lambda\right)V_n\,ds $$

$\mathbf{p}$ 是伴随变量，$\Lambda$ 是与目标相关的边界量。该式的含义是目标变化只依赖边界法向运动，切向运动不改变形状。因此设计变量必须作用在法向；若参数化给出的位移含切向分量，灵敏度会被稀释，梯度校验会出现系统性偏差。

## 网格变形必须带质量门槛

内部网格由 RBF 插值随边界移动：

$$ s(\mathbf{x})=\sum_{i=1}^{N_b}\alpha_i\phi\left(\lVert\mathbf{x}-\mathbf{x}_i\rVert\right)+p(\mathbf{x}) $$

$\phi$ 常用薄板样条 $\phi(r)=r^2\ln r$。网格节点 5000、边界控制点 30 时，单次变形耗时约 0.2 s。变形后必须检查最小雅可比，低于 0.3 或出现负体积时应触发局部重网格，否则单元畸变会把误差写进目标函数。

## 参数化自由度与问题规模的匹配

| 参数化 | 设计变量数 | 光顺性 | 适用场景 |
|---|---|---|---|
| Hicks–Henne | 10～30 | $C^{1}$ | 二维翼型、型线 |
| B-spline 控制点 | 20～80 | $C^{p-1}$ | 三维曲面、叶栅 |
| FFD 控制体 | 30～150 | 取决于控制体 | 已有 CAD 模型 |

变量数与网格变形能力要匹配：变量数超过边界采样点数的一半时，基函数矩阵条件数迅速恶化，最优解出现锯齿。

## 何时形状优化不适用

边界存在尖角时形状导数在角点无定义，需要先圆角平滑；拓扑本身不合理时形状优化只能做局部微调，柔度改善通常不足 5%；若最优形状要求开新孔，形状优化永远达不到，必须回到拓扑优化。以最大应力为目标时，缺口处应力奇异，需配合网格收敛或改用 p-norm 聚合。

## 失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 边界出现短波振荡 | 鼓包函数过密、幅值无滤波 | 把鼓包数从 30 降到 12 重算 |
| 网格出现负体积 | 变形幅值超过局部网格尺寸 | 检查最小雅可比是否小于 0.3 |
| 灵敏度方向与实际目标变化相反 | 位移含切向分量或网格速度未计入 | 用有限差分核对形状导数 |
| 最优解落在变量上界 | 幅值上限过小 | 把上限从 1 mm 放宽到 2 mm |
| 改善量不足 2% | 拓扑本身不合理 | 先做拓扑优化再谈形状 |

```text
Hicks-Henne 参数化 + RBF 变形流程
输入: 边界采样 x_b (N=200), 鼓包数 nb=20, 幅值上限 A=2mm
1) 由 x_k 计算 m_k = ln(0.5)/ln(x_k), 组装基函数矩阵 B (N x nb)
2) 设计变量 a (nb) -> 边界法向位移 d = B @ a, |d| <= A
3) RBF 插值: s(x) = sum alpha_i phi(||x - x_i||) + poly(x)
4) 更新网格 X <- X + s(X), 检查 min Jacobian >= 0.3
5) 求解, 由 Hadamard 公式算 dJ/da, 交 SQP 更新 a
```

## 参考文献

1. Sokolowski J., Zolésio J.-P., *Introduction to Shape Optimization: Shape Sensitivity Analysis*, Springer, 1992.
2. Pironneau O., *Optimal Shape Design for Elliptic Systems*, Springer, 1984.
3. Hicks R.M., Henne P.A., "Wing design by numerical optimization," *Journal of Aircraft*, 15, 1978.
4. Samareh J.A., "Survey of shape parameterization techniques for high-fidelity multidisciplinary shape optimization," *AIAA Journal*, 39, 2001.
5. de Boer A., van der Schoot M.S., Bijl H., "Mesh deformation based on radial basis function interpolation," *Computers & Structures*, 85, 2007.
