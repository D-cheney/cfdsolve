---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-parallel-decomposition
title: OpenFOAM 串并行运行、区域分解与结果重构
summary: 介绍 decomposePar、MPI 运行、负载均衡、重构与并行 I/O 的标准流程，给出从串行基准到集群扩展测试的检查和性能记录方法。
category: { slug: openfoam-running-automation, name: OpenFOAM 运行与自动化 }
level: 工程
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, MPI, decomposePar, 并行计算, 负载均衡]
seo:
  title: OpenFOAM 并行分解与运行指南
  description: 从串行基准到 MPI 分解、运行、重构和扩展效率检查。
  keywords: [OpenFOAM parallel, decomposePar, reconstructPar]
---

# OpenFOAM 串并行运行、区域分解与结果重构

并行计算首先要保证与串行结果在允许误差内一致，然后才追求加速。进程数不是越多越快，单进程单元过少时通信和 I/O 会主导。

## 1. 标准流程

```bash
decomposePar | tee log.decomposePar
mpirun -np 8 <solver> -parallel | tee log.solver
reconstructPar | tee log.reconstructPar
```

命令、MPI 启动器和重构选项依系统与版本而异。集群上应通过调度器启动，并确保请求的核数与分解数一致。

## 2. 分解策略

几何分解简单可控，图分区通常更能减少接口；多区域、旋转区、局部加密和动态网格需要关注负载是否均衡。比较每个分区的单元数、处理器边界面积和实际每步耗时。

## 3. 一致性验证

使用同一网格、字典和时间步分别运行短串行与并行案例，比较守恒、残差趋势和目标量。浮点归约顺序会造成微小差异，但不应导致宏观分叉；若差异持续放大，要检查问题敏感性和并行边界。

## 4. I/O 策略

高频写出大量小文件会压垮共享文件系统。只写必要场和时间，合理选择并行文件处理方式，并在使用前确认后处理工具兼容。重构前估算磁盘空间。

## 5. 性能报告

记录硬件、核数、MPI、单元数、每步时间、总耗时、写出频率和分解法。至少做 1、2、4、8 等核数的短扩展测试，选择总成本最低的配置。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 Parallel Running 文档。

