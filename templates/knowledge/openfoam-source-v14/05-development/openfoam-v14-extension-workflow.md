---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-extension-workflow
title: OpenFOAM 14 自定义模型、边界、功能对象与 solver 模块开发
summary: 从扩展层次判定入手，给出 fvPatchField、fvModel、functionObject、闭合模型与 solver 模块的接口继承、运行时注册、wmake 编译加载、字典合同、并行与重启测试的完整开发流程和可直接复用的代码骨架。
category: { slug: openfoam-v14-development, name: OpenFOAM 14 二次开发 }
level: 专题
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, 二次开发, fvPatchField, functionObject, fvModel, solver模块, wmake, 运行时选择]
seo:
  title: OpenFOAM 14 扩展开发流程：模型、边界、功能对象与 solver
  description: 选择最小扩展层，继承正确基类，完成运行时注册、wmake 编译、字典校验与串并行测试。
  keywords: [OpenFOAM 二次开发, fvPatchField, fvModel, functionObject, solver 模块, wmake]
---

# OpenFOAM 14 自定义模型、边界、功能对象与 solver 模块开发

## 1. 结论与适用场景

OpenFOAM 14 的二次开发并不总是意味着编写一个新求解器。绝大多数工程需求都能在既有有限体积框架内通过派生新类完成：新的本构关系或湍流闭合关系派生输运模型，新的边界数学关系派生 `fvPatchField`，只作用于某个网格区域的体源项用 `fvModel`，只在运行时统计、采样、输出或耦合外部的后处理工具用 `functionObject`，只有当方程集合、状态量、时间推进和生命周期管理发生实质变化时，才需要新增 solver 模块。

选择最小扩展层有三个直接收益：复用已被大量算例验证过的离散格式、并行通信与矩阵求解逻辑；把需要重新测试的面积压到最小；降低与上游 v14 代码的耦合，使后续升级只需关注少量受影响的接口。判断标准可以归纳为一句话：这个扩展究竟改变了"求解什么方程"，还是只改变了"某个系数、某个边界、某一次输出"。

需要特别注意 `fvModel` 与直接写在求解器里的源项在语义上并不等价。`fvModel` 通过 `addSup` 系列接口把贡献叠加到方程的源项矩阵上，天然支持分区并行与限定区域作用；而把源项硬编码进求解器循环会让求解器与模型深度耦合，既难以复用，也难以单独验证。除非源项与时间推进策略强绑定，否则应优先用 `fvModel`。典型的自定义层次选择可以概括为：本构与源项走模型层，边界与壁面函数走场层，监控与后处理走功能对象层，只有在方程结构真正变化时才动求解器层。

## 2. 原理与运行时选择语义

OpenFOAM 采用两层机制协同工作：编译期继承决定接口与行为，运行期选择表决定实际实例化的具体类。基类通常提供 `TypeName` 宏、`declareRunTimeSelectionTable` 声明，具体类用 `addToRunTimeSelectionTable` 注册。字典中写入 `type` 关键字后，工厂函数按键值查找到构造函数指针并完成实例化。

派生类必须满足基类的完整契约：构造函数、拷贝或克隆、从字典读取参数的 `read`、以及基类声明的全部虚函数。对新边界条件而言，契约包括 `updateCoeffs`、`evaluate`、`valueInternalCoeffs`、`valueBoundaryCoeffs`、`gradientInternalCoeffs`、`gradientBoundaryCoeffs` 以及 `write`。只实现 `updateCoeffs` 而漏掉矩阵系数回调，是"数值上看不出错、收敛却异常缓慢"的常见根源，因为隐式矩阵里边界对对角元的贡献被默认为零。

`fvModel` 的语义是把区域内的物理贡献注入到方程组。基类在求解器组装方程时被调用，`addSup` 的多个重载分别面向可压缩、不可压缩和动量方程，因此正确重载是保证注入生效的前提。`solver` 模块在 v14 中已经模块化：时间推进、松弛、收敛判据与方程组装被拆分到可复用基类中。新增求解器通常是派生一个既有求解器模板并替换其中某个方程或模型调用，而不是从零实现整个时间循环。理解这条分层主线，能避免"为了加一个源项而复制整个求解器"的过度设计。

运行时选择还有一层容易被忽视的约束：注册表在库被加载时才生效，而加载时机由字典或链接顺序决定。若一个自定义类只在某个子字典里以 `type` 出现，却没有任何地方 `libs` 加载对应库，工具会直接抛出未知类型错误，而不是延迟到使用时。因此，工程上应把用户库的加载集中写在 `controlDict` 或顶层 `system` 字典里，让所有算例共享同一套加载约定，减少"在我机器上能跑"这类环境差异。此外，选择表的键名与类名、字典 `type` 字符串三者必须一致，任何一处拼写差异都会让工厂查表失败。

## 3. 关键公式与语法

