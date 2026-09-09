"""Persistent solve -> cloud reconstruction -> four videos -> validation job.

Launch as a hidden independent Windows process so a chat turn interruption does
not discard a multi-hour computation. Its status and logs live with the run.
"""
import os
import sys
import json
import time
import hashlib
import subprocess
import traceback
from pathlib import Path
import numpy as np
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
RUN=Path('D:/openclaw/codextemp/jilong_sph3d/cloud_480k_90min')

def status(stage,**extra):
    data={'stage':stage,'updated_local':time.strftime('%Y-%m-%d %H:%M:%S'),'job_pid':os.getpid(),**extra}
    tmp=RUN/'task_status.pending.json'
    tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    os.replace(tmp,RUN/'task_status.json')

def execute(script,arguments):
    with (RUN/f'{script}.log').open('a',encoding='utf-8') as log:
        child=subprocess.Popen([sys.executable,'-u',str(ROOT/'src'/script),*arguments],stdout=log,stderr=subprocess.STDOUT,
                               cwd=ROOT,creationflags=subprocess.CREATE_NO_WINDOW)
        status('solving' if script=='simulate_sph3d.py' else 'rendering',child_pid=child.pid)
        code=child.wait()
    if code:raise RuntimeError(f'{script} exited with code {code}; see the run log')

def main():
    RUN.mkdir(parents=True,exist_ok=True)
    os.environ['TEMP']='D:/openclaw/codextemp';os.environ['TMP']=os.environ['TEMP']
    summary_path=RUN/'summary.json'
    if not summary_path.exists():
        args=['--config','config/sph3d_480k.json','--tag',RUN.name]
        if (RUN/'checkpoint.npz').exists():args.append('--resume')
        execute('simulate_sph3d.py',args)
    summary=json.loads(summary_path.read_text())
    assert summary['completed'] and abs(summary['duration_s']-5400)<1e-5 and summary['particle_count']==480000
    execute('cloud_presentation.py',['--run',RUN.name])
    status('verifying')
    output=RUN/'presentation'
    diagnostics=json.loads((RUN/'diagnostics.json').read_text())
    assert diagnostics[0]['time_s']==0 and diagnostics[-1]['time_s']==5400
    assert all(b['time_s']>a['time_s'] for a,b in zip(diagnostics,diagnostics[1:]))
    assert all(d['particles']==480000 and d['mass_kg']==diagnostics[0]['mass_kg'] for d in diagnostics)
    for record in diagnostics:
        with np.load(RUN/f"frame_{record['frame']:04d}.npz") as d:
            assert d['position_m'].shape==(480000,3) and d['velocity_m_s'].shape==(480000,3)
            assert np.isfinite(d['position_m']).all() and np.isfinite(d['velocity_m_s']).all()
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    movies=sorted((output/'videos').glob('*.mp4'))
    # Additional camera exports may coexist with the four required base views.
    required={'01_southeast.mp4','02_northwest.mp4','03_low_angle.mp4','04_top.mp4'}
    assert required.issubset({f.name for f in movies})
    checks=[]
    for f in movies:
        r=subprocess.run([ff,'-v','error','-i',str(f),'-f','null','-'],capture_output=True,text=True,creationflags=subprocess.CREATE_NO_WINDOW)
        assert r.returncode==0,(f.name,r.stderr)
        checks.append({'file':f.name,'bytes':f.stat().st_size,'decode_ok':True})
    qa={'independent_dynamic_particles':480000,'particle_multiplier':20,'physical_duration_s':5400,
        'frames_checked':len(diagnostics),'finite_states':True,'mass_constant':True,'cloud_videos':checks,
        'other_outputs':'static PNG images','completed_local':time.strftime('%Y-%m-%d %H:%M:%S')}
    (output/'quality_check.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    hashes={name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in
            ['src/simulate_sph3d.py','src/cloud_presentation.py','config/sph3d_480k.json']}
    (output/'source_sha256.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
    status('complete',presentation=str(output/'index.html'),quality_check=qa)

if __name__=='__main__':
    try:main()
    except Exception:
        status('failed',error=traceback.format_exc())
        raise
