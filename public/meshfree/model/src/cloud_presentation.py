"""Continuous speed-cloud videos; every non-cloud deliverable is a static image.

Uses volume-weighted Gaussian reconstruction of all computed particles solely
for visualization. The reconstructed display grid does not enter the SPH solve.
"""
import argparse
import json
import time
import html
import subprocess
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates
from skimage.measure import marching_cubes
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import colors, cm
from matplotlib.animation import FFMpegWriter
from matplotlib.ticker import MaxNLocator
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
plt.rcParams.update({'font.sans-serif':['Microsoft YaHei','DejaVu Sans'],
                     'axes.unicode_minus':False,'axes.spines.top':False,'axes.spines.right':False,
                     'savefig.facecolor':'white','animation.ffmpeg_path':imageio_ffmpeg.get_ffmpeg_exe()})
ANGLES={'01_southeast':('东南斜视',32,-65),'02_northwest':('西北斜视',32,115),
        '03_low_angle':('低角度侧视',15,20),'04_top':('垂直俯视',90,-90)}

def read_json(path):
    for _ in range(10):
        try:return json.loads(path.read_text(encoding='utf-8'))
        except (json.JSONDecodeError,FileNotFoundError):time.sleep(0.5)
    raise RuntimeError(f'Cannot read a complete JSON file: {path}')

def prepare(run,out,max_time=None):
    cfg=read_json(run/'config_used.json')
    records=read_json(run/'diagnostics.json')
    records=[r for r in records if max_time is None or r['time_s']<=max_time+1e-6]
    files=[run/f"frame_{r['frame']:04d}.npz" for r in records]
    out.mkdir(parents=True,exist_ok=True)
    cache=out/'cloud_cache';cache.mkdir(exist_ok=True)
    low=np.full(3,np.inf);high=-low
    for f in files:
        with np.load(f) as d:
            p=d['position_m'];low=np.minimum(low,p.min(axis=0));high=np.maximum(high,p.max(axis=0))
    n=records[0]['particles']
    origin=np.load(files[0])['position_m'][:,:2].mean(axis=0).astype(float)
    # Fixed grid and support keep cloud geometry and color consistent over time.
    spacing=3.0
    lo=np.floor(low/spacing)*spacing-3*spacing
    shape=np.ceil((high+3*spacing-lo)/spacing).astype(int)+1
    if np.prod(shape)>65000000:
        spacing*=float((np.prod(shape)/65000000)**(1/3))
        lo=np.floor(low/spacing)*spacing-3*spacing
        shape=np.ceil((high+3*spacing-lo)/spacing).astype(int)+1
    volume=records[0]['reference_volume_m3']/n
    vmax=max(5.,np.ceil(max(r['max_speed_m_s'] for r in records)/5)*5)
    metadata={'particle_count':n,'times_s':[r['time_s'] for r in records],
              'target_duration_s':cfg['duration_s'],'completed_duration_s':records[-1]['time_s'],
              'origin_xy_m':origin.tolist(),'bounds_min_m':low.tolist(),'bounds_max_m':high.tolist(),
              'speed_color_range_m_s':[0,float(vmax)],'display_grid_m':spacing,
              'isosurface_volume_fraction':0.20,'surface_sampling_step':2,
              'method':'all-particle reference-volume-weighted Gaussian reconstruction; speed magnitude; display only',
              'source_run':str(run),'source_config':cfg,'preview':max_time is not None}
    for f,r in zip(files,records):
        target=cache/f"cloud_{r['frame']:04d}.npz"
        with np.load(f) as d:
            p=d['position_m'];speed=np.linalg.norm(d['velocity_m_s'],axis=1)
        indices=np.floor((p-lo)/spacing).astype(np.int32)
        flat=np.ravel_multi_index(indices.T,tuple(shape))
        concentration=np.bincount(flat,minlength=int(np.prod(shape))).reshape(tuple(shape)).astype(np.float32)
        concentration*=volume/spacing**3
        weighted=np.bincount(flat,weights=speed,minlength=int(np.prod(shape))).reshape(tuple(shape)).astype(np.float32)
        weighted*=volume/spacing**3
        concentration=gaussian_filter(concentration,0.8,mode='constant')
        weighted=gaussian_filter(weighted,0.8,mode='constant')
        field=weighted/np.maximum(concentration,1e-8)
        vertices,faces,_,_=marching_cubes(concentration,level=0.20,spacing=(spacing,)*3,step_size=2,allow_degenerate=False)
        speed_surface=map_coordinates(field,(vertices/spacing).T,order=1,mode='nearest')
        vertices+=lo+0.5*spacing
        # 2-D cloud is reference-volume-weighted column mean speed, explicitly
        # distinct from speed sampled on the 3-D reconstructed isosurface.
        columns=concentration.sum(axis=2)
        plan=weighted.sum(axis=2)/np.maximum(columns,1e-8)
        mask=columns*spacing>0.25
        np.savez_compressed(target,vertices_m=vertices.astype(np.float32),faces=faces.astype(np.int32),
                            speed_m_s=speed_surface.astype(np.float32),plan_speed=plan.astype(np.float32),
                            plan_mask=mask,plan_origin=lo[:2],grid_spacing=np.array(spacing),time_s=np.array(r['time_s']))
        print(f"Cloud reconstruction: t={r['time_s']:.1f}s; {len(faces)} faces",flush=True)
    (out/'cloud_metadata.json').write_text(json.dumps(metadata,indent=2,ensure_ascii=False),encoding='utf-8')
    (out/'diagnostics_used.json').write_text(json.dumps(records,indent=2),encoding='utf-8')

