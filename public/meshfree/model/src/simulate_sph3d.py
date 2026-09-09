"""Three-dimensional WCSPH: independent xyz state and compact-support 3-D forces.

Run using the separate D: dependency directory, with the environment's NumPy
preferred (avoid replacing the host scientific stack). All heavy outputs are D:.
"""
import os
import sys
import json
import time
import argparse
from pathlib import Path

import numpy as np
from scipy.ndimage import map_coordinates

sys.path.append('D:/openclaw/codextemp/sph3d-libs')
os.environ['CUDA_DEVICE_ORDER']='PCI_BUS_ID'
os.environ['CUDA_VISIBLE_DEVICES']=json.loads((Path(__file__).resolve().parents[1]/'config/sph3d.json').read_text(encoding='utf-8'))['gpu_visible_device']
import taichi as ti

ROOT = Path(__file__).resolve().parents[1]


@ti.data_oriented
class SPH3D:
    def __init__(self, cfg, terrain, positions):
        self.n = len(positions)
        self.h = cfg['particle_spacing_m'] * cfg['smoothing_length_factor']
        self.cell = 2.0 * self.h
        self.dp = cfg['particle_spacing_m']
        self.skin = 0.5*self.dp
        self.search_radius = self.cell+self.skin
        self.rho0 = cfg['density_kg_m3']
        self.particle_volume = float(np.prod(cfg['source_dimensions_m'])/np.prod(cfg['source_lattice_shape'])) if 'source_dimensions_m' in cfg else self.dp**3
        self.mass = self.rho0 * self.particle_volume
        self.c0 = cfg['sound_speed_m_s']
        self.nu = cfg['kinematic_viscosity_m2_s']
        self.tau_y = cfg['yield_stress_Pa']
        self.shear_reg = cfg['shear_regularization_s_inv']
        self.nu_max = cfg['maximum_kinematic_viscosity_m2_s']
        self.alpha = cfg['artificial_viscosity_alpha']
        self.mu = cfg['bed_friction_coefficient']
        self.g = cfg['gravity_m_s2']
        self.dtmax = cfg['maximum_dt_s']
        self.cfl = cfg['cfl']
        self.nb = cfg['hash_buckets']
        self.cap = cfg['bucket_capacity']
        self.x0 = float(terrain['x'][0])
        self.y0 = float(terrain['y_desc'][-1])
        self.dx = float(terrain['x'][1]-terrain['x'][0])
        self.dy = float(terrain['y_desc'][0]-terrain['y_desc'][1])
        elev = np.ascontiguousarray(terrain['elevation'][::-1], dtype=np.float32)
        self.ny, self.nx = elev.shape
        self.dem = ti.field(ti.f32, shape=elev.shape)
        self.dem.from_numpy(elev)
        self.x = ti.Vector.field(3, ti.f32, self.n)
        self.v = ti.Vector.field(3, ti.f32, self.n)
        self.a = ti.Vector.field(3, ti.f32, self.n)
        self.rho = ti.field(ti.f32, self.n)
        self.pressure = ti.field(ti.f32, self.n)
        self.nu_eff = ti.field(ti.f32, self.n)
        self.count = ti.field(ti.i32, self.nb)
        self.ids = ti.field(ti.i32, (self.nb,self.cap))
        self.overflow = ti.field(ti.i32, ())
        self.vmax = ti.field(ti.f32, ())
        self.amax = ti.field(ti.f32, ())
        self.dt = ti.field(ti.f32, ())
        self.clock = ti.field(ti.f64, ())
        self.bed_contact = ti.field(ti.i32, self.n)
        self.wall_hits = ti.field(ti.i32, ())
        # Neighbor slot first: adjacent GPU lanes read adjacent particle entries.
        self.neighbors = ti.field(ti.i32,(256,self.n))
        self.neighbor_count = ti.field(ti.i32,self.n)
        self.reference = ti.Vector.field(3,ti.f32,self.n)
        self.displacement2 = ti.field(ti.f32,())
        self.rebuild = ti.field(ti.i32,())
        self.displacement2[None] = 1e20
        self.x.from_numpy(positions.astype(np.float32))
        self.v.from_numpy(np.tile(cfg['initial_velocity_m_s'],(self.n,1)).astype(np.float32))

    @ti.func
    def key(self, c):
        return ((c[0]*73856093) ^ (c[1]*19349663) ^ (c[2]*83492791)) & (self.nb-1)

    @ti.func
    def bed(self, x, y):
        u = ti.min(ti.max((x-self.x0)/self.dx, 0.0),self.nx-1.001)
        v = ti.min(ti.max((y-self.y0)/self.dy, 0.0),self.ny-1.001)
        i,j = ti.cast(u,ti.i32),ti.cast(v,ti.i32)
        fx,fy = u-i,v-j
        z00,z10 = self.dem[j,i],self.dem[j,i+1]
        z01,z11 = self.dem[j+1,i],self.dem[j+1,i+1]
        z = (1-fy)*((1-fx)*z00+fx*z10)+fy*((1-fx)*z01+fx*z11)
        zx = ((1-fy)*(z10-z00)+fy*(z11-z01))/self.dx
        zy = ((1-fx)*(z01-z00)+fx*(z11-z10))/self.dy
        return z,ti.Vector([-zx,-zy,1.0]).normalized()

    @ti.func
    def w(self, r):
        q = r/self.h
        result = 0.0
        if q < 2.0:
            result = 21.0/(16.0*3.141592653589793*self.h**3)*(1-0.5*q)**4*(2*q+1)
        return result

    @ti.func
    def grad(self, delta, r):
        q = r/self.h
        return -105.0/(16.0*3.141592653589793*self.h**5)*(1-0.5*q)**3*delta

    @ti.kernel
    def clear(self):
        self.rebuild[None] = ti.cast(self.displacement2[None] >= 0.25*self.skin**2,ti.i32)
        if self.rebuild[None]:
            self.displacement2[None] = 0.0
        for k in self.count:
            if self.rebuild[None]:
                self.count[k] = 0
        self.vmax[None] = 0
        self.amax[None] = 0

    @ti.kernel
    def insert(self):
        for i in self.x:
            if self.rebuild[None]:
                c = ti.cast(ti.floor(self.x[i]/self.search_radius),ti.i32)
                k = self.key(c)
                slot = ti.atomic_add(self.count[k],1)
                if slot < self.cap:
                    self.ids[k,slot] = i
                else:
                    ti.atomic_add(self.overflow[None],1)

    @ti.kernel
    def build_neighbors(self):
        for i in self.x:
            if self.rebuild[None]:
                c = ti.cast(ti.floor(self.x[i]/self.search_radius),ti.i32)
                total = 0
                for ox,oy,oz in ti.ndrange((-1,2),(-1,2),(-1,2)):
                    nc = c+ti.Vector([ox,oy,oz])
                    k = self.key(nc)
                    for b in range(ti.min(self.count[k],self.cap)):
                        j = self.ids[k,b]
                        jc = ti.cast(ti.floor(self.x[j]/self.search_radius),ti.i32)
                        if (jc == nc).all() and (self.x[i]-self.x[j]).norm_sqr() <= self.search_radius**2:
                            if total < 256:
                                self.neighbors[total,i] = j
                            else:
                                ti.atomic_add(self.overflow[None],1)
                            total += 1
                self.neighbor_count[i] = ti.min(total,256)
                self.reference[i] = self.x[i]

    @ti.kernel
    def density(self):
        for i in self.x:
            rho = 0.0
            velocity_gradient = ti.Matrix.zero(ti.f32,3,3)
            for b in range(self.neighbor_count[i]):
                j = self.neighbors[b,i]
                delta = self.x[i]-self.x[j]
                r = delta.norm()
                rho += self.mass*self.w(r)
                if r > 1e-5 and r < self.cell:
                    velocity_gradient += self.mass/self.rho0*(self.v[j]-self.v[i]).outer_product(self.grad(delta,r))
            # Positive-pressure free-surface formulation. Low summation density
            # is recorded, not presented as a physical density estimate at surface.
            self.rho[i] = rho
            self.pressure[i] = self.c0**2*ti.max(rho-self.rho0,0.0)
            strain = 0.5*(velocity_gradient+velocity_gradient.transpose())
            shear_rate = ti.sqrt(2.0*(strain*strain).sum()+self.shear_reg**2)
            self.nu_eff[i] = ti.min(self.nu_max,self.nu+self.tau_y/(self.rho0*shear_rate))

    @ti.kernel
    def forces(self):
        for i in self.x:
            a = ti.Vector([0.0,0.0,-self.g])
            ri = ti.max(self.rho[i],self.rho0)
            for b in range(self.neighbor_count[i]):
                j = self.neighbors[b,i]
                if j != i:
                    delta = self.x[i]-self.x[j]
                    r2 = delta.norm_sqr()
                    if r2 < self.cell**2 and r2 > 1e-10:
                        r = ti.sqrt(r2)
                        grad = self.grad(delta,r)
                        rj = ti.max(self.rho[j],self.rho0)
                        dv = self.v[i]-self.v[j]
                        dot = dv.dot(delta)
                        av = 0.0
                        if dot < 0.0:
                            av = -self.alpha*self.c0*self.h*dot/((r2+0.01*self.h**2)*0.5*(ri+rj))
                        a -= self.mass*(self.pressure[i]/ri**2+self.pressure[j]/rj**2+av)*grad
                        pair_nu = 2*self.nu_eff[i]*self.nu_eff[j]/(self.nu_eff[i]+self.nu_eff[j])
                        a += 2*pair_nu*self.mass*2/(ri+rj)*delta.dot(grad)/(r2+0.01*self.h**2)*dv
            self.a[i] = a
            ti.atomic_max(self.vmax[None],self.v[i].norm())
            ti.atomic_max(self.amax[None],a.norm())

    @ti.kernel
    def choose_dt(self, target: ti.f64):
        self.dt[None] = ti.min(self.dtmax,self.cfl*self.h/(self.c0+self.vmax[None]),
                               0.125*self.h**2/self.nu_max,
                               0.25*ti.sqrt(self.h/ti.max(self.amax[None],1e-6)),
                               target-self.clock[None])

    @ti.kernel
    def advance(self):
        for i in self.x:
            dt = self.dt[None]
            vel = self.v[i]+dt*self.a[i]
            pos = self.x[i]+dt*vel
            z,n = self.bed(pos[0],pos[1])
            self.bed_contact[i] = 0
            # Unilateral DEM contact, zero restitution, Coulomb tangent impulse.
            # This is an approximate solid-wall treatment, not a solved bed phase.
            clearance = (pos[2]-z)*n[2]
            if clearance < 0.5*self.dp:
                self.bed_contact[i] = 1
                pos[2] = z+0.5*self.dp/n[2]
                vn = vel.dot(n)
                if vn < 0.0:
                    vt = vel-vn*n
                    speed = vt.norm()
                    vt *= ti.max(0.0,1.0-self.mu*(-vn)/ti.max(speed,1e-8))
                    vel = vt
            # Outer DEM limits are reflective and explicitly diagnosed.
            for axis in ti.static(range(2)):
                lo = self.x0 if axis == 0 else self.y0
                hi = lo+(self.nx-1)*self.dx if axis == 0 else lo+(self.ny-1)*self.dy
                if pos[axis] < lo+self.dp or pos[axis] > hi-self.dp:
                    ti.atomic_add(self.wall_hits[None],1)
                    pos[axis] = ti.min(ti.max(pos[axis],lo+self.dp),hi-self.dp)
                    vel[axis] = 0.0
            self.x[i],self.v[i] = pos,vel
            ti.atomic_max(self.displacement2[None],(pos-self.reference[i]).norm_sqr())
        self.clock[None] += ti.cast(self.dt[None],ti.f64)

    def step(self,target):
        self.clear()
        self.insert()
        self.build_neighbors()
        self.density()
        self.forces()
        self.choose_dt(target)
        self.advance()


