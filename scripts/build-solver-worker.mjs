import { build } from 'esbuild'
import { resolve } from 'node:path'

const common = { bundle: true, platform: 'node', format: 'esm', target: 'node22', packages: 'external', alias: { '~': process.cwd() } }
await build({ ...common, entryPoints: [resolve('services/solver/solver-execution.ts')], outfile: resolve('.output/server/solver-execution.mjs') })
await build({ ...common, entryPoints: [resolve('services/solver/worker-service.ts')], outfile: resolve('.output/server/worker-service.mjs') })
console.log('Linux solver worker built')
