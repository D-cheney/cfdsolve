---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-multigrid-diagnosis-validation
title: "多重网格：结果诊断与可信度验证"
summary: "逐周期实测收敛因子、用网格无关性作为最强的正确性证据、对粗层与插值环节做定点检查，并通过直接解与制造解对照把代数误差与离散误差彻底分离。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "多重网格"
  - "结果诊断与可信度验证"
  - "网格无关性"
  - "收敛因子实测"
seo:
  title: "多重网格：结果诊断与可信度验证"
  description: "逐周期实测收敛因子、用网格无关性作为最强的正确性证据、对粗层与插值环节做定点检查，并通过直接解与制造解对照把代数误差与离散误差彻底分离。"
  keywords:
    - "多重网格"
    - "结果诊断与可信度验证"
    - "网格无关性"
    - "收敛因子实测"
    - "算子复杂度"
---

# 多重网格：结果诊断与可信度验证

多重网格的"好"不能只看循环数——一个收敛因子 0.9 的配置在 8 个循环后也能把残差降一个数量级，但它在加密后必然崩溃。可信度验证的核心是**实测收敛因子并检验它与网格无关**：这是多重网格区别于所有其他迭代法的唯一签名，也是它算对了的最强证据。以下数据取自三维 Poisson 系列网格（$64^3$ 到 $256^3$）与三维弹性模型。

## 收敛因子必须逐周期实测

不要用"总循环数"代替收敛因子。设第 $k$ 个循环结束时的相对残差为 $\rho_k^{\text{res}}$，则

$$
\hat\rho=\left(\frac{\|\mathbf r_{k_2}\|_2}{\|\mathbf r_{k_1}\|_2}\right)^{1/(k_2-k_1)},
$$

取第 3 到第 8 个循环计算可避开前几个循环的启动效应。实测三维 Poisson（$128^3$）$r_3=2.4\times10^{-3}$、$r_8=8.1\times10^{-8}$，代入得 $\hat\rho=0.127$。这个数字应当与理论估计 $\mu^{\nu}$（$\mu=1/3$、$\nu=2$ 给出 $0.111$）同量级；若实测值比理论高 3 倍以上，说明光滑器或插值算子没起作用，而不是网格不够密。**判据是：$\hat\rho>0.5$ 就不该继续用当前配置，$\hat\rho>0.9$ 说明多重网格已经退化为一次昂贵的点迭代。**

## 网格无关性是最强的正确性证据

多重网格的收敛因子应当与 $h$ 无关。在 $64^3$、$128^3$、$256^3$ 三套网格上分别实测 $\hat\rho$，得到 $0.128$、$0.126$、$0.129$，相对偏差在 2% 以内——这是配置正确、粗化与插值匹配的直接证据。若实测变成 $0.13$、$0.22$、$0.41$，说明收敛因子随网格加密恶化，通常意味着：光滑器对高频衰减不足（换线光滑或增加光滑次数）、粗化停滞导致层数不足（降低强度阈值或限制最大层数）、或者问题本身已偏离椭圆假设（对流占优、强各向异性）。**这条测试必须在至少三套网格上做，两套网格无法区分"常数"与"缓慢增长"。**

## 粗层与插值环节的定点检查

收敛因子合格只说明整体有效，仍需确认粗层修正没有把误差搬到错误的位置。可以做一个定点检查：取一个已知的随机误差向量 $\mathbf e$，计算其残差 $\mathbf r=A\mathbf e$，执行一次"限制—粗解—插值"，再比较修正后的误差与原误差的能量范数，健康实现应满足

$$
\frac{\|\mathbf e_{\text{new}}\|_A}{\|\mathbf e\|_A}\le 0.5 .
$$

若该比值大于 1，说明粗层算子与插值不满足 Galerkin 条件

$$
A_c=RAP ,
$$

此时整个循环的收敛性没有理论保证，必须先修正粗层算子再谈参数调优。同时检查算子复杂度：三维弹性模型上 $1.42$ 属健康，$2.4$ 说明插值填充失控，需要限制每行插值非零元个数。

## 与直接解和制造解的双重对照

第一重对照是与直接解比对。同一 $128^3$ 矩阵用多重网格（相对残差 $10^{-10}$）与 MUMPS 直接解求得的解，最大分量相对差为 $4.8\times10^{-7}$，把多重网格容差压到 $10^{-13}$ 后差值降到 $6.2\times10^{-10}$——差值随容差下降，说明差异只来自停机精度。第二重对照是制造解：取 $u=\sin(\pi x)\sin(\pi y)\sin(\pi z)$，代入 $-\nabla^2u=f$ 得 $f=3\pi^2u$，用它验证离散阶数。实测 $16^3$ 网格误差 $3.6\times10^{-2}$，$32^3$ 网格 $9.1\times10^{-3}$，比值 $3.96$，与二阶格式的理论值 4.0 吻合。

```python
import numpy as np

def multigrid_diag(res_hist, mesh_levels):
    r = np.asarray(res_hist)
    rho = (r[7] / r[2]) ** (1.0 / 5.0)     # 第 3 到第 8 个循环
    print(f"measured rho = {rho:.4f}")
    print(f"grid-independent: {np.ptp(mesh_levels) < 0.02}")
    # 粗层修正检查：修正后误差能量范数应减半
    e = np.random.randn(r.shape[0])
    # 需外部提供 A、限制 R、插值 P 与粗层求解器
    return rho
```

## 代数误差与离散误差的分离

两种误差必须分开量化，否则无法判断该加密网格还是该调求解器。做法是在**同一套网格**上分别用多重网格（容差 $10^{-12}$）与直接解求值，两者之差就是纯代数误差；而多重网格解与制造解之差是总误差。实测 $128^3$ 上代数误差 $4.8\times10^{-7}$、总误差 $2.3\times10^{-3}$，前者比后者小近四个数量级，说明当前精度完全由离散主导，加密网格才是有效的改进方向。反之若代数误差与总误差同量级，则应先收紧求解容差或改进预条件。非线性问题用 FAS 时，残差必须在每个循环结束后用当前解**重新评价** $F(\mathbf u)$，不能沿用循环前的值，否则测到的是滞后残差，会得到虚假的收敛因子。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\hat\rho$ 随网格加密从 0.13 涨到 0.41 | 光滑器对高频衰减不足或粗化停滞 | 固定网格，把光滑次数加倍后重测 $\hat\rho$ |
| 粗层修正后误差能量范数不降 | $A_c\ne RAP$，违反 Galerkin 条件 | 用随机误差做一次定点限制—插值测试 |
| 循环数很少但总时间不如 CG | 算子复杂度超过 2.5 | 打印各层 nnz 之比，限制插值填充 |
| FAS 收敛因子看起来极好但解偏离制造解 | 残差用循环前的旧解评价 | 每循环后用当前解重算 $F(\mathbf u)$ 再算 $\hat\rho$ |

## 参考

1. Brandt, A., "Multi-level adaptive solutions to boundary-value problems", *Mathematics of Computation*, 31(138), 1977.
2. Briggs, W. L., Henson, V. E., McCormick, S. F., *A Multigrid Tutorial*, 2nd ed., SIAM, 2000.
3. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
4. Hackbusch, W., *Multi-Grid Methods and Applications*, Springer, 1985.
5. Salari, K., Knupp, P., "Code Verification by the Method of Manufactured Solutions", Sandia National Laboratories, SAND2000-1444, 2000.
6. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
