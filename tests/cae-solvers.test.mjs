import assert from 'node:assert/strict'
import {
  solveBarStatic,
  solveCantileverBeam,
  solveSteadyHeat2D,
  solveModal,
  solveSdofModal,
  solveCae
} from '../utils/caeSolvers.ts'

function close(actual, expected, relativeTolerance = 1e-10, absoluteTolerance = 1e-12) {
  const error = Math.abs(actual - expected)
  assert.ok(error <= Math.max(absoluteTolerance, Math.abs(expected) * relativeTolerance), `${actual} != ${expected}; error=${error}`)
}

// 1D 杆：线性单元应精确复现端载作用下的常应变解，并满足整体平衡。
const bar = solveBarStatic({
  length: 2,
  area: 0.01,
  elasticModulus: 200e9,
  elements: 4,
  endLoad: 10_000
})
assert.equal(bar.ok, true)
assert.ok(bar.data)
close(bar.data.tipDisplacement, 10_000 * 2 / (200e9 * 0.01))
close(bar.data.reactions[0], -10_000)
for (const element of bar.data.elements) close(element.stress, 10_000 / 0.01)
assert.equal(bar.checks.every(check => check.status === 'pass'), true)

// 一致节点载荷下，均布轴向载荷的节点位移也应与解析解一致。
const distributedBar = solveBarStatic({
  length: 3,
  area: 0.02,
  elasticModulus: 70e9,
  elements: 6,
  endLoad: 2_500,
  distributedLoad: 800
})
assert.equal(distributedBar.ok, true)
assert.ok(distributedBar.data)
distributedBar.data.displacement.forEach((value, index) => close(value, distributedBar.data.analyticalDisplacement[index], 2e-10))
close(distributedBar.data.reactions[0], -(2_500 + 800 * 3))

const invalidBar = solveBarStatic({ length: 1, area: 1, elasticModulus: 0, elements: 2, endLoad: 1 })
assert.equal(invalidBar.ok, false)
assert.equal(invalidBar.data, null)
assert.ok(invalidBar.validation.issues.some(issue => issue.field === 'elasticModulus'))

// Euler–Bernoulli 悬臂梁：集中力和均布载荷都使用真实 4x4 梁单元组装。
const beamInput = {
  length: 2,
  elasticModulus: 210e9,
  secondMoment: 8e-6,
  elements: 6,
  tipLoad: 1_000,
  uniformLoad: 250,
  tipMoment: 80
}
const beam = solveCantileverBeam(beamInput)
assert.equal(beam.ok, true)
assert.ok(beam.data)
const expectedBeamTip = (
  beamInput.tipLoad * beamInput.length ** 3 / 3
  + beamInput.uniformLoad * beamInput.length ** 4 / 8
  + beamInput.tipMoment * beamInput.length ** 2 / 2
) / (beamInput.elasticModulus * beamInput.secondMoment)
const expectedBeamRotation = (
  beamInput.tipLoad * beamInput.length ** 2 / 2
  + beamInput.uniformLoad * beamInput.length ** 3 / 6
  + beamInput.tipMoment * beamInput.length
) / (beamInput.elasticModulus * beamInput.secondMoment)
close(beam.data.tipDeflection, expectedBeamTip, 2e-10)
close(beam.data.tipRotation, expectedBeamRotation, 2e-10)
close(beam.data.reactions.force, -(beamInput.tipLoad + beamInput.uniformLoad * beamInput.length), 2e-10)
close(beam.data.reactions.moment, -(beamInput.tipLoad * beamInput.length + beamInput.uniformLoad * beamInput.length ** 2 / 2 + beamInput.tipMoment), 2e-10)
assert.equal(beam.checks.every(check => check.status === 'pass'), true)

