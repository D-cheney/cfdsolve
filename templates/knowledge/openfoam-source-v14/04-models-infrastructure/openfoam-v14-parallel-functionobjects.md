---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-parallel-functionobjects
title: OpenFOAM 14 并行通信、functionObjects 与结果写出
summary: 解释域分解后的 processor patch、Pstream 集体通信和全局归约，并梳理 functionObject 生命周期、对象注册表查找、并行统计与写出流程。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 工程
reading_minutes: 21
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, Pstream, MPI, functionObject, 并行归约]
---

# OpenFOAM 14 并行通信、functionObjects 与结果写出

并行运行把网格分成子域，内部跨子域面转为 processor patch。有限体积接口层负责交换 neighbour 值，核心离散代码仍按面耦合工作。

## 1. 通信层

`Pstream/UPstream` 封装 MPI 初始化、点对点和集体通信。全局质量流量、最大 Courant 数和残差范数需要归约：

```text
R=\sum_{r=0}^{N_p-1}R_r,\qquad
Co_{max}=\max_r(Co_{max,r})
```

二次开发中只在 master 输出不等于只在 master 计算；全局量必须先进行正确归约。

## 2. functionObject 生命周期

功能对象从 `controlDict.functions` 运行时创建，常见阶段包括读取配置、execute、write 和结束。它从 objectRegistry 按名称取得场，生成的派生场也可注册供其他功能对象使用，因此执行顺序和对象名称属于接口合同。

## 3. 并行后处理

局部积分必须按物理量采用 sum、min、max 或加权归约；采样点归属、重复 processor 面和空分区要特殊处理。结果一致性需用串行与多进程短案例回归验证。

## 4. 参考源码

1. `src/OpenFOAM/db/IOstreams/Pstreams/` 与 `src/Pstream/`。
2. `src/OpenFOAM/db/functionObjects/functionObject/`。
3. `src/functionObjects/`、`src/sampling/`。

