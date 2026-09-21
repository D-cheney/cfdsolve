import assert from 'node:assert/strict'
import {
  countClosedProfiles,
  mirrorEntity,
  offsetEntity,
  rectangleBounds,
  rotateEntity,
  snapSketchPoint,
  trimLineAtPoint,
} from '../utils/sketch-geometry.ts'

const line = (id, x1, y1, x2, y2) => ({ id, type: 'line', x1, y1, x2, y2, role: 'reference', construction: false, locked: false, constraints: [] })
const rectangle = { id: 'domain', type: 'rectangle', x1: 70, y1: 20, x2: 170, y2: 120, role: 'domain', construction: false, locked: false, constraints: [] }

assert.deepEqual(rectangleBounds(rectangle), { x: 70, y: 20, width: 100, height: 100 })

const snapped = snapSketchPoint({ x: 69.6, y: 20.4 }, [rectangle], { grid: true, objects: true, angle: true, gridSize: 5, tolerance: 2 })
assert.equal(snapped.kind, 'endpoint')
assert.deepEqual({ x: snapped.x, y: snapped.y }, { x: 70, y: 20 })

const angleSnap = snapSketchPoint({ x: 12, y: 0.4 }, [], { grid: false, objects: false, angle: true, gridSize: 5, tolerance: 2, anchor: { x: 0, y: 0 } })
assert.equal(angleSnap.kind, 'angle')
assert.ok(Math.abs(angleSnap.y) < 1e-10)

const squareLines = [
  line('a', 0, 0, 10, 0),
  line('b', 10, 0, 10, 10),
  line('c', 10, 10, 0, 10),
  line('d', 0, 10, 0, 0),
]
assert.equal(countClosedProfiles(squareLines), 1)
assert.equal(countClosedProfiles([rectangle, ...squareLines]), 2)

const offset = offsetEntity(rectangle, 5)
assert.deepEqual(rectangleBounds(offset), { x: 65, y: 15, width: 110, height: 110 })

const mirrored = mirrorEntity(line('mirror', 10, 20, 30, 40), 'vertical', 50)
assert.deepEqual([mirrored.x1, mirrored.x2], [90, 70])

const rotated = rotateEntity(line('rotate', 10, 0, 20, 0), { x: 0, y: 0 }, 90)
assert.ok(Math.abs(rotated.x1) < 1e-10)
assert.ok(Math.abs(rotated.y1 - 10) < 1e-10)

const target = line('target', 0, 5, 20, 5)
const trimmed = trimLineAtPoint(target, [line('cut-1', 5, 0, 5, 10), line('cut-2', 15, 0, 15, 10)], { x: 10, y: 5 })
assert.equal(trimmed.length, 2)
assert.deepEqual(trimmed.map(item => [item.x1, item.x2]), [[0, 5], [15, 20]])

console.log('sketch geometry tests passed')
