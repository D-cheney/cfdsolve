import assert from "node:assert/strict";
import { solveTool } from "../utils/solvers.ts";
import {
  assessSimulationResult,
  generateSweepValues,
  getMetricValue,
} from "../utils/simulation-lab.ts";

assert.deepEqual(generateSweepValues(1, 3, 3, "linear"), [1, 2, 3]);
assert.deepEqual(generateSweepValues(1, 100, 3, "log"), [1, 10, 100]);
assert.deepEqual(generateSweepValues(33, 65, 3, "linear", true), [33, 49, 65]);
assert.throws(() => generateSweepValues(0, 100, 3, "log"), /大于 0/);
assert.throws(() => generateSweepValues(1, 1.1, 4, "linear", true), /范围过窄/);

const basePipe = {
  diameter: 0.05,
  pipe_length: 2,
  rho: 998,
  viscosity: 0.001,
  drive_mode: "mean_velocity",
  samples: 41,
};
const velocities = generateSweepValues(0.005, 0.02, 4, "linear");
const pipeCases = velocities.map((drive_value) => {
  const params = { ...basePipe, drive_value };
  const result = solveTool("pipe-flow", params);
  return {
    params,
    result,
    reynolds: getMetricValue("pipe-flow", "reynolds", result),
  };
});
assert.equal(pipeCases.length, 4);
assert.ok(pipeCases.every((item, index) => index === 0 || item.reynolds > pipeCases[index - 1].reynolds));
assert.ok(pipeCases.every((item) => Number.isFinite(getMetricValue("pipe-flow", "pressureDrop", item.result))));

const laminarAssessment = assessSimulationResult(
  "pipe-flow",
  pipeCases[0].params,
  pipeCases[0].result,
);
assert.equal(laminarAssessment.checks.find((item) => item.key === "applicability")?.status, "pass");
assert.ok(laminarAssessment.score >= 90);

const highSpeedParams = { ...basePipe, drive_value: 0.5 };
const highSpeedResult = solveTool("pipe-flow", highSpeedParams);
const highSpeedAssessment = assessSimulationResult("pipe-flow", highSpeedParams, highSpeedResult, highSpeedResult.warnings);
assert.equal(highSpeedAssessment.checks.find((item) => item.key === "applicability")?.status, "warning");

const cavityParams = {
  reynolds: 100,
  nx: 33,
  ny: 33,
  lid_velocity: 1,
  max_iterations: 100,
  tolerance: 1e-8,
  pressure_relaxation: 0.3,
  velocity_relaxation: 0.7,
};
const cavity = solveTool("lid-driven-cavity", cavityParams);
const cavityAssessment = assessSimulationResult("lid-driven-cavity", cavityParams, cavity, cavity.warnings);
assert.equal(cavity.converged, false);
assert.equal(cavityAssessment.checks.find((item) => item.key === "convergence")?.status, "fail");
assert.equal(cavityAssessment.checks.find((item) => item.key === "reference")?.status, "fail");

console.log("simulation lab tests passed");
