from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from scipy.ndimage import map_coordinates


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"
CONFIG = ROOT / "config" / "model_config.json"


def smoothstep01(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, 0.0, 1.0)
    return value * value * (3.0 - 2.0 * value)


def main() -> None:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    terrain = np.load(PROCESSED / "terrain_model.npz")
    parent = np.load(OUTPUTS / "particle_history.npz")

    time_s = parent["time_s"]
    parent_s = parent["s_m"]
    parent_speed = parent["speed_m_s"]
    parent_depth = parent["depth_m"]
    parent_mass = parent["mass_kg"]
    parent_deposited = parent["deposited"] if "deposited" in parent.files else np.zeros_like(parent_s, dtype=np.bool_)
    n_frames, n_parent = parent_s.shape

    # Five transverse parcels per dynamically solved SPH carrier provide a
    # terrain-following 2.5-D representation while preserving total mass.
    transverse_replicas = 5
    n_particles = n_parent * transverse_replicas
    parent_index = np.repeat(np.arange(n_parent), transverse_replicas)
    lane_index = np.tile(np.arange(transverse_replicas), n_parent)
    lane_fraction = np.array([-0.42, -0.21, 0.0, 0.21, 0.42], dtype=np.float64)[lane_index]
    golden_jitter = ((parent_index * 0.61803398875) % 1.0 - 0.5) * 0.055
    phase = 2.0 * np.pi * ((parent_index * 0.754877666 + lane_index * 0.173) % 1.0)

    path_s = terrain["path_s"]
    path_x = terrain["path_x"]
    path_y = terrain["path_y"]
    path_width = terrain["path_width"]
    path_length = float(path_s[-1])
    dxds = np.gradient(path_x, path_s)
    dyds = np.gradient(path_y, path_s)
    tangent_norm = np.maximum(np.hypot(dxds, dyds), 1.0e-12)
    normal_x = -dyds / tangent_norm
    normal_y = dxds / tangent_norm

    receptor = cfg["receptor"]
    metres_per_lon = 111320.0 * math.cos(math.radians(receptor["latitude"]))
    metres_per_lat = 110540.0

    parcel_s = np.empty((n_frames, n_particles), dtype=np.float32)
    parcel_x = np.empty_like(parcel_s)
    parcel_y = np.empty_like(parcel_s)
    parcel_z = np.empty_like(parcel_s)
    parcel_lon = np.empty_like(parcel_s)
    parcel_lat = np.empty_like(parcel_s)
    parcel_speed = np.empty_like(parcel_s)
    parcel_depth = np.empty_like(parcel_s)
    parcel_mass = np.empty_like(parcel_s)
    parcel_active = np.empty((n_frames, n_particles), dtype=np.bool_)
    parcel_deposited = np.empty((n_frames, n_particles), dtype=np.bool_)

    dem = terrain["elevation"]
    dem_x = terrain["x"]
    dem_y_desc = terrain["y_desc"]
    dx = float(dem_x[1] - dem_x[0])
    dy = float(dem_y_desc[1] - dem_y_desc[0])
    longitudinal_jitter = (lane_index - 2.0) * 0.11

    for frame in range(n_frames):
        raw_s = parent_s[frame, parent_index] + longitudinal_jitter
        s = np.clip(raw_s, 0.0, path_length)
        progress = smoothstep01(s / path_length)
        width = np.interp(s, path_s, path_width)
        # The flowing core occupies 20-56% of the estimated valley width,
        # widening with travel distance and entrainment.
        half_flow_width = width * (0.10 + 0.18 * (1.0 - np.exp(-s / 6500.0)))
        meander = 0.075 * np.sin(phase + s / 850.0) * (1.0 - np.exp(-s / 4500.0))
        bank_response = 0.025 * np.sin(0.55 * phase + s / 2100.0) * progress
        transverse_fraction = np.clip(lane_fraction + golden_jitter + meander + bank_response, -0.48, 0.48)
        offset = 2.0 * half_flow_width * transverse_fraction

        centre_x = np.interp(s, path_s, path_x)
        centre_y = np.interp(s, path_s, path_y)
        nx = np.interp(s, path_s, normal_x)
        ny = np.interp(s, path_s, normal_y)
        px = centre_x + nx * offset
        py = centre_y + ny * offset

        col = (px - dem_x[0]) / dx
        row = (py - dem_y_desc[0]) / dy
        ground_z = map_coordinates(dem, np.vstack([row, col]), order=1, mode="nearest")
        local_depth = parent_depth[frame, parent_index]
        free_surface_z = ground_z + np.minimum(0.5 * local_depth, 20.0) + 2.5

        parcel_s[frame] = s
        parcel_x[frame] = px
        parcel_y[frame] = py
        parcel_z[frame] = free_surface_z
        parcel_lon[frame] = receptor["longitude"] + px / metres_per_lon
        parcel_lat[frame] = receptor["latitude"] + py / metres_per_lat
        parcel_speed[frame] = parent_speed[frame, parent_index]
        parcel_depth[frame] = local_depth
        parcel_mass[frame] = parent_mass[frame, parent_index] / transverse_replicas
        parcel_active[frame] = raw_s <= path_length + 100.0
        parcel_deposited[frame] = parent_deposited[frame, parent_index]

    output_path = OUTPUTS / "particle_history_2p5d.npz"
    np.savez_compressed(
        output_path,
        time_s=time_s,
        parent_index=parent_index.astype(np.int32),
        s_m=parcel_s,
        x_m=parcel_x,
        y_m=parcel_y,
        z_m=parcel_z,
        lon=parcel_lon,
        lat=parcel_lat,
        speed_m_s=parcel_speed,
        depth_m=parcel_depth,
        mass_kg=parcel_mass,
        active=parcel_active,
        deposited=parcel_deposited,
    )

    density = cfg["baseline_scenario"]["bulk_density_kg_m3"]
    first_saved_volume = float(parcel_mass[0].sum(dtype=np.float64) / density)
    parent_first_saved_volume = float(parent_mass[0].sum(dtype=np.float64) / density)
    metadata = {
        "model_class": "terrain-following 2.5-D transverse parcel reconstruction",
        "dynamically_solved_parent_sph_particles": int(n_parent),
        "transverse_parcels_per_parent": transverse_replicas,
        "visualized_computational_parcels": int(n_particles),
        "frames": int(n_frames),
        "final_deposited_particle_fraction": float(np.mean(parcel_deposited[-1])),
        "source_released_volume_m3": cfg["baseline_scenario"]["initial_released_volume_m3"],
        "first_saved_frame_volume_m3": first_saved_volume,
        "subdivision_mass_conservation_relative_error": float(abs(first_saved_volume - parent_first_saved_volume) / parent_first_saved_volume),
        "caveat": "Transverse positions are terrain-following sub-parcel reconstruction; streamwise dynamics come from the calibrated-resolution 1-D SPH carrier solution.",
    }
    (OUTPUTS / "particle_history_2p5d_metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
