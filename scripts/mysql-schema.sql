-- ============================================================
-- cfdsolve (FlowLab 流研工坊) MySQL 生产库
-- 依据 server/database/schema.ts (version 1) 转换生成
-- MySQL 8.0+ / utf8mb4
-- ============================================================
CREATE DATABASE IF NOT EXISTS cfdsolve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cfdsolve;

-- 1. 用户
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(191) NOT NULL,
  email         VARCHAR(255) NULL,
  username      VARCHAR(255) NOT NULL,
  display_name  VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  status        VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_username (username),
  CONSTRAINT chk_users_status CHECK (status IN ('PENDING_VERIFY','ACTIVE','MUTED','SUSPENDED','DELETED'))
) ENGINE=InnoDB;

-- 2. 角色
CREATE TABLE IF NOT EXISTS roles (
  id   VARCHAR(191) NOT NULL,
  code VARCHAR(64)  NOT NULL,
  name VARCHAR(128) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_code (code)
) ENGINE=InnoDB;

-- 3. 权限
CREATE TABLE IF NOT EXISTS permissions (
  id   VARCHAR(191) NOT NULL,
  code VARCHAR(64)  NOT NULL,
  name VARCHAR(128) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permissions_code (code)
) ENGINE=InnoDB;

-- 4. 用户-角色
CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(191) NOT NULL,
  role_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. 角色-权限
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       VARCHAR(191) NOT NULL,
  permission_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_perm_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. 分类
CREATE TABLE IF NOT EXISTS categories (
  id         VARCHAR(191) NOT NULL,
  parent_id  VARCHAR(191) NULL,
  kind       VARCHAR(32)  NOT NULL,
  slug       VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_kind_slug (kind, slug),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT chk_categories_kind CHECK (kind IN ('knowledge','algorithm','formula'))
) ENGINE=InnoDB;

-- 7. 内容
CREATE TABLE IF NOT EXISTS content_items (
  id           VARCHAR(191) NOT NULL,
  category_id  VARCHAR(191) NULL,
  author_id    VARCHAR(191) NULL,
  kind         VARCHAR(32)  NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  title        VARCHAR(255) NOT NULL,
  summary      TEXT         NOT NULL,
  body_json    LONGTEXT     NOT NULL,
  body_html    LONGTEXT     NOT NULL,
  status       VARCHAR(32)  NOT NULL DEFAULT 'PUBLISHED',
  published_at DATETIME     NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_content_slug (slug),
  KEY idx_content_kind_status (kind, status),
  CONSTRAINT fk_content_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_content_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_content_kind CHECK (kind IN ('article','algorithm')),
  CONSTRAINT chk_content_status CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED'))
) ENGINE=InnoDB;

-- 8. 标签
CREATE TABLE IF NOT EXISTS tags (
  id   VARCHAR(191) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tags_slug (slug),
  UNIQUE KEY uk_tags_name (name)
) ENGINE=InnoDB;

