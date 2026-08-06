import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { Sparkles, Diamond, TrendingUp } from 'lucide-react'
import type { WardrobeItem, WardrobeCategory, CostType } from '../../core/types/wardrobe'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/types/wardrobe'

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: WardrobeItem | null
}

const CATEGORIES: WardrobeCategory[] = ['dress', 'hairstyle', 'accessory', 'makeup']

const numberInputClass = `
  w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 
  bg-white/70 text-romantic-dark font-nunito text-base
  placeholder:text-romantic-dark/30
  focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
  transition-all
`

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const { updateItem } = useWardrobeStore()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory>('dress')
  const [image, setImage] = useState<string | null>(null)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [costType, setCostType] = useState<CostType>('free')
  const [diamondCost, setDiamondCost] = useState(0)
  const [statName, setStatName] = useState('')
  const [statCost, setStatCost] = useState(0)
  const [isOwned, setIsOwned] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name)
      setCategory(item.category)
      setImage(item.image)
      setSeason(item.season)
      setEpisode(item.episode)
      setCostType(item.costType || 'free')
      setDiamondCost(item.diamondCost || 0)
      setStatName(item.statName || '')
      setStatCost(item.statCost || 0)
      setIsOwned(item.isOwned)
      setNotes(item.notes)
      setError('')
    }
  }, [item, isOpen])

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Название наряда обязательно'); return }
    if (costType === 'diamond' && diamondCost <= 0) { setError('Укажите стоимость в алмазах'); return }
    if (costType === 'stats' && (!statName.trim() || statCost <= 0)) { setError('Укажите название и количество статов'); return }
    if (!item) return

    setIsSubmitting(true)
    try {
      await updateItem(item.id, {
        name: name.trim(), category, image, season, episode,
        costType,
        diamondCost: costType === 'diamond' ? diamondCost : 0,
        statName: costType === 'stats' ? statName.trim() : '',
        statCost: costType === 'stats' ? statCost : 0,
        isOwned, notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError('Ошибка при обновлении наряда')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать наряд" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Скриншот наряда</label>
          <ImageUpload value={image} onChange={setImage} placeholder="Загрузить скриншот наряда" />
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Название наряда *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 bg-white/70 text-romantic-dark font-nunito text-base focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all" />
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Категория</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-nunito font-medium transition-all ${category === cat ? 'bg-romantic-gold/20 text-romantic-dark border-2 border-romantic-gold shadow-magic' : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'}`}>
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Сезон</label>
            <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} value={season}
              onChange={(e) => setSeason(Math.max(1, parseInt(e.target.value) || 1))}
              onWheel={handleWheel} className={numberInputClass} />
          </div>
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Серия</label>
            <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} value={episode}
              onChange={(e) => setEpisode(Math.max(1, parseInt(e.target.value) || 1))}
              onWheel={handleWheel} className={numberInputClass} />
          </div>
        </div>

        {/* Тип наряда */}
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Тип наряда</label>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setCostType('free')}
              className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-nunito font-medium transition-all ${costType === 'free' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300' : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'}`}>
              🆓 Бесплатно
            </button>
            <button type="button" onClick={() => setCostType('diamond')}
              className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-nunito font-medium transition-all ${costType === 'diamond' ? 'bg-blue-50 text-blue-600 border-2 border-blue-300' : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'}`}>
              💎 Алмазы
            </button>
            <button type="button" onClick={() => setCostType('stats')}
              className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-nunito font-medium transition-all ${costType === 'stats' ? 'bg-purple-50 text-purple-600 border-2 border-purple-300' : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'}`}>
              📊 Статы
            </button>
          </div>
        </div>

        {costType === 'diamond' && (
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Стоимость в алмазах *</label>
            <div className="relative">
              <Diamond size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} value={diamondCost || ''}
                onChange={(e) => setDiamondCost(Math.max(0, parseInt(e.target.value) || 0))}
                onWheel={handleWheel} placeholder="Например: 30"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-300 bg-white/70 text-romantic-dark font-nunito text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
          </div>
        )}

        {costType === 'stats' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Название стата *</label>
              <div className="relative">
                <TrendingUp size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input type="text" value={statName} onChange={(e) => setStatName(e.target.value)}
                  placeholder="Рациональность"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-300 bg-white/70 text-romantic-dark font-nunito text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Количество *</label>
              <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} value={statCost || ''}
                onChange={(e) => setStatCost(Math.max(0, parseInt(e.target.value) || 0))}
                onWheel={handleWheel} placeholder="70"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-300 bg-white/70 text-romantic-dark font-nunito text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all" />
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isOwned} onChange={(e) => setIsOwned(e.target.checked)}
            className="w-5 h-5 rounded-md border-2 border-romantic-gold/40 checked:bg-romantic-gold checked:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all cursor-pointer" />
          <span className="text-sm text-romantic-dark/80 font-nunito">✅ У меня есть</span>
        </label>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Примечание (особые условия получения)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 bg-white/70 text-romantic-dark font-nunito text-base resize-none focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all" />
        </div>

        {error && <p className="text-romantic-crimson text-sm font-nunito bg-romantic-crimson/5 px-4 py-2 rounded-xl border border-romantic-crimson/20">⚠️ {error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Отмена</Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Sparkles size={18} />}>Сохранить</Button>
        </div>
      </form>
    </Modal>
  )
}