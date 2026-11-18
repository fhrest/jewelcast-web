import { useStore } from '../store'
import { calculateWeight } from '../utils'

export default function RightPanel() {
  const { modelStats, meshCheck, activeMaterialId, materials } = useStore()
  const activeMat = materials.find(m => m.id === activeMaterialId)

  return (
    <div className="w-80 bg-panel border-l border-border p-6 overflow-y-auto">
      <div className="text-sm text-silver font-semibold mb-6 tracking-wide border-b border-border pb-3">
        Анализ модели
      </div>

      {!modelStats && (
        <div className="text-sm text-muted text-center mt-10">
          Загрузите STL файл,<br/>чтобы увидеть параметры
        </div>
      )}

      {modelStats && activeMat && (
        <div className="space-y-6 text-sm">
          
          {/* Блок расчетов литья */}
          <div className="bg-panelLight border border-border rounded-lg p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-silver"></div>
            
            <div className="text-xs text-muted mb-1 uppercase tracking-wider">Вес изделия</div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white">
                {calculateWeight(modelStats.volume, activeMat.density).toFixed(2)}
              </span>
              <span className="text-silver font-medium">г</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50 text-xs">
              <div>
                <div className="text-muted mb-1">Материал</div>
                <div className="text-silver font-medium truncate">{activeMat.name}</div>
              </div>
              <div>
                <div className="text-muted mb-1">Усадка</div>
                <div className="text-silver font-medium">~ {activeMat.shrinkage}%</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted mb-2 uppercase tracking-wider">Геометрия</div>
            <Row label="Объём" value={`${modelStats.volume.toFixed(2)} мм³`} />
            <Row label="Габариты" value={`${modelStats.bbox.x.toFixed(1)} × ${modelStats.bbox.y.toFixed(1)} × ${modelStats.bbox.z.toFixed(1)} мм`} />
            <Row label="Полигоны" value={modelStats.polygons.toLocaleString('ru-RU')} />
          </div>

          <div>
            <div className="text-xs text-muted mb-2 uppercase tracking-wider">Целостность</div>
            <Row 
              label="Сетка" 
              value={meshCheck.isWatertight ? 'Герметична' : `${meshCheck.openEdges} дыр`} 
              color={meshCheck.isWatertight ? 'text-white' : 'text-danger'}
              badge={meshCheck.isWatertight ? 'OK' : 'WARN'}
            />
          </div>

        </div>
      )}
    </div>
  )
}

function Row({ label, value, color = 'text-silver', badge }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`${color} font-medium`}>{value}</span>
        {badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            badge === 'OK' ? 'bg-panelLight text-silver' : 'bg-danger/20 text-danger'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}