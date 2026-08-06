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
 * Типы: free/бесплатно, diamond/алмазы/30, stats/рациональность/70
 * 
 * Примеры:
 *   Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор
 *   Корона | аксессуар | 2 | 5 | бесплатно
 *   Платье силы | dress | 3 | 6 | stats | Рациональность | 70 | Нужно 70 статов
 *   Grave | dress | 3 | 12 | free | | Добавляется автоматически
 */

const CATEGORY_MAP: Record<string, WardrobeCategory> = {
  'dress': 'dress', 'dresses': 'dress', 'outfit': 'dress', 'clothes': 'dress', 'gown': 'dress',
  'hairstyle': 'hairstyle', 'hair': 'hairstyle', 'hairstyles': 'hairstyle', 'hairdo': 'hairstyle',
  'accessory': 'accessory', 'accessories': 'accessory', 'jewelry': 'accessory', 'necklace': 'accessory',
  'bracelet': 'accessory', 'ring': 'accessory', 'earrings': 'accessory', 'glasses': 'accessory',
  'bag': 'accessory', 'belt': 'accessory', 'scarf': 'accessory', 'gloves': 'accessory',
  'crown': 'accessory', 'tiara': 'accessory', 'wings': 'accessory', 'mask': 'accessory',
  'makeup': 'makeup', 'make-up': 'makeup', 'cosmetics': 'makeup',
  // Русские
  'платье': 'dress', 'костюм': 'dress', 'наряд': 'dress', 'одежда': 'dress',
  'причёска': 'hairstyle', 'прическа': 'hairstyle', 'волосы': 'hairstyle', 'стрижка': 'hairstyle',
  'аксессуар': 'accessory', 'украшение': 'accessory', 'серьги': 'accessory', 'колье': 'accessory',
  'ожерелье': 'accessory', 'кольцо': 'accessory', 'браслет': 'accessory', 'очки': 'accessory',
  'сумка': 'accessory', 'пояс': 'accessory', 'ремень': 'accessory', 'шарф': 'accessory',
  'перчатки': 'accessory', 'веер': 'accessory', 'корона': 'accessory', 'диадема': 'accessory',
  'крылья': 'accessory', 'маска': 'accessory', 'макияж': 'makeup',
}

