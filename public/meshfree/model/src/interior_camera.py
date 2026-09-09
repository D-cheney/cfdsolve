"""World-space first-person cameras inside SPH data; GPU depth-buffer renderer.

Not an orbit/axes camera. Numerical particles are deliberately small glyphs to
make the opaque mixture's interior inspectable. No new physics is integrated.
"""
import os
os.environ['CUDA_DEVICE_ORDER']='PCI_BUS_ID'
os.environ['CUDA_VISIBLE_DEVICES']='1'
os.environ['TEMP']='D:/openclaw/codextemp'
os.environ['TMP']=os.environ['TEMP']
os.environ['MKL_NUM_THREADS']='1'
os.environ['OMP_NUM_THREADS']='1'
import sys
sys.path.append('D:/openclaw/codextemp/sph3d-libs')
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
from scipy.ndimage import gaussian_filter1d, map_coordinates
from scipy.spatial import cKDTree
from PIL import Image, ImageDraw, ImageFont
from matplotlib import colormaps
import imageio_ffmpeg
import taichi as ti

ROOT=Path(__file__).resolve().parents[1]
RUN=Path('D:/openclaw/codextemp/jilong_sph3d/cloud_480k_90min')
OUT=RUN/'interior_presentation'
ORIGIN=np.array([26300.,13400.,5100.],dtype=np.float32)
N=480000
W,H=1920,1080
FPS=24
RADIUS=.22
FOV=76.
ANCHOR=(100*80+40)*30+15
CHAIN=np.array([(i*80+40)*30+15 for i in range(25,176)],dtype=np.int32)
MODES={'09_inside_traverse':'颗粒群内部穿行','10_particle_pov':'随粒子第一人称漂流'}

