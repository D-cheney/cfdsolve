---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-units-diagnosis-validation
title: "单位、quantity 与 nominal：结果诊断与可信度验证"
summary: "列出单位检查漏过的三类错误、用缩放不变量把条件数从 1e10 降到 1 的定量依据，以及 nominal 的三档取值判据，并用层流管压降 4.08 Pa 与雷诺数 126.8 完成解析对照。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "单位、quantity 与 nominal"
  - "结果诊断与可信度验证"
  - "缩放不变量"
  - "Hagen-Poiseuille"
seo:
  title: "单位、quantity 与 nominal：结果诊断与可信度验证"
  description: "列出单位检查漏过的三类错误、用缩放不变量把条件数从 1e10 降到 1 的定量依据，以及 nominal 的三档取值判据，并用层流管压降 4.08 Pa 与雷诺数 126.8 完成解析对照。"
  keywords:
    - "单位、quantity 与 nominal"
    - "结果诊断与可信度验证"
    - "缩放不变量"
    - "Hagen-Poiseuille"
    - "条件数"
---

# 单位、quantity 与 nominal：结果诊断与可信度验证

单位检查能抓住量纲错误，却抓不住系数错误、偏移错误和尺度失配。这三类问题在结果上都表现为数值偏差或求解困难，必须靠独立证据区分。可信度验证因此要做三件事：确认量纲检查确实生效、量化尺度失配对条件数的影响、用解析解对照量级。本文用层流管压降把这三件事落到具体数字上。

## 单位检查漏过的三类错误

量纲一致是必要条件，不是充分条件。以下三类错误都能通过单位检查：

第一类是系数错误。$v = L/t$ 与 $v = 2L/t$ 量纲完全相同，前者正确后者错误。判定只能靠解析解对照。

第二类是偏移错误。摄氏与开尔文的换算 $T[\mathrm{K}] = T[^\circ\mathrm{C}] + 273.15$ 是仿射关系，漏掉偏移会把 $25\ ^\circ\mathrm{C}$ 当成 $25\ \mathrm{K}$，误差 $273.15\ \mathrm{K}$，相对偏差 $273.15/298.15 = 91.6\%$。这类错误在数值上极端显眼，但在量纲上完全合法。

第三类是尺度失配。量级相差多个数量级的变量放在同一方程组里，量纲正确而数值条件数爆炸。这类错误不改变解，只改变可达到的有效位数，最容易被忽略。

判定顺序建议是：先确认 `unit` 是否真的被声明（没有 `unit` 就没有检查），再用解析解查系数，最后算条件数查尺度。

## 缩放不变量与条件数改善

对线性系统 $\mathbf{A}\mathbf{x} = \mathbf{b}$，定义缩放矩阵 $\mathbf{D} = \mathrm{diag}(d_1, \dots, d_n)$ 与缩放变量 $\tilde{\mathbf{x}} = \mathbf{D}^{-1}\mathbf{x}$，则等价系统为

$$\tilde{\mathbf{A}} = \mathbf{D}^{-1}\mathbf{A}\mathbf{D}, \qquad \tilde{\mathbf{A}}\tilde{\mathbf{x}} = \mathbf{D}^{-1}\mathbf{b}$$

$\mathbf{D}^{-1}\mathbf{A}\mathbf{D}$ 称为相似变换，它保持特征值不变，因此解不变，但条件数可以大幅改变。取

$$\mathbf{A} = \begin{bmatrix} 1.0 \times 10^5 & 0 \\ 0 & 1.0 \times 10^{-5} \end{bmatrix}$$

其特征值为 $10^5$ 与 $10^{-5}$，条件数 $\kappa(\mathbf{A}) = 10^5/10^{-5} = 1.0 \times 10^{10}$。双精度有效位数约 16 位，$10^{10}$ 的条件数会把解的有效位数压缩到 6 位。若取 $\mathbf{D} = \mathrm{diag}(10^5, 10^{-5})$，则 $\tilde{\mathbf{A}}$ 变成单位阵，$\kappa = 1$，有效位数恢复到 16 位。这就是 `nominal` 的数学作用：它告诉工具用什么样的 $\mathbf{D}$ 做缩放。

## nominal 取值的三档判据

`nominal` 不是"随便给个正数"，按下列三档判定：

- 变量有明确物理量级时，取该量级的十进制整数，例如压力取 $1.0 \times 10^5\ \mathrm{Pa}$、温度取 $300.0\ \mathrm{K}$。
- 变量是差值或小信号时，取差值量级而非绝对量级，例如动压取 $1.0 \times 10^2\ \mathrm{Pa}$ 而非 $10^5$。
- 变量在仿真中跨越多个数量级时，取几何平均量级，或改用对数变换后的变量。

绝对容差由 $\varepsilon_{abs} = \varepsilon_{rel} \cdot \text{nominal}$ 给出。取 $\varepsilon_{rel} = 10^{-6}$：压力用 $10^5$ 得 $\varepsilon_{abs} = 0.1\ \mathrm{Pa}$，与压力表分辨率相当；若误用默认 $1.0$，$\varepsilon_{abs} = 10^{-6}\ \mathrm{Pa}$，比物理需要严了 $10^5$ 倍，步长会被无谓砍小。反过来，给动压量共用 $10^5$ 会把 $\varepsilon_{abs}$ 放大到 $0.1\ \mathrm{Pa}$，而 $135.45\ \mathrm{Pa}$ 的动压只剩三位有效数字，压差被噪声淹没。

