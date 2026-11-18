import { create } from 'zustand'

export const useStore = create((set) => ({
  modelUrl: null,
  modelName: null,
  modelStats: null,
  meshCheck: null,
  // Для линейки
  measureStart: null,
  setMeasureStart: (p) => set({ measureStart: p }),
  setModel: (url, name, stats, meshCheck) =>
    set({ modelUrl: url, modelName: name, modelStats: stats, meshCheck }),
  clearModel: () =>
    set({ modelUrl: null, modelName: null, modelStats: null, meshCheck: null }),

  materials: [
    { id: 'ag925', name: 'Серебро 925', density: 10.4, shrinkage: 4.0, color: '#D9D9D9' },
    { id: 'au585', name: 'Золото 585', density: 13.5, shrinkage: 3.5, color: '#D4AF37' },
    { id: 'au750', name: 'Золото 750', density: 15.5, shrinkage: 3.2, color: '#E5C15A' },
    { id: 'pt950', name: 'Платина 950', density: 20.7, shrinkage: 2.5, color: '#E8E8EE' },
    { id: 'wax', name: 'Воск (для печати)', density: 1.0, shrinkage: 0.5, color: '#5A9A5A' },
  ],
  
  activeMaterialId: 'ag925',
  setActiveMaterial: (id) => set({ activeMaterialId: id }),

  viewMode: 'solid',
  setViewMode: (mode) => set({ viewMode: mode }),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  measurements: [],
  addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),
  clearMeasurements: () => set({ measurements: [] }),

  // Новые настройки для сечений
  // Новые настройки для сечений
  clippingEnabled: false,
  setClippingEnabled: (v) => set({ clippingEnabled: v }),
  clippingHeight: 0,
  setClippingHeight: (v) => set({ clippingHeight: v }),
  clippingAxis: 'y', // 'x' | 'y' | 'z'
  setClippingAxis: (axis) => set({ clippingAxis: axis }),
    // Управление камерой
    // Управление камерой
  cameraResetTrigger: 0,
  resetCamera: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),
    // Экспорт
  isExporting: false,
  setIsExporting: (val) => set({ isExporting: val }),
}))