@ti.data_oriented
class Renderer:
    def __init__(self,terrain):
        self.p=ti.Vector.field(3,ti.f32,N);self.v=ti.Vector.field(3,ti.f32,N)
        self.eye=ti.Vector.field(3,ti.f32,());self.front=ti.Vector.field(3,ti.f32,())
        self.right=ti.Vector.field(3,ti.f32,());self.up=ti.Vector.field(3,ti.f32,())
        self.key=ti.field(ti.i64,(H,W));self.rgb=ti.Vector.field(3,ti.u8,(H,W))
        self.ground=ti.Vector.field(3,ti.f32,(H,W))
        self.lut=ti.Vector.field(3,ti.f32,256)
        self.lut.from_numpy(colormaps['turbo'](np.linspace(0,1,256))[:,:3].astype(np.float32))
        dem=np.ascontiguousarray(terrain['elevation'][::-1]-ORIGIN[2],dtype=np.float32)
        self.ny,self.nx=dem.shape
        self.dem=ti.field(ti.f32,dem.shape);self.dem.from_numpy(dem)
        self.x0=float(terrain['x'][0]-ORIGIN[0]);self.y0=float(terrain['y_desc'][-1]-ORIGIN[1])
        self.dx=float(terrain['x'][1]-terrain['x'][0]);self.dy=float(terrain['y_desc'][0]-terrain['y_desc'][1])
        self.fx=float(W/(2*np.tan(np.deg2rad(FOV/2))))

    @ti.func
    def bed(self,x,y):
        u=ti.min(ti.max((x-self.x0)/self.dx,0.),self.nx-1.001)
        v=ti.min(ti.max((y-self.y0)/self.dy,0.),self.ny-1.001)
        i,j=ti.cast(u,ti.i32),ti.cast(v,ti.i32);a,b=u-i,v-j
        return (1-b)*((1-a)*self.dem[j,i]+a*self.dem[j,i+1])+b*((1-a)*self.dem[j+1,i]+a*self.dem[j+1,i+1])

    @ti.kernel
    def background(self):
        for y,x in self.key:
            ray=(self.front[None]+self.right[None]*((x+.5-W/2)/self.fx)
                 +self.up[None]*((H/2-y-.5)/self.fx)).normalized()
            eye=self.eye[None]
            hit=0;old=0.;distance=0.
            for k in range(100):
                step=.5*(ti.pow(1.075,k+1)-1.)
                pos=eye+step*ray
                if hit==0 and pos.z<=self.bed(pos.x,pos.y):
                    lo,hi=old,step
                    for _ in range(6):
                        mid=(lo+hi)*.5;q=eye+mid*ray
                        if q.z<=self.bed(q.x,q.y):hi=mid
                        else:lo=mid
                    distance=(lo+hi)*.5;hit=1
                old=step
            fog=ti.Vector([.12,.20,.25])
            color=fog+ti.Vector([.06,.08,.10])*ti.max(ray.z,0.)
            zdepth=5000.
            if hit==1:
                q=eye+distance*ray
                zx=(self.bed(q.x+1,q.y)-self.bed(q.x-1,q.y))*.5
                zy=(self.bed(q.x,q.y+1)-self.bed(q.x,q.y-1))*.5
                normal=ti.Vector([-zx,-zy,1.]).normalized()
                light=.45+.55*ti.max(0.,normal.dot(ti.Vector([.3,-.4,.85]).normalized()))
                color=ti.Vector([.44,.40,.30])*light
                gx=ti.abs((q.x/10-ti.floor(q.x/10))-.5)
                gy=ti.abs((q.y/10-ti.floor(q.y/10))-.5)
                if gx>.485 or gy>.485:color*=.64
                color=color*ti.exp(-distance/350)+fog*(1-ti.exp(-distance/350))
                zdepth=distance*ray.dot(self.front[None])
            self.ground[y,x]=color
            self.key[y,x]=ti.cast(zdepth*1000,ti.i64)*524288+500000

    @ti.kernel
    def particles(self,omit:ti.i32):
        for i in self.p:
            r=self.p[i]-self.eye[None];z=r.dot(self.front[None])
            if i!=omit and z>.3 and z<500:
                sx=W*.5+self.fx*r.dot(self.right[None])/z
                sy=H*.5-self.fx*r.dot(self.up[None])/z
                radius=ti.min(120.,ti.max(.55,self.fx*RADIUS/z))
                if sx+radius>=0 and sx-radius<W and sy+radius>=0 and sy-radius<H:
                    x0=ti.max(0,ti.cast(ti.floor(sx-radius),ti.i32));x1=ti.min(W,ti.cast(ti.ceil(sx+radius),ti.i32)+1)
                    y0=ti.max(0,ti.cast(ti.floor(sy-radius),ti.i32));y1=ti.min(H,ti.cast(ti.ceil(sy+radius),ti.i32)+1)
                    for y in range(y0,y1):
                        for x in range(x0,x1):
                            d=((x+.5-sx)**2+(y+.5-sy)**2)/radius**2
                            if d<=1:
                                depth=z-RADIUS*ti.sqrt(1-d)
                                key=ti.cast(ti.max(.001,depth)*1000,ti.i64)*524288+ti.cast(i,ti.i64)
                                ti.atomic_min(self.key[y,x],key)

    @ti.kernel
    def resolve(self):
        for y,x in self.key:
            i=ti.cast(self.key[y,x]%524288,ti.i32)
            color=self.ground[y,x]
            if i<N:
                r=self.p[i]-self.eye[None];z=r.dot(self.front[None])
                sx=W*.5+self.fx*r.dot(self.right[None])/z
                sy=H*.5-self.fx*r.dot(self.up[None])/z
                radius=ti.min(120.,ti.max(.55,self.fx*RADIUS/z))
                nx=(x+.5-sx)/radius;ny=(y+.5-sy)/radius
                nz=ti.sqrt(ti.max(0.,1-nx*nx-ny*ny))
                light=.35+.65*ti.max(0.,-.3*nx-.4*ny+.86*nz)
                index=ti.cast(ti.min(255.,self.v[i].norm()/45*255),ti.i32)
                color=self.lut[index]*light
                fog=ti.Vector([.12,.20,.25]);f=ti.exp(-z/260)
                color=color*f+fog*(1-f)
            self.rgb[y,x]=ti.cast(ti.min(1.,ti.max(0.,color))*255,ti.u8)

    def frame(self,p,v,eye,front,omit):
        front=front/np.linalg.norm(front);right=np.cross(front,[0,0,1.]);right/=np.linalg.norm(right)
        up=np.cross(right,front)
        self.p.from_numpy(np.ascontiguousarray(p,dtype=np.float32));self.v.from_numpy(np.ascontiguousarray(v,dtype=np.float32))
        self.eye[None]=eye;self.front[None]=front;self.right[None]=right;self.up[None]=up
        self.background();self.particles(omit);self.resolve()
        return Image.fromarray(self.rgb.to_numpy())

