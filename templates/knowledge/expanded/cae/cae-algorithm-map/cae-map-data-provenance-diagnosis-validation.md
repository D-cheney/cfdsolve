---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-data-provenance-diagnosis-validation
title: "仿真数据谱系：结果诊断与可信度验证"
summary: "给出一份可直接落地的仿真元数据最小清单、SHA-256 链式存证的校验命令，以及用 L2 相对差区分浮点舍入差异与真实不一致的判据，用于跨团队交付、跨年复算或作为数字孪生输入时锁定数据来源。"
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
  - "仿真数据谱系"
  - "结果诊断与可信度验证"
  - "SHA-256 链式存证"
  - "浮点复现性"
seo:
  title: "仿真数据谱系：结果诊断与可信度验证"
  description: "给出一份可直接落地的仿真元数据最小清单、SHA-256 链式存证的校验命令，以及用 L2 相对差区分浮点舍入差异与真实不一致的判据，用于跨团队交付、跨年复算或作为数字孪生输入时锁定数据来源。"
  keywords:
    - "仿真数据谱系"
    - "结果诊断与可信度验证"
    - "哈希校验"
    - "浮点复现性"
    - "元数据清单"
---

# 仿真数据谱系：结果诊断与可信度验证

数据谱系失效的表现往往不是算错，而是"三个月后没人能重建这次计算"。本文给出一份可直接落地的元数据清单、SHA-256 链式存证的校验命令，以及区分"浮点舍入差异"与"真实不一致"的数值判据。适用于需要跨团队交付、跨年复算，或结果要作为数字孪生输入的仿真数据。

## 谱系断链的三种典型后果

1. 单位混用：以 psi 输入的弹性模量被当作 Pa，$2.9\times10^{7}\ \mathrm{psi}$ 被当成 $2.9\times10^{7}\ \mathrm{Pa}$，刚度低估 $6894.757$ 倍；
2. 网格版本错配：结果文件对应 1.2 GB 的 v3 网格，但归档只留了 v2，重算后目标量差 4.1%；
3. 后处理口径不同：一个团队取面积平均、另一个取质量加权平均，同一算例出口温度相差 3.8 K。

这三类问题都不能靠"更仔细"解决，只能靠记录与校验机制解决。

## 元数据最小清单

| 字段 | 示例 | 作用 |
|---|---|---|
| 算例 ID + 版本 | `case-0417-v3` | 唯一标识，禁止复用 |
| 几何哈希 | `sha256:9f2c...`（64 位十六进制） | 锁定几何 |
| 网格哈希 + 单元数 | `sha256:1a7b...`, 4,318,204 cells | 锁定离散 |
| 求解器 + 版本 | OpenFOAM v2312, build 20231220 | 锁定代码 |
| 编译与硬件 | gcc 12.3, -O2, Intel Xeon 8480+ | 锁定浮点行为 |
| 并行布局 | 512 ranks, scotch 分解 | 锁定归约顺序 |
| 输入参数表哈希 | `sha256:7d10...` | 锁定边界与材料 |
| 时间步与终止判据 | $\Delta t=10^{-4}\ \mathrm{s}$，残差 $10^{-7}$ | 锁定数值设置 |
| 后处理脚本哈希 | `sha256:c4e8...` | 锁定统计口径 |
| 目标量 + 单位 | $T_{out}=412.6\ \mathrm{K}$ | 锁定结论 |

10 个字段中缺任何一个，复算都会退化成"重新做一遍"。其中后处理脚本哈希最常被遗漏，而它正是上面第 3 类问题的根因。

## 哈希链与校验命令

单文件哈希只能证明"文件没变"，不能证明"文件按正确顺序生成"。用链式哈希记录生成关系：

$$H_i=\mathrm{SHA256}\!\left(H_{i-1}\,\|\,D_i\right),$$

$D_i$ 为第 $i$ 个产物（网格、初场、结果），$H_{i-1}$ 为上游产物哈希，$\|$ 表示字节串拼接。任何一个中间产物被替换，其后所有哈希都会改变，断链位置即污染位置。

```
# 生成并校验网格/结果哈希，输出到 provenance_mesh.txt
sha256sum mesh_v3/constant/polyMesh/* > provenance_mesh.txt
sha256sum postProcessing/outlet_T/0/surfaceFieldValue.dat >> provenance_mesh.txt
sha256sum -c provenance_mesh.txt          # 全部 OK 才允许归档

# 链式存证：把上游哈希拼进下游记录
UP=$(sha256sum mesh_v3/constant/polyMesh/points | cut -d' ' -f1)
printf '%s %s\n' "$UP" "solution_v3" | sha256sum   # 得到 H_i
```

