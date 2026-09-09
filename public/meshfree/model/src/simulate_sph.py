from __future__ import annotations

import csv
import json
import math
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from numba import njit


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config" / "model_config.json"
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False


def cubic_kernel_1d(r: float, h: float) -> float:
    q = abs(r) / h
    sigma = 2.0 / (3.0 * h)
    if q < 1.0:
        return sigma * (1.0 - 1.5 * q * q + 0.75 * q**3)
    if q < 2.0:
        return sigma * 0.25 * (2.0 - q) ** 3
    return 0.0


def cubic_gradient_1d(r: float, h: float) -> float:
    if r == 0.0:
        return 0.0
    q = abs(r) / h
    sigma = 2.0 / (3.0 * h)
    if q < 1.0:
        dwdq = sigma * (-3.0 * q + 2.25 * q * q)
    elif q < 2.0:
        dwdq = -sigma * 0.75 * (2.0 - q) ** 2
    else:
        return 0.0
    return dwdq * math.copysign(1.0, r) / h


def build_pairs(s: np.ndarray, support: float):
    order = np.argsort(s)
    pairs: list[tuple[int, int, float]] = []
    for a, i in enumerate(order):
        b = a + 1
        while b < len(order):
            j = order[b]
            distance = s[j] - s[i]
            if distance >= support:
                break
            pairs.append((int(i), int(j), float(s[i] - s[j])))
            b += 1
    return pairs


@njit(cache=True)
def percentile_99_sorted(values: np.ndarray) -> float:
    """99th percentile for order-preserving 1-D Lagrangian particles."""
    position = 0.99 * (len(values) - 1)
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    fraction = position - lower
    return values[lower] * (1.0 - fraction) + values[upper] * fraction


