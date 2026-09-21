---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-overset-mesh-engineering-setup
title: 重叠网格：工程设置与诊断验证
summary: 说清重叠网格的供体搜索、插值模板、孔切与孤岛单元，给出重叠宽度与两侧尺寸比的取值规则，并附 OpenFOAM 动态重叠网格的可复算配置。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 重叠网格
  - 工程设置与参数选择
  - 供体搜索
  - 孔切
  - 结果诊断与可信度验证
  - 孤岛单元
  - 插值精度
seo:
  title: 重叠网格：工程设置与诊断验证
  description: 说清重叠网格的供体搜索、插值模板、孔切与孤岛单元，给出重叠宽度与两侧尺寸比的取值规则，并附 OpenFOAM 动态重叠网格的可复算配置。
  keywords:
    - 重叠网格
    - 供体搜索
    - 孔切
    - 孤岛单元
    - 重叠宽度
    - 界面压力跳变
    - 插值精度
    - 守恒漂移
---
# 重叠网格：工程设置与诊断验证

重叠网格把复杂运动部件从「重构网格」问题变成「插值」问题：背景网格与部件网格各自独立生成，靠重叠区内的供体-受体插值传递信息。代价是引入了三类新参数——重叠宽度、两侧尺寸比与孔切容差——它们的取值直接决定插值误差与孤岛单元数量。重叠网格的误差不来自网格质量，而来自插值：供体-受体配对、模板跨越梯度方向、时间插值阶数下降，都会在残差正常的表象下污染结果。诊断这类问题要盯住四个量：孤岛单元数、界面压力跳变、时间子迭代次数带来的目标量变化、以及守恒量的逐步漂移。

## 基础概念与控制关系

### 守恒量的逐步漂移

重叠网格在界面处不严格守恒，误差会随步数累积。诊断方法是监控总质量、总动量与总能量随时间的漂移率，而不是只看单步残差。若每步漂移 $10^{-6}$，跑 $10^{5}$ 步后累积 10%——这类问题在长时程算例（如多圈旋转机械）中很常见。应对手段是缩短总时长、在每一步后做全局守恒修正，或改用严格守恒的界面通量格式。

## 工程设置与实施

### OpenFOAM 动态重叠网格配置

```text
// constant/dynamicMeshDict：刚体旋转的部件
dynamicFvMesh   dynamicOversetFvMesh;
motionSolver    solidBody;

solidBodyCoeffs
{
    cellZone    rotor;
    solidBodyMotionFunction rotatingMotion;
    rotatingMotionCoeffs
    {
        origin      (0 0 0);
        axis        (0 0 1);
        omega       62.83;      // 600 rpm = 62.83 rad/s
    }
}

// constant/polyMesh/boundary：部件外边界必须是 overset 类型
rotorFringe
{
    type        overset;
    inGroups    List<word> 1(overset);
    nFaces      4800;
    startFace   1250000;
}
```

转速换算需核对：$600\ \mathrm{rpm} = 600/60 \times 2\pi = 62.83\ \mathrm{rad/s}$。刚体运动的插值权重不随时间变化，OpenFOAM 会复用权重矩阵，这也是重叠网格比动态重构网格快得多的原因；一旦引入网格变形（如弹性部件），权重必须每步重算，成本会回到重构量级。

### 参数台账

交付需记录：背景与部件网格尺寸、$\kappa$、重叠区厚度与层数、孔切容差、受体模板大小与插值方法、孤岛单元数、部件运动的角速度与轴、以及插值权重是否复用。重叠网格算例的可复现性特别依赖孔切容差——同一几何在容差差一个量级时可能给出不同数量的孤岛单元。

### 界面与守恒量的复算脚本

```python
import numpy as np
rho, U = 1.225, 30.0
q = 0.5 * rho * U**2                      # 动压 [Pa]
dp = np.array([15.0, 4.0, 22.0])          # 界面压力跳变 [Pa]
print(f"q = {q:.1f} Pa")
print("dp_fringe =", [f"{v / q:.1%}" for v in dp])

mdot_in, mdot_out = 1.0000, 0.9970        # 进出口质量流量 [kg/s]
print(f"eps_m = {abs(mdot_in - mdot_out) / mdot_in:.2%}")
```

