---
template_version: flowlab-knowledge/1.0
slug: cae-opt-topology-optimization-modeling
title: 拓扑优化：原理、设置与验证
summary: >-
  从均匀化理论与 SIMP 插值的可实现域出发，说明惩罚指数 p、空洞模量下限与体积分数三者的耦合取值，给出 RAMP
  与水平集的替换条件及设计相关荷载的失效边界。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 进阶
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 优化、不确定性与降阶
  - 拓扑优化
  - 方法原理与适用范围
  - SIMP 插值
  - 设计相关荷载
  - 工程设置与参数选择
  - MMA 渐近线
  - 最小壁厚约束
  - 结果诊断与可信度验证
  - 灰度指数
  - 网格收敛
seo:
  title: 拓扑优化：原理、设置与验证
  description: >-
    从均匀化理论与 SIMP 插值的可实现域出发，说明惩罚指数 p、空洞模量下限与体积分数三者的耦合取值，给出 RAMP
    与水平集的替换条件及设计相关荷载的失效边界。
  keywords:
    - 拓扑优化
    - 方法原理与适用范围
    - SIMP
    - 密度插值
    - Hashin-Shtrikman 上界
    - 工程设置与参数选择
    - MMA
    - 滤波半径
    - 增材制造约束
    - 结果诊断与可信度验证
    - Richardson 外推
    - 灰度指数
    - 阈值化损失
---
# 拓扑优化：原理、设置与验证

拓扑优化把"材料分布"本身作为设计变量，问题的可解性完全取决于能否把 0/1 选择松弛成可微的连续问题。SIMP 密度插值在通用网格上最稳，但它对惩罚指数、空洞模量下限与体积分数三者的取值是耦合的，单独调一个参数通常无效。本文只讨论建模层面的选择：插值模型、约束形式、设计相关荷载与最小尺度控制。拓扑优化的结果对参数配置极其敏感，同一模型换一组滤波半径或移动限就会得到完全不同的构件。拓扑优化的解没有解析基准，因此可信度必须靠一组自洽的证据建立：解析对照、网格收敛、灰度度量与阈值化损失。四类证据缺一不可——只看目标函数下降，无法区分真实改善与网格退化。

## 基础概念与控制关系

### 离散选择被松弛为密度场

二维 120×40 网格含 4800 个单元，0/1 组合数达 $2^{4800}$，穷举不可行。SIMP 引入单元密度 $x_e \in [x_{\min},1]$，用幂函数把密度映射为弹性模量：

$$ E(x_e)=E_{\min}+x_e^{p}\left(E_0-E_{\min}\right) $$

$E_0$ 为实体模量，$E_{\min}$ 是空洞的数值下限。取 $E_{\min}=0$ 会让刚度矩阵奇异，工程取值 $E_{\min}=10^{-9}E_0 \sim 10^{-6}E_0$。当 $x_e=0.5$、$p=3$ 时 $0.5^3=0.125$，中间密度只保留 12.5% 的刚度，这个非线性亏损才是 SIMP 把解推向 0/1 的机理；若 $p=1$，0.5 密度保留 50% 刚度，灰色区在体积预算下反而划算，解不会收敛到黑白。

### 最小尺度控制与网格依赖性

不加滤波时，加密网格会不断产生更细的构件，结构随网格变化，并伴随棋盘格。密度滤波用邻域加权平均抑制这一问题：

$$ \tilde{x}_e=\frac{\sum_{i\in N_e}w_{ei}x_i}{\sum_{i\in N_e}w_{ei}},\qquad w_{ei}=\max\left(0,\ r_{\min}-\lVert \mathbf{x}_e-\mathbf{x}_i\rVert\right) $$

$r_{\min}$ 决定最小构件尺度，通常取单元边长的 1.5～3 倍；单元边长 1 mm 时 $r_{\min}=3$ mm 对应最小构件约 6 mm。滤波本身会制造灰度过渡带，需再用 Heaviside 投影锐化边界，并把体积约束施加在投影后的密度上。

### 惩罚指数与体积分数必须联立确定

最小柔度是拓扑优化的标准原型：