const FREE_WORDS = ['free', 'бесплатно', 'бесплатный', 'бесплатное', 'бесплатные']
const DIAMOND_WORDS = ['diamond', 'алмазы', 'алмаз', 'платный', 'платно', 'платное', 'платные']
const STATS_WORDS = ['stats', 'статы', 'стат']

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
          errors.push(`Строка ${i + 1}: минимум 5 полей (название | категория | сезон | серия | тип)`)
          continue
        }

        const [name, categoryRaw, seasonStr, episodeStr, typeRaw, ...rest] = parts
        
        const category: WardrobeCategory = CATEGORY_MAP[categoryRaw.toLowerCase()] || 'dress'
        const season = Math.max(1, parseInt(seasonStr) || 1)
        const episode = Math.max(1, parseInt(episodeStr) || 1)
        const typeLower = typeRaw.toLowerCase()

        // Определяем тип
        let costType: 'free' | 'diamond' | 'stats' = 'free'
        let diamondCost = 0
        let statName = ''
        let statCost = 0
        let notes = ''

        if (FREE_WORDS.includes(typeLower)) {
          costType = 'free'
          notes = rest.filter(r => r !== '' && r !== '0').join(' | ').trim()
        } else if (DIAMOND_WORDS.includes(typeLower)) {
          costType = 'diamond'
          // Ищем стоимость в rest
          let costIndex = 0
          while (costIndex < rest.length && rest[costIndex] === '') costIndex++
          if (costIndex < rest.length) {
            const costValue = parseInt(rest[costIndex])
            if (!isNaN(costValue) && costValue > 0) {
              diamondCost = costValue
              notes = rest.slice(costIndex + 1).filter(r => r !== '').join(' | ').trim()
            } else {
              notes = rest.filter(r => r !== '').join(' | ').trim()
            }
          }
        } else if (STATS_WORDS.includes(typeLower)) {
          costType = 'stats'
          // Формат: stats | НазваниеСтата | Количество | примечание
          let statIndex = 0
          while (statIndex < rest.length && rest[statIndex] === '') statIndex++
          if (statIndex < rest.length) {
            statName = rest[statIndex]
            const costIndex = statIndex + 1
            if (costIndex < rest.length) {
              const costValue = parseInt(rest[costIndex])
              if (!isNaN(costValue) && costValue > 0) {
                statCost = costValue
                notes = rest.slice(costIndex + 1).filter(r => r !== '').join(' | ').trim()
              } else {
                notes = rest.slice(statIndex + 1).filter(r => r !== '').join(' | ').trim()
              }
            }
          }
        } else {
          // Пытаемся угадать: если первый rest — число, то diamond
          const firstRest = rest[0]
          const firstNum = parseInt(firstRest)
          if (!isNaN(firstNum) && firstNum > 0 && rest.length > 1 && isNaN(parseInt(rest[1]))) {
            // Похоже на stats: алмазы | Название | Число
            costType = 'stats'
            statName = rest[1]
            statCost = firstNum
            notes = rest.slice(2).filter(r => r !== '').join(' | ').trim()
          } else if (!isNaN(firstNum) && firstNum > 0) {
            costType = 'diamond'
            diamondCost = firstNum
            notes = rest.slice(1).filter(r => r !== '').join(' | ').trim()
          } else {
            costType = 'free'
            notes = rest.filter(r => r !== '' && r !== '0').join(' | ').trim()
          }
        }

        await createItem({
          storyId, category, name, image: null, season, episode,
          costType,
          diamondCost: costType === 'diamond' ? diamondCost : 0,
          statName: costType === 'stats' ? statName : '',
          statCost: costType === 'stats' ? statCost : 0,
          isOwned: false, isWishlist: false, notes,
        })

        success++
      } catch (err) {
        errors.push(`Строка ${i + 1}: ошибка создания`)
      }
    }

    setResult({ success, errors })
    if (success > 0 && errors.length === 0) setText('')
    setIsSubmitting(false)
  }

  const handleClose = () => { setText(''); setResult(null); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📋 Массовый импорт нарядов" size="lg">
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-romantic-pink/20 border border-romantic-gold/20">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-romantic-gold flex-shrink-0 mt-0.5" />
            <div className="text-sm font-nunito text-romantic-dark/70">
              <p className="font-bold mb-2">Формат строки:</p>
              <code className="block bg-white/50 rounded-xl px-3 py-2 text-xs mb-2">
                Название | категория | сезон | серия | тип | стоимость | примечание
              </code>
              <p className="text-xs mb-1"><span className="font-semibold">Категории:</span> dress/платье, hairstyle/причёска/волосы, accessory/аксессуар/украшение, makeup/макияж</p>
              <p className="text-xs mb-1"><span className="font-semibold">Типы:</span> free/бесплатно, diamond/алмазы, stats/статы</p>
              <p className="text-xs mb-1"><span className="font-semibold">Алмазы:</span> diamond | 30 | примечание</p>
              <p className="text-xs"><span className="font-semibold">Статы:</span> stats | Рациональность | 70 | примечание</p>
            </div>
          </div>
        </div>

        <details className="text-xs font-nunito text-romantic-dark/50">
          <summary className="cursor-pointer hover:text-romantic-dark">📝 Примеры</summary>
          <pre className="mt-2 p-3 rounded-xl bg-white/50 overflow-x-auto text-xs leading-relaxed">
{`Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор с Джоном
Корона | украшение | 2 | 5 | бесплатно
Grave | платье | 3 | 12 | free | | Добавляется автоматически
Платье силы | dress | 3 | 6 | stats | Рациональность | 70 | Нужно 70 статов
Причёска "Волна" | волосы | 1 | 2 | бесплатно
Макияж "Звезда" | makeup | 4 | 7 | алмазы | 20
Браслет | аксессуар | 2 | 4 | stats | Слава | 50`}
          </pre>
        </details>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Список нарядов *</label>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setResult(null) }}
            placeholder={`Плащ тайны | dress | 2 | 5 | diamond | 30 | Нужен выбор\nКорона | аксессуар | 2 | 5 | бесплатно\nПлатье силы | dress | 3 | 6 | stats | Рациональность | 70`}
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-romantic-gold/30 bg-white/70 text-romantic-dark font-mono text-sm resize-y placeholder:text-romantic-dark/30 focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all" />
        </div>

        {result && (
          <div className={`p-4 rounded-2xl ${result.errors.length === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors.length === 0 ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
              <span className="font-nunito font-bold text-sm">
                {result.success > 0 && `✅ Добавлено: ${result.success}`}
                {result.success > 0 && result.errors.length > 0 && ' • '}
                {result.errors.length > 0 && `⚠️ Ошибок: ${result.errors.length}`}
              </span>
            </div>
            {result.errors.length > 0 && (
              <ul className="text-xs font-nunito text-red-600 space-y-1">{result.errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} type="button">Закрыть</Button>
          <Button onClick={handleImport} isLoading={isSubmitting} icon={<Sparkles size={18} />} disabled={!text.trim()}>Импортировать</Button>
        </div>
      </div>
    </Modal>
  )
}