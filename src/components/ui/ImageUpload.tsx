import { useRef, useState } from 'react'
import { Upload, Image, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (base64: string | null) => void
  placeholder?: string
}

/**
 * Максимальные размеры изображения
 */
const MAX_WIDTH = 800
const MAX_HEIGHT = 1000

/**
 * Качество сжатия (0.6 = 60% — хороший баланс размер/качество)
 */
const COMPRESSION_QUALITY = 0.6

/**
 * Сжимает изображение через canvas
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new window.Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        
        let { width, height } = img
        
        // Сжимаем только если изображение больше максимальных размеров
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Не удалось создать контекст canvas'))
          return
        }
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        // Конвертируем в JPEG с указанным качеством
        // Если исходный файл PNG с прозрачностью — используем PNG
        const isPNG = file.type === 'image/png'
        const mimeType = isPNG ? 'image/png' : 'image/jpeg'
        const quality = isPNG ? undefined : COMPRESSION_QUALITY
        
        const compressedBase64 = canvas.toDataURL(mimeType, quality)
        resolve(compressedBase64)
      }
      
      img.onerror = () => {
        reject(new Error('Ошибка загрузки изображения'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'))
    }
    
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ value, onChange, placeholder = 'Загрузить изображение' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  // Обработка выбранного файла со сжатием
  const handleFile = async (file: File) => {
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Показываем исходный размер
    const originalSize = (file.size / 1024).toFixed(0)
    console.log(`📷 Исходный размер: ${originalSize} КБ`)

    setIsCompressing(true)
    try {
      const compressedBase64 = await compressImage(file)
      
      // Показываем сжатый размер
      const compressedSize = (compressedBase64.length * 0.75 / 1024).toFixed(0)
      console.log(`✨ Сжатый размер: ${compressedSize} КБ (было ${originalSize} КБ)`)
      
      onChange(compressedBase64)
    } catch (error) {
      console.error('Ошибка сжатия:', error)
      // Если сжатие не удалось — загружаем оригинал
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsCompressing(false)
    }
  }

  // Обработка выбора файла через input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Очистка
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="space-y-2">
      {value ? (
        // Предпросмотр загруженного изображения
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-romantic-gold/20 
                        shadow-card group bg-romantic-pink/20">
          <img
            src={value}
            alt="Загруженное изображение"
            className="w-full h-full object-contain"
          />
          
          {/* Размер файла */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-romantic-darker/60 
                          text-white/70 text-xs font-nunito backdrop-blur-sm">
            {(value.length * 0.75 / 1024).toFixed(0)} КБ
          </div>
          
          {/* Кнопка удаления */}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-romantic-darker/60 
                       text-white/80 hover:bg-romantic-crimson hover:text-white
                       opacity-0 group-hover:opacity-100 transition-opacity"
            title="Удалить изображение"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        // Зона загрузки
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            aspect-[3/4] rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-romantic-gold bg-romantic-gold/10 scale-[1.02]'
              : 'border-romantic-gold/30 bg-romantic-pink/20 hover:border-romantic-gold/50 hover:bg-romantic-pink/30'
            }
            ${isCompressing ? 'pointer-events-none' : ''}
          `}
        >
          {isCompressing ? (
            <>
              <Loader2 size={32} className="text-romantic-gold animate-spin" />
              <p className="text-sm text-romantic-dark/50 font-nunito">Сжатие...</p>
            </>
          ) : isDragging ? (
            <>
              <Image size={36} className="text-romantic-gold animate-bounce" />
              <p className="text-sm text-romantic-gold font-nunito font-medium">Отпустите файл</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-romantic-gold/50" />
              <div className="text-center px-4">
                <p className="text-sm text-romantic-dark/50 font-nunito">
                  {placeholder}
                </p>
                <p className="text-xs text-romantic-dark/30 font-nunito mt-1">
                  Нажмите или перетащите файл
                </p>
                <p className="text-xs text-romantic-dark/20 font-nunito mt-0.5">
                  PNG, JPG, WebP • Авто-сжатие до ~150 КБ
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}