$$ \min_{\mathbf{x}} J=\mathbf{u}^{\top}K(\mathbf{x})\mathbf{u}\quad \text{s.t.}\quad K\mathbf{u}=\mathbf{f},\quad \frac{\sum_e v_e x_e}{\sum_e v_e}\le V^{\star} $$

$V^{\star}$ 是体积分数上限，典型取值 0.4。$p$ 与 $V^{\star}$ 联合决定灰度：$V^{\star}=0.4$ 时若 $p=3$，$x_e=0.7$ 的单元只贡献 $0.7^3=0.343$ 的刚度，占用 0.7 的体积预算却拿不到等比例刚度，优化器自然把它推向 0 或 1。直接把 $p$ 从 1 跳到 3 会在早期陷入局部极小，做法是从 $p=1$ 起每 20～40 次迭代升一级，直到 $p=3$ 或 4。

### 设计相关荷载改写灵敏度结构

自重、离心力与气动压力随拓扑变化，荷载向量变为 $\mathbf{f}=\mathbf{f}(\mathbf{x})$，灵敏度多出一项：

$$ \frac{dJ}{dx_e}=-\mathbf{u}^{\top}\frac{dK}{dx_e}\mathbf{u}+2\mathbf{u}^{\top}\frac{d\mathbf{f}}{dx_e} $$

漏掉第二项会让材料堆积在加载区域附近，自重工况下得到明显错误的结构。判定办法：把 $\mathbf{f}$ 冻结后重算，若最优拓扑出现肉眼可见改变，说明设计相关性不可忽略。

### 与理论下界对照

同一工况的连续体最小柔度存在松弛下界，SIMP 解必须在其上方。若优化柔度低于该下界，几乎一定是体积约束未被严格满足，先查体积残差而不是庆祝。

## 适用边界与方案选择

### 灰度指数是比"看图"更硬的判据

离散度指标（灰度指数）

$$ M_{nd}=\frac{\sum_{e=1}^{N_e}4x_e\left(1-x_e\right)}{N_e} $$

对 $x_e\in\{0,1\}$ 的干净结构 $M_{nd}=0$。4800 个单元中若有 500 个落在 $x_e=0.5$，则 $M_{nd}=4\times0.5\times0.5\times500/4800=0.104$，即 10.4%，说明惩罚不足；只有 $M_{nd}<0.01$ 才算可交付的黑白结构。

### MMA 渐近线与移动限的取值

MMA 把子问题写成可分离有理式，渐近线按相邻两步的设计变量变化更新：

$$ L_i^{(k+1)}=x_i^{(k)}-\gamma\left(x_i^{(k)}-L_i^{(k)}\right),\qquad U_i^{(k+1)}=x_i^{(k)}+\gamma\left(U_i^{(k)}-x_i^{(k)}\right) $$

$\gamma$ 是渐近线扩张系数，迭代靠近时取 0.7，远离时取 1.2。移动限把单步密度变化限制在 0.01～0.1：取 0.1 收敛快但易振荡，取 0.02 平稳但迭代数约翻倍。

## 工程设置与实施

### 网格尺寸先定，再定滤波半径

设计域离散成 1.0 mm 的四边形单元时，最小构件尺度由滤波半径控制：

$$ d_{\min}\approx 2r_{\min},\qquad r_{\min}=n_e\,h_e $$

$h_e$ 是单元边长，$n_e$ 是滤波覆盖的单元层数，工程取 1.5～3。若要求最小壁厚 6 mm，则 $r_{\min}=3.0$ mm，即 3 个单元。网格加密到 0.5 mm 时 $r_{\min}$ 必须保持 3.0 mm（此时覆盖 6 个单元），否则最小尺度随网格缩小，结构会越来越细。

### 参数表与配置模板

