import assert from 'node:assert/strict'
import { defaultModelicaCode, getModelicaTemplate } from '../utils/content.ts'
import { analyzeModelica, defaultModelicaExperiment, simulateModelicaLite } from '../utils/modelica/workbench.ts'

const analysis = analyzeModelica(defaultModelicaCode)
assert.equal(analysis.modelName, 'MassSpringDamper')
assert.equal(analysis.diagnostics.filter(item => item.severity === 'error').length, 0)
assert.equal(analysis.symbols.filter(item => item.kind === 'parameter').length, 3)

const run = simulateModelicaLite(defaultModelicaCode, defaultModelicaExperiment(), { m: 1, k: 100, c: .5 })
assert.equal(run.status, 'SUCCEEDED')
assert.equal(run.time.length, 161)
assert.deepEqual(run.variables.map(item => item.name), ['x', 'v'])

const thermal = simulateModelicaLite(getModelicaTemplate('ThermalNetwork').source, { startTime: 0, stopTime: 1, interval: .1, solver: 'RK4', tolerance: 1e-6 })
assert.equal(thermal.status, 'SUCCEEDED')
assert.equal(thermal.variables.length, 2)

const uneven = simulateModelicaLite(defaultModelicaCode, { startTime: 0, stopTime: 1, interval: .3, solver: 'RK4', tolerance: 1e-6 })
assert.equal(uneven.time.at(-1), 1)
assert.equal(uneven.time.length, 5)

const hydraulic = simulateModelicaLite(getModelicaTemplate('HydraulicCircuit').source, { startTime: 0, stopTime: .2, interval: .001, solver: 'RK4', tolerance: 1e-6 })
assert.equal(hydraulic.status, 'SUCCEEDED')
assert.ok(hydraulic.variables.find(item => item.name === 'p').values.at(-1) > 99)
assert.ok(hydraulic.variables.find(item => item.name === 'p').values.at(-1) <= 100)

const broken = simulateModelicaLite('model Broken\n  Real x;\nequation\n  der(x) = 1;', defaultModelicaExperiment())
assert.equal(broken.status, 'FAILED')

const changedEquation = defaultModelicaCode.replace('m * der(v) + c * v + k * x = 0;', 'der(v) = 0;')
const changedRun = simulateModelicaLite(changedEquation, defaultModelicaExperiment())
assert.equal(changedRun.status, 'FAILED')
assert.equal(changedRun.messages.some(message => message.includes('MO1004')), true)

const noEquation = `model MassSpringDamper
  parameter Real m = 1;
  parameter Real k = 100;
  parameter Real c = 0.5;
  Real x(start=0.1);
  Real v(start=0);
end MassSpringDamper;`
assert.equal(simulateModelicaLite(noEquation, defaultModelicaExperiment()).status, 'FAILED')

const tinyMass = simulateModelicaLite(defaultModelicaCode, defaultModelicaExperiment(), { m: 5e-324, k: 100, c: 0.5 })
assert.equal(tinyMass.status, 'FAILED')
assert.equal(tinyMass.time.length, 0)

const unstableStep = simulateModelicaLite(defaultModelicaCode, defaultModelicaExperiment(), { m: 1, k: 1e6, c: 0 })
assert.equal(unstableStep.status, 'FAILED')
assert.equal(unstableStep.messages.some(message => message.includes('MO9005')), true)

const commentAnalysis = analyzeModelica(`// model Fake
${defaultModelicaCode}`)
assert.equal(commentAnalysis.modelName, 'MassSpringDamper')

const partialStep = simulateModelicaLite(defaultModelicaCode, { startTime: 0, stopTime: 1, interval: 0.3, solver: 'RK4', tolerance: 1e-6 })
assert.equal(partialStep.time.at(-1), 1)
console.log('Modelica workbench tests passed')
