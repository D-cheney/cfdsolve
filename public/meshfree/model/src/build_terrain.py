from __future__ import annotations

import csv
import gzip
import heapq
import json
import math
import re
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import RegularGridInterpolator
from scipy.ndimage import gaussian_filter
from scipy.signal import savgol_filter


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config" / "model_config.json"
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False


def load_config() -> dict:
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def read_hgt_gz(path: Path) -> np.ndarray:
    with gzip.open(path, "rb") as stream:
        raw = stream.read()
    values = np.frombuffer(raw, dtype=">i2")
    side = int(round(math.sqrt(values.size)))
    if side * side != values.size:
        raise ValueError(f"Unexpected HGT size: {values.size} samples")
    dem = values.reshape(side, side).astype(np.float64)
    invalid = dem <= -32000
    if invalid.any():
        valid_mean = float(np.nanmean(np.where(invalid, np.nan, dem)))
        dem[invalid] = valid_mean
    return dem


def hgt_tile_origin(path: Path) -> tuple[float, float]:
    match = re.search(r"([NS])(\d{2})([EW])(\d{3})", path.name.upper())
    if not match:
        raise ValueError(f"Cannot infer HGT tile origin from file name: {path.name}")
    latitude = float(match.group(2)) * (1.0 if match.group(1) == "N" else -1.0)
    longitude = float(match.group(4)) * (1.0 if match.group(3) == "E" else -1.0)
    return longitude, latitude


def crop_dem(dem: np.ndarray, bbox: list[float], tile_west: float, tile_south: float):
    lon_min, lat_min, lon_max, lat_max = bbox
    side = dem.shape[0]
    lons = np.linspace(tile_west, tile_west + 1.0, side)
    lats_desc = np.linspace(tile_south + 1.0, tile_south, side)
    col_mask = (lons >= lon_min) & (lons <= lon_max)
    row_mask = (lats_desc >= lat_min) & (lats_desc <= lat_max)
    crop = dem[np.ix_(row_mask, col_mask)]
    return lons[col_mask], lats_desc[row_mask], crop


def local_xy(lons: np.ndarray, lats: np.ndarray, origin_lon: float, origin_lat: float):
    metres_per_lon = 111320.0 * math.cos(math.radians(origin_lat))
    metres_per_lat = 110540.0
    x = (lons - origin_lon) * metres_per_lon
    y = (lats - origin_lat) * metres_per_lat
    return x, y


def nearest_index(values: np.ndarray, target: float) -> int:
    return int(np.argmin(np.abs(values - target)))


def astar_valley_path(
    dem: np.ndarray,
    x: np.ndarray,
    y_desc: np.ndarray,
    start: tuple[int, int],
    goal: tuple[int, int],
) -> list[tuple[int, int]]:
    nrows, ncols = dem.shape
    gscore = np.full((nrows, ncols), np.inf)
    came_r = np.full((nrows, ncols), -1, dtype=np.int32)
    came_c = np.full((nrows, ncols), -1, dtype=np.int32)
    closed = np.zeros((nrows, ncols), dtype=bool)
    gscore[start] = 0.0

    gx, gy = x[goal[1]], y_desc[goal[0]]
    mean_dx = abs(float(np.median(np.diff(x))))
    mean_dy = abs(float(np.median(np.diff(y_desc))))

    def heuristic(r: int, c: int) -> float:
        return math.hypot(x[c] - gx, y_desc[r] - gy)

    queue: list[tuple[float, int, int]] = [(heuristic(*start), start[0], start[1])]
    neighbours = [
        (-1, -1), (-1, 0), (-1, 1),
        (0, -1), (0, 1),
        (1, -1), (1, 0), (1, 1),
    ]

    while queue:
        _, r, c = heapq.heappop(queue)
        if closed[r, c]:
            continue
        closed[r, c] = True
        if (r, c) == goal:
            break
        z0 = dem[r, c]
        for dr, dc in neighbours:
            rr, cc = r + dr, c + dc
            if rr < 0 or rr >= nrows or cc < 0 or cc >= ncols or closed[rr, cc]:
                continue
            horizontal = math.hypot(dc * mean_dx, dr * mean_dy)
            dz = dem[rr, cc] - z0
            uphill_slope = max(dz, 0.0) / max(horizontal, 1.0)
            roughness = abs(dz) / max(horizontal, 1.0)
            step_cost = horizontal * (1.0 + 80.0 * uphill_slope**2 + 0.08 * roughness)
            candidate = gscore[r, c] + step_cost
            if candidate < gscore[rr, cc]:
                gscore[rr, cc] = candidate
                came_r[rr, cc] = r
                came_c[rr, cc] = c
                heapq.heappush(queue, (candidate + heuristic(rr, cc), rr, cc))

    if not closed[goal]:
        raise RuntimeError("No terrain path found between source and port")

    path = [goal]
    current = goal
    while current != start:
        r, c = current
        current = (int(came_r[r, c]), int(came_c[r, c]))
        if current[0] < 0:
            raise RuntimeError("Broken A* predecessor chain")
        path.append(current)
    path.reverse()
    return path


