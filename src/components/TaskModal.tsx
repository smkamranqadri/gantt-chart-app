import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildDependencyCandidates,
  validateDependencySelection,
} from '../helpers/dependencyAuthoring'
import { formatDate } from '../helpers/date'
import type { LaneId, Task } from '../types/gantt'

const totalDays = 7

const laneOptions: { id: LaneId; label: string }[] = [
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'qa', label: 'QA' },
]

export type TaskModalMode = 'create' | 'edit'

type TaskModalProps = {
  isOpen: boolean
  mode: TaskModalMode
  weekStart: Date
  allTasks: Task[]
  initialTask: Task | null
  onClose: () => void
  onSubmit: (task: Task, mode: TaskModalMode) => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

function TaskModal({
  isOpen,
  mode,
  weekStart,
  allTasks,
  initialTask,
  onClose,
  onSubmit,
  triggerRef,
}: TaskModalProps) {
  const isEditMode = mode === 'edit' && initialTask !== null
  const activeMode: TaskModalMode = isEditMode ? 'edit' : 'create'
  const activeTaskId = isEditMode ? initialTask.id : '__draft_task__'
  const defaultStartDate = formatDate(weekStart)

  const [title, setTitle] = useState(() =>
    isEditMode ? (initialTask?.title ?? '') : '',
  )
  const [laneId, setLaneId] = useState<LaneId>(() =>
    isEditMode ? (initialTask?.laneId ?? 'backend') : 'backend',
  )
  const [start, setStart] = useState(() =>
    isEditMode ? (initialTask?.start ?? defaultStartDate) : defaultStartDate,
  )
  const [end, setEnd] = useState(() =>
    isEditMode ? (initialTask?.end ?? defaultStartDate) : defaultStartDate,
  )
  const [dependsOn, setDependsOn] = useState<string[]>(() =>
    isEditMode ? (initialTask?.dependsOn ?? []) : [],
  )
  const [dependencyQuery, setDependencyQuery] = useState('')
  const [error, setError] = useState('')
  const [dependencyError, setDependencyError] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const range = useMemo(() => {
    return { startDate: defaultStartDate }
  }, [defaultStartDate])

  const dependencyCandidates = useMemo(() => {
    return buildDependencyCandidates({
      allTasks,
      currentTaskId: isEditMode ? initialTask.id : null,
      query: dependencyQuery,
    })
  }, [allTasks, dependencyQuery, initialTask, isEditMode])

  const dependencyValidation = useMemo(() => {
    return validateDependencySelection({
      allTasks,
      currentTask: {
        id: activeTaskId,
        title: title || (initialTask?.title ?? 'Draft task'),
        laneId,
        start,
        end,
        kind: initialTask?.kind ?? 'task',
        dependsOn,
      },
      selectedDependencyIds: dependsOn,
    })
  }, [
    activeTaskId,
    allTasks,
    dependsOn,
    end,
    initialTask,
    laneId,
    start,
    title,
  ])

  const taskLabelById = useMemo(
    () => new Map(allTasks.map((task) => [task.id, task.title])),
    [allTasks],
  )

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

  const handleDependencyToggle = (dependencyId: string, selected: boolean) => {
    const nextDependsOn = selected
      ? [...dependsOn, dependencyId]
      : dependsOn.filter((id) => id !== dependencyId)

    const nextValidation = validateDependencySelection({
      allTasks,
      currentTask: {
        id: activeTaskId,
        title: title || (initialTask?.title ?? 'Draft task'),
        laneId,
        start,
        end,
        kind: initialTask?.kind ?? 'task',
        dependsOn: nextDependsOn,
      },
      selectedDependencyIds: nextDependsOn,
    })

    if (!nextValidation.valid) {
      setDependencyError(
        nextValidation.reason ?? 'Invalid dependency selection.',
      )
      return
    }

    setDependsOn(nextDependsOn)
    setDependencyError('')
  }

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

    if (!dependencyValidation.valid) {
      setDependencyError(
        dependencyValidation.reason ?? 'Invalid dependency selection.',
      )
      return
    }

    setError('')
    setDependencyError('')

    onSubmit(
      {
        id: isEditMode && initialTask ? initialTask.id : crypto.randomUUID(),
        title: title.trim(),
        laneId,
        start,
        end,
        kind: initialTask?.kind ?? 'task',
        dependsOn,
      },
      activeMode,
    )
  }

  const canSubmit =
    title.trim().length > 0 && end >= start && dependencyValidation.valid
  const dependencyMessage =
    dependencyError ||
    (!dependencyValidation.valid ? (dependencyValidation.reason ?? '') : '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
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
              {isEditMode ? 'Edit task' : 'Add new task'}
            </h2>
            <p
              id="task-modal-description"
              className="mt-1 text-sm text-slate-600"
            >
              Define schedule and dependencies for this task.
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

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dependencies
            </label>
            <input
              type="search"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Search tasks by title or id"
              value={dependencyQuery}
              onChange={(event) => setDependencyQuery(event.target.value)}
            />

            <div className="mt-2 max-h-36 overflow-auto rounded-xl border border-slate-200">
              {dependencyCandidates.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No matching tasks.
                </div>
              ) : (
                dependencyCandidates.map((candidate) => {
                  const checked = dependsOn.includes(candidate.id)
                  return (
                    <label
                      key={candidate.id}
                      className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={checked}
                        disabled={candidate.disabled}
                        onChange={(event) =>
                          handleDependencyToggle(
                            candidate.id,
                            event.target.checked,
                          )
                        }
                      />
                      <span className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {candidate.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {candidate.id} · {candidate.laneId}
                        </span>
                        {candidate.reason ? (
                          <span className="text-xs text-rose-600">
                            {candidate.reason}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  )
                })
              )}
            </div>

            {dependsOn.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {dependsOn.map((dependencyId) => (
                  <button
                    key={dependencyId}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    onClick={() => handleDependencyToggle(dependencyId, false)}
                  >
                    {taskLabelById.get(dependencyId) ?? dependencyId}
                    <span aria-hidden>✕</span>
                  </button>
                ))}
              </div>
            ) : null}
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

          {dependencyMessage ? (
            <div
              className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700"
              role="alert"
              aria-live="polite"
            >
              {dependencyMessage}
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
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canSubmit}
            >
              {isEditMode ? 'Save task' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