class States:
    def __init__(self):
        self.records=json.loads((RUN/'diagnostics.json').read_text())
        self.times=np.array([r['time_s'] for r in self.records]);self.cache={}
    def at(self,t):
        hi=min(len(self.times)-1,int(np.searchsorted(self.times,t,side='right')));lo=max(0,hi-1)
        for k in (lo,hi):
            if k not in self.cache:
                with np.load(RUN/f"frame_{self.records[k]['frame']:04d}.npz") as d:
                    self.cache[k]=(d['position_m']-ORIGIN,d['velocity_m_s'].copy())
        for k in list(self.cache):
            if k not in (lo,hi):del self.cache[k]
        a=(t-self.times[lo])/max(1e-12,self.times[hi]-self.times[lo])
        p0,v0=self.cache[lo];p1,v1=self.cache[hi]
        return p0*(1-a)+p1*a,v0*(1-a)+v1*a

def bed_cpu(terrain,eye):
    col=(eye[0]+ORIGIN[0]-terrain['x'][0])/(terrain['x'][1]-terrain['x'][0])
    row=(eye[1]+ORIGIN[1]-terrain['y_desc'][0])/(terrain['y_desc'][1]-terrain['y_desc'][0])
    return float(map_coordinates(terrain['elevation'],[[row],[col]],order=1,mode='nearest')[0]-ORIGIN[2])

def camera(mode,p,u,terrain):
    if mode=='09_inside_traverse':
        chain=gaussian_filter1d(p[CHAIN],1.0,axis=0,mode='nearest')
        s=(len(chain)-1)*(.08+.84*u);i=min(len(chain)-2,int(s));a=s-i
        eye=(1-a)*chain[i]+a*chain[i+1]+np.array([0,0,.25])
        direction=chain[min(len(chain)-1,i+5)]-chain[max(0,i-5)]
        omit=-1
    else:
        eye=p[ANCHOR]+np.array([.28,-.24,.28]);omit=ANCHOR
        direction=np.array([terrain['path_x'][2]-terrain['path_x'][0],terrain['path_y'][2]-terrain['path_y'][0],0.])
    # A virtual inspection camera remains above the bed; this is not a fluid force.
    bed=bed_cpu(terrain,eye);eye[2]=max(eye[2],bed+.55)
    direction[2]=0.;direction/=np.linalg.norm(direction)
    direction[2]=-.055
    return eye,direction,omit,float(eye[2]-bed)

