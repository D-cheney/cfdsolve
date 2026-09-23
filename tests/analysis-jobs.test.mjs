import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createPhysicsCase } from '../utils/physics-case.ts'

const jobDir = await mkdtemp(join(tmpdir(), 'cfdrookie-jobs-'))
process.env.CFD_ANALYSIS_JOB_DIR = jobDir
const { cancelAnalysisJob, createAnalysisJob, getAnalysisJob, listAnalysisJobs } = await import('../server/services/analysis-jobs.ts')

const project = {
  format: 'cfdrookie-mesh2d', schemaVersion: 1, id: 'job-mesh', documentId: 'test', sourceRevision: 1, updatedAt: new Date().toISOString(),
  edges: [], faces: [{ id: 'face', sourceRegionId: 'region', name: 'solid', outerEdgeIds: [], holeEdgeIds: [], area: 2000 }],
  boundarySets: [
    { id: 'fixed', name: '固定', exportName: 'fixed', semantic: 'wall', color: '#345', edgeIds: [] },
    { id: 'load', name: '载荷', exportName: 'load', semantic: 'custom', color: '#678', edgeIds: [] },
  ],
  cellZones: [{ id: 'solid', name: '固体', exportName: 'solid', role: 'solid', faceIds: ['face'] }],
  layers: [], sizeControls: [], settings: { method: 'tri', targetSize: 10, minSize: 1, maxSize: 20, curvatureSegments: 16, mappedNx: 2, mappedNy: 2, smoothing: 1 },
  result: {
    id: 'result', createdAt: new Date().toISOString(), geometryRevision: 1, settingsHash: 'hash', warnings: [],
    nodes: [{ id: 1, x: 0, y: 0 }, { id: 2, x: 100, y: 0 }, { id: 3, x: 100, y: 20 }, { id: 4, x: 0, y: 20 }],
    cells: [{ id: 1, type: 'tri', nodeIds: [1, 2, 3], zoneId: 'solid', quality: .8, area: 1000 }, { id: 2, type: 'tri', nodeIds: [1, 3, 4], zoneId: 'solid', quality: .8, area: 1000 }],
    boundaryElements: [{ id: 1, nodeIds: [4, 1], boundarySetId: 'fixed' }, { id: 2, nodeIds: [2, 3], boundarySetId: 'load' }],
    quality: { minQuality: .8, meanQuality: .8, minAngle: 30, maxAspectRatio: 3, invalidCells: 0, totalArea: 2000 },
  },
}
const physicsCase = createPhysicsCase(project)
physicsCase.mode = 'solid'
physicsCase.boundaries.find(item => item.boundarySetId === 'fixed').type = 'fixed'
const load = physicsCase.boundaries.find(item => item.boundarySetId === 'load')
load.type = 'traction'; load.valueY = -1e5

const created = await createAnalysisJob({ project, case: physicsCase })
assert.equal(created.status, 'QUEUED')
assert.match(created.inputHash, /^[0-9a-f]{64}$/)
assert.equal((await getAnalysisJob(created.id)).status, 'QUEUED', '网站进程不能自行计算')
assert.equal(created.caseSnapshot.mode, 'solid')
const interrupted = await createAnalysisJob({ project, case: physicsCase })
const interruptedPath = join(jobDir, `${interrupted.id}.json`)
const stale = JSON.parse(await readFile(interruptedPath, 'utf8'))
stale.job.status = 'RUNNING'
await writeFile(interruptedPath, JSON.stringify(stale))
await writeFile(join(jobDir, `${interrupted.id}.lock`), '2147483647\n')
const worker = spawn(process.execPath, ['.output/server/worker-service.mjs'], {
  cwd: process.cwd(), env: { ...process.env, CFD_ANALYSIS_JOB_DIR: jobDir, CFD_SOLVER_POLL_MS: '100' }, stdio: 'pipe',
})
let workerError = ''
worker.stderr.on('data', data => { workerError += data.toString() })
let completed
for (let attempt = 0; attempt < 100; attempt += 1) {
  await new Promise(resolve => setTimeout(resolve, 50))
  completed = await getAnalysisJob(created.id)
  if (!['QUEUED', 'RUNNING'].includes(completed.status)) break
}
assert.equal(completed.status, 'SUCCEEDED', workerError || completed.error)
assert.ok(completed.result.solid.maxDisplacement > 0)
assert.equal((await listAnalysisJobs()).some(job => job.id === created.id), true)
assert.equal((await listAnalysisJobs(20, project.id)).some(job => job.id === created.id), true)
assert.equal((await listAnalysisJobs(20, 'another-project')).length, 0)
for (let attempt = 0; attempt < 30 && (await getAnalysisJob(interrupted.id)).status === 'RUNNING'; attempt += 1) await new Promise(resolve => setTimeout(resolve, 50))
assert.equal((await getAnalysisJob(interrupted.id)).status, 'FAILED', 'interrupted task must not stay RUNNING after worker restart')

const queued = await createAnalysisJob({ project, case: physicsCase })
const canceled = await cancelAnalysisJob(queued.id)
assert.equal(canceled.status, 'CANCELED')
await new Promise(resolve => setTimeout(resolve, 80))
assert.equal((await getAnalysisJob(queued.id)).status, 'CANCELED')

if (process.env.CFD_TEST_API) {
  const base = process.env.CFD_TEST_API.replace(/\/$/, '')
  const response = await fetch(`${base}/api/analysis/jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project, case: physicsCase }) })
  if (response.status !== 202) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  const submitted = await response.json()
  assert.equal(submitted.status, 'QUEUED')
  let remote = submitted
  for (let attempt = 0; attempt < 100 && ['QUEUED', 'RUNNING'].includes(remote.status); attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 50))
    remote = await (await fetch(`${base}/api/analysis/jobs/${submitted.id}`)).json()
  }
  assert.equal(remote.status, 'SUCCEEDED', remote.error)
  assert.ok(remote.result.solid.maxDisplacement > 0)
  const filtered = await (await fetch(`${base}/api/analysis/jobs?projectId=${project.id}`)).json()
  assert.ok(filtered.some(job => job.id === submitted.id))
}

worker.kill()
await new Promise(resolve => worker.once('exit', resolve))
await rm(jobDir, { recursive: true, force: true })
console.log('analysis job tests passed')
