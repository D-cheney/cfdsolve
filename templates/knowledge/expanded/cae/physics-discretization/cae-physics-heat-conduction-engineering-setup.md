---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-heat-conduction-engineering-setup
title: "热传导离散：工程设置与参数选择"
summary: "给出显式与隐式格式的时间步长取值、单元 Peclet 数与网格尺寸的换算、常用材料与接触热阻参数表、辐射线性化系数与非线性迭代设置，并附单因素对照表和可复算的 Python 脚本。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "热传导离散"
  - "工程设置与参数选择"
  - "Fourier 数"
  - "单元 Peclet 数"
seo:
  title: "热传导离散：工程设置与参数选择"
  description: "给出显式与隐式格式的时间步长取值、单元 Peclet 数与网格尺寸的换算、常用材料与接触热阻参数表、辐射线性化系数与非线性迭代设置，并附单因素对照表和可复算的 Python 脚本。"
  keywords:
    - "热传导"
    - "工程设置与参数选择"
    - "Fourier 数"
    - "单元 Peclet 数"
    - "接触热阻"
---

# 热传导离散：工程设置与参数选择

热分析的参数选择受三条相互牵制的约束支配：显式格式的稳定步长由 $\alpha\Delta t/h^2$ 限制，网格尺寸由单元 Peclet 数与界面分辨率限制，而界面与辐射边界又引入额外的非线性迭代。三者必须同时满足，任何一条被忽略都会让结果在数量级上失真。下面给出各参数的取值依据与对照设计。

## 时间步长的三重约束

显式格式的稳定条件与隐式格式的精度要求可以写成同一个 Fourier 数的两种用法：

$$
Fo=\frac{\alpha\Delta t}{h^2}\le\frac{1}{2d}\ \ (\text{显式稳定}),
\qquad
Fo\le\frac{1}{6}\ \ (\text{隐式精度建议}).
$$

$d$ 为空间维数。以铝（$\alpha=9.75\times10^{-5}\,\mathrm{m^2/s}$）为例，$h=1\,\mathrm{mm}$ 时显式步长上限为：一维 $5.13\times10^{-3}\,\mathrm{s}$、二维 $2.56\times10^{-3}\,\mathrm{s}$、三维 $1.71\times10^{-3}\,\mathrm{s}$。隐式（后向 Euler）虽然无条件稳定，但当 $Fo>1/6$ 时时间离散误差按 $O(\Delta t)$ 线性增长，表现为温度峰值被削平；建议取 $\Delta t\le h^2/(6\alpha)$ 并做步长减半对照。Crank–Nicolson 在 $Fo>1$ 时会出现非物理振荡，起始阶段的阶跃热流尤其明显。

## 网格尺寸与单元 Peclet 数

有对流项时，网格尺寸还受单元 Peclet 数约束

$$
Pe_h=\frac{\rho c_p u h}{k}\le2\ \ (\text{中心差分}),
\qquad
Pe_h\le10\ \ (\text{迎风，误差显著增大}).
$$

空气 $u=2\,\mathrm{m/s}$、$h=0.5\,\mathrm{mm}$ 时 $Pe_h=1.2\times1005\times2\times0.0005/0.026=46.4$，要满足中心差分条件需把 $h$ 压到 $21\,\mu\mathrm{m}$，工程上不可行，只能改用二阶迎风并接受等效导热被放大的风险。液体更极端：水在 $u=1\,\mathrm{m/s}$、$h=1\,\mathrm{mm}$ 下 $Pe_h=998\times4180\times1\times0.001/0.6=6.95\times10^{3}$，必须依靠网格无关性检查确认数值扩散没有主导结果。

纯导热问题的网格则按热穿透深度定：铝在 $1\,\mathrm{s}$ 内扩散 $\sqrt{\alpha t}=9.87\,\mathrm{mm}$，铜在 $50\,\mathrm{Hz}$ 交变热流下穿透深度 $\sqrt{2\alpha/\omega}=0.86\,\mathrm{mm}$，因此高频热冲击只需在表层 $1\,\mathrm{mm}$ 内取 $h\le0.2\,\mathrm{mm}$。

## 材料与界面参数表

| 材料 | $k$ / (W/(m·K)) | $\rho$ / (kg/m³) | $c_p$ / (J/(kg·K)) | $\alpha$ / (m²/s) |
|---|---|---|---|---|
| 铜 | 401 | 8933 | 385 | $1.166\times10^{-4}$ |
| 铝 | 237 | 2700 | 900 | $9.75\times10^{-5}$ |
| 硅 | 148 | 2330 | 700 | $9.07\times10^{-5}$ |
| 钢 | 45 | 7850 | 470 | $1.22\times10^{-5}$ |
| 不锈钢 304 | 16.3 | 8000 | 500 | $4.08\times10^{-6}$ |
| FR-4 | 0.30 | 1900 | 1100 | $1.44\times10^{-7}$ |

| 界面形式 | $R_c$ / (m²K/W) |
|---|---|
| 钢—钢干接触，粗糙度 $1.6\,\mu\mathrm{m}$、压力 $1\,\mathrm{MPa}$ | $1\times10^{-4}\sim5\times10^{-4}$ |
| 铝—铝同条件 | $5\times10^{-5}\sim2\times10^{-4}$ |
| 涂导热硅脂 | $1\times10^{-5}\sim5\times10^{-5}$ |
| $1\,\mathrm{mm}$ 导热垫片（$k=3\,\mathrm{W/(m\cdot K)}$） | $3.3\times10^{-4}$ |
| 抛光面加 $10\,\mathrm{MPa}$ 压力 | $1\times10^{-5}$ |

