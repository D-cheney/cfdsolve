---
template_version: "flowlab-knowledge/1.0"
slug: fem-contact-convergence
title: 有限元接触算法与收敛排查
summary: 比较罚函数、拉格朗日乘子和增广拉格朗日接触，说明接触刚度、摩擦、穿透与非线性迭代的联动关系。
category: { slug: structural-fem, name: "结构与有限元算法" }
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [有限元, 接触, 罚函数, 摩擦, 非线性收敛]
---

# 有限元接触算法与收敛排查

## 1. 接触约束与非线性来源

接触引入开闭状态和摩擦滑移，使结构方程成为非光滑非线性问题。法向间隙 $g_n$ 通常满足互补条件：接触压力只能受压，分离时接触压力为零。几何大变形、塑性与摩擦会进一步改变接触面和切线刚度。

## 2. 三类约束算法

罚函数法用接触刚度把穿透量 $g_n<0$ 转换为法向力：

$$
t_n=-k_p\langle-g_n\rangle.
$$

$k_p$ 过小会产生明显穿透，过大则恶化矩阵条件数。拉格朗日乘子法可更严格满足约束，但增加未知量并需要稳定离散；增广拉格朗日法在两者之间迭代修正接触压力。

## 3. 摩擦与正则化

库仑摩擦以 $|\mathbf{t}_t|\leq\mu |t_n|$ 限制切向牵引。粘着到滑移的切换会改变局部切线矩阵。适度正则化可改善 Newton 迭代，但正则化尺度会改变小滑移响应，必须做敏感性分析。

## 4. 收敛排查顺序

1. 核对主从面法向、初始间隙和几何重叠。
2. 先用无摩擦接触确认法向开闭和载荷路径。
3. 检查接触区网格尺度与曲面离散误差。
4. 逐步加载，并观察接触面积、最大穿透和反力平衡。
5. 再加入摩擦、材料塑性和大变形。

## 5. 结果验收

收敛报告应同时包含力残差、位移修正、接触穿透和全局反力。单一残差下降不代表接触状态已经稳定。

接触区需要单独做网格加密研究，并核对接触压力积分与全局反力。若载荷步缩小后接触面积或峰值压力持续变化，应继续检查几何离散、材料切线和接触刚度。

## 6. 参考资料

1. P. Wriggers, *Computational Contact Mechanics*, Springer.
2. T. A. Laursen, *Computational Contact and Impact Mechanics*, Springer.
