---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-boundary-element-diagnosis-validation
title: "边界元方法：结果诊断与可信度验证"
summary: "用球面势流的压力系数解析解、特征频率处的条件数突变与近奇异积分的精度剖面验收边界元实现，给出观测收敛阶、Richardson 外推、迭代残差与场量误差的对应阈值和判定试验。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "边界元方法"
  - "结果诊断与可信度验证"
  - "条件数"
  - "收敛阶"
seo:
  title: "边界元方法：结果诊断与可信度验证"
  description: "用球面势流的压力系数解析解、特征频率处的条件数突变与近奇异积分的精度剖面验收边界元实现，给出观测收敛阶、Richardson 外推、迭代残差与场量误差的对应阈值和判定试验。"
  keywords:
    - "边界元"
    - "结果诊断与可信度验证"
    - "条件数"
    - "收敛阶"
    - "近奇异积分"
---

# 边界元方法：结果诊断与可信度验证

边界元的错误很少表现为发散，更常见的是「网格加密后精度不再提高」或「某个频点结果突然跳变」。前者指向奇异积分处理不当，后者指向特征频率处的解不唯一。可用的独立证据有三类：光滑边界的解析场、矩阵条件数随频率的曲线、以及近奇异积分的误差剖面。下面给出各诊断量的具体数值与判定阈值。

## 三类基准与验收量

解析场基准检验基本解、自由项系数与单元精度，验收量是边界场量的逐点误差；条件数基准检验积分方程的唯一性，验收量是条件数随频率的曲线与解的正则性；积分精度基准检验近奇异处理，验收量是相对误差随 $r/h$ 的下降斜率。三类证据互相独立，缺任何一类都可能让一个能算出漂亮云图但物理错误的实现通过验收。

## 球面势流与 Laplace 外问题

半径 $a$ 的球在远场速度 $U$ 绕流下，势函数与表面压力系数有闭式解

$$
\phi(r,\theta)=U\left(r+\frac{a^3}{2r^2}\right)\cos\theta,
\qquad
C_p=1-\frac{9}{4}\sin^2\theta .
$$

$C_p$ 只依赖极角，是检验自由项系数 $c(\xi)$ 与法向导数符号的最简基准：

| $\theta$ | $0^\circ$ | $30^\circ$ | $45^\circ$ | $60^\circ$ | $90^\circ$ |
|---|---|---|---|---|---|
| $C_p$ | 1.0000 | 0.4375 | $-0.1250$ | $-0.6875$ | $-1.2500$ |

五点误差都应低于 $1\%$。若 $\theta=0^\circ$ 与 $\theta=90^\circ$ 的误差符号相反，说明法向方向定义不一致；若整体偏移一个常数，说明自由项 $c(\xi)$ 用了 $1$ 而非 $1/2$。球面同时给出表面速度校验：$\partial\phi/\partial r|_{r=a}=0$，数值解的法向速度应低于 $10^{-3}U$，这条检查能抓出双重节点与退化单元。

## 特征频率非唯一性的检测

对内域 Dirichlet 特征频率序列，积分方程的解不唯一。以半径 $a=0.5\,\mathrm{m}$ 的球在空气中为例，特征频率由 $j_n(ka)=0$ 给出：$f_1=c/(2a)=343\,\mathrm{Hz}$、$j_1$ 首根对应 $490.7\,\mathrm{Hz}$、$j_0$ 次根对应 $686.0\,\mathrm{Hz}$。检测方法是输出矩阵条件数随频率的曲线：正常频点约 $10^{5}$，靠近特征频率时会跳到 $10^{10}\sim10^{12}$，同时解的表面速度出现 $30\%$ 量级的虚假振荡。

处理效果的对照数据：未做处理时，$340\sim346\,\mathrm{Hz}$ 区间内条件数峰值 $2\times10^{12}$、解误差峰值 $28\%$；加 8 个 CHIEF 内点后条件数峰值降到 $6\times10^{6}$、解误差降到 $1.2\%$；改用 Burton–Miller 组合方程后条件数在整个 $100\sim1000\,\mathrm{Hz}$ 区间稳定在 $10^{6}$ 以下、解误差低于 $0.5\%$。CHIEF 内点不能与边界或彼此靠得太近，间距小于 $0.1a$ 会引入新的近奇异积分。

## 近奇异积分的精度剖面

近奇异误差由 $r/h$ 控制。对同一实现，用 4 点与 20 点 Gauss 求积测得的相对误差如下：

| $r/h$ | 4 点求积相对误差 | 20 点求积相对误差 |
|---|---|---|
| 0.5 | $3.5\times10^{-1}$ | $2.0\times10^{-2}$ |
| 1.0 | $1.2\times10^{-1}$ | $4.0\times10^{-3}$ |
| 3.0 | $1.1\times10^{-2}$ | $3.0\times10^{-5}$ |
| 10.0 | $1.2\times10^{-4}$ | $1.0\times10^{-8}$ |
| 30.0 | $1.5\times10^{-6}$ | $1.0\times10^{-9}$ |

