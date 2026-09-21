---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-buoyancy-flow-diagnosis-validation
title: "浮力与自然对流：结果诊断与可信度验证"
summary: "自然对流算例最典型的失败是收敛到一个几乎不流动的解。本文给出瑞利数、理查森数、努塞尔数与能量收支四类诊断量及其阈值，并附竖板与封闭腔两个可手算核对的验算过程。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "浮力与自然对流"
  - "结果诊断与可信度验证"
  - "瑞利数"
  - "能量收支"
seo:
  title: "浮力与自然对流：结果诊断与可信度验证"
  description: "自然对流算例最典型的失败是收敛到一个几乎不流动的解。本文给出瑞利数、理查森数、努塞尔数与能量收支四类诊断量及其阈值，并附竖板与封闭腔两个可手算核对的验算过程。"
  keywords:
    - "浮力与自然对流"
    - "结果诊断与可信度验证"
    - "瑞利数"
    - "努塞尔数"
    - "能量收支"
---

# 浮力与自然对流：结果诊断与可信度验证

自然对流算例最典型的失败方式不是发散，而是收敛到一个几乎不流动的解：残差漂亮下降、温度场光滑，但速度只有 $10^{-4}\,\mathrm{m/s}$ 量级，浮力被压力梯度完全抵消。诊断的第一步是确认解里确实存在浮力驱动的流动，再用相似准则、能量收支和独立基准三路证据交叉验证。本文给出可量化的判据与阈值，配竖板与封闭腔两个能用手算核对的算例。

## 1 用瑞利数确定该出现什么流动

竖直等温平板、高度 $L$、温差 $\Delta T$ 的空气自然对流由瑞利数控制：

$$
Ra = \frac{g\beta \Delta T L^{3}}{\nu \alpha} = Gr\,Pr, \qquad Gr = \frac{g\beta \Delta T L^{3}}{\nu^{2}}
$$

取 $L = 0.3\,\mathrm{m}$、$\Delta T = 30\,\mathrm{K}$、膜温 $T_f = 300\,\mathrm{K}$ 的空气物性 $\nu = 1.57\times10^{-5}\,\mathrm{m^2/s}$、$\alpha = 2.2\times10^{-5}\,\mathrm{m^2/s}$、$\beta = 1/T_f = 3.33\times10^{-3}\,\mathrm{K^{-1}}$：

- $Gr = 9.81 \times 3.33\times10^{-3} \times 30 \times 0.3^{3} / (1.57\times10^{-5})^{2} = 1.07\times10^{8}$
- $Ra = 1.07\times10^{8} \times 0.71 = 7.6\times10^{7}$

$Ra = 7.6\times10^{7}$ 位于竖板层流边界层区（转捩约在 $Ra \approx 10^{9}$），因此壁面平均努塞尔数应接近 Churchill-Chu 层流关联式：

$$
Nu = 0.68 + \frac{0.670\,Ra^{1/4}}{\left[1+\left(0.492/Pr\right)^{9/16}\right]^{4/9}}
$$

代入 $Ra^{1/4} = 93.5$、$Pr = 0.71$，分母为 $\left[1+0.693^{9/16}\right]^{4/9} = 1.303$，得 $Nu \approx 48.7$。换算成换热系数 $h = Nu\,k/L = 48.7 \times 0.0262/0.3 = 4.25\,\mathrm{W/(m^2\cdot K)}$，热流密度 $q = h\Delta T \approx 128\,\mathrm{W/m^2}$。这就是写进验收表的硬数字：若 CFD 给出 $q < 60\,\mathrm{W/m^2}$ 或 $> 250\,\mathrm{W/m^2}$，先怀疑解被抹平或网格不足，而不是先改关联式。

## 2 有来流时先分离出浮力份额

存在强迫对流时，浮力是否必须保留由理查森数决定：

$$
Ri = \frac{Gr}{Re^{2}} = \frac{g\beta\Delta T L}{U^{2}}
$$

同一平板置于 $U = 1\,\mathrm{m/s}$ 的来流，$Re = 1\times0.3/1.57\times10^{-5} = 1.91\times10^{4}$，$Ri = 1.07\times10^{8}/(1.91\times10^{4})^{2} = 0.29$。经验分区为：$Ri < 0.1$ 可忽略浮力，$0.1 < Ri < 10$ 属混合对流、惯性项与浮力项都要保留，$Ri > 10$ 以自然对流为主。$Ri = 0.29$ 落在混合对流区，此时关掉重力会带来 10% 量级的热流偏差，这是"结果与实验对不上"最常见的根因。

## 3 能量收支比残差更可靠

稳态下进出控制体的净焓流加壁面换热应闭合：

$$
\dot{Q}_{\text{wall}} - \dot{m}c_p\left(\bar{T}_{\text{out}}-\bar{T}_{\text{in}}\right) - \dot{Q}_{\text{rad}} \approx 0
$$