## 与解析解的定量对照

系数错误只能靠独立解查。层流充分发展管流的 Hagen-Poiseuille 公式给出压降

$$\Delta p = \frac{128 \mu L Q}{\pi d^4}$$

其中 $\mu$ 为动力黏度、$L$ 为管长、$Q$ 为体积流量、$d$ 为内径。该公式的适用前提是层流，因此必须同时算雷诺数：

$$Re = \frac{\rho v d}{\mu} = \frac{4\rho Q}{\pi d \mu}$$

只有 $Re < 2300$ 时上式才成立。两条式子一起用，才能同时验证系数与适用范围。

## 层流管压降的可复算校验

```modelica
model LaminarPipe
  parameter Modelica.Units.SI.Density rho = 998.2 "水 20 摄氏度";
  parameter Modelica.Units.SI.DynamicViscosity mu = 1.002e-3;
  parameter Modelica.Units.SI.Length L = 1.0;
  parameter Modelica.Units.SI.Diameter d = 0.01;
  parameter Modelica.Units.SI.VolumeFlowRate Q = 1.0e-6;
  Modelica.Units.SI.Velocity v(nominal = 1.0e-2);
  Modelica.Units.SI.Pressure dp(nominal = 1.0e1);
  Real Re;
equation
  v = 4.0 * Q / (Modelica.Constants.pi * d * d);
  Re = rho * v * d / mu;
  dp = 128.0 * mu * L * Q / (Modelica.Constants.pi * d ^ 4);
end LaminarPipe;
```

取 $\rho = 998.2\ \mathrm{kg/m^3}$、$\mu = 1.002 \times 10^{-3}\ \mathrm{Pa{\cdot}s}$、$L = 1.0\ \mathrm{m}$、$d = 0.01\ \mathrm{m}$、$Q = 1.0 \times 10^{-6}\ \mathrm{m^3/s}$。

平均流速：$v = 4Q/(\pi d^2) = 4.0 \times 10^{-6}/(3.14159 \times 10^{-4}) = 0.012732\ \mathrm{m/s}$。

雷诺数：$Re = 998.2 \times 0.012732 \times 0.01/1.002 \times 10^{-3} = 126.8$，远小于 2300，层流假设成立。

压降：$128 \mu L Q = 128.0 \times 1.002 \times 10^{-3} \times 1.0 \times 10^{-6} = 1.28256 \times 10^{-7}$；$\pi d^4 = 3.14159 \times 10^{-8}$；$\Delta p = 1.28256 \times 10^{-7}/3.14159 \times 10^{-8} = 4.08\ \mathrm{Pa}$。

这三个数构成完整验收点：$0.012732\ \mathrm{m/s}$、$126.8$、$4.08\ \mathrm{Pa}$。若仿真给出的 $Re$ 落在 $10^4$ 量级，说明流量或内径输错了；若 $Re$ 正确而 $\Delta p$ 差整数倍，说明系数 $128$ 或 $\pi$ 写错；若两者都对但压降有效位只有两三位，说明 `nominal` 尺度失配，需要按上面的三档判据重设。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度结果偏小 $273.15\ \mathrm{K}$ 量级 | 漏掉摄氏到开尔文的偏移 | 检查变量 `unit`，确认是否把 `degC` 当纯单位使用 |
| 量纲检查完全没有报错 | 变量未声明 `unit`，工具无法检查 | 搜索声明，确认关键量是否用了 `Modelica.Units.SI` 别名 |
| 解的有效位数只有 6 位 | 条件数 $10^{10}$，量级差未被缩放 | 算 $\kappa = \lambda_{max}/\lambda_{min}$，给变量补 `nominal` |
| 压降为解析值的 2 倍或 $\pi$ 倍 | 系数错误，量纲检查抓不住 | 用 $\Delta p = 128\mu L Q/(\pi d^4)$ 复算并逐项核对 |
| 层流公式结果与仿真差 30% 以上 | $Re$ 超过 2300，公式不适用 | 先算 $Re = 4\rho Q/(\pi d \mu)$，确认在层流范围 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.9 节 Predefined Types 说明 `unit` 检查的适用条件与 `quantity` 的非检查性质。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.8 节 Attributes 规定 `nominal` 用于缩放与容差计算的语义。
3. White, F. M. *Viscous Fluid Flow*, 3rd ed. McGraw-Hill, 2006 — 第 3 章给出 Hagen-Poiseuille 公式与层流适用范围 $Re < 2300$。
4. Golub, G. H., Van Loan, C. F. *Matrix Computations*, 4th ed. Johns Hopkins University Press, 2013 — 第 2.6 节讨论相似变换与条件数。
5. BIPM. *The International System of Units (SI)*, 9th ed. 2019 — 第 2.3 节给出摄氏温标与开尔文的仿射换算关系。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Constants.pi` 与 `Modelica.Units.SI.DynamicViscosity`, 2020.
