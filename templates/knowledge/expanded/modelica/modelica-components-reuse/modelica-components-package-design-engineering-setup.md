---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-package-design-engineering-setup
title: "包结构与版本管理：工程设置与参数选择"
summary: "包既是命名空间也是分发单元，声明顺序由 package.order 固定，版本号写在 uses 注解与包目录名里。给出三段式版本比较规则、convert 注解的触发条件、示例覆盖率下限，以及依赖冲突与顺序错乱的五类故障。"
category:
  slug: modelica-components-reuse
  name: "Modelica 组件与复用"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 组件与复用"
  - "包结构与版本管理"
  - "工程设置与参数选择"
  - "package.order"
  - "uses 注解"
seo:
  title: "包结构与版本管理：工程设置与参数选择"
  description: "包既是命名空间也是分发单元，声明顺序由 package.order 固定，版本号写在 uses 注解与包目录名里。给出三段式版本比较规则、convert 注解的触发条件、示例覆盖率下限，以及依赖冲突与顺序错乱的五类故障。"
  keywords:
    - "包结构与版本管理"
    - "工程设置与参数选择"
    - "package.order"
    - "uses 注解"
    - "版本兼容"
---

# 包结构与版本管理：工程设置与参数选择

Modelica 包既是命名空间也是分发单元，版本号写在包名与 `uses` 注解里，声明顺序写在 `package.order` 文件里。工程设置要定的四件事是：声明分几层（public/protected）、`Examples` 与 `UsersGuide` 怎么组织、版本号怎么升、以及依赖如何被工具解析。这几项在仿真上不产生任何数值差异，但决定了别人能不能在不解压整包的情况下找到入口。

## 声明顺序由 package.order 固定

工具按 `package.order` 里的顺序显示包内元素，而不是按字母序。一个可维护的顺序是：`uses` 注解与常量、`Interfaces`、`BaseClasses`、`Components`、`Sources`、`Sensors`、`Examples`、`UsersGuide`。把 `Examples` 放在末尾符合先看接口再看用法的阅读习惯；把 `Interfaces` 放在首位则保证派生类的基类总在视线内。

```modelica
package MyLib "示例库"
  annotation(uses(Modelica(version = "4.0.0")),
             version = "1.2.0", versionDate = "2026-09-20");

  package Interfaces "连接器与 partial 基类" end Interfaces;
  package Components "可实例化组件" end Components;
  package Examples "可运行示例" end Examples;
  package UsersGuide "使用说明" end UsersGuide;
end MyLib;
```

`uses` 注解只写顶层依赖，工具据此检查版本；`version` 与 `versionDate` 是包自身的标识，不含在包名里。

## public 与 protected 的分层

| 层 | 放什么 | 判断依据 |
|---|---|---|
| public | 连接器、partial 基类、可实例化组件、参数 | 用户要 extends 或实例化的元素 |
| protected | 内部辅助函数、中间变量、常量表 | 改名不影响用户模型的元素 |
| Examples | 每个组件至少一个 | 组件的验收依据 |
| UsersGuide | 版本记录、接口约定、坐标系与单位 | 新用户的第一入口 |

判断 public/protected 的实用标准：如果某个函数被用户在 `redeclare` 里引用，它必须 public；如果它只被包内组件调用，应放 protected。把内部函数暴露为 public 后，用户模型可能依赖它，后续改名就成了破坏性变更，必须走版本号升级。

## 版本号与兼容性判定

Modelica 包版本采用 major.minor.patch 三段式，比较按字典序：

$$ v_1 \succ v_2 \iff (maj_1, min_1, pat_1) >_{lex} (maj_2, min_2, pat_2) $$

`4.0.0` 与 `3.2.3` 比较，主版本 4 大于 3，故 `4.0.0` 更新；`1.2.10` 与 `1.2.9` 比较，前两段相同，补丁号 10 大于 9，故 `1.2.10` 更新。这条规则决定了工具在有多个已安装版本时选哪一个。主版本号变化意味着接口破坏，次版本号变化意味着新增兼容功能，补丁号变化只修缺陷。

## 转换注解的触发条件

当用户的模型基于旧版本编写，而工具解析到新版本时，需要 `convert` 注解完成自动改写。触发条件是旧版本落在声明区间之外：

$$ \text{convert} \iff v_{from} \notin [v_{lo},\ v_{hi}] $$

例如 `convert from (version = "1.0.0", script = "modelica://MyLib/Resources/Scripts/Convert1to2.mos")` 会在用户包声明 `uses(MyLib(version="1.0.0"))` 而实际解析到 `2.0.0` 时执行。设置要点是区间要覆盖所有已发布版本，漏掉一个版本，用户升级时会看到 no conversion found 而不是自动迁移。

## 示例覆盖率与发布核对

用示例数比组件数作为最低验收指标：

$$ C_{ex} = \frac{N_{example}}{N_{model}} $$

某库有 15 个可实例化组件、12 个示例，则 $C_{ex} = 12/15 = 0.80$。工程上可接受的下限取 0.8；低于此值说明有组件从未被端到端运行过。发布前逐项核对：`uses` 里的依赖版本与实际编译一致、`package.order` 无孤立条目、`Examples` 中每个模型都能在 60 s 内完成一次仿真、`UsersGuide` 的版本记录与 `version` 字段一致。

## 版本管理常见故障

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 version conflict for Modelica | 两个依赖要求的 MSL 版本区间不相交 | 打印各依赖的 uses 注解，取交集 |
| 工具加载后顺序与源码不同 | 缺 package.order，退回字母序 | 检查包目录下是否存在 package.order 文件 |
| 用户升级后报 no conversion found | convert 区间未覆盖其旧版本 | 列出已发布版本号，与区间端点比对 |
| 示例能跑但用户模型编译失败 | 用户依赖了被移入 protected 的接口 | 用 protected 关键字搜索近期变更 |
| 同一库两个版本被同时加载 | 包目录名未带版本号 | 目录应为 MyLib 1.2.0，且 package.mo 内 version 为 1.2.0 |

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — 包、版本与转换注解
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.UsersGuide.ReleaseNotes`. 2020.
3. Åström K.J., Elmqvist H., Mattsson S.E. Evolution of Continuous-Time Modeling and Simulation. *ESM'98*, 1998. — 模型库的演化与兼容
4. Modelica Association. *Functional Mock-up Interface Specification, Version 3.0*. 2022. — 版本与依赖声明
5. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 包与命名空间
6. Tiller M. *Introduction to Physical Modeling with Modelica*. Kluwer Academic Publishers, 2001. — 库的组织方式