```python
cfg = dict(h_e=1.0, r_min=3.0, Vf=0.40, Emin_ratio=1e-9,
           p_schedule=[(1, 1, 40), (2, 41, 80), (3, 81, 150)],
           move_limit=0.02, gamma_near=0.7, gamma_far=1.2,
           tol=1e-3, threshold=0.5)
for p, k0, k1 in cfg["p_schedule"]:
    for k in range(k0, k1 + 1):
        K = assemble(x, p, cfg["Emin_ratio"])
        u = solve(K, f)
        dc = filter_sens(sens(x, p, u), cfg["r_min"])
        x_prev = x
        x, lam = mma(x, dc, cfg["Vf"], cfg["move_limit"])
        if max(abs(x - x_prev)) < cfg["tol"]:
            break
```

| 参数 | 取值 | 依据 |
|---|---|---|
| 单元边长 $h_e$ | 1.0 mm | 与 6 mm 最小壁厚匹配 |
| 滤波半径 $r_{\min}$ | 3.0 mm | $d_{\min}\approx2r_{\min}$ |
| 体积分数 $V^{\star}$ | 0.40 | 目标减重 60% |
| 惩罚指数 | 1→2→3 | 分级避免局部极小 |
| 移动限 | 0.02 | 抑制振荡 |
| 渐近线系数 $\gamma$ | 0.7 / 1.2 | 近/远更新 |
| 收敛容差 | $10^{-3}$ | $\lVert\Delta x\rVert_\infty$ |
| 密度阈值 | 0.5 | 后处理二值化 |
| 空洞模量 $E_{\min}$ | $10^{-9}E_0$ | 避免刚度矩阵奇异 |

### 插值模型的替代方案与可实现域限制

幂函数插值并非对所有 $p$ 都对应可实现的微结构。Hashin–Shtrikman 上界限制多孔材料的等效模量，二维问题需 $p\ge3$ 才能让插值曲线落在可实现域内。RAMP 用有理式替代幂函数：

$$ E(x_e)=E_{\min}+\frac{x_e}{1+q\left(1-x_e\right)}\left(E_0-E_{\min}\right) $$

$q=3\sim5$ 时 RAMP 在 $x_e\to0$ 处导数非零，对初始密度接近 0 的单元更友好，适合空洞区一开始就被移除的设计。水平集方法用隐函数零等值线描述边界，界面天然清晰，但需求解 Hamilton–Jacobi 方程并做速度场延拓，实现成本高于 SIMP，且孔洞生成需要额外的拓扑导数。

### 惩罚指数分级推进

直接令 $p=3$ 会让早期迭代陷入局部极小。可复用的三级安排：第 1～40 次 $p=1$，第 41～80 次 $p=2$，第 81～150 次 $p=3$。每级切换后目标会跳变一次，这属正常；若切换后 10 次迭代内目标反弹超过 5%，说明切换过早，应把该级迭代数加倍。

### 体积约束与质量换算

体积约束 $\sum_e v_e x_e \le V^{\star}\sum_e v_e$ 用二分法更新拉格朗日乘子严格满足，$V^{\star}=0.40$。设计域体积为

$$ 200\times100\times5=1.0\times10^{5}\ \mathrm{mm^{3}}=1.0\times10^{-4}\ \mathrm{m^{3}} $$

Q355 钢密度 7850 kg/m³ 时实体质量 0.785 kg，按 $V^{\star}=0.40$ 优化后为 0.314 kg，减重 0.471 kg（60%）。

### 制造约束必须在优化中施加

增材制造要求悬垂面与基板夹角不小于 45°；减材制造的最小壁厚由刀具半径决定，通常 3 mm。这两类约束若在优化后才检查，往往需要返工。正确做法是在灵敏度中叠加悬垂惩罚项，或在体积约束之外增加最小壁厚约束。

### 交付前的复核

阈值化到 0.5 后要重新求解一次真实模型，报告柔度损失；若损失超过 5%，说明阈值切掉了承载路径，应把阈值降到 0.3 或启用投影后再优化。同时核对体积残差是否小于 $10^{-6}$，以及每步状态求解是否真正收敛——未收敛的状态解会让灵敏度带噪。

## 异常诊断与失效模式

### 故障模式与判定试验

以下情形应先换模型再谈优化：材料进入塑性或发生接触，线性刚度矩阵不成立；以屈曲或疲劳寿命为控制量，柔度最小化与寿命目标不同向；载荷方向随变形显著改变，需要几何非线性与随动荷载；目标是最小化最大应力，此时最大应力在离散网格上不可微，应改用 p-norm 聚合。

