import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
  title: string
  description: string
  time: string
  type?: 'success' | 'pending' | 'warning'
}

const typeColors = {
  success: 'bg-green-50 text-green-600',
  pending: 'bg-blue-50 text-blue-600',
  warning: 'bg-orange-50 text-orange-600',
}

export function ActivityItem({

  title,
  description,
  time,
  type = 'pending',
}: ActivityItemProps) {
  return (
    <div className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
      <div className={cn('p-2.5 rounded-lg h-fit', typeColors[type])}>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
        <p className="text-xs text-slate-600 mt-2">{time}</p>
      </div>
    </div>
  )
}