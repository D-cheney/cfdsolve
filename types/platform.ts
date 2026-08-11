export type TaskStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'

export interface SimulationTask {
  id: string
  tool: string
  toolName: string
  status: TaskStatus
  createdAt: string
  duration: number
  params: Record<string, string | number>
  result?: Record<string, unknown>
  warnings?: string[]
}

export interface ModelicaProject {
  id: string
  name: string
  slug: string
  template: string
  updatedAt: string
  code: string
  status: 'ACTIVE' | 'ARCHIVED'
  lastCompile: '未编译' | '成功' | '有诊断'
}
