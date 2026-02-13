import { memo } from 'react'
import type { LaneId, Task } from '../types/gantt'
import { dayWidth, laneColors } from '../data/gantt'
import { daysBetween } from '../helpers/date'
import TaskBar from './TaskBar'

const totalDays = 7
const rowHeight = 56
const rowGap = 12
const rowOffset = 12
const milestoneMarkerWidth = Math.round(dayWidth * 0.28)

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
  onEditRequest: (taskId: string) => void
  dependencyLabelById: Map<string, string>
  criticalTaskIdSet: ReadonlySet<string>
  criticalOrderById: ReadonlyMap<string, number>
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
  onEditRequest,
  dependencyLabelById,
  criticalTaskIdSet,
  criticalOrderById,
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
              className={`border-l border-dashed border-slate-200/70 ${
                todayIndex === index ? 'bg-sky-100/70' : ''
              }`}
            />
          ))}
        </div>
        {taskBounds.map(
          ({ task, visibleStart, visibleEnd, startIndex, endIndex }) => {
            const isMilestone = task.kind === 'milestone'
            const left = isMilestone
              ? visibleStart * dayWidth +
                dayWidth / 2 -
                milestoneMarkerWidth / 2
              : visibleStart * dayWidth
            const baseWidth = isMilestone
              ? milestoneMarkerWidth
              : (visibleEnd - visibleStart + 1) * dayWidth
            const maxVisibleWidth = (totalDays - visibleStart) * dayWidth
            const smoothWidth =
              !isMilestone &&
              dragMode === 'resize' &&
              draggingTaskId === task.id
                ? Math.min(
                    Math.max(baseWidth + resizeDeltaPx, dayWidth),
                    maxVisibleWidth,
                  )
                : baseWidth
            const rowIndex = rowAssignments.get(task.id) ?? 0
            const top = rowOffset + rowIndex * (rowHeight + rowGap)
            const continuesBefore = startIndex < 0
            const continuesAfter = endIndex > totalDays - 1
            const dependencySummary =
              task.dependsOn.length > 0
                ? `Depends on: ${task.dependsOn
                    .map(
                      (dependencyId) =>
                        `${dependencyId} (${dependencyLabelById.get(dependencyId) ?? dependencyId})`,
                    )
                    .join(', ')}`
                : null
            const criticalOrder = criticalOrderById.get(task.id)

            return (
              <TaskBar
                key={task.id}
                task={task}
                left={left}
                width={smoothWidth}
                top={top}
                className={laneColors[laneId]}
                isDragging={draggingTaskId === task.id}
                continuesBefore={continuesBefore}
                continuesAfter={continuesAfter}
                onDragStart={onDragStart}
                onResizeStart={onResizeStart}
                onEditRequest={onEditRequest}
                dependencySummary={dependencySummary}
                dependencyCount={task.dependsOn.length}
                isCritical={criticalTaskIdSet.has(task.id)}
                criticalOrderLabel={
                  typeof criticalOrder === 'number' ? `#${criticalOrder}` : null
                }
              />
            )
          },
        )}
      </div>
    </div>
  )
}

export default memo(GanttLane)
