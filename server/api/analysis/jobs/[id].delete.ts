import { cancelAnalysisJob } from '~/server/services/analysis-jobs'

export default defineEventHandler(async (event) => {
  const job = await cancelAnalysisJob(getRouterParam(event, 'id') || '')
  if (!job) throw createError({ statusCode: 404, statusMessage: '求解任务不存在。' })
  return job
})
