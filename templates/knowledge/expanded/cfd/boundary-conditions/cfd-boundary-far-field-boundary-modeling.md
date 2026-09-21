---
template_version: flowlab-knowledge/1.0
slug: cfd-boundary-far-field-boundary-modeling
title: 远场与开放边界：原理与诊断验证
summary: >-
  从扰动衰减律反推远场距离，用环量估算远场诱导速度，说明黎曼不变量型远场条件、堵塞修正与 OpenFOAM
  freestream/waveTransmissive 配置。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 边界条件与初始化
  - 远场与开放边界
  - 物理建模与适用边界
  - 黎曼不变量
  - 堵塞修正
  - 结果诊断与可信度验证
  - Prandtl-Glauert 修正
seo:
  title: 远场与开放边界：原理与诊断验证
  description: >-
    从扰动衰减律反推远场距离，用环量估算远场诱导速度，说明黎曼不变量型远场条件、堵塞修正与 OpenFOAM
    freestream/waveTransmissive 配置。
  keywords:
    - 远场与开放边界
    - 物理建模与适用边界
    - 黎曼不变量
    - 堵塞修正
    - freestream
    - 结果诊断与可信度验证
    - 远场外推
    - 升力系数
---
# 远场与开放边界：原理与诊断验证

远场边界的目标是让外部边界对目标量的影响小到可忽略，而不是"看起来够远"。判断够不够远有两条可算的线索：一是扰动的衰减律（二维按 $1/r$、三维按 $1/r^2$），二是边界条件的类型是否允许扰动无反射地穿出。把升力体的远场设在 10 倍弦长处并施加固定来流速度，等于在涡的诱导速度还没衰减到 1% 的地方强行把它按为零，升力系数会系统性偏低。远场距离不足造成的误差有一个非常有用的性质：二维外流的积分量误差随远场半径按 $1/R$ 单调收敛。这意味着不必真的把域放到 $100c$，只要做三级远场并拟合外推，就能得到 $R \to \infty$ 的极限值。

## 基础概念与控制关系

### 扰动衰减律决定域要多大

绕流扰动的远场衰减规律由奇点的空间维数决定。二维升力体等价于一个点涡，周向诱导速度按 $1/r$ 衰减：

$$
u_\theta(r) = \frac{\Gamma}{2\pi r}, \qquad \Gamma = \frac{C_L U_\infty c}{2}
$$

其中 $\Gamma$ 为环量，$C_L$ 为升力系数，$c$ 为弦长。三维有限翼展的尾涡系统在远场退化为偶极子型，衰减加快到 $1/r^2$，因此三维外流所需的远场距离（以弦长或展长为单位）比二维小。非升力体（钝体、圆柱）的近场由源汇项主导，也按 $1/r^2$ 衰减（三维），但尾迹中的涡量输运使有效衰减更慢，工程上仍按升力体标准保守取值。

判断"够远"的判据是远场处的扰动速度与来流之比。工程上取 $u_\theta/U_\infty < 0.1\%$ 作为可忽略阈值，由此反推所需半径。注意这是相对判据：升力系数越大、来流越慢，所需的 $r/c$ 越大。

### 一次可核对的远场距离估算

取翼型弦长 $c = 1.0\ \mathrm{m}$、来流马赫数 $M_\infty = 0.20$、升力系数 $C_L = 0.5$。标准大气声速 $a = 340.3\ \mathrm{m/s}$，则

$$
U_\infty = M_\infty a = 0.20 \times 340.3 = 68.1\ \mathrm{m/s}
$$

环量

$$
\Gamma = \frac{C_L U_\infty c}{2} = \frac{0.5 \times 68.1 \times 1.0}{2} = 17.0\ \mathrm{m^2/s}
$$

在 $r = 20c = 20\ \mathrm{m}$ 处，诱导速度

$$
u_\theta = \frac{17.0}{2\pi \times 20} = 0.135\ \mathrm{m/s}, \qquad \frac{u_\theta}{U_\infty} = \frac{0.135}{68.1} = 0.20\%
$$

在 $r = 40\ \mathrm{m}$ 处 $u_\theta = 0.068\ \mathrm{m/s}$，比值 $0.10\%$；在 $r = 10\ \mathrm{m}$ 处比值 $0.40\%$。因此对本例，只有 $r \ge 40c$ 才能满足 $0.1\%$ 阈值，而常用的 $20c$ 只到 $0.2\%$。这个估算解释了为什么升力体算例的远场常取 $50c \sim 100c$，而钝体算例 $20c$ 就够了。

### 不可压与可压的远场差异

