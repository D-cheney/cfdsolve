export interface DatabaseMigration {
  version: number
  name: string
  statements: string[]
}

export const databaseMigrations: DatabaseMigration[] = [
  {
    version: 1,
    name: 'initial_platform_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING_VERIFY','ACTIVE','MUTED','SUSPENDED','DELETED')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS user_roles (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )`,
      `CREATE TABLE IF NOT EXISTS role_permissions (
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )`,
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        kind TEXT NOT NULL CHECK (kind IN ('knowledge','algorithm','formula')),
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (kind, slug)
      )`,
      `CREATE TABLE IF NOT EXISTS content_items (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        kind TEXT NOT NULL CHECK (kind IN ('article','algorithm')),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL DEFAULT '',
        body_json TEXT NOT NULL DEFAULT '{}',
        body_html TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL UNIQUE
      )`,
      `CREATE TABLE IF NOT EXISTS content_tags (
        content_id TEXT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (content_id, tag_id)
      )`,
      `CREATE TABLE IF NOT EXISTS formulas (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        latex TEXT NOT NULL,
        unicode_math TEXT NOT NULL,
        plain_text TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        assumptions TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS forum_sections (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS forum_topics (
        id TEXT PRIMARY KEY,
        section_id TEXT NOT NULL REFERENCES forum_sections(id) ON DELETE RESTRICT,
        author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','RESOLVED','FEATURED','LOCKED','HIDDEN')),
        views INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS forum_posts (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
        author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        parent_id TEXT REFERENCES forum_posts(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        accepted INTEGER NOT NULL DEFAULT 0 CHECK (accepted IN (0,1)),
        likes INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS simulation_tools (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT','ACTIVE','DISABLED'))
      )`,
      `CREATE TABLE IF NOT EXISTS simulation_tool_versions (
        id TEXT PRIMARY KEY,
        tool_id TEXT NOT NULL REFERENCES simulation_tools(id) ON DELETE CASCADE,
        version TEXT NOT NULL,
        input_schema_json TEXT NOT NULL DEFAULT '{}',
        result_schema_json TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT','ACTIVE','RETIRED')),
        UNIQUE (tool_id, version)
      )`,
      `CREATE TABLE IF NOT EXISTS simulation_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tool_id TEXT NOT NULL REFERENCES simulation_tools(id) ON DELETE RESTRICT,
        tool_version_id TEXT REFERENCES simulation_tool_versions(id) ON DELETE SET NULL,
        status TEXT NOT NULL CHECK (status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED')),
        params_json TEXT NOT NULL DEFAULT '{}',
        result_json TEXT,
        warnings_json TEXT NOT NULL DEFAULT '[]',
        duration_ms INTEGER NOT NULL DEFAULT 0,
        error_code TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        started_at TEXT,
        finished_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS modelica_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        template TEXT NOT NULL DEFAULT 'MassSpringDamper',
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
        last_compile TEXT NOT NULL DEFAULT '未编译' CHECK (last_compile IN ('未编译','成功','有诊断')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, slug)
      )`,
      `CREATE TABLE IF NOT EXISTS modelica_files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES modelica_projects(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        revision INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, path)
      )`,
      `CREATE TABLE IF NOT EXISTS modelica_snapshots (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES modelica_projects(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        manifest_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS bookmarks (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        resource_type TEXT NOT NULL,
        resource_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, resource_type, resource_key)
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0,1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS formula_conversions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        source_text TEXT NOT NULL,
        repaired_text TEXT NOT NULL,
        output_format TEXT NOT NULL,
        output_text TEXT NOT NULL,
        confidence INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        before_json TEXT,
        after_json TEXT,
        request_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_content_items_kind_status ON content_items(kind, status)`,
      `CREATE INDEX IF NOT EXISTS idx_formulas_status_category ON formulas(status, category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_forum_topics_section_updated ON forum_topics(section_id, updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_created ON forum_posts(topic_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_simulation_tasks_user_created ON simulation_tasks(user_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_simulation_tasks_status_created ON simulation_tasks(status, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_modelica_projects_user_updated ON modelica_projects(user_id, updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_created ON audit_logs(resource_type, resource_id, created_at DESC)`
    ]
  },
  {
    version: 2,
    name: 'add_cae_solver_catalog',
    statements: [
      `INSERT OR IGNORE INTO simulation_tools (id, slug, name, description, status) VALUES
        ('tool-cae-bar', 'axial-bar', '轴向杆静力分析', '一维杆单元有限元、反力与平衡校核', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tools (id, slug, name, description, status) VALUES
        ('tool-cae-beam', 'cantilever-beam', '悬臂梁弯曲分析', 'Euler-Bernoulli 梁单元与解析解校核', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tools (id, slug, name, description, status) VALUES
        ('tool-cae-heat', 'heat-plate', '二维稳态热传导', '规则网格热传导、热流和能量平衡', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tools (id, slug, name, description, status) VALUES
        ('tool-cae-modal', 'sdof-modal', '单自由度模态分析', '质量刚度广义特征值与模态残差', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tool_versions (id, tool_id, version, input_schema_json, result_schema_json, status) VALUES
        ('tool-cae-bar-v1', 'tool-cae-bar', '1.0.0', '{"required":["length","area","elasticModulus","elements","endLoad"]}', '{"checks":["equilibrium","analytical-reference"]}', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tool_versions (id, tool_id, version, input_schema_json, result_schema_json, status) VALUES
        ('tool-cae-beam-v1', 'tool-cae-beam', '1.0.0', '{"required":["length","elasticModulus","secondMoment","elements"]}', '{"checks":["force-moment-equilibrium","analytical-reference"]}', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tool_versions (id, tool_id, version, input_schema_json, result_schema_json, status) VALUES
        ('tool-cae-heat-v1', 'tool-cae-heat', '1.0.0', '{"required":["width","height","conductivity","nx","ny"]}', '{"checks":["convergence","energy-balance"]}', 'ACTIVE')`,
      `INSERT OR IGNORE INTO simulation_tool_versions (id, tool_id, version, input_schema_json, result_schema_json, status) VALUES
        ('tool-cae-modal-v1', 'tool-cae-modal', '1.0.0', '{"required":["mass","stiffness"]}', '{"checks":["modal-residual","mass-orthogonality"]}', 'ACTIVE')`
    ]
  },
  {
    version: 3,
    name: 'knowledge_assets',
    statements: [
      `CREATE TABLE IF NOT EXISTS knowledge_assets (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        file_key TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
        file_size INTEGER NOT NULL DEFAULT 0,
        file_sha256 TEXT NOT NULL DEFAULT '',
        url_path TEXT NOT NULL,
        is_external INTEGER NOT NULL DEFAULT 0,
        alt_text TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (content_id, file_key)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_knowledge_assets_content ON knowledge_assets(content_id)`
    ]
  }
]

