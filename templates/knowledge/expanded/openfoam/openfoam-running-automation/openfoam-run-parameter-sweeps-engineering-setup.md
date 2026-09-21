---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-parameter-sweeps-engineering-setup
title: "参数扫描与算例生成：工程设置与参数选择"
summary: "用全因子与响应面公式估算扫描规模，给出模板目录加 foamDictionary 注入参数的批量生成脚本、失败隔离的执行方式，以及机时与磁盘的完整预算算法。"
category:
  slug: openfoam-running-automation
  name: "OpenFOAM 运行与自动化"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 运行与自动化"
  - "参数扫描与算例生成"
  - "工程设置与参数选择"
  - "foamDictionary"
  - "全因子设计"
seo:
  title: "参数扫描与算例生成：工程设置与参数选择"
  description: "用全因子与响应面公式估算扫描规模，给出模板目录加 foamDictionary 注入参数的批量生成脚本、失败隔离的执行方式，以及机时与磁盘的完整预算算法。"
  keywords:
    - "参数扫描与算例生成"
    - "工程设置与参数选择"
    - "foamDictionary"
    - "全因子设计"
    - "算例模板"
---
# 参数扫描与算例生成：工程设置与参数选择

参数扫描的失败方式很集中：规模算错导致机时不够、模板被污染导致结果不可比、某个算例静默用了默认值导致曲线出现孤立坏点。这三件事都能在生成阶段用几行脚本和两个公式避免，不必等到后处理才发现。

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

## 批量执行与失败隔离

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

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 部分算例没有 log | 循环内 set -e，单例失败终止整批 | `ls run_*/log.foamRun \| wc -l` 与算例总数对比 |
| 生成目录里出现旧时间目录 | 模板被污染，或 cp 前未 rm -rf | 生成后 `ls run_U10_D0.1_nu1.5e-5` 检查时间目录 |
| 某参数在所有算例里都是默认值 | 键名拼错，foamDictionary 静默追加新条目 | 跑 checkParams.txt 回读校验 |
| 磁盘写到一半失败 | 未按 $N \times N_{\mathrm{time}} \times V$ 预估 | `du -sh run_*` 与预算对比 |
| 不同算例结果不可比 | 某算例的网格或求解器与其余不同 | 校验各算例 `checkMesh` 输出的单元数一致 |
| 模板目录出现 processor* | 在模板内直接跑了并行 | `ls -d template/processor*` |

## 参考文献

1. Montgomery D. C. Design and Analysis of Experiments, 10th ed. Wiley, 2019.
2. McKay M. D., Beckman R. J., Conover W. J. A comparison of three methods for selecting values of input variables in the analysis of output from a computer code. Technometrics, 21(2):239–245, 1979.
3. Saltelli A., Ratto M., Andres T., Campolongo F., Cariboni J., Gatelli D., Saisana M., Tarantola S. Global Sensitivity Analysis: The Primer. Wiley, 2008.
4. Box G. E. P., Wilson K. B. On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society B, 13(1):1–45, 1951.
5. Sobol I. M. Sensitivity estimates for nonlinear mathematical models. Mathematical Modelling and Computational Experiments, 1(4):407–414, 1993.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: Running and monitoring.
