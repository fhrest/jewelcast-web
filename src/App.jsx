import { useEffect } from 'react'
import TopBar from './components/TopBar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'
import { useStore } from './store'

export default function App() {
  const setActiveTool = useStore((state) => state.setActiveTool)
  const clearMeasurements = useStore((state) => state.clearMeasurements)
  const setClippingEnabled = useStore((state) => state.setClippingEnabled)
  
  // Достаем функцию сброса первой точки
  const setMeasureStart = useStore((state) => state.setMeasureStart)

  // Глобальный перехват клавиши Esc
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // 1. Выключаем линейку
        setActiveTool('select')
        
        // 2. Очищаем все нарисованные линии
        clearMeasurements() 

        // 3. Выключаем сечение
        setClippingEnabled(false)

        // 4. Сбрасываем первую точку, если она была поставлена
        setMeasureStart(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setActiveTool, clearMeasurements, setClippingEnabled, setMeasureStart])

  return (
    <div className="h-screen flex flex-col bg-bg">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <Viewport />
        <RightPanel />
      </div>
    </div>
  )
}