import { Trophy, Target, Flame, Clock, Star } from 'lucide-react'

export function AchievementBadge({ type, count, unlocked = false }) {
  const achievements = {
    firstSession: {
      icon: Star,
      title: 'Primeira Sessão',
      description: 'Complete sua primeira sessão de foco',
      threshold: 1,
      color: 'text-yellow-500'
    },
    focused: {
      icon: Target,
      title: 'Focado',
      description: 'Complete 5 sessões de foco',
      threshold: 5,
      color: 'text-blue-500'
    },
    dedicated: {
      icon: Trophy,
      title: 'Dedicado',
      description: 'Complete 25 sessões de foco',
      threshold: 25,
      color: 'text-purple-500'
    },
    streak: {
      icon: Flame,
      title: 'Em Chamas',
      description: 'Mantenha uma sequência de 7 dias',
      threshold: 7,
      color: 'text-orange-500'
    },
    timeSpent: {
      icon: Clock,
      title: 'Maratonista',
      description: 'Acumule 10 horas de foco',
      threshold: 600, // em minutos
      color: 'text-green-500'
    }
  }

  const achievement = achievements[type]
  if (!achievement) return null

  const Icon = achievement.icon
  const progress = Math.min((count / achievement.threshold) * 100, 100)
  const isUnlocked = count >= achievement.threshold

  return (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800' 
        : 'bg-muted border-border opacity-60'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
            : 'bg-muted-foreground/20'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${
            isUnlocked ? achievement.color : 'text-muted-foreground'
          }`}>
            {achievement.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {achievement.description}
          </p>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-muted-foreground/30'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="mt-1 text-xs text-muted-foreground">
            {count} / {achievement.threshold}
            {type === 'timeSpent' && ' min'}
            {type === 'streak' && ' dias'}
          </div>
        </div>
        
        {isUnlocked && (
          <div className="text-yellow-500">
            <Trophy className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  )
}

