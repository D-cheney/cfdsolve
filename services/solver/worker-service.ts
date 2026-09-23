import { randomUUID } from 'node:crypto'
import { readFile, readdir, rename, writeFile, mkdir, open, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Worker } from 'node:worker_threads'
import type { PhysicsJob, PhysicsSolveRequest, PhysicsSolveResult } from '../../types/physics'

type StoredJob = { job: PhysicsJob; request: PhysicsSolveRequest }
const directory = resolve(process.env.CFD_ANALYSIS_JOB_DIR || resolve(process.env.CFD_DATA_ROOT || process.cwd(), '.run', 'analysis-jobs'))
const interval = Math.max(100, Number(process.env.CFD_SOLVER_POLL_MS) || 250)
const workerPath = new URL('./solver-execution.mjs', import.meta.url)
const jobPath = (id: string) => resolve(directory, `${id}.json`)
const lockPath = (id: string) => resolve(directory, `${id}.lock`)
const heartbeatPath = resolve(directory, 'worker-heartbeat.json')
let stopping = false

async function read(id: string): Promise<StoredJob | null> {
  try { return JSON.parse(await readFile(jobPath(id), 'utf8')) as StoredJob }
  catch { return null }
}
async function save(value: StoredJob) {
  const temporary = `${jobPath(value.job.id)}.tmp-${process.pid}-${randomUUID()}`
  await writeFile(temporary, JSON.stringify(value), 'utf8')
  await rename(temporary, jobPath(value.job.id))
}
async function claim(id: string) {
  try { const file = await open(lockPath(id), 'wx'); await file.writeFile(`${process.pid}\n`); await file.close(); return true }
  catch { return false }
}
async function execute(id: string) {
  let stored = await read(id)
  if (!stored || stored.job.status !== 'QUEUED') return
  stored.job.status = 'RUNNING'; stored.job.phase = 'Linux 计算进程运行中'; stored.job.progress = 20; stored.job.startedAt = new Date().toISOString()
  await save(stored)
  const thread = new Worker(workerPath, { workerData: stored.request })
  let finished = false
  let result: PhysicsSolveResult | null = null
  let failure = ''
  thread.on('message', message => {
    if (message?.type === 'result') result = message.value as PhysicsSolveResult
    if (message?.type === 'error') failure = String(message.message)
  })
  thread.on('error', error => { failure = error.message })
  const done = new Promise<void>(resolveDone => thread.once('exit', code => { finished = true; if (code !== 0 && !failure) failure = `计算进程退出码 ${code}`; resolveDone() }))
  while (!finished) {
    const current = await read(id)
    if (current?.job.status === 'CANCELED') {
      await thread.terminate()
      await done
      return
    }
    await new Promise(resolveWait => setTimeout(resolveWait, interval))
  }
  await done
  stored = await read(id)
  if (!stored || stored.job.status === 'CANCELED') return
  stored.job.finishedAt = new Date().toISOString(); stored.job.progress = 100
  const computed = result as PhysicsSolveResult | null
  if (computed && !failure) {
    stored.job.result = computed; stored.job.status = 'SUCCEEDED'
    stored.job.phase = computed.converged ? '计算完成' : '计算结束，未完全收敛'
  } else {
    stored.job.status = 'FAILED'; stored.job.phase = '计算失败'; stored.job.error = failure || '计算进程没有返回结果。'
  }
  await save(stored)
}

async function run() {
  await mkdir(directory, { recursive: true })
  process.on('SIGTERM', () => { stopping = true })
  process.on('SIGINT', () => { stopping = true })
  process.stdout.write(`CFD solver worker ready: ${directory}\n`)
  while (!stopping) {
    await writeFile(heartbeatPath, JSON.stringify({ pid: process.pid, at: Date.now() }), 'utf8')
    const files = (await readdir(directory)).filter(name => /^[0-9a-f-]{36}\.json$/i.test(name))
    for (const name of files) {
      const id = name.slice(0, -5), current = await read(id)
      if (current?.job.status === 'RUNNING') {
        let owner = 0
        try { owner = Number((await readFile(lockPath(id), 'utf8')).trim()) } catch { /* interrupted before lock was written */ }
        let alive = false
        if (owner > 0) try { process.kill(owner, 0); alive = true } catch { /* process exited */ }
        if (!alive) {
          await unlink(lockPath(id)).catch(() => {})
          const latest = await read(id)
          if (latest?.job.status === 'RUNNING') {
            latest.job.status = 'FAILED'; latest.job.phase = '计算服务中断'
            latest.job.error = '计算进程中断；输入快照仍保留，请重新提交计算。'
            latest.job.finishedAt = new Date().toISOString(); latest.job.progress = 100
            await save(latest)
          }
        }
        continue
      }
      if (current?.job.status !== 'QUEUED' || !(await claim(id))) continue
      try { await execute(id) }
      catch (error) {
        const latest = await read(id)
        if (latest && latest.job.status === 'RUNNING') {
          latest.job.status = 'FAILED'; latest.job.phase = '计算服务异常'; latest.job.error = error instanceof Error ? error.message : String(error)
          latest.job.progress = 100; latest.job.finishedAt = new Date().toISOString(); await save(latest)
        }
      } finally { await unlink(lockPath(id)).catch(() => {}) }
      if (stopping) break
    }
    if (!stopping) await new Promise(resolveWait => setTimeout(resolveWait, interval))
  }
  await unlink(heartbeatPath).catch(() => {})
}

void run().catch(error => { process.stderr.write(`${error}\n`); process.exitCode = 1 })