@njit(cache=True)
def run_sph_core(
    path_s: np.ndarray,
    path_width: np.ndarray,
    dzds_path: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    base_mass: np.ndarray,
    mass: np.ndarray,
    smoothing_length: float,
    bulk_density: float,
    friction_start: float,
    friction_end: float,
    drag_start: float,
    drag_end: float,
    amp_max: float,
    vreg: float,
    tmax: float,
    output_interval: float,
    long_duration_mode: bool,
    retain_at_receptor: bool,
    deposition_zone_length: float,
):
    """Compiled order-preserving 1-D SPH loop for particle-refined runs."""
    n = len(s)
    length = path_s[-1]
    support = 2.0 * smoothing_length
    g = 9.81
    maximum_frames = int(tmax / output_interval) + 3
    history = np.zeros((maximum_frames, 8), dtype=np.float64)
    frame_times = np.zeros(maximum_frames, dtype=np.float64)
    frame_s = np.zeros((maximum_frames, n), dtype=np.float64)
    frame_v = np.zeros((maximum_frames, n), dtype=np.float64)
    frame_mass = np.zeros((maximum_frames, n), dtype=np.float64)
    frame_depth = np.zeros((maximum_frames, n), dtype=np.float64)
    frame_deposited = np.zeros((maximum_frames, n), dtype=np.bool_)
    line_density = np.empty(n, dtype=np.float64)
    width = np.empty(n, dtype=np.float64)
    dzds = np.empty(n, dtype=np.float64)
    depth = np.empty(n, dtype=np.float64)
    hydro_force = np.empty(n, dtype=np.float64)
    acceleration = np.empty(n, dtype=np.float64)
    deposited = np.zeros(n, dtype=np.bool_)
    deposit_position = np.empty(n, dtype=np.float64)
    for i in range(n):
        deposit_position[i] = length - deposition_zone_length * (n - 1 - i) / max(n - 1, 1)

    next_output = 0.0
    t = 0.0
    frame_count = 0
    max_speed_seen = np.max(v)
    arrival_time = -1.0
    arrival_threshold = 0.99 * length
    w0 = 2.0 / (3.0 * smoothing_length)
    path_spacing = path_s[1] - path_s[0]

    while t < tmax:
        for i in range(n):
            line_density[i] = mass[i] * w0

        # Particle order remains monotonic in this depth-averaged route model,
        # so only adjacent particles inside the compact support are visited.
        for i in range(n - 1):
            j = i + 1
            while j < n:
                distance = s[j] - s[i]
                if distance >= support:
                    break
                q = distance / smoothing_length
                if q < 1.0:
                    wij = w0 * (1.0 - 1.5 * q * q + 0.75 * q * q * q)
                else:
                    wij = w0 * 0.25 * (2.0 - q) ** 3
                line_density[i] += mass[j] * wij
                line_density[j] += mass[i] * wij
                j += 1

        for i in range(n):
            si = min(max(s[i], 0.0), length)
            path_index = min(int(si / path_spacing), len(path_s) - 2)
            path_fraction = (si - path_s[path_index]) / path_spacing
            width[i] = path_width[path_index] * (1.0 - path_fraction) + path_width[path_index + 1] * path_fraction
            dzds[i] = dzds_path[path_index] * (1.0 - path_fraction) + dzds_path[path_index + 1] * path_fraction
            cos_theta = 1.0 / math.sqrt(1.0 + dzds[i] * dzds[i])
            progress = min(max(s[i] / length, 0.0), 1.0)
            transition = progress * progress * (3.0 - 2.0 * progress)
            friction = friction_start + (friction_end - friction_start) * transition
            drag = drag_start + (drag_end - drag_start) * transition
            depth[i] = max(line_density[i] / (bulk_density * max(width[i], 1.0)), 0.05)
            hydro_force[i] = 0.5 * bulk_density * g * cos_theta * width[i] * depth[i] * depth[i]
            if deposited[i]:
                acceleration[i] = 0.0
            else:
                acceleration[i] = -g * dzds[i] * cos_theta
                acceleration[i] -= friction * g * cos_theta * v[i] / math.sqrt(v[i] * v[i] + vreg * vreg)
                acceleration[i] -= drag * v[i] * abs(v[i])

        for i in range(n - 1):
            j = i + 1
            while j < n:
                distance = s[j] - s[i]
                if distance >= support:
                    break
                rij = -distance
                q = distance / smoothing_length
                if q < 1.0:
                    wij = w0 * (1.0 - 1.5 * q * q + 0.75 * q * q * q)
                    dwdq = w0 * (-3.0 * q + 2.25 * q * q)
                else:
                    wij = w0 * 0.25 * (2.0 - q) ** 3
                    dwdq = -w0 * 0.75 * (2.0 - q) ** 2
                grad = -dwdq / smoothing_length
                coeff = hydro_force[i] / max(line_density[i] ** 2, 1e-12) + hydro_force[j] / max(line_density[j] ** 2, 1e-12)
                if not deposited[i]:
                    acceleration[i] -= mass[j] * coeff * grad
                if not deposited[j]:
                    acceleration[j] += mass[i] * coeff * grad
                if (v[i] - v[j]) * rij < 0.0:
                    damping = 0.08 * (v[j] - v[i]) * wij
                    if not deposited[i]:
                        acceleration[i] += mass[j] / max(line_density[j], 1e-9) * damping
                    if not deposited[j]:
                        acceleration[j] -= mass[i] / max(line_density[i], 1e-9) * damping
                j += 1

        max_characteristic_speed = 1.0
        for i in range(n):
            characteristic_speed = abs(v[i]) + math.sqrt(g * depth[i])
            if characteristic_speed > max_characteristic_speed:
                max_characteristic_speed = characteristic_speed
        dt = min(1.0, 0.25 * smoothing_length / max_characteristic_speed)

        for i in range(n):
            if deposited[i]:
                v[i] = 0.0
                s[i] = deposit_position[i]
                continue
            v[i] = max(v[i] + acceleration[i] * dt, 0.0)
            s[i] = max(s[i] + v[i] * dt, 0.0)
            progress = min(max(s[i] / length, 0.0), 1.0)
            smooth_progress = progress * progress * (3.0 - 2.0 * progress)
            target_mass = base_mass[i] * (1.0 + (amp_max - 1.0) * smooth_progress)
            if target_mass > mass[i]:
                old_mass = mass[i]
                mass[i] = target_mass
                v[i] *= old_mass / mass[i]
            # The receptor is represented as an absorbing deposition belt rather
            # than a single rigid wall.  Each parcel has a monotonic target slot
            # inside that belt, so the moving mass settles progressively without
            # creating an artificial, extremely dense pile at one coordinate.
            if retain_at_receptor and s[i] >= deposit_position[i]:
                deposited[i] = True
                s[i] = deposit_position[i]
                v[i] = 0.0

        t += dt
        current_max_speed = np.max(v)
        if current_max_speed > max_speed_seen:
            max_speed_seen = current_max_speed
        front = percentile_99_sorted(s)
        if arrival_time < 0.0 and front >= arrival_threshold:
            arrival_time = t

        if t >= next_output or t >= tmax:
            total_mass = 0.0
            momentum_speed = 0.0
            any_active = False
            max_depth = 0.0
            for i in range(n):
                total_mass += mass[i]
                momentum_speed += mass[i] * v[i]
                if not deposited[i]:
                    any_active = True
                if depth[i] > max_depth:
                    max_depth = depth[i]
            history[frame_count, 0] = t
            history[frame_count, 1] = min(front, length)
            history[frame_count, 2] = current_max_speed
            history[frame_count, 3] = momentum_speed / total_mass
            history[frame_count, 4] = total_mass / bulk_density
            history[frame_count, 5] = max_depth
            history[frame_count, 6] = 1.0 if arrival_time >= 0.0 else 0.0
            history[frame_count, 7] = np.sum(deposited) / n
            frame_times[frame_count] = t
            frame_s[frame_count] = s
            frame_v[frame_count] = v
            frame_mass[frame_count] = mass
            frame_depth[frame_count] = depth
            frame_deposited[frame_count] = deposited
            frame_count += 1
            next_output += output_interval
            if (not any_active) and long_duration_mode:
                while next_output <= tmax + 1.0e-9:
                    history[frame_count] = history[frame_count - 1]
                    history[frame_count, 0] = next_output
                    frame_times[frame_count] = next_output
                    frame_s[frame_count] = s
                    frame_v[frame_count] = v
                    frame_mass[frame_count] = mass
                    frame_depth[frame_count] = depth
                    frame_deposited[frame_count] = deposited
                    frame_count += 1
                    next_output += output_interval
                t = tmax
                break
            if (not long_duration_mode) and arrival_time >= 0.0 and ((not any_active) or t > arrival_time + 600.0):
                break

    return (
        history[:frame_count], frame_times[:frame_count], frame_s[:frame_count],
        frame_v[:frame_count], frame_mass[:frame_count], frame_depth[:frame_count],
        frame_deposited[:frame_count], s, v, mass, deposited, t, max_speed_seen, arrival_time,
    )


