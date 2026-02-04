import GanttLane from './components/GanttLane'
import WeekHeader from './components/WeekHeader'
import { laneIds, laneLabels, tasks, weekStart } from './data/gantt'
import { addDays, parseDate } from './helpers/date'

function App() {
  const weekStartDate = parseDate(weekStart)
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStartDate, index),
  )

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
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
