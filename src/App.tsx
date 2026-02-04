import { useEffect, useMemo, useState } from 'react'
import GanttLane from './components/GanttLane'
import TaskModal from './components/TaskModal'
import WeekHeader from './components/WeekHeader'
import {
  dayWidth,
  laneIds,
  laneLabels,
  tasks as seedTasks,
  weekStart,
} from './data/gantt'
import { addDays, daysBetween, formatDate, parseDate } from './helpers/date'
import type { Task } from './types/gantt'

type DragMode = 'move' | 'resize'

type DragState = {
  taskId: string
  mode: DragMode
  startClientX: number
  startIndex: number
  endIndex: number
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const weekStartDate = parseDate(weekStart)
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStartDate, index),
  )

  const taskIndexMap = useMemo(() => {
    return new Map(
      tasks.map((task) => [
        task.id,
        {
          startIndex: daysBetween(weekStart, task.start),
          endIndex: daysBetween(weekStart, task.end),
        },
      ]),
    )
  }, [tasks])

  useEffect(() => {
    if (!dragState) return

    const handlePointerMove = (event: PointerEvent) => {
      const deltaDays = Math.round(
        (event.clientX - dragState.startClientX) / dayWidth,
      )

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== dragState.taskId) return task

          if (dragState.mode === 'move') {
            const duration = dragState.endIndex - dragState.startIndex
            const nextStart = Math.min(
              Math.max(dragState.startIndex + deltaDays, 0),
              6 - duration,
            )
            const nextEnd = nextStart + duration

            return {
              ...task,
              start: formatDate(addDays(weekStartDate, nextStart)),
              end: formatDate(addDays(weekStartDate, nextEnd)),
            }
          }

          const nextEnd = Math.min(
            Math.max(dragState.endIndex + deltaDays, dragState.startIndex),
            6,
          )

          return {
            ...task,
            end: formatDate(addDays(weekStartDate, nextEnd)),
          }
        }),
      )
    }

    const handlePointerUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, taskIndexMap, weekStartDate])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Week of {weekStart}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Gantt Chart Proof of Concept
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Static layout for a 7-day sprint (Mon–Sun).
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            + Task
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <WeekHeader days={weekDays} />

              <div className="divide-y divide-slate-200">
                {laneIds.map((laneId) => (
                  <GanttLane
                    key={laneId}
                    laneId={laneId}
                    label={laneLabels[laneId]}
                    tasks={tasks.filter((task) => task.laneId === laneId)}
                    weekStart={weekStart}
                    onDragStart={(task, clientX) => {
                      const current = taskIndexMap.get(task.id)
                      if (!current) return
                      setDragState({
                        taskId: task.id,
                        mode: 'move',
                        startClientX: clientX,
                        startIndex: current.startIndex,
                        endIndex: current.endIndex,
                      })
                    }}
                    onResizeStart={(task, clientX) => {
                      const current = taskIndexMap.get(task.id)
                      if (!current) return
                      setDragState({
                        taskId: task.id,
                        mode: 'resize',
                        startClientX: clientX,
                        startIndex: current.startIndex,
                        endIndex: current.endIndex,
                      })
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        weekStart={weekStartDate}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(task) => {
          setTasks((prev) => [...prev, task])
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}

export default App