不可压缩远场没有波的传播，信息以椭圆方式瞬间传递，因此远场距离的影响比可压缩流更"整体"：域缩小时不只是局部扰动增加，而是整个压力场被重新标定。可压缩亚声速流中远场误差主要通过声波反馈体现，表现为目标量的高频振荡。判别方法是看残差与目标量的时程：若远场太近，可压缩算例的 $C_L$ 时程会出现与远场距离相关的低频振荡，不可压算例则表现为收敛后 $C_L$ 的稳态偏差。

### 堵塞效应与镜像涡

当外流算例使用有限尺寸的"风洞式"远场（上下为壁面）时，必须计入堵塞。二维物体在高度 $H$ 的通道中，实心堵塞系数为

$$
\epsilon_s = \frac{\pi^2}{48} \left( \frac{c}{H} \right)^2
$$

取 $c = 1.0\ \mathrm{m}$、$H = 40\ \mathrm{m}$：

$$
\epsilon_s = \frac{\pi^2}{48} \left( \frac{1.0}{40} \right)^2 = 0.2056 \times 6.25\times 10^{-4} = 1.29\times 10^{-4} = 0.013\%
$$

$0.013\%$ 可忽略。若把 $H$ 降到 $5\ \mathrm{m}$，$\epsilon_s = 0.2056 \times 0.04 = 0.82\%$，对应的速度修正约 $0.8\%$，直接进入升力系数的误差预算。更隐蔽的是镜像涡效应：壁面会引入无穷多个镜像涡，最近一对镜像涡对翼型的诱导下洗约为 $u_i/U_\infty \approx (c/H)^2/(2\pi)$ 量级，在 $H = 5\ \mathrm{m}$ 时约 $0.64\%$，与实心堵塞同量级。因此外流算例应优先用无反射的开放远场（`freestream` + `waveTransmissive`），而不是带壁面的风洞式远场，除非目的就是复现风洞修正。

## 适用边界与方案选择

### 特征变量与远场条件的给定方式

可压缩流的远场不能简单地固定所有变量，否则会把本该穿出的扰动反射回域内。正确的做法是按黎曼不变量区分进出信息。一维等熵关系给出两个不变量：

$$
J_\pm = u_n \pm \frac{2a}{\gamma - 1}
$$

亚声速远场中，$J_- = u_n - 2a/(\gamma-1)$ 由域外（自由来流）传入，$J_+ = u_n + 2a/(\gamma-1)$ 由域内外推。代入 $\gamma = 1.4$、$a = 340.3\ \mathrm{m/s}$、$u_n = 68.1\ \mathrm{m/s}$：

$$
J_+ = 68.1 + \frac{2 \times 340.3}{0.4} = 68.1 + 1701.5 = 1769.6\ \mathrm{m/s}
$$

远场边界在每个面元上保留 $J_-$ 为来流值、允许 $J_+$ 随域内解变化，从而让出射波自由穿出。超声速远场则全部由上游值确定，不设不变量外推。工程实现上，OpenFOAM 的 `freestream` 类型对速度与湍流量按"入流给来流值、出流零梯度"处理，`waveTransmissive` 对压力用类似辐射条件的处理，两者常配对使用。

## 工程设置与实施

### 远场字典配置

```text
// 0/U：不可压或亚声速外流，远场用 freestream
boundaryField
{
    farfield
    {
        type            freestream;
        freestreamValue uniform (68.1 0 0);      // M=0.20 对应的来流速度 m/s
    }
}

// 0/p：可压缩外流，压力用波透射条件，避免声波反射
boundaryField
{
    farfield
    {
        type            waveTransmissive;
        field           p;
        gamma           1.4;
        fieldInf        101325;                  // 远场静压 Pa
        lInf            20;                      // 松弛长度，取 0.5 ~ 1 倍域尺度 m
    }
}

// 0/k：远场湍流量按来流强度给，避免默认值污染
boundaryField
{
    farfield
    {
        type            freestream;
        freestreamValue uniform 0.0456;          // I=0.1%, U=68.1 m/s 时 k=1.5*(U*I)^2
    }
}
```

`lInf` 是 `waveTransmissive` 的关键参数，它决定辐射条件的松弛尺度，经验取域尺度的 $0.5 \sim 1$ 倍。设得过小会使边界对压力扰动过于敏感，表现为压力场在远场附近出现高频抖动。

### 诊断脚本

```bash
#!/usr/bin/env bash
# 三级远场扫描：只改 blockMeshDict 的外边界位置，其余保持一致
for R in 10 20 40; do
    cp -r base "case_${R}c"
    # 通过 topoSet/blockMesh 的外边界坐标缩放实现远场外移
    foamDictionary -entry "vertices" -set "" "case_${R}c/system/blockMeshDict"
    ( cd "case_${R}c" && ./Allrun > log.run 2>&1 )
    ( cd "case_${R}c" && postProcess -func forceCoeffs -latestTime >> log.run 2>&1 )
done
grep -h "^lift" case_*c/postProcessing/forceCoeffs/*/coefficient.dat | tail -3
```

