import type { LaneId, Task } from '../types/gantt'
import { dayWidth, laneColors } from '../data/gantt'
import { daysBetween } from '../helpers/date'

const totalDays = 7
const rowHeight = 56
const rowGap = 12
const rowOffset = 12

type GanttLaneProps = {
  laneId: LaneId
  tasks: Task[]
  weekStart: string
  label: string
  todayIndex: number | null
  draggingTaskId: string | null
  dragMode: 'move' | 'resize' | null
  resizeDeltaPx: number
  onDragStart: (task: Task, clientX: number) => void
  onResizeStart: (task: Task, clientX: number) => void
}

function GanttLane({
  laneId,
  tasks,
  weekStart,
  label,
  todayIndex,
  draggingTaskId,
  dragMode,
  resizeDeltaPx,
  onDragStart,
  onResizeStart,
}: GanttLaneProps) {
  const taskBounds = tasks
    .map((task) => {
      const startIndex = daysBetween(weekStart, task.start)
      const endIndex = daysBetween(weekStart, task.end)
      const visibleStart = Math.max(startIndex, 0)
      const visibleEnd = Math.min(endIndex, totalDays - 1)
      const isVisible = visibleEnd >= 0 && visibleStart <= totalDays - 1
      return {
        task,
        startIndex,
        endIndex,
        visibleStart,
        visibleEnd,
        isVisible,
      }
    })
    .filter((item) => item.isVisible)

  const sortedTasks = [...taskBounds].sort(
    (a, b) => a.visibleStart - b.visibleStart,
  )

  const rowAssignments = new Map<string, number>()
  const rowEndIndices: number[] = []

  sortedTasks.forEach(({ task, visibleStart, visibleEnd }) => {
    const rowIndex = rowEndIndices.findIndex((end) => end < visibleStart)

    if (rowIndex === -1) {
      rowEndIndices.push(visibleEnd)
      rowAssignments.set(task.id, rowEndIndices.length - 1)
    } else {
      rowEndIndices[rowIndex] = visibleEnd
      rowAssignments.set(task.id, rowIndex)
    }
  })

  const totalRows = Math.max(rowEndIndices.length, 1)
  const laneHeight =
    totalRows * rowHeight + (totalRows - 1) * rowGap + rowOffset

  return (
    <div
      className="grid grid-cols-[160px_repeat(7,120px)]"
      data-lane-id={laneId}
    >
      <div className="grid place-items-center bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-700 text-center">
        {label}
      </div>
      <div
        className="relative col-span-7 bg-white"
        style={{ minHeight: `${laneHeight}px` }}
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
          {Array.from({ length: totalDays }, (_, index) => (
            <div
              key={index}
              className={`border-l border-dashed border-slate-200 ${
                todayIndex === index ? 'bg-sky-50/60' : ''
              }`}
            />
          ))}
        </div>
        {taskBounds.map(
          ({ task, visibleStart, visibleEnd, startIndex, endIndex }) => {
            const left = visibleStart * dayWidth
            const baseWidth = (visibleEnd - visibleStart + 1) * dayWidth
            const maxVisibleWidth = (totalDays - visibleStart) * dayWidth
            const smoothWidth =
              dragMode === 'resize' && draggingTaskId === task.id
                ? Math.min(
                    Math.max(baseWidth + resizeDeltaPx, dayWidth),
                    maxVisibleWidth,
                  )
                : baseWidth
            const rowIndex = rowAssignments.get(task.id) ?? 0
            const top = rowOffset + rowIndex * (rowHeight + rowGap)
            const continuesBefore = startIndex < 0
            const continuesAfter = endIndex > totalDays - 1

            return (
              <div
                key={task.id}
                className={`group absolute top-3 h-11 cursor-grab rounded-xl px-3 py-2 text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(15,23,42,0.6)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-16px_rgba(15,23,42,0.65)] active:cursor-grabbing ${laneColors[laneId]} ${
                  continuesBefore ? 'rounded-l-sm' : ''
                } ${continuesAfter ? 'rounded-r-sm' : ''} ${
                  draggingTaskId === task.id ? 'opacity-70' : ''
                }`}
                style={{ left, width: smoothWidth, top }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  onDragStart(task, event.clientX)
                }}
              >
                <span className="block truncate">{task.title}</span>
                <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full opacity-0 transition group-hover:opacity-100">
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
                    {task.start} → {task.end}
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
          },
        )}
      </div>
    </div>
  )
}

export default GanttLane
