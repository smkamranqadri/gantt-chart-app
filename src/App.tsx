import { useEffect, useMemo, useRef, useState } from 'react'
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
  latestClientX: number
  startDate: string
  endDate: string
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [weekStartDate, setWeekStartDate] = useState(parseDate(weekStart))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const addTaskButtonRef = useRef<HTMLButtonElement>(null)
  const historyRef = useRef<Task[][]>([])
  const redoRef = useRef<Task[][]>([])
  const tasksRef = useRef<Task[]>(seedTasks)

  const weekStartValue = formatDate(weekStartDate)
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStartDate, index),
  )

  const todayIndex = useMemo(() => {
    const today = formatDate(new Date())
    const index = daysBetween(weekStartValue, today)
    return index >= 0 && index <= 6 ? index : null
  }, [weekStartValue])

  const taskIndexMap = useMemo(() => {
    return new Map(
      tasks.map((task) => [
        task.id,
        {
          startIndex: daysBetween(weekStartValue, task.start),
          endIndex: daysBetween(weekStartValue, task.end),
        },
      ]),
    )
  }, [tasks, weekStartValue])

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    const handleUndo = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        const previous = historyRef.current.pop()
        if (previous) {
          redoRef.current.push(tasksRef.current.map((task) => ({ ...task })))
          setTasks(previous)
          setCanUndo(historyRef.current.length > 0)
          setCanRedo(redoRef.current.length > 0)
        }
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === 'y' ||
          (event.shiftKey && event.key.toLowerCase() === 'z'))
      ) {
        event.preventDefault()
        const next = redoRef.current.pop()
        if (next) {
          historyRef.current.push(tasksRef.current.map((task) => ({ ...task })))
          setTasks(next)
          setCanUndo(historyRef.current.length > 0)
          setCanRedo(redoRef.current.length > 0)
        }
      }
    }

    window.addEventListener('keydown', handleUndo)
    return () => window.removeEventListener('keydown', handleUndo)
  }, [])

  const pushHistory = (snapshot: Task[]) => {
    historyRef.current.push(snapshot.map((task) => ({ ...task })))
    redoRef.current = []
    setCanUndo(true)
    setCanRedo(false)
  }

  const handleUndoClick = () => {
    const previous = historyRef.current.pop()
    if (previous) {
      redoRef.current.push(tasksRef.current.map((task) => ({ ...task })))
      setTasks(previous)
      setCanUndo(historyRef.current.length > 0)
      setCanRedo(redoRef.current.length > 0)
    }
  }

  const handleRedoClick = () => {
    const next = redoRef.current.pop()
    if (next) {
      historyRef.current.push(tasksRef.current.map((task) => ({ ...task })))
      setTasks(next)
      setCanUndo(historyRef.current.length > 0)
      setCanRedo(redoRef.current.length > 0)
    }
  }

  const getLaneIdFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y)
    if (!element) return null
    const laneElement = element.closest('[data-lane-id]')
    return laneElement?.getAttribute('data-lane-id') as Task['laneId'] | null
  }

  useEffect(() => {
    if (!dragState) return

    const handlePointerMove = (event: PointerEvent) => {
      setDragState((prev) =>
        prev ? { ...prev, latestClientX: event.clientX } : prev,
      )

      const deltaDays = Math.round(
        (event.clientX - dragState.startClientX) / dayWidth,
      )
      const nextLaneId =
        dragState.mode === 'move'
          ? getLaneIdFromPoint(event.clientX, event.clientY)
          : null

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== dragState.taskId) return task

          if (dragState.mode === 'move') {
            return {
              ...task,
              start: formatDate(
                addDays(parseDate(dragState.startDate), deltaDays),
              ),
              end: formatDate(addDays(parseDate(dragState.endDate), deltaDays)),
              laneId: nextLaneId ?? task.laneId,
            }
          }

          return task
        }),
      )
    }

    const handlePointerUp = () => {
      if (dragState.mode === 'resize') {
        const deltaDays = Math.round(
          (dragState.latestClientX - dragState.startClientX) / dayWidth,
        )

        setTasks((prev) =>
          prev.map((task) => {
            if (task.id !== dragState.taskId) return task

            const nextEndDate = addDays(parseDate(dragState.endDate), deltaDays)
            const startDate = parseDate(dragState.startDate)
            const safeEnd =
              nextEndDate.getTime() < startDate.getTime()
                ? startDate
                : nextEndDate

            return {
              ...task,
              end: formatDate(safeEnd),
            }
          }),
        )
      }
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
    <div className="page-fade-in min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Week of {weekStartValue}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Gantt Chart Proof of Concept
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Static layout for a 7-day sprint (Mon–Sun).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}
              >
                Prev
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Week
              </span>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}
              >
                Next
              </button>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
                onClick={handleUndoClick}
                disabled={!canUndo}
                title="Undo (Ctrl+Z / Cmd+Z)"
              >
                Undo
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
                onClick={handleRedoClick}
                disabled={!canRedo}
                title="Redo (Ctrl+Y / Cmd+Shift+Z)"
              >
                Redo
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setIsModalOpen(true)}
              ref={addTaskButtonRef}
            >
              + Task
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <WeekHeader days={weekDays} todayIndex={todayIndex} />

              <div className="divide-y divide-slate-200">
                {laneIds.map((laneId) => (
                  <GanttLane
                    key={laneId}
                    laneId={laneId}
                    label={laneLabels[laneId]}
                    tasks={tasks.filter((task) => task.laneId === laneId)}
                    weekStart={weekStartValue}
                    todayIndex={todayIndex}
                    draggingTaskId={dragState?.taskId ?? null}
                    dragMode={dragState?.mode ?? null}
                    resizeDeltaPx={
                      dragState?.mode === 'resize'
                        ? dragState.latestClientX - dragState.startClientX
                        : 0
                    }
                    onDragStart={(task, clientX) => {
                      const current = taskIndexMap.get(task.id)
                      if (!current) return
                      pushHistory(tasks)
                      setDragState({
                        taskId: task.id,
                        mode: 'move',
                        startClientX: clientX,
                        startIndex: current.startIndex,
                        endIndex: current.endIndex,
                        latestClientX: clientX,
                        startDate: task.start,
                        endDate: task.end,
                      })
                    }}
                    onResizeStart={(task, clientX) => {
                      const current = taskIndexMap.get(task.id)
                      if (!current) return
                      pushHistory(tasks)
                      setDragState({
                        taskId: task.id,
                        mode: 'resize',
                        startClientX: clientX,
                        startIndex: current.startIndex,
                        endIndex: current.endIndex,
                        latestClientX: clientX,
                        startDate: task.start,
                        endDate: task.end,
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
          pushHistory(tasks)
          setTasks((prev) => [...prev, task])
          setIsModalOpen(false)
        }}
        triggerRef={addTaskButtonRef}
      />
    </div>
  )
}

export default App
