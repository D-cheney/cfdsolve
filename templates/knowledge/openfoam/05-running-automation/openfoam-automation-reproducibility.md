---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-automation-reproducibility
title: OpenFOAM 脚本化、日志、续算与可复现案例
summary: 建立 Allrun/Allclean 风格的幂等流程，说明日志分离、退出检查、续算、防覆盖和输入归档，使本地、容器与集群案例能够稳定复现。
category: { slug: openfoam-running-automation, name: OpenFOAM 运行与自动化 }
level: 工程
reading_minutes: 13
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, Allrun, 自动化, 日志, 续算, 可复现]
seo:
  title: OpenFOAM 自动化与可复现计算
  description: 用幂等脚本、独立日志、续算检查和环境清单构建可审计案例。
  keywords: [OpenFOAM Allrun, automation, reproducibility]
---

# OpenFOAM 脚本化、日志、续算与可复现案例

可靠脚本应在输入相同的条件下产生可追踪结果，并在任何关键步骤失败时停止。仅把多条命令写进一个文件并不等于可复现。

## 1. 阶段划分

将几何检查、网格生成、初始化、求解、后处理和归档拆成明确阶段，每阶段写独立日志。脚本开始时打印发行版、主机、日期、进程数和案例路径，并检查必需文件。

## 2. 幂等与防覆盖

重复执行不应悄悄混合旧结果。生成网格或场之前检查目标是否已存在；清理必须限定到案例内明确路径。正式结果采用运行 ID 或时间戳目录，不覆盖已验收数据。

## 3. 失败检测

检查命令退出码，并扫描浮点异常、fatal error、发散和异常结束。日志文件名应与步骤对应，如 `log.blockMesh`、`log.checkMesh`、`log.solver`。成功结束后再生成完成标记。

## 4. 续算

续算前确认最新时间目录完整、`startFrom` 语义正确、并行分区一致且边界/物性未被未经记录地修改。变更物理或网格后应视为新运行，而不是延续原基线。

## 5. 最小归档

保存全部输入字典、几何哈希、网格统计、软件版本、环境加载方式、脚本、日志、监控量和关键后处理定义。大体积时间目录可按策略精简，但不能只保留截图。

## 6. 参考资料

1. 当前发行版 tutorials 中的 Allrun 示例。

