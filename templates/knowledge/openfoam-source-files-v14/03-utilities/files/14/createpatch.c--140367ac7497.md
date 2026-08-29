---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-140367ac7497"
title: "OpenFOAM 14 源码解析：createPatch.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `createPatch` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/mesh/manipulation/createPatch/createPatch.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：createPatch.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/mesh/manipulation/createPatch/createPatch.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：817 行
- 文件标识：`140367ac7497`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `createPatch` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Utility to create patches out of selected boundary faces. Faces come either from existing patches or from a faceSet. More specifically it: - Creates new patches from selected boundary faces - Synchronises faces on coupled patches - Synchronises points on coupled patches (optional) - Removes non-constraint patches with no faces

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `changePatchID` | 61 |
| `filterPatches` | 83 |
| `writeCyclicMatchObjs` | 179 |
| `syncPoints` | 246 |
| `main` | 450 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
7. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
8. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
9. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`cyclicPolyPatch.H`](../../../04-core-runtime/files/9f/cyclicpolypatch.h--9f84126e18a8.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`SortableList.H`](../../../04-core-runtime/files/67/sortablelist.h--6730cee0ba96.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`zoneGenerator.H`](../../../04-core-runtime/files/c9/zonegenerator.h--c986c3931b21.md)
- [`faceSet.H`](../../../07-mesh-geometry/files/f3/faceset.h--f3dc94c0b8ee.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`systemDict.H`](../../../04-core-runtime/files/d7/systemdict.h--d7ccc894ace7.md)
- [`addNoOverwriteOption.H`](../../../04-core-runtime/files/d0/addnooverwriteoption.h--d0a24e2e4479.md)
- [`addMeshOption.H`](../../../04-core-runtime/files/48/addmeshoption.h--48b8995f1bc8.md)
- [`addRegionOption.H`](../../../04-core-runtime/files/66/addregionoption.h--664ec312024d.md)
- [`addDictOption.H`](../../../04-core-runtime/files/53/adddictoption.h--5314493217c1.md)
- [`setRootCaseNoFunctionObjects.H`](../../../04-core-runtime/files/35/setrootcasenofunctionobjects.h--35560131a2b9.md)
- [`createTimeNoFunctionObjects.H`](../../../04-core-runtime/files/d6/createtimenofunctionobjects.h--d6a6b5bb62ad.md)
- [`setNoOverwrite.H`](../../../04-core-runtime/files/f5/setnooverwrite.h--f5704f71f9f2.md)
- [`createSpecifiedPolyMesh.H`](../../../04-core-runtime/files/a1/createspecifiedpolymesh.h--a156c36b0343.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
