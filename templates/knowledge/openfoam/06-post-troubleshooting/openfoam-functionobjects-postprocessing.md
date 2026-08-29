---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-functionobjects-postprocessing
title: OpenFOAM functionObjects、采样与守恒后处理
summary: 介绍运行时和离线 functionObjects 的组织方式，覆盖力、流量、面积平均、y+、场极值和探针采样，并给出统一符号、统计窗口与守恒报告规范。
category: { slug: openfoam-post-troubleshooting, name: OpenFOAM 后处理与排错 }
level: 工程
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, functionObjects, forces, probes, 守恒, 后处理]
seo:
  title: OpenFOAM functionObjects 与工程后处理
  description: 用功能对象自动采集力、流量、y+、探针和守恒量，形成可复现报告。
  keywords: [OpenFOAM functionObjects, forces, probes]
---

# OpenFOAM functionObjects、采样与守恒后处理

后处理定义应与求解输入一起版本化。手工在 ParaView 中点击得到的结果难以批量复现，也容易因选择区域和时间窗口不同而产生偏差。

## 1. 常用功能

- `forces`/力系数：压力与黏性贡献、参考面积和方向；
- 表面积分与平均：质量流率、体积流率、温度或总压；
- `probes` 与采样线/面：时间序列和剖面；
- 场极值、体积分、残差和 y+；
- 派生场：涡量、马赫数、Q 准则等。

名称与参数随版本变化，应从本版本示例复制并核对日志。

## 2. 运行时与离线

关键监控量适合运行时计算，可及早发现异常；昂贵或探索性后处理适合离线执行。两种方式应使用同一份配置片段，避免定义漂移。

## 3. 守恒报告

统一所有 patch 的外法向符号，按质量、能量和组分列出输入、输出、源项、储存变化及相对不平衡。不要用两个大数的差而不报告各项原值。

## 4. 瞬态统计

先剔除启动段，再按物理通过时间或主周期确定采样窗口；报告均值、标准差和样本长度。周期问题至少覆盖多个稳定周期，非定常湍流还需检查统计收敛。

## 5. 可复现记录

保存 patch/zone 名、坐标系、参考值、采样频率、时间窗口和工具版本。图表轴应含单位，力系数必须说明参考面积、速度和密度。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 Function Objects 文档。

