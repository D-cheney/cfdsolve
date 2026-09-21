---
template_version: flowlab-knowledge/1.0
slug: openfoam-run-parameter-sweeps-engineering-setup
title: 参数扫描与算例生成：工程设置与诊断验证
summary: 用全因子与响应面公式估算扫描规模，给出模板目录加 foamDictionary 注入参数的批量生成脚本、失败隔离的执行方式，以及机时与磁盘的完整预算算法。
category:
  slug: openfoam-running-automation
  name: OpenFOAM 运行与自动化
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 运行与自动化
  - 参数扫描与算例生成
  - 工程设置与参数选择
  - foamDictionary
  - 全因子设计
  - 结果诊断与可信度验证
  - 灵敏度系数
  - 网格收敛指数
seo:
  title: 参数扫描与算例生成：工程设置与诊断验证
  description: >-
    用全因子与响应面公式估算扫描规模，给出模板目录加 foamDictionary
    注入参数的批量生成脚本、失败隔离的执行方式，以及机时与磁盘的完整预算算法。
  keywords:
    - 参数扫描与算例生成
    - 工程设置与参数选择
    - foamDictionary
    - 全因子设计
    - 算例模板
    - 结果诊断与可信度验证
    - 灵敏度系数
    - 网格收敛指数
    - 响应面
---
# 参数扫描与算例生成：工程设置与诊断验证

参数扫描的失败方式很集中：规模算错导致机时不够、模板被污染导致结果不可比、某个算例静默用了默认值导致曲线出现孤立坏点。这三件事都能在生成阶段用几行脚本和两个公式避免，不必等到后处理才发现。扫描出一条曲线不等于得到一条结论。曲线里的每个点都带着自身的数值不确定度，点与点之间还可能有本不该存在的系统差异。判断扫描结果是否可用，要做三件事：把各因素的影响折算成可比的灵敏度、确认趋势幅度超过数值噪声、以及在扫描区间的两端各做一次网格细化。

## 用极端点做网格细化

全区间细化代价太高，只在扫描区间的两端各做一次网格细化即可。若两端都收敛到同一趋势方向，说明中间点也可信；若某一端加密后趋势反转，说明该端的物理状态对分辨率敏感，需要单独讨论。

网格收敛指数按 Richardson 外推给出：

$$
GCI = \frac{F_s\left|\phi_2 - \phi_1\right|/\phi_1}{r^{p} - 1}
$$

安全因子取 $F_s = 1.25$，加密比 $r = 1.5$，观测阶 $p = 2$。若粗网格 $C_d = 1.187$、细网格 $C_d = 1.179$，则 $GCI = 1.25 \times 0.008/1.187/(1.5^2-1) = 1.25 \times 0.00674/1.25 = 0.00674$，即 0.67%。这个值高于前面 0.21% 的估计，说明在扫描区间端点处网格误差比时间误差更大，最终报告的不确定度应取两者中较大者。

## 模板与参数注入

模板目录必须保持干净：不含 `processor*`、不含历史时间目录、不含 `postProcessing`。生成时整目录复制，再用字典工具改参数，而不是 `sed` 改文本。

```bash
#!/usr/bin/env bash
set -u
TPL=template
for U in 10 15 20; do
  for D in 0.08 0.10 0.12; do
    for nu in 1.5e-5 1.8e-5; do
      for Lz in 0.4 0.5 0.6;
      do
        c="run_U${U}_D${D}_nu${nu}_Lz${Lz}"
        rm -rf "$c"; cp -r "$TPL" "$c"
        foamDictionary -entry magUInf -set "$U"      "$c/system/forceCoeffs"
        foamDictionary -entry lRef     -set "$D"      "$c/system/forceCoeffs"
        foamDictionary -entry Aref     -set "$(awk -v d=$D -v l=$Lz 'BEGIN{printf "%.6f", d*l}')" \
                                       "$c/system/forceCoeffs"
        foamDictionary -entry nu       -set "$nu"     "$c/constant/transportProperties"
        foamDictionary -entry endTime  -set 40        "$c/system/controlDict"
        printf "%s\n" "$c" >> caseList.txt
      done
    done
  done
done
```

`foamDictionary -entry -set` 的语义是"存在则改、不存在则追加"，所以键名拼错不会报错，只会悄悄新增一个无效条目，算例照旧用默认值。生成后必须回读校验：

```bash
while read -r c; do
    printf "%-40s U=%s nu=%s\n" "$c" \
      "$(foamDictionary -entry magUInf -value "$c/system/forceCoeffs")" \
      "$(foamDictionary -entry nu -value "$c/constant/transportProperties")"
done < caseList.txt | tee checkParams.txt
```

## 先定扫描规模再定机器

全因子设计需要的算例数按各因素水平数连乘：

$$
N_{\mathrm{FF}} = \prod_{i=1}^{k} n_i
$$

四个因素、每个三水平时 $N_{\mathrm{FF}} = 3^4 = 81$。若只关心主效应与两两交互，响应面设计需要的点数由二次模型系数个数给出：

$$
N_{\mathrm{RSM}} = \frac{(k+1)(k+2)}{2}
$$

