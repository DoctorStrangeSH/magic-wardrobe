import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { Sparkles, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import type { WardrobeCategory } from '../../core/types/wardrobe'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  storyId: string
}

/**
 * Формат строки импорта:
 * Название | категория | сезон | серия | тип | стоимость | примечание
 * 
 * Категории (русские и английские):
 *   dress, платье, костюм, наряд, одежда
 *   hairstyle, причёска, прическа, волосы, стрижка
 *   accessory, аксессуар, украшение, аксессуары
 *   makeup, макияж
 * 
 * Тип (русские и английские):
 *   free, бесплатно, бесплатный, бесплатное
 *   diamond, алмазы, алмаз, платный, платно
 * 
 * Стоимость: число (только для diamond/платный)
 *   Для free можно оставить пустым или пропустить
 * 
 * Примечание: опционально
 * 
 * Примеры:
 *   Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор с Джоном
 *   Корона | аксессуар | 2 | 5 | бесплатно
 *   Grave | dress | 3 | 12 | free | | Добавляется автоматически при покупке всех нарядов за 49💎
 *   Причёска "Волна" | волосы | 1 | 2 | бесплатно
 *   Макияж "Звезда" | makeup | 4 | 7 | diamond | 20
 */

const CATEGORY_MAP: Record<string, WardrobeCategory> = {
  // Английские
  'dress': 'dress',
  'hairstyle': 'hairstyle',
  'accessory': 'accessory',
  'makeup': 'makeup',
  // Русские: платья/костюмы
  'платье': 'dress',
  'костюм': 'dress',
  'наряд': 'dress',
  'одежда': 'dress',
  // Русские: причёски
  'причёска': 'hairstyle',
  'прическа': 'hairstyle',
  'волосы': 'hairstyle',
  'стрижка': 'hairstyle',
  // Русские: аксессуары
  'аксессуар': 'accessory',
  'украшение': 'accessory',
  'аксессуары': 'accessory',
  'серьги': 'accessory',
  'колье': 'accessory',
  'кольцо': 'accessory',
  'браслет': 'accessory',
  'очки': 'accessory',
  'сумка': 'accessory',
  'пояс': 'accessory',
  'ремень': 'accessory',
  'шарф': 'accessory',
  'перчатки': 'accessory',
  'веер': 'accessory',
  'корона': 'accessory',
  'диадема': 'accessory',
  'крылья': 'accessory',
  'маска': 'accessory',
  // Русские: макияж
  'макияж': 'makeup',
}

const FREE_WORDS = ['free', 'бесплатно', 'бесплатный', 'бесплатное', 'бесплатные']
const DIAMOND_WORDS = ['diamond', 'алмазы', 'алмаз', 'платный', 'платно', 'платное', 'платные']

