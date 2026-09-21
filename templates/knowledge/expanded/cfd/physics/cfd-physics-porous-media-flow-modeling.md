---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-porous-media-flow-modeling
title: 多孔介质流动：原理与诊断验证
summary: >-
  从体积平均的成立前提出发，逐级说明 Darcy、Brinkman、Darcy-Forchheimer
  与孔隙尺度模型各自保留了什么物理，给出尺度分离、孔隙稀薄化与热非平衡三类失效边界及对应量级估算。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 多孔介质流动
  - 物理建模与适用边界
  - 体积平均
  - Klinkenberg 效应
  - 结果诊断与可信度验证
  - Ergun 方程
  - 渗透率
seo:
  title: 多孔介质流动：原理与诊断验证
  description: >-
    从体积平均的成立前提出发，逐级说明 Darcy、Brinkman、Darcy-Forchheimer
    与孔隙尺度模型各自保留了什么物理，给出尺度分离、孔隙稀薄化与热非平衡三类失效边界及对应量级估算。
  keywords:
    - 多孔介质流动
    - 物理建模与适用边界
    - 体积平均
    - Klinkenberg 效应
    - Brinkman 方程
    - 结果诊断与可信度验证
    - Ergun 方程
    - Darcy-Forchheimer
    - 渗透率
---
# 多孔介质流动：原理与诊断验证

多孔介质模型的合法性来自一个不等式：代表体元（REV）必须同时远大于孔隙、远小于宏观梯度尺度。这个不等式在填充床、滤芯、土壤里成立得很好，在页岩纳米孔、金属泡沫薄壁和裂隙介质里却经常崩掉。多孔介质算例最常见的问题不是发散，而是"收敛得很漂亮但压降错了十倍"——因为源项系数被当成渗透率本身填入。判断一份多孔介质结果是否可信，最短的路径是三条独立证据：压降随表观速度的幂次、Ergun 关联式反算出的阻力系数与求解器读入值的一致性、以及源区进出口的质量流量守恒。下面把这三条做成可执行的判定流程。

## 基础概念与控制关系

### 体积平均的三个前提

对孔隙尺度流场做体积平均，把 Navier-Stokes 方程变成 Darcy 定律：

$$
\langle u_i \rangle = -\frac{K_{ij}}{\mu}\frac{\partial \langle p \rangle^{f}}{\partial x_j}
$$

$\langle \cdot \rangle$ 是体积平均，$\langle \cdot \rangle^{f}$ 是孔隙内固有平均，$K_{ij}$ 是二阶渗透率张量，量纲 $\mathrm{m^2}$。这个式子成立需要三个前提同时满足：

1. **尺度分离**：存在 REV，其尺度 $\ell_{REV}$ 满足 $d_p \ll \ell_{REV} \ll L$，$L$ 为宏观梯度尺度；
2. **黏性主导**：孔隙雷诺数足够小，惯性项相对黏性项可忽略；
3. **连续介质在孔隙内成立**：气体分子平均自由程远小于孔径。

三者中任意一条被破坏，Darcy 定律的系数就不再是常数——它开始随流速、压力或位置变化，而求解器仍会把它当作常数读入。

### 模型层级：每一级补回一种物理

Brinkman 项的量纲要核对：$\mu/\epsilon \cdot \nabla^2 u$ 与 $\mu/K \cdot u$ 之比是 $K/(\epsilon L_c^2)$，$L_c$ 是剪切层厚度。当 $L_c \sim \sqrt{K}$ 时两项同量级，此时忽略 Brinkman 项会在壁面附近给出错误的滑移速度——这也是"用 Darcy 算通道内填充层、结果壁面速度不为零"的根源。

