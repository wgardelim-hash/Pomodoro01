import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { X } from 'lucide-react'

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSaveSettings(localSettings)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: parseInt(value) || 1
    }))
  }

  const handleSwitchChange = (field, checked) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Configurações</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tempos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tempos (minutos)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="focusTime">Tempo de Foco</Label>
              <Input
                id="focusTime"
                type="number"
                min="1"
                max="60"
                value={localSettings.focusTime}
                onChange={(e) => handleInputChange('focusTime', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shortBreakTime">Pausa Curta</Label>
              <Input
                id="shortBreakTime"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakTime}
                onChange={(e) => handleInputChange('shortBreakTime', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longBreakTime">Pausa Longa</Label>
              <Input
                id="longBreakTime"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakTime}
                onChange={(e) => handleInputChange('longBreakTime', e.target.value)}
              />
            </div>
          </div>

          {/* Notificações */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notificações</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="soundEnabled">Som</Label>
              <Switch
                id="soundEnabled"
                checked={localSettings.soundEnabled}
                onCheckedChange={(checked) => handleSwitchChange('soundEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="desktopNotifications">Notificações do Sistema</Label>
              <Switch
                id="desktopNotifications"
                checked={localSettings.desktopNotifications}
                onCheckedChange={(checked) => handleSwitchChange('desktopNotifications', checked)}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

