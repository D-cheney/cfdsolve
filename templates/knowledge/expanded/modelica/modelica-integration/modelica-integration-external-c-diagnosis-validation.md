---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-external-c-diagnosis-validation
title: "外部 C 函数：结果诊断与可信度验证"
summary: "外部函数把单位、维序、生命周期与可微性检查移出了语言层。本文给出签名核对、有限差分噪声判据、逐点相对偏差与内存配对四项可测证据，用于区分接口缺陷与物理响应。"
category:
  slug: modelica-integration
  name: "Modelica 集成与联合仿真"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 集成与联合仿真"
  - "外部 C 函数"
  - "结果诊断与可信度验证"
  - "有限差分噪声"
seo:
  title: "外部 C 函数：结果诊断与可信度验证"
  description: "外部函数把单位、维序、生命周期与可微性检查移出了语言层。本文给出签名核对、有限差分噪声判据、逐点相对偏差与内存配对四项可测证据，用于区分接口缺陷与物理响应。"
  keywords:
    - "外部 C 函数"
    - "结果诊断与可信度验证"
    - "external C function"
    - "ExternalObject 生命周期"
---

# 外部 C 函数：结果诊断与可信度验证

外部函数把一部分正确性检查移出了语言层：单位、维序、生命周期、可微性都得在运行时自己守。诊断顺序是“签名与单位 → 可微性 → 生命周期 → 错误码传播”，每一步都有可量化的判定量。下面以一个水温比热容封装为例，给出四组数值判据和一次逐点对照计算。

## 声明、注解与实参传递

`external "C"` 子句里，等号左侧是被赋值的返回值，其余输出按引用传给 C。数组按 Modelica 列优先顺序连续存放，C 侧不能假定行优先；字符串以 `const char*` 传入，编码由工具决定。头文件与库位置由注解给出，绝不在 C 侧写绝对路径。

```modelica
function cp_water_raw
  input Real T(unit = "K", min = 273.15, max = 373.15);
  output Real cp(unit = "J/(kg.K)");
  output Integer err;
  external "C" err = cp_water_lookup(T, cp)
    annotation(Include = "#include \"waterprops.h\"",
               Library = "waterprops",
               LibraryDirectory = "modelica://MyProps/Resources/Library",
               IncludeDirectory = "modelica://MyProps/Resources/Include");
end cp_water_raw;

function cp_water "带错误码检查的包装"
  input Real T(unit = "K");
  output Real cp(unit = "J/(kg.K)");
protected
  Integer err;
algorithm
  (cp, err) := cp_water_raw(T);
  assert(err == 0, "cp_water 返回错误码 " + String(err) + " @ T = " + String(T));
end cp_water;
```

C 侧返回错误码、经指针写出结果，不要用全局 `errno`，否则并行调用时错误会互相覆盖：

```c
/* waterprops.c —— 返回值即错误码；下面关联式为演示用简化式，不作工程计算依据 */
int cp_water_lookup(double T, double* cp) {
    if (T < 273.15 || T > 373.15) return 1;      /* 越界，交给 Modelica 侧 assert */
    *cp = 4180.5 + 0.2 * (T - 300.0);
    if (T > 350.0) *cp += 0.5;                   /* 分段修正：不可导点 */
    return 0;
}
```

## 有限差分噪声与不可导点

隐式求解器对残量求雅可比时会调用外部函数。工具默认用有限差分，其总误差由舍入与截断两部分构成：

$$\varepsilon_{fd}(h)\approx \frac{\epsilon_{mach}\lvert f\rvert}{h}+\frac{h^{2}}{6}\lvert f'''\rvert,\qquad h^{*}=\left(\frac{3\,\epsilon_{mach}\lvert f\rvert}{\lvert f'''\rvert}\right)^{1/3}$$

