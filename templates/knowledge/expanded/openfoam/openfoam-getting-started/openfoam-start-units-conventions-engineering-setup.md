---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-units-conventions-engineering-setup
title: "单位、坐标与符号约定：工程设置与参数选择"
summary: "统一 SI 单位与右手坐标系是算例可迁移的前提：给出坐标分量顺序、重力向量的方向写法、旋转边界的轴与角速度换算、二维算例的 empty 约束，以及面法向与通量符号的约定。"
category:
  slug: openfoam-getting-started
  name: "OpenFOAM 入门与案例组织"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 入门与案例组织"
  - "单位、坐标与符号约定"
  - "工程设置与参数选择"
  - "SI 单位"
  - "旋转边界"
seo:
  title: "单位、坐标与符号约定：工程设置与参数选择"
  description: "统一 SI 单位与右手坐标系是算例可迁移的前提：给出坐标分量顺序、重力向量的方向写法、旋转边界的轴与角速度换算、二维算例的 empty 约束，以及面法向与通量符号的约定。"
  keywords:
    - "单位、坐标与符号约定"
    - "工程设置与参数选择"
    - "SI 单位"
    - "重力向量"
    - "empty 边界"
---

# 单位、坐标与符号约定：工程设置与参数选择

几何由 CAD 给出时可能以毫米为单位，转速常以 rpm 给出，重力方向取决于图纸的摆放方式。这些约定一旦在算例里不统一，求解器不会报错，只会给出量级正确但方向或倍数错误的结果。本文把单位、坐标分量、重力、旋转与二维退化这五处约定逐一定下来，并给出换算公式与字典写法。

## 内部单位只有 SI

OpenFOAM 不读单位字符串，只读数值，并按 SI 解释。长度是米、时间是秒、质量是千克、温度是开尔文、角度是弧度。因此来自工程图纸的 25 mm 必须写成 `0.025`，转速 1500 rpm 必须换算成弧度每秒：

$$
\omega = \frac{2\pi n}{60}
$$

代入 $n = 1500\ \mathrm{rpm}$ 得 $\omega = 2\pi\times 1500/60 = 157.08\ \mathrm{rad/s}$。角度同理，`rotatingWallVelocity` 的 `omega` 是弧度每秒，写成 1500 会把壁面速度放大 $60/(2\pi) = 9.549$ 倍。

温度单位尤其容易出错。以开尔文为单位的场里填 300 是常温，填 27 是液氦温区附近，两者相差一个绝对零点的偏移而非比例。凡是从摄氏度文档抄来的温度，先加 273.15 再写入。

## 右手坐标系与分量顺序

三个分量的顺序固定为 $(x, y, z)$，坐标系为右手系：$x\times y = z$。顶点、速度、力矩、重力向量全部遵循同一顺序。`blockMeshDict` 中

```cpp
vertices
(
    (0 0 0)      // 0
    (1.0 0 0)    // 1
    (1.0 0.2 0)  // 2
    (0 0.2 0)    // 3
    (0 0 0.1)    // 4
    (1.0 0 0.1)  // 5
    (1.0 0.2 0.1)// 6
    (0 0.2 0.1)  // 7
);
```

定义的是一块 $1.0\ \mathrm{m}\times 0.2\ \mathrm{m}\times 0.1\ \mathrm{m}$ 的平板通道，厚度沿 $z$。若把厚度写到 $y$ 分量上，几何形状不变但所有边界条件的方向假设都会错位——重力、入口方向、以及二维退化方向都要跟着改。

## 重力向量的方向

`constant/g` 只接受一个三分量向量，例如竖直二维通道写

```cpp
dimensions      [0 1 -2 0 0 0 0];
value           (0 -9.81 0);
```

量纲 `[0 1 -2 0 0 0 0]` 是加速度。若坐标约定是 $z$ 向上而算例照抄了 $y$ 向下的写法，浮力方向就转了 90 度，热羽流会横向发展。判定方式很直接：把 `g` 与几何的竖直方向对齐，竖直方向由入口速度向量或重力方向的物理预期决定，两者必须同向或反向，不能正交。

