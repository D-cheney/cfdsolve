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
assert.equal(input.aspect_ratio, 1)
const result = solveTool('lid-driven-cavity', { ...input, max_iterations: 100 })
assert.equal(result.field.speed.length, result.field.nx * result.field.ny)
assert.ok(result.field.speed.every(Number.isFinite))

const manifest = buildCfdCaseManifest(setup, result)
assert.equal(manifest.model.physics, '二维稳态不可压缩层流')
assert.equal(manifest.boundaries.top.type, 'moving-wall')
assert.equal(manifest.mesh.cells, 4096)

const rectangular = {
  ...setup,
  model: { ...setup.model, width: 0.15, height: 0.1 },
}
const rectangularMetrics = meshMetrics(rectangular)
assert.equal(rectangularMetrics.dx, 0.15 / 64)
assert.equal(rectangularMetrics.dy, 0.1 / 64)
assert.ok(Math.abs(buildCavitySolverInput(rectangular).aspect_ratio - 1.5) < 1e-12)
const rectangularResult = solveTool('lid-driven-cavity', { ...buildCavitySolverInput(rectangular), max_iterations: 100 })
assert.ok(Math.abs(rectangularResult.aspectRatio - 1.5) < 1e-12)
assert.ok(rectangularResult.field.speed.every(Number.isFinite))

assert.throws(() => validateCfdWorkbench({ ...setup, boundary: { ...setup.boundary, lidVelocity: 1 } }), /Re=10–1000/)
assert.throws(() => validateCfdWorkbench({ ...setup, mesh: { nx: 32, ny: 65 } }), /33–129/)

console.log('CFD workbench tests passed')
