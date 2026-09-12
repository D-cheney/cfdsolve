import { defineStore } from "pinia";
import type {
  ModelicaExperiment,
  ModelicaProject,
  ModelicaRun,
  SimulationTask,
} from "~/types/platform";
import { defaultModelicaCode, getModelicaTemplate } from "~/utils/content";
import {
  defaultModelicaDiagram,
  defaultModelicaExperiment,
} from "~/utils/modelica/workbench";

const uid = (prefix = "") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
let databaseSyncTimer: ReturnType<typeof setTimeout> | undefined;
type WorkspaceSection =
  "user" | "bookmarks" | "notifications" | "tasks" | "projects";
const pendingWorkspaceSections = new Set<WorkspaceSection>();

interface WorkspacePayload {
  database: boolean;
  user: { name: string; username: string; role: string };
  bookmarks: string[];
  notifications: Array<{
    id: string;
    title: string;
    text: string;
    read: boolean;
  }>;
  tasks: SimulationTask[];
  projects: ModelicaProject[];
}

function normalizeProject(project: ModelicaProject): ModelicaProject {
  const template = getModelicaTemplate(project.template);
  return {
    ...project,
    code: project.code || template.source,
    experiment: {
      ...defaultModelicaExperiment(),
      ...(project.experiment ?? {}),
    },
    runs: Array.isArray(project.runs) ? project.runs.slice(0, 12) : [],
    diagram: project.diagram ?? defaultModelicaDiagram(project.template),
    algorithms: Array.isArray(project.algorithms) ? project.algorithms : [],
  };
}

