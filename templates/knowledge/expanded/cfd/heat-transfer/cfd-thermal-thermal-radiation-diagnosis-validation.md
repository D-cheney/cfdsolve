---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-thermal-radiation-diagnosis-validation
title: "热辐射模型：结果诊断与可信度验证"
summary: "用三类独立证据验收辐射计算结果：视角系数的闭合与互换、包腔内净辐射收支为零、角度离散的收敛曲线，并把壁面热流拆成对流与辐射两部分与解析值对照，附 DO 角度分格与后处理配置。"
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
  - "热辐射模型"
  - "结果诊断与可信度验证"
  - "视角系数"
  - "辐射收支"
seo:
  title: "热辐射模型：结果诊断与可信度验证"
  description: "用三类独立证据验收辐射计算结果：视角系数的闭合与互换、包腔内净辐射收支为零、角度离散的收敛曲线，并把壁面热流拆成对流与辐射两部分与解析值对照，附 DO 角度分格与后处理配置。"
  keywords:
    - "热辐射模型"
    - "结果诊断与可信度验证"
    - "视角系数"
    - "辐射收支"
    - "离散坐标"
---

# 热辐射模型：结果诊断与可信度验证

辐射算例的结果很少出现明显的发散或负温度，问题往往藏在几个百分点的偏差里，靠看温度云图发现不了。可用的验收手段是三类独立证据：几何视角关系的自洽性、包腔内的辐射收支、以及角度离散的收敛行为。

## 视角系数的闭合与互换检查

视角系数必须同时满足互换性与闭合性：

$$
A_iF_{ij}=A_jF_{ji},\qquad \sum_{j=1}^{N}F_{ij}=1
$$

前者是几何对称性要求，后者是能量守恒要求。工程判据取

$$
\left|\sum_{j=1}^{N}F_{ij}-1\right|<10^{-3}
$$

对两块 $1\ \mathrm{m}\times1\ \mathrm{m}$ 平行相对、间距 $1\ \mathrm{m}$ 的平板，制表值 $F_{12}=0.1999$。CFD 若给出 0.1998，闭合检查得到 $F_{11}=1-0.1998=0.8002$；由对称性 $A_1F_{12}=A_2F_{21}$ 应得 $F_{21}=0.1998$，若两者相差超过 0.5% 说明半立方体投影或面积积分的方向处理有误。遮挡复杂时必须逐面检查，而不是只看总量。

## 包腔内净辐射收支必须为零

对封闭包腔，各表面净辐射功率之和应为零：

$$
\sum_i A_i q''_{rad,i}=0
$$

这是比温度场更硬的一条检验，因为它是纯能量守恒，与模型精度无关。工程容差取各表面辐射功率绝对值之和的 0.5%。若收支偏差 3%，先查是否有表面被设成了透明或镜反射而未被计入，再查对称面是否被错误地当成了壁面。

## 角度离散的收敛曲线

DO 的角度分格数直接决定辐射热流的收敛程度。对同一算例逐步加密：

| 角度分格（$\theta\times\varphi$） | 壁面净辐射热流 $(\mathrm{W/m^2})$ | 相对解析值偏差 |
|---|---|---|
| $2\times8$ | 34500 | 7.2% |
| $3\times12$ | 32600 | 1.3% |
| $4\times16$ | 32210 | 0.11% |
| $6\times24$ | 32180 | 0.02% |

解析值为 $32174\ \mathrm{W/m^2}$。$2\times8$ 时偏差 7.2%，是典型的射线效应；从 $3\times12$ 到 $4\times16$ 偏差从 1.3% 降到 0.11%，说明已经进入渐近区。工程上取 $4\times16$ 通常足够，但若壁面附近存在强遮挡或局部热点，需要按局部热流而不是平均值判断收敛。

## 灰体与非灰体的对照

灰体与加权灰气模型的差距随光学厚度增大。对 $\tau_L\approx0.5$ 的烟气，两者总辐射热流相差约 9%；$\tau_L\approx2$ 时相差约 22%。诊断方法是固定几何、温度与壁面发射率，只切换辐射性质模型重算一次：若切换带来的变化小于角度离散带来的变化，说明灰体假设在当前工况下够用；若切换带来的变化大于 20%，则所有基于灰体的结论都应标注为待定。

## 壁面热流必须拆成对流与辐射两部分

壁面总热流是两项之和，验收时必须分开报告：

$$
q''_w=q''_{conv}+q''_{rad}=h\left(T_w-T_f\right)+\varepsilon\sigma\left(T_w^4-T_\infty^4\right)
$$

