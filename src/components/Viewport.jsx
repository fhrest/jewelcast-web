import { useState, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Center, Environment, Html, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import * as THREE from 'three'
import { useStore } from '../store'
import { analyzeGeometry, checkMesh } from '../utils'
import ExportDrawing from './ExportDrawing'

export default function Viewport() {
  const modelUrl = useStore((s) => s.modelUrl)
  const viewMode = useStore((s) => s.viewMode)
  const activeTool = useStore((s) => s.activeTool)
  const measurements = useStore((s) => s.measurements)
  const clippingEnabled = useStore((s) => s.clippingEnabled)
  const clippingHeight = useStore((s) => s.clippingHeight)
  const clippingAxis = useStore((s) => s.clippingAxis)
  const setModel = useStore((s) => s.setModel)

  // --- ЛОГИКА DRAG & DROP ---
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.name.toLowerCase().endsWith('.stl')) {
      alert('Пожалуйста, перетащите файл формата .stl')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const loader = new STLLoader()
        const geometry = loader.parse(event.target.result)
        const stats = analyzeGeometry(geometry)
        const meshCheck = checkMesh(geometry)
        const url = URL.createObjectURL(file)
        setModel(url, file.name, stats, meshCheck)
      } catch (err) {
        alert('Ошибка при чтении файла')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div 
      className="flex-1 bg-bg relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Оверлей при перетаскивании файла */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-bg/80 border-4 border-dashed border-silver m-4 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <div className="text-silver text-2xl font-bold">Отпустите файл STL</div>
          <div className="text-muted mt-2">Модель загрузится автоматически</div>
        </div>
      )}
                {/* Кнопка сброса камеры слева от кубика */}
      <div className="absolute top-4 right-[10px] z-10">
        <button
          onClick={() => useStore.getState().resetCamera()}
          title="Сбросить камеру"
          className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
        >
          <img 
            src="/icon-home.png" 
            alt="Home" 
            className="w-7 h-7 opacity-70 hover:opacity-100 transition-opacity" 
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-silver text-xl">🏠</span>'; }} 
          />
        </button>
      </div>
      <Canvas 
        camera={{ position: [50, 40, 50], fov: 45 }}
        gl={{ localClippingEnabled: true, preserveDrawingBuffer: true }} 
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, -10, -5]} intensity={1} />
        <Environment preset="city" />

        <Center>
          {modelUrl ? (
            <ModelViewer 
              url={modelUrl} 
              viewMode={viewMode} 
              activeTool={activeTool} 
              clippingEnabled={clippingEnabled}
              clippingHeight={clippingHeight}
              clippingAxis={clippingAxis}
            />
          ) : (
            <TestObject 
              viewMode={viewMode} 
              clippingEnabled={clippingEnabled}
              clippingHeight={clippingHeight}
              clippingAxis={clippingAxis}
            />
          )}
        </Center>
        {modelUrl && <ExportDrawingWrapper url={modelUrl} />}
        {measurements.map((m, i) => (
          <MeasurementLine key={i} start={m.start} end={m.end} />
        ))}

        <CameraController />
        
        <OrbitControls makeDefault />
        <gridHelper args={[200, 40, '#2A2A33', '#1C1C22']} position={[0, -20, 0]} />

        <GizmoHelper alignment="top-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#C0C5CE', '#C0C5CE', '#C0C5CE']} labelColor="#0E0E11" axisHeadScale={0.8} />
        </GizmoHelper>
      </Canvas>
    </div>
  )
}