界面温降按 $R_c=\Delta T/q''$ 反算：热流密度 $8\,\mathrm{kW/m^2}$、$R_c=3.0\times10^{-4}\,\mathrm{m^2K/W}$ 时 $\Delta T=2.4\,\mathrm{K}$；同样热流下 $1\,\mathrm{mm}$ 厚铝板自身温降只有 $q''L/k=0.034\,\mathrm{K}$，两者相差约 $70$ 倍，界面热阻绝不能省略。

## 接触热阻与边界设置

接触热阻在有限元中实现为界面上的热流薄层单元或罚函数耦合。设置要点：

- 界面两侧网格可不共节点，但需保证积分点成对，避免热流泄漏；
- $R_c$ 应与压力耦合，压力低于 $0.1\,\mathrm{MPa}$ 时 $R_c$ 可能上升一个数量级；
- 辐射边界用 $h_r=4\epsilon\sigma T_m^3$ 线性化后并入第三类边界：$\epsilon=0.9$、$T_m=350\,\mathrm{K}$ 时 $h_r=8.75\,\mathrm{W/(m^2K)}$，与自然对流的 $h=5\,\mathrm{W/(m^2K)}$ 同量级；
- 辐射与对流同时存在时取 $h_{\mathrm{eff}}=h+h_r$，但两者对温度的非线性程度不同，大温差工况仍需保留 $T^4$ 形式。

## 求解器与非线性迭代

- 线性系统：自由度 $10^{6}$ 以下用稀疏直接法；更大规模用 PCG 配代数多重网格，收敛判据取相对残差 $10^{-8}$。
- 瞬态：后向 Euler 配自适应步长，步长变化率限制在 $1.5$ 倍以内，避免物性插值跳变。
- 非线性（温度相关 $k$、辐射、相变）：Newton 迭代配 $0.7$ 的松弛因子，每步迭代 $4\sim8$ 次；相变用等效热容法时潜热要摊到相变区间 $\Delta T_s=2\,\mathrm{K}$ 上，过窄会造成步长振荡。
- 能量平衡：每次输出后核对 $\int q''_{\mathrm{in}}-\int q''_{\mathrm{out}}-\dot U$，残差应低于总热流的 $0.5\%$。

## 单因素对照与设置错误的判定

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 时间步长 | 网格、物性 | $Fo=1/24,1/6,1/2$ | 峰值温度与解析解偏差、振荡幅值 |
| 网格尺寸 | 时间步长 | $h=2,1,0.5\,\mathrm{mm}$ | 界面温降与收敛阶 |
| 接触热阻 | 热流、网格 | $R_c=0,1\times10^{-4},5\times10^{-4}$ | 界面温降 $q''R_c$ 与实测对比 |
| 辐射系数 | 温度、$\epsilon$ | $h_r$ 计入与不计入 | 表面热流分配比例 |
| 物性模型 | 网格、步长 | 常数 $k$ 与 $k(T)$ | 高温端热流偏差 |

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式推进出现棋盘振荡 | $Fo$ 超过 $1/(2d)$ | 三维 $h=1\,\mathrm{mm}$ 铝的步长上限为 $1.71\times10^{-3}\,\mathrm{s}$，减半重跑 |
| 温度峰值随步长明显变化 | $Fo>1/6$，时间离散误差主导 | 步长减半后峰值变化应小于 $1\%$ |
| 界面温降比 $q''R_c$ 小一个数量级 | 界面共节点，热阻未生效 | 关闭共节点耦合，检查 $R_c$ 是否写入界面单元 |
| 强制对流温度场过于平坦 | 一阶迎风的数值扩散主导 | 把 $h$ 减半，若温度梯度显著变化说明网格不足 |
| 高温工况热流偏高 $20\%$ 以上 | 用常数 $k$ 忽略 $k(T)$ 下降 | 启用 $k(T)$ 并比较两次热流 |
| 相变区间温度出现阶梯状平台 | 等效热容法把潜热集中到单个节点 | 把潜热摊布区间从 $2\,\mathrm{K}$ 放宽到 $5\,\mathrm{K}$ 重算 |

## 可复算的设置脚本

```python
import math
alpha = 9.75e-5          # 铝, m2/s
for h_mm in (2.0, 1.0, 0.5):
    h = h_mm*1e-3
    print(f"h={h_mm}mm  1D dt<={h*h/(2*alpha):.2e}s  "
          f"2D dt<={h*h/(4*alpha):.2e}s  3D dt<={h*h/(6*alpha):.2e}s  "
          f"隐式建议 dt<={h*h/(6*alpha):.2e}s")
# h=2.0mm  1D dt<=2.05e-02s  2D dt<=1.03e-02s  3D dt<=6.84e-03s
# h=1.0mm  1D dt<=5.13e-03s  2D dt<=2.56e-03s  3D dt<=1.71e-03s
# h=0.5mm  1D dt<=1.28e-03s  2D dt<=6.41e-04s  3D dt<=4.27e-04s
```

## 参考文献

1. Incropera, F. P., DeWitt, D. P., Bergman, T. L. & Lavine, A. S. *Fundamentals of Heat and Mass Transfer*. 6th ed., Wiley, 2007.
2. Patankar, S. V. *Numerical Heat Transfer and Fluid Flow*. Hemisphere Publishing, 1980.
3. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
4. Madhusudana, C. V. *Thermal Contact Conductance*. 2nd ed., Springer, 2014.
5. Bergheau, J.-M. & Fortunier, R. *Finite Element Simulation of Heat Transfer*. Wiley, 2008.
6. Carslaw, H. S. & Jaeger, J. C. *Conduction of Heat in Solids*. 2nd ed., Oxford University Press, 1959.