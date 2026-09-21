---
template_version: flowlab-knowledge/1.0
slug: cae-coupling-thermo-mechanical-engineering-setup
title: 热固耦合：工程设置与诊断验证
summary: 讲清热固耦合的单向与双向选择依据、温变材料与应力自由温度设置、接触热阻取值与 Abaqus 顺序耦合配置，附参数取值表和失败模式排查。
category:
  slug: multiphysics-coupling
  name: 多物理场耦合算法
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 多物理场耦合算法
  - 热固耦合
  - 工程设置与参数选择
  - 接触热阻
  - 应力自由温度
  - 结果诊断与可信度验证
  - 双金属片
  - 能量平衡
seo:
  title: 热固耦合：工程设置与诊断验证
  description: 讲清热固耦合的单向与双向选择依据、温变材料与应力自由温度设置、接触热阻取值与 Abaqus 顺序耦合配置，附参数取值表和失败模式排查。
  keywords:
    - 热固耦合
    - 工程设置与参数选择
    - 接触热阻
    - 热应力
    - 结果诊断与可信度验证
    - 应力自由温度
---
# 热固耦合：工程设置与诊断验证

热固耦合的失败很少来自求解器，而来自三件事：热应变是否用了正确的应力自由温度、物性是否随温度更新、接触界面的热阻是否被当成零。热固耦合结果最常见的形态是"温度场看起来完全正确，应力却处处可疑"。这类矛盾几乎总是落在三个可检查的位置：应力自由温度、接触界面的温度跳变、以及物性随温度的变化。

## 基础概念与控制关系

### 单向还是双向：先比时间尺度

热扩散与结构动力学的时间尺度通常相差几个数量级。热扩散率

$$\alpha_{th}=\frac{k}{\rho c_p}$$

对钢取 $k=50\ \mathrm{W/(m\cdot K)}$、$\rho=7850\ \mathrm{kg/m^3}$、$c_p=500\ \mathrm{J/(kg\cdot K)}$，得 $\alpha_{th}=50/(7850\times500)\approx1.27\times10^{-5}\ \mathrm{m^2/s}$。厚度 $L=0.01\ \mathrm{m}$ 的壁，热响应时间 $\tau_{th}=L^2/\alpha_{th}=1\times10^{-4}/1.27\times10^{-5}\approx7.9\ \mathrm{s}$，而结构一阶模态周期常在毫秒量级，两者相差三到四个数量级。

这意味着一般加热工况下温度场先到位、位移随后跟上，用单向顺序耦合（先热后结构）即可。只有三类情形必须双向：结构变形显著改变对流或辐射面积（如大挠度板）、变形改变接触状态从而改变传热路径、以及存在热弹性耦合引起的颤振或热屈曲。判据是变形引起的换热面积变化超过 1%～2%，或接触开合在时程内发生。

## 工程设置与实施

### 关键参数取值表

| 参数 | 典型取值 | 依据 |
|---|---|---|
| 应力自由温度 $T_{ref}$ | 制造/装配温度，如 20 ℃ | 与无应力状态一致 |
| 接触热阻 $R_c''$ | $1\times10^{-4}\sim1\times10^{-3}\ \mathrm{m^2K/W}$ | 干接触机加工面 |
| 接触导热系数 $h_c$ | $1\times10^3\sim1\times10^4\ \mathrm{W/(m^2K)}$ | $h_c=1/R_c''$ |
| 辐射发射率 $\epsilon$ | 抛光金属 0.05～0.1，氧化钢 0.8 | 高温工况需计入 |
| 时间步 | $\Delta t\le\tau_{th}/20\approx0.4\ \mathrm{s}$ | 分辨热瞬态 |

### 诊断脚本

```python
import numpy as np
# 读取传热结果: 各边界热流 Q_face[W], 界面温降 dTc[K], 下表面平均温度 Ts[K]
Q_in, Q_out = 1.0e4 * 1.0, np.load("q_out.npy").sum()   # W
res = abs(Q_in - Q_out) / abs(Q_in)
print(f"能量平衡残差 = {res:.2e} (阈值 1e-3)")

dTc = np.load("dTc.npy")
Rc = 2e-4                                    # m^2 K/W
q  = Q_in / 1.0                              # W/m^2
print(f"期望界面温降 = {q*Rc:.1f} K, 实测均值 = {dTc.mean():.1f} K")

kappa = 3 * (-7e-6) * 100 / (4 * 5e-4)       # 1/m
print(f"双金属片解析曲率 = {kappa:.3f} 1/m, 端部挠度 = {abs(kappa)*0.05**2/2*1e3:.2f} mm")
```

把能量残差、界面温降与解析挠度三个数写进每次提交的报告，比单看最大应力更能暴露设置错误。

### 温变物性与应力自由温度

热应变按

$$\boldsymbol{\varepsilon}^{th}=\alpha(T)\,(T-T_{ref})\,\mathbf{I}$$

计算，$T_{ref}$ 是应力自由温度（也称零应变温度），必须与制造状态一致，而不是默认的 0 ℃。装配件中不同零件的 $T_{ref}$ 可以不同：焊接件取焊后冷却到室温的时刻，螺栓连接件取预紧时的温度。

