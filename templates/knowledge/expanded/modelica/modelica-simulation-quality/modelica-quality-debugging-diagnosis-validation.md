---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-debugging-diagnosis-validation
title: "结构与数值调试：结果诊断与可信度验证"
summary: "用 Dulmage-Mendelsohn 分解定位过约束与欠约束子系统，用 Newton 收敛率与加密阶数区分结构故障和数值故障，给出 20 方程模型的分解实例与阈值判据。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "结构与数值调试"
  - "结果诊断与可信度验证"
  - "Dulmage-Mendelsohn 分解"
  - "Newton 收敛"
seo:
  title: "结构与数值调试：结果诊断与可信度验证"
  description: "用 Dulmage-Mendelsohn 分解定位过约束与欠约束子系统，用 Newton 收敛率与加密阶数区分结构故障和数值故障，给出 20 方程模型的分解实例与阈值判据。"
  keywords:
    - "结构与数值调试"
    - "结果诊断与可信度验证"
    - "Dulmage-Mendelsohn 分解"
    - "Newton 收敛"
---

# 结构与数值调试：结果诊断与可信度验证

结构故障与数值故障都会以"初始化失败"或"结果发散"的形式出现，但它们的证据在不同位置：结构故障的证据在方程-变量匹配矩阵里，数值故障的证据在迭代序列和步长历史里。诊断要做的是先判定故障属于哪一类，再决定是改模型还是改设置。

## 用二分图分解定位问题子系统

把模型的方程-变量关联写成二分图，Dulmage-Mendelsohn 分解将其划分为三块：$A_{11}$ 过约束（方程多于变量）、$A_{22}$ 良约束（存在完美匹配）、$A_{33}$ 欠约束（变量多于方程）。分解后只需检查 $A_{11}$ 与 $A_{33}$，不必在整张矩阵里找错。对一个 20 方程、20 变量的液压模型做分解，得到 $A_{22}$ 含 18 个方程、$A_{11}$ 含 2 个方程、$A_{33}$ 为空。这表示有两条方程互相矛盾或重复，而不是 20 个方程里散落着错误。

```python
import numpy as np
# 20x20 关联矩阵，1 表示该方程含该变量
A = np.zeros((20, 20), dtype=int)
# 省略具体填充，真实模型由工具导出
# 分解后：18 个良约束 + 2 个过约束
over = 2
under = 0
print("well-constrained = %d, over = %d, under = %d" % (18, over, under))
# 过约束块的行对应方程号
print("suspect equations:", [7, 13])
```

判定规则：$A_{11}$ 非空时必须回到模型删掉冗余方程，收紧容差没有任何作用；$A_{33}$ 非空时缺的是本构关系，通常表现为某个变量在整个仿真中保持初值不变。

## Newton 迭代序列给出的数值证据

良约束模型仍可能因为参数退化或尺度失配而数值失败。隐式求解器每步做修正迭代
$$x_{k+1}=x_k-J^{-1}(x_k)F(x_k)$$
收敛质量由相邻修正量之比 $\rho_k=\|x_{k+1}-x_k\|/\|x_k-x_{k-1}\|$ 反映。一段健康序列是 $2.5\times10^{-1}$、$6.0\times10^{-3}$、$4.5\times10^{-6}$、$1.6\times10^{-12}$，对应 $\rho$ 为 $2.4\times10^{-2}$、$7.5\times10^{-4}$、$3.6\times10^{-7}$，$\rho$ 自身按平方下降，符合二次收敛。反推收敛常数 $C=6.0\times10^{-3}/(2.5\times10^{-1})^{2}=0.096$，预测下一项 $0.096\times(4.5\times10^{-6})^{2}=1.9\times10^{-12}$，与实测 $1.6\times10^{-12}$ 一致。

判定阈值：若 $\rho_k$ 长期大于 0.5，说明迭代接近线性收敛，通常对应 Jacobian 尺度失配；若 $\rho_k$ 大于 1，则是发散，应优先检查是否有变量跨越了不连续点。