| 层级 | 补回的物理 | 典型形式 | 升级触发条件 |
|---|---|---|---|
| Darcy | 仅黏性阻力 | $\langle u\rangle=-K/\mu\,\nabla\langle p\rangle$ | 惯性占比超过 10% |
| Darcy-Forchheimer | 惯性阻力 | 加 $\rho C_F/\sqrt{K}\,\|\mathbf{u}\|\mathbf{u}$ | 需要壁面/界面剪切 |
| Brinkman | 界面与壁面剪切、无滑移 | 加 $-\mu/\epsilon\,\nabla^2\langle u\rangle$ | 需要同时含惯性与剪切 |
| 孔隙尺度 | 全部，含局部分离与涡 | 直接解 Navier-Stokes | 需要局部应力、沉积或反应细节 |

## 适用边界与方案选择

### 量级估算：三个判据一次算完

给定 $d_p=2\,\mathrm{mm}$、$\epsilon=0.40$、$u=0.5\,\mathrm{m/s}$、空气（$\rho=1.2$、$\mu=1.8\times10^{-5}$）：

- $K=\epsilon^3 d_p^2/[150(1-\epsilon)^2]=0.064\times4\times10^{-6}/(150\times0.36)=4.74\times10^{-9}\,\mathrm{m^2}$；
- $Re_K=\rho u\sqrt{K}/\mu=1.2\times0.5\times6.885\times10^{-5}/1.8\times10^{-5}=2.30$；
- $C_F=0.1429/\epsilon^{1.5}=0.565$，惯性占比 $=C_F Re_K=1.30$。

惯性占比 130% 说明 Darcy 模型完全不可用，必须上 Darcy-Forchheimer。反过来，若把 $u$ 降到 $0.005\,\mathrm{m/s}$，$Re_K=0.023$、惯性占比 1.3%，Darcy 就够了。两个工况的物理是同一个，模型却必须换——这正是"模型选择由无量纲数而非几何决定"的含义。

```python
import math
def porous_regime(dp, eps, u, rho=1.2, mu=1.8e-5, T=300.0, p=101325.0):
    K = eps**3 * dp**2 / (150 * (1 - eps)**2)
    CF = 0.1429 / eps**1.5
    ReK = rho * u * math.sqrt(K) / mu
    lam = (mu / (p / (287 * T))) * math.sqrt(math.pi / (2 * 287 * T))
    return dict(K=K, CF=CF, ReK=ReK, inertial_share=CF * ReK, Kn_p=lam / dp)

print(porous_regime(2e-3, 0.40, 0.5))    # 惯性占比约 1.30 -> Forchheimer
print(porous_regime(2e-3, 0.40, 0.005))  # 惯性占比约 0.013 -> Darcy
print(porous_regime(1e-8, 0.30, 0.005))  # Kn_p >> 1e-3 -> 孔隙滑移/需动理学
```

## 工程设置与实施

### 从 Ergun 反算求解器要填的两个系数

填充床的阻力有权威关联式。Ergun 方程给出

$$
\frac{\Delta p}{L} = 150\frac{\mu(1-\epsilon)^2}{\epsilon^3 d_p^2}u + 1.75\frac{\rho(1-\epsilon)}{\epsilon^3 d_p}u^{2}
$$

$\epsilon$ 是床层空隙率，$d_p$ 是颗粒直径。把两项分别与 Darcy-Forchheimer 的两项对齐，可得可直接写入求解器的等效量：

$$
K = \frac{\epsilon^3 d_p^2}{150(1-\epsilon)^2},\qquad
C_F = \frac{1.75}{\sqrt{150}\,\epsilon^{3/2}} = \frac{0.1429}{\epsilon^{3/2}}
$$

注意 $C_F$ 只依赖空隙率。OpenFOAM 的 `DarcyForchheimer` 源项写成 $S=-(\mu d + \rho f|\mathbf{u}|/2)\mathbf{u}$，因此需要转换一次：

$$
d = \frac{1}{K},\qquad f = \frac{2C_F}{\sqrt{K}}
$$

**手算算例。** 空气 $\rho=1.2\,\mathrm{kg/m^3}$、$\mu=1.8\times10^{-5}\,\mathrm{Pa\cdot s}$，球形颗粒 $d_p=2\,\mathrm{mm}$，$\epsilon=0.40$，表观速度 $u=0.5\,\mathrm{m/s}$，床高 $L=0.5\,\mathrm{m}$。