温变物性至少准备 $E(T)$、$\alpha(T)$、$k(T)$ 三张表，温度点覆盖工况全区间并在变化剧烈段加密。若结构全约束，热应力可用一维公式快速估算：

$$\sigma=\frac{E\,\alpha\,\Delta T}{1-\nu}$$

取 $E=210\ \mathrm{GPa}$、$\alpha=12\times10^{-6}\ \mathrm{K^{-1}}$、$\Delta T=200\ \mathrm{K}$、$\nu=0.3$，得 $\sigma=210\times10^9\times12\times10^{-6}\times200/0.7\approx7.2\times10^8\ \mathrm{Pa}=720\ \mathrm{MPa}$。这已远超普通碳钢约 235 MPa 的屈服强度，说明必须启用塑性，否则应力会被线性弹性高估甚至掩盖真实失效位置。

### 接触热阻不能当零

装配界面存在微观空隙，热流通过时产生温度跳变：

$$q''=\frac{\Delta T}{R_c''}$$

$R_c''$ 是单位面积接触热阻，单位 $\mathrm{m^2\cdot K/W}$。机加工金属干接触的典型值为 $1\times10^{-4}\sim1\times10^{-3}\ \mathrm{m^2\cdot K/W}$，涂导热硅脂后可降到 $1\times10^{-5}$ 量级。取热流密度 $q''=5\times10^4\ \mathrm{W/m^2}$、$R_c''=2\times10^{-4}\ \mathrm{m^2\cdot K/W}$，界面温降 $\Delta T=5\times10^4\times2\times10^{-4}=10\ \mathrm{K}$。同样热流穿过 10 mm 厚钢板的温降为 $q''L/k=5\times10^4\times0.01/50=10\ \mathrm{K}$——也就是说，忽略这个接触面，等效于凭空删掉了 10 mm 钢材。

### Abaqus 顺序耦合设置

单向热固耦合的标准写法是先做传热分析，再把温度场作为预定义场读入静力分析，并显式给出接触导热：

```text
*MATERIAL, NAME=STEEL
*ELASTIC
210.E9, 0.3
*EXPANSION, ZERO=20.
1.2E-5,
*CONDUCTIVITY
50.,
*DENSITY
7850.,
*SPECIFIC HEAT
500.,
**
*SURFACE INTERACTION, NAME=INT1
*GAP CONDUCTANCE
2.E4, 0., 0.
**
*STEP, NLGEOM=ON
*STATIC
1., 60.
*TEMPERATURE, FILE=heatjob, BSTEP=1, ESTEP=1
```

`*EXPANSION, ZERO=20.` 把应力自由温度设为 20 ℃；`*GAP CONDUCTANCE` 的 2.E4 即接触导热系数 $h_c=1/R_c''=2\times10^4\ \mathrm{W/(m^2\cdot K)}$，与上一节的 $R_c''=5\times10^{-5}$ 对应。`*TEMPERATURE, FILE=` 指定从传热作业读取温度场，实现顺序耦合。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场合理但应力整体偏大 | 应力自由温度取了默认 0 ℃ | 把 $T_{ref}$ 改为装配温度，看应力是否平移 |
| 装配界面两侧温度完全连续 | 未定义接触热阻 | 在界面插入薄层单元并赋 $k$，对比温降 |
| 应力超过屈服却不收敛 | 未启用塑性 | 加入双线性硬化，检查是否恢复收敛 |
| 物性表外插后结果突变 | 温度点未覆盖工况区间 | 检查最高温是否落在表内 |
| 循环加载后位移不可恢复 | 误用单向耦合忽略塑性累积 | 改为双向或加入随动硬化 |
| 温度场正确但应力整体偏移 | 应力自由温度 $T_{ref}$ 取值错误 | 平移 $T_{ref}$ 10 K，看应力是否整体平移 36 MPa |
| 装配界面温度光滑无跳变 | 未设置接触热阻 | 插入 0.1 mm 低导热薄层，看是否出现温降 |
| 厚向应力梯度偏小 | 厚向单元过少 | 单元数由 2 增到 6，看表面应力是否升到 180 MPa |
| 高温面温度远低于解析值 | 辐射被误开或发射率过大 | 关闭辐射重算，对比 1025 ℃ 解析值 |
| 循环载荷后应力持续累积 | 物性未随温度更新 | 检查 $E(T)$ 是否只在首个增量步插值一次 |

## 验证、验收与复现

### 与解析解逐项对照

自由变形的双金属片是热固耦合最好的解析基准。两层等厚度 $t$、等弹性模量、线膨胀系数分别为 $\alpha_A$、$\alpha_B$ 时，升温 $\Delta T$ 后的曲率为

$$\kappa=\frac{3(\alpha_A-\alpha_B)\Delta T}{4t}$$

