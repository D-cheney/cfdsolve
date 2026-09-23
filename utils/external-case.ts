import { createHash } from 'node:crypto'
import type { MeshBoundaryElement, MeshCell, MeshProject } from '~/types/meshing'
import type { ExternalCasePackage, PhysicsBoundaryCondition, PhysicsCase } from '~/types/physics'

type Point3 = [number, number, number]
type FaceRecord = { nodes: number[]; owner: number; neighbour?: number; patch?: string }

const foamHeader = (object: string, className: string) => `FoamFile
{
    format ascii;
    class ${className};
    object ${object};
}
`

function foamList<T>(header: string, items: T[], render: (item: T) => string) {
  return `${header}\n${items.length}\n(\n${items.map(item => render(item)).join('\n')}\n)\n`
}

function edgeKey(a: number, b: number) { return a < b ? `${a}:${b}` : `${b}:${a}` }

function orientedNodeIds(cell: MeshCell, nodes: Map<number, { x: number; y: number }>) {
  const ids = [...cell.nodeIds]
  const signed = ids.reduce((sum, id, index) => {
    const a = nodes.get(id)!, b = nodes.get(ids[(index + 1) % ids.length]!)!
    return sum + a.x * b.y - b.x * a.y
  }, 0)
  return signed >= 0 ? ids : ids.reverse()
}

function foamBoundaryField(type: PhysicsBoundaryCondition['type'], value: PhysicsBoundaryCondition, field: 'U' | 'p', density: number) {
  if (field === 'U') {
    if (type === 'velocity-inlet' || type === 'moving-wall') return `{ type fixedValue; value uniform (${value.valueX} ${value.valueY} 0); }`
    if (type === 'wall') return '{ type noSlip; }'
    if (type === 'symmetry') return '{ type symmetryPlane; }'
    return '{ type zeroGradient; }'
  }
  if (type === 'pressure-inlet' || type === 'pressure-outlet') return `{ type fixedValue; value uniform ${value.pressure / density}; }`
  if (type === 'symmetry') return '{ type symmetryPlane; }'
  return '{ type zeroGradient; }'
}

