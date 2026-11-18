import * as THREE from 'three'

export function analyzeGeometry(geometry) {
  let geom = geometry.index ? geometry.toNonIndexed() : geometry
  const position = geom.attributes.position
  const array = position.array
  let volume = 0

  for (let i = 0; i < array.length; i += 9) {
    const ax = array[i], ay = array[i + 1], az = array[i + 2]
    const bx = array[i + 3], by = array[i + 4], bz = array[i + 5]
    const cx = array[i + 6], cy = array[i + 7], cz = array[i + 8]
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6
  }

  volume = Math.abs(volume)
  geom.computeBoundingBox()
  const size = new THREE.Vector3()
  geom.boundingBox.getSize(size)

  return {
    volume,
    bbox: { x: size.x, y: size.y, z: size.z },
    polygons: position.count / 3,
  }
}

export function checkMesh(geometry) {
  let geom = geometry.index ? geometry.toNonIndexed() : geometry
  const position = geom.attributes.position
  const array = position.array
  const edgeMap = new Map()

  const addEdge = (ax, ay, az, bx, by, bz) => {
    const r = 1000
    const a = `${Math.round(ax * r)},${Math.round(ay * r)},${Math.round(az * r)}`
    const b = `${Math.round(bx * r)},${Math.round(by * r)},${Math.round(bz * r)}`
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    edgeMap.set(key, (edgeMap.get(key) || 0) + 1)
  }

  for (let i = 0; i < array.length; i += 9) {
    const ax = array[i], ay = array[i + 1], az = array[i + 2]
    const bx = array[i + 3], by = array[i + 4], bz = array[i + 5]
    const cx = array[i + 6], cy = array[i + 7], cz = array[i + 8]
    addEdge(ax, ay, az, bx, by, bz)
    addEdge(bx, by, bz, cx, cy, cz)
    addEdge(cx, cy, cz, ax, ay, az)
  }

  let openEdges = 0
  edgeMap.forEach((count) => { if (count === 1) openEdges++ })

  return { isWatertight: openEdges === 0, openEdges, totalEdges: edgeMap.size }
}

export function calculateWeight(volumeMm3, density) {
  return (volumeMm3 * density) / 1000
}