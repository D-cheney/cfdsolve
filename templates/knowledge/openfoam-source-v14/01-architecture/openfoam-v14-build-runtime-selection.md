---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-build-runtime-selection
title: OpenFOAM 14 wmake、库依赖与运行时选择机制
summary: 解析 Make/files、Make/options、wmake 依赖扫描和动态库加载，并说明 TypeName、选择表与 New 工厂怎样把字典中的字符串映射为求解器和模型对象。
category: { slug: openfoam-v14-architecture, name: OpenFOAM 14 源码架构 }
level: 进阶
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, wmake, runTimeSelectionTable, 动态库, 工厂模式]
---

# OpenFOAM 14 wmake、库依赖与运行时选择机制

OpenFOAM 将稳定接口编译成库，把具体模型注册到运行时选择表；用户通过字典选择类型，无需重新编译主求解器。

## 1. 构建链

`Make/files` 列出源文件和产物，`Make/options` 提供包含路径与链接库。`wmake` 扫描依赖、编译对象并链接到平台相关目录。读取一个模块时先看这两个文件，可立即知道它依赖哪些库。

## 2. 运行时工厂

典型链条是：基类声明选择表 → 具体类声明 `TypeName` → 注册宏把构造函数加入表 → `Base::New(dictionary...)` 读取类型字符串并查表 → 返回 `autoPtr<Base>`。找不到类型时错误信息会列出已注册项。

`foamRun` 还先调用 `solver::load(solverName)` 动态加载对应 solver 库，再通过 `solver::New(solverName, mesh)` 实例化。这解释了为什么仅修改 `controlDict` 就能更换模块。

## 3. 所有权

`autoPtr` 表达唯一所有权，`tmp<Field>` 管理表达式临时对象并减少深拷贝，引用通常指向 registry 或拥有者中的长期对象。二次开发必须先确定对象由谁创建、何时销毁。

## 4. 排错

“unknown type”依次检查：库是否编译、是否被链接/加载、注册宏是否进入该库、字典类型名是否等于 `TypeName`、ABI 是否属于同一版本。

## 5. 参考源码

1. `wmake/`、各模块 `Make/files` 与 `Make/options`。
2. `src/OpenFOAM/db/runTimeSelection/construction/runTimeSelectionTables.H`。
3. `src/OpenFOAM/memory/autoPtr/`、`src/OpenFOAM/memory/tmp/`。

