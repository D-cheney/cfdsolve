from __future__ import annotations

import csv
import json
import math
import os
from pathlib import Path

import imageio_ffmpeg
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FFMpegWriter, FuncAnimation
from matplotlib.colors import LightSource


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"
VIDEO_DIR = OUTPUTS / "component_videos"
CONFIG = ROOT / "config" / "model_config.json"
REQUESTED_COMPONENT = os.environ.get("VIDEO_COMPONENT", "").strip()

mpl.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
mpl.rcParams["axes.unicode_minus"] = False
mpl.rcParams["animation.ffmpeg_path"] = imageio_ffmpeg.get_ffmpeg_exe()


def hillshade(z: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(z)
    slope = np.pi / 2.0 - np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    azimuth, altitude = np.deg2rad(315.0), np.deg2rad(42.0)
    shaded = np.sin(altitude) * np.sin(slope) + np.cos(altitude) * np.cos(slope) * np.cos(azimuth - aspect)
    return (shaded - shaded.min()) / max(shaded.max() - shaded.min(), 1.0e-9)


def phase_name(front_m: float) -> str:
    if front_m < 6000.0:
        return "冰湖排水与融水洪峰"
    if front_m < 22000.0:
        return "沟道侵蚀与物质裹挟"
    return "高含沙洪流—泥石流下泄"


def stage_label(front_m: float, deposited_fraction: float) -> str:
    if deposited_fraction >= 0.999:
        return "口岸沉积区稳定"
    if deposited_fraction > 0.0:
        return f"口岸沉积粒子 {deposited_fraction:.0%}"
    return phase_name(front_m)


def save_animation(fig, update, frame_sequence, stem: str) -> dict:
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    if REQUESTED_COMPONENT and not stem.startswith(REQUESTED_COMPONENT):
        plt.close(fig)
        return None
    animation = FuncAnimation(fig, update, frames=frame_sequence, interval=1000.0 / 12.0, blit=False)
    video_path = VIDEO_DIR / f"{stem}.mp4"
    writer = FFMpegWriter(
        fps=12,
        codec="libx264",
        bitrate=6500,
        extra_args=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    )
    animation.save(video_path, writer=writer, dpi=150)
    update(0)
    fig.savefig(VIDEO_DIR / f"{stem}_cover.png", dpi=150)
    plt.close(fig)
    return {
        "file": video_path.name,
        "cover": f"{stem}_cover.png",
        "frames": len(frame_sequence),
        "fps": 12,
        "duration_s": len(frame_sequence) / 12.0,
        "resolution": [1920, 1080],
        "bytes": video_path.stat().st_size,
    }


def add_footer(fig, dynamic_particles: int, visualized_particles: int) -> None:
    fig.text(
        0.5,
        0.025,
        f"高保真研究演示：真实DEM + {dynamic_particles}个动力SPH粒子 + {visualized_particles}个地形跟随横向子粒子；未经现场反演，不用于工程预警。",
        ha="center",
        va="bottom",
        fontsize=9,
        color="#8b1a1a",
    )


def main() -> None:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    terrain = np.load(PROCESSED / "terrain_model.npz")
    particles = np.load(OUTPUTS / "particle_history_2p5d.npz")
    summary = json.loads((OUTPUTS / "sph_summary.json").read_text(encoding="utf-8"))
    history = np.genfromtxt(OUTPUTS / "simulation_history.csv", delimiter=",", names=True, encoding="utf-8-sig")

    times = particles["time_s"]
    particle_s = particles["s_m"]
    particle_x = particles["x_m"]
    particle_y = particles["y_m"]
    particle_z = particles["z_m"]
    particle_lon = particles["lon"]
    particle_lat = particles["lat"]
    particle_speed = particles["speed_m_s"]
    particle_depth = particles["depth_m"]
    particle_active = particles["active"]
    particle_deposited = particles["deposited"] if "deposited" in particles.files else np.zeros_like(particle_active)
    n_particles = particle_s.shape[1]
    dynamic_particles = int(summary["particle_count"])

    path_s = terrain["path_s"]
    path_x = terrain["path_x"]
    path_y = terrain["path_y"]
    path_z = terrain["path_z"]
    path_lon = terrain["path_lon"]
    path_lat = terrain["path_lat"]
    length = float(path_s[-1])
    front = np.minimum(np.percentile(particle_s, 99.0, axis=1), length)
    speed_norm = mpl.colors.Normalize(vmin=0.0, vmax=max(50.0, float(np.percentile(particle_speed, 99.7))))
    frame_sequence = list(range(len(times))) + [len(times) - 1] * 24
    results = []

    # 1. Terrain plan view.
    lons = terrain["lon"]
    lats_desc = terrain["lat_desc"]
    elevation = terrain["elevation"]
    fig, ax = plt.subplots(figsize=(12.8, 7.2), dpi=150, facecolor="white")
    fig.subplots_adjust(left=0.07, right=0.88, top=0.88, bottom=0.11)
    extent = [lons[0], lons[-1], lats_desc[-1], lats_desc[0]]
    ax.imshow(hillshade(elevation), extent=extent, origin="upper", cmap="gray", alpha=0.86, interpolation="bilinear", rasterized=True)
    ax.contour(lons, lats_desc, elevation, levels=np.arange(1800, 5801, 250), colors="#222222", linewidths=0.16, alpha=0.28)
    major = ax.contour(lons, lats_desc, elevation, levels=np.arange(2000, 5801, 500), colors="#111111", linewidths=0.30, alpha=0.54)
    ax.clabel(major, inline=True, fontsize=6.5, fmt="%d m")
    ax.plot(path_lon, path_lat, color="#0b5bd3", linewidth=1.05, alpha=0.72)
    ax.scatter(path_lon[0], path_lat[0], marker="^", s=90, color="#f28e2b", edgecolor="white", linewidth=0.8, zorder=6)
    ax.scatter(path_lon[-1], path_lat[-1], marker="s", s=75, color="#2ca25f", edgecolor="white", linewidth=0.8, zorder=6)
    ax.text(path_lon[0] - 0.004, path_lat[0] + 0.005, "Purepu冰川源区", ha="right", va="bottom", fontsize=10)
    ax.text(path_lon[-1] + 0.004, path_lat[-1] - 0.004, "吉隆口岸", ha="left", va="top", fontsize=10)
    receptor = cfg["receptor"]
    metres_per_lon = 111320.0 * math.cos(math.radians(receptor["latitude"]))
    scale_lat = lats_desc[-1] + 0.012
    scale_lon = lons[0] + 0.018
    scale_length = 5000.0 / metres_per_lon
    ax.plot([scale_lon, scale_lon + scale_length], [scale_lat, scale_lat], color="black", linewidth=2.2)
    ax.text(scale_lon + 0.5 * scale_length, scale_lat + 0.002, "5 km", ha="center", fontsize=8)
    ax.annotate("N", xy=(lons[0] + 0.017, lats_desc[0] - 0.014), xytext=(lons[0] + 0.017, lats_desc[0] - 0.045), ha="center", fontsize=10,
                arrowprops=dict(arrowstyle="-|>", color="black", linewidth=1.2))
    scatter = ax.scatter([], [], c=[], cmap="turbo", norm=speed_norm, s=2.2, alpha=0.72, edgecolors="none", zorder=5)
    leading, = ax.plot([], [], marker=">", markersize=8, color="#d62728", markeredgecolor="white", markeredgewidth=0.7, linestyle="none", zorder=7)
    colorbar = fig.colorbar(scatter, ax=ax, fraction=0.032, pad=0.02)
    colorbar.set_label("粒子速度 (m/s)")
    ax.set_xlabel("经度 (°E)")
    ax.set_ylabel("纬度 (°N)")
    ax.set_title(f"真实地形俯视传播｜{n_particles}个地形跟随计算粒子", fontsize=16)
    status = fig.text(0.5, 0.91, "", ha="center", fontsize=11)
    add_footer(fig, dynamic_particles, n_particles)

    def update_plan(frame_index: int):
        idx = min(frame_index, len(times) - 1)
        active = particle_active[idx]
        scatter.set_offsets(np.column_stack([particle_lon[idx, active], particle_lat[idx, active]]))
        scatter.set_array(particle_speed[idx, active])
        scatter.set_sizes(1.3 + 0.45 * np.sqrt(np.minimum(particle_depth[idx, active], 60.0)))
        lead = int(np.argmax(particle_s[idx]))
        leading.set_data([particle_lon[idx, lead]], [particle_lat[idx, lead]])
        status.set_text(
            f"t = {times[idx]/60.0:5.1f} min  |  前缘 = {front[idx]/1000.0:5.1f} km  |  最大速度 = {particle_speed[idx].max():4.1f} m/s  |  {stage_label(front[idx], float(np.mean(particle_deposited[idx])))}"
        )
        return scatter, leading, status

    results.append(save_animation(fig, update_plan, frame_sequence, "01_terrain_plan_view"))

    # 2. Fixed-camera 3-D terrain perspective.
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150, facecolor="white")
    ax3 = fig.add_subplot(111, projection="3d", computed_zorder=False)
    fig.subplots_adjust(left=0.01, right=0.92, top=0.88, bottom=0.06)
    stride = 10
    xx, yy = np.meshgrid(terrain["x"][::stride] / 1000.0, terrain["y_desc"][::stride] / 1000.0)
    zz = elevation[::stride, ::stride]
    terrain_colors = LightSource(azdeg=315, altdeg=38).shade(zz, cmap=plt.get_cmap("gist_earth"), vert_exag=0.7, blend_mode="soft")
    ax3.plot_surface(xx, yy, zz, facecolors=terrain_colors, rstride=1, cstride=1, linewidth=0, antialiased=False, shade=False, alpha=0.98, zorder=1)
    ax3.plot(path_x / 1000.0, path_y / 1000.0, path_z + 65.0, color="#1261d6", linewidth=1.8, alpha=0.88, zorder=8)
    ax3.scatter([path_x[0] / 1000.0], [path_y[0] / 1000.0], [path_z[0] + 80.0], marker="^", s=60, color="#f28e2b", edgecolor="white")
    ax3.scatter([path_x[-1] / 1000.0], [path_y[-1] / 1000.0], [path_z[-1] + 80.0], marker="s", s=50, color="#2ca25f", edgecolor="white")
    scatter3 = ax3.scatter([], [], [], c=[], cmap="turbo", norm=speed_norm, s=6.0, alpha=0.90, depthshade=False, edgecolors="none", zorder=10)
    leading3 = ax3.scatter([], [], [], marker="v", s=68, color="#d62728", edgecolor="white", linewidth=0.7, depthshade=False, zorder=11)
    ax3.set_xlabel("局地东向 (km)")
    ax3.set_ylabel("局地北向 (km)")
    ax3.set_zlabel("高程 (m)")
    ax3.set_zlim(1600.0, 5900.0)
    ax3.set_box_aspect((2.5, 1.25, 0.72))
    ax3.view_init(elev=31.0, azim=-122.0)
    fig.suptitle("山谷三维透视传播｜速度着色", fontsize=16, y=0.965)
    status3 = fig.text(0.5, 0.918, "", ha="center", fontsize=11)
    colorbar3 = fig.colorbar(mpl.cm.ScalarMappable(norm=speed_norm, cmap="turbo"), ax=ax3, fraction=0.025, pad=0.02, shrink=0.72)
    colorbar3.set_label("粒子速度 (m/s)")
    add_footer(fig, dynamic_particles, n_particles)

    def update_3d(frame_index: int):
        idx = min(frame_index, len(times) - 1)
        active = particle_active[idx]
        scatter3._offsets3d = (
            particle_x[idx, active] / 1000.0,
            particle_y[idx, active] / 1000.0,
            particle_z[idx, active] + 65.0,
        )
        scatter3.set_array(particle_speed[idx, active])
        scatter3.set_facecolors(plt.get_cmap("turbo")(speed_norm(particle_speed[idx, active])))
        scatter3.set_sizes(4.0 + 0.65 * np.sqrt(np.minimum(particle_depth[idx, active], 60.0)))
        lead = int(np.argmax(particle_s[idx]))
        leading3._offsets3d = (
            [particle_x[idx, lead] / 1000.0],
            [particle_y[idx, lead] / 1000.0],
            [particle_z[idx, lead] + 130.0],
        )
        status3.set_text(f"t = {times[idx]/60.0:5.1f} min  |  前缘 = {front[idx]/1000.0:5.1f} km  |  {stage_label(front[idx], float(np.mean(particle_deposited[idx])))}  |  粒子显示高度上移65 m")
        return scatter3, leading3, status3

    results.append(save_animation(fig, update_3d, frame_sequence, "02_terrain_3d_perspective"))

    # 3. Longitudinal profile.
    fig, axp = plt.subplots(figsize=(12.8, 7.2), dpi=150, facecolor="white")
    fig.subplots_adjust(left=0.09, right=0.92, top=0.86, bottom=0.13)
    axp.fill_between(path_s / 1000.0, 1600.0, path_z, color="#b8aa97", alpha=0.55)
    axp.plot(path_s / 1000.0, path_z, color="#3f3f3f", linewidth=1.6, label="谷底纵剖面")
    profile_scatter = axp.scatter([], [], c=[], cmap="turbo", norm=speed_norm, s=2.0, alpha=0.58, edgecolors="none")
    profile_front, = axp.plot([], [], marker="v", markersize=9, color="#d62728", markeredgecolor="white", linestyle="none", label="前缘")
    axp.set_xlim(0.0, length / 1000.0)
    axp.set_ylim(1700.0, 5700.0)
    axp.set_xlabel("沿程距离 (km)")
    axp.set_ylabel("高程 (m)")
    axp.set_title("纵剖面传播｜横向地形高程投影", fontsize=16)
    axp.grid(alpha=0.20)
    axp.legend(loc="upper right")
    colorbarp = fig.colorbar(profile_scatter, ax=axp, fraction=0.026, pad=0.018)
    colorbarp.set_label("粒子速度 (m/s)")
    statusp = fig.text(0.5, 0.90, "", ha="center", fontsize=11)
    add_footer(fig, dynamic_particles, n_particles)

    def update_profile(frame_index: int):
        idx = min(frame_index, len(times) - 1)
        active = particle_active[idx]
        profile_scatter.set_offsets(np.column_stack([particle_s[idx, active] / 1000.0, particle_z[idx, active] + 12.0]))
        profile_scatter.set_array(particle_speed[idx, active])
        profile_scatter.set_sizes(1.0 + 0.30 * np.sqrt(np.minimum(particle_depth[idx, active], 60.0)))
        front_z = np.interp(front[idx], path_s, path_z)
        profile_front.set_data([front[idx] / 1000.0], [front_z + 130.0])
        statusp.set_text(f"t = {times[idx]/60.0:5.1f} min  |  前缘 = {front[idx]/1000.0:5.1f} km  |  沉积粒子 = {float(np.mean(particle_deposited[idx])):.0%}")
        return profile_scatter, profile_front, statusp

    results.append(save_animation(fig, update_profile, frame_sequence, "03_longitudinal_profile"))

    # 4. Separate diagnostics video.
    ht = history["time_s"] / 60.0
    fig, axes = plt.subplots(2, 2, figsize=(12.8, 7.2), dpi=150, facecolor="white")
    fig.subplots_adjust(left=0.08, right=0.96, top=0.86, bottom=0.12, wspace=0.24, hspace=0.31)
    specs = [
        (history["front_distance_m"] / 1000.0, "前缘传播", "沿程距离 (km)", "#d62728"),
        (history["max_speed_m_s"], "最大速度", "速度 (m/s)", "#1f77b4"),
        (history["mixture_volume_m3"] / 1.0e4, "裹挟后的混合物体积", "体积 (万 m³)", "#2ca02c"),
        (history["max_depth_m"], "最大等效流深", "流深 (m)", "#9467bd"),
    ]
    diagnostic_lines = []
    diagnostic_dots = []
    diagnostic_cursors = []
    for axis, (values, panel_title, ylabel, color) in zip(axes.flat, specs):
        axis.set_xlim(0.0, ht[-1])
        ymin, ymax = float(np.min(values)), float(np.max(values))
        padding = max((ymax - ymin) * 0.08, 0.5)
        axis.set_ylim(max(0.0, ymin - padding), ymax + padding)
        line, = axis.plot([], [], color=color, linewidth=2.4)
        dot, = axis.plot([], [], "o", color=color, markersize=6)
        cursor = axis.axvline(ht[0], color="#555555", linestyle="--", linewidth=0.8, alpha=0.7)
        diagnostic_lines.append(line)
        diagnostic_dots.append(dot)
        diagnostic_cursors.append(cursor)
        axis.set_title(panel_title)
        axis.set_xlabel("模拟时间 (min)")
        axis.set_ylabel(ylabel)
        axis.grid(alpha=0.22)
    axes.flat[0].axhline(length / 1000.0, color="#555555", linestyle=":", linewidth=1.0)
    fig.suptitle("泥石流传播过程分量｜前缘、速度、体积与流深", fontsize=16)
    statusd = fig.text(0.5, 0.90, "", ha="center", fontsize=11)
    add_footer(fig, dynamic_particles, n_particles)

    def update_diagnostics(frame_index: int):
        idx = min(frame_index, len(ht) - 1)
        for line, dot, cursor, (values, _, _, _) in zip(diagnostic_lines, diagnostic_dots, diagnostic_cursors, specs):
            line.set_data(ht[: idx + 1], values[: idx + 1])
            dot.set_data([ht[idx]], [values[idx]])
            cursor.set_xdata([ht[idx], ht[idx]])
        reached = stage_label(history["front_distance_m"][idx], history["deposited_particle_fraction"][idx])
        statusd.set_text(f"t = {ht[idx]:5.1f} min  |  {reached}")
        return (*diagnostic_lines, *diagnostic_dots, *diagnostic_cursors, statusd)

    results.append(save_animation(fig, update_diagnostics, frame_sequence, "04_process_diagnostics"))

    results = [result for result in results if result is not None]
    manifest_path = VIDEO_DIR / "component_videos_manifest.json"
    if REQUESTED_COMPONENT and manifest_path.exists():
        previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        videos_by_name = {item["file"]: item for item in previous.get("videos", [])}
        videos_by_name.update({item["file"]: item for item in results})
        results = [videos_by_name[name] for name in sorted(videos_by_name)]
    manifest = {
        "simulation": "1200-particle 1-D SPH dynamics with 6000-parcel terrain-following 2.5-D reconstruction",
        "front_arrival_time_min": summary["front_arrival_time_min"],
        "maximum_speed_m_s": summary["maximum_speed_m_s"],
        "simulated_duration_min": float(times[-1] / 60.0),
        "dynamic_particle_count": int(summary["particle_count"]),
        "visualized_particle_count": int(n_particles),
        "final_deposited_particle_fraction": float(np.mean(particle_deposited[-1])),
        "videos": results,
        "warning": summary["warning"],
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
