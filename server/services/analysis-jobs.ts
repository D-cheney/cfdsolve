import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PhysicsJob, PhysicsSolveRequest } from '~/types/physics'

type StoredJob = { job: PhysicsJob; request: PhysicsSolveRequest }
const jobDirectory = resolve(process.env.CFD_ANALYSIS_JOB_DIR || resolve(process.env.CFD_DATA_ROOT || process.cwd(), '.run', 'analysis-jobs'))
const jobName = (id: string) => resolve(jobDirectory, `${id}.json`)

async function persist(value: StoredJob) {
  await mkdir(jobDirectory, { recursive: true })
  const temporary = `${jobName(value.job.id)}.tmp-${process.pid}-${randomUUID()}`
  await writeFile(temporary, JSON.stringify(value), 'utf8')
  await rename(temporary, jobName(value.job.id))
}

async function load(id: string): Promise<StoredJob | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  try { return JSON.parse(await readFile(jobName(id), 'utf8')) as StoredJob }
  catch { return null }
}

export async function createAnalysisJob(request: PhysicsSolveRequest) {
  const id = randomUUID()
  const job: PhysicsJob = {
    id, projectId: request.project.id, caseId: request.case.id, caseName: request.case.name, caseSnapshot: structuredClone(request.case), meshResultId: request.project.result?.id, mode: request.case.mode,
    status: 'QUEUED', progress: 5, phase: '等待 Linux 计算服务领取',
    createdAt: new Date().toISOString(),
    inputHash: createHash('sha256').update(JSON.stringify(request)).digest('hex'),
  }
  await persist({ job, request: structuredClone(request) })
  return job
}

export async function getAnalysisJob(id: string) { return (await load(id))?.job ?? null }

export async function cancelAnalysisJob(id: string) {
  const stored = await load(id)
  if (!stored) return null
  if (stored.job.status === 'QUEUED' || stored.job.status === 'RUNNING') {
    stored.job.status = 'CANCELED'
    stored.job.phase = '停止请求已发送'
    stored.job.progress = 100
    stored.job.finishedAt = new Date().toISOString()
    await persist(stored)
  }
  return stored.job
}

export async function listAnalysisJobs(limit = 20, projectId?: string) {
  await mkdir(jobDirectory, { recursive: true })
  const ids = (await readdir(jobDirectory)).filter(name => /^[0-9a-f-]{36}\.json$/i.test(name))
  const found = await Promise.all(ids.map(name => load(name.slice(0, -5))))
  return found.filter((item): item is StoredJob => Boolean(item)).map(item => item.job).filter(job => !projectId || job.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Math.max(1, Math.min(limit, 100)))
}