def resample_path(x: np.ndarray, y: np.ndarray, z: np.ndarray, spacing: float):
    keep = np.r_[True, np.hypot(np.diff(x), np.diff(y)) > 1e-6]
    x, y, z = x[keep], y[keep], z[keep]
    cumulative = np.r_[0.0, np.cumsum(np.hypot(np.diff(x), np.diff(y)))]
    s_new = np.arange(0.0, cumulative[-1] + spacing, spacing)
    x_new = np.interp(s_new, cumulative, x)
    y_new = np.interp(s_new, cumulative, y)
    z_new = np.interp(s_new, cumulative, z)
    if z_new.size >= 11:
        window = min(31, z_new.size - (1 - z_new.size % 2))
        if window >= 7:
            z_new = savgol_filter(z_new, window, 2, mode="interp")
    # A river centreline cannot climb through local DEM artefacts. Retain a tiny
    # longitudinal fall to keep the reduced-order flow model well posed.
    z_new = np.minimum.accumulate(z_new)
    z_new -= np.linspace(0.0, 0.02 * (len(z_new) - 1), len(z_new))
    return s_new, x_new, y_new, z_new


def estimate_valley_width(
    x_axis: np.ndarray,
    y_axis_asc: np.ndarray,
    dem_asc: np.ndarray,
    path_x: np.ndarray,
    path_y: np.ndarray,
    path_z: np.ndarray,
    threshold: float,
    max_half_width: float,
) -> np.ndarray:
    interp = RegularGridInterpolator(
        (y_axis_asc, x_axis), dem_asc, bounds_error=False, fill_value=np.nan
    )
    widths = np.empty_like(path_x)
    offsets = np.arange(0.0, max_half_width + 30.0, 30.0)
    dx_ds = np.gradient(path_x)
    dy_ds = np.gradient(path_y)
    norm = np.maximum(np.hypot(dx_ds, dy_ds), 1e-9)
    nx, ny = -dy_ds / norm, dx_ds / norm

    for i in range(path_x.size):
        half_widths = []
        for sign in (-1.0, 1.0):
            qx = path_x[i] + sign * nx[i] * offsets
            qy = path_y[i] + sign * ny[i] * offsets
            qz = interp(np.column_stack([qy, qx]))
            above = np.where(np.isfinite(qz) & (qz >= path_z[i] + threshold))[0]
            half_widths.append(offsets[above[0]] if above.size else max_half_width)
        widths[i] = float(np.clip(sum(half_widths), 80.0, 2.0 * max_half_width))

    widths = gaussian_filter(widths, sigma=3.0)
    return np.clip(widths, 80.0, 1500.0)


