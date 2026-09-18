---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-ldu-linear-solvers
title: OpenFOAM 14 lduMatrix、线性求解器与预条件
summary: 解释有限体积矩阵如何映射为 lower-diagonal-upper 稀疏存储，梳理矩阵接口、求解器、平滑器、预条件与多重网格之间的调用关系，以及残差准则、适用场景与并行排错方法。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 工程
reading_minutes: 20
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
seo:
  title: OpenFOAM 14 lduMatrix 存储、线性求解器与预条件
  description: 从 LDU 三组系数讲到 solver、preconditioner、smoother 与 GAMG，说明残差判据、选型原则与不收敛排查路径。
  keywords: [OpenFOAM14, lduMatrix, GAMG, 预条件, 线性求解器]
tags: [OpenFOAM14, lduMatrix, GAMG, 预条件, 线性求解器]
---

# OpenFOAM 14 lduMatrix、线性求解器与预条件

## 1. 结论与适用场景

每一个内部面只连接 owner 与 neighbour 两个单元，因此多面体有限体积得到的全局矩阵天然是稀疏的，而且非零结构完全由网格邻接决定。OpenFOAM 14 据此把矩阵存成三组系数：`lower`、`diagonal`、`upper`，再配一张寻址表记录每个面在系数数组中的位置。矩阵方程与迭代残差是理解这一层的最小语言：

$$
\mathbf{A}\mathbf{x}=\mathbf{b},\qquad \mathbf{r}^{(k)}=\mathbf{b}-\mathbf{A}\mathbf{x}^{(k)}
$$

这里 $\mathbf{x}$ 通常是某个场在单元中心的未知值，$\mathbf{b}$ 汇集源项与边界贡献。适用于：为压力方程或动量方程选择求解器与预条件；判断不收敛来自线性求解还是外层非线性/时间推进；在并行运行时定位残差归约与通信问题。不适用于：把线性求解的“收敛”等同于整个仿真的“收敛”——前者只是内层代数迭代停止，后者还取决于外循环与物理模型。

为什么偏偏选三组数组，而不是通用的 CSR 或 CRS 格式？因为有限体积矩阵的非零结构几乎完全由“面”这个几何实体决定：一个内部面对应一对耦合，一个边界面只贡献对角。按面索引存系数，就能与网格的面数组一一对应，寻址表也只是“面到单元”的映射。这既省内存，又让装配过程与遍历面件重合，避免了通用稀疏格式下的间接寻址开销。代价是它只适合面驱动的有限体积，不适合任意稀疏结构。

## 2. 总体架构

线性代数层按职责分为四个角色，逐层组合：

- `lduMatrix`：只认三组系数与寻址，不认物理场，负责最底层的稀疏矩阵表示；
- `lduMatrix::solver`：迭代求解算法（如 `PCG`、`PBiCGStab`、`smoothSolver`、`GAMG`），负责把残差压到给定容差；
- `lduMatrix::preconditioner`：近似逆（如 `DIC`、`DILU`、`FDIC`），负责给迭代加速，本身不保证收敛；
- `lduMatrix::smoother`：一次平滑（如 `GaussSeidel`、`DICGaussSeidel`），被 `smoothSolver` 与 `GAMG` 复用。

在它们之上，`fvMatrix` 把“场 + 量纲 + 边界”翻译成 LDU 三组系数，并在求解完成后把结果写回场。于是层次是：`GeometricField` → `fvMatrix` → `lduMatrix` 三组数组 → `solver` 迭代。所选求解器与预条件由 `fvSolution` 的 `solvers` 子字典按场名（或正则模式）指定。压力场的泊松型方程通常是对称的，适合 `PCG` 配 `DIC`；动量与输运方程一般非对称，需要 `PBiCGStab` 配 `DILU`。

对称性是一个必须首先弄清的性质，因为它直接决定可选算法。离散拉普拉斯在正交网格与对称边界下往往得到对称正定矩阵，可以用共轭梯度类算法，内存与迭代都更省；但一旦引入对流、非正交修正或非对称边界，对称性就可能被破坏，此时用 CG 会直接报错。矩阵是否对称还可以用量化指标衡量，条件数越大，迭代越依赖预条件：

$$
\kappa(\mathbf{A})=\frac{\lambda_{\max}}{\lambda_{\min}}
$$