-- 9. 内容-标签
CREATE TABLE IF NOT EXISTS content_tags (
  content_id VARCHAR(191) NOT NULL,
  tag_id     VARCHAR(191) NOT NULL,
  PRIMARY KEY (content_id, tag_id),
  CONSTRAINT fk_content_tags_content FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_content_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. 公式
CREATE TABLE IF NOT EXISTS formulas (
  id           VARCHAR(191) NOT NULL,
  category_id  VARCHAR(191) NULL,
  slug         VARCHAR(255) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  latex        TEXT         NOT NULL,
  unicode_math TEXT         NOT NULL,
  plain_text   TEXT         NOT NULL,
  note         TEXT         NOT NULL,
  assumptions  TEXT         NOT NULL,
  status       VARCHAR(32)  NOT NULL DEFAULT 'PUBLISHED',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_formulas_slug (slug),
  KEY idx_formulas_status_category (status, category_id),
  CONSTRAINT fk_formulas_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT chk_formulas_status CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED'))
) ENGINE=InnoDB;

-- 11. 论坛板块
CREATE TABLE IF NOT EXISTS forum_sections (
  id          VARCHAR(191) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_forum_sections_slug (slug)
) ENGINE=InnoDB;

-- 12. 论坛主题
CREATE TABLE IF NOT EXISTS forum_topics (
  id         VARCHAR(191) NOT NULL,
  section_id VARCHAR(191) NOT NULL,
  author_id  VARCHAR(191) NULL,
  title      VARCHAR(255) NOT NULL,
  status     VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
  views      INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_forum_topics_section_updated (section_id, updated_at DESC),
  CONSTRAINT fk_topics_section FOREIGN KEY (section_id) REFERENCES forum_sections(id) ON DELETE RESTRICT,
  CONSTRAINT fk_topics_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_topics_status CHECK (status IN ('OPEN','RESOLVED','FEATURED','LOCKED','HIDDEN'))
) ENGINE=InnoDB;

-- 13. 论坛回复
CREATE TABLE IF NOT EXISTS forum_posts (
  id         VARCHAR(191) NOT NULL,
  topic_id   VARCHAR(191) NOT NULL,
  author_id  VARCHAR(191) NULL,
  parent_id  VARCHAR(191) NULL,
  body       TEXT         NOT NULL,
  accepted   TINYINT      NOT NULL DEFAULT 0,
  likes      INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_forum_posts_topic_created (topic_id, created_at),
  CONSTRAINT fk_posts_topic FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_posts_parent FOREIGN KEY (parent_id) REFERENCES forum_posts(id) ON DELETE SET NULL,
  CONSTRAINT chk_posts_accepted CHECK (accepted IN (0,1))
) ENGINE=InnoDB;

-- 14. 仿真工具
CREATE TABLE IF NOT EXISTS simulation_tools (
  id          VARCHAR(191) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  status      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tools_slug (slug),
  CONSTRAINT chk_tools_status CHECK (status IN ('DRAFT','ACTIVE','DISABLED'))
) ENGINE=InnoDB;

-- 15. 工具版本
CREATE TABLE IF NOT EXISTS simulation_tool_versions (
  id                 VARCHAR(191) NOT NULL,
  tool_id            VARCHAR(191) NOT NULL,
  version            VARCHAR(64)  NOT NULL,
  input_schema_json  LONGTEXT     NOT NULL,
  result_schema_json LONGTEXT     NOT NULL,
  status             VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tool_versions_tool_version (tool_id, version),
  CONSTRAINT fk_tool_versions_tool FOREIGN KEY (tool_id) REFERENCES simulation_tools(id) ON DELETE CASCADE,
  CONSTRAINT chk_tool_versions_status CHECK (status IN ('DRAFT','ACTIVE','RETIRED'))
) ENGINE=InnoDB;

-- 16. 仿真任务
CREATE TABLE IF NOT EXISTS simulation_tasks (
  id              VARCHAR(191) NOT NULL,
  user_id         VARCHAR(191) NOT NULL,
  tool_id         VARCHAR(191) NOT NULL,
  tool_version_id VARCHAR(191) NULL,
  status          VARCHAR(32)  NOT NULL,
  params_json     LONGTEXT     NOT NULL,
  result_json     LONGTEXT     NULL,
  warnings_json   LONGTEXT     NOT NULL,
  duration_ms     INT          NOT NULL DEFAULT 0,
  error_code      VARCHAR(64)  NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at      DATETIME     NULL,
  finished_at     DATETIME     NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_user_created (user_id, created_at DESC),
  KEY idx_tasks_status_created (status, created_at),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_tool FOREIGN KEY (tool_id) REFERENCES simulation_tools(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_tool_version FOREIGN KEY (tool_version_id) REFERENCES simulation_tool_versions(id) ON DELETE SET NULL,
  CONSTRAINT chk_tasks_status CHECK (status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'))
) ENGINE=InnoDB;

-- 17. Modelica 项目
CREATE TABLE IF NOT EXISTS modelica_projects (
  id           VARCHAR(191) NOT NULL,
  user_id      VARCHAR(191) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  template     VARCHAR(128) NOT NULL DEFAULT 'MassSpringDamper',
  status       VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
  last_compile VARCHAR(32)  NOT NULL DEFAULT '未编译',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_projects_user_slug (user_id, slug),
  KEY idx_projects_user_updated (user_id, updated_at DESC),
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_projects_status CHECK (status IN ('ACTIVE','ARCHIVED')),
  CONSTRAINT chk_projects_last_compile CHECK (last_compile IN ('未编译','成功','有诊断'))
) ENGINE=InnoDB;

-- 18. Modelica 文件
CREATE TABLE IF NOT EXISTS modelica_files (
  id         VARCHAR(191) NOT NULL,
  project_id VARCHAR(191) NOT NULL,
  path       VARCHAR(512) NOT NULL,
  content    LONGTEXT     NOT NULL,
  revision   INT          NOT NULL DEFAULT 1,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_files_project_path (project_id, path),
  CONSTRAINT fk_files_project FOREIGN KEY (project_id) REFERENCES modelica_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. Modelica 快照
CREATE TABLE IF NOT EXISTS modelica_snapshots (
  id           VARCHAR(191) NOT NULL,
  project_id   VARCHAR(191) NOT NULL,
  label        VARCHAR(255) NOT NULL,
  manifest_json LONGTEXT    NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_snapshots_project FOREIGN KEY (project_id) REFERENCES modelica_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 20. 收藏
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id       VARCHAR(191) NOT NULL,
  resource_type VARCHAR(64)  NOT NULL,
  resource_key  VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, resource_type, resource_key),
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. 通知
CREATE TABLE IF NOT EXISTS notifications (
  id         VARCHAR(191) NOT NULL,
  user_id    VARCHAR(191) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT         NOT NULL,
  is_read    TINYINT      NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, is_read, created_at DESC),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_notifications_read CHECK (is_read IN (0,1))
) ENGINE=InnoDB;

-- 22. 公式转换记录
CREATE TABLE IF NOT EXISTS formula_conversions (
  id            VARCHAR(191) NOT NULL,
  user_id       VARCHAR(191) NULL,
  source_text   TEXT         NOT NULL,
  repaired_text TEXT         NOT NULL,
  output_format VARCHAR(64)  NOT NULL,
  output_text   TEXT         NOT NULL,
  confidence    INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_conversions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 23. 系统设置
CREATE TABLE IF NOT EXISTS system_settings (
  `key`       VARCHAR(191) NOT NULL,
  value_json  TEXT         NOT NULL,
  description TEXT         NOT NULL,
  updated_by  VARCHAR(191) NULL,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`),
  CONSTRAINT fk_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 24. 审计日志
CREATE TABLE IF NOT EXISTS audit_logs (
  id            VARCHAR(191) NOT NULL,
  actor_id      VARCHAR(191) NULL,
  action        VARCHAR(128) NOT NULL,
  resource_type VARCHAR(128) NOT NULL,
  resource_id   VARCHAR(191) NULL,
  before_json   LONGTEXT     NULL,
  after_json    LONGTEXT     NULL,
  request_id    VARCHAR(128) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_resource_created (resource_type, resource_id, created_at DESC),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 25. 迁移记录（对应 SQLite schema_migrations）
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INT          NOT NULL,
  name       VARCHAR(255) NOT NULL,
  applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (version)
) ENGINE=InnoDB;
