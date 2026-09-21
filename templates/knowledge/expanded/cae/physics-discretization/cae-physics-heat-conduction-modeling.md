---
template_version: flowlab-knowledge/1.0
slug: cae-physics-heat-conduction-modeling
title: 热传导离散：原理、设置与验证
summary: >-
  从能量守恒方程出发给出显式格式的 Fourier
  数稳定界、接触热阻的界面处理、辐射边界的线性化系数与热扩散长度判据，并说明温度相关物性和各向异性何时必须保留。
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
  - 热传导离散
  - 离散原理与适用范围
  - Fourier 数
  - 接触热阻
  - 工程设置与参数选择
  - 单元 Peclet 数
  - 结果诊断与可信度验证
  - 误差函数解
  - 热阻网络
seo:
  title: 热传导离散：原理、设置与验证
  description: >-
    从能量守恒方程出发给出显式格式的 Fourier
    数稳定界、接触热阻的界面处理、辐射边界的线性化系数与热扩散长度判据，并说明温度相关物性和各向异性何时必须保留。
  keywords:
    - 热传导
    - 离散原理与适用范围
    - Fourier 数
    - 接触热阻
    - 辐射边界
    - 工程设置与参数选择
    - 单元 Peclet 数
    - 结果诊断与可信度验证
    - 误差函数解
    - 热阻网络
    - 能量平衡
---
# 热传导离散：原理、设置与验证

热传导问题的离散误差有三个来源：时间推进的稳定与精度、界面处热阻的建模、以及边界上辐射与对流的相对权重。它们各自的量纲判据是 Fourier 数、Biot 数与辐射线性化系数，只要这三个数落在各自区间内，线性常物性模型就够用；越界则必须升级到非线性或共轭传热模型。下面给出各判据的推导与量级估算。热分析的参数选择受三条相互牵制的约束支配：显式格式的稳定步长由 $\alpha\Delta t/h^2$ 限制，网格尺寸由单元 Peclet 数与界面分辨率限制，而界面与辐射边界又引入额外的非线性迭代。三者必须同时满足，任何一条被忽略都会让结果在数量级上失真。下面给出各参数的取值依据与对照设计。热分析结果最危险的失效方式不是发散，而是温降被系统性地抹平：界面热阻未生效、辐射未计入、或者数值扩散把梯度磨平，都能给出光滑且看似合理的温度云图。可用的独立证据有三类：半无限体的误差函数解、集总热容的指数衰减、以及稳态热阻网络的解析分配。下面给出各基准的表达式、可核对的手算过程与判定阈值。

## 基础概念与控制关系

### 能量方程与三类边界

各向同性、无内热源的瞬态导热由

$$
\rho c_p\frac{\partial T}{\partial t}=\nabla\cdot\big(k\nabla T\big)+q
$$

描述，其中 $\alpha=k/(\rho c_p)$ 是热扩散率，单位 $\mathrm{m^2/s}$。三类边界分别为：第一类给定温度；第二类给定热流 $q''=-k\partial T/\partial n$；第三类对流 $\ -k\partial T/\partial n=h(T_\infty-T)$。辐射边界是非线性的第四类

$$
q''_{\mathrm{rad}}=\epsilon\sigma\big(T_s^4-T_\infty^4\big),
\qquad
\sigma=5.67\times10^{-8}\,\mathrm{W/(m^2K^4)}.
$$

取 $\epsilon=0.9$、$T_s=400\,\mathrm{K}$、$T_\infty=300\,\mathrm{K}$，得 $q''_{\mathrm{rad}}=0.9\times5.67\times10^{-8}\times(2.56\times10^{10}-8.1\times10^{9})=893\,\mathrm{W/m^2}$。把它线性化为等效换热系数 $h_r=4\epsilon\sigma T_m^3$，取平均温度 $T_m=350\,\mathrm{K}$ 得 $h_r=8.75\,\mathrm{W/(m^2K)}$；与自然对流的 $h=5\,\mathrm{W/(m^2K)}$ 同量级，因此室温附近的散热问题不能只算对流。

### 显式格式的 Fourier 数稳定界

显式时间推进的稳定条件为

$$
\mathrm{Fo}=\frac{\alpha\,\Delta t}{h^{2}}\le\frac{1}{2d},
$$