大面积网格、高长宽比单元与强非正交都会抬高条件数，这正是压力方程离不开 `GAMG` 这类多重网格方法的原因。

## 3. 关键类与调用链

一条典型链条是：`fvMatrix::solve()` 读取场名 → 查 `fvSolution.solvers` 子字典 → 调 `lduMatrix::solver::New` 构造求解器 → 求解器内部按需创建 preconditioner 或 smoother → 迭代到满足 `tolerance`/`relTol` → 返回 `solverPerformance`，其中含初次残差、末次残差、迭代次数与是否收敛。

```text
fvMatrix::solve()      ->  lduMatrix::solver::New(dict, ...)
PCG / PBiCGStab         ->  preconditioner (DIC / DILU)
smoothSolver / GAMG    ->  smoother (GaussSeidel / DICGaussSeidel)
GAMG                    ->  粗层级限制与延拓 + 底层求解器
solverPerformance       ->  initialResidual / finalResidual / nIterations
```

求解器停止由两个条件共同决定：绝对容差与相对容差。常见的判据是把当前残差与初始残差比较：

$$
\|\mathbf{r}^{(k)}\|_2\leq\max\bigl(\text{tolerance},\ \text{relTol}\cdot\|\mathbf{r}^{(0)}\|_2\bigr)
$$

`relTol` 主要服务外层迭代：在 PIMPLE 早期允许内层“粗解”，避免把算力浪费在注定被外层更新覆盖的中间解上；`tolerance` 则保证最终步的代数精度。二者配合不当是“残差越算越大”或“迭代次数暴增”的常见来源。多重网格下的粗层还构造限制（restriction）与延拓（prolongation）算子，把细网格残差投影到粗层求解再插回，从而加速低频误差的衰减。

还有一个容易混淆的点：不同物理方程共享同一个代数接口，但它们的“病态程度”差异很大。压力方程接近椭圆型，条件数随网格尺度平方增长，是多重网格的主战场；对流主导的输运方程则近似双曲型，对角占优、适合平滑迭代。因此“用一个求解器配所有场”往往不是最优解，而应根据方程性质分别配置，这正是 `fvSolution` 按场名分组的用意。

## 4. 代码走读要点

读 `lduMatrix` 时先看三组系数 `lower()`、`diag()`、`upper()` 与寻址。对内部面 $f$，owner 在该面的立方系数进入 `upper[f]`，neighbour 侧进入 `lower[f]`，二者互为镜像；对角是每个单元所有面贡献之和。矩阵的非零个数因此是“单元数 + 2×内部面数”，这也是为什么内存占用与网格规模近似线性。对称矩阵只需存一半系数（upper 与 lower 共用一个数组），读写时用 `symmetric()` 判断。

寻址表是理解 LDU 存储的关键。`lduAddressing` 提供 owner/neighbour 数组与 `cells()` 结构，把“面序号”映射到“单元序号”。装配时遍历面，把系数累加到对应单元的 `upper`/`lower` 与两侧单元的 `diag`；求解时按相同顺序遍历，保证读写一致。这种“面驱动”的实现使并行分区变得直接：每个进程只需持有本地单元与相邻面的数据，跨分区面通过 processor patch 交换。

在性能层面，`lduMatrix` 本身只是数据容器，开销集中在迭代的重复遍历与预条件的近似求解。因此选择预条件的收益往往大于微调迭代次数；而多重网格的收益在于把低频误差交给粗层，从根上减少达到同一残差所需的遍历次数。

读求解器时关注迭代核心与停止逻辑。以加权 Jacobi/平滑迭代为例，其形式是“用对角逆乘残差做修正”：

$$
\mathbf{x}^{(k+1)}=\mathbf{x}^{(k)}+\omega\,\mathbf{D}^{-1}\mathbf{r}^{(k)}
$$

其中 $\omega$ 为松弛因子，$\mathbf{D}$ 为对角。`smoothSolver` 反复应用该形式（常以 Gauss-Seidel 或 DIC 平滑），适合强对角占优的对流方程；`GAMG` 在此之上叠加几何聚合与多重网格，适合大网格下的压力方程。`solverPerformance` 的 `initialResidual` 是本次矩阵方程的代数不平衡，而不是原始 PDE 的误差；把它当成物理误差是典型误解。

