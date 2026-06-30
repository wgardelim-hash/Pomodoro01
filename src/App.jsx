import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Play, Pause, RotateCcw, Settings, Sun, Moon, BarChart3, Award } from 'lucide-react'
import { SettingsModal } from './components/SettingsModal.jsx'
import { StatsModal } from './components/StatsModal.jsx'
import { AchievementsModal } from './components/AchievementsModal.jsx'
import './App.css'

function App() {
  // Estados principais
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutos em segundos
  const [isActive, setIsActive] = useState(false)
  const [currentSession, setCurrentSession] = useState('focus') // 'focus', 'shortBreak', 'longBreak'
  const [sessionCount, setSessionCount] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [sessions, setSessions] = useState([])
  
  // Configurações personalizáveis
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    soundEnabled: true,
    desktopNotifications: false
  })
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)
  
  // Carregar dados do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings')
    const savedSessions = localStorage.getItem('pomodoro-sessions')
    const savedSessionCount = localStorage.getItem('pomodoro-session-count')
    const savedDarkMode = localStorage.getItem('pomodoro-dark-mode')
    
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      setSettings(parsedSettings)
      setTimeLeft(parsedSettings.focusTime * 60)
    }
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
    
    if (savedSessionCount) {
      setSessionCount(parseInt(savedSessionCount))
    }
    
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode)
      setIsDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      // Configurar modo escuro baseado na preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])
  
  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])
  
  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions))
  }, [sessions])
  
  useEffect(() => {
    localStorage.setItem('pomodoro-session-count', sessionCount.toString())
  }, [sessionCount])
  
  useEffect(() => {
    localStorage.setItem('pomodoro-dark-mode', JSON.stringify(isDarkMode))
  }, [isDarkMode])
  
  // Solicitar permissão para notificações
  useEffect(() => {
    if (settings.desktopNotifications && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [settings.desktopNotifications])
  
  // Lógica do timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Sessão completada
      handleSessionComplete()
    } else {
      clearInterval(intervalRef.current)
    }
    
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft])
  
  const handleSessionComplete = () => {
    setIsActive(false)
    
    // Registrar sessão no histórico
    const newSession = {
      type: currentSession,
      duration: getSessionTime(currentSession) * 60,
      date: new Date().toISOString(),
      completed: true
    }
    setSessions(prev => [...prev, newSession])
    
    if (currentSession === 'focus') {
      setSessionCount(prev => prev + 1)
      // Após 4 sessões de foco, pausa longa
      if ((sessionCount + 1) % 4 === 0) {
        setCurrentSession('longBreak')
        setTimeLeft(settings.longBreakTime * 60)
      } else {
        setCurrentSession('shortBreak')
        setTimeLeft(settings.shortBreakTime * 60)
      }
    } else {
      setCurrentSession('focus')
      setTimeLeft(settings.focusTime * 60)
    }
    
    // Notificações
    playNotificationSound()
    showDesktopNotification()
  }
  
  const playNotificationSound = () => {
    if (settings.soundEnabled) {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  }
  
  const showDesktopNotification = () => {
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const title = currentSession === 'focus' ? 'Sessão de foco concluída!' : 'Pausa concluída!'
      const body = currentSession === 'focus' 
        ? 'Hora de fazer uma pausa!' 
        : 'Hora de voltar ao foco!'
      
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      })
    }
  }
  
  const toggleTimer = () => {
    setIsActive(!isActive)
  }
  
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(getSessionTime(currentSession) * 60)
  }
  
  const getSessionTime = (session) => {
    switch (session) {
      case 'focus': return settings.focusTime
      case 'shortBreak': return settings.shortBreakTime
      case 'longBreak': return settings.longBreakTime
      default: return settings.focusTime
    }
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const getSessionTitle = () => {
    switch (currentSession) {
      case 'focus': return 'Foco'
      case 'shortBreak': return 'Pausa Curta'
      case 'longBreak': return 'Pausa Longa'
      default: return 'Foco'
    }
  }
  
  const getSessionColor = () => {
    switch (currentSession) {
      case 'focus': return 'text-red-500'
      case 'shortBreak': return 'text-green-500'
      case 'longBreak': return 'text-blue-500'
      default: return 'text-red-500'
    }
  }
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }
  
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    // Atualizar tempo atual se não estiver ativo
    if (!isActive) {
      setTimeLeft(getSessionTime(currentSession) * 60)
    }
  }
  
  const getTodaySessionCount = () => {
    const today = new Date().toDateString()
    return sessions.filter(session => 
      new Date(session.date).toDateString() === today && session.type === 'focus'
    ).length
  }
  
  const progress = ((getSessionTime(currentSession) * 60 - timeLeft) / (getSessionTime(currentSession) * 60)) * 100

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setShowStats(true)}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setShowAchievements(true)}
          >
            <Award className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Timer */}
      <main className="flex flex-col items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            {/* Session Type */}
            <h2 className={`text-xl font-semibold mb-2 ${getSessionColor()}`}>
              {getSessionTitle()}
            </h2>
            
            {/* Progress Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 ease-in-out ${
                    currentSession === 'focus' ? 'text-red-500 drop-shadow-sm' :
                    currentSession === 'shortBreak' ? 'text-green-500 drop-shadow-sm' : 'text-blue-500 drop-shadow-sm'
                  }`}
                  strokeLinecap="round"
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                  }}
                />
                {/* Glow effect when active */}
                {isActive && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={`transition-all duration-1000 ease-in-out opacity-30 ${
                      currentSession === 'focus' ? 'text-red-500' :
                      currentSession === 'shortBreak' ? 'text-green-500' : 'text-blue-500'
                    }`}
                    strokeLinecap="round"
                    style={{
                      filter: 'blur(2px)'
                    }}
                  />
                )}
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-mono font-bold transition-all duration-300 ${
                  isActive ? 'text-foreground scale-105' : 'text-foreground'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`rounded-full w-16 h-16 transition-all duration-300 transform hover:scale-110 ${
                  isActive 
                    ? 'bg-secondary hover:bg-secondary/80 shadow-lg' 
                    : 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl'
                }`}
              >
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Session Counter */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-muted-foreground">
            Sessões de foco completadas hoje: <span className="font-semibold text-foreground">{getTodaySessionCount()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Próxima pausa {sessionCount % 4 === 3 ? 'longa' : 'curta'} em {4 - (sessionCount % 4)} sessão(ões)
          </p>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
      
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        sessions={sessions}
      />
      
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        sessions={sessions}
      />
    </div>
  )
}

export default App

