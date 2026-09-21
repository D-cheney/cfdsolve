---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-boundary-element-engineering-setup
title: "边界元方法：工程设置与参数选择"
summary: "给出边界单元尺寸与自由度预算、正规与近奇异积分的求积阶次选择、快速多极子的展开阶与层数取值、迭代求解与预条件设置，以及对称性缩减和单因素对照的具体做法。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "边界元方法"
  - "工程设置与参数选择"
  - "近奇异积分"
  - "快速多极子"
seo:
  title: "边界元方法：工程设置与参数选择"
  description: "给出边界单元尺寸与自由度预算、正规与近奇异积分的求积阶次选择、快速多极子的展开阶与层数取值、迭代求解与预条件设置，以及对称性缩减和单因素对照的具体做法。"
  keywords:
    - "边界元"
    - "工程设置与参数选择"
    - "近奇异积分"
    - "快速多极子"
    - "迭代求解"
---

# 边界元方法：工程设置与参数选择

边界元的设置只有三件事真正决定成败：单元尺寸决定自由度与内存量级，近奇异积分的处理方式决定近场精度，求解器与加速结构决定问题能不能算完。三者按顺序设置，任何一步用错都会让后续调参失去意义。下面给出各环节的取值依据与可复算脚本。

## 单元类型与自由度预算

边界单元尺寸按每波长单元数取，$h\le\lambda/N_\lambda$，声学问题取 $N_\lambda=6\sim10$，势流与静电场问题按几何曲率取，曲率半径小于 $3h$ 处加密。单元类型的选择取决于场量沿边界的连续性：常单元（1 个自由度、几何与场量都取单元中心值）实现最简单但精度最低；线性单元（每边 2 个节点）适用于光滑边界；二次单元用于曲率大或通量变化剧烈的边界。

自由度数量与代价的直接关系为

$$
M=16N^2\ \text{bytes},
\qquad
W_{\mathrm{LU}}=\frac{2}{3}N^{3},
\qquad
\epsilon_{\mathrm{FMM}}\sim\Big(\frac{a}{r}\Big)^{p},
$$

其中 $M$ 为复双精度存储量、$W_{\mathrm{LU}}$ 为 LU 分解浮点运算量、$\epsilon_{\mathrm{FMM}}$ 为多极展开截断误差。半径 $1\,\mathrm{m}$ 的球在不同频率下的预算：

| $f$ / kHz | $\lambda$ / mm | $h$ / mm（$N_\lambda=6$） | 单元数 $N$ | 存储 / GiB | LU / FLOP |
|---|---|---|---|---|---|
| 1.0 | 343.0 | 57.17 | 3845 | 0.22 | $3.79\times10^{10}$ |
| 5.0 | 68.6 | 11.43 | 96131 | 137.7 | $5.92\times10^{14}$ |
| 10.0 | 34.3 | 5.72 | 384528 | 2203.4 | $3.79\times10^{16}$ |

分界线大致在 $N=2\times10^{4}$（存储 $6.4\,\mathrm{GB}$）：低于此值可用直接法，高于此值必须改用 FMM 或迭代求解。

## 积分阶次与近奇异处理

核函数的求积精度由源点到积分单元的距离与单元尺寸之比 $r/h$ 决定。判据是

$$
r/h>3\ \Rightarrow\ \text{常规 Gauss 求积};
\qquad
r/h\le3\ \Rightarrow\ \text{需自适应或坐标变换}.
$$

常规单元的求积阶取 $4\sim6$ 点即可（对应多项式精确到 7～11 阶）；$r/h<3$ 的近奇异单元用 $4$ 点求积的相对误差可达 $10^{-2}$，必须换成 $16\sim20$ 点或 Telles 极坐标变换才能压到 $10^{-8}$ 以下。自单元（$r\to0$）按奇异阶分别处理：弱奇异用对数加权求积，强奇异用刚体位移法间接求自由项，超奇异用 Hadamard 有限部分。

实用做法是把每个源点周围的单元按 $r/h$ 分成三档，只对近场档启用高阶求积，其余走快速通道。这样在 $N=10^{5}$ 量级下，积分计算量只比全用低阶求积增加约 $15\%$，而近场误差降低四个数量级。

## FMM 参数与迭代求解

快速多极子把远场交互聚合成多极展开，截断误差由展开阶 $p$ 与簇尺寸比 $a/r$ 共同决定：取 $a/r\le0.4$ 时每增加一阶误差约降 $2.5$ 倍，$p=10$ 对应相对误差约 $10^{-4}$，$p=14$ 对应约 $10^{-6}$。层数取 $\lceil\log_2 N\rceil/2$，$N=10^{5}$ 时约 $9$ 层，$N=4\times10^{5}$ 时约 $10$ 层。层数过多会让转移计算量上升，过少则簇内单元数超标、$a/r$ 变大。

迭代求解的设置：

