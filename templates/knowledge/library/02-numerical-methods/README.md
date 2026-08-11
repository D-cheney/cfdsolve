# 02 数值方法

本专题解释求解器设置背后的离散与迭代逻辑：

1. [有限体积法：从积分守恒到离散方程](finite-volume-method.md)
2. [对流项离散格式选择](convection-scheme-selection.md)
3. [压力—速度耦合方法](pressure-velocity-coupling.md)
4. [瞬态时间步与 Courant 数](transient-time-step-courant.md)
5. [残差、监控量与收敛判定](residuals-and-convergence.md)

阅读时应把“稳定”“收敛”“准确”区分开：稳定解可能存在较大数值耗散，残差收敛也不代表网格或物理模型正确。

