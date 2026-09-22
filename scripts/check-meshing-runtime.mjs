import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const sourceScript = resolve('services', 'meshing', 'generate_mesh.py')
if (!existsSync(sourceScript)) {
  console.error(`Meshing script is missing: ${sourceScript}`)
  process.exit(1)
}

const configuredPython = process.env.CFDSOLVE_PYTHON_BIN?.trim()
const python = configuredPython || (process.platform === 'win32' ? 'py' : 'python3')
const args = !configuredPython && process.platform === 'win32'
  ? ['-3', '-c', 'import gmsh; print(gmsh.__version__)']
  : ['-c', 'import gmsh; print(gmsh.__version__)']
const check = spawnSync(python, args, { encoding: 'utf8' })

if (check.error || check.status !== 0) {
  console.error(check.error?.message || check.stderr.trim() || 'Unable to import Gmsh')
  process.exit(1)
}

const version = check.stdout.trim()
if (version !== '4.15.2') {
  console.error(`Expected Gmsh 4.15.2, received ${version || 'unknown'}`)
  process.exit(1)
}

console.log(`Meshing runtime ready: ${python}, Gmsh ${version}`)
