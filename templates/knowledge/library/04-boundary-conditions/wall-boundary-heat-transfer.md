---
template_version: "flowlab-knowledge/1.0"
slug: wall-boundary-heat-transfer
title: CFD 壁面运动、粗糙度与热边界条件
summary: 说明无滑移、移动壁面、旋转参考系、粗糙度以及恒温、热流、对流和共轭传热边界的选择与单位检查。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 工程
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [壁面边界, 移动壁面, 粗糙度, 热流, 共轭传热]
seo:
  title: CFD 壁面与热边界条件设置｜流研工坊
  description: 正确设置静止或运动壁面、粗糙度、恒温、热流和共轭传热条件。
  keywords: [CFD 壁面条件, 恒温壁面, 热流边界, 移动壁面]
---

# CFD 壁面运动、粗糙度与热边界条件

壁面同时控制动量和能量交换。即使关注压降，也不能忽略壁面运动、粗糙度与参考系；传热问题还需明确热量如何穿过壁面。

## 1. 动量条件

黏性流中常用无滑移条件，流体在壁面处的切向速度等于壁面速度。移动带、旋转壁和滑移网格要明确速度相对哪个参考系定义。对称面不是“无摩擦壁”，两者的法向约束不同。

## 2. 粗糙度

粗糙度高度和常数应与所用壁函数模型匹配。几何上已解析的大粗糙结构不应再重复施加等效粗糙度。应检查无量纲粗糙高度和适用范围。

## 3. 热边界类型

- 绝热：法向热流为零；
- 恒温：给定壁面温度；
- 给定热流：规定 W/m² 及符号方向；
- 对流换热：需要环境温度和换热系数；
- 共轭传热：显式求解固体导热与流体对流。

## 4. 一致性检查

给定总功率时要除以正确受热面积。薄壁模型需检查厚度和导热系数。接触热阻、辐射和温度相关物性可能与壁面热流同量级，不能在高温问题中随意省略。

## 5. 结果验证

积分壁面剪切、热流和功率，检查与外部输入及能量收支一致。比较壁温、热流密度和换热系数分布，不要仅报告最高温度。

## 6. 参考资料

1. Incropera et al., *Fundamentals of Heat and Mass Transfer*.
2. Schlichting & Gersten, *Boundary-Layer Theory*.