$k = 4$ 时 $N_{\mathrm{RSM}} = 15$，只有全因子的 18.5%。先用 15 个点拟合出各因素的显著性，再对显著因素做局部加密，比一上来铺 81 个算例省得多。

## 磁盘与机时预算

总磁盘占用按下式估：

$$
V_{\mathrm{tot}} = N_{\mathrm{case}} \times N_{\mathrm{time}} \times V_{\mathrm{snap}}
$$

单快照 $V_{\mathrm{snap}} = 32\ \mathrm{MB}$（$10^6$ 单元、$p$ 与 $U$），20 个写出时刻，81 个算例：$V_{\mathrm{tot}} = 81 \times 20 \times 32\ \mathrm{MB} = 51.8\ \mathrm{GB}$。开启 `writeCompression` 可压到 35 GB 左右，但会拖慢写出。

机时按下式估：

$$
H_{\mathrm{core}} = N_{\mathrm{case}} \times T_{\mathrm{case}} \times N_{\mathrm{proc}}
$$

单算例 16 核跑 2.5 h，则 $H_{\mathrm{core}} = 81 \times 2.5 \times 16 = 3240$ 核时。若机器有 64 核、每算例占 16 核，可并发 4 个，墙钟时间 $81 \times 2.5/4 = 50.6\ \mathrm{h}$。这个数字决定要不要降到响应面设计的 15 个点。

## 故障模式与判定试验

```bash
#!/usr/bin/env bash
set -u
while read -r c; do
    (
        cd "$c" || exit 1
        mpirun -np 16 foamRun -parallel -fileHandler collated > log.foamRun 2>&1
        echo "$c exit=$?"
    ) &
    while [ "$(jobs -r | wc -l)" -ge 4 ]; do wait -n; done
done < caseList.txt
wait
```

关键是不要在循环里用 `set -e`：单个算例发散就会终止整批。用子 shell 隔离每个算例的退出码，把 `exit=$?` 写进汇总文件，跑完统计 `grep -c "exit=0"`。并发数由 `jobs -r` 控制，不要一次铺开 81 个 MPI 作业。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 部分算例没有 log | 循环内 set -e，单例失败终止整批 | `ls run_*/log.foamRun \| wc -l` 与算例总数对比 |
| 生成目录里出现旧时间目录 | 模板被污染，或 cp 前未 rm -rf | 生成后 `ls run_U10_D0.1_nu1.5e-5` 检查时间目录 |
| 某参数在所有算例里都是默认值 | 键名拼错，foamDictionary 静默追加新条目 | 跑 checkParams.txt 回读校验 |
| 磁盘写到一半失败 | 未按 $N \times N_{\mathrm{time}} \times V$ 预估 | `du -sh run_*` 与预算对比 |
| 不同算例结果不可比 | 某算例的网格或求解器与其余不同 | 校验各算例 `checkMesh` 输出的单元数一致 |
| 模板目录出现 processor* | 在模板内直接跑了并行 | `ls -d template/processor*` |

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

## 一次灵敏度核算

在 81 个算例的扫描中，四个因素对 $C_d$ 的对数灵敏度分别为 $S_U = -0.141$、$S_D = -0.31$、$S_{\nu} = 0.028$、$S_{L_z} = -1.02$。$S_{\nu}$ 只有 0.028，意味着黏度变化 10% 只带来 0.28% 的阻力变化，低于单点 0.21% 的不确定度乘 5 的判据（1.05%），因此这个因素在当前区间内不可分辨，应从主效应清单里剔除。

剩下三个因素的灵敏度绝对值排序为 $L_z$、$D$、$U$。但 $S_{L_z} \approx -1$ 是归一化引入的，参考面积 $A_{\mathrm{ref}} = DL_z$ 已含 $L_z$，实际单位展长阻力与 $L_z$ 无关，这一项不应进入优化。剔除后真正需要加密的只有 $D$ 与 $U$ 两个因素，后续响应面设计的规模从 15 个点降到 6 个点。

## 参考资料

1. Montgomery D. C. Design and Analysis of Experiments, 10th ed. Wiley, 2019.
2. McKay M. D., Beckman R. J., Conover W. J. A comparison of three methods for selecting values of input variables in the analysis of output from a computer code. Technometrics, 21(2):239–245, 1979.
3. Saltelli A., Ratto M., Andres T., Campolongo F., Cariboni J., Gatelli D., Saisana M., Tarantola S. Global Sensitivity Analysis: The Primer. Wiley, 2008.
4. Box G. E. P., Wilson K. B. On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society B, 13(1):1–45, 1951.
5. Sobol I. M. Sensitivity estimates for nonlinear mathematical models. Mathematical Modelling and Computational Experiments, 1(4):407–414, 1993.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: Running and monitoring.
7. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa Publishers, Albuquerque, 1998.
8. Celik I. B., Ghia U., Roache P. J., Freitas C. J., Coleman H., Raad P. E. Procedure for estimation and reporting of uncertainty due to discretization in CFD applications. ASME Journal of Fluids Engineering, 130(7):078001, 2008.
9. Oberkampf W. L., Roy C. J. Verification and Validation in Scientific Computing. Cambridge University Press, 2010.
