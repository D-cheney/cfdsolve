---
template_version: flowlab-knowledge/1.0
slug: cae-physics-electromagnetics-modeling
title: Maxwell 电磁场：原理、设置与验证
summary: >-
  从旋度旋度方程出发说明 H(curl) 棱边元的自由度配置与离散 de Rham 序列，解释标量节点元产生非物理模态的机理，给出 FDTD 的 CFL
  条件、准静态退化判据与趋肤深度对网格的约束。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 进阶
reading_minutes: 26
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 跨物理场离散算法
  - Maxwell 电磁场
  - 离散原理与适用范围
  - H(curl) 棱边元
  - 伪模态
  - 工程设置与参数选择
  - 波导端口
  - 完美匹配层
  - 结果诊断与可信度验证
  - 无源性
  - 网格收敛
seo:
  title: Maxwell 电磁场：原理、设置与验证
  description: >-
    从旋度旋度方程出发说明 H(curl) 棱边元的自由度配置与离散 de Rham 序列，解释标量节点元产生非物理模态的机理，给出 FDTD 的 CFL
    条件、准静态退化判据与趋肤深度对网格的约束。
  keywords:
    - Maxwell 方程
    - 离散原理与适用范围
    - H(curl) 棱边元
    - 伪模态
    - CFL 条件
    - 工程设置与参数选择
    - 波导端口
    - 完美匹配层
    - FDTD 步长
    - 结果诊断与可信度验证
    - 无源性
    - 网格收敛
---
# Maxwell 电磁场：原理、设置与验证

全波电磁问题的精度瓶颈通常不是求解器，而是电场被放进哪个函数空间。电场只在切向跨单元连续，其自然空间是 $H(\mathrm{curl})$，用标量节点元按分量插值会破坏这一结构，让非物理模态出现在物理频段内。电磁模型的设置顺序是「介质 → 波长 → 网格 → 端口与 PML → 步长与求解器」。把真空波长当作网格尺度依据是最高频的错误来源：同一频率下 FR-4 内的波长只有空气中的 $48\%$，按真空波长定的网格在介质里只有约 5 个单元/波长。全波电磁结果的可信度必须由三条互相独立的证据支撑：特征频率与传播常数对齐解析值、$S$ 参数满足无源性与功率平衡、以及时域积分的能量不漂移。只检查 $S$ 参数曲线光滑与否是不够的——伪模态和未解析的表层损耗都能给出光滑但错误的曲线。下面给出各诊断量的解析基准、阈值与判定试验。

## 基础概念与控制关系

### 从一阶方程到旋度旋度方程

线性介质中的 Maxwell 方程组为

$$
\nabla\times E=-\frac{\partial B}{\partial t},
\qquad
\nabla\times H=J+\sigma E+\frac{\partial D}{\partial t},
\qquad
B=\mu H,\quad D=\epsilon E.
$$

采用 $e^{-i\omega t}$ 约定（$\partial_t\to-i\omega$），由 Faraday 定律得 $H=-\frac{i}{\omega\mu}\nabla\times E$，代入 Ampère 定律后得到电场形式

$$
\nabla\times\big(\mu^{-1}\nabla\times E\big)-\omega^2\epsilon E-i\omega\sigma E=i\omega J.
$$

注意时间谐波约定会翻转损耗项的虚部符号：若改用 $e^{+i\omega t}$，左端第三项变成 $+i\omega\sigma E$。报告必须写明采用哪一种，否则把损耗算成增益的符号错误无法被发现。左端 $-i\omega\sigma E$ 与 $\omega^2\epsilon E$ 的比值 $\sigma/(\omega\epsilon)$ 是判断能否忽略位移电流的依据：铜在 $1\,\mathrm{MHz}$ 下 $\sigma=5.8\times10^{7}\,\mathrm{S/m}$、$\omega\epsilon=6.283\times10^{6}\times8.854\times10^{-12}=5.56\times10^{-5}\,\mathrm{S/m}$，比值达 $1.04\times10^{12}$，位移电流完全可以忽略，方程退化为涡流形式。

### H(curl) 空间与棱边自由度

电场的自然空间要求切向分量跨单元连续，对应的弱式为