通用标量输运方程是绝大多数自定义模型最终要落实的对象：

$$
\frac{\partial \rho \phi}{\partial t} + \nabla \cdot (\rho \mathbf{U} \phi) - \nabla \cdot (\Gamma_\phi \nabla \phi) = S_\phi
$$

有限体积离散后，每个单元得到形如 $a_P \phi_P + \sum_N a_N \phi_N = b_P$ 的线性方程，矩阵系数由对流量与扩散量组合而成。自定义边界若采用混合型关系，可写为

$$
\phi_b = \alpha \phi_{int} + (1 - \alpha) \phi_{ref}, \qquad 0 \leq \alpha \leq 1
$$

其中 $\phi_{int}$ 是相邻内部单元值，$\phi_{ref}$ 是外部参考值，$\alpha$ 控制内部值的权重。把边界值代入离散方程后，需要对 $\phi_P$ 的贡献（内部系数）和常数贡献（边界系数）分别返回，这正是 `valueInternalCoeffs` 与 `valueBoundaryCoeffs` 的来源。

源项线性化遵循如下拆分原则，以保证对角占优与隐式稳定性：

$$
S_\phi = S_u + S_p \phi, \qquad S_p \leq 0
$$

`fvModel` 的 `addSup` 就应把 $S_u$ 与 $S_p$ 分别累加到源项向量与对角矩阵上。若 $S_p > 0$，隐式处理会削弱稳定性，此时应改为显式处理或对系数施加限制。扩散量的离散又依赖网格面法向梯度，采用非正交修正时可写成

$$
\nabla \phi_f \cdot \mathbf{S}_f \approx \frac{\phi_N - \phi_P}{|\mathbf{d}|} |\mathbf{S}_f| + \mathbf{k} \cdot \nabla \phi_f^{\,orth}
$$

本构或物性关系则常以多项式或幂律形式出现，例如

$$
\mu_{eff} = \mu + \frac{\rho C_\mu k^2}{\varepsilon}
$$

这些关系都应封装在模型层，而不是散落在求解器代码中。

## 4. 工程做法与参数

标准流程如下。第一步，在 v14 源码中找到最接近的具体类与其公共基类，例如 `src/finiteVolume/fields/fvPatchFields/basic/`、`src/fvModels/`、`src/functionObjects/`。第二步，写清数学公式、输入量纲、适用区间与退化极限；量纲必须用 `dimensionSet` 表达，v14 强化了命名量纲与单位检查，绕过它会让错误推迟到运行期才暴露。第三步，复制最小骨架，使用独立类型名，放入用户命名空间或源码树中的新目录。

用户库的构建由 `Make/files` 与 `Make/options` 驱动。`Make/files` 列出源文件与目标库名，`Make/options` 通过 `EXE_INC` 追加头文件路径、通过 `LIB_LIBS` 追加链接库。典型配置如下：

```bash
# Make/files
myMix/myMixFvPatchScalarField.C
LIB = $(FOAM_USER_LIBBIN)/libmyMix
```

```bash
# Make/options
EXE_INC = -I$(LIB_SRC)/finiteVolume/lnInclude -I$(LIB_SRC)/meshTools/lnInclude
LIB_LIBS = -lfiniteVolume -lmeshTools
```

编译使用 `wmake`，成功后库被安装到用户库目录；运行期通过控制字典的 `libs` 或求解器链接加载。参数设计上，所有必需项与可选项都应在 `read` 中校验，给出默认值、范围与清晰报错；建议用 `dict.getOrDefault` 与 `dict.lookup` 明确区分"缺失即报错"和"缺失取默认"两类语义。

涉及动态网格或自适应网格时，边界字段还需正确处理映射与拓扑变化：实现 `autoMap`、`rmap`，并确保 `clone` 返回正确类型而非被切片。对于 `functionObject`，关键是理解 `execute`（按时间步）与 `write`（按写盘时刻）的调用时机，以及 `startTime`、`writeInterval` 由 `functionObjectList` 统一控制的行为；不要在 `execute` 里做重 IO，也不要在 `write` 里修改场。

参数与收敛控制也应有明确的分工：物理参数（如参考值、系数）放在模型或边界的子字典中，数值参数（松弛因子、求解容差、时间格式）放在 `fvSolution` 与 `fvSchemes` 中，二者不要混写。这样在验证阶段可以只改动数值参数而不触碰物理定义，便于把离散误差与模型误差分开评估。建议为每个自定义类准备一个最小的单元测试算例目录，包含网格、初值、边界与字典，并用脚本一键运行，以便任何接口改动后都能快速回归。

## 5. 可复现示例

下面给出一个最小自洽的自定义边界骨架，把外部参考值按权重混入内部值，并正确返回矩阵系数。为突出核心逻辑，这里省略头文件保护、构造细节与部分成员定义。

