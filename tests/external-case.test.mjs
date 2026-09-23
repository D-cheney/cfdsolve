import assert from 'node:assert/strict'
import { createPhysicsCase } from '../utils/physics-case.ts'
import { buildExternalCasePackage } from '../utils/external-case.ts'

function meshProject(role = 'fluid') {
  return {
    format: 'cfdrookie-mesh2d', schemaVersion: 1, id: 'external-mesh', documentId: 'test', sourceRevision: 1, updatedAt: new Date().toISOString(),
    edges: [], faces: [{ id: 'face', sourceRegionId: 'region', name: 'domain', outerEdgeIds: [], holeEdgeIds: [], area: 5000 }],
    boundarySets: [
      { id: 'left', name: '入口', exportName: 'inlet', semantic: 'inlet', color: '#167', edgeIds: [] },
      { id: 'right', name: '出口', exportName: 'outlet', semantic: 'outlet', color: '#e74', edgeIds: [] },
      { id: 'top', name: '上壁', exportName: 'top_wall', semantic: 'wall', color: '#497', edgeIds: [] },
      { id: 'bottom', name: '下壁', exportName: 'bottom_wall', semantic: 'wall', color: '#888', edgeIds: [] },
    ],
    cellZones: [{ id: 'zone', name: '域', exportName: 'domain', role, faceIds: ['face'] }],
    layers: [], sizeControls: [], settings: { method: 'tri', targetSize: 10, minSize: 1, maxSize: 20, curvatureSegments: 16, mappedNx: 2, mappedNy: 2, smoothing: 1 },
    result: {
      id: 'result', createdAt: new Date().toISOString(), geometryRevision: 1, settingsHash: 'hash', warnings: [], msh: '',
      nodes: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 100, y: 0 }, { id: 3, x: 100, y: 50 }, { id: 4, x: 0, y: 50 }],
      cells: [
        { id: 10, type: 'tri', nodeIds: [1, 2, 3], zoneId: 'zone', quality: .8, area: 2500 },
        { id: 20, type: 'tri', nodeIds: [1, 3, 4], zoneId: 'zone', quality: .8, area: 2500 },
      ],
      boundaryElements: [
        { id: 1, nodeIds: [4, 1], boundarySetId: 'left' }, { id: 2, nodeIds: [2, 3], boundarySetId: 'right' },
        { id: 3, nodeIds: [3, 4], boundarySetId: 'top' }, { id: 4, nodeIds: [1, 2], boundarySetId: 'bottom' },
      ],
      quality: { minQuality: .8, meanQuality: .8, minAngle: 30, maxAspectRatio: 3, invalidCells: 0, totalArea: 5000 },
    },
  }
}

const fluidMesh = meshProject('fluid')
const fluidCase = createPhysicsCase(fluidMesh)
fluidCase.mode = 'fluid'
fluidCase.boundaries.find(item => item.boundarySetId === 'left').type = 'velocity-inlet'
fluidCase.boundaries.find(item => item.boundarySetId === 'left').valueX = 2
fluidCase.boundaries.find(item => item.boundarySetId === 'right').type = 'pressure-outlet'
const foam = buildExternalCasePackage(fluidMesh, fluidCase)
assert.ok(foam.files['constant/polyMesh/points'].includes('\n8\n('))
assert.ok(foam.files['constant/polyMesh/faces'].includes('\n9\n('))
assert.ok(foam.files['constant/polyMesh/neighbour'].includes('\n1\n('))
assert.match(foam.files['constant/polyMesh/boundary'], /frontAndBack[\s\S]*type empty;/)
assert.match(foam.files['constant/polyMesh/boundary'], /top_wall[\s\S]*type wall;/)
assert.match(foam.files['0/U'], /inlet \{ type fixedValue; value uniform \(2 0 0\); \}/)
assert.ok(foam.commands.includes('checkMesh -case .'))
assert.equal(buildExternalCasePackage(fluidMesh, fluidCase).meshHash, foam.meshHash)

const solidMesh = meshProject('solid')
const solidCase = createPhysicsCase(solidMesh)
solidCase.mode = 'solid'
for (const bc of solidCase.boundaries) {
  bc.type = bc.boundarySetId === 'left' ? 'fixed' : bc.boundarySetId === 'right' ? 'traction' : 'free'
  if (bc.boundarySetId === 'right') bc.valueX = 1e5
}
const ccx = buildExternalCasePackage(solidMesh, solidCase)
assert.match(ccx.files['solid/solid.inp'], /\*ELEMENT,TYPE=CPS3,ELSET=SOLID_TRI/)
assert.match(ccx.files['solid/solid.inp'], /\*BOUNDARY\nBC_INLET,1,2,0/)
assert.match(ccx.files['solid/solid.inp'], /\*CLOAD[\s\S]*2,1,/)
assert.ok(ccx.warnings.some(message => message.includes('没有流体面域')))

solidCase.mode = 'fsi-two-way'
solidCase.boundaries.find(item => item.boundarySetId === 'top').type = 'fsi-interface'
const fsi = buildExternalCasePackage(solidMesh, solidCase)
assert.match(fsi.files['precice-config.xml'], /coupling-scheme:parallel-implicit/)
assert.match(fsi.files['precice-config.xml'], /acceleration:IQN-ILS/)
assert.match(fsi.files['fsi-interface.json'], /conservative/)

console.log('external case tests passed')
