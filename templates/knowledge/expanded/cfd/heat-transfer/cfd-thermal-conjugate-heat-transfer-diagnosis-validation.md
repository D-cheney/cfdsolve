---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-conjugate-heat-transfer-diagnosis-validation
title: "共轭传热：结果诊断与可信度验证"
summary: "把共轭传热的可信度建立在界面证据上：用两侧热流积分核对守恒、由界面温差反算接触热阻并折算成等效气隙厚度、用热阻网络与解析解对照，并给出 OpenFOAM 函数对象与后处理脚本的具体配置。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "共轭传热"
  - "结果诊断与可信度验证"
  - "界面热流守恒"
  - "接触热阻"
seo:
  title: "共轭传热：结果诊断与可信度验证"
  description: "把共轭传热的可信度建立在界面证据上：用两侧热流积分核对守恒、由界面温差反算接触热阻并折算成等效气隙厚度、用热阻网络与解析解对照，并给出 OpenFOAM 函数对象与后处理脚本的具体配置。"
  keywords:
    - "共轭传热"
    - "结果诊断与可信度验证"
    - "界面热流守恒"
    - "接触热阻"
    - "热阻网络"
---

# 共轭传热：结果诊断与可信度验证

共轭传热结果的第一个可信度证据不在温度云图里，而在界面上：两侧分别积分出的热流若不相等，整个解就是不可信的。本文给出界面守恒的量化判据、由界面温差反算接触热阻的方法、与热阻网络和解析解对照的流程，以及对应的工具设置。

## 界面热流守恒是第一条证据

把界面上的热流分别从流体侧和固体侧积分，定义相对不平衡量

$$
\varepsilon_{flux}=\frac{\left|\displaystyle\int_{A_f}q''_f\,dA-\int_{A_s}q''_s\,dA\right|}{\tfrac{1}{2}\left(\displaystyle\int_{A_f}|q''_f|\,dA+\int_{A_s}|q''_s|\,dA\right)}
$$

共形网格上 $\varepsilon_{flux}$ 应低于 $10^{-6}$；非共形接口靠插值传递，工程上要求 $\varepsilon_{flux}<10^{-2}$。若界面存在接触热阻或薄壁，两侧热流本身不相等是物理的，此时应比较"固体侧入流"与"固体侧出流"的差值，并把热阻层作为独立环节放入网络，而不是把不平衡量当误差。

## 由界面温差反算接触热阻

实测到界面两侧温差后，接触热阻可直接反算：

$$
R''_{tc}=\frac{T_{s,1}-T_{s,2}}{q''}
$$

若测得 $q''=8500\ \mathrm{W/m^2}$、$T_{s,1}-T_{s,2}=0.85\ \mathrm{K}$，则

$$
R''_{tc}=\frac{0.85}{8500}=1.0\times10^{-4}\ \mathrm{m^2\cdot K/W}
$$

这与金属—金属干接触的典型区间 $10^{-4}\sim10^{-3}\ \mathrm{m^2\cdot K/W}$ 一致，说明界面建模合理。若同一工况下温差变成 $3.4\ \mathrm{K}$，则 $R''_{tc}=4.0\times10^{-4}\ \mathrm{m^2\cdot K/W}$。把它折算成等效静止气隙厚度：空气 $k=0.026\ \mathrm{W/(m\cdot K)}$，

$$
t_{gap}=R''_{tc}\,k=4.0\times10^{-4}\times0.026=1.04\times10^{-5}\ \mathrm{m}=10.4\ \mu\mathrm{m}
$$

一个 10 μm 的装配间隙就足以让结温上升约 3 K。这个折算比单看热阻数值更能说明装配公差为什么重要。

## 非共形接口的插值误差如何暴露

非共形接口的误差有三个可观测特征：两侧热流积分差随网格细化不单调；界面附近出现网格尺度量级的温度锯齿；把两侧网格同时加密一个量级后界面通量仍在漂移。诊断方法是保持物理模型不变，只把界面两侧的面网格加密一倍再重算，看 $\varepsilon_{flux}$ 是否按一阶或二阶收敛。若不收敛，问题在插值方向而不是精度，应检查面法向定义与投影点是否落在对侧单元内。

## 与热阻网络和解析解对照

对一维串联结构，总温差应满足

$$
\Delta T=\dot Q\,R_{tot},\qquad R_{tot}=\sum_i\frac{t_i}{k_iA}+\sum_j\frac{R''_{tc,j}}{A}+\frac{1}{hA}
$$

