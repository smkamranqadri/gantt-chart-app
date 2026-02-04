import { useEffect, useMemo, useRef, useState } from 'react'
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
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

function TaskModal({
  isOpen,
  weekStart,
  onClose,
  onSubmit,
  triggerRef,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [laneId, setLaneId] = useState<LaneId>('backend')
  const [start, setStart] = useState(formatDate(weekStart))
  const [end, setEnd] = useState(formatDate(weekStart))
  const [error, setError] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const range = useMemo(() => {
    const startDate = formatDate(weekStart)
    return { startDate }
  }, [weekStart])

  useEffect(() => {
    if (!isOpen) return

    const previousActive = document.activeElement as HTMLElement | null
    const triggerElement = triggerRef?.current ?? null
    titleInputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
      previousActive?.focus?.()
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('Title is required.')
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
      <div
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        aria-describedby="task-modal-description"
        ref={modalRef}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="task-modal-title"
              className="text-xl font-semibold text-slate-900"
            >
              Add new task
            </h2>
            <p
              id="task-modal-description"
              className="mt-1 text-sm text-slate-600"
            >
              Choose a lane and date range for the task.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full px-2 text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close modal"
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
              ref={titleInputRef}
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
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Default start: {range.startDate}</span>
            <span>{totalDays}-day sprint view</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
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
