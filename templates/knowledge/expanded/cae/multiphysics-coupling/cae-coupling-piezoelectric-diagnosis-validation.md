---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-piezoelectric-diagnosis-validation
title: "压电耦合：结果诊断与可信度验证"
summary: "用本构关系符号、电容-电荷闭合验算与谐振频率对照三条路径诊断压电耦合结果，给出 PZT-5H 的 d33、k33、开路电压与半波长谐振频率的手算核对。"
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
  - "压电耦合"
  - "结果诊断与可信度验证"
  - "d33 系数"
  - "机电耦合系数"
seo:
  title: "压电耦合：结果诊断与可信度验证"
  description: "用本构关系符号、电容-电荷闭合验算与谐振频率对照三条路径诊断压电耦合结果，给出 PZT-5H 的 d33、k33、开路电压与半波长谐振频率的手算核对。"
  keywords:
    - "压电耦合"
    - "结果诊断与可信度验证"
    - "d33 系数"
    - "机电耦合系数"
    - "谐振频率"
---

# 压电耦合：结果诊断与可信度验证

压电分析出错时，位移、电荷和电压三者往往"各自看起来合理"，但彼此不满足本构关系。诊断的关键是建立三条互相独立的闭合验算：本构关系的符号与量纲、电荷-电容-电压三角关系、以及谐振频率与机电耦合系数。本文以 PZT-5H 为例给出每一步的手算值，适用于换能器、超声振子与振动能量收集器的结果复核。

## 本构关系与 d31/d33 的符号约定

压电本构最常用的应变-电荷形式为

$$S_{3}=s_{33}^{E}T_{3}+d_{33}E_{3},\qquad D_{3}=d_{33}T_{3}+\varepsilon_{33}^{T}E_{3}$$

其中 $S$、$T$ 为应变与应力，$E$、$D$ 为电场与电位移，$s^{E}$ 为恒电场柔顺系数，$\varepsilon^{T}$ 为恒应力介电常数。方向 3 是极化轴。诊断第一查就是**方向约定**：PZT-5H 的 $d_{33}=+593\ \text{pC/N}$ 而 $d_{31}=-274\ \text{pC/N}$，横向系数为负。若仿真里 $d_{31}$ 取了正值，悬臂梁的自由端位移方向会整体反号，而电荷幅值仍正确——这类错误只有靠"位移方向与实测比对"才能发现。

第二查是量纲：$d$ 的单位是 $\text{C/N}=\text{m/V}$，两者等价。若输入文件里写成 $\text{pC/N}$ 而求解器按 SI 读取，结果会差 $10^{12}$ 倍，表现为位移小到看不见。

## 极化方向与坐标系一致性核对

有限元里极化方向由材料坐标系定义。常见的三类错误：其一，网格方向与极化轴不重合，导致 $d_{33}$ 被错误地作用到横向；其二，极化方向在装配后未随几何旋转；其三，多片叠堆中各片的极化方向未交替反接，使总输出相互抵消。

判定试验很直接：对单轴加载 $F=10\ \text{N}$ 施加在截面 $A=1.0\times10^{-4}\ \text{m}^2$ 上，应力 $T_3=10/1.0\times10^{-4}=1.0\times10^{5}\ \text{Pa}$，若极化与加载同向，则电荷

$$Q=d_{33}T_{3}A=593\times10^{-12}\times1.0\times10^{5}\times1.0\times10^{-4}=5.93\times10^{-9}\ \text{C}$$

即 5.93 nC。方向反接时读数应为 $-5.93$ nC。若仿真得到的幅值对而符号反，问题在极化方向；若幅值差一个量级，问题在 $d$ 系数或单位。

## 电荷、电容与开路电压的闭合验算

电极间的自由电容为

$$C_{p}=\frac{\varepsilon_{33}^{T}A}{t}$$

PZT-5H 的 $\varepsilon_{33}^{T}/\varepsilon_0=3400$，故 $\varepsilon_{33}^{T}=3400\times8.854\times10^{-12}=3.01\times10^{-8}\ \text{F/m}$。取 $A=1.0\times10^{-4}\ \text{m}^2$、厚度 $t=1.0\times10^{-3}\ \text{m}$，得 $C_p=3.01\times10^{-8}\times1.0\times10^{-4}/1.0\times10^{-3}=3.01\times10^{-9}\ \text{F}$，即 3.01 nF。

开路电压 $V_{oc}=Q/C_p=5.93\times10^{-9}/3.01\times10^{-9}=1.97\ \text{V}$。用电压常数 $g_{33}=d_{33}/\varepsilon_{33}^{T}=593\times10^{-12}/3.01\times10^{-8}=1.97\times10^{-2}\ \text{V}\cdot\text{m/N}$ 独立验算：$V_{oc}=g_{33}T_3t=1.97\times10^{-2}\times1.0\times10^{5}\times1.0\times10^{-3}=1.97\ \text{V}$，两条路径一致。**这就是闭合验算的标准形态**：电荷、电容、电压三者任取两个都能推出第三个，若仿真给出的三个量不满足 $V=Q/C$，一定是某个量的提取位置错了（例如把短路电荷当成开路电荷）。

