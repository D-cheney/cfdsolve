import type { MeshProject } from './meshing'

export type AnalysisMode = 'fluid' | 'solid' | 'fsi-one-way' | 'fsi-two-way'
export type BoundaryConditionType =
  | 'wall' | 'moving-wall' | 'velocity-inlet' | 'pressure-inlet' | 'pressure-outlet' | 'symmetry'
  | 'fixed' | 'roller-x' | 'roller-y' | 'traction' | 'pressure-load' | 'fsi-interface' | 'free'

export interface FluidMaterial {
  density: number
  dynamicViscosity: number
}

export interface SolidMaterial {
  youngModulus: number
  poissonRatio: number
  density: number
  thickness: number
  formulation: 'plane-stress' | 'plane-strain'
}

export interface PhysicsBoundaryCondition {
  boundarySetId: string
  type: BoundaryConditionType
  valueX: number
  valueY: number
  pressure: number
}

export interface PhysicsCase {
  format: 'cfdrookie-physics2d'
  schemaVersion: 1
  id: string
  name: string
  mode: AnalysisMode
  meshProjectId: string
  lengthScale: number
  fluid: FluidMaterial
  solid: SolidMaterial
  boundaries: PhysicsBoundaryCondition[]
  fsi: {
    referenceGap: number
    inletPressure: number
    outletPressure: number
    deformationSign: 1 | -1
    maxCouplingIterations: number
    couplingTolerance: number
    relaxation: number
  }
  solver: {
    engine: 'native'
    maxIterations: number
    tolerance: number
  }
}

export interface PhysicsDiagnostic {
  level: 'error' | 'warning' | 'info'
  code: string
  message: string
}

export interface SolidNodeResult {
  nodeId: number
  ux: number
  uy: number
  magnitude: number
}

export interface SolidCellResult {
  cellId: number
  stressX: number
  stressY: number
  stressZ: number
  shearXY: number
  vonMises: number
}

export interface PhysicsSolveResult {
  mode: AnalysisMode
  engine: string
  converged: boolean
  durationMs: number
  warnings: string[]
  solid?: {
    nodes: SolidNodeResult[]
    cells: SolidCellResult[]
    maxDisplacement: number
    maxVonMises: number
    reactions: { nodeId: number; rx: number; ry: number }[]
  }
  fsi?: {
    iterations: number
    residuals: number[]
    flowRatePerDepth: number
    minimumGap: number
    pressureProfile: { nodeId: number; x: number; pressure: number }[]
  }
  fluid?: Record<string, unknown>
}

export interface PhysicsSolveRequest {
  project: MeshProject
  case: PhysicsCase
}

export interface ExternalCasePackage {
  format: 'cfdrookie-external-case'
  schemaVersion: 1
  mode: AnalysisMode
  generatedAt: string
  meshHash: string
  files: Record<string, string>
  commands: string[]
  warnings: string[]
}

export type PhysicsJobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'

export interface PhysicsJob {
  id: string
  projectId?: string
  caseId: string
  caseName: string
  caseSnapshot?: PhysicsCase
  meshResultId?: string
  mode: AnalysisMode
  status: PhysicsJobStatus
  progress: number
  phase: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  inputHash: string
  error?: string
  result?: PhysicsSolveResult
}

export interface SolverCapabilities {
  native: { solidFem: true; oneWayFsi: true; twoWayThinChannelFsi: true; maxDegreesOfFreedom: number; workerReady: boolean }
  external: {
    openfoam: { available: boolean; version: string }
    calculix: { available: boolean; version: string }
    precice: { available: boolean; version: string }
  }
}
