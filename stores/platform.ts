import { defineStore } from 'pinia'
import type { ModelicaProject, SimulationTask } from '~/types/platform'
import { defaultModelicaCode } from '~/utils/content'

const uid = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
let databaseSyncTimer: ReturnType<typeof setTimeout> | undefined

interface WorkspacePayload {
  database: boolean
  user: { name: string; username: string; role: string }
  bookmarks: string[]
  notifications: Array<{ id: string; title: string; text: string; read: boolean }>
  tasks: SimulationTask[]
  projects: ModelicaProject[]
}

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    ready: false,
    databaseConnected: false,
    databaseError: '',
    user: null as null | { name: string; username: string; role: string },
    bookmarks: [] as string[],
    notifications: [
      { id: 'n1', title: '欢迎使用流研工坊离线版', text: '所有项目、任务和收藏保存在本机浏览器中。', read: false },
      { id: 'n2', title: '方腔流基准案例已更新', text: 'Re=100 的参考中心线数据现已可用。', read: false }
    ],
    tasks: [] as SimulationTask[],
    projects: [] as ModelicaProject[],
    recentSearches: ['SIMPLE', 'y+', 'Modelica 初始化']
  }),
  getters: {
    unread: state => state.notifications.filter(n => !n.read).length,
    activeTasks: state => state.tasks.filter(t => t.status === 'RUNNING' || t.status === 'QUEUED').length
  },
  actions: {
    async init() {
      if (!import.meta.client || this.ready) return
      const raw = localStorage.getItem('flowlab-state-v1')
      if (raw) {
        try {
          const saved = JSON.parse(raw)
          this.user = saved.user ?? null
          this.bookmarks = saved.bookmarks ?? []
          this.notifications = saved.notifications ?? this.notifications
          this.tasks = saved.tasks ?? []
          this.projects = saved.projects ?? []
          this.recentSearches = saved.recentSearches ?? this.recentSearches
        } catch { /* 使用种子数据 */ }
      }
      if (!this.projects.length) {
        this.projects.push({ id: 'demo-project', name: '质量—弹簧—阻尼系统', slug: 'mass-spring-damper', template: 'MassSpringDamper', updatedAt: new Date().toISOString(), code: defaultModelicaCode, status: 'ACTIVE', lastCompile: '成功' })
      }
      this.ready = true
      try {
        const workspace = await $fetch<WorkspacePayload>('/api/workspace')
        this.databaseConnected = workspace.database
        this.databaseError = ''
        this.bookmarks = workspace.bookmarks
        this.notifications = workspace.notifications
        this.tasks = workspace.tasks
        this.projects = workspace.projects
        if (this.user) this.user = workspace.user
        this.saveLocal()
      } catch (error) {
        this.databaseConnected = false
        this.databaseError = error instanceof Error ? error.message : '数据库连接失败'
        this.saveLocal()
      }
    },
    saveLocal() {
      if (!import.meta.client) return
      localStorage.setItem('flowlab-state-v1', JSON.stringify({
        user: this.user, bookmarks: this.bookmarks, notifications: this.notifications,
        tasks: this.tasks, projects: this.projects, recentSearches: this.recentSearches
      }))
    },
    persist() {
      if (!import.meta.client) return
      this.saveLocal()
      clearTimeout(databaseSyncTimer)
      databaseSyncTimer = setTimeout(async () => {
        try {
          await $fetch('/api/workspace', {
            method: 'PUT',
            body: {
              user: this.user,
              bookmarks: this.bookmarks,
              notifications: this.notifications,
              tasks: this.tasks,
              projects: this.projects
            }
          })
          this.databaseConnected = true
          this.databaseError = ''
        } catch (error) {
          this.databaseConnected = false
          this.databaseError = error instanceof Error ? error.message : '数据库同步失败'
        }
      }, 180)
    },
    login(name = '林工程师') {
      this.user = { name, username: 'lin-cfd', role: '注册用户' }
      this.persist()
    },
    updateProfile(name: string) { if (this.user) { this.user.name = name; this.persist() } },
    logout() { this.user = null; this.persist() },
    toggleBookmark(key: string) {
      this.bookmarks = this.bookmarks.includes(key) ? this.bookmarks.filter(v => v !== key) : [...this.bookmarks, key]
      this.persist()
    },
    markAllRead() { this.notifications.forEach(n => n.read = true); this.persist() },
    addTask(payload: Omit<SimulationTask, 'id' | 'createdAt' | 'status' | 'duration'>) {
      const prefix = payload.discipline && payload.discipline !== 'CFD' ? 'CAE-' : 'CFD-'
      const task: SimulationTask = { ...payload, id: uid(prefix).toUpperCase(), createdAt: new Date().toISOString(), status: 'RUNNING', duration: 0 }
      this.tasks.unshift(task); this.persist(); return task
    },
    finishTask(id: string, result: Record<string, unknown>, warnings: string[] = [], duration = 0) {
      const task = this.tasks.find(t => t.id === id)
      if (task) { task.status = 'SUCCEEDED'; task.duration = Math.max(0, Math.round(duration)); task.result = result; task.warnings = warnings; this.persist() }
    },
    failTask(id: string, message: string, duration = 0) { const task = this.tasks.find(t => t.id === id); if (task) { task.status = 'FAILED'; task.duration = Math.max(0, Math.round(duration)); task.warnings = [message]; this.persist() } },
    cancelTask(id: string) { const task = this.tasks.find(t => t.id === id); if (task) { task.status = 'CANCELLED'; this.persist() } },
    createProject(name: string, template = 'MassSpringDamper') {
      const project: ModelicaProject = { id: uid('MDL-'), name, slug: name.toLowerCase().replace(/\s+/g, '-'), template, updatedAt: new Date().toISOString(), code: defaultModelicaCode.replaceAll('MassSpringDamper', template), status: 'ACTIVE', lastCompile: '未编译' }
      this.projects.unshift(project); this.persist(); return project
    },
    saveProject(id: string, code: string) { const p = this.projects.find(x => x.id === id); if (p) { p.code = code; p.updatedAt = new Date().toISOString(); this.persist() } },
    deleteProject(id: string) { this.projects = this.projects.filter(x => x.id !== id); this.persist() }
  }
})
