import assert from 'node:assert/strict'
import {
  arcEndpoints,
  combinedBounds,
  distance,
  entityArea,
  entityContainsEntity,
  intersections,
  modelingEntityLength,
  modelingMirrorEntity,
  modelingOffsetEntity,
  modelingRotateEntity,
  modelingTranslateEntity,
  validateGeometry,
} from '../utils/modeling-geometry.ts'
import { importAsciiDxf } from '../utils/modeling-file-exchange.ts'

const base = (kind, extra = {}) => ({
  id: `${kind}-1`, kind, name: kind, layerId: 'layer-default', points: [],
  construction: false, locked: false, visible: true, ...extra,
})

const plate = base('rectangle', { points: [{ x: 0, y: 0 }, { x: 200, y: 100 }], closed: true })
const hole = base('circle', { center: { x: 100, y: 50 }, radius: 10, closed: true })
assert.equal(entityArea(plate), 20_000)
assert.ok(Math.abs(entityArea(hole) - Math.PI * 100) < 1e-10)
assert.equal(modelingEntityLength(plate), 600)
assert.ok(Math.abs(modelingEntityLength(hole) - Math.PI * 20) < 1e-10)
assert.equal(entityContainsEntity(plate, hole), true)
assert.equal(entityContainsEntity(hole, plate), false)

const rotated = modelingRotateEntity(plate, { x: 10, y: 5 }, 37 * Math.PI / 180)
assert.ok(Math.abs(entityArea(rotated) - 800 * 25) < 1e-8)
assert.ok(Math.abs(modelingEntityLength(rotated) - 600) < 1e-8)

const moved = modelingTranslateEntity(hole, { x: -25, y: 30 })
assert.deepEqual(moved.center, { x: 75, y: 80 })
const mirrored = modelingMirrorEntity(base('line', { points: [{ x: 10, y: 20 }, { x: 30, y: 40 }] }), { x: 50, y: 0 }, { x: 50, y: 100 })
assert.deepEqual(mirrored.points, [{ x: 90, y: 20 }, { x: 70, y: 40 }])

const offset = modelingOffsetEntity(plate, 5)
assert.ok(offset)
const offsetBounds = combinedBounds([offset])
assert.ok(offsetBounds.maxX > 200 && offsetBounds.minX < 0)

const cutLine = base('line', { id: 'cut', points: [{ x: 100, y: -10 }, { x: 100, y: 110 }] })
const cross = intersections(plate, cutLine)
assert.equal(cross.length, 2)
assert.ok(cross.some(point => distance(point, { x: 100, y: 0 }) < 1e-8))
assert.ok(cross.some(point => distance(point, { x: 100, y: 100 }) < 1e-8))

const arc = base('arc', { center: { x: 0, y: 0 }, radius: 10, startAngle: 0, sweepAngle: Math.PI })
const [arcStart, arcEnd] = arcEndpoints(arc)
assert.ok(distance(arcStart, { x: 10, y: 0 }) < 1e-8)
assert.ok(distance(arcEnd, { x: -10, y: 0 }) < 1e-8)

const selfCross = base('polyline', { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }], closed: true })
assert.ok(validateGeometry([selfCross]).some(item => item.code === 'SELF_INTERSECTION'))
assert.ok(validateGeometry([plate, { ...plate, id: 'duplicate' }]).some(item => item.code === 'DUPLICATE'))

const dxf = ['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES','0','LINE','8','walls','10','0','20','0','11','100','21','50','0','CIRCLE','8','holes','10','50','20','25','40','10','0','ENDSEC','0','EOF'].join('\n')
const imported = importAsciiDxf(dxf)
assert.equal(imported.entities.length, 2)
assert.deepEqual(imported.entities[0].points, [{ x: 0, y: 0 }, { x: 100, y: 50 }])
assert.equal(imported.entities[1].radius, 10)
assert.equal(imported.layers.length, 2)

console.log('modeling core tests passed')
