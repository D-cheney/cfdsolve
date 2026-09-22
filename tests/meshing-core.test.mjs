import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createMeshProject, meshProjectDiagnostics } from '../utils/meshing/geometry-bridge.ts'
import { assessMesh } from '../utils/meshing/quality.ts'
import { checkLegacyCavityCompatibility } from '../utils/meshing/legacy-cavity.ts'

const rectangle = {
  id: 'rect-1', kind: 'rectangle', name: '计算域', layerId: 'layer-default',
  points: [{ x: 0, y: 0 }, { x: 100, y: 50 }], closed: true,
  construction: false, locked: false, visible: true,
}
const now = new Date().toISOString()
const document = {
  format: 'cfdrookie-model2d', schemaVersion: 1, id: 'mesh-test', name: '网格测试', revision: 1,
  createdAt: now, updatedAt: now, internalLengthUnit: 'mm', displayLengthUnit: 'mm',
  entities: [rectangle], constraints: [], parameters: [], layers: [], groups: [],
  regions: [{ id: 'region-1', name: '流体域', outerEntityIds: ['rect-1'], holeEntityIds: [], valid: true, area: 5000, perimeter: 300 }],
  preferences: { gridVisible: true, gridSize: 10, snapGrid: true, snapObjects: true, snapAngle: true, autoConstraint: true, angleIncrement: 15 },
  view: { center: { x: 50, y: 25 }, pixelsPerMm: 5 },
}

const project = createMeshProject(document)
assert.equal(project.edges.length, 4)
assert.equal(project.faces.length, 1)
assert.equal(project.boundarySets.length, 4)
assert.equal(project.cellZones.length, 1)
assert.deepEqual(meshProjectDiagnostics(project), [])

