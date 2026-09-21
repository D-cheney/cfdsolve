---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-porous-media-flow-diagnosis-validation
title: "多孔介质流动：结果诊断与可信度验证"
summary: "用压降-流速幂次、Ergun 反算阻力系数与界面通量守恒三组证据审查多孔介质算例，给出六个失败现象的判定试验，并附一个可逐项手算核对的填充床算例。"
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
  - "多孔介质流动"
  - "结果诊断与可信度验证"
  - "Ergun 方程"
  - "渗透率"
seo:
  title: "多孔介质流动：结果诊断与可信度验证"
  description: "用压降-流速幂次、Ergun 反算阻力系数与界面通量守恒三组证据审查多孔介质算例，给出六个失败现象的判定试验，并附一个可逐项手算核对的填充床算例。"
  keywords:
    - "多孔介质流动"
    - "结果诊断与可信度验证"
    - "Ergun 方程"
    - "Darcy-Forchheimer"
    - "渗透率"
---

# 多孔介质流动：结果诊断与可信度验证

多孔介质算例最常见的问题不是发散，而是"收敛得很漂亮但压降错了十倍"——因为源项系数被当成渗透率本身填入。判断一份多孔介质结果是否可信，最短的路径是三条独立证据：压降随表观速度的幂次、Ergun 关联式反算出的阻力系数与求解器读入值的一致性、以及源区进出口的质量流量守恒。下面把这三条做成可执行的判定流程。

## 1 压降-流速幂次决定处在哪个流区

把每个工况的 $\Delta p/L$ 与表观速度 $u$ 画在双对数图上，斜率就是主导机制的指纹：斜率 1 表示黏性主导，斜率 2 表示惯性主导，中间是过渡区。对应的本构关系是 Darcy-Forchheimer 二项式：

$$
\frac{\Delta p}{L} = \frac{\mu}{K}u + \frac{\rho C_F}{\sqrt{K}}u^{2}
$$

其中 $K$ 是渗透率，单位 $\mathrm{m^2}$；$C_F$ 是无量纲惯性系数；$u$ 是按整个截面算的表观速度，不是孔隙内真实速度。第二项与第一项之比可以化简为：

$$
\frac{\text{惯性项}}{\text{黏性项}} = C_F\,\frac{\rho u \sqrt{K}}{\mu} = C_F\,Re_K,\qquad Re_K = \frac{\rho u\sqrt{K}}{\mu}
$$

这一步很关键：惯性项的占比等于 $C_F$ 乘 $Re_K$。工程上常把"$Re_K<1$ 即 Darcy 区"当作经验法则，但取 $C_F\approx 0.55$ 时 $Re_K=1$ 对应惯性占比已达 55%，早已不是 Darcy 区。若把"惯性占比小于 10%"作为判据，门槛应是 $Re_K<0.18$。诊断时先算 $Re_K$，再决定是否必须保留惯性项。

## 2 从 Ergun 反算求解器要填的两个系数

填充床的阻力有权威关联式。Ergun 方程给出

$$
\frac{\Delta p}{L} = 150\frac{\mu(1-\epsilon)^2}{\epsilon^3 d_p^2}u + 1.75\frac{\rho(1-\epsilon)}{\epsilon^3 d_p}u^{2}
$$

$\epsilon$ 是床层空隙率，$d_p$ 是颗粒直径。把两项分别与 Darcy-Forchheimer 的两项对齐，可得可直接写入求解器的等效量：

$$
K = \frac{\epsilon^3 d_p^2}{150(1-\epsilon)^2},\qquad
C_F = \frac{1.75}{\sqrt{150}\,\epsilon^{3/2}} = \frac{0.1429}{\epsilon^{3/2}}
$$

注意 $C_F$ 只依赖空隙率。OpenFOAM 的 `DarcyForchheimer` 源项写成 $S=-(\mu d + \rho f|\mathbf{u}|/2)\mathbf{u}$，因此需要转换一次：

$$
d = \frac{1}{K},\qquad f = \frac{2C_F}{\sqrt{K}}
$$

**手算算例。** 空气 $\rho=1.2\,\mathrm{kg/m^3}$、$\mu=1.8\times10^{-5}\,\mathrm{Pa\cdot s}$，球形颗粒 $d_p=2\,\mathrm{mm}$，$\epsilon=0.40$，表观速度 $u=0.5\,\mathrm{m/s}$，床高 $L=0.5\,\mathrm{m}$。