取钢 $\alpha_A=12\times10^{-6}\ \mathrm{K^{-1}}$、黄铜 $\alpha_B=19\times10^{-6}\ \mathrm{K^{-1}}$、$t=0.5\ \mathrm{mm}=5\times10^{-4}\ \mathrm{m}$、$\Delta T=100\ \mathrm{K}$，得 $\kappa=3\times(-7\times10^{-6})\times100/(4\times5\times10^{-4})=-1.05\ \mathrm{m^{-1}}$，曲率半径约 0.95 m。长度 50 mm 的悬臂片端部挠度按 $\delta\approx\kappa L^2/2$ 估算为 $1.05\times0.0025/2\approx1.3\times10^{-3}\ \mathrm{m}=1.3\ \mathrm{mm}$。把仿真端部挠度与 1.3 mm 对照，偏差超过 10% 就要检查壳单元的厚向积分点数量或 $\alpha$ 的温度插值。

第二个对照是厚向线性温度梯度。板上下表面温差 $\Delta T$ 时，表面应力

$$\sigma_{surf}=\frac{E\,\alpha\,\Delta T}{2(1-\nu)}$$

取 $E=210\ \mathrm{GPa}$、$\alpha=12\times10^{-6}\ \mathrm{K^{-1}}$、$\Delta T=100\ \mathrm{K}$、$\nu=0.3$，得 $\sigma_{surf}=210\times10^9\times12\times10^{-6}\times100/1.4\approx1.8\times10^8\ \mathrm{Pa}=180\ \mathrm{MPa}$。若仿真表面应力明显小于此值，通常是厚向只放了 1～2 个单元，梯度被抹平。

### 接触界面的温度跳变

接触热阻缺失时，温度云图在装配面上光滑连续，看似合理却漏掉了一段温降。诊断量是界面两侧的温度差

$$\Delta T_c=q''\,R_c''$$

取热流密度 $q''=8\times10^4\ \mathrm{W/m^2}$、$R_c''=2\times10^{-4}\ \mathrm{m^2\cdot K/W}$，应看到 $\Delta T_c=16\ \mathrm{K}$ 的跳变。若有限元结果给出 $\Delta T_c<1\ \mathrm{K}$，说明接触导热系数被设成了默认的无穷大。判定试验很直接：在界面上人为插入一层厚 0.1 mm、导热系数 $k=0.2\ \mathrm{W/(m\cdot K)}$ 的薄层，它等价于 $R_c''=5\times10^{-4}\ \mathrm{m^2K/W}$，若温降随之出现且量级吻合，即确认原模型漏设热阻。

### 稳态能量平衡闭合

传热分析的独立校验是界面热流与边界热流的总和为零：

$$\sum_{in}Q_i-\sum_{out}Q_j\le\varepsilon_Q\sum_{in}|Q_i|,\qquad \varepsilon_Q\le10^{-3}$$

一个 20 mm 厚钢板上表面施加热流 $1\times10^4\ \mathrm{W/m^2}$、下表面自然对流（$h=10\ \mathrm{W/(m^2\cdot K)}$、环境 25 ℃），稳态下表面温度应满足 $q''=h(T_s-25)$，即 $T_s=25+1\times10^4/10=1025\ \mathrm{^\circ C}$。把这个解析值同仿真下表面平均温度对比，若偏差超过 5 K，先查辐射是否被误开——在 1025 ℃ 下辐射通量 $\epsilon\sigma(T^4-T_\infty^4)$ 已不可忽略。

## 参考资料

热应变 $\boldsymbol{\varepsilon}^{th}=\alpha(T)(T-T_{ref})\mathbf{I}$ 中，$T_{ref}$ 的误差只让应力整体平移，不改变温度场，因此极难从温度云图上发现。诊断方法是做一个平移试验：把 $T_{ref}$ 提高 10 K，若全场应力近似减去同一个 $\Delta\sigma=E\alpha\Delta T/(1-\nu)=210\times10^9\times12\times10^{-6}\times10/(1-0.3)\approx3.6\times10^7\ \mathrm{Pa}=36\ \mathrm{MPa}$ 的常量，则说明 $T_{ref}$ 设置错了。另一条独立线索是符号：受约束构件升温应产生压应力，若云图显示拉应力，多半是 $T_{ref}$ 高于实际装配温度。
1. Boley B.A., Weiner J.H., *Theory of Thermal Stresses*, Wiley, 1960.
2. Hetnarski R.B., Eslami M.R., *Thermal Stresses—Advanced Theory and Applications*, Springer, 2009.
3. Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*, 5th ed., Wiley, 2002.
4. Zienkiewicz O.C., Taylor R.L., *The Finite Element Method*, Vol. 2, Butterworth-Heinemann, 2000.
5. Dassault Systèmes, *Abaqus Analysis User's Guide*, Section on coupled temperature–displacement analysis.
6. ANSYS Inc., *Mechanical APDL Theory Reference*, Release 2021R2.
7. Timoshenko S., "Analysis of bi-metal thermostats," *Journal of the Optical Society of America*, 11(3), 1925.
8. Roache P.J., "Perspective: a method for uniform reporting of grid refinement studies," *ASME Journal of Fluids Engineering*, 116, 1994.
9. Dassault Systèmes, *Abaqus Theory Guide*, Section on heat transfer and thermal stress.