归档前 `sha256sum -c` 必须全部返回 `OK`；出现 `FAILED` 时不要覆盖旧哈希，应记录新版本并从上游重新生成链。SHA-256 输出为 256 bit，即 64 个十六进制字符，任何长度不符的记录都是伪造或截断。

## 浮点复现性判据

不同核数、不同分解方式会产生舍入差异，需要用阈值区分"可接受舍入"与"真实不一致"：

$$\delta=\frac{\|q_{A}-q_{B}\|_2}{\|q_{A}\|_2},$$

$q$ 为同一算例在两种配置下的目标量向量。判据：同二进制、同编译选项、仅改核数时，$\delta\le10^{-8}$ 视为舍入可接受；要求逐位一致时 $\delta=0$；若 $\delta>10^{-5}$，则不是舍入，而是并行归约顺序改变了非线性迭代路径，必须定位到具体时间步。

一次可核对的手算：出口温度场在 512 核与 4096 核下的 $L_2$ 范数分别为 $412.6$ 与 $412.600018$（归一化量纲），差值 $1.8\times10^{-5}$，

$$\delta=\frac{1.8\times10^{-5}}{412.6}=4.4\times10^{-8},$$

略高于 $10^{-8}$，说明除舍入外还有约 $10^{-7}$ 量级的迭代路径差异，需要把线性求解器残差容差从 $10^{-6}$ 收紧到 $10^{-8}$ 后再比较。

## 单位一致性检查

跨单位制数据必须显式记录换算系数与来源。常用系数：$1\ \mathrm{psi}=6894.757\ \mathrm{Pa}$，$1\ \mathrm{lbf}=4.448222\ \mathrm{N}$，$T[\mathrm{K}]=T[^\circ\mathrm{C}]+273.15$，即 $300\ \mathrm{K}=26.85\ ^\circ\mathrm{C}$。若输入表里同时出现 $2.9\times10^{7}$ 与 $210\times10^{9}$ 两个"弹性模量"，前者是 psi、后者是 Pa，两者相差 $6894.757$ 倍，必须在同一张表内统一并留下换算记录。

## 失败模式：现象、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 重算目标量差 4% 且网格数一致 | 几何或网格版本错配 | 比对 `polyMesh` 全部文件的 SHA-256 |
| 出口温度相差 3.8 K | 后处理口径不同（面积平均 vs 质量加权） | 用同一脚本重算两种平均 |
| 改核数后结果跳变 $10^{-4}$ | 并行归约顺序改变迭代路径 | 用 $\delta$ 判据，收紧残差容差复测 |
| 材料参数差 6894 倍 | 单位制混用（psi/Pa） | 检查量纲与换算系数记录 |
| 无法复现三个月前的算例 | 求解器版本或编译选项未记录 | 核对版本号与编译器标志 |
| 归档目录存在但结果不可读 | 结果文件未纳入哈希清单 | 用 `sha256sum -c` 全量校验 |

## 谱系记录模板

```
case_id: case-0417-v3
geometry: {path: geom/rotor.step, sha256: 9f2c...}
mesh:     {path: mesh_v3, cells: 4318204, sha256: 1a7b...}
solver:   {name: OpenFOAM, version: v2312, build: 20231220}
hardware: {cpu: Xeon 8480+, ranks: 512, decomp: scotch}
inputs:   {E: "210 GPa", source: "ASTM E8", sha256: 7d10...}
numerics: {dt_s: 1.0e-4, residual: 1.0e-7}
post:     {script: post/outlet_T.py, sha256: c4e8...}
qoi:      {T_out_K: 412.6, method: mass_weighted}
```

模板中的 `method` 字段必须写清平均方式与采样面；两个团队若对同一面分别用 `area_weighted` 与 `mass_weighted`，在强旋流出口可产生 3.8 K 的系统差，这不是数值误差而是口径误差。

参考文献：

1. W3C, *PROV-DM: The PROV Data Model*, W3C Recommendation, 2013.
2. Wilkinson, M. D., et al., "The FAIR Guiding Principles for scientific data management and stewardship", *Scientific Data*, 3:160018, 2016.
3. Oberkampf, W. L., & Roy, C. J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
4. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
5. ISO, *ISO 80000-1: Quantities and units — General*, International Organization for Standardization, 2009.
6. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