```python
import numpy as np
R = np.array([10.0, 20.0, 40.0])          # 以弦长为单位
CL = np.array([0.423, 0.435, 0.441])      # 三级远场的升力系数

coef = np.polyfit(1.0 / R, CL, 1)         # CL = CL_inf - A/R
CL_inf, A = coef[1], -coef[0]
alpha, M = np.radians(4.0), 0.20
CL_th = 2 * np.pi * alpha / np.sqrt(1 - M**2)
print("A = %.4f, CL_inf = %.4f, 基准 = %.4f, 偏差 = %.2f %%"
      % (A, CL_inf, CL_th, abs(CL_inf - CL_th) / CL_th * 100))
for r, cl in zip(R, CL):
    print("R/c=%4.0f CL=%.4f 偏差=%.2f %%" % (r, cl, abs(cl - CL_th) / CL_th * 100))

c, H, CD, CL_meas = 0.3, 0.6, 0.0082, 0.459
eps_wb = c / (2 * H) * CD
print("eps_wb = %.3f %%, CL_free = %.4f"
      % (eps_wb * 100, CL_meas * (1 - 2 * (eps_wb + 0.014))))
```

脚本同时给出外推值、逐级偏差与堵塞修正，三行输出即可构成一份完整的远场验证记录。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 升力系数比薄翼理论低 $5\%$ 以上 | 远场太近，环量诱导速度被强制为零 | 用 $\Gamma/(2\pi r U)$ 估远场扰动比，应 $< 0.1\%$ |
| 压力场在远场附近高频抖动 | `waveTransmissive` 的 `lInf` 过小 | 把 `lInf` 调到 $0.5 \sim 1$ 倍域尺度，看抖动是否消失 |
| $C_L$ 时程出现低频振荡 | 远场距离不足，声波反馈 | 远场外移一倍重算，比较振荡幅度 |
| 壁面式远场算例阻力偏高 $0.8\%$ | 实心堵塞与镜像涡未修正 | 用 $\epsilon_s = \pi^2 c^2/(48H^2)$ 估算并扣除 |
| 亚声速远场给固定压力导致残差平台 | 固定了应外推的特征变量 | 改用黎曼不变量型条件，检查压力残差是否下降 |
| 远场湍流量出现异常值 | 用了默认 $\nu_t/\nu$ 而非来流强度 | 输出远场面 $\nu_t/\nu$，应与来流反算值一致 |
| 三级远场拟合出的 $A$ 不唯一 | 最小远场未进入 $1/R$ 渐近区 | 用 20c/40c 与 10c/20c 分别拟合，$q_\infty$ 应一致到 $0.5\%$ |
| 外推值比薄翼基准高 $5\%$ 以上 | 使用了三维的 $1/R^2$ 拟合二维数据 | 检查拟合幂次，二维必须用 $1/R$ |
| 与风洞数据差 $-2.7\%$ | 未做堵塞修正 | 用 $\epsilon_{wb} = cC_D/(2H)$ 加实心堵塞修正后重比 |
| 动量法与壁面法阻力差 $> 2\%$ | 远场反射产生伪阻力 | 检查远场动量通量闭合，改用无反射边界 |
| $C_L$ 随远场距离非单调变化 | 远场边界类型不匹配（固定值 vs 无反射） | 统一改用 `freestream` + `waveTransmissive` 重算 |
| 外推 $q_\infty$ 随网格加密漂移 | 离散误差与远场误差耦合 | 固定远场加密网格，看 $q_\infty$ 是否稳定 |

## 验证、验收与复现

### 用薄翼理论建立升力基准

自洽外推只证明序列收敛，不证明结果正确。薄翼理论给出低速小迎角下的升力基准，配合 Prandtl-Glauert 可压缩修正：

$$
C_L = \frac{2\pi \alpha}{\sqrt{1 - M_\infty^2}}
$$

取迎角 $\alpha = 4^\circ = 0.06981\ \mathrm{rad}$、$M_\infty = 0.20$。先算二维不可压值 $2\pi\alpha = 2\pi \times 0.06981 = 0.4386$，再除以 $\sqrt{1-0.04} = 0.97980$：

$$
C_L^{theory} = \frac{0.4386}{0.97980} = 0.4477
$$

这个基准适用于薄翼型、小迎角、无分离的工况。若翼型相对厚度 $t/c = 0.12$，实际升力线斜率会因厚度效应略高于薄翼值（约 $+2\%$），因此基准的适用容差应放到 $\pm 3\%$。

### 远场误差按 1/R 收敛，可以外推

二维升力体的远场扰动是点涡型，诱导速度按 $1/R$ 衰减，因此积分量的远场误差也按 $1/R$ 衰减。设 $R$ 以弦长 $c$ 为单位，则

