---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-discontinuous-galerkin-diagnosis-validation
title: "间断 Galerkin 方法：结果诊断与可信度验证"
summary: "给出间断 Galerkin 结果的三条验算指标：离散守恒误差应达机器精度、L2 误差按 k+1 阶下降、限制器只在间断邻域激活，并附三套网格定阶算例与失败模式表。"
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
  - "间断 Galerkin 方法"
  - "结果诊断与可信度验证"
  - "数值通量"
  - "局部守恒"
seo:
  title: "间断 Galerkin 方法：结果诊断与可信度验证"
  description: "给出间断 Galerkin 结果的三条验算指标：离散守恒误差应达机器精度、L2 误差按 k+1 阶下降、限制器只在间断邻域激活，并附三套网格定阶算例与失败模式表。"
  keywords:
    - "间断 Galerkin 方法"
    - "结果诊断与可信度验证"
    - "数值通量"
    - "超收敛"
    - "局部守恒"
---

# 间断 Galerkin 方法：结果诊断与可信度验证

间断 Galerkin（DG）方法的验算有三条互不替代的硬指标：离散守恒误差应落在机器精度量级、$L^2$ 误差随网格以 $k+1$ 阶下降、限制器只在间断邻域激活。本文给出这三条指标的测量方法、量级阈值，以及三者互相矛盾时先怀疑哪一项。

## 一、先把守恒量算到机器精度

DG 的守恒不是事后补上的修正，而是逐元素弱形式的直接推论：界面上左右两侧引用同一个单值数值通量，把所有单元的方程相加时内部界面通量逐对抵消。对一维标量守恒律 $\partial_t u+\partial_x f(u)=0$，单元 $K_j=[x_{j-1/2},x_{j+1/2}]$ 上的半离散弱形式为

$$
\int_{K_j}\partial_t u_h\,v_h\,dx-\int_{K_j}f(u_h)\,\partial_x v_h\,dx+\hat f_{j+1/2}\,v_h\!\left(x_{j+1/2}^-\right)-\hat f_{j-1/2}\,v_h\!\left(x_{j-1/2}^+\right)=0
$$

对全部 $j$ 求和并取 $v_h\equiv 1$，内部界面通量成对抵消，只剩两端边界项，得到可直接核对的全局预算

$$
\frac{d}{dt}\sum_{j=1}^{N}\int_{K_j}u_h\,dx=\hat f_{1/2}-\hat f_{N+1/2}
$$

因此守恒误差与数值通量单值性、Runge-Kutta 各阶段的状态更新是绑定的：这个恒等式不成立，就不必去调物理模型。

以 $[0,1]$ m 域、$N=200$ 个均匀单元、周期边界、初值 $u_0(x)=\sin(2\pi x)$ 为例，$\int_0^1 u_0\,dx=0$，精确解的积分恒为 0。$P^2$ 单元（$k=2$）取 $h=5\times10^{-3}$ m、波速 $a=1$ m/s、库朗数 0.2，则 $\Delta t=0.2\times5\times10^{-3}/(5\times1)=2\times10^{-4}$ s，积分到 $t=1$ s 共 5000 步。合格的实现里 $|\sum_j\int_{K_j}u_h\,dx|$ 应始终低于 $10^{-13}$；若量级停在 $10^{-6}$，几乎都是边界通量被两侧单元各算一次，或限制器在边界单元上把通量改成了非单值。

## 二、三套网格定阶，而不是两次比较

DG 的 $L^2$ 收敛阶应等于 $k+1$；在 1D 线性对流配迎风数值通量时，单元下风向端点还可观察到 $O(h^{2k+1})$ 的超收敛。用三套按 $2:1$ 加密的网格计算观测阶

$$
p_{\mathrm{obs}}=\frac{1}{\ln 2}\ln\frac{\lVert u-u_h\rVert_{L^2}}{\lVert u-u_{h/2}\rVert_{L^2}}
$$

实测一组 $P^2$ 数据：$h=2.0\times10^{-2}$ m 时误差 $3.2\times10^{-3}$，$h=1.0\times10^{-2}$ m 时 $4.0\times10^{-4}$，$h=5.0\times10^{-3}$ m 时 $5.0\times10^{-5}$。两级比值都是 8，于是 $p_{\mathrm{obs}}=\ln 8/\ln 2=3$，与 $k+1=3$ 吻合。只做两次比较时，一次偶然的误差抵消就能伪造出高阶假象；三套网格还能同时暴露"阶数在细网格上掉下来"这种典型故障。