// Give the exported mesh stable CFD names and run the same Python kernel used by the API.
project.boundarySets = [{ id: 'wall', name: '壁面', exportName: 'wall', semantic: 'wall', color: '#1677b8', edgeIds: project.edges.map(edge => edge.id) }]
project.cellZones[0].exportName = 'fluid'
const request = {
  edges: project.edges, faces: project.faces, boundarySets: project.boundarySets,
  cellZones: project.cellZones, layers: [], settings: { ...project.settings, method: 'mapped-quad', mappedNx: 20, mappedNy: 10 },
}
const configuredPython = process.env.CFDSOLVE_PYTHON_BIN?.trim()
const python = configuredPython || (process.platform === 'win32' ? 'py' : 'python3')
const args = !configuredPython && process.platform === 'win32' ? ['-3', 'services/meshing/generate_mesh.py'] : ['services/meshing/generate_mesh.py']
const stdout = execFileSync(python, args, { input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
const raw = JSON.parse(stdout)
assert.equal(raw.ok, true)
assert.equal(raw.cells.length, 200)
assert.ok(raw.cells.every(cell => cell.type === 'quad'))
assert.match(raw.msh, /wall/)
assert.match(raw.msh, /fluid/)

const assessed = assessMesh(raw.nodes, raw.cells)
assert.equal(assessed.quality.invalidCells, 0)
assert.ok(Math.abs(assessed.quality.totalArea - 5000) < 1e-6)
assert.ok(assessed.quality.minQuality > 0.99)

const hole = {
  id: 'circle-1', kind: 'circle', name: '圆孔', layerId: 'layer-default', center: { x: 50, y: 25 }, radius: 10,
  points: [], closed: true, construction: false, locked: false, visible: true,
}
const holeDocument = {
  ...document,
  id: 'mesh-hole-test',
  entities: [rectangle, hole],
  regions: [{ id: 'region-hole', name: '带孔流体域', outerEntityIds: ['rect-1'], holeEntityIds: [['circle-1']], valid: true, area: 5000 - Math.PI * 100, perimeter: 300 + Math.PI * 20 }],
}
const holeProject = createMeshProject(holeDocument)
const holeRequest = {
  edges: holeProject.edges, faces: holeProject.faces, boundarySets: holeProject.boundarySets,
  cellZones: holeProject.cellZones, layers: [], settings: { ...holeProject.settings, method: 'tri' },
}
const holeRaw = JSON.parse(execFileSync(python, args, { input: JSON.stringify(holeRequest), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }))
const holeAssessed = assessMesh(holeRaw.nodes, holeRaw.cells)
assert.equal(holeAssessed.quality.invalidCells, 0)
assert.ok(Math.abs(holeAssessed.quality.totalArea - holeDocument.regions[0].area) / holeDocument.regions[0].area < 0.003)
assert.ok(holeRaw.boundaryElements.length > 0)

const layeredBoundaries = [
  { id: 'bottom-wall', name: '底部壁面', exportName: 'bottom_wall', semantic: 'wall', color: '#1677b8', edgeIds: [project.edges[0].id] },
  { id: 'other-wall', name: '其余壁面', exportName: 'other_wall', semantic: 'wall', color: '#e67e3f', edgeIds: project.edges.slice(1).map(edge => edge.id) },
]
const firstLayer = 0.2, layerCount = 5, growth = 1.2
const layerRequest = {
  ...request,
  boundarySets: layeredBoundaries,
  settings: { ...request.settings, method: 'tri' },
  layers: [{ id: 'layer-1', boundarySetId: 'bottom-wall', firstLayer, layers: layerCount, growth, thickness: firstLayer * (growth ** layerCount - 1) / (growth - 1), enabled: true }],
}
const layerRaw = JSON.parse(execFileSync(python, args, { input: JSON.stringify(layerRequest), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }))
const layerAssessed = assessMesh(layerRaw.nodes, layerRaw.cells)
assert.equal(layerAssessed.quality.invalidCells, 0)
assert.ok(layerRaw.cells.length > 0)
assert.match(layerRaw.msh, /bottom_wall/)

const coarseRequest = { ...request, settings: { ...request.settings, method: 'tri' }, sizeControls: [] }
const refinedRequest = { ...coarseRequest, sizeControls: [{ id: 'refine-bottom', name: '底边加密', edgeIds: [project.edges[0].id], targetSize: 1, influenceDistance: 12, enabled: true }] }
const coarseRaw = JSON.parse(execFileSync(python, args, { input: JSON.stringify(coarseRequest), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }))
const refinedRaw = JSON.parse(execFileSync(python, args, { input: JSON.stringify(refinedRequest), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }))
assert.ok(refinedRaw.cells.length > coarseRaw.cells.length * 1.2)

const rightRectangle = { ...rectangle, id: 'rect-2', name: '右域', points: [{ x: 100, y: 0 }, { x: 200, y: 50 }] }
const sharedDocument = {
  ...document,
  id: 'mesh-shared-test',
  entities: [rectangle, rightRectangle],
  regions: [
    { id: 'region-left', name: '左流体域', outerEntityIds: ['rect-1'], holeEntityIds: [], valid: true, area: 5000, perimeter: 300 },
    { id: 'region-right', name: '右流体域', outerEntityIds: ['rect-2'], holeEntityIds: [], valid: true, area: 5000, perimeter: 300 },
  ],
}
const sharedProject = createMeshProject(sharedDocument)
assert.equal(sharedProject.edges.length, 7)
assert.equal(sharedProject.edges.filter(edge => edge.faceIds.length === 2).length, 1)
assert.equal(sharedProject.boundarySets.find(set => set.semantic === 'interface')?.edgeIds.length, 1)
assert.deepEqual(meshProjectDiagnostics(sharedProject), [])

const overlappingDocument = {
  ...holeDocument,
  id: 'mesh-overlap-test',
  regions: [
    { id: 'region-outer', name: '外部矩形', outerEntityIds: ['rect-1'], holeEntityIds: [], valid: true, area: 5000, perimeter: 300 },
    { id: 'region-inner', name: '内部圆域', outerEntityIds: ['circle-1'], holeEntityIds: [], valid: true, area: Math.PI * 100, perimeter: Math.PI * 20 },
  ],
}
const overlapIssues = meshProjectDiagnostics(createMeshProject(overlappingDocument))
assert.ok(overlapIssues.some(issue => issue.includes('发生重叠')))

const compatibleProject = {
  ...project,
  settings: { ...project.settings, method: 'mapped-quad', mappedNx: 32, mappedNy: 32 },
  result: { id: 'compatible', createdAt: now, geometryRevision: 1, settingsHash: 'test', nodes: [], boundaryElements: [], warnings: [], quality: assessed.quality, cells: Array.from({ length: 1024 }, (_, id) => ({ id, type: 'quad', nodeIds: [], zoneId: project.cellZones[0].id, quality: 1, area: 5000 / 1024 })) },
}
assert.deepEqual(checkLegacyCavityCompatibility(compatibleProject), { ok: true, reason: '', widthMm: 100, heightMm: 50, nx: 33, ny: 33 })
assert.equal(checkLegacyCavityCompatibility({ ...compatibleProject, faces: holeProject.faces }).ok, false)

console.log('meshing core tests passed')
