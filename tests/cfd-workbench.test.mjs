import assert from 'node:assert/strict'
import { solveTool } from '../utils/solvers.ts'
import {
  buildCavitySolverInput,
  buildCfdCaseManifest,
  defaultCfdWorkbenchSetup,
  meshMetrics,
  reynoldsNumber,
  validateCfdWorkbench,
} from '../utils/cfd-workbench.ts'

const setup = defaultCfdWorkbenchSetup()
assert.equal(reynoldsNumber(setup), 100)
assert.deepEqual(meshMetrics(setup), {
  cells: 4096,
  nodes: 4225,
  dx: 0.0015625,
  dy: 0.0015625,
  aspectRatio: 1,
})

const input = buildCavitySolverInput(setup)
const result = solveTool('lid-driven-cavity', { ...input, max_iterations: 100 })
assert.equal(result.field.speed.length, result.field.nx * result.field.ny)
assert.ok(result.field.speed.every(Number.isFinite))

const manifest = buildCfdCaseManifest(setup, result)
assert.equal(manifest.model.physics, '二维稳态不可压缩层流')
assert.equal(manifest.boundaries.top.type, 'moving-wall')
assert.equal(manifest.mesh.cells, 4096)

assert.throws(() => validateCfdWorkbench({ ...setup, boundary: { ...setup.boundary, lidVelocity: 1 } }), /Re=10–1000/)
assert.throws(() => validateCfdWorkbench({ ...setup, mesh: { nx: 32, ny: 65 } }), /33–129/)

console.log('CFD workbench tests passed')
