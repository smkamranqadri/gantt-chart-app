import { validateTaskGraph } from './dependencyGraph'
import type { LaneId, Task } from '../types/gantt'

export type DependencyCandidate = {
  id: string
  title: string
  laneId: LaneId
  start: string
  disabled: boolean
  reason: string | null
}

export type DependencyValidation = {
  valid: boolean
  reason: string | null
}

type BuildDependencyCandidatesInput = {
  allTasks: readonly Task[]
  currentTaskId: string | null
  query: string
}

type ValidateDependencySelectionInput = {
  allTasks: readonly Task[]
  currentTask: Task
  selectedDependencyIds: readonly string[]
}

const dedupe = (values: readonly string[]) => Array.from(new Set(values))

const sortByStartThenId = (left: Task, right: Task) => {
  if (left.start !== right.start) {
    return left.start.localeCompare(right.start)
  }
  return left.id.localeCompare(right.id)
}

const matchesQuery = (task: Task, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return true
  return (
    task.title.toLowerCase().includes(query) ||
    task.id.toLowerCase().includes(query)
  )
}

export const buildDependencyCandidates = ({
  allTasks,
  currentTaskId,
  query,
}: BuildDependencyCandidatesInput): DependencyCandidate[] => {
  return [...allTasks]
    .filter((task) => task.id !== currentTaskId)
    .filter((task) => matchesQuery(task, query))
    .sort(sortByStartThenId)
    .map((task) => ({
      id: task.id,
      title: task.title,
      laneId: task.laneId,
      start: task.start,
      disabled: false,
      reason: null,
    }))
}

export const validateDependencySelection = ({
  allTasks,
  currentTask,
  selectedDependencyIds,
}: ValidateDependencySelectionInput): DependencyValidation => {
  const uniqueDependencyIds = dedupe(selectedDependencyIds)
  const knownTaskIds = new Set(allTasks.map((task) => task.id))
  knownTaskIds.add(currentTask.id)

  const missingDependencyId = uniqueDependencyIds.find(
    (dependencyId) => !knownTaskIds.has(dependencyId),
  )
  if (missingDependencyId) {
    return {
      valid: false,
      reason: `Dependency "${missingDependencyId}" no longer exists.`,
    }
  }

  if (uniqueDependencyIds.includes(currentTask.id)) {
    return {
      valid: false,
      reason: 'A task cannot depend on itself.',
    }
  }

  const nextTasks = allTasks.some((task) => task.id === currentTask.id)
    ? allTasks.map((task) =>
        task.id === currentTask.id
          ? { ...currentTask, dependsOn: uniqueDependencyIds }
          : task,
      )
    : [...allTasks, { ...currentTask, dependsOn: uniqueDependencyIds }]

  const graphValidation = validateTaskGraph(nextTasks)
  if (!graphValidation.isValid) {
    return {
      valid: false,
      reason:
        graphValidation.reasons[0] ??
        'Dependency selection is invalid for the current graph.',
    }
  }

  return { valid: true, reason: null }
}
