---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-verification-plan-diagnosis-validation
title: "分层验证计划：结果诊断与可信度验证"
summary: "给出单元测试、制造解、基准题与系统确认四层的证据分工、观测收敛阶要求与验收阈值，附 MMS 源项推导与二阶验证手算、顶盖驱动方腔基准对照，以及比较误差与验证不确定度的判定规则。"
category:
  slug: cae-algorithm-map
  name: "CAE 算法全景图"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "CAE 算法全景图"
  - "分层验证计划"
  - "结果诊断与可信度验证"
  - "制造解法"
  - "验证不确定度"
seo:
  title: "分层验证计划：结果诊断与可信度验证"
  description: "给出单元测试、制造解、基准题与系统确认四层的证据分工、观测收敛阶要求与验收阈值，附 MMS 源项推导与二阶验证手算、顶盖驱动方腔基准对照，以及比较误差与验证不确定度的判定规则。"
  keywords:
    - "分层验证计划"
    - "结果诊断与可信度验证"
    - "制造解方法"
    - "观测收敛阶"
    - "验证不确定度"
---

# 分层验证计划：结果诊断与可信度验证

分层验证的核心是"每一层只证明一件事"，且每层都有可量化的通过阈值。本文给出单元测试、制造解、基准题与系统确认四层的观测收敛阶要求、验收阈值与判定试验，并说明为什么制造解必须能测出二阶，而基准题只能确认 1% 量级的偏差。

## 四层的证据分工

| 层级 | 回答的问题 | 通过判据 | 典型规模 |
|---|---|---|---|
| 单元测试 | 单个算子实现是否正确 | 与解析结果相对误差 $\le10^{-12}$ | 1～10 个单元 |
| 制造解（MMS） | 离散格式的观测阶是否达标 | $p_{obs}\ge p_{theo}-0.1$ | $10^2\sim10^5$ 单元，3～4 套网格 |
| 基准题 | 完整求解链在已知解上的偏差 | 目标量相对偏差 $\le2\%$ | $10^4\sim10^6$ 单元 |
| 系统确认 | 真实工程模型是否可信 | $|E|\le U_{val}$ | 与实验同尺度的完整模型 |

四层的阈值量级相差极大：单元测试要求 $10^{-12}$，MMS 要求的是阶数，基准题要求 1%～2%，系统确认要求比较误差不超过验证不确定度。把四层混用一套容差，是"验证做了但没用"的常见原因。

## 制造解：唯一能测出收敛阶的手段

制造解的做法是先选解析函数 $u_{exact}$，代入控制方程反求源项，再把源项作为已知输入求解。以二维泊松方程 $-\nabla^2 u=f$ 为例，取

$$u_{exact}(x,y)=\sin(\pi x)\sin(\pi y),\qquad f=2\pi^{2}\sin(\pi x)\sin(\pi y),$$

$f$ 的量级为 $2\pi^2\approx19.74$（无量纲）。在单位正方形上取 $h=1/8,1/16,1/32$ 三套网格，中心差分格式的理论阶 $p_{theo}=2$。若三套网格的 $L_2$ 误差为 $0.0120,0.00300,7.5\times10^{-4}$，则

$$p_{obs}=\frac{\ln(0.0120/0.00300)}{\ln 2}=\frac{1.3863}{0.6931}=2.00,\qquad \frac{\ln(0.00300/7.5\times10^{-4})}{\ln 2}=2.00 .$$

两段都是 2.00 阶，说明实现正确。判据是 $p_{obs}\ge1.9$（即理论阶减 0.1）；若只有 1.2 阶，常见根因是边界单元未使用正确的源项，或网格非均匀使 $h$ 失去意义。

## 基准题：把偏差压到 2% 以内

基准题提供与网格无关的公认参考值。以二维顶盖驱动方腔 $Re=1000$ 为例，Ghia 等给出的垂直中线 $x=0.5$、$y=0.5$ 处水平速度为 $u=-0.38289$。若 $256\times256$ 网格上算得 $u=-0.37890$，则相对偏差

$$E_{bench}=\frac{|-0.37890-(-0.38289)|}{|-0.38289|}=\frac{0.00399}{0.38289}=1.04\%,$$

