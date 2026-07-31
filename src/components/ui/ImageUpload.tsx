import { useRef, useState } from 'react'
import { Upload, Image, X } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (base64: string | null) => void
  placeholder?: string
}

export default function ImageUpload({ value, onChange, placeholder = 'Загрузить изображение' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Конвертация файла в base64
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Обработка выбора файла
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
                        shadow-card group">
          <img
            src={value}
            alt="Загруженное изображение"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-romantic-darker/60 
                       text-white/80 hover:bg-romantic-crimson hover:text-white
                       opacity-0 group-hover:opacity-100 transition-opacity"
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
              ? 'border-romantic-gold bg-romantic-gold/10'
              : 'border-romantic-gold/30 bg-romantic-pink/20 hover:border-romantic-gold/50 hover:bg-romantic-pink/30'
            }
          `}
        >
          {isDragging ? (
            <Image size={36} className="text-romantic-gold animate-bounce" />
          ) : (
            <Upload size={28} className="text-romantic-gold/50" />
          )}
          <p className="text-sm text-romantic-dark/50 font-nunito text-center px-4">
            {placeholder}
          </p>
          <p className="text-xs text-romantic-dark/30 font-nunito">
            Нажмите или перетащите файл
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}