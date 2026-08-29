---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-divergence-troubleshooting
title: OpenFOAM 发散、浮点异常与结果异常排查
summary: 提供从复现首个异常时间步、定位异常字段与单元，到检查单位、边界、网格、时间步、物性和数值格式的分层排错树，避免盲目调松弛。
category: { slug: openfoam-post-troubleshooting, name: OpenFOAM 后处理与排错 }
level: 工程
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 发散, floating point exception, 排错, Courant数]
seo:
  title: OpenFOAM 发散与浮点异常排查
  description: 按物理输入、边界、网格、时间步和数值设置定位 OpenFOAM 首个异常。
  keywords: [OpenFOAM divergence, floating point exception, troubleshooting]
---

# OpenFOAM 发散、浮点异常与结果异常排查

排错目标是找到“第一个失去物理合理性的量”，而不是最后触发崩溃的方程。压力求解器报错可能源于更早的温度、密度、相分数或网格异常。

## 1. 固定复现

保留原始案例和日志，复制到诊断分支；缩短写出间隔，在首个异常前后保存场。记录版本、核数和启动命令，必要时用串行短算排除并行因素。

## 2. 排查顺序

1. 单位、量纲、坐标方向和物性数量级；
2. patch 名、压力基准、入口出口配对和回流值；
3. `checkMesh` 最差单元及其是否位于强源项区；
4. 初始场是否可实现、区域选择是否正确；
5. 最大/平均 Courant 数与局部速度热点；
6. 温度、密度、湍流量、相分数和组分的最小最大值；
7. 源项、旋转、动网格和用户代码；
8. 最后再调整格式、松弛、容差和校正次数。

## 3. 二分诊断

逐项关闭新增物理：反应、辐射、相变、源项或动网格；用较简单模型验证基础流动。一次只改一个因素，并保留成功/失败矩阵。

## 4. 临时稳定措施

减小时间步、使用有界格式、改善初值或降低松弛可帮助跨过启动阶段，但必须再恢复目标精度并做敏感性分析。长期依赖极低阶格式或强裁剪通常表示根因未解决。

## 5. “收敛但错误”

没有崩溃也可能错误。若质量不守恒、流向与压差矛盾、温度超出能量界限或结果对微小设置极敏感，应按同一流程诊断。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 User Guide、日志与源代码错误上下文。

