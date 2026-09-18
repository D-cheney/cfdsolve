---
template_version: "flowlab-knowledge/1.0"
slug: fluid-properties-and-units
title: 流体物性、单位与量纲检查
summary: 讲清密度、动力/运动黏度、比热、导热系数的含义与单位，给出温压相关物性的处理方式，以及提交计算前必做的单位与数量级检查清单。
category:
  slug: physics
  name: 流体力学基础
level: 入门
reading_minutes: 11
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-16T00:00:00.000Z"
tags: [流体物性, 单位, 量纲, 黏度, 传热]
seo:
  title: 流体物性、单位与量纲检查
  description: 掌握 CFD 常用物性的含义、单位、温压依赖和数量级检查方法。
  keywords: [动力黏度, 运动黏度, 流体物性, CFD 单位]
---

# 流体物性、单位与量纲检查

物性错误往往**不会让求解器报错**，却会让雷诺数、压降和换热量整体失真。这一篇解决三件事：物性到底有哪些、单位怎么统一、提交前用什么方法快速抓住错误。

## 1. 基本物性与量纲

不可压流动最基本的两个物性是密度 $\rho$（kg/m³）和**动力黏度** $\mu$（Pa·s）。工程中更常用**运动黏度** $\nu$（m²/s），二者关系：

$$
\nu = \frac{\mu}{\rho}
$$

传热计算再加比热容 $c_p$（J/(kg·K)）和导热系数 $k$（W/(m·K)）。它们组合出**热扩散率**和**普朗特数**：

$$
\alpha = \frac{k}{\rho c_p},\qquad Pr = \frac{\nu}{\alpha} = \frac{\mu c_p}{k}
$$

$Pr$ 衡量动量扩散与热扩散的相对强弱：空气约 0.71，水约 7，液态金属远小于 1。

## 2. 单位统一与常见陷阱

先定一套单位制（推荐 SI），再导入数据。典型错误：

- 把 mPa·s 当 Pa·s（水约 1 mPa·s，直接写 1 Pa·s 差 **1000 倍**）；
- 摄氏温度代入理想气体状态方程（必须用开尔文）；
- 表压与绝对压力混用；
- 几何以毫米导入却按米计算（体积、面积误差成倍放大）；
- 多项式物性系数的温度单位或顺序弄反。

## 3. 常物性还是变物性

当计算域内温度、压力变化很小时，可在**代表状态点**取常物性。满足下列任一条件时应改用变物性：

- 温差大、接近相变或密度变化超过约 5%；
- 强浮力（自然对流）；
- 高速可压缩、存在激波；
- 非牛顿或组分剧烈变化。

变物性用分段表格、函数或状态方程表达，并确保**超出数据范围时不会外推出负值或非物理解**。理想气体可写：

$$
\rho = \frac{p}{R T}
$$

## 4. 数量级检查（最有效的一步）

给完物性，立刻手算三个数并与预期比较：

$$
Re=\frac{\rho U L}{\mu},\qquad Pr=\frac{\mu c_p}{k},\qquad c=\sqrt{\gamma R T}
$$

再用简单关联式估算压降、流量或换热系数：

$$
\Delta p \approx f\frac{L}{D}\frac{1}{2}\rho U^2
$$

如果 CFD 结果与手算差一个数量级，**先查单位、面积、表压和物性温度**，而不是调松弛因子。

## 5. 数据记录模板

每项物性记录：名称、数值或函数、单位、适用温压范围、来源与版本。混合物必须写明组分基准是**质量分数还是摩尔分数**。正式报告里不允许只写"使用软件默认空气"。

## 6. 示例：空气物性表与快速核对

300 K、1 atm 下空气常用值（用于手算与量级核对）：

- 密度 $\rho=1.177\ \mathrm{kg/m^3}$
- 动力黏度 $\mu=1.846\times10^{-5}\ \mathrm{Pa\cdot s}$
- 运动黏度 $\nu=1.568\times10^{-5}\ \mathrm{m^2/s}$
- 比热 $c_p=1005\ \mathrm{J/(kg\cdot K)}$，导热系数 $k=0.0262\ \mathrm{W/(m\cdot K)}$

核对 $Pr$ 与 $Re$：

$$
Pr=\frac{\mu c_p}{k}=\frac{1.846\times10^{-5}\times1005}{0.0262}\approx 0.71
$$

$$
Re=\frac{\rho U L}{\mu}=\frac{1.177\times10\times1}{1.846\times10^{-5}}\approx 6.4\times10^{5}
$$

取 $U=10\ \mathrm{m/s}$、$L=1\ \mathrm{m}$ 时 $Re\approx 6.4\times10^{5}$，已接近平板转振临界值——若模型用层流就是错误前提。用同一组数手算 $c=\sqrt{\gamma R T}\approx 347\ \mathrm{m/s}$，则 $Ma=U/c\approx 0.029$，可压性可忽略。这三个数一分钟内就能挡住大多数单位/物性错误。

## 7. 参考资料

1. Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*。
2. NIST Chemistry WebBook，物性数据库。
3. 本项目《CFD 常用无量纲数与尺度判断》。
