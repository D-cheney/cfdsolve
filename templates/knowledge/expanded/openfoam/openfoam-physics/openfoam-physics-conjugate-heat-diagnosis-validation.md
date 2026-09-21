---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-conjugate-heat-diagnosis-validation
title: "共轭传热区域：结果诊断与可信度验证"
summary: "以界面能量平衡、Dittus-Boelter 对流关联式与一维导热解析解三条独立证据审查共轭传热结果，并给出接触热阻、非共形界面与热边界层分辨率的判定方法。"
category:
  slug: openfoam-physics
  name: "OpenFOAM 物理模型"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 物理模型"
  - "共轭传热区域"
  - "结果诊断与可信度验证"
  - "Dittus-Boelter"
  - "界面能量平衡"
seo:
  title: "共轭传热区域：结果诊断与可信度验证"
  description: "以界面能量平衡、Dittus-Boelter 对流关联式与一维导热解析解三条独立证据审查共轭传热结果，并给出接触热阻、非共形界面与热边界层分辨率的判定方法。"
  keywords:
    - "共轭传热区域"
    - "结果诊断与可信度验证"
    - "Dittus-Boelter"
    - "界面能量平衡"
    - "接触热阻"
---

# 共轭传热区域：结果诊断与可信度验证

共轭传热的错误往往藏在界面上：温度场看起来平滑，但两侧热流不相等，能量凭空产生或消失。诊断必须从界面通量入手，再向两侧分别追溯。本文给出三条可手算的独立证据——界面能量平衡、Dittus-Boelter 对流对照、一维导热解析解——以及接触热阻与非共形界面的判定方法。

## 界面能量平衡是第一条硬约束

耦合界面两侧的导热通量必须相等，这是离散格式必须满足的守恒律：

$$q''_{f}=k_f\left.\frac{\partial T}{\partial n}\right|_{f}=k_s\left.\frac{\partial T}{\partial n}\right|_{s}=q''_{s}$$

在 OpenFOAM 中可用 `wallHeatFlux` 功能对象分别对流体侧与固体侧的界面 patch 做面积分，得到 $\dot Q_f$ 与 $\dot Q_s$，定义不平衡度

$$\epsilon_Q=\frac{\left|\dot Q_f-\dot Q_s\right|}{\max\left(\left|\dot Q_f\right|,\left|\dot Q_s\right|\right)}$$

以 $q''=5\times10^{4}\ \mathrm{W/m^2}$、界面面积 $0.0314\ \mathrm{m^2}$（$D=0.01\ \mathrm{m}$、$L=1\ \mathrm{m}$）为例，理论热流 $\dot Q=1571\ \mathrm{W}$。收敛后 $\epsilon_Q$ 应低于 $10^{-3}$，即两侧热流差小于 1.6 W。若停在 $10^{-2}$ 量级，通常是非共形界面未启用插值或两侧网格尺度相差过大。

## 第二条：与 Dittus-Boelter 对照求对流系数

流体侧换热系数不应直接从解场反推后自证，要用经验关联式独立估算：

$$Nu=0.023\,Re^{0.8}Pr^{0.4},\qquad h=\frac{Nu\,k}{D}$$

$D=0.01\ \mathrm{m}$、$U=1\ \mathrm{m/s}$、$\nu=1.004\times10^{-6}\ \mathrm{m^2/s}$ 时 $Re=9.96\times10^{3}$；取水 $Pr=7.0$，则 $Nu=0.023\times9.96\times10^{3}{}^{0.8}\times7.0^{0.4}=79.1$，$h=79.1\times0.6/0.01=4748\ \mathrm{W/(m^2\,K)}$。若从模拟的壁面热流与温差反算出的 $h$ 偏离 4748 超过 15%，先查热边界层分辨率（近壁 $y^{+}$ 是否与流动边界层同量级），再查 $Pr$ 与热扩散系数是否与流体字典一致。

关联式适用区间为 $Re>10^{4}$、$0.7<Pr<160$、$L/D>10$；本算例 $Re$ 略低于 $10^{4}$，属于过渡区，因此把容差放宽到 15% 是合理的。

## 第三条：一维导热解析解校验固体温差

固体壁内的温度分布可与一维解析解逐点对照。无内热源、一侧对流一侧绝热的平板，温度线性下降：

$$T(x)=T_{s,o}+\frac{q''}{k}\left(L-x\right)$$

