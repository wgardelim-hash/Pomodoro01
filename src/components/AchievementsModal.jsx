import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { X, Award } from 'lucide-react'
import { AchievementBadge } from './AchievementBadge.jsx'

export function AchievementsModal({ isOpen, onClose, sessions }) {
  if (!isOpen) return null

  const calculateAchievements = () => {
    const focusSessions = sessions.filter(s => s.type === 'focus' && s.completed)
    const totalFocusTime = focusSessions.reduce((total, session) => total + session.duration, 0) / 60 // em minutos
    
    // Calcular streak
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)
    
    for (let i = 0; i < 30; i++) { // máximo 30 dias
      const dateStr = currentDate.toDateString()
      const daySessions = sessions.filter(session => 
        new Date(session.date).toDateString() === dateStr && 
        session.type === 'focus' && 
        session.completed
      )
      
      if (daySessions.length > 0) {
        streak++
      } else if (i > 0) { // não quebrar no primeiro dia se não houver sessões hoje
        break
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return {
      firstSession: focusSessions.length,
      focused: focusSessions.length,
      dedicated: focusSessions.length,
      streak: streak,
      timeSpent: Math.round(totalFocusTime)
    }
  }

  const achievements = calculateAchievements()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <AchievementBadge 
              type="firstSession" 
              count={achievements.firstSession}
            />
            <AchievementBadge 
              type="focused" 
              count={achievements.focused}
            />
            <AchievementBadge 
              type="dedicated" 
              count={achievements.dedicated}
            />
            <AchievementBadge 
              type="streak" 
              count={achievements.streak}
            />
            <AchievementBadge 
              type="timeSpent" 
              count={achievements.timeSpent}
            />
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Continue focando para desbloquear mais conquistas!
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