```text
SIMP 最小柔度主循环
输入: 网格 nx*ny, 体积分数 Vf=0.4, r_min, p 序列 [1,2,3]
x_e <- Vf
for p in [1,2,3]:
    for k in 1..40:
        K  <- assemble(E(x_e, p, Emin=1e-9*E0))
        u  <- solve(K u = f)
        dc <- -p * x_e^(p-1) * (E0-Emin) * u_e^T k0 u_e
        dc <- filter(dc, r_min)
        x  <- project(filter(x_e, r_min))     # Heaviside 投影
        x_e <- MMA(x_e, dc, Vf)               # 体积约束加在投影密度上
    if max|x_e - x_e_old| < 1e-3: break
返回 阈值 0.5 的二值结构
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 灰色单元占比超过 20% | 惩罚指数不足或滤波半径过小 | 固定 $r_{\min}$，$p$ 由 1 升到 3，观察灰度是否下降 |
| 加密网格后拓扑改变 | 缺最小尺度约束 | $r_{\min}$ 取单元尺寸 1.5～3 倍后重算 |
| 交替黑白棋盘格 | 位移场与密度场插值不匹配 | 改用高阶单元或启用密度滤波 |
| 结果偏向加载点 | 设计相关荷载项被漏掉 | 冻结 $\mathbf{f}$ 重算，比较两版拓扑 |
| 迭代在体积约束边界振荡 | 用罚函数而非严格约束 | 检查每步体积残差是否小于 $10^{-6}$ |
| 构件随网格加密变细 | $r_{\min}$ 未按物理长度换算 | 保持 $r_{\min}=3.0$ mm 重算 |
| 迭代目标持续振荡 | 移动限过大 | 移动限由 0.1 降到 0.02 |
| 体积超出上限 0.5% 以上 | 乘子更新用罚函数 | 检查每步体积残差是否小于 $10^{-6}$ |
| 悬垂面报错 | 未施加 45° 悬垂约束 | 统计悬垂单元占比 |
| 减重未达标 | 阈值化后未复算 | 比较阈值前后柔度 |

### 诊断表

```text
可信度检查脚本
1) J = compliance(mesh) for mesh in [60x20, 120x40, 240x80]
2) p_obs = ln(|(J3-J2)/(J2-J1)|) / ln(2)          # 期望 > 1.8
3) GCI   = 1.25 * |J3-J2|/J3 / (2**p_obs - 1)     # 期望 < 1%
4) M_nd  = mean(4*x*(1-x))                        # 期望 < 0.01
5) J_th  = compliance(binary(x > 0.5))
6) loss  = (J_th - J3) / J3                       # 期望 < 5%
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 三套网格柔度接近但结构不同 | 滤波半径未固定为物理长度 | 固定 $r_{\min}=3.0$ mm 重算并比较 $M_{nd}$ |
| 出现棋盘格 | 密度场与位移场插值不匹配 | 改用 9 节点单元或加密度滤波 |
| 目标在最后 20 步仍缓慢下降 | 未收敛即停止 | 容差从 $10^{-2}$ 收紧到 $10^{-3}$ |
| 阈值后柔度跳升 15% | 阈值 0.5 切掉承载路径 | 阈值降到 0.3 复算 |
| 对称工况得到不对称结构 | 初值完全对称或并行归约顺序不定 | 加 $10^{-3}$ 随机扰动并固定归约顺序 |
| 柔度低于理论下界 | 体积约束被违反 | 检查体积残差是否小于 $10^{-6}$ |

## 验证、验收与复现

### 网格收敛与 Richardson 外推

在 60×20、120×40、240×80 三套网格上跑同一问题，柔度分别为 13.20、12.55、12.39。网格比 $r=2$，观测阶数

$$ p_{obs}=\frac{\ln\left|\frac{J_3-J_2}{J_2-J_1}\right|}{\ln r}=\frac{\ln\left|\frac{12.39-12.55}{12.55-13.20}\right|}{\ln 2}=2.02 $$