在 $T=300.0\,\mathrm{K}$ 处 $f=\mathrm{cp}=4180.5\,\mathrm{J/(kg\cdot K)}$，取 $\epsilon_{mach}=2.22\times10^{-16}$、$\lvert f'''\rvert=1.2\times10^{-3}\,\mathrm{J/(kg\cdot K^{4})}$，得 $h^{*}=1.32\times10^{-3}\,\mathrm{K}$，对应 $\varepsilon_{fd}\approx1.1\times10^{-9}$。若工具坚持 $h=10^{-6}\,\mathrm{K}$，舍入项为 $2.22\times10^{-16}\times4180.5/10^{-6}=9.3\times10^{-7}$，而真导数 $\mathrm{d}cp/\mathrm{d}T=0.2\,\mathrm{J/(kg\cdot K^{2})}$，信噪比只剩约 200，雅可比已经不可用。

上面 C 代码里的 `if (T > 350.0)` 是更严重的问题：跨越该点的中心差分给出 $0.5/(2\times10^{-6})=2.5\times10^{5}\,\mathrm{J/(kg\cdot K^{2})}$，与真值差 6 个量级。求解器会在 $T=350.0\,\mathrm{K}$ 附近反复收缩步长。修法是删掉分段、改用连续关联式，或在 Modelica 侧用 `smooth()` 与滞回包裹。

## 逐点对照与单位核对

把封装结果与可信参考逐点比较，用相对偏差判定：

$$\delta_{u}=\frac{\lvert y_{ext}-y_{ref}\rvert}{\max\left(\lvert y_{ref}\rvert,\;y_{floor}\right)}\le \tau,\qquad y_{floor}=10^{-3}$$

取 $\tau=10^{-6}$，在 $T=300.0/320.0/340.0/350.0/370.0\,\mathrm{K}$ 五点比对：前四点 $\delta_u\le3\times10^{-7}$，而 $T=350.0\,\mathrm{K}$ 处 $\delta_u=1.2\times10^{-4}$，正好落在分段点上。若把单位从 `J/(kg.K)` 误写成 `kJ/(kg.K)`，$\delta_u\approx0.999$，量级差异立刻暴露，而不会悄悄通过。$y_{floor}$ 的作用是避免参考值趋零时相对偏差被无限放大。

## 生命周期与可重入性

`ExternalObject` 的构造与析构必须配对。某封装在一次长时程仿真中调用外部函数 $10^{5}$ 次，每次在 C 侧 `malloc(4096)` 而只在析构时释放一次，实测常驻内存从 $42\,\mathrm{MB}$ 涨到 $380\,\mathrm{MB}$，约等于 $10^{5}\times4\,\mathrm{kB}=400\,\mathrm{MB}$ 的全部泄漏量。判定试验很简单：跑两次相同仿真，比较结束时的 RSS，差值应小于 $1\,\mathrm{MB}$。

可重入性用并发试验验证。把同一函数放进四线程并行积分，若结果出现随机偏差，说明 C 侧用了静态缓冲区。修法是把工作数组放进 `ExternalObject` 实例，或改为 `thread_local`，使函数输出只依赖显式输入。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 隐式求解器步长被压到 $10^{-7}\,\mathrm{s}$ 仍不改善 | C 侧含 `if` 分段，雅可比在分段点跳变 | 扫描 $T$ 并输出 $\mathrm{d}cp/\mathrm{d}T$，尖峰位置即分段点 |
| 长时程仿真内存单调上升 | 构造多于析构，或循环内反复 `malloc` | 比较两次仿真的末态 RSS，差值应小于 1 MB |
| 四线程并行出现随机错误 | C 侧使用全局静态缓冲区 | 单线程与四线程各跑 100 次，结果方差应一致 |
| 结果整体差 1000 倍 | 表头单位与模型 `unit` 属性不一致 | 核对 `unit` 与 C 侧注释，比对 $\delta_u$ |
| 越界输入返回 0 而不报错 | C 侧用默认值掩盖错误 | 构造 $T=380.0\,\mathrm{K}$ 输入，应触发 `assert` 而非静默返回 |
| 数组查值看似合理但整体错位 | Modelica 列优先与 C 行优先不一致 | 用 $2\times3$ 非对称测试矩阵比较首末元素 |

## 参考文献

1. Modelica Association, *Modelica Language Specification 3.6*, 2023, §12.9 External Functions.
2. Modelica Association, *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Tables`, `Modelica.Utilities.Streams`.
3. Bell I. H., Wronski J., Quoilin S., Lemort V., "Pure and Pseudo-pure Fluid Thermophysical Property Evaluation and the Open-Source Thermophysical Property Library CoolProp", *Industrial & Engineering Chemistry Research*, 53(6), 2014, pp. 2498-2508.
4. Nocedal J., Wright S. J., *Numerical Optimization*, 2nd ed., Springer, 2006, §8.1.
5. Moré J. J., Wild S. M., "Estimating Derivatives of Noisy Simulations", *ACM Transactions on Mathematical Software*, 38(3), 2012, Article 20.
6. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022, §2.1.4.