1. 渗透率：$\epsilon^3=0.064$，$d_p^2=4\times10^{-6}\,\mathrm{m^2}$，$(1-\epsilon)^2=0.36$，故 $K=0.064\times4\times10^{-6}/(150\times0.36)=4.74\times10^{-9}\,\mathrm{m^2}$。
2. 求解器系数：$d=1/K=2.11\times10^{8}\,\mathrm{m^{-2}}$，$\sqrt{K}=6.885\times10^{-5}\,\mathrm{m}$，$C_F=0.1429/0.4^{1.5}=0.565$，$f=2\times0.565/6.885\times10^{-5}=16413\,\mathrm{m^{-1}}$。
3. Ergun 黏性项：$150\times1.8\times10^{-5}\times0.36/(0.064\times4\times10^{-6})\times0.5 = 1898\,\mathrm{Pa/m}$。
4. Ergun 惯性项：$1.75\times1.2\times0.6/(0.064\times0.002)\times0.25 = 2461\,\mathrm{Pa/m}$。
5. 总压降：$(1898+2461)\times0.5 = 2180\,\mathrm{Pa}$。
6. 自洽校验：$Re_K=1.2\times0.5\times6.885\times10^{-5}/1.8\times10^{-5}=2.30$，$C_F Re_K=0.565\times2.30=1.30$，与第 4 步比值 $2461/1898=1.297$ 完全一致。

孔隙雷诺数 $Re_p=\rho u d_p/\mu=1.2\times0.5\times0.002/1.8\times10^{-5}=66.7$，已远高于 10，说明惯性项不可省略——这与第 6 步的比值互为印证。

### 可复用的字典片段

```cpp
porousBed
{
    type            explicitPorositySource;
    explicitPorositySourceCoeffs
    {
        selectionMode   cellZone;
        cellZone        bed;
        type            DarcyForchheimer;
        // d = 1/K, 单位 1/m^2；f = 2*C_F/sqrt(K), 单位 1/m
        d               (2.11e8 0 0 0 2.11e8 0 0 0 2.11e8);
        f               (16413 0 0 0 16413 0 0 0 16413);
    }
}
```

各向异性床层（如纤维毡、瓦楞填料）必须给张量形式：主渗透方向填 $1/K_\parallel$，横向填 $1/K_\perp$，两者的比值本身就是需要从实验或孔隙尺度模拟标定的物理量。

## 异常诊断与失效模式

### 故障模式与判定试验

要求床层高径比与横向尺寸都远大于 $d_p$。工程上常用 $L/d_p>20$ 作为下限；更严格的判据是比较横向扩散时间与停留时间：

$$
\frac{L}{u} \gg \frac{R^2}{\epsilon D_{eff}}
$$

若两侧同量级，径向不均匀性无法被平均掉，一维模型与三维结果会系统性分叉。薄壁金属泡沫（壁厚只有 2~3 个孔胞）属于典型反例，必须走孔隙尺度或至少 Brinkman 层。

气体在低压或小孔下会在孔壁滑移，渗透率变成压力的函数。判据是孔隙 Knudsen 数：

$$
Kn_p = \frac{\lambda}{d_p},\qquad \lambda = \frac{\mu}{\rho}\sqrt{\frac{\pi}{2RT}}
$$

$R=287\,\mathrm{J/(kg\cdot K)}$ 为空气气体常数。取 $T=300\,\mathrm{K}$、$p=101325\,\mathrm{Pa}$，$\rho=1.177\,\mathrm{kg/m^3}$、$\mu=1.86\times10^{-5}\,\mathrm{Pa\cdot s}$：$\mu/\rho=1.581\times10^{-5}$，$\sqrt{\pi/(2RT)}=\sqrt{3.1416/172200}=4.271\times10^{-3}$，得 $\lambda=6.75\times10^{-8}\,\mathrm{m}$，即 67.5 nm。

若孔径 $d_p=10\,\mu\mathrm{m}$，则 $Kn_p=6.75\times10^{-3}$，已超过连续介质的 $10^{-3}$ 门槛。Klinkenberg 用下式修正：

