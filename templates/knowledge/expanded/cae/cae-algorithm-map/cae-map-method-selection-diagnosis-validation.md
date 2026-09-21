---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-method-selection-diagnosis-validation
title: "离散方法选型矩阵：结果诊断与可信度验证"
summary: "给出 FDM、FVM、FEM、DG、BEM 与粒子法在守恒性、精度阶、几何适应性、典型自由度与成本量级上的对比矩阵，附观测收敛阶反算、通量收支判定与自由度-内存估算，用于结果异常时先判定是否选错了离散方法。"
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
  - "离散方法选型矩阵"
  - "结果诊断与可信度验证"
  - "观测收敛阶"
  - "通量守恒"
seo:
  title: "离散方法选型矩阵：结果诊断与可信度验证"
  description: "给出 FDM、FVM、FEM、DG、BEM 与粒子法在守恒性、精度阶、几何适应性、典型自由度与成本量级上的对比矩阵，附观测收敛阶反算、通量收支判定与自由度-内存估算，用于结果异常时先判定是否选错了离散方法。"
  keywords:
    - "离散方法选型矩阵"
    - "结果诊断与可信度验证"
    - "观测收敛阶"
    - "面通量守恒"
    - "自由度规模"
---

# 离散方法选型矩阵：结果诊断与可信度验证

选型矩阵的作用不是罗列方法名，而是在给定几何、守恒要求和目标精度后，用可核对的数字快速排除不适用方法。本文给出 FDM、FVM、FEM、DG、BEM 与粒子法在守恒性、精度阶、几何适应性、典型自由度与成本量级上的差异，并给出三类"结果异常先怀疑选错方法"的判定试验。

## 六类方法的属性对照

| 方法 | 守恒性 | 精度阶 | 几何适应性 | 典型自由度 | 求解成本量级 |
|---|---|---|---|---|---|
| FDM | 仅守恒型差分严格守恒，一般形式相对失衡可达 $10^{-2}$ | 2，均匀网格紧致格式可达 4～6 | 差，贴体坐标难处理复杂拓扑 | $10^5\sim10^6$ 点 | 每步 $O(N)$，带宽 $O(N^{2/3})$ |
| FVM | 面通量严格守恒，通量失衡可压到 $10^{-14}$ | 1～2，重构后 3～5 | 好，支持任意多面体 | $10^6\sim5\times10^7$ 单元 | $O(N^{1.2})\sim O(N^{1.5})$ |
| FEM | 弱式守恒，界面通量需后处理核对 | 1～2，p 型可达 6～10 | 很好，非结构剖分成熟 | $10^5\sim10^7$ 节点 | 3D 直接解 $O(N^2)$，迭代 $O(N^{1.3})$ |
| DG | 单元内严格守恒 | $p+1$，取 2～5 | 好，允许悬挂节点与非协调网格 | $5\times10^6\sim10^8$ | 高，$\Delta t \propto h/p^2$ |
| BEM | 边界量守恒，域内量需后处理 | 2～3 | 仅均匀介质、线弹性、声场 | 表面节点，约体网格的 $N^{2/3}$ | 稠密 $O(N^2)$ 存储、$O(N^3)$ 求解，FMM 降到近 $O(N)$ |
| SPH/DEM | 动量近似守恒，误差 1%～5% | 1～2，一致性弱 | 极好，大变形与自由面 | $10^6\sim10^8$ 粒子 | 每步 $O(N)$，邻域搜索常数大 |

这张表的关键读法是"守恒性决定能不能算，精度阶决定算多贵，几何适应性决定要不要换方法"。当目标量是通量或流量收支时，只有面通量严格守恒的 FVM 与 DG 能直接给出 $10^{-14}$ 量级的收支闭合；FDM 在非守恒形式下即使把网格加密到 2 mm，通量失衡仍可能停在 $10^{-3}$。

## 精度阶与离散误差的定量关系

离散误差随网格尺度的下降速度由阶数决定：

$$E_{disc}(h)=C\,h^{p},$$

其中 $h$ 为单元特征尺度（单位 m），$p$ 为格式的理论精度阶，$C$ 与解的高阶导数和网格质量有关。用两套网格的误差比即可反推实际阶数：

$$p_{obs}=\frac{\ln\!\left(\|e_{3}\|/\|e_{2}\|\right)}{\ln r},$$

$e_2,e_3$ 为粗、细两套网格上目标量的误差，$r=h_{2}/h_{3}$ 为加密比。若 $p_{obs}$ 明显低于理论阶，说明网格质量或边界处理已经主导误差，此时加密网格收益极低。

一次可核对的手算：某 FVM 稳态算例的目标量（阻力系数）在 $h=8\ \mathrm{mm},4\ \mathrm{mm},2\ \mathrm{mm}$ 上取 $1.042,1.018,1.007$，设参考值 $1.000$，则 $e_2=0.018$、$e_3=0.007$，$r=2$：

$$p_{obs}=\frac{\ln(0.018/0.007)}{\ln 2}=\frac{0.9445}{0.6931}=1.36 .$$

