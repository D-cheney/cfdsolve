import assert from 'node:assert/strict'
import { solveTool } from '../utils/solvers.ts'

const diffusion = solveTool('convection-diffusion', {
  length: 1, nx: 81, rho: 1, velocity: 0, diffusivity: .1,
  phi_left: 1, phi_right: 0, scheme: 'central'
})
assert.ok(diffusion.series.every((value, index) => Math.abs(value - (1 - index / 80)) < 1e-11))
assert.equal(diffusion.series[0], 1)
assert.equal(diffusion.series.at(-1), 0)

const pipe = solveTool('pipe-flow', {
  diameter: .05, pipe_length: 2, rho: 998, viscosity: .001,
  drive_mode: 'mean_velocity', drive_value: .5, samples: 81
})
const maximumFieldVelocity = Math.max(...pipe.fields.velocity)
assert.ok(Math.abs(maximumFieldVelocity - 1) < .002, `圆管中心速度应为 2Umean，实际 ${maximumFieldVelocity}`)
assert.ok(pipe.summary.some(item => item.label === 'Darcy 摩阻系数'))

const turbulent = solveTool('turbulence-compare', {
  flow_type: 'internal', velocity: 20, char_length: .3, rho: 1.225,
  viscosity: 1.81e-5, intensity: 5, length_scale: .02,
  target_yplus: 1, growth_rate: 1.2, layers: 18
})
assert.ok(turbulent.summary.every(item => !String(item.value).includes('NaN')))

assert.throws(() => solveTool('pipe-flow', {
  diameter: -.05, pipe_length: 2, rho: 998, viscosity: .001,
  drive_mode: 'mean_velocity', drive_value: .5, samples: 81
}), /管径/)
assert.throws(() => solveTool('unknown-tool', {}), /不支持/)

console.log('CFD solvers: discretization, pipe field, validation and finite outputs passed')