二阶收敛说明单元与滤波实现正确。网格收敛指数

$$ GCI=1.25\,\frac{|J_3-J_2|/J_3}{r^{p_{obs}}-1}=1.25\times\frac{0.16/12.39}{2^{2.02}-1}=0.53\% $$

外推值 $J_{ext}=12.39+0.16/(2^{2.02}-1)=12.44$。若三套网格的 $p_{obs}$ 掉到 1.0 以下，通常是滤波半径随网格缩放导致的伪收敛。

### 先验证有限元本身，再谈优化

用等截面悬臂梁做解析对照：长 $L=100$ mm、宽 $b=20$ mm、高 $h=40$ mm、端部集中力 $F=1000$ N、$E=210$ GPa。惯性矩

$$ I=\frac{bh^{3}}{12}=\frac{0.02\times0.04^{3}}{12}=1.067\times10^{-7}\ \mathrm{m^{4}} $$

端部挠度由 Euler–Bernoulli 梁给出

$$ \delta=\frac{FL^{3}}{3EI}=\frac{1000\times0.1^{3}}{3\times2.1\times10^{11}\times1.067\times10^{-7}}=1.49\times10^{-5}\ \mathrm{m} $$

即 0.0149 mm。有限元模型若与它相差超过 2%，说明单元、约束或载荷施加有误，此前的优化结果一律无效。

### 阈值化损失必须复算

把密度场按 0.5 二值化后重新求解，柔度从 12.44 升到 12.90，损失 $(12.90-12.44)/12.44=3.7\%$。低于 5% 可接受；超过 10% 说明大量承载单元落在阈值附近，应降低阈值或启用 Heaviside 投影。

## 参考资料

1. Bendsøe M.P., Sigmund O., *Topology Optimization: Theory, Methods and Applications*, Springer, 2003.
2. Bendsøe M.P., "Optimal shape design as a material distribution problem," *Structural Optimization*, 1, 1989.
3. Hashin Z., Shtrikman S., "A variational approach to the theory of the elastic behaviour of multiphase materials," *Journal of the Mechanics and Physics of Solids*, 11, 1963.
4. Allaire G., Jouve F., Toader A.M., "Structural optimization using sensitivity analysis and a level-set method," *Journal of Computational Physics*, 194, 2004.
5. Bruns T.E., Tortorelli D.A., "Topology optimization of non-linear elastic structures and compliant mechanisms," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
6. Sigmund O., Petersson J., "Numerical instabilities in topology optimization: a survey on procedures dealing with checkerboards, mesh-dependencies and local minima," *Structural Optimization*, 16, 1998.
7. Svanberg K., "The method of moving asymptotes—a new method for structural optimization," *International Journal for Numerical Methods in Engineering*, 24, 1987.
8. Zhou M., Rozvany G.I.N., "The COC algorithm, Part II: topological, geometrical and generalized shape optimization," *Computer Methods in Applied Mechanics and Engineering*, 89, 1991.
9. Wang F., Lazarov B.S., Sigmund O., "On projection methods, convergence and robust formulations in topology optimization," *Structural and Multidisciplinary Optimization*, 43, 2011.
10. Deaton J.D., Grandhi R.V., "A survey of structural and multidisciplinary continuum topology optimization: post 2000," *Structural and Multidisciplinary Optimization*, 49, 2014.
11. Borrvall T., Petersson J., "Topology optimization using regularized intermediate density control," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
12. Rozvany G.I.N., "A critical review of established methods of structural topology optimization," *Structural and Multidisciplinary Optimization*, 37, 2009.
13. Diaz A., Sigmund O., "Checkerboard patterns in layout optimization," *Structural Optimization*, 10, 1995.
14. Guest J.K., Prévost J.H., Belytschko T., "Achieving minimum length scale in topology optimization using nodal design variables and projection functions," *International Journal for Numerical Methods in Engineering*, 61, 2004.
15. Aage N., Andreassen E., Lazarov B.S., Sigmund O., "Giga-voxel computational morphogenesis for structural design," *Nature*, 550, 2017.