## 谐振-反谐振与耦合系数的对照

机电耦合强度由

$$k_{33}^{2}=\frac{d_{33}^{2}}{s_{33}^{E}\varepsilon_{33}^{T}}$$

给出。PZT-5H 取 $s_{33}^{E}=2.07\times10^{-11}\ \text{m}^2/\text{N}$，则 $k_{33}^{2}=(593\times10^{-12})^{2}/(2.07\times10^{-11}\times3.01\times10^{-8})=3.52\times10^{-19}/6.23\times10^{-19}=0.564$，$k_{33}=0.751$，与厂家标称 0.75 吻合。

沿极化方向的半波长谐振频率为

$$f_{r}=\frac{1}{2L}\sqrt{\frac{1}{\rho s_{33}^{E}}}$$

取密度 $\rho=7500\ \text{kg/m}^3$，则声速 $c=\sqrt{1/(7500\times2.07\times10^{-11})}=2538\ \text{m/s}$；长 $L=10\ \text{mm}$ 的振子 $f_r=2538/(2\times0.01)=126.9\ \text{kHz}$。仿真扫频得到的阻抗极小值应在 126.9 kHz 附近（偏差 3% 内正常），反谐振频率应满足 $f_a\approx f_r/\sqrt{1-k_{33}^{2}}$；把 $k_{33}=0.751$ 代入得 $f_a/f_r=1/\sqrt{1-0.564}=1.514$，即约 192.1 kHz。**实测的 $f_a/f_r$ 与耦合系数互为验证**：若仿真给出 1.05，说明耦合被人为削弱，通常是 $d$ 或介电常数输错。

```text
# Abaqus 压电材料定义片段（e-形式，需与 d-形式换算后核对）
*MATERIAL, NAME=PZT-5H
*DENSITY
 7500.,
*ELASTIC, TYPE=ANISOTROPIC
 1.27e10, 8.02e9, 8.02e9, 1.27e10, 8.02e9, 1.27e10,
 2.29e10, 2.29e10, 2.29e10, 2.29e10, 2.29e10, 2.29e10
*PIEZOELECTRIC, TYPE=E
 0., 0., -6.62, 0., 0., -6.62, 0., 0., 23.2,
 0., 0., 0., 0., 17.0, 0., 17.0, 0., 0.
*DIELECTRIC, TYPE=ANISOTROPIC
 1.53e-8, 1.53e-8, 1.30e-8
```

上例中 $-6.62$ 与 $23.2\ \text{C/m}^2$ 即 $e_{31}$ 与 $e_{33}$，其负号关系必须与 $d_{31}<0$、$d_{33}>0$ 一致；仅核对一个分量的符号不足以确认，要同时检查两者的相对符号。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 位移方向与实测相反 | $d_{31}$ 或 $e_{31}$ 符号取正 | 单轴加载算电荷符号，与 5.93 nC 对照 |
| 输出小 $10^{12}$ 倍 | 输入用 pC/N 而求解器按 SI | 检查材料卡单位，按 m/V 复算 |
| $V\neq Q/C$ | 短路电荷被当成开路电荷 | 用 3.01 nF 电容反算并三方闭合 |
| 谐振频率偏高 5% 以上 | 声速用了 $s^{D}$ 而非 $s^{E}$ | 按 $c=\sqrt{1/(\rho s_{33}^{E})}$ 手算 2538 m/s |
| $f_a/f_r$ 接近 1 | 耦合系数被削弱，$d$ 或 $\varepsilon$ 错 | 用 $k_{33}=0.751$ 反算 $f_a/f_r=1.514$ |
| 叠堆输出相互抵消 | 各片极化方向未交替反接 | 逐片打印极化矢量方向 |
| 扫频出现多个伪峰 | 网格未分辨高阶模态 | 加密网格，检查峰位是否随网格移动 |

## 参考文献

1. IEEE Std 176-1987, *IEEE Standard on Piezoelectricity*, IEEE, 1987.
2. Jaffe B., Cook W.R., Jaffe H., *Piezoelectric Ceramics*, Academic Press, 1971.
3. Berlincourt D., Curran D.R., Jaffe H., "Piezoelectric and Piezomagnetic Materials and Their Function in Transducers," *Physical Acoustics*, Vol. 1A, Academic Press, 1964.
4. APC International, *Piezoelectric Ceramics: Principles and Applications*, 2nd ed., 2011.
5. Dassault Systèmes, *Abaqus Analysis User's Guide — Piezoelectric Analysis*, 2023.
6. Yang J., *An Introduction to the Theory of Piezoelectricity*, Springer, 2005.
