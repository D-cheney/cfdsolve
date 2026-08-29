---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-multiphase-lagrangian
title: OpenFOAM 14 多相、VOF、Lagrangian 与相间耦合源码体系
summary: 按界面捕捉、欧拉多相和模块化 Lagrangian 三条路线梳理 solver 模块、相系统、MULES、颗粒云和相间源项，并给出质量、动量与能量耦合的公式框架。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 专题
reading_minutes: 26
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, VOF, MULES, multiphaseEuler, Lagrangian]
---

# OpenFOAM 14 多相、VOF、Lagrangian 与相间耦合源码体系

OpenFOAM 14 的多相主线分布在 `applications/modules/*VoF`、`multiphaseEuler`、`src/multiphaseModels`、`src/twoPhaseModels` 与新 `src/Lagrangian`。

## 1. VOF

相分数满足有界输运：

```text
\frac{\partial\alpha}{\partial t}
+\nabla\cdot(\alpha\mathbf{U})
+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha,
\qquad 0\le\alpha\le1
```

MULES 负责在通量修正中兼顾守恒与有界性；混合物性和表面张力再进入动量方程。

## 2. 欧拉多相

每相具有体积分数与连续性/动量方程，相间动量交换成对出现：`M_ab=-M_ba`。phaseSystem 组织相、相对速度和交换模型，solver 模块负责耦合迭代。

## 3. Lagrangian

颗粒轨迹满足 `dx_p/dt=U_p`，动量满足：

```text
m_p\frac{d\mathbf{U}_p}{dt}=\mathbf{F}_{drag}+\mathbf{F}_{gravity}+\cdots
```

cloud 管理颗粒集合、注入、跟踪、子模型和向连续相回写的源项。OpenFOAM 14 正在推进模块化 Lagrangian，新旧 `lagrangian` 路线不能混为一套接口。

## 4. 守恒审计

追踪每个相/云向连续相添加的质量、动量、焓源，确认符号成对、时间层一致且源项线性化未重复。相分数裁剪和颗粒删除也要纳入全局平衡。

## 5. 参考源码

1. `applications/modules/incompressibleVoF/`、`multiphaseEuler/`。
2. `src/multiphaseModels/`、`src/twoPhaseModels/`、`src/Lagrangian/`。
3. `src/finiteVolume/fvMatrices/solvers/MULES/`。