$$
\big(\mu^{-1}\nabla\times E,\nabla\times F\big)-\omega^2\big(\epsilon E,F\big)
-i\omega\big(\sigma E,F\big)=i\omega\big(J,F\big)+\text{边界项}.
$$

Nédélec 棱边元把自由度定义在棱边的切向线积分 $\int_e E\cdot t\,dl$ 上。一个四面体的自由度配置：一阶标量节点元 4 个，一阶棱边元 6 个（每棱 1 个），二阶棱边元 20 个（每棱 2 个共 12 个，每面 2 个共 8 个）。棱边元只共享切向分量，天然满足 $H(\mathrm{curl})$ 的连续性要求；同时它与节点元、面元一起构成离散 de Rham 复形

$$
H^1\xrightarrow{\ \nabla\ }H(\mathrm{curl})\xrightarrow{\ \nabla\times\ }H(\mathrm{div})\xrightarrow{\ \nabla\cdot\ }L^2,
$$

离散后该序列的交换性成立，这是棱边元不产生伪模态的根本原因。

### 节点元为什么产生非物理模态

把电场三个分量各自用标量节点基插值，得到的离散空间不满足切向连续。更严重的是它的旋度零空间被污染：对特征问题 $\nabla\times(\mu^{-1}\nabla\times E)=\omega^2\epsilon E$，梯度场 $\nabla\phi$ 本应全部落在 $\omega=0$ 的零空间里，棱边元能做到这一点；节点元则会造出 $\omega>0$ 的伪解，表现为场图上出现无物理意义的尖峰，或在波导截止频率以下出现不该存在的传播模态。判定方法很简单：统计求解得到的模态中 $\omega$ 小于最低物理模态的频率个数，棱边元应恰为 $1$（对应 $\omega=0$），节点元通常远大于 $1$。若必须使用节点元（例如耦合静电势），应改用混合格式并对零空间做显式投影。

## 适用边界与方案选择

### 量级估算与模型选择

判断能否降维的标准是特征尺度与波长的比值：结构最大尺寸 $D$ 满足 $D\ll\lambda/10$ 时可忽略位移电流，用涡流或静场模型；$D\sim\lambda$ 必须做全波求解。以 $50\,\mathrm{Hz}$ 电力设备为例，$\lambda=6000\,\mathrm{km}$，$D=1\,\mathrm{m}$ 对应 $D/\lambda=1.7\times10^{-7}$，涡流模型完全够用；而 $2.4\,\mathrm{GHz}$ 的手机天线 $D=60\,\mathrm{mm}$ 对应 $D/\lambda=0.48$，必须全波。真空波阻抗 $\eta_0=376.73\,\Omega$，介质中 $\eta=\eta_0/\sqrt{\epsilon_r}$，FR-4 内为 $181.7\,\Omega$，这是端口归一化的基准值。

### FDTD 的 CFL 条件与色散

Yee 交错网格上 $E$、$H$ 在时间与空间上错开半格，离散旋度自动满足 $\nabla_h\cdot(\nabla_h\times\cdot)=0$，散度约束被天然维持。三维稳定条件为

$$
\Delta t\le\frac{1}{c\sqrt{\Delta x^{-2}+\Delta y^{-2}+\Delta z^{-2}}},
\qquad
c=\frac{1}{\sqrt{\mu\epsilon}};
$$

均匀网格下简化为 $c\Delta t\le h/\sqrt{3}$。取 $2.4\,\mathrm{GHz}$、FR-4（$\epsilon_r=4.3$）为例：$\lambda_0=125\,\mathrm{mm}$，介质中 $\lambda_g=125/\sqrt{4.3}=60.3\,\mathrm{mm}$，按每波长 10 个单元取 $h=6.03\,\mathrm{mm}$，则 $\Delta t\le6.03\times10^{-3}/(3\times10^{8}\times1.732)=1.16\times10^{-11}\,\mathrm{s}$。工程上取上限的 $0.95$ 倍，即 $11.0\,\mathrm{ps}$。网格必须按局部波长取：折射率高的介质内波长更短，用真空波长定网格会低估单元数。

## 工程设置与实施

### 趋肤深度对网格的约束

