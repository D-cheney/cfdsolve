# 知识库文章模板格式

## 文件规则

- 编码：UTF-8；
- 扩展名：`.md`；
- 结构：YAML Front Matter + Markdown 正文；
- 模板版本：`flowlab-knowledge/1.0`；
- 文件名建议与 `slug` 一致，例如 `finite-volume-method.md`；
- `KNOWLEDGE_ARTICLE.template.md` 只用于复制，不会被目录批量导入。

## 数学公式格式

- 行内公式使用单美元符号，例如 `$Re = \rho U L / \mu$`；
- 独立公式使用成对的 `$$`，开始和结束标记各占一行；
- 公式内容使用标准 LaTeX 数学命令，不要粘贴 MathType 的私有控制字符；
- 导入器使用 KaTeX 严格解析每个公式，括号、环境或命令错误会阻止写入数据库；
- 渲染时固定 `trust: false`，不允许公式执行 HTML、URL 或扩展命令。

示例：

```markdown
动量方程的弱式写为 $a(u,v)=l(v)$。

$$
K_{ij}=\int_{\Omega} B_i^T D B_j\,d\Omega
$$
```

## 必填字段

| 字段 | 类型 | 规则 |
|---|---|---|
| `template_version` | string | 必须为 `flowlab-knowledge/1.0` |
| `slug` | string | 小写英文字母、数字、连字符；1～120 字符；全站唯一 |
| `title` | string | 3～200 字符 |
| `summary` | string | 10～500 字符 |
| `category.slug` | string | 与文章 slug 相同的字符规则 |
| `category.name` | string | 1～80 字符；分类不存在时自动创建 |
| `level` | string | `入门`、`进阶`、`工程`、`专题`、`源码参考` |
| `reading_minutes` | integer | 1～240 |
| `status` | string | `DRAFT`、`REVIEW`、`PUBLISHED`、`ARCHIVED` |

## 可选字段

| 字段 | 规则 |
|---|---|
| `id` | 稳定内容 ID；只允许字母、数字、点、下划线、连字符 |
| `author_username` | 必须是数据库中已有用户，默认 `lin-cfd` |
| `published_at` | ISO 8601 时间；发布状态留空时自动写当前时间 |
| `tags` | 最多 20 个，去重后写入标签关系表 |
| `seo.title` | 最多 200 字符 |
| `seo.description` | 最多 300 字符，默认使用 summary |
| `seo.keywords` | 最多 20 个字符串 |

## 导入行为

1. 导入前完整校验 Front Matter 和正文；
2. Markdown 和 LaTeX 数学公式在服务端转换为 HTML/MathML；
3. 原生 HTML默认禁用，渲染结果再经过白名单清理；
4. 分类不存在时自动创建；
5. 标签自动创建并重建文章标签关系；
6. 相同 `slug` 再次导入时更新原记录，不创建副本；
7. 数据库写入使用事务，失败自动回滚；
8. 每次成功导入写入 `audit_logs`；
9. 原始 Markdown、标题目录、SEO 和来源文件保存在 `body_json`；
10. 清理后的 HTML 保存在 `body_html`。
11. 任一数学表达式无法通过 KaTeX 解析时，整篇文章拒绝导入并报告公式片段。

## 使用方法

复制模板：

```powershell
Copy-Item templates\knowledge\KNOWLEDGE_ARTICLE.template.md templates\knowledge\my-article.md
```

只校验不写库：

```powershell
npm run knowledge:validate -- templates\knowledge\my-article.md
```

导入单个文件：

```powershell
npm run knowledge:import -- templates\knowledge\my-article.md
```

批量导入目录：

```powershell
npm run knowledge:import -- templates\knowledge\examples
```

完整知识库文章位于 `templates/knowledge/library`，总索引见 `templates/knowledge/library/README.md`：

```powershell
npm run knowledge:validate -- templates\knowledge\library
npm run knowledge:import -- templates\knowledge\library
```

全量知识库统一校验与同步：

```powershell
npm run knowledge:validate -- templates\knowledge
npm run knowledge:sync
```

导入程序会忽略不含标准 Front Matter 的导航、索引和生成报告。全量同步先解析全部文章，再使用单个事务写入数据库，任何写入错误都会回滚本次批次。
