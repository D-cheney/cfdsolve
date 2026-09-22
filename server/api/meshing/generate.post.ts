import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MeshGenerationRequest } from '~/types/meshing'

const MAX_BODY_BYTES = 50 * 1024 * 1024
const MAX_OUTPUT_BYTES = 80 * 1024 * 1024
const MAX_NODES = 600_000
const MAX_CELLS = 1_000_000

function resolveMeshingRuntime() {
  const configured = process.env.CFDSOLVE_MESHING_SCRIPT
  const candidates = [
    configured && resolve(configured),
    resolve(process.cwd(), 'services', 'meshing', 'generate_mesh.py'),
    resolve(process.cwd(), '.output', 'server', 'meshing', 'generate_mesh.py'),
    resolve(process.cwd(), 'server', 'meshing', 'generate_mesh.py'),
    resolve(process.cwd(), 'meshing', 'generate_mesh.py'),
  ].filter((candidate): candidate is string => Boolean(candidate))
  const script = candidates.find(candidate => existsSync(candidate))
  if (!script) throw createError({ statusCode: 500, statusMessage: '未找到网格生成内核，请检查部署构建产物' })

  const configuredPython = process.env.CFDSOLVE_PYTHON_BIN?.trim()
  const command = configuredPython || (process.platform === 'win32' ? 'py' : 'python3')
  const args = !configuredPython && process.platform === 'win32' ? ['-3', script] : [script]
  return { script, command, args }
}

function validate(input: MeshGenerationRequest) {
  if (!input || !Array.isArray(input.edges) || !Array.isArray(input.faces)) throw createError({ statusCode: 400, statusMessage: '网格请求格式不正确' })
  if (!input.edges.length || !input.faces.length) throw createError({ statusCode: 400, statusMessage: '没有可划分的边或面域' })
  if (input.edges.length > 20_000 || input.faces.length > 1_000) throw createError({ statusCode: 413, statusMessage: '几何数量超过网格任务上限' })
  for (const edge of input.edges) {
    if (!edge.id || edge.points.length < 2 || edge.points.length > 10_000) throw createError({ statusCode: 400, statusMessage: `边 ${edge.id || '未知'} 数据无效` })
    if (edge.points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) throw createError({ statusCode: 400, statusMessage: `边 ${edge.id} 含非法坐标` })
  }
  const settings = input.settings
  if (!settings || !['tri', 'quad-dominant', 'mapped-quad'].includes(settings.method)) throw createError({ statusCode: 400, statusMessage: '网格方法无效' })
  if (!Number.isFinite(settings.targetSize) || settings.targetSize <= 0) throw createError({ statusCode: 400, statusMessage: '目标尺寸必须大于 0' })
  if (!Number.isFinite(settings.minSize) || !Number.isFinite(settings.maxSize) || settings.minSize <= 0 || settings.maxSize < settings.minSize) throw createError({ statusCode: 400, statusMessage: '最小／最大尺寸设置无效' })
  const edgeIds = new Set(input.edges.map(edge => edge.id))
  const faceIds = new Set(input.faces.map(face => face.id))
  if (input.faces.some(face => [...face.outerEdgeIds, ...face.holeEdgeIds.flat()].some(id => !edgeIds.has(id)))) throw createError({ statusCode: 400, statusMessage: '面域引用了不存在的几何边' })
  if (input.boundarySets.some(set => set.edgeIds.some(id => !edgeIds.has(id)))) throw createError({ statusCode: 400, statusMessage: '边界组引用了不存在的几何边' })
  if (input.cellZones.some(zone => zone.faceIds.some(id => !faceIds.has(id)))) throw createError({ statusCode: 400, statusMessage: '面域组引用了不存在的面域' })
  const exportNames = [...input.boundarySets.map(item => item.exportName), ...input.cellZones.map(item => item.exportName)]
  if (exportNames.some(name => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) || new Set(exportNames).size !== exportNames.length) throw createError({ statusCode: 400, statusMessage: '导出名称无效或重复' })
}

export default defineEventHandler(async (event) => {
  const input = await readBody<MeshGenerationRequest>(event)
  validate(input)
  const serialized = JSON.stringify(input)
  if (Buffer.byteLength(serialized) > MAX_BODY_BYTES) throw createError({ statusCode: 413, statusMessage: '网格请求超过 50 MiB' })
  const { command, args } = resolveMeshingRuntime()
  return await new Promise((resolveRequest, rejectRequest) => {
    const child = spawn(command, args, { cwd: process.cwd(), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    let output = '', errorOutput = '', killed = false
    const abortTask = () => { if (!killed) { killed = true; child.kill(); rejectRequest(createError({ statusCode: 499, statusMessage: '网格任务已取消' })) } }
    event.node.req.once('aborted', abortTask)
    const timeout = setTimeout(() => { killed = true; child.kill(); rejectRequest(createError({ statusCode: 504, statusMessage: '网格生成超过 120 秒，任务已停止' })) }, 120_000)
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', chunk => { output += chunk; if (Buffer.byteLength(output) > MAX_OUTPUT_BYTES) { killed = true; child.kill(); rejectRequest(createError({ statusCode: 413, statusMessage: '网格结果超过大小上限' })) } })
    child.stderr.on('data', chunk => { errorOutput += chunk })
    child.on('error', error => { clearTimeout(timeout); if (!killed) rejectRequest(createError({ statusCode: 500, statusMessage: `无法启动网格内核：${error.message}` })) })
    child.on('close', code => {
      clearTimeout(timeout)
      event.node.req.off('aborted', abortTask)
      if (killed) return
      try {
        const parsed = JSON.parse(output.trim().split(/\r?\n/).at(-1) || '{}')
        if (code !== 0 || !parsed.ok) rejectRequest(createError({ statusCode: 422, statusMessage: parsed.message || errorOutput.trim() || '网格生成失败' }))
        else if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.cells) || parsed.nodes.length > MAX_NODES || parsed.cells.length > MAX_CELLS) rejectRequest(createError({ statusCode: 413, statusMessage: '网格节点或单元数量超过任务上限' }))
        else resolveRequest(parsed)
      } catch {
        rejectRequest(createError({ statusCode: 500, statusMessage: errorOutput.trim() || '网格内核返回了无法识别的结果' }))
      }
    })
    child.stdin.end(serialized)
  })
})