$$
K_g = K_l\left(1+\frac{b}{\bar p}\right),\qquad b=\frac{4c\lambda\bar p}{r}
$$

取 $c\approx1$、孔半径 $r=5\,\mu\mathrm{m}$：$b=4\times6.75\times10^{-8}\times101325/5\times10^{-6}=5472\,\mathrm{Pa}$。

- 常压 $101325\,\mathrm{Pa}$：$K_g/K_l=1+5472/101325=1.054$，偏高 5.4%，多数工况可忽略；
- $10\,\mathrm{bar}=10^6\,\mathrm{Pa}$：$K_g/K_l=1.005$，修正消失；
- $0.1\,\mathrm{bar}=10132\,\mathrm{Pa}$：$K_g/K_l=1.54$，偏高 54%，必须修正。

结论是：微米级孔隙的 Klinkenberg 修正在 $p<10\,\mathrm{bar}$ 才显著，而纳米级孔隙在常压下就已经进入滑移区。这条边界与第 3 节的不等式无关，是独立的一维。

Darcy 模型的能量方程默认固相与流体同温（LTE）。判据是孔隙内换热与相间换热的比值：

$$
\Lambda = \frac{h_{sf}\,a_{sf}\,L^2}{k_{eff}}
$$

$a_{sf}$ 是比表面积（球形颗粒填充 $\epsilon=0.4$ 时约 $1800\,\mathrm{m^{-1}}$，对应 $d_p=2\,\mathrm{mm}$）。当流速高、颗粒大或瞬态加热时 $\Lambda$ 变小，LTE 失效，需要双温度（LTNE）模型，多解一个固相能量方程。快速蓄热、催化反应器和微波加热都属于这一类。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 同一床层用不同 $u$ 拟合出的 $K$ 不唯一 | 惯性项未纳入，Darcy 假设被 $Re_K$ 破坏 | 做 $u$ 扫描，看 $K_{fit}$ 是否随 $u$ 单调下降 |
| 渗透率随气体压力上升而下降 | 孔隙稀薄化，Klinkenberg 滑移贡献被忽略 | 在三个压力下测 $K_g$，拟合 $1/\bar p$ 直线 |
| 壁面附近速度不为零、壁面剪应力为零 | 缺少 Brinkman 项，无法施加无滑移 | 加密壁面网格并加入 Brinkman 项，看壁面速度是否趋零 |
| 瞬态升温时固流温差始终算不出来 | LTE 假设不成立 | 用 LTNE 重算，比较固相温度峰值 |
| 二维轴对称模型与三维结果分叉 | 径向扩散时间与停留时间同量级 | 计算 $R^2/(\epsilon D_{eff})$ 与 $L/u$ 的比值 |
| 薄壁泡沫压降比厚件显著偏高 | 壁厚不足一个 REV，无滑移壁效应主导 | 换孔隙尺度模型复算同一构件 |
| 加密源区后压降几乎不变，但出口速度剖面持续变钝 | 源区被当作薄界面而非体积力，内部结构被抹平 | 用真实填充几何做一次孔隙尺度对照，比较同一 $u$ 下的 $\Delta p$ |
| 压降随 $u$ 呈线性，但 $Re_p$ 已超过 100 | 惯性系数 $f$ 填成 0 或数量级错误 | 用 Ergun 手算 $\Delta p/L$ 与求解器输出逐点对比 |
| 源区出口出现速度尖峰或局部回流 | 阻力系数过大造成源项刚性与局部 CFL 超标 | 把 $f$ 减半重算，观察尖峰幅值是否同比例减小 |
| $\Delta p$ 对系数的敏感度与 $1/K$ 的预期不符 | 系数被当作 $K$ 而非 $1/K$ 填入 | 打印读入的 $d$ 值并与 $1/K$ 对比 |
| 源区上游出现非物理压降 | 源区与入口面重叠，入口边界被源项污染 | 把源区沿流向后移 $2d_p$ 重算 |
| 进出口质量流量不守恒 | 源区与主流区网格非共形，界面插值不保通量 | 统计界面通量并改用共形网格 |

