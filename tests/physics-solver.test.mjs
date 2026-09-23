import assert from 'node:assert/strict'
import { createPhysicsCase, validatePhysicsCase } from '../utils/physics-case.ts'
import { solvePhysicsCase } from '../utils/physics-solver.ts'

function project() {
  return {
    format: 'cfdrookie-mesh2d', schemaVersion: 1, id: 'test-mesh', documentId: 'test', sourceRevision: 1, updatedAt: new Date().toISOString(),
    edges: [], faces: [{ id: 'face', sourceRegionId: 'region', name: 'solid', outerEdgeIds: [], holeEdgeIds: [], area: 10000 }],
    boundarySets: [
      { id: 'left', name: '固定端', exportName: 'fixed', semantic: 'wall', color: '#345', edgeIds: [] },
      { id: 'right', name: '载荷端', exportName: 'load', semantic: 'custom', color: '#678', edgeIds: [] },
      { id: 'top', name: '流固接口', exportName: 'fsi', semantic: 'interface', color: '#09c', edgeIds: [] },
      { id: 'bottom', name: '底边', exportName: 'bottom', semantic: 'wall', color: '#999', edgeIds: [] },
    ],
    cellZones: [{ id: 'solid-zone', name: '固体', exportName: 'solid', role: 'solid', faceIds: ['face'] }],
    layers: [], sizeControls: [], settings: { method: 'tri', targetSize: 10, minSize: 1, maxSize: 20, curvatureSegments: 16, mappedNx: 2, mappedNy: 2, smoothing: 1 },
    result: {
      id: 'mesh-result', createdAt: new Date().toISOString(), geometryRevision: 1, settingsHash: 'test', warnings: [],
      nodes: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 100, y: 0 }, { id: 3, x: 100, y: 20 }, { id: 4, x: 0, y: 20 }],
      cells: [
        { id: 1, type: 'tri', nodeIds: [1, 2, 3], zoneId: 'solid-zone', quality: .8, area: 1000 },
        { id: 2, type: 'tri', nodeIds: [1, 3, 4], zoneId: 'solid-zone', quality: .8, area: 1000 },
      ],
      boundaryElements: [
        { id: 1, nodeIds: [4, 1], boundarySetId: 'left' }, { id: 2, nodeIds: [2, 3], boundarySetId: 'right' },
        { id: 3, nodeIds: [3, 4], boundarySetId: 'top' }, { id: 4, nodeIds: [1, 2], boundarySetId: 'bottom' },
      ],
      quality: { minQuality: .8, meanQuality: .8, minAngle: 30, maxAspectRatio: 3, invalidCells: 0, totalArea: 2000 },
    },
  }
}

const mesh = project()
const structural = createPhysicsCase(mesh)
structural.mode = 'solid'
structural.lengthScale = .001
structural.solid = { youngModulus: 2e9, poissonRatio: .3, density: 1000, thickness: .01, formulation: 'plane-stress' }
for (const bc of structural.boundaries) {
  bc.type = bc.boundarySetId === 'left' ? 'fixed' : bc.boundarySetId === 'right' ? 'traction' : 'free'
  if (bc.boundarySetId === 'right') bc.valueY = -1e5
}
assert.equal(validatePhysicsCase(mesh, structural).filter(item => item.level === 'error').length, 0)
const unsupportedFluid = createPhysicsCase(mesh)
unsupportedFluid.mode = 'fluid'
assert.ok(validatePhysicsCase(mesh, unsupportedFluid).some(item => item.code === 'NATIVE_FLUID_MESH' && item.level === 'error'))
const solidResult = solvePhysicsCase(mesh, structural)
assert.equal(solidResult.engine, 'native-linear-triangle-fem')
assert.equal(solidResult.converged, true)
assert.ok(solidResult.solid.maxDisplacement > 0)
assert.ok(solidResult.solid.maxVonMises > 0)
assert.equal(solidResult.solid.nodes.find(node => node.nodeId === 1).magnitude, 0)
assert.ok(solidResult.solid.nodes.find(node => node.nodeId === 3).uy < 0)
assert.ok(Math.abs(solidResult.solid.reactions.reduce((sum, item) => sum + item.ry, 0) - 20) < 1e-5)

const coupled = structuredClone(structural)
coupled.mode = 'fsi-two-way'
coupled.fsi = { referenceGap: .02, inletPressure: 1000, outletPressure: 0, deformationSign: -1, maxCouplingIterations: 120, couplingTolerance: 1e-10, relaxation: .4 }
for (const bc of coupled.boundaries) {
  bc.type = bc.boundarySetId === 'left' ? 'fixed' : bc.boundarySetId === 'top' ? 'fsi-interface' : 'free'
  bc.valueX = bc.valueY = bc.pressure = 0
}
assert.equal(validatePhysicsCase(mesh, coupled).filter(item => item.level === 'error').length, 0)
const fsiResult = solvePhysicsCase(mesh, coupled)
assert.equal(fsiResult.engine, 'native-implicit-thin-channel-fsi')
assert.ok(fsiResult.fsi.iterations >= 2)
assert.ok(fsiResult.fsi.flowRatePerDepth > 0)
assert.ok(fsiResult.fsi.minimumGap > 0)
assert.ok(fsiResult.fsi.pressureProfile[0].pressure > fsiResult.fsi.pressureProfile.at(-1).pressure)

const oneWay = structuredClone(coupled)
oneWay.mode = 'fsi-one-way'
const oneWayResult = solvePhysicsCase(mesh, oneWay)
assert.equal(oneWayResult.fsi.iterations, 1)
assert.equal(oneWayResult.engine, 'native-one-way-thin-channel-fsi')

const invalid = structuredClone(coupled)
invalid.boundaries.find(item => item.type === 'fsi-interface').type = 'free'
assert.ok(validatePhysicsCase(mesh, invalid).some(item => item.code === 'FSI_INTERFACE' && item.level === 'error'))

console.log('physics solver tests passed')