export const defaultModelicaSource = `within Examples;
model MassSpringDamper
  parameter Real m(unit="kg") = 1.0;
  parameter Real k(unit="N/m") = 100.0;
  parameter Real c(unit="N.s/m") = 0.5;
  Real x(start=0.1, unit="m");
  Real v(start=0, unit="m/s");
equation
  der(x) = v;
  m * der(v) + c * v + k * x = 0;
end MassSpringDamper;`

export const seedData = {
  roles: [
    ['role-user', 'REGISTERED_USER', '注册用户'],
    ['role-editor', 'CONTENT_EDITOR', '内容编辑'],
    ['role-moderator', 'MODERATOR', '版主'],
    ['role-admin', 'ADMIN', '管理员']
  ],
  permissions: [
    ['perm-content-read', 'content.read', '浏览公开内容'],
    ['perm-simulation-run', 'simulation.run', '提交仿真任务'],
    ['perm-project-write', 'modelica.project.write', '管理自己的 Modelica 项目'],
    ['perm-forum-write', 'forum.write', '发布帖子与回复'],
    ['perm-admin', 'admin.manage', '管理平台']
  ],
  categories: [
    ['cat-physics', null, 'knowledge', 'physics', '流体力学基础', 10],
    ['cat-equations', null, 'knowledge', 'governing-equations', '控制方程与物理建模', 20],
    ['cat-numerics', null, 'algorithm', 'numerics', '数值离散方法', 30],
    ['cat-dimensionless', null, 'formula', 'dimensionless', '无量纲数', 10],
    ['cat-control', null, 'formula', 'control-equations', '控制方程', 20],
    ['cat-turbulence', null, 'formula', 'turbulence', '湍流', 30],
    ['cat-stability', null, 'formula', 'numerical-stability', '数值稳定性', 40]
  ],
  formulas: [
    ['formula-reynolds', 'cat-dimensionless', 'reynolds-number', '雷诺数', 'Re = \\rho U L / \\mu', 'Re = ρUL/μ', 'Re = ρUL/μ', '惯性力与黏性力之比'],
    ['formula-peclet', 'cat-dimensionless', 'peclet-number', 'Péclet 数', 'Pe = uL / \\alpha', 'Pe = uL/α', 'Pe = uL/α', '对流输运与扩散输运之比'],
    ['formula-continuity', 'cat-control', 'continuity-equation', '连续性方程', '\\nabla \\cdot \\mathbf{u}=0', '∇·u = 0', '∇·u = 0', '不可压缩流质量守恒'],
    ['formula-friction-velocity', 'cat-turbulence', 'friction-velocity', '壁面摩擦速度', 'u_\\tau = \\sqrt{\\tau_w/\\rho}', 'u_τ = √(τ_w/ρ)', 'uτ = √(τw/ρ)', '近壁面尺度的基础量'],
    ['formula-cfl', 'cat-stability', 'cfl-number', 'CFL 数', 'C = u\\Delta t/\\Delta x', 'C = uΔt/Δx', 'C = uΔt/Δx', '时间推进与网格尺度关系']
  ],
  forumSections: [
    ['section-theory', 'theory', '理论与算法', '控制方程、离散方法与求解器讨论', 10],
    ['section-cases', 'cases', '工程案例', '可复现的工程计算案例', 20],
    ['section-modelica', 'modelica', 'Modelica', '建模、编译与动态仿真', 30],
    ['section-materials', 'papers', '论文与资料', '公开资料与验证方法', 40]
  ],
  tools: [
    ['tool-convection', 'convection-diffusion', '一维对流—扩散', '比较迎风与中心差分，观察 Péclet 数的影响'],
    ['tool-cavity', 'lid-driven-cavity', '方腔顶盖驱动流', '演示 SIMPLE 压力—速度耦合和残差收敛'],
    ['tool-pipe', 'pipe-flow', '圆管充分发展层流', '计算速度剖面、流量、压降和摩擦因子'],
    ['tool-turbulence', 'turbulence-compare', '湍流与近壁参数对比', '估算湍流参数并比较常见 RANS 模型']
  ],
  settings: [
    ['site.registration_enabled', 'true', '是否开放注册'],
    ['site.content_review_enabled', 'true', '内容是否需要审核'],
    ['simulation.daily_task_limit', '20', '每用户每日任务上限'],
    ['simulation.concurrent_task_limit', '2', '并发任务上限'],
    ['simulation.result_retention_days', '90', '结果保留天数'],
    ['modelica.compiler_default_version', '"1.0.0"', '默认编译器版本'],
    ['modelica.language_profile', '"PlatformModelica-1.0"', '默认语言子集'],
    ['modelica.project_limit', '20', '每用户活动项目数'],
    ['modelica.compile_timeout_seconds', '120', '编译超时秒数'],
    ['modelica.simulation_timeout_seconds', '300', '仿真超时秒数'],
    ['modelica.max_flat_equations', '50000', '最大扁平方程数'],
    ['modelica.max_result_mb', '200', '单次结果大小上限'],
    ['forum.new_user_post_cooldown_hours', '1', '新用户发帖冷却小时'],
    ['forum.report_sla_hours', '24', '举报处理目标小时']
  ]
} as const
