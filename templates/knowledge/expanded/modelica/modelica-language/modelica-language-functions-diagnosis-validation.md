---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-functions-diagnosis-validation
title: "纯函数与算法段：结果诊断与可信度验证"
summary: "给出函数返回值错误、导数不连续与外部库加载失败三类故障的判定方法，用中心差分与 Richardson 外推把 3.0 的解析导数复算出来，并核对不动点迭代的二次收敛。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "纯函数与算法段"
  - "结果诊断与可信度验证"
  - "Richardson 外推"
  - "外部函数"
seo:
  title: "纯函数与算法段：结果诊断与可信度验证"
  description: "给出函数返回值错误、导数不连续与外部库加载失败三类故障的判定方法，用中心差分与 Richardson 外推把 3.0 的解析导数复算出来，并核对不动点迭代的二次收敛。"
  keywords:
    - "纯函数与算法段"
    - "结果诊断与可信度验证"
    - "Richardson 外推"
    - "外部函数"
    - "中心差分"
---

# 纯函数与算法段：结果诊断与可信度验证

函数类故障有两个反直觉的特点：函数体本身跑得通，错误却以求解变慢或步长振荡的形式出现；外部函数加载失败时，报错信息指向链接器而不是模型。可信度验证要把函数的返回值、导数和收敛性分开检查。本文用中心差分与 Richardson 外推核对一个解析导数，再用牛顿型不动点迭代核对收敛阶。

## 函数类故障的可观测信号

先按信号类型分流，不要一上来就怀疑公式：

- 返回值在少数输入点上明显偏离物性表，其余点正常 → 分段分支写错；
- 求解步长被反复砍小、函数求值次数异常高 → 导数走数值差分或 `smoothOrder` 声明过高；
- 报 `Cannot load library` 或 `undefined symbol` → 外部函数库名、`Library` 注解或平台后缀不匹配；
- `while` 循环报迭代上限断言 → 收敛判据或初值选择不当。

前两类靠数值证据区分，第三类靠链接诊断，第四类靠迭代历史。把信号与根因对应起来，才能避免把收敛问题当成公式问题去改。

## 数值差分误差的量级与最优步长

当函数没有 `derivative` 注解时，工具用差分近似导数。中心差分形式为