function buildOpenFoam(project: MeshProject, value: PhysicsCase) {
  const mesh = project.result!
  const fluidZones = new Set(project.cellZones.filter(zone => zone.role === 'fluid').map(zone => zone.id))
  const cells = mesh.cells.filter(cell => fluidZones.has(cell.zoneId))
  if (!cells.length) return { files: {} as Record<string, string>, warnings: ['未生成 OpenFOAM 输入：没有流体面域。'] }
  const sourceNodes = new Map(mesh.nodes.map(node => [node.id, node]))
  const usedIds = [...new Set(cells.flatMap(cell => cell.nodeIds))].sort((a, b) => a - b)
  const localNode = new Map(usedIds.map((id, index) => [id, index]))
  const depth = Math.max(value.solid.thickness, .001)
  const points: Point3[] = []
  for (const z of [-depth / 2, depth / 2]) for (const id of usedIds) {
    const point = sourceNodes.get(id)!
    points.push([point.x * value.lengthScale, point.y * value.lengthScale, z])
  }
  const n = usedIds.length
  const namedElement = new Map(mesh.boundaryElements.map(element => [edgeKey(...element.nodeIds), element]))
  const setById = new Map(project.boundarySets.map(set => [set.id, set]))
  const faceUse = new Map<string, FaceRecord>()
  const frontBack: FaceRecord[] = []
  cells.forEach((cell, cellIndex) => {
    const ids = orientedNodeIds(cell, sourceNodes), bottom = ids.map(id => localNode.get(id)!).reverse(), top = ids.map(id => localNode.get(id)! + n)
    frontBack.push({ nodes: bottom, owner: cellIndex, patch: 'frontAndBack' }, { nodes: top, owner: cellIndex, patch: 'frontAndBack' })
    ids.forEach((id, index) => {
      const next = ids[(index + 1) % ids.length]!, key = edgeKey(id, next), a = localNode.get(id)!, b = localNode.get(next)!
      const existing = faceUse.get(key)
      if (existing) existing.neighbour = cellIndex
      else {
        const boundaryElement = namedElement.get(key), set = boundaryElement ? setById.get(boundaryElement.boundarySetId) : undefined
        faceUse.set(key, { nodes: [a, b, b + n, a + n], owner: cellIndex, patch: set?.exportName || 'defaultWalls' })
      }
    })
  })
  const internal = [...faceUse.values()].filter(face => face.neighbour !== undefined)
  const boundarySides = [...faceUse.values()].filter(face => face.neighbour === undefined)
  const patchOrder = [...new Set([...boundarySides.map(face => face.patch!), 'frontAndBack'])]
  const boundaryByPatch = new Map(patchOrder.map(name => [name, [] as FaceRecord[]]))
  for (const face of boundarySides) boundaryByPatch.get(face.patch!)!.push(face)
  boundaryByPatch.get('frontAndBack')!.push(...frontBack)
  const ordered = [...internal, ...patchOrder.flatMap(name => boundaryByPatch.get(name)!)]
  const files: Record<string, string> = {}
  files['constant/polyMesh/points'] = foamList(foamHeader('points', 'vectorField'), points, point => `(${point.join(' ')})`)
  files['constant/polyMesh/faces'] = foamList(foamHeader('faces', 'faceList'), ordered, face => `${face.nodes.length}(${face.nodes.join(' ')})`)
  files['constant/polyMesh/owner'] = foamList(foamHeader('owner', 'labelList'), ordered, face => `${face.owner}`)
  files['constant/polyMesh/neighbour'] = foamList(foamHeader('neighbour', 'labelList'), internal, face => `${face.neighbour}`)
  let startFace = internal.length
  const boundaryBlocks = patchOrder.map(name => {
    const count = boundaryByPatch.get(name)!.length, set = project.boundarySets.find(item => item.exportName === name)
    const type = name === 'frontAndBack' ? 'empty' : set?.semantic === 'symmetry' ? 'symmetryPlane' : set?.semantic === 'wall' ? 'wall' : 'patch'
    const block = `    ${name}\n    {\n        type ${type};\n        nFaces ${count};\n        startFace ${startFace};\n    }`
    startFace += count
    return block
  })
  files['constant/polyMesh/boundary'] = `${foamHeader('boundary', 'polyBoundaryMesh')}\n${patchOrder.length}\n(\n${boundaryBlocks.join('\n')}\n)\n`
  const conditionBySet = new Map(value.boundaries.map(item => [item.boundarySetId, item]))
  const fieldPatches = (field: 'U' | 'p') => patchOrder.map(name => {
    if (name === 'frontAndBack') return `    ${name} { type empty; }`
    const set = project.boundarySets.find(item => item.exportName === name), bc = set ? conditionBySet.get(set.id) : undefined
    return `    ${name} ${foamBoundaryField(bc?.type ?? 'wall', bc ?? { boundarySetId: '', type: 'wall', valueX: 0, valueY: 0, pressure: 0 }, field, value.fluid.density)}`
  }).join('\n')
  files['0/U'] = `${foamHeader('U', 'volVectorField')}dimensions [0 1 -1 0 0 0 0];\ninternalField uniform (0 0 0);\nboundaryField\n{\n${fieldPatches('U')}\n}\n`
  files['0/p'] = `${foamHeader('p', 'volScalarField')}dimensions [0 2 -2 0 0 0 0];\ninternalField uniform 0;\nboundaryField\n{\n${fieldPatches('p')}\n}\n`
  files['constant/physicalProperties'] = `${foamHeader('physicalProperties', 'dictionary')}viscosityModel constant;\nnu [0 2 -1 0 0 0 0] ${value.fluid.dynamicViscosity / value.fluid.density};\n`
  files['constant/momentumTransport'] = `${foamHeader('momentumTransport', 'dictionary')}simulationType laminar;\n`
  files['system/controlDict'] = `${foamHeader('controlDict', 'dictionary')}application simpleFoam;\nstartFrom startTime;\nstartTime 0;\nstopAt endTime;\nendTime ${value.solver.maxIterations};\ndeltaT 1;\nwriteControl timeStep;\nwriteInterval 100;\nrunTimeModifiable true;\n`
  files['system/fvSchemes'] = `${foamHeader('fvSchemes', 'dictionary')}ddtSchemes { default steadyState; }\ngradSchemes { default Gauss linear; }\ndivSchemes { default none; div(phi,U) bounded Gauss linearUpwind grad(U); }\nlaplacianSchemes { default Gauss linear corrected; }\ninterpolationSchemes { default linear; }\nsnGradSchemes { default corrected; }\n`
  files['system/fvSolution'] = `${foamHeader('fvSolution', 'dictionary')}solvers\n{\n p { solver GAMG; tolerance ${value.solver.tolerance}; relTol 0.1; }\n U { solver smoothSolver; smoother symGaussSeidel; tolerance ${value.solver.tolerance}; relTol 0.1; }\n}\nSIMPLE { nNonOrthogonalCorrectors 1; consistent yes; pRefCell 0; pRefValue 0; }\nrelaxationFactors { fields { p 0.3; } equations { U 0.7; } }\n`
  return { files, warnings: [] as string[] }
}

