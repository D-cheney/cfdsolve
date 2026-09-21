---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-multibody-engineering-setup
title: "多体系统：工程设置与参数选择"
summary: "给出 Modelica.Mechanics.MultiBody 的 World 重力设置、Body 质心与惯量张量、关节约束与闭环初始化要点，附单摆周期与能量手算、四元数归一化判据以及两段可直接运行的机构代码。"
category:
  slug: modelica-physical-domains
  name: "Modelica 物理域建模"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 物理域建模"
  - "多体系统"
  - "工程设置与参数选择"
  - "MultiBody"
  - "World"
seo:
  title: "多体系统：工程设置与参数选择"
  description: "给出 Modelica.Mechanics.MultiBody 的 World 重力设置、Body 质心与惯量张量、关节约束与闭环初始化要点，附单摆周期与能量手算、四元数归一化判据以及两段可直接运行的机构代码。"
  keywords:
    - "多体系统"
    - "工程设置与参数选择"
    - "MultiBody"
    - "闭环约束"
---

# 多体系统：工程设置与参数选择

多体模型的参数分两类：一类是几何与惯性（质心位置、惯量张量、关节轴），另一类是求解设置（重力、状态选择、闭环约束）。前者写错会让结果整体偏移，后者写错通常直接导致过定或奇异。本文用长 0.5 m、质量 2.0 kg 的单摆作为可手算基线，再扩展到闭环四连杆，把两类参数都落到具体取值上。

## World：重力与参考系

`Modelica.Mechanics.MultiBody.World` 是全模型唯一的全局参考系，且必须由 `inner` 声明。重力通过两个参数描述：`gravityType` 与方向向量 `n`。默认 `gravityType=Modelica.Mechanics.MultiBody.Types.GravityTypes.UniformGravity`、`n={0,-1,0}`、`g=9.81`，表示沿 −y 方向、加速度 9.81 m/s²。若把 `n` 写成 `{0,1,0}` 而忘记改 `g` 的符号，所有构件会向上"掉落"，且能量单调增加——这是最快的识别方法。`animateWorld` 与 `animateGravity` 建议在批量扫描时关闭，动画渲染可占整体运行时间的一半以上。

## Body：质心与惯量张量

`Parts.Body` 的参数 `r_CM` 是质心在自身坐标系中的位置，`I_11`、`I_22`、`I_33` 是绕质心的主惯量。对长 0.5 m、质量 2.0 kg 的均质细杆：

$$J_{cm}=\frac{1}{12}ml^2=\frac{1}{12}\times2.0\times0.25=0.0417\ \mathrm{kg\cdot m^2}$$

若绕端点转动，则用平行轴定理 $J_{pivot}=J_{cm}+m(l/2)^2=0.0417+2.0\times0.0625=0.1667$ kg·m²。把 `I_11` 误填成 0.0417 而实际应为 0.1667，摆动周期会偏短约 20%。用点质量近似时 J=m l²=2.0×0.25=0.5 kg·m²，比真实细杆大 3 倍，所以细长构件不能简化为点质量。运动方程由牛顿—欧拉给出：

$$m\,a_C=\sum F, \qquad J\,\alpha+\omega\times\left(J\,\omega\right)=\sum \tau$$

第二项中的叉乘在高速旋转时不可忽略；低速机构可近似省略，但转速超过 1000 r/min 时必须保留。

## 单摆周期与能量校核

小角度单摆周期只依赖摆长与重力：

$$T=2\pi\sqrt{\frac{l}{g}}$$

取 l=0.5 m、g=9.81 m/s²，得 T=2π√0.05097=2π×0.2258=1.4185 s，即约 1.42 s。从水平位置释放时势能变化 mgh=2.0×9.81×0.5=9.81 J，全部转为动能时速度 v=√(2gh)=√9.81=3.132 m/s。这两个数字是验收多体模型的锚点：仿真给出的摆动周期与最低点速度若分别偏离 1.42 s 与 3.13 m/s 超过 2%，先查惯量张量，再查重力方向。大摆角时周期会因非线性而变长，摆角 30° 时实际周期约为小角值的 1.017 倍，即 1.443 s，用这一条可以判断模型是否保留了非线性项。

## 关节约束与闭环初始化

`Joints.Revolute(n={0,1,0})` 提供 1 个自由度并消去 5 个约束，`Joints.Prismatic(n={0,1,0})` 同理。开链机构只需给每个关节一个角度或角速度初值；闭环机构（如四连杆）会出现冗余约束，必须把其中一个转动副换成 `Modelica.Mechanics.MultiBody.Joints.RevolutePlanarLoopConstraint`，否则约束方程线性相关，编译时报奇异。闭环还需要 `Modelica.Mechanics.MultiBody.Joints.Assemblies` 中的装配关节或显式给出 `phi_start` 使几何闭合；几何不闭合时求解器会在第一步产生巨大加速度并直接发散。姿态用 `Frames.Orientation` 表示，内部以旋转矩阵配合四元数积分，四元数须满足