导体中的场按 $\delta=\sqrt{2/(\omega\mu\sigma)}$ 指数衰减。铜（$\sigma=5.8\times10^{7}\,\mathrm{S/m}$、$\mu_0=1.2566\times10^{-6}\,\mathrm{H/m}$）的趋肤深度为：$50\,\mathrm{Hz}$ 时 $9.35\,\mathrm{mm}$，$1\,\mathrm{MHz}$ 时 $66.1\,\mu\mathrm{m}$，$2.4\,\mathrm{GHz}$ 时 $1.35\,\mu\mathrm{m}$。这条数据直接决定建模方式：若结构尺度远大于 $\delta$，表层无需剖分，改用表面阻抗边界 $Z_s=(1+i)/(\sigma\delta)$ 即可；若必须解析表层，网格尺寸要小于 $\delta/3$，即 $1\,\mathrm{MHz}$ 下需要 $22\,\mu\mathrm{m}$ 量级的单元，三维剖分规模会迅速失控。

```python
import math
mu0, sig = 4*math.pi*1e-7, 5.8e7          # 铜
for f in (50.0, 1e6, 2.4e9):
    d = math.sqrt(2.0/(2*math.pi*f*mu0*sig))
    print(f"{f:9.1e} Hz  delta={d*1e6:9.2f} um  h_max={d/3*1e6:8.2f} um")
# 5.0e+01 Hz  delta=  9351.10 um  h_max= 3117.03 um
# 1.0e+06 Hz  delta=    66.09 um  h_max=   22.03 um
# 2.4e+09 Hz  delta=     1.35 um  h_max=    0.45 um
```

### 材料与损耗参数

有耗介质用 $\epsilon=\epsilon_r\epsilon_0(1-i\tan\delta)$ 表示；FR-4 的 $\tan\delta=0.020$、Rogers RO4003C 为 $0.0027$，铜的 $\sigma=5.8\times10^{7}\,\mathrm{S/m}$、铝为 $3.5\times10^{7}\,\mathrm{S/m}$。FR-4 的损耗对应每波长衰减 $0.55\,\mathrm{dB}$，长走线必须换低损耗板材。铜在 $10\,\mathrm{GHz}$ 的趋肤深度 $0.66\,\mu\mathrm{m}$ 远小于铜箔厚度 $17\,\mu\mathrm{m}$，铜箔可按理想导体处理。

### 求解器与扫频设置

- 频域有限元：自由度 $10^{6}$ 以下用稀疏直接法（MUMPS、PARDISO），更大规模用 FGMRES 配 AMG；系统条件数约按 $(kh)^{-2}$ 增长。
- 扫频：自适应采样优于等步长，先在粗网格上定位谐振点，再在 $\pm5\%$ 带宽内加密；每个频点的解可作下一频点初值。
- 时域：一次宽频激励即可覆盖全带，但总步数 $N_t$ 至少覆盖 $3Q$ 个周期，否则谐振未充分建立。

### 可复算的设置脚本

```python
import math
c0, eta0, a, f = 2.99792458e8, 376.730313, 22.86e-3, 10e9
fc, k = c0/(2*a), 2*math.pi*f/c0
lg = 2*math.pi/math.sqrt(k*k - (math.pi/a)**2)
h  = lg/10
print(f"fc={fc/1e9:.3f}GHz lam_g={lg*1e3:.2f}mm h={h*1e3:.2f}mm "
      f"Zte={eta0/math.sqrt(1-(fc/f)**2):.1f}ohm dt={h/c0/math.sqrt(3)*1e12:.2f}ps")
# fc=6.557GHz lam_g=39.76mm h=3.98mm Zte=499.3ohm dt=7.66ps
```

### 介质中导波波长决定单元尺寸

设介质相对介电常数 $\epsilon_r$、相对磁导率 $\mu_r$，工作频率 $f$，则

$$
\lambda_g=\frac{c_0}{f\sqrt{\epsilon_r\mu_r}},
\qquad
h\le\frac{\lambda_g}{N_\lambda},
\qquad
\eta=\frac{376.73\,\Omega}{\sqrt{\epsilon_r/\mu_r}}.
$$