$d$ 为空间维数：一维 $1/2$、二维 $1/4$、三维 $1/6$。这条约束的来源是离散拉普拉斯算子的谱半径，与物性和网格同时挂钩。几种材料在 $h=1\,\mathrm{mm}$ 下的三维步长上限：

以铝为例，$Fo=1/6$ 要求 $\Delta t\le h^2/(6\alpha)=10^{-6}/(6\times9.75\times10^{-5})=1.71\times10^{-3}\,\mathrm{s}$；网格加密到 $h=0.5\,\mathrm{mm}$ 时步长降到 $4.27\times10^{-4}\,\mathrm{s}$，即时间步按 $h^2$ 缩小。铜的 $\alpha$ 比不锈钢 304 高约 $29$ 倍，同样网格下稳定步长却小 $29$ 倍，这是金属瞬态问题必须用隐式格式的根本原因。

| 材料 | $\alpha$ / (m²·s⁻¹) | $\Delta t_{\max}$ / s | $k$ / (W·m⁻¹·K⁻¹) | $\rho$ / (kg·m⁻³) | $c_p$ / (J·kg⁻¹·K⁻¹) |
|---|---|---|---|---|---|
| 铜 | $1.166\times10^{-4}$ | $1.43\times10^{-3}$ | 401 | 8933 | 385 |
| 铝 | $9.75\times10^{-5}$ | $1.71\times10^{-3}$ | 237 | 2700 | 900 |
| 钢 | $1.22\times10^{-5}$ | $1.37\times10^{-2}$ | 45 | 7850 | 470 |
| 不锈钢 304 | $4.08\times10^{-6}$ | $4.09\times10^{-2}$ | 16.3 | 8000 | 500 |

### 接触界面与接触热阻

两个固体在名义接触面上只有微观凸起导通，宏观上表现为温度跳变

$$
q''=\frac{\Delta T}{R_c},
$$

$R_c$ 为接触热阻，单位 $\mathrm{m^2K/W}$。典型取值：机加工钢—钢干接触（表面粗糙度 $1.6\,\mu\mathrm{m}$、接触压力 $1\,\mathrm{MPa}$）为 $1\times10^{-4}\sim5\times10^{-4}$；铝—铝同条件为 $5\times10^{-5}\sim2\times10^{-4}$；涂导热硅脂后降到 $1\times10^{-5}\sim5\times10^{-5}$；夹一层 $1\,\mathrm{mm}$ 厚、$k=3\,\mathrm{W/(m\cdot K)}$ 的导热垫片则等于 $3.3\times10^{-4}$。取 $q''=10\,\mathrm{kW/m^2}$、$R_c=2.5\times10^{-4}$，界面温降为 $2.5\,\mathrm{K}$，与 $1\,\mathrm{mm}$ 厚铝板自身的温降（$q''L/k=10000\times0.001/237=0.042\,\mathrm{K}$）相比高出近两个数量级。忽略 $R_c$ 会让界面温降被完全抹掉。

## 适用边界与方案选择

### 何时必须保留温度相关物性与各向异性

判据是物性在温度区间内的相对变化。钢的 $k$ 从 $20\,^\circ\mathrm{C}$ 的 $51\,\mathrm{W/(m\cdot K)}$ 降到 $500\,^\circ\mathrm{C}$ 的 $38\,\mathrm{W/(m\cdot K)}$，变化约 $-25\%$；若工作区间跨越这一范围，用常数 $k$ 会把高温端的热流算高约 $25\%$，必须迭代更新物性。各向异性材料（层压板、纤维增强复合材料、硅钢片叠层）的面内与面外导热系数可相差 $10$ 倍以上，此时方程改为 $\rho c_p\partial_t T=\nabla\cdot(\mathbf{k}\nabla T)$，$\mathbf{k}$ 为张量，网格方向应尽量对齐材料主轴。热扩散长度的量级估算给出另一条边界：$\delta\sim\sqrt{\alpha t}$，铝在 $1\,\mathrm{s}$ 内扩散 $9.87\,\mathrm{mm}$，铜在 $1\,\mathrm{Hz}$ 交变热流下的穿透深度 $\delta=\sqrt{2\alpha/\omega}=6.09\,\mathrm{mm}$，$50\,\mathrm{Hz}$ 时降到 $0.86\,\mathrm{mm}$——高频热冲击只需要在表层 $1\,\mathrm{mm}$ 内加密。

