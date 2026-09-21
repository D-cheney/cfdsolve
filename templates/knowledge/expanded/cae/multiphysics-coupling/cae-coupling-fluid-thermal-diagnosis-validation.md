---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-fluid-thermal-diagnosis-validation
title: "流热耦合：结果诊断与可信度验证"
summary: "用界面热流连续性、经典对流关联式与能量账本三条独立证据校核共轭传热结果，给出 Dittus-Boelter 手算、接触热阻温降与壁面热流再分配的判定方法。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "流热耦合"
  - "结果诊断与可信度验证"
  - "共轭传热"
  - "接触热阻"
seo:
  title: "流热耦合：结果诊断与可信度验证"
  description: "用界面热流连续性、经典对流关联式与能量账本三条独立证据校核共轭传热结果，给出 Dittus-Boelter 手算、接触热阻温降与壁面热流再分配的判定方法。"
  keywords:
    - "流热耦合"
    - "结果诊断与可信度验证"
    - "共轭传热"
    - "接触热阻"
    - "壁面热流"
---

# 流热耦合：结果诊断与可信度验证

流热耦合（共轭传热）把流体侧对流与固体侧导热在同一个界面上联立求解，界面处温度连续、热流连续。结果出错的典型表现是"整体温度对但局部热流不对"，根因多集中在界面热流再分配、湍流热边界层分辨不足和接触热阻被忽略。本文给出三条相互独立的核对路径：界面热流账本、经典对流关联式手算、以及含接触热阻的温降反算。

## 界面热流连续性与再分配

界面上必须同时满足

$$T_{f}\big|_{\Gamma}=T_{s}\big|_{\Gamma},\qquad \left(k_{f}\nabla T_{f}\right)\cdot\mathbf{n}=\left(k_{s}\nabla T_{s}\right)\cdot\mathbf{n}$$

第一式是温度连续，第二式是热流连续。诊断时对界面做面积分，检查两侧热流：

$$\eta_{\Gamma}=\frac{\left|\int_{\Gamma}\left(k_{f}\partial_n T_{f}-k_{s}\partial_n T_{s}\right)dA\right|}{\int_{\Gamma}\left|k_{f}\partial_n T_{f}\right|dA}$$

$\eta_{\Gamma}$ 应低于 1%。若实测达到 15%，而两侧总热量又基本相等，问题往往不是求解器，而是**热流再分配**：固体侧高导热区（如铜 $k=400\ \text{W/(m}\cdot\text{K)}$）把热流集中到局部，流体侧若用均匀热流边界就会算出错误的壁温分布。判定方法是把界面热流沿周向展开成分布曲线——均匀边界得到的是平线，真实结果应随固体肋厚与流速呈现峰谷，峰谷比常见 1.5～3.0。

## 用经典关联式核对对流换热系数

管内强制对流的独立对照用 Dittus-Boelter：

$$Nu=0.023\,Re^{0.8}Pr^{0.4}$$

取空气 $Re=2.0\times10^{4}$、$Pr=0.71$，则 $Re^{0.8}=2759$、$Pr^{0.4}=0.872$，$Nu=0.023\times2759\times0.872=55.3$。管径 $D=0.05\ \text{m}$、空气 $k=0.026\ \text{W/(m}\cdot\text{K)}$，得 $h=Nu\,k/D=55.3\times0.026/0.05=28.8\ \text{W/(m}^2\cdot\text{K)}$。

把这个 $h$ 与 CFD 反算的 $h_{cfd}=q''_{wall}/(T_w-T_{ref})$ 对比：偏差在 $\pm15\%$ 以内属正常（关联式本身有 10%～15% 不确定度）；偏差超过 30% 时，先查 $T_{ref}$ 的定义（体积平均、进出口平均还是绝热壁温），再看热边界层网格。湍流普朗特数 $Pr_t$ 取 0.85 还是 0.90 会带来约 3% 的 $h$ 差异，但不足以解释 30%。

## 能量账本与温升反算

最省事的一次核对是流体侧焓升：

$$Q=\dot{m}c_{p}\left(T_{out}-T_{in}\right)$$

取 $\dot{m}=0.05\ \text{kg/s}$、空气 $c_p=1005\ \text{J/(kg}\cdot\text{K)}$、温升 25 K，则 $Q=0.05\times1005\times25=1256\ \text{W}$。这个 1256 W 必须等于固体侧总发热量减去对外散热。若差 8%，通常不是数值误差而是漏了外壳自然对流（$h\approx10\ \text{W/(m}^2\cdot\text{K)}$、$A=0.05\ \text{m}^2$、$\Delta T=20$ K 时约 10 W，恰好是 0.8%）或辐射项。

