---
template_version: flowlab-knowledge/1.0
slug: modelica-language-units-modeling
title: 单位、quantity 与 nominal：原理与诊断验证
summary: >-
  区分 unit、quantity、displayUnit 与 nominal 四类属性的职责，给出量纲一致性的判定形式与 nominal
  决定绝对容差的定量关系，并用管道动压 135.45 Pa 完成一次可核对设置。
category:
  slug: modelica-language
  name: Modelica 语言基础
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MODELICA
  - Modelica 语言基础
  - 单位、quantity 与 nominal
  - 语言语义与适用边界
  - 量纲一致性
  - nominal 缩放
  - 结果诊断与可信度验证
  - 缩放不变量
  - Hagen-Poiseuille
seo:
  title: 单位、quantity 与 nominal：原理与诊断验证
  description: >-
    区分 unit、quantity、displayUnit 与 nominal 四类属性的职责，给出量纲一致性的判定形式与 nominal
    决定绝对容差的定量关系，并用管道动压 135.45 Pa 完成一次可核对设置。
  keywords:
    - 单位、quantity 与 nominal
    - 语言语义与适用边界
    - 量纲一致性
    - nominal 缩放
    - displayUnit
    - 结果诊断与可信度验证
    - 缩放不变量
    - Hagen-Poiseuille
    - 条件数
---
# 单位、quantity 与 nominal：原理与诊断验证

`unit` 让编译器在翻译期检查量纲，`quantity` 记录物理量的种类名，`displayUnit` 只影响绘图与结果输出的显示，`nominal` 则是给求解器的量级提示。四者名字相近，职责完全不同：前三者影响正确性判定，最后一个影响数值稳定性。单位检查能抓住量纲错误，却抓不住系数错误、偏移错误和尺度失配。这三类问题在结果上都表现为数值偏差或求解困难，必须靠独立证据区分。可信度验证因此要做三件事：确认量纲检查确实生效、量化尺度失配对条件数的影响、用解析解对照量级。

## 基础概念与控制关系

### unit 与 quantity 的分工

`unit` 是可参与量纲运算的单位字符串，必须能分解为 SI 基本单位的幂次积；`quantity` 是自由文本，只用于文档与工具提示，不参与任何检查。`Modelica.Units.SI.Pressure` 的定义就是

```modelica
type Pressure = Real(final quantity = "Pressure",
                     final unit = "Pa",
                     displayUnit = "Pa",
                     min = 0);
```

因为 `unit` 是 `final`，所有基于 `SI.Pressure` 声明的变量都自动获得 `Pa` 量纲，不需要逐个重写。自定义变量时若写成 `Real p(unit = "Pa")`，量纲检查同样生效，但丢失了 `quantity` 带来的可读性，也让工具的候选单位列表无法匹配。工程上优先用 `Modelica.Units.SI` 下的类型别名，只在确实需要非 SI 量时退回 `Modelica.Units.NonSI`。

### 带偏移的显示单位

`displayUnit` 只改变显示，不改变内部存储值。对绝对温度，摄氏与开尔文之间是仿射关系：

$$T[\mathrm{K}] = T[^\circ\mathrm{C}] + 273.15$$

因此把 `displayUnit = "degC"` 加到温度变量上，内部仍以 $\mathrm{K}$ 存储和运算，绘图时按上式换算。仿射单位不能参与乘除运算：$\mathrm{degC}$ 的零点不是绝对零度，两段摄氏温度相乘没有物理意义。若把 `displayUnit = "degC"` 误写成 `unit = "degC"`，量纲检查会失效，因为 `degC` 不是纯幂次单位，工具会报单位无法解析或直接跳过检查。

## 适用边界与方案选择

### nominal 取值的三档判据

`nominal` 不是"随便给个正数"，按下列三档判定：

- 变量有明确物理量级时，取该量级的十进制整数，例如压力取 $1.0 \times 10^5\ \mathrm{Pa}$、温度取 $300.0\ \mathrm{K}$。
- 变量是差值或小信号时，取差值量级而非绝对量级，例如动压取 $1.0 \times 10^2\ \mathrm{Pa}$ 而非 $10^5$。
- 变量在仿真中跨越多个数量级时，取几何平均量级，或改用对数变换后的变量。