### 供体搜索与插值模板

受体单元的值由供体单元线性组合给出：

$$
\phi_P = \sum_{i=1}^{N} w_i \phi_i, \qquad \sum_{i=1}^{N} w_i = 1
$$

权重 $w_i$ 由最小二乘或反距离法确定，$N$ 为模板大小。$N = 1$ 时插值退化为一阶（最近单元取值），会把界面的数值扩散放大到单元尺度；$N \ge 4$ 才能保证线性场被精确重构。线性插值的误差界为

$$
\left\|\phi - \phi_h\right\|_{\infty} \le C\, h^{2}\left\|\nabla^{2}\phi\right\|_{\infty}
$$

即误差随 $h$ 二阶下降——但这个二阶只在插值区域梯度光滑时成立。若受体单元位于强梯度区（如激波、相界面），模板跨越梯度方向会退化为一阶，必须在这些区域加宽重叠区。

### 孔切、受体与孤岛单元

孔切决定哪些背景单元被部件「挖掉」。判据是单元中心落在部件实体内部，或落在部件的孔切曲面之内。三类单元必须区分：

- **内部单元**：不参与计算，被挖掉；
- **受体单元**（fringe）：位于重叠区，用供体插值取值；
- **供体单元**（donor）：提供插值数据，必须是正常求解的单元。

**孤岛单元**是受体但没有有效供体的情况，通常由重叠宽度不足或孔切容差过紧造成。搜索容差取 $10^{-6}\ \mathrm{m}$ 量级时，若部件表面与背景网格的最小间距小于两个背景单元，孤岛几乎必然出现。诊断量是孤岛单元数与总受体数之比，要求为 0；出现 1 个孤岛就足以让局部守恒失效。

### 重叠宽度与两侧尺寸比

重叠区必须能容纳至少三个背景单元，才能保证供体模板完全落在部件网格的有效区内：

$$
W_{overlap} \ge 3\,h_{bg}
$$

背景单元 $h_{bg} = 20\ \mathrm{mm}$ 时，$W_{overlap} \ge 60\ \mathrm{mm}$。若部件网格外边界只比部件大 30 mm，重叠区不足两层，受体会被迫使用靠近边界的供体，插值误差跳升。

两侧尺寸比定义为

$$
\kappa = \frac{h_{bg}}{h_{comp}}
$$

背景 20 mm、部件 5 mm 时 $\kappa = 4$。$\kappa > 2$ 会让插值模板内的场量变化过大，等效于把背景网格的截断误差直接注入部件表面。把部件尺寸改为 10 mm 或把背景局部加密到 10 mm，使 $\kappa = 2$，是成本最低的修正。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 部件表面出现压力台阶 | 重叠区不足三个背景单元 | 统计重叠区厚度与 $h_{bg}$ 之比，补到 3 以上 |
| 出现孤岛单元警告 | 孔切容差过紧或重叠宽度不足 | 打印孤岛单元坐标，检查其到部件表面的距离 |
| 部件力矩随背景网格加密而变 | 两侧尺寸比 $\kappa > 2$，插值误差主导 | 把 $\kappa$ 降到 2 重算，观察力矩变化 |
| 界面处出现虚假质量源 | 供体-受体配对不唯一，同一单元被双重计入 | 检查重叠区是否出现三套网格互相重叠 |
| 时间步长受限严重 | 部件网格最小单元过小 | 统计部件网格最小单元与转速，反算 CFL 允许的步长 |
| 全局质量不平衡 0.3% | 存在孤岛单元 | 输出孤岛坐标，检查到部件表面的距离 |
| 界面压力呈周期性振荡 | 受体与供体在界面处不一致 | 计算 $\Delta p_{fringe}$，与 1% 阈值比较 |
| 力矩随子迭代次数显著变化 | 时间插值仅一阶 | 子迭代从 1 增到 3，比较目标量 |
| 长时程算例守恒量缓慢漂移 | 界面不严格守恒，误差累积 | 统计总质量随时间的漂移率与步数 |
| 加密背景网格后部件载荷不变 | 误差由部件网格或插值主导 | 固定背景，加密部件网格，比较载荷变化 |

### 重叠区界面的压力振荡

