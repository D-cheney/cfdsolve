# Modelica 独立知识库

本目录是一套独立、可批量导入的 Modelica 中文知识库。文章 slug 统一以 `modelica-kb-` 开头，因此不会覆盖仓库中已有的 4 篇 Modelica 概览文章。

> Modelica 是语言标准，Modelica Standard Library（MSL）是标准库，OpenModelica、Dymola 等是实现工具。三者版本相互独立。本文库讲解通用方法；工具命令、求解器选项、FMI 支持范围和库兼容性必须以实际环境为准。

## 功能分类

| 分类 | 解决的问题 | 文章 |
|---|---|---|
| 01 语言基础 | 方程语义、类型单位、数组、函数与算法 | [索引](01-language/README.md) |
| 02 组件与复用 | 连接器、层次组合、继承、replaceable/redeclare | [索引](02-components-reuse/README.md) |
| 03 动态与初始化 | DAE、初始方程、事件、离散状态机 | [索引](03-dynamics-events/README.md) |
| 04 物理域建模 | 热、流体、机械、电气与控制的接口和守恒 | [索引](04-physical-domains/README.md) |
| 05 仿真与质量 | 实验设置、求解器、结构诊断、性能和可复现 | [索引](05-simulation-quality/README.md) |
| 06 集成与联合仿真 | FMI、外部代码、系统与 CFD 降阶耦合 | [索引](06-integration/README.md) |

## 推荐路线

1. 语言入门：01 → 02 → 03 → 05；
2. 热流体系统：01 → 02 → 04 → 03 → 05；
3. 控制系统：01 → 02 → 03 → 04 → 05；
4. 联合仿真：先完成可独立验证的组件和系统，再进入 06。

## 校验与导入

```powershell
npm run knowledge:validate -- templates\knowledge\modelica
npm run knowledge:import -- templates\knowledge\modelica
```

