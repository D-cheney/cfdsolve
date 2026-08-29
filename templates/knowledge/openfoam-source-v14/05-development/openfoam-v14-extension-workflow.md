---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-extension-workflow
title: OpenFOAM 14 自定义模型、边界、功能对象与 solver 模块开发
summary: 按扩展需求选择派生模型、fvPatchField、functionObject、fvModel 或 solver 模块，给出接口继承、运行时注册、wmake、字典设计和最小测试案例的完整流程。
category: { slug: openfoam-v14-development, name: OpenFOAM 14 二次开发 }
level: 专题
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, 二次开发, fvPatchField, functionObject, solver模块]
---

# OpenFOAM 14 自定义模型、边界、功能对象与 solver 模块开发

先选择最小扩展层：新的闭合关系应派生模型，新边界数学关系派生 patch field，体源用 fvModel，后处理用 functionObject，只有方程和生命周期显著变化时才新增 solver 模块。

## 1. 标准步骤

1. 找到 OpenFOAM 14 中最接近的具体类与公共基类；
2. 写清数学公式、输入量纲、适用范围和退化极限；
3. 复制最小接口骨架，使用独立命名空间和类型名；
4. 实现构造、read、核心计算及必要的 mapping/write；
5. 注册到正确运行时选择表；
6. 配置 `Make/files`、`Make/options` 并编译用户库；
7. 用 `libs` 或 solver loader 加载；
8. 建立解析解/极限解、串并行和重启测试。

## 2. 边界与网格变化

自定义 patch field 要区分值更新与矩阵系数，避免在一次求解中重复更新；还应实现 clone、映射和写出。涉及动态网格时测试拓扑映射后内部数据是否仍有效。

## 3. 字典合同

所有必需/可选项应有量纲、默认值、范围和错误信息。OpenFOAM 14 已强化命名量纲与单位支持，新代码不应绕过 dimensionSet 检查。

## 4. 参考源码

1. `etc/codeTemplates/`。
2. `src/finiteVolume/fields/fvPatchFields/`、`src/fvModels/`。
3. `applications/modules/` 与各自 `Make/`。

