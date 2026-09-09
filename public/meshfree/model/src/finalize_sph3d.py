"""Validate the completed run, export ParaView state, then render all views."""
import json
import time
import sys
import subprocess
import argparse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
from scipy.ndimage import map_coordinates

ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--tag',default='baseline_90min')
    parser.add_argument('--wait',action='store_true')
    args=parser.parse_args()
    cfg=json.loads((ROOT/'config/sph3d.json').read_text(encoding='utf-8'))
    out=Path(cfg['output_root'])/args.tag
    while not (out/'summary.json').exists():
        if not args.wait:raise RuntimeError('Run has not completed')
        time.sleep(15)
    summary=json.loads((out/'summary.json').read_text())
    used=json.loads((out/'config_used.json').read_text())
    assert summary['completed'] and abs(summary['duration_s']-used['duration_s'])<1e-5
    terrain=np.load(ROOT/'data/processed/terrain_model.npz')
    dx=terrain['x'][1]-terrain['x'][0]
    dy=terrain['y_desc'][1]-terrain['y_desc'][0]
    minimum_distance=np.inf
    maximum_penetration=0.
    times=[]
    count=summary['particle_count']
    files=sorted(out.glob('frame_*.npz'))
    for file in files:
        data=np.load(file)
        pos=data['position_m'];vel=data['velocity_m_s']
        assert pos.shape==(count,3) and vel.shape==(count,3)
        assert np.isfinite(pos).all() and np.isfinite(vel).all()
        minimum_distance=min(minimum_distance,float(np.linalg.norm(pos[:,:2],axis=1).min()))
        cols=(pos[:,0]-terrain['x'][0])/dx
        rows=(pos[:,1]-terrain['y_desc'][0])/dy
        ground=map_coordinates(terrain['elevation'],[rows,cols],order=1,mode='nearest')
        maximum_penetration=max(maximum_penetration,float(np.max(ground-pos[:,2])))
        times.append(float(data['time_s']))
    assert (np.diff(times)>0).all() and times[0]==0 and abs(times[-1]-summary['duration_s'])<1e-5
    assert maximum_penetration<0.01
    assert summary['mass_relative_change']==0
    last=np.load(files[-1])
    speed=np.linalg.norm(last['velocity_m_s'],axis=1)
    qa={'frames_checked':len(files),'particles_per_frame':count,'completed_duration_s':times[-1],
        'mass_relative_change':summary['mass_relative_change'],'nonfinite_values':0,
        'maximum_ground_penetration_m':maximum_penetration,
        'minimum_particle_distance_to_port_m':minimum_distance,
        'final_mean_speed_m_s':float(speed.mean()),'final_max_speed_m_s':float(speed.max()),
        'interpretation':'hypothetical source release, not a validated port-reaching debris-flow prediction'}
    (out/'quality_check.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    # Portable legacy ASCII VTK; each computational parcel remains a vertex.
    with (out/'final_particles_3d.vtk').open('w',encoding='ascii') as f:
        f.write('# vtk DataFile Version 3.0\n3D SPH computed state\nASCII\nDATASET POLYDATA\n')
        f.write(f'POINTS {count} float\n')
        np.savetxt(f,last['position_m'],fmt='%.6f')
        f.write(f'VERTICES {count} {2*count}\n')
        np.savetxt(f,np.column_stack([np.ones(count,dtype=int),np.arange(count)]),fmt='%d')
        f.write(f'POINT_DATA {count}\nVECTORS velocity_m_s float\n')
        np.savetxt(f,last['velocity_m_s'],fmt='%.7f')
        f.write('SCALARS speed_m_s float 1\nLOOKUP_TABLE default\n')
        np.savetxt(f,speed,fmt='%.7f')
    volume=count*used['particle_spacing_m']**3
    reach_note=('没有进入以口岸为中心的 1 km 平面邻域。' if minimum_distance>1000 else
                '进入了以口岸为中心的 1 km 平面邻域；这不等同于重现实际灾害。')
    result=f'''# 三维 SPH 运行记录：{args.tag}

实际计算完成 {times[-1]/60:.1f} 分钟，{count:,} 个独立三维动力粒子，保存 {len(files)} 帧。粒子间距 {summary['particle_spacing_m']} m；输入参考体积 {volume/10000:.2f} 万 m³。全程积分，未使用静态尾帧代替后期动力计算。

全部帧均通过有限值、粒子数、时间连续性和地面非穿透检查。固定质量相对变化为 0。最终平均速度 {speed.mean():.4f} m/s，最大速度 {speed.max():.3f} m/s。

所有保存时刻中，距离口岸最近的粒子相距约 {minimum_distance/1000:.2f} km（平面直线距离）。{reach_note}需要实际湖盆、缺口/溃口、出流过程、沟道和物源信息后才能进一步构造对应事件；不能凭旧版路径强制三维粒子到达口岸。

保存帧中的最大密度比为 {summary['peak_density_ratio']:.3f}。声速 {used['sound_speed_m_s']} m/s 的原型存在局部约 {(summary['peak_density_ratio']-1)*100:.1f}% 压缩；基础程序核查不等于空间/时间收敛或工程验证。固定 DEM 接触、单一混合物宾汉流变和一次性源区释放均为当前简化。尚未求解冰融化传热、固液分相和侵蚀裹挟。

视频：`videos/01_volume.mp4` 三维透视；`02_plan.mp4` 俯视；`03_side.mp4` 侧视；`04_diagnostics.mp4` 过程曲线。每段视频的物理时间均以画面标题为准；前两分钟和后续阶段采用不同压缩倍率。三维视图使用半透明地形及粒子叠加，便于看清全部粒子，属于科学可视化。

可复用方法见项目 `THREE_DIMENSIONAL_TEMPLATE.md`。原始三维状态、配置、检查点和最终 VTK 均在本目录；该成果目录虽位于 codextemp 中，不应随意清理。
'''
    (out/'RESULTS_3D.md').write_text(result,encoding='utf-8')
    print(json.dumps(qa),flush=True)
    components=['01_volume','02_plan','03_side','04_diagnostics']
    def render(component):
        subprocess.run([sys.executable,str(ROOT/'src/render_sph3d.py'),'--tag',args.tag,'--component',component],check=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(render,components))
    manifest=[]
    for component in components:
        manifest.extend(json.loads((out/'videos'/f'manifest_{component}.json').read_text()))
    (out/'videos'/'manifest_all.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('Completed validation, VTK export, report and all four videos.',flush=True)

if __name__=='__main__':main()