def write_terrain_vtk(path: Path, x: np.ndarray, y_desc: np.ndarray, z: np.ndarray, stride: int):
    xx = x[::stride]
    yy = y_desc[::stride]
    zz = z[::stride, ::stride]
    nr, nc = zz.shape
    with path.open("w", encoding="ascii", newline="\n") as stream:
        stream.write("# vtk DataFile Version 3.0\nGyirong terrain surface\nASCII\nDATASET POLYDATA\n")
        stream.write(f"POINTS {nr * nc} float\n")
        for r in range(nr):
            for c in range(nc):
                stream.write(f"{xx[c]:.3f} {yy[r]:.3f} {zz[r, c]:.3f}\n")
        ntri = 2 * (nr - 1) * (nc - 1)
        stream.write(f"POLYGONS {ntri} {4 * ntri}\n")
        for r in range(nr - 1):
            for c in range(nc - 1):
                a = r * nc + c
                b = a + 1
                d = (r + 1) * nc + c
                e = d + 1
                stream.write(f"3 {a} {d} {b}\n")
                stream.write(f"3 {b} {d} {e}\n")
        stream.write(f"POINT_DATA {nr * nc}\nSCALARS elevation_m float 1\nLOOKUP_TABLE default\n")
        for value in zz.ravel():
            stream.write(f"{value:.3f}\n")


def write_particles_csv(
    path: Path,
    s: np.ndarray,
    path_s: np.ndarray,
    path_x: np.ndarray,
    path_y: np.ndarray,
    path_z: np.ndarray,
    volume_total: float,
):
    x = np.interp(s, path_s, path_x)
    y = np.interp(s, path_s, path_y)
    z = np.interp(s, path_s, path_z) + 2.0
    volume = volume_total / len(s)
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["particle_id", "s_m", "x_local_m", "y_local_m", "z_m", "volume_m3"])
        for i in range(len(s)):
            writer.writerow([i, f"{s[i]:.3f}", f"{x[i]:.3f}", f"{y[i]:.3f}", f"{z[i]:.3f}", f"{volume:.6f}"])