反算也是有效手段：已知发热 1256 W、面积 $A=0.6\ \text{m}^2$，则平均热流 $q''=1256/0.6=2093\ \text{W/m}^2$；若测得壁面过热度 73 K，则等效 $h=2093/73=28.7\ \text{W/(m}^2\cdot\text{K)}$，与上面的关联式 28.8 吻合——这就是"三条证据闭合"的样子。

## 接触热阻与温变物性的诊断

装配界面存在接触热阻，界面温降为

$$\Delta T_{c}=q''\,R''_{c}$$

铝合金-铝合金螺栓连接在 1 MPa 接触压力下 $R''_{c}\approx1.0\times10^{-4}\ \text{m}^2\cdot\text{K/W}$。若界面热流 $q''=5.0\times10^{4}\ \text{W/m}^2$，则 $\Delta T_{c}=5.0\times10^{4}\times1.0\times10^{-4}=5.0\ \text{K}$。忽略这 5 K 会让固体温峰系统性偏低，在功率器件结温评估中直接导致选型错误。

温变物性同样要查。用毕渥数判断固体内部是否需要考虑温度梯度：

$$Bi=\frac{hL_{c}}{k}$$

取 $h=28.8\ \text{W/(m}^2\cdot\text{K)}$、特征长度 $L_c=0.01\ \text{m}$、铝 $k=200\ \text{W/(m}\cdot\text{K)}$，得 $Bi=0.00144\ll0.1$，可用集总假设；若换成陶瓷基板 $k=20\ \text{W/(m}\cdot\text{K)}$，$Bi=0.0144$，仍可集总，但温度系数明显的材料必须启用 $k(T)$，否则在 150 K 温差下导热率偏差可达 20%。

```text
# OpenFOAM chtMultiRegionFoam 的界面与物性配置片段
constant/regionProperties
fluid   (air);
solid   (heater substrate);

0.orig/solid/heater 的界面边界：
  interface
  {
      type                   compressible::turbulentTemperatureCoupledBaffleMixed;
      neighbourFieldName     T;
      kappaMethod            solidThermo;
      kappa                  lookup;
      value                  uniform 300;
  }

system/fvSchemes 中界面两侧必须同阶：
  divSchemes { div(phi,h) Gauss linearUpwind grad(h); }
# 诊断命令：统计界面两侧热流积分
postProcess -func "wallHeatFlux" -region air
```

界面耦合边界两侧的离散格式必须同阶，否则界面热流会出现一层网格宽的伪梯度；`wallHeatFlux` 函数对象输出的正是 $\int k\partial_nT\,dA$，可直接用于上面的 $\eta_{\Gamma}$ 计算。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面两侧热流差 15% | 固体侧热流再分配未被流体侧分辨 | 展开界面热流分布，检查峰谷比是否合理 |
| 壁温整体偏低 5 K 左右 | 未建接触热阻 | 按 $\Delta T=q''R''_c$ 估算并补入界面层 |
| 对流 $h$ 比关联式高 40% | 热边界层网格不足或 $Pr_t$ 取值不当 | 用 Dittus-Boelter 手算并与 $q''/\Delta T$ 对比 |
| 能量账本差 8% | 漏掉外壳散热或辐射 | 逐项列出 $Q_{in}$、$Q_{fluid}$、$Q_{loss}$ |
| 界面出现一层网格宽的假梯度 | 两侧离散格式阶次不一致 | 检查界面相邻单元的差分格式与梯度限制器 |
| 高导热区局部温度异常低 | 固体物性用了常数 | 启用 $k(T)$ 并比较 20 ℃ 与 150 ℃ 的 $k$ |
| 稳态算例温度仍在缓慢爬升 | 固体热容大、未算够时间常数 | 算 $\tau=\rho c_pV/(hA)$，积分至少 3τ |

诊断顺序：先做能量账本（最便宜），再做关联式比对（判 $h$），最后查界面热流分布与接触热阻（判局部）。

## 参考文献

1. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
2. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
3. Dittus F.W., Boelter L.M.K., "Heat transfer in automobile radiators of the tubular type," *University of California Publications in Engineering*, 2, 1930.
4. Kays W.M., Crawford M.E., Weigand B., *Convective Heat and Mass Transfer*, 4th ed., McGraw-Hill, 2005.
5. OpenFOAM Foundation, *OpenFOAM User Guide*（chtMultiRegionFoam 与 wallHeatFlux 章节）, 2023.
6. Menter F.R., "Two-equation eddy-viscosity turbulence models for engineering applications," *AIAA Journal*, 32(8), 1994.