def write_particle_vtk(path: Path, x: np.ndarray, y: np.ndarray, z: np.ndarray, speed: np.ndarray, depth: np.ndarray, mass: np.ndarray):
    n = len(x)
    with path.open("w", encoding="ascii", newline="\n") as stream:
        stream.write("# vtk DataFile Version 3.0\nGyirong SPH particles\nASCII\nDATASET POLYDATA\n")
        stream.write(f"POINTS {n} float\n")
        for xx, yy, zz in zip(x, y, z):
            stream.write(f"{xx:.3f} {yy:.3f} {zz:.3f}\n")
        stream.write(f"VERTICES {n} {2*n}\n")
        for i in range(n):
            stream.write(f"1 {i}\n")
        stream.write(f"POINT_DATA {n}\n")
        for name, values in (("speed_m_s", speed), ("depth_m", depth), ("mass_kg", mass)):
            stream.write(f"SCALARS {name} float 1\nLOOKUP_TABLE default\n")
            for value in values:
                stream.write(f"{value:.6f}\n")


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    sc = cfg["baseline_scenario"]
    terrain = np.load(PROCESSED / "terrain_model.npz")
    path_s = terrain["path_s"]
    path_x = terrain["path_x"]
    path_y = terrain["path_y"]
    path_z = terrain["path_z"]
    path_width = terrain["path_width"]
    length = float(path_s[-1])

    n = int(sc["particle_count"])
    slug_length = float(sc["initial_surge_length_m"])
    ds0 = slug_length / n
    smoothing_length = 1.35 * ds0
    s = np.linspace(0.0, slug_length, n, endpoint=False) + 0.5 * ds0
    v = np.full(n, float(sc.get("initial_velocity_m_s", 0.5)), dtype=float)
    bulk_density = float(sc["bulk_density_kg_m3"])
    total_volume = float(sc["initial_released_volume_m3"])
    initial_particle_mass = total_volume * bulk_density / n
    base_mass = np.full(n, initial_particle_mass)
    mass = base_mass.copy()
    friction_start = math.tan(math.radians(float(sc["basal_friction_angle_start_deg"])))
    friction_end = math.tan(math.radians(float(sc["basal_friction_angle_end_deg"])))
    drag_start = float(sc["quadratic_drag_start_per_m"])
    drag_end = float(sc["quadratic_drag_end_per_m"])
    amp_max = float(sc["mass_amplification_at_port"])
    vreg = float(sc["regularization_velocity_m_s"])
    tmax = float(sc["maximum_simulation_time_s"])
    output_interval = float(sc["output_interval_s"])
    long_duration_mode = bool(sc.get("long_duration_mode", False))
    retain_at_receptor = bool(sc.get("retain_particles_at_receptor", False))
    deposition_zone_length = float(sc.get("deposition_zone_length_m", 0.0))
    g = 9.81

    dzds_path = np.gradient(path_z, path_s)
    (
        history, frame_times, frame_s, frame_v, frame_mass, frame_depth,
        frame_deposited, s, v, mass, deposited, t, max_speed_seen, arrival_time,
    ) = run_sph_core(
        path_s, path_width, dzds_path, s, v, base_mass, mass,
        smoothing_length, bulk_density, friction_start, friction_end,
        drag_start, drag_end, amp_max, vreg, tmax, output_interval,
        long_duration_mode, retain_at_receptor, deposition_zone_length,
    )

    snapshots: list[tuple[float, np.ndarray, np.ndarray]] = []
    next_snapshot_time = 0.0
    for frame_time, snapshot_s, snapshot_v in zip(frame_times, frame_s, frame_v):
        if frame_time >= next_snapshot_time:
            snapshots.append((float(frame_time), snapshot_s, snapshot_v))
            next_snapshot_time += 300.0

    OUTPUTS.mkdir(parents=True, exist_ok=True)
    with (OUTPUTS / "simulation_history.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["time_s", "front_distance_m", "max_speed_m_s", "mass_weighted_speed_m_s", "mixture_volume_m3", "max_depth_m", "port_reached", "deposited_particle_fraction"])
        writer.writerows([[f"{value:.6f}" for value in row] for row in history])

    np.savez_compressed(
        OUTPUTS / "particle_history.npz",
        time_s=frame_times,
        s_m=frame_s,
        speed_m_s=frame_v,
        mass_kg=frame_mass,
        depth_m=frame_depth,
        deposited=frame_deposited,
    )

    hist = np.asarray(history)
    fig, axes = plt.subplots(2, 1, figsize=(9, 8), constrained_layout=True)
    axes[0].plot(hist[:, 0] / 60.0, hist[:, 1] / 1000.0, color="#d73027", linewidth=2.0)
    axes[0].axhline(length / 1000.0, color="black", linewidth=0.8, linestyle="--")
    axes[0].set_ylabel("前缘沿程距离 (km)")
    axes[0].set_title("基线 SPH 情景：前缘传播")
    axes[0].grid(alpha=0.25)
    axes[1].plot(hist[:, 0] / 60.0, hist[:, 2], label="最大速度", color="#2c7bb6")
    axes[1].plot(hist[:, 0] / 60.0, hist[:, 3], label="质量加权平均速度", color="#fdae61")
    axes[1].set_xlabel("时间 (min)")
    axes[1].set_ylabel("速度 (m/s)")
    axes[1].grid(alpha=0.25)
    axes[1].legend()
    fig.savefig(OUTPUTS / "sph_runout_history.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(10, 5.5), constrained_layout=True)
    ax.plot(path_s / 1000.0, path_z, color="black", linewidth=1.2, label="谷底纵剖面")
    for snap_t, snap_s, snap_v in snapshots:
        sample = np.linspace(0, n - 1, min(80, n), dtype=int)
        ss = np.clip(snap_s[sample], 0.0, length)
        zz = np.interp(ss, path_s, path_z) + 30.0 + 2.0 * snap_v[sample]
        ax.scatter(ss / 1000.0, zz, s=8, alpha=0.45, label=f"{snap_t/60:.0f} min")
    ax.set_xlabel("沿程距离 (km)")
    ax.set_ylabel("高程 (m)")
    ax.set_title("SPH 粒子沿纵剖面的传播快照（垂向偏移表示速度）")
    ax.grid(alpha=0.2)
    handles, labels = ax.get_legend_handles_labels()
    unique = dict(zip(labels, handles))
    ax.legend(unique.values(), unique.keys(), ncol=3, fontsize=8)
    fig.savefig(OUTPUTS / "sph_particle_snapshots.png", dpi=180)
    plt.close(fig)

    s_clip = np.clip(s, 0.0, length)
    x = np.interp(s_clip, path_s, path_x)
    y = np.interp(s_clip, path_s, path_y)
    z = np.interp(s_clip, path_s, path_z)
    width = np.interp(s_clip, path_s, path_width)
    line_density = mass * cubic_kernel_1d(0.0, smoothing_length)
    for i, j, rij in build_pairs(s, 2.0 * smoothing_length):
        wij = cubic_kernel_1d(rij, smoothing_length)
        line_density[i] += mass[j] * wij
        line_density[j] += mass[i] * wij
    final_depth = np.maximum(line_density / (bulk_density * np.maximum(width, 1.0)), 0.05)
    write_particle_vtk(OUTPUTS / "final_particles.vtk", x, y, z + 0.5 * final_depth, v, final_depth, mass)

    summary = {
        "model_class": "1D depth-averaged SPH screening model",
        "path_length_km": length / 1000.0,
        "simulated_duration_min": t / 60.0,
        "particle_count": n,
        "initial_particle_spacing_m": ds0,
        "smoothing_length_m": smoothing_length,
        "initial_volume_per_particle_m3": total_volume / n,
        "particle_interpretation": sc.get("particle_interpretation", "coarse-grained computational parcels"),
        "configured_simulation_duration_min": tmax / 60.0,
        "long_duration_mode": long_duration_mode,
        "retain_particles_at_receptor": retain_at_receptor,
        "deposition_zone_length_m": deposition_zone_length,
        "final_deposited_particle_fraction": float(np.mean(deposited)),
        "port_reached": arrival_time >= 0.0,
        "front_arrival_time_min": None if arrival_time < 0.0 else arrival_time / 60.0,
        "maximum_speed_m_s": max_speed_seen,
        "final_mixture_volume_m3": float(mass.sum() / bulk_density),
        "initial_mixture_volume_m3": total_volume,
        "final_mass_amplification": float(mass.sum() / base_mass.sum()),
        "warning": "研究级初筛结果；参数未经现场反演，不得作为工程预测或预警依据。",
    }
    (OUTPUTS / "sph_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
