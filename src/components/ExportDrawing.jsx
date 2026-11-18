import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'

export default function ExportDrawing({ geometry }) {
  const { gl } = useThree()
  const isExporting = useStore((s) => s.isExporting)
  const setIsExporting = useStore((s) => s.setIsExporting)
  
  const stats = useStore((s) => s.modelStats)
  const modelName = useStore((s) => s.modelName)
  const material = useStore((s) => s.materials.find(m => m.id === s.activeMaterialId))

  useEffect(() => {
    if (!isExporting || !geometry) return

    // 1. Настройка сцены
    const drawScene = new THREE.Scene()
    drawScene.background = new THREE.Color('#ffffff')

    const fillMaterial = new THREE.MeshBasicMaterial({ color: '#f8f8f8' })
    const edges = new THREE.EdgesGeometry(geometry, 15)
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#000000', linewidth: 1 }))

    const mesh = new THREE.Mesh(geometry, fillMaterial)
    const group = new THREE.Group()
    group.add(mesh)
    group.add(line)
    drawScene.add(group)

    geometry.computeBoundingBox()
    const bb = geometry.boundingBox
    group.position.set(-(bb.min.x + bb.max.x)/2, -(bb.min.y + bb.max.y)/2, -(bb.min.z + bb.max.z)/2)

    const renderSize = 1000;
    const drawCamera = new THREE.OrthographicCamera(-40, 40, 40, -40, 0.1, 2000)
    
    const modelSize = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z) || 20
    const frameSize = modelSize * 0.7; 

    drawCamera.left = -frameSize
    drawCamera.right = frameSize
    drawCamera.top = frameSize
    drawCamera.bottom = -frameSize
    drawCamera.updateProjectionMatrix()

    const oldSize = new THREE.Vector2()
    gl.getSize(oldSize)
    gl.setSize(renderSize, renderSize)
    gl.setScissorTest(false)

    const cameraDist = frameSize * 5; 

    drawCamera.position.set(0, cameraDist, 0.1)
    drawCamera.up.set(0, 0, -1)
    drawCamera.lookAt(0, 0, 0)
    gl.render(drawScene, drawCamera)
    const urlTop = gl.domElement.toDataURL('image/png')

    drawCamera.position.set(0, 0.1, cameraDist)
    drawCamera.up.set(0, 1, 0)
    drawCamera.lookAt(0, 0, 0)
    gl.render(drawScene, drawCamera)
    const urlFront = gl.domElement.toDataURL('image/png')

    drawCamera.position.set(cameraDist, cameraDist, cameraDist)
    drawCamera.up.set(0, 1, 0)
    drawCamera.lookAt(0, 0, 0)
    gl.render(drawScene, drawCamera)
    const urlIso = gl.domElement.toDataURL('image/png')

    gl.setSize(oldSize.x, oldSize.y)

    const canvas = document.createElement('canvas')
    canvas.width = 3508 
    canvas.height = 2480 
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

       const drawDimension = (x1, y1, x2, y2, text, isVertical, extStart, extEnd) => {
      // 1. Рисуем выносные линии (тонкие, от края до края)
      if (extStart && extEnd) {
        ctx.strokeStyle = '#a0a0a0' // Светло-серый для выносных
        ctx.lineWidth = 1.5
        ctx.beginPath()
        if (isVertical) {
          // Для вертикального размера (справа) - выносные идут от модели к размерной линии по горизонтали
          ctx.moveTo(extStart, y1); ctx.lineTo(extEnd, y1); // от модели до линии
          ctx.moveTo(extStart, y2); ctx.lineTo(extEnd, y2);
        } else {
          // Для горизонтального (снизу) - выносные идут от модели к линии по вертикали
          ctx.moveTo(x1, extStart); ctx.lineTo(x1, extEnd);
          ctx.moveTo(x2, extStart); ctx.lineTo(x2, extEnd);
        }
        ctx.stroke()
      }

      // 2. Рисуем саму размерную линию (жирную, со стрелочками)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Засечки на концах
      const drawTick = (x, y) => {
        ctx.beginPath()
        if (isVertical) { ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y); } 
        else { ctx.moveTo(x, y - 15); ctx.lineTo(x, y + 15); }
        ctx.stroke()
      }
      drawTick(x1, y1)
      drawTick(x2, y2)

      // 3. Текст
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 40px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2

      if (!isVertical) {
        ctx.fillText(text, midX, midY - 30)
      } else {
        ctx.save()
        ctx.translate(midX - 30, midY)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }
    }

    const drawImageWithDims = (imgUrl, x, y, w, h, label, dimW, dimH) => {
      const img = new Image()
      img.onload = () => {
        const pad = 100
        const cellW = w - pad * 2
        const cellH = h - pad * 2
        const scale = Math.min(cellW / 1000, cellH / 1000)
        const dw = 1000 * scale
        const dh = 1000 * scale
        const dx = x + (w - dw) / 2
        const dy = y + (h - dh) / 2

        ctx.drawImage(img, dx, dy, dw, dh)

        ctx.fillStyle = '#7A7D85'
        ctx.font = 'bold 40px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, x + w / 2, y + h - 20)
        if (dimW > 0 && dimH > 0) {
          const modelRatio = 0.71; 

          const modelPxW = (dimW / modelSize) * dw * modelRatio
          const modelPxH = (dimH / modelSize) * dh * modelRatio

          const leftX = dx + (dw - modelPxW) / 2
          const rightX = leftX + modelPxW
          const topY = dy + (dh - modelPxH) / 2
          const bottomY = topY + modelPxH

          // Для горизонтальной линии (снизу): 
          // Выносные идут от modelBottom до линии (modelBottom + 100)
          drawDimension(
            leftX, bottomY + 100, rightX, bottomY + 100, 
            `${dimW.toFixed(1)} мм`, false, 
            bottomY, bottomY + 100 // extStart, extEnd
          )
          
          // Для вертикальной линии (справа):
          // Выносные идут от rightX до линии (rightX + 100)
          drawDimension(
            rightX + 100, topY, rightX + 100, bottomY, 
            `${dimH.toFixed(1)} мм`, true,
            rightX, rightX + 100 // extStart, extEnd
          )
        }

        if (label === 'ИЗОМЕТРИЯ') {
          finalizeCanvas(ctx, canvas, stats, material, modelName, setIsExporting)
        }
      }
      img.src = imgUrl
    }

    const halfW = canvas.width / 2
    const halfH = canvas.height / 2

    drawImageWithDims(urlTop, 0, 0, halfW, halfH, 'ВИД СВЕРХУ', stats.bbox.x, stats.bbox.z)
    drawImageWithDims(urlFront, 0, halfH, halfW, halfH, 'ВИД СПЕРЕДИ', stats.bbox.x, stats.bbox.y)
    drawImageWithDims(urlIso, halfW, 0, halfW, halfH, 'ИЗОМЕТРИЯ', 0, 0)

  }, [isExporting, geometry, gl, stats, material, modelName, setIsExporting])

  return null
}

