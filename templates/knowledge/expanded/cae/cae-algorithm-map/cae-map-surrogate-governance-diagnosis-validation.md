---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-surrogate-governance-diagnosis-validation
title: "代理模型治理：结果诊断与可信度验证"
summary: "把代理模型的可信边界写成可计算的判据：训练域杠杆值阈值、NRMSE 与预测方差指标、自动回退到高保真求解的触发逻辑，并给出调用成本与样本构建成本的盈亏平衡估算，用于设计优化中的代理治理。"
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
  - "代理模型治理"
  - "结果诊断与可信度验证"
  - "杠杆值"
  - "外推检测"
seo:
  title: "代理模型治理：结果诊断与可信度验证"
  description: "把代理模型的可信边界写成可计算的判据：训练域杠杆值阈值、NRMSE 与预测方差指标、自动回退到高保真求解的触发逻辑，并给出调用成本与样本构建成本的盈亏平衡估算，用于设计优化中的代理治理。"
  keywords:
    - "代理模型治理"
    - "结果诊断与可信度验证"
    - "杠杆值阈值"
    - "外推检测"
    - "回退条件"
---

# 代理模型治理：结果诊断与可信度验证

代理模型的风险不在精度不够，而在于"没人知道它什么时候不该被信任"。本文给出训练域边界的量化定义、三种外推检测指标及其阈值，以及触发回退到高保真求解的判定条件。适用于把 RANS、结构或热仿真结果用于设计优化的代理模型治理。

## 代理误差的三个来源

代理模型的总误差可分解为

$$\varepsilon_{total}=\varepsilon_{data}+\varepsilon_{model}+\varepsilon_{extrap},$$

$\varepsilon_{data}$ 来自训练样本本身的高保真误差（例如 RANS 的 5%～15% 模型误差），$\varepsilon_{model}$ 来自代理拟合误差，$\varepsilon_{extrap}$ 来自查询点落在训练域之外。关键结论：当 $\varepsilon_{data}=8\%$ 时，把代理拟合误差从 3% 降到 0.5% 对总误差几乎无贡献，资源应投入到提高样本质量或扩大训练域。这决定了代理治理的优先级——先管住训练域和数据质量，再谈模型精度。

## 训练域的量化定义

训练域不是"参数范围"，而是样本在参数空间中张成的凸包或核密度支撑集。对线性或多项式型代理，最直接的外推指标是杠杆值：

$$h_{ii}=x_i^{\mathsf T}\left(X^{\mathsf T}X\right)^{-1}x_i,$$

$X$ 为 $n\times p$ 的设计矩阵（$n$ 个样本、$p$ 个特征）。经验阈值

$$h^{*}=\frac{2p}{n},$$

超过 $h^*$ 的查询点被视为高杠杆点。一次可核对的手算：$n=200$、$p=5$（如叶片厚度、前缘半径、转速、流量、进口温度），则 $h^*=2\times5/200=0.05$。某查询点算得 $h=0.118$，是阈值的 2.4 倍，说明它落在样本簇边缘之外，代理预测必须标记为低置信。反过来，若把所有 $h_{ii}>0.05$ 的样本都剔除，会导致设计空间收缩——正确做法是保留样本但拒绝在该区域使用代理。

## 外推检测的三个指标

| 指标 | 定义 | 阈值 | 触发动作 |
|---|---|---|---|
| 杠杆值 $h_{ii}$ | 见上式 | $h_{ii}>2p/n$ | 标记低置信，回退高保真 |
| 归一化均方根误差 NRMSE | $\mathrm{RMSE}/(y_{\max}-y_{\min})$ | $>3\%$ | 重训或增样本 |
| 预测方差 $\hat\sigma^2(x)$（GP/Kriging） | 后验方差 | $>2\sigma_{train}^2$ | 回退高保真 |
| 交叉验证 $R^2$ | 留一或 k 折 | $<0.98$ | 检查样本覆盖 |

NRMSE 手算：某代理预测弯矩，$\mathrm{RMSE}=0.42\ \mathrm{kN\cdot m}$，训练目标范围 $y_{\max}-y_{\min}=8.0\ \mathrm{kN\cdot m}$，则 $\mathrm{NRMSE}=0.42/8.0=5.25\%$，超过 3% 阈值，该代理不能用于设计定稿，只能用于初步筛选。

## 回退条件与版本治理

