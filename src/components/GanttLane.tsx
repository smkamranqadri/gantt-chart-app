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
  onDragStart: (task: Task, clientX: number) => void
  onResizeStart: (task: Task, clientX: number) => void
}

function GanttLane({
  laneId,
  tasks,
  weekStart,
  label,
  onDragStart,
  onResizeStart,
}: GanttLaneProps) {
  const sortedTasks = [...tasks].sort(
    (a, b) => daysBetween(weekStart, a.start) - daysBetween(weekStart, b.start),
  )

  const rowAssignments = new Map<string, number>()
  const rowEndIndices: number[] = []

  sortedTasks.forEach((task) => {
    const startIndex = daysBetween(weekStart, task.start)
    const endIndex = daysBetween(weekStart, task.end)
    const rowIndex = rowEndIndices.findIndex((end) => end < startIndex)

    if (rowIndex === -1) {
      rowEndIndices.push(endIndex)
      rowAssignments.set(task.id, rowEndIndices.length - 1)
    } else {
      rowEndIndices[rowIndex] = endIndex
      rowAssignments.set(task.id, rowIndex)
    }
  })

  const totalRows = Math.max(rowEndIndices.length, 1)
  const laneHeight =
    totalRows * rowHeight + (totalRows - 1) * rowGap + rowOffset

  return (
    <div className="grid grid-cols-[160px_repeat(7,120px)]">
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
              className="border-l border-dashed border-slate-200"
            />
          ))}
        </div>
        {tasks.map((task) => {
          const startIndex = daysBetween(weekStart, task.start)
          const endIndex = daysBetween(weekStart, task.end)
          const left = startIndex * dayWidth
          const width = (endIndex - startIndex + 1) * dayWidth
          const rowIndex = rowAssignments.get(task.id) ?? 0
          const top = rowOffset + rowIndex * (rowHeight + rowGap)

          return (
            <div
              key={task.id}
              className={`group absolute top-3 h-11 cursor-grab rounded-xl px-3 py-2 text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(15,23,42,0.6)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-16px_rgba(15,23,42,0.65)] active:cursor-grabbing ${laneColors[laneId]}`}
              style={{ left, width, top }}
              onPointerDown={(event) => {
                event.preventDefault()
                onDragStart(task, event.clientX)
              }}
            >
              {task.title}
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
        })}
      </div>
    </div>
  )
}

export default GanttLane