## 工程设置与实施

### 网格尺寸与单元 Peclet 数

有对流项时，网格尺寸还受单元 Peclet 数约束

$$
Pe_h=\frac{\rho c_p u h}{k}\le2\ \ (\text{中心差分}),
\qquad
Pe_h\le10\ \ (\text{迎风，误差显著增大}).
$$

空气 $u=2\,\mathrm{m/s}$、$h=0.5\,\mathrm{mm}$ 时 $Pe_h=1.2\times1005\times2\times0.0005/0.026=46.4$，要满足中心差分条件需把 $h$ 压到 $21\,\mu\mathrm{m}$，工程上不可行，只能改用二阶迎风并接受等效导热被放大的风险。液体更极端：水在 $u=1\,\mathrm{m/s}$、$h=1\,\mathrm{mm}$ 下 $Pe_h=998\times4180\times1\times0.001/0.6=6.95\times10^{3}$，必须依靠网格无关性检查确认数值扩散没有主导结果。

纯导热问题的网格则按热穿透深度定：铝在 $1\,\mathrm{s}$ 内扩散 $\sqrt{\alpha t}=9.87\,\mathrm{mm}$，铜在 $50\,\mathrm{Hz}$ 交变热流下穿透深度 $\sqrt{2\alpha/\omega}=0.86\,\mathrm{mm}$，因此高频热冲击只需在表层 $1\,\mathrm{mm}$ 内取 $h\le0.2\,\mathrm{mm}$。

### 接触热阻与边界设置

接触热阻在有限元中实现为界面上的热流薄层单元或罚函数耦合。设置要点：

- 界面两侧网格可不共节点，但需保证积分点成对，避免热流泄漏；
- $R_c$ 应与压力耦合，压力低于 $0.1\,\mathrm{MPa}$ 时 $R_c$ 可能上升一个数量级；
- 辐射边界用 $h_r=4\epsilon\sigma T_m^3$ 线性化后并入第三类边界：$\epsilon=0.9$、$T_m=350\,\mathrm{K}$ 时 $h_r=8.75\,\mathrm{W/(m^2K)}$，与自然对流的 $h=5\,\mathrm{W/(m^2K)}$ 同量级；
- 辐射与对流同时存在时取 $h_{\mathrm{eff}}=h+h_r$，但两者对温度的非线性程度不同，大温差工况仍需保留 $T^4$ 形式。

### 材料与界面参数表

界面温降按 $R_c=\Delta T/q''$ 反算：热流密度 $8\,\mathrm{kW/m^2}$、$R_c=3.0\times10^{-4}\,\mathrm{m^2K/W}$ 时 $\Delta T=2.4\,\mathrm{K}$；同样热流下 $1\,\mathrm{mm}$ 厚铝板自身温降只有 $q''L/k=0.034\,\mathrm{K}$，两者相差约 $70$ 倍，界面热阻绝不能省略。

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

### 求解器与非线性迭代

- 线性系统：自由度 $10^{6}$ 以下用稀疏直接法；更大规模用 PCG 配代数多重网格，收敛判据取相对残差 $10^{-8}$。
- 瞬态：后向 Euler 配自适应步长，步长变化率限制在 $1.5$ 倍以内，避免物性插值跳变。
- 非线性（温度相关 $k$、辐射、相变）：Newton 迭代配 $0.7$ 的松弛因子，每步迭代 $4\sim8$ 次；相变用等效热容法时潜热要摊到相变区间 $\Delta T_s=2\,\mathrm{K}$ 上，过窄会造成步长振荡。
- 能量平衡：每次输出后核对 $\int q''_{\mathrm{in}}-\int q''_{\mathrm{out}}-\dot U$，残差应低于总热流的 $0.5\%$。

### 可复算的量级脚本

