export type Vec2 = { x: number; y: number }
export type LengthUnit = 'mm' | 'cm' | 'm'

export type ModelingEntityKind =
  | 'point'
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'arc'
  | 'ellipse'
  | 'polygon'
  | 'slot'
  | 'spline'

export type ConstraintKind =
  | 'coincident'
  | 'horizontal'
  | 'vertical'
  | 'fixed'
  | 'parallel'
  | 'perpendicular'
  | 'equalLength'
  | 'concentric'
  | 'equalRadius'
  | 'tangent'
  | 'length'
  | 'radius'
  | 'diameter'
  | 'angle'

export interface ModelingEntity {
  id: string
  kind: ModelingEntityKind
  name: string
  layerId: string
  points: Vec2[]
  center?: Vec2
  radius?: number
  radiusY?: number
  rotation?: number
  startAngle?: number
  sweepAngle?: number
  sides?: number
  closed?: boolean
  construction: boolean
  locked: boolean
  visible: boolean
  generatedBy?: string
}

export interface ModelingConstraint {
  id: string
  kind: ConstraintKind
  entityIds: string[]
  pointIndices?: number[]
  value?: number
  expression?: string
  driving: boolean
  enabled: boolean
}

export interface ModelingParameter {
  id: string
  name: string
  expression: string
  quantity: 'length' | 'angle' | 'scalar'
  value: number
}

export interface ModelingLayer {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
}

export interface ModelingRegion {
  id: string
  name: string
  outerEntityIds: string[]
  holeEntityIds: string[][]
  valid: boolean
  area: number
  perimeter: number
}

export interface GeometryGroup {
  id: string
  name: string
  entityIds: string[]
}

export interface ModelingDocument {
  format: 'cfdrookie-model2d'
  schemaVersion: 1
  id: string
  name: string
  revision: number
  createdAt: string
  updatedAt: string
  internalLengthUnit: 'mm'
  displayLengthUnit: LengthUnit
  entities: ModelingEntity[]
  constraints: ModelingConstraint[]
  parameters: ModelingParameter[]
  layers: ModelingLayer[]
  regions: ModelingRegion[]
  groups: GeometryGroup[]
  preferences: {
    gridVisible: boolean
    gridSize: number
    snapGrid: boolean
    snapObjects: boolean
    snapAngle: boolean
    autoConstraint: boolean
    angleIncrement: number
  }
  view: {
    center: Vec2
    pixelsPerMm: number
  }
}

export interface ModelingSummary {
  documentId: string
  revision: number
  entities: number
  closedProfiles: number
  hasDomain: boolean
  diagnostics: number
}

export interface ModelingDiagnostic {
  id: string
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  entityIds: string[]
  location?: Vec2
}

export interface ModelingSnapshot {
  label: string
  document: ModelingDocument
}
