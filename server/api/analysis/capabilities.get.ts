import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { SolverCapabilities } from '~/types/physics'

const directory = resolve(process.env.CFD_ANALYSIS_JOB_DIR || resolve(process.env.CFD_DATA_ROOT || process.cwd(), '.run', 'analysis-jobs'))

export default defineEventHandler(async (): Promise<SolverCapabilities> => {
  let workerReady = false
  try {
    const heartbeat = JSON.parse(await readFile(resolve(directory, 'worker-heartbeat.json'), 'utf8')) as { at?: number }
    workerReady = Number.isFinite(heartbeat.at) && Date.now() - heartbeat.at! < 5000
  } catch { /* worker has not started */ }
  return {
    native: { solidFem: true, oneWayFsi: true, twoWayThinChannelFsi: true, maxDegreesOfFreedom: 200000, workerReady },
    external: {
      openfoam: { available: false, version: '' },
      calculix: { available: false, version: '' },
      precice: { available: false, version: '' },
    },
  }
})