绝对容差由 $\varepsilon_{abs} = \varepsilon_{rel} \cdot \text{nominal}$ 给出。取 $\varepsilon_{rel} = 10^{-6}$：压力用 $10^5$ 得 $\varepsilon_{abs} = 0.1\ \mathrm{Pa}$，与压力表分辨率相当；若误用默认 $1.0$，$\varepsilon_{abs} = 10^{-6}\ \mathrm{Pa}$，比物理需要严了 $10^5$ 倍，步长会被无谓砍小。反过来，给动压量共用 $10^5$ 会把 $\varepsilon_{abs}$ 放大到 $0.1\ \mathrm{Pa}$，而 $135.45\ \mathrm{Pa}$ 的动压只剩三位有效数字，压差被噪声淹没。

### 缩放不变量与条件数改善

对线性系统 $\mathbf{A}\mathbf{x} = \mathbf{b}$，定义缩放矩阵 $\mathbf{D} = \mathrm{diag}(d_1, \dots, d_n)$ 与缩放变量 $\tilde{\mathbf{x}} = \mathbf{D}^{-1}\mathbf{x}$，则等价系统为

$$\tilde{\mathbf{A}} = \mathbf{D}^{-1}\mathbf{A}\mathbf{D}, \qquad \tilde{\mathbf{A}}\tilde{\mathbf{x}} = \mathbf{D}^{-1}\mathbf{b}$$

$\mathbf{D}^{-1}\mathbf{A}\mathbf{D}$ 称为相似变换，它保持特征值不变，因此解不变，但条件数可以大幅改变。取

$$\mathbf{A} = \begin{bmatrix} 1.0 \times 10^5 & 0 \\ 0 & 1.0 \times 10^{-5} \end{bmatrix}$$

其特征值为 $10^5$ 与 $10^{-5}$，条件数 $\kappa(\mathbf{A}) = 10^5/10^{-5} = 1.0 \times 10^{10}$。双精度有效位数约 16 位，$10^{10}$ 的条件数会把解的有效位数压缩到 6 位。若取 $\mathbf{D} = \mathrm{diag}(10^5, 10^{-5})$，则 $\tilde{\mathbf{A}}$ 变成单位阵，$\kappa = 1$，有效位数恢复到 16 位。这就是 `nominal` 的数学作用：它告诉工具用什么样的 $\mathbf{D}$ 做缩放。

## 工程设置与实施

### nominal 决定求解器的绝对容差

求解器的收敛判据通常是相对的，绝对容差由相对容差与量级提示共同决定：

$$\varepsilon_{abs} = \varepsilon_{rel} \cdot \text{nominal}$$

对压力，取默认 `nominal = 1.0` 与 $\varepsilon_{rel} = 10^{-6}$ 时，绝对容差为 $10^{-6}\ \mathrm{Pa}$；而大气压量级是 $1.0 \times 10^5\ \mathrm{Pa}$，这个容差比物理上需要的精度严了 $10^5$ 倍，结果是步长被无谓地砍小。写成 `nominal = 1.0e5` 后，绝对容差变为 $10^{-6} \times 10^5 = 0.1\ \mathrm{Pa}$，与压力表分辨率相当。

温度也是典型例子：摄氏温标下数值约 $20$，开尔文下约 $293.15$。若 `nominal` 保持默认 $1.0$，绝对容差按 $10^{-6}$ 计算，而温度的物理有意义精度是 $10^{-3}\ \mathrm{K}$ 量级。给温度加 `nominal = 300.0` 能把容差放到合适量级，同时不损失有效数字。

### 管道流动的可核对设置