function mergeProjects(local: ModelicaProject[], remote: ModelicaProject[]) {
  const merged = new Map(
    remote.map((item) => [item.id, normalizeProject(item)]),
  );
  for (const item of local) {
    const remoteItem = merged.get(item.id);
    if (
      !remoteItem ||
      Date.parse(item.updatedAt) >= Date.parse(remoteItem.updatedAt)
    )
      merged.set(item.id, normalizeProject(item));
  }
  return [...merged.values()].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

function mergeTasks(local: SimulationTask[], remote: SimulationTask[]) {
  const terminal = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);
  const merged = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) {
    const remoteItem = merged.get(item.id);
    if (
      !remoteItem ||
      terminal.has(item.status) ||
      !terminal.has(remoteItem.status)
    )
      merged.set(item.id, item);
  }
  return [...merged.values()].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export const usePlatformStore = defineStore("platform", {
  state: () => ({
    ready: false,
    databaseConnected: false,
    databaseError: "",
    user: null as null | { name: string; username: string; role: string },
    bookmarks: [] as string[],
    notifications: [
      {
        id: "n1",
        title: "欢迎使用CFD菜鸟离线版",
        text: "所有项目、任务和收藏保存在本机浏览器中。",
        read: false,
      },
      {
        id: "n2",
        title: "方腔流基准案例已更新",
        text: "Re=100 的参考中心线数据现已可用。",
        read: false,
      },
    ],
    tasks: [] as SimulationTask[],
    projects: [] as ModelicaProject[],
    recentSearches: ["SIMPLE", "y+", "Modelica 初始化"],
  }),
  getters: {
    unread: (state) => state.notifications.filter((n) => !n.read).length,
    activeTasks: (state) =>
      state.tasks.filter((t) => t.status === "RUNNING" || t.status === "QUEUED")
        .length,
  },
  actions: {
    async init() {
      if (!import.meta.client || this.ready) return;
      let raw: string | null = null;
      try {
        raw = localStorage.getItem("flowlab-state-v1");
      } catch (error) {
        this.databaseError =
          error instanceof Error
            ? `浏览器缓存不可用：${error.message}`
            : "浏览器缓存不可用";
      }
      const hadLocalState = Boolean(raw);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          this.user = saved.user ?? null;
          this.bookmarks = saved.bookmarks ?? [];
          this.notifications = saved.notifications ?? this.notifications;
          this.tasks = saved.tasks ?? [];
          this.projects = (saved.projects ?? []).map(normalizeProject);
          this.recentSearches = saved.recentSearches ?? this.recentSearches;
        } catch {
          /* 使用种子数据 */
        }
      }
      if (!this.projects.length) {
        this.projects.push(
          normalizeProject({
            id: "demo-project",
            name: "质量—弹簧—阻尼系统",
            slug: "mass-spring-damper",
            template: "MassSpringDamper",
            updatedAt: new Date().toISOString(),
            code: defaultModelicaCode,
            status: "ACTIVE",
            lastCompile: "成功",
          }),
        );
      }
      this.ready = true;
      try {
        const workspace = await $fetch<WorkspacePayload>("/api/workspace");
        this.databaseConnected = workspace.database;
        this.databaseError = "";
        this.bookmarks = hadLocalState
          ? [...new Set([...workspace.bookmarks, ...this.bookmarks])]
          : workspace.bookmarks;
        if (hadLocalState) {
          const localNotifications = new Map(
            this.notifications.map((item) => [item.id, item]),
          );
          this.notifications = workspace.notifications.map((item) => ({
            ...item,
            read: item.read || Boolean(localNotifications.get(item.id)?.read),
          }));
        } else this.notifications = workspace.notifications;
        this.tasks = mergeTasks(this.tasks, workspace.tasks);
        this.projects = mergeProjects(this.projects, workspace.projects);
        if (this.user) this.user = workspace.user;
        if (hadLocalState) this.persist();
        else this.saveLocal();
      } catch (error) {
        this.databaseConnected = false;
        this.databaseError =
          error instanceof Error ? error.message : "数据库连接失败";
        this.saveLocal();
      }
    },
    saveLocal() {
      if (!import.meta.client) return;
      try {
        localStorage.setItem(
          "flowlab-state-v1",
          JSON.stringify({
            user: this.user,
            bookmarks: this.bookmarks,
            notifications: this.notifications,
            tasks: this.tasks,
            projects: this.projects,
            recentSearches: this.recentSearches,
          }),
        );
      } catch (error) {
        this.databaseError =
          error instanceof Error
            ? `浏览器本地存储失败：${error.message}`
            : "浏览器本地存储失败";
      }
    },
    persist(
      sections: WorkspaceSection[] = [
        "user",
        "bookmarks",
        "notifications",
        "tasks",
        "projects",
      ],
    ) {
      if (!import.meta.client) return;
      this.saveLocal();
      sections.forEach((section) => pendingWorkspaceSections.add(section));
      if (!pendingWorkspaceSections.size) return;
      clearTimeout(databaseSyncTimer);
      databaseSyncTimer = setTimeout(async () => {
        const requested = new Set(pendingWorkspaceSections);
        pendingWorkspaceSections.clear();
        const body: Record<string, unknown> = {};
        if (requested.has("user")) body.user = this.user;
        if (requested.has("bookmarks")) body.bookmarks = this.bookmarks;
        if (requested.has("notifications"))
          body.notifications = this.notifications;
        if (requested.has("tasks")) body.tasks = this.tasks;
        if (requested.has("projects")) body.projects = this.projects;
        try {
          await $fetch("/api/workspace", {
            method: "PUT",
            body,
          });
          this.databaseConnected = true;
          this.databaseError = "";
        } catch (error) {
          this.databaseConnected = false;
          this.databaseError =
            error instanceof Error ? error.message : "数据库同步失败";
        }
      }, 180);
    },
    login(name = "林工程师") {
      this.user = { name, username: "lin-cfd", role: "注册用户" };
      this.persist(["user"]);
    },
    logout() {
      this.user = null;
      this.saveLocal();
    },
    toggleBookmark(key: string) {
      this.bookmarks = this.bookmarks.includes(key)
        ? this.bookmarks.filter((v) => v !== key)
        : [...this.bookmarks, key];
      this.persist(["bookmarks"]);
    },
    markAllRead() {
      this.notifications.forEach((n) => (n.read = true));
      this.persist(["notifications"]);
    },
    addTask(
      payload: Omit<SimulationTask, "id" | "createdAt" | "status" | "duration">,
    ) {
      const task: SimulationTask = {
        ...payload,
        id: uid("CFD-").toUpperCase(),
        createdAt: new Date().toISOString(),
        status: "RUNNING",
        duration: 0,
      };
      this.tasks.unshift(task);
      this.persist(["tasks"]);
      return task;
    },
    finishTask(
      id: string,
      result: Record<string, unknown>,
      warnings: string[] = [],
      duration?: number,
      status: "SUCCEEDED" | "FAILED" = "SUCCEEDED",
    ) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.status = status;
        task.duration = Math.max(0, Math.round(duration ?? 0));
        task.result = result;
        task.warnings = warnings;
        this.persist(["tasks"]);
      }
    },
    cancelTask(id: string) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.status = "CANCELLED";
        this.persist(["tasks"]);
      }
    },
    createProject(name: string, template = "MassSpringDamper") {
      const selected = getModelicaTemplate(template);
      const id = uid("MDL-");
      const baseSlug =
        name
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-|-$/g, "") || "modelica-project";
      const project: ModelicaProject = {
        id,
        name: name.trim(),
        slug: `${baseSlug}-${id.slice(-6).toLowerCase()}`,
        template: selected.class,
        updatedAt: new Date().toISOString(),
        code: selected.source,
        status: "ACTIVE",
        lastCompile: "未编译",
        experiment: defaultModelicaExperiment(),
        runs: [],
        diagram: defaultModelicaDiagram(selected.class),
        algorithms: [],
      };
      this.projects.unshift(project);
      this.persist(["projects"]);
      return project;
    },
    saveProject(id: string, code: string, experiment?: ModelicaExperiment) {
      const p = this.projects.find((x) => x.id === id);
      if (p) {
        p.code = code;
        if (experiment) p.experiment = { ...experiment };
        p.updatedAt = new Date().toISOString();
        this.persist(["projects"]);
      }
    },
    addModelicaRun(id: string, run: ModelicaRun) {
      const p = this.projects.find((x) => x.id === id);
      if (!p) return;
      p.runs = [
        run,
        ...(p.runs ?? []).filter((item) => item.id !== run.id),
      ].slice(0, 12);
      p.lastCompile = run.status === "SUCCEEDED" ? "成功" : "有诊断";
      p.updatedAt = new Date().toISOString();
      this.persist(["projects"]);
    },
    saveModelicaDesign(
      id: string,
      diagram: ModelicaProject["diagram"],
      algorithms: ModelicaProject["algorithms"],
    ) {
      const p = this.projects.find((x) => x.id === id);
      if (!p) return;
      p.diagram = diagram;
      p.algorithms = algorithms;
      p.updatedAt = new Date().toISOString();
      this.persist(["projects"]);
    },
  },
});
