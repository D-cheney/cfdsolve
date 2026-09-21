---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-digital-twin-diagnosis-validation
title: "数字孪生中的模型更新：结果诊断与可信度验证"
summary: "数字孪生模型更新的收敛判据：用卡尔曼增益与创新协方差、NIS 卡方门限、参数灵敏度门槛、遗忘因子与更新周期匹配、CUSUM 漂移报警判断更新是否可信，并用 ASME V&V 20 验证度量与一次出口温度手算给出对照。"
category:
  slug: cae-algorithm-map
  name: "CAE 算法全景图"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "CAE 算法全景图"
  - "数字孪生中的模型更新"
  - "结果诊断与可信度验证"
  - "卡尔曼滤波"
  - "创新序列检验"
seo:
  title: "数字孪生中的模型更新：结果诊断与可信度验证"
  description: "数字孪生模型更新的收敛判据：用卡尔曼增益与创新协方差、NIS 卡方门限、参数灵敏度门槛、遗忘因子与更新周期匹配、CUSUM 漂移报警判断更新是否可信，并用 ASME V&V 20 验证度量与一次出口温度手算给出对照。"
  keywords:
    - "数字孪生中的模型更新"
    - "结果诊断与可信度验证"
    - "卡尔曼增益"
    - "创新序列 NIS 检验"
    - "CUSUM 漂移检测"
---

# 数字孪生中的模型更新：结果诊断与可信度验证

数字孪生的模型更新是一次受约束的状态估计：只有创新序列接近白噪声、待更新参数的灵敏度高于观测噪声、验证度量小于合成不确定度时，更新才算收敛。本文面向在线运行的热-流孪生，给出可执行判据与一次出口温度手算对照。

## 状态更新方程与增益的实际来源

线性高斯假设下，孪生每步更新由预测与校正两式构成：

$$
\hat{x}_k^- = A\hat{x}_{k-1} + Bu_k,\qquad P_k^- = A P_{k-1} A^{\mathsf T} + Q
$$

$$
K_k = P_k^- H^{\mathsf T}\left(H P_k^- H^{\mathsf T} + R\right)^{-1},\qquad \hat{x}_k = \hat{x}_k^- + K_k\left(z_k - H\hat{x}_k^-\right)
$$

$Q$ 是过程噪声协方差（模型结构误差），$R$ 是观测噪声协方差（传感器标定）。决定增益的是 $Q/R$ 之比而非绝对值。

取一维出口温度孪生 $H=1$，先验方差 $P^-=4.0\ \mathrm{K^2}$（$\sigma=2.0\ \mathrm{K}$），传感器噪声 $R=(0.5\ \mathrm{K})^2=0.25\ \mathrm{K^2}$，则 $K=4.0/(4.0+0.25)=0.941$，94.1% 的权重给了实测。当前预测 $355.0\ \mathrm{K}$、测量 $z=356.8\ \mathrm{K}$，创新为 $1.8\ \mathrm{K}$，更新后状态 $355.0+0.941\times1.8=356.69\approx356.7\ \mathrm{K}$，后验方差 $P=(1-0.941)\times4.0=0.235\ \mathrm{K^2}$，$\sigma$ 由 $2.0\ \mathrm{K}$ 降到 $0.485\ \mathrm{K}$。

## 创新序列是首要诊断量

校正残差 $y_k=z_k-H\hat{x}_k^-$ 在滤波器一致时应零均值、白，且协方差为 $S_k=H P_k^- H^{\mathsf T}+R$。归一化创新平方和

$$
\mathrm{NIS}_k = y_k^{\mathsf T} S_k^{-1} y_k \sim \chi^2(m)
$$

$m$ 为观测维数，这是判断滤波器一致性的无偏统计量。$m=2$、$S=\mathrm{diag}(0.25,0.04)$、$y=(0.6,0.05)$ 时 $\mathrm{NIS}=0.6^2/0.25+0.05^2/0.04=1.44+0.0625=1.5025$，小于 $\chi^2_{2,0.95}=5.991$，该帧应接受。逐帧 NIS 波动大，工程上看窗口均值：$N=200$ 帧时落在 $m\pm1.96\sqrt{2m/N}=2\pm0.277$，超出 $[1.72,2.28]$ 即判不一致。白度用 lag-1 自相关检验，门限 $2/\sqrt{200}=0.141$，超限说明 $R$ 被低估，增益虚高。

## 参数可辨识性与灵敏度门槛

可更新参数须使其目标量变化大于观测噪声。最小可辨识变化量由灵敏度倒数给出

$$
\Delta\theta_{\min}=\frac{\sigma_y}{\left|\partial y/\partial\theta\right|}
$$

传热系数 $UA=500\ \mathrm{W/K}$、稳态灵敏度 $\partial T_{\mathrm{out}}/\partial UA=0.02\ \mathrm{K/(W/K)}$、$\sigma_y=0.5\ \mathrm{K}$ 时，$\Delta UA_{\min}=0.5/0.02=25\ \mathrm{W/K}$，恰为额定值的 5%。若结垢只让 $UA$ 降 $15\ \mathrm{W/K}$（3%），它低于噪声地板，强行更新等于拟合噪声。多参数时回归矩阵条件数 $\kappa>10^3$ 即强相关，应固定其一或加正则化。

## 更新周期、遗忘因子与协方差塌缩

