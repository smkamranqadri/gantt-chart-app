import { useMemo, useState } from 'react'
import type { LaneId, Task } from '../types/gantt'
import { formatDate } from '../helpers/date'

const totalDays = 7

const laneOptions: { id: LaneId; label: string }[] = [
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'qa', label: 'QA' },
]

type TaskModalProps = {
  isOpen: boolean
  weekStart: Date
  onClose: () => void
  onSubmit: (task: Task) => void
}

function TaskModal({ isOpen, weekStart, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [laneId, setLaneId] = useState<LaneId>('backend')
  const [start, setStart] = useState(formatDate(weekStart))
  const [end, setEnd] = useState(formatDate(weekStart))
  const [error, setError] = useState('')

  const range = useMemo(() => {
    const startDate = formatDate(weekStart)
    const endDate = formatDate(new Date(weekStart.getTime() + 6 * 86400000))
    return { startDate, endDate }
  }, [weekStart])

  if (!isOpen) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if (start < range.startDate || end > range.endDate) {
      setError('Dates must be within the visible week.')
      return
    }

    if (end < start) {
      setError('End date must be the same or after start date.')
      return
    }

    setError('')

    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      laneId,
      start,
      end,
    })

    setTitle('')
    setLaneId('backend')
    setStart(range.startDate)
    setEnd(range.startDate)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Add new task
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose a lane and date range within the current week.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full px-2 text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Design review"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lane
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={laneId}
              onChange={(event) => setLaneId(event.target.value as LaneId)}
            >
              {laneOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                min={range.startDate}
                max={range.endDate}
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                End
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                min={range.startDate}
                max={range.endDate}
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Range: {range.startDate} — {range.endDate}
            </span>
            <span>{totalDays}-day sprint</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