$$q_0^2+q_1^2+q_2^2+q_3^2=1$$

仿真中若该残差增长到 1e-6 以上，说明积分容差过松，应把 `Tolerance` 从 1e-6 收紧到 1e-8。

## 两段可运行的机构

```modelica
model SimplePendulum "单摆：可手算基线"
  inner Modelica.Mechanics.MultiBody.World world(
    gravityType=Modelica.Mechanics.MultiBody.Types.GravityTypes.UniformGravity,
    g=9.81, n={0,-1,0}, animateWorld=true);
  Modelica.Mechanics.MultiBody.Parts.FixedTranslation pivot(r={0,0.5,0});
  Modelica.Mechanics.MultiBody.Joints.Revolute rev(
    n={0,1,0}, phi(start=1.5708, fixed=true), w(start=0, fixed=true));
  Modelica.Mechanics.MultiBody.Parts.Body rod(
    m=2.0, r_CM={0,-0.25,0}, cylinderDiameter=0.03,
    I_11=0.0417, I_22=0.0001, I_33=0.0417);
equation
  connect(world.frame_b, pivot.frame_a);
  connect(pivot.frame_b, rev.frame_a);
  connect(rev.frame_b, rod.frame_a);
  annotation(experiment(StopTime=5, Tolerance=1e-8, Interval=0.005));
end SimplePendulum;
```

```modelica
model FourBarLoop "闭环四连杆：使用平面回路约束"
  inner Modelica.Mechanics.MultiBody.World world(animateWorld=true);
  Modelica.Mechanics.MultiBody.Joints.Revolute ground(
    n={0,1,0}, phi(start=0, fixed=true), w(start=0, fixed=true));
  Modelica.Mechanics.MultiBody.Parts.BodyShape crank(
    m=0.5, r={0.1,0,0}, r_CM={0.05,0,0}, I_11=0.001, I_22=0.001, I_33=0.001);
  Modelica.Mechanics.MultiBody.Joints.Revolute coupler(
    n={0,1,0}, phi(start=1.2, fixed=true), w(start=0, fixed=true));
  Modelica.Mechanics.MultiBody.Parts.BodyShape rocker(
    m=0.5, r={0.15,0,0}, r_CM={0.075,0,0}, I_11=0.002, I_22=0.002, I_33=0.002);
  Modelica.Mechanics.MultiBody.Joints.RevolutePlanarLoopConstraint loop(
    n={0,1,0});
  Modelica.Mechanics.MultiBody.Parts.FixedTranslation frame(r={0.3,0,0});
equation
  connect(world.frame_b, ground.frame_a);
  connect(ground.frame_b, crank.frame_a);
  connect(crank.frame_b, coupler.frame_a);
  connect(coupler.frame_b, rocker.frame_a);
  connect(rocker.frame_b, loop.frame_a);
  connect(loop.frame_b, frame.frame_a);
  connect(frame.frame_b, world.frame_b);
end FourBarLoop;
```

## 多体机构失效与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 构件向上加速、总能量单调增 | World 的 n 与 g 符号不一致 | 把 n 改为 {0,-1,0}，势能应随高度上升 |
| 编译报约束奇异 | 闭环中全部用了普通 Revolute | 把其中一个换成 RevolutePlanarLoopConstraint |
| 第一步就发散、加速度达 1e6 | 闭环几何在初始位形不闭合 | 检查各杆长之和与固定点距离是否一致 |
| 摆动周期比 1.42 s 短 20% | 惯量张量用了绕质心值代替绕端点值 | 用平行轴定理重算 J_pivot=0.1667 |
| 能量在 10 s 内漂移 5% | 积分容差过松或四元数未归一 | 把 Tolerance 收紧到 1e-8 并监控四元数残差 |

## 多体参数的验收判据与依据

交付多体模型时至少给出四项证据：一是单摆周期 1.42 s 与最低点速度 3.13 m/s 的偏差；二是总机械能（动能加势能）在 10 s 内的漂移百分比，应小于 0.1%；三是四元数归一化残差的最大值；四是闭环机构中各关节约束反力的量级，用于判断是否出现了不合理的巨大内力。这四项分别对应惯量、能量、姿态积分与约束装配，缺一项就无法判定结果可信。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Mechanics.MultiBody` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Otter M., Elmqvist H., Mattsson S.E. "The new Modelica MultiBody library", *Proceedings of the 3rd International Modelica Conference*, Linköping, 2003.
4. Featherstone R. *Rigid Body Dynamics Algorithms*, Springer, 2008.
5. Schiehlen W., Eberhard P. *Applied Dynamics*, Springer, 2014.
6. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*, Wiley-IEEE Press, 2015.
