from __future__ import annotations

import csv
import json
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "processed" / "terrain_model.npz"
HISTORY = ROOT / "outputs" / "simulation_history.csv"
SUMMARY = ROOT / "outputs" / "sph_summary.json"
OUTPUT = ROOT / "outputs" / "gyirong-model-overview.html"


def compact(values, digits=5):
    return np.round(np.asarray(values, dtype=float), digits).tolist()


def main():
    terrain = np.load(DATA)
    summary = json.loads(SUMMARY.read_text(encoding="utf-8"))
    lon = terrain["lon"]
    lat = terrain["lat_desc"]
    elevation = terrain["elevation"]

    # A sparse, real DEM-derived hillshade keeps the inline map compact.
    row_step = max(1, len(lat) // 38)
    col_step = max(1, len(lon) // 70)
    z = elevation[::row_step, ::col_step]
    gy, gx = np.gradient(z)
    shade = -0.55 * gx - 0.83 * gy
    lo, hi = np.percentile(shade, [2, 98])
    shade = np.clip((shade - lo) / max(hi - lo, 1e-9), 0.0, 1.0)
    cells = []
    for r, la in enumerate(lat[::row_step]):
        for c, lo_value in enumerate(lon[::col_step]):
            cells.append([round(float(lo_value), 5), round(float(la), 5), round(float(shade[r, c]), 3)])

    path_stride = max(1, len(terrain["path_lon"]) // 240)
    route = [
        [round(float(a), 6), round(float(b), 6)]
        for a, b in zip(terrain["path_lon"][::path_stride], terrain["path_lat"][::path_stride])
    ]

    with HISTORY.open("r", encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    history = [[round(float(r["time_s"]) / 60.0, 3), round(float(r["front_distance_m"]) / 1000.0, 3)] for r in rows[::2]]

    data = {
        "bbox": [float(lon[0]), float(lat[-1]), float(lon[-1]), float(lat[0])],
        "cellLon": float(abs(lon[min(col_step, len(lon) - 1)] - lon[0])),
        "cellLat": float(abs(lat[min(row_step, len(lat) - 1)] - lat[0])),
        "cells": cells,
        "route": route,
        "source": route[0],
        "port": route[-1],
        "history": history,
        "pathKm": round(float(summary["path_length_km"]), 1),
        "arrivalMin": round(float(summary["front_arrival_time_min"]), 1),
        "maxSpeed": round(float(summary["maximum_speed_m_s"]), 1),
    }
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    fragment = f'''<div id="gyirong-model-viz">
  <h1>Purepu 源区—吉隆口岸无网格初模</h1>
  <div class="viz-grid">
    <div class="card viz-stat"><div class="text-muted">计算通道</div><div class="viz-stat-value tabular-nums">{data['pathKm']} km</div></div>
    <div class="card viz-stat"><div class="text-muted">基线前缘到达</div><div class="viz-stat-value tabular-nums">{data['arrivalMin']} min</div></div>
    <div class="card viz-stat"><div class="text-muted">基线峰值速度</div><div class="viz-stat-value tabular-nums">{data['maxSpeed']} m/s</div></div>
  </div>
  <div class="map-wrap"><svg id="gyirong-map" role="img" aria-label="Purepu 冰川源区至吉隆口岸的真实高程地形、提取通道和端点"></svg></div>
  <div class="chart-wrap"><svg id="gyirong-front" role="img" aria-label="基线 SPH 情景中泥石流前缘距离随时间的变化"></svg></div>
  <p class="text-small text-muted">研究级初筛：初始体积、流变和裹挟参数尚未用现场数据反演。</p>
</div>
<style>
#gyirong-model-viz {{ width:100%; color:var(--foreground); }}
#gyirong-model-viz h1 {{ margin:0 0 12px 0; font-weight:500; }}
#gyirong-model-viz .viz-grid {{ margin-bottom:12px; }}
#gyirong-model-viz .map-wrap, #gyirong-model-viz .chart-wrap {{ width:100%; }}
#gyirong-model-viz svg {{ width:100%; display:block; }}
#gyirong-model-viz .terrain-cell {{ fill:var(--foreground); }}
#gyirong-model-viz .gridline {{ fill:none; stroke:var(--border); stroke-width:1; }}
#gyirong-model-viz .route {{ fill:none; stroke:var(--viz-series-1); stroke-width:3; }}
#gyirong-model-viz .source {{ fill:var(--viz-series-2); }}
#gyirong-model-viz .port {{ fill:var(--viz-series-3); }}
#gyirong-model-viz .front-line {{ fill:none; stroke:var(--viz-series-1); stroke-width:2.5; }}
#gyirong-model-viz .axis path, #gyirong-model-viz .axis line {{ stroke:var(--border); }}
#gyirong-model-viz text {{ fill:var(--foreground); font-size:12px; }}
#gyirong-model-viz text.muted {{ fill:var(--muted-foreground); }}
#gyirong-model-viz .caption {{ margin-top:8px; }}
</style>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script>
(() => {{
  const root = document.getElementById('gyirong-model-viz');
  const data = {payload};
  function mapDraw() {{
    const el = document.getElementById('gyirong-map');
    const w = Math.max(320, el.parentElement.clientWidth);
    const h = Math.max(330, Math.min(500, w * 0.58));
    const svg = d3.select(el).attr('viewBox', `0 0 ${{w}} ${{h}}`).style('height',`${{h}}px`);
    svg.selectAll('*').remove();
    const [xmin,ymin,xmax,ymax] = data.bbox;
    const mercY = lat => Math.log(Math.tan(Math.PI/4 + lat*Math.PI/360));
    const lonSpan = (xmax-xmin)*Math.PI/180;
    const latSpan = Math.abs(mercY(ymax)-mercY(ymin));
    const scale = Math.min((w-68)/lonSpan, (h-54)/latSpan);
    const projection = d3.geoMercator()
      .center([(xmin+xmax)/2,(ymin+ymax)/2])
      .translate([w/2,h/2])
      .scale(scale);
    const geoPath = d3.geoPath(projection);
    const graticule = d3.geoGraticule().extent([[xmin,ymin],[xmax,ymax]]).step([0.05,0.025]);
    svg.append('path').attr('class','gridline').attr('d',geoPath(graticule()));
    const dlon=data.cellLon, dlat=data.cellLat;
    svg.append('g').selectAll('rect').data(data.cells).join('rect')
      .attr('class','terrain-cell')
      .attr('x',d=>projection([d[0]-dlon/2,d[1]])[0])
      .attr('y',d=>projection([d[0],d[1]+dlat/2])[1])
      .attr('width',d=>Math.max(1,projection([d[0]+dlon/2,d[1]])[0]-projection([d[0]-dlon/2,d[1]])[0]+0.6))
      .attr('height',d=>Math.max(1,projection([d[0],d[1]-dlat/2])[1]-projection([d[0],d[1]+dlat/2])[1]+0.6))
      .attr('opacity',d=>0.04+0.30*d[2]);
    const routeFeature={{type:'LineString',coordinates:data.route}};
    svg.append('path').attr('class','route').attr('d',geoPath(routeFeature));
    [[data.source,'source','Purepu 源区',-9,-9,'end'],[data.port,'port','吉隆口岸',10,17,'start']].forEach(item=>{{
      const p=projection(item[0]);
      svg.append('circle').attr('class',item[1]).attr('cx',p[0]).attr('cy',p[1]).attr('r',6);
      svg.append('text').attr('x',p[0]+item[3]).attr('y',p[1]+item[4]).attr('text-anchor',item[5]).text(item[2]);
    }});
    svg.append('text').attr('class','muted').attr('x',44).attr('y',h-10).text('WGS 84 经纬度；底图为约 30 m DEM 降采样晕渲');
  }}
  function chartDraw() {{
    const el=document.getElementById('gyirong-front');
    const w=Math.max(320,el.parentElement.clientWidth), h=w<480?280:300;
    const m={{top:28,right:24,bottom:54,left:64}};
    const svg=d3.select(el).attr('viewBox',`0 0 ${{w}} ${{h}}`).style('height',`${{h}}px`);
    svg.selectAll('*').remove();
    const x=d3.scaleLinear().domain([0,d3.max(data.history,d=>d[0])*1.02]).range([m.left,w-m.right]);
    const y=d3.scaleLinear().domain([0,data.pathKm*1.04]).range([h-m.bottom,m.top]);
    svg.append('rect').attr('data-chart-frame','').attr('x',m.left).attr('y',m.top).attr('width',w-m.left-m.right).attr('height',h-m.top-m.bottom).attr('fill','none').attr('stroke','var(--border)');
    svg.append('g').attr('class','axis').attr('transform',`translate(0,${{h-m.bottom}})`).call(d3.axisBottom(x).ticks(w<480?4:7));
    svg.append('g').attr('class','axis').attr('transform',`translate(${{m.left}},0)`).call(d3.axisLeft(y).ticks(5));
    svg.append('path').datum(data.history).attr('class','front-line').attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1])));
    svg.append('line').attr('x1',m.left).attr('x2',w-m.right).attr('y1',y(data.pathKm)).attr('y2',y(data.pathKm)).attr('stroke','var(--border)').attr('stroke-dasharray','5 4');
    svg.append('text').attr('x',m.left).attr('y',18).text('基线 SPH 前缘传播');
    svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',(m.left+w-m.right)/2).attr('y',h-12).attr('text-anchor','middle').text('时间 (min)');
    svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('transform',`translate(16,${{(m.top+h-m.bottom)/2}}) rotate(-90)`).attr('text-anchor','middle').text('前缘沿程距离 (km)');
  }}
  const draw=()=>{{mapDraw();chartDraw();}};
  draw();
  new ResizeObserver(draw).observe(root);
}})();
</script>'''
    OUTPUT.write_text(fragment, encoding="utf-8", newline="\n")
    print(OUTPUT)


if __name__ == "__main__":
    main()
