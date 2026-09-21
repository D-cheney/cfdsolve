---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-electromagnetic-thermal-engineering-setup
title: "电磁热耦合：工程设置与参数选择"
summary: "从焦耳热密度与趋肤深度估算出发，给出频域电磁与瞬态热串联的网格要求、损耗分离参数、ANSYS 物理环境配置和电磁热参数取值表。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "电磁热耦合"
  - "工程设置与参数选择"
  - "趋肤深度"
  - "焦耳热"
seo:
  title: "电磁热耦合：工程设置与参数选择"
  description: "从焦耳热密度与趋肤深度估算出发，给出频域电磁与瞬态热串联的网格要求、损耗分离参数、ANSYS 物理环境配置和电磁热参数取值表。"
  keywords:
    - "电磁热耦合"
    - "工程设置与参数选择"
    - "趋肤深度"
    - "焦耳热"
---

# 电磁热耦合：工程设置与参数选择

电磁热耦合的设置顺序与多数多物理场相反：应当先算电磁、再定热网格，因为导体内的热源密度完全由电流密度与频率决定，而频率又通过趋肤深度决定电磁网格的最小尺寸。本文按"先量级、再网格、后串联"的顺序，给出焦耳热与损耗的估算方法、频域电磁到瞬态热的配置方式，以及一组可复现的参数取值。

## 焦耳热与损耗密度的量级

导电介质中的焦耳热密度为

$$q=\frac{\lvert\mathbf{J}\rvert^2}{\sigma}$$

铜的电导率 $\sigma=5.96\times10^7\ \mathrm{S/m}$。取电流密度 $J=5\times10^6\ \mathrm{A/m^2}$，则 $q=(5\times10^6)^2/5.96\times10^7=4.19\times10^5\ \mathrm{W/m^3}$，即 419 kW/m³。这个量级必须先算出来，才能判断后续要不要考虑温度对电导率的反馈——铜的电阻温度系数约 $0.0039\ \mathrm{K^{-1}}$，温升 100 K 会让 $\sigma$ 下降近 30%，进而改变热源本身。

铁磁材料的损耗还要加上磁滞与涡流两部分，用损耗分离写成

$$P_v=k_h f B_p^{1.8}+k_e (f B_p)^2$$

第一项是磁滞损耗，第二项是经典涡流损耗。取 $k_h=150\ \mathrm{W/(m^3\cdot T^{1.8}\cdot Hz)}$、$k_e=0.5\ \mathrm{W/(m^3\cdot T^2\cdot Hz^2)}$、$f=50\ \mathrm{Hz}$、$B_p=1.5\ \mathrm{T}$，得 $P_v=150\times50\times1.5^{1.8}+0.5\times(50\times1.5)^2\approx150\times50\times2.05+0.5\times5625\approx1.54\times10^4+2.81\times10^3\approx1.82\times10^4\ \mathrm{W/m^3}$。按密度 7650 kg/m³ 折算约 2.4 W/kg，与常用电工钢在 1.5 T、50 Hz 下的损耗量级一致。

## 趋肤深度决定网格

交变电流集中在导体表层，特征深度为

$$\delta=\sqrt{\frac{2}{\omega\mu\sigma}}=\sqrt{\frac{1}{\pi f\mu_0\mu_r\sigma}}$$

对铜（$\mu_r=1$、$\sigma=5.96\times10^7\ \mathrm{S/m}$），50 Hz 时 $\delta=\sqrt{1/(\pi\times50\times4\pi\times10^{-7}\times5.96\times10^7)}\approx9.2\times10^{-3}\ \mathrm{m}=9.2\ \mathrm{mm}$；1 MHz 时 $\delta$ 按 $\sqrt{50/10^6}$ 缩小，约 $6.5\times10^{-5}\ \mathrm{m}=0.065\ \mathrm{mm}$。

网格必须能在表层内放下至少 3 个单元，即导体表层单元尺寸 $h_e\le\delta/3$：50 Hz 时为 3.1 mm，1 MHz 时骤降到 0.022 mm。这个反差解释了为什么高频电磁热问题必须用表层扫掠网格或阻抗边界条件，而不能用体网格均匀剖分。

## 频域电磁到瞬态热的串联

工程上常做两步串联：先用频域（时谐）电磁求出周期平均热源，再把热源映射到热网格上做瞬态传热。周期平均焦耳热为

$$\bar{q}=\frac{1}{2}\frac{\lvert\hat{\mathbf{J}}\rvert^2}{\sigma}$$

