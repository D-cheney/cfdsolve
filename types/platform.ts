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
  experiment?: ModelicaExperiment
  runs?: ModelicaRun[]
  diagram?: ModelicaDiagram
  algorithms?: ModelicaComponentAlgorithm[]
}

export interface ModelicaDiagramNode {
  id: string
  kind: 'source' | 'mass' | 'spring' | 'damper' | 'thermal-capacity' | 'thermal-resistance' | 'fluid-volume' | 'fluid-resistance' | 'shaft' | 'load' | 'sensor'
  label: string
  x: number
  y: number
  parameters: Record<string, number>
}

export interface ModelicaDiagramLink { id: string; from: string; to: string; type: 'physical' | 'signal' }

export interface ModelicaDiagram { nodes: ModelicaDiagramNode[]; links: ModelicaDiagramLink[] }

export interface ModelicaComponentAlgorithm {
  nodeId: string
  name: string
  code: string
  enabled: boolean
}

export type ModelicaSolver = 'RK4' | 'Euler'

export interface ModelicaExperiment {
  startTime: number
  stopTime: number
  interval: number
  solver: ModelicaSolver
  tolerance: number
}

export interface ModelicaSeries {
  name: string
  unit?: string
  values: number[]
}

export interface ModelicaRun {
  id: string
  label: string
  createdAt: string
  status: 'SUCCEEDED' | 'FAILED'
  engine: string
  experiment: ModelicaExperiment
  parameters: Record<string, number>
  time: number[]
  variables: ModelicaSeries[]
  summary: { points: number; steps: number; events: number; maximum?: number }
  messages: string[]
}
