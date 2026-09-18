---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-automation-reproducibility
title: OpenFOAM 脚本化、日志、续算与可复现案例
summary: 建立 Allrun/Allclean 风格的幂等流程，讲清阶段划分、独立日志、退出检查、续算语义、防覆盖与环境归档，并给出可直接抄用的脚本模板，使本地、容器与集群案例稳定复现。
category: { slug: openfoam-running-automation, name: OpenFOAM 运行与自动化 }
level: 工程
reading_minutes: 13
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, Allrun, 自动化, 日志, 续算, 可复现]
seo:
  title: OpenFOAM 自动化、脚本化与可复现计算
  description: 用幂等脚本、独立日志、续算检查和环境清单构建可审计案例。
  keywords: [OpenFOAM Allrun, automation, reproducibility, restart]
---

# OpenFOAM 脚本化、日志、续算与可复现案例

脚本化与可复现，是把 OpenFOAM 从“能跑一次”变成“能被信任”的关键一步。把多条命令堆进一个文件并不等于可复现：真正的可复现要求输入相同、环境相同则输出相同，并且任何关键步骤失败都要立刻停止，而不是带着半成品继续往下跑。一个缺少退出检查、日志混写、随手覆盖旧结果的脚本，短期内省了几行代码，长期却会让结果无法审计、无法交接、无法重跑。本文把脚本拆成幂等阶段，给出可抄用的 Allrun/Allclean 模板与续算做法，并附上排查清单。

## 1. 结论与适用场景

一句话结论：**把案例拆成幂等阶段、每阶段独立日志、失败即停、结果按运行 ID 归档**。

- 本地调参：需要快速反复跑，脚本要幂等且可续算，避免每次从零重建网格，同时要能一键清干净。
- 容器与 CI：需要固定环境与版本清单，输出哈希与日志，使结果可审计、可对比、可回退。
- 集群批量：需要分解、并行与合并的完整链条，并保留分区与恢复信息，确保续算与重跑都能对齐。
- 交付复现：需要把全部输入字典、几何哈希、软件版本与脚本一并归档，不能只交截图或单个结果文件。

适用范围是所有需要别人或未来的自己重跑一遍的案例；一次性探索可以简化，但结果一旦进入决策，就应升级为可复现流程。可复现的判定标准很朴素：换一台机器、换一个时间点，用归档的输入与清单，能否得到一致的结果，并能解释任何差异。

需要提醒的是，可复现不等于“结果与上次一模一样”。并行求解与浮点运算会带来微小扰动，真正要保证的是：输入与环境可追溯、关键步骤可重演、差异可解释。做到这三点，即使数值上有末位差异，结论仍然可信；反之，即使某次结果恰好一致，也无法作为工程依据。

## 2. 背景与原理

### 2.1 幂等与确定性

一个阶段是幂等的，当重复执行不改变最终状态：

$$
f\big(f(x)\big) = f(x)
$$

例如“先删旧网格再生成”就比“直接生成”更接近幂等，因为后者可能把新网格叠在旧结果上。确定性指给定相同输入 $I$ 与环境 $E$，求解器输出 $O$ 唯一：

$$
\mathcal{S}(I, E) = O,\qquad I_1 = I_2,\ E_1 = E_2 \;\Rightarrow\; O_1 = O_2
$$

并行分解、随机种子与浮点归约顺序都可能破坏严格确定性，因此必须记录进程数与分区方式，必要时固定分区以避免结果抖动。实践中常见的做法是：把用于正式交付的运行固定在同一进程数与同一分区字典下，先做一次并行无关性检查，确认结论对进程数不敏感后，再锁死配置。检查的常用办法是同一配置连跑两次，比较关键监控量的相对偏差，若明显大于预期，就说明并行分解或随机项引入了不可忽略的抖动。

### 2.2 续算的语义

续算从最新时间目录继续。收敛判据常用归一化残差

$$
R_k = \frac{\|\mathbf b - \mathbf A\,\mathbf x_k\|}{\|\mathbf b\|} < \epsilon
$$

