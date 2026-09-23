import type { PhysicsSolveRequest } from '~/types/physics'
import { validatePhysicsCase } from '~/utils/physics-case'
import { buildExternalCasePackage } from '~/utils/external-case'

export default defineEventHandler(async (event) => {
  const request = await readBody<PhysicsSolveRequest>(event)
  if (!request?.project?.result || !request.case) throw createError({ statusCode: 400, statusMessage: '缺少网格或物理算例。' })
  const errors = validatePhysicsCase(request.project, request.case).filter(item => item.level === 'error')
  if (errors.length) throw createError({ statusCode: 422, statusMessage: errors.map(item => item.message).join('；') })
  return buildExternalCasePackage(request.project, request.case)
})
