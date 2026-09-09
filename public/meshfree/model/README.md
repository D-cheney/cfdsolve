# 吉隆无网格模型资料包

来源：cfdsolve 项目 `jilong_debrisflow_model` 的原始脚本、配置与处理后输入副本。原始研究文件保持不变。

目录包含 `src/`、`config/`、`data/processed/`。网站专题 `/meshfree` 和知识文章 `/knowledge/meshfree-validation` 提供模型范围、原始报告和复现说明。

1. 使用独立 Python 科学计算环境，参考 `config/requirements-sph3d.txt`。
2. 原脚本保留原机器的 D 盘依赖路径、输出路径与 GPU 编号，运行前逐项适配。`simulate_sph3d.py` 在导入时读取 `config/sph3d.json` 的 GPU 编号，即使随后使用 48 万配置也要核对该基础配置。
3. 已包含处理后的地形和源区输入。原始 HGT、逐帧状态、检查点和渲染缓存未包含；重建地形需另行准备原始高程数据。
4. 先运行 `python src/verify_sph3d.py`，再按原三维模板进行短时试算和长时程计算。使用新的运行名，避免覆盖已有成果。
5. 本包用于追溯和复现准备，不代表其他机器无需调整就能运行；网站集成未重跑 GPU 求解。历史一维/2.5D 结果不能当作三维结果，当前原型未经现场标定。