```python
import math
mat = {"铜":(401,8933,385), "铝":(237,2700,900),
       "钢":(45,7850,470), "不锈钢304":(16.3,8000,500)}
h, dim = 1e-3, 3
for name,(k,rho,cp) in mat.items():
    alpha = k/(rho*cp)
    dt = h*h/(2*dim*alpha)
    print(f"{name:8s} alpha={alpha:.3e} m2/s  dt_max={dt:.3e} s")
# 铜       alpha=1.166e-04 m2/s  dt_max=1.429e-03 s
# 铝       alpha=9.750e-05 m2/s  dt_max=1.709e-03 s
# 钢       alpha=1.220e-05 m2/s  dt_max=1.366e-02 s
# 不锈钢304 alpha=4.075e-06 m2/s  dt_max=4.090e-02 s
```

### 可复算的设置脚本

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

### 时间步长的三重约束

显式格式的稳定条件与隐式格式的精度要求可以写成同一个 Fourier 数的两种用法：

$$
Fo=\frac{\alpha\Delta t}{h^2}\le\frac{1}{2d}\ \ (\text{显式稳定}),
\qquad
Fo\le\frac{1}{6}\ \ (\text{隐式精度建议}).
$$

$d$ 为空间维数。以铝（$\alpha=9.75\times10^{-5}\,\mathrm{m^2/s}$）为例，$h=1\,\mathrm{mm}$ 时显式步长上限为：一维 $5.13\times10^{-3}\,\mathrm{s}$、二维 $2.56\times10^{-3}\,\mathrm{s}$、三维 $1.71\times10^{-3}\,\mathrm{s}$。隐式（后向 Euler）虽然无条件稳定，但当 $Fo>1/6$ 时时间离散误差按 $O(\Delta t)$ 线性增长，表现为温度峰值被削平；建议取 $\Delta t\le h^2/(6\alpha)$ 并做步长减半对照。Crank–Nicolson 在 $Fo>1$ 时会出现非物理振荡，起始阶段的阶跃热流尤其明显。

### 单因素对照与设置错误的判定

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

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式推进若干步后温度场出现棋盘振荡 | $Fo$ 超过 $1/(2d)$ | 把 $\Delta t$ 减半重跑，若振荡消失即为稳定性越界 |
| 界面两侧温度连续、无跳变 | 接触热阻未施加，两侧网格共节点 | 用 $q''R_c$ 估算应有温降并与结果对比 |
| 高温端热流比手册值高 $20\%$ 以上 | 用常数 $k$ 忽略了 $k(T)$ 的下降 | 改用温度相关物性并比较两次结果 |
| 薄板厚度方向温降明显偏小 | 各向异性 $\mathbf{k}$ 被当成标量 | 用面外 $k$ 单独校核 $\Delta T=q''L/k_z$ |
| 室温自然对流散热偏低一半 | 辐射未计入或未线性化 | 计算 $h_r=4\epsilon\sigma T_m^3$ 并与 $h$ 比较 |
| 周期性加热的表层温度相位滞后 | 网格未解析热穿透深度 $\sqrt{2\alpha/\omega}$ | 按 $50\,\mathrm{Hz}$ 下 $0.86\,\mathrm{mm}$ 重新定网格 |
| 瞬态结束温度与稳态解不符 | 时间推进未走到稳态或内能未闭合 | 把计算时间延长到 $10\tau$ 后比较终态 |
| 半无限体剖面在 $x=34.93\,\mathrm{mm}$ 处偏高超过 $2\%$ | 表面单元过厚，梯度被平均 | 把首层单元厚度减半，观察该点温度是否向 $106.3\,^\circ\mathrm{C}$ 收敛 |
| 表面热流比 $131\,\mathrm{kW/m^2}$ 低 $10\%$ 以上 | 用了平均温度代替表面温度算梯度 | 输出面心温度并重算 $q''=-k\nabla T\cdot n$ |
| 集总体衰减比 $e^{-t/61.5}$ 快得多 | $h$ 的单位或体积表面积特征长度混用 | 用解析 $\tau=61.5\,\mathrm{s}$ 核对，检查 $h$ 是否为 $\mathrm{W/(m^2K)}$ |
| 结温升高远低于 $35.8\,\mathrm{K}$ | 界面共节点，$R_c$ 未进入热流路径 | 反演 $R_c$，$250\,\mathrm{kW/m^2}$ 下应得到 $2.0\times10^{-5}$ |
| 能量闭合误差超过 $0.5\%$ | 相变潜热或辐射项未计入内能变化 | 把 $h_r=4\epsilon\sigma T_m^3$ 并入边界后复测 |
| 收敛阶只有 $1.0$ | 表面热流施加在节点或界面插值不匹配 | 改用一致面载荷并检查界面网格匹配度 |

