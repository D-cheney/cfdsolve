from __future__ import annotations

import json
import math
from pathlib import Path

import imageio_ffmpeg
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FFMpegWriter, FuncAnimation


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"
CONFIG = ROOT / "config" / "model_config.json"

mpl.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
mpl.rcParams["axes.unicode_minus"] = False
mpl.rcParams["animation.ffmpeg_path"] = imageio_ffmpeg.get_ffmpeg_exe()


def hillshade(z: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(z)
    slope = np.pi / 2.0 - np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    azimuth, altitude = np.deg2rad(315.0), np.deg2rad(45.0)
    shaded = np.sin(altitude) * np.sin(slope) + np.cos(altitude) * np.cos(slope) * np.cos(azimuth - aspect)
    return (shaded - shaded.min()) / max(shaded.max() - shaded.min(), 1e-9)


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    terrain = np.load(PROCESSED / "terrain_model.npz")
    particles = np.load(OUTPUTS / "particle_history.npz")
    summary = json.loads((OUTPUTS / "sph_summary.json").read_text(encoding="utf-8"))

    times = particles["time_s"]
    s_frames = particles["s_m"]
    v_frames = particles["speed_m_s"]
    mass_frames = particles["mass_kg"]
    depth_frames = particles["depth_m"]
    deposited_frames = particles["deposited"] if "deposited" in particles.files else np.zeros_like(s_frames, dtype=np.bool_)

    path_s = terrain["path_s"]
    path_x = terrain["path_x"]
    path_y = terrain["path_y"]
    path_z = terrain["path_z"]
    path_width = terrain["path_width"]
    path_lon = terrain["path_lon"]
    path_lat = terrain["path_lat"]
    length = float(path_s[-1])

    lons = terrain["lon"]
    lats_desc = terrain["lat_desc"]
    elevation = terrain["elevation"]
    receptor = cfg["receptor"]
    metres_per_lon = 111320.0 * math.cos(math.radians(receptor["latitude"]))
    metres_per_lat = 110540.0

    dxds = np.gradient(path_x, path_s)
    dyds = np.gradient(path_y, path_s)
    norm = np.maximum(np.hypot(dxds, dyds), 1e-12)
    nx, ny = -dyds / norm, dxds / norm
    n_particles = s_frames.shape[1]
    transverse_fraction = ((np.arange(n_particles) * 0.61803398875) % 1.0 - 0.5) * 0.55

    front = np.minimum(np.percentile(s_frames, 99.0, axis=1), length)
    max_velocity_scale = max(50.0, float(np.percentile(v_frames, 99.5)))
    initial_mass = mass_frames[0]

    fig = plt.figure(figsize=(12.8, 7.2), dpi=150, facecolor="white")
    grid = fig.add_gridspec(2, 2, width_ratios=[1.65, 1.0], height_ratios=[1.0, 1.0], left=0.055, right=0.97, top=0.90, bottom=0.11, wspace=0.22, hspace=0.32)
    ax_map = fig.add_subplot(grid[:, 0])
    ax_profile = fig.add_subplot(grid[0, 1])
    ax_front = fig.add_subplot(grid[1, 1])

    extent = [lons[0], lons[-1], lats_desc[-1], lats_desc[0]]
    ax_map.imshow(hillshade(elevation), extent=extent, origin="upper", cmap="gray", alpha=0.80, interpolation="bilinear", rasterized=True)
    ax_map.contour(lons, lats_desc, elevation, levels=np.arange(1800, 5601, 250), colors="#333333", linewidths=0.16, alpha=0.28)
    major_contours = ax_map.contour(lons, lats_desc, elevation, levels=np.arange(2000, 5601, 500), colors="#111111", linewidths=0.28, alpha=0.55)
    ax_map.clabel(major_contours, inline=True, fontsize=6, fmt="%d m")
    ax_map.plot(path_lon, path_lat, color="#1464f4", linewidth=1.15, alpha=0.88)
    ax_map.scatter(path_lon[0], path_lat[0], marker="^", s=70, color="#f28e2b", edgecolor="white", linewidth=0.7, zorder=5)
    ax_map.scatter(path_lon[-1], path_lat[-1], marker="s", s=60, color="#35a853", edgecolor="white", linewidth=0.7, zorder=5)
    ax_map.text(path_lon[0] - 0.004, path_lat[0] + 0.005, "Purepu 源区", ha="right", va="bottom", fontsize=9)
    ax_map.text(path_lon[-1] + 0.004, path_lat[-1] - 0.004, "吉隆口岸", ha="left", va="top", fontsize=9)

    for distance_km in range(5, int(length / 1000.0), 5):
        marker_lon = np.interp(distance_km * 1000.0, path_s, path_lon)
        marker_lat = np.interp(distance_km * 1000.0, path_s, path_lat)
        ax_map.plot(marker_lon, marker_lat, "o", markersize=2.6, color="#1464f4", markeredgecolor="white", markeredgewidth=0.3, zorder=3)
        ax_map.text(marker_lon + 0.002, marker_lat + 0.0015, f"{distance_km} km", fontsize=6.5, color="#0b3c91")

    scale_lat = lats_desc[-1] + 0.012
    scale_lon = lons[0] + 0.018
    scale_lon_length = 5000.0 / metres_per_lon
    ax_map.plot([scale_lon, scale_lon + scale_lon_length], [scale_lat, scale_lat], color="black", linewidth=2.0, solid_capstyle="butt")
    ax_map.plot([scale_lon, scale_lon], [scale_lat - 0.0012, scale_lat + 0.0012], color="black", linewidth=1.0)
    ax_map.plot([scale_lon + scale_lon_length, scale_lon + scale_lon_length], [scale_lat - 0.0012, scale_lat + 0.0012], color="black", linewidth=1.0)
    ax_map.text(scale_lon + 0.5 * scale_lon_length, scale_lat + 0.0022, "5 km", ha="center", va="bottom", fontsize=7)
    ax_map.annotate("N", xy=(lons[0] + 0.018, lats_desc[0] - 0.014), xytext=(lons[0] + 0.018, lats_desc[0] - 0.042),
                    ha="center", va="center", fontsize=9, fontweight="bold",
                    arrowprops=dict(arrowstyle="-|>", color="black", linewidth=1.1))
    ax_map.set_xlabel("经度 (°E)")
    ax_map.set_ylabel("纬度 (°N)")
    ax_map.set_title("真实地形上的 SPH 粒子传播")

    speed_norm = mpl.colors.Normalize(vmin=0.0, vmax=max_velocity_scale)
    map_scatter = ax_map.scatter([], [], c=[], cmap="turbo", norm=speed_norm, s=10, alpha=0.88, edgecolors="none", zorder=4)
    map_front, = ax_map.plot([], [], marker=">", markersize=6.0, color="#d62728", markeredgecolor="white", markeredgewidth=0.45, linestyle="none", zorder=6)
    colorbar = fig.colorbar(map_scatter, ax=ax_map, fraction=0.038, pad=0.025)
    colorbar.set_label("粒子速度 (m/s)")

    ax_profile.plot(path_s / 1000.0, path_z, color="#444444", linewidth=1.3)
    ax_profile.fill_between(path_s / 1000.0, path_z.min() - 150.0, path_z, color="#c9c2b8", alpha=0.55)
    profile_scatter = ax_profile.scatter([], [], c=[], cmap="turbo", norm=speed_norm, s=2.5, alpha=0.78, edgecolors="none")
    ax_profile.set_xlim(0.0, length / 1000.0)
    ax_profile.set_ylim(path_z.min() - 80.0, path_z.max() + 420.0)
    ax_profile.set_xlabel("沿程距离 (km)")
    ax_profile.set_ylabel("高程 (m)")
    ax_profile.set_title("纵剖面传播")
    ax_profile.grid(alpha=0.20)

    ax_front.set_xlim(0.0, times[-1] / 60.0)
    ax_front.set_ylim(0.0, length / 1000.0 * 1.04)
    ax_front.axhline(length / 1000.0, color="#555555", linestyle="--", linewidth=0.9, label="吉隆口岸")
    if summary["front_arrival_time_min"] is not None:
        ax_front.axvline(float(summary["front_arrival_time_min"]), color="#777777", linestyle=":", linewidth=0.85)
        ax_front.text(float(summary["front_arrival_time_min"]) + 0.25, 1.0, "基线到达时刻", rotation=90, va="bottom", fontsize=7, color="#555555")
    front_line, = ax_front.plot([], [], color="#d62728", linewidth=2.2, label="前缘")
    front_dot, = ax_front.plot([], [], "o", color="#d62728", markersize=5)
    ax_front.set_xlabel("模拟时间 (min)")
    ax_front.set_ylabel("前缘距离 (km)")
    ax_front.set_title("前缘传播过程")
    ax_front.grid(alpha=0.20)
    ax_front.legend(loc="lower right", fontsize=8)

    title = fig.suptitle(f"吉隆口岸冰川融水—泥石流无网格基线仿真（{n_particles} 粒子）", fontsize=16, fontweight="normal")
    status = fig.text(0.5, 0.925, "", ha="center", va="bottom", fontsize=10)
    fig.text(0.5, 0.035, "研究级初筛：初始体积、流变和裹挟参数未经现场反演，不得作为工程预警或疏散依据。", ha="center", va="bottom", fontsize=9, color="#8b1a1a")

    def update(frame_index: int):
        idx = min(frame_index, len(times) - 1)
        s = np.clip(s_frames[idx], 0.0, length)
        speed = v_frames[idx]
        mass_ratio = np.maximum(mass_frames[idx] / initial_mass, 1.0)
        width = np.interp(s, path_s, path_width)
        px = np.interp(s, path_s, path_x)
        py = np.interp(s, path_s, path_y)
        pnx = np.interp(s, path_s, nx)
        pny = np.interp(s, path_s, ny)
        offset = transverse_fraction * width
        px = px + pnx * offset
        py = py + pny * offset
        plon = receptor["longitude"] + px / metres_per_lon
        plat = receptor["latitude"] + py / metres_per_lat

        map_scatter.set_offsets(np.column_stack([plon, plat]))
        map_scatter.set_array(speed)
        map_scatter.set_sizes(1.6 + 1.2 * np.sqrt(mass_ratio))
        leading = int(np.argmax(s))
        map_front.set_data([plon[leading]], [plat[leading]])

        pz = np.interp(s, path_s, path_z) + 35.0 + np.minimum(depth_frames[idx], 80.0) * 2.0
        profile_scatter.set_offsets(np.column_stack([s / 1000.0, pz]))
        profile_scatter.set_array(speed)

        front_line.set_data(times[: idx + 1] / 60.0, front[: idx + 1] / 1000.0)
        front_dot.set_data([times[idx] / 60.0], [front[idx] / 1000.0])
        mixture_volume = mass_frames[idx].sum() / float(cfg["baseline_scenario"]["bulk_density_kg_m3"])
        deposited_fraction = float(np.mean(deposited_frames[idx]))
        if deposited_fraction >= 0.999:
            reached = "口岸沉积区稳定"
        elif deposited_fraction > 0.0:
            reached = f"沉积粒子 {deposited_fraction:.0%}"
        else:
            reached = "已到达口岸" if front[idx] >= 0.99 * length else "传播中"
        status.set_text(
            f"t = {times[idx]/60.0:5.1f} min   |   前缘 = {front[idx]/1000.0:5.1f} km   |   "
            f"最大速度 = {speed.max():4.1f} m/s   |   混合物体积 = {mixture_volume/1e4:4.0f} 万 m³   |   {reached}"
        )
        return map_scatter, map_front, profile_scatter, front_line, front_dot, status, title

    frame_sequence = list(range(len(times))) + [len(times) - 1] * 24
    animation = FuncAnimation(fig, update, frames=frame_sequence, interval=1000 / 12, blit=False)
    output_path = OUTPUTS / "gyirong_debrisflow_sph_simulation.mp4"
    writer = FFMpegWriter(fps=12, codec="libx264", bitrate=5200, extra_args=["-pix_fmt", "yuv420p", "-movflags", "+faststart"])
    animation.save(output_path, writer=writer, dpi=150)
    update(0)
    fig.savefig(OUTPUTS / "gyirong_debrisflow_video_cover.png", dpi=150)
    plt.close(fig)

    video_info = {
        "file": output_path.name,
        "frames": len(frame_sequence),
        "fps": 12,
        "duration_s": len(frame_sequence) / 12.0,
        "resolution": [1920, 1080],
        "particle_count": int(n_particles),
        "initial_particle_spacing_m": float(summary["initial_particle_spacing_m"]),
        "simulated_duration_min": float(times[-1] / 60.0),
        "final_deposited_particle_fraction": float(np.mean(deposited_frames[-1])),
        "source_simulation": "particle_history.npz",
        "front_arrival_time_min": summary["front_arrival_time_min"],
        "warning": summary["warning"],
    }
    (OUTPUTS / "video_info.json").write_text(json.dumps(video_info, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(video_info, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
