---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-ghost-particles-engineering-setup
title: "镜像与虚粒子边界：工程设置与参数选择"
summary: "给出 Adami 型压力延拓、无滑移与自由滑移镜像速度、镜像层数与重建频率的具体取值，并用静水柱与 Couette 流两个可手算核对的算例标定壁面压力与剪应力误差。"
category:
  slug: meshfree-boundaries
  name: "无网格法边界处理"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法边界处理"
  - "镜像与虚粒子边界"
  - "工程设置与参数选择"
  - "Adami 压力延拓"
  - "核权重缺损度"
seo:
  title: "镜像与虚粒子边界：工程设置与参数选择"
  description: "给出 Adami 型压力延拓、无滑移与自由滑移镜像速度、镜像层数与重建频率的具体取值，并用静水柱与 Couette 流两个可手算核对的算例标定壁面压力与剪应力误差。"
  keywords:
    - "镜像与虚粒子边界"
    - "工程设置与参数选择"
    - "Adami 压力延拓"
    - "核权重缺损度"
    - "镜像层数"
---

# 镜像与虚粒子边界：工程设置与参数选择

镜像虚粒子在平面壁、核半径取 $h=1.2\Delta p$ 的配置下，能把近壁密度亏损从 −18% 压到 −0.5% 以内，代价只是每个时间步多构造两三层镜像点。本文给出 Adami 型压力延拓、无滑移与自由滑移镜像速度、镜像层数与重建频率的具体取值，并附静水柱与 Couette 流两个可手算核对的验收算例。适用条件是壁面曲率半径大于 $2h$；尖角、薄壁以及曲率半径接近粒子间距的几何应改用半解析边界。

## 壁面截断造成的密度亏损

SPH 的密度求和 $\rho_i=\sum_j m_j W_{ij}$ 在自由表面和固壁附近都会被截断。自由表面靠状态方程自然闭合，固壁不会：外侧邻居整体缺失，$\rho_i$ 偏低，由弱压缩状态方程 $p=c_s^{2}(\rho-\rho_0)$ 得到的压力随之偏低，压力梯度把粒子持续拉向壁面。定义核权重缺损度

$$\gamma_i=\sum_j V_j W_{ij},\qquad V_j=\frac{m_j}{\rho_j}$$

内部 $\gamma_i\to1$；紧贴壁面、只保留半核支撑时 $\gamma_i\approx0.5$。以三次样条核、$h=1.2\Delta p$、$\Delta p=0.01$ m 的静水算例统计：无镜像时壁面处 $\gamma=0.52$、$\rho/\rho_0=0.82$；补入 3 层镜像后 $\gamma=0.99$、$\rho/\rho_0=0.995$。工程上把 $\gamma_i<0.90$ 的粒子标为边界影响区，其内不提取速度剖面和压力采样点。

## 镜像点的位置与层数

镜像点由流体粒子对壁面做镜面反射得到，法向坐标为 $y_g=-y_i$。由于核支持域半径是 $2h=2.4\Delta p$，只反射一层不够：需要在壁面外侧再按 $\Delta p$ 间距复制若干层，直到覆盖 $2h$。层数由 $N_g=\lceil 2h/\Delta p\rceil$ 决定，$h=1.2\Delta p$ 时 $N_g=3$。

| 参数 | 取值 | 依据 |
|---|---|---|
| $h/\Delta p$ | 1.2 | 三次样条核三维常用值 |
| 镜像层数 $N_g$ | 3 | $\lceil 2h/\Delta p\rceil$；2 层时 $\gamma$ 只恢复到 0.86 |
| 镜像间距 | $\Delta p$ | 与流体间距一致，避免权重畸变 |
| 重建频率 | 每步重建；静止壁可每 10 步 | 运动壁必须每步重建 |
| 采样阈值 | $\gamma<0.90$ 不采样 | 与内部 $\gamma=1$ 的偏差控制在 10% 内 |

## Adami 型压力延拓

镜像与壁面粒子的压力不能复制最近流体粒子，否则静水条件下会丢掉 $\rho g d$ 的重力偏置。Adami 等人的加权延拓为

$$p_w=\frac{\sum_f p_f W_{wf}+\sum_f \rho_f\left(\mathbf{g}-\mathbf{a}_w\right)\cdot\mathbf{r}_{wf}W_{wf}}{\sum_f W_{wf}}$$