def seed(cfg, terrain):
    dp = cfg['particle_spacing_m']
    shape = cfg['source_lattice_shape']
    spacing = np.asarray(cfg.get('source_dimensions_m',np.asarray(shape)*dp))/np.asarray(shape)
    i,j,k = np.meshgrid(*(np.arange(n) for n in shape), indexing='ij')
    tangent = np.array([terrain['path_x'][2]-terrain['path_x'][0],
                        terrain['path_y'][2]-terrain['path_y'][0]])
    tangent /= np.linalg.norm(tangent)
    normal = np.array([-tangent[1],tangent[0]])
    centre = np.array([terrain['path_x'][0],terrain['path_y'][0]])
    xy = centre + ((i.ravel()+0.5)*spacing[0])[:,None]*tangent + ((j.ravel()-(shape[1]-1)/2)*spacing[1])[:,None]*normal
    cols = (xy[:,0]-terrain['x'][0])/(terrain['x'][1]-terrain['x'][0])
    rows = (xy[:,1]-terrain['y_desc'][0])/(terrain['y_desc'][1]-terrain['y_desc'][0])
    bed = map_coordinates(terrain['elevation'],[rows,cols],order=1,mode='nearest')
    # Thin safety offset above steep DEM normals prevents an initial collision.
    gy,gx = np.gradient(terrain['elevation'],terrain['y_desc'],terrain['x'])
    zx=map_coordinates(gx,[rows,cols],order=1,mode='nearest')
    zy=map_coordinates(gy,[rows,cols],order=1,mode='nearest')
    z = bed+0.5*dp*np.sqrt(1+zx*zx+zy*zy)+k.ravel()*spacing[2]
    return np.column_stack([xy,z]).astype(np.float32)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--duration',type=float)
    parser.add_argument('--tag',default='baseline_90min')
    parser.add_argument('--resume',action='store_true')
    parser.add_argument('--config',default='config/sph3d.json')
    args=parser.parse_args()
    cfg=json.loads((ROOT/args.config).read_text(encoding='utf-8'))
    if args.duration is not None:
        cfg['duration_s']=args.duration
    output=Path(cfg['output_root'])/args.tag
    output.mkdir(parents=True,exist_ok=True)
    if list(output.glob('frame_*.npz')) and not args.resume:
        raise RuntimeError('Run already has frames: use --resume or choose a new --tag.')
    if args.resume:
        saved_cfg=json.loads((output/'config_used.json').read_text(encoding='utf-8'))
        for key in cfg:
            if key != 'duration_s' and cfg[key] != saved_cfg.get(key):
                raise RuntimeError(f'Cannot resume after changing {key}; choose a new run tag.')
    os.environ['CUDA_VISIBLE_DEVICES']=cfg['gpu_visible_device']
    ti.init(arch=ti.cuda,default_fp=ti.f32,offline_cache_file_path=str(Path(cfg['output_root'])/'taichi_cache'),device_memory_GB=cfg.get('device_memory_GB',2))
    if ti.cfg.arch != ti.cuda:
        raise RuntimeError('CUDA initialization failed; refusing an unexpectedly slow CPU fallback.')
    terrain=np.load(ROOT/'data/processed/terrain_model.npz')
    positions=seed(cfg,terrain)
    sim=SPH3D(cfg,terrain,positions)
    (output/'config_used.json').write_text(json.dumps(cfg,indent=2),encoding='utf-8')
    wall=time.perf_counter()
    steps=0
    records=[]
    frame=0
    if args.resume:
        old=np.load(output/'checkpoint.npz')
        sim.x.from_numpy(old['position_m'])
        sim.v.from_numpy(old['velocity_m_s'])
        sim.clock[None]=float(old['time_s'])
        frame=int(old['frame'])+1
        records=json.loads((output/'diagnostics.json').read_text())
    startup_end=min(cfg['startup_duration_s'],cfg['duration_s'])
    targets=sorted(set(np.arange(0,startup_end+1e-8,cfg['startup_output_interval_s']).tolist()
                       +np.arange(startup_end,cfg['duration_s']+1e-8,cfg['output_interval_s']).tolist()))
    if targets[-1] < cfg['duration_s']:
        targets.append(cfg['duration_s'])
    for target in targets:
        if args.resume and target <= float(sim.clock[None])+1e-6:
            continue
        while float(sim.clock[None]) < target-1e-6:
            for _ in range(64):
                sim.step(target)
            steps+=64
            if sim.overflow[None]:
                raise RuntimeError('Spatial hash bucket overflow: increase bucket_capacity; run invalid.')
        sim.clear(); sim.insert(); sim.build_neighbors(); sim.density()
        pos,vel,rho=sim.x.to_numpy(),sim.v.to_numpy(),sim.rho.to_numpy()
        if not (np.isfinite(pos).all() and np.isfinite(vel).all() and np.isfinite(rho).all()):
            raise RuntimeError('Nonfinite particle state; run invalid.')
        speed=np.linalg.norm(vel,axis=1)
        record={'frame':frame,'time_s':float(sim.clock[None]),'particles':sim.n,
                'max_speed_m_s':float(speed.max()),'mean_speed_m_s':float(speed.mean()),
                'kinetic_energy_J':float(0.5*sim.mass*np.sum(speed.astype(float)**2)),
                'mass_kg':float(sim.mass*sim.n),'reference_volume_m3':float(sim.n*sim.particle_volume),
                'density_ratio_p99':float(np.percentile(rho/sim.rho0,99)),
                'density_ratio_max':float(rho.max()/sim.rho0),
                'max_mach':float(speed.max()/sim.c0),'outer_boundary_hits':int(sim.wall_hits[None]),
                'near_bed_fraction':float(sim.bed_contact.to_numpy().mean()),
                'elapsed_wall_s':time.perf_counter()-wall}
        records.append(record)
        state={'position_m':pos,'velocity_m_s':vel,'density_kg_m3':rho,
               'pressure_Pa':sim.pressure.to_numpy(),'effective_kinematic_viscosity_m2_s':sim.nu_eff.to_numpy(),
               'time_s':np.array(record['time_s']),'frame':np.array(frame)}
        np.savez_compressed(output/f'frame_{frame:04d}.npz',**state)
        np.savez_compressed(output/'checkpoint.npz',**state)
        (output/'diagnostics.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
        print(json.dumps(record),flush=True)
        frame+=1
    summary={'solver':'3-D WCSPH with linear barotropic EOS, Wendland C2, DEM contact',
             'completed':True,'particle_count':sim.n,'particle_spacing_m':sim.dp,
             'duration_s':float(sim.clock[None]),'saved_frames':frame,'elapsed_wall_s':time.perf_counter()-wall,
             'mass_relative_change':(records[-1]['mass_kg']-records[0]['mass_kg'])/records[0]['mass_kg'],
             'peak_speed_m_s':max(r['max_speed_m_s'] for r in records),
             'peak_density_ratio':max(r['density_ratio_max'] for r in records),
             'limitations':cfg['notes']}
    (output/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary),flush=True)


if __name__=='__main__':
    main()
