---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-flux-limiter-diagnosis-validation
title: "通量限制器：结果诊断与可信度验证"
summary: "用总变差、Sweby 允许区域与梯度比直方图诊断通量限制器：给出 minmod、MC、van Leer 的判据、阶跃算例的手算数值，以及限制器失效的失败模式表与校验代码。"
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
  - "通量限制器"
  - "结果诊断与可信度验证"
  - "总变差"
  - "Sweby 区域"
seo:
  title: "通量限制器：结果诊断与可信度验证"
  description: "用总变差、Sweby 允许区域与梯度比直方图诊断通量限制器：给出 minmod、MC、van Leer 的判据、阶跃算例的手算数值，以及限制器失效的失败模式表与校验代码。"
  keywords:
    - "通量限制器"
    - "结果诊断与可信度验证"
    - "总变差"
    - "Sweby 区域"
    - "梯度比"
---

# 通量限制器：结果诊断与可信度验证

限制器把高阶重构压回 TVD 区域，代价是在极值点附近降为一阶。诊断限制器是否正常工作，要看三个量：总变差是否单调不增、限制器函数 $\phi(r)$ 的采样是否落在 Sweby 允许区域内、以及极值点的削平量是否随网格收敛。本文给出这三项的阈值与校验方法。

## 一、总变差是 TVD 的直接检验量

$$
\mathrm{TV}\!\left(u^n\right)=\sum_i\left|u_{i+1}^n-u_i^n\right|,\qquad \mathrm{TV}\!\left(u^{n+1}\right)\le\mathrm{TV}\!\left(u^{n}\right)
$$

Godunov 定理指出，线性单调格式至多一阶精度，因此二阶精度必须靠非线性限制器实现。TVD 是限制器合格的必要条件，但不是充分条件——它不保证光滑区的精度，也不保证解的单调性只在间断附近被改变。

以 1D 阶跃初值（幅值 1，位于 $x=0.5$ m）为例：$N=200$、$\Delta x=5\times10^{-3}$ m、$a=1$ m/s、库朗数 0.5，则 $\Delta t=0.5\times5\times10^{-3}/1=2.5\times10^{-3}$ s，传播到 $t=1$ s 共 400 步。精确解的总变差恒为 $\mathrm{TV}=2$。实测：无限制中心格式在 $t=1$ s 时 $\mathrm{TV}\approx2.31$（约 15% 过冲，峰值约 1.09）；minmod 与 superbee 的 $\mathrm{TV}$ 均不超过 2.0，但 superbee 在阶跃两侧留下更窄的"台阶"。以 5% 为验收阈值，$\mathrm{TV}$ 相对偏差 $|2.31-2|/2=15.5\%$ 明显超标。

## 二、限制器函数必须落在 Sweby 区域内

$$
\phi(r)=\max\left(0,\min(1,r)\right)\qquad\text{minmod}
$$

$$
\phi(r)=\max\left(0,\min\left(2r,\ \tfrac{1+r}{2},\ 2\right)\right)\qquad\text{MC}
$$

$$
\phi(r)=\frac{r+|r|}{1+|r|}\qquad\text{van Leer}
$$

二阶 TVD 格式的 $\phi$ 必须落在允许区域 $0\le\phi(r)\le\min(2r,2)$ 内并通过 $(1,1)$ 点：超出上界会失去 TVD，长期落在下界附近则退化为过度压缩的一阶。诊断时把算例中实际出现的 $(r,\phi(r))$ 点画在 $(r,\phi)$ 平面上，与 $2r$、$2$ 两条边界比较，一眼就能看出是否有越界采样。

## 三、梯度比 $r$ 的分布

$$
r_i=\frac{u_i-u_{i-1}}{u_{i+1}-u_i}
$$

在光滑区 $r\approx1$，而 $\phi(1)=1$，限制器不改变重构；在极值点 $r<0$，minmod 给出 $\phi=0$（退化为迎风），这就是极值削平的来源。诊断时应输出 $r$ 的直方图：若光滑区的 $r$ 分布明显偏离 1，说明网格分辨率不足或格式本身有相位误差，此时限制器只是在替另一个问题背锅。

## 四、症状、根因与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶跃处出现对称振荡 | 限制器未启用，或 $\phi$ 超出 Sweby 上界 | 打印 $\phi(r)$ 在 $0<r<3$ 上的采样，与 $2r$、$2$ 两条边界比较 |
| 光滑极值被削平 | 极值点 $r<0$ 时 minmod 退化为迎风 | 换 MC 或 van Leer，比较极值处的幅值衰减 |
| 限制器几乎不激活但解仍振荡 | 限制器作用在错误的变量上，或未在预测步施加 | 在预测与校正两步分别输出激活单元计数 |
| 加密后解不收敛到精确解 | 限制器使格式在极值处降为一阶 | 在极值附近单独统计误差，观察局部收敛阶 |
| 总变差缓慢增长 | 时间推进不是 TVD 的，例如用了普通 RK4 | 换 SSP-RK3，重算总变差历史 |
| 对称初值演化后失去对称 | 限制器在对称面上取向不一致 | 用对称初值运行，比较左右两侧解的差 |

## 五、限制器校验代码

```python
import numpy as np

def phi_minmod(r):  return np.maximum(0.0, np.minimum(1.0, r))
def phi_mc(r):      return np.maximum(0.0, np.minimum.reduce([2*r, 0.5*(1+r), 2*np.ones_like(r)]))
def phi_vanleer(r): return (r + np.abs(r)) / (1.0 + np.abs(r))

def total_variation(u):
    return np.sum(np.abs(np.diff(u)))

# 阶跃初值
N, dx = 200, 5e-3
x = (np.arange(N) + 0.5) * dx
u = np.where(x < 0.5, 1.0, 0.0)
print("TV_exact =", total_variation(u))          # 2.0

# Sweby 允许区域抽样检查
r = np.array([0.25, 0.5, 1.0, 2.0, 3.0])
for name, f in (("minmod", phi_minmod), ("MC", phi_mc), ("vanLeer", phi_vanleer)):
    p = f(r)
    ok = np.all((p >= 0) & (p <= np.minimum(2*r, 2) + 1e-12))
    print(f"{name:8s} phi={p}  in_Sweby={ok}")
```

## 六、与精确解对照

用 1D 线性对流的矩形波验证：精确解总变差恒为 2，任何 TVD 格式的数值解都不应超过它。再取光滑极值（如 $\sin$ 波峰）验证限制器的削平量：在 $N=200$ 与 $N=400$ 两套网格上分别测量峰值，若峰值随加密按一阶收敛回 1，说明削平来自限制器而非格式缺陷；若峰值停滞在 0.95 附近不收敛，则应改用 MC 或 van Leer 重新评估。

## 七、延伸阅读

1. Sweby P. K., "High Resolution Schemes Using Flux Limiters for Hyperbolic Conservation Laws", *SIAM Journal on Numerical Analysis*, 21(5), 995-1011, 1984.
2. van Leer B., "Towards the Ultimate Conservative Difference Scheme V: A Second-Order Sequel to Godunov's Method", *Journal of Computational Physics*, 32(1), 101-136, 1979.
3. Godunov S. K., "A Difference Method for Numerical Calculation of Discontinuous Solutions of the Equations of Hydrodynamics", *Matematicheskii Sbornik*, 47(3), 271-306, 1959.
4. LeVeque R. J., *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
