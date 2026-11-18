import { useState } from 'react'
import { useStore } from '../store'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { analyzeGeometry, checkMesh } from '../utils'

export default function TopBar() {
  const [isMatOpen, setIsMatOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { 
    setModel, modelName, clearModel,
    activeMaterialId, setActiveMaterial, materials,
    viewMode, setViewMode,
    activeTool, setActiveTool, clearMeasurements,
    clippingEnabled, setClippingEnabled, clippingHeight, setClippingHeight,
    clippingAxis, setClippingAxis,
    modelStats
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
      } catch (err) { alert('Ошибка загрузки STL') }
    }
    reader.readAsArrayBuffer(file)
  }

  const iconBtnClass = "w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded hover:bg-panelLight transition relative"

  return (
    <div className="relative bg-panel border-b border-border z-50">
      {/* ГЛАВНАЯ ПАНЕЛЬ */}
      <div className="h-14 md:h-16 flex items-center justify-between px-2 md:px-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: Лого + Загрузка */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center select-none">
            {/* Мобильное лого */}
            <img 
              src="/jewelcast-logo-dark.png" 
              alt="J" 
              className="h-9 w-9 object-contain block md:hidden" 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-silver font-bold text-xl">J</span>'; }} 
            />
            {/* ПК лого */}
            <img 
              src="/jewelcast-logo.png" 
              alt="JewelCast" 
              className="h-8 md:h-10 hidden md:block object-contain" 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-silver font-bold text-xl">JewelCast</span>'; }} 
            />
          </div>
          
          <div className="hidden md:block h-6 w-px bg-border"></div>

          {/* КНОПКА ЗАГРУЗКИ (и на ПК, и на Мобильном) */}
          <label className={`${iconBtnClass} cursor-pointer`} title="Загрузить STL">
            <img src="/icon-upload.png" alt="Upload" className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
            <input type="file" accept=".stl" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Инструменты для ПК) */}
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => { setActiveTool(activeTool === 'measure' ? 'select' : 'measure'); if (activeTool === 'measure') clearMeasurements() }} className={`${iconBtnClass} ${activeTool === 'measure' ? 'bg-silver' : ''}`} title="Линейка">
            <img src="/icon-ruler.png" alt="M" className={`w-4 h-4 md:w-5 md:h-5 ${activeTool === 'measure' ? 'invert' : 'opacity-70'}`} />
          </button>

          <button onClick={() => { setClippingEnabled(!clippingEnabled); if (!clippingEnabled) setClippingHeight(0) }} className={`${iconBtnClass} ${clippingEnabled ? 'bg-silver' : ''}`} title="Сечение">
            <img src="/icon-cut.png" alt="S" className={`w-4 h-4 md:w-5 md:h-5 ${clippingEnabled ? 'invert' : 'opacity-70'}`} />
          </button>

          <button onClick={() => useStore.getState().setIsExporting(true)} disabled={!modelName} className={`${iconBtnClass} ${!modelName ? 'opacity-30' : ''}`} title="Экспорт">
            <img src="/icon-export.png" alt="E" className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
          </button>

          <div className="w-px h-6 bg-border mx-2"></div>

          {/* Материал (ПК) */}
          <div className="relative">
            <button onClick={() => setIsMatOpen(!isMatOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-panelLight border border-border rounded text-sm text-silver">
              <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: materials.find(m => m.id === activeMaterialId)?.color }} />
              {materials.find(m => m.id === activeMaterialId)?.name}
              <span className="text-[10px] opacity-50">▼</span>
            </button>
            {isMatOpen && (
              <div className="absolute top-full mt-2 right-0 w-56 bg-panelLight border border-border rounded shadow-2xl z-50 overflow-hidden">
                {materials.map(m => (
                  <button key={m.id} onClick={() => { setActiveMaterial(m.id); setIsMatOpen(false) }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${activeMaterialId === m.id ? 'bg-border text-white' : 'text-muted hover:text-silver'}`}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка Рассчитать (ПК) */}
          <button onClick={() => useStore.getState().setIsCalcOpen(true)} disabled={!modelStats} className={`${iconBtnClass} ${!modelStats ? 'opacity-30' : ''}`} title="Рассчитать">
            <img src="/icon-ruler.png" alt="C" className="w-5 h-5 opacity-70" />
          </button>

          {/* Режимы (ПК) */}
          <div className="flex items-center gap-1 bg-panelLight p-1 rounded border border-border ml-2">
            {[{ id: 'solid', icon: '⬛' }, { id: 'wireframe', icon: '▦' }, { id: 'xray', icon: '◐' }].map(m => (
              <button key={m.id} onClick={() => setViewMode(m.id)} className={`w-8 h-8 flex items-center justify-center rounded text-sm ${viewMode === m.id ? 'bg-silver text-bg' : 'text-muted'}`}>
                {m.icon}
              </button>
            ))}
          </div>
        </div>

        {/* МОБИЛЬНАЯ ПРАВАЯ ЧАСТЬ: Режимы + Меню */}
        <div className="md:hidden flex items-center gap-2">
          {/* Режимы для мобилки */}
          <div className="flex items-center gap-1 bg-panelLight p-1 rounded border border-border">
            {[{ id: 'solid', icon: '⬛' }, { id: 'wireframe', icon: '▦' }, { id: 'xray', icon: '◐' }].map(m => (
              <button key={m.id} onClick={() => setViewMode(m.id)} className={`w-7 h-7 flex items-center justify-center rounded text-xs ${viewMode === m.id ? 'bg-silver text-bg' : 'text-muted'}`}>
                {m.icon}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1.5 text-silver"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ВЫПАДАЮЩЕЕ МОБИЛЬНОЕ МЕНЮ */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-panel border-b border-border shadow-2xl flex flex-col p-4 gap-4">
          
          <div className="flex justify-around gap-2">
            <button onClick={() => { setActiveTool(activeTool === 'measure' ? 'select' : 'measure'); setIsMobileMenuOpen(false); if (activeTool === 'measure') clearMeasurements() }} className={`flex flex-col items-center gap-1 p-2 rounded ${activeTool === 'measure' ? 'bg-silver text-bg' : 'text-silver bg-panelLight'}`}>
              <img src="/icon-ruler.png" alt="M" className={`w-5 h-5 ${activeTool === 'measure' ? 'invert' : ''}`} />
              <span className="text-[10px]">Линейка</span>
            </button>

            <button onClick={() => { setClippingEnabled(!clippingEnabled); setIsMobileMenuOpen(false); if (!clippingEnabled) setClippingHeight(0) }} className={`flex flex-col items-center gap-1 p-2 rounded ${clippingEnabled ? 'bg-silver text-bg' : 'text-silver bg-panelLight'}`}>
              <img src="/icon-cut.png" alt="S" className={`w-5 h-5 ${clippingEnabled ? 'invert' : ''}`} />
              <span className="text-[10px]">Сечение</span>
            </button>

            <button onClick={() => { useStore.getState().setIsExporting(true); setIsMobileMenuOpen(false) }} disabled={!modelName} className={`flex flex-col items-center gap-1 p-2 rounded bg-panelLight text-silver ${!modelName ? 'opacity-30' : ''}`}>
              <img src="/icon-export.png" alt="E" className="w-5 h-5" />
              <span className="text-[10px]">Экспорт</span>
            </button>

            <button onClick={() => { useStore.getState().setIsCalcOpen(true); setIsMobileMenuOpen(false) }} disabled={!modelStats} className={`flex flex-col items-center gap-1 p-2 rounded bg-panelLight text-silver ${!modelStats ? 'opacity-30' : ''}`}>
              <img src="/icon-ruler.png" alt="C" className="w-5 h-5" />
              <span className="text-[10px]">Расчет</span>
            </button>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Материалы в мобильном меню */}
          <div>
            <div className="text-xs text-muted mb-2 uppercase">Материал</div>
            <div className="flex flex-wrap gap-2">
              {materials.map(m => (
                <button key={m.id} onClick={() => { setActiveMaterial(m.id); setIsMobileMenuOpen(false) }} className={`px-3 py-1.5 text-xs rounded border flex items-center gap-2 ${activeMaterialId === m.id ? 'border-silver bg-silver/10 text-silver' : 'border-border text-muted'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Модель инфо */}
          {modelName && (
            <div className="text-xs text-muted text-center mt-2 flex items-center justify-center gap-2">
              <span className="truncate max-w-[200px]">{modelName}</span>
              <button onClick={() => { clearModel(); setIsMobileMenuOpen(false); }} className="text-danger">✕</button>
            </div>
          )}
        </div>
      )}

      {/* ПАНЕЛЬ СЕЧЕНИЯ (осталась без изменений) */}
      {clippingEnabled && (
        <div className="absolute top-full left-0 w-full md:top-16 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-panel border-b md:border border-border md:rounded-b-lg px-3 py-2 md:py-3 shadow-xl flex items-center justify-center gap-3 md:gap-6 z-40">
          <div className="flex items-center gap-1 bg-panelLight p-1 rounded border border-border">
            {['x', 'y', 'z'].map(axis => (
              <button key={axis} onClick={() => { setClippingAxis(axis); setClippingHeight(0); }} className={`w-7 h-7 flex items-center justify-center rounded text-xs uppercase font-bold ${clippingAxis === axis ? 'bg-silver text-bg' : 'text-muted'}`}>
                {axis}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <input type="range" min="-30" max="30" step="0.5" value={clippingHeight} onChange={(e) => setClippingHeight(Number(e.target.value))} className="w-full md:w-48 accent-silver cursor-pointer" />
            <span className="text-xs text-silver w-8 text-right">{clippingHeight.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}