import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { Sparkles } from 'lucide-react'
import type { StoryStatus } from '../../core/types/wardrobe'

interface AddStoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const STATUS_OPTIONS: { value: StoryStatus; label: string }[] = [
  { value: 'playing', label: '🎮 Прохожу' },
  { value: 'completed', label: '✅ Пройдена' },
  { value: 'paused', label: '⏸️ Пауза' },
]

const numberInputClass = `
  w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 
  bg-white/70 text-romantic-dark font-nunito text-base
  placeholder:text-romantic-dark/30
  focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
  transition-all
`

export default function AddStoryModal({ isOpen, onClose }: AddStoryModalProps) {
  const createStory = useWardrobeStore((state) => state.createStory)

  const [title, setTitle] = useState('')
  const [cover, setCover] = useState<string | null>(null)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [status, setStatus] = useState<StoryStatus>('playing')
  const [currentSeason, setCurrentSeason] = useState(1)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Название истории обязательно')
      return
    }

    setIsSubmitting(true)
    try {
      await createStory({
        title: title.trim(),
        cover,
        total_seasons: totalSeasons,
        status,
        current_season: currentSeason,
        current_episode: currentEpisode,
        notes: notes.trim(),
      })

      setTitle('')
      setCover(null)
      setTotalSeasons(1)
      setStatus('playing')
      setCurrentSeason(1)
      setCurrentEpisode(1)
      setNotes('')
      onClose()
    } catch (err) {
      setError('Ошибка при создании истории')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новая история" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Название истории *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Секрет Небес"
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 bg-white/70 text-romantic-dark font-nunito text-base placeholder:text-romantic-dark/30 focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all" autoFocus />
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Обложка</label>
          <ImageUpload value={cover} onChange={setCover} placeholder="Загрузить обложку истории" />
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Количество сезонов</label>
          <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} max={10} value={totalSeasons}
            onChange={(e) => setTotalSeasons(Math.max(1, parseInt(e.target.value) || 1))} className={numberInputClass} />
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Статус</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => setStatus(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-nunito font-medium transition-all ${status === option.value ? 'bg-romantic-gold/20 text-romantic-dark border-2 border-romantic-gold shadow-magic' : 'bg-white/50 text-romantic-dark/60 border-2 border-transparent hover:bg-romantic-pink/50'}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Текущий сезон</label>
            <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} max={totalSeasons} value={currentSeason}
              onChange={(e) => setCurrentSeason(Math.max(1, parseInt(e.target.value) || 1))} className={numberInputClass} />
          </div>
          <div>
            <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Текущая серия</label>
            <input type="number" inputMode="numeric" pattern="[0-9]*" min={1} value={currentEpisode}
              onChange={(e) => setCurrentEpisode(Math.max(1, parseInt(e.target.value) || 1))} className={numberInputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">Заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Мои мысли об истории..." rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-romantic-gold/30 bg-white/70 text-romantic-dark font-nunito text-base resize-none placeholder:text-romantic-dark/30 focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20 transition-all" />
        </div>

        {error && <p className="text-romantic-crimson text-sm font-nunito bg-romantic-crimson/5 px-4 py-2 rounded-xl border border-romantic-crimson/20">⚠️ {error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Отмена</Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Sparkles size={18} />}>Создать историю</Button>
        </div>
      </form>
    </Modal>
  )
}