$$f'(x) \approx D(h) = \frac{f(x+h) - f(x-h)}{2h}, \qquad D(h) = f'(x) + \frac{h^2}{6}f'''(x) + O(h^4)$$

截断误差随 $h^2$ 下降，而舍入误差随 $1/h$ 上升，两者之和在

$$h_{opt} \approx \varepsilon_{mach}^{1/3} \approx (2.2 \times 10^{-16})^{1/3} = 6.0 \times 10^{-6}$$

处取极小。因此数值差分的相对误差量级约 $10^{-11}$，远达不到符号求导的精度。若求解器把 `tolerance` 设到 $10^{-12}$，差分导数会成为精度的天花板，表现为步长不断被拒。这一条就是"补 `derivative` 注解"的定量依据。

## 用 Richardson 外推核对解析导数

取 $f(u) = u^{1.5}$，在 $u = 4.0$ 处解析导数为 $f'(u) = 1.5\sqrt{u} = 1.5 \times 2.0 = 3.0$。

先用 $h = 0.1$ 做中心差分：$f(4.1) = 4.1^{1.5} = 8.3018674$，$f(3.9) = 3.9^{1.5} = 7.7018830$，于是 $D(0.1) = (8.3018674 - 7.7018830)/0.2 = 2.999922$，误差 $-7.8 \times 10^{-5}$。

再把步长加倍到 $h = 0.2$：$f(4.2) = 8.6074390$，$f(3.8) = 7.4075638$，$D(0.2) = (8.6074390 - 7.4075638)/0.4 = 2.999688$，误差 $-3.1 \times 10^{-4}$。误差比约为 $4.0$，正好符合 $O(h^2)$ 的预期。

消去 $h^2$ 项用 Richardson 公式

$$D_{rich} = \frac{4 D(h) - D(2h)}{3} = \frac{4 \times 2.999922 - 2.999688}{3} = \frac{11.999688 - 2.999688}{3} = 3.0$$

外推值回到 $3.0$，与解析解一致到显示的位数。这条流程可以直接用作验收试验：若 Richardson 外推值与解析导数相差超过 $10^{-6}$，函数实现或 `derivative` 注解必有一处错了。

## 外部函数与库加载失败的判定

外部函数用 `annotation(Library = "...")` 绑定动态库，MSL 内部大量使用这一机制：

```modelica
function readTableValue
  input String fileName;
  output Real value;
  external "C" value = table_lookup(fileName)
    annotation(Include = "#include \"table_lookup.h\"",
               Library = "table_lookup",
               LibraryDirectory = "modelica://MyLib/Resources/Library");
end readTableValue;
```

三条注解各有分工：`Include` 指定编译期头文件，`Library` 指定库名（不带平台后缀，工具自动补 `.dll`、`.so` 或 `.dylib`），`LibraryDirectory` 用 `modelica://` URI 定位库文件。加载失败时先核对三点：库名大小写是否与文件名一致、`LibraryDirectory` 指向的目录在安装后是否存在、编译出的库架构是否与工具一致（Windows 上 32 位工具无法加载 64 位 DLL）。这三条能覆盖绝大多数 `undefined symbol` 与 `Cannot load library`。

## 迭代类算法段的收敛验收

`algorithm` 段里的 `while` 循环需要可验证的收敛证据。下面用牛顿迭代求平方根，判据同时检查残差与迭代上限：

```modelica
function fixedPointIteration
  input Real a;
  input Real tol = 1.0e-10;
  input Integer maxIter = 50;
  output Real x;
protected
  Integer k;
algorithm
  x := a;
  k := 0;
  while k < maxIter loop
    x := 0.5 * (x + a / x);
    k := k + 1;
    if abs(x * x - a) < tol then
      break;
    end if;
  end while;
  assert(k < maxIter, "fixedPointIteration did not converge");
end fixedPointIteration;
```

取 $a = 2.0$、初值 $x_0 = 2.0$，迭代序列为 $x_1 = 0.5(2.0 + 1.0) = 1.5$，$x_2 = 0.5(1.5 + 1.333333) = 1.416667$，$x_3 = 0.5(1.416667 + 1.411765) = 1.414216$，$x_4 = 1.414214$。误差序列为 $8.5786 \times 10^{-2}$、$2.4531 \times 10^{-3}$、$2.12 \times 10^{-6}$，每次迭代误差约按平方缩小，四步就达到 $10^{-6}$ 量级，与 $\sqrt{2} = 1.4142136$ 一致。

判据阈值与收敛阶要匹配：若把 `tol` 设到 $10^{-14}$，浮点舍入会让循环在 `maxIter` 前无法满足条件而触发断言，这不是算法错误而是阈值低于可达精度。验收时应记录迭代次数 $k$ 与残差 $|x^2 - a|$，两者共同说明收敛是真实的。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 求解步长在 $10^{-6}$ 处反复被拒 | 导数走数值差分，$h_{opt}$ 附近截断与舍入误差相当 | 补 `derivative` 注解后比较函数求值次数是否下降 |
| Richardson 外推值与解析导数差 $10^{-3}$ | 函数实现里指数写错，如把 $1.5$ 写成 $2.0$ | 在 $u = 4.0$ 处复算：正确值 $3.0$，错误值 $4.0$ |
| 报 `undefined symbol: table_lookup` | `Include` 头文件与库实现符号名不一致 | 用 `nm` 或 `dumpbin /exports` 列出库导出符号 |
| `assert` 报 `did not converge` | `tol` 低于双精度可达精度或初值为零 | 把 `tol` 放宽到 $10^{-10}$ 并检查 $x_0$ 是否为零 |
| 分段函数在交界处出现折角 | `smoothOrder` 声明高于实际光滑阶 | 在交界两侧做二阶差分，检查导数是否跳变 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 12.9 节 External Functions 规定 `Library`、`Include` 与 `LibraryDirectory` 注解。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 12.7 节 Function Derivatives 说明差分回退与 `derivative` 注解的优先级。
3. Press, W. H., Teukolsky, S. A., Vetterling, W. T., Flannery, B. P. *Numerical Recipes*, 3rd ed. Cambridge University Press, 2007 — 第 5.7 节给出中心差分与 Richardson 外推的误差分析。
4. Burden, R. L., Faires, J. D. *Numerical Analysis*, 9th ed. Brooks/Cole, 2011 — 第 2.4 节讨论牛顿迭代的二次收敛。
5. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 7 章讨论外部函数与平台相关链接。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Math.Nonlinear.solveOneNonlinearEquation` 与 `Modelica.Utilities.Streams`, 2020.