实测 1.36 阶落在 FVM 一阶迎风与二阶重构之间，说明对流项实际以迎风为主。若设计要求 $E_{disc}\le1\%$，按 $E=C h^{p}$ 从 2 mm 外推满足 1% 的网格尺度为 $h=2\times(1\%/0.7\%)^{1/1.36}=2.6\ \mathrm{mm}$，反而比现网格更粗——这说明当前误差已接近该方法在本网格上的极限，继续加密没有意义，应改为二阶重构。

## 自由度规模与成本量级

方法选择必须过"规模关"。三维体网格节点数 $N_v$ 与表面节点数 $N_s$ 的经验关系为 $N_s\approx N_v^{2/3}$：当 $N_v=10^6$ 时 $N_s=10^4$，BEM 的自由度只有 FEM 的 1%，这正是 BEM 在声辐射、半无限域问题上仍被使用的唯一理由。反过来，BEM 一旦失去均匀介质假设（例如含分层或非线性材料），$N_s^{2/3}$ 的优势立刻被稠密矩阵的 $O(N_s^2)$ 存储吃掉：$N_s=10^4$ 的复稠密矩阵需要 $10^8\times16\ \mathrm{B}=1.6\ \mathrm{GB}$，尚可接受；$N_s=10^5$ 时存储升到 160 GB，必须改用 FMM 或直接换 FEM。

内存估算同样能筛掉方案：FVM 每个单元约需 200 B 存储守恒量、面通量与几何量，$5\times10^7$ 个单元需要 $5\times10^7\times200\ \mathrm{B}=10\ \mathrm{GB}$，单节点 128 GB 尚可；若改用 DG 的 $p=3$，每单元自由度升到 $(p+1)^3=64$，同样物理网格的内存放大约 30～60 倍，直接超出单节点容量，必须上分布式内存。

## 判定试验：结果异常时先查方法适配性

当结果与预期偏差大于 5% 时，先做下面三项试验再调参数。

```
# 试验 1：守恒收支（判断方法是否守恒）
flux_in  = sum(mdot at inlet faces)      # kg/s
flux_out = sum(mdot at outlet faces)
balance  = (flux_in - flux_out)/flux_in  # 期望 |balance| < 1e-6

# 试验 2：观测阶（判断格式是否按理论阶工作）
p_obs = log(e_coarse/e_fine)/log(r)      # 期望 p_obs >= p_theory - 0.1

# 试验 3：换方法对照（判断结论是否方法相关）
# 同一物理模型分别用 FVM 与 FEM 求解，比较同一目标量
```

三项试验的预期是：守恒失衡应小于 $10^{-6}$；$p_{obs}$ 应不低于理论阶减 0.1；换方法后目标量差异应小于工程容差。若守恒失衡达到 $10^{-3}$、$p_{obs}$ 只有 0.6、换方法后差异 8%，则问题出在方法或网格，而不是物理模型，调物理参数是无效方向。

## 失败模式：现象、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 通量收支失衡 $10^{-3}$ 且随加密不收敛 | FDM 非守恒形式，或 FVM 边界通量未计入求和 | 逐面统计通量，检查边界补丁是否参与求和 |
| 目标量在 2 mm 网格上仍摆动 ±3% | 网格质量差使 $C$ 主导，阶数失效 | 计算 $p_{obs}$，并统计单元正交性与长宽比 |
| BEM 内存随 $N_s$ 平方增长 | 稠密矩阵未用 FMM/ACA 加速 | 检查矩阵存储格式与 $N_s$ 规模 |
| 大变形算例 FEM 网格畸变、求解中断 | 拉格朗日网格无法承受大变形 | 改用 SPH/DEM/MPM 并对比能量收支 |
| DG 时间步被迫降到 $10^{-7}\ \mathrm{s}$ | CFL 中 $p^2$ 因子未计入 | 按 $\Delta t\propto h/p^2$ 反算稳定步长 |
| 声辐射外场用 FEM 需人工截断边界 | 无限域问题被体积离散 | 换 BEM 或加完美匹配层并验证反射系数 |

## 选型记录的必备字段

选型结论要能被他人复算，至少记录：几何与拓扑类型、守恒量清单、目标量及其容差、实测 $p_{obs}$、单元或节点规模、内存峰值，以及"被排除方法 + 排除依据"。参考来源：Oberkampf 与 Roy 的验证确认体系、Roache 的网格收敛准则、Ferziger 与 Perić 的守恒性讨论、NAFEMS 的建模指南、Zienkiewicz 等的有限元理论。

参考文献：

1. Oberkampf, W. L., & Roy, C. J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
2. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
3. Ferziger, J. H., & Perić, M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
4. Zienkiewicz, O. C., Taylor, R. L., & Zhu, J. Z., *The Finite Element Method: Its Basis and Fundamentals*, 7th ed., Butterworth-Heinemann, 2013.
5. NAFEMS, *Guidelines for Best Practice in Verification and Validation*, NAFEMS Ltd., 2019.
6. Reed, W. H., & Hill, T. R., "Triangular mesh methods for the neutron transport equation", Los Alamos Report LA-UR-73-479, 1973.