$$
q(R) = q_\infty - \frac{A}{R}
$$

其中 $q_\infty$ 是无限远场的极限值，$A$ 是与环量有关的常数。三维外流的尾涡系统按 $1/R^2$ 衰减，同样的拟合要改成 $q(R) = q_\infty - A/R^2$；若把二维公式用在三维算例上，外推值会系统性偏离。这条关系成立的前提是远场足够远、扰动已进入点涡主导区，一般 $R \ge 10c$ 后成立。

用两级的解即可解出 $q_\infty$ 与 $A$，用三级可检验 $1/R$ 关系是否真的成立——把三级解分别两两配对，若得到的 $q_\infty$ 一致到 $0.5\%$ 以内，说明已进入渐近区；若不一致，需要把最小的一级远场排除或继续外移。

### 三级远场的收敛拟合

对同一翼型算例，远场半径分别取 $R/c = 10, 20, 40$，提取升力系数：

用 $R/c = 20$ 与 $40$ 两级拟合：$0.435 = q_\infty - A/20$，$0.441 = q_\infty - A/40$，相减得

$$
A = 40 \times (0.441 - 0.435) = 0.24, \qquad q_\infty = 0.441 + \frac{0.24}{40} = 0.447
$$

外推值 $0.447$ 与薄翼基准 $0.4477$ 相差 $0.2\%$，远优于最粗远场的 $5.5\%$ 偏差（$|0.423-0.4477|/0.4477$）。再用 $R/c = 10$ 与 $20$ 两级独立拟合，得到 $A = 0.24$、$q_\infty = 0.447$，完全一致，说明 $1/R$ 关系成立。

| 远场半径 $R/c$ | 远场扰动比 $u_\theta/U_\infty$ | $C_L$ | 与上一级变化 |
| --- | --- | --- | --- |
| 10 | $0.40\%$ | 0.423 | — |
| 20 | $0.20\%$ | 0.435 | $+2.8\%$ |
| 40 | $0.10\%$ | 0.441 | $+1.4\%$ |

### 与风洞数据的对照需要先做堵塞修正

实验数据来自有限尺寸的风洞，必须先把堵塞效应修正到自由飞行条件才能与 CFD 对照。实心堵塞由模型厚度占试验段高度决定，尾流堵塞由阻力决定（Maskell 关系）：

$$
\epsilon_{wb} = \frac{c}{2H} C_D
$$

取模型弦长 $c = 0.3\ \mathrm{m}$、试验段高度 $H = 0.6\ \mathrm{m}$、阻力系数 $C_D = 0.0082$：

$$
\epsilon_{wb} = \frac{0.3}{2 \times 0.6} \times 0.0082 = 0.25 \times 0.0082 = 2.05\times 10^{-3} = 0.205\%
$$

实心堵塞按 $\epsilon_s \approx (t/c)^2$ 量级估算，$t/c = 0.12$ 时 $\epsilon_s \approx 1.4\%$，两者合计 $\epsilon \approx 1.6\%$。速度修正为 $U_c = U_\infty (1 + \epsilon)$，升力系数按 $C_L^{free} \approx C_L^{meas}(1 - 2\epsilon)$ 修正，即测得 $C_L = 0.459$ 时自由飞行值为 $0.459 \times (1 - 0.032) = 0.444$。若不做这一步直接与 CFD 的 $0.447$ 对照，会得到 $-2.7\%$ 的虚假偏差，而修正后偏差只有 $+0.7\%$。

### 阻力分解中的伪阻力

远场太近或远场边界反射会在阻力中产生不来自物理的"伪阻力"。判定方法是把阻力分解为压差阻力与黏性阻力两部分（通过壁面积分），再与动量亏损法（通过控制面通量积分）得到的阻力比较：

$$
C_D^{momentum} = \frac{2}{\rho U_\infty^2 c} \int_{S} \rho u (U_\infty - u)\,\mathrm{d}y
$$

若两者相差超过 $C_D$ 的 $2\%$，多出的部分即为伪阻力，来源通常是远场处的动量通量未被正确闭合。

## 参考资料

1. Thomas J.L., Salas M.D., "Far-Field Boundary Conditions for Transonic Lifting Solutions to the Euler Equations", *AIAA Journal*, 24(7), 1074-1080, 1986.
2. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
3. Abbott I.H., von Doenhoff A.E., *Theory of Wing Sections*, Dover Publications, 1959.
4. Barlow J.B., Rae W.H., Pope A., *Low-Speed Wind Tunnel Testing*, 3rd ed., Wiley, 1999.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, freestream and waveTransmissive boundaries, v2312, 2023.
6. Maskell E.C., "A Theory of the Blockage Effects on Bluff Bodies and Stalled Wings in a Closed Wind Tunnel", *Aeronautical Research Council R&M 3400*, 1963.
7. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
