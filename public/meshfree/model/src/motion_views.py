"""Additional fixed and Lagrangian-follow cameras from existing SPH results."""
import argparse
import json
import hashlib
import os
for thread_setting in ('MKL_NUM_THREADS','OPENBLAS_NUM_THREADS','OMP_NUM_THREADS'):
    os.environ[thread_setting]='1'
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
from matplotlib import colors, cm
from matplotlib.animation import FFMpegWriter
from mpl_toolkits.mplot3d.art3d import Poly3DCollection, Line3DCollection
import cloud_presentation as base

OUT=Path('D:/openclaw/codextemp/jilong_sph3d/cloud_480k_90min/presentation')
EXTRA={'05_east':('正东侧视',8,0), '06_south':('正南视图',12,-90),
       '07_follow':('颗粒群跟随',20,-65), '08_orbit_follow':('环绕跟随',24,-65)}

def tracking(out):
    meta=base.read_json(out/'cloud_metadata.json')
    records=base.read_json(out/'diagnostics_used.json')
    run=Path(meta['source_run'])
    ids=np.sort(np.random.default_rng(20260908).choice(meta['particle_count'],1200,replace=False))
    positions=[]; centers=[]
    for i,r in enumerate(records):
        with np.load(run/f"frame_{r['frame']:04d}.npz") as d:
            p=d['position_m']
            positions.append(p[ids].copy());centers.append(p.mean(axis=0,dtype=np.float64))
        if i%40==0:print(f'Tracking {i}/{len(records)}',flush=True)
    np.savez_compressed(out/'particle_tracking.npz',ids=ids,positions=np.array(positions),
                        centers=np.array(centers),times=np.array([r['time_s'] for r in records]))

