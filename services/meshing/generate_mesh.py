import json
import math
import sys
import os
import tempfile
import traceback
import gmsh


def fail(message):
    print(json.dumps({"ok": False, "message": message}, ensure_ascii=False))
    sys.exit(1)


def main():
    request = json.load(sys.stdin)
    edges = {item["id"]: item for item in request.get("edges", [])}
    faces = request.get("faces", [])
    zones = request.get("cellZones", [])
    boundaries = request.get("boundarySets", [])
    settings = request.get("settings", {})
    if not edges or not faces:
        fail("没有可用于网格划分的边或面域")

    gmsh.initialize([])
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.model.add("cfdrookie-2d")
    point_tags = {}
    edge_curves = {}
    surface_tags = {}

    target = max(float(settings.get("targetSize", 5.0)), 1e-9)
    min_size = max(float(settings.get("minSize", target / 5)), 1e-9)
    max_size = max(float(settings.get("maxSize", target * 4)), min_size)

    def point_tag(point):
        key = (round(float(point["x"]), 10), round(float(point["y"]), 10))
        if key not in point_tags:
            point_tags[key] = gmsh.model.geo.addPoint(key[0], key[1], 0, target)
        return point_tags[key]

    for edge_id, edge in edges.items():
        pts = edge.get("points", [])
        curve_tags = []
        for index in range(len(pts) - 1):
            a, b = point_tag(pts[index]), point_tag(pts[index + 1])
            if a != b:
                curve_tags.append(gmsh.model.geo.addLine(a, b))
        if curve_tags:
            edge_curves[edge_id] = curve_tags

    for face in faces:
        outer_curves = [tag for edge_id in face.get("outerEdgeIds", []) for tag in edge_curves.get(edge_id, [])]
        if len(outer_curves) < 3:
            continue
        outer_loop = gmsh.model.geo.addCurveLoop(outer_curves, reorient=True)
        loops = [outer_loop]
        for hole in face.get("holeEdgeIds", []):
            hole_curves = [tag for edge_id in hole for tag in edge_curves.get(edge_id, [])]
            if len(hole_curves) >= 3:
                loops.append(gmsh.model.geo.addCurveLoop(hole_curves, reorient=True))
        surface_tags[face["id"]] = gmsh.model.geo.addPlaneSurface(loops)

    gmsh.model.geo.synchronize()
    if not surface_tags:
        fail("面域无法构成有效网格曲面")

    # Export names are preserved as Gmsh physical names so downstream solvers
    # can address the same boundary and cell-zone identifiers shown in the UI.
    for zone in zones:
        tags = [surface_tags[face_id] for face_id in zone.get("faceIds", []) if face_id in surface_tags]
        if tags:
            group = gmsh.model.addPhysicalGroup(2, tags)
            gmsh.model.setPhysicalName(2, group, zone.get("exportName") or zone.get("name") or f"zone_{group}")
    for boundary in boundaries:
        tags = [tag for edge_id in boundary.get("edgeIds", []) for tag in edge_curves.get(edge_id, [])]
        if tags:
            group = gmsh.model.addPhysicalGroup(1, tags)
            gmsh.model.setPhysicalName(1, group, boundary.get("exportName") or boundary.get("name") or f"boundary_{group}")

    method = settings.get("method", "tri")
    if method == "mapped-quad":
        for face in faces:
            tag = surface_tags.get(face["id"])
            if tag is None or face.get("holeEdgeIds") or len(face.get("outerEdgeIds", [])) != 4:
                fail("映射四边形只适用于无孔且具有四条逻辑边的面域")
            outer = face["outerEdgeIds"]
            nx = max(2, int(settings.get("mappedNx", 40))) + 1
            ny = max(2, int(settings.get("mappedNy", 20))) + 1
            for index, edge_id in enumerate(outer):
                curves = edge_curves.get(edge_id, [])
                if len(curves) != 1:
                    fail("映射四边形要求每条逻辑边未被离散拆段")
                gmsh.model.mesh.setTransfiniteCurve(curves[0], nx if index % 2 == 0 else ny)
            gmsh.model.mesh.setTransfiniteSurface(tag)
            gmsh.model.mesh.setRecombine(2, tag)
    elif method == "quad-dominant":
        for tag in surface_tags.values():
            gmsh.model.mesh.setRecombine(2, tag)

    background_fields = []
    for control in request.get("sizeControls", []):
        if not control.get("enabled", True):
            continue
        curves = [tag for edge_id in control.get("edgeIds", []) for tag in edge_curves.get(edge_id, [])]
        if not curves:
            continue
        distance_field = gmsh.model.mesh.field.add("Distance")
        gmsh.model.mesh.field.setNumbers(distance_field, "CurvesList", curves)
        gmsh.model.mesh.field.setNumber(distance_field, "Sampling", 100)
        threshold_field = gmsh.model.mesh.field.add("Threshold")
        gmsh.model.mesh.field.setNumber(threshold_field, "InField", distance_field)
        gmsh.model.mesh.field.setNumber(threshold_field, "SizeMin", max(float(control.get("targetSize", min_size)), min_size))
        gmsh.model.mesh.field.setNumber(threshold_field, "SizeMax", max_size)
        gmsh.model.mesh.field.setNumber(threshold_field, "DistMin", 0)
        gmsh.model.mesh.field.setNumber(threshold_field, "DistMax", max(float(control.get("influenceDistance", target * 3)), 1e-9))
        background_fields.append(threshold_field)

    if background_fields:
        if len(background_fields) == 1:
            gmsh.model.mesh.field.setAsBackgroundMesh(background_fields[0])
        else:
            minimum_field = gmsh.model.mesh.field.add("Min")
            gmsh.model.mesh.field.setNumbers(minimum_field, "FieldsList", background_fields)
            gmsh.model.mesh.field.setAsBackgroundMesh(minimum_field)

    for layer in request.get("layers", []):
        if not layer.get("enabled", True):
            continue
        boundary = next((item for item in boundaries if item["id"] == layer.get("boundarySetId")), None)
        if not boundary:
            continue
        curves = [tag for edge_id in boundary.get("edgeIds", []) for tag in edge_curves.get(edge_id, [])]
        if not curves:
            continue
        field = gmsh.model.mesh.field.add("BoundaryLayer")
        gmsh.model.mesh.field.setNumbers(field, "CurvesList", curves)
        gmsh.model.mesh.field.setNumber(field, "Size", max(float(layer.get("firstLayer", target / 20)), 1e-9))
        gmsh.model.mesh.field.setNumber(field, "Ratio", max(float(layer.get("growth", 1.2)), 1.0))
        gmsh.model.mesh.field.setNumber(field, "Thickness", max(float(layer.get("thickness", target)), 1e-9))
        gmsh.model.mesh.field.setNumber(field, "Quads", 1)
        gmsh.model.mesh.field.setAsBoundaryLayer(field)

    gmsh.option.setNumber("Mesh.MeshSizeMin", min_size)
    gmsh.option.setNumber("Mesh.MeshSizeMax", max_size)
    gmsh.option.setNumber("Mesh.MeshSizeFromCurvature", max(0, int(settings.get("curvatureSegments", 24))))
    gmsh.option.setNumber("Mesh.Smoothing", max(0, int(settings.get("smoothing", 5))))
    gmsh.model.mesh.generate(2)

    node_tags, coordinates, _ = gmsh.model.mesh.getNodes()
    tag_to_index = {int(tag): index for index, tag in enumerate(node_tags)}
    nodes = [{"id": index, "x": coordinates[index * 3], "y": coordinates[index * 3 + 1]} for index in range(len(node_tags))]
    cells = []
    cell_id = 0
    face_to_zone = {}
    for zone in zones:
        for face_id in zone.get("faceIds", []):
            face_to_zone[face_id] = zone["id"]

    for face_id, surface_tag in surface_tags.items():
        element_types, element_tags, element_nodes = gmsh.model.mesh.getElements(2, surface_tag)
        for element_type, tags, flat_nodes in zip(element_types, element_tags, element_nodes):
            _, _, _, count, _, _ = gmsh.model.mesh.getElementProperties(element_type)
            if count not in (3, 4):
                continue
            kind = "tri" if count == 3 else "quad"
            for index in range(len(tags)):
                ids = [tag_to_index[int(tag)] for tag in flat_nodes[index * count:(index + 1) * count]]
                signed_twice_area = sum(
                    nodes[ids[position]]["x"] * nodes[ids[(position + 1) % len(ids)]]["y"]
                    - nodes[ids[(position + 1) % len(ids)]]["x"] * nodes[ids[position]]["y"]
                    for position in range(len(ids))
                )
                if signed_twice_area < 0:
                    ids.reverse()
                cells.append({"id": cell_id, "type": kind, "nodeIds": ids, "zoneId": face_to_zone.get(face_id, "")})
                cell_id += 1

    boundary_elements = []
    boundary_id = 0
    for boundary in boundaries:
        seen = set()
        for edge_id in boundary.get("edgeIds", []):
            for curve_tag in edge_curves.get(edge_id, []):
                _, _, line_nodes = gmsh.model.mesh.getElements(1, curve_tag)
                for flat_nodes in line_nodes:
                    for index in range(0, len(flat_nodes), 2):
                        if index + 1 >= len(flat_nodes):
                            continue
                        pair = (tag_to_index[int(flat_nodes[index])], tag_to_index[int(flat_nodes[index + 1])])
                        key = tuple(sorted(pair))
                        if key not in seen:
                            seen.add(key)
                            boundary_elements.append({"id": boundary_id, "nodeIds": pair, "boundarySetId": boundary["id"]})
                            boundary_id += 1

    warnings = []
    if not cells:
        fail("网格内核没有生成二维单元")
    msh_path = None
    msh_content = ""
    try:
        gmsh.option.setNumber("Mesh.MshFileVersion", 4.1)
        gmsh.option.setNumber("Mesh.Binary", 0)
        with tempfile.NamedTemporaryFile(suffix=".msh", delete=False) as handle:
            msh_path = handle.name
        gmsh.write(msh_path)
        with open(msh_path, "r", encoding="utf-8") as handle:
            msh_content = handle.read()
    finally:
        if msh_path and os.path.exists(msh_path):
            os.remove(msh_path)
    result = {"ok": True, "nodes": nodes, "cells": cells, "boundaryElements": boundary_elements, "warnings": warnings, "engine": "gmsh", "engineVersion": gmsh.__version__, "msh": msh_content}
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    gmsh.finalize()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        try:
            gmsh.finalize()
        except Exception:
            pass
        print(json.dumps({"ok": False, "message": str(error), "trace": traceback.format_exc(limit=3)}, ensure_ascii=False))
        sys.exit(1)
