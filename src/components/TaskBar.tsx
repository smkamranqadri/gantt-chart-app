import { memo } from 'react'
import type { Task } from '../types/gantt'

type TaskBarProps = {
  task: Task
  left: number
  width: number
  top: number
  className: string
  isDragging: boolean
  continuesBefore: boolean
  continuesAfter: boolean
  onDragStart: (task: Task, clientX: number) => void
  onResizeStart: (task: Task, clientX: number) => void
  onEditRequest: (taskId: string) => void
  dependencySummary: string | null
  dependencyCount: number
}

function TaskBar({
  task,
  left,
  width,
  top,
  className,
  isDragging,
  continuesBefore,
  continuesAfter,
  onDragStart,
  onResizeStart,
  onEditRequest,
  dependencySummary,
  dependencyCount,
}: TaskBarProps) {
  return (
    <div
      className={`group absolute top-3 h-11 cursor-grab rounded-xl px-3 py-2 text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(15,23,42,0.6)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-16px_rgba(15,23,42,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-700 active:cursor-grabbing ${className} ${
        continuesBefore ? 'rounded-l-sm' : ''
      } ${continuesAfter ? 'rounded-r-sm' : ''} ${
        isDragging ? 'opacity-70' : ''
      }`}
      style={{ left, width, top }}
      onPointerDown={(event) => {
        if (event.detail > 1) return
        event.preventDefault()
        onDragStart(task, event.clientX)
      }}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onEditRequest(task.id)
      }}
    >
      <span className="block truncate">{task.title}</span>
      {dependencyCount > 0 ? (
        <span className="absolute right-2 top-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
          Deps: {dependencyCount}
        </span>
      ) : null}
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full opacity-0 transition group-hover:opacity-100">
        <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
          <div>
            {task.start} → {task.end}
          </div>
          {dependencySummary ? (
            <div className="mt-1 max-w-[260px] text-[11px] text-slate-200">
              {dependencySummary}
            </div>
          ) : null}
        </div>
        <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 rounded-sm bg-slate-900" />
      </div>
      {continuesBefore ? (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-white/70">
          ◀
        </span>
      ) : null}
      {continuesAfter ? (
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-white/70">
          ▶
        </span>
      ) : null}
      <div
        role="presentation"
        className="absolute right-1 top-1/2 h-6 w-2 -translate-y-1/2 cursor-ew-resize rounded-full bg-white/80 opacity-0 shadow-sm transition group-hover:opacity-100 group-active:opacity-100"
        onPointerDown={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onResizeStart(task, event.clientX)
        }}
      />
    </div>
  )
}

export default memo(TaskBar)
