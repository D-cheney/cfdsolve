"""Download the pinned runtime with resumable-size HTTP ranges and SHA256 check."""
import json
import hashlib
import urllib.request
import concurrent.futures
import subprocess
import sys
import time
from pathlib import Path

BASE=Path('D:/openclaw/codextemp')
NAME='taichi-1.7.4-cp311-cp311-win_amd64.whl'
URL='https://pypi.tuna.tsinghua.edu.cn/packages/45/35/0495da9f8f0afa801a8e2da262fb75814bf9a4d788946c40bfc9340bf088/'+NAME
SIZE=83206769
CHUNK=1024*1024

def download(part):
    start=part*CHUNK;end=min(SIZE,start+CHUNK)-1
    for attempt in range(4):
        try:
            req=urllib.request.Request(URL,headers={'Range':f'bytes={start}-{end}'})
            with urllib.request.urlopen(req,timeout=30) as r:
                if r.status!=206 or r.headers['Content-Range']!=f'bytes {start}-{end}/{SIZE}':
                    raise RuntimeError('Server did not honor exact byte range')
                data=r.read()
            if len(data)!=end-start+1:raise RuntimeError('Incomplete chunk')
            return part,data
        except Exception:
            if attempt==3:raise
            time.sleep(1)

def main():
    with urllib.request.urlopen('https://pypi.org/pypi/taichi/1.7.4/json',timeout=30) as r:
        meta=json.load(r)
    expected=next(x['digests']['sha256'] for x in meta['urls'] if x['filename']==NAME)
    parts={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        tasks=[pool.submit(download,i) for i in range((SIZE+CHUNK-1)//CHUNK)]
        for f in concurrent.futures.as_completed(tasks):
            i,data=f.result();parts[i]=data
            print(f'Downloaded {len(parts)}/{len(tasks)} chunks',flush=True)
    blob=b''.join(parts[i] for i in range(len(parts)))
    if hashlib.sha256(blob).hexdigest()!=expected:raise RuntimeError('SHA256 mismatch')
    wheel=BASE/NAME
    wheel.write_bytes(blob)
    subprocess.run([sys.executable,'-m','pip','install','--no-deps','--target',str(BASE/'sph3d-libs'),str(wheel)],check=True)

if __name__=='__main__':main()