续算前后应保持求解器、格式、松弛与并行分区一致，否则相当于换了模型；物理或网格一变，就应视为新运行，而不是延续旧基线。续算前还要确认最新时间目录完整，避免从半写状态启动。此外，续算会继承上一阶段的收敛历史，因此残差曲线会出现“断点”，这属正常现象；关键是断开前后目标量与监控量应保持连续，若出现台阶式跳变，就要追查是否无意中改了设置。

### 2.3 归档与校验

对输入集合计算校验和，可快速判断两次运行是否同源：

$$
H = \mathrm{SHA256}(\text{inputs})
$$

$H$ 相同且环境清单相同，才允许声称这是同一个算例。校验和还能在排查时快速定位“到底哪版字典被改了”。在归档脚本里，可以自动对 system、constant 与 0 目录计算哈希并写入清单，使每次运行都能快速判断是否同源。

## 3. 关键配置与公式

把上面几条原则落到脚本层面，就是以下约束：

- **退出码检查**：脚本开头 `set -eu`，失败即停，杜绝“带病继续”。
- **独立日志**：每阶段写 log.blockMesh、log.checkMesh、log.solver 等，出错时能直接定位阶段。
- **完成标记**：全部成功后写 .done 或 RESULTS.md，作为下游流程的判断依据。
- **防覆盖**：生成前检查目标是否存在，正式结果写到带运行 ID 或时间戳的目录。
- **环境快照**：记录 OpenFOAM 版本、编译器、MPI、进程数与主机名。
- **续算一致性**：保留 decomposeParDict、边界与物性文件，续算前核对 startFrom 与分区。

这些约束并非形式主义：每一条都对应一种实际会发生的错。退出码检查对应静默失败，独立日志对应定位困难，完成标记对应“不知道跑到哪了”，防覆盖对应数据被覆盖且无痕。把这些写成固定模板并让每个案例继承，比每次临时拼命令要可靠得多。从可操作性看，脚本应做到“三步走”：清理与生成网格、初始化与求解、后处理与归档；每一步都能单独重跑，且只依赖前一步的产物，这样既能局部调试，也能整体复现。

## 4. 工程做法与参数

- Allrun 用 `set -eu`，并用 `cd "${0%/*}"` 保证无论在哪个目录调用都在案例目录执行，避免相对路径错乱。
- 网格与场生成前先清理，避免旧结果混入；清理只针对案例内明确路径，绝不使用指向家目录或系统目录的通配符。
- 求解阶段封装“检查退出码加独立日志”的逻辑，并行统一走 `mpirun -np N`，并把进程数写进环境快照。
- 续算用 `startFrom latestTime;`，并行案例续算前用 `decomposePar -latestTime` 并保持一致分区。
- 正式结果写入带运行 ID 或时间戳的目录，不覆盖已验收数据；临时试算可以放在单独目录，方便随时丢弃。
- 归档清单：字典、log.*、checkMesh 统计、监控量、版本清单与脚本本身。
- 大体积瞬态目录可按策略精简，但必须保留重启动点与关键时间点，不能只留截图。
- **目录与命名**：案例起始时间目录、processor 目录与后处理目录要清晰区分，正式结果与试算结果分开存放，避免同名覆盖。
- **版本控制**：把字典与脚本纳入 git 管理，用标签标记进入验收的版本，并让运行目录记录对应的提交哈希。
- **最小依赖**：脚本只依赖案例目录与环境变量，不依赖调用者的当前目录或本机特有路径。

## 5. 可复现示例

一个最小但完整的 Allrun，幂等执行、失败即停：

