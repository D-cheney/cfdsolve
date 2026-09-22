import { defineStore } from 'pinia'
import type { ConstraintKind, ModelingConstraint, ModelingDocument, ModelingEntity, ModelingSnapshot, Vec2 } from '~/types/modeling'
import { cloneDocument, distance, modelingId, modelingRotateEntity, modelingTranslateEntity, modelingMirrorEntity, validateGeometry, closedProfileCount, entityArea, modelingEntityLength, entityContainsEntity } from '~/utils/modeling-geometry'
import { loadLatestModelingDocument, saveModelingDocument } from '~/utils/modeling-persistence'

const defaultLayer = () => ({ id: 'layer-default', name: '默认图层', color: '#267bb9', visible: true, locked: false })

export function createModelingDocument(): ModelingDocument {
  const now = new Date().toISOString()
  return {
    format: 'cfdrookie-model2d',
    schemaVersion: 1,
    id: modelingId('model'),
    name: '未命名二维模型',
    revision: 0,
    createdAt: now,
    updatedAt: now,
    internalLengthUnit: 'mm',
    displayLengthUnit: 'mm',
    entities: [],
    constraints: [],
    parameters: [],
    layers: [defaultLayer()],
    regions: [],
    groups: [],
    preferences: {
      gridVisible: true,
      gridSize: 10,
      snapGrid: true,
      snapObjects: true,
      snapAngle: true,
      autoConstraint: true,
      angleIncrement: 15,
    },
    view: { center: { x: 0, y: 0 }, pixelsPerMm: 3 },
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function refreshRegions(document: ModelingDocument) {
  for (const region of document.regions) {
    const outers = region.outerEntityIds.map(id => document.entities.find(entity => entity.id === id)).filter(Boolean) as ModelingEntity[]
    const holes = region.holeEntityIds.flat().map(id => document.entities.find(entity => entity.id === id)).filter(Boolean) as ModelingEntity[]
    region.valid = outers.length === region.outerEntityIds.length && outers.length > 0 && outers.every(entity => entityArea(entity) > 0) && holes.length === region.holeEntityIds.flat().length && holes.every(hole => entityArea(hole) > 0 && outers.some(outer => entityContainsEntity(outer, hole)))
    region.area = region.valid ? Math.max(0, outers.reduce((sum, entity) => sum + entityArea(entity), 0) - holes.reduce((sum, entity) => sum + entityArea(entity), 0)) : 0
    region.perimeter = region.valid ? [...outers, ...holes].reduce((sum, entity) => sum + modelingEntityLength(entity), 0) : 0
  }
}

export const useModelingStore = defineStore('modeling', {
  state: () => ({
    document: createModelingDocument(),
    selectedIds: [] as string[],
    history: [] as ModelingSnapshot[],
    future: [] as ModelingSnapshot[],
    savedRevision: -1,
    saveStatus: '未保存' as '未保存' | '保存中' | '已保存至本机' | '保存失败',
    ready: false,
  }),
  getters: {
    selectedEntities(state) {
      return state.document.entities.filter(entity => state.selectedIds.includes(entity.id))
    },
    diagnostics(state) {
      return validateGeometry(state.document.entities)
    },
    closedProfiles(state) {
      return closedProfileCount(state.document.entities)
    },
    summary(state) {
      const diagnostics = validateGeometry(state.document.entities)
      const closed = closedProfileCount(state.document.entities)
      return {
        documentId: state.document.id,
        revision: state.document.revision,
        entities: state.document.entities.length,
        closedProfiles: closed,
        hasDomain: closed > 0,
        diagnostics: diagnostics.filter(item => item.severity === 'error').length,
      }
    },
    dirty(state) {
      return state.document.revision !== state.savedRevision
    },
  },
  actions: {
    async initialize() {
      if (this.ready || !import.meta.client) return
      try {
        const loaded = await loadLatestModelingDocument()
        if (loaded?.format === 'cfdrookie-model2d' && loaded.schemaVersion === 1) {
          this.document = loaded
          this.savedRevision = loaded.revision
          this.saveStatus = '已保存至本机'
        }
      } catch {
        this.saveStatus = '保存失败'
      }
      this.ready = true
    },
    snapshot(label: string) {
      this.history.push({ label, document: cloneDocument(this.document) })
      if (this.history.length > 200) this.history.shift()
      this.future = []
    },
    finish(label: string) {
      refreshRegions(this.document)
      this.document.revision += 1
      this.document.updatedAt = new Date().toISOString()
      this.saveStatus = '未保存'
      this.scheduleSave()
      return label
    },
    scheduleSave() {
      if (!import.meta.client) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => this.save(), 500)
    },
    async save() {
      if (!import.meta.client) return
      this.saveStatus = '保存中'
      const revision = this.document.revision
      try {
        await saveModelingDocument(this.document)
        if (this.document.revision === revision) {
          this.savedRevision = revision
          this.saveStatus = '已保存至本机'
        }
      } catch {
        this.saveStatus = '保存失败'
      }
    },
    replaceDocument(document: ModelingDocument, label = '打开模型') {
      this.snapshot(label)
      this.document = cloneDocument(document)
      this.selectedIds = []
      this.finish(label)
    },
    newDocument() {
      this.snapshot('新建模型')
      this.document = createModelingDocument()
      this.selectedIds = []
      this.finish('新建模型')
    },
    addEntity(entity: ModelingEntity, label = `创建${entity.name}`) {
      this.snapshot(label)
      this.document.entities.push(entity)
      this.selectedIds = [entity.id]
      this.finish(label)
    },
    updateEntity(id: string, patch: Partial<ModelingEntity>, label = '修改几何') {
      const entity = this.document.entities.find(item => item.id === id)
      if (!entity || entity.locked) return false
      this.snapshot(label)
      Object.assign(entity, cloneDocument(patch))
      this.applyConstraints([id])
      this.finish(label)
      return true
    },
    replaceEntities(replacements: Map<string, ModelingEntity>, label: string) {
      const applicable = [...replacements.entries()].filter(([id]) => !this.document.entities.find(item => item.id === id)?.locked)
      if (!applicable.length) return false
      this.snapshot(label)
      for (const [id, replacement] of applicable) {
        const index = this.document.entities.findIndex(item => item.id === id)
        if (index >= 0) this.document.entities[index] = replacement
      }
      this.applyConstraints(applicable.map(([id]) => id))
      this.finish(label)
      return true
    },
    deleteSelected() {
      const ids = this.selectedIds.filter(id => !this.document.entities.find(item => item.id === id)?.locked)
      if (!ids.length) return false
      this.snapshot('删除对象')
      this.document.entities = this.document.entities.filter(entity => !ids.includes(entity.id))
      this.document.constraints = this.document.constraints.filter(constraint => !constraint.entityIds.some(id => ids.includes(id)))
      this.document.groups.forEach(group => { group.entityIds = group.entityIds.filter(id => !ids.includes(id)) })
      this.document.regions = this.document.regions.filter(region => !region.outerEntityIds.some(id => ids.includes(id))).map(region => ({ ...region, holeEntityIds: region.holeEntityIds.filter(group => !group.some(id => ids.includes(id))) }))
      this.selectedIds = []
      this.finish('删除对象')
      return true
    },
    transformSelected(kind: 'move' | 'rotate' | 'mirror', options: { delta?: Vec2; center?: Vec2; radians?: number; axis?: [Vec2, Vec2] }) {
      const replacements = new Map<string, ModelingEntity>()
      for (const entity of this.selectedEntities) {
        if (entity.locked) continue
        if (kind === 'move' && options.delta) replacements.set(entity.id, modelingTranslateEntity(entity, options.delta))
        if (kind === 'rotate' && options.center && options.radians !== undefined) replacements.set(entity.id, modelingRotateEntity(entity, options.center, options.radians))
        if (kind === 'mirror' && options.axis) replacements.set(entity.id, modelingMirrorEntity(entity, options.axis[0], options.axis[1]))
      }
      return this.replaceEntities(replacements, kind === 'move' ? '移动对象' : kind === 'rotate' ? '旋转对象' : '镜像对象')
    },
    addConstraint(kind: ConstraintKind, ids: string[], value?: number) {
      if (!ids.length) return false
      const entities = ids.map(id => this.document.entities.find(entity => entity.id === id))
      if (entities.some(entity => !entity)) return false
      const lineOnly = ['horizontal', 'vertical', 'length'].includes(kind)
      const twoLines = ['parallel', 'perpendicular', 'equalLength'].includes(kind)
      const radialOnly = ['radius', 'diameter'].includes(kind)
      const twoRadial = ['concentric', 'equalRadius', 'tangent'].includes(kind)
      if (lineOnly && (ids.length !== 1 || entities[0]?.kind !== 'line')) return false
      if (twoLines && (ids.length !== 2 || entities.some(entity => entity?.kind !== 'line'))) return false
      if (radialOnly && (ids.length !== 1 || !['circle', 'arc'].includes(entities[0]!.kind))) return false
      if (twoRadial && (ids.length !== 2 || entities.some(entity => !['circle', 'arc'].includes(entity!.kind)))) return false
      if (['length', 'radius', 'diameter', 'angle'].includes(kind) && (!Number.isFinite(value) || (value ?? 0) <= 0)) return false
      const sameReferences = (left: string[], right: string[]) => left.length === right.length && [...left].sort().every((id, index) => id === [...right].sort()[index])
      if (this.document.constraints.some(constraint => constraint.kind === kind && sameReferences(constraint.entityIds, ids))) return false
      if (['length', 'radius', 'diameter'].includes(kind) && this.document.constraints.some(constraint => constraint.enabled && constraint.entityIds[0] === ids[0] && ['length', 'radius', 'diameter'].includes(constraint.kind))) return false
      const constraint: ModelingConstraint = { id: modelingId('constraint'), kind, entityIds: [...ids], value, driving: true, enabled: true }
      this.snapshot(`添加${kind}约束`)
      this.document.constraints.push(constraint)
      if (kind === 'fixed') {
        for (const id of ids) {
          const entity = this.document.entities.find(item => item.id === id)
          if (entity) entity.locked = true
        }
      }
      this.applyConstraints(ids)
      this.finish(`添加${kind}约束`)
      return true
    },
    removeConstraint(id: string) {
      const index = this.document.constraints.findIndex(item => item.id === id)
      if (index < 0) return
      const removed = this.document.constraints[index]!
      this.snapshot('删除约束')
      this.document.constraints.splice(index, 1)
      if (removed.kind === 'fixed') {
        for (const entityId of removed.entityIds) {
          const stillFixed = this.document.constraints.some(constraint => constraint.enabled && constraint.kind === 'fixed' && constraint.entityIds.includes(entityId))
          const entity = this.document.entities.find(item => item.id === entityId)
          if (entity && !stillFixed) entity.locked = false
        }
      }
      this.finish('删除约束')
    },
    applyConstraints(changedIds: string[]) {
      for (let pass = 0; pass < 4; pass += 1) {
        for (const constraint of this.document.constraints.filter(item => item.enabled)) {
          const entities = constraint.entityIds.map(id => this.document.entities.find(entity => entity.id === id)).filter(Boolean) as ModelingEntity[]
          if (!entities.length) continue
          const target = entities.find(entity => !entity.locked && changedIds.includes(entity.id)) ?? entities.find(entity => !entity.locked)
          if (!target) continue
          if (constraint.kind === 'horizontal' && target.kind === 'line' && target.points.length >= 2) target.points[1]!.y = target.points[0]!.y
          if (constraint.kind === 'vertical' && target.kind === 'line' && target.points.length >= 2) target.points[1]!.x = target.points[0]!.x
          if (constraint.kind === 'length' && target.kind === 'line' && target.points.length >= 2 && constraint.value !== undefined) {
            const angle = Math.atan2(target.points[1]!.y - target.points[0]!.y, target.points[1]!.x - target.points[0]!.x)
            target.points[1] = { x: target.points[0]!.x + Math.cos(angle) * constraint.value, y: target.points[0]!.y + Math.sin(angle) * constraint.value }
          }
          if ((constraint.kind === 'radius' || constraint.kind === 'diameter') && target.radius !== undefined && constraint.value !== undefined) target.radius = constraint.kind === 'diameter' ? constraint.value / 2 : constraint.value
          if (entities.length === 2 && entities[0]!.points.length >= 2 && entities[1]!.points.length >= 2) {
            const anchor = entities[0]!
            const follower = entities[1]!
            if (follower.locked) continue
            const anchorAngle = Math.atan2(anchor.points[1]!.y - anchor.points[0]!.y, anchor.points[1]!.x - anchor.points[0]!.x)
            const followerLength = distance(follower.points[0]!, follower.points[1]!)
            if (constraint.kind === 'parallel' || constraint.kind === 'perpendicular') {
              const angle = anchorAngle + (constraint.kind === 'perpendicular' ? Math.PI / 2 : 0)
              follower.points[1] = { x: follower.points[0]!.x + Math.cos(angle) * followerLength, y: follower.points[0]!.y + Math.sin(angle) * followerLength }
            }
            if (constraint.kind === 'equalLength') {
              follower.points[1] = { x: follower.points[0]!.x + Math.cos(Math.atan2(follower.points[1]!.y - follower.points[0]!.y, follower.points[1]!.x - follower.points[0]!.x)) * modelingEntityLength(anchor), y: follower.points[0]!.y + Math.sin(Math.atan2(follower.points[1]!.y - follower.points[0]!.y, follower.points[1]!.x - follower.points[0]!.x)) * modelingEntityLength(anchor) }
            }
            if (constraint.kind === 'concentric' && anchor.center && follower.center) follower.center = { ...anchor.center }
            if (constraint.kind === 'equalRadius' && anchor.radius !== undefined && follower.radius !== undefined) follower.radius = anchor.radius
          }
        }
      }
    },
    createRegion(entityIds: string[], name = '二维区域') {
      const entities = this.document.entities.filter(entity => entityIds.includes(entity.id))
      const valid = entities.length > 0 && entities.every(entity => entityArea(entity) > 0)
      if (!valid) return false
      const sorted = [...entities].sort((left, right) => entityArea(right) - entityArea(left))
      const depth = new Map<string, number>()
      const parent = new Map<string, ModelingEntity>()
      for (let index = 0; index < sorted.length; index += 1) {
        const item = sorted[index]!
        const container = sorted.slice(0, index).reverse().find(candidate => entityContainsEntity(candidate, item))
        if (container) parent.set(item.id, container)
        depth.set(item.id, container ? (depth.get(container.id) ?? 0) + 1 : 0)
      }
      this.snapshot('创建二维区域')
      const selected = new Set(entityIds)
      this.document.regions = this.document.regions.filter(region => ![...region.outerEntityIds, ...region.holeEntityIds.flat()].some(id => selected.has(id)))
      for (const outer of sorted.filter(entity => (depth.get(entity.id) ?? 0) % 2 === 0)) {
        const holes = sorted.filter(entity => parent.get(entity.id)?.id === outer.id && (depth.get(entity.id) ?? 0) % 2 === 1)
        this.document.regions.push({
          id: modelingId('region'),
          name: `${name} ${this.document.regions.length + 1}`,
          outerEntityIds: [outer.id],
          holeEntityIds: holes.map(entity => [entity.id]),
          valid: true,
          area: Math.max(0, entityArea(outer) - holes.reduce((sum, entity) => sum + entityArea(entity), 0)),
          perimeter: modelingEntityLength(outer) + holes.reduce((sum, entity) => sum + modelingEntityLength(entity), 0),
        })
      }
      this.finish('创建二维区域')
      return true
    },
    createGroup(name: string) {
      if (!this.selectedIds.length || !name.trim()) return false
      this.snapshot('创建几何分组')
      this.document.groups.push({ id: modelingId('group'), name: name.trim(), entityIds: [...this.selectedIds] })
      this.finish('创建几何分组')
      return true
    },
    toggleSelection(id: string, append = false) {
      if (!append) this.selectedIds = [id]
      else if (this.selectedIds.includes(id)) this.selectedIds = this.selectedIds.filter(item => item !== id)
      else this.selectedIds.push(id)
    },
    undo() {
      const snapshot = this.history.pop()
      if (!snapshot) return
      this.future.push({ label: snapshot.label, document: cloneDocument(this.document) })
      this.document = snapshot.document
      this.document.revision += 1
      this.document.updatedAt = new Date().toISOString()
      this.selectedIds = []
      this.scheduleSave()
    },
    redo() {
      const snapshot = this.future.pop()
      if (!snapshot) return
      this.history.push({ label: snapshot.label, document: cloneDocument(this.document) })
      this.document = snapshot.document
      this.document.revision += 1
      this.document.updatedAt = new Date().toISOString()
      this.selectedIds = []
      this.scheduleSave()
    },
  },
})