递推最小二乘用遗忘因子 $\lambda$ 控制记忆长度，等效样本数 $N_{\mathrm{eff}}=1/(1-\lambda)$。$\lambda=0.98$ 对应 50 个样本，1 Hz 采样下记忆约 50 s。更新周期须大于噪声相关时间 $\tau_{\mathrm{corr}}=20\ \mathrm{s}$，以免重复计入相关信息，并小于热时间常数的十分之一。该孪生 $C=2.0\times10^5\ \mathrm{J/K}$、$UA=500\ \mathrm{W/K}$，$\tau_{\mathrm{th}}=C/UA=400\ \mathrm{s}$，故 $\Delta t_{\mathrm{upd}}\in[20\ \mathrm{s},40\ \mathrm{s}]$。按 1 Hz 更新等于每个时间常数更新 400 次，$P$ 被压低、$K\to0$，曲线平滑却已停止跟随漂移。

```python
import numpy as np
A, H = np.array([[0.97]]), np.array([[1.0]])
Q, R = np.array([[0.01]]), np.array([[0.25]])   # K^2
x, P = np.array([[355.0]]), np.array([[4.0]])   # K, K^2
for z in stream:                                # z: 测量, K
    x = A @ x; P = A @ P @ A.T + Q
    y = z - H @ x; S = H @ P @ H.T + R
    if float(y.T @ np.linalg.inv(S) @ y) > 5.991:   # chi2(m=2,0.95)
        continue
    K = P @ H.T @ np.linalg.inv(S)
    x = x + K @ y; P = (np.eye(1) - K @ H) @ P
```

## 漂移检测：从单点残差到累积统计量

单帧 NIS 超限只说明该帧异常，漂移要用累积统计量。双侧 CUSUM 递归量为

$$
g_k=\max\left(0,\ g_{k-1}+\frac{\left|y_k\right|}{\sigma_y}-k_d\right),\qquad \text{报警当 } g_k>h
$$

取 $k_d=0.25$、$h=5.0$：漂移使标准化残差稳定在 $0.45$ 时每帧增量 $0.20$，25 帧后报警；若增量只有 $0.05$（$0.30\sigma$ 的缓慢漂移），需 100 帧。EWMA 图量级一致：$\lambda=0.1$、$L=3$ 时控制限 $0.344\ \mathrm{K}$，超限判漂移。

## 与基准对照的验证度量

更新用过的数据不能再用于验证，否则 $E$ 被压低。按 ASME V&V 20，

$$
E=S-D,\qquad U_{\mathrm{val}}=\sqrt{U_{\mathrm{num}}^2+U_{\mathrm{input}}^2+U_D^2}
$$

$S$ 为仿真值、$D$ 为基准值。取 $U_{\mathrm{num}}=0.8\ \mathrm{K}$、$U_{\mathrm{input}}=0.4\ \mathrm{K}$、$U_D=0.5\ \mathrm{K}$，$U_{\mathrm{val}}=\sqrt{0.64+0.16+0.25}=\sqrt{1.05}=1.02\ \mathrm{K}$。某工况 $S=356.7\ \mathrm{K}$、独立基准 $D=355.2\ \mathrm{K}$，$E=1.5\ \mathrm{K}>1.02\ \mathrm{K}$，未通过验证。$U_{\mathrm{val}}$ 不因调参变小，把 $E$ 拉进区间只能靠新证据。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 参数在相邻两次更新间来回跳 | $R$ 被低估或噪声时间相关 | 算 lag-1 自相关，$\lvert\rho_1\rvert>0.141$ 时先预白化 |
| 增益衰减到 0.01 以下，孪生不再跟随 | $Q$ 过小或更新频率远高于 $\tau_{\mathrm{th}}$ | 更新周期由 1 s 改 30 s，看 $P$ 是否回到 $0.2\ \mathrm{K^2}$ |
| 窗口 NIS 长期低于 1.72 | $R$ 被高估，滤波器过度自信 | 留出集上重算 NIS，仍偏低则重标 $R$ |
| 实测台阶后 $E$ 稳定在 1.5 K 不回落 | 模型结构误差，非噪声或参数 | 冻结参数只跑状态估计，$E$ 不降即判结构误差 |
| $UA$ 被改到 $520\ \mathrm{W/K}$ 而出口温度不变 | 变化量低于灵敏度门槛 | 算 $\Delta\theta_{\min}$，25 W/K 大于实际 15 W/K 即不可辨识 |
| CUSUM 每约 100 帧报警一次 | 阈值按白噪声设定，未扣工况变化 | 用稳定工况段重估 $\sigma_y$ 并调整 $k_d$、$h$ |

## 判据速查与参考

收敛闭环需同时满足：窗口 NIS 均值落在 $[1.72,2.28]$ 且 $|\rho_1|\le0.141$；参数变化量超过 $\Delta\theta_{\min}$；后验方差收敛到稳态；$|E|\le U_{\mathrm{val}}$ 且验证数据独立。任一项不满足时先查 $Q/R$ 标定与更新周期。

参考文献：

1. Kalman, R. E., "A New Approach to Linear Filtering and Prediction Problems", *Journal of Basic Engineering*, 82(1): 35–45, 1960.
2. Söderström, T. and Stoica, P., *System Identification*, Prentice Hall, 1989.
3. Ljung, L., *System Identification: Theory for the User*, 2nd ed., Prentice Hall, 1999.
4. Bar-Shalom, Y., Li, X.-R. and Kirubarajan, T., *Estimation with Applications to Tracking and Navigation*, Wiley, 2001.
5. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
6. Oberkampf, W. L. and Roy, C. J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