function CameraController() {
  const { camera, controls } = useThree()
  const resetTrigger = useStore((s) => s.cameraResetTrigger)

  useEffect(() => {
    if (resetTrigger > 0 && controls) {
      // Плавный возврат
      camera.position.set(50, 40, 50)
      camera.up.set(0, 1, 0)
      camera.lookAt(0, 0, 0)
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [resetTrigger, camera, controls])

  return null
}

function ModelViewer({ url, viewMode, activeTool, clippingEnabled, clippingHeight, clippingAxis }) {
  const geometry = useLoader(STLLoader, url)
  const activeMaterialId = useStore((s) => s.activeMaterialId)
  const materials = useStore((s) => s.materials)
  const color = materials.find(m => m.id === activeMaterialId)?.color || '#C0C5CE'

  const measureStart = useStore((s) => s.measureStart)
  const setMeasureStart = useStore((s) => s.setMeasureStart)
  const addMeasurement = useStore((s) => s.addMeasurement)

  const isValid = geometry && geometry.attributes && geometry.attributes.position && geometry.attributes.position.count > 0

  const centered = useMemo(() => {
    if (!isValid) return null
    const g = geometry.clone()
    g.computeBoundingBox()
    const bb = g.boundingBox
    if (!bb) return g
    g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2)
    g.computeVertexNormals()
    return g
  }, [geometry, isValid])

  const handleClick = (e) => {
    if (activeTool !== 'measure' || !isValid) return
    e.stopPropagation()

    const point = e.point.clone()
    if (isNaN(point.x) || isNaN(point.y) || isNaN(point.z)) return;

    if (!measureStart) {
      setMeasureStart(point)
    } else {
      addMeasurement({ start: measureStart, end: point })
      setMeasureStart(null)
    }
  }

  const clipPlane = useMemo(() => {
    let normal = new THREE.Vector3(0, -1, 0); 
    if (clippingAxis === 'x') normal.set(-1, 0, 0);
    if (clippingAxis === 'z') normal.set(0, 0, -1);
    return new THREE.Plane(normal, clippingHeight);
  }, [clippingHeight, clippingAxis]);

  if (!isValid || !centered) return null;

  const meshes = (() => {
    const clipProps = clippingEnabled ? { clippingPlanes: [clipPlane], clipShadows: true } : {};
    
    let mainMat;
    switch (viewMode) {
      case 'wireframe': 
        mainMat = <meshBasicMaterial color={color} wireframe={true} {...clipProps} />;
        break;
      case 'xray': 
        mainMat = <meshStandardMaterial color={color} transparent={true} opacity={0.2} metalness={1} roughness={0.1} {...clipProps} />;
        break;
      default: 
        mainMat = <meshStandardMaterial color={color} metalness={1} roughness={0.2} envMapIntensity={1.5} {...clipProps} />;
    }

    return (
      <group key={`model-${clippingEnabled}-${viewMode}-${clippingAxis}`}>
        <mesh geometry={centered} onClick={handleClick}>
          {mainMat}
        </mesh>

        {clippingEnabled && viewMode !== 'wireframe' && (
          <mesh geometry={centered}>
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.5} side={THREE.BackSide} clippingPlanes={[clipPlane]} />
          </mesh>
        )}

        {clippingEnabled && (
          <mesh geometry={centered}>
            <meshBasicMaterial color="#1A1A1E" wireframe={true} clippingPlanes={[clipPlane]} />
          </mesh>
        )}
      </group>
    )
  })()

  return (
    <group>
      {meshes}
      {measureStart && (
        <mesh position={measureStart}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
    </group>
  )
}

function MeasurementLine({ start, end }) {
  const distance = start.distanceTo(end)
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  const lineGeometry = useMemo(() => {
    const points = []
    const totalSegments = 30
    for (let i = 0; i <= totalSegments; i++) {
      if (i % 2 === 0) {
        const t1 = i / totalSegments
        const t2 = (i + 1) / totalSegments
        points.push(new THREE.Vector3().lerpVectors(start, end, t1))
        points.push(new THREE.Vector3().lerpVectors(start, end, t2))
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end])

  return (
    <group>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#1A1A1E" linewidth={1} />
      </lineSegments>
      <group position={start}>
        <mesh><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#FFFFFF" wireframe={true} /></mesh>
      </group>
      <group position={end}>
        <mesh><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#FFFFFF" wireframe={true} /></mesh>
      </group>
      <Html position={mid} center>
        <div className="bg-bg border border-border text-text px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-md">
          {distance.toFixed(2)} мм
        </div>
      </Html>
    </group>
  )
}

function TestObject({ viewMode, clippingEnabled, clippingHeight, clippingAxis }) {
  const geometry = useLoader(STLLoader, '/test-model.stl')
  
  const clipPlane = useMemo(() => {
    let normal = new THREE.Vector3(0, -1, 0);
    if (clippingAxis === 'x') normal.set(-1, 0, 0);
    if (clippingAxis === 'z') normal.set(0, 0, -1);
    return new THREE.Plane(normal, clippingHeight);
  }, [clippingHeight, clippingAxis]);

  const centered = useMemo(() => {
    const g = geometry.clone()
    g.computeBoundingBox()
    const bb = g.boundingBox
    g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2)
    g.scale(0.5, 0.5, 0.5)
    g.computeVertexNormals()
    return g
  }, [geometry])

  const material = (() => {
    const clipProps = clippingEnabled ? { clippingPlanes: [clipPlane], clipShadows: true } : {};
    switch (viewMode) {
      case 'wireframe': return <meshBasicMaterial color="#C0C5CE" wireframe={true} {...clipProps} />
      case 'xray': return <meshStandardMaterial color="#C0C5CE" transparent={true} opacity={0.2} metalness={1} roughness={0.1} {...clipProps} />
      default: return <meshStandardMaterial color="#C0C5CE" metalness={1} roughness={0.2} envMapIntensity={1.5} {...clipProps} />
    }
  })()
  
  return (
    <group key={`test-${clippingEnabled}-${viewMode}-${clippingAxis}`}>
      <mesh geometry={centered}>{material}</mesh>
      {clippingEnabled && viewMode !== 'wireframe' && (
        <mesh geometry={centered}>
          <meshStandardMaterial color="#888888" side={THREE.BackSide} clippingPlanes={[clipPlane]} />
        </mesh>
      )}
      {clippingEnabled && (
        <mesh geometry={centered}>
          <meshBasicMaterial color="#1A1A1E" wireframe={true} clippingPlanes={[clipPlane]} />
        </mesh>
      )}
    </group>
  )
}
function ExportDrawingWrapper({ url }) {
  const geometry = useLoader(STLLoader, url)
  return <ExportDrawing geometry={geometry} />
}