def terrain_crop(meta):
    d=np.load(ROOT/'data/processed/terrain_model.npz')
    low=np.array(meta['bounds_min_m']);high=np.array(meta['bounds_max_m']);origin=np.array(meta['origin_xy_m'])
    pad=np.maximum(80.,0.08*(high-low))
    ix=np.where((d['x']>low[0]-pad[0])&(d['x']<high[0]+pad[0]))[0]
    iy=np.where((d['y_desc']>low[1]-pad[1])&(d['y_desc']<high[1]+pad[1]))[0]
    ix=ix[::max(1,len(ix)//70)];iy=iy[::max(1,len(iy)//70)]
    X,Y=np.meshgrid(d['x'][ix]-origin[0],d['y_desc'][iy]-origin[1])
    return X,Y,d['elevation'][np.ix_(iy,ix)]

def render(out,angle):
    meta=read_json(out/'cloud_metadata.json')
    records=read_json(out/'diagnostics_used.json')
    files=sorted((out/'cloud_cache').glob('cloud_*.npz'))
    X,Y,Z=terrain_crop(meta)
    origin=np.array(meta['origin_xy_m'])
    videos=out/'videos';images=out/'images';videos.mkdir(exist_ok=True);images.mkdir(exist_ok=True)
    norm=colors.Normalize(*meta['speed_color_range_m_s']);cmap=plt.get_cmap('turbo')
    fig=plt.figure(figsize=(12.8,7.2),dpi=150,facecolor='white')
    fig.text(0.055,0.955,'吉隆源区 · 三维 SPH 速度云图',fontsize=17,color='#182b3a',weight='medium')
    status=fig.text(0.055,0.915,'',fontsize=11,color='#526675')
    label,elev,azim=ANGLES[angle]
    prefix='短时预览' if meta['preview'] else '完整计算'
    fig.text(0.055,0.055,f"{prefix}  ·  {meta['particle_count']:,} 动力粒子  ·  参考体积不变  ·  时间以标题为准",fontsize=9,color='#526675')
    fig.text(0.945,0.025,'核平滑重建用于显示；固定 DEM / 未经现场标定',ha='right',fontsize=8,color='#77838d')
    if angle=='04_top':
        ax=fig.add_axes([0.055,0.13,0.76,0.72])
        ax.pcolormesh(X,Y,Z,cmap='Greys',shading='auto',alpha=0.13)
        ax.contour(X,Y,Z,levels=10,colors='#aeb5b8',linewidths=0.45,zorder=1)
        ax.set_aspect('equal');ax.set_xlim(X.min(),X.max());ax.set_ylim(Y.min(),Y.max())
        ax.set_xlabel('东向距离 / m');ax.set_ylabel('北向距离 / m')
    else:
        ax=fig.add_axes([0.005,0.085,0.84,0.79],projection='3d',computed_zorder=False)
        ax.plot_surface(X,Y,Z,color='#c5c7c1',edgecolor='none',linewidth=0,alpha=0.40,antialiased=False,zorder=1)
        ax.view_init(elev=elev,azim=azim)
        low=np.array(meta['bounds_min_m']);high=np.array(meta['bounds_max_m'])
        ax.set_xlim(X.min(),X.max());ax.set_ylim(Y.min(),Y.max())
        zlo=min(Z.min(),low[2])-8;zhi=max(Z.max(),high[2])+8
        ax.set_zlim(zlo,zhi)
        ax.set_box_aspect([np.ptp(X),np.ptp(Y),zhi-zlo],zoom=1.08)
        ax.set_xlabel('东向 / m',labelpad=8);ax.set_ylabel('北向 / m',labelpad=8);ax.set_zlabel('高程 / m',labelpad=6)
        for axis in [ax.xaxis,ax.yaxis,ax.zaxis]:axis.set_major_locator(MaxNLocator(4))
        ax.tick_params(labelsize=8)
        ax.grid(False)
    cb=fig.colorbar(cm.ScalarMappable(norm=norm,cmap=cmap),cax=fig.add_axes([0.885,0.24,0.016,0.48]))
    cb.set_label('柱平均速度 / (m/s)' if angle=='04_top' else '表面速度 / (m/s)',fontsize=10)
    artist=None
    def draw(k):
        nonlocal artist
        d=np.load(files[k])
        t=float(d['time_s'])
        status.set_text(f'{label}   |   物理时间 {t/60:.2f} min   |   速度场')
        if artist is not None:artist.remove()
        if angle=='04_top':
            plan=np.ma.masked_where(~d['plan_mask'].T,d['plan_speed'].T)
            o=d['plan_origin']-origin;ds=float(d['grid_spacing'])
            artist=ax.imshow(plan,origin='lower',extent=[o[0],o[0]+plan.shape[1]*ds,o[1],o[1]+plan.shape[0]*ds],
                             cmap=cmap,norm=norm,interpolation='bilinear',zorder=3)
        else:
            verts=d['vertices_m'].copy();verts[:,:2]-=origin
            faces=d['faces'];values=d['speed_m_s'][faces].mean(axis=1)
            artist=Poly3DCollection(verts[faces],facecolors=cmap(norm(values)),edgecolor='none',linewidth=0,
                                    antialiased=False,zorder=3)
            ax.add_collection3d(artist)
    # Keep the preview readable; full output includes every physical snapshot.
    fps=12
    repeats=max(1,int(np.ceil(12*12/max(1,len(files))))) if meta['preview'] else 1
    sequence=[k for k in range(len(files)) for _ in range(repeats)]+[len(files)-1]*24
    writer=FFMpegWriter(fps=fps,codec='libx264',bitrate=6500,extra_args=['-pix_fmt','yuv420p','-movflags','+faststart','-threads','2'])
    with writer.saving(fig,str(videos/f'{angle}.mp4'),150):
        previous=None
        for j,k in enumerate(sequence):
            if k!=previous:draw(k);previous=k
            writer.grab_frame()
            if j%60==0:print(f'{angle}: {j}/{len(sequence)}',flush=True)
    poster=int(np.argmax([r['mean_speed_m_s'] for r in records]))
    draw(poster);fig.savefig(images/f'{angle}.png',dpi=150)
    plt.close(fig)
    manifest={'file':f'{angle}.mp4','angle':label,'physical_duration_s':meta['completed_duration_s'],
              'particle_count':meta['particle_count'],'resolution':[1920,1080],
              'duration_s':len(sequence)/fps,'frames':len(sequence),'preview':meta['preview']}
    (out/f'manifest_{angle}.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

def static_images(out):
    meta=read_json(out/'cloud_metadata.json');d=read_json(out/'diagnostics_used.json')
    dest=out/'images';dest.mkdir(exist_ok=True)
    t=np.array([r['time_s']/60 for r in d])
    fig,axes=plt.subplots(2,2,figsize=(12.8,7.2),dpi=150)
    fig.suptitle('计算过程 · 静态曲线',x=0.07,ha='left',fontsize=17,color='#182b3a')
    fields=[('max_speed_m_s','最大速度 / (m/s)'),('mean_speed_m_s','平均速度 / (m/s)'),
            ('density_ratio_p99','密度比 · 99 分位'),('kinetic_energy_J','动能 / GJ')]
    for ax,(key,label) in zip(axes.flat,fields):
        y=np.array([r[key] for r in d]);y=y/1e9 if key=='kinetic_energy_J' else y
        ax.plot(t,y,color='#187cad',lw=2);ax.set_ylabel(label);ax.set_xlabel('物理时间 / min');ax.grid(alpha=0.16)
    fig.tight_layout(rect=[0.035,0.05,0.98,0.94]);fig.savefig(dest/'process_curves.png');plt.close(fig)
    cfg=meta['source_config'];dims=np.array(cfg.get('source_dimensions_m',[400,150,50]));sp=dims/np.array(cfg['source_lattice_shape'])
    rows=[['真实动力粒子',f"{meta['particle_count']:,}（上一版的 20 倍）"],
          ['源区外形',f'{dims[0]:.0f} × {dims[1]:.0f} × {dims[2]:.0f} m'],
          ['三方向初始间距',' × '.join(f'{v:.3f}' for v in sp)+' m'],
          ['参考释放体积',f"{d[0]['reference_volume_m3']/1e6:.2f} 百万 m³"],
          ['当前展示时长',f"{meta['completed_duration_s']/60:.2f} min"],
          ['完整目标时长',f"{meta['target_duration_s']/60:.0f} min"],
          ['云图重建','全部粒子体积加权 · 高斯平滑 · 固定色标'],
          ['视频内容','东南 / 西北 / 低角度 / 俯视速度云图'],
          ['其余内容','参数、曲线和摘要均为静态图片'],
          ['模型范围','三维 SPH 原型；固定 DEM；尚无融化与侵蚀耦合']]
    fig,ax=plt.subplots(figsize=(12.8,7.2),dpi=150);ax.axis('off')
    fig.suptitle('模型与显示设置 · 静态说明',x=0.055,ha='left',fontsize=17,color='#182b3a')
    table=ax.table(cellText=rows,colWidths=[0.23,0.73],cellLoc='left',bbox=[0,0.01,1,0.95])
    table.auto_set_font_size(False);table.set_fontsize(11)
    for (row,col),cell in table.get_celld().items():
        cell.set_edgecolor('#e4e9ee');cell.set_linewidth(0.5);cell.set_facecolor('#f5f7f9' if col==0 else 'white')
    fig.subplots_adjust(left=0.055,right=0.96,top=0.9,bottom=0.045);fig.savefig(dest/'settings.png');plt.close(fig)

def page(out):
    meta=read_json(out/'cloud_metadata.json')
    status='短时预览 · 完整计算进行中' if meta['preview'] else '完整结果'
    buttons=''.join(f'<button type="button" data-angle="{key}" aria-pressed="{str(i==0).lower()}">{value[0]}</button>' for i,(key,value) in enumerate(ANGLES.items()))
    document='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>吉隆 · 48 万粒子云图</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#182b3a;font:16px/1.6 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1240px;margin:auto;padding:32px 24px 60px}header{display:flex;justify-content:space-between;gap:20px;align-items:center}h1{font-size:26px;font-weight:600;margin:0}p{margin:6px 0;color:#60717e}.state{font-size:13px;background:#edf2f6;padding:5px 12px;border-radius:6px;white-space:nowrap}.viewer{margin-top:24px;background:white;border:1px solid #dde4e9;border-radius:12px;overflow:hidden}nav{padding:14px 20px;border-bottom:1px solid #e6ebef;display:flex;gap:12px;flex-wrap:wrap}button{font:inherit;color:#506575;border:0;background:transparent;padding:8px 14px;cursor:pointer;border-radius:6px}button[aria-pressed=true]{background:#e9f1f7;color:#135b8b}button:focus-visible{outline:2px solid #287ca8;outline-offset:2px}video{display:block;width:100%;aspect-ratio:16/9;background:#fff}.caption{padding:14px 22px;display:flex;justify-content:space-between;gap:15px;font-size:13px;color:#60717e}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:26px}figure{margin:0;background:white;border:1px solid #dde4e9;border-radius:10px;overflow:hidden}figure img{width:100%;display:block}figcaption{padding:12px 18px;font-size:14px}footer{margin-top:25px;font-size:13px;color:#687b87}a{color:#14638d}@media(max-width:700px){main{padding:20px 12px}header{display:block}h1{font-size:22px}.state{display:inline-block;margin-top:8px}.grid{grid-template-columns:1fr}.caption{display:block}nav{gap:4px;padding:8px}button{font-size:14px;padding:8px 10px}}</style></head><body><main>
<header><div><h1>吉隆源区 · 三维速度云图</h1><p>480,000 个独立动力粒子 · 四个观察角度</p></div><span class="state">__STATUS__</span></header>
<section class="viewer" aria-label="多角度云图视频"><nav aria-label="选择观察角度">__BUTTONS__</nav>
<video id="cloud-video" controls preload="metadata" poster="images/01_southeast.png" src="videos/01_southeast.mp4" aria-label="东南斜视速度云图"></video>
<div class="caption"><span id="view-caption">东南斜视 · 表面速度</span><span>展示 __MINUTES__ 分钟物理过程 · 各角度统一色标</span></div></section>
<div class="grid"><figure><a href="images/process_curves.png"><img src="images/process_curves.png" alt="静态计算过程曲线"></a><figcaption>计算过程 · 图片</figcaption></figure>
<figure><a href="images/settings.png"><img src="images/settings.png" alt="粒子数量和模型参数"></a><figcaption>模型与显示设置 · 图片</figcaption></figure></div>
<footer>云图由全部计算粒子的速度场重建，平滑仅用于显示。俯视为柱平均速度，其余视角为重建表面速度。当前为未标定三维原型，未耦合融化与侵蚀过程。<br><a href="cloud_metadata.json">查看本次输出信息</a></footer>
</main><script>const video=document.getElementById('cloud-video');const label=document.getElementById('view-caption');document.querySelectorAll('[data-angle]').forEach(button=>button.addEventListener('click',()=>{const playing=!video.paused;const time=video.currentTime;document.querySelectorAll('[data-angle]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));video.src='videos/'+button.dataset.angle+'.mp4';video.poster='images/'+button.dataset.angle+'.png';video.setAttribute('aria-label',button.textContent+'速度云图');label.textContent=button.textContent+' · '+(button.dataset.angle==='04_top'?'柱平均速度':'表面速度');video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(time,video.duration);if(playing)video.play().catch(()=>{});},{once:true});video.load();}));</script></body></html>'''
    document=document.replace('__STATUS__',html.escape(status)).replace('__BUTTONS__',buttons).replace('__MINUTES__',f"{meta['completed_duration_s']/60:.2f}")
    (out/'index.html').write_text(document,encoding='utf-8')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--run',default='cloud_480k_90min')
    parser.add_argument('--max-time',type=float)
    parser.add_argument('--wait',action='store_true')
    parser.add_argument('--angle',choices=list(ANGLES))
    parser.add_argument('--render-only',action='store_true')
    args=parser.parse_args()
    base=Path(read_json(ROOT/'config/sph3d_480k.json')['output_root'])
    run=base/args.run
    if args.wait:
        while not (run/'summary.json').exists():time.sleep(15)
    out=run/('presentation_preview' if args.max_time is not None else 'presentation')
    if not args.render_only:prepare(run,out,args.max_time)
    if args.angle:render(out,args.angle);return
    static_images(out)
    def child(angle):
        cmd=[sys.executable,str(Path(__file__).resolve()),'--run',args.run,'--render-only','--angle',angle]
        if args.max_time is not None:cmd+=['--max-time',str(args.max_time)]
        subprocess.run(cmd,check=True)
    with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(child,ANGLES))
    page(out)
    print(f'Cloud videos, static images, and presentation page ready: {out}',flush=True)

if __name__=='__main__':main()
