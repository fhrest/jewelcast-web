import { useEffect } from 'react'
import TopBar from './components/TopBar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'
import { useStore } from './store'
import CalcModal from './components/CalcModal'

export default function App() {
  const setActiveTool = useStore((state) => state.setActiveTool)
  const clearMeasurements = useStore((state) => state.clearMeasurements)
  const setClippingEnabled = useStore((state) => state.setClippingEnabled)
  const setMeasureStart = useStore((state) => state.setMeasureStart)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveTool('select')
        clearMeasurements() 
        setClippingEnabled(false)
        setMeasureStart(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTool, clearMeasurements, setClippingEnabled, setMeasureStart])

  return (
<div className="h-screen flex flex-col bg-bg relative"> {/* добавили relative */}
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <Viewport />
        <div className="hidden md:block">
          <RightPanel />
        </div>
      </div>
      <CalcModal /> {/* <-- Вставили сюда */}
    </div>
  )
}