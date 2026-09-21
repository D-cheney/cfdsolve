---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-parameter-sweeps-diagnosis-validation
title: "参数扫描与算例生成：结果诊断与可信度验证"
summary: "用无量纲灵敏度系数比较各因素影响强弱、要求趋势幅度大于数值不确定度、在扫描极值点做网格细化验证，并给出参数注入失败与流态跨越的诊断表。"
category:
  slug: openfoam-running-automation
  name: "OpenFOAM 运行与自动化"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 运行与自动化"
  - "参数扫描与算例生成"
  - "结果诊断与可信度验证"
  - "灵敏度系数"
  - "网格收敛指数"
seo:
  title: "参数扫描与算例生成：结果诊断与可信度验证"
  description: "用无量纲灵敏度系数比较各因素影响强弱、要求趋势幅度大于数值不确定度、在扫描极值点做网格细化验证，并给出参数注入失败与流态跨越的诊断表。"
  keywords:
    - "参数扫描与算例生成"
    - "结果诊断与可信度验证"
    - "灵敏度系数"
    - "网格收敛指数"
    - "响应面"
---
# 参数扫描与算例生成：结果诊断与可信度验证

扫描出一条曲线不等于得到一条结论。曲线里的每个点都带着自身的数值不确定度，点与点之间还可能有本不该存在的系统差异。判断扫描结果是否可用，要做三件事：把各因素的影响折算成可比的灵敏度、确认趋势幅度超过数值噪声、以及在扫描区间的两端各做一次网格细化。

## 趋势必须大于数值不确定度

最容易被忽略的是趋势与噪声的比值。设扫描区间内目标量 $C_d$ 的最大变化为 4.2%，而单点的时间离散不确定度 $GCI_t = 0.21\%$，比值为 20，趋势可信。若把扫描区间缩小到 $U$ 变化 1%，趋势幅度降到 0.14%，与 0.21% 的噪声同量级，此时曲线的形状完全由离散误差决定，任何"存在极值点"的结论都不成立。

判据可以写成一条不等式，要求区间端点差与噪声之比超过 5：

$$
\frac{\left|\phi(p_{\max}) - \phi(p_{\min})\right|}{\phi_{\mathrm{ref}}\, GCI} \ge 5
$$

用一次网格细化估出的 $GCI$ 代入即可。这条不等式决定了扫描区间至少要开多大，而不是先定区间再看结果。

## 灵敏度系数与无量纲化

各因素量纲不同，直接比较偏导数没有意义。用对数灵敏度把影响折算成"相对变化之比"：

$$
S_i = \frac{\partial \ln \phi}{\partial \ln p_i}
\approx \frac{\phi(p_i + \Delta p_i) - \phi(p_i - \Delta p_i)}{2\,\Delta p_i}\cdot\frac{p_i}{\phi}
$$

以入口速度 $U$ 对阻力系数的影响为例，$U = 10\ \mathrm{m/s}$、$\Delta U = 1\ \mathrm{m/s}$，测得 $C_d(11) = 1.187$、$C_d(9) = 1.221$、$\phi_{\mathrm{ref}} = 1.204$：

$$
S_U = \frac{1.187 - 1.221}{2 \times 1}\cdot\frac{10}{1.204} = -0.017 \times 8.306 = -0.141
$$

$S_U = -0.141$ 表示速度增加 1% 时阻力系数下降 0.141%，即 $C_d \propto U^{-0.141}$。同一算例中展长 $L_z$ 的灵敏度 $S_{L_z} = -1.02$，接近 $-1$，符合二维流动中单位展长阻力不随展长变化的预期——这本身就是一次合理性对照。

各算例的目标量用同一段脚本抽取，避免逐个手工读取：

```bash
for c in run_*; do
    cd=$(awk '!/^#/ && NF>=5 {v=$5} END{print v}' \
         "$c/postProcessing/forceCoeffs1/0/coefficient.dat")
    printf "%-32s Cd_last=%.4f\n" "$c" "$cd"
done | tee cdSummary.txt
```

`Cd_last` 取文件最后一行的系数值，前提是该算例已到统计稳态；若某算例仍在漂移，这个值本身不可比，需要先按收敛判据筛掉。

## 各算例可比性的前置检查

扫描结论建立在"除扫描参数外其余完全一致"之上。生成后、计算前先跑一遍可比性检查：