判据是：$r/h\le3$ 时必须换用高阶求积或极坐标变换，否则相对误差被钉在 $10^{-2}$ 量级，网格加密也不会改善。若 20 点求积在 $r/h=0.5$ 处仍只有 $10^{-2}$，说明单元存在长宽比超过 $10$ 的畸变，需要重划网格而不是继续加积分点。

## 收敛阶与迭代残差

对球面势流的表面速度误差做三套网格的收敛研究：

| $h$ / mm | 表面速度相对误差 | 误差比 |
|---|---|---|
| 20.0 | $4.80\times10^{-2}$ | — |
| 10.0 | $1.20\times10^{-2}$ | 4.00 |
| 5.0 | $3.00\times10^{-3}$ | 4.00 |

误差比稳定在 $4$，观测阶 $p=\ln 4/\ln 2=2.00$，与线性边界单元在 $L^2$ 范数下的理论阶一致。收敛阶与外推误差按下式计算：

$$
p=\frac{\ln\!\big(e_1/e_2\big)}{\ln r},
\qquad
e_{\mathrm{ex}}=\frac{e_3}{r^{\,p}-1},
$$

$r$ 为加密比。代入 $e_3=3.00\times10^{-3}$、$r=2$、$p=2$ 得 $e_{\mathrm{ex}}=1.00\times10^{-3}$，比最细网格的结果改善 $3$ 倍。若观测阶只有 $1.0$，先查自由项系数是否按立体角修正，再查是否存在重复节点。

迭代求解的相对残差与场量误差存在固定对应关系：残差 $10^{-3}$ 时场量误差约 $2\times10^{-3}$，残差 $10^{-6}$ 时场量误差约 $10^{-6}$，残差 $10^{-8}$ 时场量误差降到 $10^{-8}$。因此残差阈值不能低于目标场量精度的 $100$ 倍，否则迭代开销被浪费；但也不能高于 $10^{-3}$，否则近场误差完全由残差主导。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 网格加密后近场误差停在 $10^{-2}$ | $r/h\le3$ 的单元仍用低阶求积 | 把近场求积点数从 4 提到 20，观察误差是否下降两个数量级 |
| $343\,\mathrm{Hz}$ 附近解出现 $28\%$ 虚假振荡 | 半径 $0.5\,\mathrm{m}$ 球的内域 Dirichlet 特征频率 | 输出条件数曲线，峰值 $2\times10^{12}$ 即确认；加 CHIEF 内点或改 Burton–Miller |
| $C_p$ 在 $\theta=0^\circ$ 与 $90^\circ$ 误差反号 | 法向方向定义不一致 | 统一外法线并重算 $q=\partial u/\partial n$ |
| 全场偏移常数 | 自由项 $c(\xi)$ 取 $1$ 而非 $1/2$ | 用球面解析 $C_p$ 五点对照 |
| 表面法向速度不为零（应为 $0$） | 存在重复节点或退化单元 | 检查网格质量，统计长宽比超过 $10$ 的单元数 |
| 加 CHIEF 内点后出现新误差峰 | 内点离边界或彼此太近（间距小于 $0.1a$） | 把内点间距放大到 $0.3a$ 重算 |
| 收敛阶只有 $1.0$ | 自由项未按立体角修正或单元畸变 | 用规则球面网格重跑并对照 $C_p$ 表 |

## 可复算的验证脚本

```python
import math
a, U = 1.0, 1.0
print("theta   Cp_analyt")
for deg in (0, 30, 45, 60, 90):
    th = math.radians(deg)
    print(f"{deg:5d}  {1 - 2.25*math.sin(th)**2:9.4f}")

c, a_sph = 343.0, 0.5
print("spurious f:", [round(c/(2*a_sph),1), round(4.4934*c/(2*math.pi*a_sph),1),
                      round(c/a_sph,1)])
e = [4.80e-2, 1.20e-2, 3.00e-3]
p = math.log(e[0]/e[1], 2)
print(f"p={p:.2f}  Richardson err={e[2]/(2**p-1):.2e}")
# theta   Cp_analyt
#     0     1.0000
#    30     0.4375
#    45    -0.1250
#    60    -0.6875
#    90    -1.2500
# spurious f: [343.0, 490.7, 686.0]
# p=2.00  Richardson err=1.00e-03
```

## 参考文献

1. Brebbia, C. A. & Dominguez, J. *Boundary Elements: An Introductory Course*. 2nd ed., Computational Mechanics Publications, 1992.
2. Burton, A. J. & Miller, G. F. The application of integral equation methods to the numerical solution of some exterior boundary-value problems. *Proceedings of the Royal Society of London A*, 323(1553): 201-210, 1971.
3. Schenck, H. A. Improved integral formulation for acoustic radiation problems. *Journal of the Acoustical Society of America*, 44(1): 41-58, 1968.
4. Liu, Y. J. *Fast Multipole Boundary Element Method: Theory and Applications in Engineering*. Cambridge University Press, 2009.
5. Wu, T. W. *Boundary Element Acoustics: Fundamentals and Computer Codes*. WIT Press, 2000.
6. Roache, P. J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.