## 旋转边界的轴与转向

`rotatingWallVelocity` 需要 `origin`、`axis`、`omega` 三个条目，`omega` 的正负按绕 `axis` 的右手螺旋判定：

```cpp
boundaryField
{
    impeller
    {
        type        rotatingWallVelocity;
        origin      (0 0 0);
        axis        (0 0 1);
        omega       157.08;
    }
    frontAndBack
    {
        type        empty;
    }
}
```

绕 $+z$ 轴正转时，从 $+z$ 方向俯视（即沿 $-z$ 方向看）壁面作逆时针运动。半径 $R = 0.15\ \mathrm{m}$ 处的切向速度为 $U_{\text{tip}} = \omega R = 157.08\times 0.15 = 23.56\ \mathrm{m/s}$。这个值与 $347.2\ \mathrm{m/s}$ 的常温声速相比，$Ma = 23.56/347.2 = 0.0679$，仍属不可压范围；但若把 rpm 直接当 rad/s 填入，$U_{\text{tip}}$ 会变成 $225\ \mathrm{m/s}$，$Ma$ 升到 0.648，密度变化不可忽略，算例的物理假设被彻底改变。

## 二维算例的 empty 约束

`empty` 边界只对真正的二维退化面有效：该 patch 的面必须全部平行于同一坐标平面，且网格在法向上只有一层单元。退化成立的判据是厚度远小于面内尺度

$$
L_z < 10^{-2}\,\sqrt{A_{xy}}
$$

取 $L_z = 0.1\ \mathrm{m}$、面内 $1.0\ \mathrm{m}\times 0.2\ \mathrm{m}$，右端为 $10^{-2}\times\sqrt{0.2} = 4.47\times 10^{-3}\ \mathrm{m}$，左端是它的 22 倍，判据不成立。此时用 `empty` 会把真实的 0.1 m 厚度当作无限薄，引入与厚度同阶的几何误差；正确做法是按准三维处理，改用 `symmetryPlane` 或直接求解三维。只有厚度小于面内尺度的 $1\%$ 时，`empty` 的假设才可接受。二维算例中，`empty` patch 必须在每个场文件的 `boundaryField` 中显式出现，否则会报 `Cannot find patchField entry for frontAndBack`。

## 面法向与通量符号

有限体积法中的面矢量 $\mathbf A_f$ 由网格单元指向外，方向由顶点顺序决定，用户不能直接指定。由此得到的通量符号约定是：流出控制体为正。这个约定解释了为什么入口边界用 `fixedValue` 给出正速度时，质量流量在守恒核对中记为负——流入意味着面矢量与速度反向。核对质量守恒时，把 $\sum_f \rho\,\mathbf u_f\cdot\mathbf A_f$ 的符号按此约定累加，结果应等于内部质量变化率的负值；若符号相反，通常是导出面法向时用错了 patch 的方向。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面切向速度比预期大 9.549 倍 | rpm 直接当作 rad/s 填入 omega | 用 $2\pi n/60$ 重算并比对 `fieldMinMax(U)` |
| 热羽流朝水平方向发展 | `g` 向量与几何竖直方向正交 | 检查 `constant/g` 的 `value` 与入口速度向量的夹角 |
| 启动报 `Cannot find patchField entry for frontAndBack` | 场文件缺少 `empty` patch 条目 | 在每个场文件的 `boundaryField` 中补齐该 patch |
| 力矩方向与预期相反 | 角速度符号或坐标轴方向与右手螺旋约定不符 | 反转 `omega` 符号重跑，力矩符号应同步反转 |
| 二维算例结果比三维参考偏大 20% 以上 | 厚度并非远小于面内尺度，`empty` 假设失效 | 计算 $r_{\text{thin}}$，大于 $10^{-2}$ 时改用准三维设置 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Boundary conditions" and "Mesh description".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.
4. ISO, *ISO 80000-1:2009 Quantities and units — Part 1: General*, International Organization for Standardization, 2009.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
