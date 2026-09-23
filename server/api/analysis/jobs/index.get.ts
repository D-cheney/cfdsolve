import { listAnalysisJobs } from '~/server/services/analysis-jobs'

export default defineEventHandler(event => {
  const query = getQuery(event)
  return listAnalysisJobs(Number(query.limit) || 20, typeof query.projectId === 'string' ? query.projectId : undefined)
})
