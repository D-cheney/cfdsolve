---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-fmi-cosimulation
title: Modelica FMI 导出、模型交换与联合仿真
summary: 区分 FMI Model Exchange 与 Co-Simulation，覆盖 FMU 接口、参数、状态、事件、通信步长、直接馈通、平台依赖和导入导出验证清单。
category: { slug: modelica-integration, name: Modelica 集成与联合仿真 }
level: 专题
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, FMI, FMU, Model Exchange, Co-Simulation]
seo:
  title: Modelica FMI 与 FMU 联合仿真
  description: 选择 Model Exchange 或 Co-Simulation，设计 FMU 接口并验证步长、事件和平台兼容性。
  keywords: [FMI, FMU, Modelica co-simulation]
---

# Modelica FMI 导出、模型交换与联合仿真

FMU 是标准化交换包，但“成功导入”不代表数值语义和结果一致。FMI 标准版本、接口类型、平台二进制和工具支持必须同时匹配。

## 1. 两类接口

Model Exchange 由主控方提供积分器并处理事件；Co-Simulation FMU 内含或管理自己的求解器，主控方按通信点交换变量。前者耦合更紧，后者封装更完整但有通信误差。

## 2. 接口设计

只暴露稳定、带单位和明确因果性的变量；区分参数、输入、输出和状态。记录初始值、可调性、数值范围、采样率与符号约定。避免通过大量内部变量泄露实现细节。

## 3. 通信步长

步长必须解析最快的跨组件动态和离散事件。显式松耦合在强反馈系统中可能不稳定；需要减小通信步长、迭代耦合、外推改进或重新划分系统边界。

## 4. 验证流程

1. 在导出工具内保存基准输入输出；
2. 用最小主控程序导入 FMU；
3. 比较初始化值、事件时刻和关键轨迹；
4. 做通信步长敏感性；
5. 测试参数修改、重置和异常输入；
6. 记录 FMI 版本、生成工具、平台和二进制依赖。

## 5. 常见风险

代数环、直接馈通、不同事件容差、缺少回滚能力、平台库不兼容和许可证依赖都可能导致迁移失败。

## 6. 参考资料

1. Modelica Association Project FMI, FMI Standard and Implementers Guide。