受体单元用插值取值，供体单元用方程求解，两者在界面处的不一致会表现为压力振荡。诊断量用压力跳变相对动压归一化：

$$
\Delta p_{fringe} = \frac{\left|p_{rec} - p_{don}\right|}{\frac{1}{2}\rho U^{2}}
$$

来流 $U = 30\ \mathrm{m/s}$ 的常压空气，动压为 $0.5 \times 1.225 \times 30^{2} = 551\ \mathrm{Pa}$。界面处实测跳变 15 Pa，即 $\Delta p_{fringe} = 2.7\%$。判据是 $\Delta p_{fringe} < 1\%$；达到 2.7% 时，界面附近的压力梯度已被污染，任何依赖界面附近压力的目标量（如部件升力）都不可信。修正手段是加宽重叠区或在界面附近把两侧网格尺寸比降到 2 以内。

## 验证、验收与复现

### 复算与验收

可信的重叠网格结果需要同时给出：孤岛单元数与坐标、全局质量与动量不平衡、$\Delta p_{fringe}$、时间子迭代次数与目标量对该参数的敏感性、守恒量漂移率、以及两侧网格尺寸比。特别地，界面压力跳变必须与动压一起给出，只报绝对跳变值无法判断其严重程度。

### 孤岛单元与全局质量不平衡

孤岛单元是受体但找不到有效供体的单元，它通常被留成前一步的值或零值，直接破坏局部守恒。诊断量是孤岛单元数与受体总数的比，要求严格为 0。某 4.2×10⁶ 单元的算例报告 12 个孤岛单元，占比 $2.9\times10^{-6}$，看似可忽略，但全局质量不平衡立即上升到

$$
\epsilon_m = \frac{\left|\dot m_{in} - \dot m_{out}\right|}{\dot m_{in}} = 0.3\%
$$

稳态问题中 $\epsilon_m$ 应在 $10^{-4}$ 量级以下。0.3% 的失衡说明这 12 个孤岛单元所在的局部区域每步都在丢失或制造质量，必须先把它们消除再讨论其他误差。定位方法是输出孤岛单元坐标，检查它们到部件表面的距离是否小于两个背景单元尺寸。

### 时间插值的精度损失

运动界面在时间步内移动，插值需要用到时间步内的中间状态：

$$
\phi^{n+\alpha} = (1-\alpha)\phi^{n} + \alpha\phi^{n+1}
$$

若不做子迭代（$\alpha$ 取固定值），插值只有一阶精度，且会把运动界面的误差以「网格雷诺数」的形式注入动量方程。诊断方法是改变子迭代次数，观察目标量的变化：某旋翼算例在 1 次子迭代时给出力矩 12.4 N·m，4 次时给出 11.5 N·m，相差 7.8%。判据是把子迭代次数从 1 增到 3，若目标量变化超过 1%，说明时间插值是主要误差源。

## 参考资料

1. Benek J.A., Buning P.G., Steger J.L., "A 3-D Chimera Grid Embedding Technique", *AIAA Paper 85-1523*, 1985.
2. Meakin R.L., "Object X-rays for Cutting Holes in Composite Overset Structured Grids", *AIAA Paper 2001-2537*, 2001.
3. Chan W.M., "Overset Grid Technology Development at NASA Ames Research Center", *Computers & Fluids*, 38(3): 496-503, 2009.
4. Noack R.W., "SUGGAR: A General Capability for Moving Body Overset Grid Assembly", *AIAA Paper 2005-5117*, 2005.
5. Steger J.L., Dougherty F.C., Benek J.A., "A Chimera Grid Scheme", *Advances in Grid Generation*, ASME FED-Vol. 5, pp. 59-69, 1983.
6. Hadzic H., *Development and Application of a Finite Volume Method for the Computation of Flows Around Moving Bodies on Unstructured, Overlapping Grids*, PhD Thesis, Technische Universität Hamburg-Harburg, 2006.
7. Nakahashi K., Togashi F., Sharov D., "Intergrid Boundary Movement for Overset Unstructured Grid Method", *AIAA Journal*, 41(3): 440-447, 2003.
8. Anderson D.A., Tannehill J.C., Pletcher R.H., *Computational Fluid Mechanics and Heat Transfer*, 3rd ed., CRC Press, 2016.
