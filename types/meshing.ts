import type { Vec2 } from './modeling'

export type MeshMethod = 'tri' | 'quad-dominant' | 'mapped-quad'
export type BoundarySemantic = 'inlet' | 'outlet' | 'wall' | 'symmetry' | 'farfield' | 'interface' | 'periodic' | 'custom'
export type ZoneRole = 'fluid' | 'solid' | 'unassigned'

export interface MeshTopologyEdge {
  id: string
  sourceEntityId: string
  name: string
  points: Vec2[]
  length: number
  faceIds: string[]
}

export interface MeshTopologyFace {
  id: string
  sourceRegionId: string
  name: string
  outerEdgeIds: string[]
  holeEdgeIds: string[][]
  area: number
}

export interface MeshBoundarySet {
  id: string
  name: string
  exportName: string
  semantic: BoundarySemantic
  color: string
  edgeIds: string[]
}

export interface MeshCellZone {
  id: string
  name: string
  exportName: string
  role: ZoneRole
  faceIds: string[]
}

export interface MeshLayerControl {
  id: string
  boundarySetId: string
  firstLayer: number
  layers: number
  growth: number
  thickness: number
  enabled: boolean
}

export interface MeshSizeControl {
  id: string
  name: string
  edgeIds: string[]
  targetSize: number
  influenceDistance: number
  enabled: boolean
}

export interface MeshSettings {
  method: MeshMethod
  targetSize: number
  minSize: number
  maxSize: number
  curvatureSegments: number
  mappedNx: number
  mappedNy: number
  smoothing: number
}

export interface MeshNode { id: number; x: number; y: number }
export interface MeshCell { id: number; type: 'tri' | 'quad'; nodeIds: number[]; zoneId: string; quality: number; area: number }
export interface MeshBoundaryElement { id: number; nodeIds: [number, number]; boundarySetId: string }

export interface MeshQualitySummary {
  minQuality: number
  meanQuality: number
  minAngle: number
  maxAspectRatio: number
  invalidCells: number
  totalArea: number
}

export interface MeshResult {
  id: string
  createdAt: string
  geometryRevision: number
  settingsHash: string
  nodes: MeshNode[]
  cells: MeshCell[]
  boundaryElements: MeshBoundaryElement[]
  quality: MeshQualitySummary
  warnings: string[]
  /** ASCII Gmsh 4.1 file with physical names for cell zones and boundaries. */
  msh?: string
}

export interface MeshProject {
  format: 'cfdrookie-mesh2d'
  schemaVersion: 1
  id: string
  documentId: string
  sourceRevision: number
  updatedAt: string
  edges: MeshTopologyEdge[]
  faces: MeshTopologyFace[]
  boundarySets: MeshBoundarySet[]
  cellZones: MeshCellZone[]
  layers: MeshLayerControl[]
  sizeControls: MeshSizeControl[]
  settings: MeshSettings
  result: MeshResult | null
}

export interface MeshGenerationRequest {
  edges: MeshTopologyEdge[]
  faces: MeshTopologyFace[]
  boundarySets: MeshBoundarySet[]
  cellZones: MeshCellZone[]
  layers: MeshLayerControl[]
  sizeControls: MeshSizeControl[]
  settings: MeshSettings
}