以 $T_w=1173\ \mathrm{K}$、$T_\infty=373\ \mathrm{K}$、$\varepsilon=0.85$、$h=15\ \mathrm{W/(m^2\cdot K)}$、$T_f=1073\ \mathrm{K}$ 为例：辐射项为 $90300\ \mathrm{W/m^2}$，对流项为 $15\times100=1500\ \mathrm{W/m^2}$，辐射占 98.4%。若报告里只给总热流，就无法判断辐射模型是否真的生效——这个工况下即使辐射算错 20%，总热流也只差 19.7%，而只看对流项则会完全掩盖问题。

## 算例：两块表面的收支核对

取一个由两个表面组成的包腔：$A_1=1.0\ \mathrm{m^2}$、$\varepsilon_1=0.9$、$T_1=900\ \mathrm{K}$；$A_2=4.0\ \mathrm{m^2}$、$\varepsilon_2=0.6$、$T_2=400\ \mathrm{K}$；表面 1 完全被表面 2 包围，故 $F_{12}=1$。

$$
q''_{rad,1}=0.9\times5.67\times10^{-8}\times\left(900^4-400^4\right)=0.9\times5.67\times10^{-8}\times6.305\times10^{11}=32174\ \mathrm{W/m^2}
$$

$$
Q_1=A_1q''_{rad,1}=1.0\times32174=32174\ \mathrm{W}
$$

由收支为零，$Q_2=-Q_1=-32174\ \mathrm{W}$，折算到 $A_2$ 上为 $q''_{rad,2}=-8044\ \mathrm{W/m^2}$。核对 $\sum A_iq''_{rad,i}=32174-32174=0$，闭合。CFD 若给出 $Q_1=33600\ \mathrm{W}$，偏差 4.4%，优先怀疑角度分格太粗或 $\varepsilon_1$ 在温度依赖下被重算。

```cpp
// constant/radiationProperties —— 角度分格与迭代控制
radiationModel  fvDOM;
fvDOMCoeffs
{
    nPhi            4;
    nTheta          16;
    tolerance       1e-6;
    maxIter         10;
    convergence     1e-4;
}
// 壁面光学性质
boundaryField
{
    hotWall
    {
        type            greyDiffusiveRadiation;
        emissivityMode  lookup;
        emissivity      0.9;
        T               uniform 900;
    }
    coldWall
    {
        type            greyDiffusiveRadiation;
        emissivityMode  lookup;
        emissivity      0.6;
        T               uniform 400;
    }
}
```

```bash
# 提取辐射热流与入射辐射
postProcess -func "wallHeatFlux" -time 2000
postProcess -func "fieldMinMax(G)" -time 2000
postProcess -func "fieldMinMax(Radiation)" -time 2000
```

```python
sigma, e1, T1, T2, A1, A2 = 5.67e-8, 0.9, 900.0, 400.0, 1.0, 4.0
q1 = e1 * sigma * (T1**4 - T2**4)      # 32174 W/m^2
Q1 = A1 * q1                           # 32174 W
q2 = -Q1 / A2                          # -8044 W/m^2
print(q1, Q1, q2, A1 * q1 + A2 * q2)
```

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 视角系数闭合误差 $3\times10^{-3}$ | 半立方体投影漏面，或遮挡面未被识别 | 逐面重算 $F_{ij}$ 并与面积积分法对照 |
| 包腔辐射收支偏差 3% | 存在透明或镜反射面未被计入，或对称面被当壁面 | 列出每个面的 $A_iq''_i$ 并逐项求和 |
| 角度分格从 $2\times8$ 到 $6\times24$ 热流变化 7% | 射线效应，方向数不足 | 按 $4\times16$ 与 $6\times24$ 的结果判断是否进入渐近区 |
| 灰体与 WSGG 结果相差 22% | 强选择吸收气体不能用单一灰体常数 | 用多灰气模型重算并比较总辐射热流 |
| 总热流几乎不变但辐射份额应为 98% | 辐射未耦合进能量方程，或只输出了对流项 | 单独提取 $q''_{rad}$ 与 $q''_{conv}$ 并核对份额 |

## 参考文献

1. Howell J.R., Mengüç M.P., Siegel R., *Thermal Radiation Heat Transfer*, 6th ed., CRC Press, 2020.
2. Viskanta R., Mengüç M.P., "Radiation heat transfer in combustion systems", *Progress in Energy and Combustion Science*, 13(2), 97–160, 1987.
3. Lockwood F.C., Shah N.G., "A new radiation solution method for incorporation in general combustion prediction procedures", *Symposium (International) on Combustion*, 18(1), 1405–1414, 1981.
4. Sparrow E.M., Cess R.D., *Radiation Heat Transfer*, Hemisphere Publishing, 1978.
5. Edwards D.K., "Molecular gas band radiation", *Advances in Heat Transfer*, 12, 115–193, 1976.
6. Fiveland W.A., "Three-dimensional radiative heat-transfer solutions by the discrete-ordinates method", *Journal of Thermophysics and Heat Transfer*, 2(4), 309–316, 1988.
