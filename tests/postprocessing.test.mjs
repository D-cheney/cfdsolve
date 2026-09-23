import assert from 'node:assert/strict'
import { encodeFieldCsv, finiteRange, fluidFields, readCavityField, solidFields } from '../utils/postprocessing.ts'

const result = { mode: 'fluid', engine: 'test', converged: true, durationMs: 1, warnings: [], fluid: {
  field: { nx: 2, ny: 2, u: [0, 1, .5, 0], v: [0, 0, .5, 0], speed: [0, 1, Math.SQRT1_2, 0] },
  x: [1, 10], series: [1e-2, 1e-5],
} }
const field = readCavityField(result, 3)
assert.equal(field.nx, 2)
assert.equal(field.u[1] * field.lidVelocity, 3, 'normalized velocity must become m/s')
assert.deepEqual(field.residuals.map(item => item.value), [1e-2, 1e-5])
assert.equal(readCavityField({ ...result, fluid: { field: { ...result.fluid.field, u: [1] } } }, 3), null)
assert.equal(fluidFields.some(item => item.key === 'pressure'), false, 'cavity solver has no pressure field')
assert.equal(solidFields.find(item => item.key === 'vonMises').unit, 'Pa')
assert.deepEqual(finiteRange([NaN, -2, 5]), { min: -2, max: 5 })
assert.equal(encodeFieldCsv('node_id', 'ux', 'm', [[7, 1e-6]]), '\uFEFFnode_id,ux,unit\n7,0.000001,m')
console.log('postprocessing tests passed')
