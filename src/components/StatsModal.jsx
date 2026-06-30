import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { X, Calendar, Clock, Target, TrendingUp } from 'lucide-react'

export function StatsModal({ isOpen, onClose, sessions }) {
  const [weeklyStats, setWeeklyStats] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
    dailyAverage: 0,
    streak: 0
  })

  useEffect(() => {
    if (sessions.length > 0) {
      calculateWeeklyStats()
    }
  }, [sessions])

  const calculateWeeklyStats = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weekSessions = sessions.filter(session => 
      new Date(session.date) >= weekAgo && session.type === 'focus'
    )
    
    const totalSessions = weekSessions.length
    const totalFocusTime = weekSessions.reduce((total, session) => 
      total + session.duration, 0
    )
    
    setWeeklyStats({
      totalSessions,
      totalFocusTime: Math.round(totalFocusTime / 60), // em minutos
      dailyAverage: Math.round(totalSessions / 7),
      streak: calculateStreak()
    })
  }

  const calculateStreak = () => {
    if (sessions.length === 0) return 0
    
    const today = new Date().toDateString()
    const todaySessions = sessions.filter(session => 
      new Date(session.date).toDateString() === today && session.type === 'focus'
    )
    
    if (todaySessions.length === 0) return 0
    
    let streak = 1
    let currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 1)
    
    while (streak < 30) { // máximo 30 dias
      const dateStr = currentDate.toDateString()
      const daySessions = sessions.filter(session => 
        new Date(session.date).toDateString() === dateStr && session.type === 'focus'
      )
      
      if (daySessions.length === 0) break
      
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }

  const getTodayStats = () => {
    const today = new Date().toDateString()
    const todaySessions = sessions.filter(session => 
      new Date(session.date).toDateString() === today
    )
    
    const focusSessions = todaySessions.filter(s => s.type === 'focus').length
    const totalTime = todaySessions
      .filter(s => s.type === 'focus')
      .reduce((total, session) => total + session.duration, 0)
    
    return {
      sessions: focusSessions,
      time: Math.round(totalTime / 60) // em minutos
    }
  }

  const todayStats = getTodayStats()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Estatísticas</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas de Hoje */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Hoje
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-500">{todayStats.sessions}</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{todayStats.time}m</div>
                <div className="text-sm text-muted-foreground">Foco</div>
              </div>
            </div>
          </div>

          {/* Estatísticas da Semana */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Últimos 7 dias
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">{weeklyStats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total de Sessões</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{weeklyStats.totalFocusTime}m</div>
                <div className="text-sm text-muted-foreground">Tempo Total</div>
              </div>
            </div>
          </div>

          {/* Streak e Média */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Conquistas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{weeklyStats.streak}</div>
                <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-cyan-500">{weeklyStats.dailyAverage}</div>
                <div className="text-sm text-muted-foreground">Média Diária</div>
              </div>
            </div>
          </div>

          {/* Histórico Recente */}
          {sessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Histórico Recente
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {sessions.slice(-5).reverse().map((session, index) => (
                  <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                    <span className={`capitalize ${
                      session.type === 'focus' ? 'text-red-500' :
                      session.type === 'shortBreak' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {session.type === 'focus' ? 'Foco' :
                       session.type === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(session.duration / 60)}m - {new Date(session.date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

