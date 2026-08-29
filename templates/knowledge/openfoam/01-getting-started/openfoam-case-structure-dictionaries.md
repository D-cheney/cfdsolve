---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-case-structure-dictionaries
title: OpenFOAM 案例目录、字典语法与标准工作流
summary: 解释 system、constant、初始时间目录的职责，梳理 OpenFOAM 字典、量纲和 include 机制，并给出从复制模板到归档结果的标准案例流程。
category: { slug: openfoam-getting-started, name: OpenFOAM 入门与案例组织 }
level: 入门
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, case, 字典, controlDict, 量纲]
seo:
  title: OpenFOAM 案例结构与字典语法
  description: 掌握 system、constant、0 目录和 OpenFOAM 字典的职责与检查顺序。
  keywords: [OpenFOAM case, controlDict, fvSchemes, fvSolution]
---

# OpenFOAM 案例目录、字典语法与标准工作流

一个可运行案例通常由 `system/`、`constant/` 和初始时间目录（常为 `0/`）组成。理解文件职责比记忆命令更重要。

## 1. 三类核心目录

- `system/controlDict`：应用、起止时间、写出间隔、数据格式与运行时功能对象；
- `system/fvSchemes`：梯度、散度、拉普拉斯和时间项等离散格式；
- `system/fvSolution`：线性求解器、松弛、压力—速度耦合和算法控制；
- `constant/`：网格、多区域、物性和湍流等在时间推进中相对固定的信息；
- `0/`：各求解场的初值和边界条件。

实际文件名会随发行版与求解器变化，必须从本版本配套教程起步。

## 2. 字典与量纲

字典以关键字和值组成，以分号结束；列表、子字典和宏展开支持复用。物理量常写成“七个 SI 基本量指数 + 数值”，例如运动黏度的量纲为 `[0 2 -1 0 0 0 0]`。量纲报错应修正模型或输入，不能通过删除量纲信息绕过。

`#include` 和 `#includeIfPresent` 可减少重复，但会增加追踪难度。归档时必须连同被包含文件一起保存，并避免依赖项目目录之外的个人路径。

## 3. 标准工作流

1. 从同版本、同物理类型的官方教程复制案例；
2. 先改几何、单位与网格，再运行 `checkMesh`；
3. 设置物性、初始场和边界条件；
4. 选择保守数值格式和较小时间步完成基线计算；
5. 同时监控残差、守恒和工程量；
6. 做网格、时间步和模型敏感性分析；
7. 归档输入字典、日志、版本和后处理定义。

## 4. 修改检查顺序

每次只改变一类因素，并保留变更记录。若同时修改网格、湍流模型和离散格式，即使结果改善也无法判断原因。

## 5. 参考资料

1. OpenFOAM User Guide, Case Structure and File Format。
2. Greenshields & Weller, *Notes on Computational Fluid Dynamics*。

