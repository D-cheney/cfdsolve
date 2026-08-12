// 迁移 cfdsolve SQLite 数据 → MySQL（生成 SQL 文件，再由 mysql CLI 导入）
// 用法: node scripts/migrate-sqlite-to-mysql.mjs [--out /tmp/cfdsolve-data.sql]
import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'

const DB_PATH = process.env.CFDSOLVE_DB_PATH || './data/cfdsolve.sqlite'
const OUT = process.argv.find(a => a.startsWith('--out='))?.slice(6) || '/tmp/cfdsolve-data.sql'

const db = new DatabaseSync(DB_PATH)
// 除 schema_migrations 外全部迁移（migrations 单独按最新版本写一条）
const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'schema_migrations' ORDER BY name"
).all().map(r => r.name)

function esc(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  let s = repairMojibake(String(v))
  // ISO 8601 → MySQL DATETIME: 2026-08-04T00:00:00.000Z → 2026-08-04 00:00:00
  s = s.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?Z?$/, '$1 $2')
  s = s.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  return "'" + s + "'"
}

// 修复双重编码乱码：UTF-8 字节被当作 Latin-1 存入，形如 "æå·¥ç¨å¸" → "林工程师"
function repairMojibake(s) {
  if (!s || !/[\u0080-\u00FF\u20AC\u2013-\u2026]/.test(s)) return s
  // 若包含 >U+00FF 的真实字符（如正常中文），说明不是整串乱码，跳过
  let hasWide = false
  for (const ch of s) {
    const cp = ch.codePointAt(0)
    if (cp > 0xFF && !(cp >= 0x2013 && cp <= 0x2026) && cp !== 0x20AC) { hasWide = true; break }
  }
  if (hasWide) return s
  try {
    const fixed = Buffer.from(s, 'latin1').toString('utf8')
    if (/[\u4E00-\u9FFF]/.test(fixed) && !fixed.includes('\uFFFD')) return fixed
  } catch {}
  return s
}

const lines = []
lines.push('USE cfdsolve;')
lines.push('SET NAMES utf8mb4;')
lines.push('SET FOREIGN_KEY_CHECKS = 0;')

for (const t of tables) {
  const rows = db.prepare(`SELECT * FROM "${t}"`).all()
  if (rows.length === 0) continue
  const cols = Object.keys(rows[0])
  lines.push(`-- ${t}: ${rows.length} 行`)
  const colList = cols.map(c => '`' + c + '`').join(', ')
  for (const r of rows) {
    const vals = cols.map(c => esc(r[c])).join(', ')
    lines.push(`INSERT INTO \`${t}\` (${colList}) VALUES (${vals});`)
  }
}

// schema_migrations: 同步 SQLite 里的版本记录
const migs = db.prepare('SELECT version, name, applied_at FROM schema_migrations ORDER BY version').all()
if (migs.length) {
  lines.push('-- schema_migrations')
  for (const m of migs) {
    lines.push(`INSERT INTO \`schema_migrations\` (\`version\`, \`name\`, \`applied_at\`) VALUES (${esc(m.version)}, ${esc(m.name)}, ${esc(m.applied_at)});`)
  }
} else {
  lines.push(`INSERT INTO \`schema_migrations\` (\`version\`, \`name\`) VALUES (1, 'initial_platform_schema');`)
}

lines.push('SET FOREIGN_KEY_CHECKS = 1;')
writeFileSync(OUT, lines.join('\n') + '\n')
console.log(`已生成: ${OUT} (${lines.length} 行)`)
console.log('表数:', tables.length)
