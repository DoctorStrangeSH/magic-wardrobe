import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Upload, AlertTriangle, CheckCircle, FileJson, Sparkles } from 'lucide-react'
import { useWardrobeStore } from '../../store/wardrobeStore'
import Button from '../ui/Button'

export default function ImportExportPanel() {
  const { exportData, importData, stories, overallStats } = useWardrobeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [showConfirmImport, setShowConfirmImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  // Очистка статуса через 5 секунд
  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: '' }), 5000)
  }

  // Экспорт данных
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const jsonData = await exportData()
      
      // Создаём файл и скачиваем
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `magic-wardrobe-backup-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showStatus('success', '✅ Данные успешно экспортированы!')
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      showStatus('error', '❌ Ошибка при экспорте данных')
    } finally {
      setIsExporting(false)
    }
  }

  // Обработка выбора файла для импорта
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setShowConfirmImport(true)
    }
  }

  // Подтверждение импорта
  const handleConfirmImport = async () => {
    if (!importFile) return

    setIsImporting(true)
    setShowConfirmImport(false)

    try {
      const text = await importFile.text()
      
      // Проверяем, что это валидный JSON с нужной структурой
      const data = JSON.parse(text)
      if (!data.stories || !data.items) {
        throw new Error('Неверный формат файла')
      }

      await importData(text)
      showStatus('success', `✅ Импортировано ${data.stories.length} историй и ${data.items.length} нарядов!`)
    } catch (error) {
      console.error('Ошибка импорта:', error)
      showStatus('error', '❌ Ошибка при импорте. Проверьте формат файла.')
    } finally {
      setIsImporting(false)
      setImportFile(null)
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Отмена импорта
  const handleCancelImport = () => {
    setShowConfirmImport(false)
    setImportFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Данные для отображения
  const totalItems = overallStats?.totalItems || 0
  const totalStories = stories.length

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <Sparkles size={20} className="text-romantic-gold inline" />
        <h3 className="font-cormorant text-xl font-bold text-romantic-dark">
          Импорт и Экспорт
        </h3>
        <p className="text-sm text-romantic-dark/50 font-nunito">
          Сохрани свой гардероб или перенеси на другое устройство
        </p>
      </div>

      {/* Статус-сообщение */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-2xl font-nunito text-sm
              ${status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
              }
            `}
          >
            {status.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Информация о текущих данных */}
      <div className="romantic-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <FileJson size={20} className="text-romantic-gold" />
          <h4 className="font-cormorant font-semibold text-romantic-dark">
            Текущие данные
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm font-nunito">
          <div>
            <span className="text-romantic-dark/50">Историй:</span>{' '}
            <span className="font-bold text-romantic-dark">{totalStories}</span>
          </div>
          <div>
            <span className="text-romantic-dark/50">Нарядов:</span>{' '}
            <span className="font-bold text-romantic-dark">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Кнопки экспорта и импорта */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Экспорт */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="romantic-card rounded-2xl p-6 shadow-card text-center space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-romantic-gold/10 
                          flex items-center justify-center">
            <Download size={28} className="text-romantic-gold" />
          </div>
          <div>
            <h4 className="font-cormorant font-semibold text-romantic-dark text-lg">
              Экспорт
            </h4>
            <p className="text-xs text-romantic-dark/50 font-nunito mt-1">
              Скачай все данные в JSON-файл
            </p>
          </div>
          <Button
            onClick={handleExport}
            isLoading={isExporting}
            icon={<Download size={16} />}
            className="w-full"
          >
            Скачать backup
          </Button>
        </motion.div>

        {/* Импорт */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="romantic-card rounded-2xl p-6 shadow-card text-center space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-romantic-gold/10 
                          flex items-center justify-center">
            <Upload size={28} className="text-romantic-gold" />
          </div>
          <div>
            <h4 className="font-cormorant font-semibold text-romantic-dark text-lg">
              Импорт
            </h4>
            <p className="text-xs text-romantic-dark/50 font-nunito mt-1">
              Загрузи backup и восстанови данные
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={isImporting}
            icon={<Upload size={16} />}
            variant="secondary"
            className="w-full"
          >
            Загрузить файл
          </Button>
        </motion.div>
      </div>

      {/* Модалка подтверждения импорта */}
      <AnimatePresence>
        {showConfirmImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-romantic-darker/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="romantic-card rounded-3xl p-6 shadow-magic-lg max-w-md w-full 
                         border border-romantic-gold/20"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-romantic-crimson/10 
                                flex items-center justify-center">
                  <AlertTriangle size={32} className="text-romantic-crimson" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-bold text-romantic-dark">
                    Подтверждение импорта
                  </h3>
                  <p className="text-sm text-romantic-dark/60 font-nunito mt-2">
                    При импорте <span className="font-bold text-romantic-crimson">все текущие данные будут заменены</span>.
                    Убедитесь, что у вас есть резервная копия.
                  </p>
                  {importFile && (
                    <p className="text-xs text-romantic-dark/40 font-nunito mt-2">
                      Файл: {importFile.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="ghost" onClick={handleCancelImport}>
                    Отмена
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleConfirmImport}
                    icon={<Upload size={16} />}
                  >
                    Заменить данные
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Инструкция */}
      <div className="romantic-card rounded-2xl p-5 shadow-card">
        <h4 className="font-cormorant font-semibold text-romantic-dark mb-3">
          📋 Как перенести гардероб на другое устройство
        </h4>
        <ol className="space-y-2 text-sm text-romantic-dark/60 font-nunito list-decimal list-inside">
          <li>Нажми <span className="font-bold text-romantic-gold">«Скачать backup»</span> на этом устройстве</li>
          <li>Перенеси файл на другое устройство (через Telegram, почту, облако)</li>
          <li>Открой Magic Wardrobe на новом устройстве</li>
          <li>Нажми <span className="font-bold text-romantic-gold">«Загрузить файл»</span> и выбери backup</li>
          <li>Подтверди замену данных</li>
          <li>Готово! Твой гардероб на новом устройстве ✨</li>
        </ol>
      </div>
    </div>
  )
}