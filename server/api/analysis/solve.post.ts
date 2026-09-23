import type { PhysicsSolveRequest } from '~/types/physics'
import { validatePhysicsCase } from '~/utils/physics-case'
import { createAnalysisJob } from '~/server/services/analysis-jobs'

export default defineEventHandler(async (event) => {
  const request = await readBody<PhysicsSolveRequest>(event)
  if (!request?.project?.result || !request.case) throw createError({ statusCode: 400, statusMessage: '缺少网格或物理算例。' })
  if (request.project.result.nodes.length > 100000 || request.project.result.cells.length > 200000) throw createError({ statusCode: 413, statusMessage: '内置求解器单次最多处理 10 万节点、20 万单元。' })
  const diagnostics = validatePhysicsCase(request.project, request.case)
  const errors = diagnostics.filter(item => item.level === 'error')
  if (errors.length) throw createError({ statusCode: 422, statusMessage: errors.map(item => item.message).join('；') })
  setResponseStatus(event, 202)
  return createAnalysisJob(request)
})