export default function BulkImportModal({ isOpen, onClose, storyId }: BulkImportModalProps) {
  const createItem = useWardrobeStore((state) => state.createItem)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const handleImport = async () => {
    if (!text.trim()) return

    setIsSubmitting(true)
    setResult(null)

    const lines = text.trim().split('\n').filter(line => line.trim())
    let success = 0
    const errors: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const parts = line.split('|').map(p => p.trim())
        
        if (parts.length < 5) {
          errors.push(`Строка ${i + 1}: неверный формат (минимум 5 полей: название | категория | сезон | серия | тип)`)
          continue
        }

        const [name, categoryRaw, seasonStr, episodeStr, typeRaw, ...rest] = parts
        
        // Категория
        const categoryKey = categoryRaw.toLowerCase()
        const category: WardrobeCategory = CATEGORY_MAP[categoryKey] || 'dress'
        
        // Сезон и серия
        const season = Math.max(1, parseInt(seasonStr) || 1)
        const episode = Math.max(1, parseInt(episodeStr) || 1)
        
        // Тип
        const typeLower = typeRaw.toLowerCase()
        const isFree = FREE_WORDS.includes(typeLower)
        
        let diamondCost = 0
        let notes = ''

        if (rest.length > 0) {
          if (isFree) {
            // Бесплатный наряд: всё после типа — примечание
            // Если первый элемент пустой или "0" — пропускаем его
            const filteredRest = rest.filter(r => r !== '' && r !== '0')
            notes = filteredRest.join(' | ').trim()
          } else {
            // Платный наряд: первый непустой элемент — стоимость, остальное — примечание
            // Пропускаем пустые элементы в начале
            let costIndex = 0
            while (costIndex < rest.length && rest[costIndex] === '') {
              costIndex++
            }
            
            if (costIndex < rest.length) {
              const costValue = parseInt(rest[costIndex])
              if (!isNaN(costValue) && costValue > 0) {
                diamondCost = costValue
                notes = rest.slice(costIndex + 1).filter(r => r !== '').join(' | ').trim()
              } else {
                // Первый непустой элемент не число — всё примечание
                notes = rest.filter(r => r !== '').join(' | ').trim()
              }
            } else {
              notes = ''
            }
          }
        }

        await createItem({
          storyId,
          category,
          name,
          image: null,
          season,
          episode,
          isFree,
          diamondCost: isFree ? 0 : diamondCost,
          isOwned: false,
          isWishlist: false,
          notes,
        })

        success++
      } catch (err) {
        errors.push(`Строка ${i + 1}: ошибка создания`)
        console.error(err)
      }
    }

    setResult({ success, errors })
    if (success > 0 && errors.length === 0) {
      setText('')
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setText('')
    setResult(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📋 Массовый импорт нарядов" size="lg">
      <div className="space-y-5">
        {/* Инструкция */}
        <div className="p-4 rounded-2xl bg-romantic-pink/20 border border-romantic-gold/20">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-romantic-gold flex-shrink-0 mt-0.5" />
            <div className="text-sm font-nunito text-romantic-dark/70">
              <p className="font-bold mb-2">Формат строки:</p>
              <code className="block bg-white/50 rounded-xl px-3 py-2 text-xs mb-2">
                Название | категория | сезон | серия | тип | стоимость | примечание
              </code>
              <p className="text-xs mb-1">
                <span className="font-semibold">Категории:</span> dress/платье, hairstyle/причёска/волосы, accessory/аксессуар/украшение, makeup/макияж
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold">Тип:</span> free/бесплатно или diamond/алмазы/платный
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold">Стоимость:</span> число (только для diamond). Для free — оставь пустым или пропусти
              </p>
              <p className="text-xs">
                <span className="font-semibold">Примечание:</span> опционально. Для free всё после типа — примечание. Для diamond всё после стоимости — примечание
              </p>
            </div>
          </div>
        </div>

        {/* Пример */}
        <details className="text-xs font-nunito text-romantic-dark/50">
          <summary className="cursor-pointer hover:text-romantic-dark">📝 Примеры заполнения</summary>
          <pre className="mt-2 p-3 rounded-xl bg-white/50 overflow-x-auto text-xs leading-relaxed">
{`Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор с Джоном
Корона королевы | украшение | 2 | 5 | бесплатно
Grave | платье | 3 | 12 | free | | Добавляется автоматически при покупке всех нарядов за 49💎
Причёска "Волна" | волосы | 1 | 2 | бесплатно
Макияж "Звезда" | makeup | 4 | 7 | алмазы | 20
Золотой браслет | аксессуар | 2 | 4 | платный | 15 | Даётся после сцены с Алексом
Серьги-звёзды | серьги | 1 | 8 | free | | Можно пропустить стоимость для free`}
          </pre>
        </details>

        {/* Поле ввода */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
            Список нарядов *
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
            placeholder={`Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор с Джоном\nКорона | аксессуар | 2 | 5 | бесплатно\nВечернее платье | платье | 3 | 1 | алмазы | 50\nGrave | dress | 3 | 12 | free | | Добавляется автоматически`}
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-romantic-gold/30 
                       bg-white/70 text-romantic-dark font-mono text-sm resize-y
                       placeholder:text-romantic-dark/30
                       focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                       transition-all"
          />
        </div>

        {/* Результат */}
        {result && (
          <div className={`p-4 rounded-2xl ${
            result.errors.length === 0 
              ? 'bg-emerald-50 border border-emerald-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors.length === 0 ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <AlertCircle size={18} className="text-amber-500" />
              )}
              <span className="font-nunito font-bold text-sm">
                {result.success > 0 && `✅ Добавлено: ${result.success}`}
                {result.success > 0 && result.errors.length > 0 && ' • '}
                {result.errors.length > 0 && `⚠️ Ошибок: ${result.errors.length}`}
              </span>
            </div>
            {result.errors.length > 0 && (
              <ul className="text-xs font-nunito text-red-600 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} type="button">
            Закрыть
          </Button>
          <Button 
            onClick={handleImport} 
            isLoading={isSubmitting} 
            icon={<Sparkles size={18} />}
            disabled={!text.trim()}
          >
            Импортировать
          </Button>
        </div>
      </div>
    </Modal>
  )
}