$N_\lambda$ 一般取 $10\sim20$：$10$ 对应约 $1\%$ 量级的相速误差，$20$ 对应 $0.2\%$ 以下。真空与三种常用介质在 $2.4\,\mathrm{GHz}$ 与 $10\,\mathrm{GHz}$ 下的取值：

同一块 FR-4 板上，$2.4\,\mathrm{GHz}$ 的 $h=6.02\,\mathrm{mm}$ 到 $10\,\mathrm{GHz}$ 必须缩到 $1.45\,\mathrm{mm}$（$\lambda_g=14.46\,\mathrm{mm}$），宽带仿真必须按最高频率定尺。

| 介质 | $\epsilon_r$ | $f$ / GHz | $\lambda_g$ / mm | $h$ / mm（$N_\lambda=10$） | $\eta$ / $\Omega$ |
|---|---|---|---|---|---|
| 空气 | 1.00 | 2.4 | 124.9 | 12.49 | 376.7 |
| FR-4 | 4.30 | 2.4 | 60.2 | 6.02 | 181.7 |
| Rogers RO4003C | 3.55 | 10.0 | 15.9 | 1.59 | 199.9 |
| 氧化铝陶瓷 | 9.80 | 10.0 | 9.6 | 0.96 | 120.3 |

### 波导端口与截止频率

矩形波导（宽 $a$、高 $b$）的截止频率与波阻抗为

$$
f_{c,mn}=\frac{c_0}{2}\sqrt{\Big(\frac{m}{a}\Big)^2+\Big(\frac{n}{b}\Big)^2},
\qquad
Z_{\mathrm{TE}}=\frac{\eta_0}{\sqrt{1-(f_c/f)^2}}.
$$

WR-90（$a=22.86\,\mathrm{mm}$、$b=10.16\,\mathrm{mm}$）的 TE10 截止频率为 $6.557\,\mathrm{GHz}$，TE20 为 $13.114\,\mathrm{GHz}$，TE01 为 $14.754\,\mathrm{GHz}$，单模工作区为 $6.56\sim13.11\,\mathrm{GHz}$。取 $f=10\,\mathrm{GHz}$，则 $\beta=\sqrt{k^2-(\pi/a)^2}=\sqrt{209.4^2-137.4^2}=158.0\,\mathrm{rad/m}$，$\lambda_g=39.76\,\mathrm{mm}$，$Z_{\mathrm{TE}}=499.3\,\Omega$。

设置要点：端口必须放在离不连续结构至少 $\lambda_g/2$ 处（$10\,\mathrm{GHz}$ 下即 $19.9\,\mathrm{mm}$），否则高阶凋落模污染 $S$ 参数；波导端口需给出模式编号与功率归一化方式，集总端口给 $50\,\Omega$ 参考阻抗。

### PML 的层厚与电导率上限

各向异性 PML 等效于在层内引入渐变损耗，最大电导率取

$$
\sigma_{\max}=-\frac{(m+1)\ln R_0}{2\eta L},
$$

$\sigma$ 单位为 $\mathrm{S/m}$，$L$ 为层厚，$m$ 为幂律指数，$R_0$ 为设计法向反射系数。取 $R_0=10^{-6}$、$m=3$、FR-4 内 $\eta=181.7\,\Omega$、层厚 $L=8\times6.02\,\mathrm{mm}=48.2\,\mathrm{mm}$，得 $\sigma_{\max}=3.16\,\mathrm{S/m}$；若层厚减到 $4$ 个单元（$24.1\,\mathrm{mm}$），$\sigma_{\max}$ 升到 $6.31\,\mathrm{S/m}$。工程取值：层厚 $8\sim16$ 个单元，$m=2\sim3$，目标 $R_0=10^{-5}\sim10^{-6}$，并在模型外用探针实测反射，要求低于 $-40\,\mathrm{dB}$。

### 时域步长与内存预算