## 验证、验收与复现

### 四类解析基准与验收量

瞬态半无限体基准检验时间推进与物性，验收量是温度剖面与表面热流；集总热容基准检验对流边界与时间常数；稳态热阻网络基准检验界面与串联热阻的实现；一维导热板基准检验空间收敛阶。四者覆盖不同的失效路径，任何一类缺失都可能让系统性错误通过验收。

### 能量平衡与收敛阶

每次瞬态输出后核对

$$
\int_S q''_{\mathrm{in}}\,dS-\int_S q''_{\mathrm{out}}\,dS-\frac{dU}{dt}=0,
\qquad
U=\int_V \rho c_p T\,dV .
$$

输入 $100\,\mathrm{W}$、输出 $99.8\,\mathrm{W}$、内能变化率 $0.2\,\mathrm{W}$ 时闭合误差为 $0.2\%$，低于 $0.5\%$ 的验收阈值。一维导热板的网格收敛数据如下：

误差比稳定在 $4$，观测阶 $p=\ln 4/\ln 2=2.00$，与线性单元在 $L^2$ 范数下的理论阶一致。Richardson 外推给出 $T_{\mathrm{ex}}=100.020+(100.020-100.080)/3=100.0000\,^\circ\mathrm{C}$，与解析值完全一致到四位小数。若观测阶只有 $1.0$ 左右，通常是表面热流边界被施加在节点而非面上，或界面处网格不匹配导致一阶插值。

| $h$ / mm | $T_{\max}$ / $^\circ\mathrm{C}$ | 误差 / K | 误差比 |
|---|---|---|---|
| 4.0 | 100.320 | 0.320 | — |
| 2.0 | 100.080 | 0.080 | 4.00 |
| 1.0 | 100.020 | 0.020 | 4.00 |

### 半无限体与误差函数解

初始温度 $T_i$、表面突加到 $T_s$ 的半无限体解为

$$
T(x,t)=T_i+(T_s-T_i)\,\mathrm{erfc}\!\left(\frac{x}{2\sqrt{\alpha t}}\right),
\qquad
q''_s(t)=\frac{k\,(T_s-T_i)}{\sqrt{\pi\alpha t}}.
$$

取钢（$k=45\,\mathrm{W/(m\cdot K)}$、$\alpha=1.22\times10^{-5}\,\mathrm{m^2/s}$）、$T_i=20\,^\circ\mathrm{C}$、$T_s=200\,^\circ\mathrm{C}$、$t=100\,\mathrm{s}$：$2\sqrt{\alpha t}=2\times0.03493=0.06986\,\mathrm{m}$。在 $x=34.93\,\mathrm{mm}$ 处辐角为 $0.5$，$\mathrm{erfc}(0.5)=0.4795$，得 $T=20+0.4795\times180=106.3\,^\circ\mathrm{C}$；在 $x=69.86\,\mathrm{mm}$ 处辐角为 $1.0$，$\mathrm{erfc}(1.0)=0.1573$，得 $T=48.3\,^\circ\mathrm{C}$。表面热流为 $q''_s=45\times180/\sqrt{\pi\times1.22\times10^{-5}\times100}=8100/0.0619=131\,\mathrm{kW/m^2}$。有限元结果与这两个温度点、一个热流值的偏差都应低于 $2\%$；若温度对而热流偏低，通常是表面单元厚度过大导致梯度被平均。

### 可复算的验证脚本

```python
import math
from math import erfc, sqrt, pi
k, alpha, Ti, Ts, t = 45.0, 1.22e-5, 20.0, 200.0, 100.0   # 钢
for x in (0.03493, 0.06986):
    T = Ti + (Ts-Ti)*erfc(x/(2*sqrt(alpha*t)))
    print(f"x={x*1e3:6.2f}mm  T={T:7.2f}C")
qs = k*(Ts-Ti)/sqrt(pi*alpha*t)
print(f"q''_s={qs/1e3:.1f} kW/m2")
Tv = [100.320, 100.080, 100.020]
e  = [abs(v-100.0) for v in Tv]
p  = math.log(e[0]/e[1], 2)
print(f"p={p:.2f}  T_ex={Tv[2]+(Tv[2]-Tv[1])/(2**p-1):.4f}C")
# x= 34.93mm  T= 106.31C
# x= 69.86mm  T=  48.31C
# q''_s=130.8 kW/m2
# p=2.00  T_ex=100.0000C
```

