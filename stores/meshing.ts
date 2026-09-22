import { defineStore } from 'pinia'
import type { MeshBoundarySet, MeshCellZone, MeshGenerationRequest, MeshLayerControl, MeshProject, MeshSizeControl } from '~/types/meshing'
import { createMeshProject, meshProjectDiagnostics } from '~/utils/meshing/geometry-bridge'
import { assessMesh, meshSettingsHash } from '~/utils/meshing/quality'
import { loadMeshProject, saveMeshProject } from '~/utils/meshing/persistence'
import { modelingId } from '~/utils/modeling-geometry'
import { useModelingStore } from '~/stores/modeling'

let saveTimer: ReturnType<typeof setTimeout> | null = null
let generationController: AbortController | null = null
let generationVersion = 0

export const useMeshingStore = defineStore('meshing', {
  state: () => ({
    project: null as MeshProject | null,
    selectedEdgeIds: [] as string[],
    selectedFaceIds: [] as string[],
    status: '未初始化' as '未初始化' | '就绪' | '生成中' | '已完成' | '失败',
    saveStatus: '未保存',
    error: '',
  }),
  getters: {
    diagnostics: state => state.project ? meshProjectDiagnostics(state.project) : ['网格工程尚未初始化'],
    canAccept(): boolean { return Boolean(this.project?.result && !this.diagnostics.length && this.project.result.quality.invalidCells === 0) },
  },
  actions: {
    async initialize() {
      const modeling = useModelingStore()
      await modeling.initialize()
      const loaded = import.meta.client ? await loadMeshProject(modeling.document.id).catch(() => null) : null
      this.project = createMeshProject(modeling.document, loaded)
      this.status = this.project.result && !meshProjectDiagnostics(this.project).length ? '已完成' : '就绪'
      this.saveStatus = loaded ? '已从本机恢复' : '未保存'
      this.scheduleSave()
    },
    syncGeometry() {
      const modeling = useModelingStore()
      this.project = createMeshProject(modeling.document, this.project)
      this.status = this.project.result && !meshProjectDiagnostics(this.project).length ? '已完成' : '就绪'
      this.selectedEdgeIds = this.selectedEdgeIds.filter(id => this.project!.edges.some(edge => edge.id === id))
      this.selectedFaceIds = this.selectedFaceIds.filter(id => this.project!.faces.some(face => face.id === id))
      this.scheduleSave()
    },
    touch(invalidate = false) {
      if (!this.project) return
      this.project.updatedAt = new Date().toISOString()
      if (invalidate) { this.project.result = null; this.status = '就绪' }
      this.saveStatus = '未保存'
      this.scheduleSave()
    },
    scheduleSave() {
      if (!import.meta.client || !this.project) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => this.save(), 500)
    },
    async save() {
      if (!this.project || !import.meta.client) return
      try { this.saveStatus = '保存中'; await saveMeshProject(this.project); this.saveStatus = '已保存至本机' } catch { this.saveStatus = '保存失败' }
    },
    createBoundarySet(name: string, semantic: MeshBoundarySet['semantic'] = 'custom') {
      if (!this.project || !this.selectedEdgeIds.length) return false
      const occupied = new Set(this.project.boundarySets.flatMap(set => set.edgeIds))
      const edgeIds = this.selectedEdgeIds.filter(id => !occupied.has(id) || this.project!.boundarySets.some(set => set.edgeIds.includes(id)))
      for (const set of this.project.boundarySets) set.edgeIds = set.edgeIds.filter(id => !edgeIds.includes(id))
      this.project.boundarySets = this.project.boundarySets.filter(set => set.edgeIds.length)
      const index = this.project.boundarySets.length + 1
      this.project.boundarySets.push({ id: modelingId('boundary'), name: name.trim() || `边界 ${index}`, exportName: `boundary_${index}`, semantic, color: ['#1677b8','#e67e3f','#4c9a73','#8b69b6','#c55663'][index % 5]!, edgeIds })
      this.touch(true)
      return true
    },
    updateBoundary(id: string, patch: Partial<MeshBoundarySet>) {
      const item = this.project?.boundarySets.find(set => set.id === id)
      if (!item) return
      const previousExportName = item.exportName
      Object.assign(item, patch)
      if (patch.exportName && this.project?.result?.msh) this.project.result.msh = this.project.result.msh.replaceAll(`"${previousExportName}"`, `"${patch.exportName}"`)
      this.touch(false)
    },
    removeBoundary(id: string) {
      if (!this.project) return
      this.project.boundarySets = this.project.boundarySets.filter(set => set.id !== id)
      this.project.layers = this.project.layers.filter(layer => layer.boundarySetId !== id)
      this.selectedEdgeIds = []
      this.touch(true)
    },
    updateZone(id: string, patch: Partial<MeshCellZone>) {
      const item = this.project?.cellZones.find(zone => zone.id === id)
      if (!item) return
      const previousExportName = item.exportName
      Object.assign(item, patch)
      if (patch.exportName && this.project?.result?.msh) this.project.result.msh = this.project.result.msh.replaceAll(`"${previousExportName}"`, `"${patch.exportName}"`)
      this.touch(false)
    },
    addLayer(boundarySetId: string) {
      if (!this.project || this.project.layers.some(layer => layer.boundarySetId === boundarySetId)) return
      const firstLayer = Math.max(this.project.settings.targetSize / 20, .001), layers = 8, growth = 1.2
      const thickness = firstLayer * (growth ** layers - 1) / (growth - 1)
      const item: MeshLayerControl = { id: modelingId('layer'), boundarySetId, firstLayer, layers, growth, thickness, enabled: true }
      this.project.layers.push(item)
      this.touch(true)
    },
    updateLayer(id: string, patch: Partial<MeshLayerControl>) {
      const item = this.project?.layers.find(layer => layer.id === id)
      if (!item) return
      Object.assign(item, patch)
      if (patch.firstLayer !== undefined || patch.layers !== undefined || patch.growth !== undefined) item.thickness = item.growth === 1 ? item.firstLayer * item.layers : item.firstLayer * (item.growth ** item.layers - 1) / (item.growth - 1)
      this.touch(true)
    },
    addSizeControl() {
      if (!this.project || !this.selectedEdgeIds.length) return
      const index = this.project.sizeControls.length + 1
      this.project.sizeControls.push({ id: modelingId('size'), name: `局部加密 ${index}`, edgeIds: [...this.selectedEdgeIds], targetSize: Math.max(this.project.settings.targetSize / 2, this.project.settings.minSize), influenceDistance: this.project.settings.targetSize * 3, enabled: true })
      this.touch(true)
    },
    updateSizeControl(id: string, patch: Partial<MeshSizeControl>) {
      const item = this.project?.sizeControls.find(control => control.id === id)
      if (!item) return
      Object.assign(item, patch)
      this.touch(true)
    },
    removeSizeControl(id: string) {
      if (!this.project) return
      this.project.sizeControls = this.project.sizeControls.filter(control => control.id !== id)
      this.touch(true)
    },
    async generate() {
      if (!this.project) return false
      this.syncGeometry()
      this.error = ''
      if (this.diagnostics.length) { this.error = this.diagnostics.join('；'); return false }
      this.status = '生成中'
      const version = ++generationVersion
      generationController?.abort()
      const controller = new AbortController()
      generationController = controller
      try {
        const request: MeshGenerationRequest = { edges: this.project.edges, faces: this.project.faces, boundarySets: this.project.boundarySets, cellZones: this.project.cellZones, layers: this.project.layers, sizeControls: this.project.sizeControls, settings: this.project.settings }
        const raw = await $fetch<any>('/api/meshing/generate', { method: 'POST', body: request, signal: controller.signal })
        if (version !== generationVersion) return false
        const assessed = assessMesh(raw.nodes, raw.cells)
        this.project.result = { id: modelingId('mesh-result'), createdAt: new Date().toISOString(), geometryRevision: this.project.sourceRevision, settingsHash: meshSettingsHash(this.project.settings), nodes: raw.nodes, cells: assessed.cells, boundaryElements: raw.boundaryElements, quality: assessed.quality, warnings: raw.warnings ?? [], msh: raw.msh }
        this.status = '已完成'
        this.touch(false)
        return true
      } catch (error: any) {
        if (controller.signal.aborted) { if (version === generationVersion) this.status = '就绪'; return false }
        this.status = '失败'
        this.error = error?.data?.message || error?.statusMessage || error?.message || '网格生成失败'
        return false
      } finally {
        if (generationController === controller) generationController = null
      }
    },
    cancelGenerate() {
      if (this.status !== '生成中') return
      generationVersion += 1
      generationController?.abort()
      generationController = null
      this.status = this.project?.result && !meshProjectDiagnostics(this.project).length ? '已完成' : '就绪'
      this.error = ''
    },
  },
})