1. 渗透率：$\epsilon^3=0.064$，$d_p^2=4\times10^{-6}\,\mathrm{m^2}$，$(1-\epsilon)^2=0.36$，故 $K=0.064\times4\times10^{-6}/(150\times0.36)=4.74\times10^{-9}\,\mathrm{m^2}$。
2. 求解器系数：$d=1/K=2.11\times10^{8}\,\mathrm{m^{-2}}$，$\sqrt{K}=6.885\times10^{-5}\,\mathrm{m}$，$C_F=0.1429/0.4^{1.5}=0.565$，$f=2\times0.565/6.885\times10^{-5}=16413\,\mathrm{m^{-1}}$。
3. Ergun 黏性项：$150\times1.8\times10^{-5}\times0.36/(0.064\times4\times10^{-6})\times0.5 = 1898\,\mathrm{Pa/m}$。
4. Ergun 惯性项：$1.75\times1.2\times0.6/(0.064\times0.002)\times0.25 = 2461\,\mathrm{Pa/m}$。
5. 总压降：$(1898+2461)\times0.5 = 2180\,\mathrm{Pa}$。
6. 自洽校验：$Re_K=1.2\times0.5\times6.885\times10^{-5}/1.8\times10^{-5}=2.30$，$C_F Re_K=0.565\times2.30=1.30$，与第 4 步比值 $2461/1898=1.297$ 完全一致。

孔隙雷诺数 $Re_p=\rho u d_p/\mu=1.2\times0.5\times0.002/1.8\times10^{-5}=66.7$，已远高于 10，说明惯性项不可省略——这与第 6 步的比值互为印证。

## 3 三个必须单独做的判定试验

**网格试验。** 多孔源项是体积力，压降对源区单元数并不敏感，粗网格也可能给出"正确"的总压降，但出口速度剖面会明显变钝。做 10/20/40 层单元三组，要求 $\Delta p$ 变化小于 2% 且出口速度剖面 L2 差小于 1%，两者同时满足才算收敛。

**界面试验。** 检查源区入口与出口截面的质量流量差；共形网格下应小于 0.1%。若超差，多半是源区边界与进出口面重叠，或界面非共形而插值不守恒。

**量纲试验。** 打印求解器实际读入的 $d$、$f$，与 $1/K$、$2C_F/\sqrt{K}$ 逐位对比。把 $K$ 直接填进 $d$ 的槽位，量级会差 $10^{17}$，而残差曲线不会有任何异常。

## 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密源区后压降几乎不变，但出口速度剖面持续变钝 | 源区被当作薄界面而非体积力，内部结构被抹平 | 用真实填充几何做一次孔隙尺度对照，比较同一 $u$ 下的 $\Delta p$ |
| 压降随 $u$ 呈线性，但 $Re_p$ 已超过 100 | 惯性系数 $f$ 填成 0 或数量级错误 | 用 Ergun 手算 $\Delta p/L$ 与求解器输出逐点对比 |
| 源区出口出现速度尖峰或局部回流 | 阻力系数过大造成源项刚性与局部 CFL 超标 | 把 $f$ 减半重算，观察尖峰幅值是否同比例减小 |
| $\Delta p$ 对系数的敏感度与 $1/K$ 的预期不符 | 系数被当作 $K$ 而非 $1/K$ 填入 | 打印读入的 $d$ 值并与 $1/K$ 对比 |
| 源区上游出现非物理压降 | 源区与入口面重叠，入口边界被源项污染 | 把源区沿流向后移 $2d_p$ 重算 |
| 进出口质量流量不守恒 | 源区与主流区网格非共形，界面插值不保通量 | 统计界面通量并改用共形网格 |

## 5 可复用的字典片段

```cpp
porousBed
{
    type            explicitPorositySource;
    explicitPorositySourceCoeffs
    {
        selectionMode   cellZone;
        cellZone        bed;
        type            DarcyForchheimer;
        // d = 1/K, 单位 1/m^2；f = 2*C_F/sqrt(K), 单位 1/m
        d               (2.11e8 0 0 0 2.11e8 0 0 0 2.11e8);
        f               (16413 0 0 0 16413 0 0 0 16413);
    }
}
```

各向异性床层（如纤维毡、瓦楞填料）必须给张量形式：主渗透方向填 $1/K_\parallel$，横向填 $1/K_\perp$，两者的比值本身就是需要从实验或孔隙尺度模拟标定的物理量。

## 6 归档时留下的四类记录

1. 输入：$\epsilon$、$d_p$、$\rho$、$\mu$ 的来源与适用范围，以及 $K$、$C_F$、$d$、$f$ 的换算脚本。
2. 过程：源区单元层数与 $\Delta p$ 的收敛表，界面通量差的迭代历史。
3. 结果：$\Delta p$ 与 $u$ 的双对数拟合斜率、拟合区间、以及斜率是否随 $u$ 漂移。
4. 反证：哪些工况（如 $Re_p>300$、床层高径比小于 10）会推翻当前的 Darcy-Forchheimer 假设。

## 参考资料

1. Darcy H., *Les Fontaines Publiques de la Ville de Dijon*, Victor Dalmont, Paris, 1856.
2. Ergun S., "Fluid Flow through Packed Columns," *Chemical Engineering Progress*, 48(2), 89-94, 1952.
3. Macdonald I.F., El-Sayed M.S., Mow K., Dullien F.A.L., "Flow through Porous Media—the Ergun Equation Revisited," *Industrial & Engineering Chemistry Fundamentals*, 18(3), 199-208, 1979.
4. Whitaker S., "The Forchheimer Equation: A Theoretical Development," *Transport in Porous Media*, 25(1), 27-61, 1996.
5. Bear J., *Dynamics of Fluids in Porous Media*, American Elsevier, New York, 1972.