function finalizeCanvas(ctx, canvas, stats, material, modelName, setIsExporting) {
  const startX = canvas.width / 2 + 100
  const startY = canvas.height / 2 + 100
  
  ctx.fillStyle = '#1A1A1E'
  ctx.font = 'bold 60px Inter, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('ТЕХНИЧЕСКАЯ КАРТА', startX, startY)

  ctx.font = '40px Inter, sans-serif'
  ctx.fillStyle = '#000000'
  let lineY = startY + 80
  
  // Дата генерации
  const dateStr = new Date().toLocaleDateString('ru-RU');
  ctx.fillText(`Файл: ${modelName || 'Без названия'}`, startX, lineY); lineY += 50
  ctx.fillText(`Дата: ${dateStr}`, startX, lineY); lineY += 60
  
  ctx.fillText(`Вес: ${(stats.volume * material.density / 1000).toFixed(2)} г`, startX, lineY); lineY += 50
  ctx.fillText(`Объем: ${stats.volume.toFixed(2)} мм³`, startX, lineY); lineY += 50
  ctx.fillText(`Габариты: ${stats.bbox.x.toFixed(1)} x ${stats.bbox.y.toFixed(1)} x ${stats.bbox.z.toFixed(1)} мм`, startX, lineY); lineY += 50
  ctx.fillText(`Материал: ${material.name} (${material.density} г/см³)`, startX, lineY); lineY += 50
  ctx.fillText(`Усадка: ~${material.shrinkage}%`, startX, lineY); lineY += 50
  ctx.fillText(`Коэфф. масштаба: x${(1 + material.shrinkage / 100).toFixed(3)}`, startX, lineY)

  const logo = new Image()
  logo.onload = () => {
    const logoW = 350
    const logoH = 120
    const pad = 40 
    ctx.drawImage(logo, canvas.width - logoW - pad, canvas.height - logoH - pad, logoW, logoH)
    downloadCanvas(canvas, setIsExporting)
  }
  
  logo.onerror = () => downloadCanvas(canvas, setIsExporting)
  logo.src = '/jewelcast-logo-dark.png'
}

function downloadCanvas(canvas, setIsExporting) {
  const finalUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = finalUrl
  a.download = `JewelCast_${Date.now()}.png`
  a.click()
  setIsExporting(false)
}