封闭腔体内则简化为 $\dot{Q}_{\text{热壁}} + \dot{Q}_{\text{冷壁}} \approx 0$（其余壁面绝热），工程上要求相对不平衡量低于 1%～2%。常见情形是残差已降到 $10^{-6}$，两壁热流却相差 8%，原因通常是温度场未进入统计稳态（羽流仍在低频摆动），或近壁热边界层内只有 1～2 个单元。

## 4 时间步与统计窗口

自然对流中的羽流与 Bénard 胞以低频摆动，瞬时场永远不会"收敛"。判定办法是把采样窗口对半切开，比较前后半段的时均努塞尔数，相对差小于 2% 才认为统计量稳定。时间步要同时满足对流与浮力两个限制：

$$
\Delta t \le \min\left(\frac{\Delta x}{U_{\max}},\ \sqrt{\frac{\Delta x}{g\beta\Delta T}}\right)
$$

取 $\Delta x = 2\,\mathrm{mm}$、$\Delta T = 30\,\mathrm{K}$，浮力限制给出 $\Delta t \le \sqrt{0.002/0.98} \approx 0.045\,\mathrm{s}$，比 $U_{\max} = 0.5\,\mathrm{m/s}$ 给出的 $0.004\,\mathrm{s}$ 宽松，因此实际由对流项主导。

## 5 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差 $10^{-6}$ 但 $Nu$ 比关联式低 40% | 首层太厚，热边界层被数值导热抹平 | 统计壁面 $y^{+}$ 与热边界层内单元数，要求不少于 5 层 |
| 速度量级只有 $10^{-4}\,\mathrm{m/s}$、温度分层光滑 | 常密度求解器未加浮力源项，或参考密度填错 | 关闭重力重算，结果几乎不变说明浮力项未生效 |
| 封闭腔两壁热流相差 5% 以上 | 温度场未进入统计稳态 | 比较前后半窗时均 $Nu$，或把时长延长 3 倍 |
| 对称双涡结构与实验单涡不符 | 忽略辐射，或侧壁绝热假设不成立 | 打开辐射模型并复核侧壁边界条件 |
| 加密网格后 $Nu$ 单调上升不收敛 | 解仍在网格相关区，或存在未解析的角点奇异 | 用三套网格做 Richardson 外推，看观测阶是否接近 2 |
| 减小时间步后时均量跳变 | 显式推进越过对流 CFL 限制 | 记录最大 CFL 数，压到 0.5 以下复算 |

## 6 与独立证据对照

- **关联式**：竖板用 Churchill-Chu；水平热面朝上用 $Nu = 0.54Ra^{1/4}$（$10^{4}<Ra<10^{7}$）；封闭腔用 Globe-Dropkin。允许偏差 10%～15%，超出即视为模型或网格问题。
- **网格无关性**：三套网格的 $Nu$ 与最大速度，观测阶应接近 2；若低于 1，说明首层网格仍控制结果。
- **能量收支**：不平衡量低于 2%。
- **物性敏感性**：把 $\beta$ 从 $1/T_f$ 换成查表值，$Nu$ 变化应小于 5%；否则说明温度场对物性过于敏感，需改用变物性求解器。

后处理用独立脚本重算面积平均 $Nu$，避免依赖求解器内部的归一化口径：

```bash
# 提取壁面热流，再用独立公式换算 Nu
postProcess -func "wallHeatFlux(patches=(hotWall))" -time 200:400
python3 - <<'PY'
k, L, dT = 0.0262, 0.3, 30.0     # W/(m.K), m, K
q = 128.4                        # 面积平均壁面热流, W/m^2
print("Nu =", q * L / (k * dT))  # 期望 ~48.7
PY
```

## 7 结论可信前必须回答的问题

1. $Ra$ 与 $Ri$ 是否落在预期区间，模型选择与流动区制是否匹配？
2. 壁面热流与关联式是否在 15% 以内一致？
3. 能量收支不平衡量是否低于 2%？
4. 前后半窗时均量差是否低于 2%？
5. 三套网格的观测阶是否接近 2？
6. 常物性与变物性两版计算的 $Nu$ 差异是否在容差内？

## 8 参考文献

1. Churchill S.W., Chu H.H.S., "Correlating Equations for Laminar and Turbulent Free Convection from a Vertical Plate," *International Journal of Heat and Mass Transfer*, 1975.
2. Globe S., Dropkin D., "Natural-Convection Heat Transfer in Liquids Confined by Two Horizontal Plates and Heated from Below," *Journal of Heat Transfer*, 1959.
3. Bejan A., *Convection Heat Transfer*, 4th ed., Wiley, 2013.
4. ASME, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, V&V 20-2009.
