import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const sourceDirectory = resolve('services', 'meshing')
const targetDirectory = resolve('.output', 'server', 'meshing')

await mkdir(targetDirectory, { recursive: true })
await Promise.all([
  copyFile(resolve(sourceDirectory, 'generate_mesh.py'), resolve(targetDirectory, 'generate_mesh.py')),
  copyFile(resolve(sourceDirectory, 'requirements.txt'), resolve(targetDirectory, 'requirements.txt')),
])

console.log(`Meshing runtime copied to ${targetDirectory}`)