// 二维稳态热传导：左右定温、上下绝热的解析解是严格线性温度场。
const thermal = solveSteadyHeat2D({
  width: 2,
  height: 1,
  conductivity: 10,
  nx: 21,
  ny: 11,
  heatSource: 0,
  boundaries: {
    left: { type: 'temperature', value: 400 },
    right: { type: 'temperature', value: 300 },
    bottom: { type: 'flux', value: 0 },
    top: { type: 'flux', value: 0 }
  },
  tolerance: 1e-11,
  maxIterations: 20_000,
  relaxation: 1.6
})
assert.equal(thermal.ok, true)
assert.ok(thermal.data)
assert.equal(thermal.data.converged, true)
for (let j = 0; j < thermal.data.ny; j++) {
  for (let i = 0; i < thermal.data.nx; i++) {
    const location = j * thermal.data.nx + i
    close(thermal.data.temperature[location], 400 - 50 * thermal.data.x[i], 1e-9, 2e-8)
    close(thermal.data.heatFluxX[location], 500, 1e-8, 1e-7)
    close(thermal.data.heatFluxY[location], 0, 1e-8, 1e-7)
  }
}
close(thermal.data.energy.boundaryHeatOut, 0, 1e-8, 1e-7)
assert.equal(thermal.checks.every(check => check.status === 'pass'), true)

// 带均匀热源时，边界净流出应等于区域内的总发热量。
const sourcedThermal = solveSteadyHeat2D({
  width: 1,
  height: 1,
  conductivity: 10,
  nx: 31,
  ny: 31,
  heatSource: 100,
  boundaries: {
    left: { type: 'temperature', value: 300 },
    right: { type: 'temperature', value: 300 },
    bottom: { type: 'flux', value: 0 },
    top: { type: 'flux', value: 0 }
  },
  tolerance: 1e-10,
  maxIterations: 50_000,
  relaxation: 1.7
})
assert.equal(sourcedThermal.ok, true)
assert.ok(sourcedThermal.data)
close(sourcedThermal.data.energy.sourceGeneration, 100)
close(sourcedThermal.data.energy.boundaryHeatOut, 100, 1e-7)
close(sourcedThermal.data.maxTemperature, 301.25, 2e-8)
assert.ok(sourcedThermal.data.energy.relativeImbalance < 1e-7)

const unreferencedThermal = solveSteadyHeat2D({
  width: 1, height: 1, conductivity: 1, nx: 5, ny: 5,
  boundaries: {
    left: { type: 'flux', value: 0 }, right: { type: 'flux', value: 0 },
    bottom: { type: 'flux', value: 0 }, top: { type: 'flux', value: 0 }
  }
})
assert.equal(unreferencedThermal.ok, false)
assert.ok(unreferencedThermal.validation.issues.some(issue => issue.code === 'THERMAL_REFERENCE_REQUIRED'))

// SDOF：ω=sqrt(k/m)，振型采用质量归一化。
const sdof = solveSdofModal({ mass: 2, stiffness: 200 })
assert.equal(sdof.ok, true)
assert.ok(sdof.data)
close(sdof.data.modes[0].angularFrequency, 10)
close(sdof.data.modes[0].frequency, 10 / (2 * Math.PI))
close(Math.abs(sdof.data.modes[0].shape[0]), 1 / Math.sqrt(2))

// 两自由度广义特征问题的解析特征值为 50 和 200。
const modal = solveModal({
  massMatrix: [[2, 0], [0, 1]],
  stiffnessMatrix: [[300, -100], [-100, 100]],
  modes: 2
})
assert.equal(modal.ok, true)
assert.ok(modal.data)
close(modal.data.eigenvalues[0], 50, 1e-10)
close(modal.data.eigenvalues[1], 200, 1e-10)
assert.ok(modal.data.maxResidual < 1e-11)
assert.ok(modal.data.maxMassOrthogonalityError < 1e-11)
assert.equal(modal.checks.every(check => check.status === 'pass'), true)

const invalidModal = solveModal({
  massMatrix: [[1, 0], [0, 0]],
  stiffnessMatrix: [[1, 0], [0, 1]]
})
assert.equal(invalidModal.ok, false)
assert.ok(invalidModal.validation.issues.some(issue => issue.code === 'MASS_NOT_POSITIVE_DEFINITE'))

// 统一入口必须保持与各专用求解器相同的类型和结果结构。
const dispatched = solveCae({ kind: 'bar-static', input: { length: 1, area: 1, elasticModulus: 100, elements: 2, endLoad: 10 } })
assert.equal(dispatched.kind, 'bar-static')
assert.equal(dispatched.ok, true)
assert.ok(dispatched.data)

console.log('CAE solvers: bar, beam, thermal and modal verification passed')
