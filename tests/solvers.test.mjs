import assert from 'node:assert/strict'
import { SolverInputError, solveTool } from '../utils/solvers.ts'

const pipe = solveTool('pipe-flow', { diameter: .05, pipe_length: 2, rho: 998, viscosity: .001, drive_mode: 'mean_velocity', drive_value: .5, samples: 21 })
assert.equal(pipe.x.length, 21)
assert.ok(Math.abs(pipe.wallShear - 8 * .001 * .5 / .05) < 1e-12)
assert.ok(pipe.entranceLength > 0)

const turbulenceInput = { flow_type: 'internal', velocity: 35, char_length: .2, rho: 1.225, viscosity: .0000181, intensity: 5, length_scale: .014, target_yplus: 1, growth_rate: 1.2, layers: 20 }
const turbulence = solveTool('turbulence-compare', turbulenceInput)
const reynolds = turbulenceInput.rho * turbulenceInput.velocity * turbulenceInput.char_length / turbulenceInput.viscosity
const fanning = .0791 / reynolds ** .25
const expectedFirstLayerMicrons = turbulenceInput.target_yplus * turbulenceInput.viscosity / (turbulenceInput.rho * turbulenceInput.velocity * Math.sqrt(fanning / 2)) * 1e6
assert.ok(Math.abs(turbulence.series[0] - expectedFirstLayerMicrons) / expectedFirstLayerMicrons < 1e-12)

const cavity = solveTool('lid-driven-cavity', { reynolds: 100, nx: 33, ny: 65, lid_velocity: 1, max_iterations: 100, tolerance: 1e-8, pressure_relaxation: .3, velocity_relaxation: .7 })
assert.equal(cavity.summary.find(item => item.label === '实际网格')?.value, '33 × 65')
assert.equal(cavity.iterations, 100)
assert.equal(cavity.converged, false)
assert.equal(cavity.x.at(-1), cavity.iterations)
assert.equal(cavity.field.speed.length, cavity.field.nx * cavity.field.ny)
assert.ok(cavity.field.speed.every(Number.isFinite))
assert.ok(cavity.field.u.every(Number.isFinite))
assert.ok(cavity.field.v.every(Number.isFinite))

const scaledLid = solveTool('lid-driven-cavity', { reynolds: 100, nx: 33, ny: 65, lid_velocity: 10, max_iterations: 100, tolerance: 1e-8, pressure_relaxation: .3, velocity_relaxation: .7 })
assert.ok(Math.abs(scaledLid.series.at(-1) - cavity.series.at(-1)) < 1e-12)
assert.equal(scaledLid.summary.find(item => item.label === '主涡中心')?.value, cavity.summary.find(item => item.label === '主涡中心')?.value)

const defaultCavity = solveTool('lid-driven-cavity', { reynolds: 100, nx: 65, ny: 65, lid_velocity: 1, max_iterations: 5000, tolerance: 1e-5, pressure_relaxation: .3, velocity_relaxation: .7 })
assert.equal(defaultCavity.converged, true)

const convection = solveTool('convection-diffusion', { length: 1, nx: 101, rho: 1, velocity: 1, diffusivity: .1, phi_left: 1, phi_right: 0, scheme: 'upwind' })
assert.equal(convection.bounded, true)
assert.ok(convection.l2 >= 0)

assert.throws(() => solveTool('pipe-flow', { diameter: '', pipe_length: 2, rho: 998, viscosity: .001, drive_mode: 'mean_velocity', drive_value: .5, samples: 21 }), SolverInputError)

console.log('solver tests passed')