function outwardNormal(project: MeshProject, element: MeshBoundaryElement, cells: MeshCell[], lengthScale: number) {
  const nodes = new Map(project.result!.nodes.map(node => [node.id, node])), a = nodes.get(element.nodeIds[0])!, b = nodes.get(element.nodeIds[1])!
  const dx = (b.x - a.x) * lengthScale, dy = (b.y - a.y) * lengthScale, length = Math.hypot(dx, dy)
  let nx = dy / length, ny = -dx / length
  const cell = cells.find(item => item.nodeIds.includes(a.id) && item.nodeIds.includes(b.id))
  if (cell) {
    const centroid = cell.nodeIds.reduce((acc, id) => { const p = nodes.get(id)!; acc.x += p.x; acc.y += p.y; return acc }, { x: 0, y: 0 })
    centroid.x /= cell.nodeIds.length; centroid.y /= cell.nodeIds.length
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    if ((mx - centroid.x) * nx + (my - centroid.y) * ny < 0) { nx *= -1; ny *= -1 }
  }
  return { nx, ny, length }
}

function buildCalculix(project: MeshProject, value: PhysicsCase) {
  const mesh = project.result!, solidZoneIds = new Set(project.cellZones.filter(zone => zone.role === 'solid').map(zone => zone.id))
  const cells = mesh.cells.filter(cell => solidZoneIds.has(cell.zoneId))
  if (!cells.length) return { files: {} as Record<string, string>, warnings: ['未生成 CalculiX 输入：没有固体面域。'] }
  const used = new Set(cells.flatMap(cell => cell.nodeIds)), nodes = mesh.nodes.filter(node => used.has(node.id))
  const formulation = value.solid.formulation === 'plane-stress'
  const triType = formulation ? 'CPS3' : 'CPE3', quadType = formulation ? 'CPS4' : 'CPE4'
  const tri = cells.filter(cell => cell.type === 'tri'), quad = cells.filter(cell => cell.type === 'quad')
  const lines = ['*HEADING', value.name, '*NODE', ...nodes.map(node => `${node.id},${node.x * value.lengthScale},${node.y * value.lengthScale},0`)]
  if (tri.length) lines.push(`*ELEMENT,TYPE=${triType},ELSET=SOLID_TRI`, ...tri.map(cell => `${cell.id},${cell.nodeIds.join(',')}`))
  if (quad.length) lines.push(`*ELEMENT,TYPE=${quadType},ELSET=SOLID_QUAD`, ...quad.map(cell => `${cell.id},${cell.nodeIds.join(',')}`))
  lines.push('*MATERIAL,NAME=SOLID_MATERIAL', '*ELASTIC', `${value.solid.youngModulus},${value.solid.poissonRatio}`, '*DENSITY', `${value.solid.density}`)
  if (tri.length) lines.push('*SOLID SECTION,ELSET=SOLID_TRI,MATERIAL=SOLID_MATERIAL', `${value.solid.thickness}`)
  if (quad.length) lines.push('*SOLID SECTION,ELSET=SOLID_QUAD,MATERIAL=SOLID_MATERIAL', `${value.solid.thickness}`)
  const conditions = new Map(value.boundaries.map(item => [item.boundarySetId, item])), forces = new Map<number, [number, number]>()
  for (const set of project.boundarySets) {
    const condition = conditions.get(set.id), elements = mesh.boundaryElements.filter(element => element.boundarySetId === set.id && element.nodeIds.every(id => used.has(id)))
    const setNodes = [...new Set(elements.flatMap(element => element.nodeIds))]
    if (!setNodes.length || !condition) continue
    const nset = `BC_${set.exportName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`
    lines.push(`*NSET,NSET=${nset}`, setNodes.join(','))
    if (condition.type === 'fixed') lines.push('*BOUNDARY', `${nset},1,2,0`)
    if (condition.type === 'roller-x') lines.push('*BOUNDARY', `${nset},1,1,0`)
    if (condition.type === 'roller-y') lines.push('*BOUNDARY', `${nset},2,2,0`)
    if (condition.type === 'traction' || condition.type === 'pressure-load') for (const element of elements) {
      const { nx, ny, length } = outwardNormal(project, element, cells, value.lengthScale)
      const tx = condition.type === 'traction' ? condition.valueX : -condition.pressure * nx
      const ty = condition.type === 'traction' ? condition.valueY : -condition.pressure * ny
      for (const id of element.nodeIds) {
        const force = forces.get(id) ?? [0, 0]
        force[0] += tx * length * value.solid.thickness / 2; force[1] += ty * length * value.solid.thickness / 2
        forces.set(id, force)
      }
    }
  }
  lines.push('*STEP', '*STATIC', '*CLOAD')
  for (const [id, force] of forces) { if (force[0]) lines.push(`${id},1,${force[0]}`); if (force[1]) lines.push(`${id},2,${force[1]}`) }
  lines.push('*NODE FILE', 'U,RF', '*EL FILE', 'S,E', '*END STEP')
  return { files: { 'solid/solid.inp': `${lines.join('\n')}\n` }, warnings: [] as string[] }
}