- 求解器：GMRES，重启长度 $30$；非对称问题用 BiCGStab 或 GMRES 均可，GMRES 更稳健。
- 预条件：块对角预条件（对角块取近场自作用矩阵）可把迭代次数降低 $3\sim5$ 倍；不做预条件时 $N=10^{5}$ 常需 $200$ 次以上迭代。
- 收敛判据：相对残差 $10^{-8}$，对应场量误差约 $10^{-6}$；只到 $10^{-3}$ 会让近场误差被残差主导。
- 频率扫描：相邻频点用上一步解作初值，迭代次数可降到 $20\sim40$。

## 对称性与模型缩减

几何与边界条件同时关于某平面镜像对称时，可用半模型或四分之一模型。对 $N$ 减半的模型，存储按 $N^2$ 降到 $1/4$，LU 按 $N^3$ 降到 $1/8$——这是性价比最高的缩减手段。代价是必须选对对称面类型：声学刚性壁面对应法向速度为零（对称），压力释放面对应声压为零（反对称），选错会让整阶模态丢失。对非对称激励（如单侧点源），不能使用对称缩减。

## 单因素对照与记录字段

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 每波长单元数 | 频率、积分方案 | $N_\lambda=6,8,10$ | 远场声压与解析值偏差 |
| 近场求积阶 | 网格 | $r/h<3$ 档取 $4,10,20$ 点 | 近场场量与高阶参考解之差 |
| FMM 展开阶 | 层数 | $p=8,10,14$ | 与直接法结果的相对差 |
| 迭代残差 | 网格、加速结构 | $10^{-4},10^{-6},10^{-8}$ | 场量变化量与迭代次数 |
| 对称面类型 | 几何、频率 | 刚性壁面与压力释放面 | 前 3 阶模态频率与解析值 |

记录字段：频率或波数、$c$、$\lambda$、$h$、$N_\lambda$、单元类型与总数 $N$、$r/h$ 分档阈值、各档求积点数、FMM 的 $p$ 与层数、求解器与重启长度、预条件类型、相对残差阈值与迭代次数、基本解类型（Laplace/Helmholtz/弹性）。

## 设置错误的症状与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 近场场量随网格加密不收敛 | $r/h<3$ 的单元仍用 $4$ 点求积 | 把近场档求积点数提到 $20$，观察是否收敛 |
| 迭代次数超过 $500$ 且残差停滞 | 未做预条件或矩阵接近奇异 | 启用块对角预条件，并检查是否落在 $f=c/(2a)$ 类特征频率 |
| FMM 结果与直接法差 $1\%$ 以上 | 展开阶 $p$ 过低或层数不足 | 把 $p$ 从 $8$ 提到 $14$ 重跑 |
| 内存需求比估算高 $4$ 倍 | 用了全模型而非对称半模型 | 检查对称面类型并改用半模型 |
| 对称缩减后丢失整阶模态 | 对称面类型选反（刚性壁面与压力释放面混用） | 用非对称模型对照前 3 阶模态 |
| 单元数比估算高 $6$ 倍 | 用四面体表面三角形数代替边界单元数 | 按 $4\pi a^2/h^2$ 重算并与求解器输出比较 |

## 可复算的设置脚本

```python
import math
def budget(a, f, c, nlam, bytes_per=16):
    lam = c/f
    h   = lam/nlam
    N   = int(4*math.pi*a*a/(h*h))
    mem = bytes_per*N*N/2**30
    lu  = 2.0/3.0*N**3
    levels = max(1, int(math.ceil(math.log2(N)/2)))
    return lam, h, N, mem, lu, levels

for f in (1e3, 5e3, 10e3):
    lam, h, N, mem, lu, lv = budget(1.0, f, 343.0, 6)
    print(f"f={f/1e3:5.1f}kHz h={h*1e3:6.2f}mm N={N:7d} "
          f"mem={mem:9.2f}GiB LU={lu:.2e} fmm_levels={lv}")
# f=  1.0kHz h= 57.17mm N=   3845 mem=     0.22GiB LU=3.79e+10 fmm_levels=6
# f=  5.0kHz h= 11.43mm N=  96131 mem=   137.70GiB LU=5.92e+14 fmm_levels=9
# f= 10.0kHz h=  5.72mm N= 384528 mem=  2203.42GiB LU=3.79e+16 fmm_levels=10
```

## 参考文献

1. Brebbia, C. A. & Dominguez, J. *Boundary Elements: An Introductory Course*. 2nd ed., Computational Mechanics Publications, 1992.
2. Brebbia, C. A., Telles, J. C. F. & Wrobel, L. C. *Boundary Element Techniques: Theory and Applications in Engineering*. Springer, 1984.
3. Liu, Y. J. *Fast Multipole Boundary Element Method: Theory and Applications in Engineering*. Cambridge University Press, 2009.
4. Greengard, L. & Rokhlin, V. A fast algorithm for particle simulations. *Journal of Computational Physics*, 73(2): 325-348, 1987.
5. Wu, T. W. *Boundary Element Acoustics: Fundamentals and Computer Codes*. WIT Press, 2000.
6. Schenck, H. A. Improved integral formulation for acoustic radiation problems. *Journal of the Acoustical Society of America*, 44(1): 41-58, 1968.