FONT='C:/Windows/Fonts/msyh.ttc'
def hud(image,mode,t,eye,height,p,front,u):
    draw=ImageDraw.Draw(image,'RGBA')
    big=ImageFont.truetype(FONT,32);small=ImageFont.truetype(FONT,21)
    draw.rectangle((0,0,W,112),fill=(8,20,29,230))
    draw.text((30,18),MODES[mode]+'  |  仿真内部透视相机',font=big,fill='white')
    draw.text((32,68),f'物理时间 {t:.2f} s    相机离地 {height:.2f} m    全部 480,000 粒子参与显示',font=small,fill='#b8d0df')
    draw.rectangle((0,H-84,W,H),fill=(8,20,29,230))
    draw.text((30,H-73),'内部数值观察：显示半径 0.22 m，不代表砂石粒径或实际透明度；非真实水下影像',font=small,fill='#c4d7e2')
    draw.text((30,H-40),'保存状态之间仅作显示插值；相机真正位于颗粒群内部，不是外部环绕或局部放大',font=small,fill='#9cb4c4')
    # Static world frame inset: particle footprint plus actual eye position/direction.
    rect=(W-314,132,W-24,360);draw.rounded_rectangle(rect,radius=10,fill=(7,19,27,215))
    draw.text((W-298,143),'相机在计算域中的位置',font=small,fill='white')
    xmin,xmax=-570,590;ymin,ymax=-930,680
    def xy(q):return (W-293+(q[0]-xmin)/(xmax-xmin)*247,340-(q[1]-ymin)/(ymax-ymin)*150)
    for q in p[::500]:
        x,y=xy(q)
        if W-295<x<W-35 and 184<y<346:draw.rectangle((x,y,x+1,y+1),fill=(100,173,211,155))
    ex,ey=xy(eye);tx,ty=xy(eye+front*80)
    draw.line((ex,ey,tx,ty),fill='#ffce55',width=4)
    draw.ellipse((ex-5,ey-5,ex+5,ey+5),fill='#ffce55')
    draw.text((W-297,367),f'相机位移进度 {u*100:.0f}%' if mode=='09_inside_traverse' else f'固定跟随粒子 ID {ANCHOR}',font=small,fill='#ffdf8d')
    # Speed color bar, consistent with prior exterior videos.
    lut=(colormaps['turbo'](np.linspace(0,1,360))[:,:3]*255).astype(np.uint8)
    for j,c in enumerate(lut):draw.line((W-85,470+359-j,W-61,470+359-j),fill=tuple(map(int,c)),width=1)
    draw.text((W-145,433),'速度 m/s',font=small,fill='white')
    draw.text((W-55,457),'45',font=small,fill='white');draw.text((W-55,814),'0',font=small,fill='white')
    return image

