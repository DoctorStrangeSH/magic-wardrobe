import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { Sparkles, Diamond, Zap, CheckCircle } from 'lucide-react'
import type { WardrobeCategory } from '../../core/types/wardrobe'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/types/wardrobe'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  storyId: string
  quickMode?: boolean // Режим быстрого добавления
}

const CATEGORIES: WardrobeCategory[] = ['dress', 'hairstyle', 'accessory', 'makeup']

const numberInputClass = `
  w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 
  bg-white/70 text-romantic-dark font-nunito text-base
  placeholder:text-romantic-dark/30
  focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
  transition-all
`

export default function AddItemModal({ isOpen, onClose, storyId, quickMode = false }: AddItemModalProps) {
  const createItem = useWardrobeStore((state) => state.createItem)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory>('dress')
  const [image, setImage] = useState<string | null>(null)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [isFree, setIsFree] = useState(true)
  const [diamondCost, setDiamondCost] = useState(0)
  const [isOwned, setIsOwned] = useState(false)
  const [isWishlist, setIsWishlist] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [addedCount, setAddedCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Фокус на поле названия при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Сброс счётчика при закрытии
  useEffect(() => {
    if (!isOpen) {
      setAddedCount(0)
      setShowSuccess(false)
    }
  }, [isOpen])

  // Обработчик колёсика мыши — предотвращает изменение чисел
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  const resetForm = (keepBase: boolean) => {
    setName('')
    setImage(null)
    setError('')
    setShowSuccess(false)
    
    if (!keepBase) {
      // Полный сброс
      setCategory('dress')
      setSeason(1)
      setEpisode(1)
      setIsFree(true)
      setDiamondCost(0)
      setIsOwned(false)
      setIsWishlist(false)
      setNotes('')
    }
    // При keepBase=true сохраняем категорию, сезон, серию, тип, стоимость, статус, примечание
  }

  const handleSubmit = async (e: React.FormEvent, closeAfter: boolean = false) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Название наряда обязательно')
      nameInputRef.current?.focus()
      return
    }

    if (!isFree && diamondCost <= 0) {
      setError('Укажите стоимость в алмазах')
      return
    }

    setIsSubmitting(true)
    try {
      await createItem({
        storyId,
        category,
        name: name.trim(),
        image,
        season,
        episode,
        isFree,
        diamondCost: isFree ? 0 : diamondCost,
        isOwned,
        isWishlist,
        notes: notes.trim(),
      })

      if (closeAfter || !quickMode) {
        // Закрываем модалку
        resetForm(false)
        onClose()
      } else {
        // Быстрый режим: сбрасываем название и фото, остальное оставляем
        setAddedCount(prev => prev + 1)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
        resetForm(true)
      }
    } catch (err) {
      setError('Ошибка при добавлении наряда')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Горячие клавиши
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      // Ctrl+Enter — сохранить и закрыть
      handleSubmit(e, true)
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      // Enter — сохранить и продолжить (в быстром режиме)
      if (quickMode) {
        e.preventDefault()
        handleSubmit(e, false)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quickMode ? '⚡ Быстрое добавление' : 'Добавить наряд'} size="md">
      <form onSubmit={(e) => handleSubmit(e, !quickMode)} onKeyDown={handleKeyDown} className="space-y-5">
        {/* Счётчик в быстром режиме */}
        {quickMode && addedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-nunito text-sm">
            <CheckCircle size={16} />
            Добавлено нарядов: <span className="font-bold">{addedCount}</span>
          </div>
        )}

        {/* Успешное добавление */}
        {showSuccess && (
          <div className="text-center text-emerald-600 font-nunito text-sm animate-pulse">
            ✅ Добавлено! Продолжай...
          </div>
        )}

        {/* Изображение */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Скриншот наряда
          </label>
          <ImageUpload
            value={image}
            onChange={setImage}
            placeholder="Загрузить скриншот наряда"
          />
        </div>

        {/* Название */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Название наряда *
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Плащ тайны"
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 
                       bg-white/70 text-romantic-dark font-nunito text-base
                       placeholder:text-romantic-dark/30
                       focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                       transition-all"
          />
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Категория
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-nunito font-medium 
                  transition-all
                  ${category === cat
                    ? 'bg-romantic-gold/20 text-romantic-dark border-2 border-romantic-gold shadow-magic'
                    : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'
                  }
                `}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Сезон и серия */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
              Сезон
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              value={season}
              onChange={(e) => setSeason(Math.max(1, parseInt(e.target.value) || 1))}
              onWheel={handleWheel}
              className={numberInputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
              Серия
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              value={episode}
              onChange={(e) => setEpisode(Math.max(1, parseInt(e.target.value) || 1))}
              onWheel={handleWheel}
              className={numberInputClass}
            />
          </div>
        </div>

        {/* Тип: бесплатно / алмазы */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Тип наряда
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsFree(true)}
              className={`
                flex-1 px-4 py-3 rounded-xl text-sm font-nunito font-medium transition-all
                ${isFree
                  ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300'
                  : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'
                }
              `}
            >
              🆓 Бесплатно
            </button>
            <button
              type="button"
              onClick={() => setIsFree(false)}
              className={`
                flex-1 px-4 py-3 rounded-xl text-sm font-nunito font-medium transition-all
                ${!isFree
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-300'
                  : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'
                }
              `}
            >
              💎 За алмазы
            </button>
          </div>
        </div>

        {/* Стоимость в алмазах */}
        {!isFree && (
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
              Стоимость в алмазах *
            </label>
            <div className="relative">
              <Diamond size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                value={diamondCost || ''}
                onChange={(e) => setDiamondCost(Math.max(0, parseInt(e.target.value) || 0))}
                onWheel={handleWheel}
                placeholder="Например: 30"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-300 
                           bg-white/70 text-romantic-dark font-nunito text-base
                           placeholder:text-romantic-dark/30
                           focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                           transition-all"
              />
            </div>
          </div>
        )}

        {/* Чекбоксы */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isOwned}
              onChange={(e) => setIsOwned(e.target.checked)}
              className="w-5 h-5 rounded-md border-2 border-romantic-gold/40 
                         checked:bg-romantic-gold checked:border-romantic-gold
                         focus:ring-2 focus:ring-romantic-gold/20 transition-all cursor-pointer"
            />
            <span className="text-sm text-romantic-dark/80 font-nunito">
              ✅ У меня есть
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isWishlist}
              onChange={(e) => setIsWishlist(e.target.checked)}
              className="w-5 h-5 rounded-md border-2 border-romantic-gold/40 
                         checked:bg-romantic-crimson checked:border-romantic-crimson
                         focus:ring-2 focus:ring-romantic-gold/20 transition-all cursor-pointer"
            />
            <span className="text-sm text-romantic-dark/80 font-nunito">
              ❤️ Хочу получить
            </span>
          </label>
        </div>

        {/* Заметки */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Примечание (особые условия получения)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Опиши, как получить этот наряд..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 
                       bg-white/70 text-romantic-dark font-nunito text-base resize-none
                       placeholder:text-romantic-dark/30
                       focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                       transition-all"
          />
        </div>

        {/* Ошибка */}
        {error && (
          <p className="text-romantic-crimson text-sm font-nunito bg-romantic-crimson/5 
                        px-4 py-2 rounded-xl border border-romantic-crimson/20">
            ⚠️ {error}
          </p>
        )}

        {/* Горячие клавиши (подсказка) */}
        {quickMode && (
          <p className="text-xs text-romantic-dark/30 font-nunito text-center">
            ⌨️ <kbd className="px-1.5 py-0.5 rounded bg-romantic-pink/50">Enter</kbd> — добавить и продолжить • 
            <kbd className="px-1.5 py-0.5 rounded bg-romantic-pink/50 ml-1">Ctrl+Enter</kbd> — добавить и закрыть
          </p>
        )}

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            {quickMode ? 'Готово' : 'Отмена'}
          </Button>
          {quickMode ? (
            <>
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e, false)}
                isLoading={isSubmitting} 
                icon={<Zap size={18} />}
              >
                Добавить и продолжить
              </Button>
              <Button 
                type="submit"
                variant="secondary"
                icon={<CheckCircle size={18} />}
              >
                Готово
              </Button>
            </>
          ) : (
            <Button type="submit" isLoading={isSubmitting} icon={<Sparkles size={18} />}>
              Добавить наряд
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}