---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-topology-optimization-engineering-setup
title: "拓扑优化：工程设置与参数选择"
summary: "给出一套可复用的最小柔度拓扑优化参数配置：单元尺寸与滤波半径配对、惩罚指数分级、MMA 渐近线与移动限取值、体积约束的质量换算，以及增材制造最小壁厚与悬垂角约束的施加方式。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "拓扑优化"
  - "工程设置与参数选择"
  - "MMA 渐近线"
  - "最小壁厚约束"
seo:
  title: "拓扑优化：工程设置与参数选择"
  description: "给出一套可复用的最小柔度拓扑优化参数配置：单元尺寸与滤波半径配对、惩罚指数分级、MMA 渐近线与移动限取值、体积约束的质量换算，以及增材制造最小壁厚与悬垂角约束的施加方式。"
  keywords:
    - "拓扑优化"
    - "工程设置与参数选择"
    - "MMA"
    - "滤波半径"
    - "增材制造约束"
---

# 拓扑优化：工程设置与参数选择

拓扑优化的结果对参数配置极其敏感，同一模型换一组滤波半径或移动限就会得到完全不同的构件。本文给出一套可直接复用的参数组合，以 200 mm × 100 mm × 5 mm 钢板悬臂梁为例，并说明每个取值的来源与复核方式。

## 网格尺寸先定，再定滤波半径

设计域离散成 1.0 mm 的四边形单元时，最小构件尺度由滤波半径控制：

$$ d_{\min}\approx 2r_{\min},\qquad r_{\min}=n_e\,h_e $$

$h_e$ 是单元边长，$n_e$ 是滤波覆盖的单元层数，工程取 1.5～3。若要求最小壁厚 6 mm，则 $r_{\min}=3.0$ mm，即 3 个单元。网格加密到 0.5 mm 时 $r_{\min}$ 必须保持 3.0 mm（此时覆盖 6 个单元），否则最小尺度随网格缩小，结构会越来越细。

## 惩罚指数分级推进

直接令 $p=3$ 会让早期迭代陷入局部极小。可复用的三级安排：第 1～40 次 $p=1$，第 41～80 次 $p=2$，第 81～150 次 $p=3$。每级切换后目标会跳变一次，这属正常；若切换后 10 次迭代内目标反弹超过 5%，说明切换过早，应把该级迭代数加倍。

## MMA 渐近线与移动限的取值

MMA 把子问题写成可分离有理式，渐近线按相邻两步的设计变量变化更新：

$$ L_i^{(k+1)}=x_i^{(k)}-\gamma\left(x_i^{(k)}-L_i^{(k)}\right),\qquad U_i^{(k+1)}=x_i^{(k)}+\gamma\left(U_i^{(k)}-x_i^{(k)}\right) $$

$\gamma$ 是渐近线扩张系数，迭代靠近时取 0.7，远离时取 1.2。移动限把单步密度变化限制在 0.01～0.1：取 0.1 收敛快但易振荡，取 0.02 平稳但迭代数约翻倍。

## 体积约束与质量换算

体积约束 $\sum_e v_e x_e \le V^{\star}\sum_e v_e$ 用二分法更新拉格朗日乘子严格满足，$V^{\star}=0.40$。设计域体积为

$$ 200\times100\times5=1.0\times10^{5}\ \mathrm{mm^{3}}=1.0\times10^{-4}\ \mathrm{m^{3}} $$

Q355 钢密度 7850 kg/m³ 时实体质量 0.785 kg，按 $V^{\star}=0.40$ 优化后为 0.314 kg，减重 0.471 kg（60%）。

## 制造约束必须在优化中施加

增材制造要求悬垂面与基板夹角不小于 45°；减材制造的最小壁厚由刀具半径决定，通常 3 mm。这两类约束若在优化后才检查，往往需要返工。正确做法是在灵敏度中叠加悬垂惩罚项，或在体积约束之外增加最小壁厚约束。

## 参数表与配置模板

| 参数 | 取值 | 依据 |
|---|---|---|
| 单元边长 $h_e$ | 1.0 mm | 与 6 mm 最小壁厚匹配 |
| 滤波半径 $r_{\min}$ | 3.0 mm | $d_{\min}\approx2r_{\min}$ |
| 体积分数 $V^{\star}$ | 0.40 | 目标减重 60% |
| 惩罚指数 | 1→2→3 | 分级避免局部极小 |
| 移动限 | 0.02 | 抑制振荡 |
| 渐近线系数 $\gamma$ | 0.7 / 1.2 | 近/远更新 |
| 收敛容差 | $10^{-3}$ | $\lVert\Delta x\rVert_\infty$ |
| 密度阈值 | 0.5 | 后处理二值化 |
| 空洞模量 $E_{\min}$ | $10^{-9}E_0$ | 避免刚度矩阵奇异 |

```python
cfg = dict(h_e=1.0, r_min=3.0, Vf=0.40, Emin_ratio=1e-9,
           p_schedule=[(1, 1, 40), (2, 41, 80), (3, 81, 150)],
           move_limit=0.02, gamma_near=0.7, gamma_far=1.2,
           tol=1e-3, threshold=0.5)
for p, k0, k1 in cfg["p_schedule"]:
    for k in range(k0, k1 + 1):
        K = assemble(x, p, cfg["Emin_ratio"])
        u = solve(K, f)
        dc = filter_sens(sens(x, p, u), cfg["r_min"])
        x_prev = x
        x, lam = mma(x, dc, cfg["Vf"], cfg["move_limit"])
        if max(abs(x - x_prev)) < cfg["tol"]:
            break
```

## 交付前的复核

阈值化到 0.5 后要重新求解一次真实模型，报告柔度损失；若损失超过 5%，说明阈值切掉了承载路径，应把阈值降到 0.3 或启用投影后再优化。同时核对体积残差是否小于 $10^{-6}$，以及每步状态求解是否真正收敛——未收敛的状态解会让灵敏度带噪。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 构件随网格加密变细 | $r_{\min}$ 未按物理长度换算 | 保持 $r_{\min}=3.0$ mm 重算 |
| 迭代目标持续振荡 | 移动限过大 | 移动限由 0.1 降到 0.02 |
| 体积超出上限 0.5% 以上 | 乘子更新用罚函数 | 检查每步体积残差是否小于 $10^{-6}$ |
| 悬垂面报错 | 未施加 45° 悬垂约束 | 统计悬垂单元占比 |
| 减重未达标 | 阈值化后未复算 | 比较阈值前后柔度 |

## 参考文献

1. Sigmund O., Petersson J., "Numerical instabilities in topology optimization: a survey on procedures dealing with checkerboards, mesh-dependencies and local minima," *Structural Optimization*, 16, 1998.
2. Svanberg K., "The method of moving asymptotes—a new method for structural optimization," *International Journal for Numerical Methods in Engineering*, 24, 1987.
3. Zhou M., Rozvany G.I.N., "The COC algorithm, Part II: topological, geometrical and generalized shape optimization," *Computer Methods in Applied Mechanics and Engineering*, 89, 1991.
4. Wang F., Lazarov B.S., Sigmund O., "On projection methods, convergence and robust formulations in topology optimization," *Structural and Multidisciplinary Optimization*, 43, 2011.
5. Deaton J.D., Grandhi R.V., "A survey of structural and multidisciplinary continuum topology optimization: post 2000," *Structural and Multidisciplinary Optimization*, 49, 2014.