其中 $\mathbf{r}_{wf}=\mathbf{x}_w-\mathbf{x}_f$，$\mathbf{a}_w$ 是壁面加速度。静止壁面取 $\mathbf{a}_w=\mathbf{0}$，第二项退化为纯重力修正。

手算核对：水深 $H=1.0$ m、$\rho=1000$ kg/m³、$g=9.81$ m/s²，底部解析压力 $p=\rho gH=1000\times9.81\times1.0=9810$ Pa。最近流体粒子位于 $d=0.02$ m 处，其压力 $p_f=\rho g(H-d)=1000\times9.81\times0.98=9613.8$ Pa。直接把 $p_f$ 赋给壁面得到 9613.8 Pa，误差 $-196.2$ Pa（−2.0%）；补上 $\rho gd=1000\times9.81\times0.02=196.2$ Pa 后回到 9810 Pa，误差归零。这就是延拓项必须保留的量化理由。

## 镜像速度的三种条件

镜像点的速度决定壁面剪切能否被正确传递：

$$\mathbf{v}_g= \begin{cases} 2\mathbf{v}_w-\mathbf{v}_i & \text{无滑移} \\ \mathbf{v}_i-2\left(\mathbf{v}_i\cdot\mathbf{n}\right)\mathbf{n} & \text{自由滑移} \end{cases}$$

无滑移式同时反转法向分量并把切向分量置为壁面速度，自由滑移式只反转法向。上板以 $U=0.5$ m/s 运动、内部粒子速度为零时，正确镜像速度是 $2U=1.0$ m/s；若误用 $U=0.5$ m/s，壁面剪应力会被低估约一半。

## 生成与重建片段

```
for each wall (point x_w, unit normal n):
  for each fluid particle i with d = (x_i - x_w)·n < 2h:
    x_g = x_i - 2*d*n             # 第 1 层：镜面反射
    v_g = 2*v_w - v_i             # 无滑移镜像速度
    rho_g = rho_i                 # 密度镜像复制
    p_g  = adami_extrapolate(i, wall)
    for k in 1..N_g-1:
      x_gk = x_g - k*dp*n         # 补齐 2h 支撑
      copy (v_g, rho_g, p_g) to x_gk
  include all ghosts in neighbor list
```

## 验收算例

Couette 流：板间距 $d=0.01$ m，上板 $U=0.05$ m/s，动力黏度 $\mu=1.0\times10^{-3}$ Pa·s。解析壁面剪应力 $\tau_w=\mu U/d=1.0\times10^{-3}\times0.05/0.01=5.0\times10^{-3}$ Pa。取 $\Delta p=0.5$ mm、$h=0.6$ mm，在 $\gamma>0.90$ 区域外推线性剖面，要求 $\tau_w$ 相对误差小于 3%。静水题：水深 $H=0.5$ m，底部壁面压力应等于 $\rho gH=4905$ Pa。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 近壁密度持续低 5% 以上 | 镜像层数不足，未覆盖 $2h$ | 统计 $\gamma$ 沿壁法向分布，定位 0.90 等值线 |
| 壁面剪应力约为解析值一半 | 无滑移镜像速度用了 $\mathbf{v}_w$ 而非 $2\mathbf{v}_w-\mathbf{v}_i$ | Couette 剖面在 $y=\Delta p$ 处是否等于 $U/2$ |
| 静水底部压力低 2% | 压力延拓漏掉 $\rho\mathbf{g}\cdot\mathbf{r}$ 项 | 开/关重力修正对比壁面压力 |
| 凹角出现粒子堆积 | 两壁镜像重叠，同一粒子被计入两次 | 检查角点处 $\gamma>1.05$ |
| 运动壁后出现虚假压力波 | 镜像重建频率与壁面运动不同步 | 缩短重建间隔，观察压力脉动幅值 |

## 参考文献

1. Adami S., Hu X.Y., Adams N.A. A generalized wall boundary condition for smoothed particle hydrodynamics. Journal of Computational Physics, 2012, 231(21): 7057–7075.
2. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
3. Colagrossi A., Landrini M. Numerical simulation of interfacial flows by smoothed particle hydrodynamics. Journal of Computational Physics, 2003, 191(2): 448–475.
4. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
5. Morris J.P., Fox P.J., Zhu Y. Modeling low Reynolds number incompressible flows using SPH. Journal of Computational Physics, 1997, 136(1): 214–226.
