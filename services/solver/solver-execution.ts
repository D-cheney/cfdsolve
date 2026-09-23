import { parentPort, workerData } from 'node:worker_threads'
import type { PhysicsSolveRequest } from '../../types/physics'
import { solvePhysicsCase } from '../../utils/physics-solver'

try {
  const request = workerData as PhysicsSolveRequest
  parentPort?.postMessage({ type: 'result', value: solvePhysicsCase(request.project, request.case) })
} catch (error) {
  parentPort?.postMessage({ type: 'error', message: error instanceof Error ? error.message : '求解失败。' })
}
