---
template_version: "flowlab-knowledge/1.0"
slug: force-coefficients-reporting
title: 力系数、时间平均与 CFD 可复现报告
summary: 说明压力力、黏性力、升阻力系数的参考量与坐标定义，给出瞬态平均、频谱、峰值和完整仿真报告的最低记录项。
category:
  slug: verification-validation
  name: 验证确认与后处理
level: 工程
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [升力系数, 阻力系数, 时间平均, 频谱, 可复现性]
seo:
  title: CFD 力系数与可复现报告｜流研工坊
  description: 定义一致的升阻力系数、统计窗口和频谱，并形成可复现 CFD 报告。
  keywords: [升力系数, 阻力系数, CFD 后处理, 时间平均]
---

# 力系数、时间平均与 CFD 可复现报告

无量纲系数只有在参考密度、速度、面积、长度和方向一致时才能比较。后处理定义应在计算前固定，并在所有网格和工况中复用。

## 1. 力与系数

```text
CD = D / (0.5 ρref Uref² Aref)
CL = L / (0.5 ρref Uref² Aref)
```

总力由压力与黏性贡献组成。明确积分表面、坐标系、升力/阻力方向和力矩中心。旋转机械还需说明转矩和功率的正方向。

## 2. 参考量

外流常用来流状态，内流可能使用入口或质量平均状态。可压缩流参考密度和速度必须与实验定义一致。面积是迎风投影、翼面积还是湿表面积也要写清楚。

## 3. 瞬态统计

丢弃初始过渡后，在固定窗口计算均值、RMS、极值和置信区间。周期问题覆盖足够周期；非周期湍流检查分段统计稳定性。频谱要记录采样频率、窗口、长度和频率分辨率。

## 4. 可复现报告

至少记录几何版本、网格、材料、模型、边界、初始场、离散格式、时间步、收敛标准、软件版本、目标量定义和验证数据。图表轴应包含变量、单位和统计方式。

## 5. 结果归档

保存输入文件、求解日志、关键监控历史、后处理脚本和机器可读表格。云图用于解释空间结构，不能替代数值表和不确定度说明。

## 6. 参考资料

1. ASME V&V 20, *Standard for Verification and Validation in CFD and Heat Transfer*.
2. Oberkampf & Roy, *Verification and Validation in Scientific Computing*.