### 集总热容与时间常数

当 Biot 数 $Bi=hL_c/k<0.1$ 时，物体内部温差可忽略，温度按

$$
\frac{T-T_\infty}{T_i-T_\infty}=e^{-t/\tau},
\qquad
\tau=\frac{\rho V c_p}{hA}
$$

衰减。直径 $10\,\mathrm{mm}$ 的钢球（$R=5\,\mathrm{mm}$）：$Bi=hR/(3k)=100\times0.005/(3\times45)=0.0037$，远小于 $0.1$，集总假设成立；$\tau=\rho c_pR/(3h)=7850\times470\times0.005/(3\times100)=61.5\,\mathrm{s}$。于是 $t=61.5\,\mathrm{s}$ 时无量纲温度降到 $e^{-1}=0.368$，$t=184.5\,\mathrm{s}$ 时降到 $e^{-3}=0.0498$。这两点是检验对流边界与热容是否配对的最简基准：若衰减明显快于解析值，先查 $h$ 的单位是否被当成 $\mathrm{W/(m^2\,^\circ C)}$ 与 $\mathrm{W/(m^2K)}$ 混用，再查体积与表面积是否用了同一个特征长度。

### 稳态热阻网络与界面热阻反演

串联热阻给出稳态温升的解析分配：

$$
R_{\mathrm{cond}}=\frac{L}{kA},
\qquad
R_{\mathrm{conv}}=\frac{1}{hA},
\qquad
R_c^{\mathrm{area}}=\frac{\Delta T}{q''}.
$$

以 $20\,\mathrm{mm}\times20\,\mathrm{mm}$ 的芯片为例：硅片厚 $0.5\,\mathrm{mm}$、$k=148\,\mathrm{W/(m\cdot K)}$，$A=4\times10^{-4}\,\mathrm{m^2}$，得 $R_{\mathrm{die}}=5\times10^{-4}/(148\times4\times10^{-4})=8.45\times10^{-3}\,\mathrm{K/W}$；界面热阻 $R_c=2\times10^{-5}\,\mathrm{m^2K/W}$ 折合 $2\times10^{-5}/4\times10^{-4}=0.05\,\mathrm{K/W}$；散热器 $0.3\,\mathrm{K/W}$。总热阻 $0.3585\,\mathrm{K/W}$，功耗 $100\,\mathrm{W}$ 时结温升高 $35.8\,\mathrm{K}$，其中界面占 $5.0\,\mathrm{K}$、硅片占 $0.85\,\mathrm{K}$、散热器占 $30.0\,\mathrm{K}$。

反向使用同一条关系即可从实测反演界面热阻：热流密度 $q''=100/4\times10^{-4}=250\,\mathrm{kW/m^2}$，若实测界面温降为 $5.0\,\mathrm{K}$，则 $R_c=5.0/250000=2.0\times10^{-5}\,\mathrm{m^2K/W}$。反演值若比材料手册低一个数量级，说明界面在网格中实际共了节点，热阻单元没有参与热流路径。

## 参考资料

1. Carslaw, H. S. & Jaeger, J. C. *Conduction of Heat in Solids*. 2nd ed., Oxford University Press, 1959.
2. Incropera, F. P., DeWitt, D. P., Bergman, T. L. & Lavine, A. S. *Fundamentals of Heat and Mass Transfer*. 6th ed., Wiley, 2007.
3. Patankar, S. V. *Numerical Heat Transfer and Fluid Flow*. Hemisphere Publishing, 1980.
4. Madhusudana, C. V. *Thermal Contact Conductance*. 2nd ed., Springer, 2014.
5. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
6. Bergheau, J.-M. & Fortunier, R. *Finite Element Simulation of Heat Transfer*. Wiley, 2008.
7. Roache, P. J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.
8. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.