定阶与守恒检查可以写成两段短脚本，便于在每次改动后重跑：

```python
import numpy as np

def observed_order(h, err):
    """由 2:1 加密网格的 L2 误差序列估计观测阶。"""
    return [np.log(err[i] / err[i + 1]) / np.log(h[i] / h[i + 1])
            for i in range(len(h) - 1)]

h   = [2.0e-2, 1.0e-2, 5.0e-3]      # 单元尺度，单位 m
err = [3.2e-3, 4.0e-4, 5.0e-5]      # 对应 L2 误差
print(observed_order(h, err))       # [3.0, 3.0]，与 k+1=3 一致

def conservation_residual(mass, f_left, f_right, dt):
    """检验 d/dt∫u 是否等于两端边界通量之差。"""
    return (mass[1] - mass[0]) / dt - (f_left - f_right)
```

## 三、限制器的激活范围

DG 用 TVB/minmod 类限制器抑制激波振荡，但限制器一旦在光滑区被触发，就把局部精度降回一阶。诊断时不要只看误差云图，而应逐步输出限制器激活单元数：光滑解上该计数应恒为 0；若在解的光滑段持续非零，说明 TVB 参数 $M$ 设得过小，或者单元已退化。对含真实间断的算例，激活计数应集中在间断前后各 1～2 个单元内，且随网格加密不向外扩散。

## 四、失败模式表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $L^2$ 误差在细网格上停在 $10^{-4}$ 不再下降 | 时间离散阶数低于空间阶数，或限制器主导误差 | 固定 $h$，把 $\Delta t$ 连续减半三次，看误差是否按 RK 阶下降 |
| 总质量以每步 $10^{-6}$ 的速度单调漂移 | 界面通量非单值，或边界单元通量符号反了 | 逐步累加 $\frac{d}{dt}\sum_j\int u_h$，与 $\hat f_{1/2}-\hat f_{N+1/2}$ 逐项对差 |
| 高阶单元（$k\ge3$）在细网格上突然发散 | 时间步超过 $(2k+1)$ 的显式限制 | 固定 $h$，从库朗数 0.1 向上扫描，记录首次失稳的值 |
| 激波后出现等宽台阶 | minmod 过度压缩，解被削平 | 换 MC 或 van Leer，比较总变差与激波厚度 |
| 光滑区误差比 $k+1$ 阶预期大一档 | 限制器在光滑区被误触发 | 统计每步限制器激活单元数，检查 TVB 参数 $M$ |
| 单元下风向端点误差远低于单元内部 | 超收敛点被误当作整体精度 | 分别在单元内部与下风向端点采样，比较两组误差的阶 |

## 五、与精确解的对照验收

取线性对流 $u_t+u_x=0$、$u_0=\sin(2\pi x)$、周期边界，精确解为 $u(x,t)=\sin(2\pi(x-t))$。在 $t=1$ s 比较 $L^2$ 误差：$P^1$ 应约 $2\times10^{-3}$、$P^2$ 应约 $5\times10^{-5}$（对应第二节 $h=5\times10^{-3}$ 一列）。除误差外还应同时报告限制器激活计数、守恒偏差、以及 $\Delta t$ 减半后误差的变化量。任何一项超标，先按第四节定位，再考虑是否需要提高多项式阶数。

## 六、参考文献

1. Reed W. H., Hill T. R., *Triangular Mesh Methods for the Neutron Transport Equation*, Los Alamos Scientific Laboratory Report LA-UR-73-479, 1973.
2. Cockburn B., Shu C.-W., "The Runge-Kutta Discontinuous Galerkin Method for Conservation Laws V: Multidimensional Systems", *Journal of Computational Physics*, 141(2), 199-224, 1998.
3. Hesthaven J. S., Warburton T., *Nodal Discontinuous Galerkin Methods: Algorithms, Analysis, and Applications*, Springer, 2008.
4. Cockburn B., Karniadakis G. E., Shu C.-W. (eds.), *The Development of Discontinuous Galerkin Methods*, Springer, 2000.