落在 2% 阈值内，基准题通过。若改用 $64\times64$ 网格得到 $u=-0.3342$，偏差 12.7%，此时不能宣布"求解器不对"，而应先用 MMS 确认格式阶数，再检查该网格下壁面附近 $\Delta y^{+}$ 是否过大——这正是分层验证的意义：基准题失败时，用 MMS 结果区分格式问题与分辨率问题。

## 系统确认：比较误差与验证不确定度

系统确认把计算值 $S$ 与实验值 $D$ 对比，判据不是"偏差小于 5%"，而是比较误差不超过验证不确定度：

$$E=D-S,\qquad U_{val}=\sqrt{U_{num}^{2}+U_{input}^{2}+U_{D}^{2}},$$

$U_{num}$ 为数值不确定度（由 GCI 给出），$U_{input}$ 为输入参数不确定度，$U_{D}$ 为实验测量不确定度。手算：某换热器出口温度计算值 $S=412.6\ \mathrm{K}$、实验值 $D=432.0\ \mathrm{K}$，比较误差 $E=432.0-412.6=19.4\ \mathrm{K}$，相对 $4.5\%$；若 $U_{num}=1.8\%$、$U_{input}=3.6\%$、$U_{D}=2.0\%$，则

$$U_{val}=\sqrt{1.8^{2}+3.6^{2}+2.0^{2}}\%=4.5\%.$$

此时 $|E|=4.5\%$ 恰等于 $U_{val}=4.5\%$，处于临界；只要把 $U_{input}$ 从 3.6% 降到 2.0%，$U_{val}$ 就降到 3.4%，模型即被判定为不可确认，必须修正物理模型。这说明系统确认的结论对输入不确定度极其敏感，必须先量化输入。

```
# 分层验证矩阵（YAML 片段）
levels:
  unit_test:
    scope: "single flux operator"
    criterion: "rel_err <= 1e-12"
    status: PASS
  mms:
    grids: [8, 16, 32]
    p_theory: 2.0
    p_obs: 2.00
    criterion: "p_obs >= p_theory - 0.1"
    status: PASS
  benchmark:
    case: "lid-driven cavity Re=1000"
    ref_u: -0.38289
    computed_u: -0.37890
    rel_err: 0.0104
    criterion: "rel_err <= 0.02"
    status: PASS
  system_validation:
    E_rel: 0.045
    U_val: 0.045
    criterion: "abs(E) <= U_val"
    status: MARGINAL
```

## 失败模式：现象、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| MMS 观测阶只有 1.2 而理论为 2 | 边界单元源项实现错误 | 把解析解直接作为边界值，重算边界附近误差 |
| 三套网格 $p_{obs}$ 为负 | 网格未进入渐近区或解非光滑 | 补 $h=1/64$，检查解是否存在奇点 |
| 基准题偏差 12.7% 但 MMS 通过 | 分辨率不足或壁面处理不当 | 加密网格并检查 $\Delta y^{+}$ |
| 系统确认 $|E|$ 略大于 $U_{val}$ | 输入不确定度被低估 | 重新量化材料与边界不确定度 |
| 同一基准题不同软件差 3% | 目标量定义或采样位置不同 | 统一采样点与插值方式 |
| 单元测试通过但整体结果错 | 组装或边界条件错误 | 在 MMS 层级增加边界条件变体 |

## 验证计划的交付物

一个完整的分层验证计划应包含：算子清单与单元测试用例、MMS 的解析解与源项表达式、三套以上网格的 $p_{obs}$、基准题参考值与来源、系统确认的 $E$ 与 $U_{val}$ 分解。缺 MMS 观测阶时，"结果合理"没有任何量化含义；缺 $U_{val}$ 分解时，"与实验吻合"无法判断是模型准确还是容差过宽。

参考文献：

1. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
2. Oberkampf, W. L., & Roy, C. J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
3. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
4. Ghia, U., Ghia, K. N., & Shin, C. T., "High-Re solutions for incompressible flow using the Navier-Stokes equations and a multigrid method", *Journal of Computational Physics*, 48(3), 387–411, 1982.
5. Salari, K., & Knupp, P., "Code verification by the method of manufactured solutions", Sandia National Laboratories Report SAND2000-1444, 2000.
6. AIAA, *Guide for the Verification and Validation of Computational Fluid Dynamics Simulations*, AIAA G-077-1998, 1998.