```modelica
model DuctFlow
  parameter Modelica.Units.SI.Density rho = 1.204 "空气密度 20 摄氏度";
  parameter Modelica.Units.SI.Velocity v = 15.0 "流速";
  parameter Modelica.Units.SI.Pressure p_ref = 101325.0 "参考压力";
  Modelica.Units.SI.Pressure p_dyn(nominal = 1.0e2);
  Modelica.Units.SI.Pressure p_abs(nominal = 1.0e5);
  Modelica.Units.SI.Temperature T(displayUnit = "degC",
                                  nominal = 300.0,
                                  start = 293.15);
equation
  p_dyn = 0.5 * rho * v * v;
  p_abs = p_ref + p_dyn;
  T = 293.15;
end DuctFlow;
```

动压手算：$\rho = 1.204\ \mathrm{kg/m^3}$、$v = 15.0\ \mathrm{m/s}$，$p_{dyn} = 0.5 \times 1.204 \times 15.0^2 = 0.5 \times 1.204 \times 225.0 = 135.45\ \mathrm{Pa}$。绝压 $p_{abs} = 101325.0 + 135.45 = 101460.45\ \mathrm{Pa}$，相对偏差 $135.45/101325.0 = 1.34 \times 10^{-3}$。

量级提示要按各自量级给：$p_{dyn}$ 约 $10^2$，取 `nominal = 1.0e2`；$p_{abs}$ 约 $10^5$，取 `nominal = 1.0e5`。如果两者共用一个 `nominal = 1.0e5`，$p_{dyn}$ 的相对容差被放大到 $10^{-6} \times 10^5/135.45 = 7.4 \times 10^{-4}$，动压的有效位数只剩三位，压差类量会被数值噪声淹没。这条计算说明 nominal 不是越大越安全，而要贴着变量自身的量级。

作为交叉校验，可用声速确认温度设置：$a = \sqrt{\gamma R T} = \sqrt{1.4 \times 287.05 \times 293.15} = 343.23\ \mathrm{m/s}$，马赫数 $Ma = 15.0/343.23 = 0.0437$，属于不可压范围，因此上面用常数密度是自洽的。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `The units of equations are inconsistent` | 方程两侧量纲指数向量不等 | 逐个变量打印 `unit` 字符串，核对加法两侧 |
| 单位检查通过但系数差一倍 | 量纲合法而系数错误 | 用解析解或手算值对照，如动压 $135.45\ \mathrm{Pa}$ |
| 步长极小、求解缓慢 | 关键变量缺 `nominal`，绝对容差过严 | 加 `nominal = 1.0e5` 后比较步长与耗时 |
| 压差结果有效位不足 | 共用了偏大的 `nominal` | 给压差量单独设 `nominal = 1.0e2` 后重跑 |
| 绘图显示温度出现 $20$ 而非 $293.15$ | 把 `displayUnit = "degC"` 误写成 `unit = "degC"` | 检查声明，`unit` 必须是纯幂次单位 |
| 温度结果偏小 $273.15\ \mathrm{K}$ 量级 | 漏掉摄氏到开尔文的偏移 | 检查变量 `unit`，确认是否把 `degC` 当纯单位使用 |
| 量纲检查完全没有报错 | 变量未声明 `unit`，工具无法检查 | 搜索声明，确认关键量是否用了 `Modelica.Units.SI` 别名 |
| 解的有效位数只有 6 位 | 条件数 $10^{10}$，量级差未被缩放 | 算 $\kappa = \lambda_{max}/\lambda_{min}$，给变量补 `nominal` |
| 压降为解析值的 2 倍或 $\pi$ 倍 | 系数错误，量纲检查抓不住 | 用 $\Delta p = 128\mu L Q/(\pi d^4)$ 复算并逐项核对 |
| 层流公式结果与仿真差 30% 以上 | $Re$ 超过 2300，公式不适用 | 先算 $Re = 4\rho Q/(\pi d \mu)$，确认在层流范围 |

### 单位检查漏过的三类错误

量纲一致是必要条件，不是充分条件。以下三类错误都能通过单位检查：

第一类是系数错误。$v = L/t$ 与 $v = 2L/t$ 量纲完全相同，前者正确后者错误。判定只能靠解析解对照。