其中 $\hat{\mathbf{J}}$ 是复相量幅值。之所以能用周期平均值，是因为电磁时间尺度（微秒）与热时间尺度（秒）相差六个数量级以上，温度在一个电磁周期内几乎不变。判据是两个尺度之比小于 $10^{-3}$，否则必须做瞬态电磁与瞬态热的双向耦合。

热源映射后，表面散热主导的温升可用一维估算校核：

$$\Delta T_{max}=\frac{qL^2}{2k}+\frac{qL}{h}$$

取 $q=4.19\times10^5\ \mathrm{W/m^3}$、导体半厚 $L=5\ \mathrm{mm}$、铜 $k=400\ \mathrm{W/(m\cdot K)}$、自然对流 $h=10\ \mathrm{W/(m^2\cdot K)}$，得第一项仅 0.013 K，第二项 $4.19\times10^5\times0.005/10=210\ \mathrm{K}$。可见温升几乎全部由表面散热能力决定，内部导热根本不是瓶颈——这直接告诉设计者该加散热面积而不是加铜。

## ANSYS 物理环境配置

多物理场串联用物理环境（physics environment）管理，先把电磁设置写成文件，切换单元类型后再写热设置，求解时交替读入：

```text
/PREP7
ET,1,SOLID236,0          ! 边棱元, 频域电磁
MP,MURX,1,1
MP,RSVX,1,1.68E-8        ! 铜电阻率, Ohm*m
/SOLU
ANTYPE,HARMIC
HARFRQ,50                ! 50 Hz
PHYSICS,WRITE,emag       ! 写出电磁物理环境
FINISH

/PREP7
ET,1,SOLID278             ! 切换到热单元
MP,KXX,1,400
PHYSICS,WRITE,thermal
FINISH

/SOLU
PHYSICS,READ,emag
SOLVE
PHYSICS,READ,thermal
LDREAD,HGEN,,,,2,'emag','rst'   ! 读入焦耳热作为体热源
ANTYPE,TRANS
SOLVE
```

`LDREAD,HGEN` 把电磁结果中的热生成率直接读成热分析的体载荷，是串联耦合的关键一行；若忘记这一步，热分析会得到零热源却依然收敛，属于最难察觉的设置错误。

## 关键参数取值表

| 参数 | 典型取值 | 依据 |
|---|---|---|
| 铜电导率 $\sigma$ | $5.96\times10^7\ \mathrm{S/m}$ | 20 ℃ 标准值 |
| 电阻温度系数 | $0.0039\ \mathrm{K^{-1}}$ | 铜，需反馈到 $\sigma(T)$ |
| 表层单元尺寸 $h_e$ | $\le\delta/3$ | 分辨趋肤深度 |
| 电磁时间步 | 谐波分析无需步长 | 周期平均热源 |
| 热时间步 | $\le\tau_{th}/20$ | 分辨热瞬态 |
| 磁滞系数 $k_h$ | $150\ \mathrm{W/(m^3T^{1.8}Hz)}$ | 电工钢实测拟合 |
| 涡流系数 $k_e$ | $0.5\ \mathrm{W/(m^3T^2Hz^2)}$ | 叠片厚度相关 |

## 失败模式与排查

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 高频下损耗远低于手册值 | 网格未分辨趋肤深度 | 表层加密到 $\delta/3$，看损耗是否上升 |
| 温升随迭代发散 | 电导率温度反馈未加限幅 | 给 $\sigma(T)$ 设上下界，观察是否稳定 |
| 热分析收敛但温度不升 | 未执行 `LDREAD,HGEN` | 检查热源体载荷是否为零 |
| 叠片涡流损耗偏高 | 用实体代替叠片各向异性 | 改用分层或等效电阻率重算 |
| 频率翻倍损耗不按平方增长 | 未计入磁滞项 | 分离两项，单独扫频验证斜率 |

## 参考文献

1. Steinmetz C.P., "On the law of hysteresis," *Transactions of the AIEE*, 9, 1892.
2. Bertotti G., "General properties of power losses in soft ferromagnetic materials," *IEEE Transactions on Magnetics*, 24(1), 1988.
3. Ida N., *Numerical Modeling for Electromagnetic Non-Destructive Evaluation*, Chapman & Hall, 1995.
4. Bossavit A., *Computational Electromagnetism*, Academic Press, 1998.
5. ANSYS Inc., *Maxwell 3D User's Guide*, Release 2021R2.
6. Bastos J.P.A., Sadowski N., *Electromagnetic Modeling by Finite Element Methods*, Marcel Dekker, 2003.
