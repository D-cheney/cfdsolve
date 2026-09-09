"""Render only computed xyz states; no transverse replication or fabricated paths."""
import json
import argparse
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.animation import FFMpegWriter
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
plt.rcParams['font.sans-serif']=['Microsoft YaHei','DejaVu Sans']
plt.rcParams['axes.unicode_minus']=False
plt.rcParams['animation.ffmpeg_path']=imageio_ffmpeg.get_ffmpeg_exe()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--tag',default='baseline_90min')
    parser.add_argument('--component',default='all')
    args=parser.parse_args()
    cfg=json.loads((ROOT/'config/sph3d.json').read_text(encoding='utf-8'))
    out=Path(cfg['output_root'])/args.tag
    files=sorted(out.glob('frame_*.npz'))
    if not files:
        raise RuntimeError('No solved frames available')
    data=[dict(np.load(f)) for f in files]
    p=np.stack([d['position_m'] for d in data])
    speed=np.stack([np.linalg.norm(d['velocity_m_s'],axis=1) for d in data])
    t=np.array([float(d['time_s']) for d in data])
    diagnostics=json.loads((out/'diagnostics.json').read_text())
    terrain=np.load(ROOT/'data/processed/terrain_model.npz')
    low=p.min(axis=(0,1)); high=p.max(axis=(0,1))
    margin=np.maximum((high-low)*0.12,100.)
    # Focus on solved particle domain, retaining the actual DEM around it.
    xi=np.where((terrain['x']>=low[0]-margin[0])&(terrain['x']<=high[0]+margin[0]))[0]
    yi=np.where((terrain['y_desc']>=low[1]-margin[1])&(terrain['y_desc']<=high[1]+margin[1]))[0]
    xi=xi[::max(1,len(xi)//100)];yi=yi[::max(1,len(yi)//100)]
    X,Y=np.meshgrid(terrain['x'][xi],terrain['y_desc'][yi])
    Z=terrain['elevation'][np.ix_(yi,xi)]
    origin=p[0,:,:2].mean(axis=0)
    xyz=p.copy();xyz[:,:,:2]-=origin
    X=X-origin[0];Y=Y-origin[1]
    vmax=max(1.,float(speed.max()))
    videos=out/'videos';videos.mkdir(exist_ok=True)
    n=p.shape[1]
    # All saved states appear once; short pilot clips are slowed for readability.
    fps=6 if len(t)<30 else 12
    sequence=list(range(len(t)))+[len(t)-1]*fps*2
    manifest=[]
    for component in ['01_volume','02_plan','03_side','04_diagnostics']:
        if args.component not in ('all',component):continue
        fig=plt.figure(figsize=(12.8,7.2),dpi=150,facecolor='white')
        title=fig.suptitle('',fontsize=15,y=0.97)
        footer=fig.text(0.5,0.025,f'三维 SPH · {n:,} 个独立动力粒子 · 固定 DEM / 假设源区瞬时释放 · 未经现场标定',ha='center',fontsize=9)
        if component=='01_volume':
            ax=fig.add_axes([0.02,0.12,0.85,0.78],projection='3d',computed_zorder=False)
            ax.plot_surface(X,Y,Z,color='#b8b09e',alpha=0.50,linewidth=0,edgecolor='none',antialiased=False,zorder=1)
            points=ax.scatter(*xyz[0].T,c=speed[0],s=1.6,cmap='turbo',vmin=0,vmax=vmax,depthshade=False,zorder=3)
            ax.view_init(elev=32,azim=-65)
            ax.set_xlabel('局部东向距离 / m');ax.set_ylabel('局部北向距离 / m');ax.set_zlabel('高程 / m')
            ranges=np.array([np.ptp(X),np.ptp(Y),max(np.ptp(Z),np.ptp(p[:,:,2]))])
            ax.set_box_aspect(np.maximum(ranges,50),zoom=1.08)
            ax.zaxis.set_major_locator(MaxNLocator(4))
            ax.tick_params(labelsize=9)
            ax.set_zlim(min(Z.min(),p[:,:,2].min())-10,max(Z.max(),p[:,:,2].max())+15)
        elif component=='02_plan':
            ax=fig.add_axes([0.10,0.13,0.74,0.75])
            ax.pcolormesh(X,Y,Z,cmap='Greys',shading='auto',alpha=0.22)
            ax.contour(X,Y,Z,levels=12,colors='#615849',alpha=0.35,linewidths=0.5)
            points=ax.scatter(xyz[0,:,0],xyz[0,:,1],c=speed[0],s=2,cmap='turbo',vmin=0,vmax=vmax)
            ax.set_aspect('equal');ax.set_xlabel('局部东向距离 / m');ax.set_ylabel('局部北向距离 / m')
        elif component=='03_side':
            ax=fig.add_axes([0.10,0.13,0.74,0.75])
            points=ax.scatter(xyz[0,:,1],xyz[0,:,2],c=speed[0],s=2,cmap='turbo',vmin=0,vmax=vmax)
            ax.set_xlim(xyz[:,:,1].min()-50,xyz[:,:,1].max()+50)
            ax.set_ylim(xyz[:,:,2].min()-25,xyz[:,:,2].max()+25)
            ax.set_xlabel('局部北向距离 / m');ax.set_ylabel('粒子真实高程 / m')
            ax.grid(alpha=0.2)
        else:
            axes=fig.subplots(2,2)
            fig.subplots_adjust(left=0.09,right=0.96,bottom=0.14,top=0.87,wspace=0.25,hspace=0.45)
            values=[speed.max(axis=1),speed.mean(axis=1),
                    np.array([d['density_ratio_p99'] for d in diagnostics]),
                    np.array([d['kinetic_energy_J'] for d in diagnostics])/1e9]
            names=['最大速度 / (m/s)','平均速度 / (m/s)','密度与参考密度之比（99分位）','动能 / GJ']
            lines=[]
            for ax,y,label in zip(axes.flat,values,names):
                ax.plot(t/60,y,color='0.8',lw=1)
                line,=ax.plot([],[],lw=2,color='#116991');lines.append(line)
                ax.set_xlabel('物理时间 / min');ax.set_ylabel(label);ax.grid(alpha=0.2)
        if component!='04_diagnostics':
            cb=fig.colorbar(points,cax=fig.add_axes([0.9,0.25,0.015,0.48]))
            cb.set_label('速度 / (m/s)')
        names={'01_volume':'三维体积粒子与山体边界','02_plan':'真实三维解的俯视投影',
               '03_side':'真实三维解的侧视投影','04_diagnostics':'三维动力过程与数值诊断'}
        def update(k):
            title.set_text(f'{names[component]}  |  t = {t[k]/60:.2f} min')
            if component=='01_volume':points._offsets3d=tuple(xyz[k].T)
            elif component=='02_plan':points.set_offsets(xyz[k,:,:2])
            elif component=='03_side':points.set_offsets(xyz[k,:,1:3])
            else:
                for line,y in zip(lines,values):line.set_data(t[:k+1]/60,y[:k+1])
            if component!='04_diagnostics':points.set_array(speed[k])
        writer=FFMpegWriter(fps=fps,codec='libx264',bitrate=5000,extra_args=['-pix_fmt','yuv420p','-movflags','+faststart'])
        path=videos/f'{component}.mp4'
        with writer.saving(fig,str(path),150):
            for j,k in enumerate(sequence):
                update(k);writer.grab_frame()
                if j%60==0:print(f'{component}: {j}/{len(sequence)}',flush=True)
        update(min(len(t)-1,max(1,len(t)//2)))
        fig.savefig(videos/f'{component}_preview.png',dpi=150)
        plt.close(fig)
        manifest.append({'file':path.name,'particle_count':n,'simulated_duration_s':float(t[-1]),
                         'video_duration_s':len(sequence)/fps,'resolution':[1920,1080]})
    (videos/f'manifest_{args.component}.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps(manifest),flush=True)

if __name__=='__main__':main()