铝壁 $k=237\ \mathrm{W/(m\,K)}$、$L=0.005\ \mathrm{m}$、$q''=5\times10^{4}\ \mathrm{W/m^2}$ 时，内外壁温差 $q''L/k=1.06\ \mathrm{K}$。提取固体域沿壁厚方向的温度剖面，若偏差超过 0.1 K，说明固体网格在壁厚方向层数不足（建议不少于 10 层）或 `kappa` 场与字典不一致。换成钢壁（$k=15$）时该温差为 $16.7\ \mathrm{K}$，同样的网格偏差会造成更大的绝对误差。

## 整体传热系数与热阻分配

串联热阻给出整体传热系数，用于判断模型精度瓶颈在哪一侧：

$$\frac{1}{U}=\frac{1}{h_f}+\frac{t}{k}+\frac{t_{contact}}{k_{contact}},\qquad U=\left(2.106\times10^{-4}+2.11\times10^{-5}\right)^{-1}=4316\ \mathrm{W/(m^2\,K)}$$

固体热阻仅占总热阻的 9.1%。这说明在铝制水冷板中，把固体 `kappa` 从 237 提到 400（铜）最多只能把 $U$ 提高 8.6%，而把 $h_f$ 提高 20% 能带来 17% 的整体改善。诊断报告里应写明这个分配，否则容易在无关紧要的参数上反复迭代。

## 接触热阻与非共形界面

装配式散热器存在接触热阻，OpenFOAM 在耦合边界里用层参数表达：

```cpp
fluid_to_solid
{
    type            compressible::turbulentTemperatureCoupledBaffleMixed;
    Tnbr            T;
    kappaMethod     solidThermo;
    thicknessLayers (0.00005);        // m, thermal grease
    kappaLayers     (1.0);            // W/(m K)
    value           uniform 320;
}
```

$t/k=5\times10^{-5}/1.0=5\times10^{-5}\ \mathrm{m^2\,K/W}$，对应 $q''=5\times10^{4}\ \mathrm{W/m^2}$ 时界面温度跳变 2.5 K。若忘记设置而实验测到 2～3 K 的跳变，模型会把它错误地归因于固体导热不足，从而误导材料选型。

非共形界面的检查方式是统计界面两侧的面数与面积：两侧面积相对差应小于 0.1%，否则会出现通量插值偏差。

## 把界面通量做成运行时可监控量

```cpp
// system/fluid/controlDict
functions
{
    fluidSideFlux
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (fluid_to_solid);
        writeControl    writeTime;
    }
    solidSideFlux
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (solid_to_fluid);
        writeControl    writeTime;
    }
    interfaceT
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (T);
        operation       areaAverage;
        regionType      patch;
        name            fluid_to_solid;
    }
}
```

把两个 `wallHeatFlux` 的面积分结果逐时刻写入同一张表，就能直接观察 $\epsilon_Q$ 的演化；若它在 50 步后开始单调增大，说明两侧网格插值存在系统性偏差，而不是随机误差。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 两侧界面热流差 >5% | 非共形界面未启用插值 | 用 `wallHeatFlux` 分别积分两侧并比较面积 |
| 壁面 $h$ 比 Dittus-Boelter 高 30% | 热边界层首层过粗 | 输出 $y^{+}$ 与 $T^{+}$，确认 $\Delta y^{+}<1$ |
| 固体内温度梯度明显小于 $q''/k$ | `kappa` 场未从字典正确读取 | 输出 `kappa` 场并核对量级 |
| 界面温度跳变远大于接触热阻预期 | `thicknessLayers` 单位填成 mm | 用 $t/k$ 手算跳变值对比 |
| 稳态能量不平衡随网格加密反而恶化 | 两侧网格尺度差异扩大 | 保持界面两侧单元尺度比小于 2 |
| 铜与铝算例结果相同 | `regionProperties` 未真正区分区域 | 检查日志中各区域的求解器是否独立 |

## 参考文献

1. Dittus F.W., Boelter L.M.K., "Heat Transfer in Automobile Radiators of the Tubular Type," University of California Publications in Engineering, 1930.
2. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., Fundamentals of Heat and Mass Transfer, 7th ed., Wiley, 2011.
3. Gnielinski V., "New Equations for Heat and Mass Transfer in Turbulent Pipe and Channel Flow," International Chemical Engineering, 1976.
4. Minkowycz W.J., Sparrow E.M., Schneider G.E., Pletcher R.H., Handbook of Numerical Heat Transfer, 2nd ed., Wiley, 2006.
5. OpenFOAM Foundation, chtMultiRegionFoam 教程与 User Guide（当前发行版，wallHeatFlux 功能对象章节）.
