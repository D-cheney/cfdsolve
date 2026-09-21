---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-topology-optimization-diagnosis-validation
title: "拓扑优化：结果诊断与可信度验证"
summary: "用解析梁解、网格收敛与 Richardson 外推、灰度指数 M_nd、阈值化损失四组证据审查拓扑优化结果，给出 GCI 与灰度指数的具体计算步骤和可交付阈值。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "拓扑优化"
  - "结果诊断与可信度验证"
  - "灰度指数"
  - "网格收敛"
seo:
  title: "拓扑优化：结果诊断与可信度验证"
  description: "用解析梁解、网格收敛与 Richardson 外推、灰度指数 M_nd、阈值化损失四组证据审查拓扑优化结果，给出 GCI 与灰度指数的具体计算步骤和可交付阈值。"
  keywords:
    - "拓扑优化"
    - "结果诊断与可信度验证"
    - "Richardson 外推"
    - "灰度指数"
    - "阈值化损失"
---

# 拓扑优化：结果诊断与可信度验证

拓扑优化的解没有解析基准，因此可信度必须靠一组自洽的证据建立：解析对照、网格收敛、灰度度量与阈值化损失。四类证据缺一不可——只看目标函数下降，无法区分真实改善与网格退化。

## 先验证有限元本身，再谈优化

用等截面悬臂梁做解析对照：长 $L=100$ mm、宽 $b=20$ mm、高 $h=40$ mm、端部集中力 $F=1000$ N、$E=210$ GPa。惯性矩

$$ I=\frac{bh^{3}}{12}=\frac{0.02\times0.04^{3}}{12}=1.067\times10^{-7}\ \mathrm{m^{4}} $$

端部挠度由 Euler–Bernoulli 梁给出

$$ \delta=\frac{FL^{3}}{3EI}=\frac{1000\times0.1^{3}}{3\times2.1\times10^{11}\times1.067\times10^{-7}}=1.49\times10^{-5}\ \mathrm{m} $$

即 0.0149 mm。有限元模型若与它相差超过 2%，说明单元、约束或载荷施加有误，此前的优化结果一律无效。

## 网格收敛与 Richardson 外推

在 60×20、120×40、240×80 三套网格上跑同一问题，柔度分别为 13.20、12.55、12.39。网格比 $r=2$，观测阶数

$$ p_{obs}=\frac{\ln\left|\frac{J_3-J_2}{J_2-J_1}\right|}{\ln r}=\frac{\ln\left|\frac{12.39-12.55}{12.55-13.20}\right|}{\ln 2}=2.02 $$

二阶收敛说明单元与滤波实现正确。网格收敛指数

$$ GCI=1.25\,\frac{|J_3-J_2|/J_3}{r^{p_{obs}}-1}=1.25\times\frac{0.16/12.39}{2^{2.02}-1}=0.53\% $$

外推值 $J_{ext}=12.39+0.16/(2^{2.02}-1)=12.44$。若三套网格的 $p_{obs}$ 掉到 1.0 以下，通常是滤波半径随网格缩放导致的伪收敛。

## 灰度指数是比"看图"更硬的判据

离散度指标（灰度指数）

$$ M_{nd}=\frac{\sum_{e=1}^{N_e}4x_e\left(1-x_e\right)}{N_e} $$

对 $x_e\in\{0,1\}$ 的干净结构 $M_{nd}=0$。4800 个单元中若有 500 个落在 $x_e=0.5$，则 $M_{nd}=4\times0.5\times0.5\times500/4800=0.104$，即 10.4%，说明惩罚不足；只有 $M_{nd}<0.01$ 才算可交付的黑白结构。

## 阈值化损失必须复算

把密度场按 0.5 二值化后重新求解，柔度从 12.44 升到 12.90，损失 $(12.90-12.44)/12.44=3.7\%$。低于 5% 可接受；超过 10% 说明大量承载单元落在阈值附近，应降低阈值或启用 Heaviside 投影。

## 与理论下界对照

同一工况的连续体最小柔度存在松弛下界，SIMP 解必须在其上方。若优化柔度低于该下界，几乎一定是体积约束未被严格满足，先查体积残差而不是庆祝。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 三套网格柔度接近但结构不同 | 滤波半径未固定为物理长度 | 固定 $r_{\min}=3.0$ mm 重算并比较 $M_{nd}$ |
| 出现棋盘格 | 密度场与位移场插值不匹配 | 改用 9 节点单元或加密度滤波 |
| 目标在最后 20 步仍缓慢下降 | 未收敛即停止 | 容差从 $10^{-2}$ 收紧到 $10^{-3}$ |
| 阈值后柔度跳升 15% | 阈值 0.5 切掉承载路径 | 阈值降到 0.3 复算 |
| 对称工况得到不对称结构 | 初值完全对称或并行归约顺序不定 | 加 $10^{-3}$ 随机扰动并固定归约顺序 |
| 柔度低于理论下界 | 体积约束被违反 | 检查体积残差是否小于 $10^{-6}$ |

```text
可信度检查脚本
1) J = compliance(mesh) for mesh in [60x20, 120x40, 240x80]
2) p_obs = ln(|(J3-J2)/(J2-J1)|) / ln(2)          # 期望 > 1.8
3) GCI   = 1.25 * |J3-J2|/J3 / (2**p_obs - 1)     # 期望 < 1%
4) M_nd  = mean(4*x*(1-x))                        # 期望 < 0.01
5) J_th  = compliance(binary(x > 0.5))
6) loss  = (J_th - J3) / J3                       # 期望 < 5%
```

## 参考文献

1. Borrvall T., Petersson J., "Topology optimization using regularized intermediate density control," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
2. Rozvany G.I.N., "A critical review of established methods of structural topology optimization," *Structural and Multidisciplinary Optimization*, 37, 2009.
3. Diaz A., Sigmund O., "Checkerboard patterns in layout optimization," *Structural Optimization*, 10, 1995.
4. Guest J.K., Prévost J.H., Belytschko T., "Achieving minimum length scale in topology optimization using nodal design variables and projection functions," *International Journal for Numerical Methods in Engineering*, 61, 2004.
5. Aage N., Andreassen E., Lazarov B.S., Sigmund O., "Giga-voxel computational morphogenesis for structural design," *Nature*, 550, 2017.
