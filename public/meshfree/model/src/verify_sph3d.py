"""Small independent numerical checks; run before the terrain simulation."""
import os
import json
import numpy as np
from simulate_sph3d import SPH3D, ROOT, ti

cfg=json.loads((ROOT/'config/sph3d.json').read_text(encoding='utf-8'))
os.environ['CUDA_VISIBLE_DEVICES']=cfg['gpu_visible_device']
ti.init(arch=ti.cuda,offline_cache_file_path=cfg['output_root']+'/taichi_cache',device_memory_GB=2)
terrain={'x':np.array([-1000.,1000.]),'y_desc':np.array([1000.,-1000.]),'elevation':np.zeros((2,2))}
grid=np.stack(np.meshgrid(np.arange(6),np.arange(6),np.arange(6),indexing='ij'),axis=-1).reshape(-1,3)*5.
grid[:,2]+=100.
s=SPH3D(cfg,terrain,grid)
s.clear();s.insert();s.build_neighbors();s.density();s.forces()
dist=np.linalg.norm(grid[:,None,:]-grid[None,:,:],axis=2)
q=dist/s.h
w=21/(16*np.pi*s.h**3)*np.maximum(1-q/2,0)**4*(2*q+1)
reference=s.mass*w.sum(axis=1)
error=float(np.max(np.abs(s.rho.to_numpy()-reference))/np.max(reference))
assert error < 2e-5,error
forces=s.a.to_numpy()
residual=forces.mean(axis=0)+np.array([0.,0.,cfg['gravity_m_s2']])
assert np.linalg.norm(residual)<1e-3,residual
assert s.overflow[None]==0
# Repeat the all-pairs density comparison after motion and neighbor reuse.
for _ in range(200):s.step(2.0)
s.clear();s.insert();s.build_neighbors();s.density()
moved=s.x.to_numpy()
dist2=np.linalg.norm(moved[:,None,:]-moved[None,:,:],axis=2)
q2=dist2/s.h
ref2=s.mass*(21/(16*np.pi*s.h**3)*np.maximum(1-q2/2,0)**4*(2*q2+1)).sum(axis=1)
cache_error=float(np.max(np.abs(s.rho.to_numpy()-ref2))/np.max(ref2))
assert cache_error<2e-5,cache_error
# Single parcel: exact acceleration, independent motion of all components.
single=SPH3D(cfg,terrain,np.array([[0.,0.,100.]]))
single.v.from_numpy(np.array([[3.,4.,5.]],np.float32))
single.step(0.01)
dt=single.dt[None]
expected_v=np.array([3.,4.,5.-9.81*dt])
expected_x=np.array([0.,0.,100.])+expected_v*dt
assert np.max(np.abs(single.v.to_numpy()[0]-expected_v))<1e-5
assert np.max(np.abs(single.x.to_numpy()[0]-expected_x))<1e-5
# Flat-bed contact must remove inward normal velocity without penetration.
contact=SPH3D(cfg,terrain,np.array([[0.,0.,2.51]]))
contact.v.from_numpy(np.array([[0.,0.,-10.]],np.float32))
contact.step(0.01)
assert contact.x.to_numpy()[0,2]>=2.5-1e-5
assert abs(contact.v.to_numpy()[0,2])<1e-6
result={'density_relative_error':error,'pair_force_mean_residual_m_s2':residual.tolist(),
        'moving_neighbor_cache_density_error':cache_error,
        'free_flight_xyz':'passed','flat_bed_nonpenetration':'passed','hash_overflow':0}
from pathlib import Path
out=Path(cfg['output_root']);out.mkdir(parents=True,exist_ok=True)
(out/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