第二类是偏移错误。摄氏与开尔文的换算 $T[\mathrm{K}] = T[^\circ\mathrm{C}] + 273.15$ 是仿射关系，漏掉偏移会把 $25\ ^\circ\mathrm{C}$ 当成 $25\ \mathrm{K}$，误差 $273.15\ \mathrm{K}$，相对偏差 $273.15/298.15 = 91.6\%$。这类错误在数值上极端显眼，但在量纲上完全合法。

第三类是尺度失配。量级相差多个数量级的变量放在同一方程组里，量纲正确而数值条件数爆炸。这类错误不改变解，只改变可达到的有效位数，最容易被忽略。

判定顺序建议是：先确认 `unit` 是否真的被声明（没有 `unit` 就没有检查），再用解析解查系数，最后算条件数查尺度。

## 验证、验收与复现

### 与解析解的定量对照

系数错误只能靠独立解查。层流充分发展管流的 Hagen-Poiseuille 公式给出压降

$$\Delta p = \frac{128 \mu L Q}{\pi d^4}$$

其中 $\mu$ 为动力黏度、$L$ 为管长、$Q$ 为体积流量、$d$ 为内径。该公式的适用前提是层流，因此必须同时算雷诺数：

$$Re = \frac{\rho v d}{\mu} = \frac{4\rho Q}{\pi d \mu}$$

只有 $Re < 2300$ 时上式才成立。两条式子一起用，才能同时验证系数与适用范围。

### 量纲一致性的判定形式

一条方程合法的必要条件是两侧量纲相等。把每个基本单位看作独立的基向量，量纲表示为指数向量：

$$[q] = \prod_{i=1}^{7} [u_i]^{e_i}, \qquad [u_i] \in \{\mathrm{m}, \mathrm{kg}, \mathrm{s}, \mathrm{A}, \mathrm{K}, \mathrm{mol}, \mathrm{cd}\}$$

加法与减法要求两侧指数向量完全相同；乘法要求指数相加，除法相减。因此 `v = L + t` 会得到 $[v] = \mathrm{m/s}$ 与 $[\mathrm{m} + \mathrm{s}]$ 不一致的结论，工具报

```text
Error: The units of equations are inconsistent.
       The following units are not consistent: "m" and "s".
```

这类错误在翻译期就被抓住，是 Modelica 相对于纯数值工具最实用的特性之一。需要注意的是，量纲检查只保证单位正确，不保证系数正确：把 $v = L/t$ 写成 $v = 2 L/t$ 量纲完全合法，只能靠数值对照发现。

### 层流管压降的可复算校验

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

## 参考资料

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.9 节 Predefined Types 给出 `unit`、`quantity`、`displayUnit` 与 `min` 的语义。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.8 节 Attributes 说明 `nominal` 作为求解器量级提示的用途。
3. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Units.SI` 与 `Modelica.Units.NonSI` 包定义, 2020.
4. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论单位检查与量纲分析。
5. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 3 章给出单位声明与 `displayUnit` 的用法。
6. BIPM. *The International System of Units (SI)*, 9th ed. 2019 — 第 2 章列出七个基本单位与导出单位的量纲指数。
7. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.9 节 Predefined Types 说明 `unit` 检查的适用条件与 `quantity` 的非检查性质。
8. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.8 节 Attributes 规定 `nominal` 用于缩放与容差计算的语义。
9. White, F. M. *Viscous Fluid Flow*, 3rd ed. McGraw-Hill, 2006 — 第 3 章给出 Hagen-Poiseuille 公式与层流适用范围 $Re < 2300$。
10. Golub, G. H., Van Loan, C. F. *Matrix Computations*, 4th ed. Johns Hopkins University Press, 2013 — 第 2.6 节讨论相似变换与条件数。
11. BIPM. *The International System of Units (SI)*, 9th ed. 2019 — 第 2.3 节给出摄氏温标与开尔文的仿射换算关系。
12. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Constants.pi` 与 `Modelica.Units.SI.DynamicViscosity`, 2020.