值得注意的是，`fvMatrix` 还提供与 LDU 无关的便捷接口，如 `A()`、`H()` 与 `relax()`，它们直接服务外层算法而非线性求解。二次开发中若只关心“求解这个矩阵”，应从 `solve()` 入手；若关心“这个矩阵如何被构造与松弛”，则要看 `fvMatrix` 的装配与边界处理。两者处于相邻但不同的抽象层。

## 5. 可复现示例

一个可直接抄用的 `fvSolution` 起点，分别给压力与速度类方程选型：

```cpp
solvers
{
    "p.*"
    {
        solver          GAMG;
        smoother        GaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
    }
    "U|k|epsilon|omega"
    {
        solver          PBiCGStab;
        preconditioner  DILU;
        tolerance       1e-8;
        relTol          0.1;
    }
}
PIMPLE { nOuterCorrectors 2; nCorrectors 2; nNonOrthogonalCorrectors 1; }
```

配套的诊断命令：

```bash
# 观察每步每个场的求解器、迭代次数与残差
foamRun -solver incompressibleFluid > log.run 2>&1
grep -E "Solving for|DILU|GAMG|Iterations|residual" log.run | head -40
# 统计最费时的方程
awk '/Solving for/{f=$3} /^ExecutionTime/{print f}' log.run | sort | uniq -c | sort -nr | head
```

判读要点：若某场迭代次数长期贴住上限且末次残差远大于容差，优先怀疑预条件不匹配（例如对非对称矩阵用了仅适称的 `DIC`），而不是直接加松驰。若压力场在 `GAMG` 下迭代骤增，常见原因是网格局部极度畸形或聚合层数不足。

另外一个实用习惯是把每个时间步的初次残差与末次残差都记下来，而不是只看末次。若初次残差持续下降且末次残差稳定在小值，说明外层在健康收敛；若初次残差震荡或上升，问题往往不在线性求解器，而在时间步、松驰因子或物理模型的稳定性。把“内层”与“外层”两组指标分开看，是区分两类不收敛的最快方法。

## 6. 常见坑与排查

- 把线性收敛当物理收敛：`tolerance` 只关内层，外循环与时间推进仍可能未收敛；
- 选错预条件：对非对称矩阵用 `DIC`/`PCG`，构造或运行期即报错；
- `relTol` 设得过松：内层粗解把误差带进外循环，表现为压力残差迟迟不降；
- `relTol` 设得过紧：每步都求到机器精度，算力浪费且未必更准；
- 残差定义混淆：`initialResidual` 是代数残差，不是 PDE 残差，不可直接与文献收敛判据比较；
- 并行归约错误：全局残差未正确归约，单进程看起来收敛而整体未收敛；
- 忽略矩阵是否对称：在非对称方程上使用共轭梯度类求解器，构造或迭代阶段直接失败；
- 把迭代次数上限当成调参旋钮：一味调大上限只是掩盖不收敛，真正原因往往是预条件或矩阵性质不匹配。

排查顺序建议：先确认方程是对称还是非对称 → 再确认所选求解器与预条件是否匹配 → 再检查 `tolerance`/`relTol` 与外循环是否自洽 → 再看网格质量与聚合 → 最后才考虑换算法。多数不收敛问题来自“求解器与矩阵性质不匹配”或“容差与外循环互相打架”，而非算法本身。

最后需要提醒：线性求解器是手段而不是目的。一个正确的仿真应当先用稳健的求解器把流程跑通，再逐步提高精度要求；反过来，如果物理输入本身有错，任何求解器都不可能给出合理结果。把求解器调优放在物理与网格之后，才是正确的优先级。

## 7. 检查清单与参考

- [ ] 每个方程都显式指定求解器、预条件与容差；
- [ ] 对称方程用 `PCG`/`DIC`，非对称用 `PBiCGStab`/`DILU`；
- [ ] `relTol` 与外循环次数匹配，最终步残差满足要求；
- [ ] 压力方程在大网格上已验证 `GAMG` 或替代方案；
- [ ] 未把线性残差当作物理收敛证据；
- [ ] 并行下全局残差归约与串行结果一致。

参考资料：

1. `src/OpenFOAM/matrices/LduMatrix/LduMatrix/lduMatrix.H`。
2. `src/OpenFOAM/matrices/lduMatrix/solvers/`、`preconditioners/`、`smoothers/`。
3. `src/fvAgglomerationMethods/` 与 `applications/modules/*/fvSolution`。