```bash
#!/bin/sh
# Allrun
set -eu
cd "${0%/*}"                                  # 始终在案例目录执行

echo "OpenFOAM=${WM_PROJECT_VERSION:-?} host=$(hostname) date=$(date -Is)"
NP=${NP:-4}

# 1. 幂等清理（只清案例内明确路径）
[ -d constant/polyMesh ] && rm -rf constant/polyMesh
rm -rf .done log.*

# 2. 网格与检查
blockMesh      > log.blockMesh 2>&1
checkMesh      > log.checkMesh 2>&1
grep -q "Mesh OK" log.checkMesh || { echo "checkMesh failed"; exit 1; }

# 3. 初始化（按需）
[ -f system/setFieldsDict ] && setFields > log.setFields 2>&1

# 4. 并行求解
decomposePar   > log.decomposePar 2>&1
mpirun -np "$NP" solver -parallel > log.solver 2>&1
grep -qi "FOAM FATAL ERROR" log.solver && { echo "solver failed"; exit 1; }

# 5. 后处理与完成标记
reconstructPar -latestTime > log.reconstructPar 2>&1
postProcess -func yPlus -latestTime > log.postProcess 2>&1
touch .done
```

配套的 Allclean 只删案例内产物：

```bash
#!/bin/sh
# Allclean
set -eu
cd "${0%/*}"
rm -rf constant/polyMesh constant/extendedFeatureEdgeMesh
rm -rf [0-9]*/ processor*/ postProcessing/ log.* .done
```

续算脚本，保持一致分区与物理：

```bash
#!/bin/sh
# 从最新时间续算
set -eu
cd "${0%/*}"
[ -d processor0 ] || decomposePar -latestTime
mpirun -np "${NP:-4}" solver -parallel > log.solver.cont 2>&1
reconstructPar -latestTime
```

使用续算脚本前，务必确认最新时间目录完整、startFrom 设为 latestTime、且分区与物性文件自上次运行以来未被改动。任何一项不满足，就应当作新运行处理，并在日志里显式记录切换原因，以免把两次不同配置的结果混在一张图里。

## 6. 常见坑与排查

- **不带 set -e**：中间步骤失败仍继续，产出看似成功的残缺结果；应显式检查退出码或扫描 fatal error。
- **清理越界**：Allclean 用宽泛通配符可能删掉非案例文件，清理必须限定到案例内明确路径。
- **日志混写**：所有输出重定向到同一个日志，出错时无法定位阶段，应按阶段分离并保留时间戳。
- **续算 startFrom 错**：仍用 startTime 会从零重跑，用 latestTime 才能续算，二者语义完全不同。
- **分区不一致**：续算前后进程数或分区字典变化，会导致场映射错误或结果跳变。
- **静默覆盖**：新结果写进旧目录，把已验收数据覆盖且无痕，必须用运行 ID 目录隔离。
- **缺环境清单**：换了 MPI 或编译选项后结果不可比，却没有任何记录，排查会非常困难。
- **只归档截图**：没有字典与日志，别人既无法复现也无法审计，也无法判断结论对参数的敏感性。
- **忽略磁盘与配额**：瞬态案例时间目录迅速膨胀，应设置合理的写出间隔与保留策略，避免磁盘写满导致求解中断。
- **依赖隐式路径**：脚本里直接写死本机绝对路径，换机器就失效，应使用相对于案例根目录的路径与 `$FOAM_*` 环境变量。

## 7. 检查清单与参考

- [ ] 脚本 `set -eu` 且定位到案例目录执行；
- [ ] 每阶段独立日志、检查退出码、失败即停；
- [ ] 清理与生成均幂等，目标路径限定在案例内；
- [ ] 正式结果写入运行 ID 或时间戳目录，不覆盖已验收数据；
- [ ] 续算前后求解器、格式、分区与物性一致，`startFrom latestTime`；
- [ ] 归档包含全部字典、日志、版本清单、脚本与网格统计；
- [ ] 运行目录记录了对应的软件版本与提交哈希，可追溯到具体输入；
- [ ] 同一配置连跑两次，关键监控量偏差在可接受范围内。

参考：

1. OpenFOAM User Guide，Running Applications 与 Parallel 章节。
2. 当前发行版 tutorials 中各案例的 Allrun/Allclean 实现。
3. Sandve G. et al., “Ten Simple Rules for Reproducible Computational Research,” PLoS Comput Biol, 2013.
