import { useRef, useState } from 'react'
import { Upload, Image, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (base64: string | null) => void
  placeholder?: string
}

/**
 * Настройки сжатия для больших коллекций
 */
const MAX_WIDTH = 600        // Уменьшено для экономии (для превью наряда хватит)
const MAX_HEIGHT = 800       // Пропорционально
const COMPRESSION_QUALITY = 0.5  // 50% качество — для скриншотов норм

/**
 * Сжимает изображение через canvas
 * JPG → JPEG 50% качества
 * PNG → PNG (с уменьшением размера)
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new window.Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')

        let { width, height } = img

        // Всегда сжимаем до максимальных размеров
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

        // Заливаем белым фоном (для JPG)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height)

        // Всегда конвертируем в JPEG (даже PNG) для максимального сжатия
        // Если нужна прозрачность — можно оставить PNG
        const compressedBase64 = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY)
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

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    const originalSize = (file.size / 1024).toFixed(0)
    console.log(`📷 Исходный: ${originalSize} КБ`)

    setIsCompressing(true)
    try {
      const compressedBase64 = await compressImage(file)
      const compressedSize = (compressedBase64.length * 0.75 / 1024).toFixed(0)

      const origSize = parseInt(originalSize)
      const compSize = parseInt(compressedSize)
      const savedPercent = origSize > 0
        ? Math.round((1 - compSize / origSize) * 100)
        : 0

      console.log(`✨ Сжато: ${compressedSize} КБ (экономия ${savedPercent}%)`)

      onChange(compressedBase64)
    } catch (error) {
      console.error('Ошибка сжатия:', error)
      const reader = new FileReader()
      reader.onload = (e) => onChange(e.target?.result as string)
      reader.readAsDataURL(file)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-romantic-gold/20 
                        shadow-card group bg-romantic-pink/20">
          <img
            src={value}
            alt="Загруженное изображение"
            className="w-full h-full object-contain"
          />

          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-romantic-darker/60 
                          text-white/70 text-xs font-nunito backdrop-blur-sm">
            {(value.length * 0.75 / 1024).toFixed(0)} КБ
          </div>

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
                  JPG, PNG, WebP • Сжатие до ~50-80 КБ
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