## 验证、验收与复现

### 归档时留下的四类记录

1. 输入：$\epsilon$、$d_p$、$\rho$、$\mu$ 的来源与适用范围，以及 $K$、$C_F$、$d$、$f$ 的换算脚本。
2. 过程：源区单元层数与 $\Delta p$ 的收敛表，界面通量差的迭代历史。
3. 结果：$\Delta p$ 与 $u$ 的双对数拟合斜率、拟合区间、以及斜率是否随 $u$ 漂移。
4. 反证：哪些工况（如 $Re_p>300$、床层高径比小于 10）会推翻当前的 Darcy-Forchheimer 假设。

### 压降-流速幂次决定处在哪个流区

把每个工况的 $\Delta p/L$ 与表观速度 $u$ 画在双对数图上，斜率就是主导机制的指纹：斜率 1 表示黏性主导，斜率 2 表示惯性主导，中间是过渡区。对应的本构关系是 Darcy-Forchheimer 二项式：

$$
\frac{\Delta p}{L} = \frac{\mu}{K}u + \frac{\rho C_F}{\sqrt{K}}u^{2}
$$

其中 $K$ 是渗透率，单位 $\mathrm{m^2}$；$C_F$ 是无量纲惯性系数；$u$ 是按整个截面算的表观速度，不是孔隙内真实速度。第二项与第一项之比可以化简为：

$$
\frac{\text{惯性项}}{\text{黏性项}} = C_F\,\frac{\rho u \sqrt{K}}{\mu} = C_F\,Re_K,\qquad Re_K = \frac{\rho u\sqrt{K}}{\mu}
$$

这一步很关键：惯性项的占比等于 $C_F$ 乘 $Re_K$。工程上常把"$Re_K<1$ 即 Darcy 区"当作经验法则，但取 $C_F\approx 0.55$ 时 $Re_K=1$ 对应惯性占比已达 55%，早已不是 Darcy 区。若把"惯性占比小于 10%"作为判据，门槛应是 $Re_K<0.18$。诊断时先算 $Re_K$，再决定是否必须保留惯性项。

### 三个必须单独做的判定试验

**网格试验。** 多孔源项是体积力，压降对源区单元数并不敏感，粗网格也可能给出"正确"的总压降，但出口速度剖面会明显变钝。做 10/20/40 层单元三组，要求 $\Delta p$ 变化小于 2% 且出口速度剖面 L2 差小于 1%，两者同时满足才算收敛。

**界面试验。** 检查源区入口与出口截面的质量流量差；共形网格下应小于 0.1%。若超差，多半是源区边界与进出口面重叠，或界面非共形而插值不守恒。

**量纲试验。** 打印求解器实际读入的 $d$、$f$，与 $1/K$、$2C_F/\sqrt{K}$ 逐位对比。把 $K$ 直接填进 $d$ 的槽位，量级会差 $10^{17}$，而残差曲线不会有任何异常。

## 参考资料

1. Bear J., *Dynamics of Fluids in Porous Media*, American Elsevier, New York, 1972.
2. Whitaker S., "The Forchheimer Equation: A Theoretical Development," *Transport in Porous Media*, 25(1), 27-61, 1996.
3. Klinkenberg L.J., "The Permeability of Porous Media to Liquids and Gases," *API Drilling and Production Practice*, 200-213, 1941.
4. Nield D.A., Bejan A., *Convection in Porous Media*, 5th ed., Springer, 2017.
5. Vafai K. (ed.), *Handbook of Porous Media*, 3rd ed., CRC Press, 2015.
6. Darcy H., *Les Fontaines Publiques de la Ville de Dijon*, Victor Dalmont, Paris, 1856.
7. Ergun S., "Fluid Flow through Packed Columns," *Chemical Engineering Progress*, 48(2), 89-94, 1952.
8. Macdonald I.F., El-Sayed M.S., Mow K., Dullien F.A.L., "Flow through Porous Media—the Ergun Equation Revisited," *Industrial & Engineering Chemistry Fundamentals*, 18(3), 199-208, 1979.