```cpp
// myMixFvPatchScalarField.H 中的类声明要点
class myMixFvPatchScalarField
:
    public fixedValueFvPatchScalarField
{
public:
    TypeName("myMix");

    myMixFvPatchScalarField
    (
        const fvPatch&, const DimensionedField<scalar, volMesh>&
    );

    myMixFvPatchScalarField
    (
        const myMixFvPatchScalarField&,
        const fvPatch&,
        const DimensionedField<scalar, volMesh>&,
        const fvPatchFieldMapper&
    );

    virtual tmp<fvPatchScalarField> clone() const
    {
        return tmp<fvPatchScalarField>::New(*this);
    }

    virtual void updateCoeffs();
    virtual void write(Ostream&) const;

private:
    scalar alpha_;
    scalar refValue_;
};
```

```cpp
void myMixFvPatchScalarField::updateCoeffs()
{
    if (updated()) return;

    const scalarField& pvf = patchInternalField();
    scalarField& pf = *this;
    pf = alpha_*pvf + (1.0 - alpha_)*refValue_;

    fixedValueFvPatchScalarField::updateCoeffs();
}

// 定值边界：内部系数为 0，边界系数为边界值本身
tmp<Field<scalar>> myMixFvPatchScalarField::valueInternalCoeffs
(
    const tmp<scalarField>&
) const
{
    return tmp<Field<scalar>>(new Field<scalar>(size(), 0.0));
}

tmp<Field<scalar>> myMixFvPatchScalarField::valueBoundaryCoeffs
(
    const tmp<scalarField>&
) const
{
    return tmp<Field<scalar>>(new Field<scalar>(*this));
}

addToRunTimeSelectionTable
(
    fvPatchScalarField,
    myMixFvPatchScalarField,
    dictionary
);
```

最小验证流程：用 `blockMesh` 生成单单元厚度的通道，把一侧边界设为 `type myMix`，给定 `alpha` 与 `refValue`。当 $\alpha = 0$ 时结果应完全等于 `refValue`，当 $\alpha = 1$ 时应退化为取内部值的常规定值边界，两者都能与解析解或内置边界逐点对比。

```bash
# 编译与运行
wmake libso
simpleFoam -case channel > log.simpleFoam 2>&1
```

## 6. 常见坑与排查

第一类是注册与语法问题：`TypeName` 与 `addToRunTimeSelectionTable` 参数不匹配、命名空间缺失，会导致"字典里写了 `type` 却报未知类型"。排查时先确认库是否被加载，再确认注册宏所在的编译单元是否真的被编入库。

第二类是矩阵系数问题：只更新边界值而漏掉内部或边界系数，表现为残差下降缓慢或收敛到错误解。验证方法是把自定义边界替换为等价的内置边界，逐点比较收敛曲线与最终场。

第三类是并行与映射问题：构造顺序假设了全局编号、`clone` 返回基类切片、动态网格后未重映射内部缓存，都会在 `decomposePar` 之后暴露。务必在串行与并行、重启前后各跑一次。

第四类是量纲与单位：新参数没有声明 `dimensionSet`、误用摄氏温差、混用不同单位制，会在物理上给出看似合理但整体偏移的结果。

第五类是时间与生命周期问题：`functionObject` 在 `adjustTimeStep` 下被调用频率与预期不符、重启时未从字典恢复内部状态、缓存在 `clone` 后指向了已释放对象，都会造成只在长时间运行或重启后才出现的偶发错误。排查此类问题应固定随机性，用短算例复现，再逐步放大规模，并优先在 Debug 版本下运行以启用额外的内部一致性检查。

第六类是数值验证缺失：把"编译通过、能跑完、图看起来对"当作完成。正确的做法是准备解析解或高精度参考解，检查网格收敛阶与守恒量残差，确保自定义实现确实改善了目标而不是引入补偿误差。

## 7. 检查清单与参考

建模前：确认选择了最小扩展层；写清公式、量纲与适用范围。

实现中：继承正确的基类；实现全部必要虚函数；`read` 校验所有参数并给出清晰报错；用 `TypeName` 与 `addToRunTimeSelectionTable` 完成注册；正确配置 `Make/files` 与 `Make/options`。

验证时：串行与并行、重启前后、极限工况、与内置等价实现对比、残差与守恒量检查。

交付前还应确认：库的加载路径在目标机器上可用；`Make/options` 中的包含与链接路径使用变量而非绝对路径；公开的类接口有简短注释说明量纲与单位。以上每一条都能显著降低他人复现你工作时遇到的阻力。

参考资料：`etc/codeTemplates/` 下的模板；`src/finiteVolume/fields/fvPatchFields/`；`src/fvModels/`；`src/functionObjects/`；`applications/modules/` 下各求解器及其 `Make/` 目录；OpenFOAM 14 的 Programmer's Guide 与 Doxygen 类文档。