```bash
for c in run_*; do
    n=$(checkMesh -case "$c" -constant 2>/dev/null | awk '/^ *cells:/{print $2; exit}')
    s=$(foamDictionary -entry application -value "$c/system/controlDict")
    printf "%-32s cells=%-10s solver=%s\n" "$c" "$n" "$s"
done | tee comparability.txt
awk '{print $2}' comparability.txt | sort -u | wc -l
```

最后一行输出的应是 1，表示所有算例单元数完全相同。大于 1 就说明网格不一致，此时扫描出的差异里混入了网格差异。求解器名称同理。这条检查几秒钟就能做完，能挡掉后处理阶段最耗时的一类返工。

## 用极端点做网格细化

全区间细化代价太高，只在扫描区间的两端各做一次网格细化即可。若两端都收敛到同一趋势方向，说明中间点也可信；若某一端加密后趋势反转，说明该端的物理状态对分辨率敏感，需要单独讨论。

网格收敛指数按 Richardson 外推给出：

$$
GCI = \frac{F_s\left|\phi_2 - \phi_1\right|/\phi_1}{r^{p} - 1}
$$

安全因子取 $F_s = 1.25$，加密比 $r = 1.5$，观测阶 $p = 2$。若粗网格 $C_d = 1.187$、细网格 $C_d = 1.179$，则 $GCI = 1.25 \times 0.008/1.187/(1.5^2-1) = 1.25 \times 0.00674/1.25 = 0.00674$，即 0.67%。这个值高于前面 0.21% 的估计，说明在扫描区间端点处网格误差比时间误差更大，最终报告的不确定度应取两者中较大者。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 扫描曲线出现孤立坏点 | 某算例参数注入失败，实际用了默认值 | 逐算例回读参数值并与设计值对比 |
| 相邻算例目标量差 10 倍 | 参数跨越了流态转变（如 Re 跨临界值） | 计算各算例的 Re 或 Co，看是否跨临界 |
| 趋势方向与理论相反 | 端点算例未收敛就取数 | 比较各算例末段目标量漂移与残差平台 |
| 加密网格后趋势反转 | 离散误差主导，趋势幅度小于 GCI | 在两端点各做一次网格细化 |
| 两次运行同一算例结果不同 | 初场未固定，或用了随机初始化 | `md5sum 0/*` 比较两次的初始场 |
| 后处理漏掉部分算例 | 目录命名不一致，通配符未匹配 | `ls -d run_* \| wc -l` 与设计算例数对比 |
| 结论对区间敏感 | 区间覆盖了流态转变，两端物理机制不同 | 把区间缩到转变点一侧重新扫描 |

## 一次灵敏度核算

在 81 个算例的扫描中，四个因素对 $C_d$ 的对数灵敏度分别为 $S_U = -0.141$、$S_D = -0.31$、$S_{\nu} = 0.028$、$S_{L_z} = -1.02$。$S_{\nu}$ 只有 0.028，意味着黏度变化 10% 只带来 0.28% 的阻力变化，低于单点 0.21% 的不确定度乘 5 的判据（1.05%），因此这个因素在当前区间内不可分辨，应从主效应清单里剔除。

剩下三个因素的灵敏度绝对值排序为 $L_z$、$D$、$U$。但 $S_{L_z} \approx -1$ 是归一化引入的，参考面积 $A_{\mathrm{ref}} = DL_z$ 已含 $L_z$，实际单位展长阻力与 $L_z$ 无关，这一项不应进入优化。剔除后真正需要加密的只有 $D$ 与 $U$ 两个因素，后续响应面设计的规模从 15 个点降到 6 个点。

## 参考文献

1. Saltelli A., Ratto M., Andres T., Campolongo F., Cariboni J., Gatelli D., Saisana M., Tarantola S. Global Sensitivity Analysis: The Primer. Wiley, 2008.
2. Sobol I. M. Sensitivity estimates for nonlinear mathematical models. Mathematical Modelling and Computational Experiments, 1(4):407–414, 1993.
3. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa Publishers, Albuquerque, 1998.
4. Celik I. B., Ghia U., Roache P. J., Freitas C. J., Coleman H., Raad P. E. Procedure for estimation and reporting of uncertainty due to discretization in CFD applications. ASME Journal of Fluids Engineering, 130(7):078001, 2008.
5. Montgomery D. C. Design and Analysis of Experiments, 10th ed. Wiley, 2019.
6. Oberkampf W. L., Roy C. J. Verification and Validation in Scientific Computing. Cambridge University Press, 2010.