function preCiceFiles(project: MeshProject, value: PhysicsCase) {
  if (!value.mode.startsWith('fsi')) return {} as Record<string, string>
  const interfaces = project.boundarySets.filter(set => value.boundaries.find(item => item.boundarySetId === set.id)?.type === 'fsi-interface')
  const names = interfaces.map(set => set.exportName)
  const scheme = value.mode === 'fsi-two-way' ? 'parallel-implicit' : 'serial-explicit'
  return {
    'precice-config.xml': `<precice-configuration>\n  <data:vector name="Displacement" />\n  <data:vector name="Force" />\n  <mesh name="Fluid-Mesh"><use-data name="Displacement"/><use-data name="Force"/></mesh>\n  <mesh name="Solid-Mesh"><use-data name="Displacement"/><use-data name="Force"/></mesh>\n  <participant name="Fluid"><provide-mesh name="Fluid-Mesh"/><write-data name="Force" mesh="Fluid-Mesh"/><read-data name="Displacement" mesh="Fluid-Mesh"/></participant>\n  <participant name="Solid"><provide-mesh name="Solid-Mesh"/><write-data name="Displacement" mesh="Solid-Mesh"/><read-data name="Force" mesh="Solid-Mesh"/></participant>\n  <coupling-scheme:${scheme}>\n    <participants first="Fluid" second="Solid"/>\n    <time-window-size value="0.01"/>\n    <max-time value="1"/>\n    ${value.mode === 'fsi-two-way' ? `<max-iterations value="${value.fsi.maxCouplingIterations}"/>\n    <relative-convergence-measure limit="${value.fsi.couplingTolerance}" data="Displacement" mesh="Solid-Mesh"/>\n    <acceleration:IQN-ILS><data name="Displacement" mesh="Solid-Mesh"/></acceleration:IQN-ILS>` : ''}\n    <exchange data="Force" mesh="Fluid-Mesh" from="Fluid" to="Solid"/>\n    <exchange data="Displacement" mesh="Solid-Mesh" from="Solid" to="Fluid"/>\n  </coupling-scheme:${scheme}>\n</precice-configuration>\n`,
    'fsi-interface.json': JSON.stringify({ boundarySets: names, forceMapping: 'conservative', displacementMapping: 'consistent', note: '适配器安装后必须用 preCICE 配置检查器验证 XML 与参与者网格名。' }, null, 2),
  }
}

export function buildExternalCasePackage(project: MeshProject, value: PhysicsCase): ExternalCasePackage {
  if (!project.result) throw new Error('缺少网格，无法生成外部求解算例。')
  const foam = buildOpenFoam(project, value), calculix = buildCalculix(project, value)
  const files = { ...foam.files, ...calculix.files, ...preCiceFiles(project, value) }
  files['case.json'] = JSON.stringify({ case: value, meshProjectId: project.id, meshResultId: project.result.id }, null, 2)
  files['README.txt'] = `CFD菜鸟外部求解包\n模式: ${value.mode}\n文件均由已接受网格与命名边界生成。运行前请先使用 checkMesh、ccx 输入检查和 precice-tools check 检查。\n`
  const hash = createHash('sha256').update(JSON.stringify({ nodes: project.result.nodes, cells: project.result.cells, boundaries: project.result.boundaryElements })).digest('hex')
  const commands = []
  if (Object.keys(foam.files).length) commands.push('checkMesh -case .', 'simpleFoam -case .')
  if (Object.keys(calculix.files).length) commands.push('cd solid && ccx solid')
  if (value.mode.startsWith('fsi')) commands.push('precice-tools check precice-config.xml')
  return { format: 'cfdrookie-external-case', schemaVersion: 1, mode: value.mode, generatedAt: new Date().toISOString(), meshHash: hash, files, commands, warnings: [...foam.warnings, ...calculix.warnings] }
}
