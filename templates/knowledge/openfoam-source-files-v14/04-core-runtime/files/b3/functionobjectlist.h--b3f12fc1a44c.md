---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b3f12fc1a44c"
title: "OpenFOAM 14 源码解析：functionObjectList.H"
summary: "该文件声明或实现 `polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`、`argList`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/functionObjects/functionObjectList/functionObjectList.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：functionObjectList.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/functionObjects/functionObjectList/functionObjectList.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：209 行
- 文件标识：`b3f12fc1a44c`

## 2. 功能说明

该文件声明或实现 `polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`、`argList`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：List of function objects with start(), execute() and end() functions that is called for each object.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyTopoChangeMap` | 59 |
| `polyMeshMap` | 61 |
| `polyDistributionMap` | 62 |
| `argList` | 63 |
| `functionObjectList` | 68 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **分布式映射**：依据全局到局部寻址重排和交换数据。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`PtrList.H`](../../../04-core-runtime/files/5e/ptrlist.h--5eff5a178d1a.md)
- [`functionObject.H`](../../../04-core-runtime/files/6f/functionobject.h--6f77b47a79fa.md)
- [`SHA1Digest.H`](../../../04-core-runtime/files/e1/sha1digest.h--e1f8bea5fe08.md)
- [`includeFuncEntry.H`](../../../04-core-runtime/files/d9/includefuncentry.h--d92ed9bdef8e.md)

## 8. 直接上层引用

- [src/OpenFOAM/db/functionObjects/functionObjectList/functionObjectList.C](../../../04-core-runtime/files/24/functionobjectlist.c--243fb627f987.md)
- [src/OpenFOAM/db/Time/Time.H](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