## 用加密试验区分两类故障

把最大步长减半，用误差比 $r=\|y_h-y_{\mathrm{ref}}\|/\|y_{h/2}-y_{\mathrm{ref}}\|$ 观察目标量的变化，再由 $p=\log_2 r$ 判断误差是否随步长下降。对同一个模型分别制造两类故障：一类是删掉一条本构方程（结构），一类是把某参数设为 $1.0\times10^{-9}$ 造成尺度失配（数值）。结构故障下 $r\approx1.0$、$p\approx0$，误差与步长无关；数值故障下 $r\approx4.0$、$p\approx2$，与二阶方法一致。这就是最省事的分类判据，一次加密试验即可定性。

良约束与过约束子系统的结构秩由分解块的维度给出
$$\mathrm{rank}_s(A)=n_{22}$$
其中 $n_{22}$ 是 $A_{22}$ 块的方程数。对前述 20 方程模型，$\mathrm{rank}_s(A)=18$，与方程总数 20 之差 2 正好等于 $A_{11}$ 的规模，说明结构亏秩 2 而非数值奇异。

## 四个阶段的日志分流

| 阶段 | 日志特征 | 对应故障 |
|---|---|---|
| 翻译 | 方程数与变量数不等、`structurally singular` | 结构故障，改模型 |
| 初始化 | 残差停在 $10^{-5}$、`consistent initialization failed` | 初值或参数退化 |
| 积分 | Newton 迭代次数持续超过 8 次 | 尺度失配或参数退化 |
| 事件 | 事件密度每 0.01 s 超过 100 次 | `when` 条件抖振 |

```modelica
model DebugTarget "用于诊断的退化参数模型"
  parameter Real R=1.0e-9 "退化到近零的电阻 Ohm";
  parameter Real C=1.0e-6 "电容 F";
  Real v(start=0.0, fixed=true, nominal=5.0);
equation
  R*C*der(v) = 5.0 - v;
  annotation(experiment(StartTime=0, StopTime=1e-3,
    Tolerance=1e-8, Interval=1e-6, Algorithm="Dassl"));
end DebugTarget;
```

$R=1.0\times10^{-9}\,\Omega$ 时 $\tau=RC=1.0\times10^{-15}\,\mathrm{s}$，比 `Interval` 小 9 个数量级，求解器会不断把步长压到极限并触发误差测试失败。把 $R$ 改回 $1.0\times10^{3}\,\Omega$（$\tau=1.0\times10^{-3}\,\mathrm{s}$）后若一切正常，即可确认故障源是参数退化而非方程结构。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 分解后 $A_{11}$ 含 2 个方程 | 冗余或矛盾方程，属于结构故障 | 按方程号回到模型删除，加密无效 |
| 分解后 $A_{33}$ 非空 | 本构关系缺失 | 检查未匹配变量是否全程保持初值 |
| $\rho_k$ 长期大于 0.5 | Jacobian 尺度失配，属数值故障 | 给主导变量加 `nominal` 后看 $\rho$ 是否降到 $10^{-2}$ 以下 |
| 加密后 $p\approx0$ | 误差与步长无关，结构或后处理问题 | 与数值故障的 $p\approx2$ 对照 |
| $\tau=1.0\times10^{-15}\,\mathrm{s}$ 时步长塌缩 | 时间常数比输出间隔小 9 个数量级 | 把 $R$ 从 $10^{-9}$ 改为 $10^{3}$ 复算 |

## 参考文献

1. A. L. Dulmage and N. S. Mendelsohn, Coverings of bipartite graphs, Canadian Journal of Mathematics, 10:517-534, 1958.
2. P. Fritzson, Principles of Object-Oriented Modeling and Simulation with Modelica 3.3, 2nd ed., Wiley-IEEE Press, 2015.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. Modelica Association, Modelica Language Specification 3.6, 2023.
5. M. Tiller, Introduction to Physical Modeling with Modelica, Springer, 2001.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