把 CFD 得到的固体背面温度与热阻网络对照，是最省算力的独立校验。以 $\dot Q=5\ \mathrm{W}$、$A=0.001\ \mathrm{m^2}$、$h=50\ \mathrm{W/(m^2\cdot K)}$、TIM 厚 $100\ \mu\mathrm{m}$、$k_{TIM}=3\ \mathrm{W/(m\cdot K)}$、两处 $R''_{tc}=1\times10^{-4}\ \mathrm{m^2\cdot K/W}$ 为例：$R_{conv}=1/(50\times0.001)=20\ \mathrm{K/W}$，$R_{TIM}=1\times10^{-4}/(3\times0.001)=0.0333\ \mathrm{K/W}$，$R_{tc}=2\times10^{-4}/0.001=0.20\ \mathrm{K/W}$，合计 $R_{tot}=20.23\ \mathrm{K/W}$，$\Delta T=101.2\ \mathrm{K}$。CFD 若给出温差 70 K，几乎可以断定接触热阻被漏掉了。

## 工具设置与后处理

```cpp
// system/fluid/functions  —— 流体侧界面热流
functions
{
    interfaceFluxFluid
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (fluid_to_solid);
        executeControl  writeTime;
    }
}

// system/solid/functions  —— 固体侧界面热流
functions
{
    interfaceFluxSolid
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (solid_to_fluid);
        executeControl  writeTime;
    }
}
```

```bash
# 提取界面两侧热流并按面法向积分，比较不平衡量
postProcess -func "wallHeatFlux" -region fluid -time 1500
postProcess -func "wallHeatFlux" -region solid -time 1500
postProcess -func "fieldMinMax(T)" -region solid -time 1500
```

```python
q_solid, q_fluid = 8.42, 8.51          # W/m^2，两侧积分均值
eps = abs(q_solid - q_fluid) / (0.5 * (abs(q_solid) + abs(q_fluid)))
print("eps_flux =", eps)               # 1.05e-2
R_tc = 0.85 / 8500.0                   # 1.0e-4 m^2*K/W
t_gap = 4.0e-4 * 0.026                 # 1.04e-5 m
print(R_tc, t_gap)
```

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 非共形界面 $\varepsilon_{flux}=1.05\times10^{-2}$ | 插值未守恒，或面法向投影点落在对侧单元外 | 加密两侧面网格一倍，看 $\varepsilon_{flux}$ 是否按阶收敛 |
| 结温比热阻网络低 30 K | 接触热阻未施加或被薄壁参数覆盖 | 用 $R''_{tc}=q''^{-1}\Delta T$ 反算并与手册区间对照 |
| 固体背面温度对固体网格数不敏感 | 界面通量由流体侧单边决定，固体只被动接收 | 检查固体是否真的参与了耦合，而非只输出温度场 |
| 界面附近温度沿面呈锯齿状 | 两侧网格尺度差超过 5 倍，插值跨度太大 | 加密固体首层至与流体同量级后重算 |
| 瞬态结果在 $t<0.1\ \mathrm{s}$ 就达到稳态 | 物理时间步过大，跳过了固体热响应 | 用 $\tau_s$ 估算所需物理时间并检查时间步 |

## 交付前需要留存的量

至少并列：界面两侧热流的积分值与 $\varepsilon_{flux}$；$R''_{tc}$ 的取值来源或反算值；薄壁厚度是否与几何重复；$R_{tot}$ 的各段占比；固体背面温度与热阻网络的差值；以及网格加密时 $\varepsilon_{flux}$ 的收敛记录。有了这几项，读者可以直接判断误差来自界面模型还是来自离散。若某一段热阻占总热阻 80% 以上，优化应集中在该段，而不是继续加密网格。

## 参考文献

1. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
2. Stern F., Wilson R.V., Coleman H.W., Paterson E.G., "Comprehensive approach to verification and validation of CFD simulations—Part 1: Methodology and procedures", *Journal of Fluids Engineering*, 123(4), 793–802, 2001.
3. Eça L., Hoekstra M., "A procedure for the estimation of the numerical uncertainty of CFD calculations based on grid refinement studies", *Journal of Computational Physics*, 262, 104–130, 2014.
4. Coleman H.W., Steele W.G., *Experimentation, Validation, and Uncertainty Analysis for Engineers*, 3rd ed., Wiley, 2009.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, OpenCFD Ltd, 2022.
6. AIAA, *Guide for the Verification and Validation of Computational Fluid Dynamics Simulations*, AIAA G-077-1998, 1998.