回退必须是自动的、由阈值触发的，而不是人工判断。建议逻辑如下。

```
# 代理预测的置信检查与回退逻辑
def predict_with_fallback(x, surrogate, lever, gp_var, cfg):
    h = lever(x)                      # 杠杆值
    if h > cfg.h_star:                # h_star = 2*p/n
        return "FALLBACK_HIGH_FIDELITY", h
    if gp_var(x) > cfg.var_thresh:    # 2 * sigma_train^2
        return "FALLBACK_HIGH_FIDELITY", h
    y = surrogate(x)
    if not (cfg.y_min <= y <= cfg.y_max):   # 超出训练目标范围
        return "FALLBACK_OUT_OF_RANGE", y
    return y, h
```

版本治理要求每个代理记录：样本集哈希、特征定义、训练/验证划分、NRMSE 与 $R^2$、$h^*$，以及失效触发条件。当高保真模型本身升级（例如 RANS 换 LES）时，$\varepsilon_{data}$ 改变，旧代理的验证结论自动失效，必须重训——这一点最常被忽略，因为代理的数值精度没有变化，但它所逼近的对象变了。

## 成本与收益的量化

代理的价值来自调用成本比。手算：一次 RANS 计算 $3600\ \mathrm{s}$（1.0 CPU·h），代理前向预测 $0.02\ \mathrm{s}$，加速比 $3600/0.02=1.8\times10^5$。但构建成本是 $n=200$ 个样本 $\times2.0\ \mathrm{CPU\cdot h}=400\ \mathrm{CPU\cdot h}$。若优化需要 $10^5$ 次评估，直接调用高保真需 $10^5\times1.0=10^5\ \mathrm{CPU\cdot h}$，而代理方案为 $400+10^5\times0.02/3600=400+0.56=400.6\ \mathrm{CPU\cdot h}$，节省 99.6%。反之若只需 300 次评估，代理总成本 $400+300\times0.02/3600\approx400\ \mathrm{CPU\cdot h}$，远高于直接调用 $300\ \mathrm{CPU\cdot h}$——代理在低调用量下是负收益。

## 失败模式：现象、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 验证集 NRMSE 0.8% 但优化结果不可行 | 查询点外推，杠杆值超阈值 | 计算全部候选点的 $h_{ii}$ 分布 |
| 代理预测比高保真系统性偏高 12% | 训练样本来自不同网格或湍流模型 | 核对样本的求解设置哈希 |
| 加样本后精度不提升 | 训练域未扩展，$\varepsilon_{data}$ 主导 | 分解误差三项，比较样本质量 |
| 同一输入两次预测不同 | 代理版本或随机种子未固定 | 记录模型哈希与训练种子 |
| 优化收敛到边界上的极值点 | 外推区域给出虚假最优 | 检查最优点的 $h_{ii}$ 与预测方差 |
| 高保真升级后代理突然变差 | $\varepsilon_{data}$ 改变，代理失效 | 重算与新高保真的 NRMSE |

## 治理记录的字段

每个代理模型应有一页记录：训练域（参数上下界与样本哈希）、$n$ 与 $p$、$h^*$、NRMSE、$R^2$、预测方差阈值、回退逻辑版本，以及最近一次与高保真的对照结果。缺少 $h^*$ 与回退阈值时，"代理模型可用"无法被审计；缺少样本哈希时，连"这个代理是用哪批数据训练的"都答不上来。

参考文献：

1. Forrester, A. I. J., Sóbester, A., & Keane, A. J., *Engineering Design via Surrogate Modelling: A Practical Guide*, Wiley, 2008.
2. Queipo, N. V., Haftka, R. T., Shyy, W., Goel, T., Vaidyanathan, R., & Tucker, P. K., "Surrogate-based analysis and optimization", *Progress in Aerospace Sciences*, 41(1), 1–28, 2005.
3. Jones, D. R., Schonlau, M., & Welch, W. J., "Efficient global optimization of expensive black-box functions", *Journal of Global Optimization*, 13(4), 455–492, 1998.
4. Rasmussen, C. E., & Williams, C. K. I., *Gaussian Processes for Machine Learning*, MIT Press, 2006.
5. Simpson, T. W., Peplinski, J. D., Koch, P. N., & Allen, J. K., "Metamodels for computer-based engineering design: survey and recommendations", *Engineering with Computers*, 17(2), 129–150, 2001.
6. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