def render(out,key,smoke=False):
    meta=base.read_json(out/'cloud_metadata.json')
    records=base.read_json(out/'diagnostics_used.json')
    files=sorted((out/'cloud_cache').glob('cloud_*.npz'))
    follow=key in ('07_follow','08_orbit_follow')
    track=np.load(out/'particle_tracking.npz')
    origin=np.r_[meta['origin_xy_m'],0.]
    centers=track['centers']-origin
    points=track['positions']-origin
    times=track['times']
    X,Y,Z=base.terrain_crop(meta)
    label,elev,azim=EXTRA[key]
    norm=colors.Normalize(*meta['speed_color_range_m_s']);cmap=plt.get_cmap('turbo')
    fig=plt.figure(figsize=(12.8,7.2),dpi=150,facecolor='white')
    fig.text(.045,.95,'吉隆源区 · 三维速度云图与颗粒运动',fontsize=17,color='#182b3a')
    title=fig.text(.045,.91,'',fontsize=11,color='#526675')
    fig.text(.045,.052,'480,000 个计算粒子 · 90 分钟已完成计算 · 非匀速回放，以物理时间为准',fontsize=9,color='#526675')
    note='镜头随全部颗粒重心平移；叠加 1,200 个固定编号示踪点及 20 条轨迹' if follow else '固定方位透视镜头 · 三维表面速度场 · 原始地形比例'
    if key=='08_orbit_follow':note+='；方位角另作环绕'
    fig.text(.045,.022,note,fontsize=8,color='#526675')
    ax=fig.add_axes([.005,.095,.84,.77],projection='3d',computed_zorder=False)
    if not follow:
        ax.plot_surface(X,Y,Z,color='#c5c7c1',edgecolor='none',alpha=.35,zorder=1,antialiased=False)
    ax.view_init(elev=elev,azim=azim)
    zlo=min(Z.min(),meta['bounds_min_m'][2])-8
    zhi=max(Z.max(),meta['bounds_max_m'][2])+8
    ax.set(xlim=(X.min(),X.max()),ylim=(Y.min(),Y.max()),zlim=(zlo,zhi),
           xlabel='东向 / m',ylabel='北向 / m',zlabel='高程 / m')
    ax.set_box_aspect([np.ptp(X),np.ptp(Y),zhi-zlo],zoom=1.1)
    ax.grid(False);ax.tick_params(labelsize=8)
    cb=fig.colorbar(cm.ScalarMappable(norm=norm,cmap=cmap),cax=fig.add_axes([.89,.24,.016,.48]))
    cb.set_label('重建表面速度 / (m/s)',fontsize=10)
    artists=[]
    def draw(k):
        for a in artists:a.remove()
        artists.clear()
        with np.load(files[k]) as d:
            v=d['vertices_m'].astype(float)-origin;f=d['faces']
            if follow:
                within=np.all(np.abs(v[:,:2]-centers[k,:2])<=470,axis=1)
                f=f[np.all(within[f],axis=1)]
            values=d['speed_m_s'][f].mean(axis=1)
            cloud=Poly3DCollection(v[f],facecolors=cmap(norm(values)),edgecolor='none',
                                  linewidth=0,antialiased=False,zorder=3,alpha=.92 if follow else 1.)
        ax.add_collection3d(cloud);artists.append(cloud)
        title.set_text(f'{label}  |  物理时间 {times[k]/60:.2f} min  |  '+('局部跟随视窗' if follow else '固定镜头'))
        if follow:
            center=centers[k]
            ix=np.abs(X[0]-center[0])<=470;iy=np.abs(Y[:,0]-center[1])<=470
            patch=np.ix_(iy,ix)
            ground=ax.plot_surface(X[patch],Y[patch],Z[patch],color='#c5c7c1',edgecolor='none',
                                   alpha=.35,zorder=1,antialiased=False)
            artists.append(ground)
            ax.set_xlim(center[0]-470,center[0]+470)
            ax.set_ylim(center[1]-470,center[1]+470)
            ax.set_zlim(center[2]-160,center[2]+220)
            ax.set_box_aspect([940,940,380],zoom=1.15)
            angle=azim+240*k/(len(files)-1) if key=='08_orbit_follow' else azim
            ax.view_init(elev=elev,azim=angle)
            p=points[k]
            p=p[np.all(np.abs(p[:,:2]-center[:2])<=470,axis=1)]
            dots=ax.scatter(*p.T,s=1.5,c='#eafaff',edgecolors='#102c3b',linewidths=.12,
                            alpha=.65,depthshade=False,zorder=5)
            artists.append(dots)
            start=max(0,int(np.searchsorted(times,times[k]-120)))
            if k>start:
                segments=[points[start:k+1,i] for i in range(0,1200,60)]
                lines=Line3DCollection(segments,colors='#162e3b',linewidths=.7,alpha=.65,zorder=4)
                ax.add_collection3d(lines);artists.append(lines)
    # Early motion is slowed by repeating saved frames, not inventing new physics.
    sequence=[k for k in range(len(files)) for _ in range(3 if times[k]<=120 else 1)]+[len(files)-1]*24
    if smoke:
        for k in (4,60,len(files)-1):
            draw(k);fig.savefig(out/'images'/f'{key}_check_{k:04d}.png',dpi=150)
        plt.close(fig);return
    writer=FFMpegWriter(fps=12,codec='libx264',bitrate=6500,
                       extra_args=['-pix_fmt','yuv420p','-movflags','+faststart','-threads','2'])
    with writer.saving(fig,str(out/'videos'/f'{key}.mp4'),150):
        assert writer.frame_format=='rgba'
        previous=None
        for j,k in enumerate(sequence):
            if k!=previous:
                draw(k);fig.canvas.draw()
                frame=bytes(fig.canvas.buffer_rgba());previous=k
            writer._proc.stdin.write(frame)
            if j%60==0:print(f'{key}: {j}/{len(sequence)}',flush=True)
    draw(int(np.argmax([r['mean_speed_m_s'] for r in records])))
    fig.savefig(out/'images'/f'{key}.png',dpi=150);plt.close(fig)
    manifest={'file':f'{key}.mp4','angle':label,'physical_duration_s':float(times[-1]),
              'particle_count':meta['particle_count'],'resolution':[1920,1080],
              'frames':len(sequence),'duration_s':len(sequence)/12,'follow_mass_centroid':follow,
              'overlay_fixed_particle_ids':1200 if follow else 0,'trail_count':20 if follow else 0,
              'trail_history_s':120 if follow else 0,'camera_orbits':key=='08_orbit_follow',
              'interpolated_physics':False,'note':'tracers are a diagnostic overlay; the cloud uses all particles'}
    (out/f'manifest_{key}.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

def page(out):
    items={**EXTRA,**base.ANGLES}
    order=['07_follow','08_orbit_follow','05_east','06_south',*base.ANGLES]
    cards=[]
    for key in order:
        label=items[key][0]
        cards.append(f'<article id="{key}"><h2>{label}</h2><video controls preload="none" poster="images/{key}.png" src="videos/{key}.mp4" aria-label="{label}"></video><p><a href="videos/{key}.mp4">独立打开 / 保存此视频</a></p></article>')
    text='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>吉隆 · 多方位与颗粒跟随视频</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f3f6f8;color:#193447;font:16px/1.6 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1440px;margin:auto;padding:28px 24px}h1{font-size:27px;margin-bottom:8px}h2{font-size:19px;margin:14px 18px}p{color:#567080}a{color:#12618c}nav{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}article,figure{margin:0;background:white;border:1px solid #d9e3e9;border-radius:12px;overflow:hidden}article p{margin:10px 18px}video,img{display:block;width:100%;aspect-ratio:16/9}section{margin-top:30px}figcaption{padding:12px 18px}footer{margin:28px 0;color:#567080;font-size:14px}@media(max-width:760px){main{padding:18px 12px}.grid{grid-template-columns:1fr}h1{font-size:23px}}</style>
<main><h1>吉隆源区 · 多方位云图与颗粒跟随</h1><p>480,000 个独立动力粒子 · 完整 90 分钟过程 · 8 个独立视频，不再隐藏在切换标签中</p>
<nav><a href="#07_follow">颗粒群跟随</a><a href="#08_orbit_follow">环绕跟随</a><a href="#05_east">正东侧视</a><a href="#06_south">正南视图</a><a href="#01_southeast">原有四方位</a></nav>
<p>跟随镜头依据全部颗粒的重心移动；浅色点为 1,200 个固定编号颗粒的示踪叠加，细线表示其中 20 个颗粒最近 120 秒的已保存轨迹。云图仍使用全部 48 万粒子。局部跟随窗口可能裁去外围区域。</p>
<div class="grid">__CARDS__</div><section><h2>其余内容 · 静态图片</h2><div class="grid"><figure><img src="images/process_curves.png" alt="过程曲线"><figcaption>计算过程</figcaption></figure><figure><img src="images/settings.png" alt="模型参数"><figcaption>原计算参数（本次仅增加观察镜头）</figcaption></figure></div></section>
<footer>新增视频约 32 秒，原视频约 22 秒；回放不是匀速时间压缩，以画面物理时间为准。后期颗粒滞留较多，镜头跟随不代表流体一直快速前进。所有视角均为同一算例，不是新的物理计算。未耦合融化与侵蚀，未经现场标定，不能用于实际灾害预测。</footer></main>
<script>document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause()})));</script></html>'''
    (out/'index.html').write_text(text.replace('__CARDS__',''.join(cards)),encoding='utf-8')

def verify(out):
    checks=[]
    with np.load(out/'particle_tracking.npz') as d:
        assert d['positions'].shape==(237,1200,3)
        assert len(np.unique(d['ids']))==1200
        assert np.isfinite(d['positions']).all() and np.isfinite(d['centers']).all()
        assert d['times'][0]==0 and d['times'][-1]==5400 and np.all(np.diff(d['times'])>0)
    for key in {**base.ANGLES,**EXTRA}:
        f=out/'videos'/f'{key}.mp4'
        r=subprocess.run([base.imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-i',str(f),'-f','null','-'],capture_output=True,text=True)
        if r.returncode or r.stderr.strip():raise RuntimeError(f'{f}: {r.stderr}')
        checks.append({'file':f.name,'bytes':f.stat().st_size,'decode_ok':True})
    (out/'motion_quality_check.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
    sources=[Path(__file__).resolve(),Path(base.__file__).resolve(),out/'cloud_metadata.json',
             out/'diagnostics_used.json',out/'particle_tracking.npz']
    provenance={str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in sources}
    (out/'motion_provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--angle',choices=list(EXTRA));parser.add_argument('--smoke',action='store_true');parser.add_argument('--page-only',action='store_true')
    args=parser.parse_args()
    os.environ['TEMP']='D:/openclaw/codextemp';os.environ['TMP']=os.environ['TEMP']
    if args.page_only:page(OUT);return
    if not (OUT/'particle_tracking.npz').exists():tracking(OUT)
    if args.angle:render(OUT,args.angle,args.smoke);return
    def child(key):
        subprocess.run([sys.executable,'-u',str(Path(__file__).resolve()),'--angle',key],check=True)
    with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(child,EXTRA))
    verify(OUT);page(OUT)
    print('COMPLETE: eight views including moving particle-follow cameras',flush=True)

if __name__=='__main__':main()
