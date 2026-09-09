# 吉隆口岸冰川融水—泥石流无网格模型

## 最新入口：48 万粒子云图版

真实动力粒子增加为 480000（24000 的 20 倍），源区体积和外形保持不变；仅生成四个角度的连续速度云图视频，其余为静态图片。配置、后台运行及展示页说明见 [48 万粒子云图模板](CLOUD_480K_TEMPLATE.md)。完整时长以运行目录的完成状态为准，短时预览与完整结果分开保存。

## 当前入口：三维 SPH

整体升级的三维求解器为 `src/simulate_sph3d.py`，配置为 `config/sph3d.json`。采用独立 xyz 运动、三维压力及正则化宾汉黏性，默认 24000 个体积粒子，目标时长 90 分钟。运行方法、边界假设和验证要求见 [三维可复用模板](THREE_DIMENSIONAL_TEMPLATE.md)。实际完成情况读取 D 盘对应运行目录的 `summary.json`。

以下内容描述旧一维/2.5D版本，保留用于追溯；旧到达时间、裹挟倍数和视频不属于三维结果。

完整的场地替换、参数配置、运行、校核和交付流程见 `REUSABLE_SIMULATION_TEMPLATE.md`。

## 模型定位

这是一个能够运行的研究级初模，采用两级表达：

1. 真实地形模型：利用约 30 m 高程数据构建 Purepu 冰川源区至吉隆口岸的地形、纵剖面、谷地宽度和三角地表。
2. 无网格运动模型：在提取的谷地中心线上采用一维深度平均 SPH，模拟冰川融水/冰面湖快速排水形成高含沙洪流，并在下游侵蚀裹挟后演化为泥石流。

一维 SPH 是用于确定参数量级、计算域和情景包络的降阶模型，不等同于经过现场标定的三维泥石流预测模型。后续三维计算可直接复用地形面、路径、谷宽和参数文件。

## 场景假设

当前版本把用户提出的“冰川融化后引发泥石流”具体化为 2025 年 Purepu 冰川冰面湖快速排水情景：

- 源点：28.402561°N，85.646705°E；
- 受影响点：吉隆口岸/热索瓦口岸；
- 初始释放体积：300 万 m³，仅为基线假设；
- 数值离散：1200 个粗粒化 SPH 计算粒子，源区初始沿程间距 0.75 m；
- 下游裹挟放大：至口岸总质量达到初始值的 6 倍；
- 流体：高含沙、流态化混合物；
- 基底：固定真实地形；
- 触发：源区物质瞬时释放。

初始体积、流变参数和裹挟倍数不是现场反演结果，不应作为工程结论。

这里的 SPH 粒子是携带体积、质量和动量的计算单元，不对应单颗砂石。1200 个粒子适合当前一维深度平均初筛模型；若要描述真实粒径、横向漫流和建筑物绕流，需要转为二维/三维多相 SPH，并进行网格无关性（粒子间距无关性）检验。

## 文件结构

```text
config/model_config.json       场地与情景参数
data/raw/                      原始高程数据
data/processed/                地形、路径和粒子初始条件
outputs/                       图片、曲线、结果表和 VTK 文件
src/build_terrain.py           地形与谷地模型构建
src/simulate_sph.py            一维深度平均 SPH 基线模拟
```

## 运行

在本目录执行：

```powershell
python src/build_terrain.py
python src/simulate_sph.py
python src/build_refined_2p5d.py
python src/create_video.py
python src/create_component_videos.py
```

## 输出

- `terrain_model.npz`：裁剪后的地形和谷地路径；
- `terrain_surface.vtk`：可在 ParaView 中查看的三角地形；
- `flow_path.csv`：源区至口岸的中心线、纵坡和估算谷宽；
- `source_particles.csv`：三维升级时可复用的源区粒子种子；
- `terrain_overview.png`：地形与计算路径；
- `longitudinal_profile.png`：纵剖面与谷宽；
- `simulation_history.csv`：前缘、速度、体积和到达状态；
- `final_particles.vtk`：最终 SPH 粒子；
- `sph_summary.json`：基线模拟摘要。
- `particle_history.npz`：视频和后处理使用的逐时刻粒子状态；
- `gyirong_debrisflow_sph_simulation.mp4`：仿真结果视频。
- `particle_history_2p5d.npz`：将1200个动力粒子细分为6000个地形跟随横向子粒子的高保真表达；
- `component_videos/01_terrain_plan_view.mp4`：真实地形俯视传播；
- `component_videos/02_terrain_3d_perspective.mp4`：三维山谷透视传播；
- `component_videos/03_longitudinal_profile.mp4`：纵剖面传播；
- `component_videos/04_process_diagnostics.mp4`：前缘、速度、体积和流深过程。

## 升级为工程级模型前必须补充

1. 灾前和灾后高分辨率 DEM 或无人机/LiDAR 点云；
2. 实际冰湖水位—面积—库容关系或冰岩崩体积；
3. 沟道松散物储量、可侵蚀厚度和粒径组成；
4. 泥石流密度、屈服应力、黏度或等效摩阻参数；
5. 实际到达时间、流痕高程、峰值流量和堆积厚度；
6. 口岸建筑、桥梁和局部河谷的精细三维几何。

完成这些数据补充后，应把当前一维模型用于参数初筛，再建立二维深度平均 SPH 或三维非牛顿 SPH 模型进行正式计算。