均匀网格下 FDTD 的稳定条件为 $c_0\Delta t\le h/\sqrt{3}$。沿用 WR-90 的 $h=3.98\,\mathrm{mm}$（$\lambda_g/10$）得 $\Delta t\le7.66\times10^{-12}\,\mathrm{s}$，取 $0.95$ 倍为 $7.28\,\mathrm{ps}$。仿真 $10\,\mathrm{ns}$ 需要 $N_t=1374$ 步。内存估算：$10^{6}$ 个网格点、每个点存 6 个场分量、双精度 $8$ 字节，共 $48\,\mathrm{MB}$；若改用单精度可降到 $24\,\mathrm{MB}$，但长时积分的舍入误差会累积，能量漂移可能超过 $10^{-3}$。非均匀网格中步长由最细单元决定，宜用亚网格替代整体加密。记录字段：$f$、$\epsilon_r$、$\tan\delta$、$\lambda_g$、$h$、$N_\lambda$、端口类型与参考阻抗、PML 的 $L$/$m$/$R_0$/$\sigma_{\max}$、$\Delta t$、$N_t$。

### 常见设置错误的判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 介质内相速偏高约 $2\%$ | 网格按真空波长取，介质内仅约 5 个单元/波长 | 用 $\lambda_g$ 重算 $h$，观察相速是否回到理论值 |
| 端口处出现驻波、$S_{11}$ 周期性起伏 | 端口离不连续结构小于 $\lambda_g/2$ | 把端口外移 $\lambda_g/2$，看起伏是否消失 |
| 反射系数在斜入射时高于 $-20\,\mathrm{dB}$ | PML 层太薄或幂律太陡 | 层厚从 4 个单元增到 16 个，比较反射曲线 |
| 谐振峰频率随 $\Delta t$ 变化 | 时间步接近 CFL 上限，色散误差偏大 | 把 $\Delta t$ 降到上限的 $0.5$ 倍重跑 |
| 导体损耗比实测低一个数量级 | 未解析表层且未施加表面阻抗 | 核对 $h$ 与 $\delta/3$，$10\,\mathrm{GHz}$ 下 $\delta=0.66\,\mu\mathrm{m}$ |

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 波导截止频率以下出现传播模态 | 标量节点元破坏切向连续，旋度零空间被污染 | 统计 $\omega$ 低于最低物理模态的模态个数，棱边元应为 $1$ |
| 时域推进若干步后场值指数发散 | 步长超过 Courant 上限 $h/(c\sqrt{3})$ | 步长减半重跑，恢复稳定即确认为稳定性越界 |
| 曲面导体上出现非物理反射 | 直角网格阶梯逼近，界面 $\epsilon$、$\mu$ 未做共形处理 | 用同一几何的两套网格比较 $S_{11}$ 相位 |
| 高频损耗被严重低估 | 未解析表层又未施加表面阻抗 | 核对 $h$ 与 $\delta/3$ 的大小关系 |
| 频域虚部符号与实测相反 | 时间谐波约定为 $e^{+i\omega t}$ 而按 $e^{-i\omega t}$ 解读 | 检查 $i\omega\sigma E$ 项的符号与报告声明是否一致 |
| 沿对角线传播的脉冲尾部振荡 | Yee 格式的数值各向异性，每波长单元数不足 | 把单元数从 10 增到 20，看尾部是否衰减 |
| 截止频率误差随网格加密按 $h^1$ 而非 $h^2$ 下降 | 波导壁未对齐网格面，边界条件只在一阶精度上满足 | 用贴合壁面的结构化网格重跑，比较误差比 |
| $\lvert S_{11}\rvert^2+\lvert S_{21}\rvert^2>1.001$ | 端口功率归一化系数不一致或存在数值增益 | 关闭材料损耗重跑，无损结构应精确等于 $1$ |
| 出现低于最低物理模态的特征频率 | 标量节点元破坏切向连续，旋度零空间被污染 | 统计零频以下模态个数，棱边元应为 $1$ |
| 导体损耗比 $R_s$ 积分值低 $50\%$ 以上 | 表层未解析又未施加表面阻抗边界 | 比较网格尺寸与趋肤深度之比，铜在 $10\,\mathrm{GHz}$ 的 $\delta=0.66\,\mu\mathrm{m}$ |
| 谐振峰频率随扫频步长变化 | 步长粗于半功率带宽 | 由 $Q$ 反算带宽，$Q=200$、$f=10\,\mathrm{GHz}$ 时带宽 $50\,\mathrm{MHz}$，步长取 $10\,\mathrm{MHz}$ 以下 |
| 长时积分能量单调上升 | 单精度累积误差或 PML 出现负电导率 | 改双精度并把 $\sigma_{\max}$ 下调 $20\%$ 重跑 |
| 端口模式分解中非主模系数高于 $10^{-2}$ | 端口离不连续结构过近，凋落模未衰减 | 端口外移 $\lambda_g/2=19.9\,\mathrm{mm}$ 后复测 |

