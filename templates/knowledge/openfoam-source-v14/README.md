# OpenFOAM 14 源码解析知识库

本系列以 OpenFOAM Foundation 最新稳定版 **OpenFOAM 14**、补丁标签 **20260724** 为唯一基线。源码归档位于 `references/openfoam-source/OpenFOAM-14.20260724.tar.gz`，SHA-256 为 `1367D39051DF941D3A660C8C95AAED91EFA417428240D57DE9BCD42D2488C52F`；展开目录为 `references/openfoam-source/OpenFOAM-14-20260724`。

官方版本依据：OpenFOAM 14 于 2026-07-14 发布，20260724 是 2026-07-25 公布的兼容性补丁标签。`OpenFOAM-dev` 是持续开发线，不作为本系列源码依据。

## 知识地图

| 层次 | 核心问题 | 文章 |
|---|---|---|
| 01 基线与架构 | 源码怎么组织、怎么编译、对象怎么在运行时创建 | [索引](01-architecture/README.md) |
| 02 数学与离散 | 网格、场、有限体积算子、矩阵与线性求解如何对应 | [索引](02-discretization/README.md) |
| 03 求解流程 | foamRun 生命周期、不可压缩 PIMPLE、可压缩热力学 | [索引](03-solver-flow/README.md) |
| 04 物理与基础设施 | 湍流/热物性/多相、边界、源项、并行和后处理 | [索引](04-models-infrastructure/README.md) |
| 05 二次开发 | 新模型/边界/功能对象的扩展点、调试和验证 | [索引](05-development/README.md) |
| 06 逐文件参考 | 10,907 个源码/构建文件的职责、符号、依赖、算法和公式 | [逐文件源码解析](../openfoam-source-files-v14/README.md) |

## 五层阅读法

每个主题都按以下顺序追踪：

1. 数学方程与物理假设；
2. 用户字典和场文件；
3. 运行时选择得到的具体类型；
4. C++ 类与调用链；
5. 离散矩阵、求解日志和验证案例。

推荐顺序：01 → 02 → 03；再按任务进入 04，最后学习 05。文章中的路径均相对于 `OpenFOAM-14-20260724/`。

## 校验与导入

```powershell
npm run knowledge:validate -- templates\knowledge\openfoam-source-v14
npm run knowledge:import -- templates\knowledge\openfoam-source-v14

# 逐文件模块较大，建议先校验再单独导入
npm run knowledge:validate -- templates\knowledge\openfoam-source-files-v14
npm run knowledge:import -- templates\knowledge\openfoam-source-files-v14
```
