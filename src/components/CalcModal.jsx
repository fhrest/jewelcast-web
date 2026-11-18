import { useStore } from '../store'
import { calculateWeight } from '../utils'

export default function CalcModal() {
  const isCalcOpen = useStore((s) => s.isCalcOpen)
  const setIsCalcOpen = useStore((s) => s.setIsCalcOpen)
  const modelStats = useStore((s) => s.modelStats)
  const activeMaterialId = useStore((s) => s.activeMaterialId)
  const materials = useStore((s) => s.materials)
  const setIsExporting = useStore((s) => s.setIsExporting)

  if (!isCalcOpen || !modelStats) return null

  const activeMat = materials.find((m) => m.id === activeMaterialId)

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      {/* Клик по фону закрывает окно */}
      <div className="absolute inset-0" onClick={() => setIsCalcOpen(false)}></div>

      {/* Сама карточка */}
      <div className="relative w-full md:w-[400px] bg-panel border-t md:border border-border rounded-t-2xl md:rounded-xl shadow-2xl flex flex-col animate-slide-up md:animate-fade-in">
        
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="text-sm font-bold text-silver uppercase tracking-wider">Результаты расчета</div>
          <button onClick={() => setIsCalcOpen(false)} className="text-muted hover:text-white">✕</button>
        </div>

        {/* Контент */}
        <div className="p-5 space-y-4">
          <div className="bg-panelLight rounded-lg p-4 border border-border">
            <div className="text-xs text-muted mb-1 uppercase tracking-wider">Вес изделия</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {calculateWeight(modelStats.volume, activeMat.density).toFixed(2)}
              </span>
              <span className="text-silver font-medium">г</span>
            </div>
            <div className="text-xs text-silver mt-2">Материал: {activeMat.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted mb-1 text-xs">Объем</div>
              <div className="text-text">{modelStats.volume.toFixed(2)} мм³</div>
            </div>
            <div>
              <div className="text-muted mb-1 text-xs">Габариты</div>
              <div className="text-text text-xs md:text-sm">
                {modelStats.bbox.x.toFixed(1)} × {modelStats.bbox.y.toFixed(1)} × {modelStats.bbox.z.toFixed(1)} мм
              </div>
            </div>
            <div>
              <div className="text-muted mb-1 text-xs">Полигоны</div>
              <div className="text-text">{modelStats.polygons.toLocaleString('ru-RU')}</div>
            </div>
            <div>
              <div className="text-muted mb-1 text-xs">Усадка</div>
              <div className="text-text">~{activeMat.shrinkage}%</div>
            </div>
          </div>
        </div>

        {/* Футер с кнопкой */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={() => {
              setIsCalcOpen(false)
              setIsExporting(true)
            }}
            className="flex-1 py-3 bg-silver text-bg font-semibold rounded-lg hover:opacity-90 transition text-sm"
          >
            📄 Скачать чертеж
          </button>
        </div>
      </div>
    </div>
  )
}