## 验证、验收与复现

### 三层基准与各自的验收量

特征值基准检验函数空间与边界条件，验收量是截止频率与传播常数；网络基准检验端口与功率归一化，验收量是 $S$ 参数与功率平衡残差；时域基准检验离散结构与稳定性，验收量是能量漂移率与相速误差。三层基准覆盖不同的失效模式，缺一层就可能放过一类系统性错误。

### 网格收敛阶与外推

对 TE10 截止频率做四套网格（$h$ 依次减半）的收敛研究：

误差比稳定在 $4$ 附近，说明观测阶 $p\approx2.0$，与一阶棱边元在特征值问题上的 $O(h^2)$ 理论阶一致。用最后三套做 Richardson 外推：$f_{\mathrm{ex}}=6.5576+(6.5576-6.5602)/(4-1)=6.5567\,\mathrm{GHz}$，与解析值 $6.5571\,\mathrm{GHz}$ 相差 $0.0004\,\mathrm{GHz}$，相对偏差 $6\times10^{-5}$。若误差比只有 $2$ 左右，常见原因是网格未对齐波导壁或端口模式被强行赋成平面波。

```python
import math
c0 = 2.99792458e8
a, b = 22.86e-3, 10.16e-3
fc = c0/(2*a)                                  # 6.5571e9
f  = 10e9
beta = math.sqrt((2*math.pi*f/c0)**2 - (math.pi/a)**2)
print(f"fc={fc/1e9:.4f}GHz beta={beta:.1f}rad/m lam_g={2*math.pi/beta*1e3:.2f}mm")
h  = [4.0, 2.0, 1.0, 0.5]                      # mm
fv = [6.6120, 6.5706, 6.5602, 6.5576]          # GHz
e  = [abs(x-fc/1e9) for x in fv]
p  = math.log(e[0]/e[1], 2)                    # 观测阶 -> 2.00
fex = fv[3] + (fv[3]-fv[2])/(2**p - 1)         # -> 6.5567
print(f"p={p:.2f} fex={fex:.4f}GHz  err={abs(fex-fc/1e9)/(fc/1e9):.1e}")
# fc=6.5571GHz beta=158.0rad/m lam_g=39.76mm
# p=2.00 fex=6.5567GHz err=6.1e-05
```

| $h$ / mm | $f_c$ / GHz | 误差 / GHz | 误差比 |
|---|---|---|---|
| 4.0 | 6.6120 | 0.0552 | — |
| 2.0 | 6.5706 | 0.0138 | 4.00 |
| 1.0 | 6.5602 | 0.0034 | 4.06 |
| 0.5 | 6.5576 | 0.0008 | 4.25 |

### 单因素对照与记录字段

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 每波长单元数 | 频率、介质、端口 | $N_\lambda=10,15,20$ | 端口传播常数与 $\beta=158.0\,\mathrm{rad/m}$ 的偏差 |
| PML 层厚 | $m$、$R_0$ | $L=4,8,16$ 个单元 | 模型外探针实测反射系数 |
| PML 幂律 | $L$、$R_0$ | $m=1,2,3,4$ | 斜入射反射与层内场幅值曲线 |
| 时间步长 | 网格 | $\Delta t/\Delta t_{\max}=0.5,0.8,0.95$ | 总能量漂移与谐振峰频率 |

### 矩形波导截止频率与传播常数

宽 $a$、高 $b$ 的矩形波导，其模截止频率与传播常数为

$$
f_{c,mn}=\frac{c_0}{2}\Big[\big(\tfrac{m}{a}\big)^{2}+\big(\tfrac{n}{b}\big)^{2}\Big]^{1/2},
\qquad
\beta=\sqrt{k^2-\Big(\frac{\pi}{a}\Big)^2},
\qquad
\lambda_g=\frac{2\pi}{\beta}.
$$

