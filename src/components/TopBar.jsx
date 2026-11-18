import { useState } from 'react'
import { useStore } from '../store'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { analyzeGeometry, checkMesh } from '../utils'

export default function TopBar() {
  const [isMatOpen, setIsMatOpen] = useState(false)
  
  const { 
    setModel, modelName, clearModel,
    activeMaterialId, setActiveMaterial, materials,
    viewMode, setViewMode,
    activeTool, setActiveTool, clearMeasurements,
    clippingEnabled, setClippingEnabled, clippingHeight, setClippingHeight,
    clippingAxis, setClippingAxis
  } = useStore()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        alert('Ошибка загрузки STL')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const iconBtnClass = "w-9 h-9 flex items-center justify-center rounded hover:bg-panelLight transition group relative"
  const activeIconClass = "bg-silver"

  return (
    <div className="relative h-16 bg-panel border-b border-border flex items-center justify-between px-4 z-50">
      
      {/* ЛЕВАЯ ЧАСТЬ: Лого + Инструменты */}
      <div className="flex items-center gap-6">
        
        {/* Лого */}
        <div className="h-10 flex items-center select-none">
          <img 
            src="/jewelcast-logo.png" 
            alt="JewelCast" 
            className="h-full object-contain" 
            onError={(e) => { 
              e.target.style.display = 'none'; 
              e.target.parentElement.innerHTML = '<span class="text-silver font-bold text-xl tracking-wide">JewelCast</span>'; 
            }} 
          />
        </div>

        <div className="h-6 w-px bg-border"></div>

        {/* Группа иконок-инструментов */}
        <div className="flex items-center gap-1">
          
          {/* 1. Загрузить STL */}
          <label className={`${iconBtnClass} cursor-pointer`} title="Загрузить STL">
            <img 
              src="/icon-upload.png" 
              alt="Upload" 
              className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-silver text-xs">📁</span>'; }} 
            />
            <input type="file" accept=".stl" className="hidden" onChange={handleFile} />
          </label>

          {/* 2. Линейка */}
          <button
            onClick={() => {
              const isTurningOn = activeTool !== 'measure'
              setActiveTool(isTurningOn ? 'measure' : 'select')
              if (isTurningOn) setClippingEnabled(false)
              else { clearMeasurements(); useStore.getState().setMeasureStart(null) }
            }}
            title="Линейка (Esc для выхода)"
            className={`${iconBtnClass} ${activeTool === 'measure' ? activeIconClass : ''}`}
          >
            <img 
              src="/icon-ruler.png" 
              alt="Measure" 
              className={`w-5 h-5 transition-opacity ${activeTool === 'measure' ? 'opacity-100 invert' : 'opacity-70 group-hover:opacity-100'}`} 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-silver text-xs">📏</span>'; }} 
            />
          </button>

          {/* 3. Сечение */}
          <button
            onClick={() => {
              const isTurningOn = !clippingEnabled
              setClippingEnabled(isTurningOn)
              if (isTurningOn) {
                setActiveTool('select'); clearMeasurements(); useStore.getState().setMeasureStart(null); setClippingHeight(0)
              }
            }}
            title="Сечение (Esc для выхода)"
            className={`${iconBtnClass} ${clippingEnabled ? activeIconClass : ''}`}
          >
            <img 
              src="/icon-cut.png" 
              alt="Section" 
              className={`w-5 h-5 transition-opacity ${clippingEnabled ? 'opacity-100 invert' : 'opacity-70 group-hover:opacity-100'}`} 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-silver text-xs">✂️</span>'; }} 
            />
          </button>

         

                {/* 5. Экспорт чертежа */}
          <button
            onClick={() => useStore.getState().setIsExporting(true)}
            title="Скачать чертеж (PNG)"
            className={iconBtnClass}
            disabled={!modelName} // Нельзя нажать, если нет модели
          >
            <img 
              src="/icon-export.png" 
              alt="Export" 
              className={`w-5 h-5 opacity-70 hover:opacity-100 transition-opacity ${!modelName ? 'opacity-20 cursor-not-allowed' : ''}`} 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-silver text-xs">📄</span>'; }} 
            />
          </button>
          
          {/* Имя файла */}
          {modelName && (
            <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-panelLight rounded text-xs text-muted border border-border">
              <span className="truncate max-w-[120px]">{modelName}</span>
              <button onClick={clearModel} className="hover:text-danger">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* ЦЕНТР/СПРАВА: Материалы и Режимы */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <button onClick={() => setIsMatOpen(!isMatOpen)} className="flex items-center gap-2 px-4 py-1.5 bg-panelLight border border-border rounded text-sm text-silver hover:text-white transition">
            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: materials.find(m => m.id === activeMaterialId)?.color }} />
            {materials.find(m => m.id === activeMaterialId)?.name}
            <span className="text-[10px] ml-2 opacity-50">▼</span>
          </button>
          {isMatOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-panelLight border border-border rounded shadow-2xl z-50 overflow-hidden">
              {materials.map(m => (
                <button key={m.id} onClick={() => { setActiveMaterial(m.id); setIsMatOpen(false) }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition ${activeMaterialId === m.id ? 'bg-border text-white' : 'text-muted hover:bg-panel hover:text-silver'}`}>
                  <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: m.color }} />
                  <div className="flex flex-col">
                    <span>{m.name}</span>
                    <span className="text-[10px] opacity-50">{m.density} г/см³ • усадка {m.shrinkage}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-panelLight p-1 rounded border border-border">
          {[{ id: 'solid', icon: '⬛', title: 'Solid' }, { id: 'wireframe', icon: '▦', title: 'Wireframe' }, { id: 'xray', icon: '◐', title: 'X-Ray' }].map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)} title={m.title} className={`w-8 h-8 flex items-center justify-center rounded text-sm transition ${viewMode === m.id ? 'bg-silver text-bg' : 'text-muted hover:text-text'}`}>
              {m.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ВЫПАДАЮЩАЯ ПАНЕЛЬ СЕЧЕНИЯ */}
      {clippingEnabled && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-panel border border-border rounded-b-lg px-6 py-3 shadow-xl flex items-center gap-6 z-40">
          <div className="flex items-center gap-1 bg-panelLight p-1 rounded border border-border">
            {['x', 'y', 'z'].map(axis => (
              <button key={axis} onClick={() => { setClippingAxis(axis); setClippingHeight(0); }} className={`w-7 h-7 flex items-center justify-center rounded text-xs uppercase font-bold transition ${clippingAxis === axis ? 'bg-silver text-bg' : 'text-muted hover:text-white'}`}>
                {axis}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted whitespace-nowrap">Смещение:</span>
            <input type="range" min="-30" max="30" step="0.5" value={clippingHeight} onChange={(e) => setClippingHeight(Number(e.target.value))} className="w-48 accent-silver cursor-pointer" />
            <span className="text-xs text-silver w-12 text-right">{clippingHeight.toFixed(1)} мм</span>
          </div>
        </div>
      )}

    </div>
  )
}