def hillshade(z: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(z)
    slope = np.pi / 2.0 - np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    azimuth, altitude = np.deg2rad(315.0), np.deg2rad(45.0)
    shaded = np.sin(altitude) * np.sin(slope) + np.cos(altitude) * np.cos(slope) * np.cos(azimuth - aspect)
    return (shaded - shaded.min()) / max(shaded.max() - shaded.min(), 1e-9)


def main():
    cfg = load_config()
    PROCESSED.mkdir(parents=True, exist_ok=True)
    OUTPUTS.mkdir(parents=True, exist_ok=True)
    terrain_cfg = cfg["terrain"]
    source = cfg["source"]
    receptor = cfg["receptor"]

    dem_path = ROOT / terrain_cfg["dem_file"]
    dem = read_hgt_gz(dem_path)
    tile_west, tile_south = hgt_tile_origin(dem_path)
    lons, lats_desc, crop = crop_dem(dem, terrain_cfg["bbox_wgs84"], tile_west, tile_south)
    x, y_desc = local_xy(lons, lats_desc, receptor["longitude"], receptor["latitude"])

    route_step = int(terrain_cfg["routing_resolution_cells"])
    route_dem = gaussian_filter(crop[::route_step, ::route_step], sigma=1.0)
    route_lons = lons[::route_step]
    route_lats = lats_desc[::route_step]
    route_x = x[::route_step]
    route_y = y_desc[::route_step]
    start = (
        nearest_index(route_lats, source["latitude"]),
        nearest_index(route_lons, source["longitude"]),
    )
    goal = (
        nearest_index(route_lats, receptor["latitude"]),
        nearest_index(route_lons, receptor["longitude"]),
    )
    grid_path = astar_valley_path(route_dem, route_x, route_y, start, goal)
    pr = np.array([p[0] for p in grid_path], dtype=int)
    pc = np.array([p[1] for p in grid_path], dtype=int)
    raw_x, raw_y, raw_z = route_x[pc], route_y[pr], route_dem[pr, pc]
    path_s, path_x, path_y, path_z = resample_path(
        raw_x, raw_y, raw_z, float(terrain_cfg["path_resample_spacing_m"])
    )

    widths = estimate_valley_width(
        x,
        y_desc[::-1],
        crop[::-1, :],
        path_x,
        path_y,
        path_z,
        float(terrain_cfg["valley_relief_threshold_m"]),
        float(terrain_cfg["maximum_half_width_m"]),
    )
    dzds = np.gradient(path_z, path_s)
    slope_deg = np.degrees(np.arctan(-dzds))

    metres_per_lon = 111320.0 * math.cos(math.radians(receptor["latitude"]))
    metres_per_lat = 110540.0
    path_lon = receptor["longitude"] + path_x / metres_per_lon
    path_lat = receptor["latitude"] + path_y / metres_per_lat

    np.savez_compressed(
        PROCESSED / "terrain_model.npz",
        lon=lons,
        lat_desc=lats_desc,
        elevation=crop,
        x=x,
        y_desc=y_desc,
        path_s=path_s,
        path_x=path_x,
        path_y=path_y,
        path_z=path_z,
        path_width=widths,
        path_slope_deg=slope_deg,
        path_lon=path_lon,
        path_lat=path_lat,
    )

    with (PROCESSED / "flow_path.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["s_m", "longitude", "latitude", "x_local_m", "y_local_m", "elevation_m", "slope_deg", "valley_width_m"])
        for row in zip(path_s, path_lon, path_lat, path_x, path_y, path_z, slope_deg, widths):
            writer.writerow([f"{v:.6f}" for v in row])

    mesh_stride = max(1, int(round(float(terrain_cfg["terrain_mesh_spacing_m"]) / float(terrain_cfg["dem_nominal_resolution_m"]))))
    write_terrain_vtk(OUTPUTS / "terrain_surface.vtk", x, y_desc, crop, mesh_stride)

    scenario = cfg["baseline_scenario"]
    n_particles = int(scenario["particle_count"])
    slug_length = float(scenario["initial_surge_length_m"])
    particle_s = np.linspace(0.0, slug_length, n_particles, endpoint=False) + slug_length / (2 * n_particles)
    write_particles_csv(
        PROCESSED / "source_particles.csv",
        particle_s,
        path_s,
        path_x,
        path_y,
        path_z,
        float(scenario["initial_released_volume_m3"]),
    )

    extent = [lons[0], lons[-1], lats_desc[-1], lats_desc[0]]
    fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
    ax.imshow(hillshade(crop), extent=extent, origin="upper", cmap="gray", alpha=0.72)
    contours = ax.contour(lons, lats_desc, crop, levels=np.arange(1800, 5601, 400), colors="black", linewidths=0.35, alpha=0.55)
    ax.clabel(contours, inline=True, fontsize=7, fmt="%d m")
    ax.plot(path_lon, path_lat, color="#d73027", linewidth=2.2, label="提取的主运动通道")
    ax.scatter(source["longitude"], source["latitude"], s=65, marker="^", color="#2c7bb6", label="Purepu 源区", zorder=5)
    ax.scatter(receptor["longitude"], receptor["latitude"], s=65, marker="s", color="#fdae61", label="吉隆口岸", zorder=5)
    ax.set_xlabel("经度 (°E)")
    ax.set_ylabel("纬度 (°N)")
    ax.set_title("Purepu 冰川源区—吉隆口岸地形与计算通道")
    ax.legend(loc="best")
    fig.savefig(OUTPUTS / "terrain_overview.png", dpi=180)
    plt.close(fig)

    fig, ax1 = plt.subplots(figsize=(10, 5.5), constrained_layout=True)
    ax1.plot(path_s / 1000.0, path_z, color="#2c7bb6", linewidth=2.0)
    ax1.set_xlabel("沿程距离 (km)")
    ax1.set_ylabel("中心线高程 (m)")
    ax1.grid(alpha=0.25)
    ax2 = ax1.twinx()
    ax2.plot(path_s / 1000.0, widths, color="#d95f0e", linewidth=1.4, alpha=0.8)
    ax2.set_ylabel("估算谷宽 (m)")
    ax1.set_title("运动通道纵剖面与谷地宽度")
    fig.savefig(OUTPUTS / "longitudinal_profile.png", dpi=180)
    plt.close(fig)

    summary = {
        "path_length_km": float(path_s[-1] / 1000.0),
        "source_dem_elevation_m": float(path_z[0]),
        "port_dem_elevation_m": float(path_z[-1]),
        "total_relief_m": float(path_z[0] - path_z[-1]),
        "mean_slope_deg": float(np.degrees(np.arctan((path_z[0] - path_z[-1]) / path_s[-1]))),
        "median_valley_width_m": float(np.median(widths)),
        "terrain_grid_shape": [int(crop.shape[0]), int(crop.shape[1])],
    }
    (OUTPUTS / "terrain_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