def render(mode,smoke=False):
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'images').mkdir(exist_ok=True);(OUT/'videos').mkdir(exist_ok=True)
    ti.init(arch=ti.cuda,device_memory_GB=2,offline_cache_file_path=str(RUN/'interior_taichi_cache'))
    if ti.cfg.arch!=ti.cuda:raise RuntimeError('GPU rendering required')
    terrain=np.load(ROOT/'data/processed/terrain_model.npz');states=States();renderer=Renderer(terrain)
    duration=30 if mode=='09_inside_traverse' else 45
    count=FPS*duration
    movie_times=np.linspace(0,120,count) if mode=='09_inside_traverse' else np.r_[np.linspace(0,120,15*FPS,endpoint=False),np.linspace(120,5400,30*FPS)]
    indices=[0, count//4,count//2,count-1] if smoke else range(count)
    ff=imageio_ffmpeg.get_ffmpeg_exe();pipe=None
    if not smoke:
        pipe=subprocess.Popen([ff,'-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}',
                               '-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20',
                               '-pix_fmt','yuv420p','-movflags','+faststart','-threads','4',str(OUT/'videos'/f'{mode}.mp4')],stdin=subprocess.PIPE)
    trajectory=[];checks=[]
    try:
        for j in indices:
            t=float(movie_times[j]);u=j/(count-1)
            p,v=states.at(t);eye,front,omit,height=camera(mode,p,u,terrain)
            assert np.isfinite(eye).all() and height>=.549
            if smoke or j%FPS==0 or j==count-1:
                dist=cKDTree(p).query(eye,k=16)[0]
                checks.append({'frame':int(j),'physical_s':t,'nearest_particle_m':float(dist[0]),'sixteenth_neighbor_m':float(dist[-1]),'height_above_bed_m':height})
            frame=hud(renderer.frame(p,v,eye,front,omit),mode,t,eye,height,p,front,u)
            trajectory.append({'frame':int(j),'physical_s':t,'eye_world_m':(eye+ORIGIN).tolist(),'front':(front/np.linalg.norm(front)).tolist()})
            if smoke:frame.save(OUT/'images'/f'{mode}_check_{j:04d}.png')
            else:
                pipe.stdin.write(frame.tobytes())
                if j==count//8:frame.save(OUT/'images'/f'{mode}.png')
            if j%120==0:print(f'{mode}: {j}/{count}; physical={t:.1f}s; bed clearance={height:.2f}m',flush=True)
    finally:
        if pipe:
            pipe.stdin.close()
            if pipe.wait()!=0:raise RuntimeError('Video encoder failed')
    tag='_smoke' if smoke else ''
    (OUT/f'{mode}{tag}_camera.json').write_text(json.dumps(trajectory,indent=2),encoding='utf-8')
    report={'camera':'world-space pinhole, eye lies in the simulated particle neighborhood',
            'video':mode,'particle_count':N,'glyph_radius_m':RADIUS,'near_plane_m':.3,'fov_horizontal_deg':FOV,
            'resolution':[W,H],'fps':FPS,'video_duration_s':duration,'physical_duration_s':float(movie_times[-1]),
            'display_interpolation':'linear interpolation of fixed-ID saved particle positions and velocities only',
            'coordinate_origin_m':ORIGIN.tolist(),'follow_id':ANCHOR if mode=='10_particle_pov' else None,
            'particle_neighborhood_samples':checks,'renderer_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    (OUT/f'{mode}{tag}_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    if not smoke:
        result=subprocess.run([ff,'-v','error','-i',str(OUT/'videos'/f'{mode}.mp4'),'-f','null','-'],capture_output=True,text=True)
        assert result.returncode==0 and not result.stderr.strip(),result.stderr
    print(f'Finished {mode}; smoke={smoke}',flush=True)

def page():
    cards=''.join(f'<section><h2>{title}</h2><video controls preload="metadata" poster="images/{key}.png" src="videos/{key}.mp4"></video><p><a href="videos/{key}.mp4">独立播放 / 保存视频</a></p></section>' for key,title in MODES.items())
    doc='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>仿真内部 · 第一人称镜头</title><style>body{margin:0;background:#0c1923;color:#dfedf5;font:16px/1.7 system-ui,"Microsoft YaHei"}main{max-width:1280px;padding:28px 20px;margin:auto}h1{font-size:28px}p{color:#a8bfce}section{margin:25px 0;padding:16px;background:#122531;border:1px solid #284454;border-radius:12px}video{width:100%;display:block;aspect-ratio:16/9}a{color:#6bcaf6}h2{font-size:21px;margin-top:0}</style><main><h1>进入仿真内部：真正的第一人称相机</h1><p>相机位于三维世界坐标中，在颗粒群内部平移，以透视投影、深度遮挡和近距离颗粒掠过呈现运动。没有使用坐标轴旋转、模型外部环绕或截图放大。</p><p>内部穿行：30 秒视频，展示前 120 秒；粒子第一人称：45 秒视频，展示完整 90 分钟（前 120 秒放慢）。右上角显示相机在计算域中的位置。</p>__CARDS__<p>重要：泥石流实际上不透明。这里是数值诊断视图，48 万个计算粒子缩小为半径 0.22 m 的显示符号，近裁剪 0.3 m；符号尺寸不代表自然颗粒粒径。帧间插值仅用于显示，不是新增求解结果。相机离地限制只作用于镜头。</p><p><a href="../presentation/index.html">对照原有八个外部视角</a> · <a href="INTERIOR_CAMERA_TEMPLATE.md">内部漫游复用说明</a></p></main></html>'''
    (OUT/'index.html').write_text(doc.replace('__CARDS__',cards),encoding='utf-8')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=list(MODES),default='09_inside_traverse');parser.add_argument('--smoke',action='store_true');parser.add_argument('--page-only',action='store_true')
    args=parser.parse_args()
    if args.page_only:page()
    else:render(args.mode,args.smoke)
