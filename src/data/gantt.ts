import type { LaneId, Task } from '../types/gantt'

export const weekStart = '2026-02-02'
export const dayWidth = 120

export const laneIds: LaneId[] = ['backend', 'frontend', 'qa']

export const laneLabels: Record<LaneId, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  qa: 'QA',
}

export const laneColors: Record<LaneId, string> = {
  backend: 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-white',
  frontend: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white',
  qa: 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900',
}

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'API scaffolding',
    laneId: 'backend',
    start: '2026-02-02',
    end: '2026-02-04',
  },
  {
    id: 'task-2',
    title: 'UI layout',
    laneId: 'frontend',
    start: '2026-02-03',
    end: '2026-02-06',
  },
  {
    id: 'task-3',
    title: 'Regression pass',
    laneId: 'qa',
    start: '2026-02-05',
    end: '2026-02-07',
  },
]