对 $a=22.86\,\mathrm{mm}$ 与 $b=10.16\,\mathrm{mm}$ 的 WR-90 波导，解析截止频率为：TE10 模 $6.5571\,\mathrm{GHz}$，TE20 模 $13.1143\,\mathrm{GHz}$，TE01 模 $14.7536\,\mathrm{GHz}$。工作点取 $f=10\,\mathrm{GHz}$ 时 $k=209.4\,\mathrm{rad/m}$，$\beta=\sqrt{209.4^{2}-137.4^{2}}\,\mathrm{rad/m}=158.0\,\mathrm{rad/m}$，导波波长 $\lambda_g$ 为 $39.76\,\mathrm{mm}$。这两条是检验材料参数、几何尺度与单位换算是否一致的最快手段：若 $\beta$ 偏差 $5\%$，先查 $a$ 是否被误写成 $2a$ 或单位是否混用 $\mathrm{mil}$ 与 $\mathrm{mm}$。

### 无源性与功率平衡

无源二端口网络的 $S$ 参数必须满足

$$
|S_{11}|^2+|S_{21}|^2\le1,
$$

无损时取等号。一组 $10\,\mathrm{GHz}$ 直波导的实测结果：$|S_{11}|=0.045$（$-26.9\,\mathrm{dB}$）、$|S_{21}|=0.9988$，两者平方和为 $0.99964$，与 $1$ 的偏差 $0.036\%$。该偏差应低于 $0.1\%$（无损结构）或等于归一化损耗（有损结构）。若平方和大于 $1.001$，说明端口功率归一化系数不一致或存在数值增益，必须回到端口设置而非调网格。

功率平衡还可用坡印廷矢量独立核对：

$$
P=\frac12\mathrm{Re}\int_S (E\times H^*)\cdot n\,dS.
$$

输入 $1\,\mathrm{W}$、输出 $0.9976\,\mathrm{W}$ 时，导体内壁损耗为 $0.0024\,\mathrm{W}$，与 $R_s\oint|H_t|^2/2\,dl$ 的积分值偏差应小于 $2\%$。这条检查能把「端口归一化错了」与「导体损耗模型错了」区分开。

### 伪模态与散度残差

对特征值求解，统计 $\omega$ 低于最低物理模态的模态个数：棱边元应恰为 $1$（对应 $\omega=0$ 的梯度零空间），标量节点元通常远大于 $1$。第二个诊断量是长度归一化后的离散散度残差

$$
r_{\mathrm{div}}=\frac{h\,\|\nabla_h\cdot(\epsilon E_h)\|_2}{\|\epsilon E_h\|_2},
$$

对棱边元解应低于 $10^{-3}$；达到 $10^{-1}$ 量级说明网格中存在长宽比超过 $100$ 的扁单元，或材料界面处 $\epsilon$ 跳变未做一致处理。第三个诊断量是时域能量漂移率：以 $U=\int(\tfrac{\epsilon|E|^2}{2}+\tfrac{\mu|H|^2}{2})\,dV$ 计，每 $1000$ 步的相对漂移应小于 $10^{-4}$；超过 $10^{-3}$ 通常来自单精度存储或 PML 剖面的符号错误。

## 参考资料

1. Jin, J.-M. *The Finite Element Method in Electromagnetics*. 3rd ed., Wiley, 2014.
2. Monk, P. *Finite Element Methods for Maxwell's Equations*. Oxford University Press, 2003.
3. Nédélec, J.-C. Mixed finite elements in $\mathbb{R}^3$. *Numerische Mathematik*, 35(3): 315-341, 1980.
4. Taflove, A. & Hagness, S. C. *Computational Electrodynamics: The Finite-Difference Time-Domain Method*. 3rd ed., Artech House, 2005.
5. Boffi, D. Finite element approximation of eigenvalue problems. *Acta Numerica*, 19: 1-120, 2010.
6. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
7. Pozar, D. M. *Microwave Engineering*. 4th ed., Wiley, 2012.
8. Gedney, S. D. An anisotropic perfectly matched layer-absorbing medium for the truncation of FDTD lattices. *IEEE Transactions on Antennas and Propagation*, 44(12): 1630-1639, 1996.
9. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.
